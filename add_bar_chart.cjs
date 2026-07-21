const fs = require('fs');
let content = fs.readFileSync('src/components/Promocoes.tsx', 'utf8');

if (!content.includes('animateChart')) {
  // Add state for animation
  content = content.replace(
    /const todayStr =/,
    `const [animateChart, setAnimateChart] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimateChart(true), 300);
    return () => clearTimeout(t);
  }, []);
  const todayStr =`
  );
  
  // Also import useState and useEffect if not present (already imported probably, let's check)
}

const barChartUI = `
      {/* COMPARADOR VISUAL */}
      {(() => {
        const marketComparison = context.markets.map(market => {
          let total = 0;
          context.items.forEach(item => {
            const promo = context.promotions.find(p => p.marketId === market.id && p.itemName.toLowerCase() === item.name.toLowerCase());
            total += promo ? promo.price * item.qty : 15.00 * item.qty;
          });
          return { market, total };
        }).sort((a, b) => a.total - b.total);
        
        const maxTotal = Math.max(...marketComparison.map(m => m.total));

        return (
          <div className="mt-8 px-5">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">🏆 Comparativo de Mercados</h3>
            <p className="text-sm text-zinc-500 mb-6">Baseado nos itens da sua lista</p>
            
            {marketComparison.length < 2 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 text-center border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-sm">
                Cadastre promoções em pelo menos 2 mercados para comparar.
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                {marketComparison.map((entry, index) => {
                  const widthPercent = maxTotal > 0 ? (entry.total / maxTotal) * 100 : 0;
                  const isWinner = index === 0;
                  
                  return (
                    <div key={entry.market.id} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className={\`text-sm font-semibold \${isWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-300'}\`}>
                          {isWinner && '👑 '}{entry.market.name}
                        </span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          <span className="money-value">{formatMoney(entry.total)}</span>
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div 
                          className={\`h-full rounded-full transition-all duration-1000 ease-out \${isWinner ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-zinc-300 dark:bg-zinc-600'}\`}
                          style={{ width: animateChart ? \`\${widthPercent}%\` : '0%' }}
                        />
                      </div>
                      {isWinner && marketComparison.length > 1 && (
                        <div className="text-[11px] font-semibold text-emerald-600 mt-1.5">
                          Economia de <span className="money-value">{formatMoney(marketComparison[marketComparison.length - 1].total - entry.total)}</span> vs. mais caro
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
`;

if (!content.includes('🏆 Comparativo de Mercados')) {
  // We'll append it before the end of the container
  content = content.replace(
    /<\/div>\n\s*\);\n\};/,
    barChartUI + '\n    </div>\n  );\n};'
  );
}

fs.writeFileSync('src/components/Promocoes.tsx', content);
