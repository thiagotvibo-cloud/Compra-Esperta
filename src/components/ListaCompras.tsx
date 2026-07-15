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
          category: cat.name
        }))
      )
    );
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return flatCatalog.filter(i => i.name.toLowerCase().includes(query));
  }, [searchQuery, flatCatalog]);

  const progressPercentage = totalItems > 0 ? (boughtItems / totalItems) * 100 : 0;

  return (
    <div className="pb-28 relative">
      
      {/* HEADER AZUL COM ORÇAMENTO */}
      <div className="bg-gradient-to-b from-[#1E3A5F] to-[#0A1931] dark:from-[#0B1425] dark:to-[#050B14] rounded-b-[40px] pt-12 pb-24 px-6 text-center text-white relative shadow-lg">
         <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
            <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl px-4 py-2 font-medium text-sm flex items-center gap-2">
              <span>🗓️ Lista Atual</span> <ChevronRight size={14} className="opacity-70" />
            </div>
            <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
              <PieChart size={18} />
            </div>
         </div>
         
         <div className="mt-6 flex flex-col items-center">
            <p className="text-white/70 font-semibold text-[13px] uppercase tracking-widest mb-2">Orçamento p/ Mercado</p>
            <h1 className="text-[44px] font-bold tracking-tight leading-none mb-3">
              {formatMoney(settings.budget)}
            </h1>
            <p className="text-white/50 text-sm flex items-center gap-1">
              Progresso atual: {boughtItems} de {totalItems} itens <ChevronRight size={14} className="opacity-70" />
            </p>
         </div>
      </div>

      {/* OVERLAP SHORTCUT CARDS */}
      <div className="px-5 -mt-10 relative z-10">
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 shadow-xl shadow-black/5 border border-zinc-100 dark:border-zinc-800 flex justify-around">
          <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setShowCatalog(true)}>
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500 flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
              <BadgePlus size={22} />
            </div>
            <span className="text-[12px] font-semibold text-zinc-900 dark:text-zinc-100">Adicionar</span>
          </div>
          <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => context.setActiveTab('compras')}>
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-500 flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
              <Calculator size={22} />
            </div>
            <span className="text-[12px] font-semibold text-zinc-900 dark:text-zinc-100">Calcular</span>
          </div>
          <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={clearBought}>
             <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-500 flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
              <Check strokeWidth={3} size={22} />
            </div>
            <span className="text-[12px] font-semibold text-zinc-900 dark:text-zinc-100">Limpar</span>
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
              <div className="text-[13px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mt-2 mb-3 tracking-[1px] ml-2">
                {group.category} <span className="lowercase text-[11px] ml-1 bg-zinc-200/50 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{group.items.length}</span>
              </div>
              
              <div className="flex flex-col bg-white dark:bg-[#1C1C1E] rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-sm shadow-sm">
                {group.items.map((item, index) => (
                  <div key={item.id} className={`flex items-start gap-4 p-5 ${index !== group.items.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''}`}>
                    
                    <button 
                      onClick={() => setItems(items.map(i => i.id === item.id ? {...i, isBought: !i.isBought} : i))}
                      className={`shrink-0 mt-0.5 w-6 h-6 border-[1.5px] rounded-full flex items-center justify-center transition-all ${item.isBought ? 'bg-blue-600 border-blue-600' : 'border-zinc-300 dark:border-zinc-600'}`}
                    >
                      {item.isBought && <Check size={14} strokeWidth={3} className="text-white" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-[16px] dark:text-zinc-100 leading-snug text-wrap ${item.isBought ? 'line-through text-zinc-400 dark:text-zinc-500' : ''}`}>
                          {formatItemName(item.name)}
                        </p>
                        {context.promotions.find(p => p.itemName === item.name) && (() => {
                          const promo = context.promotions.find(p => p.itemName === item.name)!;
                          const market = context.markets.find(m => m.id === promo.marketId);
                          return (
                            <div className="text-[10px] font-semibold text-orange-500 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400 px-1.5 py-0.5 rounded mt-1 inline-block border border-orange-200 dark:border-orange-500/20 whitespace-normal text-wrap max-w-full">
                              Promoção {market ? `no ${market.name}` : ''}
                            </div>
                          );
                        })()}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-1 border border-zinc-200 dark:border-zinc-700">
                          <input
                            type="number"
                            step="0.01"
                            value={item.qty || ""}
                            onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, qty: parseFloat(e.target.value) || 0 } : i))}
                            className="w-[45px] bg-transparent text-center text-[14px] font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none"
                          />
                          <select
                            value={item.unit}
                            onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, unit: e.target.value as any } : i))}
                            className="bg-transparent text-[13px] font-medium text-zinc-500 pr-1 focus:outline-none cursor-pointer appearance-none outline-none border-none ring-0 focus:ring-0"
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
                            className="p-2 text-zinc-300 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 transition-colors"
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
            className="w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-t-[32px] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom"
            style={{ maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-white dark:bg-[#1C1C1E] z-10">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Adicionar Produto</h2>
              <button 
                onClick={() => { setShowCatalog(false); setSearchQuery(''); }} 
                className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
               >
                <X size={20} />
              </button>
            </div>
            
            <div className="px-4 pt-4 pb-2 bg-zinc-50 dark:bg-black sticky top-[73px] z-10">
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar itens..." 
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-[15px] dark:text-zinc-100 transition-colors shadow-sm"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded-full p-1">
                     <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto p-4 space-y-3 bg-zinc-50 dark:bg-black">
              {searchQuery ? (
                searchResults.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500">Nenhum produto encontrado.</div>
                ) : (
                  <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                    <h4 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400 mb-3">Resultados da Busca</h4>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleAddFromCatalog(item.name, item.category)}
                          className="px-3.5 py-2 bg-zinc-100 hover:bg-blue-50 dark:bg-zinc-800 dark:hover:bg-blue-900/30 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 text-[14px] font-medium rounded-xl transition-colors flex items-start gap-1.5 active:scale-95 text-left max-w-full"
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
                    <div key={i} className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all">
                      <button 
                        onClick={() => setExpandedCategory(isExpanded ? null : cat.name)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
                      >
                        <span className="font-medium text-zinc-900 dark:text-zinc-100 text-base flex items-center gap-3">
                          <span className="text-xl">{cat.icon}</span> {cat.name}
                        </span>
                        {isExpanded ? <ChevronUp size={20} className="text-zinc-400" /> : <ChevronDown size={20} className="text-zinc-400" />}
                      </button>
                      
                      {isExpanded && (
                        <div className="px-5 pb-4 pt-1 space-y-4">
                          {cat.subcategories.map((sub, j) => (
                            <div key={j}>
                              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">{sub.name}</h4>
                              <div className="flex flex-wrap gap-2">
                                {sub.items.map((itemName, k) => (
                                  <button
                                    key={k}
                                    onClick={() => handleAddFromCatalog(itemName, cat.name)}
                                    className="px-3.5 py-2 bg-zinc-100 hover:bg-blue-50 dark:bg-zinc-800 dark:hover:bg-blue-900/30 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 text-[14px] font-medium rounded-xl transition-colors flex items-start gap-1.5 active:scale-95 text-left max-w-full"
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

