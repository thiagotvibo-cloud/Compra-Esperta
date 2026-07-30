const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace('sem ```json)', 'sem marcações de bloco de código json)');

fs.writeFileSync('server.ts', code);
console.log('Fixed syntax error in server.ts');
