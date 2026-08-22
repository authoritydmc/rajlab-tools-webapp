import React, { lazy, Suspense } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../themeContext';
import { getToolInfo } from '../../utils/toolRegistry';

// Dynamic lazy map of embedded components
const QRSettingMainPage = lazy(() => import('../qrCodes/QRSettingMainPage'));
const UPIPaymentSettings = lazy(() => import('../qrCodes/UPIQrCodeGenerators'));
const WhatsAppQr = lazy(() => import('../qrCodes/whatsAppQR'));
const QRScanner = lazy(() => import('../qrCodes/QRScanner'));
const Base64Tool = lazy(() => import('../base64EncoderDecoder/base64tools'));
const URLTool = lazy(() => import('../urlEncodeDecode/urlEncoderDecoder'));
const HashGenerator = lazy(() => import('../hash/HashGenerator'));
const UuidGenerator = lazy(() => import('../uuid/UuidGenerator'));
const LoremIpsum = lazy(() => import('../lorem/LoremIpsum'));
const SanitizeText = lazy(() => import('../text-Sanitize/text-Sanitize'));
const TextFormatter = lazy(() => import('../text-formatter/text-formatter'));
const MarkdownPreview = lazy(() => import('../markdown/MarkdownPreview'));
const JsonViewer = lazy(() => import('../json/JsonViewer'));
const JwtDecoder = lazy(() => import('../json/JwtDecoder'));
const JsonDiffChecker = lazy(() => import('../json/JsonDiffChecker'));
const JsonToCsv = lazy(() => import('../json/JsonToCsv'));
const CsvToJson = lazy(() => import('../json/CsvToJson'));
const JsonToXml = lazy(() => import('../json/JsonToXml'));
const XmlToJson = lazy(() => import('../json/XmlToJson'));
const JsonToYaml = lazy(() => import('../json/JsonToYaml'));
const YamlToJson = lazy(() => import('../json/YamlToJson'));
const RegexTester = lazy(() => import('../regex/RegexTester'));
const TimestampConverter = lazy(() => import('../timestamp/TimestampConverter'));
const CssUnitConverter = lazy(() => import('../css/CssUnitConverter'));
const ColorPicker = lazy(() => import('../color/ColorPicker'));
const PasswordGen = lazy(() => import('../passwords/passwordGen'));
const BcryptTool = lazy(() => import('../bcryptEncrypter/bcryptTool'));
const ImageToBase64 = lazy(() => import('../base64EncoderDecoder/imageToBase64Tool'));
const Base64ToImage = lazy(() => import('../base64EncoderDecoder/base64ToImage'));
const PrintCostEstimator = lazy(() => import('../calculators/printCostEstimator'));
const ImageCompressor = lazy(() => import('../image/ImageCompressor'));
const VideoConvertor = lazy(() => import('../media-utils/video-convertor'));
const MergePdf = lazy(() => import('../pdf-tools/mergePdf'));
const SplitPdf = lazy(() => import('../pdf-tools/splitPdf'));
const UnlockPdf = lazy(() => import('../pdf-tools/unlockPdf'));
const UnlockExcel = lazy(() => import('../excel-tools/unlockExcel'));

const COMPONENT_MAP = {
  'qr-code-generator': QRSettingMainPage,
  'upi-code-generator': UPIPaymentSettings,
  'whatsapp-qr-code': WhatsAppQr,
  'qr-scanner': QRScanner,
  'base64-encoder-decoder': Base64Tool,
  'url-encoder-decoder': URLTool,
  'hash-generator': HashGenerator,
  'uuid-generator': UuidGenerator,
  'lorem-ipsum': LoremIpsum,
  'sanitize-text': SanitizeText,
  'format-text': TextFormatter,
  'markdown-preview': MarkdownPreview,
  'json-viewer': JsonViewer,
  'jwt-decoder': JwtDecoder,
  'json-diff-checker': JsonDiffChecker,
  'json-to-csv': JsonToCsv,
  'csv-to-json': CsvToJson,
  'json-to-xml': JsonToXml,
  'xml-to-json': XmlToJson,
  'json-to-yaml': JsonToYaml,
  'yaml-to-json': YamlToJson,
  'regex-tester': RegexTester,
  'timestamp-converter': TimestampConverter,
  'css-unit-converter': CssUnitConverter,
  'color-picker': ColorPicker,
  'password-generator': PasswordGen,
  'bcrypt-hashing': BcryptTool,
  'image-to-base64': ImageToBase64,
  'base64-to-image': Base64ToImage,
  'print-cost-estimator': PrintCostEstimator,
  'image-compressor': ImageCompressor,
  'video-converter': VideoConvertor,
  'merge-pdf': MergePdf,
  'split-pdf': SplitPdf,
  'unlock-pdf': UnlockPdf,
  'unlock-excel': UnlockExcel,
};

export default function DirectEmbedView() {
  const { toolSlug } = useParams();
  const [searchParams] = useSearchParams();
  const { isDarkMode } = useTheme();

  const slug = (toolSlug || '').replace(/^\//, '');
  const Component = COMPONENT_MAP[slug];
  const toolInfo = getToolInfo(`/${slug}`);

  if (!Component) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 text-center ${
        isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'
      }`}>
        <div>
          <h2 className="text-xl font-bold mb-2">Embed Tool Not Found</h2>
          <p className="text-sm text-slate-500 mb-4">The tool "{slug}" does not exist or cannot be embedded.</p>
          <a
            href="/"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all"
          >
            Explore All Tools
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
    }`}>
      <Suspense fallback={
        <div className="flex items-center justify-center p-12 text-sm text-slate-500">
          Loading embed widget...
        </div>
      }>
        <div className="w-full flex-1">
          <Component />
        </div>
      </Suspense>
    </div>
  );
}
