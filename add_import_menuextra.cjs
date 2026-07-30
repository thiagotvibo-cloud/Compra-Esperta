const fs = require('fs');
let content = fs.readFileSync('src/components/MenuExtra.tsx', 'utf8');

content = content.replace(
  'import { formatMoney } from "../utils";',
  'import { formatMoney } from "../utils";\nimport { PageHeader } from "./ui/PageHeader";'
);
fs.writeFileSync('src/components/MenuExtra.tsx', content);
console.log('MenuExtra import fixed');
