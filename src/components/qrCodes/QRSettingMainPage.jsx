import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../../themeContext';
import { Toaster } from 'react-hot-toast';
import { FaQrcode } from 'react-icons/fa';
import QRCodeDisplay from './QRDisplay';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

export default function QRCodeSettings() {
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const [qrData, setQrData] = useState('');
  const [size, setSize] = useState(256);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('M');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fgColor, setFgColor] = useState('#000000');
  const [colorTheme, setColorTheme] = useState('light');
  const siblings = useCategorySiblings('/qr-code-generator');

  // Load from query parameters on mount or url change
  useEffect(() => {
    const dataParam = searchParams.get('data') || searchParams.get('text') || searchParams.get('url') || searchParams.get('q');
    const sizeParam = searchParams.get('size') || searchParams.get('s');
    const ecParam = searchParams.get('errorCorrectionLevel') || searchParams.get('ec') || searchParams.get('level');
    const bgParam = searchParams.get('bg') || searchParams.get('bgColor') || searchParams.get('background');
    const fgParam = searchParams.get('fg') || searchParams.get('fgColor') || searchParams.get('foreground');
    const themeParam = searchParams.get('theme') || searchParams.get('colorTheme') || searchParams.get('mode');

    if (dataParam !== null && dataParam !== undefined) {
      setQrData(dataParam);
    }
    if (sizeParam && !isNaN(sizeParam)) {
      setSize(Number(sizeParam));
    }
    if (ecParam && ['L', 'M', 'Q', 'H'].includes(ecParam.toUpperCase())) {
      setErrorCorrectionLevel(ecParam.toUpperCase());
    }

    if (themeParam) {
      setColorTheme(themeParam.toLowerCase());
      if (themeParam.toLowerCase() === 'dark') {
        setBgColor('#0f172a');
        setFgColor('#ffffff');
      } else if (themeParam.toLowerCase() === 'light') {
        setBgColor('#ffffff');
        setFgColor('#000000');
      }
    }

    if (bgParam) {
      const formattedBg = bgParam.startsWith('#') ? bgParam : `#${bgParam}`;
      setBgColor(formattedBg);
      setColorTheme('custom');
    }
    if (fgParam) {
      const formattedFg = fgParam.startsWith('#') ? fgParam : `#${fgParam}`;
      setFgColor(formattedFg);
      setColorTheme('custom');
    }
  }, [searchParams]);

  const handleColorChange = ({ bg, fg, theme }) => {
    setBgColor(bg);
    setFgColor(fg);
    setColorTheme(theme);
  };

  return (
    <ToolPageLayout 
      title="QR Code Generator" 
      icon={<FaQrcode />} 
      breadcrumb={[{ label: 'QR Codes', path: '/qr-code-generator' }]} 
      siblings={siblings} 
      currentPath="/qr-code-generator"
      activeParams={{ 
        data: qrData, 
        size, 
        errorCorrectionLevel, 
        theme: colorTheme !== 'light' ? colorTheme : undefined,
        bg: colorTheme === 'custom' ? bgColor.replace('#', '') : undefined,
        fg: colorTheme === 'custom' ? fgColor.replace('#', '') : undefined,
      }}
    >
      <div className="w-full">
        <Toaster />

        <div className={`w-full mx-auto p-6 shadow-lg rounded-2xl ${
          isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'
        } border`}>
          {/* QR Code Data Input */}
          <div className="mb-4">
            <label className="block font-bold mb-2 text-sm sm:text-base" htmlFor="qrData">Enter Text or URL</label>
            <textarea
              id="qrData"
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              placeholder="Type text or URL here..."
              className={`w-full p-3 border rounded-xl resize-none font-mono text-sm ${
                isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* QR Code Size */}
            <div>
              <label className="block font-bold mb-2 text-sm" htmlFor="size">QR Code Size (px)</label>
              <input
                id="size"
                type="number"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className={`w-full p-2.5 border rounded-xl ${
                  isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'
                }`}
              />
            </div>

            {/* Error Correction Level */}
            <div>
              <label className="block font-bold mb-2 text-sm" htmlFor="errorCorrectionLevel">Error Correction Level</label>
              <select
                id="errorCorrectionLevel"
                value={errorCorrectionLevel}
                onChange={(e) => setErrorCorrectionLevel(e.target.value)}
                className={`w-full p-2.5 border rounded-xl ${
                  isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'
                }`}
              >
                <option value="L">Low (L - 7%)</option>
                <option value="M">Medium (M - 15%)</option>
                <option value="Q">Quartile (Q - 25%)</option>
                <option value="H">High (H - 30%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* QR Code Display with White/Black Color Theme Controls */}
        {qrData && (
          <QRCodeDisplay
            data={qrData}
            size={parseInt(size) || 256}
            errorCorrectionLevel={errorCorrectionLevel}
            shareText={`Data: ${qrData}`}
            bgColor={bgColor}
            fgColor={fgColor}
            colorTheme={colorTheme}
            onColorChange={handleColorChange}
          />
        )}
      </div>
    </ToolPageLayout>
  );
}
