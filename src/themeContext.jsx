// Import necessary hooks and components from React
import { createContext, useState, useContext } from 'react';

// Define a context to manage theme state
const ThemeContext = createContext();

// Create a provider component to wrap your app
export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Function to toggle dark mode
  const toggleDarkMode = () => setIsDarkMode(prevMode => !prevMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  return useContext(ThemeContext);
}
