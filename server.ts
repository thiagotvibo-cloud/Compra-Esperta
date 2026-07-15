import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini Tip
  app.post("/api/tip", async (req, res) => {
    try {
      const { essentialItems } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ error: "Gemini API key is not configured inside server." });
      }

      if (!essentialItems || essentialItems.length === 0) {
         return res.json({ tip: "Para receber dicas de economia, marque alguns itens como essenciais na sua lista!" });
      }

      const prompt = `Gere uma pequena dica de economia diária (máximo 2 frases curtas) baseada nos seguintes itens que o usuário considera essenciais na sua lista de compras: ${essentialItems.join(', ')}. Não use markdown, seja direto e útil.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ tip: response.text });
    } catch (error) {
      console.error("Gemini tip error:", error);
      res.status(500).json({ error: "Erro ao gerar dica de economia." });
    }
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
