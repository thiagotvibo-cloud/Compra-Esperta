const fs = require('fs');
let content = fs.readFileSync('src/components/ModoCompra.tsx', 'utf8');

// Add import
content = content.replace(
  'import { motion, AnimatePresence } from "motion/react";',
  'import { motion, AnimatePresence } from "motion/react";\nimport { PageHeader } from "./ui/PageHeader";'
);

const searchStr = `  return (
    <div className="pb-36 bg-transparent min-h-screen">
      {" "}
      {}
      <div
        className={\`sticky top-0 z-30 pt-[calc(env(safe-area-inset-top)+20px)] px-6 pb-8 rounded-b-[40px] overflow-hidden shadow-lg transition-colors duration-500 \${headerColor} \${pulseClass}\`}
      >
        {" "}
        <div className="absolute rounded-full border-[12px] border-white/10" style={{ width: 280, height: 280, top: -100, left: -100 }}></div>
        <div className="absolute rounded-full bg-black/10" style={{ width: 140, height: 140, bottom: -20, right: -20 }}></div>
        {" "}
        {}
        <div className="relative z-10 mb-4 bg-black/10 backdrop-blur-sm rounded-3xl flex items-center gap-2 px-3 py-2 border border-white/10">
          {" "}
          <Store className={textColor} size={16} />
          <select
            value={shoppingMarketId}
            onChange={(e) => handleMarketSelect(e.target.value)}
            className={\`flex-1 bg-transparent border-none focus:outline-none font-semibold text-[14px] cursor-pointer appearance-none \${textColor}\`}
          >
            {" "}
            <option value="" className="text-zinc-900 dark:text-zinc-100">
              -- Selecione o Mercado --
            </option>
            {markets.map((m) => (
              <option className="text-zinc-900 dark:text-zinc-100" key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-between items-end relative z-10">
          {" "}
          <div>
            {" "}
            <div className={\`text-[12px] font-semibold mb-1 \${subTextColor}\`}>
              Valor no Carrinho
            </div>
            <div
              className={\`text-[36px] font-bold tracking-tight leading-none \${textColor}\`}
            >
              {" "}
              <span className="text-[20px] font-semibold mr-1 opacity-80">
                R$
              </span>
              <span
                className={\`money-value transition-transform duration-150 inline-block \${scaleTotal ? "scale-[1.06]" : "scale-100"}\`}
              >
                {totalSpent.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            {settings.budget > 0 && (
              <div className={\`text-[13px] font-medium mt-1 \${subTextColor}\`}>
                {" "}
                de R${" "}
                {settings.budget.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}{" "}
                ·{" "}
                {budgetPercent > 100 ? (
                  <span className="text-red-300 font-bold">
                    Estourou {Math.round(budgetPercent - 100)}%
                  </span>
                ) : (
                  <span>{Math.round(budgetPercent)}%</span>
                )}
              </div>
            )}
          </div>
          <div className="text-right">
            {" "}
            <div className={\`text-[11px] font-semibold mb-1 \${subTextColor}\`}>
              No Carrinho
            </div>
            <div className={\`text-[28px] font-bold leading-none \${textColor}\`}>
              {boughtItemsCount}
              <span className={\`text-[16px] font-medium opacity-80 ml-1 \${subTextColor}\`}>
                /{totalItemsCount}
              </span>
            </div>
          </div>
        </div>
      </div>
      {" "}
      {}
      <div className="px-6 relative mt-6">`;

const replacement = `  return (
    <div className="pb-36 bg-transparent min-h-screen">
      <PageHeader 
        title="Modo Compra" 
        subtitle={\`\${boughtItemsCount} de \${totalItemsCount} itens no carrinho\`}
      />

      <div className="px-6 pt-4 pb-2">
        <div className={\`rounded-3xl p-5 border shadow-sm transition-colors duration-500 flex flex-col \${isOverBudget ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50' : hasItemsInCart ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50' : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'}\`}>
          <div className="mb-4 bg-white/60 dark:bg-zinc-950/50 backdrop-blur-sm rounded-xl flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-zinc-800/80">
            <Store className="text-slate-500 dark:text-slate-400" size={16} />
            <select
              value={shoppingMarketId}
              onChange={(e) => handleMarketSelect(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none font-semibold text-[14px] cursor-pointer appearance-none text-slate-800 dark:text-slate-200"
            >
              <option value="" className="text-zinc-900 dark:text-zinc-100">
                -- Selecione o Mercado --
              </option>
              {markets.map((m) => (
                <option className="text-zinc-900 dark:text-zinc-100" key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <div className={\`text-[12px] font-semibold mb-1 \${isOverBudget ? 'text-red-700 dark:text-red-400' : hasItemsInCart ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}\`}>
                Valor no Carrinho
              </div>
              <div className={\`text-[36px] font-bold tracking-tight leading-none \${isOverBudget ? 'text-red-800 dark:text-red-300' : hasItemsInCart ? 'text-blue-900 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100'}\`}>
                <span className="text-[20px] font-semibold mr-1 opacity-80">R$</span>
                <span className={\`money-value transition-transform duration-150 inline-block \${scaleTotal ? "scale-[1.06]" : "scale-100"}\`}>
                  {totalSpent.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              
              {settings.budget > 0 && (
                <div className={\`text-[13px] font-medium mt-1 \${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}\`}>
                  de R$ {settings.budget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} · {budgetPercent > 100 ? (
                    <span className="font-bold">Estourou {Math.round(budgetPercent - 100)}%</span>
                  ) : (
                    <span>{Math.round(budgetPercent)}%</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="text-right">
              <div className={\`text-[11px] font-semibold mb-1 \${isOverBudget ? 'text-red-700 dark:text-red-400' : hasItemsInCart ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}\`}>
                No Carrinho
              </div>
              <div className={\`text-[28px] font-bold leading-none \${isOverBudget ? 'text-red-800 dark:text-red-300' : hasItemsInCart ? 'text-blue-900 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100'}\`}>
                {boughtItemsCount}
                <span className={\`text-[16px] font-medium opacity-80 ml-1 \${isOverBudget ? 'text-red-700 dark:text-red-400' : hasItemsInCart ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}\`}>
                  /{totalItemsCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 relative mt-4">`;

content = content.replace(searchStr, replacement);
fs.writeFileSync('src/components/ModoCompra.tsx', content);
console.log('ModoCompra patched');
