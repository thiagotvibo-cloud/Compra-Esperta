const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// 1. Add ChefHat to imports if missing
if (!code.includes('ChefHat')) {
  code = code.replace('Calendar,', 'Calendar,\n  ChefHat,');
}

// 2. Add Cozinheiro to imports
if (!code.includes('Cozinheiro')) {
  code = code.replace('import { motion } from "motion/react";', 'import { motion } from "motion/react";\nimport { Cozinheiro } from "./Cozinheiro";');
}

// 3. Add state for the bottom sheet
if (!code.includes('const [isCozinheiroOpen, setIsCozinheiroOpen]')) {
  code = code.replace('// Simulator State', 'const [isCozinheiroOpen, setIsCozinheiroOpen] = useState(false);\n\n  // Simulator State');
}

// 4. Add the card before Simulador
if (!code.includes('Cozinheiro Antidesperdício')) {
  const cardStr = `
        {/* COZINHEIRO ANTIDESPERDÍCIO */}
        <section className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-[24px] p-5 shadow-sm relative overflow-hidden">
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
  `;
  code = code.replace('{/* SIMULADOR DE MARMITAS */}', cardStr + '\n        {/* SIMULADOR DE MARMITAS */}');
}

// 5. Render Cozinheiro component at the end
if (!code.includes('<Cozinheiro context={context}')) {
  code = code.replace('</div>\n    </div>', '</div>\n\n      <Cozinheiro \n        context={context} \n        isOpen={isCozinheiroOpen} \n        onClose={() => setIsCozinheiroOpen(false)} \n      />\n    </div>');
}

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log('Dashboard.tsx updated for Cozinheiro');
