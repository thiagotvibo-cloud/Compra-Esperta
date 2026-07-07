import React, { useState, useMemo } from 'react';
import { Market, Promotion, Unit, AppContextType } from '../types';
import { generateId, formatMoney, getPricePerBaseUnit, convertToBaseUnit, formatItemName, normalizeStr } from '../utils';
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
  const [qty, setQty] = useState<number | string>(1);
  const [unit, setUnit] = useState<Unit>('un');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedPromos, setAnalyzedPromos] = useState<{produto: string, preco: number, por: number, unidade: string}[]>([]);
  const [pasteMarketId, setPasteMarketId] = useState<string>('');

  // States para o modal de catálogo
  const [showCatalog, setShowCatalog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Filtro
  const [promoFilter, setPromoFilter] = useState<'on_list' | 'all' | 'today' | 'tomorrow'>('on_list');

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

    if (editingPromoId) {
      setPromotions(promotions.map(p => p.id === editingPromoId ? {
        ...p,
        marketId: selectedMarket,
        itemName: itemName.trim(),
        price,
        qty: Number(qty) || 1,
        unit,
        expiryDate,
        notes: notes.trim()
      } : p));
      setEditingPromoId(null);
    } else {
      const newPromo: Promotion = {
        id: generateId(),
        marketId: selectedMarket,
        itemName: itemName.trim(),
        price,
        qty: Number(qty) || 1,
        unit,
        expiryDate,
        notes: notes.trim()
      };
      setPromotions([newPromo, ...promotions]);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }

    setItemName('');
    setPrice(0);
    setQty(1);
    setNotes('');
    setExpiryDate('');
  };

  const handleEditPromo = (promo: Promotion) => {
    setEditingPromoId(promo.id);
    setSelectedMarket(promo.marketId);
    setItemName(promo.itemName);
    setPrice(promo.price);
    setQty(promo.qty);
    setUnit(promo.unit);
    setExpiryDate(promo.expiryDate || '');
    setNotes(promo.notes || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingPromoId(null);
    setItemName('');
    setPrice(0);
    setQty(1);
    setNotes('');
    setExpiryDate('');
  };

  const removeMarket = (id: string) => {
    setMarkets(markets.filter(m => m.id !== id));
    setPromotions(promotions.filter(p => p.marketId !== id));
    if (selectedMarket === id) setSelectedMarket('');
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const handleAnalyzeText = async () => {
    if (!pasteText.trim()) return;
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      alert("Chave VITE_GEMINI_API_KEY não configurada.");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalyzedPromos([]);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
             parts: [{
                text: "Você é um extrator de dados de promoções de supermercado. Analise o texto e identifique todos os produtos com preço. Retorne SOMENTE um array JSON válido, sem markdown, sem texto extra. Formato obrigatório por item: {\"produto\": \"string\", \"preco\": number, \"por\": number, \"unidade\": \"string (kg|g|L|ml|un|pct)\"}. Se não encontrar nenhum produto claro, retorne []."
             }]
          },
          contents: [{
            parts: [{ text: pasteText }]
          }]
        })
      });
      const data = await response.json();
      const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (txt) {
         try {
            const parsed = JSON.parse(txt);
            if (Array.isArray(parsed) && parsed.length > 0) {
               setAnalyzedPromos(parsed);
            } else {
               alert("Não encontrei promoções no texto. Tente escrever de outra forma.");
            }
         } catch(e) {
            alert("Não encontrei promoções no texto. Tente escrever de outra forma.");
         }
      } else {
         alert("Não encontrei promoções no texto. Tente escrever de outra forma.");
      }
    } catch (e) {
       alert("Erro ao conectar com a API.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAnalyzed = () => {
    if (!pasteMarketId) { alert("Selecione um mercado!"); return; }
    
    const newPromos: Promotion[] = analyzedPromos.map(item => ({
      id: generateId(),
      marketId: pasteMarketId,
      itemName: item.produto,
      price: item.preco,
      qty: item.por || 1,
      unit: item.unidade as Unit,
      expiryDate: '',
      notes: 'Importado por IA'
    }));

    setPromotions([...newPromos, ...promotions]);
    setShowPasteModal(false);
    setPasteText('');
    setAnalyzedPromos([]);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const filteredPromos = useMemo(() => {
    return promotions.filter(p => {
       if (promoFilter === 'on_list') {
         return context.items.some(item => normalizeStr(item.name) === normalizeStr(p.itemName));
       }
       if (promoFilter === 'today') return p.expiryDate === todayStr;
       if (promoFilter === 'tomorrow') return p.expiryDate === tomorrowStr;
       return true;
    });
  }, [promotions, promoFilter, todayStr, tomorrowStr, context.items]);

  return (
    <div className="pb-28 bg-[#f0f4f9] dark:bg-[#1e1e20] h-full">
      
      {/* HEADER */}
      <div className="bg-[#f0f4f9] dark:bg-[#1e1e20] rounded-b-[40px] pt-[calc(env(safe-area-inset-top)+32px)] pb-20 px-6 text-zinc-900 dark:text-white shadow-primary z-10 geometric-bg relative">
         <div className="flex justify-between items-center relative z-10">
            <h2 className="text-[24px] font-bold tracking-tight flex items-center gap-2">
              Ofertas & Mercados
            </h2>
            <button onClick={() => setShowPasteModal(true)} className="bg-white/20 text-zinc-900 dark:text-white border border-white/30 px-3 py-1.5 rounded-full text-[12px] font-semibold flex items-center gap-1.5 backdrop-blur-md">
              📋 Colar texto
            </button>
         </div>
         <p className="text-zinc-400 dark:text-zinc-500 mt-2 text-[13px] font-medium relative z-10 pr-10 mb-5">
           Gerencie as ofertas que encontrou e organize por supermercado.
         </p>
      </div>

      <div className="px-4 lg:px-6 -mt-10 relative z-20">
        {/* SELETOR DE MERCADO */}
        <div className="bg-[#f0f4f9] dark:bg-[#1e1e20] p-5 rounded-3xl mb-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <label className="block text-[12px] font-semibold uppercase tracking-wider mb-3 text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <Store size={18} className="text-zinc-800 dark:text-zinc-200" /> Selecione o Mercado
          </label>
        
        <div className="flex gap-2">
          <select 
            value={selectedMarket} 
            onChange={e => setSelectedMarket(e.target.value)}
            className="flex-1 px-4 py-3.5 bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:ring-zinc-100 shadow-inner appearance-none"
          >
            <option value="" disabled>-- Escolha um mercado --</option>
            {markets.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          
          {selectedMarket && (
            <button onClick={() => removeMarket(selectedMarket)} className="p-3.5 text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-none hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-2xl transition-colors">
              <Trash2 size={22} />
            </button>
          )}
        </div>

        <form onSubmit={handleAddMarket} className="mt-3 flex gap-2">
          <input 
            type="text" 
            value={newMarketName} 
            onChange={e => setNewMarketName(e.target.value)} 
            placeholder="Novo mercado (ex: Extra)"
            className="flex-1 min-w-0 px-4 py-3.5 bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:ring-zinc-100 placeholder-zinc-400 font-medium"
          />
          <button type="submit" className="shrink-0 bg-[#0b57d0] hover:bg-[#0b57d0]/90 dark:bg-[#a8c7fa] dark:hover:bg-[#a8c7fa]/90 transition-colors text-white dark:text-[#062e6f] px-5 py-3.5 rounded-2xl font-semibold active:scale-95 shadow-sm">Criar</button>
        </form>
      </div>

      {/* CADASTRAR/EDITAR PROMOÇÃO */}
      {selectedMarket ? (
        <div className="bg-[#f0f4f9] dark:bg-[#1e1e20] p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 mb-6 shadow-sm">
          <h3 className="text-[13px] font-bold uppercase tracking-wide text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
            <Plus size={18} strokeWidth={3} /> {editingPromoId ? 'Editar Oferta' : 'Adicionar Nova Oferta'}
          </h3>
          <form onSubmit={handleAddPromotion} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5 text-zinc-500">Produto</label>
              <div 
                onClick={() => setShowCatalog(true)}
                className={`w-full px-4 py-3.5 bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl cursor-pointer font-semibold ${itemName ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-400'}`}
              >
                {itemName || "Selecionar produto..."}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5 text-zinc-500">Preço (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-zinc-400">R$</span>
                  <input type="tel" value={getPriceDisplayValue(price)} onChange={e => handlePriceInput(e.target.value)} placeholder="0,00" className="w-full pl-9 pr-4 py-3.5 bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl font-bold text-[16px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:ring-zinc-100" required />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5 text-zinc-500">Por (Qtd / Un)</label>
                <div className="flex gap-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-zinc-900 dark:ring-zinc-100">
                  <input type="number" step="0.01" min="0" value={qty} onChange={e => setQty(e.target.value === '' ? '' : Number(e.target.value))} className="w-1/2 px-2 py-2 bg-transparent border-none focus:outline-none font-semibold text-center text-zinc-800 dark:text-zinc-200" required />
                  <select value={unit} onChange={e => setUnit(e.target.value as Unit)} className="w-1/2 px-1 py-2 bg-transparent border-none outline-none focus:outline-none font-semibold text-zinc-500 uppercase appearance-none" style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5 text-zinc-500">Anotação</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex: Marca Ype..." className="w-full px-4 py-3.5 bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:ring-zinc-100 font-medium placeholder-zinc-400" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5 text-zinc-500">Validade</label>
                <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full px-4 py-3.5 bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:ring-zinc-100 font-medium text-zinc-800 dark:text-zinc-200 uppercase" />
              </div>
             </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-2 pt-2">
              <button type="submit" className="flex-1 bg-[#0b57d0] hover:bg-[#0b57d0]/90 dark:bg-[#a8c7fa] dark:hover:bg-[#a8c7fa]/90 text-white dark:text-[#062e6f] p-4 rounded-2xl font-bold text-[15px] transition-transform active:scale-95 shadow-sm">
                {editingPromoId ? 'Salvar Alterações' : 'Salvar Oferta'}
              </button>
              {editingPromoId && (
                <button type="button" onClick={cancelEdit} className="w-full sm:w-auto px-6 py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-2xl font-semibold transition-colors active:scale-95">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="text-center text-zinc-400 pt-10 pb-10 flex flex-col items-center bg-[#f0f4f9] dark:bg-[#1e1e20] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm mb-6">
          <Store size={48} className="text-zinc-200 dark:text-zinc-800 mb-4" strokeWidth={1.5} />
          <p className="font-semibold text-[15px] text-zinc-500">Selecione ou adicione um mercado.</p>
        </div>
      )}

      {/* LISTA DE PROMOÇÕES */}
      <div className="space-y-4">
        
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
           <button 
             onClick={() => setPromoFilter('on_list')} 
             className={`px-4 py-2 rounded-xl font-bold text-[12px] uppercase tracking-wider transition-colors shrink-0 ${promoFilter === 'on_list' ? 'bg-[#f0f4f9] dark:bg-[#1e1e20] text-zinc-900 dark:text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
           >
              Na Lista
           </button>
           <button 
             onClick={() => setPromoFilter('all')} 
             className={`px-4 py-2 rounded-xl font-bold text-[12px] uppercase tracking-wider transition-colors shrink-0 ${promoFilter === 'all' ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
           >
              Todas Ofertas
           </button>
           <button 
             onClick={() => setPromoFilter('today')} 
             className={`px-4 py-2 rounded-xl font-bold text-[12px] uppercase tracking-wider transition-colors shrink-0 ${promoFilter === 'today' ? 'bg-red-500 text-white' : 'bg-red-50 dark:bg-red-900/10 text-red-500'}`}
           >
              Vence Hoje
           </button>
           <button 
             onClick={() => setPromoFilter('tomorrow')} 
             className={`px-4 py-2 rounded-xl font-bold text-[12px] uppercase tracking-wider transition-colors shrink-0 ${promoFilter === 'tomorrow' ? 'bg-orange-500 text-white' : 'bg-orange-50 dark:bg-orange-900/10 text-orange-500'}`}
           >
              Vence Amanhã
           </button>
        </div>

        {filteredPromos.length === 0 ? (
           <div className="text-center py-10 text-zinc-400 font-medium bg-[#f0f4f9] dark:bg-[#1e1e20] rounded-3xl border border-zinc-200 dark:border-zinc-800">
             {promoFilter === 'today' ? 'Nenhuma oferta vence hoje.' : promoFilter === 'tomorrow' ? 'Nenhuma oferta vence amanhã.' : promoFilter === 'on_list' ? 'Nenhum item da sua lista está com oferta cadastrada.' : 'Não há promoções nesta aba.'}
           </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredPromos.map(promo => {
              const base = convertToBaseUnit(promo.qty, promo.unit);
              const pricePerBase = getPricePerBaseUnit(promo.price, promo.qty, promo.unit);
              const marketName = markets.find(m => m.id === promo.marketId)?.name || 'Desconhecido';
              
              const isExpiringToday = promo.expiryDate === todayStr;
              const isExpiringTomorrow = promo.expiryDate === tomorrowStr;

              return (
                <div key={promo.id} className="bg-[#f0f4f9] dark:bg-[#1e1e20] p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex justify-between items-center gap-4 transition-all cursor-pointer active:scale-95" onClick={() => handleEditPromo(promo)}>
                  <div className="flex-1 min-w-0 pointer-events-none">
                    
                    <div className="flex items-center gap-2 mb-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full flex items-center gap-1 min-w-0"><Store size={10} className="shrink-0" /> <span className="truncate">{marketName}</span></span>
                    </div>

                    <h4 className="font-bold text-[16px] text-zinc-800 dark:text-zinc-200 leading-snug break-words">{formatItemName(promo.itemName)}</h4>
                    
                    <div className="flex items-end gap-2 mt-1 mb-2">
                      <div className="text-zinc-800 dark:text-zinc-200 font-bold text-[22px] tracking-tight leading-none">{formatMoney(promo.price)}</div>
                    </div>
                    
                    <div className="flex gap-2 text-[10px] font-bold uppercase tracking-widest mt-2 flex-wrap">
                      <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 py-1 px-2.5 rounded-full">Por {promo.qty} {promo.unit}</span>
                      {base.qty !== 1 && (
                        <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 py-1 px-2.5 rounded-full">
                          Equivale {formatMoney(pricePerBase)} / {base.unit}
                        </span>
                      )}
                    </div>
                    {(promo.notes || promo.expiryDate) && (
                      <div className="flex flex-col gap-1 mt-2">
                        {promo.notes && (
                           <div className="text-[12px] font-medium text-zinc-500 mt-1 dark:text-zinc-400 italic">
                             {promo.notes}
                           </div>
                        )}
                        {promo.expiryDate && (
                          <div className={`text-[11px] font-bold mt-1 flex items-center gap-1.5 px-2 py-1 rounded border inline-flex w-max ${
                            isExpiringToday ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400' :
                            isExpiringTomorrow ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/20 dark:border-orange-900/30 dark:text-orange-400' :
                            'bg-[#f0f4f9] border-zinc-200 text-zinc-500 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-400'
                          }`}>
                            <Calendar size={14} /> 
                            {isExpiringToday ? 'VENCE HOJE' : isExpiringTomorrow ? 'VENCE AMANHÃ' : `ATÉ ${new Date(promo.expiryDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <button onClick={(e) => { e.stopPropagation(); setPromotions(promotions.filter(p => p.id !== promo.id)); }} className="text-zinc-300 hover:text-red-500 p-3 bg-[#f0f4f9] dark:bg-zinc-800 hover:bg-red-50 flex-shrink-0 rounded-xl transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      </div>

      {/* MODAL BOTTOM SHEET DO CATÁLOGO HIDDEN */}
      {showCatalog && (
        <div className="fixed inset-0 z-[100] flex justify-center items-end bg-black/40 backdrop-blur-[2px] animate-in fade-in" onClick={() => setShowCatalog(false)}>
          <div 
            className="w-full max-w-lg bg-[#f0f4f9] dark:bg-[#1e1e20] rounded-t-[32px] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom"
            style={{ maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-[#f0f4f9] dark:bg-[#1e1e20] z-10">
              <h2 className="text-[16px] font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">Selecionar Produto</h2>
              <button 
                onClick={() => { setShowCatalog(false); setSearchQuery(''); }} 
                className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
               >
                <X size={20} className="w-5 h-5"/>
              </button>
            </div>
            
            <div className="px-4 pt-4 pb-2 bg-[#f0f4f9] dark:bg-[#1e1e20] sticky top-[73px] z-10">
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar itens..." 
                  className="w-full pl-10 pr-4 py-3.5 bg-[#f0f4f9] dark:bg-[#1e1e20] border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:ring-zinc-100 font-semibold text-[15px] dark:text-zinc-200 transition-colors shadow-sm placeholder-zinc-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded-full p-1">
                     <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto p-4 space-y-3 bg-[#f0f4f9] dark:bg-[#1e1e20]">
              {searchQuery ? (
                searchResults.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 font-medium">Nenhum produto encontrado.</div>
                ) : (
                  <div className="bg-[#f0f4f9] dark:bg-[#1e1e20] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
                    <h4 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-4">Resultados</h4>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleAddFromCatalog(item.name)}
                          className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:text-zinc-800 dark:hover:text-zinc-100 text-[14px] font-semibold rounded-2xl transition-colors flex items-center gap-1.5 active:scale-95"
                        >
                          <Plus size={16} className="opacity-50" /> {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                PRODUCT_CATALOG.map((cat, i) => {
                  const isExpanded = expandedCategory === cat.name;
                  return (
                    <div key={i} className="bg-[#f0f4f9] dark:bg-[#1e1e20] rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all shadow-sm">
                      <button 
                        onClick={() => setExpandedCategory(isExpanded ? null : cat.name)}
                        className="w-full px-5 py-4.5 flex items-center justify-between text-left focus:outline-none"
                      >
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 text-[15px] flex items-center gap-3">
                          <span className="text-xl">{cat.icon}</span> {cat.name}
                        </span>
                        {isExpanded ? <ChevronUp size={22} className="text-zinc-400" /> : <ChevronDown size={22} className="text-zinc-400" />}
                      </button>
                      
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-1 space-y-4">
                          {cat.subcategories.map((sub, j) => (
                            <div key={j}>
                              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">{sub.name}</h4>
                              <div className="flex flex-wrap gap-2">
                                {sub.items.map((itemName, k) => (
                                  <button
                                    key={k}
                                    onClick={() => handleAddFromCatalog(itemName)}
                                    className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:text-zinc-800 dark:hover:text-zinc-100 text-[14px] font-semibold rounded-2xl transition-colors flex items-center gap-1.5 active:scale-95"
                                  >
                                    <Plus size={16} className="opacity-50" /> {itemName}
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
      
      {/* MODAL DE IMPORTAÇÃO POR IA */}
      {showPasteModal && (
        <div className="fixed inset-0 z-[100] flex justify-center items-end bg-black/40 backdrop-blur-[2px] animate-in fade-in" onClick={() => setShowPasteModal(false)}>
          <div className="w-full max-w-lg bg-[#f0f4f9] dark:bg-[#1e1e20] rounded-t-[32px] overflow-hidden flex flex-col shadow-2xl h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-[#f0f4f9] dark:bg-[#1e1e20] z-10">
              <h2 className="text-lg font-semibold text-soft-text-main dark:text-zinc-200 tracking-tight">Importar Ofertas</h2>
              <button onClick={() => setShowPasteModal(false)} className="p-2 bg-soft-card dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-soft-text-main dark:hover:text-zinc-200 transition-colors flex items-center justify-center -mr-2">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
               {analyzedPromos.length === 0 ? (
                 <>
                   <textarea
                     className="w-full h-40 bg-[#f0f4f9] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-4 text-[14px] font-medium resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:ring-zinc-100 placeholder-zinc-400 mb-4"
                     placeholder="Cole aqui o texto das ofertas — pode ser do WhatsApp, newsletter ou digitado. Ex: Acém R$ 15/kg, Frango 8,90 o kg, Arroz 5kg por R$ 22"
                     value={pasteText}
                     onChange={(e) => setPasteText(e.target.value)}
                   />
                   <button 
                     onClick={handleAnalyzeText} 
                     disabled={isAnalyzing || !pasteText.trim()}
                     className="w-full bg-[#0b57d0] dark:bg-[#a8c7fa] hover:bg-[#0b57d0]/90 dark:hover:bg-[#a8c7fa]/90 disabled:opacity-50 text-white dark:text-[#062e6f] font-bold py-3.5 rounded-2xl transition-colors shadow-sm"
                   >
                     {isAnalyzing ? "Analisando..." : "Analisar com IA"}
                   </button>
                 </>
               ) : (
                 <>
                   <label className="block text-[12px] font-semibold uppercase tracking-wider mb-2 text-zinc-500 dark:text-zinc-400">
                     Vincular ao Mercado:
                   </label>
                   <select 
                     value={pasteMarketId} 
                     onChange={e => setPasteMarketId(e.target.value)}
                     className="w-full px-4 py-3 bg-[#f0f4f9] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl mb-6 font-semibold focus:outline-none"
                   >
                     <option value="" disabled>-- Selecione --</option>
                     {markets.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                   </select>

                   <h3 className="text-[13px] font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                      <Store size={14} /> Ofertas Encontradas ({analyzedPromos.length})
                   </h3>

                   <div className="space-y-3">
                     {analyzedPromos.map((item, idx) => (
                       <div key={idx} className="bg-[#f0f4f9] dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col gap-2">
                         <input
                           type="text"
                           value={item.produto}
                           onChange={(e) => {
                             const novo = [...analyzedPromos];
                             novo[idx].produto = e.target.value;
                             setAnalyzedPromos(novo);
                           }}
                           className="font-bold text-[15px] bg-transparent border-b border-zinc-100 dark:border-zinc-700 pb-1 focus:outline-none focus:border-zinc-900 dark:border-zinc-100"
                         />
                         <div className="flex gap-2">
                            <div className="flex-1">
                               <span className="text-[10px] uppercase font-bold text-zinc-400">Preço</span>
                               <input type="number" step="0.01" value={item.preco} onChange={(e) => {
                                  const novo = [...analyzedPromos];
                                  novo[idx].preco = Number(e.target.value);
                                  setAnalyzedPromos(novo);
                               }} className="w-full bg-[#f0f4f9] dark:bg-[#1e1e20] rounded p-1.5 font-bold focus:outline-none" />
                            </div>
                            <div className="w-16">
                               <span className="text-[10px] uppercase font-bold text-zinc-400">Por</span>
                               <input type="number" step="0.01" value={item.por || 1} onChange={(e) => {
                                  const novo = [...analyzedPromos];
                                  novo[idx].por = Number(e.target.value);
                                  setAnalyzedPromos(novo);
                               }} className="w-full bg-[#f0f4f9] dark:bg-[#1e1e20] rounded p-1.5 font-bold focus:outline-none" />
                            </div>
                            <div className="w-16">
                               <span className="text-[10px] uppercase font-bold text-zinc-400">Un</span>
                               <input type="text" value={item.unidade} onChange={(e) => {
                                  const novo = [...analyzedPromos];
                                  novo[idx].unidade = e.target.value;
                                  setAnalyzedPromos(novo);
                               }} className="w-full bg-[#f0f4f9] dark:bg-[#1e1e20] rounded p-1.5 font-bold focus:outline-none uppercase" />
                            </div>
                         </div>
                       </div>
                     ))}
                   </div>
                   
                   <div className="mt-6">
                     <button onClick={handleSaveAnalyzed} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-sm">
                       Salvar Todas as Ofertas
                     </button>
                   </div>
                 </>
               )}
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 text-white text-[13px] font-semibold px-5 py-3 rounded-full shadow-lg animate-in fade-in">
          ✅ Oferta salva com sucesso
        </div>
      )}
    </div>
  );
};
