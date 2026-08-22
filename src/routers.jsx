import { createBrowserRouter } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import MainToolPage from './components/MainToolPage';
import MainLayout from './MainLayout';
import ErrorBoundary from './errorHandler';
import GlobalError from './components/common/GlobalError';

const Loading = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-slate-400">Loading tool...</span>
    </div>
  </div>
);

// ... lazy imports ...
const TextSanitize = lazy(() => import('./components/text-Sanitize/text-Sanitize'));
const PassportGrid = lazy(() => import('./components/PassportGrid'));

const TextFormatter = lazy(() => import('./components/text-formatter/text-formatter'));
const Base64Tool = lazy(() => import('./components/base64EncoderDecoder/base64tools'));
const BcryptTool = lazy(() => import('./components/bcryptEncrypter/bcryptTool'));
const ImageToBase64Tool = lazy(() => import('./components/base64EncoderDecoder/imageToBase64Tool'));
const Base64ToImage = lazy(() => import('./components/base64EncoderDecoder/base64ToImage'));
const URLEncoderDecoder = lazy(() => import('./components/urlEncodeDecode/urlEncoderDecoder'));
const PasswordGenerator = lazy(() => import('./components/passwords/passwordGen'));
const PrintRateCalculator = lazy(() => import('./components/calculators/printCostEstimator'));
const QRCodeSettings = lazy(() => import('./components/qrCodes/QRSettingMainPage'));
const UPIPaymentSettings = lazy(() => import('./components/qrCodes/UPIQrCodeGenerators'));
const FfmpegTool = lazy(() => import('./components/media-utils/video-convertor'));
const WhatsAppQr = lazy(() => import('./components/qrCodes/whatsAppQR'));
const JwtDecoder = lazy(() => import('./components/json/JwtDecoder'));
const JsonViewer = lazy(() => import('./components/json/JsonViewer'));
const JsonDiffChecker = lazy(() => import('./components/json/JsonDiffChecker'));
const JsonToCsv = lazy(() => import('./components/json/JsonToCsv'));
const CsvToJson = lazy(() => import('./components/json/CsvToJson'));
const JsonToXml = lazy(() => import('./components/json/JsonToXml'));
const XmlToJson = lazy(() => import('./components/json/XmlToJson'));
const JsonToYaml = lazy(() => import('./components/json/JsonToYaml'));
const YamlToJson = lazy(() => import('./components/json/YamlToJson'));
const ColorPicker = lazy(() => import('./components/color/ColorPicker'));
const MarkdownPlayground = lazy(() => import('./components/markdown/MarkdownPlayground'));
const TextDiffStudio = lazy(() => import('./components/diff/TextDiffStudio'));
const HtmlEntityStudio = lazy(() => import('./components/html-entity/HtmlEntityStudio'));
const UrlLab = lazy(() => import('./components/url-lab/UrlLab'));
const CodeFormatter = lazy(() => import('./components/code-formatter/CodeFormatter'));
const LoremIpsum = lazy(() => import('./components/lorem/LoremIpsum'));
const RegexTester = lazy(() => import('./components/regex/RegexTester'));
const UuidGenerator = lazy(() => import('./components/uuid/UuidGenerator'));
const TimestampConverter = lazy(() => import('./components/timestamp/TimestampConverter'));
const HashGenerator = lazy(() => import('./components/hash/HashGenerator'));
const ImageCompressor = lazy(() => import('./components/image/ImageCompressor'));
const CssUnitConverter = lazy(() => import('./components/css/CssUnitConverter'));
const Changelog = lazy(() => import('./components/Changelog'));
const MergePdfTool = lazy(() => import('./components/pdf-tools/mergePdf'));
const SplitPdfTool = lazy(() => import('./components/pdf-tools/splitPdf'));
const UnlockPdfTool = lazy(() => import('./components/pdf-tools/unlockPdf'));
const PdfEditor = lazy(() => import('./components/pdf-tools/PdfEditor'));
const OrganizePdf = lazy(() => import('./components/pdf-tools/OrganizePdf'));
const PdfToImage = lazy(() => import('./components/pdf-tools/PdfToImage'));
const ImageToPdf = lazy(() => import('./components/pdf-tools/ImageToPdf'));
const ProtectPdf = lazy(() => import('./components/pdf-tools/ProtectPdf'));
const UnlockExcelTool = lazy(() => import('./components/excel-tools/unlockExcel'));
const QRScanner = lazy(() => import('./components/qrCodes/QRScanner'));
const DirectEmbedView = lazy(() => import('./components/embeds/DirectEmbedView'));
const RawResultView = lazy(() => import('./components/embeds/RawResultView'));

const S = Suspense;

