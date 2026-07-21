const fs = require('fs');
let content = fs.readFileSync('src/components/ModoCompra.tsx', 'utf8');

// Gamification update on finishPurchase
if (!content.includes('purchaseCount: prev.purchaseCount + 1')) {
  content = content.replace(
    /setHistory\(\(prev: HistoryItem\[\]\) => \[newHistoryItem, \.\.\.prev\]\);/,
    `setHistory((prev: HistoryItem[]) => [newHistoryItem, ...prev]);
      
      context.setSettings(prev => ({
        ...prev,
        totalSaved: prev.totalSaved + Math.max(0, economy),
        purchaseCount: prev.purchaseCount + 1
      }));`
  );
}

// Fullscreen Celebration Screen
if (!content.includes('setPurchaseSummary')) {
  content = content.replace(
    /const \[showFinishConfirm, setShowFinishConfirm\] = useState\(false\);/,
    `const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [purchaseSummary, setPurchaseSummary] = useState<{
    total: number;
    economy: number;
    itemCount: number;
    marketName: string;
  } | null>(null);`
  );

  content = content.replace(
    /context\.setActiveTab\('lista'\);\n\s*setShowFinishConfirm\(false\);\n\s*setItems\(items\.map\(\(i: Item\) => \(\{ \.\.\.i, isBought: false, actualPrice: 0 \}\)\)\);/,
    `setPurchaseSummary({
        total: totalSpent,
        economy: Math.max(0, economy),
        itemCount: activeItems.filter(i => i.isBought).length,
        marketName: markets.find(m => m.id === shoppingMarketId)?.name || 'Mercado'
      });`
  );
  
  const celebrateScreen = `
  <AnimatePresence>
     {purchaseSummary && (
       <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         className="fixed inset-0 z-[200] bg-gradient-to-b from-emerald-600 via-emerald-500 to-teal-500 flex flex-col items-center justify-center p-8"
       >
         <motion.div
           initial={{ scale: 0, rotate: -10 }}
           animate={{ scale: 1, rotate: 0 }}
           transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
           className="text-7xl mb-6"
         >
           🎉
         </motion.div>
         
         <motion.h1 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="text-3xl font-bold text-white text-center mb-1"
         >
           Compra Finalizada!
         </motion.h1>
         
         <motion.p 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.5 }}
           className="text-emerald-100 font-medium mb-8"
         >
           no {purchaseSummary.marketName}
         </motion.p>
         
         <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.6 }}
           className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
         >
           <div className="text-center mb-4">
             <div className="text-sm text-zinc-500 font-medium">
               Total da Compra
             </div>
             <div className="text-4xl font-bold text-zinc-900 font-[DM_Mono] tracking-tight">
               <span className="money-value">{formatMoney(purchaseSummary.total)}</span>
             </div>
           </div>
           
           <div className="border-t border-zinc-100 pt-4 space-y-3">
             <div className="flex justify-between text-sm">
               <span className="text-zinc-500">Itens comprados</span>
               <span className="font-semibold text-zinc-900">
                 {purchaseSummary.itemCount}
               </span>
             </div>
             
             {purchaseSummary.economy > 0 && (
               <div className="flex justify-between text-sm">
                 <span className="text-zinc-500">💰 Economia</span>
                 <span className="font-bold text-violet-600">
                   <span className="money-value">{formatMoney(purchaseSummary.economy)}</span>
                 </span>
               </div>
             )}
             
             {context.settings.budget > 0 && purchaseSummary.total < context.settings.budget && (
               <div className="bg-emerald-50 rounded-2xl p-3 text-center mt-2">
                 <span className="text-sm font-semibold text-emerald-700">
                   🎯 Ficou <span className="money-value">{formatMoney(context.settings.budget - purchaseSummary.total)}</span> abaixo do orçamento!
                 </span>
               </div>
             )}
           </div>
         </motion.div>
         
         <motion.button 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1 }}
           onClick={() => {
             setPurchaseSummary(null);
             setItems(items.map((i: Item) => ({ ...i, isBought: false, actualPrice: 0, notFound: false })));
             setShowFinishConfirm(false);
             context.setActiveTab('lista');
           }}
           className="mt-8 bg-white/20 backdrop-blur text-white font-bold py-4 px-12 rounded-full text-lg active:scale-[0.97] transition-transform shadow-lg"
         >
           Voltar para Lista
         </motion.button>
       </motion.div>
     )}
   </AnimatePresence>
  </div>
  );
  `;
  content = content.replace(/<\/div>\n\s*\);\n\};/, celebrateScreen + '\n};');
}

// E. 1 Circular Progress
content = content.replace(
  /<div className="h-1\.5 bg-emerald-700\/30 rounded-full overflow-hidden mt-4">[\s\S]*?<\/div>\n\s*<\/div>/,
  `</div>`
);

const circProgress = `
        {/* CIRCULAR PROGRESS */}
        <div className="absolute right-5 top-5">
          <svg width="48" height="48" className="transform -rotate-90">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
            <circle cx="24" cy="24" r="20" fill="none" stroke="white" strokeWidth="4"
              strokeDasharray={2 * Math.PI * 20}
              strokeDashoffset={(2 * Math.PI * 20) * (1 - (activeItems.length > 0 ? activeItems.filter(i => i.isBought).length / activeItems.length : 0))}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-[10px]">
            {Math.round((activeItems.length > 0 ? activeItems.filter(i => i.isBought).length / activeItems.length : 0) * 100)}%
          </div>
        </div>
`;

