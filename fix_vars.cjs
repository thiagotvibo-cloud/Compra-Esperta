const fs = require('fs');
let content = fs.readFileSync('src/components/ModoCompra.tsx', 'utf8');

content = content.replace(
  '  return (\n    <div className="pb-36 bg-transparent min-h-screen">',
  '  const totalItemsCount = activeItems.length;\n  const boughtItemsCount = activeItems.filter(i => i.isBought).length;\n\n  return (\n    <div className="pb-36 bg-transparent min-h-screen">'
);

fs.writeFileSync('src/components/ModoCompra.tsx', content);
