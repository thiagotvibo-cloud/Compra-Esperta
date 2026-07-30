const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const recipeRoute = `
  app.post("/api/recipe", async (req, res) => {
    try {
      const { ingredients } = req.body;
      if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ error: "Gemini API key is not configured." });
      }
      
      const prompt = \`Você é o "Cozinheiro Antidesperdício", focado em sugerir receitas simples e práticas para evitar desperdício.
Baseado nestes ingredientes que o usuário tem (ou comprou recentemente): \${ingredients}.
Sugira até 2 receitas. Retorne EXATAMENTE UM JSON válido (e nada mais, sem markdown, sem \`\`\`json) no seguinte formato:
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
}\`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json"
        },
        contents: prompt,
      });
      
      res.json(JSON.parse(response.text));
    } catch (error) {
      console.error("Gemini recipe error:", error);
      res.status(500).json({ error: "Erro ao gerar receita." });
    }
  });
`;

if (!code.includes('/api/recipe')) {
    code = code.replace('// Vite middleware for development', recipeRoute + '\n  // Vite middleware for development');
    fs.writeFileSync('server.ts', code);
    console.log('server.ts updated');
}
