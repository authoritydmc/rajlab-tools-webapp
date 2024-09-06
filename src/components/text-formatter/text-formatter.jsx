import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast'; // Import react-hot-toast
import { useTheme } from '../../themeContext';
import { FaClipboard, FaTrash } from 'react-icons/fa'; // Import your clipboard icon
import { PiSelectionAllFill } from 'react-icons/pi';

export default function TextFormatter() {
  const { isDarkMode } = useTheme(); // Use dark mode from context
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");

  // Function to sanitize the text by removing non-word characters
  const sanitizeText = (text) => {
    return text.replace(/[^\w\s]/g, ""); // Retains letters, digits, and whitespace
  };

  // Function to convert text to uppercase
  const toUpperCase = (text) => {
    return text.toUpperCase();
  };

  // Function to convert text to lowercase
  const toLowerCase = (text) => {
    return text.toLowerCase();
  };

  // Function to trim leading and trailing whitespace
  const trimWhitespace = (text) => {
    return text.trim();
  };

  // Function to reverse the text
  const reverseText = (text) => {
    return text.split('').reverse().join('');
  };

  // Handler for input change
  const handleInputChange = (event) => {
    const newText = event.target.value;
    setInputText(newText);
    setOutputText(sanitizeText(newText)); // Default action is sanitizing
  };

  // Function to handle "Copy to Clipboard" button click
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    toast.success("Copied to clipboard!"); // Show toast notification
  };

  // Function to handle "Clear" button click
  const handleClear = () => {
    setInputText("");
    setOutputText("");
  };

  // Function to format text based on action
  const handleFormatText = (action) => {
    switch (action) {
      case 'uppercase':
        setOutputText(toUpperCase(inputText));
        break;
      case 'lowercase':
        setOutputText(toLowerCase(inputText));
        break;
      case 'trim':
        setOutputText(trimWhitespace(inputText));
        break;
      case 'reverse':
        setOutputText(reverseText(inputText));
        break;
      default:
        setOutputText(sanitizeText(inputText));
    }
    toast.success(`Text formatted as ${action}`);
  };

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-300`}>
      <h1 className="text-3xl font-bold mb-8 text-center">Text Formatter Utility</h1>
      <Toaster /> {/* Toast container */}

      <div className={`max-w-2xl mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border`}>
        {/* Input Section */}
        <div className="relative mb-8">
          <textarea
            id="input"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type or paste text here..."
            className={`w-full h-40 p-2 border rounded-md resize-none ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'}`}
          />
          {/* Input Action Buttons */}
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={() => document.getElementById('input').select()}
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
              <FaTrash size={16} />
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="relative mb-8">
          <textarea
            id="output"
            value={outputText}
            placeholder="Your output goes here..."
            readOnly
            className={`w-full h-40 p-2 border rounded-md resize-none ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'}`}
          />
          {/* Output Action Buttons */}
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={() => document.getElementById('output').select()}
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

        {/* Formatting Actions */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleFormatText('uppercase')}
            className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
          >
            Uppercase
          </button>
          <button
            onClick={() => handleFormatText('lowercase')}
            className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-500 text-white hover:bg-purple-600'}`}
          >
            Lowercase
          </button>
          <button
            onClick={() => handleFormatText('trim')}
            className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-teal-500 text-white hover:bg-teal-600'}`}
          >
            Trim
          </button>
          <button
            onClick={() => handleFormatText('reverse')}
            className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'}`}
          >
            Reverse
          </button>
        </div>
      </div>
    </div>
  );
}
