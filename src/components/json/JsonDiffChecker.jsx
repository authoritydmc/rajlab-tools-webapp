import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaClipboard, FaTrash, FaBalanceScale } from 'react-icons/fa';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import ToolPageLayout from '../common/ToolPageLayout';

function diffObjects(obj1, obj2, path = '') {
  const changes = [];
  const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
  for (const key of allKeys) {
    const fullPath = path ? `${path}.${key}` : key;
    const val1 = obj1?.[key];
    const val2 = obj2?.[key];
    const keyExists1 = obj1 && key in obj1;
    const keyExists2 = obj2 && key in obj2;

    if (!keyExists1) {
      changes.push({ type: 'added', path: fullPath, value: val2 });
    } else if (!keyExists2) {
      changes.push({ type: 'removed', path: fullPath, value: val1 });
    } else if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null && !Array.isArray(val1) && !Array.isArray(val2)) {
      changes.push(...diffObjects(val1, val2, fullPath));
    } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
      changes.push({ type: 'changed', path: fullPath, oldValue: val1, newValue: val2 });
    }
  }
  return changes;
}

export default function JsonDiffChecker() {
  const siblings = useCategorySiblings('/json-diff-checker');
  const { isDarkMode } = useTheme();
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [diffs, setDiffs] = useState(null);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({ added: 0, removed: 0, changed: 0 });

  useEffect(() => {
    document.title = 'JSON Diff Checker | Rajlabs';
    return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  const compare = () => {
    try {
      const obj1 = JSON.parse(input1);
      const obj2 = JSON.parse(input2);
      const result = diffObjects(obj1, obj2);
      setDiffs(result);
      setSummary({
        added: result.filter(d => d.type === 'added').length,
        removed: result.filter(d => d.type === 'removed').length,
        changed: result.filter(d => d.type === 'changed').length,
      });
      setError('');
      toast.success(`Found ${result.length} difference(s)`);
    } catch (e) {
      setError(e.message);
      setDiffs(null);
    }
  };

  const handleClear = () => { setInput1(''); setInput2(''); setDiffs(null); setError(''); };

  return (
    <ToolPageLayout title="JSON Diff Checker" icon={<FaBalanceScale />} siblings={siblings} currentPath="/json-diff-checker" breadcrumb={[{label: 'JSON Utilities', path: '/json-viewer'}]}>
      <Toaster />
      <div className={`w-full mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'} border`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-bold mb-2">JSON A (Original)</label>
            <textarea
              value={input1}
              onChange={(e) => setInput1(e.target.value)}
              placeholder='{"key": "value"}'
              className={`w-full h-48 p-2 border rounded-md resize-none font-mono text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
            />
          </div>
          <div>
            <label className="block font-bold mb-2">JSON B (Modified)</label>
            <textarea
              value={input2}
              onChange={(e) => setInput2(e.target.value)}
              placeholder='{"key": "new value"}'
              className={`w-full h-48 p-2 border rounded-md resize-none font-mono text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
            />
          </div>
        </div>
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
        <div className="flex gap-2 justify-center mb-4">
          <button onClick={compare} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>Compare</button>
          <button onClick={handleClear} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'}`}><FaTrash className="inline mr-1" />Clear</button>
        </div>
        {diffs && (
          <div className="mt-4">
            <div className="flex gap-4 mb-4 justify-center">
              <span className="text-green-400 font-semibold">+{summary.added} Added</span>
              <span className="text-red-400 font-semibold">-{summary.removed} Removed</span>
              <span className="text-yellow-400 font-semibold">~{summary.changed} Changed</span>
            </div>
            {diffs.length === 0 ? (
              <div className="text-center text-green-400 font-semibold text-lg">JSON objects are identical!</div>
            ) : (
              <div className={`rounded border overflow-auto max-h-[400px] ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-900 border-gray-700'}`}>
                {diffs.map((d, i) => (
                  <div key={i} className={`px-4 py-2 border-b border-gray-700 font-mono text-sm ${
                    d.type === 'added' ? 'bg-green-900/30 text-green-300' :
                    d.type === 'removed' ? 'bg-red-900/30 text-red-300' :
                    'bg-yellow-900/30 text-yellow-300'
                  }`}>
                    <span className="font-bold">{d.type === 'added' ? '+' : d.type === 'removed' ? '-' : '~'}</span>{' '}
                    <span className="text-blue-300">{d.path}</span>
                    {d.type === 'added' && <span>: {JSON.stringify(d.value)}</span>}
                    {d.type === 'removed' && <span>: {JSON.stringify(d.value)}</span>}
                    {d.type === 'changed' && (
                      <span>: {JSON.stringify(d.oldValue)} → {JSON.stringify(d.newValue)}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
