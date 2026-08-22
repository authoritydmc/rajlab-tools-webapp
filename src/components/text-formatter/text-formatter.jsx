import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaClipboard, FaTrash } from 'react-icons/fa';
import { CgFormatText } from 'react-icons/cg';
import { PiSelectionAllFill } from 'react-icons/pi';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

export default function TextFormatter() {
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const siblings = useCategorySiblings('/format-text');

  useEffect(() => {
    document.title = 'Text Formatter | Rajlabs';
    return () => {
      document.title = 'Utilities || Rajlabs';
    };
  }, []);

  // Load from query params
  useEffect(() => {
    const qText = searchParams.get('text') || searchParams.get('input');
    if (qText !== null && qText !== undefined) {
      setInputText(qText);
      setOutputText(qText);
    }
  }, [searchParams]);

  const toUpperCase = (text) => text.toUpperCase();
  const toLowerCase = (text) => text.toLowerCase();
  const trimWhitespace = (text) => text.trim();
  const reverseText = (text) => text.split('').reverse().join('');
  const capitalizeWords = (text) => text.replace(/\b\w/g, (char) => char.toUpperCase());

  const handleSelectAll = (textAreaId) => {
    document.getElementById(textAreaId).select();
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    toast.success('Copied to clipboard!');
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  return (
    <ToolPageLayout 
      title="Text Formatter" 
      icon={<CgFormatText />} 
      breadcrumb={[{ label: 'Text Utilities', path: '/format-text' }]} 
      siblings={siblings} 
      currentPath="/format-text"
      activeParams={{ text: inputText }}
    >
      <div className="w-full">
        <Toaster />

        <div className={`w-full mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'} border`}>
          {/* Input Section */}
          <div className="relative mb-6">
            <textarea
              id="input"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setOutputText(e.target.value);
              }}
              placeholder="Type or paste text to format..."
              className={`w-full h-36 p-3 border rounded-md resize-none font-mono text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => handleSelectAll('input')}
                className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                title="Select All"
              >
                <PiSelectionAllFill size={16} />
              </button>
              <button
                onClick={handleClear}
                className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'}`}
                title="Clear"
              >
                <FaTrash />
              </button>
            </div>
          </div>

          {/* Transformation Controls */}
          <div className="flex flex-wrap gap-2.5 mb-6 justify-center">
            <button onClick={() => setOutputText(toUpperCase(inputText))} className={`px-4 py-2 rounded-lg font-medium text-xs sm:text-sm ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>UPPERCASE</button>
            <button onClick={() => setOutputText(toLowerCase(inputText))} className={`px-4 py-2 rounded-lg font-medium text-xs sm:text-sm ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>lowercase</button>
            <button onClick={() => setOutputText(capitalizeWords(inputText))} className={`px-4 py-2 rounded-lg font-medium text-xs sm:text-sm ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>Capitalize Words</button>
            <button onClick={() => setOutputText(trimWhitespace(inputText))} className={`px-4 py-2 rounded-lg font-medium text-xs sm:text-sm ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>Trim Spaces</button>
            <button onClick={() => setOutputText(reverseText(inputText))} className={`px-4 py-2 rounded-lg font-medium text-xs sm:text-sm ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>Reverse Text</button>
          </div>

          {/* Output Section */}
          <div className="relative">
            <textarea
              id="output"
              value={outputText}
              placeholder="Formatted text will appear here..."
              readOnly
              className={`w-full h-36 p-3 border rounded-md resize-none font-mono text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => handleSelectAll('output')}
                className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                title="Select All"
              >
                <PiSelectionAllFill size={16} />
              </button>
              <button
                onClick={handleCopyToClipboard}
                className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'}`}
                title="Copy to Clipboard"
              >
                <FaClipboard size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
