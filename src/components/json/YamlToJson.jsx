import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaClipboard, FaTrash, FaDownload, FaExchangeAlt } from 'react-icons/fa';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import ToolPageLayout from '../common/ToolPageLayout';
import * as yaml from 'js-yaml';

export default function YamlToJson() {
  const siblings = useCategorySiblings('/yaml-to-json');
  const { isDarkMode } = useTheme();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [pretty, setPretty] = useState(true);

  useEffect(() => {
    document.title = 'YAML to JSON | Rajlabs';
    return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  const convert = () => {
    try {
      const obj = yaml.load(input);
      setOutput(JSON.stringify(obj, null, pretty ? 2 : undefined));
      setError('');
      toast.success('Conversion complete!');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'data.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => { setInput(''); setOutput(''); setError(''); };

  return (
    <ToolPageLayout title="YAML to JSON" icon={<FaExchangeAlt />} siblings={siblings} currentPath="/yaml-to-json" breadcrumb={[{label: 'JSON Utilities', path: '/json-viewer'}]}>
      <Toaster />
      <div className={`w-full mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'} border`}>
        <div className="mb-4">
          <label className="block font-bold mb-2">YAML Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"key: value\nnested:\n  a: 1\n  b: 2"}
            className={`w-full h-40 p-2 border rounded-md resize-none font-mono text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
          />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={pretty} onChange={(e) => setPretty(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm">Pretty print</span>
          </label>
        </div>
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
        <div className="flex gap-2 justify-center mb-4">
          <button onClick={convert} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>Convert to JSON</button>
          <button onClick={handleClear} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'}`}><FaTrash className="inline mr-1" />Clear</button>
        </div>
        {output && (
          <>
            <div className="mb-4">
              <label className="block font-bold mb-2">JSON Output</label>
              <textarea value={output} readOnly className={`w-full h-40 p-2 border rounded-md resize-none font-mono text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`} />
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={handleCopy} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'}`}><FaClipboard className="inline mr-1" />Copy</button>
              <button onClick={handleDownload} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-500 text-white hover:bg-purple-600'}`}><FaDownload className="inline mr-1" />Download JSON</button>
            </div>
          </>
        )}
      </div>
    </ToolPageLayout>
  );
}
