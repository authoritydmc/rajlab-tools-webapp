import { useTheme } from "./themeContext";
import { Link, Outlet } from 'react-router-dom';
import { FaGithub, FaHeart } from 'react-icons/fa';
import { HiHome, HiSun, HiMoon } from 'react-icons/hi2';
import SoundToggle from './components/common/SoundToggle';

function MainLayout() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-mesh-dark bg-noise text-slate-100' : 'bg-mesh-light bg-noise text-slate-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isDarkMode ? 'glass-dark' : 'glass-light'}`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="https://rajlabs.in" className="flex items-center gap-2.5 shrink-0 group">
              <img
                src={!isDarkMode ? "/logo_raj_dark.png" : "/logo_raj_light.png"}
                alt="Logo"
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Title */}
            <Link to="/" className="flex-1 flex items-center justify-center gap-2 mx-3 sm:mx-4">
              <span className="text-lg sm:text-xl md:text-2xl font-extrabold headerFont sliding-effect">
                Rajlabs Utilities
              </span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/"
                className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 active:scale-95 ${
                  isDarkMode
                    ? 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
                title="Home"
              >
                <HiHome size={20} />
              </Link>
              <button
                type="button"
                className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 active:scale-95 ${
                  isDarkMode
                    ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
                onClick={toggleDarkMode}
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <HiSun size={20} /> : <HiMoon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      {/* Sound Toggle */}
      <SoundToggle />

      {/* Footer */}
      <footer className={`relative z-10 border-t transition-colors duration-300 ${isDarkMode ? 'border-white/5' : 'border-slate-200/60'}`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col items-center gap-2.5">
            <p className="text-sm sm:text-base flex flex-wrap items-center justify-center gap-1.5">
              Made with <FaHeart className="text-red-500 animate-pulse" size={14} /> by{" "}
              <a
                href="https://github.com/authoritydmc"
                target="_blank"
                rel="noopener noreferrer"
                className={`font-semibold transition-colors ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
              >
                <FaGithub className="inline mr-1" />authoritydmc
              </a>
              at{" "}
              <a
                href="https://rajlabs.in"
                target="_blank"
                rel="noopener noreferrer"
                className={`font-semibold transition-colors ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
              >
                Rajlabs
              </a>
            </p>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Developer tools & utilities - all client-side, no data sent to servers.
              {' '}&bull;{' '}
              <Link to="/changelog" className="hover:underline transition-colors">
                v2.1.0 Changelog
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
