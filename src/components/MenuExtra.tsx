import React, { useState } from "react";
import { AppContextType } from "../types";
import { Sun, Moon, Store, Trash2, AlertTriangle } from "lucide-react";
import { formatMoney } from "../utils";
export const MenuExtra: React.FC<{ context: AppContextType }> = ({
  context,
}) => {
  const {
    settings,
    setSettings,
    markets,
    setMarkets,
    promotions,
    setPromotions,
  } = context;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const executeFactoryReset = () => {
    localStorage.clear();
    window.location.reload();
  };
  const totalSpentAllTime = context.history.reduce(
    (acc, h) => acc + h.totalSpent,
    0,
  );
  const totalEconomy = context.history.reduce(
    (acc, h) => acc + h.economyGenerated,
    0,
  );
  const avgPerPurchase =
    context.history.length > 0 ? totalSpentAllTime / context.history.length : 0;
  const badges = [
    {
      emoji: "🛒",
      name: "Primeira Compra",
      unlocked: (context.settings.purchaseCount || 0) >= 1,
    },
    {
      emoji: "🔥",
      name: "7 dias seguidos",
      unlocked: (context.settings.streak || 0) >= 7,
    },
    {
      emoji: "💰",
      name: "Economizou R$100",
      unlocked: (context.settings.totalSaved || 0) >= 100,
    },
    {
      emoji: "🏆",
      name: "Economizou R$500",
      unlocked: (context.settings.totalSaved || 0) >= 500,
    },
    {
      emoji: "⭐",
      name: "10 Compras",
      unlocked: (context.settings.purchaseCount || 0) >= 10,
    },
  ];
  return (
    <div className="pb-28 bg-transparent min-h-screen">
      {" "}
      <div className="bg-green-600 pb-24 pt-[calc(env(safe-area-inset-top)+20px)] px-6 rounded-b-[40px] relative overflow-hidden shrink-0 shadow-lg">
        <div className="absolute rounded-full border-[12px] border-white/10" style={{ width: 280, height: 280, top: -100, left: -100 }}></div>
        <div className="absolute rounded-full bg-black/10" style={{ width: 140, height: 140, bottom: -20, right: -20 }}></div>
        <div className="absolute inset-0 opacity-100 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("/pattern-dark.svg")', backgroundSize: '100px 100px', backgroundRepeat: 'repeat' }}></div>
        <h2 className="text-3xl font-extrabold text-white mb-2 relative z-10">Ajustes & Dados</h2>
        <p className="text-green-50 text-[15px] font-medium max-w-[280px] leading-snug relative z-10">Configure preferências de uso, meta de gastos e gerencie seus dados locais.</p>
      </div>
      <div className="px-4 -mt-16 relative z-20 pb-24 space-y-6">{" "}
        <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-xl mb-6">
          {" "}
          <div className="flex items-center justify-between mb-4">
            {" "}
            <span className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400">
              Orçamento / Meta (R$)
            </span>{" "}
          </div>{" "}
          <input
            type="number"
            step="0.01"
            value={settings.budget || ""}
            onChange={(e) =>
              setSettings({ ...settings, budget: Number(e.target.value) })
            }
            placeholder="Ex: 500.00"
            className="w-full pl-4 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl ring-0 focus:ring-2 focus:ring-green-600 font-bold text-[16px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
          />{" "}
        </div>{" "}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4 relative z-10">
          {" "}
          <span className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400">
            Modo Escuro
          </span>{" "}
          <button
            onClick={() =>
              setSettings({ ...settings, darkMode: !settings.darkMode })
            }
            className={`p-3 rounded-3xl transition-all ${settings.darkMode ? "bg-white dark:bg-zinc-900 text-green-700 dark:text-green-500 border border-zinc-200 dark:border-zinc-800" : "bg-transparent text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"}`}
          >
            {" "}
            {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}{" "}
          </button>{" "}
        </div> <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl space-y-4 shadow-sm">
          {" "}
          <h3 className="text-[11px] font-semibold text-green-700 dark:text-green-500 flex items-center gap-2">
            <Store size={16} /> Meus Mercados
          </h3>{" "}
          {markets.length === 0 && (
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 text-center py-4">
              Nenhum mercado cadastrado.
            </p>
          )}{" "}
          <div className="space-y-2">
            {" "}
            {markets.map((m) => (
              <div
                key={m.id}
                className="flex justify-between items-center p-3 bg-transparent rounded-3xl border border-zinc-200 dark:border-zinc-800"
              >
                {" "}
                <span className="font-bold text-[14px] text-zinc-900 dark:text-zinc-100">
                  {m.name}
                </span>{" "}
                <button
                  onClick={() => {
                    setMarkets(markets.filter((x) => x.id !== m.id));
                    setPromotions(
                      promotions.filter((p) => p.marketId !== m.id),
                    );
                  }}
                  className="text-zinc-500 dark:text-zinc-400 hover:text-red-500 p-2 transition-colors active:scale-[0.97] transition-transform duration-150"
                >
                  <Trash2 size={18} />
                </button>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
        <div className="mb-6">
          {" "}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 mb-6 shadow-sm">
            {" "}
            <h3 className="text-[12px] font-bold text-zinc-500 dark:text-zinc-400 mb-4 flex items-center gap-2">
              🏅 SUAS CONQUISTAS
            </h3>{" "}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {" "}
              {badges.map((badge, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center gap-1.5"
                >
                  {" "}
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${badge.unlocked ? "bg-violet-100 text-violet-600" : "bg-transparent grayscale opacity-40"}`}
                  >
                    {badge.emoji}
                  </div>{" "}
                  <div
                    className={`text-[9px] font-bold leading-tight ${badge.unlocked ? "text-violet-700" : "text-zinc-500 dark:text-zinc-400"}`}
                  >
                    {badge.name}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>{" "}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {" "}
            <div className="bg-green-50 rounded-2xl p-3 text-center shadow-sm">
              {" "}
              <div className="text-xl font-bold text-green-700 dark:text-green-500">
                {context.history.length}
              </div>{" "}
              <div className="text-[10px] font-semibold text-green-700 dark:text-green-500/70 mt-0.5">
                Compras
              </div>{" "}
            </div>{" "}
            <div className="bg-violet-50 rounded-2xl p-3 text-center shadow-sm">
              {" "}
              <div className="text-xl font-bold text-violet-700">
                <span className="money-value">{formatMoney(totalEconomy)}</span>
              </div>{" "}
              <div className="text-[10px] font-semibold text-violet-600/70 mt-0.5">
                Economia
              </div>{" "}
            </div>{" "}
            <div className="bg-blue-50 rounded-2xl p-3 text-center shadow-sm">
              {" "}
              <div className="text-xl font-bold text-blue-700">
                <span className="money-value">
                  {formatMoney(avgPerPurchase)}
                </span>
              </div>{" "}
              <div className="text-[10px] font-semibold text-blue-600/70 mt-0.5">
                Média
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            {" "}
            <h3 className="text-[12px] font-bold text-zinc-500 dark:text-zinc-400 mb-4 flex items-center gap-2">
              📊 HISTÓRICO RECENTE
            </h3>{" "}
            {context.history.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-6">
                Nenhuma compra finalizada ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {" "}
                {context.history.slice(0, 5).map((h) => {
                  const market = context.markets.find(
                    (m) => m.id === h.marketId,
                  );
                  const dateStr = new Date(h.date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  });
                  return (
                    <div
                      key={h.id}
                      className="flex items-center gap-3 p-3 bg-transparent rounded-2xl border border-zinc-200 dark:border-zinc-800"
                    >
                      {" "}
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-700 dark:text-green-500 font-bold text-sm shrink-0">
                        {dateStr.split("")[0]}
                      </div>{" "}
                      <div className="flex-1 min-w-0">
                        {" "}
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {market?.name || "Mercado"}
                        </div>{" "}
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {h.items.length} itens · {dateStr}
                        </div>{" "}
                      </div>{" "}
                      <div className="text-right shrink-0">
                        {" "}
                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          <span className="money-value">
                            {formatMoney(h.totalSpent)}
                          </span>
                        </div>{" "}
                        {h.economyGenerated > 0 && (
                          <div className="text-xs font-semibold text-violet-500">
                            -
                            <span className="money-value">
                              {formatMoney(h.economyGenerated)}
                            </span>
                          </div>
                        )}{" "}
                      </div>{" "}
                    </div>
                  );
                })}{" "}
                <button
                  onClick={() => {
                    if (window.confirm("Apagar todo o histórico?"))
                      context.setHistory([]);
                  }}
                  className="text-sm text-red-400 hover:text-red-500 font-medium mt-4 w-full text-center transition-colors"
                >
                  Limpar Histórico
                </button>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm text-center">
          {" "}
          <h3 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2 justify-center">
            <AlertTriangle size={16} /> Zona de Perigo
          </h3>{" "}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-3xl transition-all active:scale-[0.97] transition-transform duration-150 border border-red-100"
          >
            <Trash2 size={20} /> Factory Reset (Apagar Tudo)
          </button>{" "}
          <p className="text-[10px] mt-3 font-medium text-zinc-500 dark:text-zinc-400">
            Todas as listas, mercados e históricos salvos no dispositivo serão
            perdidos para sempre.
          </p>{" "}
        </div>{" "}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm">
          {" "}
          <button
            onClick={async () => {
              const { supabase } = await import("../lib/supabase");
              await supabase.auth.signOut();
            }}
            className="w-full p-4 bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-semibold rounded-3xl active:scale-[0.97] transition-transform duration-150"
          >
            Sair da Conta (Supabase)
          </button>{" "}
        </div>{" "}
      </div>{" "}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-[110] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowResetConfirm(false)}
        >
          {" "}
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>{" "}
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Atenção!
            </h3>{" "}
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">
              Você perderá TODOS os dados locais (lista, mercados, ofertas,
              histórico). Tem certeza?
            </p>{" "}
            <div className="flex gap-3">
              {" "}
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-3xl font-bold text-zinc-500 dark:text-zinc-400 bg-transparent"
              >
                Cancelar
              </button>{" "}
              <button
                onClick={executeFactoryReset}
                className="flex-1 py-3 rounded-3xl font-bold text-white bg-red-500 hover:bg-red-600"
              >
                Sim, Apagar
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
};
