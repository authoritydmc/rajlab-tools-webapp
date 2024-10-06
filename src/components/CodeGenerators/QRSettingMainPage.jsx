import React, { useState, useEffect } from 'react';
import { useTheme } from '../../themeContext';
import { toast, Toaster } from 'react-hot-toast';
import QRCodeDisplay from './QRDisplay';

export default function QRCodeSettings() {
  const { isDarkMode } = useTheme(); // Use theme context
  const [qrData, setQrData] = useState('');
  const [size, setSize] = useState(256); // Default QR code size
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('M'); // Default error correction level


  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-green-50 text-gray-900'} transition-colors duration-300`}>
      <Toaster /> {/* Toast container */}
      <h1 className="text-3xl font-bold mb-8 text-center">QR Code Generator</h1>

      <div className={`max-w-2xl mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-150 border-gray-300'} border`}>
        {/* QR Code Data Input */}
        <div className="mb-4">
          <label className="block font-bold mb-2" htmlFor="qrData">Enter Text or URL</label>
          <textarea
            id="qrData"
            value={qrData}
            onChange={(e) => setQrData(e.target.value)}
            placeholder="Type text or URL here..."
            className={`w-full p-2 border rounded-md resize-none ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
          />
        </div>

        {/* QR Code Size */}
        <div className="mb-4">
          <label className="block font-bold mb-2" htmlFor="size">QR Code Size (px)</label>
          <input
            id="size"
            type="number"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
          />
        </div>

        {/* Error Correction Level */}
        <div className="mb-4">
          <label className="block font-bold mb-2" htmlFor="errorCorrectionLevel">Error Correction Level</label>
          <select
            id="errorCorrectionLevel"
            value={errorCorrectionLevel}
            onChange={(e) => setErrorCorrectionLevel(e.target.value)}
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
          >
            <option value="L">Low (L)</option>
            <option value="M">Medium (M)</option>
            <option value="Q">Quartile (Q)</option>
            <option value="H">High (H)</option>
          </select>
        </div>
      </div>

      {/* QR Code Display */}
      {qrData && (
        <QRCodeDisplay
          data={qrData}
          size={parseInt(size)}
          errorCorrectionLevel={errorCorrectionLevel}
        />
      )}
    </div>
  );
}
