const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.astro') || fullPath.endsWith('.css') || fullPath.endsWith('.js') || fullPath.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      // Safe replacements to avoid double /site/site/
      content = content.replace(/href="\/(?!site\/)/g, 'href="/site/');
      content = content.replace(/src="\/(?!site\/)/g, 'src="/site/');
      content = content.replace(/url\('\/(?!site\/)/g, 'url(\'/site/');
      content = content.replace(/url\("\/(?!site\/)/g, 'url("/site/');
      
      fs.writeFileSync(fullPath, content, 'utf-8');
    }
  }
}

replaceInDir('d:/site/v2/src');
replaceInDir('d:/site/v2/public');
console.log('done');
