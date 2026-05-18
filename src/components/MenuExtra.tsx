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
      
      <section className="bg-white dark:bg-[zinc-900] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 lg:p-6 flex flex-col space-y-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-[14px] font-semibold uppercase tracking-[1px] text-zinc-500 flex items-center gap-2">
            <span>⚙️</span> Ajustes & Extras
          </h2>
        </div>
        
        {/* CALCULADORA DE PROPORÇÃO */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2 mb-4">
            <Calculator size={16} className="text-blue-600 dark:text-blue-500" /> Calculadora de Proporção
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Se algo custa (R$)</label>
              <input type="number" step="0.01" value={calcPrice} onChange={e=>setCalcPrice(e.target.value)} className="w-full p-3 bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1" placeholder="10.00" />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">E vem na qtd de</label>
              <input type="number" value={calcBaseQty} onChange={e=>setCalcBaseQty(e.target.value)} className="w-full p-3 bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1" placeholder="Ex: 500g" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Quanto custaria para levar (Qtd)</label>
            <input type="number" value={calcTargetQty} onChange={e=>setCalcTargetQty(e.target.value)} className="w-full p-3 bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1" placeholder="Ex: 200g" />
          </div>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-center font-semibold text-[20px] text-blue-600 dark:text-blue-400">
            {formatMoney(calcResult())}
          </div>
        </div>

        {/* AJUSTES GERAIS */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 pb-2">Preferências</h3>
          
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Orçamento Mensal/Estipulado (R$)</label>
            <input type="number" step="0.01" value={settings.budget || ''} onChange={e => setSettings({...settings, budget: Number(e.target.value)})} placeholder="Ex: 500.00" className="w-full p-3 bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-blue-600 dark:text-blue-400" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-zinc-500">Modo Escuro</span>
            <button 
              onClick={() => setSettings({...settings, darkMode: !settings.darkMode})}
              className={`p-2.5 rounded-full transition-colors ${settings.darkMode ? 'bg-blue-600 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}
            >
              {settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button 
            onClick={async () => {
              const { supabase } = await import('../lib/supabase');
              await supabase.auth.signOut();
            }}
            className="w-full p-4 bg-red-50 text-red-600 font-semibold rounded-xl"
          >
            Sair da Conta
          </button>
        </div>

      </section>
    </div>
  );
};
