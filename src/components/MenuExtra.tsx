import React from 'react';
import { AppContextType } from '../types';
import { Moon, Sun, History, ShoppingBag, Store, Trash2, Share, AlertTriangle } from 'lucide-react';
import { formatMoney } from '../utils';
import { supabase } from '../lib/supabase';

export const MenuExtra: React.FC<{ context: AppContextType }> = ({ context }) => {
  const { settings, setSettings, items, markets, promotions, setItems, setMarkets, setPromotions, history, setHistory } = context;

  const handleShareList = async () => {
    if (items.length === 0) return alert('Sua lista está vazia.');
    const text = "Lista de Compras:\n" + items.map(i => `- ${i.qty}${(i.unit && i.unit !== 'un') ? i.unit : ''} ${i.name}`).join("\n");
    if (navigator.share) {
      navigator.share({ title: 'Lista de Compras', text }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert('Lista copiada para a área de transferência!');
    }
  };

  const handleFactoryReset = async () => {
    if (window.confirm("ATENÇÃO: Você perderá TODOS os dados na nuvem e local (lista, mercados, ofertas, histórico). Tem certeza?")) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('items').delete().eq('user_id', session.user.id);
        await supabase.from('markets').delete().eq('user_id', session.user.id);
        await supabase.from('promotions').delete().eq('user_id', session.user.id);
      }
      localStorage.clear();
      window.location.reload();
    }
  };

  const hasHistory = history.length > 0;
  // Pega as 5 ultimas compras, inverte pra ficar cronológico (mais antigo primeiro, mais novo no final do array pra gráfico da equerda p direita)
  const chartData = [...history].slice(0, 5).reverse();
  const maxHistorySpent = chartData.reduce((acc, h) => Math.max(acc, h.totalSpent), 0);
  const chartMax = settings.budget > maxHistorySpent ? settings.budget : maxHistorySpent;

  return (
    <div className="pb-28 bg-soft-bg dark:bg-black h-full">
      
      {/* HEADER */}
      <div className="bg-sky-400 rounded-b-[40px] pt-[calc(env(safe-area-inset-top)+32px)] pb-16 px-6 text-white shadow-primary z-10 geometric-bg relative">
         <div className="flex justify-between items-center relative z-10">
            <h2 className="text-[24px] font-bold tracking-tight flex items-center gap-2">
              Ajustes & Dados
            </h2>
         </div>
         <p className="text-sky-50 mt-2 text-[13px] font-medium relative z-10 pr-10">
           Configure preferências de uso, meta de gastos e gerencie seus dados locais.
         </p>
      </div>

      <div className="px-4 lg:px-6 -mt-8 relative z-20 flex flex-col space-y-5">
        
        {/* COMPARTILHAR */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm text-center">
            <button onClick={handleShareList} className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 shadow-sm">
              <Share size={20} /> Compartilhar Lista em Texto
            </button>
        </div>

        {/* AJUSTES GERAIS */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl space-y-4 shadow-sm">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-500 mb-2">Preferências de Compra</h3>
          
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Orçamento / Teto de Gastos (R$)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-zinc-400">R$</span>
              <input type="number" step="0.01" value={settings.budget || ''} onChange={e => setSettings({...settings, budget: Number(e.target.value)})} placeholder="Ex: 500.00" className="w-full pl-10 pr-4 py-3.5 bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl ring-0 focus:ring-2 focus:ring-sky-500 font-bold text-[16px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Modo Escuro</span>
            <button 
              onClick={() => setSettings({...settings, darkMode: !settings.darkMode})}
              className={`p-3 rounded-2xl transition-all ${settings.darkMode ? 'bg-zinc-800 text-sky-400 border border-zinc-700' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'}`}
            >
              {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>

        {/* MEUS MERCADOS */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl space-y-4 shadow-sm">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-500 flex items-center gap-2">
            <Store size={16} /> Meus Mercados
          </h3>
          {markets.length === 0 && <p className="text-[13px] text-zinc-400 text-center py-4">Nenhum mercado cadastrado.</p>}
          <div className="space-y-2">
            {markets.map(m => (
              <div key={m.id} className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                 <span className="font-bold text-[14px] text-zinc-900 dark:text-zinc-100">{m.name}</span>
                 <button onClick={() => {
                   setMarkets(markets.filter(x => x.id !== m.id));
                   setPromotions(promotions.filter(p => p.marketId !== m.id));
                 }} className="text-zinc-400 hover:text-red-500 p-2 transition-colors active:scale-95">
                   <Trash2 size={18} />
                 </button>
              </div>
            ))}
          </div>
        </div>

        {/* HISTÓRICO DE COMPRAS COM GRÁFICO */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl space-y-4 shadow-sm">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-500 flex items-center gap-2">
            <History size={16} /> Histórico de Compras (Últimas 5)
          </h3>
          
          {!hasHistory ? (
            <div className="text-center py-6 text-zinc-400 dark:text-zinc-500 font-medium text-[13px]">
              Nenhuma compra finalizada ainda.
            </div>
          ) : (
            <>
              {/* Gráfico Visual */}
              <div className="h-32 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-3 flex items-end gap-2 relative mt-4">
                {settings.budget > 0 && chartMax > 0 && (
                   <div 
                      className="absolute inset-x-0 border-t border-dashed border-red-400/50 dark:border-red-500/50 z-0 flex items-end"
                      style={{ bottom: `${(settings.budget / chartMax) * 100}%` }}
                   >
                      <span className="text-[9px] font-bold text-red-500 absolute -bottom-4 right-2 uppercase">Meta ({formatMoney(settings.budget)})</span>
                   </div>
                )}
                
                {chartData.map(item => {
                   const hPercent = chartMax > 0 ? (item.totalSpent / chartMax) * 100 : 0;
                   const isOver = settings.budget > 0 && item.totalSpent > settings.budget;

                   return (
                     <div key={item.id} className="flex-1 flex flex-col items-center gap-1 z-10 relative group">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase rotate-[-45deg] whitespace-nowrap mb-2 absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatMoney(item.totalSpent)}
                        </span>
                        <div 
                          className={`w-full rounded-t-lg transition-all ${isOver ? 'bg-red-400 dark:bg-red-500' : 'bg-sky-400 dark:bg-sky-500'}`}
                          style={{ height: `${Math.max(hPercent, 5)}%` }} // Min 5% height
                        ></div>
                        <span className="text-[9px] font-bold text-zinc-400 mt-1">{new Date(item.date).getDate()}/{new Date(item.date).getMonth()+1}</span>
                     </div>
                   );
                })}
              </div>

              <div className="space-y-3 mt-4">
                {chartData.slice().reverse().map(item => {
                   const m = markets.find(x => x.id === item.marketId);
                   return (
                      <div key={item.id} className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                         <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-[14px]">
                               {m ? m.name : 'Mercado não selecionado'}
                            </span>
                            <span className="text-[11px] font-semibold text-zinc-500">
                               {new Date(item.date).toLocaleDateString('pt-BR')}
                            </span>
                         </div>
                         <div className="flex gap-3 text-[12px] font-semibold">
                            <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                              <ShoppingBag size={14} className="text-zinc-400" />
                              Gasto: {formatMoney(item.totalSpent)}
                            </div>
                            {(item.economyGenerated || 0) > 0 && (
                               <div className="text-green-600 dark:text-green-400">
                                 Eco: {formatMoney(item.economyGenerated)}
                               </div>
                            )}
                         </div>
                         {item.items && item.items.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                               <p className="text-[10px] text-zinc-400">
                                  {item.items.slice(0, 3).map(i => `${i.quantidade}x ${i.nome}`).join(", ")}
                                  {item.items.length > 3 ? ` e mais ${item.items.length - 3}...` : ''}
                               </p>
                            </div>
                         )}
                      </div>
                   )
                })}
              </div>
            </>
          )}
        </div>

        {/* CONTROLES DE DADOS LOCAIS */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm text-center">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2 justify-center">
               <AlertTriangle size={16} /> Zona de Perigo
            </h3>
            <button onClick={handleFactoryReset} className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-4 rounded-2xl transition-all active:scale-95 border border-red-100 dark:border-red-900/30">
              <Trash2 size={20} /> Factory Reset (Apagar Tudo)
            </button>
            <p className="text-[10px] mt-3 font-medium text-zinc-400">
               Todas as listas, mercados e históricos salvos no dispositivo serão perdidos para sempre.
            </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm">
          <button 
            onClick={async () => {
              const { supabase } = await import('../lib/supabase');
              await supabase.auth.signOut();
            }}
            className="w-full p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors font-semibold rounded-2xl active:scale-95"
          >
            Sair da Conta (Supabase)
          </button>
        </div>

      </div>
    </div>
  );
};
