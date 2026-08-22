import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaClipboard, FaTrash, FaFingerprint } from 'react-icons/fa';
import CryptoJS from 'crypto-js';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

async function hashMessage(message, algorithm) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const ALGORITHMS = [
  { name: 'MD5', alg: 'MD5', custom: true },
  { name: 'SHA-1', alg: 'SHA-1' },
  { name: 'SHA-256', alg: 'SHA-256' },
  { name: 'SHA-384', alg: 'SHA-384' },
  { name: 'SHA-512', alg: 'SHA-512' },
];

export default function HashGenerator() {
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({});
  const [isComputing, setIsComputing] = useState(false);
  const siblings = useCategorySiblings('/hash-generator');

  useEffect(() => {
    document.title = 'Hash Generator | Rajlabs';
    return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  // Load from query parameters
  useEffect(() => {
    const qText = searchParams.get('text') || searchParams.get('input') || searchParams.get('q');
    if (qText !== null && qText !== undefined) {
      setInput(qText);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!input) { setHashes({}); return; }
    const compute = async () => {
      setIsComputing(true);
      const results = {};
      for (const algo of ALGORITHMS) {
        try {
          if (algo.name === 'MD5') {
            results[algo.name] = CryptoJS.MD5(input).toString();
          } else {
            results[algo.name] = await hashMessage(input, algo.alg);
          }
        } catch {
          results[algo.name] = 'Error computing hash';
        }
      }
      setHashes(results);
      setIsComputing(false);
    };
    compute();
  }, [input]);

  const copyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    toast.success('Copied!');
  };

  return (
    <ToolPageLayout 
      title="Hash Generator" 
      icon={<FaFingerprint />} 
      breadcrumb={[{ label: 'Encryption & Encoding Utilities', path: '/base64-encoder-decoder' }]} 
      siblings={siblings} 
      currentPath="/hash-generator"
      activeParams={{ text: input }}
    >
      <div className="w-full">
        <Toaster />
        <div className={`w-full mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'} border`}>
          <div className="mb-4">
            <label className="block font-bold mb-2">Input Text</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to hash..."
              className={`w-full h-32 p-2 border rounded-md resize-none font-mono text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
            />
          </div>
          <div className="mb-4 flex gap-2">
            <button onClick={() => setInput('')} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'}`}><FaTrash className="inline mr-1" />Clear</button>
          </div>
          {isComputing && <div className="text-center text-blue-400">Computing hashes...</div>}
          {Object.keys(hashes).length > 0 && (
            <div className={`rounded border overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-900 border-gray-700'}`}>
              {Object.entries(hashes).map(([name, hash]) => (
                <div key={name} className="flex items-start justify-between px-4 py-3 border-b border-gray-700 group">
                  <div className="min-w-0 flex-1">
                    <span className="text-blue-300 font-semibold text-sm">{name}</span>
                    <div className="text-green-400 font-mono text-xs break-all">{hash}</div>
                  </div>
                  <button onClick={() => copyHash(hash)} className="ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-blue-300">
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
