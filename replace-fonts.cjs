const fs = require('fs');
const path = require('path');

function processContent(content) {
  const rules = [
    { from: /font-black/g, to: 'TEMP_FONT_BOLD' },
    { from: /font-extrabold/g, to: 'TEMP_FONT_BOLD' },
    { from: /font-bold/g, to: 'font-semibold' },
    { from: /TEMP_FONT_BOLD/g, to: 'font-bold' }
  ];
  
  let newContent = content;
  for (let rule of rules) {
    newContent = newContent.replace(rule.from, rule.to);
  }
  return newContent;
}

function walk(directory) {
  const items = fs.readdirSync(directory);
  for (const item of items) {
    const fullPath = path.join(directory, item);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const newContent = processContent(content);
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}

const dir = path.join(process.cwd(), 'src');
walk(dir);
console.log('Fonts replaced!');
