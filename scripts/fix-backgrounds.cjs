const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      if (f.endsWith('.jsx')) callback(dirPath);
    }
  });
}

const filesToProcess = [];
walkDir(componentsDir, (filePath) => {
  filesToProcess.push(filePath);
});

let modifiedCount = 0;

filesToProcess.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace common tool layout backgrounds
  content = content.replace(/'bg-gray-800 border-gray-700'\s*:\s*'bg-green-150 border-gray-300'/g, "'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'");
  content = content.replace(/'bg-gray-800 border-gray-700'\s*:\s*'bg-white border-gray-300'/g, "'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'");
  content = content.replace(/'bg-gray-800 border-gray-700'\s*:\s*'bg-white/g, "'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 backdrop-blur-xl");
  content = content.replace(/'bg-gray-800'\s*:\s*'bg-white'/g, "'bg-slate-900/60 backdrop-blur-xl' : 'bg-white/60 backdrop-blur-xl'");
  content = content.replace(/'bg-gray-800'\s*:\s*'bg-green-150'/g, "'bg-slate-900/60 backdrop-blur-xl' : 'bg-white/60 backdrop-blur-xl'");

  // Replace other stragglers manually just in case
  content = content.replace(/bg-gray-800 border-gray-700/g, 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl');
  content = content.replace(/bg-green-150 border-gray-300/g, 'bg-white/60 border-slate-200/50 backdrop-blur-xl');

  // Specific case for Text Sanitize / formatter textareas which might be opaque
  content = content.replace(/'bg-gray-800 text-white border-gray-700'\s*:\s*'bg-green-50 text-gray-900 border-gray-300'/g, "'bg-slate-900/40 text-white border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 text-slate-900 border-slate-200/50 backdrop-blur-xl'");

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Updated backgrounds in: ${path.basename(file)}`);
  }
});

console.log(`Migration complete! Modified ${modifiedCount} files.`);
