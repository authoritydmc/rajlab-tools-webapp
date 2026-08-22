import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../../themeContext';
import { toast, Toaster } from 'react-hot-toast';
import { FaRupeeSign } from 'react-icons/fa';
import LocalStorageUtils from '../../utils/localStorageUtils';
import { KEYS } from '../../utils/constants';
import QRCodeDisplay from './QRDisplay';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

export default function UPIPaymentSettings() {
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const [upi, setUpi] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [qrData, setQrData] = useState('');
  const [size, setSize] = useState(256);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('H');
  const [upiError, setUpiError] = useState('');
  
  // Customization States with UPI Defaults
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fgColor, setFgColor] = useState('#000000');
  const [colorTheme, setColorTheme] = useState('light');
  const [logo, setLogo] = useState('upi'); // default to UPI logo
  const [dotStyle, setDotStyle] = useState('rounded');
  const [cornerSquareStyle, setCornerSquareStyle] = useState('extra-rounded');
  const [cornerDotStyle, setCornerDotStyle] = useState('dot');
  const [frame, setFrame] = useState('banner-bottom'); // default to Bottom Banner
  const [frameText, setFrameText] = useState('SCAN & PAY');
  const [frameColor, setFrameColor] = useState('#0f172a');

  const validateUpiAddress = (upiAddress) => {
    const upiPattern = /^[0-9]+$|^[a-zA-Z0-9._]+@[a-zA-Z0-9]+$/;
    return upiPattern.test(upiAddress);
  };

  useEffect(() => {
    const qPa = searchParams.get('pa') || searchParams.get('upi') || searchParams.get('vpa');
    const qPn = searchParams.get('pn') || searchParams.get('name');
    const qAm = searchParams.get('am') || searchParams.get('amount');
    const qSize = searchParams.get('size') || searchParams.get('s');
    const bgParam = searchParams.get('bg') || searchParams.get('bgColor');
    const fgParam = searchParams.get('fg') || searchParams.get('fgColor');
    const themeParam = searchParams.get('theme') || searchParams.get('colorTheme');
    const logoParam = searchParams.get('logo') || searchParams.get('icon');
    const frameParam = searchParams.get('frame');
    const frameTxtParam = searchParams.get('frameText') || searchParams.get('cta');
    const frameColParam = searchParams.get('frameColor') || searchParams.get('fc');

    if (qPa) {
      setUpi(qPa);
      if (!validateUpiAddress(qPa)) {
        setUpiError('Invalid UPI address format. Use format user@bank or digits');
      }
    } else {
      const storedUpi = LocalStorageUtils.getItem(KEYS.UPI_ADDRESS);
      if (storedUpi) setUpi(storedUpi);
    }

    if (qPn) {
      setName(qPn);
    } else {
      const storedName = LocalStorageUtils.getItem(KEYS.UPI_NAME);
      if (storedName) setName(storedName);
    }

    if (qAm) setAmount(qAm);
    if (qSize && !isNaN(qSize)) setSize(Number(qSize));

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
    if (frameParam) setFrame(frameParam);
    if (frameTxtParam) setFrameText(frameTxtParam);
    if (frameColParam) setFrameColor(frameColParam.startsWith('#') ? frameColParam : `#${frameColParam}`);
  }, [searchParams]);

  useEffect(() => {
    if (upi && !upiError) {
      let upiLink = `upi://pay?pa=${encodeURIComponent(upi)}&cu=INR`;
      if (name && name.trim()) {
        upiLink += `&pn=${encodeURIComponent(name.trim())}`;
      }
      if (amount) {
        upiLink += `&am=${encodeURIComponent(amount)}`;
      }
      setQrData(upiLink);
    } else {
      setQrData('');
    }
  }, [upi, name, amount, upiError]);

  const handleUpiChange = (e) => {
    const value = e.target.value;
    setUpi(value);
    if (!validateUpiAddress(value)) {
      setUpiError('Invalid UPI address format. Use format user@bank or digits');
    } else {
      setUpiError('');
    }

    if (validateUpiAddress(value)) {
      LocalStorageUtils.setItem(KEYS.UPI_ADDRESS, value);
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    LocalStorageUtils.setItem(KEYS.UPI_NAME, value);
  };

  const siblings = useCategorySiblings('/upi-code-generator');

  return (
    <ToolPageLayout 
      title="UPI QR Code Generator" 
      icon={<FaRupeeSign />} 
      breadcrumb={[{ label: 'QR Codes', path: '/qr-code-generator' }]} 
      siblings={siblings} 
      currentPath="/upi-code-generator"
      activeParams={{ 
        pa: upi, 
        pn: name || undefined, 
        am: amount || undefined, 
        size,
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

        {/* Responsive Side-by-Side on LG/XL screens, Top-Down on Mobile/Tablet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Input Form (5 cols on lg/xl) */}
          <div className={`lg:col-span-5 p-6 shadow-lg rounded-2xl ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'} border`}>
            <h3 className={`text-base font-bold mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              Payment Details
            </h3>

            <div className="mb-4">
              <label className="block font-bold mb-2 text-sm" htmlFor="upi">
                Enter UPI Address / VPA <span className="text-red-500">*</span>
              </label>
              <input
                id="upi"
                value={upi}
                onChange={handleUpiChange}
                placeholder="UPI Address (e.g., someone@upi or 1234567890)"
                className={`w-full p-2.5 border rounded-xl font-mono text-sm ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'}`}
              />
              {upiError && <p className="text-red-500 text-xs mt-1.5">{upiError}</p>}
            </div>

            {/* Receiver's Name Input (Optional) */}
            <div className="mb-4">
              <label className="block font-bold mb-2 text-sm" htmlFor="name">
                Receiver's Name <span className="text-xs font-normal text-slate-400">(Optional)</span>
              </label>
              <input
                id="name"
                value={name}
                onChange={handleNameChange}
                placeholder="Payee or Business Name (optional)"
                className={`w-full p-2.5 border rounded-xl ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'}`}
              />
            </div>

            {/* Amount Input (Optional) */}
            <div className="mb-4">
              <label className="block font-bold mb-2 text-sm" htmlFor="amount">Amount in INR (Optional)</label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (e.g. 250, 500)"
                className={`w-full p-2.5 border rounded-xl ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'}`}
              />
            </div>

            {/* QR Code Size */}
            <div>
              <label className="block font-bold mb-2 text-sm" htmlFor="size">QR Code Size (px)</label>
              <input
                id="size"
                type="number"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className={`w-full p-2.5 border rounded-xl ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'}`}
              />
            </div>
          </div>

          {/* Right Column: Branded QR Display & Customizer (7 cols on lg/xl) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {qrData && !upiError ? (
              <QRCodeDisplay
                data={qrData}
                size={parseInt(size) || 256}
                errorCorrectionLevel="H"
                shareTitle="UPI QR"
                shareText={`Paying ${name || 'Merchant'} (${upi}) ${amount ? ` ₹${amount}` : ''}`}
                headerText="UPI Payment QR Code"
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
                  if (c.bg) setBgColor(c.bg);
                  if (c.fg) setFgColor(c.fg);
                  if (c.theme) setColorTheme(c.theme);
                  if (c.logo) setLogo(c.logo);
                  if (c.dotStyle) setDotStyle(c.dotStyle);
                  if (c.cornerSquareStyle) setCornerSquareStyle(c.cornerSquareStyle);
                  if (c.cornerDotStyle) setCornerDotStyle(c.cornerDotStyle);
                  if (c.frame) setFrame(c.frame);
                  if (c.frameText) setFrameText(c.frameText);
                  if (c.frameColor) setFrameColor(c.frameColor);
                }}
              />
            ) : (
              <div className={`p-12 text-center rounded-2xl border flex flex-col items-center justify-center ${
                isDarkMode ? 'bg-slate-900/40 border-slate-800 text-slate-500' : 'bg-white/40 border-slate-200 text-slate-400'
              }`}>
                <FaRupeeSign size={40} className="mb-3 opacity-30" />
                <p className="font-semibold text-sm">Enter a valid UPI address on the left to preview your QR code.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
