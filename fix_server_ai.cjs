const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });", "function getAi() { return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' }); }");

code = code.replace(/ai\.models\.generateContent/g, "getAi().models.generateContent");

fs.writeFileSync('server.ts', code);
console.log('Fixed GoogleGenAI initialization');
