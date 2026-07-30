import React, { useState } from "react";
import { AppContextType } from "../types";
import { ChefHat, X, Calculator, ShoppingBag, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatMoney } from "../utils";

export const ModoMarmiteiro: React.FC<{ context: AppContextType }> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Inputs
  const [budget, setBudget] = useState(context.settings.budget || 500);
  const [people, setPeople] = useState(1);
  const [mealsPerDay, setMealsPerDay] = useState(2);
  const [days, setDays] = useState(5); // 5 days, 7 days, 30 days
  const [portion, setPortion] = useState<"pequena" | "media" | "grande">("media");
  const [stockDays, setStockDays] = useState(0);
  
  const [essentials, setEssentials] = useState({
    carb: true,
    protein: true,
    beans: true,
    veg: true
  });

  const portions = {
    pequena: { carb: 100, protein: 100, beans: 50, veg: 100 },
    media: { carb: 150, protein: 150, beans: 100, veg: 100 },
    grande: { carb: 200, protein: 200, beans: 100, veg: 150 }
  };

  const prices = {
    carb: 6, // Arroz/Macarrão R$6/kg
    protein: 25, // Carne/Frango R$25/kg
    beans: 8, // Feijão R$8/kg
    veg: 10 // Legumes R$10/kg
  };

  // Calculations
  const effectiveDays = Math.max(0, days - stockDays);
  const totalMeals = effectiveDays * people * mealsPerDay;
  const portionData = portions[portion];

  const calcKg = (g: number) => (totalMeals * g) / 1000;
  
  const needs = {
    carb: essentials.carb ? calcKg(portionData.carb) : 0,
    protein: essentials.protein ? calcKg(portionData.protein) : 0,
    beans: essentials.beans ? calcKg(portionData.beans) : 0,
    veg: essentials.veg ? calcKg(portionData.veg) : 0,
  };

  const costs = {
    carb: needs.carb * prices.carb,
    protein: needs.protein * prices.protein,
    beans: needs.beans * prices.beans,
    veg: needs.veg * prices.veg,
  };

  const totalCost = costs.carb + costs.protein + costs.beans + costs.veg;
  const isBudgetOk = totalCost <= budget;
  const diff = budget - totalCost;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 p-4 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-4 border-white dark:border-zinc-900"
      >
        <ChefHat size={26} />
      </button>

      {/* Modal / Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-white dark:bg-zinc-900 z-[110] rounded-t-[32px] shadow-2xl flex flex-col md:max-w-xl md:mx-auto"
            >
              <div className="flex justify-between items-center p-6 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    <ChefHat size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">Modo Marmiteiro</h2>
                    <span className="text-[12px] text-slate-500 font-medium">Calculadora de planejamento</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto p-6 space-y-6 flex-1 pb-10">
                
                {/* INputs */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Configuração Básica</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Orçamento Mensal</label>
                      <input 
                        type="number" 
                        value={budget || ""} 
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="w-full bg-transparent font-bold text-slate-900 dark:text-slate-100 outline-none text-lg"
                      />
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Pessoas</label>
                      <input 
                        type="number" 
                        min="1"
                        value={people} 
                        onChange={(e) => setPeople(Number(e.target.value))}
                        className="w-full bg-transparent font-bold text-slate-900 dark:text-slate-100 outline-none text-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Marmitas/Dia</label>
                      <input 
                        type="number" 
                        min="1"
                        value={mealsPerDay} 
                        onChange={(e) => setMealsPerDay(Number(e.target.value))}
                        className="w-full bg-transparent font-bold text-slate-900 dark:text-slate-100 outline-none text-lg"
                      />
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Dias p/ Preparar</label>
                      <input 
                        type="number" 
                        min="1"
                        value={days} 
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="w-full bg-transparent font-bold text-slate-900 dark:text-slate-100 outline-none text-lg"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block">Estoque Atual Cobre:</label>
                      <span className="text-[11px] text-slate-500">Dias que não precisa cozinhar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setStockDays(Math.max(0, stockDays - 1))} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 font-bold">-</button>
                      <span className="font-bold w-4 text-center">{stockDays}</span>
                      <button onClick={() => setStockDays(stockDays + 1)} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 font-bold">+</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Tamanho da Porção</label>
                    <div className="flex gap-2 bg-slate-100 dark:bg-zinc-800 p-1 rounded-full">
                      {(["pequena", "media", "grande"] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setPortion(p)}
                          className={`flex-1 py-2 rounded-full text-[12px] font-bold capitalize transition-all ${portion === p ? "bg-white dark:bg-zinc-700 shadow-sm text-slate-900 dark:text-slate-100" : "text-slate-500"}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">O que comprar?</label>
                    <div className="flex flex-wrap gap-2">
                      <Checkbox label="Carbo (Arroz/Massa)" checked={essentials.carb} onChange={() => setEssentials(e => ({...e, carb: !e.carb}))} />
                      <Checkbox label="Proteína (Carne/Frango)" checked={essentials.protein} onChange={() => setEssentials(e => ({...e, protein: !e.protein}))} />
                      <Checkbox label="Feijão" checked={essentials.beans} onChange={() => setEssentials(e => ({...e, beans: !e.beans}))} />
                      <Checkbox label="Legumes" checked={essentials.veg} onChange={() => setEssentials(e => ({...e, veg: !e.veg}))} />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-zinc-800" />

                {/* Results */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimativa de Custo</h3>
                    <span className="text-[10px] text-slate-400 font-medium">({totalMeals} refeições)</span>
                  </div>

                  <div className={`p-5 rounded-3xl border ${isBudgetOk ? "bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30" : "bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30"}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[12px] font-semibold text-slate-500 mb-1 block">Total Calculado</span>
                        <div className={`text-3xl font-bold ${isBudgetOk ? "text-green-700 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                          {formatMoney(totalCost)}
                        </div>
                      </div>
                      {isBudgetOk ? (
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                          <CheckCircle2 size={24} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
                          <AlertCircle size={24} />
                        </div>
                      )}
                    </div>
                    
                    {!isBudgetOk ? (
                      <div className="bg-white/60 dark:bg-black/20 p-3 rounded-2xl text-[12px] font-medium text-red-800 dark:text-red-300">
                        <strong>⚠️ Orçamento Curto!</strong> Passou {formatMoney(Math.abs(diff))} do limite.
                        <br/><br/>
                        <em>Sugestões:</em>
                        <ul className="list-disc pl-4 mt-1 opacity-90 space-y-1">
                          <li>Troque carne bovina por ovos/frango/pts.</li>
                          <li>Reduza a porção para {portion === 'grande' ? 'média' : 'pequena'}.</li>
                          <li>Prepare marmitas para {Math.max(1, days - 1)} dias ao invés de {days}.</li>
                        </ul>
                      </div>
                    ) : (
                       <div className="bg-white/60 dark:bg-black/20 p-3 rounded-2xl text-[12px] font-medium text-green-800 dark:text-green-300">
                        <strong>✅ Orçamento Suficiente!</strong> Sobram {formatMoney(diff)}.
                      </div>
                    )}
                  </div>

                  {totalCost > 0 && (
                    <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5">
                      <h4 className="text-[12px] font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <ShoppingBag size={14} /> Lista de Compras Necessária
                      </h4>
                      <div className="space-y-2">
                        {needs.carb > 0 && <NeedItem label="Arroz / Macarrão" kg={needs.carb} />}
                        {needs.protein > 0 && <NeedItem label="Carnes / Mistura" kg={needs.protein} />}
                        {needs.beans > 0 && <NeedItem label="Feijão / Leguminosa" kg={needs.beans} />}
                        {needs.veg > 0 && <NeedItem label="Legumes / Verduras" kg={needs.veg} />}
                      </div>
                    </div>
                  )}
                  
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

function Checkbox({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) {
  return (
    <label className={`flex items-center gap-2 p-2 px-3 rounded-xl border text-[12px] font-bold cursor-pointer transition-colors ${checked ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-transparent" : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-400"}`}>
      <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
      {label}
    </label>
  );
}

function NeedItem({ label, kg }: { label: string, kg: number }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400">{label}</span>
      <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100">{kg.toFixed(1)} kg</span>
    </div>
  );
}
