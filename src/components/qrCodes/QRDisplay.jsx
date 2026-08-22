import React, { useRef, useState, useEffect } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { FaClipboard, FaDownload, FaShareAlt, FaPrint, FaSun, FaMoon, FaPalette, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../themeContext';

export default function QRCodeDisplay({
  data,
  size = 256,
  errorCorrectionLevel = 'M',
  shareTitle = 'QR Code',
  shareText = '',
  showHeader = true,
  headerText = "Generated QR Code",
  showButtons = true,
  visibleButtons = { copy: true, download: true, share: true, print: true },
  bgColor: initialBgColor,
  fgColor: initialFgColor,
  colorTheme: initialColorTheme = 'light',
  onColorChange,
}) {
  const { isDarkMode } = useTheme();
  const qrRef = useRef(null);

  // Determine initial color state (default standard black-on-white)
  const [colorMode, setColorMode] = useState(
    initialColorTheme === 'dark' ? 'dark' : (initialBgColor || initialFgColor) ? 'custom' : 'light'
  );
  const [bgColor, setBgColor] = useState(initialBgColor || (colorMode === 'dark' ? '#0f172a' : '#ffffff'));
  const [fgColor, setFgColor] = useState(initialFgColor || (colorMode === 'dark' ? '#ffffff' : '#000000'));
  const [format, setFormat] = useState('canvas'); // 'canvas' | 'svg'

  // Update colors when props change
  useEffect(() => {
    if (initialBgColor) setBgColor(initialBgColor);
    if (initialFgColor) setFgColor(initialFgColor);
    if (initialColorTheme) {
      if (initialColorTheme === 'dark') {
        setColorMode('dark');
        setBgColor('#0f172a');
        setFgColor('#ffffff');
      } else if (initialColorTheme === 'light') {
        setColorMode('light');
        setBgColor('#ffffff');
        setFgColor('#000000');
      }
    }
  }, [initialBgColor, initialFgColor, initialColorTheme]);

  const handleModeChange = (mode) => {
    setColorMode(mode);
    let newBg = '#ffffff';
    let newFg = '#000000';

    if (mode === 'dark') {
      newBg = '#0f172a';
      newFg = '#ffffff';
    } else if (mode === 'light') {
      newBg = '#ffffff';
      newFg = '#000000';
    }

    setBgColor(newBg);
    setFgColor(newFg);
    if (onColorChange) {
      onColorChange({ bg: newBg, fg: newFg, theme: mode });
    }
  };

  const handleCustomBg = (e) => {
    const val = e.target.value;
    setBgColor(val);
    setColorMode('custom');
    if (onColorChange) onColorChange({ bg: val, fg: fgColor, theme: 'custom' });
  };

  const handleCustomFg = (e) => {
    const val = e.target.value;
    setFgColor(val);
    setColorMode('custom');
    if (onColorChange) onColorChange({ bg: bgColor, fg: val, theme: 'custom' });
  };

  // Function to copy QR code data to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(data);
    toast.success('QR Code data copied to clipboard!');
  };

  // Function to download the QR code as an image or SVG
  const handleDownload = () => {
    if (format === 'svg') {
      const svg = qrRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'qr-code.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('QR Code SVG downloaded!');
        return;
      }
    }

    const canvas = qrRef.current.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qr-code.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR Code PNG downloaded!');
    } else {
      toast.error('Failed to download QR Code.');
    }
  };

  // Function to share the QR code image using Web Share API
  const handleShare = async () => {
    try {
      const canvas = qrRef.current.querySelector('canvas');
      if (!canvas) throw new Error('Canvas not found');

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Failed to convert QR Code to Blob');
        const file = new File([blob], 'qr-code.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: shareTitle,
            text: shareText || `Data: ${data}`,
          });
          toast.success('Shared successfully!');
        } else {
          navigator.clipboard.writeText(data);
          toast.success('Link copied! Sharing image is not supported on this browser.');
        }
      });
    } catch (error) {
      toast.error('Could not share QR Code.');
    }
  };

  // Function to print the QR code
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const content = qrRef.current.innerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>${headerText}</title>
          <style>
            body { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: sans-serif; }
            .qr-wrap { padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; }
            h2 { margin-bottom: 16px; font-size: 20px; }
            p { margin-top: 12px; font-size: 12px; color: #64748b; word-break: break-all; max-width: 400px; }
          </style>
        </head>
        <body>
          <div class="qr-wrap">
            <h2>${headerText}</h2>
            ${content}
            <p>${data}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className={`flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl shadow-xl border transition-all duration-300 mt-6 ${
      isDarkMode 
        ? 'bg-slate-900/80 border-slate-700/60 backdrop-blur-xl' 
        : 'bg-white/80 border-slate-200/80 backdrop-blur-xl'
    }`}>
      {showHeader && (
        <h3 className={`text-lg sm:text-xl font-bold mb-4 tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
          {headerText}
        </h3>
      )}

      {/* QR Background / Theme Selector Controls */}
      <div className="w-full max-w-sm mb-5 flex flex-col gap-3">
        <div className={`flex items-center justify-between p-1 rounded-xl border text-xs font-semibold select-none ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => handleModeChange('light')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              colorMode === 'light'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FaSun className="text-amber-500" size={12} />
            <span>White BG (Standard)</span>
          </button>

          <button
            onClick={() => handleModeChange('dark')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              colorMode === 'dark'
                ? 'bg-slate-800 text-white shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FaMoon className="text-indigo-400" size={12} />
            <span>Dark BG</span>
          </button>

          <button
            onClick={() => handleModeChange('custom')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              colorMode === 'custom'
                ? isDarkMode ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FaPalette className="text-emerald-500" size={12} />
            <span>Custom</span>
          </button>
        </div>

        {/* Custom Color Pickers */}
        {colorMode === 'custom' && (
          <div className={`p-3 rounded-xl border flex items-center justify-around gap-4 text-xs animate-fade-in-up ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <label className="flex items-center gap-2 font-medium">
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Background:</span>
              <input
                type="color"
                value={bgColor}
                onChange={handleCustomBg}
                className="w-7 h-7 rounded border border-slate-600 cursor-pointer bg-transparent"
              />
            </label>
            <label className="flex items-center gap-2 font-medium">
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>QR Color:</span>
              <input
                type="color"
                value={fgColor}
                onChange={handleCustomFg}
                className="w-7 h-7 rounded border border-slate-600 cursor-pointer bg-transparent"
              />
            </label>
          </div>
        )}
      </div>

      {/* QR Code Container */}
      <div 
        ref={qrRef}
        className="p-4 rounded-2xl shadow-md border transition-all duration-300 flex items-center justify-center mb-6"
        style={{ backgroundColor: bgColor, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
      >
        {format === 'canvas' ? (
          <QRCodeCanvas
            value={data}
            size={Number(size) || 256}
            level={errorCorrectionLevel}
            includeMargin={true}
            bgColor={bgColor}
            fgColor={fgColor}
          />
        ) : (
          <QRCodeSVG
            value={data}
            size={Number(size) || 256}
            level={errorCorrectionLevel}
            includeMargin={true}
            bgColor={bgColor}
            fgColor={fgColor}
          />
        )}
      </div>

      {/* Action Buttons */}
      {showButtons && (
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
          {visibleButtons.copy && (
            <button
              onClick={handleCopyToClipboard}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 ${
                isDarkMode ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title="Copy QR Code Content"
            >
              <FaClipboard size={13} />
              <span>Copy Data</span>
            </button>
          )}

          {visibleButtons.download && (
            <button
              onClick={handleDownload}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 ${
                isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title="Download QR Code"
            >
              <FaDownload size={13} />
              <span>Download PNG</span>
            </button>
          )}

          {visibleButtons.share && (
            <button
              onClick={handleShare}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 ${
                isDarkMode ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
              title="Share QR Code"
            >
              <FaShareAlt size={13} />
              <span>Share</span>
            </button>
          )}

          {visibleButtons.print && (
            <button
              onClick={handlePrint}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 ${
                isDarkMode ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
              title="Print QR Code"
            >
              <FaPrint size={13} />
              <span>Print</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