content = content.replace(
  /<div className="geometric-circle"><\/div>/,
  circProgress
);
// In case geometric circle was already removed:
if (!content.includes('CIRCULAR PROGRESS')) {
  content = content.replace(
    /<div className="flex justify-between items-end">/,
    circProgress + '\n        <div className="flex justify-between items-end mt-4">'
  );
}

// Replace the duplicate market selector (E.2)
content = content.replace(
  /\{\/\* MARKET SELECTOR \(INJEÇÃO DE PREÇO\) \*\/\}.*?<\/select>\n\s*<\/div>/s,
  ''
);

// E.4 Mini-toast
if (!content.includes('setLastBoughtName')) {
  content = content.replace(
    /const \[scaleTotal, setScaleTotal\] = useState\(false\);/,
    `const [scaleTotal, setScaleTotal] = useState(false);
  const [lastBoughtName, setLastBoughtName] = useState('');
  const [showBoughtToast, setShowBoughtToast] = useState(false);`
  );
  
  content = content.replace(
    /updateItemField\(item\.id, 'isBought', !item\.isBought\);/,
    `if (!item.isBought) {
        setLastBoughtName(item.name);
        setShowBoughtToast(true);
        setTimeout(() => setShowBoughtToast(false), 1500);
      }
      updateItemField(item.id, 'isBought', !item.isBought);`
  );
  
  const toastUI = `
      <AnimatePresence>
        {showBoughtToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[calc(env(safe-area-inset-top)+80px)] left-4 right-4 z-50 bg-emerald-600 text-white py-2.5 px-4 rounded-2xl text-center font-semibold text-sm shadow-lg pointer-events-none"
          >
            ✅ {lastBoughtName} adicionado!
          </motion.div>
        )}
      </AnimatePresence>
  `;
  content = content.replace(
    /<div className="px-4 mt-6">/,
    toastUI + '\n      <div className="px-4 mt-6">'
  );
}

// E.3 Alerta de preço (isOverpriced)
if (!content.includes('isOverpriced')) {
  // We need to calculate marketPromo inside the map
  content = content.replace(
    /const isPromo = promo && item\.actualPrice === 0;/,
    `const marketPromo = promotions.find(p => p.marketId === shoppingMarketId && p.itemName.toLowerCase() === item.name.toLowerCase());
                const isOverpriced = marketPromo && item.actualPrice > 0 && item.actualPrice > marketPromo.price;
                const isPromo = promo && item.actualPrice === 0;`
  );
  
  content = content.replace(
    /className=\{\`flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 rounded-3xl border \$\{/,
    `className={\`flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 rounded-3xl border \${isOverpriced ? 'border-red-300 dark:border-red-900/50' : `
  );
  
  content = content.replace(
    /\{isPromo && \(/,
    `{isOverpriced && (
                        <div className="text-[11px] text-red-500 font-semibold flex items-center gap-1 mt-0.5">
                          ⚠️ Acima da oferta ({formatMoney(marketPromo.price)})
                        </div>
                      )}
                      {isPromo && !isOverpriced && (`
  );
  // close the template literal correctly
  content = content.replace(
    /isPromo \? 'border-emerald-200 dark:border-emerald-900\/50' : 'border-zinc-100 dark:border-zinc-800'/,
    `(isPromo ? 'border-emerald-200 dark:border-emerald-900/50' : 'border-zinc-100 dark:border-zinc-800')}`
  );
}

// E.5 and E.6 Not found items
content = content.replace(
  /button onClick=\{.*?markNotFound.*?\} className="text-zinc-400 hover:text-red-500 p-1 shrink-0 bg-zinc-50 dark:bg-zinc-800 rounded-lg".*?>\s*<Ban.*?>\s*<\/button>/,
  `<button onClick={() => markNotFound(item.id)} className="text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0"><Ban size={14} /> Não achei</button>`
);

if (!content.includes('notFoundItems')) {
  const notFoundUI = `
        {/* NÃO ENCONTRADOS */}
        {(() => {
          const notFoundItems = items.filter(i => i.notFound);
          if (notFoundItems.length === 0) return null;
          return (
            <div className="mt-8 border-t border-dashed border-zinc-300 dark:border-zinc-700 pt-4">
               <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                 ⚠️ Não Encontrados ({notFoundItems.length})
               </h4>
               {notFoundItems.map(item => (
                 <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl mb-2">
                   <span className="text-sm text-zinc-500 line-through">
                     {formatItemName(item.name)}
                   </span>
                   <button onClick={() => setItems(items.map(i => i.id === item.id ? {...i, notFound: false} : i))}
                     className="text-xs text-emerald-600 font-semibold active:scale-[0.97] transition-transform">
                     Restaurar
                   </button>
                 </div>
               ))}
             </div>
          );
        })()}
  `;
  content = content.replace(
    /\{activeItems\.length === 0 && \(/,
    notFoundUI + '\n        {activeItems.length === 0 && ('
  );
}

// ensure AnimatePresence is imported
if (!content.includes('AnimatePresence')) {
  content = content.replace(
    /import \{ AppContextType/,
    `import { motion, AnimatePresence } from 'motion/react';\nimport { AppContextType`
  );
}


fs.writeFileSync('src/components/ModoCompra.tsx', content);
