import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainToolPage from './components/MainToolPage';
import TextSanitize from './components/text-Sanitize/text-Sanitize';
import MainLayout from './MainLayout';
import { ThemeProvider } from './providers/ThemeContext';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, 
    children: [
      {
        path: "/",
        element: <MainToolPage />,
      },
      {
        path: "/tools/sanitize-text",
        element: <TextSanitize />,
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
