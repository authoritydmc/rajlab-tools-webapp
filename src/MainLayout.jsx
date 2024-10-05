import { useTheme } from "./themeContext";
import { Link, Outlet } from 'react-router-dom';
import { FaGithub, FaHeart, FaHome } from 'react-icons/fa'; // Importing GitHub, Heart, and Home icons
import './shimmerEffect.css'; // Import the CSS file for the sliding effect

// Main layout component for applying theme and other styling
function MainLayout() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div
      className={`flex flex-col min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-green-50 text-gray-900"} transition-colors duration-300`}
    >
      {/* Header Section */}
      <header className={`flex items-center justify-between p-4 sticky top-0 z-10 shadow-md backdrop-filter backdrop-blur-md ${
        isDarkMode ? "bg-gray-800 bg-opacity-70 border-b border-gray-700" : "bg-green-100 bg-opacity-60 border-b border-gray-300 shadow-lg"
      }`}>
        {/* Brand Name with Sliding Color Change Effect */}
        <Link 
          to="/" 
          className={`text-xl sm:text-2xl md:text-3xl font-bold sliding-effect flex-1 text-center`}
        >
          Rajlab Utilities
        </Link>

        {/* Home Icon Link */}
        <Link 
          to="/" 
          className={`p-2 rounded-full transition-colors duration-300 ml-4 ${
            isDarkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          title="Home"
        >
          <FaHome size={24}/>
        </Link>

        {/* Dark Mode Toggle Button with margin for gap */}
        <button
          type="button"
          className={`p-2 rounded-full transition-colors duration-300 ml-4 ${
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
        isDarkMode ? "bg-gray-800 text-gray-400" : "bg-green-150 text-gray-700"
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
            Rajlabs
          </a>
        </p>
      </footer>
    </div>
  );
}

export default MainLayout;
