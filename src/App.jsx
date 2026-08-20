import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './themeContext';
import { FavoritesProvider } from './favoritesContext';
import { router } from './routers';

function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <RouterProvider router={router} />
      </FavoritesProvider>
    </ThemeProvider>
  );
}

export default App;
