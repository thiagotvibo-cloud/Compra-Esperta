const fs = require('fs');
let content = fs.readFileSync('src/components/Roteiro.tsx', 'utf8');

content = content.replace(
  'import { motion, AnimatePresence } from "motion/react";',
  'import { motion, AnimatePresence } from "motion/react";\nimport { PageHeader } from "./ui/PageHeader";'
);

const searchStr = `  return (
    <div className="pb-28 bg-transparent min-h-screen">
      {" "}
      {/* HEADER */}
      <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-b-[40px] overflow-hidden relative pt-[calc(env(safe-area-inset-top)+32px)] pb-16 px-6 text-white shadow-primary z-10 relative">
        {" "}
        <div className="absolute rounded-full border-[12px] border-white/10" style={{ width: 280, height: 280, top: -100, left: -100 }}></div>
        <div className="absolute rounded-full bg-black/10" style={{ width: 140, height: 140, bottom: -20, right: -20 }}></div>
        {" "}
        <div className="flex justify-between items-center relative z-10">
          {" "}
          <h2 className="text-[24px] font-bold tracking-tight flex items-center gap-2">
            {" "}
            <Map size={28} className="text-green-200" /> Roteiro{" "}
          </h2>{" "}
        </div>{" "}
        <p className="mt-2 text-[14px] text-green-50/90 font-medium leading-snug relative z-10">
          {" "}
          Organize sua rota de compras de forma eficiente para economizar tempo
          e aproveitar as promoções.{" "}
        </p>{" "}
      </div>{" "}
      <div className="px-6 -mt-8 relative z-20">`;

const replacement = `  return (
    <div className="pb-28 bg-transparent min-h-screen">
      <PageHeader 
        title="Roteiro" 
        subtitle="Organize sua rota e aproveite promoções" 
      />
      <div className="px-6 mt-6 relative z-20">`;

content = content.replace(searchStr, replacement);
fs.writeFileSync('src/components/Roteiro.tsx', content);
console.log('Roteiro patched');
