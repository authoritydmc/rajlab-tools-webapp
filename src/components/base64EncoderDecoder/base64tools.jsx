import React, { useState, useEffect } from 'react';
import { FaClipboard, FaTrash } from 'react-icons/fa';
import { PiSelectionAllFill } from 'react-icons/pi';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { MdSwapVert } from "react-icons/md";
export default function Base64Tool() {
  const { isDarkMode } = useTheme(); // Access theme context
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isEncodeMode, setIsEncodeMode] = useState(true); // Toggle for Encode/Decode mode

  // Set the page title when the component mounts
  useEffect(() => {
    document.title = "Base64 Encoder/Decoder - Rajlabs";
  }, []);

  // Function to handle mode change (Encode/Decode)
  const toggleMode = () => {
    setIsEncodeMode(!isEncodeMode); // Toggle between Encode and Decode modes
    setOutputText(''); // Clear output when mode changes
    if (inputText) {
      if (isEncodeMode) {
        try {
          setOutputText(atob(inputText)); // Decode Base64 to text
        } catch (error) {
          toast.error('Invalid Base64 string'); // Handle decoding error
        }
      } else {
        setOutputText(btoa(inputText)); // Encode input to Base64
      }
    }
  };

  // Handler for input text changes
  const handleInputChange = (event) => {
    const newText = event.target.value;
    setInputText(newText);
    if (isEncodeMode) {
      setOutputText(btoa(newText)); // Encode text to Base64
    } else {
      try {
        setOutputText(atob(newText)); // Decode Base64 to text
      } catch (error) {
        setOutputText('');
        toast.error('Invalid Base64 string');
      }
    }
  };

  // Function to handle "Select All" button click
  const handleSelectAll = (textAreaId) => {
    document.getElementById(textAreaId).select();
  };

  // Function to handle "Copy to Clipboard" button click
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    toast.success('Copied to clipboard!');
  };

  // Function to handle "Clear" button click
  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  // Function to handle "Swap" button click
  const handleSwap = () => {
    const temp = inputText;
    setInputText(outputText);
    setOutputText(temp);
  };

  return (
    <div
      className={`min-h-screen p-8 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      } transition-colors duration-300`}
    >
      <h1 className="text-3xl font-bold mb-8 text-center">Base64 Encoder/Decoder</h1>
      <Toaster /> {/* Toast container */}

      {/* Mode Toggle Switch */}
      <div className="mb-6 flex justify-center items-center">
        <label className="mr-4 text-lg font-semibold">
          Mode:
        </label>
        <div 
          onClick={toggleMode} 
          className={`w-20 h-10 rounded-full flex items-center cursor-pointer transition-colors duration-300 ${
            isEncodeMode ? 'bg-blue-500' : 'bg-green-500'
          }`}
        >
          <div
            className={`w-8 h-8 bg-white rounded-full shadow-md transition-transform duration-300 ${
              isEncodeMode ? 'translate-x-1' : 'translate-x-10'
            }`}
          ></div>
        </div>
        <span className="ml-4 text-lg">
          {isEncodeMode ? 'Encode' : 'Decode'}
        </span>
      </div>

      <div
        className={`max-w-3xl mx-auto p-6 shadow-lg rounded-md ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
        } border`}
      >
        {/* Input Section */}
        <div className="mb-4">
          {/* Conditionally Render Input Label */}
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
          {/* Conditionally Render Output Label */}
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
    </div>
  );
}
