import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import { useTheme } from '../themeContext'; // Assuming ThemeContext is at src/
import { FaPlusCircle, FaWrench, FaTachometerAlt, FaFlask, FaDocker, FaServer, FaTag, FaCalendarAlt } from 'react-icons/fa';
import { CgFileDocument } from "react-icons/cg";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdHistory } from "react-icons/md";

const SECTION_META = {
  added: { label: 'Added', icon: FaPlusCircle, badge: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800', dot: 'bg-green-500' },
  fixed: { label: 'Fixed', icon: FaWrench, badge: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800', dot: 'bg-red-500' },
  changed: { label: 'Changed', icon: FaWrench, badge: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800', dot: 'bg-yellow-500' },
  performance: { label: 'Performance', icon: FaTachometerAlt, badge: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800', dot: 'bg-orange-500' },
  tests: { label: 'Tests', icon: FaFlask, badge: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800', dot: 'bg-blue-500' },
};

function parseChangelog(markdown) {
  const entries = [];
  const versionRegex = /^## \[([^\]]+)\](?: - (.+))?$/m;
  const sectionsMap = { added: [], fixed: [], changed: [], performance: [], tests: [] };

  let lastVersion = null;
  let lastSection = null;
  let lastDate = '';

  const lines = markdown.split('\n');

  for (const line of lines) {
    const versionMatch = line.match(versionRegex);
    if (versionMatch) {
      if (lastVersion && lastSection && sectionsMap[lastSection].length > 0) {
        entries.push({ version: lastVersion, date: lastDate, sections: { ...sectionsMap } });
      }
      lastVersion = versionMatch[1];
      lastDate = versionMatch[2] || '';
      lastSection = null;
      Object.keys(sectionsMap).forEach(k => (sectionsMap[k] = []));
      continue;
    }

    const sectionMatch = line.match(/^### (.+)$/);
    if (sectionMatch) {
      const sectionName = sectionMatch[1].toLowerCase();
      if (sectionsMap[sectionName] !== undefined) {
        lastSection = sectionName;
      }
      continue;
    }

    if (lastSection && sectionsMap[lastSection] && line.trim()) {
      // Remove '- ' at the beginning if present for cleaner rendering
      sectionsMap[lastSection].push(line.trim().replace(/^- /, ''));
    }
  }

  if (lastVersion && lastSection && sectionsMap[lastSection].length > 0) {
    entries.push({ version: lastVersion, date: lastDate, sections: { ...sectionsMap } });
  }

  return entries;
}

function formatDate(date) {
  try {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return date;
  }
}

function SectionTags({ sections }) {
  const ObjectKeys = Object.keys(sections);
  const tags = ObjectKeys.filter(k => sections[k].length > 0);

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map(key => {
        const meta = SECTION_META[key];
        const Icon = meta.icon;
        return (
          <span
            key={key}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${meta.badge}`}
          >
            <Icon size={12} />
            {meta.label}
            <span className="opacity-70 font-mono ml-1">{sections[key].length}</span>
          </span>
        );
      })}
    </div>
  );
}

export default function Changelog() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetch('/CHANGELOG.md')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch changelog");
        return res.text();
      })
      .then(data => {
        setEntries(parseChangelog(data || ''));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load changelog:', err);
        setEntries([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className={`min-h-screen p-4 sm:p-8 font-sans transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <main className="w-full w-full mx-auto my-8 flex-1">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${isDarkMode ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'bg-blue-100 text-blue-600 border border-blue-200'}`}>
              <CgFileDocument size={28} />
            </div>
            <div>
              
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Recent improvements, fixes, and feature additions.</p>
            </div>
          </div>
          <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}>
            <MdHistory size={18} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} /> 
            {entries.length} releases
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <AiOutlineLoading3Quarters className="animate-spin text-blue-500" size={40} />
            <p className={`text-sm font-medium animate-pulse ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading changelog...</p>
          </div>
        ) : entries.length === 0 ? (
          <p className={`py-20 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No changelog entries found.</p>
        ) : (
          <div className="space-y-8">
            {entries.map((entry, entryIndex) => (
              <section
                key={entryIndex}
                className={`rounded-3xl border overflow-hidden shadow-sm ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 backdrop-blur-xl border-gray-200'}`}
              >
                <div className={`px-6 py-5 border-b ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${isDarkMode ? 'bg-blue-900/20 border-blue-800/50 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-500'}`}>
                        <FaTag size={20} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-2xl font-black">{entry.version}</span>
                          {entry.date && (
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <FaCalendarAlt size={12} />
                              {formatDate(entry.date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <SectionTags sections={entry.sections} />
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 gap-8">
                    {Object.keys(entry.sections)
                      .filter(k => entry.sections[k].length > 0)
                      .map(sectionKey => {
                        const meta = SECTION_META[sectionKey];
                        const Icon = meta.icon;
                        return (
                          <div key={sectionKey}>
                            <div className="flex items-center gap-3 mb-4">
                              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${meta.badge}`}>
                                <Icon size={12} />
                                {meta.label}
                              </span>
                              <span className={`h-px flex-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                            </div>
                            <ul className="space-y-4">
                              {entry.sections[sectionKey].map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-start gap-3 text-sm leading-relaxed">
                                  <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${meta.dot}`} />
                                  <div 
                                    className={`min-w-0 prose prose-sm max-w-none ${isDarkMode ? 'prose-invert text-gray-300' : 'text-gray-600'} prose-p:my-0 prose-a:text-blue-500`}
                                    dangerouslySetInnerHTML={{ __html: marked(item) }}
                                  />
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
