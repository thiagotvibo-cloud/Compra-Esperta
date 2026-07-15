import React, { useMemo } from 'react';
import { AppContextType } from '../types';
import { Store, ChevronRight, BadgePercent } from 'lucide-react';
import { formatMoney, formatItemName } from '../utils';

export const Roteiro: React.FC<{ context: AppContextType }> = ({ context }) => {
  const { items, markets, promotions } = context;

  const marketRankings = useMemo(() => {
    const listItems = items.filter(i => !i.isBought);
    const rankings = markets.map(market => {
      const marketPromos = promotions.filter(p => p.marketId === market.id);
      
      let matchedItems = 0;
      let potentialSavings = 0;

      listItems.forEach(item => {
        const promo = marketPromos.find(p => p.itemName === item.name);
        if (promo) {
          matchedItems++;
          // For simplicity we don't have a regular price yet, so we just calculate "matched items"
        }
      });

      return {
        market,
        matchedItems,
        matchedPromos: marketPromos.filter(p => listItems.find(i => i.name === p.itemName))
      };
    });

    return rankings.filter(r => r.matchedItems > 0).sort((a, b) => b.matchedItems - a.matchedItems);
  }, [items, markets, promotions]);

  return (
    <div className="pb-24 p-4 lg:p-6 space-y-6">
      <section className="bg-white dark:bg-[zinc-900] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 lg:p-6">
        <h2 className="text-[14px] font-semibold uppercase tracking-[1px] text-zinc-500 mb-2 flex items-center gap-2">
          <span>🗺️</span> Roteiro de Compras
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Veja quais mercados têm mais promoções para os itens da sua lista atual e planeje sua rota.
        </p>

        {marketRankings.length === 0 ? (
          <div className="text-center py-10 bg-zinc-50 dark:bg-[#1C1C1E] rounded-xl text-zinc-400">
            <Store size={48} className="mx-auto opacity-20 mb-3" />
            <p>Nenhuma promoção encontrada para os itens da sua lista atual.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {marketRankings.map((ranking, index) => (
              <div key={ranking.market.id} className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50 relative overflow-hidden">
                {index === 0 && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                    Melhor Destino
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">{ranking.market.name}</h3>
                    <div className="text-[12px] text-zinc-500 font-medium">
                      {ranking.matchedItems} ite{ranking.matchedItems === 1 ? 'm' : 'ns'} da lista em promoção
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                  {ranking.matchedPromos.map(promo => (
                    <div key={promo.id} className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center text-sm gap-1 sm:gap-3">
                      <div className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                        <BadgePercent size={16} className="text-orange-500 shrink-0 mt-0.5" />
                        <span className="leading-snug text-wrap">{formatItemName(promo.itemName)}</span>
                      </div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 sm:text-right pl-6 sm:pl-0">
                        {formatMoney(promo.price)} <span className="text-[11px] text-zinc-500 font-normal ml-1">por {promo.qty} {promo.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
