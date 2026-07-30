import React, { useState } from "react";
import { AppContextType } from "../types";
import { formatMoney } from "../utils";
import { PageHeader } from "./ui/PageHeader";
import { 
  Wallet, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  ChefHat,
  ArrowRight,
  TrendingUp,
  Activity,
  ChevronRight
} from "lucide-react";
import { motion } from "motion/react";
import { Cozinheiro } from "./Cozinheiro";

export const Dashboard: React.FC<{ context: AppContextType }> = ({ context }) => {
  const { history, settings, setSettings } = context;

  const [isCozinheiroOpen, setIsCozinheiroOpen] = useState(false);

  // Simulator State
  const [simBudget, setSimBudget] = useState(settings.budget || 500);
  const [simPeople, setSimPeople] = useState(1);
  const [simMealsPerDay, setSimMealsPerDay] = useState(2);

  // General Stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthHistory = history.filter(h => {
    const d = new Date(h.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const spentThisMonth = currentMonthHistory.reduce((acc, h) => acc + h.totalSpent, 0);
  const economyThisMonth = currentMonthHistory.reduce((acc, h) => acc + h.economyGenerated, 0);
  
  const remaining = (settings.budget || 0) - spentThisMonth;
  const percentageSpent = settings.budget > 0 ? (spentThisMonth / settings.budget) * 100 : 0;
  
  const isDanger = percentageSpent > 90;
  const isWarning = percentageSpent > 75 && !isDanger;

  // Meal Prep Simulator (Marmitas)
  const avgCostPerMeal = 8.5; // Estimated baseline cost per meal
  const totalSimMeals = simPeople * simMealsPerDay * 30; // 30 days
  const simulatedCost = totalSimMeals * avgCostPerMeal;
  const simulatedRemaining = simBudget - simulatedCost;
  const simulatedIsOk = simulatedRemaining >= 0;
  
  // Calculate max meals
  const maxMealsSupported = Math.floor(simBudget / avgCostPerMeal);
  
  // Projected economy based on current month performance vs simulated budget
  const projectedEconomy = Math.max(0, simBudget - simulatedCost) * 0.1;

  // Days remaining calculation
  const today = new Date();
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysRemaining = lastDay.getDate() - today.getDate();
  const totalDays = lastDay.getDate();


  return (
    <div className="pb-28 bg-transparent min-h-screen">
      <PageHeader 
        title="Dashboard" 
        subtitle="Visão geral e projeções financeiras" 
      />

      <div className="px-6 mt-4 relative z-20 pb-24 space-y-4">
        
        {/* CARDS PRINCIPAIS */}
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[20px] p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Saldo</span>
              <Wallet size={16} className="text-slate-400" />
            </div>
            <div>
              <div className={`text-xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-slate-900 dark:text-slate-100'}`}>
                {formatMoney(remaining)}
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[20px] p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Economia</span>
              <TrendingUp size={16} className="text-slate-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {formatMoney(economyThisMonth)}
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[20px] p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Gasto</span>
              <TrendingDown size={16} className="text-slate-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {formatMoney(spentThisMonth)}
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[20px] p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Restante</span>
              <Calendar size={16} className="text-slate-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {daysRemaining} dias
              </div>
            </div>
          </div>
        </section>

        {/* PROGRESSO E ALERTAS */}
        <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[20px] p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[12px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Consumo do Orçamento
            </h3>
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200">
              {percentageSpent.toFixed(0)}%
            </span>
          </div>
          
          <div className="h-3 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentageSpent, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'}`}
            />
          </div>

          {isDanger ? (
            <div className="flex gap-3 items-start bg-red-50 dark:bg-red-950/20 p-3 rounded-[16px] border border-red-100 dark:border-red-900/30">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
              <p className="text-[12px] font-medium text-red-800 dark:text-red-300">
                <strong>Risco de estouro!</strong> Você consumiu quase todo o orçamento. Reduza compras não essenciais.
              </p>
            </div>
          ) : isWarning ? (
            <div className="flex gap-3 items-start bg-amber-50 dark:bg-amber-950/20 p-3 rounded-[16px] border border-amber-100 dark:border-amber-900/30">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
              <p className="text-[12px] font-medium text-amber-800 dark:text-amber-300">
                <strong>Atenção!</strong> Orçamento chegando no limite.
              </p>
            </div>
          ) : (
            <div className="flex gap-3 items-start bg-green-50 dark:bg-green-950/20 p-3 rounded-[16px] border border-green-100 dark:border-green-900/30">
              <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={16} />
              <p className="text-[12px] font-medium text-green-800 dark:text-green-300">
                <strong>No controle!</strong> Seus gastos estão dentro do planejado.
              </p>
            </div>
          )}
        </section>

        {/* PRÓXIMO PASSO */}
        <section className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-zinc-800 dark:to-zinc-900 rounded-[20px] p-4 text-white shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Calendar size={64} />
          </div>
          <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            Planejamento
          </h3>
          <p className="text-[16px] font-bold mb-4 w-3/4">
            Você tem {formatMoney(remaining)} para cobrir os próximos dias.
          </p>
          <button 
            onClick={() => context.setActiveTab("promocoes")}
            className="bg-white/10 hover:bg-white/20 transition-colors py-2 px-4 rounded-xl text-[13px] font-bold flex items-center gap-2 w-fit backdrop-blur-sm"
          >
            Ver Ofertas <ArrowRight size={14} />
          </button>
        </section>

        
        {/* COZINHEIRO ANTIDESPERDÍCIO */}
        <section className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-[20px] p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ChefHat size={80} />
          </div>
          <h3 className="text-[14px] font-bold text-orange-800 dark:text-orange-400 flex items-center gap-2 mb-2 relative z-10">
            <ChefHat size={18} />
            Cozinheiro Antidesperdício
          </h3>
          <p className="text-[12px] text-orange-700 dark:text-orange-300/80 leading-relaxed mb-4 relative z-10 w-4/5">
            Descubra receitas fáceis com os ingredientes que você já tem e evite que alimentos passem da validade.
          </p>
          <button 
            onClick={() => setIsCozinheiroOpen(true)}
            className="w-fit bg-orange-600 hover:bg-orange-700 text-white transition-colors py-2.5 px-5 rounded-xl text-[13px] font-bold flex items-center gap-2 relative z-10 shadow-sm"
          >
            Ver Sugestões
          </button>
        </section>
  
        {/* SIMULADOR DE MARMITAS */}
        <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[20px] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-[14px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Activity size={18} className="text-blue-500" />
              Simulador Financeiro
            </h3>
            <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
              Descubra quantas marmitas seu orçamento sustenta e veja o impacto das suas escolhas.
            </p>
          </div>
          
          <div className="p-4 space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">Orçamento Simulado</label>
                <span className="text-[14px] font-bold text-slate-900 dark:text-slate-100">{formatMoney(simBudget)}</span>
              </div>
              <input 
                type="range" 
                min="100" max="2000" step="50"
                value={simBudget}
                onChange={(e) => setSimBudget(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-[16px] border border-slate-100 dark:border-zinc-800">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pessoas</label>
                <div className="flex items-center justify-between">
                  <button onClick={() => setSimPeople(Math.max(1, simPeople - 1))} className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 shadow-sm font-bold text-slate-600 dark:text-slate-300">-</button>
                  <span className="font-bold text-[16px] text-slate-800 dark:text-slate-200">{simPeople}</span>
                  <button onClick={() => setSimPeople(simPeople + 1)} className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 shadow-sm font-bold text-slate-600 dark:text-slate-300">+</button>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-[16px] border border-slate-100 dark:border-zinc-800">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Marmitas/Dia</label>
                <div className="flex items-center justify-between">
                  <button onClick={() => setSimMealsPerDay(Math.max(1, simMealsPerDay - 1))} className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 shadow-sm font-bold text-slate-600 dark:text-slate-300">-</button>
                  <span className="font-bold text-[16px] text-slate-800 dark:text-slate-200">{simMealsPerDay}</span>
                  <button onClick={() => setSimMealsPerDay(simMealsPerDay + 1)} className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 shadow-sm font-bold text-slate-600 dark:text-slate-300">+</button>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-[20px] border ${simulatedIsOk ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30' : 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'}`}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex justify-between items-center">
                <span>Projeção para 30 dias</span>
                {simulatedIsOk ? (
                  <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1"><CheckCircle2 size={12}/> Viável</span>
                ) : (
                  <span className="text-red-500 flex items-center gap-1"><AlertTriangle size={12}/> Insuficiente</span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-[11px] font-medium text-slate-500 mb-1">Marmitas Suportadas</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-baseline gap-1">
                    {Math.min(totalSimMeals, maxMealsSupported)}
                    <span className="text-[12px] font-medium text-slate-400">/ {totalSimMeals}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-500 mb-1">
                    {simulatedIsOk ? 'Saldo Projetado' : 'Falta para Fechar'}
                  </div>
                  <div className={`text-xl font-bold ${simulatedIsOk ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
                    {simulatedIsOk ? formatMoney(simulatedRemaining) : formatMoney(Math.abs(simulatedRemaining))}
                  </div>
                </div>
              </div>

              {!simulatedIsOk ? (
                <div className="space-y-2 mt-4 pt-4 border-t border-red-200 dark:border-red-900/30">
                  <p className="text-[12px] font-bold text-red-800 dark:text-red-300">Sugestões de Redução:</p>
                  <ul className="text-[11px] text-red-700 dark:text-red-400 space-y-1.5 pl-4 list-disc">
                    <li>Substituir carnes nobres por frango/ovos (reduz até 30% do custo)</li>
                    <li>Reduzir para {Math.max(1, simMealsPerDay - 1)} marmitas por dia</li>
                    <li>Preparar marmitas para {Math.floor(maxMealsSupported / (simPeople * simMealsPerDay))} dias no mês</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-2 mt-4 pt-4 border-t border-blue-200 dark:border-blue-900/30">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-bold text-blue-800 dark:text-blue-300">Economia Projetada:</span>
                    <span className="text-[13px] font-bold text-blue-700 dark:text-blue-400">+{formatMoney(projectedEconomy)}</span>
                  </div>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400/80">
                    Ao manter este planejamento, você poderá poupar esse valor no final do mês mantendo o padrão.
                  </p>
                </div>
              )}
            </div>

            {simBudget !== (settings.budget || 500) && (
              <button 
                onClick={() => {
                  setSettings(s => ({ ...s, budget: simBudget }));
                  alert("Orçamento atualizado com sucesso!");
                }}
                className="w-full py-3.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[16px] font-bold text-[14px] shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
              >
                Aplicar {formatMoney(simBudget)} como Orçamento Atual
              </button>
            )}

          </div>
        </section>

      </div>

      <Cozinheiro 
        context={context} 
        isOpen={isCozinheiroOpen} 
        onClose={() => setIsCozinheiroOpen(false)} 
      />
    </div>
  );
};
