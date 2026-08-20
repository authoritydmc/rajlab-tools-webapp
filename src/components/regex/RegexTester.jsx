import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaClipboard, FaTrash, FaSearch } from 'react-icons/fa';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import ToolPageLayout from '../common/ToolPageLayout';

const FLAG_OPTIONS = [
  { label: 'g (global)', flag: 'g' },
  { label: 'i (case-insensitive)', flag: 'i' },
  { label: 'm (multiline)', flag: 'm' },
  { label: 's (dotAll)', flag: 's' },
];

const COMMON_PATTERNS = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
  { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-\\s.]?\\d{3}[-\\s.]?\\d{4}' },
  { name: 'URL', pattern: 'https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[\\w\\-.,@?^=%&:/~+#]*' },
  { name: 'IP Address', pattern: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
  { name: 'Hex Color', pattern: '#[0-9A-Fa-f]{6}\\b' },
  { name: 'HTML Tag', pattern: '<([a-z]+)([^<]*)>(.*?)<\\/\\1>' },
  { name: 'Username', pattern: '^[a-zA-Z0-9_]{3,20}$' },
];

export default function RegexTester() {
  const siblings = useCategorySiblings('/regex-tester');
  const { isDarkMode } = useTheme();
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('Hello World! Test email: user@example.com, phone: (555) 123-4567');
  const [flags, setFlags] = useState(['g']);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Regex Tester | Rajlabs';
    return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  useEffect(() => {
    if (!pattern || !testString) { setMatches([]); setError(''); return; }
    try {
      const regex = new RegExp(pattern, flags.join(''));
      const results = [];
      let match;
      if (flags.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          results.push({ value: match[0], index: match.index, groups: match.slice(1) });
          if (match[0] === '') { regex.lastIndex++; }
        }
      } else {
        match = regex.exec(testString);
        if (match) results.push({ value: match[0], index: match.index, groups: match.slice(1) });
      }
      setMatches(results);
      setError('');
    } catch (e) {
      setError(e.message);
      setMatches([]);
    }
  }, [pattern, testString, flags]);

  const toggleFlag = (flag) => {
    setFlags(prev => prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]);
  };

  const highlightMatches = () => {
    if (!pattern || matches.length === 0) return testString;
    try {
      const regex = new RegExp(pattern, flags.join('g'));
      const parts = testString.split(regex);
      const matched = testString.match(regex) || [];
      return parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {matched[i] && <mark className="bg-yellow-400 text-black px-0.5 rounded">{matched[i]}</mark>}
        </React.Fragment>
      ));
    } catch {
      return testString;
    }
  };

  const handleClear = () => { setPattern(''); setTestString(''); setMatches([]); setError(''); };

  return (
    <ToolPageLayout title="Regex Tester" icon={<FaSearch />} breadcrumb={[{label: 'Developer Tools', path: '/regex-tester'}]} siblings={siblings} currentPath="/regex-tester">
    <div className={`transition-colors duration-300`}>
      
      <Toaster />
      <div className={`w-full mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-150 border-gray-300'} border`}>
        {/* Common Patterns */}
        <div className="mb-4">
          <label className="block font-bold mb-2">Common Patterns</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_PATTERNS.map(p => (
              <button key={p.name} onClick={() => setPattern(p.pattern)}
                className={`px-2 py-1 text-xs rounded-md ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>{p.name}</button>
            ))}
          </div>
        </div>
        {/* Pattern */}
        <div className="mb-4">
          <label className="block font-bold mb-2">Pattern</label>
          <div className="flex gap-2">
            <span className={`self-center text-lg font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>/</span>
            <input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              className={`flex-1 p-2 border rounded-md font-mono ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`} />
            <span className={`self-center text-lg font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>/</span>
          </div>
        </div>
        {/* Flags */}
        <div className="mb-4">
          <label className="block font-bold mb-2">Flags</label>
          <div className="flex flex-wrap gap-3">
            {FLAG_OPTIONS.map(f => (
              <label key={f.flag} className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={flags.includes(f.flag)} onChange={() => toggleFlag(f.flag)} className="w-4 h-4" />
                <span className="text-sm">{f.label}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Test String */}
        <div className="mb-4">
          <label className="block font-bold mb-2">Test String</label>
          <textarea value={testString} onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test against..."
            className={`w-full h-32 p-2 border rounded-md resize-none font-mono text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`} />
        </div>
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
        {/* Highlighted matches */}
        {matches.length > 0 && (
          <div className="mb-4">
            <label className="block font-bold mb-2">Highlighted Matches</label>
            <div className={`p-3 rounded border font-mono text-sm whitespace-pre-wrap ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-gray-300'}`}>
              {highlightMatches()}
            </div>
          </div>
        )}
        {/* Match Details */}
        <div className="mb-4">
          <label className="block font-bold mb-2">Matches ({matches.length})</label>
          {matches.length === 0 ? (
            <div className="text-gray-400 text-sm">No matches found</div>
          ) : (
            <div className={`rounded border overflow-auto max-h-[300px] ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-900 border-gray-700'}`}>
              {matches.map((m, i) => (
                <div key={i} className="px-3 py-2 border-b border-gray-700 font-mono text-sm">
                  <span className="text-yellow-400 font-bold">#{i + 1}</span>{' '}
                  <span className="text-green-400">"{m.value}"</span>{' '}
                  <span className="text-gray-400">at index {m.index}</span>
                  {m.groups.length > 0 && (
                    <div className="ml-4 text-blue-300">
                      Groups: {m.groups.map((g, j) => <span key={j}>${j + 1}="{g}" </span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={handleClear} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'}`}><FaTrash className="inline mr-1" />Clear</button>
        </div>
      </div>
    </div>
    </ToolPageLayout>
  );
}
