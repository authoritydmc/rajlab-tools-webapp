import { useTheme } from "./themeContext";
import { Link } from 'react-router-dom';
import { Outlet } from "react-router-dom";

// Main layout component for applying theme and other styling
function MainLayout() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div
      className={`flex flex-col min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      } transition-colors duration-300`}
    >
      {/* Header Section */}
      <header className={`flex items-center justify-between p-4 sm:p-6 lg:p-8 shadow-md ${
        isDarkMode ? "bg-gray-800 border-b border-gray-700" : "bg-white border-b border-gray-300 shadow-lg"
      }`}>
  
        <Link 
          to="/" 
          className={`text-2xl sm:text-3xl font-bold ${
            isDarkMode ? "text-white" : "text-gray-900"
          } flex-1 text-center`}
        >
          Rajlab Utilities
        </Link>

        {/* Dark Mode Toggle Button */}
        <button
          type="button"
          className={`p-2 rounded-full transition-colors duration-300 ${
            isDarkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          onClick={toggleDarkMode}
          title="Toggle Dark Mode"
        >
          {isDarkMode ? "🌞" : "🌙"}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
