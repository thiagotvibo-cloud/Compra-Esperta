import React, { useState } from 'react';
import { AppContextType } from '../types';
import { formatMoney } from '../utils';
import { Settings, Calculator, Moon, Sun } from 'lucide-react';

export const MenuExtra: React.FC<{ context: AppContextType }> = ({ context }) => {
  const { settings, setSettings, items, markets, promotions, setItems, setMarkets, setPromotions } = context;

  // Calculadora de proporção
  const [calcPrice, setCalcPrice] = useState<number | string>('');
  const [calcBaseQty, setCalcBaseQty] = useState<number | string>('');
  const [calcTargetQty, setCalcTargetQty] = useState<number | string>('');

  const calcResult = () => {
    const p = Number(calcPrice);
    const b = Number(calcBaseQty);
    const t = Number(calcTargetQty);
    if (b > 0 && p && t) return (p / b) * t;
    return 0;
  };

  return (
    <div className="pb-24 p-4 lg:p-6 space-y-6">
      
      <section className="bg-soft-bg dark:bg-zinc-900 rounded-[24px] shadow-soft border-none p-5 lg:p-6 flex flex-col space-y-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-[14px] font-semibold uppercase tracking-[1px] text-soft-text-muted flex items-center gap-2">
            <span>⚙️</span> Ajustes & Extras
          </h2>
        </div>
        
        {/* CALCULADORA DE PROPORÇÃO */}
        <div className="bg-soft-card dark:bg-zinc-800 p-6 rounded-[24px] border-none">
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-soft-text-muted flex items-center gap-2 mb-4">
            <Calculator size={16} className="text-soft-primary" /> Calculadora de Proporção
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-soft-text-muted dark:text-zinc-400">Se algo custa (R$)</label>
              <input type="number" step="0.01" value={calcPrice} onChange={e=>setCalcPrice(e.target.value)} className="w-full p-4 bg-soft-bg dark:bg-zinc-700/50 border-none rounded-[20px] ring-0 focus:ring-2 focus:ring-soft-primary mt-1 placeholder-zinc-300" placeholder="10.00" />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-soft-text-muted dark:text-zinc-400">E vem na qtd de</label>
              <input type="number" value={calcBaseQty} onChange={e=>setCalcBaseQty(e.target.value)} className="w-full p-4 bg-soft-bg dark:bg-zinc-700/50 border-none rounded-[20px] ring-0 focus:ring-2 focus:ring-soft-primary mt-1 placeholder-zinc-300" placeholder="Ex: 500g" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-soft-text-muted dark:text-zinc-400">Quanto custaria para levar (Qtd)</label>
            <input type="number" value={calcTargetQty} onChange={e=>setCalcTargetQty(e.target.value)} className="w-full p-4 bg-soft-bg dark:bg-zinc-700/50 border-none rounded-[20px] ring-0 focus:ring-2 focus:ring-soft-primary mt-1 placeholder-zinc-300" placeholder="Ex: 200g" />
          </div>
          <div className="mt-4 p-4 bg-soft-primary-light dark:bg-soft-primary/20 rounded-[20px] text-center font-semibold text-[20px] text-soft-primary">
            {formatMoney(calcResult())}
          </div>
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
