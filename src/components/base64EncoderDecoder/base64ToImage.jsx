import React, { useState ,useEffect} from 'react';
import { FaClipboard, FaDownload, FaTrash } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';

export default function Base64ToImagePreviewGenerator() {
  const { isDarkMode } = useTheme(); // Access theme context
  const [base64String, setBase64String] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    document.title = 'Base64 to Image Decoder | Rajlabs';

    // Cleanup function to reset the title when the component is unmounted
    return () => {
      document.title = 'Utilities || Rajlabs'; // Reset to the default title when leaving the page
    };
  }, []);
  // Function to handle Base64 string input change
  const handleBase64InputChange = (event) => {
    const newBase64String = event.target.value;
    setBase64String(newBase64String);
    setImagePreview(newBase64String); // Update image preview
  };

  // Function to handle "Copy to Clipboard" button click
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(base64String);
    toast.success('Copied to clipboard!');
  };

  // Function to handle "Download Image" button click
  const handleDownloadImage = () => {
    if (base64String) {
      const link = document.createElement('a');
      link.href = base64String;
      link.download = 'image.png'; // Default filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error('No image to download!');
    }
  };

  // Function to handle "Clear" button click
  const handleClear = () => {
    setBase64String('');
    setImagePreview('');
  };

  return (
    <div
      className={`min-h-screen p-8 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-green-50 text-gray-900'
      } transition-colors duration-300`}
    >
      <h1 className="text-3xl font-bold mb-8 text-center">Base64 to Image Preview Generator</h1>
      <Toaster /> {/* Toast container */}

      <div
        className={`max-w-3xl mx-auto p-6 shadow-lg rounded-md ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-150 border-gray-300'
        } border`}
      >
        {/* Base64 Input Section */}
        <div className="mb-4">
          <label htmlFor="base64Input" className="block mb-2 font-semibold">
            Enter Base64 String
          </label>
          <textarea
            id="base64Input"
            value={base64String}
            onChange={handleBase64InputChange}
            placeholder="Paste your Base64 encoded image here..."
            className={`w-full h-40 p-2 border rounded-md resize-none ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'
            }`}
          />
        </div>

        {/* Image Preview Section */}
        {imagePreview && (
          <div className="mb-4 text-center">
            <img
              src={imagePreview}
              alt="Base64 Image Preview"
              className="max-w-full h-auto border rounded-md"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center">
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
            onClick={handleDownloadImage}
            className={`p-2 rounded-md transition-colors duration-300 ${
              isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            title="Download Image"
          >
            <FaDownload size={16} />
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
  );
}
