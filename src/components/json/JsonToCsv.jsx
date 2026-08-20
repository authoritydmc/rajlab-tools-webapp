import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaClipboard, FaTrash, FaDownload, FaFileCsv } from 'react-icons/fa';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import ToolPageLayout from '../common/ToolPageLayout';
import Papa from 'papaparse';

export default function JsonToCsv() {
  const siblings = useCategorySiblings('/json-to-csv');
  const { isDarkMode } = useTheme();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'JSON to CSV | Rajlabs';
    return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  const convert = () => {
    try {
      let data = JSON.parse(input);
      if (!Array.isArray(data)) data = [data];
      const csv = Papa.unparse(data);
      setOutput(csv);
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
    const blob = new Blob([output], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'data.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  const handleClear = () => { setInput(''); setOutput(''); setError(''); };

  return (
    <ToolPageLayout title="JSON to CSV" icon={<FaFileCsv />} siblings={siblings} currentPath="/json-to-csv" breadcrumb={[{label: 'JSON Utilities', path: '/json-viewer'}]}>
      <Toaster />
      <div className={`w-full mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-150 border-gray-300'} border`}>
        <div className="mb-4">
          <label className="block font-bold mb-2">JSON Input (array of objects)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]'
            className={`w-full h-40 p-2 border rounded-md resize-none font-mono text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
          />
        </div>
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
        <div className="flex gap-2 justify-center mb-4">
          <button onClick={convert} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>Convert to CSV</button>
          <button onClick={handleClear} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'}`}><FaTrash className="inline mr-1" />Clear</button>
        </div>
        {output && (
          <>
            <div className="mb-4">
              <label className="block font-bold mb-2">CSV Output</label>
              <textarea
                value={output}
                readOnly
                className={`w-full h-40 p-2 border rounded-md resize-none font-mono text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
              />
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={handleCopy} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'}`}><FaClipboard className="inline mr-1" />Copy</button>
              <button onClick={handleDownload} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-500 text-white hover:bg-purple-600'}`}><FaDownload className="inline mr-1" />Download CSV</button>
            </div>
          </>
        )}
      </div>
    </ToolPageLayout>
  );
}
