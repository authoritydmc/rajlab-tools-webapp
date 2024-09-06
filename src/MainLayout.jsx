import { useTheme } from "./providers/ThemeContext";

// Main layout component for applying theme and other styling
function MainLayout({ children }) {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div
      className={`flex flex-col ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      } transition-colors duration-300`}
    >
      <header className="flex items-center justify-center p-6 sm:p-8 bg-gradient-to-r from-purple-600 to-indigo-600 relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-white">
          Rajlab Utilities
        </h1>
        <button
          className={`absolute top-4 right-4 p-3 rounded-full transition-colors duration-300 ${
            isDarkMode ? "bg-gray-700" : "bg-gray-300"
          }`}
          onClick={toggleDarkMode}
          title="Toggle Dark Mode"
        >
          {isDarkMode ? "🌞" : "🌙"}
        </button>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
