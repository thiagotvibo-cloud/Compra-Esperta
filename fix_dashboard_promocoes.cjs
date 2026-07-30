const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

if (!code.includes('Ver Ofertas')) {
  // Replace "Ver Roteiro" with "Ver Ofertas & Mercados" in Dashboard
  code = code.replace('onClick={() => context.setActiveTab("roteiro")}', 'onClick={() => context.setActiveTab("promocoes")}');
  code = code.replace('Ver Roteiro <ArrowRight size={14} />', 'Ver Ofertas <ArrowRight size={14} />');
  fs.writeFileSync('src/components/Dashboard.tsx', code);
  console.log('Dashboard.tsx replaced roteiro link with promocoes');
}
