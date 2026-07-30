const fs = require('fs');
let code = fs.readFileSync('src/components/Promocoes.tsx', 'utf8');

// Add PageHeader import
if (!code.includes('PageHeader')) {
  code = code.replace('import { Store, Tag, Filter, Map, ArrowRight, TrendingDown, BadgePercent, ChevronDown, ChevronUp, Search, Plus, ListFilter, SlidersHorizontal, Trash2 } from "lucide-react";', 'import { Store, Tag, Filter, Map, ArrowRight, TrendingDown, BadgePercent, ChevronDown, ChevronUp, Search, Plus, ListFilter, SlidersHorizontal, Trash2 } from "lucide-react";\nimport { PageHeader } from "./ui/PageHeader";');
}

// Replace header block
const oldHeaderRegex = /<div className="bg-gradient-to-br from-green-600[^]*?<\/div>\s*<\/div>\s*<p[^]*?<\/p>\s*<\/div>/;
const newHeader = '<PageHeader title="Ofertas & Mercados" subtitle="Gerencie as ofertas que encontrou e organize por supermercado." />';
if (oldHeaderRegex.test(code)) {
    code = code.replace(oldHeaderRegex, newHeader);
}

// Update mt-16 to mt-4
code = code.replace('<div className="px-4 lg:px-6 -mt-16 relative z-20">', '<div className="px-6 mt-4 relative z-20">');

fs.writeFileSync('src/components/Promocoes.tsx', code);
console.log('Promocoes.tsx header updated');
