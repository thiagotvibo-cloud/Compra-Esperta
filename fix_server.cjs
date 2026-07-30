const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const chatRoute = `
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, contextData } = req.body;
      if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ error: "Gemini API key is not configured." });
      }
      
      const systemInstruction = \`Você é um agente de IA assistente de planejamento doméstico e financeiro no app 'Compra Esperta'.
Responda sempre em português, de forma amigável, clara e concisa. Não use formatações complexas.
Foque em planejamento doméstico, orçamentos, lista de compras e ideias de refeições.

Contexto atual da casa:
- Orçamento Mensal: R$ \${contextData.budget}
- Gasto no mês atual: R$ \${contextData.spent}
- Saldo: R$ \${contextData.remaining}
- Itens na lista de compras (resumo): \${contextData.listItems || 'nenhum'}
\`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemInstruction
        },
        contents: messages,
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini chat error:", error);
      res.status(500).json({ error: "Erro ao gerar resposta da IA." });
    }
  });
`;

if (!code.includes('/api/chat')) {
    code = code.replace('// Vite middleware for development', chatRoute + '\n  // Vite middleware for development');
    fs.writeFileSync('server.ts', code);
    console.log('server.ts updated');
} else {
    console.log('server.ts already has /api/chat');
}
