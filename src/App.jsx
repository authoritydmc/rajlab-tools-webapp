import {  RouterProvider } from 'react-router-dom';

import { ThemeProvider } from './themeContext';
import { router } from './routers';
function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
