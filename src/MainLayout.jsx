import { useTheme } from "./themeContext";
import { Link, Outlet } from 'react-router-dom';
import { FaGithub, FaHeart } from 'react-icons/fa'; // Importing GitHub and Heart icons
import { FiExternalLink } from 'react-icons/fi'; // Importing external link icon

// Main layout component for applying theme and other styling
function MainLayout() {
  // Extracting dark mode state and toggle function from theme context
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div
      className={`flex flex-col min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      } transition-colors duration-300`}
    >
      {/* Header Section */}
      <header className={`flex items-center justify-between p-4 sm:p-5 md:p-6 lg:p-8 shadow-md ${
        isDarkMode ? "bg-gray-800 border-b border-gray-700" : "bg-white border-b border-gray-300 shadow-lg"
      }`}>
        {/* Brand Name */}
        <Link 
          to="/" 
          className={`text-xl sm:text-2xl md:text-3xl font-bold ${
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

      {/* Footer Section */}
      <footer className={`flex flex-col items-center p-4 sm:p-6 lg:p-8 ${
        isDarkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-700"
      }`}>
        {/* Footer content with GitHub icon, heart icon, external link, and sitemap link */}
        <p className="text-sm sm:text-base flex flex-wrap items-center gap-2 mb-2 text-center">
          Made with <span className="animate-pulse"><FaHeart className="text-red-500" /></span> by{" "}
          <a 
            href="https://github.com/authoritydmc" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center gap-1 underline ${
              isDarkMode ? "text-blue-300 hover:text-blue-200" : "text-blue-700 hover:text-blue-600"
            }`}
          >
            <FaGithub /> authoritydmc 
          </a> {" "}at{" "}
          <a 
            href="https://rajlabs.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center gap-1 underline ${
              isDarkMode ? "text-blue-300 hover:text-blue-200" : "text-blue-700 hover:text-blue-600"
            }`}
          >
            Rajlab 
          </a>
        </p>
      </footer>
    </div>
  );
}

export default MainLayout;
