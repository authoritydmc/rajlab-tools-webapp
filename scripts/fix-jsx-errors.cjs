const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fp = path.join(dir, file);
    const stat = fs.statSync(fp);
    if (stat && stat.isDirectory()) results = results.concat(walk(fp));
    else if (file.endsWith('.jsx')) results.push(fp);
  });
  return results;
}

const files = walk(path.join(ROOT, 'src'));
let fixed = 0;

files.forEach(fp => {
  let content = fs.readFileSync(fp, 'utf-8');
  let original = content;

  // Fix 1: <div className={`min-h-0`}> >  ->  <div className={`min-h-0`}>
  content = content.replace(/<div className=\{`min-h-0`}> >/g, '<div className={`min-h-0`}>');

  // Fix 2: >} breadcrumb  ->  breadcrumb (broken closing in existing TPL files)
  content = content.replace(/>}\s*breadcrumb=/g, ' breadcrumb=');

  fs.writeFileSync(fp, content);
  if (content !== original) {
    console.log('FIXED: ' + path.relative(ROOT, fp));
    fixed++;
  }
});

console.log(`\nFixed ${fixed} files`);
