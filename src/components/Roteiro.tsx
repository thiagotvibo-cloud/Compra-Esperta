import React, { useMemo } from 'react';
import { AppContextType } from '../types';
import { Store, ChevronRight, BadgePercent } from 'lucide-react';
import { formatMoney, formatItemName, getPricePerBaseUnit, convertToBaseUnit } from '../utils';

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
    <div className="pb-28 bg-zinc-50 dark:bg-black min-h-screen">
      {/* HEADER */}
      <div className="bg-sky-400 rounded-b-[40px] pt-[calc(env(safe-area-inset-top)+32px)] pb-16 px-6 text-white shadow-primary z-10 geometric-bg relative">
         <div className="flex justify-between items-center relative z-10">
            <h2 className="text-[24px] font-bold tracking-tight flex items-center gap-2">
              Roteiro de Compras
            </h2>
         </div>
         <p className="text-sky-50 mt-2 text-[13px] font-medium relative z-10 pr-10">
           Veja quais mercados têm mais ofertas para sua lista atual e planeje sua rota.
         </p>
      </div>

      <div className="px-4 lg:px-6 -mt-8 relative z-20">

      {marketRankings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-400 shadow-sm flex flex-col items-center">
          <Store size={48} className="opacity-20 mb-4" strokeWidth={1.5} />
          <p className="font-semibold text-[15px] max-w-[200px]">Nenhuma oferta encontrada para sua lista.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {marketRankings.map((ranking, index) => (
            <div key={ranking.market.id} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 relative overflow-hidden shadow-sm">
              {index === 0 && (
                <div className="absolute top-0 right-0 bg-sky-500 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-[16px] shadow-sm">
                  Melhor Destino
                </div>
              )}
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-[20px] ${index === 0 ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/30' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'}`}>
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-[18px] text-zinc-900 dark:text-zinc-100">{ranking.market.name}</h3>
                  <div className="text-[12px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">
                    {ranking.matchedItems} ite{ranking.matchedItems === 1 ? 'm' : 'ns'} da lista em oferta
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-5 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                {ranking.matchedPromos.map(promo => {
                  const base = convertToBaseUnit(promo.qty, promo.unit);
                  const pricePerBase = getPricePerBaseUnit(promo.price, promo.qty, promo.unit);

                  return (
                    <div key={promo.id} className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2 sm:gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl">
                      <div className="flex items-start gap-2.5 text-zinc-900 dark:text-zinc-100 font-semibold text-[15px]">
                        <BadgePercent size={18} className="text-orange-500 shrink-0 mt-0.5" />
                        <span className="leading-snug text-wrap">{formatItemName(promo.itemName)}</span>
                      </div>
                      <div className="font-bold text-zinc-800 dark:text-zinc-100 text-[16px] sm:text-right pl-7 sm:pl-0">
                        {formatMoney(promo.price)} <span className="text-[12px] text-zinc-500 font-semibold ml-1 uppercase">por {promo.qty} {promo.unit}</span>
                        {base.qty !== 1 && (
                          <div className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wider mt-1">
                            (Equivale {formatMoney(pricePerBase)} / {base.unit})
                          </div>
                        )}
                        {promo.notes && (
                          <div className="text-[11px] font-medium text-zinc-500 mt-1 max-w-[200px] text-wrap italic sm:ml-auto">
                            {promo.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};
