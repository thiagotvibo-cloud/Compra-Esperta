import React from 'react';
import { AppContextType } from '../types';
import { Moon, Sun } from 'lucide-react';

export const MenuExtra: React.FC<{ context: AppContextType }> = ({ context }) => {
  const { settings, setSettings, items, markets, promotions, setItems, setMarkets, setPromotions } = context;

  return (
    <div className="pb-28 bg-zinc-50 dark:bg-black min-h-screen">
      
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

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm">
          <button 
            onClick={async () => {
              const { supabase } = await import('../lib/supabase');
              await supabase.auth.signOut();
            }}
            className="w-full p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors font-semibold rounded-2xl active:scale-95"
          >
            Sair da Conta
          </button>
        </div>

      </div>
    </div>
  );
};
