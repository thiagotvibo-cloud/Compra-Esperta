import React from 'react';
import { AppContextType} from '../types';
import { Moon, Sun, History, ShoppingBag, Store, Trash2, Share, AlertTriangle} from 'lucide-react';
import { formatMoney} from '../utils';

export const MenuExtra: React.FC<{ context: AppContextType}> = ({ context}) => {
 const { settings, setSettings, items, markets, promotions, setItems, setMarkets, setPromotions, history, setHistory} = context;

 const [showResetConfirm, setShowResetConfirm] = React.useState(false);

 const handleShareList = async () => {
 if (items.length === 0) return alert('Sua lista está vazia.');
 const text ="Lista de Compras:\n"+ items.map(i => `- ${i.qty}${(i.unit && i.unit !== 'un') ? i.unit : ''} ${i.name}`).join("\n");
 if (navigator.share) {
 navigator.share({ title: 'Lista de Compras', text}).catch(console.error);
} else {
 navigator.clipboard.writeText(text);
 alert('Lista copiada para a área de transferência!');
}
};

 const executeFactoryReset = () => {
 localStorage.clear();
 window.location.reload();
};

 const hasHistory = history.length> 0;
 // Pega as 5 ultimas compras, inverte pra ficar cronológico (mais antigo primeiro, mais novo no final do array pra gráfico da equerda p direita)
 const chartData = [...history].slice(0, 5).reverse();
 const maxHistorySpent = chartData.reduce((acc, h) => Math.max(acc, h.totalSpent), 0);
 const chartMax = settings.budget> maxHistorySpent ? settings.budget : maxHistorySpent;

 return (
 <div className="pb-28 bg-soft-bg dark:bg-black min-h-screen">
 
 {/* HEADER */}
 <div className="bg-gradient-to-br from-emerald-500 to-teal-400 rounded-b-[40px] geometric-bg pt-[calc(env(safe-area-inset-top)+32px)] pb-16 px-6 text-white shadow-primary z-10 relative">
 <div className="geometric-circle"style={{ width: 120, height: 120, top: -20, right: -20}}></div>
 <div className="geometric-circle"style={{ width: 80, height: 80, bottom: 20, right: 40, backgroundColor:"rgba(255,255,255,0.05)"}}></div>
 <div className="flex justify-between items-center relative z-10">
 <h2 className="text-[24px] font-bold tracking-tight flex items-center gap-2">
 Ajustes & Dados
 </h2>
 </div>
 <p className="text-emerald-50 mt-2 text-[13px] font-medium relative z-10 pr-10">
 Configure preferências de uso, meta de gastos e gerencie seus dados locais.
 </p>
 </div>

 <div className="px-4 lg:px-6 -mt-8 relative z-20 flex flex-col space-y-5">
 
 {/* COMPARTILHAR */}
 <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm text-center">
 <button onClick={handleShareList} className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-3xl transition-all active:scale-[0.97] transition-transform duration-150 shadow-sm">
 <Share size={20} /> Compartilhar Lista em Texto
 </button>
 </div>

 {/* AJUSTES GERAIS */}
 <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl space-y-4 shadow-sm">
 <h3 className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-500 mb-2">Preferências de Compra</h3>
 
 <div>
 <label className="block text-[11px] font-semibold text-zinc-500 mb-2">Orçamento / Teto de Gastos (R$)</label>
 <div className="relative">
 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-zinc-400">R$</span>
 <input type="number"step="0.01"value={settings.budget || ''} onChange={e => setSettings({...settings, budget: Number(e.target.value)})} placeholder="Ex: 500.00"className="w-full pl-10 pr-4 py-3.5 bg-zinc-100 dark:bg-zinc-800 border-none rounded-3xl ring-0 focus:ring-2 focus:ring-emerald-500 font-bold text-[16px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"/>
 </div>
 </div>

 <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
 <span className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-400">Modo Escuro</span>
 <button 
 onClick={() => setSettings({...settings, darkMode: !settings.darkMode})}
 className={`p-3 rounded-3xl transition-all ${settings.darkMode ? 'bg-zinc-800 text-emerald-400 border border-zinc-700' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'}`}
>
 {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
 </button>
 </div>
 </div>

 {/* MEUS MERCADOS */}
 <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl space-y-4 shadow-sm">
 <h3 className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-500 flex items-center gap-2">
 <Store size={16} /> Meus Mercados
 </h3>
 {markets.length === 0 && <p className="text-[13px] text-zinc-400 text-center py-4">Nenhum mercado cadastrado.</p>}
 <div className="space-y-2">
 {markets.map(m => (
 <div key={m.id} className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-800">
 <span className="font-bold text-[14px] text-zinc-900 dark:text-zinc-100">{m.name}</span>
 <button onClick={() => {
 setMarkets(markets.filter(x => x.id !== m.id));
 setPromotions(promotions.filter(p => p.marketId !== m.id));
}} className="text-zinc-400 hover:text-red-500 p-2 transition-colors active:scale-[0.97] transition-transform duration-150">
 <Trash2 size={18} />
 </button>
 </div>
 ))}
 </div>
 </div>

 
 {/* CARD DE INSIGHTS E HISTÓRICO */}
 {(() => {
 const totalSpentAllTime = context.history.reduce((acc, h) => acc + h.totalSpent, 0);
 const totalEconomy = context.history.reduce((acc, h) => acc + h.economyGenerated, 0);
 const avgPerPurchase = context.history.length> 0 ? totalSpentAllTime / context.history.length : 0;
 
 const badges = [
 { emoji: '🛒', name: 'Primeira Compra', unlocked: (context.settings.purchaseCount || 0)>= 1},
 { emoji: '🔥', name: '7 dias seguidos', unlocked: (context.settings.streak || 0)>= 7},
 { emoji: '💰', name: 'Economizou R$100', unlocked: (context.settings.totalSaved || 0)>= 100},
 { emoji: '🏆', name: 'Economizou R$500', unlocked: (context.settings.totalSaved || 0)>= 500},
 { emoji: '⭐', name: '10 Compras', unlocked: (context.settings.purchaseCount || 0)>= 10},
 ];

 return (
 <div className="mb-6">
 
 {/* BADGES */}
 <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 mb-6 shadow-sm">
 <h3 className="text-[12px] font-bold text-zinc-400 mb-4 flex items-center gap-2">
 🏅 SUAS CONQUISTAS
 </h3>
 <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
 {badges.map((badge, idx) => (
 <div key={idx} className="flex flex-col items-center text-center gap-1.5">
 <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${badge.unlocked ? 'bg-violet-100 text-violet-600' : 'bg-zinc-100 grayscale opacity-40'}`}>
 {badge.emoji}
 </div>
 <div className={`text-[9px] font-bold leading-tight ${badge.unlocked ? 'text-violet-700 dark:text-violet-400' : 'text-zinc-400'}`}>
 {badge.name}
 </div>
 </div>
 ))}
 </div>
 </div>
 
 <div className="grid grid-cols-3 gap-3 mb-6">
 <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-3 text-center shadow-sm">
 <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{context.history.length}</div>
 <div className="text-[10px] font-semibold text-emerald-600/70 mt-0.5">Compras</div>
 </div>
 <div className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-3 text-center shadow-sm">
 <div className="text-xl font-bold text-violet-700 dark:text-violet-400"><span className="money-value">{formatMoney(totalEconomy)}</span></div>
 <div className="text-[10px] font-semibold text-violet-600/70 mt-0.5">Economia</div>
 </div>
 <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3 text-center shadow-sm">
 <div className="text-xl font-bold text-blue-700 dark:text-blue-400"><span className="money-value">{formatMoney(avgPerPurchase)}</span></div>
 <div className="text-[10px] font-semibold text-blue-600/70 mt-0.5">Média</div>
 </div>
 </div>
 
 <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
 <h3 className="text-[12px] font-bold text-zinc-400 mb-4 flex items-center gap-2">
 📊 HISTÓRICO RECENTE
 </h3>
 
 {context.history.length === 0 ? (
 <p className="text-sm text-zinc-400 text-center py-6">
 Nenhuma compra finalizada ainda.
 </p>
 ) : (
 <div className="space-y-3">
 {context.history.slice(0, 5).map(h => {
 const market = context.markets.find(m => m.id === h.marketId);
 const dateStr = new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short'});
 
 return (
 <div key={h.id} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
 <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-sm shrink-0">
 {dateStr.split(' ')[0]}
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
 {market?.name || 'Mercado'}
 </div>
 <div className="text-xs text-zinc-500">
 {h.items.length} itens · {dateStr}
 </div>
 </div>
 <div className="text-right shrink-0">
 <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
 <span className="money-value">{formatMoney(h.totalSpent)}</span>
 </div>
 {h.economyGenerated> 0 && (
 <div className="text-xs font-semibold text-violet-500">
 -<span className="money-value">{formatMoney(h.economyGenerated)}</span>
 </div>
 )}
 </div>
 </div>
 );
})}
 
 <button onClick={() => { 
 if (window.confirm('Apagar todo o histórico?')) 
 context.setHistory([]);
}}
 className="text-sm text-red-400 hover:text-red-500 font-medium mt-4 w-full text-center transition-colors">
 Limpar Histórico
 </button>
 </div>
 )}
 </div>
 </div>
 );
})()}


 {/* CONTROLES DE DADOS LOCAIS */}
 <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm text-center">
 <h3 className="text-[11px] font-semibold text-zinc-500 mb-3 flex items-center gap-2 justify-center">
 <AlertTriangle size={16} /> Zona de Perigo
 </h3>
 <button onClick={() => setShowResetConfirm(true)} className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-4 rounded-3xl transition-all active:scale-[0.97] transition-transform duration-150 border border-red-100 dark:border-red-900/30">
 <Trash2 size={20} /> Factory Reset (Apagar Tudo)
 </button>
 <p className="text-[10px] mt-3 font-medium text-zinc-400">
 Todas as listas, mercados e históricos salvos no dispositivo serão perdidos para sempre.
 </p>
 </div>

 <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm">
 <button 
 onClick={async () => {
 const { supabase} = await import('../lib/supabase');
 await supabase.auth.signOut();
}}
 className="w-full p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors font-semibold rounded-3xl active:scale-[0.97] transition-transform duration-150"
>
 Sair da Conta (Supabase)
 </button>
 </div>

 </div>

 {/* RESET CONFIRM MODAL */}
 {showResetConfirm && (
 <div className="fixed inset-0 z-[110] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"onClick={() => setShowResetConfirm(false)}>
 <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-xl text-center"onClick={e => e.stopPropagation()}>
 <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
 <AlertTriangle size={32} />
 </div>
 <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Atenção!</h3>
 <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">Você perderá TODOS os dados locais (lista, mercados, ofertas, histórico). Tem certeza?</p>
 <div className="flex gap-3">
 <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 rounded-3xl font-bold text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300">Cancelar</button>
 <button onClick={executeFactoryReset} className="flex-1 py-3 rounded-3xl font-bold text-white bg-red-500 hover:bg-red-600">Sim, Apagar</button>
 </div>
 </div>
 </div>
 )}

 </div>
 );
};
