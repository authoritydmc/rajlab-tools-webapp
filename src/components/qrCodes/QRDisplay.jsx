import React, { useRef, useState, useEffect } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { FaClipboard, FaDownload, FaShareAlt, FaPrint, FaSun, FaMoon, FaPalette, FaImage, FaShapes, FaBorderAll, FaUpload, FaTrash, FaMagic } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { PRESET_LOGOS, getPresetLogoUrl, detectBrandFromData } from '../../utils/qrLogoPresets';

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
  
  // Customization Props
  bgColor: initialBgColor = '#ffffff',
  fgColor: initialFgColor = '#000000',
  colorTheme: initialColorTheme = 'light',
  logo: initialLogo = '',
  logoSize: initialLogoSize = 0.25, // 0.15 to 0.35 fraction of QR size
  centerText: initialCenterText = '',
  dotStyle: initialDotStyle = 'square', // 'square' | 'dots' | 'rounded' | 'classy' | 'extra-rounded'
  cornerSquareStyle: initialCornerSquareStyle = 'square', // 'square' | 'dot' | 'extra-rounded'
  cornerDotStyle: initialCornerDotStyle = 'square', // 'square' | 'dot'
  frame: initialFrame = 'none', // 'none' | 'banner-bottom' | 'banner-top' | 'card' | 'box'
  frameText: initialFrameText = 'SCAN ME',
  frameColor: initialFrameColor = '#000000',
  
  onCustomizationChange,
}) {
  const { isDarkMode } = useTheme();
  const containerRef = useRef(null);
  const qrCodeInstance = useRef(null);

  // States
  const [colorMode, setColorMode] = useState(initialColorTheme);
  const [bgColor, setBgColor] = useState(initialBgColor);
  const [fgColor, setFgColor] = useState(initialFgColor);
  const [logo, setLogo] = useState(initialLogo);
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [isManualLogoSelection, setIsManualLogoSelection] = useState(Boolean(initialLogo && initialLogo !== 'none'));
  const [dotStyle, setDotStyle] = useState(initialDotStyle);
  const [cornerSquareStyle, setCornerSquareStyle] = useState(initialCornerSquareStyle);
  const [cornerDotStyle, setCornerDotStyle] = useState(initialCornerDotStyle);
  const [frame, setFrame] = useState(initialFrame);
  const [frameText, setFrameText] = useState(initialFrameText);
  const [frameColor, setFrameColor] = useState(initialFrameColor);
  const [activeTab, setActiveTab] = useState('style'); // 'style' | 'logo' | 'frame'

  const actualLogoUrl = customLogoUrl || getPresetLogoUrl(logo);

  // Auto-detect brand logo based on QR data content if user hasn't manually locked a logo
  useEffect(() => {
    if (customLogoUrl || isManualLogoSelection) return;
    const detected = detectBrandFromData(data);
    if (detected) {
      setLogo(detected);
      notifyChange({ logo: detected });
    } else if (!initialLogo || initialLogo === 'none') {
      setLogo('none');
      notifyChange({ logo: 'none' });
    }
  }, [data, isManualLogoSelection, customLogoUrl]);

  // Sync props to state
  useEffect(() => {
    if (initialBgColor) setBgColor(initialBgColor);
    if (initialFgColor) setFgColor(initialFgColor);
    if (initialColorTheme) setColorMode(initialColorTheme);
    if (initialDotStyle) setDotStyle(initialDotStyle);
    if (initialCornerSquareStyle) setCornerSquareStyle(initialCornerSquareStyle);
    if (initialCornerDotStyle) setCornerDotStyle(initialCornerDotStyle);
    if (initialLogo) {
      setLogo(initialLogo);
      if (initialLogo !== 'none') setIsManualLogoSelection(true);
    }
    if (initialFrame) setFrame(initialFrame);
    if (initialFrameText) setFrameText(initialFrameText);
  }, [initialBgColor, initialFgColor, initialColorTheme, initialDotStyle, initialCornerSquareStyle, initialCornerDotStyle, initialLogo, initialFrame, initialFrameText]);

  // Notify parent of state changes
  const notifyChange = (updates) => {
    if (onCustomizationChange) {
      onCustomizationChange({
        bg: bgColor,
        fg: fgColor,
        theme: colorMode,
        dotStyle,
        cornerSquareStyle,
        cornerDotStyle,
        logo: customLogoUrl || logo,
        frame,
        frameText,
        frameColor,
        ...updates
      });
    }
  };

  // Initialize and update QRCodeStyling instance
  useEffect(() => {
    if (!containerRef.current) return;

    const qrSize = Math.max(160, Math.min(600, Number(size) || 256));
    const effectiveEc = actualLogoUrl ? 'H' : errorCorrectionLevel; // Force high EC if logo is present

    const options = {
      width: qrSize,
      height: qrSize,
      data: data || 'https://rajlabs.in',
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: effectiveEc,
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.3,
        margin: 6,
        crossOrigin: 'anonymous',
      },
      dotsOptions: {
        color: fgColor,
        type: dotStyle,
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        color: fgColor,
        type: cornerSquareStyle,
      },
      cornersDotOptions: {
        color: fgColor,
        type: cornerDotStyle,
      },
      image: actualLogoUrl || undefined,
    };

    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling(options);
      containerRef.current.innerHTML = '';
      qrCodeInstance.current.append(containerRef.current);
    } else {
      qrCodeInstance.current.update(options);
    }
  }, [data, size, errorCorrectionLevel, bgColor, fgColor, dotStyle, cornerSquareStyle, cornerDotStyle, actualLogoUrl]);

  // Color Mode Handler
  const handleColorModeChange = (mode) => {
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
    notifyChange({ bg: newBg, fg: newFg, theme: mode });
  };

  // File Upload Handler for Logo
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo image must be under 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target.result;
        setCustomLogoUrl(base64);
        setLogo('custom');
        setIsManualLogoSelection(true);
        notifyChange({ logo: base64 });
        toast.success('Custom logo applied!');
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setCustomLogoUrl('');
    setLogo('none');
    setIsManualLogoSelection(true);
    notifyChange({ logo: 'none' });
  };

  const handleAutoDetectLogo = () => {
    setCustomLogoUrl('');
    setIsManualLogoSelection(false);
    const detected = detectBrandFromData(data);
    if (detected) {
      setLogo(detected);
      notifyChange({ logo: detected });
      toast.success(`Detected & applied ${detected.toUpperCase()} logo!`);
    } else {
      setLogo('none');
      notifyChange({ logo: 'none' });
      toast('No specific brand matched from QR content', { icon: 'ℹ️' });
    }
  };

  // Download QR Code (Combines Frame & QR on offscreen canvas if framed)
  const handleDownload = async () => {
    try {
      if (frame === 'none') {
        await qrCodeInstance.current.download({ name: 'qr-code', extension: 'png' });
        toast.success('QR Code downloaded!');
        return;
      }

      // Generate composite canvas with frame
      const qrRawBlob = await qrCodeInstance.current.getRawData('png');
      const qrImg = new Image();
      qrImg.src = URL.createObjectURL(qrRawBlob);
      await new Promise(r => qrImg.onload = r);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const qrSize = qrImg.width;
      const padding = 24;
      const bannerHeight = 56;

      if (frame === 'banner-bottom' || frame === 'banner-top') {
        canvas.width = qrSize + (padding * 2);
        canvas.height = qrSize + (padding * 2) + bannerHeight;

        // Draw Frame Background
        ctx.fillStyle = frameColor || '#000000';
        ctx.roundRect(0, 0, canvas.width, canvas.height, 20);
        ctx.fill();

        // Draw White QR backing
        ctx.fillStyle = bgColor;
        const qrY = frame === 'banner-bottom' ? padding : padding + bannerHeight;
        ctx.roundRect(padding, qrY, qrSize, qrSize, 12);
        ctx.fill();
        ctx.drawImage(qrImg, padding, qrY);

        // Draw Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textY = frame === 'banner-bottom' 
          ? canvas.height - (bannerHeight / 2) 
          : (bannerHeight / 2) + padding / 2;
        ctx.fillText(frameText || 'SCAN ME', canvas.width / 2, textY);
      } else {
        canvas.width = qrSize + (padding * 2);
        canvas.height = qrSize + (padding * 2);
        ctx.fillStyle = frameColor || '#000000';
        ctx.roundRect(0, 0, canvas.width, canvas.height, 20);
        ctx.fill();
        ctx.drawImage(qrImg, padding, padding);
      }

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = 'framed-qr-code.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Framed QR Code downloaded!');
    } catch (err) {
      toast.error('Failed to download QR code.');
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(data);
    toast.success('QR content copied to clipboard!');
  };

  return (
    <div className={`flex flex-col items-center justify-center p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-xl border transition-all duration-300 w-full h-full ${
      isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/70 border-slate-200/60 backdrop-blur-xl'
    }`}>
      {showHeader && (
        <h3 className={`text-lg sm:text-xl font-bold mb-4 tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
          {headerText}
        </h3>
      )}

      {/* Interactive Customization Tabs */}
      <div className="w-full max-w-md mb-6">
        <div className={`flex items-center p-1 rounded-2xl border text-xs font-semibold select-none mb-4 ${
          isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          {[
            { id: 'style', label: 'Color & Theme', icon: FaPalette },
            { id: 'patterns', label: 'Dots & Eyes', icon: FaShapes },
            { id: 'logo', label: 'Brand Logo', icon: FaImage },
            { id: 'frame', label: 'Outer Frame', icon: FaBorderAll },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  active 
                    ? isDarkMode 
                      ? 'bg-indigo-600 text-white shadow-md font-bold' 
                      : 'bg-white text-indigo-700 shadow-sm font-bold'
                    : isDarkMode 
                      ? 'text-slate-400 hover:text-slate-200' 
                      : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon size={12} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Color & Theme */}
        {activeTab === 'style' && (
          <div className={`p-4 rounded-2xl border space-y-3 animate-fade-in-up ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex gap-2">
              <button
                onClick={() => handleColorModeChange('light')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  colorMode === 'light'
                    ? 'bg-white text-slate-900 border-slate-300 shadow-sm font-bold'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                <FaSun className="text-amber-500" size={12} />
                <span>White BG (Standard)</span>
              </button>
              <button
                onClick={() => handleColorModeChange('dark')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  colorMode === 'dark'
                    ? 'bg-slate-800 text-white border-slate-600 shadow-sm font-bold'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                <FaMoon className="text-indigo-400" size={12} />
                <span>Dark BG</span>
              </button>
              <button
                onClick={() => handleColorModeChange('custom')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  colorMode === 'custom'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm font-bold'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                <FaPalette size={12} />
                <span>Custom</span>
              </button>
            </div>

            {colorMode === 'custom' && (
              <div className="flex items-center justify-around gap-4 pt-2 border-t border-slate-800/40 text-xs">
                <label className="flex items-center gap-2 font-medium">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Background:</span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => { setBgColor(e.target.value); notifyChange({ bg: e.target.value }); }}
                    className="w-7 h-7 rounded border border-slate-600 cursor-pointer bg-transparent"
                  />
                </label>
                <label className="flex items-center gap-2 font-medium">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>QR Color:</span>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => { setFgColor(e.target.value); notifyChange({ fg: e.target.value }); }}
                    className="w-7 h-7 rounded border border-slate-600 cursor-pointer bg-transparent"
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Dots & Eye Shapes */}
        {activeTab === 'patterns' && (
          <div className={`p-4 rounded-2xl border space-y-4 animate-fade-in-up text-xs ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <span className="font-semibold block mb-2 text-slate-400">Data Dot Shape:</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'square', label: 'Square' },
                  { id: 'rounded', label: 'Rounded' },
                  { id: 'dots', label: 'Dots' },
                  { id: 'classy', label: 'Classy' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setDotStyle(item.id); notifyChange({ dotStyle: item.id }); }}
                    className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-all ${
                      dotStyle === item.id 
                        ? 'bg-indigo-600 text-white border-indigo-500 font-bold' 
                        : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="font-semibold block mb-2 text-slate-400">Corner Eye Shape:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'square', label: 'Square' },
                  { id: 'extra-rounded', label: 'Rounded' },
                  { id: 'dot', label: 'Circle' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setCornerSquareStyle(item.id); notifyChange({ cornerSquareStyle: item.id }); }}
                    className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-all ${
                      cornerSquareStyle === item.id 
                        ? 'bg-indigo-600 text-white border-indigo-500 font-bold' 
                        : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Brand Center Logo */}
        {activeTab === 'logo' && (
          <div className={`p-4 rounded-2xl border space-y-4 animate-fade-in-up text-xs ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-400">Preset Brand Icons:</span>
                <button
                  type="button"
                  onClick={handleAutoDetectLogo}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                    !isManualLogoSelection
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                      : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                  title="Auto-detect brand icon based on QR content"
                >
                  <FaMagic size={10} />
                  <span>Auto Match</span>
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_LOGOS.map(p => {
                  const isSelected = (!customLogoUrl && logo === p.id) || (p.id === 'none' && !actualLogoUrl);
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setCustomLogoUrl('');
                        setLogo(p.id);
                        setIsManualLogoSelection(true);
                        notifyChange({ logo: p.id });
                      }}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        isSelected 
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold shadow-sm' 
                          : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {p.iconUrl ? (
                        <img src={p.iconUrl} alt={p.label} className="w-5 h-5 object-contain" />
                      ) : (
                        <FaTrash size={12} className="my-1 text-slate-500" />
                      )}
                      <span className="text-[10px] truncate max-w-full">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Logo Upload */}
            <div className="pt-2 border-t border-slate-800/40">
              <span className="font-semibold block mb-2 text-slate-400">Upload Custom Image:</span>
              <div className="flex items-center gap-2">
                <label className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed cursor-pointer font-medium transition-all ${
                  isDarkMode ? 'bg-slate-900/80 border-slate-700 hover:border-indigo-400 text-slate-300' : 'bg-white border-slate-300 hover:border-indigo-500 text-slate-700'
                }`}>
                  <FaUpload size={12} />
                  <span>Choose Image File...</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                {actualLogoUrl && (
                  <button
                    onClick={clearLogo}
                    className="p-2 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20 transition-all"
                    title="Remove Logo"
                  >
                    <FaTrash size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Outer Frame & CTA */}
        {activeTab === 'frame' && (
          <div className={`p-4 rounded-2xl border space-y-4 animate-fade-in-up text-xs ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <span className="font-semibold block mb-2 text-slate-400">Frame Style:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'No Frame' },
                  { id: 'banner-bottom', label: 'Bottom Banner' },
                  { id: 'banner-top', label: 'Top Header' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setFrame(item.id); notifyChange({ frame: item.id }); }}
                    className={`py-2 px-2 rounded-xl border font-medium transition-all text-center ${
                      frame === item.id 
                        ? 'bg-indigo-600 text-white border-indigo-500 font-bold' 
                        : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {frame !== 'none' && (
              <div className="space-y-3 pt-2 border-t border-slate-800/40">
                <div>
                  <label className="font-semibold block mb-1 text-slate-400">Frame Text / Call To Action:</label>
                  <input
                    type="text"
                    value={frameText}
                    onChange={(e) => { setFrameText(e.target.value); notifyChange({ frameText: e.target.value }); }}
                    placeholder="e.g. SCAN TO PAY, SCAN ME"
                    className={`w-full p-2 rounded-xl border font-bold text-center ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-400">Frame Color:</span>
                  <input
                    type="color"
                    value={frameColor}
                    onChange={(e) => { setFrameColor(e.target.value); notifyChange({ frameColor: e.target.value }); }}
                    className="w-7 h-7 rounded border border-slate-600 cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Render QR Container with Frame */}
      <div 
        className="transition-all duration-300 flex flex-col items-center justify-center mb-6 overflow-hidden"
        style={{
          backgroundColor: frame !== 'none' ? frameColor : 'transparent',
          padding: frame !== 'none' ? '18px 18px' : '0',
          borderRadius: '24px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
        }}
      >
        {frame === 'banner-top' && (
          <div className="text-white font-extrabold text-sm sm:text-base uppercase tracking-wider mb-2.5 px-4 text-center select-none">
            {frameText || 'SCAN ME'}
          </div>
        )}

        <div
          ref={containerRef}
          className="rounded-2xl overflow-hidden flex items-center justify-center p-2"
          style={{ backgroundColor: bgColor }}
        />

        {frame === 'banner-bottom' && (
          <div className="text-white font-extrabold text-sm sm:text-base uppercase tracking-wider mt-2.5 px-4 text-center select-none">
            {frameText || 'SCAN ME'}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showButtons && (
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
          {visibleButtons.copy && (
            <button
              onClick={handleCopyToClipboard}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 ${
                isDarkMode ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <FaClipboard size={13} />
              <span>Copy Data</span>
            </button>
          )}

          {visibleButtons.download && (
            <button
              onClick={handleDownload}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 ${
                isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <FaDownload size={13} />
              <span>Download PNG</span>
            </button>
          )}

          {visibleButtons.share && (
            <button
              onClick={handleDownload}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 ${
                isDarkMode ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              <FaShareAlt size={13} />
              <span>Share</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
