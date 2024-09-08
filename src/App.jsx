import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainToolPage from './components/MainToolPage'; // Ensure correct path
import MainLayout from './MainLayout'; // Ensure correct path
import { ThemeProvider } from './themeContext'; // Ensure correct path
import TextSanitize from './components/text-Sanitize/text-Sanitize'
import TextFormatter from './components/text-formatter/text-formatter';
import Base64Tool from './components/base64EncoderDecoder/base64tools';
const router = createBrowserRouter([
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
    ],
  },
]);

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
