import React, { useState, useEffect } from 'react';
import { useTheme } from '../../themeContext';
import { toast, Toaster } from 'react-hot-toast';
import { FaQrcode } from 'react-icons/fa';
import QRCodeDisplay from './QRDisplay';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';


export default function QRCodeSettings() {
  const { isDarkMode } = useTheme(); // Use theme context
  const [qrData, setQrData] = useState('');
  const [size, setSize] = useState(256); // Default QR code size
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('M'); // Default error correction level
  const siblings = useCategorySiblings('/qr-code-generator');
  return (
    <ToolPageLayout title="QR Code Generator" icon={<FaQrcode />} breadcrumb={[{label: 'QR Codes', path: '/qr-code-generator'}]} siblings={siblings} currentPath="/qr-code-generator">
      <div className="w-full">
<Toaster /> {/* Toast container */}
      

      <div className={`w-full mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'} border`}>
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
          shareText={`Data: ${qrData}`}
          
        />
      )}
    </div>
    </ToolPageLayout>

  );
}
