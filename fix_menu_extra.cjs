const fs = require('fs');

const code = `import React, { useState } from "react";
import { AppContextType } from "../types";
import { 
  Sun, 
  Moon, 
  Store, 
  Trash2, 
  AlertTriangle, 
  Wallet,
  Trophy,
  History,
  TrendingDown,
  LogOut,
  Target
} from "lucide-react";
import { formatMoney } from "../utils";
import { PageHeader } from "./ui/PageHeader";

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
      <PageHeader 
        title="Planejamento" 
        subtitle="Orçamento, metas e dados" 
      />

      <div className="px-6 mt-4 relative z-20 pb-24 space-y-8">
        
        {/* SECTION: ORÇAMENTO & METAS */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Target size={16} /> Metas & Orçamento
            </h2>
            <button
              onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
              className={\`p-2 rounded-full transition-colors \${settings.darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-600"}\`}
              title="Alternar Tema"
            >
              {settings.darkMode ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[24px] p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                <Wallet className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div className="flex-1">
                <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Orçamento de Compras (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.budget || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, budget: Number(e.target.value) })
                  }
                  placeholder="Ex: 500.00"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-[18px] text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: ESTATÍSTICAS E CONQUISTAS */}
        <section>
          <div className="flex items-center mb-3 px-1">
            <h2 className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Trophy size={16} /> Estatísticas
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[20px] p-4 shadow-sm flex flex-col justify-center">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Total Economizado</span>
              <div className="text-[22px] font-bold text-green-600 dark:text-green-500 flex items-center gap-1.5">
                <TrendingDown size={20} className="opacity-70" />
                <span className="money-value">{formatMoney(totalEconomy)}</span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[20px] p-4 shadow-sm flex flex-col justify-center">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Média por Compra</span>
              <div className="text-[22px] font-bold text-slate-800 dark:text-slate-200">
                <span className="money-value">{formatMoney(avgPerPurchase)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[24px] p-5 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-4">Conquistas</span>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x scrollbar-hide">
              {badges.map((badge, idx) => (
                <div
                  key={idx}
                  className={\`snap-center shrink-0 w-20 flex flex-col items-center text-center gap-2 \${badge.unlocked ? "" : "opacity-40 grayscale"}\`}
                >
                  <div className={\`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 \${badge.unlocked ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-600" : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"}\`}>
                    {badge.emoji}
                  </div>
                  <div className={\`text-[10px] font-bold leading-tight \${badge.unlocked ? "text-slate-800 dark:text-slate-200" : "text-slate-500"}\`}>
                    {badge.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: MEUS MERCADOS */}
        <section>
          <div className="flex items-center mb-3 px-1">
            <h2 className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Store size={16} /> Meus Mercados
            </h2>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[24px] overflow-hidden shadow-sm">
            {markets.length === 0 ? (
              <p className="text-[13px] text-slate-500 dark:text-slate-400 text-center py-6">
                Nenhum mercado cadastrado.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {markets.map((m) => (
                  <div
                    key={m.id}
                    className="flex justify-between items-center p-4 bg-transparent"
                  >
                    <span className="font-bold text-[15px] text-slate-800 dark:text-slate-200">
                      {m.name}
                    </span>
                    <button
                      onClick={() => {
                        setMarkets(markets.filter((x) => x.id !== m.id));
                        setPromotions(promotions.filter((p) => p.marketId !== m.id));
                      }}
                      className="text-slate-400 hover:text-red-500 p-2 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SECTION: HISTÓRICO RECENTE */}
        <section>
          <div className="flex items-center mb-3 px-1">
            <h2 className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <History size={16} /> Histórico Recente
            </h2>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[24px] p-2 shadow-sm">
            {context.history.length === 0 ? (
              <p className="text-[13px] text-slate-500 dark:text-slate-400 text-center py-6">
                Nenhuma compra finalizada.
              </p>
            ) : (
              <div className="space-y-1">
                {context.history.slice(0, 5).map((h) => {
                  const market = context.markets.find((m) => m.id === h.marketId);
                  const dateObj = new Date(h.date);
                  return (
                    <div
                      key={h.id}
                      className="flex items-center gap-3 p-3 bg-transparent rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-0.5">{dateObj.toLocaleDateString("pt-BR", { month: "short" })}</span>
                        <span className="text-[16px] font-bold text-slate-700 dark:text-slate-300 leading-none">{dateObj.getDate()}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200 truncate">
                          {market?.name || "Mercado"}
                        </div>
                        <div className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                          {h.items.length} itens comprados
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <div className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
                          <span className="money-value">
                            {formatMoney(h.totalSpent)}
                          </span>
                        </div>
                        {h.economyGenerated > 0 && (
                          <div className="text-[11px] font-bold text-green-600 dark:text-green-500">
                            -{formatMoney(h.economyGenerated)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={() => {
                    if (window.confirm("Apagar todo o histórico?"))
                      context.setHistory([]);
                  }}
                  className="text-[13px] text-red-500 hover:text-red-600 font-bold mt-2 py-3 w-full text-center transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  Limpar Histórico
                </button>
              </div>
            )}
          </div>
        </section>

        {/* SECTION: CONFIGURAÇÕES DE CONTA & ZONA DE PERIGO */}
        <section className="pt-4 space-y-3">
          <button
            onClick={async () => {
              const { supabase } = await import("../lib/supabase");
              await supabase.auth.signOut();
            }}
            className="w-full flex items-center justify-center gap-2 p-4 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors font-bold text-[14px] rounded-[20px] active:scale-[0.98]"
          >
            <LogOut size={18} /> Sair da Conta
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-center gap-2 p-4 bg-transparent border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-bold text-[14px] rounded-[20px] active:scale-[0.98]"
          >
            <AlertTriangle size={18} /> Apagar Todos os Dados
          </button>
        </section>

      </div>

      {showResetConfirm && (
        <div
          className="fixed inset-0 z-[110] flex justify-center items-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in"
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-xl text-center border border-slate-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/50">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Atenção!
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-[14px] leading-relaxed">
              Você perderá TODOS os dados locais (lista, mercados, ofertas, histórico). Tem certeza?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={executeFactoryReset}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Apagar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
`
fs.writeFileSync('src/components/MenuExtra.tsx', code);
console.log('MenuExtra replaced');
