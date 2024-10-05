import React, { useState, useEffect } from 'react';
import { FaClipboard, FaTrash } from 'react-icons/fa';
import { PiSelectionAllFill } from 'react-icons/pi';
import { toast, Toaster } from 'react-hot-toast';
import bcrypt from 'bcryptjs';  // Import bcryptjs
import { useTheme } from '../../themeContext';

export default function BcryptTool() {
  const { isDarkMode } = useTheme(); // Access theme context
  const [inputText, setInputText] = useState('');  // Input text state
  const [outputHash, setOutputHash] = useState('');  // Output hash state
  const [saltRounds, setSaltRounds] = useState(10);  // Salt rounds for bcrypt

  useEffect(() => {
    document.title = 'BCrypt Hashing Tool | Rajlabs';

    return () => {
      document.title = 'Utilities || Rajlabs';
    };
  }, []);

  // Handler for input text changes
  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  // Function to hash the input text using bcrypt
  const generateHash = async () => {
    if (!inputText) {
      toast.error('Please enter text to encrypt');
      return;
    }
    try {
      const hash = await bcrypt.hash(inputText, saltRounds);  // Generate bcrypt hash
      setOutputHash(hash);  // Set the hashed output
    } catch (error) {
      toast.error('Error generating hash');
    }
  };

  // Function to handle "Select All" button click
  const handleSelectAll = (textAreaId) => {
    document.getElementById(textAreaId).select();
  };

  // Function to handle "Copy to Clipboard" button click
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(outputHash);
    toast.success('Copied to clipboard!');
  };

  // Function to handle "Clear" button click
  const handleClear = () => {
    setInputText('');
    setOutputHash('');
  };

  return (
    <div
      className={`min-h-screen p-8 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      } transition-colors duration-300`}
    >
      <h1 className="text-3xl font-bold mb-8 text-center">BCrypt Encrypter</h1>
      <Toaster /> {/* Toast container */}

      <div
        className={`max-w-3xl mx-auto p-6 shadow-lg rounded-md ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
        } border`}
      >
        {/* Input Section */}
        <div className="mb-4">
          <label htmlFor="input" className="block mb-2 font-semibold">
            Text to Encrypt
          </label>
          <div className="relative">
            <textarea
              id="input"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Enter text to hash using bcrypt..."
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

        {/* Salt Rounds Selector */}
        <div className="mb-6">
          <label htmlFor="saltRounds" className="block mb-2 font-semibold">
            Salt Rounds
          </label>
          <input
            type="number"
            id="saltRounds"
            min="4"
            max="15"
            value={saltRounds}
            onChange={(e) => setSaltRounds(parseInt(e.target.value))}
            className={`w-20 p-2 border rounded-md ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            }`}
          />
          <small className="block mt-1 text-gray-400">
            (Increasing salt rounds makes the encryption stronger but slower)
          </small>
        </div>

        {/* Generate Hash Button */}
        <div className="text-center mb-6">
          <button
            onClick={generateHash}
            className={`p-3 rounded-md font-semibold transition-colors duration-300 ${
              isDarkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            Generate BCrypt Hash
          </button>
        </div>

        {/* Output Section */}
        <div className="mb-4">
          <label htmlFor="output" className="block mb-2 font-semibold">
            BCrypt Hash Output
          </label>
          <div className="relative">
            <textarea
              id="output"
              value={outputHash}
              placeholder="Your hashed bcrypt output will appear here..."
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
