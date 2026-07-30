const fs = require('fs');
let code = fs.readFileSync('src/components/ModoCompra.tsx', 'utf8');

if (code.includes('ChevronRight') && !code.includes('ChevronRight,')) {
    code = code.replace('ShoppingBag,', 'ShoppingBag,\n  ChevronRight,');
    fs.writeFileSync('src/components/ModoCompra.tsx', code);
    console.log('Fixed import in ModoCompra');
}
