const fs = require('fs');
let code = fs.readFileSync('src/components/Promocoes.tsx', 'utf8');

code = code.replace('"bg-green-700 text-white"', '"bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"');
code = code.replace('"bg-red-50 /10 text-red-500"', '"bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"');
code = code.replace('"bg-orange-50 /10 text-orange-500"', '"bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400"');

fs.writeFileSync('src/components/Promocoes.tsx', code);
console.log('Promocoes.tsx filters updated');
