import React, { useState, useEffect } from "react";
import { AppContextType } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { ChefHat, X, Clock, Flame, Leaf, Loader2 } from "lucide-react";

interface Recipe {
  nome: string;
  ingredientes: string[];
  tempo: string;
  motivo: string;
  instrucoes: string[];
}

export const Cozinheiro: React.FC<{ context: AppContextType; isOpen: boolean; onClose: () => void }> = ({ context, isOpen, onClose }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (isOpen && !hasFetched && recipes.length === 0) {
      fetchRecipes();
    }
  }, [isOpen]);

  const fetchRecipes = async () => {
    setIsLoading(true);
    setError("");
    setHasFetched(true);
    
    // Simulating pantry based on recently bought items + list items
    // First, try to get items that are marked as isBought in the current list
    let availableItems = context.items.filter(i => i.isBought).map(i => i.name);
    
    // If not enough, pull from the current shopping list to pretend they might have it
    if (availableItems.length < 3) {
      availableItems = [...availableItems, ...context.items.slice(0, 10).map(i => i.name)];
    }
    
    // If still empty, provide some defaults
    if (availableItems.length === 0) {
      availableItems = ["arroz", "feijão", "ovos", "cebola", "tomate"];
    }

    // Deduplicate
    availableItems = [...new Set(availableItems)];
    
    const ingredientsStr = availableItems.slice(0, 15).join(', ');

    try {
      const response = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ingredientsStr }),
      });

      const data = await response.json();
      
      if (data.error) {
         setError(data.error);
      } else if (data.receitas) {
         setRecipes(data.receitas);
      } else {
         setError("Não foi possível gerar as receitas. Tente novamente.");
      }
    } catch (err) {
      setError("Erro de conexão ao buscar receitas.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-zinc-50 dark:bg-zinc-900 rounded-t-3xl shadow-2xl z-50 flex flex-col md:w-[600px] md:h-[80vh] md:m-auto md:top-0 md:bottom-0 md:rounded-3xl border border-zinc-200 dark:border-zinc-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 md:rounded-t-3xl rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center">
                  <ChefHat size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Cozinheiro</h3>
                  <p className="text-[12px] font-medium text-slate-500">Antidesperdício</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 text-slate-400">
                  <Loader2 size={40} className="animate-spin text-orange-500" />
                  <p className="text-sm font-medium animate-pulse">Analisando sua despensa...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 text-center">
                  <p className="font-bold text-sm mb-2">{error}</p>
                  <button onClick={fetchRecipes} className="px-4 py-2 bg-red-100 dark:bg-red-900/50 rounded-xl text-xs font-bold hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors">
                    Tentar Novamente
                  </button>
                </div>
              ) : recipes.length > 0 ? (
                <div className="space-y-6">
                  {recipes.map((recipe, idx) => (
                    <div key={idx} className="bg-white dark:bg-zinc-950 rounded-[24px] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                      <div className="bg-orange-50 dark:bg-orange-950/20 p-5 border-b border-orange-100 dark:border-orange-900/30">
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">
                          {recipe.nome}
                        </h4>
                        <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                          <span className="flex items-center gap-1 bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-lg border border-orange-200 dark:border-orange-900/50">
                            <Clock size={12} /> {recipe.tempo}
                          </span>
                          <span className="flex items-center gap-1 bg-white dark:bg-zinc-900 text-green-600 dark:text-green-500 px-2 py-1 rounded-lg border border-green-200 dark:border-green-900/50">
                            <Leaf size={12} /> Evita desperdício
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <div className="mb-4 bg-slate-50 dark:bg-zinc-900 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
                          <p className="text-[12px] text-slate-600 dark:text-slate-400 italic font-medium flex items-start gap-2">
                            <Flame size={14} className="text-orange-500 mt-0.5 shrink-0" />
                            {recipe.motivo}
                          </p>
                        </div>
                        
                        <div className="mb-5">
                          <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Ingredientes
                          </h5>
                          <ul className="text-[13px] text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                            {recipe.ingredientes.map((ing, i) => (
                              <li key={i}>{ing}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Preparo
                          </h5>
                          <ol className="text-[13px] text-slate-700 dark:text-slate-300 space-y-2 list-decimal pl-4 marker:font-bold marker:text-slate-400">
                            {recipe.instrucoes.map((inst, i) => (
                              <li key={i} className="pl-1">{inst}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-500 py-10">
                  Nenhuma receita encontrada.
                </div>
              )}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
