import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTheme } from '../../themeContext';
import iconMap from '../../utils/iconMap';
import { FaArrowRight } from 'react-icons/fa';

export default function RelatedTools() {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const [relatedTools, setRelatedTools] = useState([]);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    // Only show on tool pages, not home or changelog
    if (location.pathname === '/' || location.pathname === '/changelog') {
      setRelatedTools([]);
      return;
    }

    fetch('/toolCategories.json')
      .then((res) => res.json())
      .then((categories) => {
        let currentCategory = null;
        let currentToolIndex = -1;

        // Find the category of the current tool
        for (const cat of categories) {
          const index = cat.tools.findIndex((t) => t.link === location.pathname);
          if (index !== -1) {
            currentCategory = cat;
            currentToolIndex = index;
            break;
          }
        }

        if (currentCategory) {
          setCategoryName(currentCategory.title);
          // Get other tools in this category
          let others = currentCategory.tools.filter((_, idx) => idx !== currentToolIndex && _.isEnabled);
          
          // If fewer than 3, maybe pull from another random category to fill space
          if (others.length < 3) {
             const otherCat = categories.find(c => c.title !== currentCategory.title && c.tools.length > 0);
             if (otherCat) {
               others = [...others, ...otherCat.tools.filter(t => t.isEnabled).slice(0, 3 - others.length)];
             }
          }
          
          // Shuffle or limit to max 4
          setRelatedTools(others.slice(0, 4));
        } else {
          setRelatedTools([]);
        }
      })
      .catch((err) => console.error("Failed to load related tools", err));
  }, [location.pathname]);

  if (relatedTools.length === 0) return null;

  return (
    <div className={`mt-12 py-8 border-t ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'}`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            Related Tools ({categoryName})
          </h2>
          <Link to="/" className={`text-sm flex items-center gap-1 hover:underline ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            View All <FaArrowRight size={12} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedTools.map((tool, idx) => {
            const Icon = iconMap[tool.iconName] || (() => null);
            return (
              <Link
                key={idx}
                to={tool.link}
                className={`flex flex-col p-4 rounded-xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-indigo-500/50 shadow-slate-900/20 text-white' : 'bg-white border-slate-200 hover:border-indigo-500/50 shadow-slate-200/50 text-slate-900'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-1">{tool.name}</h3>
                </div>
                <p className={`text-xs mt-1 line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {tool.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
