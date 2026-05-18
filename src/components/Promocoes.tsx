import React, { useState, useMemo } from 'react';
import { Market, Promotion, Unit, AppContextType } from '../types';
import { generateId, formatMoney, getPricePerBaseUnit, convertToBaseUnit, formatItemName } from '../utils';
import { Store, Plus, Calendar, Trash2, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { PRODUCT_CATALOG } from '../data/catalog';

const UNITS: Unit[] = ['un', 'kg', 'g', 'L', 'ml', 'pct'];

export const Promocoes: React.FC<{ context: AppContextType }> = ({ context }) => {
  const { markets, setMarkets, promotions, setPromotions } = context;
  
  const [selectedMarket, setSelectedMarket] = useState<string>(markets[0]?.id || '');
  const [newMarketName, setNewMarketName] = useState('');
  
  // States para nova promoção
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [qty, setQty] = useState<number>(1);
  const [unit, setUnit] = useState<Unit>('un');
  const [expiryDate, setExpiryDate] = useState('');

  // States para o modal de catálogo
  const [showCatalog, setShowCatalog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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

  const handlePriceInput = (inputValue: string) => {
    const numericStr = inputValue.replace(/\D/g, '');
    if (!numericStr) {
      setPrice(0);
      return;
    }
    const newPrice = parseInt(numericStr, 10) / 100;
    setPrice(newPrice);
  };

  const getPriceDisplayValue = (val: number) => {
    if (!val) return '';
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleAddFromCatalog = (name: string) => {
    setItemName(name);
    setShowCatalog(false);
    setSearchQuery('');
  };

  const handleAddMarket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarketName.trim()) return;
    const newMarket: Market = { id: generateId(), name: newMarketName.trim() };
    setMarkets([...markets, newMarket]);
    setSelectedMarket(newMarket.id);
    setNewMarketName('');
  };

  const handleAddPromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || price <= 0 || !selectedMarket) return;

    const newPromo: Promotion = {
      id: generateId(),
      marketId: selectedMarket,
      itemName: itemName.trim(),
      price,
      qty,
      unit,
      expiryDate,
      notes: ''
    };

    setPromotions([newPromo, ...promotions]);
    setItemName('');
    setPrice(0);
    setQty(1);
    // expiry mantém caso ele esteja encartando promoções da mesma data
  };

  const removeMarket = (id: string) => {
    if (window.confirm('Excluir este mercado e TODAS as suas promoções?')) {
      setMarkets(markets.filter(m => m.id !== id));
      setPromotions(promotions.filter(p => p.marketId !== id));
      if (selectedMarket === id) setSelectedMarket('');
    }
  };

  const marketPromos = promotions.filter(p => p.marketId === selectedMarket);

  return (
    <div className="pb-24 p-4 lg:p-6 space-y-6">

      <section className="bg-soft-bg dark:bg-zinc-900 rounded-[24px] shadow-soft border-none p-5 lg:p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[14px] font-semibold uppercase tracking-[1px] text-soft-text-muted flex items-center gap-2">
              <span>🏷️</span> Promoções e Mercados
            </h2>
          </div>

        {/* SELETOR DE MERCADO */}
        <div className="bg-soft-card dark:bg-zinc-800 p-6 rounded-[24px] mb-6 border-none">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-soft-text-muted flex items-center gap-2">
            <Store size={16} /> Selecione ou Adicione um Mercado
          </label>
          
          <div className="flex gap-2">
            <select 
              value={selectedMarket} 
              onChange={e => setSelectedMarket(e.target.value)}
              className="flex-1 p-3 bg-soft-bg dark:bg-zinc-700/50 border-none rounded-[20px] font-medium focus:outline-none focus:ring-2 focus:ring-soft-primary"
            >
              <option value="" disabled>-- Escolha um mercado --</option>
              {markets.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            
            {selectedMarket && (
              <button onClick={() => removeMarket(selectedMarket)} className="p-3 text-red-400 bg-soft-bg dark:bg-zinc-700/50 border-none hover:bg-red-50 rounded-[20px] transition-colors">
                <Trash2 size={20} />
              </button>
            )}
          </div>

          <form onSubmit={handleAddMarket} className="mt-3 flex gap-2">
            <input 
              type="text" 
              value={newMarketName} 
              onChange={e => setNewMarketName(e.target.value)} 
              placeholder="Novo mercado (ex: Extra)"
              className="flex-1 p-3 text-sm bg-soft-bg dark:bg-zinc-700/50 border-none rounded-[20px] focus:outline-none focus:ring-2 focus:ring-soft-primary placeholder-zinc-300"
            />
            <button type="submit" className="bg-soft-primary hover:bg-soft-primary-hover transition-colors text-white px-5 rounded-full font-semibold text-sm active:scale-95 shadow-primary">Criar</button>
          </form>
        </div>

        {/* CADASTRAR PROMOÇÃO */}
        {selectedMarket ? (
          <div className="bg-soft-card dark:bg-zinc-800 p-6 rounded-[24px] border-none mb-6 shadow-sm">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-soft-primary mb-4 flex flex-row items-center gap-2">
              <Plus size={16} /> Adicionar Nova Promoção
            </h3>
            <form onSubmit={handleAddPromotion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-soft-text-muted">Produto</label>
                <div 
                  onClick={() => setShowCatalog(true)}
                  className={`w-full p-4 bg-soft-bg dark:bg-zinc-700/50 border-none rounded-[20px] cursor-pointer ${itemName ? 'text-soft-text-main dark:text-zinc-100' : 'text-zinc-400'}`}
                >
                  {itemName || "Selecionar produto..."}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-soft-text-muted">Preço Ofertado (R$)</label>
                  <input type="tel" value={getPriceDisplayValue(price)} onChange={e => handlePriceInput(e.target.value)} placeholder="0,00" className="w-full p-4 bg-soft-bg dark:bg-zinc-700/50 border-none rounded-[20px] font-semibold text-soft-primary focus:outline-none focus:ring-2 focus:ring-soft-primary" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-soft-text-muted">Por (Qtd / Un)</label>
                  <div className="flex gap-1">
                    <input type="number" step="0.01" min="0" value={qty} onChange={e => setQty(Number(e.target.value))} className="w-1/2 p-4 bg-soft-bg dark:bg-zinc-700/50 border-none rounded-[20px] focus:outline-none focus:ring-2 focus:ring-soft-primary font-semibold text-soft-text-main" required />
                    <select value={unit} onChange={e => setUnit(e.target.value as Unit)} className="w-1/2 p-4 bg-soft-bg dark:bg-zinc-700/50 border-none rounded-[20px] focus:outline-none focus:ring-2 focus:ring-soft-primary font-semibold text-soft-text-muted">
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-soft-text-muted">Válido Até (opcional)</label>
                <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full p-4 bg-soft-bg dark:bg-zinc-700/50 border-none rounded-[20px] focus:outline-none focus:ring-2 focus:ring-soft-primary font-medium text-soft-text-main" />
              </div>

              <button type="submit" className="w-full bg-soft-primary hover:bg-soft-primary-hover text-white p-4 pt-4 mt-2 rounded-full font-semibold text-lg transition-transform active:scale-95 shadow-primary">
                Salvar Promoção
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center text-zinc-400 pt-8 pb-8 flex flex-col items-center bg-soft-card dark:bg-[#1C1C1E] rounded-[24px]">
            <Store size={48} className="opacity-20 mb-3" />
            <p>Selecione ou adicione um mercado primeiro.</p>
          </div>
        )}

        {/* LISTA DE PROMOÇÕES DO MERCADO */}
        {selectedMarket && marketPromos.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-soft-text-muted mb-3 ml-2">Ofertas Salvas em {markets.find(m=>m.id===selectedMarket)?.name}</h3>
            {marketPromos.map(promo => {
              const base = convertToBaseUnit(promo.qty, promo.unit);
              const pricePerBase = getPricePerBaseUnit(promo.price, promo.qty, promo.unit);
              
              return (
                <div key={promo.id} className="bg-soft-card dark:bg-zinc-800 p-5 rounded-[24px] shadow-sm flex justify-between items-center gap-4 transition-all">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[16px] dark:text-zinc-100 leading-snug text-wrap text-soft-text-main">{formatItemName(promo.itemName)}</h4>
                    <div className="text-soft-primary font-semibold text-[20px] my-0.5">{formatMoney(promo.price)}</div>
                    <div className="flex gap-2 text-[11px] text-soft-text-muted font-semibold uppercase tracking-wide mt-2 flex-wrap">
                      <span className="bg-soft-bg dark:bg-zinc-700 py-1 px-3 rounded-full">Por: {promo.qty} {promo.unit}</span>
                      {base.qty !== 1 && (
                        <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 py-1 px-3 rounded-full border border-amber-100 dark:border-none">
                          Equivale a {formatMoney(pricePerBase)} / {base.unit}
                        </span>
                      )}
                    </div>
                    {promo.expiryDate && (
                      <div className="text-[11px] font-semibold text-red-400 mt-2 flex items-center gap-1.5 opacity-90">
                        <Calendar size={12} /> ATÉ {new Date(promo.expiryDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </div>
                    )}
                  </div>
                  
                  <button onClick={() => setPromotions(promotions.filter(p => p.id !== promo.id))} className="text-zinc-400 hover:text-red-400 p-2.5 bg-soft-bg dark:bg-zinc-700 rounded-full">
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL BOTTOM SHEET DO CATÁLOGO HIDDEN */}
      {showCatalog && (
        <div className="fixed inset-0 z-[100] flex justify-center items-end bg-black/40 backdrop-blur-[2px] animate-in fade-in" onClick={() => setShowCatalog(false)}>
          <div 
            className="w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-t-[32px] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom"
            style={{ maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-white dark:bg-[#1C1C1E] z-10">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Selecionar Produto</h2>
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
                          onClick={() => handleAddFromCatalog(item.name)}
                          className="px-3.5 py-2 bg-zinc-100 hover:bg-blue-50 dark:bg-zinc-800 dark:hover:bg-blue-900/30 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 text-[14px] font-medium rounded-xl transition-colors flex items-center gap-1 active:scale-95"
                        >
                          <Plus size={14} className="opacity-50" /> {item.name}
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
                                    onClick={() => handleAddFromCatalog(itemName)}
                                    className="px-3.5 py-2 bg-zinc-100 hover:bg-blue-50 dark:bg-zinc-800 dark:hover:bg-blue-900/30 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 text-[14px] font-medium rounded-xl transition-colors flex items-center gap-1 active:scale-95"
                                  >
                                    <Plus size={14} className="opacity-50" /> {itemName}
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
