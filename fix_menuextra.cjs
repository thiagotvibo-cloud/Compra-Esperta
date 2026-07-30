const fs = require('fs');
let content = fs.readFileSync('src/components/MenuExtra.tsx', 'utf8');

content = content.replace(
  'import { motion, AnimatePresence } from "motion/react";',
  'import { motion, AnimatePresence } from "motion/react";\nimport { PageHeader } from "./ui/PageHeader";'
);

const searchStr = `  return (
    <div className="pb-28 bg-transparent min-h-screen">
      {" "}
      <div className="bg-green-600 pb-24 pt-[calc(env(safe-area-inset-top)+20px)] px-6 rounded-b-[40px] relative overflow-hidden shrink-0 shadow-lg">
        <div className="absolute rounded-full border-[12px] border-white/10" style={{ width: 280, height: 280, top: -100, left: -100 }}></div>
        <div className="absolute rounded-full bg-black/10" style={{ width: 140, height: 140, bottom: -20, right: -20 }}></div>
        
        <h2 className="text-3xl font-extrabold text-white mb-2 relative z-10">Ajustes & Dados</h2>
        <p className="text-green-50 text-[15px] font-medium max-w-[280px] leading-snug relative z-10">Configure preferências de uso, meta de gastos e gerencie seus dados locais.</p>
      </div>
      <div className="px-4 -mt-16 relative z-20 pb-24 space-y-6">`;

const replacement = `  return (
    <div className="pb-28 bg-transparent min-h-screen">
      <PageHeader 
        title="Ajustes & Dados" 
        subtitle="Configure preferências de uso e metadados" 
      />
      <div className="px-4 mt-6 relative z-20 pb-24 space-y-6">`;

content = content.replace(searchStr, replacement);
fs.writeFileSync('src/components/MenuExtra.tsx', content);
console.log('MenuExtra patched');
