import React, { useMemo } from 'react';
import { AppContextType, Item } from '../types';
import { formatMoney, formatItemName } from '../utils';
import { Check, Circle, AlertTriangle, Plus, Minus } from 'lucide-react';

export const ModoCompra: React.FC<{ context: AppContextType }> = ({ context }) => {
  const { items, setItems, settings } = context;

  const totalSpent = useMemo(() => {
    return items.filter(i => i.isBought).reduce((acc, curr) => acc + ((curr.actualPrice || 0) * (curr.qty || 1)), 0);
  }, [items]);

  const toggleBought = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, isBought: !item.isBought } : item));
  };

  const updatePrice = (id: string, newPrice: number) => {
    setItems(items.map(item => item.id === id ? { ...item, actualPrice: newPrice } : item));
  };

  const handlePriceInput = (id: string, inputValue: string) => {
    // Keep only numbers
    const numericStr = inputValue.replace(/\D/g, '');
    if (!numericStr) {
      updatePrice(id, 0);
      return;
    }
    // Convert to float (divide by 100)
    const newPrice = parseInt(numericStr, 10) / 100;
    updatePrice(id, newPrice);
  };

  const getPriceDisplayValue = (price: number) => {
    if (!price) return '';
    // Formata o número (ex: 24.5) para string com vírgula (ex: "24,50")
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const updateQtyExplicit = (id: string, newQty: number) => {
    setItems(items.map(item => item.id === id ? { ...item, qty: newQty } : item));
  };
  
  const handleQtyChange = (id: string, inputValue: string, unit: string) => {
    const isFractional = ['kg', 'l'].includes(unit.toLowerCase());
    const numericStr = inputValue.replace(/\D/g, '');
    
    if (isFractional) {
      if (!numericStr) {
        updateQtyExplicit(id, 0);
        return;
      }
      const newQty = parseInt(numericStr, 10) / 1000;
      updateQtyExplicit(id, newQty);
    } else {
      if (!numericStr) {
        updateQtyExplicit(id, 0);
        return;
      }
      updateQtyExplicit(id, parseInt(numericStr, 10));
    }
  };
  
  const getQtyDisplayValue = (qty: number, unit: string) => {
    const isFractional = ['kg', 'l'].includes(unit.toLowerCase());
    if (isFractional) {
      // 3 casas decimais para KGs ou L
      return (qty || 0).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    }
    return (qty || 0).toString();
  };

  const overBudget = settings.budget > 0 && totalSpent > settings.budget;

  const sortedItems = [...items].sort((a, b) => {
    if (a.isBought === b.isBought) return 0;
    return a.isBought ? 1 : -1;
  });

  if (items.length === 0) {
    return <div className="p-10 text-center text-zinc-500">Lista vazia. Adicione itens primeiro.</div>;
  }

  return (
    <div className="pb-28 p-4 lg:p-6 space-y-4">
      <div className={`sticky top-4 z-20 transition-all ${overBudget ? 'bg-red-50 dark:bg-red-900/50 border-red-200' : 'bg-white dark:bg-[zinc-900] border-zinc-200 dark:border-zinc-800'} rounded-2xl border p-5 flex flex-col mb-6 shadow-sm`}>
        <div className="flex justify-between items-center">
          <h2 className="text-[14px] font-semibold uppercase tracking-[1px] text-zinc-500 flex items-center gap-2">
             <span>⚡</span> Modo Compra
          </h2>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-0.5">Total Atual</p>
            <p className={`text-[28px] font-semibold leading-none tracking-tight ${overBudget ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-500'}`}>
              {formatMoney(totalSpent)}
            </p>
          </div>
        </div>
        {settings.budget > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
             <div className="text-[12px] font-semibold text-zinc-500">
               Orçamento: {formatMoney(settings.budget)}
             </div>
             {overBudget && (
               <div className="text-[11px] font-semibold bg-red-100 text-red-700 px-2.5 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1">
                 <AlertTriangle size={12} /> Ultrapassado
               </div>
             )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {sortedItems.map(item => (
          <div 
            key={item.id} 
            className={`p-4 rounded-2xl border-2 transition-all ${
              item.isBought 
                ? 'bg-zinc-50 dark:bg-[#1C1C1E] border-zinc-200 dark:border-zinc-800 opacity-70' 
                : 'bg-white dark:bg-[#1C1C1E] border-zinc-200 dark:border-zinc-800'
            }`}
          >
            <div className="flex gap-3 items-start">
              <button onClick={() => toggleBought(item.id)} className={`shrink-0 mt-1 transition-transform active:scale-90 ${item.isBought ? '' : 'hover:scale-110'}`}>
                {item.isBought ? <Check size={26} className="text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-full p-1 border-[1.5px] border-blue-600" strokeWidth={3} /> : <Circle size={26} className="text-zinc-300 dark:text-zinc-600" strokeWidth={2} />}
              </button>
              
              <div className="flex-1 min-w-0 pr-2">
                <div className={`font-semibold text-[16px] dark:text-zinc-200 leading-snug text-wrap ${item.isBought ? 'line-through text-zinc-400 dark:text-zinc-500' : ''}`}>{formatItemName(item.name)}</div>
                {context.promotions.find(p => p.itemName === item.name) && (() => {
                  const promo = context.promotions.find(p => p.itemName === item.name)!;
                  const market = context.markets.find(m => m.id === promo.marketId);
                  return (
                    <button 
                      onClick={() => {
                        setItems(items.map(i => i.id === item.id ? { ...i, actualPrice: promo.price, qty: promo.qty || 1, unit: promo.unit || 'un' } : i));
                      }}
                      className="text-[11px] font-semibold text-orange-500 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400 px-2 py-0.5 rounded-md mt-1 inline-block border border-orange-200 dark:border-orange-500/20 active:scale-95 transition-transform whitespace-normal text-left"
                    >
                      Promo no {market?.name || 'Mercado'}: {formatMoney(promo.price)}/{promo.qty} {promo.unit} (Aplicar)
                    </button>
                  );
                })()}
                
                <div className="flex items-center gap-2 mt-2.5">
                  {['kg', 'l'].includes(item.unit.toLowerCase()) ? (
                    <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                      <input 
                        type="tel"
                        value={getQtyDisplayValue(item.qty, item.unit)}
                        onChange={(e) => handleQtyChange(item.id, e.target.value, item.unit)}
                        className="w-[72px] bg-transparent text-center text-[14px] font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none py-1"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                      <button onClick={() => updateQtyExplicit(item.id, Math.max(0, item.qty - 1))} className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"><Minus size={14}/></button>
                      <input 
                        type="tel"
                        value={getQtyDisplayValue(item.qty, item.unit)}
                        onChange={(e) => handleQtyChange(item.id, e.target.value, item.unit)}
                        className="w-8 bg-transparent text-center text-[14px] font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                      <button onClick={() => updateQtyExplicit(item.id, item.qty + 1)} className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"><Plus size={14}/></button>
                    </div>
                  )}
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">{item.unit}</span>
                </div>
              </div>

              <div className="w-[100px] shrink-0">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400">R$</span>
                  <input 
                    type="tel" 
                    value={getPriceDisplayValue(item.actualPrice || 0)}
                    onChange={(e) => handlePriceInput(item.id, e.target.value)}
                    placeholder="0,00"
                    className={`w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-900 border ${item.isBought ? 'border-blue-300 dark:border-blue-700/50 bg-blue-50/50 dark:bg-blue-900/10' : 'border-zinc-200 dark:border-zinc-800'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-blue-600 dark:text-blue-400 text-right text-[15px] transition-colors`}
                  />
                </div>
                {item.isBought && (item.actualPrice || 0) > 0 && (item.qty || 0) > 0 && (
                   <div className="text-[10px] text-right mt-1.5 font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md inline-block float-right border border-zinc-200 dark:border-zinc-700">
                     = {formatMoney(item.qty * (item.actualPrice || 0))}
                   </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
