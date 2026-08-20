import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import getIconByName from '../utils/getIconsUtil';
import { useTheme } from '../themeContext';
import { useFavorites } from '../favoritesContext';
import { playHoverSound, playClickSound, playFavSound } from '../utils/sounds';
import { useDirectionSound } from '../hooks/useDirectionSound';
import HoverPreview from './common/HoverPreview';
import { HiMiniMagnifyingGlass, HiStar } from 'react-icons/hi2';
import { FaStar } from 'react-icons/fa';

const CATEGORY_STYLE = {
  'Text Utilities': {
    dark: 'bg-indigo-500/[0.04] border-indigo-500/[0.08]',
    light: 'bg-indigo-50/80 border-indigo-200/50',
    accent: 'bg-indigo-500/10 text-indigo-500',
    iconDark: 'bg-indigo-500/15 text-indigo-400',
    iconLight: 'bg-indigo-100 text-indigo-600',
  },
  'Calculators': {
    dark: 'bg-emerald-500/[0.04] border-emerald-500/[0.08]',
    light: 'bg-emerald-50/80 border-emerald-200/50',
    accent: 'bg-emerald-500/10 text-emerald-500',
    iconDark: 'bg-emerald-500/15 text-emerald-400',
    iconLight: 'bg-emerald-100 text-emerald-600',
  },
  'Encryption & Encoding Utilities': {
    dark: 'bg-amber-500/[0.04] border-amber-500/[0.08]',
    light: 'bg-amber-50/80 border-amber-200/50',
    accent: 'bg-amber-500/10 text-amber-500',
    iconDark: 'bg-amber-500/15 text-amber-400',
    iconLight: 'bg-amber-100 text-amber-600',
  },
  'QR Codes': {
    dark: 'bg-cyan-500/[0.04] border-cyan-500/[0.08]',
    light: 'bg-cyan-50/80 border-cyan-200/50',
    accent: 'bg-cyan-500/10 text-cyan-500',
    iconDark: 'bg-cyan-500/15 text-cyan-400',
    iconLight: 'bg-cyan-100 text-cyan-600',
  },
  'JSON Utilities': {
    dark: 'bg-violet-500/[0.04] border-violet-500/[0.08]',
    light: 'bg-violet-50/80 border-violet-200/50',
    accent: 'bg-violet-500/10 text-violet-500',
    iconDark: 'bg-violet-500/15 text-violet-400',
    iconLight: 'bg-violet-100 text-violet-600',
  },
  'Developer Tools': {
    dark: 'bg-rose-500/[0.04] border-rose-500/[0.08]',
    light: 'bg-rose-50/80 border-rose-200/50',
    accent: 'bg-rose-500/10 text-rose-500',
    iconDark: 'bg-rose-500/15 text-rose-400',
    iconLight: 'bg-rose-100 text-rose-600',
  },
  'Design Utilities': {
    dark: 'bg-fuchsia-500/[0.04] border-fuchsia-500/[0.08]',
    light: 'bg-fuchsia-50/80 border-fuchsia-200/50',
    accent: 'bg-fuchsia-500/10 text-fuchsia-500',
    iconDark: 'bg-fuchsia-500/15 text-fuchsia-400',
    iconLight: 'bg-fuchsia-100 text-fuchsia-600',
  },
  'Multimedia Utilities': {
    dark: 'bg-orange-500/[0.04] border-orange-500/[0.08]',
    light: 'bg-orange-50/80 border-orange-200/50',
    accent: 'bg-orange-500/10 text-orange-500',
    iconDark: 'bg-orange-500/15 text-orange-400',
    iconLight: 'bg-orange-100 text-orange-600',
  },
  'PDF Tools': {
    dark: 'bg-red-500/[0.04] border-red-500/[0.08]',
    light: 'bg-red-50/80 border-red-200/50',
    accent: 'bg-red-500/10 text-red-500',
    iconDark: 'bg-red-500/15 text-red-400',
    iconLight: 'bg-red-100 text-red-600',
  },
  'Excel Tools': {
    dark: 'bg-teal-500/[0.04] border-teal-500/[0.08]',
    light: 'bg-teal-50/80 border-teal-200/50',
    accent: 'bg-teal-500/10 text-teal-500',
    iconDark: 'bg-teal-500/15 text-teal-400',
    iconLight: 'bg-teal-100 text-teal-600',
  },
};

function getBentoSpan(count) {
  if (count >= 5) return 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-1';
  if (count >= 3) return 'col-span-1 lg:col-span-1 row-span-1';
  return 'col-span-1 row-span-1';
}

