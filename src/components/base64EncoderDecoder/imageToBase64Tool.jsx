import React, { useState,useEffect } from 'react';
import { FaClipboard, FaTrash, FaUpload } from 'react-icons/fa';
import { PiSelectionAllFill } from 'react-icons/pi';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';

export default function ImageToBase64Tool() {
  const { isDarkMode } = useTheme(); // Access theme context
  const [imageFile, setImageFile] = useState(null);
  const [base64String, setBase64String] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [fileSize, setFileSize] = useState(0); // File size state

  
  useEffect(() => {

    document.title = 'Image to Base64 Encoder | Rajlabs';

    // Cleanup function to reset the title when the component is unmounted
    return () => {
      document.title = 'Utilities || Rajlabs'; // Reset to the default title when leaving the page
    };
  }, []);
  // Function to handle image file change and conversion
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true); // Set loading to true
      setFileSize(file.size); // Set file size

      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64String(reader.result);
        setLoading(false); // Set loading to false after conversion
      };
      reader.readAsDataURL(file); // Convert image to Base64 string
      setImageFile(file);
    }
  };

  // Function to handle "Select All" button click
  const handleSelectAll = (textAreaId) => {
    document.getElementById(textAreaId).select();
  };

  // Function to handle "Copy to Clipboard" button click
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(base64String);
    toast.success('Copied to clipboard!');
  };

  // Function to handle "Clear" button click
  const handleClear = () => {
    setImageFile(null);
    setBase64String('');
    setFileSize(0); // Clear file size
  };

  return (
    <div
      className={`min-h-screen p-8 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      } transition-colors duration-300`}
    >
      <h1 className="text-3xl font-bold mb-8 text-center">Image to Base64 String Converter</h1>
      <Toaster /> {/* Toast container */}

      <div
        className={`max-w-3xl mx-auto p-6 shadow-lg rounded-md ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
        } border`}
      >
        {/* Image Upload Section */}
        <div className="mb-4">
          <label htmlFor="imageUpload" className="block mb-2 font-semibold">
            Upload Image
          </label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={handleImageChange}
            className={`w-full p-2 border rounded-md ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            }`}
          />
        </div>

        {/* Loading Feedback */}
        {loading && (
          <div className="text-center mb-4">
            <div className="animate-spin border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 mx-auto"></div>
            <p className="mt-2">Converting image to Base64...</p>
          </div>
        )}

        {/* Base64 Output Section */}
        <div className="mb-4">
          <label htmlFor="output" className="block mb-2 font-semibold">
            Base64 String Output
          </label>
          <div className="relative">
            <textarea
              id="output"
              value={base64String}
              placeholder="Your Base64 encoded image will appear here..."
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

        {/* Information Section */}
        <div className={`mt-6 p-4 rounded-md ${
          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-900'
        }`}>
          <p className="font-semibold">Important Information:</p>
          <ul className="list-disc ml-4 mt-2">
            <li>Total Size: {fileSize > 0 ? (fileSize / 1024).toFixed(2) + ' KB' : 'N/A'}</li>
            <li>Base64 strings can be used to embed images directly into HTML or CSS files.</li>
            <li>Keep in mind that Base64 strings increase the file size by approximately 33% compared to the original image.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
