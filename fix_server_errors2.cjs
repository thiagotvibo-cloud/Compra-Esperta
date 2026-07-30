const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace the console.error followed by the if block
const searchTip = 'console.error("Gemini tip error:", error);\n      \n      if (error?.status === 400 || (error?.message && error.message.includes("API key not valid"))) {\n         return res.status(500).json({ error: "Chave de API do Gemini inválida. Configure no menu Settings." });\n      }';
const replaceTip = 'if (error?.status === 400 || (error?.message && error.message.includes("API key not valid"))) {\n         console.warn("Gemini tip warning: API key not valid");\n         return res.status(500).json({ error: "Chave de API do Gemini inválida. Configure no menu Settings." });\n      }\n      console.error("Gemini tip error:", error);';
code = code.replace(searchTip, replaceTip);

const searchChat = 'console.error("Gemini chat error:", error);\n      \n      if (error?.status === 400 || (error?.message && error.message.includes("API key not valid"))) {\n         return res.status(500).json({ error: "Chave de API do Gemini inválida. Configure no menu Settings." });\n      }';
const replaceChat = 'if (error?.status === 400 || (error?.message && error.message.includes("API key not valid"))) {\n         console.warn("Gemini chat warning: API key not valid");\n         return res.status(500).json({ error: "Chave de API do Gemini inválida. Configure no menu Settings." });\n      }\n      console.error("Gemini chat error:", error);';
code = code.replace(searchChat, replaceChat);

const searchRecipe = 'console.error("Gemini recipe error:", error);\n      \n      if (error?.status === 400 || (error?.message && error.message.includes("API key not valid"))) {\n         return res.status(500).json({ error: "Chave de API do Gemini inválida. Configure no menu Settings." });\n      }';
const replaceRecipe = 'if (error?.status === 400 || (error?.message && error.message.includes("API key not valid"))) {\n         console.warn("Gemini recipe warning: API key not valid");\n         return res.status(500).json({ error: "Chave de API do Gemini inválida. Configure no menu Settings." });\n      }\n      console.error("Gemini recipe error:", error);';
code = code.replace(searchRecipe, replaceRecipe);

fs.writeFileSync('server.ts', code);
console.log('Fixed error logging in server.ts');