export const router = createBrowserRouter([
    {
      path: "/raw/:toolSlug",
      element: <S fallback={<Loading />}><RawResultView /></S>,
      errorElement: <GlobalError />,
    },
    {
      path: "/embed/:toolSlug",
      element: <S fallback={<Loading />}><DirectEmbedView /></S>,
      errorElement: <GlobalError />,
    },
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          errorElement: <GlobalError />,
          children: [
            { path: "/", element: <MainToolPage /> },
            { path: '*', element: <ErrorBoundary /> },
            { path: "sanitize-text", element: <S fallback={<Loading />}><TextSanitize /></S> },
            { path: "format-text", element: <S fallback={<Loading />}><TextFormatter /></S> },
            { path: "base64-encoder-decoder", element: <S fallback={<Loading />}><Base64Tool /></S> },
            { path: "bcrypt-hashing", element: <S fallback={<Loading />}><BcryptTool /></S> },
            { path: "image-to-base64", element: <S fallback={<Loading />}><ImageToBase64Tool /></S> },
            { path: "base64-to-image", element: <S fallback={<Loading />}><Base64ToImage /></S> },
            { path: "url-encoder-decoder", element: <S fallback={<Loading />}><URLEncoderDecoder /></S> },
            { path: "password-generator", element: <S fallback={<Loading />}><PasswordGenerator /></S> },
            { path: "print-cost-estimator", element: <S fallback={<Loading />}><PrintRateCalculator /></S> },
            { path: "qr-code-generator", element: <S fallback={<Loading />}><QRCodeSettings /></S> },
            { path: "upi-code-generator", element: <S fallback={<Loading />}><UPIPaymentSettings /></S> },
            { path: "whatsapp-qr-code", element: <S fallback={<Loading />}><WhatsAppQr /></S> },
            { path: "qr-scanner", element: <S fallback={<Loading />}><QRScanner /></S> },
            { path: "video-converter", element: <S fallback={<Loading />}><FfmpegTool /></S> },
            { path: "jwt-decoder", element: <S fallback={<Loading />}><JwtDecoder /></S> },
            { path: "json-viewer", element: <S fallback={<Loading />}><JsonViewer /></S> },
            { path: "json-diff-checker", element: <S fallback={<Loading />}><JsonDiffChecker /></S> },
            { path: "json-to-csv", element: <S fallback={<Loading />}><JsonToCsv /></S> },
            { path: "csv-to-json", element: <S fallback={<Loading />}><CsvToJson /></S> },
            { path: "json-to-xml", element: <S fallback={<Loading />}><JsonToXml /></S> },
            { path: "xml-to-json", element: <S fallback={<Loading />}><XmlToJson /></S> },
            { path: "json-to-yaml", element: <S fallback={<Loading />}><JsonToYaml /></S> },
            { path: "yaml-to-json", element: <S fallback={<Loading />}><YamlToJson /></S> },
            { path: "color-picker", element: <S fallback={<Loading />}><ColorPicker /></S> },
            { path: "markdown-playground", element: <S fallback={<Loading />}><MarkdownPlayground /></S> },
            { path: "text-diff", element: <S fallback={<Loading />}><TextDiffStudio /></S> },
            { path: "html-entity", element: <S fallback={<Loading />}><HtmlEntityStudio /></S> },
            { path: "url-lab", element: <S fallback={<Loading />}><UrlLab /></S> },
            { path: "code-formatter", element: <S fallback={<Loading />}><CodeFormatter /></S> },
            { path: "lorem-ipsum", element: <S fallback={<Loading />}><LoremIpsum /></S> },
            { path: "regex-tester", element: <S fallback={<Loading />}><RegexTester /></S> },
            { path: "uuid-generator", element: <S fallback={<Loading />}><UuidGenerator /></S> },
            { path: "timestamp-converter", element: <S fallback={<Loading />}><TimestampConverter /></S> },
            { path: "hash-generator", element: <S fallback={<Loading />}><HashGenerator /></S> },
            { path: "image-compressor", element: <S fallback={<Loading />}><ImageCompressor /></S> },
            { path: "css-unit-converter", element: <S fallback={<Loading />}><CssUnitConverter /></S> },
            { path: "changelog", element: <S fallback={<Loading />}><Changelog /></S> },
            { path: "merge-pdf", element: <S fallback={<Loading />}><MergePdfTool /></S> },
            { path: "split-pdf", element: <S fallback={<Loading />}><SplitPdfTool /></S> },
            { path: "unlock-pdf", element: <S fallback={<Loading />}><UnlockPdfTool /></S> },
            { path: "pdf-editor", element: <S fallback={<Loading />}><PdfEditor /></S> },
            { path: "organize-pdf", element: <S fallback={<Loading />}><OrganizePdf /></S> },
            { path: "pdf-to-image", element: <S fallback={<Loading />}><PdfToImage /></S> },
            { path: "image-to-pdf", element: <S fallback={<Loading />}><ImageToPdf /></S> },
            { path: "protect-pdf", element: <S fallback={<Loading />}><ProtectPdf /></S> },
            { path: "passport-grid", element: <S fallback={<Loading/>}><PassportGrid /></S> },
            { path: "unlock-excel", element: <S fallback={<Loading />}><UnlockExcelTool /></S> },
          ]
        }
      ],
    },
  ]);
