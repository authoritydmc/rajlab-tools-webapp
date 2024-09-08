import { createBrowserRouter } from 'react-router-dom';
import MainToolPage from './components/MainToolPage'; // Ensure correct path
import MainLayout from './MainLayout'; // Ensure correct path
import TextSanitize from './components/text-Sanitize/text-Sanitize'
import TextFormatter from './components/text-formatter/text-formatter';
import Base64Tool from './components/base64EncoderDecoder/base64tools';
import BcryptTool from './components/bcryptEncrypter/bcryptTool';
import ImageToBase64Tool from './components/base64EncoderDecoder/imageToBase64Tool';
import Base64ToImagePreviewGenerator from './components/base64EncoderDecoder/base64ToImage';

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
      ],
    },
  ]);