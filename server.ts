import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getAi() { return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' }); }

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

      const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ tip: response.text });
    } catch (error) {
      if (error?.status === 400 || (error?.message && error.message.includes("API key not valid"))) {
         console.warn("Gemini tip warning: API key not valid");
         return res.status(500).json({ error: "Chave de API do Gemini inválida. Configure no menu Settings." });
      }
      console.error("Gemini tip error:", error);
      res.status(500).json({ error: "Erro ao gerar dica de economia." });

    }
  });

  
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, contextData } = req.body;
      if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ error: "Gemini API key is not configured." });
      }
      
      const systemInstruction = `Você é um agente de IA assistente de planejamento doméstico e financeiro no app 'Compra Esperta'.
Responda sempre em português, de forma amigável, clara e concisa. Não use formatações complexas.
Foque em planejamento doméstico, orçamentos, lista de compras e ideias de refeições.

Contexto atual da casa:
- Orçamento Mensal: R$ ${contextData.budget}
- Gasto no mês atual: R$ ${contextData.spent}
- Saldo: R$ ${contextData.remaining}
- Itens na lista de compras (resumo): ${contextData.listItems || 'nenhum'}
`;

      const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemInstruction
        },
        contents: messages,
      });
      res.json({ text: response.text });
    } catch (error) {
      if (error?.status === 400 || (error?.message && error.message.includes("API key not valid"))) {
         console.warn("Gemini chat warning: API key not valid");
         return res.status(500).json({ error: "Chave de API do Gemini inválida. Configure no menu Settings." });
      }
      console.error("Gemini chat error:", error);
      res.status(500).json({ error: "Erro ao gerar resposta da IA." });

    }
  });

  
  app.post("/api/recipe", async (req, res) => {
    try {
      const { ingredients } = req.body;
      if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ error: "Gemini API key is not configured." });
      }
      
      const prompt = `Você é o "Cozinheiro Antidesperdício", focado em sugerir receitas simples e práticas para evitar desperdício.
Baseado nestes ingredientes que o usuário tem (ou comprou recentemente): ${ingredients}.
Sugira até 2 receitas. Retorne EXATAMENTE UM JSON válido (e nada mais, sem markdown, sem marcações de bloco de código json) no seguinte formato:
{
  "receitas": [
    {
      "nome": "Nome da Receita",
      "ingredientes": ["ingrediente 1", "ingrediente 2"],
      "tempo": "20 min",
      "motivo": "Por que esta receita evita desperdício",
      "instrucoes": ["passo 1", "passo 2"]
    }
  ]
}`;

      const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json"
        },
        contents: prompt,
      });
      
      res.json(JSON.parse(response.text));
    } catch (error) {
      if (error?.status === 400 || (error?.message && error.message.includes("API key not valid"))) {
         console.warn("Gemini recipe warning: API key not valid");
         return res.status(500).json({ error: "Chave de API do Gemini inválida. Configure no menu Settings." });
      }
      console.error("Gemini recipe error:", error);
      res.status(500).json({ error: "Erro ao gerar receita." });

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
