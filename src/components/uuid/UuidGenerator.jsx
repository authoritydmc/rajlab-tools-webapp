import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaClipboard, FaTrash, FaSync, FaRandom } from 'react-icons/fa';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

function generateUUID() {
  return crypto.randomUUID();
}

export default function UuidGenerator() {
  const { isDarkMode } = useTheme();
  const [uuids, setUuids] = useState([]);
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [noDashes, setNoDashes] = useState(false);
  const siblings = useCategorySiblings('/uuid-generator');

  useEffect(() => {
    document.title = 'UUID Generator | Rajlabs';
  return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  const generate = () => {
    const newUuids = Array.from({ length: count }, () => {
      let uuid = generateUUID();
      if (uppercase) uuid = uuid.toUpperCase();
      if (noDashes) uuid = uuid.replace(/-/g, '');
      return uuid;
    });
    setUuids(newUuids);
    toast.success(`Generated ${count} UUID(s)!`);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    toast.success('All UUIDs copied!');
  };

  const copyOne = (uuid) => {
    navigator.clipboard.writeText(uuid);
    toast.success('Copied!');
  };

  const handleClear = () => { setUuids([]); };

  useEffect(() => { generate(); }, []);

  return (
    <ToolPageLayout title="UUID Generator" icon={<FaRandom />} breadcrumb={[{label: 'Developer Tools', path: '/regex-tester'}]} siblings={siblings} currentPath="/uuid-generator">
      <div className="w-full">
<Toaster />
      <div className={`w-full mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-150 border-gray-300'} border`}>
        <div className="flex flex-wrap gap-4 mb-4 items-end">
          <div>
            <label className="block font-bold mb-2">Count</label>
            <input type="number" min="1" max="100" value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, +e.target.value)))}
              className={`w-20 p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm">Uppercase</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={noDashes} onChange={(e) => setNoDashes(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm">No dashes</span>
          </label>
          <button onClick={generate} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}><FaSync className="inline mr-1" />Generate</button>
          <button onClick={copyAll} disabled={uuids.length === 0} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'} ${uuids.length === 0 ? 'opacity-50' : ''}`}><FaClipboard className="inline mr-1" />Copy All</button>
          <button onClick={handleClear} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'}`}><FaTrash className="inline mr-1" />Clear</button>
        </div>
        {uuids.length > 0 && (
          <div className={`rounded border overflow-auto max-h-[400px] ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-900 border-gray-700'}`}>
            {uuids.map((uuid, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2 border-b border-gray-700 font-mono text-sm group">
                <span className="text-green-400">{uuid}</span>
                <button onClick={() => copyOne(uuid)} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-blue-300">
                  <FaClipboard size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </ToolPageLayout>

  );
}
