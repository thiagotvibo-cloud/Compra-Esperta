import React, { useState, useMemo } from 'react';
import { Item, Category, Unit, AppContextType } from '../types';
import { generateId, formatItemName, formatMoney } from '../utils';
import { Trash2, Check, ChevronDown, ChevronUp, Plus, X, Search, ChevronRight, Calculator, PieChart, BadgePlus } from 'lucide-react';
import { PRODUCT_CATALOG } from '../data/catalog';



export const ListaCompras: React.FC<{ context: AppContextType }> = ({ context }) => {
  const { items, setItems, settings } = context;
  const [showCatalog, setShowCatalog] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddFromCatalog = (itemName: string, categoryName: string) => {
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
    setItems([...items, newItem]);
    setShowCatalog(false);
    setSearchQuery('');
  };

  const clearBought = () => {
    if (window.confirm("Deseja limpar todos os itens comprados da lista?")) {
      setItems(items.filter(item => !item.isBought));
    }
  };

  const uniqueCategories = Array.from(new Set(items.map(i => i.category)));
  const groupedItems = uniqueCategories.map(cat => ({
    category: cat || 'Sem Categoria',
    items: items.filter(i => i.category === cat)
  })).sort((a, b) => (a.category || '').localeCompare(b.category || '')); // Optional sorting

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

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return flatCatalog.filter(i => i.searchKey.includes(query));
  }, [searchQuery, flatCatalog]);

  const progressPercentage = totalItems > 0 ? (boughtItems / totalItems) * 100 : 0;

  return (
    <div className="pb-28 relative">
      
      {/* HEADER SOFT UI */}
      <div className="bg-soft-primary rounded-b-[40px] pt-[calc(env(safe-area-inset-top)+32px)] pb-24 px-6 text-center text-white relative shadow-soft">
         <div className="absolute top-[calc(env(safe-area-inset-top)+16px)] left-6 right-6 flex justify-between items-center">
            <div className="bg-white/20 border border-white/20 backdrop-blur-md rounded-full px-5 py-2.5 font-medium text-sm flex items-center gap-2">
              <span>🗓️ Lista Atual</span> <ChevronRight size={14} className="opacity-70" />
            </div>
            <div className="bg-white/20 border border-white/20 backdrop-blur-md rounded-full w-11 h-11 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
              <PieChart size={18} />
            </div>
         </div>
         
         <div className="mt-8 flex flex-col items-center">
            <p className="text-white/80 font-medium text-[13px] uppercase tracking-widest mb-2">Orçamento p/ Mercado</p>
            <h1 className="text-[44px] font-semibold tracking-tight leading-none mb-3">
              {formatMoney(settings.budget)}
            </h1>
            <p className="text-white/70 text-sm flex items-center gap-1 font-medium">
              Progresso atual: {boughtItems} de {totalItems} itens <ChevronRight size={14} className="opacity-70" />
            </p>
         </div>
      </div>

      {/* OVERLAP SHORTCUT CARDS */}
      <div className="px-5 -mt-10 relative z-10">
        <div className="bg-soft-bg dark:bg-zinc-800 rounded-[24px] p-6 shadow-soft flex justify-around border-none">
          <div className="flex flex-col items-center gap-3 cursor-pointer" onClick={() => setShowCatalog(true)}>
            <div className="w-14 h-14 rounded-full bg-soft-primary-light text-soft-primary dark:bg-soft-primary/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm">
              <BadgePlus size={24} />
            </div>
            <span className="text-[13px] font-medium text-soft-text-main dark:text-zinc-100">Adicionar</span>
          </div>
          <div className="flex flex-col items-center gap-3 cursor-pointer" onClick={() => context.setActiveTab('compras')}>
            <div className="w-14 h-14 rounded-full bg-soft-card text-blue-400 dark:bg-blue-900/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm">
              <Calculator size={24} />
            </div>
            <span className="text-[13px] font-medium text-soft-text-main dark:text-zinc-100">Calcular</span>
          </div>
          <div className="flex flex-col items-center gap-3 cursor-pointer" onClick={clearBought}>
             <div className="w-14 h-14 rounded-full bg-soft-card text-green-400 dark:bg-green-900/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm">
              <Check strokeWidth={3} size={24} />
            </div>
            <span className="text-[13px] font-medium text-soft-text-main dark:text-zinc-100">Limpar</span>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6 mt-8 space-y-6">
        {/* LISTA DE ITENS */}
        <div className="overflow-y-auto">
          {items.length === 0 && (
            <div className="text-center text-zinc-500 py-12 flex flex-col items-center">
              <span className="text-5xl block mb-3 opacity-50">📋</span>
              <p className="font-medium text-lg text-zinc-700 dark:text-zinc-300">Sua lista está vazia.</p>
              <p className="text-sm mt-1">Toque no atalho "Adicionar" acima.</p>
            </div>
          )}

          {groupedItems.map(group => (
            <div key={group.category} className="mb-6">
              <div className="text-[14px] font-semibold text-soft-text-muted dark:text-zinc-500 uppercase mt-2 mb-3 tracking-[1px] ml-2">
                {group.category} <span className="lowercase text-[12px] ml-1 bg-soft-card dark:bg-zinc-800 px-2 py-0.5 rounded-full">{group.items.length}</span>
              </div>
              
              <div className="flex flex-col gap-4">
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-5 bg-soft-bg dark:bg-zinc-800 rounded-[20px] shadow-soft border-none">
                    
                    <button 
                      onClick={() => setItems(items.map(i => i.id === item.id ? {...i, isBought: !i.isBought} : i))}
                      className={`shrink-0 w-6 h-6 border-[2px] rounded-full flex items-center justify-center transition-all ${item.isBought ? 'bg-soft-primary border-soft-primary' : 'border-zinc-300 dark:border-zinc-500'}`}
                    >
                      {item.isBought && <Check size={14} strokeWidth={3} className="text-white" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-[16px] dark:text-zinc-100 leading-snug text-wrap ${item.isBought ? 'line-through text-soft-text-muted dark:text-zinc-500' : 'text-soft-text-main'}`}>
                          {formatItemName(item.name)}
                        </p>
                        {context.promotions.find(p => p.itemName === item.name) && (() => {
                          const promo = context.promotions.find(p => p.itemName === item.name)!;
                          const market = context.markets.find(m => m.id === promo.marketId);
                          return (
                            <div className="text-[11px] font-medium text-soft-primary bg-soft-primary-light dark:bg-soft-primary/10 dark:text-soft-primary px-2 py-0.5 rounded-full mt-1 inline-block border-none whitespace-normal text-wrap max-w-full">
                              Promoção {market ? `no ${market.name}` : ''}
                            </div>
                          );
                        })()}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-soft-card dark:bg-zinc-700/50 rounded-full px-2 py-1.5 border-none">
                          <input
                            type="number"
                            step="0.01"
                            value={item.qty || ""}
                            onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, qty: parseFloat(e.target.value) || 0 } : i))}
                            className="w-[40px] bg-transparent text-center text-[15px] font-semibold text-soft-text-main dark:text-zinc-100 focus:outline-none placeholder-zinc-300"
                          />
                          <select
                            value={item.unit}
                            onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, unit: e.target.value as any } : i))}
                            className="bg-transparent text-[13px] font-medium text-soft-text-muted pr-1 focus:outline-none cursor-pointer appearance-none outline-none border-none ring-0 focus:ring-0"
                            style={{ WebkitAppearance: 'none', MozAppearance: 'none', background: 'transparent' }}
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
                            className="p-1.5 text-zinc-300 hover:text-red-400 dark:text-zinc-600 dark:hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

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
                className="p-2 bg-soft-card dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-soft-text-main dark:hover:text-zinc-200 transition-colors"
               >
                <X size={20} />
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
                      {searchResults.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleAddFromCatalog(item.name, item.category)}
                          className="px-4 py-2 bg-soft-bg hover:bg-soft-primary-light dark:bg-zinc-800 dark:hover:bg-soft-primary/20 text-soft-text-muted dark:text-zinc-300 hover:text-soft-primary dark:hover:text-soft-primary text-[14px] font-medium rounded-full transition-colors flex items-start gap-1.5 active:scale-95 text-left max-w-full border border-zinc-100 dark:border-none"
                        >
                          <Plus size={14} className="opacity-50 shrink-0 mt-0.5" /> <span className="leading-snug text-wrap">{formatItemName(item.name)}</span>
                        </button>
                      ))}
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
                                {sub.items.map((itemName, k) => (
                                  <button
                                    key={k}
                                    onClick={() => handleAddFromCatalog(itemName, cat.name)}
                                    className="px-4 py-2 bg-soft-bg hover:bg-soft-primary-light dark:bg-zinc-800 dark:hover:bg-soft-primary/20 text-soft-text-muted dark:text-zinc-300 hover:text-soft-primary dark:hover:text-soft-primary text-[14px] font-medium rounded-full transition-colors flex items-start gap-1.5 active:scale-95 text-left max-w-full border border-zinc-100 dark:border-none"
                                  >
                                    <Plus size={14} className="opacity-50 shrink-0 mt-0.5" /> <span className="leading-snug text-wrap">{formatItemName(itemName)}</span>
                                  </button>
                                ))}
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

