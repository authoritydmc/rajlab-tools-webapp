import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaClipboard, FaTrash, FaExpand, FaCompress, FaSearch, FaArrowUp, FaArrowDown, FaEye } from 'react-icons/fa';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import ToolPageLayout from '../common/ToolPageLayout';

// Helper to check if a value is an object or array
const isObject = (val) => val !== null && typeof val === 'object' && !Array.isArray(val);
const isArray = (val) => Array.isArray(val);
const isExpandable = (val) => isObject(val) || isArray(val);

// Helper to stringify values safely
const stringifyValue = (val) => {
  if (val === null) return 'null';
  if (typeof val === 'string') return `"${val}"`;
  return String(val);
};

// Flatten JSON to easily search and get paths
const flattenJson = (obj, path = 'root', result = []) => {
  if (isExpandable(obj)) {
    const entries = isArray(obj) ? obj.map((v, i) => [i, v]) : Object.entries(obj);
    entries.forEach(([k, v]) => {
      const currentPath = `${path}.${k}`;
      result.push({ path: currentPath, key: String(k), value: v, isParent: isExpandable(v) });
      flattenJson(v, currentPath, result);
    });
  }
  return result;
};

const JsonNode = React.memo(({ 
  keyName, value, depth = 0, path, isLast = true, 
  searchQuery, currentMatch, matches, expandedPaths, togglePath, nodeRefs 
}) => {
  const isExp = isExpandable(value);
  const isArr = isArray(value);
  const expanded = expandedPaths.has(path);
  const bracket = isArr ? ['[', ']'] : ['{', '}'];

  const toggleExpand = () => togglePath(path);

  // Check if this node itself is a match
  const keyMatchIndex = matches.findIndex(m => m.path === path && m.matchType === 'key');
  const valMatchIndex = matches.findIndex(m => m.path === path && m.matchType === 'value');
  
  const isKeyMatch = keyMatchIndex !== -1;
  const isValMatch = valMatchIndex !== -1;
  
  const isCurrentKeyMatch = currentMatch === keyMatchIndex && isKeyMatch;
  const isCurrentValMatch = currentMatch === valMatchIndex && isValMatch;

  const registerRef = (type) => (el) => {
    if (el) {
       const matchIdx = type === 'key' ? keyMatchIndex : valMatchIndex;
       if (matchIdx !== -1) nodeRefs.current[matchIdx] = el;
    }
  };

  const renderValue = (val) => {
    let color = 'text-white';
    if (val === null) color = 'text-gray-400';
    else if (typeof val === 'string') color = 'text-green-400';
    else if (typeof val === 'number') color = 'text-yellow-400';
    else if (typeof val === 'boolean') color = 'text-pink-400';

    const text = val === null ? 'null' : (typeof val === 'string' ? `"${val}"` : String(val));
    
    return (
      <span 
        ref={isValMatch ? registerRef('value') : null}
        className={`${color} ${isCurrentValMatch ? 'bg-yellow-500 text-black px-1 rounded' : isValMatch ? 'bg-yellow-900 px-1 rounded' : ''}`}
      >
        {text}
      </span>
    );
  };

  const entries = isExp ? (isArr ? value.map((v, i) => [i, v]) : Object.entries(value)) : [];

  return (
    <div style={{ paddingLeft: depth === 0 ? 0 : 16 }} className="font-mono text-sm leading-6">
      <div className="flex items-start">
        {isExp ? (
          <button onClick={toggleExpand} className="mr-1 mt-1 text-gray-400 hover:text-white focus:outline-none flex-shrink-0">
            {expanded ? <FaCompress size={10} /> : <FaExpand size={10} />}
          </button>
        ) : (
          <span className="mr-3 inline-block w-2 flex-shrink-0" />
        )}
        
        <div className="break-all">
          {keyName !== undefined && (
            <span 
              ref={isKeyMatch ? registerRef('key') : null}
              className={`text-blue-400 ${isCurrentKeyMatch ? 'bg-yellow-500 text-black px-1 rounded' : isKeyMatch ? 'bg-yellow-900 px-1 rounded' : ''}`}
            >
              "{keyName}"
            </span>
          )}
          {keyName !== undefined && <span className="text-gray-400">: </span>}
          
          {isExp ? (
            <>
              <span className="text-gray-400">{bracket[0]}</span>
              {!expanded && <span className="text-gray-500 italic ml-1 hover:text-gray-300 cursor-pointer" onClick={toggleExpand}>... {isArr ? `${value.length} items` : `${Object.keys(value).length} keys`} {bracket[1]}</span>}
            </>
          ) : (
            renderValue(value)
          )}
          
          {!isExp && !isLast && <span className="text-gray-400">,</span>}
        </div>
      </div>
      
      {isExp && expanded && (
        <div>
          {entries.map(([k, v], i) => (
            <JsonNode 
              key={k} 
              keyName={isArr ? undefined : k} 
              value={v} 
              depth={depth + 1} 
              path={`${path}.${k}`}
              isLast={i === entries.length - 1}
              searchQuery={searchQuery}
              currentMatch={currentMatch}
              matches={matches}
              expandedPaths={expandedPaths}
              togglePath={togglePath}
              nodeRefs={nodeRefs}
            />
          ))}
          <div style={{ paddingLeft: depth === 0 ? 0 : 16 }}>
            <span className="text-gray-400">{bracket[1]}</span>
            {!isLast && <span className="text-gray-400">,</span>}
          </div>
        </div>
      )}
    </div>
  );
});

