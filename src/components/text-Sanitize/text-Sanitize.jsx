import React, { useState } from 'react';
import { FaClipboard, FaTrash } from 'react-icons/fa';
import { PiSelectionAllFill } from 'react-icons/pi';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../providers/ThemeContext';

export default function SanitizeText() {
  const { isDarkMode } = useTheme(); // Access theme context
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  // Function to sanitize text by removing non-word characters
  const sanitizeText = (text) => {
    return text.replace(/[^\w\s]/g, ''); // Keep letters, digits, and whitespace
  };

  // Handler for input text changes
  const handleInputChange = (event) => {
    const newText = event.target.value;
    setInputText(newText);
    setOutputText(sanitizeText(newText));
  };

  // Function to handle "Select All" button click
  const handleSelectAll = (textAreaId) => {
    document.getElementById(textAreaId).select();
  };

  // Function to handle "Copy to Clipboard" button click
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    toast.success('Copied to clipboard!'); // Show toast notification
  };

  // Function to handle "Clear" button click
  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  return (
    <div
      className={`min-h-screen p-8 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      } transition-colors duration-300`}
    >
      <h1 className="text-3xl font-bold mb-8 text-center">Sanitize Text Utility</h1>
      <Toaster /> {/* Toast container */}

      <div
        className={`max-w-2xl mx-auto p-6 shadow-lg rounded-md ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
        } border`}
      >
        {/* Input Section */}
        <div className="relative mb-8">
          <textarea
            id="input"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type or paste text here..."
            className={`w-full h-40 p-2 border rounded-md resize-none ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
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

        {/* Output Section */}
        <div className="relative">
          <textarea
            id="output"
            value={outputText}
            placeholder="Your output goes here..."
            readOnly
            className={`w-full h-40 p-2 border rounded-md resize-none ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
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
  );
}
