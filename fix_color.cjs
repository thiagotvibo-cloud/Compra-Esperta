const fs = require('fs');
let code = fs.readFileSync('src/components/ListaCompras.tsx', 'utf8');
code = code.replace(
  \`                          <motion.div \\n                             animate={{ color: item.isBought ? '#9ca3af' : 'var(--color-soft-text-main)' }}\\n                            className={\\\`font-semibold text-[16px] flex items-start gap-2 leading-snug \${item.isBought ? 'line-through text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'}\\\`} \\n                           >\`,
  \`                          <motion.div \\n                            className={\\\`font-semibold text-[16px] flex items-start gap-2 leading-snug transition-colors \${item.isBought ? 'line-through text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'}\\\`} \\n                           >\`
);
fs.writeFileSync('src/components/ListaCompras.tsx', code);
console.log("Patched");