export default function JsonViewer() {
  const siblings = useCategorySiblings('/json-viewer');
  const { isDarkMode } = useTheme();
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState('');
  
  // Viewer States
  const [expandedPaths, setExpandedPaths] = useState(new Set(['root']));
  const [searchQuery, setSearchQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(-1);
  const nodeRefs = useRef({});

  useEffect(() => {
    document.title = 'Advanced JSON Viewer | Rajlabs';
    return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  useEffect(() => {
    if (!input.trim()) { setParsed(null); setError(''); return; }
    try {
      const parsedData = JSON.parse(input);
      setParsed(parsedData);
      setError('');
      // Auto expand root level
      setExpandedPaths(new Set(['root']));
    } catch (e) {
      setParsed(null);
      setError(e.message);
    }
  }, [input]);

  // Search Logic
  useEffect(() => {
    if (!parsed || !searchQuery.trim()) {
      setMatches([]);
      setCurrentMatch(-1);
      return;
    }

    const flat = flattenJson(parsed);
    const query = searchQuery.toLowerCase();
    const newMatches = [];
    const newExpanded = new Set(expandedPaths);

    flat.forEach(item => {
      let isMatch = false;
      // Match Key
      if (item.key && item.key.toLowerCase().includes(query)) {
        newMatches.push({ path: item.path, matchType: 'key' });
        isMatch = true;
      }
      // Match Value (if not expandable)
      if (!item.isParent && stringifyValue(item.value).toLowerCase().includes(query)) {
        newMatches.push({ path: item.path, matchType: 'value' });
        isMatch = true;
      }

      // If matched, expand all parent paths
      if (isMatch) {
        let parentPath = item.path;
        while (parentPath.includes('.')) {
          parentPath = parentPath.substring(0, parentPath.lastIndexOf('.'));
          newExpanded.add(parentPath);
        }
      }
    });

    setMatches(newMatches);
    setExpandedPaths(newExpanded);
    
    if (newMatches.length > 0) {
      setCurrentMatch(0);
    } else {
      setCurrentMatch(-1);
    }
  }, [searchQuery, parsed]); // Omit expandedPaths intentionally to avoid loop

  // Scroll to current match
  useEffect(() => {
    if (currentMatch >= 0 && nodeRefs.current[currentMatch]) {
      nodeRefs.current[currentMatch].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentMatch]);

  const togglePath = useCallback((path) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const expandAll = () => {
    if (!parsed) return;
    const flat = flattenJson(parsed);
    const allPaths = flat.filter(item => item.isParent).map(item => item.path);
    setExpandedPaths(new Set(['root', ...allPaths]));
  };

  const collapseAll = () => {
    setExpandedPaths(new Set(['root']));
  };

  const nextMatch = () => {
    if (matches.length > 0) {
      setCurrentMatch((prev) => (prev + 1) % matches.length);
    }
  };

  const prevMatch = () => {
    if (matches.length > 0) {
      setCurrentMatch((prev) => (prev - 1 + matches.length) % matches.length);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(parsed, null, 2));
    toast.success('Copied to clipboard!');
  };

  const handleClear = () => { setInput(''); setParsed(null); setError(''); setSearchQuery(''); };

  const formatJson = () => {
    if (parsed) setInput(JSON.stringify(parsed, null, 2));
  };

  const minifyJson = () => {
    if (parsed) setInput(JSON.stringify(parsed));
  };

  return (
    <ToolPageLayout title="JSON Viewer" icon={<FaEye />} siblings={siblings} currentPath="/json-viewer" breadcrumb={[{label: 'JSON Utilities', path: '/json-viewer'}]}>
      <div className={`min-h-screen p-4 lg:p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-green-50 text-gray-900'} transition-colors duration-300`}>
        
        <Toaster />
        <div className={`w-full mx-auto p-4 lg:p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border`}>
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Input */}
            <div className="flex-1 flex flex-col">
              <div className="mb-4 flex-grow flex flex-col">
                <label className="block font-bold mb-2">Paste JSON</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='{"key": "value"}'
                  className={`w-full flex-grow min-h-[200px] lg:min-h-[500px] p-3 border rounded-md resize-none font-mono text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
                />
              </div>
              
              {error && <div className="text-red-500 mb-4 text-sm font-semibold">{error}</div>}
              
              <div className="flex flex-wrap gap-2 justify-center">
                <button onClick={formatJson} className={`p-2 px-4 rounded-md font-medium transition-colors ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>Format</button>
                <button onClick={minifyJson} className={`p-2 px-4 rounded-md font-medium transition-colors ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}>Minify</button>
                <button onClick={handleCopy} disabled={!parsed} className={`p-2 px-4 rounded-md font-medium transition-colors ${isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} disabled:opacity-50`}><FaClipboard className="inline mr-2" />Copy</button>
                <button onClick={handleClear} className={`p-2 px-4 rounded-md font-medium transition-colors ${isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}><FaTrash className="inline mr-2" />Clear</button>
              </div>
            </div>

            {/* Right Column: Viewer */}
            <div className="flex-1 flex flex-col min-w-0">
              {parsed !== null ? (
                <div className={`flex flex-col h-full rounded-md border ${isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-gray-900 border-gray-800'} text-gray-300`}>
                  <div className="flex flex-wrap justify-between items-center p-4 border-b border-gray-700 gap-4">
                    <div className="flex gap-2">
                      <button onClick={expandAll} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-1 transition-colors"><FaExpand /> Expand</button>
                      <button onClick={collapseAll} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-1 transition-colors"><FaCompress /> Collapse</button>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-800 rounded px-2 border border-gray-600 focus-within:border-blue-500">
                      <FaSearch className="text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none text-white focus:ring-0 text-sm py-1.5 w-32 outline-none"
                      />
                      {matches.length > 0 && (
                        <span className="text-xs text-gray-400 font-mono">
                          {currentMatch + 1}/{matches.length}
                        </span>
                      )}
                      <div className="flex gap-1 ml-2 border-l border-gray-600 pl-2">
                        <button onClick={prevMatch} disabled={matches.length === 0} className="p-1 hover:text-white disabled:opacity-50"><FaArrowUp /></button>
                        <button onClick={nextMatch} disabled={matches.length === 0} className="p-1 hover:text-white disabled:opacity-50"><FaArrowDown /></button>
                      </div>
                    </div>
                  </div>

                  {/* Tree View */}
                  <div className="p-4 flex-grow overflow-auto max-h-[500px] lg:max-h-[600px] custom-scrollbar text-[15px]">
                    <JsonNode 
                      value={parsed} 
                      path="root"
                      searchQuery={searchQuery}
                      currentMatch={currentMatch}
                      matches={matches}
                      expandedPaths={expandedPaths}
                      togglePath={togglePath}
                      nodeRefs={nodeRefs}
                    />
                  </div>
                </div>
              ) : (
                <div className={`h-full flex items-center justify-center rounded-md border border-dashed ${isDarkMode ? 'border-gray-600 text-gray-500' : 'border-gray-400 text-gray-400'} min-h-[200px] lg:min-h-[500px]`}>
                  <span>Valid JSON output will appear here</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </ToolPageLayout>
  );
}
