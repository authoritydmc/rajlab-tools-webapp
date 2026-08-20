const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const files = [
  { file: 'src/components/json/JsonViewer.jsx', link: '/json-viewer' },
  { file: 'src/components/json/JsonDiffChecker.jsx', link: '/json-diff-checker' },
  { file: 'src/components/json/JsonToCsv.jsx', link: '/json-to-csv' },
  { file: 'src/components/json/CsvToJson.jsx', link: '/csv-to-json' },
  { file: 'src/components/json/JsonToXml.jsx', link: '/json-to-xml' },
  { file: 'src/components/json/XmlToJson.jsx', link: '/xml-to-json' },
  { file: 'src/components/json/JsonToYaml.jsx', link: '/json-to-yaml' },
  { file: 'src/components/json/YamlToJson.jsx', link: '/yaml-to-json' },
  { file: 'src/components/color/ColorPicker.jsx', link: '/color-picker' },
  { file: 'src/components/markdown/MarkdownPreview.jsx', link: '/markdown-preview' },
  { file: 'src/components/lorem/LoremIpsum.jsx', link: '/lorem-ipsum' },
  { file: 'src/components/timestamp/TimestampConverter.jsx', link: '/timestamp-converter' },
];

files.forEach(({ file, link }) => {
  const filePath = path.join(ROOT, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Add useCategorySiblings import
  if (!content.includes('useCategorySiblings')) {
    content = content.replace(
      /import ToolPageLayout from/,
      "import { useCategorySiblings } from '../../hooks/useCategorySiblings';\nimport ToolPageLayout from"
    );
  }

  // Add siblings hook - find the function and add hook
  if (!content.includes('const siblings = useCategorySiblings')) {
    // Find "export default function" with various patterns
    const patterns = [
      /(export default function \w+\s*\(\)\s*\{)/,
      /(export default function \w+\s*\(\s*\)\s*\{)/,
    ];
    let found = false;
    for (const pat of patterns) {
      if (pat.test(content)) {
        content = content.replace(pat, `$1\n  const siblings = useCategorySiblings('${link}');`);
        found = true;
        break;
      }
    }
    if (!found) {
      console.log(`WARN: Could not add hook to ${file}`);
    }
  }

  // Add siblings and currentPath to ToolPageLayout tag
  if (!content.includes('siblings={siblings}')) {
    content = content.replace(
      /<ToolPageLayout ([^>]*)>/,
      `<ToolPageLayout $1 siblings={siblings} currentPath="${link}">`
    );
  }

  fs.writeFileSync(filePath, content);
  console.log(`OK: ${file}`);
});

console.log('\nDone!');
