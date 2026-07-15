import React, { useMemo, useState, useEffect } from 'react';
import { AppContextType, Item, HistoryItem } from '../types';
import { formatMoney, formatItemName, generateId, normalizeStr } from '../utils';
import { Check, AlertTriangle, Plus, Minus, Search, CreditCard, X, Trash2, Store, Ban, ShoppingBag } from 'lucide-react';

export const ModoCompra: React.FC<{ context: AppContextType }> = ({ context }) => {
  const { items, setItems, settings, markets, promotions, setHistory, history, shoppingMarketId, setShoppingMarketId } = context;
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvulso, setShowAvulso] = useState(false);
  const [avulsoVal, setAvulsoVal] = useState('');
  const [delayedSorting, setDelayedSorting] = useState<boolean>(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const activeItems = useMemo(() => items.filter(i => !i.notFound), [items]);

  const totalSpent = useMemo(() => {
    return activeItems.filter(i => i.isBought).reduce((acc, curr) => acc + ((curr.actualPrice || 0) * (curr.qty || 1)), 0);
  }, [activeItems]);

  const toggleBought = (id: string) => {
    setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, isBought: !item.isBought } : item));
    setDelayedSorting(true);
  };

  const markNotFound = (id: string) => {
    setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, notFound: true, isBought: false } : item));
  };

  useEffect(() => {
    if (delayedSorting) {
      const timer = setTimeout(() => {
        setDelayedSorting(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [delayedSorting, items]);

  const updatePrice = (id: string, newPrice: number) => {
    setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, actualPrice: newPrice } : item));
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
    setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, qty: newQty } : item));
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

    setItems(prevItems => [...prevItems, {
      id: generateId(), name: `Item Avulso`, category: 'Outros', qty: 1, unit: 'un', actualPrice: newPrice, isBought: true, isEssential: false, onlyPromo: false, notes: ''
    }]);
    setAvulsoVal('');
    setShowAvulso(false);
  };

  const handleMarketSelect = (marketId: string) => {
    setShoppingMarketId(marketId);
    if (!marketId) return;
    
    const marketPromos = promotions.filter(p => p.marketId === marketId);
    setItems(prev => prev.map(item => {
       if (item.isBought) return item; // Conserva valor preenchido manualmente
       const promo = marketPromos.find(p => normalizeStr(p.itemName) === normalizeStr(item.name));
       if (promo) {
         return { ...item, actualPrice: promo.price };
       }
       return item;
    }));
  };

  const budgetPercent = settings.budget > 0 ? (totalSpent / settings.budget) * 100 : 0;
  
  let headerColor = 'bg-gradient-to-br from-emerald-500 to-teal-400';
  let textColor = 'text-white';
  let subTextColor = 'text-white/80';
  let pulseClass = '';

  if (budgetPercent > 100) {
     headerColor = 'bg-red-600';
     textColor = 'text-white';
     subTextColor = 'text-red-100';
     pulseClass = 'animate-pulse';
  } else if (budgetPercent >= 90) {
     headerColor = 'bg-red-400';
     textColor = 'text-white';
     subTextColor = 'text-red-100';
  } else if (budgetPercent >= 70) {
     headerColor = 'bg-orange-500';
     textColor = 'text-white';
     subTextColor = 'text-orange-100';
  }

  const finishPurchase = () => {
    const PRECO_REFERENCIA = 12.00;
    let economy = 0;
    activeItems.filter(i => i.isBought).forEach(item => {
      const hasPromo = promotions.some(p => normalizeStr(p.itemName) === normalizeStr(item.name));
      if (hasPromo && item.actualPrice && item.actualPrice > 0) {
        const economyPerUnit = Math.max(0, PRECO_REFERENCIA - item.actualPrice);
        economy += economyPerUnit * item.qty;
      }
    });

    const h: HistoryItem = {
      id: generateId(),
      date: new Date().toISOString(),
      marketId: shoppingMarketId || null,
      totalSpent: totalSpent,
      economyGenerated: Math.max(0, economy), // para não ficar negativo se passou
      items: activeItems.filter(i => i.isBought).map(i => ({
        nome: i.name,
        quantidade: i.qty,
        subtotal: (i.actualPrice || 0) * i.qty
      }))
    };
    
    setHistory([h, ...history]);
    
    setItems(prevItems => prevItems.map(i => ({...i, isBought: false, actualPrice: 0, notFound: false})));
    setShowFinishConfirm(false);
    context.setActiveTab('lista');
  };

  const itemsByCategory = useMemo(() => {
    const filteredItems = activeItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const grouped = filteredItems.reduce((acc, item) => {
      const cat = item.category || 'Outros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, Item[]>);

    if (!delayedSorting) {
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
    }
    return grouped;
  }, [activeItems, searchTerm, delayedSorting]);

  // Se não tem itens
  if (items.length === 0) return <div className="p-10 text-center text-zinc-500 font-medium">Sua lista está vazia. Adicione itens antes de ir às compras.</div>;

  return (
    <div className="pb-56 min-h-screen bg-soft-bg dark:bg-zinc-900">
      
      {/* STICKY HEADER */}
      <div className={`sticky top-0 z-30 pt-[calc(env(safe-area-inset-top)+20px)] px-4 sm:px-5 pb-6 rounded-b-[40px] shadow-lg transition-colors duration-500 geometric-bg ${headerColor} ${pulseClass}`}>
        
        {/* MARKET SELECTOR IN HEADER */}
        <div className="relative z-10 mb-4 bg-black/10 backdrop-blur-sm rounded-2xl flex items-center gap-2 px-3 py-2 border border-white/10 w-full">
          <Store className={textColor} size={16} />
          <select 
            value={shoppingMarketId} 
            onChange={e => handleMarketSelect(e.target.value)}
            className={`flex-1 min-w-0 bg-transparent border-none focus:outline-none font-semibold text-[14px] cursor-pointer appearance-none truncate ${textColor}`}
          >
            <option value="" className="text-zinc-800">-- Selecione o Mercado --</option>
            {markets.map(m => <option className="text-zinc-800" key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        <div className="flex justify-between items-end relative z-10">
          <div>
            <div className={`text-[12px] font-semibold uppercase tracking-widest mb-1 ${subTextColor}`}>Valor no Carrinho</div>
            <div className={`text-[36px] font-bold tracking-tight leading-none ${textColor}`}>
              <span className="text-[20px] font-semibold mr-1 opacity-80">R$</span>
              {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            
            {settings.budget > 0 && (
               <div className={`text-[13px] font-medium mt-1 ${subTextColor}`}>
                  de R$ {settings.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} · 
                  {budgetPercent > 100 ? 
                    <span className="font-bold ml-1">Estourou R$ {(totalSpent - settings.budget).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> : 
                    <span className="ml-1">Faltam R$ {(settings.budget - totalSpent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  }
               </div>
            )}
          </div>
          {budgetPercent >= 70 && budgetPercent < 100 && (
             <div className="bg-black/10 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold backdrop-blur-sm">
                <AlertTriangle size={14} /> Atenção
             </div>
          )}
          {budgetPercent >= 100 && (
             <div className="bg-black/20 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold backdrop-blur-sm">
                ⛔ Passou!
             </div>
          )}
        </div>

        <div className={`mt-4 relative z-10 text-[13px] font-semibold flex items-center gap-2 ${subTextColor}`}>
          <span>{activeItems.filter(i => i.isBought).length} de {activeItems.length} itens</span>
          <span>·</span>
          <span>{activeItems.filter(i => !i.isBought).length} pendentes</span>
        </div>

        {/* PROGRESS BAR */}
        {settings.budget > 0 && (
          <div className="mt-3 relative z-10">
            <div className={`h-2.5 rounded-full overflow-hidden bg-black/10 border border-white/10 shadow-inner`}>
              <div 
                className={`h-full rounded-full transition-all duration-300 ease-out ${budgetPercent >= 90 ? 'bg-red-500' : 'bg-soft-bg'}`}
                style={{ width: `${Math.min(budgetPercent, 100)}%` }} 
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
              className="w-full bg-soft-bg dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:ring-zinc-100 font-medium placeholder-zinc-400 text-[15px] shadow-sm"
            />
          </div>
          <button onClick={() => setShowAvulso(!showAvulso)} className={`shrink-0 p-3.5 rounded-2xl border flex items-center justify-center transition-colors ${showAvulso ? 'bg-soft-bg dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-900 dark:border-zinc-100' : 'bg-soft-bg dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 shadow-sm'}`}>
            <Plus size={22} />
          </button>
        </div>

        {showAvulso && (
          <div className="mb-6 p-4 bg-soft-bg dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
            <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-full text-zinc-800 dark:text-zinc-200"><CreditCard size={20} /></div>
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
                className="w-full bg-transparent pl-7 pr-2 py-1 outline-none font-bold text-[20px] text-zinc-800 dark:text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleAvulsoAdd()}
              />
            </div>
            <button onClick={handleAvulsoAdd} className="bg-soft-bg dark:bg-zinc-900 text-zinc-900 dark:text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-md active:scale-95">Adicionar</button>
          </div>
        )}

        {/* ITEMS LIST */}
        <div className="flex flex-col gap-6">
          {activeItems.length === 0 ? (
            <div className="text-center py-12 bg-soft-bg dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center">
              <ShoppingBag size={48} className="text-zinc-300 dark:text-zinc-700 mb-4" strokeWidth={1.5} />
              <p className="text-zinc-500 font-medium px-6">Todos os itens foram marcados como não encontrados ou a lista está vazia.</p>
            </div>
          ) : Object.entries<Item[]>(itemsByCategory)
            .sort(([catA], [catB]) => catA.localeCompare(catB))
            .map(([category, catItems]) => {
              const catSubtotal = catItems.reduce((acc, item) => acc + ((typeof item.actualPrice === 'number' ? item.actualPrice : 0) * (typeof item.qty === 'number' ? item.qty : 1)), 0);

              return (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <h3 className="text-[14px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 truncate max-w-[50%]">{category}</h3>
                  <div className="flex-1 border-t border-dashed border-zinc-300 dark:border-zinc-700"></div>
                  {catSubtotal > 0 && (
                     <div className="text-[14px] font-bold text-zinc-800 dark:text-zinc-200 whitespace-nowrap shrink-0">
                       R$ {catSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                     </div>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {catItems.map(item => (
                    <div 
                      key={item.id} 
                      className={`p-3.5 rounded-2xl border transition-all duration-500 geometric-bg ease-out flex gap-3 items-center ${
                        item.isBought 
                          ? 'bg-zinc-100 dark:bg-zinc-800 border-dashed border-zinc-300 dark:border-zinc-700 opacity-40 scale-[0.98]' 
                          : 'bg-soft-bg dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 shadow-sm opacity-100 scale-100'
                      }`}
                    >
                      {/* HUGE CHECK TARGET */}
                      <button 
                        onClick={() => toggleBought(item.id)} 
                        className={`w-[52px] h-[52px] shrink-0 rounded-full flex items-center justify-center transition-all ${
                          item.isBought ? 'bg-soft-bg dark:bg-zinc-900 border-none' : 'bg-transparent border-[3px] border-zinc-300 dark:border-zinc-600'
                        }`}
                      >
                        {item.isBought && <Check size={28} strokeWidth={4} className="text-white" />}
                      </button>

                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex items-start justify-between">
                          <div className={`text-[17px] font-semibold leading-tight pr-2 flex-1 min-w-0 break-words ${item.isBought ? 'line-through text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
                            {item.name}
                          </div>
                          {!item.isBought && (
                            <button type="button" onClick={() => markNotFound(item.id)} className="text-zinc-400 hover:text-red-500 p-1 shrink-0 bg-soft-bg dark:bg-zinc-800 rounded-lg" title="Não Encontrado na Prateleira">
                               <Ban size={16} />
                            </button>
                          )}
                        </div>
                        
                        {/* INPUTS ROW */}
                        <div className="flex items-center gap-2 mt-2.5" onClick={(e) => { if (item.isBought) e.stopPropagation(); }}>
                          {/* QTY */}
                          <div className={`flex items-center rounded-xl p-1 shrink-0 ${item.isBought ? 'bg-zinc-200/50 dark:bg-zinc-800' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                            {['kg', 'l'].includes(item.unit.toLowerCase()) ? (
                                <input 
                                  disabled={item.isBought}
                                  type="tel" value={getQtyDisplayValue(item.qty, item.unit)} onChange={(e) => handleQtyChange(item.id, e.target.value, item.unit)}
                                  className="w-[60px] bg-transparent text-center text-[15px] font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
                                />
                            ) : (
                              <>
                                <button type="button" disabled={item.isBought} onClick={() => updateQtyExplicit(item.id, Math.max(0, item.qty - 1))} className="p-1 text-zinc-500 active:bg-soft-bg dark:active:bg-zinc-700 rounded-lg"><Minus size={14}/></button>
                                <input 
                                  disabled={item.isBought}
                                  type="tel" value={getQtyDisplayValue(item.qty, item.unit)} onChange={(e) => handleQtyChange(item.id, e.target.value, item.unit)}
                                  className="w-6 bg-transparent text-center text-[15px] font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
                                />
                                <button type="button" disabled={item.isBought} onClick={() => updateQtyExplicit(item.id, item.qty + 1)} className="p-1 text-zinc-500 active:bg-soft-bg dark:active:bg-zinc-700 rounded-lg"><Plus size={14}/></button>
                              </>
                            )}
                            <span className="text-[10px] font-semibold text-zinc-400 uppercase pr-1">{item.unit}</span>
                          </div>

                          <div className="text-zinc-300 dark:text-zinc-600 font-semibold text-xs">×</div>

                          {/* PRICE */}
                          <div className="relative flex-1">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-zinc-400">R$</span>
                            <input 
                              disabled={item.isBought}
                              type="tel" value={getPriceDisplayValue(item.actualPrice || 0)} onChange={(e) => handlePriceInput(item.id, e.target.value)}
                              placeholder="0,00"
                              className={`w-full pl-6 pr-2 py-2 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:ring-zinc-100 text-[14px] transition-colors ${
                                item.isBought ? 'bg-transparent text-zinc-600 dark:text-zinc-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                              }`}
                            />
                          </div>
                        </div>

                        {/* PROMOTIONS DISPLAY */}
                        {!item.isBought && promotions.filter(p => normalizeStr(p.itemName) === normalizeStr(item.name)).length > 0 && (
                           <div className="mt-3 flex flex-col gap-1.5 border-t border-zinc-100 dark:border-zinc-800 pt-2">
                             {promotions
                               .filter(p => normalizeStr(p.itemName) === normalizeStr(item.name))
                               .sort((a, b) => {
                                 // Sort by shoppingMarketId first, then by price
                                 if (a.marketId === shoppingMarketId && b.marketId !== shoppingMarketId) return -1;
                                 if (b.marketId === shoppingMarketId && a.marketId !== shoppingMarketId) return 1;
                                 return (a.price / a.qty) - (b.price / b.qty);
                               })
                               .map((promo, idx) => {
                                  const market = markets.find(m => m.id === promo.marketId);
                                  const precoUnitario = promo.price / promo.qty;
                                  const isCurrentMarket = promo.marketId === shoppingMarketId;
                                  
                                  return (
                                    <div key={idx} className={`flex justify-between items-center px-2.5 py-1.5 rounded-lg border ${
                                      isCurrentMarket 
                                        ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700' 
                                        : 'bg-soft-bg dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800'
                                    }`}>
                                      <div className="flex items-center gap-1.5 overflow-hidden">
                                        <Store size={12} className={`shrink-0 ${isCurrentMarket ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-400'}`} />
                                        <span className={`text-[11px] font-bold truncate ${isCurrentMarket ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                          {market?.name || 'Mercado'}
                                        </span>
                                      </div>
                                      <div className={`text-[12px] font-bold shrink-0 ${isCurrentMarket ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                        {formatMoney(precoUnitario)}<span className={`text-[9px] font-medium ${isCurrentMarket ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-400'}`}>/{item.unit}</span>
                                      </div>
                                    </div>
                                  );
                               })
                             }
                           </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* NOT FOUND SECTION */}
        {items.filter(i => i.notFound).length > 0 && (
           <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-red-500 mb-3 px-2 flex items-center gap-2">
                 <Ban size={14} strokeWidth={3} /> Itens Não Encontrados ({items.filter(i => i.notFound).length})
              </h3>
              <div className="flex flex-wrap gap-2">
                 {items.filter(i => i.notFound).map(item => (
                    <button 
                       key={item.id} 
                       onClick={() => setItems(prevItems => prevItems.map(i => i.id === item.id ? { ...i, notFound: false } : i))}
                       className="text-[13px] font-medium max-w-full bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 px-3 py-1.5 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-2 hover:bg-red-100 transition-colors"
                    >
                       <span className="line-through opacity-70 flex-1 min-w-0 break-words text-left">{item.name}</span>
                       <Plus size={14} className="shrink-0" />
                    </button>
                 ))}
              </div>
           </div>
        )}
      </div>

      {/* FLOAT BUTTON FINALIZAR COMPRA */}
      <div className="fixed bottom-[90px] left-1/2 -translate-x-1/2 w-full max-w-md flex justify-center z-40 pointer-events-none px-4">
         <button 
            onClick={() => setShowFinishConfirm(true)}
            className="pointer-events-auto bg-soft-bg dark:bg-zinc-900 text-zinc-900 dark:text-white px-6 py-3.5 rounded-full font-bold text-[15px] shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center gap-2 hover:scale-105 transition-transform"
         >
            <ShoppingBag size={18} /> Finalizar Compra
         </button>
      </div>

      {/* CONFIRM FINISH PURCHASE MODAL */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-[110] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setShowFinishConfirm(false)}>
          <div className="bg-soft-bg dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} />
            </div>
            <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">Finalizar e Salvar?</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">Sua compra será salva no histórico e os itens do carrinho atual serão desmarcados.</p>
            <div className="flex gap-3">
               <button type="button" onClick={() => setShowFinishConfirm(false)} className="flex-1 py-3 rounded-2xl font-bold text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300">Voltar</button>
               <button type="button" onClick={finishPurchase} className="flex-1 py-3 rounded-2xl font-bold text-white bg-emerald-500 hover:bg-emerald-500/90 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white dark:text-white">Sim, Finalizar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
