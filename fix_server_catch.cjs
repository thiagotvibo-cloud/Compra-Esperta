const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// We will add the error.message check.
code = code.replace(/res\.status\(500\)\.json\(\{ error: "Erro ao gerar (.*?)\." \}\);/g, `
      if (error?.status === 400 || (error?.message && error.message.includes("API key not valid"))) {
         return res.status(500).json({ error: "Chave de API do Gemini inválida. Configure no menu Settings." });
      }
      res.status(500).json({ error: "Erro ao gerar $1." });
`);

fs.writeFileSync('server.ts', code);
console.log('Fixed server error messages');
