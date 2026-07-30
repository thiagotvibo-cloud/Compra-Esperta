const fs = require('fs');
let code = fs.readFileSync('src/components/Roteiro.tsx', 'utf8');

code = code.replace('bg-green-700 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative', 'bg-slate-900 dark:bg-slate-100 rounded-3xl p-6 text-white dark:text-slate-900 shadow-sm overflow-hidden relative border border-slate-200 dark:border-zinc-800');

code = code.replace('text-green-100', 'text-slate-400 dark:text-slate-500');
code = code.replace('text-green-100', 'text-slate-400 dark:text-slate-500');
code = code.replace('border-white/20', 'border-slate-800 dark:border-slate-200');
code = code.replace('bg-white dark:bg-zinc-900/20', 'bg-slate-800 dark:bg-slate-200');

// Comparativo de mercados item background
code = code.replace('bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-3xl shadow-sm mb-4', 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm mb-4');

code = code.replace('text-green-700 dark:text-green-500', 'text-slate-900 dark:text-slate-100');
code = code.replace('text-green-700 dark:text-green-500', 'text-slate-900 dark:text-slate-100');
code = code.replace('bg-green-700', 'bg-slate-900 dark:bg-slate-100');
code = code.replace('bg-green-700', 'bg-slate-900 dark:bg-slate-100');
code = code.replace('bg-green-50 text-green-700 dark:text-green-500', 'bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-slate-100');

fs.writeFileSync('src/components/Roteiro.tsx', code);
console.log('Roteiro.tsx polished');
