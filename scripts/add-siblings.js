const fs = require('fs');
const path = require('path');

const JSON_TOOLS = [
  { file: 'src/components/json/JsonViewer.jsx', link: '/json-viewer', title: 'JSON Viewer', icon: 'FaEye', catLabel: 'JSON Utilities' },
  { file: 'src/components/json/JsonDiffChecker.jsx', link: '/json-diff-checker', title: 'JSON Diff Checker', icon: 'FaBalanceScale', catLabel: 'JSON Utilities' },
  { file: 'src/components/json/JsonToCsv.jsx', link: '/json-to-csv', title: 'JSON to CSV', icon: 'FaFileCsv', catLabel: 'JSON Utilities' },
  { file: 'src/components/json/CsvToJson.jsx', link: '/csv-to-json', title: 'CSV to JSON', icon: 'FaFileCsv', catLabel: 'JSON Utilities' },
  { file: 'src/components/json/JsonToXml.jsx', link: '/json-to-xml', title: 'JSON to XML', icon: 'FaFileCode', catLabel: 'JSON Utilities' },
  { file: 'src/components/json/XmlToJson.jsx', link: '/xml-to-json', title: 'XML to JSON', icon: 'FaFileCode', catLabel: 'JSON Utilities' },
  { file: 'src/components/json/JsonToYaml.jsx', link: '/json-to-yaml', title: 'JSON to YAML', icon: 'FaExchangeAlt', catLabel: 'JSON Utilities' },
  { file: 'src/components/json/YamlToJson.jsx', link: '/yaml-to-json', title: 'YAML to JSON', icon: 'FaExchangeAlt', catLabel: 'JSON Utilities' },
  { file: 'src/components/color/ColorPicker.jsx', link: '/color-picker', title: 'Color Picker & Converter', icon: 'FaPalette', catLabel: 'Design Utilities' },
  { file: 'src/components/markdown/MarkdownPreview.jsx', link: '/markdown-preview', title: 'Markdown Preview', icon: 'FaMarkdown', catLabel: 'Text Utilities' },
  { file: 'src/components/lorem/LoremIpsum.jsx', link: '/lorem-ipsum', title: 'Lorem Ipsum Generator', icon: 'FaParagraph', catLabel: 'Text Utilities' },
  { file: 'src/components/timestamp/TimestampConverter.jsx', link: '/timestamp-converter', title: 'Timestamp Converter', icon: 'FaClock', catLabel: 'Developer Tools' },
];

// Fix breadcrumb paths and add siblings to files that already have ToolPageLayout
JSON_TOOLS.forEach(({ file, link, title, catLabel }) => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) { console.log('SKIP (not found): ' + file); return; }
  let content = fs.readFileSync(filePath, 'utf-8');

  // Add useCategorySiblings import
  if (!content.includes('useCategorySiblings')) {
    content = content.replace(
      /import ToolPageLayout from/,
      "import { useCategorySiblings } from '../../hooks/useCategorySiblings';\nimport ToolPageLayout from"
    );
  }

  // Add siblings hook call before return
  if (!content.includes('const siblings = useCategorySiblings')) {
    content = content.replace(
      /export default function (\w+)/,
      "export default function $1() {\n  const siblings = useCategorySiblings('" + link + "');"
    );
  }

  // Add siblings and currentPath to ToolPageLayout if not present
  if (!content.includes('siblings={siblings}')) {
    content = content.replace(
      /<ToolPageLayout title="([^"]*)" icon={<(\w+)\s*\/>} breadcrumb={\[([^\]]*)\]}>/,
      (match, t, icon, bc) => `<ToolPageLayout title="${t}" icon={<${icon} />} breadcrumb={[${bc}]} siblings={siblings} currentPath="${link}">`
    );
  }

  fs.writeFileSync(filePath, content);
  console.log('OK: ' + file);
});

console.log('\nDone!');
