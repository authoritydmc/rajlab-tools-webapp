/**
 * Central registry of tools with query parameters, GitHub source links, and embed configurations.
 */

export const REPO_BASE_URL = 'https://github.com/authoritydmc/rajlab-tools-webapp/blob/main';

export const TOOL_REGISTRY = {
  '/qr-code-generator': {
    title: 'QR Code Generator',
    sourceFile: 'src/components/qrCodes/QRSettingMainPage.jsx',
    category: 'QR Codes',
    description: 'Generate customizable branded QR codes with center logos, custom dot styles, corner eyes, outer frames, and colors.',
    queryParams: [
      { name: 'data', aliases: ['text', 'url', 'q'], type: 'string', default: '', description: 'Text or URL encoded inside the QR code.' },
      { name: 'size', aliases: ['s'], type: 'number', default: 256, description: 'Width and height of the generated QR code in pixels (e.g. 128, 256, 512).' },
      { name: 'logo', aliases: ['icon'], type: 'string', default: 'none', description: 'Center brand icon ("upi", "gpay", "phonepe", "paytm", "whatsapp", "rajlabs", "link", "wifi", or image URL).' },
      { name: 'dots', aliases: ['dotStyle', 'pattern'], type: 'string', default: 'square', description: 'Data dot shape: "square", "rounded", "dots", "classy".' },
      { name: 'corner', aliases: ['eyeFrame'], type: 'string', default: 'square', description: 'Corner eye shape: "square", "extra-rounded", "dot".' },
      { name: 'frame', aliases: ['frameStyle'], type: 'string', default: 'none', description: 'Outer CTA banner frame: "none", "banner-bottom", "banner-top".' },
      { name: 'frameText', aliases: ['cta'], type: 'string', default: 'SCAN ME', description: 'Call-to-action text displayed on outer banner frame.' },
      { name: 'theme', aliases: ['mode'], type: 'string', default: 'light', description: 'Color theme: "light" (Standard Black on White) or "dark" (Inverted).' },
      { name: 'bg', aliases: ['bgColor'], type: 'string', default: 'ffffff', description: 'Custom background hex color without hash (e.g. ffffff, 0f172a).' },
      { name: 'fg', aliases: ['fgColor'], type: 'string', default: '000000', description: 'Custom QR module hex color without hash (e.g. 000000, 6366f1).' },
      { name: 'raw', aliases: ['format'], type: 'string', default: '', description: 'Direct output mode: "image" / "png" (pure canvas image), "svg", or "json".' },
      { name: 'download', type: 'boolean', default: false, description: 'Set to true to trigger instant browser download.' },
      { name: 'embed', type: 'boolean', default: false, description: 'Set to true for clean embed/widget mode without navbar and headers.' },
    ],
    examples: [
      { label: 'Branded WhatsApp QR with Logo', params: { data: 'https://wa.me/919876543210', logo: 'whatsapp', dots: 'dots', frame: 'banner-bottom', frameText: 'CHAT WITH US' } },
      { label: 'UPI Payment with Logo & Frame', params: { data: 'upi://pay?pa=user@upi', logo: 'upi', frame: 'banner-bottom', frameText: 'SCAN TO PAY' } },
      { label: 'Minimal Rounded Black & White', params: { data: 'https://rajlabs.in', dots: 'rounded', corner: 'extra-rounded' } }
    ]
  },
  '/upi-code-generator': {
    title: 'UPI QR Code Generator',
    sourceFile: 'src/components/qrCodes/UPIQrCodeGenerators.jsx',
    category: 'QR Codes',
    description: 'Generate standardized UPI payment QR codes with payee VPA, optional name, amount, UPI/GPay/PhonePe branding, and payment frames.',
    queryParams: [
      { name: 'pa', aliases: ['upi', 'vpa'], type: 'string', default: '', description: 'Receiver UPI ID / VPA (e.g. username@okhdfcbank).' },
      { name: 'pn', aliases: ['name'], type: 'string', default: '', description: 'Payee or Merchant Display Name (optional).' },
      { name: 'am', aliases: ['amount'], type: 'number', default: '', description: 'Optional payment amount in INR (e.g. 100, 499.50).' },
      { name: 'logo', aliases: ['icon'], type: 'string', default: 'upi', description: 'Center logo ("upi", "gpay", "phonepe", "paytm", "none").' },
      { name: 'frame', type: 'string', default: 'banner-bottom', description: 'Outer frame: "banner-bottom", "banner-top", "none".' },
      { name: 'frameText', type: 'string', default: 'SCAN & PAY', description: 'Frame CTA label.' },
      { name: 'size', aliases: ['s'], type: 'number', default: 256, description: 'QR code size in pixels.' },
      { name: 'theme', aliases: ['mode'], type: 'string', default: 'light', description: '"light" (Standard Black on White) or "dark".' },
      { name: 'raw', type: 'string', default: '', description: '"image", "svg", or "json".' },
      { name: 'embed', type: 'boolean', default: false, description: 'Set to true for widget mode.' },
    ],
    examples: [
      { label: 'Branded Google Pay Request', params: { pa: 'raj@okhdfcbank', pn: 'Raj Kumar', am: '250', logo: 'gpay', frameText: 'PAY VIA GPAY' } },
      { label: 'PhonePe Payment Banner', params: { pa: 'merchant@ybl', logo: 'phonepe', frameText: 'PHONEPE ACCEPTED' } }
    ]
  },
  '/whatsapp-qr-code': {
    title: 'WhatsApp QR Code',
    sourceFile: 'src/components/qrCodes/whatsAppQR.jsx',
    category: 'QR Codes',
    description: 'Generate WhatsApp direct chat QR codes with WhatsApp center icon and call-to-action banner frames.',
    queryParams: [
      { name: 'phone', aliases: ['number', 'p'], type: 'string', default: '', description: 'Phone number (7 to 15 digits).' },
      { name: 'code', aliases: ['cc', 'country'], type: 'string', default: '91', description: 'Country calling code (e.g. 91, 1, 44).' },
      { name: 'message', aliases: ['msg', 'text'], type: 'string', default: '', description: 'Optional pre-filled message text.' },
      { name: 'logo', type: 'string', default: 'whatsapp', description: 'Center logo ("whatsapp", "none", or image URL).' },
      { name: 'frame', type: 'string', default: 'banner-bottom', description: '"banner-bottom", "banner-top", "none".' },
      { name: 'frameText', type: 'string', default: 'CHAT ON WHATSAPP', description: 'Frame banner text.' },
      { name: 'theme', aliases: ['mode'], type: 'string', default: 'light', description: '"light" or "dark".' },
      { name: 'raw', type: 'string', default: '', description: '"image", "svg", or "json".' },
      { name: 'embed', type: 'boolean', default: false, description: 'Set to true for widget mode.' },
    ]
  },
  '/qr-scanner': {
    title: 'QR Code Scanner',
    sourceFile: 'src/components/qrCodes/QRScanner.jsx',
    category: 'QR Codes',
    description: 'Scan and extract data from any QR code image via file upload or clipboard paste.',
    queryParams: [
      { name: 'embed', type: 'boolean', default: false, description: 'Set to true for widget mode.' }
    ]
  },
  '/base64-encoder-decoder': {
    title: 'Base64 Encoder/Decoder',
    sourceFile: 'src/components/base64EncoderDecoder/base64tools.jsx',
    category: 'Encryption & Encoding Utilities',
    description: 'Encode text to Base64 format or decode Base64 strings to plain text.',
    queryParams: [
      { name: 'text', aliases: ['input', 'data'], type: 'string', default: '', description: 'Input text to encode or decode.' },
      { name: 'mode', type: 'string', default: 'encode', description: 'Operation mode: "encode" or "decode".' },
      { name: 'raw', type: 'string', default: '', description: '"text" (pure output string) or "json".' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/url-encoder-decoder': {
    title: 'URL Encoder/Decoder',
    sourceFile: 'src/components/urlEncodeDecode/urlEncoderDecoder.jsx',
    category: 'Encryption & Encoding Utilities',
    description: 'Encode special characters into URL percent-encoded format or decode back to text.',
    queryParams: [
      { name: 'text', aliases: ['url', 'input'], type: 'string', default: '', description: 'URL or text to encode/decode.' },
      { name: 'mode', type: 'string', default: 'encode', description: '"encode" or "decode".' },
      { name: 'raw', type: 'string', default: '', description: '"text" or "json".' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/hash-generator': {
    title: 'Hash Generator',
    sourceFile: 'src/components/hash/HashGenerator.jsx',
    category: 'Encryption & Encoding Utilities',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 cryptographic hashes simultaneously.',
    queryParams: [
      { name: 'text', aliases: ['input', 'q'], type: 'string', default: '', description: 'Input string to compute hashes for.' },
      { name: 'raw', type: 'string', default: '', description: '"text" (SHA-256) or "json" (all hashes).' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/uuid-generator': {
    title: 'UUID Generator',
    sourceFile: 'src/components/uuid/UuidGenerator.jsx',
    category: 'Developer Tools',
    description: 'Generate random cryptographic UUID v4 identifiers with custom casing and formatting.',
    queryParams: [
      { name: 'count', aliases: ['n', 'c'], type: 'number', default: 5, description: 'Number of UUIDs to generate (1 to 100).' },
      { name: 'uppercase', aliases: ['upper'], type: 'boolean', default: false, description: 'Generate in UPPERCASE.' },
      { name: 'nodashes', aliases: ['raw'], type: 'boolean', default: false, description: 'Strip hyphens/dashes from output.' },
      { name: 'raw', type: 'string', default: '', description: '"text" (newline separated) or "json".' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/lorem-ipsum': {
    title: 'Lorem Ipsum Generator',
    sourceFile: 'src/components/lorem/LoremIpsum.jsx',
    category: 'Text Utilities',
    description: 'Generate mock placeholder text in paragraphs, sentences, or words.',
    queryParams: [
      { name: 'count', aliases: ['n', 'c'], type: 'number', default: 3, description: 'Quantity count (1-100).' },
      { name: 'unit', aliases: ['type'], type: 'string', default: 'paragraphs', description: '"paragraphs", "sentences", or "words".' },
      { name: 'raw', type: 'string', default: '', description: '"text" or "json".' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/sanitize-text': {
    title: 'Sanitize Text',
    sourceFile: 'src/components/text-Sanitize/text-Sanitize.jsx',
    category: 'Text Utilities',
    description: 'Strip non-alphanumeric and special characters to clean messy text.',
    queryParams: [
      { name: 'text', aliases: ['input'], type: 'string', default: '', description: 'Text to sanitize.' },
      { name: 'raw', type: 'string', default: '', description: '"text" or "json".' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/format-text': {
    title: 'Text Formatter',
    sourceFile: 'src/components/text-formatter/text-formatter.jsx',
    category: 'Text Utilities',
    description: 'Transform text case (upper, lower, title, reverse, trim, etc.).',
    queryParams: [
      { name: 'text', aliases: ['input'], type: 'string', default: '', description: 'Input text to transform.' },
      { name: 'raw', type: 'string', default: '', description: '"text" or "json".' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/markdown-playground': {
    title: 'Markdown Playground',
    sourceFile: 'src/components/markdown/MarkdownPlayground.jsx',
    category: 'Text Utilities',
    description: 'Interactive markdown playground with Monaco editor, header controls, live preview, TOC and versatile exports.',
    queryParams: [
      { name: 'text', aliases: ['md', 'content'], type: 'string', default: '', description: 'Initial markdown text.' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/jwt-decoder': {
    title: 'JWT Decoder',
    sourceFile: 'src/components/json/JwtDecoder.jsx',
    category: 'JSON Utilities',
    description: 'Inspect, decode, and validate JSON Web Tokens with header, payload, and expiry countdown.',
    queryParams: [
      { name: 'token', aliases: ['jwt'], type: 'string', default: '', description: 'JWT token string.' },
      { name: 'raw', type: 'string', default: '', description: '"json" returns decoded payload.' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/json-viewer': {
    title: 'JSON Viewer',
    sourceFile: 'src/components/json/JsonViewer.jsx',
    category: 'JSON Utilities',
    description: 'Format, validate, search, and navigate collapsible JSON tree hierarchy.',
    queryParams: [
      { name: 'json', aliases: ['data', 'text'], type: 'string', default: '', description: 'JSON string to view and inspect.' },
      { name: 'raw', type: 'string', default: '', description: '"json" or "text".' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/json-diff-checker': {
    title: 'JSON Diff Checker',
    sourceFile: 'src/components/json/JsonDiffChecker.jsx',
    category: 'JSON Utilities',
    description: 'Compare two JSON documents and highlight key/value additions, deletions, and modifications.',
    queryParams: [
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/json-to-csv': {
    title: 'JSON to CSV Converter',
    sourceFile: 'src/components/json/JsonToCsv.jsx',
    category: 'JSON Utilities',
    description: 'Convert arrays of JSON objects into tabular CSV format for spreadsheets.',
    queryParams: [
      { name: 'json', aliases: ['input'], type: 'string', default: '', description: 'JSON string to convert to CSV.' },
      { name: 'raw', type: 'string', default: '', description: '"text" returns raw CSV.' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/csv-to-json': {
    title: 'CSV to JSON Converter',
    sourceFile: 'src/components/json/CsvToJson.jsx',
    category: 'JSON Utilities',
    description: 'Convert CSV table rows into formatted JSON array objects.',
    queryParams: [
      { name: 'csv', aliases: ['input'], type: 'string', default: '', description: 'CSV string to convert.' },
      { name: 'raw', type: 'string', default: '', description: '"json".' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/json-to-xml': {
    title: 'JSON to XML Converter',
    sourceFile: 'src/components/json/JsonToXml.jsx',
    category: 'JSON Utilities',
    description: 'Convert structured JSON to valid XML documents.',
    queryParams: [
      { name: 'json', aliases: ['input'], type: 'string', default: '', description: 'JSON string to convert to XML.' },
      { name: 'root', type: 'string', default: 'root', description: 'Root tag name.' },
      { name: 'raw', type: 'string', default: '', description: '"text" returns raw XML.' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/xml-to-json': {
    title: 'XML to JSON Converter',
    sourceFile: 'src/components/json/XmlToJson.jsx',
    category: 'JSON Utilities',
    description: 'Parse XML documents into clean JSON format.',
    queryParams: [
      { name: 'xml', aliases: ['input'], type: 'string', default: '', description: 'XML string to parse.' },
      { name: 'raw', type: 'string', default: '', description: '"json".' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/json-to-yaml': {
    title: 'JSON to YAML Converter',
    sourceFile: 'src/components/json/JsonToYaml.jsx',
    category: 'JSON Utilities',
    description: 'Convert JSON data structures to readable YAML.',
    queryParams: [
      { name: 'json', aliases: ['input'], type: 'string', default: '', description: 'JSON string to convert.' },
      { name: 'raw', type: 'string', default: '', description: '"text" returns raw YAML.' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/yaml-to-json': {
    title: 'YAML to JSON Converter',
    sourceFile: 'src/components/json/YamlToJson.jsx',
    category: 'JSON Utilities',
    description: 'Convert YAML configuration documents into standard JSON.',
    queryParams: [
      { name: 'yaml', aliases: ['input'], type: 'string', default: '', description: 'YAML text to convert.' },
      { name: 'raw', type: 'string', default: '', description: '"json".' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/regex-tester': {
    title: 'Regex Tester',
    sourceFile: 'src/components/regex/RegexTester.jsx',
    category: 'Developer Tools',
    description: 'Test regular expression patterns against sample text with live matches and group captures.',
    queryParams: [
      { name: 'pattern', aliases: ['p', 'regex'], type: 'string', default: '', description: 'Regular expression pattern.' },
      { name: 'text', aliases: ['str', 'input'], type: 'string', default: '', description: 'Test string to run regex against.' },
      { name: 'flags', aliases: ['f'], type: 'string', default: 'g', description: 'Regex flags like "g", "gi", "gim".' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/timestamp-converter': {
    title: 'Timestamp Converter',
    sourceFile: 'src/components/timestamp/TimestampConverter.jsx',
    category: 'Developer Tools',
    description: 'Convert Unix epoch timestamps to human dates across international timezones.',
    queryParams: [
      { name: 'ts', aliases: ['timestamp', 'time'], type: 'string', default: '', description: 'Unix timestamp in seconds or milliseconds.' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/css-unit-converter': {
    title: 'CSS Unit Converter',
    sourceFile: 'src/components/css/CssUnitConverter.jsx',
    category: 'Developer Tools',
    description: 'Instantly convert between px, rem, em, %, vw, vh, and pt units.',
    queryParams: [
      { name: 'val', aliases: ['v', 'value'], type: 'number', default: 16, description: 'Numeric value to convert.' },
      { name: 'unit', aliases: ['u'], type: 'string', default: 'px', description: 'Source unit (px, rem, em, %, vw, vh, pt).' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/color-picker': {
    title: 'Color Picker & Converter',
    sourceFile: 'src/components/color/ColorPicker.jsx',
    category: 'Design Utilities',
    description: 'Color palette inspector and HEX, RGB, HSL converter.',
    queryParams: [
      { name: 'hex', aliases: ['color', 'c'], type: 'string', default: '#3B82F6', description: 'Hex color code (e.g. #6366f1 or 6366f1).' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/password-generator': {
    title: 'Password Generator',
    sourceFile: 'src/components/passwords/passwordGen.jsx',
    category: 'Encryption & Encoding Utilities',
    description: 'Generate cryptographically strong random passwords.',
    queryParams: [
      { name: 'length', aliases: ['len', 'l'], type: 'number', default: 16, description: 'Password character length.' },
      { name: 'raw', type: 'string', default: '', description: '"text".' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/bcrypt-hashing': {
    title: 'BCrypt Hashing',
    sourceFile: 'src/components/bcryptEncrypter/bcryptTool.jsx',
    category: 'Encryption & Encoding Utilities',
    description: 'Generate bcrypt password hashes and verify matches client-side.',
    queryParams: [
      { name: 'text', aliases: ['input'], type: 'string', default: '', description: 'Plaintext string to hash.' },
      { name: 'rounds', aliases: ['salt'], type: 'number', default: 10, description: 'Bcrypt salt work factor.' },
      { name: 'raw', type: 'string', default: '', description: '"text".' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/image-to-base64': {
    title: 'Image to Base64 String Converter',
    sourceFile: 'src/components/base64EncoderDecoder/imageToBase64Tool.jsx',
    category: 'Encryption & Encoding Utilities',
    description: 'Convert local image files to base64 Data URLs.',
    queryParams: [
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/base64-to-image': {
    title: 'Base64 to Image Preview Generator',
    sourceFile: 'src/components/base64EncoderDecoder/base64ToImage.jsx',
    category: 'Encryption & Encoding Utilities',
    description: 'Preview and download images from Base64 Data URL strings.',
    queryParams: [
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/print-cost-estimator': {
    title: 'Print Cost Estimator',
    sourceFile: 'src/components/calculators/printCostEstimator.jsx',
    category: 'Calculators',
    description: 'Calculate page printing expenses, ink yields, electricity, and custom profit margins.',
    queryParams: [
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/image-compressor': {
    title: 'Image Compressor',
    sourceFile: 'src/components/image/ImageCompressor.jsx',
    category: 'Multimedia Utilities',
    description: 'Compress PNG, JPEG, and WebP images locally without server uploads.',
    queryParams: [
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/video-converter': {
    title: 'Video Converter',
    sourceFile: 'src/components/media-utils/video-convertor.jsx',
    category: 'Multimedia Utilities',
    description: 'Convert video formats directly inside browser using WebAssembly FFmpeg.',
    queryParams: [
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/merge-pdf': {
    title: 'Merge PDF',
    sourceFile: 'src/components/pdf-tools/mergePdf.jsx',
    category: 'PDF Tools',
    description: 'Combine multiple PDF files into one single document securely in browser.',
    queryParams: [
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/split-pdf': {
    title: 'Split PDF',
    sourceFile: 'src/components/pdf-tools/splitPdf.jsx',
    category: 'PDF Tools',
    description: 'Extract specific page numbers or page ranges into a separate PDF.',
    queryParams: [
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/unlock-pdf': {
    title: 'Unlock PDF',
    sourceFile: 'src/components/pdf-tools/unlockPdf.jsx',
    category: 'PDF Tools',
    description: 'Remove password protection encryption from unlocked PDF files.',
    queryParams: [
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/unlock-excel': {
    title: 'Unlock Excel Sheet',
    sourceFile: 'src/components/excel-tools/unlockExcel.jsx',
    category: 'Excel Tools',
    description: 'Instantly strip Sheet Protection and Workbook Protection passwords from .xlsx files.',
    queryParams: [
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/text-diff': {
    title: 'Text Diff Studio',
    sourceFile: 'src/components/diff/TextDiffStudio.jsx',
    category: 'Text Utilities',
    description: 'Side-by-side and unified text diff with line/word/char modes, ignore options and export.',
    queryParams: [
      { name: 'text', aliases: ['a','input'], type: 'string', default: '', description: 'First text to compare.' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/html-entity': {
    title: 'HTML Entity Studio',
    sourceFile: 'src/components/html-entity/HtmlEntityStudio.jsx',
    category: 'Developer Tools',
    description: 'Encode/decode HTML entities between named, numeric and hex with live preview.',
    queryParams: [
      { name: 'text', aliases: ['input'], type: 'string', default: '', description: 'Text to encode/decode.' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/url-lab': {
    title: 'URL Lab',
    sourceFile: 'src/components/url-lab/UrlLab.jsx',
    category: 'Developer Tools',
    description: 'Parse URL parts and build query strings visually.',
    queryParams: [
      { name: 'url', aliases: ['input','text'], type: 'string', default: '', description: 'URL to parse.' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  },
  '/code-formatter': {
    title: 'Code Formatter',
    sourceFile: 'src/components/code-formatter/CodeFormatter.jsx',
    category: 'Developer Tools',
    description: 'Beautify and minify JSON, HTML, CSS, SQL with Monaco editor.',
    queryParams: [
      { name: 'code', aliases: ['text','input'], type: 'string', default: '', description: 'Code to format.' },
      { name: 'lang', aliases: ['language'], type: 'string', default: 'json', description: 'Language: json, html, css, sql.' },
      { name: 'embed', type: 'boolean', default: false, description: 'Embed mode.' }
    ]
  }
};

export function getToolInfo(path) {
  const cleanPath = path?.split('?')[0] || '';
  return TOOL_REGISTRY[cleanPath] || null;
}

export function getGitHubUrl(path) {
  const tool = getToolInfo(path);
  if (tool && tool.sourceFile) {
    return `${REPO_BASE_URL}/${tool.sourceFile}`;
  }
  return 'https://github.com/authoritydmc/rajlab-tools-webapp';
}
