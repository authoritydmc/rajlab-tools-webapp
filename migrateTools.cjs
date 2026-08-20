const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all tool components
const componentsDir = path.join(__dirname, 'src', 'components');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      if (f !== 'common') walkDir(dirPath, callback);
    } else {
      if (f.endsWith('.jsx')) callback(dirPath);
    }
  });
}

const filesToProcess = [];
walkDir(componentsDir, (filePath) => {
  filesToProcess.push(filePath);
});

console.log(`Found ${filesToProcess.length} jsx files in components (excluding common).`);

let modifiedCount = 0;

filesToProcess.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Remove the old <h1> title tags completely
  // usually looks like: <h1 className="text-3xl font-bold mb-8 text-center">...</h1>
  // or <h1 className="text-2xl font-bold mb-4">...</h1>
  content = content.replace(/<h1[^>]*>.*?<\/h1>/gs, '');

  // 2. Change restrictive max-widths to `w-full` to utilize screen space
  // We match max-w-2xl, max-w-3xl, max-w-4xl, max-w-5xl, max-w-lg, etc.
  content = content.replace(/max-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl)/g, 'w-full');

  // 3. Fix the weird <div className={`min-h-0`}>\n> issue from a previous bad migration
  // sometimes it's `<div className={`min-h-0`}>\n    >\n`
  content = content.replace(/<div className=\{`min-h-0`\}>\s*>\s*/gs, '<div className="w-full">\n');
  content = content.replace(/<div className=\{`min-h-0`\}>\s*/gs, '<div className="w-full">\n');

  // 4. Ensure siblings is defined if used.
  // If we see `siblings={siblings}` but `const siblings = useCategorySiblings` is missing, we must insert it.
  if (content.includes('siblings={siblings}') && !content.includes('useCategorySiblings(')) {
    // try to extract the currentPath from currentPath="/something"
    const match = content.match(/currentPath="([^"]+)"/);
    if (match) {
      const toolPath = match[1];
      // inject const siblings
      content = content.replace(/return\s*\(/, `const siblings = useCategorySiblings('${toolPath}');\n  return (`);
    }
  }

  // Ensure import of useCategorySiblings if we injected it or if it's missing but we need it
  if (content.includes('useCategorySiblings(') && !content.includes("from '../../hooks/useCategorySiblings'")) {
    content = `import { useCategorySiblings } from '../../hooks/useCategorySiblings';\n` + content;
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Migrated: ${path.basename(file)}`);
  }
});

console.log(`Migration complete! Modified ${modifiedCount} files.`);
