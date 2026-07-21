const fs = require('fs');

// 1. Update index.css for Poppins
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(
  /@import url\('https:\/\/fonts.googleapis.com\/css2\?family=Plus\+Jakarta\+Sans:wght@400;500;600;700;800&display=swap'\);/,
  `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`
);
css = css.replace(/--font-sans: "Plus Jakarta Sans"/, '--font-sans: "Poppins"');
css = css.replace(/--font-sans: "Inter"/, '--font-sans: "Poppins"');

fs.writeFileSync('src/index.css', css);

// 2. Remove uppercase and tracking classes across all files
const glob = require('fs');
function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = dir + '/' + file;
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Remove uppercase and tracking classes
      content = content.replace(/\buppercase\b/g, '');
      content = content.replace(/\btracking-widest\b/g, '');
      content = content.replace(/\btracking-wider\b/g, '');
      content = content.replace(/\btracking-wide\b/g, '');
      
      // Clean up multiple spaces that might have been left behind
      content = content.replace(/ +/g, ' ');
      content = content.replace(/ \}/g, '}');
      content = content.replace(/ >/g, '>');
      content = content.replace(/" /g, '"');
      content = content.replace(/ "/g, '"');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('src');
