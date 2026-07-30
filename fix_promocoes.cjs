const fs = require('fs');
let content = fs.readFileSync('src/components/Promocoes.tsx', 'utf8');

content = content.replace(
  'import { motion, AnimatePresence } from "motion/react";',
  'import { motion, AnimatePresence } from "motion/react";\nimport { PageHeader } from "./ui/PageHeader";'
);

const searchStr = `  return (
    <div className="pb-28 bg-transparent min-h-screen">
      {" "}
      {/* HEADER */}
      <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-b-[40px] overflow-hidden relative pt-[calc(env(safe-area-inset-top)+32px)] pb-20 px-6 text-white shadow-primary z-10 relative">
        {" "}
        <div className="absolute rounded-full border-[12px] border-white/10" style={{ width: 280, height: 280, top: -100, left: -100 }}></div>
        <div className="absolute rounded-full bg-black/10" style={{ width: 140, height: 140, bottom: -20, right: -20 }}></div>
        {" "}
        <div className="flex justify-between items-center relative z-10">
          {" "}
          <h2 className="text-[24px] font-bold tracking-tight flex items-center gap-2">
            {" "}
            <BadgePercent size={28} className="text-green-200" /> Ofertas{" "}
          </h2>{" "}
          <span className="bg-white/20 px-3 py-1 rounded-full text-[13px] font-semibold backdrop-blur">
            {" "}
            {activePromotionsCount} ativas{" "}
          </span>{" "}
        </div>{" "}
        <p className="mt-2 text-[14px] text-green-50/90 font-medium leading-snug max-w-[280px] relative z-10">
          {" "}
          Fique de olho e não perca boas oportunidades de economia nas suas
          próximas compras.{" "}
        </p>{" "}
      </div>{" "}
      <div className="px-6 -mt-10 relative z-20">`;

const replacement = `  return (
    <div className="pb-28 bg-transparent min-h-screen">
      <PageHeader 
        title="Ofertas" 
        subtitle={\`\${activePromotionsCount} promoções ativas\`} 
      />
      <div className="px-6 mt-6 relative z-20">`;

content = content.replace(searchStr, replacement);
fs.writeFileSync('src/components/Promocoes.tsx', content);
console.log('Promocoes patched');
