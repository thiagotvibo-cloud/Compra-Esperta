const fs = require('fs');
let code = fs.readFileSync('src/components/Promocoes.tsx', 'utf8');

const target = '              {showAdvanced && (';
code = code.replace(target, '              </div>\n' + target);

fs.writeFileSync('src/components/Promocoes.tsx', code);
console.log('Fixed missing div in Promocoes again');
