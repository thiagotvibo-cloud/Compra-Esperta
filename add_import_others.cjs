const fs = require('fs');
['src/components/Promocoes.tsx', 'src/components/Roteiro.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    'import { motion, AnimatePresence } from "motion/react";',
    'import { motion, AnimatePresence } from "motion/react";\nimport { PageHeader } from "./ui/PageHeader";'
  );
  if (!content.includes('import { PageHeader }')) {
    content = content.replace(
      'import React',
      'import { PageHeader } from "./ui/PageHeader";\nimport React'
    );
  }
  fs.writeFileSync(file, content);
  console.log(file + ' import fixed');
});
