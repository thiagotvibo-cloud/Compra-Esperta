import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for tip
  app.post("/api/tip", async (req, res) => {
    res.json({ tip: "Planeje suas refeições com antecedência para economizar e evitar desperdícios." });
  });

  // API Route for chat
  app.post("/api/chat", async (req, res) => {
    res.json({ text: "O assistente de chat foi desativado." });
  });

  // API Route for recipe
  app.post("/api/recipe", async (req, res) => {
    res.json({ receitas: [] });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
