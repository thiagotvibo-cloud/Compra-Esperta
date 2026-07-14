import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL não definida. Configure o banco de dados do Replit.");
  process.exit(1);
}
if (!process.env.SESSION_SECRET) {
  console.error("❌ SESSION_SECRET não definida. Adicione este secret no painel do Replit.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PgSession = ConnectPgSimple(session);

declare module "express-session" {
  interface SessionData { userId: string; userEmail: string; }
}

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS settings (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      budget NUMERIC DEFAULT 0,
      dark_mode BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      qty NUMERIC DEFAULT 1,
      unit TEXT DEFAULT 'un',
      category TEXT DEFAULT 'Outros',
      is_essential BOOLEAN DEFAULT false,
      only_promo BOOLEAN DEFAULT false,
      is_bought BOOLEAN DEFAULT false,
      notes TEXT,
      actual_price NUMERIC,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS markets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS promotions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
      item_name TEXT NOT NULL,
      price NUMERIC DEFAULT 0,
      qty NUMERIC DEFAULT 1,
      unit TEXT DEFAULT 'un',
      expiry_date TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      sid VARCHAR NOT NULL PRIMARY KEY,
      sess JSON NOT NULL,
      expire TIMESTAMP(6) NOT NULL
    );
    CREATE INDEX IF NOT EXISTS IDX_sessions_expire ON sessions(expire);
  `);
  console.log("✅ Banco de dados inicializado.");
}

async function startServer() {
  await initDb();
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(session({
    store: new PgSession({ pool, tableName: "sessions" }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 },
  }));

  const requireAuth = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (!req.session.userId) return res.status(401).json({ error: "Não autenticado" });
    next();
  };

  // ── AUTH ──────────────────────────────────────────────────────────────────────

  app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email e senha são obrigatórios" });
    try {
      const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
      if (existing.rows.length > 0) return res.status(400).json({ error: "Este email já está cadastrado" });
      const hash = await bcrypt.hash(password, 10);
      const result = await pool.query(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
        [email.toLowerCase(), hash]
      );
      const user = result.rows[0];
      await pool.query(
        "INSERT INTO settings (user_id, budget, dark_mode) VALUES ($1, 0, false) ON CONFLICT DO NOTHING",
        [user.id]
      );
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      res.json({ user: { id: user.id, email: user.email } });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ error: "Erro ao criar conta" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email e senha são obrigatórios" });
    try {
      const result = await pool.query(
        "SELECT id, email, password_hash FROM users WHERE email = $1",
        [email.toLowerCase()]
      );
      if (result.rows.length === 0) return res.status(401).json({ error: "Email ou senha incorretos" });
      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: "Email ou senha incorretos" });
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      res.json({ user: { id: user.id, email: user.email } });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session.userId) return res.status(401).json({ user: null });
    res.json({ user: { id: req.session.userId, email: req.session.userEmail } });
  });

  // ── SETTINGS ──────────────────────────────────────────────────────────────────

  app.get("/api/settings", requireAuth, async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT budget, dark_mode FROM settings WHERE user_id = $1",
        [req.session.userId]
      );
      if (result.rows.length === 0) {
        await pool.query(
          "INSERT INTO settings (user_id, budget, dark_mode) VALUES ($1, 0, false)",
          [req.session.userId]
        );
        return res.json({ budget: 0, dark_mode: false });
      }
      res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: "Erro ao buscar configurações" }); }
  });

  app.put("/api/settings", requireAuth, async (req, res) => {
    const { budget, dark_mode } = req.body;
    try {
      await pool.query(
        "UPDATE settings SET budget = $1, dark_mode = $2 WHERE user_id = $3",
        [budget ?? 0, dark_mode ?? false, req.session.userId]
      );
      res.json({ ok: true });
    } catch (err) { res.status(500).json({ error: "Erro ao salvar configurações" }); }
  });

  // ── ITEMS ──────────────────────────────────────────────────────────────────────

  app.get("/api/items", requireAuth, async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM items WHERE user_id = $1 ORDER BY created_at",
        [req.session.userId]
      );
      res.json(result.rows);
    } catch (err) { res.status(500).json({ error: "Erro ao buscar itens" }); }
  });

  app.post("/api/items/sync", requireAuth, async (req, res) => {
    const { items } = req.body;
    const userId = req.session.userId;
    try {
      const existing = await pool.query("SELECT id FROM items WHERE user_id = $1", [userId]);
      const existingIds = existing.rows.map((r: any) => r.id);
      const newIds = items.map((i: any) => i.id);
      const toDelete = existingIds.filter((id: string) => !newIds.includes(id));
      if (toDelete.length > 0) {
        await pool.query(
          "DELETE FROM items WHERE id = ANY($1::uuid[]) AND user_id = $2",
          [toDelete, userId]
        );
      }
      for (const item of items) {
        await pool.query(
          `INSERT INTO items (id, user_id, name, qty, unit, category, is_essential, only_promo, is_bought, notes, actual_price)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             name = $3, qty = $4, unit = $5, category = $6,
             is_essential = $7, only_promo = $8, is_bought = $9,
             notes = $10, actual_price = $11
           WHERE items.user_id = $2`,
          [item.id, userId, item.name, item.qty, item.unit, item.category,
           item.is_essential || false, item.only_promo || false, item.is_bought || false,
           item.notes || null, item.actual_price || null]
        );
      }
      res.json({ ok: true });
    } catch (err) {
      console.error("Sync items error:", err);
      res.status(500).json({ error: "Erro ao sincronizar itens" });
    }
  });

  // ── MARKETS ───────────────────────────────────────────────────────────────────

  app.get("/api/markets", requireAuth, async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM markets WHERE user_id = $1 ORDER BY created_at",
        [req.session.userId]
      );
      res.json(result.rows);
    } catch (err) { res.status(500).json({ error: "Erro ao buscar mercados" }); }
  });

  app.post("/api/markets/sync", requireAuth, async (req, res) => {
    const { markets } = req.body;
    const userId = req.session.userId;
    try {
      const existing = await pool.query("SELECT id FROM markets WHERE user_id = $1", [userId]);
      const existingIds = existing.rows.map((r: any) => r.id);
      const newIds = markets.map((m: any) => m.id);
      const toDelete = existingIds.filter((id: string) => !newIds.includes(id));
      if (toDelete.length > 0) {
        await pool.query(
          "DELETE FROM markets WHERE id = ANY($1::uuid[]) AND user_id = $2",
          [toDelete, userId]
        );
      }
      for (const market of markets) {
        await pool.query(
          `INSERT INTO markets (id, user_id, name) VALUES ($1, $2, $3)
           ON CONFLICT (id) DO UPDATE SET name = $3 WHERE markets.user_id = $2`,
          [market.id, userId, market.name]
        );
      }
      res.json({ ok: true });
    } catch (err) {
      console.error("Sync markets error:", err);
      res.status(500).json({ error: "Erro ao sincronizar mercados" });
    }
  });

  // ── PROMOTIONS ────────────────────────────────────────────────────────────────

  app.get("/api/promotions", requireAuth, async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM promotions WHERE user_id = $1 ORDER BY created_at",
        [req.session.userId]
      );
      res.json(result.rows);
    } catch (err) { res.status(500).json({ error: "Erro ao buscar promoções" }); }
  });

  app.post("/api/promotions/sync", requireAuth, async (req, res) => {
    const { promotions } = req.body;
    const userId = req.session.userId;
    try {
      const existing = await pool.query("SELECT id FROM promotions WHERE user_id = $1", [userId]);
      const existingIds = existing.rows.map((r: any) => r.id);
      const newIds = promotions.map((p: any) => p.id);
      const toDelete = existingIds.filter((id: string) => !newIds.includes(id));
      if (toDelete.length > 0) {
        await pool.query(
          "DELETE FROM promotions WHERE id = ANY($1::uuid[]) AND user_id = $2",
          [toDelete, userId]
        );
      }
      for (const promo of promotions) {
        await pool.query(
          `INSERT INTO promotions (id, user_id, market_id, item_name, price, qty, unit, expiry_date, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             market_id = $3, item_name = $4, price = $5, qty = $6,
             unit = $7, expiry_date = $8, notes = $9
           WHERE promotions.user_id = $2`,
          [promo.id, userId, promo.market_id || null, promo.item_name, promo.price,
           promo.qty, promo.unit, promo.expiry_date || null, promo.notes || null]
        );
      }
      res.json({ ok: true });
    } catch (err) {
      console.error("Sync promotions error:", err);
      res.status(500).json({ error: "Erro ao sincronizar promoções" });
    }
  });

  // ── GEMINI TIP ────────────────────────────────────────────────────────────────

  const ai = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    : null;

  app.post("/api/tip", requireAuth, async (req, res) => {
    try {
      const { essentialItems } = req.body;
      if (!ai) return res.json({ tip: "Configure a chave GEMINI_API_KEY para ativar as dicas de economia personalizadas." });
      if (!essentialItems || essentialItems.length === 0) return res.json({ tip: "Para receber dicas de economia, marque alguns itens como essenciais na sua lista!" });
      const prompt = `Gere uma pequena dica de economia diária (máximo 2 frases curtas) baseada nos seguintes itens essenciais: ${essentialItems.join(", ")}. Não use markdown, seja direto e útil.`;
      const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
      res.json({ tip: response.text });
    } catch (error) {
      console.error("Gemini tip error:", error);
      res.status(500).json({ error: "Erro ao gerar dica de economia." });
    }
  });

  // ── VITE / STATIC ────────────────────────────────────────────────────────────

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
