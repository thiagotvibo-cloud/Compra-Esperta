const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

function fixCatchBlock(endpoint) {
    const regex = new RegExp(\`catch \\(error:? any?\\) \\{\\s*console\\.error\\("Gemini \${endpoint} error:", error\\);\\s*if \\(error\\?\\.status === 400 \\|\\| \\(error\\?\\.message && error\\.message\\.includes\\("API key not valid"\\)\\)\\) \\{\\s*return res\\.status\\(500\\)\\.json\\(\\{ error: "Chave de API do Gemini inválida\\. Configure no menu Settings\\." \\}\\);\\s*\\}\\s*res\\.status\\(500\\)\\.json\\(\\{ error: "(.*?)" \\}\\);\\s*\\}\`, 'g');
    
    // We will just do a simpler replace because JS regexes across lines can be tricky.
}

// Simpler replacement using split/join or string replace for the exact blocks
code = code.replace(/console\\.error\\("Gemini tip error:", error\\);\s*if \\(error\\?\\.status === 400 \\|\\| \\(error\\?\\.message && error\\.message\\.includes\\("API key not valid"\\)\\)\\) \\{\s*return res\\.status\\(500\\)\\.json\\(\\{ error: "Chave de API do Gemini inválida\\. Configure no menu Settings\\." \\}\\);\s*\\}/, 
\`if (error?.status === 400 || (error?.message && error.message.includes("API key not valid"))) {
        console.warn("Gemini tip warning: API key not valid");
        return res.status(500).json({ error: "Chave de API do Gemini inválida. Configure no menu Settings." });
      }
      console.error("Gemini tip error:", error);\`);

code = code.replace(/console\\.error\\("Gemini chat error:", error\\);\s*if \\(error\\?\\.status === 400 \\|\\| \\(error\\?\\.message && error\\.message\\.includes\\("API key not valid"\\)\\)\\) \\{\s*return res\\.status\\(500\\)\\.json\\(\\{ error: "Chave de API do Gemini inválida\\. Configure no menu Settings\\." \\}\\);\s*\\}/, 
\`if (error?.status === 400 || (error?.message && error.message.includes("API key not valid"))) {
        console.warn("Gemini chat warning: API key not valid");
        return res.status(500).json({ error: "Chave de API do Gemini inválida. Configure no menu Settings." });
      }
      console.error("Gemini chat error:", error);\`);

code = code.replace(/console\\.error\\("Gemini recipe error:", error\\);\s*if \\(error\\?\\.status === 400 \\|\\| \\(error\\?\\.message && error\\.message\\.includes\\("API key not valid"\\)\\)\\) \\{\s*return res\\.status\\(500\\)\\.json\\(\\{ error: "Chave de API do Gemini inválida\\. Configure no menu Settings\\." \\}\\);\s*\\}/, 
\`if (error?.status === 400 || (error?.message && error.message.includes("API key not valid"))) {
        console.warn("Gemini recipe warning: API key not valid");
        return res.status(500).json({ error: "Chave de API do Gemini inválida. Configure no menu Settings." });
      }
      console.error("Gemini recipe error:", error);\`);

fs.writeFileSync('server.ts', code);
console.log('Fixed error logging in server.ts');
