import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaUpload, FaPaste, FaClipboard, FaCheckCircle, FaTrash, FaExternalLinkAlt, FaSearchPlus } from 'react-icons/fa';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

export default function QRScanner() {
  const { isDarkMode } = useTheme();
  const [result, setResult] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);
  const siblings = useCategorySiblings('/qr-scanner');

  // Handle Clipboard Paste
  useEffect(() => {
    const handlePaste = (e) => {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (let index in items) {
        const item = items[index];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          processImage(blob);
          e.preventDefault();
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
  return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handlePasteClick = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      let foundImage = false;
      for (const clipboardItem of clipboardItems) {
        const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
        if (imageTypes.length > 0) {
          const blob = await clipboardItem.getType(imageTypes[0]);
          processImage(blob);
          foundImage = true;
          break;
        }
      }
      
      if (!foundImage) {
        // Check if there's text
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            toast.error(`Clipboard contains text ("${text.substring(0, 15)}..."), not an image.`);
          } else {
            toast.error('No image found in clipboard.');
          }
        } catch (e) {
          toast.error('No image found in clipboard.');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to read clipboard. Please click "Allow" if the browser asks for clipboard permissions.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    } else {
      toast.error('Please select a valid image file.');
    }
  };

  const processImage = (file) => {
    setIsScanning(true);
    setResult('');
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setImagePreview(dataUrl);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Maximize resolution for better scanning
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });

        if (code) {
          setResult(code.data);
          toast.success('QR Code read successfully!');
        } else {
          toast.error('No QR code found in the image. Try a clearer image.');
        }
        setIsScanning(false);
      };
      image.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast.success('Copied to clipboard!');
    }
  };

  const clearAll = () => {
    setImagePreview(null);
    setResult('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ToolPageLayout title="QR Code Scanner" icon={<FaSearchPlus />} breadcrumb={[{label: 'QR Codes', path: '/qr-code-generator'}]} siblings={siblings} currentPath="/qr-scanner">
      <div className="w-full">
<Toaster />

      <div className={`w-full mx-auto p-6 shadow-lg rounded-md border ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'}`}>
        <p className="mb-6 text-center text-gray-500">
          Upload an image or <strong className="text-blue-500">Ctrl+V / Cmd+V</strong> to paste an image of a QR code from your clipboard.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <label className={`cursor-pointer px-6 py-3 rounded-md flex justify-center items-center gap-2 transition-colors font-semibold ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
            <FaUpload /> Upload Image
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
              ref={fileInputRef} 
            />
          </label>
          <button
            onClick={handlePasteClick}
            className={`cursor-pointer px-6 py-3 rounded-md flex justify-center items-center gap-2 border-2 border-dashed transition-colors ${isDarkMode ? 'border-gray-500 hover:border-gray-400 hover:bg-gray-800 text-gray-300' : 'border-gray-400 hover:border-gray-500 hover:bg-gray-100 text-gray-700'}`}
          >
            <FaPaste /> Paste from Clipboard
          </button>
        </div>

        {isScanning && (
          <div className="text-center my-4 animate-pulse text-blue-500 font-semibold">
            Scanning Image...
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Image Preview Area */}
          <div className={`flex flex-col items-center justify-center min-h-[250px] p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
            {imagePreview ? (
              <img src={imagePreview} alt="Uploaded QR" className="max-w-full max-h-[250px] object-contain rounded" />
            ) : (
              <span className="text-gray-400 text-sm">Image preview will appear here</span>
            )}
          </div>

          {/* Result Area */}
          <div className="flex flex-col h-full">
            <label className="font-semibold mb-2 flex items-center gap-2">
              <FaCheckCircle className={result ? "text-green-500" : "text-gray-400"} /> Scanned Result:
            </label>
            <textarea
              readOnly
              value={result}
              placeholder="QR Content will be extracted here..."
              className={`w-full flex-grow min-h-[150px] p-3 border rounded-md resize-y font-mono text-sm ${isDarkMode ? 'bg-gray-900 text-green-400 border-gray-600 focus:border-blue-500' : 'bg-gray-100 text-green-700 border-gray-300 focus:border-blue-500'} focus:outline-none`}
            />
            <div className="flex gap-3 mt-4 justify-end">
              {result && (result.startsWith('http://') || result.startsWith('https://')) && (
                <a
                  href={result}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-full flex justify-center items-center transition-colors ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                  title="Open Link"
                >
                  <FaExternalLinkAlt size={18} />
                </a>
              )}
              <button 
                onClick={handleCopy} 
                disabled={!result}
                className={`p-3 rounded-full flex justify-center items-center transition-colors ${isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50' : 'bg-green-500 hover:bg-green-600 text-white disabled:opacity-50'}`}
                title="Copy to Clipboard"
              >
                <FaClipboard size={18} />
              </button>
              <button 
                onClick={clearAll}
                disabled={!imagePreview && !result}
                className={`p-3 rounded-full flex justify-center items-center transition-colors ${isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-50' : 'bg-red-500 hover:bg-red-600 text-white disabled:opacity-50'}`}
                title="Clear"
              >
                <FaTrash size={18} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
    </ToolPageLayout>

  );
}
