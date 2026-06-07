import React, { useMemo, useState } from 'react';
import { AppContextType, Item } from '../types';
import { formatMoney, formatItemName, generateId } from '../utils';
import { Check, Circle, AlertTriangle, Plus, Minus, Star, Search, CreditCard, X, Trash2 } from 'lucide-react';

export const ModoCompra: React.FC<{ context: AppContextType }> = ({ context }) => {
  const { items, setItems, settings } = context;
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvulso, setShowAvulso] = useState(false);
  const [avulsoVal, setAvulsoVal] = useState('');

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
    const numericStr = inputValue.replace(/\D/g, '');
    if (!numericStr) { updatePrice(id, 0); return; }
    const newPrice = parseInt(numericStr, 10) / 100;
    updatePrice(id, newPrice);
  };

  const getPriceDisplayValue = (price: number) => {
    if (!price) return '';
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const updateQtyExplicit = (id: string, newQty: number) => {
    setItems(items.map(item => item.id === id ? { ...item, qty: newQty } : item));
  };

  const handleQtyChange = (id: string, inputValue: string, unit: string) => {
    const isFractional = ['kg', 'l'].includes(unit.toLowerCase());
    const numericStr = inputValue.replace(/\D/g, '');
    
    if (isFractional) {
      if (!numericStr) { updateQtyExplicit(id, 0); return; }
      updateQtyExplicit(id, parseInt(numericStr, 10) / 1000);
    } else {
      if (!numericStr) { updateQtyExplicit(id, 0); return; }
      updateQtyExplicit(id, parseInt(numericStr, 10));
    }
  };

  const getQtyDisplayValue = (qty: number, unit: string) => {
    const isFractional = ['kg', 'l'].includes(unit.toLowerCase());
    if (isFractional) return (qty || 0).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    return (qty || 0).toString();
  };

  const handleAvulsoAdd = () => {
    const numericStr = avulsoVal.replace(/\D/g, '');
    if (!numericStr) return;
    const newPrice = parseInt(numericStr, 10) / 100;
    if (newPrice <= 0) return;

    setItems([...items, {
      id: generateId(), name: `Item Avulso`, category: 'Outros', qty: 1, unit: 'un', defaultPrice: 0, actualPrice: newPrice, isBought: true, isEssential: false
    }]);
    setAvulsoVal('');
    setShowAvulso(false);
  };

  const overBudget = settings.budget > 0 && totalSpent > settings.budget;

  const itemsByCategory = useMemo(() => {
    const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const grouped = filteredItems.reduce((acc, item) => {
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
  }, [items, searchTerm]);

  if (items.length === 0) return <div className="p-10 text-center text-zinc-500 font-medium">Sua lista está vazia. Adicione itens antes de ir às compras.</div>;

  return (
    <div className="pb-28 bg-soft-bg dark:bg-black min-h-screen">
      
      {/* STICKY HEADER (Market Pro Style) */}
      <div className={`sticky top-0 z-30 pt-[calc(env(safe-area-inset-top)+20px)] px-5 pb-6 rounded-b-[40px] shadow-lg transition-colors geometric-bg ${overBudget ? 'bg-red-500' : 'bg-sky-400'}`}>
        <div className="geometric-circle" style={{ top: '15px', right: '15px', width: '45px', height: '45px' }}></div>
        <div className="flex justify-between items-end relative z-10">
          <div>
            <div className={`text-[11px] font-semibold uppercase tracking-widest mb-1 ${overBudget ? 'text-red-100' : 'text-sky-50'}`}>Total no Carrinho</div>
            <div className="text-[36px] font-bold tracking-tight text-white leading-none">
              <span className="text-[20px] font-semibold mr-1 opacity-80">R$</span>
              {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          {overBudget && (
            <div className="bg-white/20 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold backdrop-blur-sm">
              <AlertTriangle size={14} /> Passou!
            </div>
          )}
        </div>

        {/* PROGRESS BAR */}
        {settings.budget > 0 && (
          <div className="mt-5 relative z-10">
            <div className={`flex justify-between text-[11px] font-semibold uppercase tracking-widest mb-2 ${overBudget ? 'text-red-100' : 'text-sky-50'}`}>
              <span>Orçamento: {formatMoney(settings.budget)}</span>
              <span>{Math.round((totalSpent / settings.budget) * 100)}%</span>
            </div>
            <div className={`h-2.5 rounded-full overflow-hidden ${overBudget ? 'bg-red-800/40' : 'bg-sky-800/20'}`}>
              <div 
                className="h-full bg-white rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${Math.min((totalSpent / settings.budget) * 100, 100)}%` }} 
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-4 mt-6">
        {/* COMPACT SEARCH & AVULSO */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" placeholder="Buscar no carrinho..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium placeholder-zinc-400 text-[15px] shadow-sm"
            />
          </div>
          <button onClick={() => setShowAvulso(!showAvulso)} className={`shrink-0 p-3.5 rounded-2xl border flex items-center justify-center transition-colors ${showAvulso ? 'bg-sky-600 text-white border-sky-600' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 shadow-sm'}`}>
            <Plus size={22} />
          </button>
        </div>

        {showAvulso && (
          <div className="mb-6 p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
            <div className="bg-sky-50 dark:bg-sky-900/30 p-3 rounded-full text-sky-600 dark:text-sky-400"><CreditCard size={20} /></div>
            <div className="relative flex-1">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-zinc-400">R$</span>
              <input 
                type="tel" autoFocus placeholder="0,00" value={avulsoVal}
                onChange={(e) => {
                   const numericStr = e.target.value.replace(/\D/g, '');
                   if (!numericStr) { setAvulsoVal(''); return; }
                   const val = parseInt(numericStr, 10) / 100;
                   setAvulsoVal(val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                }}
                className="w-full bg-transparent pl-7 pr-2 py-1 outline-none font-bold text-[20px] text-zinc-900 dark:text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleAvulsoAdd()}
              />
            </div>
            <button onClick={handleAvulsoAdd} className="bg-sky-600 text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-md active:scale-95">Adicionar</button>
          </div>
        )}

        {/* LIST */}
        <div className="flex flex-col gap-6">
          {Object.entries(itemsByCategory)
            .sort(([catA], [catB]) => catA.localeCompare(catB))
            .map(([category, catItems]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-[14px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-2">{category}</h3>
                <div className="flex flex-col gap-3">
                  {catItems.map(item => (
                    <div 
                      key={item.id} 
                      className={`p-3.5 rounded-2xl border transition-colors flex gap-3 items-center ${
                        item.isBought 
                          ? 'bg-zinc-100/80 dark:bg-zinc-900/80 border-dashed border-zinc-300 dark:border-zinc-700 opacity-60' 
                          : 'bg-white dark:bg-[#1C1C1E] border-zinc-200 dark:border-zinc-700 shadow-sm'
                      }`}
                    >
                      {/* HUGE CHECK TARGET */}
                      <button 
                        onClick={() => toggleBought(item.id)} 
                        className={`w-[52px] h-[52px] shrink-0 rounded-full flex items-center justify-center transition-all ${
                          item.isBought ? 'bg-sky-500 border-none' : 'bg-transparent border-[3px] border-zinc-300 dark:border-zinc-600'
                        }`}
                      >
                        {item.isBought && <Check size={28} strokeWidth={4} className="text-white" />}
                      </button>

                      <div className="flex-1 min-w-0 py-1">
                        <div className={`text-[17px] font-semibold leading-tight truncate ${item.isBought ? 'line-through text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                          {item.name}
                        </div>
                        
                        {/* INPUTS ROW */}
                        <div className="flex items-center gap-3 mt-2.5">
                          {/* QTY */}
                          <div className={`flex items-center rounded-xl p-1 shrink-0 ${item.isBought ? 'bg-zinc-200/50 dark:bg-zinc-800' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                            {['kg', 'l'].includes(item.unit.toLowerCase()) ? (
                                <input 
                                  type="tel" value={getQtyDisplayValue(item.qty, item.unit)} onChange={(e) => handleQtyChange(item.id, e.target.value, item.unit)}
                                  className="w-[60px] bg-transparent text-center text-[15px] font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
                                />
                            ) : (
                              <>
                                <button onClick={() => updateQtyExplicit(item.id, Math.max(0, item.qty - 1))} className="p-1.5 text-zinc-500 active:bg-white dark:active:bg-zinc-700 rounded-lg"><Minus size={16}/></button>
                                <input 
                                  type="tel" value={getQtyDisplayValue(item.qty, item.unit)} onChange={(e) => handleQtyChange(item.id, e.target.value, item.unit)}
                                  className="w-8 bg-transparent text-center text-[15px] font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
                                />
                                <button onClick={() => updateQtyExplicit(item.id, item.qty + 1)} className="p-1.5 text-zinc-500 active:bg-white dark:active:bg-zinc-700 rounded-lg"><Plus size={16}/></button>
                              </>
                            )}
                            <span className="text-[11px] font-semibold text-zinc-400 uppercase pr-1.5">{item.unit}</span>
                          </div>

                          <div className="text-zinc-300 dark:text-zinc-600 font-semibold">×</div>

                          {/* PRICE */}
                          <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-zinc-400">R$</span>
                            <input 
                              type="tel" value={getPriceDisplayValue(item.actualPrice || 0)} onChange={(e) => handlePriceInput(item.id, e.target.value)}
                              placeholder="0,00"
                              className={`w-full pl-[26px] pr-3 py-2.5 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 text-[15px] transition-colors ${
                                item.isBought ? 'bg-transparent text-zinc-600 dark:text-zinc-400' : 'bg-zinc-100 dark:bg-zinc-800 text-sky-600 dark:text-sky-400'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

