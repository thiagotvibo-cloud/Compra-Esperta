const fs = require('fs');
let content = fs.readFileSync('src/components/MenuExtra.tsx', 'utf8');

const historicoUI = `
      {/* CARD DE INSIGHTS E HISTÓRICO */}
      {(() => {
        const totalSpentAllTime = context.history.reduce((acc, h) => acc + h.totalSpent, 0);
        const totalEconomy = context.history.reduce((acc, h) => acc + h.economyGenerated, 0);
        const avgPerPurchase = context.history.length > 0 ? totalSpentAllTime / context.history.length : 0;
        
        const badges = [
           { emoji: '🛒', name: 'Primeira Compra', unlocked: settings.purchaseCount >= 1 },
           { emoji: '🔥', name: '7 dias seguidos', unlocked: settings.streak >= 7 },
           { emoji: '💰', name: 'Economizou R$100', unlocked: settings.totalSaved >= 100 },
           { emoji: '🏆', name: 'Economizou R$500', unlocked: settings.totalSaved >= 500 },
           { emoji: '⭐', name: '10 Compras', unlocked: settings.purchaseCount >= 10 },
         ];

        return (
          <div className="mb-6">
            
            {/* BADGES */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 mb-6 shadow-sm">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                🏅 SUAS CONQUISTAS
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {badges.map((badge, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center gap-1.5">
                    <div className={\`w-14 h-14 rounded-full flex items-center justify-center text-2xl \${badge.unlocked ? 'bg-violet-100 text-violet-600' : 'bg-zinc-100 grayscale opacity-40'}\`}>
                      {badge.emoji}
                    </div>
                    <div className={\`text-[9px] font-bold leading-tight \${badge.unlocked ? 'text-violet-700 dark:text-violet-400' : 'text-zinc-400'}\`}>
                      {badge.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
               <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-3 text-center shadow-sm">
                 <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{context.history.length}</div>
                 <div className="text-[10px] font-semibold text-emerald-600/70 uppercase tracking-wider mt-0.5">Compras</div>
               </div>
               <div className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-3 text-center shadow-sm">
                 <div className="text-xl font-bold text-violet-700 dark:text-violet-400"><span className="money-value">{formatMoney(totalEconomy)}</span></div>
                 <div className="text-[10px] font-semibold text-violet-600/70 uppercase tracking-wider mt-0.5">Economia</div>
               </div>
               <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3 text-center shadow-sm">
                 <div className="text-xl font-bold text-blue-700 dark:text-blue-400"><span className="money-value">{formatMoney(avgPerPurchase)}</span></div>
                 <div className="text-[10px] font-semibold text-blue-600/70 uppercase tracking-wider mt-0.5">Média</div>
               </div>
             </div>
             
             <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
               <h3 className="text-[12px] font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                 📊 HISTÓRICO RECENTE
               </h3>
               
               {context.history.length === 0 ? (
                 <p className="text-sm text-zinc-400 text-center py-6">
                   Nenhuma compra finalizada ainda.
                 </p>
               ) : (
                 <div className="space-y-3">
                   {context.history.slice(0, 5).map(h => {
                     const market = context.markets.find(m => m.id === h.marketId);
                     const dateStr = new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                     
                     return (
                       <div key={h.id} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                         <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-sm shrink-0">
                           {dateStr.split(' ')[0]}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                             {market?.name || 'Mercado'}
                           </div>
                           <div className="text-xs text-zinc-500">
                             {h.items.length} itens · {dateStr}
                           </div>
                         </div>
                         <div className="text-right shrink-0">
                           <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                             <span className="money-value">{formatMoney(h.totalSpent)}</span>
                           </div>
                           {h.economyGenerated > 0 && (
                             <div className="text-xs font-semibold text-violet-500">
                               -<span className="money-value">{formatMoney(h.economyGenerated)}</span>
                             </div>
                           )}
                         </div>
                       </div>
                     );
                   })}
                   
                   <button onClick={() => { 
                     if (window.confirm('Apagar todo o histórico?')) 
                       context.setHistory([]);
                   }}
                   className="text-sm text-red-400 hover:text-red-500 font-medium mt-4 w-full text-center transition-colors">
                     Limpar Histórico
                   </button>
                 </div>
               )}
             </div>
          </div>
        );
      })()}
`;

if (!content.includes('🏅 SUAS CONQUISTAS')) {
  // Insert before the danger zone (Factory reset)
  content = content.replace(
    /\{\/\* FACTORY RESET \*\/\}/,
    historicoUI + '\n\n      {/* FACTORY RESET */}'
  );
}

fs.writeFileSync('src/components/MenuExtra.tsx', content);
