import { PageHeader } from "./ui/PageHeader";
import React, { useState, useMemo, useEffect } from "react";
import { Market, Promotion, Unit, AppContextType } from "../types";
import {
  generateId,
  formatMoney,
  getPricePerBaseUnit,
  convertToBaseUnit,
  formatItemName,
} from "../utils";
import {
  Store,
  Plus,
  Calendar,
  Trash2,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PRODUCT_CATALOG } from "../data/catalog";
const UNITS: Unit[] = ["un", "kg", "g", "L", "ml", "pct"];
export const Promocoes: React.FC<{ context: AppContextType }> = ({
  context,
}) => {
  const { markets, setMarkets, promotions, setPromotions } = context;
  const [selectedMarket, setSelectedMarket] = useState<string>(
    markets[0]?.id || "",
  );
  const [newMarketName, setNewMarketName] = useState("");
  /* States para nova promoção */ const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [qty, setQty] = useState<number | string>(1);
  const [unit, setUnit] = useState<Unit>("un");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  /* States para o modal de catálogo */ const [showCatalog, setShowCatalog] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  /* Filtro */ const [promoFilter, setPromoFilter] = useState<
    "all" | "today" | "tomorrow"
  >("all");
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
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return flatCatalog.filter((i) => i.searchKey.includes(query));
  }, [searchQuery, flatCatalog]);
  const handlePriceInput = (inputValue: string) => {
    const numericStr = inputValue.replace(/\D/g, "");
    if (!numericStr) {
      setPrice(0);
      return;
    }
    const newPrice = parseInt(numericStr, 10) / 100;
    setPrice(newPrice);
  };
  const getPriceDisplayValue = (val: number) => {
    if (!val) return "";
    return val.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  const handleAddFromCatalog = (name: string) => {
    setItemName(name);
    setShowCatalog(false);
    setSearchQuery("");
  };
  const handleAddMarket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarketName.trim()) return;
    const newMarket: Market = { id: generateId(), name: newMarketName.trim() };
    setMarkets([...markets, newMarket]);
    setSelectedMarket(newMarket.id);
    setNewMarketName("");
  };
  const handleAddPromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || price <= 0 || !selectedMarket) return;
    if (editingPromoId) {
      setPromotions(
        promotions.map((p) =>
          p.id === editingPromoId
            ? {
                ...p,
                marketId: selectedMarket,
                itemName: itemName.trim(),
                price,
                qty: Number(qty) || 1,
                unit,
                expiryDate,
                notes: notes.trim(),
              }
            : p,
        ),
      );
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
        notes: notes.trim(),
      };
      setPromotions([newPromo, ...promotions]);
    }
    setItemName("");
    setPrice(0);
    setQty(1);
    setNotes("");
    setExpiryDate("");
  };
  const handleEditPromo = (promo: Promotion) => {
    setEditingPromoId(promo.id);
    setSelectedMarket(promo.marketId);
    setItemName(promo.itemName);
    setPrice(promo.price);
    setQty(promo.qty);
    setUnit(promo.unit);
    setExpiryDate(promo.expiryDate || "");
    setNotes(promo.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancelEdit = () => {
    setEditingPromoId(null);
    setItemName("");
    setPrice(0);
    setQty(1);
    setNotes("");
    setExpiryDate("");
  };
  const removeMarket = (id: string) => {
    setMarkets(markets.filter((m) => m.id !== id));
    setPromotions(promotions.filter((p) => p.marketId !== id));
    if (selectedMarket === id) setSelectedMarket("");
  };
  const [animateChart, setAnimateChart] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimateChart(true), 300);
    return () => clearTimeout(t);
  }, []);
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const filteredPromos = useMemo(() => {
    return promotions.filter((p) => {
      if (promoFilter === "today") return p.expiryDate === todayStr;
      if (promoFilter === "tomorrow") return p.expiryDate === tomorrowStr;
      return true;
    });
  }, [promotions, promoFilter, todayStr, tomorrowStr]);
  return (
    <div className="pb-28 bg-transparent min-h-screen">
      {" "}
      {/* HEADER */}{" "}
      <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-b-[40px] overflow-hidden relative pt-[calc(env(safe-area-inset-top)+32px)] pb-20 px-6 text-white shadow-primary z-10 relative">
        {" "}
        <div className="absolute rounded-full border-[12px] border-white/10" style={{ width: 280, height: 280, top: -100, left: -100 }}></div>
        <div className="absolute rounded-full bg-black/10" style={{ width: 140, height: 140, bottom: -20, right: -20 }}></div>
        {" "}
        <div className="flex justify-between items-center relative z-10">
          {" "}
          <h2 className="text-[24px] font-bold tracking-tight flex items-center gap-2">
            {" "}
            Ofertas & Mercados{" "}
          </h2>{" "}
        </div>{" "}
        <p className="text-green-50 mt-2 text-[13px] font-medium relative z-10 pr-10 mb-5">
          {" "}
          Gerencie as ofertas que encontrou e organize por supermercado.{" "}
        </p>{" "}
      </div>{" "}
      <div className="px-6 mt-4 relative z-20">
        {" "}
        {/* SELETOR DE MERCADO */}{" "}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl mb-6 shadow-sm border border-slate-200 dark:border-zinc-800">
          {" "}
          <label className="block text-[12px] font-semibold mb-3 text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            {" "}
            <Store size={18} className="text-green-700 dark:text-green-500" /> Selecione o
            Mercado{" "}
          </label>{" "}
          <div className="flex gap-2">
            {" "}
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="flex-1 px-4 py-3.5 bg-transparent border-none rounded-3xl font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-600 shadow-inner appearance-none"
            >
              {" "}
              <option value="" disabled>
                {" "}
                -- Escolha um mercado --{" "}
              </option>{" "}
              {markets.map((m) => (
                <option key={m.id} value={m.id}>
                  {" "}
                  {m.name}{" "}
                </option>
              ))}{" "}
            </select>{" "}
            {selectedMarket && (
              <button
                onClick={() => removeMarket(selectedMarket)}
                className="p-3.5 text-zinc-500 dark:text-zinc-400 bg-transparent border-none hover:text-red-500 hover:bg-red-50 :bg-red-900/30 rounded-3xl transition-colors"
              >
                {" "}
                <Trash2 size={22} />{" "}
              </button>
            )}{" "}
          </div>{" "}
          <form onSubmit={handleAddMarket} className="mt-3 flex gap-2">
            {" "}
            <input
              type="text"
              value={newMarketName}
              onChange={(e) => setNewMarketName(e.target.value)}
              placeholder="Novo mercado (ex: Extra)"
              className="flex-1 min-w-0 px-4 py-3.5 bg-transparent border-none rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-600 placeholder-zinc-400 font-medium"
            />{" "}
            <button
              type="submit"
              className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 transition-colors text-white px-5 py-3.5 rounded-3xl font-semibold active:scale-[0.97] transition-transform duration-150 shadow-sm"
            >
              {" "}
              Criar{" "}
            </button>{" "}
          </form>{" "}
        </div>{" "}
        {/* CADASTRAR/EDITAR PROMOÇÃO */}{" "}
        {selectedMarket ? (
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 mb-6 shadow-sm">
            {" "}
            <h3 className="text-[13px] font-bold text-green-700 dark:text-green-500 mb-4 flex items-center gap-2">
              {" "}
              <Plus size={18} strokeWidth={3} />
              {""}{" "}
              {editingPromoId ? "Editar Oferta" : "Adicionar Nova Oferta"}{" "}
            </h3>{" "}
            <form onSubmit={handleAddPromotion} className="space-y-4">
              {" "}
              <div>
                {" "}
                <label className="block text-[11px] font-semibold mb-1.5 text-zinc-500 dark:text-zinc-400">
                  {" "}
                  Produto{" "}
                </label>{" "}
                <div
                  onClick={() => setShowCatalog(true)}
                  className={`w-full px-4 py-3.5 bg-transparent border-none rounded-3xl cursor-pointer font-semibold ${itemName ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"}`}
                >
                  {" "}
                  {itemName || "Selecionar produto..."}{" "}
                </div>{" "}
              </div>{" "}
              <div className="grid grid-cols-2 gap-3">
                {" "}
                <div>
                  {" "}
                  <label className="block text-[11px] font-semibold mb-1.5 text-zinc-500 dark:text-zinc-400">
                    {" "}
                    Preço (R$){" "}
                  </label>{" "}
                  <div className="relative">
                    {" "}
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-zinc-500 dark:text-zinc-400">
                      {" "}
                      R${" "}
                    </span>{" "}
                    <input
                      type="tel"
                      value={getPriceDisplayValue(price)}
                      onChange={(e) => handlePriceInput(e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-9 pr-4 py-3.5 bg-transparent border-none rounded-3xl font-bold text-[16px] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-600"
                      required
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-[11px] font-semibold mb-1.5 text-zinc-500 dark:text-zinc-400">
                    {" "}
                    Por (Qtd / Un){" "}
                  </label>{" "}
                  <div className="flex gap-1.5 bg-transparent rounded-3xl p-1.5 focus-within:ring-2 focus-within:ring-green-600">
                    {" "}
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={qty}
                      onChange={(e) =>
                        setQty(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className="w-1/2 px-2 py-2 bg-transparent border-none focus:outline-none font-semibold text-center text-zinc-900 dark:text-zinc-100"
                      required
                    />{" "}
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as Unit)}
                      className="w-1/2 px-1 py-2 bg-transparent border-none outline-none focus:outline-none font-semibold text-zinc-500 dark:text-zinc-400 appearance-none"
                      style={{
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                      }}
                    >
                      {" "}
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {" "}
                          {u}{" "}
                        </option>
                      ))}{" "}
                    </select>{" "}
                  </div>{" "}
                </div>{" "}

              </div>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1.5 text-zinc-500 dark:text-zinc-400">
                      Anotação
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Marca Ype..."
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-600 font-medium placeholder-zinc-400 text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1.5 text-zinc-500 dark:text-zinc-400">
                      Validade
                    </label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-600 font-medium text-zinc-900 dark:text-zinc-100 text-[14px]"
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-center -mt-2 mb-2">
                <button 
                  type="button" 
                  onClick={() => setShowAdvanced(!showAdvanced)} 
                  className="text-[11px] font-bold text-green-700 dark:text-green-500 flex items-center gap-1 uppercase tracking-wider py-1 px-3 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
                  {showAdvanced ? "Ocultar Opcionais" : "Mostrar Opcionais"}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-2 pt-2">
                {" "}
                <button
                  type="submit"
                  className="flex-1 bg-green-700 hover:bg-emerald-700 text-white p-4 rounded-3xl font-bold text-[15px] transition-transform active:scale-[0.97] transition-transform duration-150 shadow-sm"
                >
                  {" "}
                  {editingPromoId ? "Salvar Alterações" : "Salvar Oferta"}{" "}
                </button>{" "}
                {editingPromoId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="w-full sm:w-auto px-6 py-4 bg-transparent hover:bg-zinc-200 :bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-3xl font-semibold transition-colors active:scale-[0.97] transition-transform duration-150"
                  >
                    {" "}
                    Cancelar{" "}
                  </button>
                )}{" "}
              </div>{" "}
            </form>{" "}
          </div>
        ) : (
          <div className="text-center text-zinc-500 dark:text-zinc-400 pt-10 pb-10 flex flex-col items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm mb-6">
            {" "}
            <Store
              size={48}
              className="text-zinc-200 mb-4"
              strokeWidth={1.5}
            />{" "}
            <p className="font-semibold text-[15px] text-zinc-500 dark:text-zinc-400">
              {" "}
              Selecione ou adicione um mercado.{" "}
            </p>{" "}
          </div>
        )}{" "}
        {/* LISTA DE PROMOÇÕES */}{" "}
        <div className="space-y-4">
          {" "}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {" "}
            <button
              onClick={() => setPromoFilter("all")}
              className={`px-4 py-2 rounded-xl font-bold text-[12px] transition-colors shrink-0 ${promoFilter === "all" ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "bg-transparent text-zinc-500 dark:text-zinc-400"}`}
            >
              {" "}
              Todas Ofertas{" "}
            </button>{" "}
            <button
              onClick={() => setPromoFilter("today")}
              className={`px-4 py-2 rounded-xl font-bold text-[12px] transition-colors shrink-0 ${promoFilter === "today" ? "bg-red-500 text-white" : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"}`}
            >
              {" "}
              Vence Hoje{" "}
            </button>{" "}
            <button
              onClick={() => setPromoFilter("tomorrow")}
              className={`px-4 py-2 rounded-xl font-bold text-[12px] transition-colors shrink-0 ${promoFilter === "tomorrow" ? "bg-orange-500 text-white" : "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400"}`}
            >
              {" "}
              Vence Amanhã{" "}
            </button>{" "}
          </div>{" "}
          {filteredPromos.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 dark:text-zinc-400 font-medium bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              {" "}
              Não há promoções nesta aba.{" "}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {" "}
              {filteredPromos.map((promo) => {
                const base = convertToBaseUnit(promo.qty, promo.unit);
                const pricePerBase = getPricePerBaseUnit(
                  promo.price,
                  promo.qty,
                  promo.unit,
                );
                const marketName =
                  markets.find((m) => m.id === promo.marketId)?.name ||
                  "Desconhecido";
                const isExpiringToday = promo.expiryDate === todayStr;
                const isExpiringTomorrow = promo.expiryDate === tomorrowStr;
                return (
                  <div
                    key={promo.id}
                    className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex justify-between items-center gap-4 transition-all cursor-pointer active:scale-[0.97] transition-transform duration-150"
                    onClick={() => handleEditPromo(promo)}
                  >
                    {" "}
                    <div className="flex-1 min-w-0 pointer-events-none">
                      {" "}
                      <div className="flex items-center gap-2 mb-1">
                        {" "}
                        <span className="text-[10px] font-bold bg-transparent text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          {" "}
                          <Store size={10} /> {marketName}{" "}
                        </span>{" "}
                      </div>{" "}
                      <h4 className="font-bold text-[16px] text-zinc-900 dark:text-zinc-100 leading-snug break-words">
                        {" "}
                        {formatItemName(promo.itemName)}{" "}
                      </h4>{" "}
                      <div className="flex items-end gap-2 mt-1 mb-2">
                        {" "}
                        <div className="text-green-700 dark:text-green-500 font-bold text-[22px] tracking-tight leading-none">
                          {" "}
                          <span className="money-value">
                            {" "}
                            {formatMoney(promo.price)}{" "}
                          </span>{" "}
                        </div>{" "}
                      </div>{" "}
                      <div className="flex gap-2 text-[10px] font-bold mt-2 flex-wrap">
                        {" "}
                        <span className="bg-transparent text-zinc-500 dark:text-zinc-400 py-1 px-2.5 rounded-full">
                          {" "}
                          Por {promo.qty} {promo.unit}{" "}
                        </span>{" "}
                        {base.qty !== 1 && (
                          <span className="bg-orange-100 /30 text-orange-600 py-1 px-2.5 rounded-full">
                            {" "}
                            Equivale{""}{" "}
                            <span className="money-value">
                              {" "}
                              {formatMoney(pricePerBase)}{" "}
                            </span>
                            {""} / {base.unit}{" "}
                          </span>
                        )}{" "}
                      </div>{" "}
                      {(promo.notes || promo.expiryDate) && (
                        <div className="flex flex-col gap-1 mt-2">
                          {" "}
                          {promo.notes && (
                            <div className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400 mt-1 italic">
                              {" "}
                              {promo.notes}{" "}
                            </div>
                          )}{" "}
                          {promo.expiryDate && (
                            <div
                              className={`text-[11px] font-bold mt-1 flex items-center gap-1.5 px-2 py-1 rounded border inline-flex w-max ${isExpiringToday ? "bg-red-50 border-red-200 text-red-600 /20 /30" : isExpiringTomorrow ? "bg-orange-50 border-orange-200 text-orange-600 /20 /30" : "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 /50"}`}
                            >
                              {" "}
                              <Calendar size={14} />{" "}
                              {isExpiringToday
                                ? "VENCE HOJE"
                                : isExpiringTomorrow
                                  ? "VENCE AMANHÃ"
                                  : `ATÉ ${new Date(promo.expiryDate).toLocaleDateString("pt-BR", { timeZone: "UTC" })}`}{" "}
                            </div>
                          )}{" "}
                        </div>
                      )}{" "}
                    </div>{" "}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPromotions(
                          promotions.filter((p) => p.id !== promo.id),
                        );
                      }}
                      className="text-zinc-500 dark:text-zinc-400 hover:text-red-500 p-3 bg-transparent hover:bg-red-50 flex-shrink-0 rounded-xl transition-colors"
                    >
                      {" "}
                      <Trash2 size={20} />{" "}
                    </button>{" "}
                  </div>
                );
              })}{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
      {/* MODAL BOTTOM SHEET DO CATÁLOGO HIDDEN */}{" "}
      {showCatalog && (
        <div
          className="fixed inset-0 z-[100] flex justify-center items-end bg-black/40 backdrop-blur-[2px] animate-in fade-in"
          onClick={() => setShowCatalog(false)}
        >
          {" "}
          <div
            className="w-full max-w-lg bg-zinc-50 dark:bg-zinc-900 rounded-t-[32px] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-white #1C1C1E] z-10">
              {" "}
              <h2 className="text-[16px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {" "}
                Selecionar Produto{" "}
              </h2>{" "}
              <button
                onClick={() => {
                  setShowCatalog(false);
                  setSearchQuery("");
                }}
                className="p-2 bg-transparent rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100 :text-zinc-200 transition-colors"
              >
                {" "}
                <X size={20} className="w-5 h-5" />{" "}
              </button>{" "}
            </div>{" "}
            <div className="px-4 pt-4 pb-2 bg-zinc-50 dark:bg-zinc-900 sticky top-[73px] z-10">
              {" "}
              <div className="relative">
                {" "}
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
                />{" "}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar itens..."
                  className="w-full pl-10 pr-4 py-3.5 bg-white #1C1C1E] border border-zinc-200 dark:border-zinc-800 rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-600 font-semibold text-[15px] transition-colors shadow-sm placeholder-zinc-400"
                />{" "}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-500 dark:text-zinc-400 :text-zinc-200 bg-transparent rounded-full p-1"
                  >
                    {" "}
                    <X size={14} />{" "}
                  </button>
                )}{" "}
              </div>{" "}
            </div>{" "}
            <div className="overflow-y-auto p-4 space-y-3 bg-transparent">
              {" "}
              {searchQuery ? (
                searchResults.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 dark:text-zinc-400 font-medium">
                    {" "}
                    Nenhum produto encontrado.{" "}
                  </div>
                ) : (
                  <div className="bg-white #1C1C1E] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
                    {" "}
                    <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-4">
                      {" "}
                      Resultados{" "}
                    </h4>{" "}
                    <div className="flex flex-wrap gap-2">
                      {" "}
                      {searchResults.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleAddFromCatalog(item.name)}
                          className="px-4 py-2.5 bg-transparent hover:bg-green-50 :bg-emerald-900/30 text-zinc-900 dark:text-zinc-100 hoverdark:hover:text-green-500 dark:text-green-500 :text-green-500 text-[14px] font-semibold rounded-3xl transition-colors flex items-center gap-1.5 active:scale-[0.97] transition-transform duration-150"
                        >
                          {" "}
                          <Plus size={16} className="opacity-50" />{" "}
                          {item.name}{" "}
                        </button>
                      ))}{" "}
                    </div>{" "}
                  </div>
                )
              ) : (
                PRODUCT_CATALOG.map((cat, i) => {
                  const isExpanded = expandedCategory === cat.name;
                  return (
                    <div
                      key={i}
                      className="bg-white #1C1C1E] rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all shadow-sm"
                    >
                      {" "}
                      <button
                        onClick={() =>
                          setExpandedCategory(isExpanded ? null : cat.name)
                        }
                        className="w-full px-5 py-4.5 flex items-center justify-between text-left focus:outline-none"
                      >
                        {" "}
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-[15px] flex items-center gap-3">
                          {" "}
                          <span className="text-xl">{cat.icon}</span>{" "}
                          {cat.name}{" "}
                        </span>{" "}
                        {isExpanded ? (
                          <ChevronUp
                            size={22}
                            className="text-zinc-500 dark:text-zinc-400"
                          />
                        ) : (
                          <ChevronDown
                            size={22}
                            className="text-zinc-500 dark:text-zinc-400"
                          />
                        )}{" "}
                      </button>{" "}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-1 space-y-4">
                          {" "}
                          {cat.subcategories.map((sub, j) => (
                            <div key={j}>
                              {" "}
                              <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-3">
                                {" "}
                                {sub.name}{" "}
                              </h4>{" "}
                              <div className="flex flex-wrap gap-2">
                                {" "}
                                {sub.items.map((itemName, k) => (
                                  <button
                                    key={k}
                                    onClick={() =>
                                      handleAddFromCatalog(itemName)
                                    }
                                    className="px-4 py-2.5 bg-transparent hover:bg-green-50 :bg-emerald-900/30 text-zinc-900 dark:text-zinc-100 hoverdark:hover:text-green-500 dark:text-green-500 :text-green-500 text-[14px] font-semibold rounded-3xl transition-colors flex items-center gap-1.5 active:scale-[0.97] transition-transform duration-150"
                                  >
                                    {" "}
                                    <Plus size={16} className="opacity-50" />
                                    {""} {itemName}{" "}
                                  </button>
                                ))}{" "}
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
      {/* COMPARADOR VISUAL */}{" "}
      {(() => {
        const marketComparison = context.markets
          .map((market) => {
            let total = 0;
            context.items.forEach((item) => {
              const promo = context.promotions.find(
                (p) =>
                  p.marketId === market.id &&
                  p.itemName.toLowerCase() === item.name.toLowerCase(),
              );
              total += promo ? promo.price * item.qty : 15.0 * item.qty;
            });
            return { market, total };
          })
          .sort((a, b) => a.total - b.total);
        const maxTotal = Math.max(...marketComparison.map((m) => m.total));
        return (
          <div className="mt-8 px-5">
            {" "}
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              {" "}
              🏆 Comparativo de Mercados{" "}
            </h3>{" "}
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              {" "}
              Baseado nos itens da sua lista{" "}
            </p>{" "}
            {marketComparison.length < 2 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 text-center border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm">
                {" "}
                Cadastre promoções em pelo menos 2 mercados para comparar.{" "}
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                {" "}
                {marketComparison.map((entry, index) => {
                  const widthPercent =
                    maxTotal > 0 ? (entry.total / maxTotal) * 100 : 0;
                  const isWinner = index === 0;
                  return (
                    <div key={entry.market.id} className="mb-4 last:mb-0">
                      {" "}
                      <div className="flex justify-between items-baseline mb-1.5">
                        {" "}
                        <span
                          className={`text-sm font-semibold ${isWinner ? "text-green-700 dark:text-green-500" : "text-zinc-900 dark:text-zinc-100"}`}
                        >
                          {" "}
                          {isWinner && "👑"} {entry.market.name}{" "}
                        </span>{" "}
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {" "}
                          <span className="money-value">
                            {" "}
                            {formatMoney(entry.total)}{" "}
                          </span>{" "}
                        </span>{" "}
                      </div>{" "}
                      <div className="h-3 rounded-full bg-transparent overflow-hidden">
                        {" "}
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${isWinner ? "bg-gradient-to-r from-green-600 to-green-500" : "bg-zinc-300"}`}
                          style={{
                            width: animateChart ? `${widthPercent}%` : "0%",
                          }}
                        />{" "}
                      </div>{" "}
                      {isWinner && marketComparison.length > 1 && (
                        <div className="text-[11px] font-semibold text-green-700 dark:text-green-500 mt-1.5">
                          {" "}
                          Economia de{""}{" "}
                          <span className="money-value">
                            {" "}
                            {formatMoney(
                              marketComparison[marketComparison.length - 1]
                                .total - entry.total,
                            )}{" "}
                          </span>
                          {""} vs. mais caro{" "}
                        </div>
                      )}{" "}
                    </div>
                  );
                })}{" "}
              </div>
            )}{" "}
          </div>
        );
      })()}{" "}
    </div>
  );
};
