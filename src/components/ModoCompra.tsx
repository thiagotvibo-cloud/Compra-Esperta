import { motion, AnimatePresence } from "motion/react";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { AppContextType, Item, HistoryItem } from "../types";
import {
  formatMoney,
  formatItemName,
  generateId,
  CATEGORY_EMOJI_UPDATED,
} from "../utils";
import {
  Check,
  AlertTriangle,
  Plus,
  Minus,
  Search,
  CreditCard,
  X,
  Trash2,
  Store,
  Ban,
  ShoppingBag,
} from "lucide-react";
export const ModoCompra: React.FC<{ context: AppContextType }> = ({
  context,
}) => {
  const {
    items,
    setItems,
    settings,
    markets,
    promotions,
    setHistory,
    history,
    shoppingMarketId,
    setShoppingMarketId,
  } = context;
  const [searchTerm, setSearchTerm] = useState("");
  const [showAvulso, setShowAvulso] = useState(false);
  const [avulsoVal, setAvulsoVal] = useState("");
  const [delayedSorting, setDelayedSorting] = useState<boolean>(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [purchaseSummary, setPurchaseSummary] = useState<{
    total: number;
    economy: number;
    itemCount: number;
    marketName: string;
  } | null>(null);
  const activeItems = useMemo(() => items.filter((i) => !i.notFound), [items]);
  const [scaleTotal, setScaleTotal] = useState(false);
  const [lastBoughtName, setLastBoughtName] = useState("");
  const [showBoughtToast, setShowBoughtToast] = useState(false);
  const totalSpent = useMemo(() => {
    return activeItems
      .filter((i) => i.isBought)
      .reduce(
        (acc, curr) => acc + (curr.actualPrice || 0) * (curr.qty || 1),
        0,
      );
  }, [activeItems]);
  const prevTotalRef = useRef(totalSpent);
  useEffect(() => {
    if (totalSpent !== prevTotalRef.current) {
      setScaleTotal(true);
      const t = setTimeout(() => setScaleTotal(false), 150);
      prevTotalRef.current = totalSpent;
      return () => clearTimeout(t);
    }
  }, [totalSpent]);
  const toggleBought = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, isBought: !item.isBought } : item,
      ),
    );
    setDelayedSorting(true);
  };
  const markNotFound = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, notFound: true, isBought: false } : item,
      ),
    );
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
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, actualPrice: newPrice } : item,
      ),
    );
  };
  const handlePriceInput = (id: string, inputValue: string) => {
    const numericStr = inputValue.replace(/\D/g, "");
    if (!numericStr) {
      updatePrice(id, 0);
      return;
    }
    const newPrice = parseInt(numericStr, 10) / 100;
    updatePrice(id, newPrice);
  };
  const getPriceDisplayValue = (price: number) => {
    if (!price) return "";
    return price.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  const updateQtyExplicit = (id: string, newQty: number) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, qty: newQty } : item)),
    );
  };
  const handleQtyChange = (id: string, inputValue: string, unit: string) => {
    const isFractional = ["kg", "l"].includes(unit.toLowerCase());
    const numericStr = inputValue.replace(/\D/g, "");
    if (isFractional) {
      if (!numericStr) {
        updateQtyExplicit(id, 0);
        return;
      }
      updateQtyExplicit(id, parseInt(numericStr, 10) / 1000);
    } else {
      if (!numericStr) {
        updateQtyExplicit(id, 0);
        return;
      }
      updateQtyExplicit(id, parseInt(numericStr, 10));
    }
  };
  const getQtyDisplayValue = (qty: number, unit: string) => {
    const isFractional = ["kg", "l"].includes(unit.toLowerCase());
    if (isFractional)
      return (qty || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
    return (qty || 0).toString();
  };
  const handleAvulsoAdd = () => {
    const numericStr = avulsoVal.replace(/\D/g, "");
    if (!numericStr) return;
    const newPrice = parseInt(numericStr, 10) / 100;
    if (newPrice <= 0) return;
    setItems([
      ...items,
      {
        id: generateId(),
        name: `Item Avulso`,
        category: "Outros",
        qty: 1,
        unit: "un",
        actualPrice: newPrice,
        isBought: true,
        isEssential: false,
        onlyPromo: false,
        notes: "",
      },
    ]);
    setAvulsoVal("");
    setShowAvulso(false);
  };
  const handleMarketSelect = (marketId: string) => {
    setShoppingMarketId(marketId);
    if (!marketId) return;
    const marketPromos = promotions.filter((p) => p.marketId === marketId);
    setItems((prev) =>
      prev.map((item) => {
        if (item.isBought) return item;
        /* Conserva valor preenchido manualmente */ const promo =
          marketPromos.find((p) => p.itemName === item.name);
        if (promo) {
          return { ...item, actualPrice: promo.price };
        }
        return item;
      }),
    );
  };
  const budgetPercent =
    settings.budget > 0 ? (totalSpent / settings.budget) * 100 : 0;
  let headerColor = "bg-green-700";
  let textColor = "text-white";
  let subTextColor = "text-green-100";
  let pulseClass = "";
  if (budgetPercent > 100) {
    headerColor = "bg-red-600";
    textColor = "text-white";
    subTextColor = "text-red-100";
    pulseClass = "animate-pulse";
  } else if (budgetPercent >= 90) {
    headerColor = "bg-red-200";
    textColor = "text-red-800";
    subTextColor = "text-red-700";
  } else if (budgetPercent >= 70) {
    headerColor = "bg-orange-500";
    textColor = "text-white";
    subTextColor = "text-orange-100";
  }
  const finishPurchase = () => {
    let economy = 0;
    if (settings.budget > 0) {
      economy = settings.budget - totalSpent;
    } else {
      /* Simplification of economy if no budget */ const expectedTotal =
        activeItems.reduce((acc, curr) => acc + 15.0 * curr.qty, 0);
      /* 15 = placeholder */ economy = expectedTotal - totalSpent;
    }
    const h: HistoryItem = {
      id: generateId(),
      date: new Date().toISOString(),
      marketId: shoppingMarketId || null,
      totalSpent: totalSpent,
      economyGenerated: Math.max(0, economy),
      /* para não ficar negativo se passou */ items: activeItems
        .filter((i) => i.isBought)
        .map((i) => ({
          nome: i.name,
          quantidade: i.qty,
          subtotal: (i.actualPrice || 0) * i.qty,
        })),
    };
    setHistory([h, ...history]);
    setItems(
      items.map((i) => ({
        ...i,
        isBought: false,
        actualPrice: 0,
        notFound: false,
      })),
    );
    setShowFinishConfirm(false);
    context.setActiveTab("lista");
  };
  const itemsByCategory = useMemo(() => {
    const filteredItems = activeItems.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    const grouped = filteredItems.reduce(
      (acc, item) => {
        const cat = item.category || "Outros";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      },
      {} as Record<string, Item[]>,
    );
    if (!delayedSorting) {
      Object.keys(grouped).forEach((cat) => {
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
  /* Se não tem itens */ if (items.length === 0)
    return (
      <div className="p-10 text-center text-zinc-500 dark:text-zinc-400 font-medium">
        Sua lista está vazia. Adicione itens antes de ir às compras.
      </div>
    );
  return (
    <div className="pb-36 bg-transparent min-h-screen">
      {" "}
      {}{" "}
      <div
        className={`sticky top-0 z-30 pt-[calc(env(safe-area-inset-top)+20px)] px-6 pb-8 rounded-b-[40px] overflow-hidden shadow-lg transition-colors duration-500 ${headerColor} ${pulseClass}`}
      >
        {" "}
        <div className="absolute rounded-full border-[12px] border-white/10" style={{ width: 280, height: 280, top: -100, left: -100 }}></div>
        <div className="absolute rounded-full bg-black/10" style={{ width: 140, height: 140, bottom: -20, right: -20 }}></div>
        <div className="absolute inset-0 opacity-100 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("/pattern-dark.svg")', backgroundSize: '100px 100px', backgroundRepeat: 'repeat' }}></div>{" "}
        {}{" "}
        <div className="relative z-10 mb-4 bg-black/10 backdrop-blur-sm rounded-3xl flex items-center gap-2 px-3 py-2 border border-white/10">
          {" "}
          <Store className={textColor} size={16} />{" "}
          <select
            value={shoppingMarketId}
            onChange={(e) => handleMarketSelect(e.target.value)}
            className={`flex-1 bg-transparent border-none focus:outline-none font-semibold text-[14px] cursor-pointer appearance-none ${textColor}`}
          >
            {" "}
            <option value="" className="text-zinc-900 dark:text-zinc-100">
              -- Selecione o Mercado --
            </option>{" "}
            {markets.map((m) => (
              <option className="text-zinc-900 dark:text-zinc-100" key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}{" "}
          </select>{" "}
        </div>{" "}
        <div className="flex justify-between items-end relative z-10">
          {" "}
          <div>
            {" "}
            <div className={`text-[12px] font-semibold mb-1 ${subTextColor}`}>
              Valor no Carrinho
            </div>{" "}
            <div
              className={`text-[36px] font-bold tracking-tight leading-none ${textColor}`}
            >
              {" "}
              <span className="text-[20px] font-semibold mr-1 opacity-80">
                R$
              </span>{" "}
              <span
                className={`money-value transition-transform duration-150 inline-block ${scaleTotal ? "scale-[1.06]" : "scale-100"}`}
              >
                {totalSpent.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>{" "}
            </div>{" "}
            {settings.budget > 0 && (
              <div className={`text-[13px] font-medium mt-1 ${subTextColor}`}>
                {" "}
                de R${" "}
                {settings.budget.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}{" "}
                ·{" "}
                {budgetPercent > 100 ? (
                  <span className="font-bold ml-1">
                    Estourou R${" "}
                    {(totalSpent - settings.budget).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                ) : (
                  <span className="ml-1">
                    Faltam R${" "}
                    {(settings.budget - totalSpent).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                )}{" "}
              </div>
            )}{" "}
          </div>{" "}
          {budgetPercent >= 70 && budgetPercent < 100 && (
            <div className="bg-black/10 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold backdrop-blur-sm">
              {" "}
              <AlertTriangle size={14} /> Atenção{" "}
            </div>
          )}{" "}
          {budgetPercent >= 100 && (
            <div className="bg-black/20 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold backdrop-blur-sm">
              {" "}
              ⛔ Passou!{" "}
            </div>
          )}{" "}
        </div>{" "}
        <div
          className={`mt-4 relative z-10 text-[13px] font-semibold flex items-center gap-2 ${subTextColor}`}
        >
          {" "}
          <span>
            {activeItems.filter((i) => i.isBought).length} de{" "}
            {activeItems.length} itens
          </span>{" "}
          <span>·</span>{" "}
          <span>
            {activeItems.filter((i) => !i.isBought).length} pendentes
          </span>{" "}
        </div>{" "}
        {/* PROGRESS BAR */}{" "}
        {settings.budget > 0 && (
          <div className="mt-3 relative z-10">
            {" "}
            <div
              className={`h-2.5 rounded-full overflow-hidden bg-black/10 border border-white/10 shadow-inner`}
            >
              {" "}
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${budgetPercent >= 90 ? "bg-red-500" : "bg-white dark:bg-zinc-900"}`}
                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
              />{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
      <AnimatePresence>
        {" "}
        {showBoughtToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[calc(env(safe-area-inset-top)+80px)] left-4 right-4 z-50 bg-green-700-hover text-white py-2.5 px-4 rounded-2xl text-center font-semibold text-sm shadow-lg pointer-events-none"
          >
            {" "}
            ✅ {lastBoughtName} adicionado!{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
      <div className="px-4 mt-6">
        {" "}
        {/* COMPACT SEARCH & AVULSO */}{" "}
        <div className="flex gap-2 mb-6">
          {" "}
          <div className="relative flex-1">
            {" "}
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
            />{" "}
            <input
              type="text"
              placeholder="Buscar no carrinho..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 py-3.5 rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-600 font-medium placeholder-zinc-400 text-[15px] shadow-sm"
            />{" "}
          </div>{" "}
          <button
            onClick={() => setShowAvulso(!showAvulso)}
            className={`shrink-0 p-3.5 rounded-3xl border flex items-center justify-center transition-colors ${showAvulso ? "bg-green-700-hover text-white border-green-700" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 shadow-sm"}`}
          >
            {" "}
            <Plus size={22} />{" "}
          </button>{" "}
        </div>{" "}
        {showAvulso && (
          <div className="mb-6 p-4 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
            {" "}
            <div className="bg-green-50 p-3 rounded-full text-green-700 dark:text-green-500">
              <CreditCard size={20} />
            </div>{" "}
            <div className="relative flex-1">
              {" "}
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-zinc-500 dark:text-zinc-400">
                R$
              </span>{" "}
              <input
                type="tel"
                autoFocus
                placeholder="0,00"
                value={avulsoVal}
                onChange={(e) => {
                  const numericStr = e.target.value.replace(/\D/g, "");
                  if (!numericStr) {
                    setAvulsoVal("");
                    return;
                  }
                  const val = parseInt(numericStr, 10) / 100;
                  setAvulsoVal(
                    val.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }),
                  );
                }}
                className="w-full bg-transparent pl-7 pr-2 py-1 outline-none font-bold text-[20px] text-zinc-900 dark:text-zinc-100"
                onKeyDown={(e) => e.key === "Enter" && handleAvulsoAdd()}
              />{" "}
            </div>{" "}
            <button
              onClick={handleAvulsoAdd}
              className="bg-green-700-hover text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-md active:scale-[0.97] transition-transform duration-150"
            >
              Adicionar
            </button>{" "}
          </div>
        )}{" "}
        {/* ITEMS LIST */}{" "}
        <div className="flex flex-col gap-6">
          {" "}
          {Object.entries<Item[]>(itemsByCategory)
            .sort(([catA], [catB]) => catA.localeCompare(catB))
            .map(([category, catItems]) => {
              const catSubtotal = catItems.reduce(
                (acc, item) =>
                  acc +
                  (typeof item.actualPrice === "number"
                    ? item.actualPrice
                    : 0) *
                    (typeof item.qty === "number" ? item.qty : 1),
                0,
              );
              return (
                <div key={category} className="space-y-3">
                  {" "}
                  <div className="flex items-center gap-3 px-2">
                    {" "}
                    <h3 className="text-[14px] font-bold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {CATEGORY_EMOJI_UPDATED[category] || "🛒"} {category}
                    </h3>{" "}
                    <div className="flex-1 border-t border-dashed border-zinc-200 dark:border-zinc-800"></div>{" "}
                    {catSubtotal > 0 && (
                      <div className="text-[14px] font-bold text-green-700 dark:text-green-500 whitespace-nowrap">
                        {" "}
                        R${" "}
                        {catSubtotal.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                      </div>
                    )}{" "}
                  </div>{" "}
                  <div className="flex flex-col gap-3">
                    {" "}
                    {catItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-3xl border transition-all duration-500 ease-out flex gap-3 items-center ${
                          item.isBought
                            ? "bg-transparent border-dashed border-zinc-200 dark:border-zinc-800 opacity-40 scale-[0.98]"
                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm opacity-100 scale-100"
                        }`}
                      >
                        {" "}
                        {/* HUGE CHECK TARGET */}{" "}
                        <button
                          onClick={() => toggleBought(item.id)}
                          className={`w-[52px] h-[52px] shrink-0 rounded-full flex items-center justify-center transition-all ${
                            item.isBought
                              ? "bg-green-700 border-none"
                              : "bg-transparent border-[3px] border-zinc-200 dark:border-zinc-800"
                          }`}
                        >
                          {" "}
                          {item.isBought && (
                            <Check
                              size={28}
                              strokeWidth={4}
                              className="text-white"
                            />
                          )}{" "}
                        </button>{" "}
                        <div className="flex-1 min-w-0 py-1">
                          {" "}
                          <div className="flex items-start justify-between">
                            {" "}
                            <div
                              className={`text-[17px] font-semibold leading-tight pr-2 flex-1 min-w-0 break-words ${item.isBought ? "line-through text-zinc-500 dark:text-zinc-400" : "text-zinc-900 dark:text-zinc-100"}`}
                            >
                              {" "}
                              {item.name}{" "}
                            </div>{" "}
                            {!item.isBought && (
                              <button
                                onClick={() => markNotFound(item.id)}
                                className="text-amber-500 bg-amber-50 px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0"
                              >
                                <Ban size={14} /> Não achei
                              </button>
                            )}{" "}
                          </div>{" "}
                          {/* INPUTS ROW */}{" "}
                          <div
                            className="flex items-center gap-2 mt-2.5"
                            onClick={(e) => {
                              if (item.isBought) e.stopPropagation();
                            }}
                          >
                            {" "}
                            {/* QTY */}{" "}
                            <div
                              className={`flex items-center rounded-xl p-1 shrink-0 ${item.isBought ? "bg-transparent" : "bg-transparent"}`}
                            >
                              {" "}
                              {["kg", "l"].includes(item.unit.toLowerCase()) ? (
                                <input
                                  disabled={item.isBought}
                                  type="tel"
                                  value={getQtyDisplayValue(
                                    item.qty,
                                    item.unit,
                                  )}
                                  onChange={(e) =>
                                    handleQtyChange(
                                      item.id,
                                      e.target.value,
                                      item.unit,
                                    )
                                  }
                                  className="w-[60px] bg-transparent text-center text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                                />
                              ) : (
                                <>
                                  {" "}
                                  <button
                                    disabled={item.isBought}
                                    onClick={() =>
                                      updateQtyExplicit(
                                        item.id,
                                        Math.max(0, item.qty - 1),
                                      )
                                    }
                                    className="p-1 text-zinc-500 dark:text-zinc-400 active:bg-white dark:bg-zinc-900 :bg-zinc-700 rounded-lg"
                                  >
                                    <Minus size={14} />
                                  </button>{" "}
                                  <input
                                    disabled={item.isBought}
                                    type="tel"
                                    value={getQtyDisplayValue(
                                      item.qty,
                                      item.unit,
                                    )}
                                    onChange={(e) =>
                                      handleQtyChange(
                                        item.id,
                                        e.target.value,
                                        item.unit,
                                      )
                                    }
                                    className="w-6 bg-transparent text-center text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                                  />{" "}
                                  <button
                                    disabled={item.isBought}
                                    onClick={() =>
                                      updateQtyExplicit(item.id, item.qty + 1)
                                    }
                                    className="p-1 text-zinc-500 dark:text-zinc-400 active:bg-white dark:bg-zinc-900 :bg-zinc-700 rounded-lg"
                                  >
                                    <Plus size={14} />
                                  </button>{" "}
                                </>
                              )}{" "}
                              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 pr-1">
                                {item.unit}
                              </span>{" "}
                            </div>{" "}
                            <div className="text-zinc-500 dark:text-zinc-400 font-semibold text-xs">
                              ×
                            </div>{" "}
                            {/* PRICE */}{" "}
                            <div className="relative flex-1">
                              {" "}
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                                R$
                              </span>{" "}
                              <input
                                disabled={item.isBought}
                                type="tel"
                                value={getPriceDisplayValue(
                                  item.actualPrice || 0,
                                )}
                                onChange={(e) =>
                                  handlePriceInput(item.id, e.target.value)
                                }
                                placeholder="0,00"
                                className={`w-full pl-6 pr-2 py-2 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-green-600 text-[14px] transition-colors ${
                                  item.isBought
                                    ? "bg-transparent text-zinc-500 dark:text-zinc-400"
                                    : "bg-transparent text-green-700 dark:text-green-500"
                                }`}
                              />{" "}
                            </div>{" "}
                          </div>{" "}
                          {}{" "}
                          {!item.isBought &&
                            promotions.filter(
                              (p) =>
                                p.itemName.toLowerCase().trim() ===
                                item.name.toLowerCase().trim(),
                            ).length > 0 && (
                              <div className="mt-3 flex flex-col gap-1.5 border-t border-zinc-200 dark:border-zinc-800 pt-2">
                                {" "}
                                {promotions
                                  .filter(
                                    (p) =>
                                      p.itemName.toLowerCase().trim() ===
                                      item.name.toLowerCase().trim(),
                                  )
                                  .sort((a, b) => {
                                    /* Sort by shoppingMarketId first, then by price */ if (
                                      a.marketId === shoppingMarketId &&
                                      b.marketId !== shoppingMarketId
                                    )
                                      return -1;
                                    if (
                                      b.marketId === shoppingMarketId &&
                                      a.marketId !== shoppingMarketId
                                    )
                                      return 1;
                                    return a.price / a.qty - b.price / b.qty;
                                  })
                                  .map((promo, idx) => {
                                    const market = markets.find(
                                      (m) => m.id === promo.marketId,
                                    );
                                    const precoUnitario =
                                      promo.price / promo.qty;
                                    const isCurrentMarket =
                                      promo.marketId === shoppingMarketId;
                                    return (
                                      <div
                                        key={idx}
                                        className={`flex justify-between items-center px-2.5 py-1.5 rounded-lg border ${
                                          isCurrentMarket
                                            ? "bg-green-50 border-green-100"
                                            : "bg-transparent border-zinc-200 dark:border-zinc-800"
                                        }`}
                                      >
                                        {" "}
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                          {" "}
                                          <Store
                                            size={12}
                                            className={`shrink-0 ${isCurrentMarket ? "text-green-700 dark:text-green-500" : "text-zinc-500 dark:text-zinc-400"}`}
                                          />{" "}
                                          <span
                                            className={`text-[11px] font-bold truncate ${isCurrentMarket ? "text-green-700 dark:text-green-500" : "text-zinc-500 dark:text-zinc-400"}`}
                                          >
                                            {" "}
                                            {market?.name || "Mercado"}{" "}
                                          </span>{" "}
                                        </div>{" "}
                                        <div
                                          className={`text-[12px] font-bold shrink-0 ${isCurrentMarket ? "text-green-700 dark:text-green-500" : "text-zinc-500 dark:text-zinc-400"}`}
                                        >
                                          {" "}
                                          <span className="money-value">
                                            {formatMoney(precoUnitario)}
                                          </span>
                                          <span
                                            className={`text-[9px] font-medium ${isCurrentMarket ? "text-green-700 dark:text-green-500" : "text-zinc-500 dark:text-zinc-400"}`}
                                          >
                                            /{item.unit}
                                          </span>{" "}
                                        </div>{" "}
                                      </div>
                                    );
                                  })}{" "}
                              </div>
                            )}{" "}
                        </div>{" "}
                      </div>
                    ))}{" "}
                  </div>{" "}
                </div>
              );
            })}{" "}
        </div>{" "}
        {/* NOT FOUND SECTION */}{" "}
        {items.filter((i) => i.notFound).length > 0 && (
          <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            {" "}
            <h3 className="text-[12px] font-bold text-red-500 mb-3 px-2 flex items-center gap-2">
              {" "}
              <Ban size={14} strokeWidth={3} /> Itens Não Encontrados (
              {items.filter((i) => i.notFound).length}){" "}
            </h3>{" "}
            <div className="flex flex-wrap gap-2">
              {" "}
              {items
                .filter((i) => i.notFound)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      setItems(
                        items.map((i) =>
                          i.id === item.id ? { ...i, notFound: false } : i,
                        ),
                      )
                    }
                    className="text-[13px] font-medium max-w-full bg-red-50 text-red-600 px-3 py-1.5 rounded-xl border border-red-100 flex items-center gap-2 hover:bg-red-100 transition-colors"
                  >
                    {" "}
                    <span className="line-through opacity-70 flex-1 min-w-0 break-words text-left">
                      {item.name}
                    </span>{" "}
                    <Plus size={14} className="shrink-0" />{" "}
                  </button>
                ))}{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* FLOAT BUTTON FINALIZAR COMPRA */}{" "}
      <div className="fixed bottom-20 left-0 w-full flex justify-center z-40 pointer-events-none px-4">
        {" "}
        <button
          onClick={() => setShowFinishConfirm(true)}
          className="pointer-events-auto bg-transparent text-white px-6 py-3.5 rounded-full font-bold text-[15px] shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center gap-2 hover:scale-105 transition-transform"
        >
          {" "}
          <ShoppingBag size={18} /> Finalizar Compra{" "}
        </button>{" "}
      </div>{" "}
      {/* CONFIRM FINISH PURCHASE MODAL */}{" "}
      {showFinishConfirm && (
        <div
          className="fixed inset-0 z-[110] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowFinishConfirm(false)}
        >
          {" "}
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <div className="w-16 h-16 bg-green-50 text-green-700 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              {" "}
              <ShoppingBag size={32} />{" "}
            </div>{" "}
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Finalizar e Salvar?
            </h3>{" "}
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">
              Sua compra será salva no histórico e os itens do carrinho atual
              serão desmarcados.
            </p>{" "}
            <div className="flex gap-3">
              {" "}
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-3 rounded-3xl font-bold text-zinc-500 dark:text-zinc-400 bg-transparent"
              >
                Voltar
              </button>{" "}
              <button
                onClick={finishPurchase}
                className="flex-1 py-3 rounded-3xl font-bold text-white bg-green-700 hover:bg-green-700-hover"
              >
                Sim, Finalizar
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
      <AnimatePresence>
        {" "}
        {purchaseSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-gradient-to-b from-emerald-600 via-emerald-500 to-teal-500 flex flex-col items-center justify-center p-8"
          >
            {" "}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="text-7xl mb-6"
            >
              {" "}
              🎉{" "}
            </motion.div>{" "}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-white text-center mb-1"
            >
              {" "}
              Compra Finalizada!{" "}
            </motion.h1>{" "}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-green-100 font-medium mb-8"
            >
              {" "}
              no {purchaseSummary.marketName}{" "}
            </motion.p>{" "}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              {" "}
              <div className="text-center mb-4">
                {" "}
                <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  {" "}
                  Total da Compra{" "}
                </div>{" "}
                <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {" "}
                  <span className="money-value">
                    {formatMoney(purchaseSummary.total)}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3">
                {" "}
                <div className="flex justify-between text-sm">
                  {" "}
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Itens comprados
                  </span>{" "}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {" "}
                    {purchaseSummary.itemCount}{" "}
                  </span>{" "}
                </div>{" "}
                {purchaseSummary.economy > 0 && (
                  <div className="flex justify-between text-sm">
                    {" "}
                    <span className="text-zinc-500 dark:text-zinc-400">
                      💰 Economia
                    </span>{" "}
                    <span className="font-bold text-violet-600">
                      {" "}
                      <span className="money-value">
                        {formatMoney(purchaseSummary.economy)}
                      </span>{" "}
                    </span>{" "}
                  </div>
                )}{" "}
                {context.settings.budget > 0 &&
                  purchaseSummary.total < context.settings.budget && (
                    <div className="bg-green-50 rounded-2xl p-3 text-center mt-2">
                      {" "}
                      <span className="text-sm font-semibold text-green-700 dark:text-green-500">
                        {" "}
                        🎯 Ficou{" "}
                        <span className="money-value">
                          {formatMoney(
                            context.settings.budget - purchaseSummary.total,
                          )}
                        </span>{" "}
                        abaixo do orçamento!{" "}
                      </span>{" "}
                    </div>
                  )}{" "}
              </div>{" "}
            </motion.div>{" "}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={() => {
                setPurchaseSummary(null);
                setItems(
                  items.map((i: Item) => ({
                    ...i,
                    isBought: false,
                    actualPrice: 0,
                    notFound: false,
                  })),
                );
                setShowFinishConfirm(false);
                context.setActiveTab("lista");
              }}
              className="mt-8 bg-white dark:bg-zinc-900/20 backdrop-blur text-white font-bold py-4 px-12 rounded-full text-lg active:scale-[0.97] transition-transform shadow-lg"
            >
              {" "}
              Voltar para Lista{" "}
            </motion.button>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
