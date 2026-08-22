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
  const [logo, setLogo] = useState('none');
  const [dotStyle, setDotStyle] = useState('square');
  const [cornerSquareStyle, setCornerSquareStyle] = useState('square');
  const [cornerDotStyle, setCornerDotStyle] = useState('square');
  const [frame, setFrame] = useState('none');
  const [frameText, setFrameText] = useState('SCAN ME');
  const [frameColor, setFrameColor] = useState('#000000');
  
  const siblings = useCategorySiblings('/qr-code-generator');

  // Load from query parameters
  useEffect(() => {
    const dataParam = searchParams.get('data') || searchParams.get('text') || searchParams.get('url') || searchParams.get('q');
    const sizeParam = searchParams.get('size') || searchParams.get('s');
    const ecParam = searchParams.get('errorCorrectionLevel') || searchParams.get('ec') || searchParams.get('level');
    const bgParam = searchParams.get('bg') || searchParams.get('bgColor');
    const fgParam = searchParams.get('fg') || searchParams.get('fgColor');
    const themeParam = searchParams.get('theme') || searchParams.get('colorTheme');
    const logoParam = searchParams.get('logo') || searchParams.get('icon');
    const dotsParam = searchParams.get('dotStyle') || searchParams.get('dots') || searchParams.get('pattern');
    const eyeParam = searchParams.get('eyeFrame') || searchParams.get('corner') || searchParams.get('eye');
    const frameParam = searchParams.get('frame') || searchParams.get('frameStyle');
    const frameTxtParam = searchParams.get('frameText') || searchParams.get('cta');
    const frameColParam = searchParams.get('frameColor') || searchParams.get('fc');

    if (dataParam !== null && dataParam !== undefined) setQrData(dataParam);
    if (sizeParam && !isNaN(sizeParam)) setSize(Number(sizeParam));
    if (ecParam && ['L', 'M', 'Q', 'H'].includes(ecParam.toUpperCase())) setErrorCorrectionLevel(ecParam.toUpperCase());

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
      setBgColor(bgParam.startsWith('#') ? bgParam : `#${bgParam}`);
      setColorTheme('custom');
    }
    if (fgParam) {
      setFgColor(fgParam.startsWith('#') ? fgParam : `#${fgParam}`);
      setColorTheme('custom');
    }

    if (logoParam) setLogo(logoParam);
    if (dotsParam) setDotStyle(dotsParam);
    if (eyeParam) setCornerSquareStyle(eyeParam);
    if (frameParam) setFrame(frameParam);
    if (frameTxtParam) setFrameText(frameTxtParam);
    if (frameColParam) setFrameColor(frameColParam.startsWith('#') ? frameColParam : `#${frameColParam}`);
  }, [searchParams]);

  const handleCustomization = (customs) => {
    if (customs.bg) setBgColor(customs.bg);
    if (customs.fg) setFgColor(customs.fg);
    if (customs.theme) setColorTheme(customs.theme);
    if (customs.logo) setLogo(customs.logo);
    if (customs.dotStyle) setDotStyle(customs.dotStyle);
    if (customs.cornerSquareStyle) setCornerSquareStyle(customs.cornerSquareStyle);
    if (customs.cornerDotStyle) setCornerDotStyle(customs.cornerDotStyle);
    if (customs.frame) setFrame(customs.frame);
    if (customs.frameText) setFrameText(customs.frameText);
    if (customs.frameColor) setFrameColor(customs.frameColor);
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
        logo: logo !== 'none' ? logo : undefined,
        dots: dotStyle !== 'square' ? dotStyle : undefined,
        corner: cornerSquareStyle !== 'square' ? cornerSquareStyle : undefined,
        frame: frame !== 'none' ? frame : undefined,
        frameText: frame !== 'none' ? frameText : undefined,
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
                <option value="H">High (H - 30% - Recommended for Logos)</option>
              </select>
            </div>
          </div>
        </div>

        {/* QR Code Display with Logo, Frames, Dots & Colors */}
        {qrData && (
          <QRCodeDisplay
            data={qrData}
            size={parseInt(size) || 256}
            errorCorrectionLevel={errorCorrectionLevel}
            shareText={`Data: ${qrData}`}
            bgColor={bgColor}
            fgColor={fgColor}
            colorTheme={colorTheme}
            logo={logo}
            dotStyle={dotStyle}
            cornerSquareStyle={cornerSquareStyle}
            cornerDotStyle={cornerDotStyle}
            frame={frame}
            frameText={frameText}
            frameColor={frameColor}
            onCustomizationChange={handleCustomization}
          />
        )}
      </div>
    </ToolPageLayout>
  );
}
