import { createBrowserRouter } from 'react-router-dom';
import MainToolPage from './components/MainToolPage'; // Ensure correct path
import MainLayout from './MainLayout'; // Ensure correct path
import TextSanitize from './components/text-Sanitize/text-Sanitize'
import TextFormatter from './components/text-formatter/text-formatter';
import Base64Tool from './components/base64EncoderDecoder/base64tools';
import BcryptTool from './components/bcryptEncrypter/bcryptTool';
import ImageToBase64Tool from './components/base64EncoderDecoder/imageToBase64Tool';
import Base64ToImagePreviewGenerator from './components/base64EncoderDecoder/base64ToImage';
import URLEncoderDecoderTool from './components/urlEncodeDecode/urlEncoderDecoder';
import ErrorBoundary from './errorHandler';
import PasswordGenerator from './components/passwords/passwordGen';
import PrintRateCalculator from './components/calculators/printCostEstimator';
import QRCodeSettings from './components/qrCodes/QRSettingMainPage';
import UPIPaymentSettings from './components/qrCodes/UPIQrCodeGenerators';
import FfmpegTool from './components/media-utils/video-convertor';
import WhatsAppQr from './components/qrCodes/whatsAppQR';

export const router = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />, // MainLayout wraps around all child routes
      children: [
        {
          path: "/", // Home route
          element: <MainToolPage />,
        },
        {
          path: '*', // Catch-all route for 404 pages
          element: <ErrorBoundary />, // Render the ErrorBoundary component here
        },
        {
          path: "sanitize-text", // Relative path for nested route
          element: <TextSanitize />,
        },
        {
          path: "format-text", // Relative path for nested route
          element: <TextFormatter />,
        },
        {
          path: "base64-encoder-decoder", // Relative path for nested route
          element: <Base64Tool />,
        },
        {
          path: "bcrypt-hashing", // Relative path for nested route
          element: <BcryptTool />,
        },
        {
          path: "image-to-base64", // Relative path for nested route
          element: <ImageToBase64Tool />,
        },
        {
          path: "base64-to-image", // Relative path for nested route
          element: <Base64ToImagePreviewGenerator />,
        },
        {
          path: "url-encoder-decoder", // Relative path for nested route
          element: <URLEncoderDecoderTool />,
        },
        {
          path: "password-generator", // Relative path for nested route
          element: <PasswordGenerator />,
        },
        {
          path: "print-cost-estimator", // Relative path for nested route
          element: <PrintRateCalculator />,
        },
        {
          path: "qr-code-generator", // Relative path for nested route
          element: <QRCodeSettings />,
        },
        {
          path:"upi-code-generator",
          element:<UPIPaymentSettings/>
        },
        {
          path:"video-converter",
          element:<FfmpegTool/>
        }
        ,
        {
          path:"whatsapp-qr-code",
          element:<WhatsAppQr/>
        }
      ],
    },
  ]);