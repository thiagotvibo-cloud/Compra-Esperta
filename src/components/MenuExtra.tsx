import React from 'react';
import { AppContextType } from '../types';
import { Moon, Sun } from 'lucide-react';

export const MenuExtra: React.FC<{ context: AppContextType }> = ({ context }) => {
  const { settings, setSettings, items, markets, promotions, setItems, setMarkets, setPromotions } = context;

  return (
    <div className="pb-24 p-4 lg:p-6 space-y-6">
      
      <section className="bg-soft-bg dark:bg-zinc-900 rounded-[24px] shadow-soft border-none p-5 lg:p-6 flex flex-col space-y-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-[14px] font-semibold uppercase tracking-[1px] text-soft-text-muted flex items-center gap-2">
            <span>⚙️</span> Ajustes & Extras
          </h2>
        </div>
        
        {/* AJUSTES GERAIS */}
        <div className="bg-soft-card dark:bg-zinc-800 p-6 rounded-[24px] border-none space-y-4">
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-soft-text-muted border-b border-zinc-200/50 dark:border-zinc-700 pb-3">Preferências</h3>
          
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-soft-text-muted mb-2 mt-2">Orçamento Mensal/Estipulado (R$)</label>
            <input type="number" step="0.01" value={settings.budget || ''} onChange={e => setSettings({...settings, budget: Number(e.target.value)})} placeholder="Ex: 500.00" className="w-full p-4 bg-soft-bg dark:bg-zinc-700/50 border-none rounded-[20px] ring-0 focus:ring-2 focus:ring-soft-primary font-semibold text-soft-primary" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-soft-text-muted">Modo Escuro</span>
            <button 
              onClick={() => setSettings({...settings, darkMode: !settings.darkMode})}
              className={`p-3 rounded-full transition-colors ${settings.darkMode ? 'bg-soft-primary text-white' : 'bg-soft-bg dark:bg-zinc-700 text-soft-text-muted'}`}
            >
              {settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button 
            onClick={async () => {
              const { supabase } = await import('../lib/supabase');
              await supabase.auth.signOut();
            }}
            className="w-full p-4 bg-red-50 dark:bg-red-900/20 text-red-500 font-semibold rounded-full active:scale-95 transition-transform"
          >
            Sair da Conta
          </button>
        </div>

      </section>
    </div>
  );
};
