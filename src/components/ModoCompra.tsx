import React, { useMemo } from 'react';
import { AppContextType, Item } from '../types';
import { formatMoney, formatItemName } from '../utils';
import { Check, Circle, AlertTriangle, Plus, Minus, Star } from 'lucide-react';

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

  const itemsByCategory = useMemo(() => {
    const grouped = items.reduce((acc, item) => {
      const cat = item.category || 'Outros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, Item[]>);

    Object.keys(grouped).forEach(cat => {
      grouped[cat].sort((a, b) => {
        if (a.isBought === b.isBought) {
          if (a.isEssential && !b.isEssential) return -1;
          if (!a.isEssential && b.isEssential) return 1;
          return a.name.localeCompare(b.name);
        }
        return a.isBought ? 1 : -1;
      });
    });

    return grouped;
  }, [items]);

  if (items.length === 0) {
    return <div className="p-10 text-center text-zinc-500">Lista vazia. Adicione itens primeiro.</div>;
  }

  return (
    <div className="pb-28 p-4 lg:p-6 pt-[calc(env(safe-area-inset-top)+20px)]">
      <div className={`sticky top-4 z-20 transition-all ${overBudget ? 'bg-red-50 dark:bg-red-900/50' : 'bg-soft-bg dark:bg-zinc-800'} rounded-[24px] shadow-soft p-5 border-none flex flex-col mb-6`}>
        <div className="flex justify-between items-center">
          <h2 className="text-[14px] font-semibold uppercase tracking-[1px] text-soft-text-muted flex items-center gap-2">
             <span>⚡</span> Modo Compra
          </h2>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-soft-text-muted mb-0.5">Total Atual</p>
            <p className={`text-[28px] font-semibold leading-none tracking-tight ${overBudget ? 'text-red-600 dark:text-red-400' : 'text-soft-primary'}`}>
              {formatMoney(totalSpent)}
            </p>
          </div>
        </div>
        {settings.budget > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700 flex justify-between items-center">
             <div className="text-[12px] font-semibold text-soft-text-muted">
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

      <div className="flex flex-col gap-6 mt-2">
        {Object.entries(itemsByCategory)
          .sort(([catA], [catB]) => catA.localeCompare(catB))
          .map(([category, catItems]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-soft-text-muted px-2">{category}</h3>
              <div className="flex flex-col gap-4">
                {catItems.map(item => (
                  <div 
                    key={item.id} 
                    className={`p-5 rounded-[24px] shadow-soft border-none transition-all ${
                      item.isBought 
                        ? 'bg-soft-card/50 dark:bg-[#1C1C1E] opacity-70' 
                        : 'bg-soft-bg dark:bg-zinc-800'
                    }`}
                  >
            <div className="flex gap-4 items-start">
              <button onClick={() => toggleBought(item.id)} className={`shrink-0 mt-1 transition-transform active:scale-90 ${item.isBought ? '' : 'hover:scale-110'}`}>
                {item.isBought ? <Check size={26} className="text-white bg-soft-primary rounded-full p-1 border-[2px] border-soft-primary" strokeWidth={3} /> : <Circle size={26} className="text-zinc-300 dark:text-zinc-500" strokeWidth={2} />}
              </button>
              
              <div className="flex-1 min-w-0 pr-2">
                <div className={`font-semibold text-[16px] flex items-start gap-2 dark:text-zinc-100 leading-snug text-wrap ${item.isBought ? 'line-through text-soft-text-muted dark:text-zinc-500' : 'text-soft-text-main'}`}>
                  <span>{formatItemName(item.name)}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setItems(items.map(i => i.id === item.id ? { ...i, isEssential: !i.isEssential } : i)); }}
                    className={`mt-0.5 shrink-0 transition-all ${item.isEssential ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-600 hover:text-amber-400 opacity-50 hover:opacity-100'}`}
                    title={item.isEssential ? "Remover prioridade" : "Marcar como prioridade"}
                  >
                    <Star size={16} className={item.isEssential ? 'fill-amber-400' : ''} strokeWidth={item.isEssential ? 0 : 2} />
                  </button>
                </div>
                {context.promotions.find(p => p.itemName === item.name) && (() => {
                  const promo = context.promotions.find(p => p.itemName === item.name)!;
                  const market = context.markets.find(m => m.id === promo.marketId);
                  return (
                    <button 
                      onClick={() => {
                        setItems(items.map(i => i.id === item.id ? { ...i, actualPrice: promo.price, qty: promo.qty || 1, unit: promo.unit || 'un' } : i));
                      }}
                      className="text-[11px] font-semibold text-orange-500 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400 px-2 py-0.5 rounded-[12px] mt-1 inline-block border-none active:scale-95 transition-transform whitespace-normal text-left max-w-full"
                    >
                      <span>Promo no {market?.name || 'Mercado'}: {formatMoney(promo.price)}/{promo.qty}{promo.unit} (Aplicar)</span>
                      {promo.notes && (
                        <div className="font-medium opacity-80 mt-0.5 max-w-full text-wrap italic">
                          {promo.notes}
                        </div>
                      )}
                    </button>
                  );
                })()}
                
                <div className="flex items-center gap-2 mt-2.5">
                  {['kg', 'l'].includes(item.unit.toLowerCase()) ? (
                    <div className="flex items-center bg-soft-card dark:bg-zinc-700/50 rounded-full p-1 focus-within:ring-2 focus-within:ring-soft-primary transition-all">
                      <input 
                        type="tel"
                        value={getQtyDisplayValue(item.qty, item.unit)}
                        onChange={(e) => handleQtyChange(item.id, e.target.value, item.unit)}
                        className="w-[72px] bg-transparent text-center text-[14px] font-semibold text-soft-text-main dark:text-zinc-100 focus:outline-none py-1"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center bg-soft-card dark:bg-zinc-700/50 rounded-full p-1 focus-within:ring-2 focus-within:ring-soft-primary transition-all">
                      <button onClick={() => updateQtyExplicit(item.id, Math.max(0, item.qty - 1))} className="p-2 text-soft-text-muted hover:text-soft-text-main dark:hover:text-zinc-100 transition-colors"><Minus size={14}/></button>
                      <input 
                        type="tel"
                        value={getQtyDisplayValue(item.qty, item.unit)}
                        onChange={(e) => handleQtyChange(item.id, e.target.value, item.unit)}
                        className="w-8 bg-transparent text-center text-[14px] font-semibold text-soft-text-main dark:text-zinc-100 focus:outline-none"
                      />
                      <button onClick={() => updateQtyExplicit(item.id, item.qty + 1)} className="p-2 text-soft-text-muted hover:text-soft-text-main dark:hover:text-zinc-100 transition-colors"><Plus size={14}/></button>
                    </div>
                  )}
                  <span className="text-[10px] font-semibold text-soft-text-muted uppercase bg-soft-card dark:bg-zinc-800 px-3 py-2 rounded-full">{item.unit}</span>
                </div>
              </div>

              <div className="w-[100px] shrink-0">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-soft-text-muted">R$</span>
                  <input 
                    type="tel" 
                    value={getPriceDisplayValue(item.actualPrice || 0)}
                    onChange={(e) => handlePriceInput(item.id, e.target.value)}
                    placeholder="0,00"
                    className={`w-full pl-7 pr-4 py-3 bg-soft-card dark:bg-zinc-700/50 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-soft-primary font-semibold ${item.isBought ? 'opacity-80 text-soft-text-main' : 'text-soft-primary'} text-right text-[15px] transition-colors`}
                  />
                </div>
                {item.isBought && (item.actualPrice || 0) > 0 && (item.qty || 0) > 0 && (
                   <div className="text-[10px] text-right mt-2 font-semibold text-soft-text-muted px-2 py-1 inline-block float-right">
                     = {formatMoney(item.qty * (item.actualPrice || 0))}
                   </div>
                )}
              </div>
            </div>
          </div>
        ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
