import React, { useState, useEffect } from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { useTheme } from '../../themeContext';
import { FaExclamationTriangle, FaHome, FaArrowLeft, FaCopy, FaSyncAlt } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';

export default function GlobalError() {
  const error = useRouteError();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown === 0) {
      window.location.reload(); // Refresh the page automatically
    }
    const timer = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleCopyError = () => {
    const errorText = `${error?.message || 'Unknown Error'}\n\n${error?.stack || ''}`;
    navigator.clipboard.writeText(errorText);
    toast.success('Error details copied to clipboard!');
  };

  const handleRefreshNow = () => {
    window.location.reload();
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? 'bg-mesh-dark text-slate-100' : 'bg-mesh-light text-slate-900'}`}>
      <Toaster />
      <div className={`max-w-2xl w-full p-8 rounded-2xl border shadow-2xl ${isDarkMode ? 'bg-slate-900/80 border-slate-700/50 backdrop-blur-xl' : 'bg-white/80 border-slate-200/50 backdrop-blur-xl'}`}>
        <div className="flex flex-col items-center text-center gap-6">
          <div className="p-4 bg-red-500/10 rounded-full relative">
            <FaExclamationTriangle className="text-4xl text-red-500" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          </div>
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Oops! Something went wrong.</h1>
            <p className={`text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              The application encountered an unexpected error.
            </p>
          </div>

          <div className={`w-full relative p-4 pt-10 rounded-xl text-left overflow-x-auto border font-mono text-xs sm:text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
            <button 
              onClick={handleCopyError}
              className={`absolute top-2 right-2 p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-sans font-semibold ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-sm'}`}
            >
              <FaCopy /> Copy
            </button>
            <div className="font-bold mb-2">{error?.message || 'Unknown Error'}</div>
            {error?.stack && (
              <pre className="whitespace-pre-wrap opacity-75">{error.stack}</pre>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2 w-full">
            <button 
              onClick={() => navigate(-1)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
            >
              <FaArrowLeft /> Go Back
            </button>
            <button 
              onClick={handleRefreshNow}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
            >
              <FaSyncAlt className={countdown > 0 ? "animate-spin-slow" : ""} /> Refresh
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg shadow-indigo-500/25"
            >
              <FaHome /> Home
            </button>
          </div>

          <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Auto-refreshing in <span className="font-bold text-indigo-500">{countdown}</span> seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
