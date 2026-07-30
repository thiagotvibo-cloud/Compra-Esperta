const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace('export default function App() {', 'import { ModoMarmiteiro } from "./components/ModoMarmiteiro";\n\nexport default function App() {');
code = code.replace('</AnimatePresence>{" "}\n        </main>', '</AnimatePresence>{" "}\n        <ModoMarmiteiro context={context} />\n        </main>');
fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated');
