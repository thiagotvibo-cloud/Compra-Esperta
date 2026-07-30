const fs = require('fs');
let code = fs.readFileSync('src/components/ModoCompra.tsx', 'utf8');

// Add import if needed
if (!code.includes('Map,')) {
    code = code.replace('ShoppingBag,', 'ShoppingBag,\n  Map,');
}

const targetDiv = '<div className="px-6 pt-4 pb-2">';
if (code.includes(targetDiv) && !code.includes('Ver Inteligência de Mercado')) {
    const replacement = `
      <div className="px-6 mt-4 mb-2">
        <button 
          onClick={() => context.setActiveTab("roteiro")}
          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-500 flex items-center justify-center rounded-xl">
              <Map size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-[14px] text-slate-800 dark:text-slate-200">Inteligência de Mercado</h3>
              <p className="text-[12px] text-slate-500 font-medium">Veja a melhor rota e economize</p>
            </div>
          </div>
          <div className="text-slate-400">
            <ChevronRight size={20} />
          </div>
        </button>
      </div>

      <div className="px-6 pt-4 pb-2">`;
      
      code = code.replace(targetDiv, replacement);
      
      // Ensure ChevronRight is imported
      if (!code.includes('ChevronRight')) {
          code = code.replace('Map,', 'Map,\n  ChevronRight,');
      }
      
      fs.writeFileSync('src/components/ModoCompra.tsx', code);
      console.log('ModoCompra.tsx roteiro access added');
}
