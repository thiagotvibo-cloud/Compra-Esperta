const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /if \(error\?\.status === 403 \|\| error\?\.status === 401 \|\| error\?\.status === 429 \|\| \(error\?\.message && error\.message\.includes\("API key"\)\)\) {/g,
  `if (error?.status === 429) {
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
      
      if (error?.status === 403 || error?.status === 401 || (error?.message && error.message.includes("API key"))) {`
);

fs.writeFileSync('server.ts', code);
console.log('Fixed 429 messages');
