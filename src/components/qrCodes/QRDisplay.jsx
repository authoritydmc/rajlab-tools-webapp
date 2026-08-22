import React, { useRef, useState, useEffect } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { FaClipboard, FaDownload, FaShareAlt, FaPrint, FaSun, FaMoon, FaPalette, FaImage, FaShapes, FaBorderAll, FaUpload, FaTrash, FaMagic } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { PRESET_LOGOS, getPresetLogoUrl, detectBrandFromData } from '../../utils/qrLogoPresets';
import { loadQRPrefs, saveQRPrefs, hasQRCustomQueryOverride } from '../../utils/qrPrefs';

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

  // Hover + Click popup for each control tab
  const [openMenu, setOpenMenu] = useState(null); // 'style' | 'patterns' | 'logo' | 'frame' | null
  const [isHoverLocked, setIsHoverLocked] = useState(false);
  const menuTimeoutRef = useRef(null);
  const tabsWrapperRef = useRef(null);
  const popupRef = useRef(null);

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

  // Sync props to state (query / parent driven) – query overrides saved prefs
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

  // Preserve user preferences: load from storage on mount if no query override (fallback for direct QRDisplay usage)
  useEffect(() => {
    if (hasQRCustomQueryOverride()) return;
    const saved = loadQRPrefs();
    if (!saved) return;
    // Only apply saved prefs when initial props still at defaults (avoid clobbering parent-managed query values)
    // We check if current state still equals initial prop default-ish before overwriting
    if (saved.bgColor && bgColor === initialBgColor) setBgColor(saved.bgColor);
    if (saved.fgColor && fgColor === initialFgColor) setFgColor(saved.fgColor);
    if (saved.colorTheme && colorMode === initialColorTheme) setColorMode(saved.colorTheme);
    if (saved.logo && logo === initialLogo) { setLogo(saved.logo); if (saved.logo !== 'none') setIsManualLogoSelection(true); }
    if (saved.dotStyle && dotStyle === initialDotStyle) setDotStyle(saved.dotStyle);
    if (saved.cornerSquareStyle && cornerSquareStyle === initialCornerSquareStyle) setCornerSquareStyle(saved.cornerSquareStyle);
    if (saved.cornerDotStyle && cornerDotStyle === initialCornerDotStyle) setCornerDotStyle(saved.cornerDotStyle);
    if (saved.frame && frame === initialFrame) setFrame(saved.frame);
    if (saved.frameText && frameText === initialFrameText) setFrameText(saved.frameText);
    if (saved.frameColor && frameColor === initialFrameColor) setFrameColor(saved.frameColor);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => () => { if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current); }, []);

  // Close on outside click & Escape for touch/accessibility
  useEffect(() => {
    if (!openMenu) return;
    const handleOutside = (e) => {
      const insideTabs = tabsWrapperRef.current && tabsWrapperRef.current.contains(e.target);
      const insidePopup = popupRef.current && popupRef.current.contains(e.target);
      if (!insideTabs && !insidePopup) {
        setOpenMenu(null);
        setIsHoverLocked(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') { setOpenMenu(null); setIsHoverLocked(false); }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [openMenu]);

  const cancelClose = () => { if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current); };
  const scheduleClose = (delay = 220) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    menuTimeoutRef.current = setTimeout(() => { setOpenMenu(null); setIsHoverLocked(false); }, delay);
  };

  const handleTabEnter = (id) => {
    cancelClose();
    // On desktop hover: open menu unless it's locked open to another tab – still allow switching by hovering
    setOpenMenu(id);
  };
  const handleTabLeave = () => {
    if (!isHoverLocked) scheduleClose(180);
  };
  const handlePopupEnter = () => cancelClose();
  const handlePopupLeave = () => scheduleClose(200);
  const handleTabClick = (id) => {
    cancelClose();
    if (openMenu === id && isHoverLocked) {
      setOpenMenu(null);
      setIsHoverLocked(false);
    } else {
      setOpenMenu(id);
      setIsHoverLocked(true);
    }
  };

  // Notify parent of state changes + persist user preferences
  const notifyChange = (updates) => {
    const merged = {
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
    };
    // Persist (unless this change is driven by a query override – but query params are one-time; saving them is harmless and will be overwritten by future query loads)
    try {
      const toPersist = {};
      if (updates.bg || merged.bg) toPersist.bgColor = updates.bg || merged.bg;
      if (updates.fg || merged.fg) toPersist.fgColor = updates.fg || merged.fg;
      if (updates.theme || merged.theme) toPersist.colorTheme = updates.theme || merged.theme;
      if (updates.dotStyle) toPersist.dotStyle = updates.dotStyle;
      if (updates.cornerSquareStyle) toPersist.cornerSquareStyle = updates.cornerSquareStyle;
      if (updates.cornerDotStyle) toPersist.cornerDotStyle = updates.cornerDotStyle;
      if (updates.logo) {
        // avoid persisting data URLs
        if (typeof updates.logo === 'string' && updates.logo.startsWith('data:') && updates.logo.length > 4096) {
          // skip
        } else {
          toPersist.logo = updates.logo;
        }
      }
      if (updates.frame) toPersist.frame = updates.frame;
      if (updates.frameText) toPersist.frameText = updates.frameText;
      if (updates.frameColor) toPersist.frameColor = updates.frameColor;
      if (Object.keys(toPersist).length) saveQRPrefs(toPersist);
    } catch (_) {}
    if (onCustomizationChange) {
      onCustomizationChange(merged);
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

  // Color Mode Handler - preserve custom colors when switching to custom
  const handleColorModeChange = (mode) => {
    setColorMode(mode);
    let newBg = bgColor;
    let newFg = fgColor;
    if (mode === 'dark') {
      newBg = '#0f172a';
      newFg = '#ffffff';
    } else if (mode === 'light') {
      newBg = '#ffffff';
      newFg = '#000000';
    } else if (mode === 'custom') {
      // Keep current colors – don't reset; if still standard light, keep it, user can pick
      newBg = bgColor;
      newFg = fgColor;
    }
    if (mode !== 'custom') {
      setBgColor(newBg);
      setFgColor(newFg);
    }
    // For custom we keep existing picker values, but still notify theme change
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

  const TABS = [
    { id: 'style', label: 'Color & Theme', icon: FaPalette },
    { id: 'patterns', label: 'Dots & Eyes', icon: FaShapes },
    { id: 'logo', label: 'Brand Logo', icon: FaImage },
    { id: 'frame', label: 'Outer Frame', icon: FaBorderAll },
  ];

  const renderPopupContent = () => {
    if (openMenu === 'style') {
      return (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => handleColorModeChange('light')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                colorMode === 'light'
                  ? 'bg-white text-slate-900 border-slate-300 shadow-sm font-bold'
                  : isDarkMode ? 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600' : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
              }`}
            >
              <FaSun className="text-amber-500" size={12} />
              <span>White BG</span>
            </button>
            <button
              onClick={() => handleColorModeChange('dark')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                colorMode === 'dark'
                  ? 'bg-slate-800 text-white border-slate-600 shadow-sm font-bold'
                  : isDarkMode ? 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white' : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
              }`}
            >
              <FaMoon className="text-indigo-400" size={12} />
              <span>Dark BG</span>
            </button>
            <button
              onClick={() => handleColorModeChange('custom')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                colorMode === 'custom'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm font-bold'
                  : isDarkMode ? 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white' : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
              }`}
            >
              <FaPalette size={12} />
              <span>Custom</span>
            </button>
          </div>

          {colorMode === 'custom' && (
            <div className="flex items-center justify-around gap-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 text-xs">
              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Background:</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => { setBgColor(e.target.value); notifyChange({ bg: e.target.value }); }}
                  className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer bg-transparent p-0.5"
                />
              </label>
              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>QR Color:</span>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => { setFgColor(e.target.value); notifyChange({ fg: e.target.value }); }}
                  className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer bg-transparent p-0.5"
                />
              </label>
            </div>
          )}
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 pt-1">Theme tints the QR background and dots. Use Custom to pick exact brand colors.</p>
        </div>
      );
    }
    if (openMenu === 'patterns') {
      return (
        <div className="space-y-4 text-xs">
          <div>
            <span className="font-semibold block mb-2 text-slate-600 dark:text-slate-300">Data Dot Shape:</span>
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
                  className={`py-2 px-2 rounded-lg border text-center font-medium transition-all active:scale-95 ${
                    dotStyle === item.id 
                      ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-sm' 
                      : isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="font-semibold block mb-2 text-slate-600 dark:text-slate-300">Corner Eye Shape:</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'square', label: 'Square' },
                { id: 'extra-rounded', label: 'Rounded' },
                { id: 'dot', label: 'Circle' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setCornerSquareStyle(item.id); notifyChange({ cornerSquareStyle: item.id }); }}
                  className={`py-2 px-2 rounded-lg border text-center font-medium transition-all active:scale-95 ${
                    cornerSquareStyle === item.id 
                      ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-sm' 
                      : isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Dot shape affects inner data; eye shape affects the three corner finders.</p>
        </div>
      );
    }
    if (openMenu === 'logo') {
      return (
        <div className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Preset Brand Icons:</span>
              <button
                type="button"
                onClick={handleAutoDetectLogo}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                  !isManualLogoSelection
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white border-slate-700' : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
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
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                      isSelected 
                        ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm' 
                        : isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'
                    }`}
                  >
                    {p.iconComponent ? (
                      React.createElement(p.iconComponent, { className: "w-5 h-5" })
                    ) : p.iconUrl ? (
                      <img src={p.iconUrl} alt={p.label} className="w-5 h-5 object-contain" />
                    ) : (
                      <FaTrash size={12} className="my-1 text-slate-500" />
                    )}
                    <span className="text-[10px] truncate max-w-full font-medium">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60">
            <span className="font-semibold block mb-2 text-slate-600 dark:text-slate-300">Upload Custom Image:</span>
            <div className="flex items-center gap-2">
              <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed cursor-pointer font-medium transition-all text-xs ${
                isDarkMode ? 'bg-slate-900/80 border-slate-600 hover:border-indigo-400 text-slate-300' : 'bg-slate-50 border-slate-300 hover:border-indigo-400 text-slate-700'
              }`}>
                <FaUpload size={12} />
                <span>Choose Image File...</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
              {actualLogoUrl && (
                <button
                  onClick={clearLogo}
                  className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/25 border border-red-200 dark:border-red-500/20 transition-all active:scale-95"
                  title="Remove Logo"
                >
                  <FaTrash size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }
    if (openMenu === 'frame') {
      return (
        <div className="space-y-4 text-xs">
          <div>
            <span className="font-semibold block mb-2 text-slate-600 dark:text-slate-300">Frame Style:</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none', label: 'No Frame' },
                { id: 'banner-bottom', label: 'Bottom Banner' },
                { id: 'banner-top', label: 'Top Header' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setFrame(item.id); notifyChange({ frame: item.id }); }}
                  className={`py-2.5 px-2 rounded-xl border font-medium transition-all text-center active:scale-95 ${
                    frame === item.id 
                      ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-sm' 
                      : isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          {frame !== 'none' && (
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700/60">
              <div>
                <label className="font-semibold block mb-1.5 text-slate-600 dark:text-slate-300">Frame Text / Call To Action:</label>
                <input
                  type="text"
                  value={frameText}
                  onChange={(e) => { setFrameText(e.target.value); notifyChange({ frameText: e.target.value }); }}
                  placeholder="e.g. SCAN TO PAY, SCAN ME"
                  className={`w-full p-2.5 rounded-xl border font-semibold text-sm text-center transition-colors ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-600 dark:text-slate-300">Frame Color:</span>
                <input
                  type="color"
                  value={frameColor}
                  onChange={(e) => { setFrameColor(e.target.value); notifyChange({ frameColor: e.target.value }); }}
                  className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer bg-transparent p-0.5"
                />
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
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

      {/* Interactive Customization Tabs – hover to preview, click to lock (touch-friendly) */}
      <div className="w-full max-w-md mb-6 relative" ref={tabsWrapperRef}>
        <div className={`flex items-center p-1 rounded-2xl border text-xs font-semibold select-none ${
          isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = openMenu === tab.id;
            return (
              <div
                key={tab.id}
                className="flex-1"
                onMouseEnter={() => handleTabEnter(tab.id)}
                onMouseLeave={handleTabLeave}
              >
                <button
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  aria-expanded={active}
                  aria-haspopup="dialog"
                  className={`w-full py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
                    active 
                      ? isDarkMode 
                        ? 'bg-indigo-600 text-white shadow-md font-bold' 
                        : 'bg-white text-indigo-700 shadow-sm font-bold border border-slate-200'
                      : isDarkMode 
                        ? 'text-slate-400 hover:text-slate-100 hover:bg-white/5' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white'
                  }`}
                >
                  <Icon size={12} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-[11px]">{tab.label.split(' ')[0]}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Hover Bridge + Popup – high z-index, not clipped by page stacking context */}
        {openMenu && (
          <div
            className="absolute left-0 right-0 top-full pt-2 z-[70]"
            onMouseEnter={handlePopupEnter}
            onMouseLeave={handlePopupLeave}
          >
            <div
              ref={popupRef}
              role="dialog"
              aria-label={`${TABS.find(t=>t.id===openMenu)?.label} settings`}
              className={`rounded-2xl border shadow-2xl p-4 animate-fade-in-up max-h-[min(420px,60vh)] overflow-y-auto overscroll-contain ${
                isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
              {renderPopupContent()}
            </div>
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