export default function MainToolListPage() {
  const [toolCategories, setToolCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { isDarkMode } = useTheme();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    fetch('/toolCategories.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setToolCategories)
      .catch(console.error);
  }, []);

  const filteredCategories = useMemo(() => toolCategories
    .map(c => ({
      ...c,
      tools: c.tools.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }))
    .filter(c => c.tools.length > 0),
    [toolCategories, searchQuery]
  );

  const allTools = useMemo(() => {
    const m = {};
    toolCategories.forEach(c => c.tools.forEach(t => { m[t.link] = t; }));
    return m;
  }, [toolCategories]);

  const favoriteTools = useMemo(() =>
    favorites.map(l => allTools[l]).filter(Boolean),
    [favorites, allTools]
  );

  const handleFav = useCallback((e, link) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(link);
    playFavSound();
  }, [toggleFavorite]);

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Hero */}
      <div className={`relative overflow-hidden ${isDarkMode ? 'hero-mesh-dark' : 'hero-mesh-light'}`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 sm:pt-20 sm:pb-14 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-3 animate-fade-in-up">
            <span className="gradient-text">Rajlabs</span>{' '}
            <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>Utilities</span>
          </h1>
          <p className={`text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 animate-fade-in-up ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} style={{ animationDelay: '100ms' }}>
            Developer tools & utilities — all client-side, no data sent to servers.
          </p>
          <div className="max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto relative animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <HiMiniMagnifyingGlass className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 sm:py-3.5 rounded-2xl border text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                isDarkMode
                  ? 'bg-white/[0.06] border-white/[0.08] text-white placeholder-slate-500 hover:bg-white/[0.09]'
                  : 'bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 hover:bg-white shadow-lg shadow-slate-200/50'
              }`}
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* ── Favorites ── */}
        {favoriteTools.length > 0 && !searchQuery && (
          <div className="mb-6 sm:mb-8 animate-fade-in-up">
            <div className="flex items-center gap-2.5 mb-4 px-1">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
                <HiStar size={18} />
              </div>
              <h2 className={`text-base sm:text-lg lg:text-xl font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                Favorites
              </h2>
              <span className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-white/[0.06] text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                {favoriteTools.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3">
              {favoriteTools.map(tool => (
                <ToolCard key={tool.link} tool={tool} isDarkMode={isDarkMode} isFav={true} onFav={handleFav} favAccent />
              ))}
            </div>
          </div>
        )}

        {/*  Bento Grid of Categories  */}
        <div className="bento-grid">
          {filteredCategories.map((category, catIdx) => {
            const style = CATEGORY_STYLE[category.title] || CATEGORY_STYLE['Text Utilities'];
            const span = getBentoSpan(category.tools.length);
            return (
              <div
                key={catIdx}
                className={`bento-cell animate-fade-in-up ${span}`}
                style={{ animationDelay: `${catIdx * 40}ms` }}
              >
                <CategoryCard
                  category={category}
                  style={style}
                  isDarkMode={isDarkMode}
                  isFavorite={isFavorite}
                  onFav={handleFav}
                />
              </div>
            );
          })}
        </div>

        {filteredCategories.length === 0 && searchQuery && (
          <div className="text-center py-20">
            <p className={`text-lg ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              No tools found for "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

/*  Category Bento Card  */
function CategoryCard({ category, style, isDarkMode, isFavorite, onFav }) {
  return (
    <div className={`h-full rounded-3xl border overflow-hidden transition-all duration-300 shadow-sm hover:shadow-lg ${
      isDarkMode ? style.dark + ' border-slate-700/50' : style.light + ' border-slate-200'
    }`}>
      {/* Header */}
      <div className={`flex items-center gap-3 px-5 py-4 border-b ${
        isDarkMode ? 'border-white/[0.05] bg-slate-900/40' : 'border-slate-200/60 bg-white/50'
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
          isDarkMode ? style.iconDark : style.iconLight
        }`}>
          {getIconByName(category.iconName)}
        </div>
        <h2 className={`flex-1 text-base sm:text-lg font-bold tracking-tight truncate ${
          isDarkMode ? 'text-slate-100' : 'text-slate-800'
        }`}>
          {category.title}
        </h2>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
          isDarkMode ? style.accent : style.accent
        }`}>
          {category.tools.length} Tools
        </span>
      </div>

      {/* Grid of Tools inside Category */}
      <div className={`p-3 grid gap-3 ${category.tools.length >= 5 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        {category.tools.map((tool) => (
          <ToolCard
            key={tool.link}
            tool={tool}
            isDarkMode={isDarkMode}
            isFav={isFavorite(tool.link)}
            onFav={onFav}
            style={style}
          />
        ))}
      </div>
    </div>
  );
}

/*  Individual Tool Card (Modern Horizontal Bento)  */
function ToolCard({ tool, isDarkMode, isFav, onFav, style, favAccent }) {
  const dirSound = useDirectionSound();

  if (!tool.isEnabled) return null;

  return (
    <HoverPreview tool={tool} enabled={tool.description}>
      <Link
        to={tool.link}
        className={`group relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl transition-all duration-300 no-underline border shadow-sm hover:shadow-md ${
          isDarkMode
            ? 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'
            : 'bg-white border-slate-200/60 hover:bg-slate-50 hover:border-slate-300'
        }`}
        onMouseEnter={(e) => {
          dirSound.onMouseEnter(e);
          playHoverSound();
        }}
        onMouseMove={dirSound.onMouseMove}
        onClick={() => playClickSound()}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.15] group-hover:rotate-3 ${
          favAccent
            ? isDarkMode ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-600'
            : isDarkMode ? style?.iconDark || 'bg-white/[0.05] text-slate-400 group-hover:bg-white/[0.1]' : style?.iconLight || 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
        }`}>
          {getIconByName(tool.iconName)}
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className={`text-base sm:text-lg font-bold leading-tight truncate tracking-tight transition-colors ${isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>
            {tool.name}
          </div>
          {tool.description && (
            <div className={`text-xs sm:text-sm mt-1 leading-snug line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {tool.description}
            </div>
          )}
        </div>

        <button
          onClick={(e) => onFav(e, tool.link)}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${
            isFav
              ? 'text-amber-400 opacity-100'
              : isDarkMode
                ? 'text-slate-600 hover:text-amber-400 hover:bg-slate-800 opacity-0 group-hover:opacity-100'
                : 'text-slate-300 hover:text-amber-400 hover:bg-slate-100 opacity-0 group-hover:opacity-100'
          }`}
          title={isFav ? 'Unfavorite' : 'Favorite'}
        >
          <FaStar size={14} className={isFav ? 'fill-current' : ''} />
        </button>
      </Link>
    </HoverPreview>
  );
}
