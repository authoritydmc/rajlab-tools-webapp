import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../../themeContext';
import toast, { Toaster } from 'react-hot-toast';
import { FaWhatsapp } from 'react-icons/fa';
import { loadQRPrefs, saveQRPrefs } from '../../utils/qrPrefs';
import QRCodeDisplay from './QRDisplay';
import CountryCodeDropdown from '../common/countryCodeSelector';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

export default function WhatsAppQr() {
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const [countryCode, setCountryCode] = useState('91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [qrData, setQrData] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  // Customization States with WhatsApp Defaults
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fgColor, setFgColor] = useState('#000000');
  const [colorTheme, setColorTheme] = useState('light');
  const [logo, setLogo] = useState('whatsapp'); // default WhatsApp logo
  const [dotStyle, setDotStyle] = useState('dots');
  const [cornerSquareStyle, setCornerSquareStyle] = useState('dot');
  const [cornerDotStyle, setCornerDotStyle] = useState('dot');
  const [frame, setFrame] = useState('banner-bottom');
  const [frameText, setFrameText] = useState('CHAT ON WHATSAPP');
  const [frameColor, setFrameColor] = useState('#25D366'); // WhatsApp green

  const size = 256;
  const validatePhoneNumber = (number) => /^[0-9]{7,15}$/.test(number);

  useEffect(() => {
    const qPhone = searchParams.get('phone') || searchParams.get('number') || searchParams.get('p');
    const qCode = searchParams.get('code') || searchParams.get('cc') || searchParams.get('country');
    const qMsg = searchParams.get('message') || searchParams.get('msg') || searchParams.get('text');
    const bgParam = searchParams.get('bg') || searchParams.get('bgColor');
    const fgParam = searchParams.get('fg') || searchParams.get('fgColor');
    const themeParam = searchParams.get('theme') || searchParams.get('colorTheme');
    const logoParam = searchParams.get('logo') || searchParams.get('icon');
    const dotsParam = searchParams.get('dotStyle') || searchParams.get('dots') || searchParams.get('pattern');
    const eyeParam = searchParams.get('eyeFrame') || searchParams.get('corner') || searchParams.get('eye') || searchParams.get('cornerSquareStyle');
    const eyeDotParam = searchParams.get('cornerDotStyle');
    const frameParam = searchParams.get('frame');
    const frameTxtParam = searchParams.get('frameText') || searchParams.get('cta');
    const frameColParam = searchParams.get('frameColor') || searchParams.get('fc');
    const hasCustomQuery = Boolean(bgParam || fgParam || themeParam || logoParam || dotsParam || eyeParam || eyeDotParam || frameParam || frameTxtParam || frameColParam);

    if (qCode) setCountryCode(qCode);
    if (qPhone) {
      setPhoneNumber(qPhone);
      if (!validatePhoneNumber(qPhone)) {
        setPhoneError('Invalid phone number. Enter 7-15 digits.');
      }
    }
    if (qMsg) setMessage(qMsg);

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
    if (eyeDotParam) setCornerDotStyle(eyeDotParam);
    if (frameParam) setFrame(frameParam);
    if (frameTxtParam) setFrameText(frameTxtParam);
    if (frameColParam) setFrameColor(frameColParam.startsWith('#') ? frameColParam : `#${frameColParam}`);

    if (!hasCustomQuery) {
      const saved = loadQRPrefs();
      if (saved) {
        if (saved.bgColor && !bgParam) setBgColor(saved.bgColor);
        if (saved.fgColor && !fgParam) setFgColor(saved.fgColor);
        if (saved.colorTheme && !themeParam && !bgParam && !fgParam) {
          setColorTheme(saved.colorTheme);
          if (saved.colorTheme === 'custom' && saved.bgColor) { setBgColor(saved.bgColor); setFgColor(saved.fgColor || '#000000'); }
        }
        if (saved.logo && !logoParam) setLogo(saved.logo);
        if (saved.dotStyle && !dotsParam) setDotStyle(saved.dotStyle);
        if (saved.cornerSquareStyle && !eyeParam) setCornerSquareStyle(saved.cornerSquareStyle);
        if (saved.cornerDotStyle && !eyeDotParam) setCornerDotStyle(saved.cornerDotStyle);
        if (saved.frame && !frameParam) setFrame(saved.frame);
        if (saved.frameText && !frameTxtParam) setFrameText(saved.frameText);
        if (saved.frameColor && !frameColParam) setFrameColor(saved.frameColor);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (validatePhoneNumber(phoneNumber)) {
      const encodedMessage = encodeURIComponent(message);
      const waLink = `https://wa.me/${countryCode}${phoneNumber}${message ? `?text=${encodedMessage}` : ''}`;
      setQrData(waLink);
    } else {
      setQrData('');
    }
  }, [countryCode, phoneNumber, message]);

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);

    if (!validatePhoneNumber(value)) {
      setPhoneError('Invalid phone number. Enter 7-15 digits.');
    } else {
      setPhoneError('');
    }
  };

  const handleCountryCodeChange = (e) => {
    const value = e.target.value;
    setCountryCode(value);
  };

  const handleSendMessage = () => {
    if (qrData) {
      window.open(qrData, '_blank');
    } else {
      toast.error('Please enter a valid phone number to send a message.');
    }
  };

  const siblings = useCategorySiblings('/whatsapp-qr-code');

  return (
    <ToolPageLayout 
      title="WhatsApp QR Code" 
      icon={<FaWhatsapp />} 
      breadcrumb={[{ label: 'QR Codes', path: '/qr-code-generator' }]} 
      siblings={siblings} 
      currentPath="/whatsapp-qr-code"
      activeParams={{ 
        code: countryCode, 
        phone: phoneNumber, 
        message: message || undefined,
        logo: logo !== 'none' ? logo : undefined,
        frame: frame !== 'none' ? frame : undefined,
        frameText: frame !== 'none' ? frameText : undefined,
        theme: colorTheme !== 'light' ? colorTheme : undefined,
        bg: colorTheme === 'custom' ? bgColor.replace('#', '') : undefined,
        fg: colorTheme === 'custom' ? fgColor.replace('#', '') : undefined,
      }}
    >
      <div className="w-full">
        <Toaster />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Form Section (5 cols on lg/xl) */}
          <div className={`lg:col-span-5 p-6 shadow-lg rounded-2xl ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'} border`}>
            <h3 className={`text-base font-bold mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              Chat Configuration
            </h3>

            {/* Country Code and Phone Number Inputs */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-end gap-3">
              {/* Country Code Dropdown */}
              <div className="flex flex-col w-full sm:w-44">
                <CountryCodeDropdown
                  value={countryCode}
                  onChange={handleCountryCodeChange}
                  isDarkMode={isDarkMode}
                />
              </div>
              {/* Phone Number Input */}
              <div className="flex-1">
                <label className="block font-bold mb-2 text-sm" htmlFor="phoneNumber">Phone Number</label>
                <input
                  id="phoneNumber"
                  type="text"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="e.g. 9876543210"
                  className={`w-full p-2.5 border rounded-xl font-mono text-sm ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'}`}
                />
                {phoneError && (
                  <p className="text-red-500 text-xs mt-1.5">{phoneError}</p>
                )}
              </div>
            </div>

            {/* Message Input (Optional) */}
            <div className="mb-4">
              <label className="block font-bold mb-2 text-sm" htmlFor="message">Message (Optional)</label>
              <textarea
                id="message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Pre-filled message text (optional)"
                className={`w-full p-2.5 border rounded-xl resize-none text-sm ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'}`}
              />
            </div>

            {/* Send Message Button */}
            <div className="mb-2">
              <button
                onClick={handleSendMessage}
                disabled={!qrData}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm ${
                  qrData
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md'
                    : 'bg-gray-300 dark:bg-slate-800 text-gray-500 cursor-not-allowed'
                } transition-all duration-200 active:scale-95`}
              >
                Direct WhatsApp Chat
              </button>
            </div>
          </div>

          {/* QR Code Display Section (7 cols on lg/xl) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {qrData && !phoneError ? (
              <QRCodeDisplay
                data={qrData}
                size={size}
                errorCorrectionLevel="H"
                shareTitle={`WhatsApp QR ${countryCode}${phoneNumber}`}
                shareText={`Message to ${countryCode}${phoneNumber}${message ? `: ${message}` : ''}`}
                headerText={`WhatsApp Direct Chat QR`}
                visibleButtons={{ copy: true, download: true, share: true, print: true }}
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
                onCustomizationChange={(c) => {
                  const next = {};
                  if (c.bg) { setBgColor(c.bg); next.bgColor = c.bg; }
                  if (c.fg) { setFgColor(c.fg); next.fgColor = c.fg; }
                  if (c.theme) { setColorTheme(c.theme); next.colorTheme = c.theme; }
                  if (c.logo) { setLogo(c.logo); next.logo = c.logo; }
                  if (c.dotStyle) { setDotStyle(c.dotStyle); next.dotStyle = c.dotStyle; }
                  if (c.cornerSquareStyle) { setCornerSquareStyle(c.cornerSquareStyle); next.cornerSquareStyle = c.cornerSquareStyle; }
                  if (c.cornerDotStyle) { setCornerDotStyle(c.cornerDotStyle); next.cornerDotStyle = c.cornerDotStyle; }
                  if (c.frame) { setFrame(c.frame); next.frame = c.frame; }
                  if (c.frameText) { setFrameText(c.frameText); next.frameText = c.frameText; }
                  if (c.frameColor) { setFrameColor(c.frameColor); next.frameColor = c.frameColor; }
                  if (Object.keys(next).length) saveQRPrefs(next);
                }}
              />
            ) : (
              <div className={`p-12 text-center rounded-2xl border flex flex-col items-center justify-center ${
                isDarkMode ? 'bg-slate-900/40 border-slate-800 text-slate-500' : 'bg-white/40 border-slate-200 text-slate-400'
              }`}>
                <FaWhatsapp size={40} className="mb-3 opacity-30" />
                <p className="font-semibold text-sm">Enter a phone number on the left to generate your WhatsApp QR code.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}