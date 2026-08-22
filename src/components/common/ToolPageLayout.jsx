import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../themeContext';
import { HiHome, HiArrowLeft, HiChevronRight, HiChevronDown } from 'react-icons/hi2';
import { FaGithub } from 'react-icons/fa';
import getIconByName from '../../utils/getIconsUtil';
import DeveloperEmbedGuide from './DeveloperEmbedGuide';
import { getGitHubUrl, getToolInfo } from '../../utils/toolRegistry';
import { updatePageSEO } from '../../utils/seoUtils';

export default function ToolPageLayout({ 
  title, 
  icon, 
  breadcrumb = [], 
  siblings = [], 
  currentPath, 
  activeParams = {}, 
  showGuide = true, 
  children 
}) {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const isEmbed = searchParams.get('embed') === 'true' || searchParams.get('direct') === '1' || searchParams.get('embed') === '1';
  const rawParam = searchParams.get('raw') || searchParams.get('format');
  const githubUrl = getGitHubUrl(currentPath);
  const toolInfo = getToolInfo(currentPath);

  // Dynamic SEO Injection on Page Mount & Route Change
  useEffect(() => {
    if (title && currentPath) {
      updatePageSEO({
        title,
        description: toolInfo?.description,
        path: currentPath,
        keywords: `${title}, online ${title}, free ${title}, developer tool, rajlabs`
      });
    }
  }, [title, currentPath, toolInfo]);

  const crumbs = [
    { label: 'Home', path: '/' },
    ...breadcrumb,
    { label: title, path: currentPath }
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const categoryCrumbIndex = crumbs.length - 2; // second-to-last is category
  const hasSiblings = siblings.length > 0;

  // Standalone Raw Output Mode (e.g. ?raw=image, ?raw=svg, ?raw=json, ?raw=text)
  if (rawParam) {
    const RawResultView = React.lazy(() => import('../embeds/RawResultView'));
    return (
      <React.Suspense fallback={<div className="p-4 text-xs font-mono text-slate-500">Rendering raw asset...</div>}>
        <RawResultView />
      </React.Suspense>
    );
  }

  // Headless minimal embed mode
  if (isEmbed) {
    return (
      <div className={`w-full min-h-screen p-3 sm:p-5 flex flex-col justify-between ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
      }`}>
        <div className="w-full max-w-4xl mx-auto flex-1">
          {children}
        </div>
        <div className="text-center pt-4 pb-2">
          <a
            href={window.location.origin + (currentPath || '')}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[11px] font-medium transition-colors hover:underline ${
              isDarkMode ? 'text-slate-500 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'
            }`}
          >
            Powered by Rajlabs Utilities &bull; Open Tool
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col flex-1">
      {/* Breadcrumb Bar */}
      <div className={`sticky top-14 sm:top-16 z-40 border-b transition-colors duration-300 ${
        isDarkMode ? 'glass-dark border-white/[0.04]' : 'glass-light border-slate-200/60'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between">
          {/* Left: Back + Breadcrumb */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shrink-0 active:scale-95 ${
                isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-white/5'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HiArrowLeft size={14} />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className={`hidden sm:block h-4 w-px ${isDarkMode ? 'bg-white/10' : 'bg-slate-300'}`} />

            <nav className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm flex-wrap" ref={dropdownRef}>
              {crumbs.map((crumb, i) => {
                const isLast = i === crumbs.length - 1;
                const isCategory = i === categoryCrumbIndex && hasSiblings && !isLast;

                return (
                  <React.Fragment key={i}>
                    {i > 0 && <HiChevronRight size={10} className={`shrink-0 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />}
                    {isLast ? (
                      <span className={`font-semibold truncate max-w-[120px] sm:max-w-none ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {crumb.label}
                      </span>
                    ) : isCategory ? (
                      /* Category with dropdown */
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === i ? null : i)}
                          className={`flex items-center gap-1 shrink-0 transition-colors ${
                            isDarkMode ? 'text-slate-500 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'
                          }`}
                        >
                          <span className="crumb-label">{crumb.label}</span>
                          <HiChevronDown size={10} className={`transition-transform ${openDropdown === i ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown */}
                        {openDropdown === i && (
                          <div className={`absolute top-full left-0 mt-2 w-64 sm:w-72 rounded-xl border shadow-2xl overflow-hidden z-[9999] animate-fade-in-up ${
                            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                          }`}>
                            <div className={`px-3 py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider border-b ${
                              isDarkMode ? 'text-slate-500 bg-slate-900 border-slate-700' : 'text-slate-400 bg-slate-50 border-slate-100'
                            }`}>
                              {crumb.label}
                            </div>
                            <div className="max-h-72 overflow-y-auto py-1">
                              {siblings.map((sib, si) => {
                                const isCurrent = sib.link === currentPath;
                                return (
                                  <Link
                                    key={si}
                                    to={sib.link}
                                    onClick={() => setOpenDropdown(null)}
                                    className={`flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm transition-all ${
                                      isCurrent
                                        ? isDarkMode
                                          ? 'bg-indigo-500/10 text-indigo-400 font-semibold'
                                          : 'bg-indigo-50 text-indigo-600 font-semibold'
                                        : isDarkMode
                                          ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                  >
                                    <span className="text-base shrink-0">{getIconByName(sib.iconName)}</span>
                                    <span className="truncate">{sib.name}</span>
                                    {isCurrent && (
                                      <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${
                                        isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
                                      }`}>
                                        here
                                      </span>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={crumb.path}
                        className={`shrink-0 transition-colors ${
                          isDarkMode ? 'text-slate-500 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'
                        }`}
                      >
                        {i === 0 ? <HiHome size={12} /> : <span className="crumb-label">{crumb.label}</span>}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* Right: GitHub Source Button + Tool title */}
          <div className="flex items-center gap-2.5 shrink-0 ml-2 sm:ml-4">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                isDarkMode 
                  ? 'bg-white/5 border-slate-700 text-slate-300 hover:bg-white/10 hover:text-white' 
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
              title="View source on GitHub"
            >
              <FaGithub size={13} />
              <span className="hidden sm:inline">GitHub</span>
            </a>

            {icon && <span className={`text-base sm:text-lg ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{icon}</span>}
            <h1 className={`text-xs sm:text-sm md:text-base font-bold hidden md:block ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="relative z-10 max-w-[1600px] w-full mx-auto px-3 sm:px-4 lg:px-8 pt-3 pb-8 sm:pt-5 sm:pb-10">
        {/* Mobile title */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4 md:hidden">
          {icon && <span className={`text-lg ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{icon}</span>}
          <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h1>
        </div>
        
        {children}

        {/* Developer Guide & Live Embed Code Generator */}
        {showGuide && (
          <DeveloperEmbedGuide 
            currentPath={currentPath} 
            activeParams={activeParams} 
          />
        )}
      </div>
    </div>
  );
}
