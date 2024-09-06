
import RootLayout from './RootLayout';
import MainLayout from './MainLayout';
import { ThemeProvider } from './providers/ThemeContext';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainToolPage from './components/MainToolPage';
import TextSanitize from './components/text-Sanitize/text-Sanitize';

function App() {

  const route=createBrowserRouter([
    {
      path:"/",
      element:<MainToolPage/>
    },
    {
      path:"tools/sanitize-text",
      element:<TextSanitize/>
    }
  ])
  return (
    <ThemeProvider>
      <RootLayout>
        <MainLayout>
         <RouterProvider router={route}/>
        </MainLayout>
      </RootLayout>
    </ThemeProvider>
  );
}



export default App;
