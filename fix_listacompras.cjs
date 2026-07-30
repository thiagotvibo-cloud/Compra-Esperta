const fs = require('fs');
let content = fs.readFileSync('src/components/ListaCompras.tsx', 'utf8');

// Add import
content = content.replace(
  'import { motion, AnimatePresence } from "motion/react";',
  'import { motion, AnimatePresence } from "motion/react";\nimport { PageHeader } from "./ui/PageHeader";'
);

// Replace header
const searchStr = `  return (
    <div className="pb-28 bg-transparent min-h-screen relative">
      {" "}
      {/* HEADER MARKET PRO */}
      <div
        className={\`bg-gradient-to-br from-green-600 to-green-500 rounded-b-[40px] overflow-hidden relative px-6 text-center text-white shadow-primary z-10 transition-all duration-300 \${scrolled ? "pt-[calc(env(safe-area-inset-top)+8px)] pb-3" : "pt-[calc(env(safe-area-inset-top)+20px)] pb-14"}\`}
      >
        {" "}
        <div className="absolute rounded-full border-[12px] border-white/10" style={{ width: 280, height: 280, top: -100, left: -100 }}></div>
        <div className="absolute rounded-full bg-black/10" style={{ width: 140, height: 140, bottom: -20, right: -20 }}></div>
        {" "}
        <div className="flex flex-col items-center relative z-10">
          {" "}
          <p className="text-green-50 font-semibold text-[11px] mb-1.5">
            {" "}
            Orçamento Planejado
          </p>
          <h1 className="text-[44px] font-bold tracking-tight leading-none mb-3">
            {" "}
            <span className="money-value">
              {formatMoney(settings.budget)}
            </span>
          </h1>
          <div className="bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-[13px] font-semibold text-white flex items-center gap-2">
            {" "}
            {boughtItems} de {totalItems} itens no carrinho
          </div>
          {settings.budget > 0 && expectedTotal > 0 && (
            <div className="w-full mt-5 bg-black/10 rounded-3xl p-3 border border-white/10 text-left">
              {" "}
              <div className="flex justify-between text-[11px] font-bold mb-2 text-green-100">
                {" "}
                <span>
                  {" "}
                  Total Estimado:{""}
                  <span className="money-value">
                    {" "}
                    {formatMoney(expectedTotal)}
                  </span>
                </span>
                <span className={progOrçamento > 100 ? "text-red-200" : ""}>
                  {" "}
                  {Math.round(progOrçamento)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-black/20 overflow-hidden">
                {" "}
                <div
                  className={\`h-full rounded-full transition-all duration-300 \${progOrçamento > 100 ? "bg-red-400" : "bg-white"}\`}
                  style={{ width: \`\${progressPercent}%\` }}
                />
              </div>
              {calculateEconomy() > 0 && (
                <div className="mt-2 text-[11px] font-bold text-green-100 flex items-center gap-1.5">
                  {" "}
                  <span className="bg-green-500/20 text-green-100 px-1.5 py-0.5 rounded-md">
                    {" "}
                    Se comprar onde tem oferta, você poupará{""}
                    <span className="money-value">
                      {" "}
                      {formatMoney(calculateEconomy())}
                    </span>
                    .
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {" "}
      <div className="px-6 relative z-20 mt-4">`;

const replacement = `  return (
    <div className="pb-28 bg-transparent min-h-screen relative">
      <PageHeader 
        title="Sua Lista" 
        subtitle={\`\${boughtItems} de \${totalItems} itens\` }
      />

      <div className="px-6 pt-4 pb-2">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col items-center">
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-[11px] mb-1.5">
            Orçamento Planejado
          </p>
          <h1 className="text-[36px] font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-none mb-3">
            <span className="money-value">
              {formatMoney(settings.budget)}
            </span>
          </h1>

          {settings.budget > 0 && expectedTotal > 0 && (
            <div className="w-full mt-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800 text-left">
              <div className="flex justify-between text-[12px] font-bold mb-2 text-slate-700 dark:text-slate-300">
                <span>
                  Total Estimado:{""}
                  <span className="money-value ml-1 text-slate-900 dark:text-slate-100">
                    {formatMoney(expectedTotal)}
                  </span>
                </span>
                <span className={progOrçamento > 100 ? "text-red-500" : "text-slate-500"}>
                  {Math.round(progOrçamento)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                <div
                  className={\`h-full rounded-full transition-all duration-300 \${progOrçamento > 100 ? "bg-red-500" : "bg-green-600 dark:bg-green-500"}\`}
                  style={{ width: \`\${progressPercent}%\` }}
                />
              </div>
              {calculateEconomy() > 0 && (
                <div className="mt-3 text-[11.5px] font-medium text-green-700 dark:text-green-400 flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-2 py-1.5 rounded-lg border border-green-100 dark:border-green-900/30">
                  <span>
                    Com ofertas, você poupará{""}
                    <span className="money-value ml-1 font-bold">
                      {formatMoney(calculateEconomy())}
                    </span>.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="px-6 relative z-20 mt-2">`;

content = content.replace(searchStr, replacement);
fs.writeFileSync('src/components/ListaCompras.tsx', content);
console.log('ListaCompras patched');
