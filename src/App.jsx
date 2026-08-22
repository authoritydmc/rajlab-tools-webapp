import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './themeContext';
import { FavoritesProvider } from './favoritesContext';
import { ChaiModalProvider } from './chaiModalContext';
import { router } from './routers';

function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <ChaiModalProvider>
          <RouterProvider router={router} />
        </ChaiModalProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}

export default App;
