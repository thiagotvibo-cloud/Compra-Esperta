import React, { useState, useMemo, useEffect } from "react";
import { Item, Category, Unit, AppContextType } from "../types";
import {
  generateId,
  formatItemName,
  formatMoney,
  CATEGORY_EMOJI_UPDATED,
} from "../utils";
import {
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Search,
  ChevronRight,
  Calculator,
  BadgePlus,
  Star,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { PRODUCT_CATALOG } from "../data/catalog";
import { motion, AnimatePresence } from "motion/react";
import { PageHeader } from "./ui/PageHeader";
export const ListaCompras: React.FC<{ context: AppContextType }> = ({
  context,
}) => {
  const { items, setItems, settings } = context;
  const [showCatalog, setShowCatalog] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tip, setTip] = useState<string | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const fetchTip = async () => {
    const essentialItems = items
      .filter((i) => i.isEssential)
      .map((i) => i.name);
    if (essentialItems.length === 0) return;
    setIsLoadingTip(true);
    try {
      const response = await fetch("/api/tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essentialItems }),
      });
      if (!response.ok) {
        if (response.status === 404) {
          /* If the endpoint doesn't exist (e.g. in production), silently ignore it and mark as'fetched' to avoid retries */ setTip(
            "",
          );
          return;
        }
        throw new Error("Failed to fetch tip");
      }
      const data = await response.json();
      if (data.tip) setTip(data.tip);
    } catch (error) {
      console.error("Failed to fetch tip:", error);
      setTip(""); /* Store empty string on error to prevent constant retries */
    } finally {
      setIsLoadingTip(false);
    }
  };
  useEffect(() => {
    const essentialItemsCount = items.filter((i) => i.isEssential).length;
    if (essentialItemsCount > 0 && !tip && !isLoadingTip) {
      fetchTip();
    }
  }, [items]);
  const handleAddFromCatalog = (itemName: string, categoryName: string) => {
    setItems((prevItems) => {
      const normalizedItemName = itemName.trim().toLowerCase();
      const existingItem = prevItems.find(
        (i) => i.name.trim().toLowerCase() === normalizedItemName,
      );
      if (existingItem) {
        return prevItems.filter((i) => i.id !== existingItem.id);
      } else {
        const newItem: Item = {
          id: generateId(),
          name: itemName,
          qty: 1,
          unit: "un" /* Padrão */,
          category: categoryName as Category,
          isEssential: false,
          onlyPromo: false,
          isBought: false,
          notes: "",
          actualPrice: 0,
        };
        return [...prevItems, newItem];
      }
    });
  };
  const clearBought = () => {
    setItems(items.map((item) => ({ ...item, isBought: false })));
    setShowClearConfirm(false);
  };
  const getBestOffer = (itemName: string) => {
    const promos = context.promotions.filter(
      (p) => p.itemName.toLowerCase() === itemName.toLowerCase(),
    );
    if (promos.length === 0) return null;
    return promos.reduce((prev, curr) =>
      prev.price < curr.price ? prev : curr,
    );
  };
  const calculateEstimatedTotal = () => {
    let total = 0;
    const globalDefault = 15.0;
    items.forEach((item) => {
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
    const globalDefault = 15.0;
    items.forEach((item) => {
      const bestOffer = getBestOffer(item.name);
      if (bestOffer) {
        totalWithoutOffers += globalDefault * item.qty;
        /* ou preço médio se houvesse, mas usarei default por enquanto */ totalWithOffers +=
          bestOffer.price * item.qty;
      }
    });
    return Math.max(0, totalWithoutOffers - totalWithOffers);
  };
  const expectedTotal = calculateEstimatedTotal();
  const progOrçamento =
    settings.budget > 0 ? (expectedTotal / settings.budget) * 100 : 0;
  const progressPercent = Math.min(progOrçamento, 100);
  const normalizedItemNamesForCatalog = useMemo(() => {
    return new Set(items.map((i) => i.name.trim().toLowerCase()));
  }, [items]);
  const uniqueCategories = Array.from(new Set(items.map((i) => i.category)));
  const groupedItems = uniqueCategories
    .map((cat) => ({
      category: cat || "Sem Categoria",
      items: items
        .filter((i) => i.category === cat)
        .sort((a, b) => {
          if (a.isBought === b.isBought) {
            if (a.isEssential && !b.isEssential) return -1;
            if (!a.isEssential && b.isEssential) return 1;
            return a.name.localeCompare(b.name);
          }
          return a.isBought ? 1 : -1;
        }),
    }))
    .sort((a, b) => String(a.category).localeCompare(String(b.category)));
  const totalItems = items.length;
  const boughtItems = items.filter((i) => i.isBought).length;
  const flatCatalog = useMemo(() => {
    return PRODUCT_CATALOG.flatMap((cat) =>
      cat.subcategories.flatMap((sub) =>
        sub.items.map((item) => ({
          name: item,
          category: cat.name,
          searchKey: item
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""),
        })),
      ),
    );
  }, []);
  const frequentItems = useMemo(() => {
    const counts: Record<string, number> = {};
    context.history.forEach((h) => {
      h.items?.forEach((i) => {
        const lowerName = i.nome.trim().toLowerCase();
        counts[lowerName] = (counts[lowerName] || 0) + 1;
      });
    });
    return Object.fromEntries(
      Object.entries(counts).filter(([_, count]) => count >= 2),
    );
  }, [context.history]);
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return flatCatalog.filter((i) => i.searchKey.includes(query));
  }, [searchQuery, flatCatalog]);
  return (
    <div className="pb-28 bg-transparent min-h-screen relative">
      <PageHeader title="Lista de Compras" subtitle="Organize suas compras e acompanhe seu orçamento." />

      <div className="px-6 mt-4 relative z-20 space-y-4">
        {/* NEW SUMMARY CARD */}
        <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[20px] p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[12px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Progresso da Lista
            </h3>
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200">
              {Math.round(progOrçamento)}%
            </span>
          </div>
          
          <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${progOrçamento > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] font-medium text-slate-500 mb-1 uppercase tracking-wider">Orçamento</div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                {formatMoney(settings.budget)}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500 mb-1 uppercase tracking-wider">Previsto</div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                {formatMoney(expectedTotal)}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center text-[12px]">
             <span className="font-medium text-slate-500">Itens na lista:</span>
             <span className="font-bold text-slate-700 dark:text-slate-300">{boughtItems} de {totalItems}</span>
          </div>
          {calculateEconomy() > 0 && (
             <div className="mt-3 text-[12px] font-semibold text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-950/30 p-2 rounded-xl text-center border border-green-100 dark:border-green-900/30">
               Usando as ofertas, você poupará {formatMoney(calculateEconomy())}
             </div>
          )}
        </section>

        {/* NEW ACTIONS CARD */}
        <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[20px] p-4 shadow-sm flex justify-around">
            <button
              onClick={() => setShowCatalog(true)}
              className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 flex items-center justify-center border border-slate-100 dark:border-zinc-700 shadow-sm">
                <BadgePlus size={20} />
              </div>
              <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">Adicionar</span>
            </button>
            
            <button
              onClick={() => context.setActiveTab("compras")}
              className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/30 shadow-sm">
                <Calculator size={20} />
              </div>
              <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">Modo Compra</span>
            </button>
            
            <button
              onClick={() => items.length > 0 && setShowClearConfirm(true)}
              className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 flex items-center justify-center border border-slate-100 dark:border-zinc-700 shadow-sm">
                <Trash2 size={20} />
              </div>
              <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">Limpar</span>
            </button>
        </section>

        {/* DICA DO GEMINI */}
        <AnimatePresence>
          {tip && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-[20px] border border-slate-200 dark:border-zinc-800 flex items-start gap-3 shadow-sm"
            >
              <Lightbulb
                className="text-amber-500 shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <h4 className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dica da IA
                </h4>
                <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-snug">
                  {tip}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LISTA DE ITENS */}
        <div className="pb-10">
          <AnimatePresence mode="popLayout">
            {items.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12 px-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[20px] shadow-sm flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-800 rounded-full flex justify-center items-center mb-4">
                  <BadgePlus size={32} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-[14px]">
                  Sua lista está vazia.
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-[13px] mt-1">
                  Adicione itens para planejar suas compras.
                </p>
                <button 
                  onClick={() => setShowCatalog(true)}
                  className="mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-full text-[13px] shadow-sm active:scale-95 transition-transform"
                >
                  Adicionar Itens
                </button>
              </motion.div>
            )}

            {groupedItems.map((group) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={group.category}
                className="mb-4"
              >
                <motion.div
                  layout
                  className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mt-2 mb-2 pl-1 uppercase tracking-wider flex items-center gap-1.5"
                >
                  {CATEGORY_EMOJI_UPDATED[group.category as string] || "🛒"}
                  {group.category}
                  <span className="text-[10px] ml-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md">
                    {group.items.length}
                  </span>
                </motion.div>
                
                <motion.div layout className="flex flex-col gap-2">
                  <AnimatePresence mode="popLayout">
                    {group.items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                          opacity: item.isBought ? 0.6 : 1,
                          x: 0,
                          scale: 1,
                        }}
                        exit={{ opacity: 0, scale: 0.9, x: 20 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                        className={`flex items-center gap-3 p-3 rounded-[16px] border ${item.isBought ? "bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800" : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm"}`}
                      >
                        <button
                          onClick={() =>
                            setItems(
                              items.map((i) =>
                                i.id === item.id
                                  ? { ...i, isBought: !i.isBought }
                                  : i,
                              ),
                            )
                          }
                          className={`shrink-0 w-7 h-7 border-2 rounded-full flex items-center justify-center transition-colors ${item.isBought ? "bg-green-600 border-green-600 dark:bg-green-500 dark:border-green-500" : "border-slate-300 dark:border-zinc-600"}`}
                        >
                          {item.isBought && (
                            <Check
                              size={14}
                              strokeWidth={3}
                              className="text-white dark:text-slate-900"
                            />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <motion.div
                            className={`font-semibold text-[14px] flex items-center gap-2 leading-snug ${item.isBought ? "line-through text-slate-500 dark:text-slate-500" : "text-slate-800 dark:text-slate-200"}`}
                          >
                            <span className="min-w-0 flex-1 truncate">
                              {formatItemName(item.name)}
                            </span>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setItems(
                                  items.map((i) =>
                                    i.id === item.id
                                      ? { ...i, isFavorite: !i.isFavorite }
                                      : i,
                                  ),
                                );
                              }}
                              className={`shrink-0 transition-colors ${item.isFavorite || frequentItems[item.name.trim().toLowerCase()] ? "text-amber-500" : "text-slate-300 dark:text-zinc-600 hover:text-amber-400"}`}
                            >
                              <Star
                                size={14}
                                className={
                                  item.isFavorite ||
                                  frequentItems[item.name.trim().toLowerCase()]
                                    ? "fill-amber-500"
                                    : ""
                                }
                                strokeWidth={
                                  item.isFavorite ||
                                  frequentItems[item.name.trim().toLowerCase()]
                                    ? 0
                                    : 2
                                }
                              />
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setItems(
                                  items.map((i) =>
                                    i.id === item.id
                                      ? { ...i, isEssential: !i.isEssential }
                                      : i,
                                  ),
                                );
                              }}
                              className={`shrink-0 transition-colors ${item.isEssential ? "text-blue-500" : "text-slate-300 dark:text-zinc-600 hover:text-blue-400"}`}
                            >
                              <ExternalLink
                                size={14}
                                strokeWidth={2}
                              />
                            </button>
                          </motion.div>
                          
                          {getBestOffer(item.name) && (() => {
                            const promo = getBestOffer(item.name);
                            if (!promo) return null;
                            const market = context.markets.find((m) => m.id === promo.marketId);
                            return (
                              <div className="text-[10px] font-semibold text-green-700 dark:text-green-500 mt-0.5 truncate">
                                Melhor: {formatMoney(promo.price)} {market ? `(${market.name})` : ""}
                              </div>
                            );
                          })()}
                        </div>
                        
                        <div className="flex items-center gap-1 shrink-0 bg-slate-50 dark:bg-zinc-950 rounded-xl px-1.5 py-1 border border-slate-100 dark:border-zinc-800">
                          <input
                            type="number"
                            step="0.01"
                            value={item.qty || ""}
                            onChange={(e) =>
                              setItems(
                                items.map((i) =>
                                  i.id === item.id
                                    ? {
                                        ...i,
                                        qty: parseFloat(e.target.value) || 0,
                                      }
                                    : i,
                                ),
                              )
                            }
                            className="w-[32px] bg-transparent text-center text-[13px] font-semibold text-slate-800 dark:text-slate-200 focus:outline-none placeholder-slate-300"
                          />
                          <select
                            value={item.unit}
                            onChange={(e) =>
                              setItems(
                                items.map((i) =>
                                  i.id === item.id
                                    ? { ...i, unit: e.target.value as Unit }
                                    : i,
                                ),
                              )
                            }
                            className="bg-transparent text-[11px] font-semibold text-slate-500 dark:text-slate-400 focus:outline-none appearance-none cursor-pointer pr-1"
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setItems(items.filter((i) => i.id !== item.id));
                          }}
                          className="shrink-0 p-1.5 text-slate-300 dark:text-zinc-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* CLEAR CONFIRM MODAL */}{" "}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-[110] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowClearConfirm(false)}
        >
          {" "}
          <div
            className="bg-white dark:bg-zinc-900 rounded-[20px] p-6 w-full max-w-sm shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <div className="w-16 h-16 bg-red-100 /30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              {" "}
              <Trash2 size={32} />{" "}
            </div>{" "}
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {" "}
              Opções de Limpeza{" "}
            </h3>{" "}
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-[14px]">
              {" "}
              O que você deseja fazer?{" "}
            </p>{" "}
            <div className="flex flex-col gap-3">
              {" "}
              <button
                onClick={() => {
                  clearBought();
                  setShowClearConfirm(false);
                }}
                className="w-full py-3.5 rounded-[20px] font-bold text-white bg-orange-500 hover:bg-orange-600 active:scale-[0.97] transition-transform duration-150 transition-all shadow-sm"
              >
                {" "}
                Desmarcar Itens (Limpar Carrinho){" "}
              </button>{" "}
              <button
                onClick={() => {
                  setItems([]);
                  setShowClearConfirm(false);
                }}
                className="w-full py-3.5 rounded-[20px] font-bold text-white bg-red-500 hover:bg-red-600 active:scale-[0.97] transition-transform duration-150 transition-all shadow-sm"
              >
                {" "}
                Apagar Tudo (Limpar Lista){" "}
              </button>{" "}
              <button
                onClick={() => setShowClearConfirm(false)}
                className="w-full py-3.5 mt-2 rounded-[20px] font-bold text-zinc-500 dark:text-zinc-400 bg-transparent active:scale-[0.97] transition-transform duration-150 transition-all"
              >
                {" "}
                Cancelar{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* MODAL BOTTOM SHEET DO CATÁLOGO HIDDEN */}{" "}
      {showCatalog && (
        <div
          className="fixed inset-0 z-[100] flex justify-center items-end bg-black/40 backdrop-blur-[2px] animate-in fade-in"
          onClick={() => setShowCatalog(false)}
        >
          {" "}
          <div
            className="w-full max-w-lg bg-zinc-50 dark:bg-zinc-900 rounded-t-[28px] overflow-hidden flex flex-col shadow-sm animate-in slide-in-from-bottom border-none"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-zinc-50 dark:bg-zinc-900 z-10">
              {" "}
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {" "}
                Adicionar Produto{" "}
              </h2>{" "}
              <button
                onClick={() => {
                  setShowCatalog(false);
                  setSearchQuery("");
                }}
                className="p-2 bg-white dark:bg-zinc-900 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100 :text-zinc-200 transition-colors flex items-center justify-center -mr-2"
              >
                {" "}
                <ChevronDown size={24} />{" "}
              </button>{" "}
            </div>{" "}
            <div className="px-4 pt-4 pb-2 bg-zinc-50 dark:bg-zinc-900 sticky top-[73px] z-10">
              {" "}
              <div className="relative">
                {" "}
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
                />{" "}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar itens..."
                  className="w-full pl-11 pr-4 py-4 bg-white dark:bg-zinc-900 border-none rounded-[20px] focus:outline-none focus:ring-2 focus:ring-green-600 text-[15px] transition-colors placeholder-zinc-400"
                />{" "}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hoverdark:hover:text-green-500 dark:text-green-500 :text-zinc-200 bg-transparent rounded-full p-1.5"
                  >
                    {" "}
                    <X size={14} />{" "}
                  </button>
                )}{" "}
              </div>{" "}
            </div>{" "}
            <div className="overflow-y-auto p-4 space-y-4 bg-transparent">
              {" "}
              {searchQuery ? (
                searchResults.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 dark:text-zinc-400">
                    {" "}
                    <p className="mb-4">Nenhum produto encontrado.</p>{" "}
                    <button
                      onClick={() =>
                        handleAddFromCatalog(searchQuery, "Outros")
                      }
                      className="px-6 py-3 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-semibold rounded-full shadow-sm hover:bg-slate-700 dark:hover:bg-slate-300 transition-colors active:scale-[0.97]"
                    >
                      {" "}
                      Adicionar"{searchQuery}"{" "}
                    </button>{" "}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-zinc-900 #1C1C1E] rounded-[20px] border-none p-5">
                    {" "}
                    <h4 className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 mb-4">
                      {" "}
                      Resultados da Busca{" "}
                    </h4>{" "}
                    <div className="flex flex-wrap gap-2">
                      {" "}
                      {searchResults.map((item, index) => {
                        const isAdded = normalizedItemNamesForCatalog.has(
                          item.name.trim().toLowerCase(),
                        );
                        return (
                          <button
                            key={index}
                            onClick={() =>
                              handleAddFromCatalog(item.name, item.category)
                            }
                            className={`px-4 py-2 text-[14px] font-medium rounded-full transition-colors flex items-start gap-1.5 active:scale-[0.97] transition-transform duration-150 text-left max-w-full border ${isAdded ? "bg-green-600 text-white border-green-600 shadow-sm" : "bg-transparent hover:bg-green-50 dark:hover:bg-emerald-900/30 text-zinc-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-slate-200 border-zinc-200 dark:border-zinc-800"}`}
                          >
                            {" "}
                            {isAdded ? (
                              <Check
                                size={14}
                                strokeWidth={3}
                                className="shrink-0 mt-0.5 text-white"
                              />
                            ) : (
                              <Plus
                                size={14}
                                className="opacity-50 shrink-0 mt-0.5"
                              />
                            )}{" "}
                            <span className="leading-snug break-words">
                              {" "}
                              {formatItemName(item.name)}{" "}
                            </span>{" "}
                          </button>
                        );
                      })}{" "}
                    </div>{" "}
                    <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
                      {" "}
                      <p className="text-zinc-500 dark:text-zinc-400 text-[13px] mb-3">
                        {" "}
                        Não encontrou o que queria?{" "}
                      </p>{" "}
                      <button
                        onClick={() => {
                          handleAddFromCatalog(searchQuery, "Outros");
                          setSearchQuery("");
                        }}
                        className="px-5 py-2.5 bg-transparent text-zinc-900 dark:text-zinc-100 text-[14px] font-semibold rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm hover:bg-transparent :bg-zinc-700 transition-colors"
                      >
                        {" "}
                        Adicionar"{searchQuery}"como item avulso{" "}
                      </button>{" "}
                    </div>{" "}
                  </div>
                )
              ) : (
                PRODUCT_CATALOG.map((cat, i) => {
                  const isExpanded = expandedCategory === cat.name;
                  return (
                    <div
                      key={i}
                      className="bg-white dark:bg-zinc-900 #1C1C1E] rounded-[20px] border-none overflow-hidden transition-all shadow-sm"
                    >
                      {" "}
                      <button
                        onClick={() =>
                          setExpandedCategory(isExpanded ? null : cat.name)
                        }
                        className="w-full px-5 py-5 flex items-center justify-between text-left focus:outline-none"
                      >
                        {" "}
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-[15px] flex items-center gap-3">
                          {" "}
                          <span className="text-xl">{cat.icon}</span>{" "}
                          {cat.name}{" "}
                        </span>{" "}
                        {isExpanded ? (
                          <ChevronUp
                            size={20}
                            className="text-zinc-500 dark:text-zinc-400"
                          />
                        ) : (
                          <ChevronDown
                            size={20}
                            className="text-zinc-500 dark:text-zinc-400"
                          />
                        )}{" "}
                      </button>{" "}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-0 space-y-4 border-t border-zinc-200 dark:border-zinc-800/50">
                          {" "}
                          {cat.subcategories.map((sub, j) => (
                            <div key={j} className="pt-2">
                              {" "}
                              <h4 className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 mb-3">
                                {" "}
                                {sub.name}{" "}
                              </h4>{" "}
                              <div className="flex flex-wrap gap-2">
                                {" "}
                                {sub.items.map((itemName, k) => {
                                  const isAdded =
                                    normalizedItemNamesForCatalog.has(
                                      itemName.trim().toLowerCase(),
                                    );
                                  return (
                                    <button
                                      key={k}
                                      onClick={() =>
                                        handleAddFromCatalog(itemName, cat.name)
                                      }
                                      className={`px-4 py-2 text-[14px] font-medium rounded-full transition-colors flex items-start gap-1.5 active:scale-[0.97] transition-transform duration-150 text-left max-w-full border ${isAdded ? "bg-green-600 text-white border-green-600 shadow-sm" : "bg-transparent hover:bg-green-50 dark:hover:bg-emerald-900/30 text-zinc-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-slate-200 border-zinc-200 dark:border-zinc-800"}`}
                                    >
                                      {" "}
                                      {isAdded ? (
                                        <Check
                                          size={14}
                                          strokeWidth={3}
                                          className="shrink-0 mt-0.5 text-white"
                                        />
                                      ) : (
                                        <Plus
                                          size={14}
                                          className="opacity-50 shrink-0 mt-0.5"
                                        />
                                      )}{" "}
                                      <span className="leading-snug text-wrap">
                                        {" "}
                                        {formatItemName(itemName)}{" "}
                                      </span>{" "}
                                    </button>
                                  );
                                })}{" "}
                              </div>{" "}
                            </div>
                          ))}{" "}
                        </div>
                      )}{" "}
                    </div>
                  );
                })
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
};
