import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainToolPage from './components/MainToolPage'; // Ensure correct path
import MainLayout from './MainLayout'; // Ensure correct path
import { ThemeProvider } from './themeContext'; // Ensure correct path
import TextSanitize from './components/text-Sanitize/text-Sanitize'
import TextFormatter from './components/text-formatter/text-formatter';
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
        path: "tools/sanitize-text", // Relative path for nested route
        element: <TextSanitize />,
      },
      {
        path: "tools/format-text", // Relative path for nested route
        element: <TextFormatter />,
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
