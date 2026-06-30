import React, { useState, useMemo, useEffect } from 'react';
import { Item, Category, Unit, AppContextType } from '../types';
import { generateId, formatItemName, formatMoney } from '../utils';
import { Trash2, Check, ChevronDown, ChevronUp, Plus, X, Search, ChevronRight, Calculator, PieChart, BadgePlus, Star, Lightbulb, ExternalLink } from 'lucide-react';
import { PRODUCT_CATALOG } from '../data/catalog';
import { motion, AnimatePresence } from 'motion/react';

export const ListaCompras: React.FC<{ context: AppContextType }> = ({ context }) => {
  const { items, setItems, settings } = context;
  const [showCatalog, setShowCatalog] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tip, setTip] = useState<string | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const fetchTip = async () => {
    const essentialItems = items.filter(i => i.isEssential).map(i => i.name);
    if (essentialItems.length === 0) return;
    
    setIsLoadingTip(true);
    try {
      const response = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essentialItems })
      });
      const data = await response.json();
      if (data.tip) setTip(data.tip);
    } catch (error) {
      console.error('Failed to fetch tip:', error);
    } finally {
      setIsLoadingTip(false);
    }
  };

  useEffect(() => {
    const essentialItemsCount = items.filter(i => i.isEssential).length;
    if (essentialItemsCount > 0 && !tip && !isLoadingTip) {
      fetchTip();
    }
  }, [items]);

  const handleAddFromCatalog = (itemName: string, categoryName: string) => {
    setItems((prevItems) => {
      const normalizedItemName = itemName.trim().toLowerCase();
      const existingItem = prevItems.find(i => i.name.trim().toLowerCase() === normalizedItemName);

      if (existingItem) {
        return prevItems.filter(i => i.id !== existingItem.id);
      } else {
        const newItem: Item = {
          id: generateId(),
          name: itemName,
          qty: 1,
          unit: 'un', // Padrão
          category: categoryName as Category,
          isEssential: false,
          onlyPromo: false,
          isBought: false,
          notes: '',
          actualPrice: 0,
        };
        return [...prevItems, newItem];
      }
    });
  };

  const clearBought = () => {
    setItems(items.map(item => ({ ...item, isBought: false })));
    setShowClearConfirm(false);
  };

  const getBestOffer = (itemName: string) => {
    const promos = context.promotions.filter(p => p.itemName.toLowerCase() === itemName.toLowerCase());
    if (promos.length === 0) return null;
    return promos.reduce((prev, curr) => (prev.price < curr.price ? prev : curr));
  };

  const calculateEstimatedTotal = () => {
    let total = 0;
    const globalDefault = 12.00;
    items.forEach(item => {
      const bestOffer = getBestOffer(item.name);
      if (bestOffer) {
        total += bestOffer.price * item.qty;
      } else {
        total += globalDefault * item.qty;
      }
    });
    return total;
  };

  const calculateEconomy = () => {
    let totalWithoutOffers = 0;
    let totalWithOffers = 0;
    const globalDefault = 12.00;

    items.forEach(item => {
      const bestOffer = getBestOffer(item.name);
      if (bestOffer) {
        totalWithoutOffers += globalDefault * item.qty; // ou preço médio se houvesse, mas usarei default por enquanto
        totalWithOffers += bestOffer.price * item.qty;
      }
    });
    return Math.max(0, totalWithoutOffers - totalWithOffers);
  };

  const expectedTotal = calculateEstimatedTotal();
  const progOrçamento = settings.budget > 0 ? (expectedTotal / settings.budget) * 100 : 0;
  const progressPercent = Math.min(progOrçamento, 100);

  const normalizedItemNamesForCatalog = useMemo(() => {
    return new Set(items.map(i => i.name.trim().toLowerCase()));
  }, [items]);

  const uniqueCategories = Array.from(new Set(items.map(i => i.category)));
  const groupedItems = uniqueCategories.map(cat => ({
    category: cat || 'Sem Categoria',
    items: items.filter(i => i.category === cat).sort((a, b) => {
      if (a.isBought === b.isBought) {
        if (a.isEssential && !b.isEssential) return -1;
        if (!a.isEssential && b.isEssential) return 1;
        return a.name.localeCompare(b.name);
      }
      return a.isBought ? 1 : -1;
    })
  })).sort((a, b) => String(a.category).localeCompare(String(b.category)));

  const totalItems = items.length;
  const boughtItems = items.filter(i => i.isBought).length;

  const flatCatalog = useMemo(() => {
    return PRODUCT_CATALOG.flatMap(cat => 
      cat.subcategories.flatMap(sub => 
        sub.items.map(item => ({
          name: item,
          category: cat.name,
          searchKey: item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        }))
      )
    );
  }, []);

  const frequentItems = useMemo(() => {
    const counts: Record<string, number> = {};
    context.history.forEach(h => {
      h.items?.forEach(i => {
        const lowerName = i.nome.trim().toLowerCase();
        counts[lowerName] = (counts[lowerName] || 0) + 1;
      });
    });
    return Object.fromEntries(Object.entries(counts).filter(([_, count]) => count >= 2));
  }, [context.history]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return flatCatalog.filter(i => i.searchKey.includes(query));
  }, [searchQuery, flatCatalog]);

  const progressPercentage = totalItems > 0 ? (boughtItems / totalItems) * 100 : 0;

  return (
    <div className="pb-28 bg-soft-bg dark:bg-black min-h-screen relative">
      
      {/* HEADER MARKET PRO */}
      <div className="bg-sky-400 rounded-b-[40px] pt-[calc(env(safe-area-inset-top)+20px)] pb-14 px-6 text-center text-white shadow-primary z-10 geometric-bg">
         <div className="geometric-circle"></div>
         <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="bg-white/20 border border-white/20 backdrop-blur-md rounded-full px-4 py-2 font-semibold text-xs uppercase tracking-widest flex items-center gap-2">
              <span>Lista de Compras</span>
            </div>
            <div className="bg-white/20 border border-white/20 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
              <PieChart size={18} />
            </div>
         </div>
         
         <div className="flex flex-col items-center relative z-10">
            <p className="text-sky-50 font-semibold text-[11px] uppercase tracking-widest mb-1.5">Orçamento Planejado</p>
            <h1 className="text-[44px] font-bold tracking-tight leading-none mb-3">
              {formatMoney(settings.budget)}
            </h1>
            <div className="bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-[13px] font-semibold text-white flex items-center gap-2">
              {boughtItems} de {totalItems} itens no carrinho
            </div>
            {settings.budget > 0 && expectedTotal > 0 && (
              <div className="w-full mt-5 bg-black/10 rounded-2xl p-3 border border-white/10 text-left">
                 <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest mb-2 text-sky-100">
                    <span>Total Estimado: {formatMoney(expectedTotal)}</span>
                    <span className={progOrçamento > 100 ? 'text-red-200' : ''}>{Math.round(progOrçamento)}%</span>
                 </div>
                 <div className="h-2 rounded-full bg-black/20 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${progOrçamento > 100 ? 'bg-red-400' : 'bg-white'}`} style={{ width: `${progressPercent}%` }} />
                 </div>
                 {calculateEconomy() > 0 && (
                   <div className="mt-2 text-[11px] font-bold text-sky-100 flex items-center gap-1.5">
                     <span className="bg-green-500/20 text-green-100 px-1.5 py-0.5 rounded-md">Se comprar onde tem oferta, você poupará {formatMoney(calculateEconomy())}.</span>
                   </div>
                 )}
              </div>
            )}
         </div>
      </div>

      {/* OVERLAP SHORTCUT CARDS */}
      <div className="px-5 -mt-8 relative z-20">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 shadow-sm border border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center justify-start gap-2 cursor-pointer" onClick={() => setShowCatalog(true)}>
            <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-500 dark:bg-sky-900/30 dark:text-sky-400 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm border border-sky-100 dark:border-sky-800/30">
              <BadgePlus size={24} strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 text-center leading-tight">Adicionar</span>
          </div>
          <div className="flex flex-col items-center justify-start gap-2 cursor-pointer" onClick={() => context.setActiveTab('compras')}>
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm border border-blue-100 dark:border-blue-800/30">
              <Calculator size={24} strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 text-center leading-tight">Modo<br/>Compra</span>
          </div>
          <div className="flex flex-col items-center justify-start gap-2 cursor-pointer" onClick={() => setShowClearConfirm(true)}>
             <div className="w-14 h-14 rounded-full bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm border border-zinc-100 dark:border-zinc-700/50">
              <Check strokeWidth={3} size={24} />
            </div>
            <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 text-center leading-tight">Limpar</span>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {/* DICA DO GEMINI */}
        <AnimatePresence>
          {tip && (
            <motion.div 
               initial={{ opacity: 0, y: -20, height: 0 }}
               animate={{ opacity: 1, y: 0, height: 'auto' }}
               exit={{ opacity: 0, y: -20, height: 0 }}
               className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-2xl border border-sky-200 dark:border-sky-800 flex items-start gap-3"
            >
              <Lightbulb className="text-sky-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-[12px] font-semibold text-sky-700 dark:text-sky-400 mb-1 uppercase tracking-wider">Dica da IA</h4>
                <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-medium leading-snug">{tip}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LISTA DE ITENS */}
        <div className="overflow-y-auto">
          {items.length === 0 && (
            <div className="text-center text-zinc-500 py-12 flex flex-col items-center">
              <span className="text-5xl block mb-3 opacity-50">📋</span>
              <p className="font-semibold text-lg text-zinc-800 dark:text-zinc-200">Sua lista está vazia.</p>
              <p className="text-sm mt-1 font-medium text-zinc-500">Adicione itens para planejar a ida ao mercado.</p>
            </div>
          )}

          {groupedItems.map(group => (
            <div key={group.category} className="mb-6">
              <div className="text-[13px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mt-2 mb-3 tracking-widest pl-1">
                {group.category} <span className="lowercase text-[11px] ml-1.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">{group.items.length}</span>
              </div>
              
              <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {group.items.map((item) => (
                    <motion.div 
                      key={item.id} 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: item.isBought ? 0.6 : 1, y: 0, scale: item.isBought ? 0.98 : 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-center gap-3.5 p-3.5 rounded-2xl border ${item.isBought ? 'bg-zinc-100/50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 border-dashed' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm'}`}
                    >
                      
                      <button 
                        onClick={() => setItems(items.map(i => i.id === item.id ? {...i, isBought: !i.isBought} : i))}
                        className={`shrink-0 w-8 h-8 border-[2px] rounded-full flex items-center justify-center transition-colors ${item.isBought ? 'bg-sky-500 border-sky-500' : 'border-zinc-300 dark:border-zinc-600'}`}
                      >
                        {item.isBought && <Check size={18} strokeWidth={4} className="text-white" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                          <motion.div 
                            animate={{ color: item.isBought ? '#9ca3af' : 'var(--color-text-main)' }}
                            className={`font-semibold text-[16px] flex items-start gap-2 leading-snug ${item.isBought ? 'line-through text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}
                           >
                            <span className="min-w-0 flex-1 break-words">{formatItemName(item.name)}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setItems(items.map(i => i.id === item.id ? { ...i, isFavorite: !i.isFavorite } : i)); }}
                              className={`mt-0.5 shrink-0 transition-transform hover:scale-110 active:scale-90 ${(item.isFavorite || frequentItems[item.name.trim().toLowerCase()]) ? 'text-yellow-500' : 'text-zinc-300 hover:text-yellow-400 opacity-50 hover:opacity-100'}`}
                              title={item.isFavorite ? "Remover dos favoritos" : frequentItems[item.name.trim().toLowerCase()] ? "Frequente no seu histórico" : "Marcar como favorito"}
                            >
                              <Star size={16} className={(item.isFavorite || frequentItems[item.name.trim().toLowerCase()]) ? 'fill-yellow-500' : ''} strokeWidth={(item.isFavorite || frequentItems[item.name.trim().toLowerCase()]) ? 0 : 2} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setItems(items.map(i => i.id === item.id ? { ...i, isEssential: !i.isEssential } : i)); }}
                              className={`mt-0.5 shrink-0 transition-transform hover:scale-110 active:scale-90 ${item.isEssential ? 'text-amber-500' : 'text-zinc-300 hover:text-amber-400 opacity-50 hover:opacity-100'}`}
                              title={item.isEssential ? "Remover prioridade" : "Marcar como prioridade"}
                            >
                              <ExternalLink size={16} className={item.isEssential ? 'text-amber-500' : ''} strokeWidth={2} />
                            </button>
                          </motion.div>
                          {getBestOffer(item.name) && (() => {
                            const promo = getBestOffer(item.name)!;
                            const market = context.markets.find(m => m.id === promo.marketId);
                            return (
                              <div className="text-[11px] font-semibold text-green-700 bg-green-100 dark:bg-green-500/20 dark:text-green-400 px-2 py-0.5 rounded-[12px] mt-1 inline-block border-none whitespace-normal text-wrap max-w-full">
                                <span>Melhor: {formatMoney(promo.price)} {market ? `no ${market.name}` : ''}</span>
                              </div>
                            );
                          })()}
                      </div>
  
                      <div className="flex items-center gap-1.5 shrink-0">
                          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-xl px-1.5 py-1">
                            <input
                              type="number"
                              step="0.01"
                              value={item.qty || ""}
                              onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, qty: parseFloat(e.target.value) || 0 } : i))}
                              className="w-[36px] bg-transparent text-center text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none placeholder-zinc-400"
                            />
                            <select
                              value={item.unit}
                              onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, unit: e.target.value as any } : i))}
                              className="bg-transparent text-[12px] font-semibold text-zinc-500 pr-0.5 focus:outline-none cursor-pointer appearance-none uppercase"
                              style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                            >
                              <option value="un">un</option>
                              <option value="kg">kg</option>
                              <option value="g">g</option>
                              <option value="L">L</option>
                              <option value="ml">ml</option>
                              <option value="pct">pct</option>
                            </select>
                          </div>
                          <button 
                              onClick={() => setItems(items.filter(i => i.id !== item.id))}
                              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                          >
                              <Trash2 size={18} />
                          </button>
                      </div>
  
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CLEAR CONFIRM MODAL */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[110] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setShowClearConfirm(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Opções de Limpeza</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-[14px]">O que você deseja fazer?</p>
            <div className="flex flex-col gap-3">
               <button 
                 onClick={() => { clearBought(); setShowClearConfirm(false); }} 
                 className="w-full py-3.5 rounded-2xl font-bold text-white bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all shadow-sm"
               >
                 Desmarcar Itens (Limpar Carrinho)
               </button>
               <button 
                 onClick={() => { setItems([]); setShowClearConfirm(false); }} 
                 className="w-full py-3.5 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 active:scale-95 transition-all shadow-sm"
               >
                 Apagar Tudo (Limpar Lista)
               </button>
               <button 
                 onClick={() => setShowClearConfirm(false)} 
                 className="w-full py-3.5 mt-2 rounded-2xl font-bold text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 active:scale-95 transition-all"
               >
                 Cancelar
               </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BOTTOM SHEET DO CATÁLOGO HIDDEN */}
      {showCatalog && (
        <div className="fixed inset-0 z-[100] flex justify-center items-end bg-black/40 backdrop-blur-[2px] animate-in fade-in" onClick={() => setShowCatalog(false)}>
          <div 
            className="w-full max-w-lg bg-soft-bg dark:bg-[#1C1C1E] rounded-t-[32px] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom border-none"
            style={{ maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-soft-bg dark:bg-[#1C1C1E] z-10">
              <h2 className="text-lg font-semibold text-soft-text-main dark:text-zinc-100 tracking-tight">Adicionar Produto</h2>
              <button 
                onClick={() => { setShowCatalog(false); setSearchQuery(''); }} 
                className="p-2 bg-soft-card dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-soft-text-main dark:hover:text-zinc-200 transition-colors flex items-center justify-center -mr-2"
               >
                <ChevronDown size={24} />
              </button>
            </div>
            
            <div className="px-4 pt-4 pb-2 bg-soft-bg dark:bg-[#1C1C1E] sticky top-[73px] z-10">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar itens..." 
                  className="w-full pl-11 pr-4 py-4 bg-soft-card dark:bg-zinc-800 border-none rounded-[20px] focus:outline-none focus:ring-2 focus:ring-soft-primary text-[15px] dark:text-zinc-100 transition-colors placeholder-zinc-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-soft-primary dark:hover:text-zinc-200 bg-soft-bg dark:bg-zinc-700 rounded-full p-1.5">
                     <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto p-4 space-y-4 bg-soft-bg dark:bg-[#1C1C1E]">
              {searchQuery ? (
                searchResults.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500">Nenhum produto encontrado.</div>
                ) : (
                  <div className="bg-soft-card dark:bg-[#1C1C1E] rounded-[24px] border-none p-5">
                    <h4 className="text-[12px] font-semibold uppercase tracking-wider text-soft-text-muted mb-4">Resultados da Busca</h4>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.map((item, index) => {
                        const isAdded = normalizedItemNamesForCatalog.has(item.name.trim().toLowerCase());
                        return (
                          <button
                            key={index}
                            onClick={() => handleAddFromCatalog(item.name, item.category)}
                            className={`px-4 py-2 text-[14px] font-medium rounded-full transition-colors flex items-start gap-1.5 active:scale-95 text-left max-w-full border ${isAdded ? 'bg-soft-primary text-white border-soft-primary shadow-sm' : 'bg-soft-bg hover:bg-soft-primary-light dark:bg-zinc-800 dark:hover:bg-soft-primary/20 text-soft-text-muted dark:text-zinc-300 hover:text-soft-primary dark:hover:text-soft-primary border-zinc-100 dark:border-none'}`}
                          >
                            {isAdded ? <Check size={14} strokeWidth={3} className="shrink-0 mt-0.5 text-white" /> : <Plus size={14} className="opacity-50 shrink-0 mt-0.5" />} 
                            <span className="leading-snug break-words">{formatItemName(item.name)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
              ) : (
                PRODUCT_CATALOG.map((cat, i) => {
                  const isExpanded = expandedCategory === cat.name;
                  return (
                    <div key={i} className="bg-soft-card dark:bg-[#1C1C1E] rounded-[24px] border-none overflow-hidden transition-all shadow-sm">
                      <button 
                        onClick={() => setExpandedCategory(isExpanded ? null : cat.name)}
                        className="w-full px-5 py-5 flex items-center justify-between text-left focus:outline-none"
                      >
                        <span className="font-semibold text-soft-text-main dark:text-zinc-100 text-[15px] flex items-center gap-3">
                          <span className="text-xl">{cat.icon}</span> {cat.name}
                        </span>
                        {isExpanded ? <ChevronUp size={20} className="text-zinc-400" /> : <ChevronDown size={20} className="text-zinc-400" />}
                      </button>
                      
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-0 space-y-4 border-t border-zinc-100/50 dark:border-zinc-800">
                          {cat.subcategories.map((sub, j) => (
                            <div key={j} className="pt-2">
                              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-soft-text-muted mb-3">{sub.name}</h4>
                              <div className="flex flex-wrap gap-2">
                                {sub.items.map((itemName, k) => {
                                  const isAdded = normalizedItemNamesForCatalog.has(itemName.trim().toLowerCase());
                                  return (
                                    <button
                                      key={k}
                                      onClick={() => handleAddFromCatalog(itemName, cat.name)}
                                      className={`px-4 py-2 text-[14px] font-medium rounded-full transition-colors flex items-start gap-1.5 active:scale-95 text-left max-w-full border ${isAdded ? 'bg-soft-primary text-white border-soft-primary shadow-sm' : 'bg-soft-bg hover:bg-soft-primary-light dark:bg-zinc-800 dark:hover:bg-soft-primary/20 text-soft-text-muted dark:text-zinc-300 hover:text-soft-primary dark:hover:text-soft-primary border-zinc-100 dark:border-none'}`}
                                    >
                                      {isAdded ? <Check size={14} strokeWidth={3} className="shrink-0 mt-0.5 text-white" /> : <Plus size={14} className="opacity-50 shrink-0 mt-0.5" />} 
                                      <span className="leading-snug text-wrap">{formatItemName(itemName)}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

