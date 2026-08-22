import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTheme } from './themeContext';
import { TOOL_REGISTRY } from './utils/toolRegistry';
import getIconByName from './utils/getIconsUtil';
import { FaSearch, FaLightbulb, FaArrowRight } from 'react-icons/fa';

function levenshtein(a, b) {
  const al = a.length, bl = b.length;
  const dp = Array.from({ length: al + 1 }, (_, i) => Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) dp[i][0] = i;
  for (let j = 0; j <= bl; j++) dp[0][j] = j;
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[al][bl];
}

function getSuggestions(invalidPath) {
  const clean = (invalidPath || '').toLowerCase().replace(/\/+$/, '') || '/';
  const all = Object.entries(TOOL_REGISTRY).map(([link, info]) => ({
    link,
    title: info.title,
    description: info.description,
    category: info.category,
    iconName: info.iconName,
  }));
  // score by levenshtein + substring bonus
  const scored = all.map(t => {
    const linkLower = t.link.toLowerCase();
    const titleLower = t.title.toLowerCase();
    const distLink = levenshtein(clean, linkLower);
    const distTitle = levenshtein(clean.replace(/^\//,''), titleLower.replace(/\s+/g,'-'));
    let score = Math.min(distLink, distTitle);
    // bonus if substring
    if (linkLower.includes(clean.replace(/^\//,'')) || clean.includes(linkLower.replace(/^\//,''))) score -= 3;
    if (titleLower.includes(clean.replace(/^\//,'').replace(/-/g,' '))) score -= 2;
    return { ...t, score };
  }).sort((a, b) => a.score - b.score);
  // Special: old markdown-preview should strongly suggest playground
  if (clean.includes('markdown-preview') || clean.includes('markdown')) {
    const pg = scored.find(s => s.link === '/markdown-playground');
    if (pg) return [pg, ...scored.filter(s => s.link !== pg.link).slice(0, 2)];
  }
  return scored.slice(0, 3);
}

const ErrorBoundary = () => {
  const [countdown, setCountdown] = useState(15);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const invalidPath = location.pathname + location.search;
  const suggestions = useMemo(() => getSuggestions(location.pathname), [location.pathname]);
  const attempted = invalidPath;

  const errorMessages = [
    "Looks like you've been hit with a Confundus Charm! This page doesn't exist.",
    "Uh oh, it seems like you've taken a wrong turn at Platform 9¾.",
    "This page must have been hidden under an Invisibility Cloak.",
    "Accio Page! Oh wait… this page cannot be summoned.",
    "It seems like the Marauder's Map doesn't show this path.",
    "A Basilisk must have petrified this page. Try again later!",
    "You're trying to access the Room of Requirement, but it's not appearing right now.",
    "Even Dobby couldn't find this page!",
    "This page is as elusive as a Golden Snitch. Try searching again!",
    "The Triwizard Tournament might have hidden this page. Try something else.",
    "It appears that Hogwarts' anti-Muggle defenses have hidden this page from you."
  ];

  const harryPotterGIFs = [
    "https://media1.tenor.com/m/CUNm8n1xS_kAAAAC/what-seriously.gif", 
    "https://media1.tenor.com/m/R7m2W1cD-UkAAAAC/harry-potter-hogwarts.gif",
    "https://media1.tenor.com/m/ImxiGgipE7gAAAAC/harrypotter-i-solemnly-swear.gif"
  ];

  const randomErrorMessage = useMemo(() => errorMessages[Math.floor(Math.random() * errorMessages.length)], []);
  const randomGif = useMemo(() => harryPotterGIFs[Math.floor(Math.random() * harryPotterGIFs.length)], []);

  useEffect(() => {
    if (countdown === 0) navigate('/');
    const interval = setInterval(() => setCountdown((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [countdown, navigate]);

  const handleRedirectNow = () => navigate('/');

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 py-8 text-center overflow-auto ${isDarkMode ? 'bg-[#121212] text-slate-100' : 'bg-[#f5f5f5] text-slate-800'}`}>
      <div className="max-w-3xl w-full flex flex-col items-center gap-5">
        <h1 className={`text-3xl sm:text-4xl font-extrabold ${isDarkMode ? 'text-red-400' : 'text-slate-800'}`}>404 — Page Not Found</h1>
        <p className={`text-base sm:text-lg max-w-xl ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{randomErrorMessage}</p>

        <div className={`px-3 py-2 rounded-xl font-mono text-xs sm:text-sm break-all border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-300' : 'bg-white border-slate-200 text-amber-600 shadow-sm'}`}>
          <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>Attempted:</span> {attempted}
        </div>

        <img src={randomGif} alt="Harry Potter themed gif" className="w-[280px] sm:w-[320px] h-auto rounded-2xl shadow-lg" loading="lazy" />

        {/* Suggestions */}
        <div className={`w-full text-left rounded-2xl border p-4 sm:p-5 ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
              <FaLightbulb size={14} />
            </span>
            <h2 className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Did you mean?</h2>
            <span className={`text-xs ml-auto ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Click to go</span>
          </div>
          <div className="grid gap-2">
            {suggestions.map(s => (
              <Link
                key={s.link}
                to={s.link}
                className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-white hover:shadow-sm'}`}
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-600'}`}>
                  {getIconByName(s.iconName) || <FaSearch />}
                </span>
                <span className="flex-1 min-w-0 text-left">
                  <span className={`block text-sm font-semibold truncate ${isDarkMode ? 'text-slate-100 group-hover:text-white' : 'text-slate-800 group-hover:text-indigo-600'}`}>{s.title}</span>
                  <span className={`block text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{s.link} • {s.category}</span>
                </span>
                <FaArrowRight size={12} className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/" className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>← Back to Home</Link>
            <span className={`text-xs py-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>or use search on homepage</span>
          </div>
        </div>

        <button
          onClick={handleRedirectNow}
          className={`px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-colors ${isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          Redirect to Home Now
        </button>
        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Redirecting to homepage in <strong className={isDarkMode ? 'text-white' : 'text-slate-800'}>{countdown}</strong> seconds...
        </p>
      </div>
    </div>
  );
};

export default ErrorBoundary;
