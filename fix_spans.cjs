const fs = require('fs');
const files = ['src/components/ListaCompras.tsx', 'src/components/MenuExtra.tsx', 'src/components/ModoCompra.tsx', 'src/components/Promocoes.tsx', 'src/components/Roteiro.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<\/span><\/span>/g, '</span>');
  content = content.replace(/<span className="money-value">/g, '');
  content = content.replace(/\{formatMoney\([^}]+\)\}/g, match => `<span className="money-value">${match}</span>`);
  fs.writeFileSync(file, content);
});
