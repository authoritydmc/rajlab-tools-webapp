const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Categories from toolCategories.json
const categories = {
  'Text Utilities': {
    breadcrumb: `{label: 'Text Utilities', path: '/format-text'}`,
    tools: [
      { name: 'Sanitize Text', link: '/sanitize-text', file: 'src/components/text-Sanitize/text-Sanitize.jsx', icon: 'MdCleaningServices', export: 'SanitizeText' },
      { name: 'Text Formatter', link: '/format-text', file: 'src/components/text-formatter/text-formatter.jsx', icon: 'CgFormatText', export: 'TextFormatter' },
    ]
  },
  'Encryption & Encoding Utilities': {
    breadcrumb: `{label: 'Encryption & Encoding Utilities', path: '/base64-encoder-decoder'}`,
    tools: [
      { name: 'Base64 Encoder/Decoder', link: '/base64-encoder-decoder', file: 'src/components/base64EncoderDecoder/base64tools.jsx', icon: 'AiOutlineFieldString', export: 'Base64Tool' },
      { name: 'BCrypt Hashing', link: '/bcrypt-hashing', file: 'src/components/bcryptEncrypter/bcryptTool.jsx', icon: 'FaHashtag', export: 'BcryptTool' },
      { name: 'Image to Base64', link: '/image-to-base64', file: 'src/components/base64EncoderDecoder/imageToBase64Tool.jsx', icon: 'FaImage', export: 'ImageToBase64Tool' },
      { name: 'Base64 to Image', link: '/base64-to-image', file: 'src/components/base64EncoderDecoder/base64ToImage.jsx', icon: 'FaImage', export: 'Base64ToImagePreviewGenerator' },
      { name: 'URL Encoder/Decoder', link: '/url-encoder-decoder', file: 'src/components/urlEncodeDecode/urlEncoderDecoder.jsx', icon: 'FaLink', export: 'URLTool' },
      { name: 'Password Generator', link: '/password-generator', file: 'src/components/passwords/passwordGen.jsx', icon: 'FaKey', export: 'PasswordGenerator' },
      { name: 'JWT Decoder', link: '/jwt-decoder', file: 'src/components/json/JwtDecoder.jsx', icon: 'FaKey', export: 'JwtDecoder' },
      { name: 'Hash Generator', link: '/hash-generator', file: 'src/components/hash/HashGenerator.jsx', icon: 'FaFingerprint', export: 'HashGenerator' },
    ]
  },
  'Calculators': {
    breadcrumb: `{label: 'Calculators', path: '/print-cost-estimator'}`,
    tools: [
      { name: 'Print Cost Estimator', link: '/print-cost-estimator', file: 'src/components/calculators/printCostEstimator.jsx', icon: 'ImPrinter', export: 'PrintRateCalculator' },
    ]
  },
  'QR Codes': {
    breadcrumb: `{label: 'QR Codes', path: '/qr-code-generator'}`,
    tools: [
      { name: 'QR Code Generator', link: '/qr-code-generator', file: 'src/components/qrCodes/QRSettingMainPage.jsx', icon: 'FaQrcode', export: 'QRCodeSettings' },
      { name: 'UPI QR Code Generator', link: '/upi-code-generator', file: 'src/components/qrCodes/UPIQrCodeGenerators.jsx', icon: 'FaRupeeSign', export: 'UPIPaymentSettings' },
      { name: 'WhatsApp QR Code', link: '/whatsapp-qr-code', file: 'src/components/qrCodes/whatsAppQR.jsx', icon: 'FaWhatsapp', export: 'WhatsAppQr' },
      { name: 'QR Code Scanner', link: '/qr-scanner', file: 'src/components/qrCodes/QRScanner.jsx', icon: 'FaSearchPlus', export: 'QRScanner' },
    ]
  },
  'JSON Utilities': {
    breadcrumb: `{label: 'JSON Utilities', path: '/json-viewer'}`,
    tools: [] // Already handled - these already use ToolPageLayout
  },
  'Developer Tools': {
    breadcrumb: `{label: 'Developer Tools', path: '/regex-tester'}`,
    tools: [
      { name: 'Regex Tester', link: '/regex-tester', file: 'src/components/regex/RegexTester.jsx', icon: 'FaSearch', export: 'RegexTester' },
      { name: 'UUID Generator', link: '/uuid-generator', file: 'src/components/uuid/UuidGenerator.jsx', icon: 'FaRandom', export: 'UuidGenerator' },
      { name: 'CSS Unit Converter', link: '/css-unit-converter', file: 'src/components/css/CssUnitConverter.jsx', icon: 'FaRulerCombined', export: 'CssUnitConverter' },
    ]
  },
  'Multimedia Utilities': {
    breadcrumb: `{label: 'Multimedia Utilities', path: '/video-converter'}`,
    tools: [
      { name: 'Video Converter', link: '/video-converter', file: 'src/components/media-utils/video-convertor.jsx', icon: 'FaFileVideo', export: 'FfmpegTool' },
      { name: 'Image Compressor', link: '/image-compressor', file: 'src/components/image/ImageCompressor.jsx', icon: 'FaCompressAlt', export: 'ImageCompressor' },
    ]
  },
  'PDF Tools': {
    breadcrumb: `{label: 'PDF Tools', path: '/merge-pdf'}`,
    tools: [
      { name: 'Merge PDF', link: '/merge-pdf', file: 'src/components/pdf-tools/mergePdf.jsx', icon: 'FaObjectGroup', export: 'MergePdfTool' },
      { name: 'Split PDF', link: '/split-pdf', file: 'src/components/pdf-tools/splitPdf.jsx', icon: 'FaCut', export: 'SplitPdfTool' },
      { name: 'Unlock PDF', link: '/unlock-pdf', file: 'src/components/pdf-tools/unlockPdf.jsx', icon: 'FaUnlockAlt', export: 'UnlockPdfTool' },
    ]
  },
  'Excel Tools': {
    breadcrumb: `{label: 'Excel Tools', path: '/unlock-excel'}`,
    tools: [
      { name: 'Unlock Excel Sheet', link: '/unlock-excel', file: 'src/components/excel-tools/unlockExcel.jsx', icon: 'FaUnlockAlt', export: 'UnlockExcelTool' },
    ]
  },
};

