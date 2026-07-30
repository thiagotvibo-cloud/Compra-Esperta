const fs = require('fs');
let code = fs.readFileSync('src/components/ListaCompras.tsx', 'utf8');

const returnRegex = /  return \([\s\S]*\);/;
// Actually this might match too much. Let's find the first "  return (" that is not inside a hook.
// It's safer to use the exact string.
const splitIndex = code.indexOf('return (\n    <div className="pb-28');
if (splitIndex === -1) {
    const splitIndex2 = code.indexOf('  return (\n    <div className="pb-28 bg-transparent min-h-screen relative">');
    console.log("Index 2:", splitIndex2);
}
