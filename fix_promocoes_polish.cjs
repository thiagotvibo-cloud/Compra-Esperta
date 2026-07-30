const fs = require('fs');
let code = fs.readFileSync('src/components/Promocoes.tsx', 'utf8');

code = code.replace('className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] mb-6 shadow-xl"', 'className="bg-white dark:bg-zinc-900 p-5 rounded-3xl mb-6 shadow-sm border border-slate-200 dark:border-zinc-800"');

// also simplify some other big elements
code = code.replace('rounded-[32px]', 'rounded-3xl');
code = code.replace('shadow-xl', 'shadow-sm');

// make the tabs and filters cleaner
code = code.replace('bg-green-700 hover:bg-emerald-700', 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900');
code = code.replace('bg-green-700 hover:bg-green-600', 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900');

fs.writeFileSync('src/components/Promocoes.tsx', code);
console.log('Promocoes.tsx polished');
