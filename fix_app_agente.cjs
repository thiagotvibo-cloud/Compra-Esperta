const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { AgenteIA }')) {
  code = code.replace('import { Dashboard } from "./components/Dashboard";', 'import { Dashboard } from "./components/Dashboard";\nimport { AgenteIA } from "./components/AgenteIA";');
}

if (!code.includes('<AgenteIA context={context} />')) {
  // Inject before </main>
  code = code.replace('</main>', '  <AgenteIA context={context} />\n        </main>');
}

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated for AgenteIA');
