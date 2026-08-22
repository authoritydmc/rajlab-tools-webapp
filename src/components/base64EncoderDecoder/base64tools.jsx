import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaClipboard, FaTrash } from 'react-icons/fa';
import { AiOutlineFieldString } from 'react-icons/ai';
import { PiSelectionAllFill } from 'react-icons/pi';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { MdSwapVert } from "react-icons/md";
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

export default function Base64Tool() {
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isEncodeMode, setIsEncodeMode] = useState(true);

  useEffect(() => {
    document.title = "Base64 Encoder/Decoder - Rajlabs";
  }, []);

  // Load from query parameters
  useEffect(() => {
    const qText = searchParams.get('text') || searchParams.get('input') || searchParams.get('data');
    const qMode = searchParams.get('mode');

    const encode = qMode ? qMode.toLowerCase() !== 'decode' : true;
    setIsEncodeMode(encode);

    if (qText !== null && qText !== undefined) {
      setInputText(qText);
      if (encode) {
        try {
          setOutputText(btoa(qText));
        } catch {
          setOutputText('');
        }
      } else {
        try {
          setOutputText(atob(qText));
        } catch {
          setOutputText('');
        }
      }
    }
  }, [searchParams]);

  const toggleMode = () => {
    const nextMode = !isEncodeMode;
    setIsEncodeMode(nextMode);
    setOutputText('');
    if (inputText) {
      if (nextMode) {
        try {
          setOutputText(btoa(inputText));
        } catch (e) {
          toast.error('Could not encode text');
        }
      } else {
        try {
          setOutputText(atob(inputText));
        } catch (error) {
          toast.error('Invalid Base64 string');
        }
      }
    }
  };

  const handleInputChange = (event) => {
    const newText = event.target.value;
    setInputText(newText);
    if (isEncodeMode) {
      try {
        setOutputText(btoa(newText));
      } catch (e) {
        setOutputText('');
      }
    } else {
      try {
        setOutputText(atob(newText));
      } catch (error) {
        setOutputText('');
      }
    }
  };

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

  const handleSwap = () => {
    const temp = inputText;
    setInputText(outputText);
    setOutputText(temp);
    setIsEncodeMode(!isEncodeMode);
  };

  const siblings = useCategorySiblings('/base64-encoder-decoder');

  return (
    <ToolPageLayout 
      title="Base64 Encoder/Decoder" 
      icon={<AiOutlineFieldString />} 
      breadcrumb={[{ label: 'Encryption & Encoding Utilities', path: '/base64-encoder-decoder' }]} 
      siblings={siblings} 
      currentPath="/base64-encoder-decoder"
      activeParams={{ text: inputText, mode: isEncodeMode ? 'encode' : 'decode' }}
    >
      <div className="w-full">
        <Toaster />

        {/* Mode Selector */}
        <div className="mb-6 flex justify-center items-center">
          <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <button
              onClick={() => { if (!isEncodeMode) toggleMode(); }}
              className={`px-6 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                isEncodeMode 
                  ? (isDarkMode ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                  : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => { if (isEncodeMode) toggleMode(); }}
              className={`px-6 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                !isEncodeMode 
                  ? (isDarkMode ? 'bg-green-600 text-white shadow-sm' : 'bg-white text-green-600 shadow-sm')
                  : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')
              }`}
            >
              Decode
            </button>
          </div>
        </div>

        <div
          className={`w-full mx-auto p-6 shadow-lg rounded-md ${
            isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'
          } border`}
        >
          {/* Input Section */}
          <div className="mb-4">
            <label htmlFor="input" className="block mb-2 font-semibold">
              {isEncodeMode ? 'Text to Encode' : 'Base64 to Decode'}
            </label>
            <div className="relative">
              <textarea
                id="input"
                value={inputText}
                onChange={handleInputChange}
                placeholder={isEncodeMode ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
                className={`w-full h-40 p-2 border rounded-md resize-none ${
                  isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'
                }`}
              />
              {/* Input Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => handleSelectAll('input')}
                  className={`p-2 rounded-md transition-colors duration-300 ${
                    isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  title="Select All"
                >
                  <PiSelectionAllFill size={16} />
                </button>
                <button
                  onClick={handleClear}
                  className={`p-2 rounded-md transition-colors duration-300 ${
                    isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                  title="Clear"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="mb-6 flex justify-center">
            <button
              onClick={handleSwap}
              className={`p-2 rounded-md transition-colors duration-300 ${
                isDarkMode ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
              title="Swap"
            >
              <MdSwapVert />
            </button>
          </div>

          {/* Output Section */}
          <div className="mb-4">
            <label htmlFor="output" className="block mb-2 font-semibold">
              {isEncodeMode ? 'Base64 Output' : 'Decoded Text'}
            </label>
            <div className="relative">
              <textarea
                id="output"
                value={outputText}
                placeholder={isEncodeMode ? 'Your Base64 encoded output will appear here...' : 'Your decoded text will appear here...'}
                readOnly
                className={`w-full h-40 p-2 border rounded-md resize-none ${
                  isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'
                }`}
              />
              {/* Output Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => handleSelectAll('output')}
                  className={`p-2 rounded-md transition-colors duration-300 ${
                    isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  title="Select All"
                >
                  <PiSelectionAllFill size={16} />
                </button>
                <button
                  onClick={handleCopyToClipboard}
                  className={`p-2 rounded-md transition-colors duration-300 ${
                    isDarkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                  title="Copy to Clipboard"
                >
                  <FaClipboard size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
