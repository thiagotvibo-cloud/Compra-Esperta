const fs = require('fs');
let code = fs.readFileSync('src/components/Roteiro.tsx', 'utf8');

// Add PageHeader import
if (!code.includes('PageHeader')) {
  code = code.replace('import { Store, Map, BadgePercent } from "lucide-react";', 'import { Store, Map, BadgePercent } from "lucide-react";\nimport { PageHeader } from "./ui/PageHeader";');
}

// Replace header block
const oldHeaderRegex = /<div className="bg-gradient-to-br from-green-600[^]*?<\/div>\s*<\/div>\s*<\/div>/;
const newHeader = '<PageHeader title="Inteligência de Mercado" subtitle="Comparativo de preços e rotas" />';
if (oldHeaderRegex.test(code)) {
    code = code.replace(oldHeaderRegex, newHeader);
}

// Update mt-16 to mt-4
code = code.replace('<div className="px-4 lg:px-6 -mt-16 relative z-20">', '<div className="px-6 mt-4 relative z-20 pb-24">');

fs.writeFileSync('src/components/Roteiro.tsx', code);
console.log('Roteiro.tsx header updated');