let updated = 0;
let skipped = 0;

Object.entries(categories).forEach(([catTitle, cat]) => {
  cat.tools.forEach(tool => {
    const filePath = path.join(ROOT, tool.file);
    if (!fs.existsSync(filePath)) {
      console.log(`SKIP (not found): ${tool.file}`);
      skipped++;
      return;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    // Skip if already properly wrapped
    if (content.includes('useCategorySiblings') && content.includes('siblings={siblings}')) {
      console.log(`SKIP (already done): ${tool.file}`);
      skipped++;
      return;
    }

    // If already has ToolPageLayout but not siblings, just add siblings
    if (content.includes('ToolPageLayout')) {
      // Add useCategorySiblings import
      if (!content.includes('useCategorySiblings')) {
        content = content.replace(
          /import ToolPageLayout from/,
          "import { useCategorySiblings } from '../../hooks/useCategorySiblings';\nimport ToolPageLayout from"
        );
      }
      // Add siblings to ToolPageLayout tag
      if (!content.includes('siblings={siblings}')) {
        content = content.replace(
          /<ToolPageLayout ([^>]*)>/,
          `<ToolPageLayout $1 siblings={siblings} currentPath="${tool.link}">`
        );
      }
      // Add siblings hook - find the function declaration
      if (!content.includes('const siblings = useCategorySiblings')) {
        // Find "export default function Name" and add after opening brace
        content = content.replace(
          /(export default function \w+\s*\(\))/,
          `$1 {\n  const siblings = useCategorySiblings('${tool.link}');`
        );
        // If it already has a body with {, handle differently
        if ((content.match(/const siblings/g) || []).length < 1) {
          // Try alternate pattern - function already has body
          content = content.replace(
            /(export default function \w+\s*\([^)]*\)\s*\{)/,
            `$1\n  const siblings = useCategorySiblings('${tool.link}');`
          );
        }
      }
      fs.writeFileSync(filePath, content);
      console.log(`UPDATED (siblings): ${tool.file}`);
      updated++;
      return;
    }

    // Full wrap needed - these files have <div className="min-h-screen..."> as root
    // Step 1: Add imports
    const importLine = `import ToolPageLayout from '../common/ToolPageLayout';\nimport { useCategorySiblings } from '../../hooks/useCategorySiblings';`;
    if (!content.includes("import ToolPageLayout")) {
      // Find last import line and add after it
      const lines = content.split('\n');
      let lastImportIdx = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) lastImportIdx = i;
      }
      lines.splice(lastImportIdx + 1, 0, importLine);
      content = lines.join('\n');
    }

    // Step 2: Add siblings hook - find the function declaration
    if (!content.includes('useCategorySiblings')) {
      content = content.replace(
        /(export default function \w+\s*\(\))/,
        `$1 {\n  const siblings = useCategorySiblings('${tool.link}');`
      );
      if ((content.match(/const siblings/g) || []).length < 1) {
        content = content.replace(
          /(export default function \w+\s*\([^)]*\)\s*\{)/,
          `$1\n  const siblings = useCategorySiblings('${tool.link}');`
        );
      }
    }

    // Step 3: Wrap the return value
    // Pattern: return (\n    <div className={`min-h-screen...`}>  ->  return (\n    <ToolPageLayout ...>\n      <div ...>
    // And closing: </div>\n  );  ->  </div>\n    </ToolPageLayout>\n  );

    const toolPageLayoutOpen = `<ToolPageLayout title="${tool.name}" icon={${tool.icon ? `<${tool.icon} />` : 'null'}} breadcrumb={[${cat.breadcrumb}]} siblings={siblings} currentPath="${tool.link}">`;
    const toolPageLayoutClose = `</ToolPageLayout>`;

    // Replace opening div with ToolPageLayout + div
    const rootDivRegex = /return\s*\(\s*<div\s+className=\{`[^`]*min-h-screen[^`]*`\}/;
    if (rootDivRegex.test(content)) {
      content = content.replace(rootDivRegex, `return (\n    ${toolPageLayoutOpen}\n      <div className={\`min-h-0\`}>`);
    }

    // Replace the closing </div>\n  ); at the end with </div>\n    </ToolPageLayout>\n  );
    // Find the last </div> before the closing );
    const lastDivClose = content.lastIndexOf('</div>');
    const afterDiv = content.substring(lastDivClose + 6);
    if (afterDiv.trim().startsWith(');')) {
      content = content.substring(0, lastDivClose + 6) + '\n    ' + toolPageLayoutClose + '\n' + afterDiv;
    }

    fs.writeFileSync(filePath, content);
    console.log(`WRAPPED: ${tool.file}`);
    updated++;
  });
});

console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}`);
