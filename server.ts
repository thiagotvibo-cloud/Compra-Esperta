import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

function getAi() { 
  return new OpenAI({ apiKey: process.env.COMPRAS || '' }); 
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini Tip (now OpenAI Tip)
  app.post("/api/tip", async (req, res) => {
    try {
      const { essentialItems } = req.body;
      
      if (!process.env.COMPRAS) {
         return res.status(500).json({ error: "OpenAI API key (COMPRAS) is not configured inside server." });
      }

      if (!essentialItems || essentialItems.length === 0) {
         return res.json({ tip: "Para receber dicas de economia, marque alguns itens como essenciais na sua lista!" });
      }

      const prompt = `Gere uma pequena dica de economia diária (máximo 2 frases curtas) baseada nos seguintes itens que o usuário considera essenciais na sua lista de compras: ${essentialItems.join(', ')}. Não use markdown, seja direto e útil.`;
      
      const response = await getAi().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });
      
      res.json({ tip: response.choices[0].message.content });
    } catch (err) { 
      const error = err as any;
      if (error?.status === 429) {
        if (req.path === '/api/recipe') {
             return res.json({
               receitas: [
                 {
                   nome: "⚠️ Limite da API Atingido",
                   ingredientes: ["Sua cota da OpenAI", "Acabou"],
                   tempo: "0 min",
                   motivo: "Erro 429: Você excedeu sua cota atual da OpenAI. Adicione créditos em platform.openai.com.",
                   instrucoes: ["Acesse platform.openai.com", "Verifique seu plano e saldo", "Adicione créditos se necessário"]
                 }
               ]
             });
        } else if (req.path === '/api/chat') {
             return res.json({ text: "⚠️ **Atenção:** A cota da sua chave de API da OpenAI acabou (Erro 429). Por favor, verifique seu plano e adicione saldo em platform.openai.com para que eu possa voltar a funcionar normalmente!" });
        } else if (req.path === '/api/tip') {
             return res.json({ tip: "Dica: Sua cota da OpenAI acabou. Verifique seu saldo para receber dicas reais!" });
        }
      }
      
      if (error?.status === 403 || error?.status === 401 || (error?.message && error.message.includes("API key"))) {
         return res.json({ tip: "Dica (Demo): Defina um limite de gastos para o mês e acompanhe pelo aplicativo." });
      }
      console.error("OpenAI tip error:", error);
      res.status(500).json({ error: "Erro ao gerar dica de economia." });
    }
  });
  
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, contextData } = req.body;
      let validMessages = messages;
      if (validMessages && validMessages.length > 0 && validMessages[0].role === "model") {
        validMessages = validMessages.slice(1);
      }

      if (!process.env.COMPRAS) {
         return res.status(500).json({ error: "OpenAI API key (COMPRAS) is not configured." });
      }
      
      const systemInstruction = `Você é um agente de IA assistente de planejamento doméstico e financeiro no app 'Compra Esperta'.
Responda sempre em português, de forma amigável, clara e concisa. Não use formatações complexas.
Foque em planejamento doméstico, orçamentos, lista de compras e ideias de refeições.
Contexto atual da casa:
- Orçamento Mensal: R$ ${contextData.budget}
- Gasto no mês atual: R$ ${contextData.spent}
- Saldo: R$ ${contextData.remaining}
- Itens na lista de compras (resumo): ${contextData.listItems || 'nenhum'}`;

      const formattedMessages = validMessages.map((msg: any) => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.parts[0].text
      }));
      formattedMessages.unshift({ role: 'system', content: systemInstruction });

      const response = await getAi().chat.completions.create({
        model: "gpt-4o-mini",
        messages: formattedMessages,
      });

      res.json({ text: response.choices[0].message.content });
    } catch (err) { 
      const error = err as any;
      if (error?.status === 429) {
        if (req.path === '/api/recipe') {
             return res.json({
               receitas: [
                 {
                   nome: "⚠️ Limite da API Atingido",
                   ingredientes: ["Sua cota da OpenAI", "Acabou"],
                   tempo: "0 min",
                   motivo: "Erro 429: Você excedeu sua cota atual da OpenAI. Adicione créditos em platform.openai.com.",
                   instrucoes: ["Acesse platform.openai.com", "Verifique seu plano e saldo", "Adicione créditos se necessário"]
                 }
               ]
             });
        } else if (req.path === '/api/chat') {
             return res.json({ text: "⚠️ **Atenção:** A cota da sua chave de API da OpenAI acabou (Erro 429). Por favor, verifique seu plano e adicione saldo em platform.openai.com para que eu possa voltar a funcionar normalmente!" });
        } else if (req.path === '/api/tip') {
             return res.json({ tip: "Dica: Sua cota da OpenAI acabou. Verifique seu saldo para receber dicas reais!" });
        }
      }
      
      if (error?.status === 403 || error?.status === 401 || (error?.message && error.message.includes("API key"))) {
         return res.json({ text: "Oi! Sou seu assistente. No momento estou operando no modo demonstração (chave de API ausente/inválida), mas recomendo sempre planejar suas compras antes de ir ao mercado para economizar!" });
      }
      console.error("OpenAI chat error:", error);
      res.status(500).json({ error: "Erro ao gerar resposta da IA." });
    }
  });
  
  app.post("/api/recipe", async (req, res) => {
    try {
      const { ingredients } = req.body;

      if (!process.env.COMPRAS) {
         return res.status(500).json({ error: "OpenAI API key (COMPRAS) is not configured." });
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

      const response = await getAi().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content || "{}";
      res.json(JSON.parse(content));
    } catch (err) { 
      const error = err as any;
      if (error?.status === 429) {
        if (req.path === '/api/recipe') {
             return res.json({
               receitas: [
                 {
                   nome: "⚠️ Limite da API Atingido",
                   ingredientes: ["Sua cota da OpenAI", "Acabou"],
                   tempo: "0 min",
                   motivo: "Erro 429: Você excedeu sua cota atual da OpenAI. Adicione créditos em platform.openai.com.",
                   instrucoes: ["Acesse platform.openai.com", "Verifique seu plano e saldo", "Adicione créditos se necessário"]
                 }
               ]
             });
        } else if (req.path === '/api/chat') {
             return res.json({ text: "⚠️ **Atenção:** A cota da sua chave de API da OpenAI acabou (Erro 429). Por favor, verifique seu plano e adicione saldo em platform.openai.com para que eu possa voltar a funcionar normalmente!" });
        } else if (req.path === '/api/tip') {
             return res.json({ tip: "Dica: Sua cota da OpenAI acabou. Verifique seu saldo para receber dicas reais!" });
        }
      }
      
      if (error?.status === 403 || error?.status === 401 || (error?.message && error.message.includes("API key"))) {
         return res.json({
           receitas: [
             {
               nome: "Omelete Antidesperdício",
               ingredientes: ["Ovos", "Restos de legumes", "Temperos a gosto"],
               tempo: "15 min",
               motivo: "Usa os ingredientes de forma rápida e aproveita o que sobrou.",
               instrucoes: ["Bata os ovos", "Misture os legumes picados", "Frite em uma frigideira antiaderente"]
             }
           ]
         });
      }
      console.error("OpenAI recipe error:", error);
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
