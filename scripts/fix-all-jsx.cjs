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

  // Fix broken icon prop: icon={<FaXxx / breadcrumb -> icon={<FaXxx />} breadcrumb
  content = content.replace(/icon=\{<(\w+) \/ breadcrumb/g, 'icon={<$1 />} breadcrumb');
  content = content.replace(/icon=\{<(\w+) \/ siblings/g, 'icon={<$1 />} siblings');

  // Fix double >: >\n      > -> just >
  content = content.replace(/<\/div>\n\s*>\n/g, '</div>\n');

  // Fix stray >} after ToolPageLayout opening:  >} breadcrumb  ->  breadcrumb
  content = content.replace(/>}\s*breadcrumb/g, ' breadcrumb');
  content = content.replace(/>}\s*siblings/g, ' siblings');

  // Fix <div className={`min-h-0`}> >  ->  <div className={`min-h-0`}>
  content = content.replace(/<div className=\{`min-h-0`}> >/g, '<div className={`min-h-0`}>');

  // Fix broken sibling hook: useCategorySiblings('/...'); {  ->  just the semicolon
  content = content.replace(/useCategorySiblings\('([^']*)'\); \{/g, "useCategorySiblings('$1');");

  fs.writeFileSync(fp, content);
  if (content !== original) {
    console.log('FIXED: ' + path.relative(ROOT, fp));
    fixed++;
  }
});

console.log(`\nFixed ${fixed} files`);
