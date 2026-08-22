import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../../themeContext';
import toast, { Toaster } from 'react-hot-toast';
import { FaWhatsapp } from 'react-icons/fa';
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
  const [errorCorrectionLevel] = useState('H');
  const [phoneError, setPhoneError] = useState('');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fgColor, setFgColor] = useState('#000000');
  const [colorTheme, setColorTheme] = useState('light');

  const size = 256;
  const validatePhoneNumber = (number) => /^[0-9]{7,15}$/.test(number);

  useEffect(() => {
    const qPhone = searchParams.get('phone') || searchParams.get('number') || searchParams.get('p');
    const qCode = searchParams.get('code') || searchParams.get('cc') || searchParams.get('country');
    const qMsg = searchParams.get('message') || searchParams.get('msg') || searchParams.get('text');
    const bgParam = searchParams.get('bg') || searchParams.get('bgColor');
    const fgParam = searchParams.get('fg') || searchParams.get('fgColor');
    const themeParam = searchParams.get('theme') || searchParams.get('colorTheme');

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
        message,
        theme: colorTheme !== 'light' ? colorTheme : undefined,
        bg: colorTheme === 'custom' ? bgColor.replace('#', '') : undefined,
        fg: colorTheme === 'custom' ? fgColor.replace('#', '') : undefined,
      }}
    >
      <div className="w-full">
        <Toaster />
        <div className={`w-full mx-auto p-6 shadow-lg rounded-2xl ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'} border`}>
          <div className="flex flex-col lg:flex-row lg:space-x-8">
            {/* Form Section */}
            <div className="flex-1">
              {/* Country Code and Phone Number Inputs */}
              <div className="mb-6 flex flex-col lg:flex-row lg:items-end">
                {/* Country Code Dropdown */}
                <div className="flex flex-col w-48 mr-0 lg:mr-4 mb-4 lg:mb-0">
                  <CountryCodeDropdown
                    value={countryCode}
                    onChange={handleCountryCodeChange}
                    isDarkMode={isDarkMode}
                  />
                </div>
                {/* Phone Number Input */}
                <div className="flex-1">
                  <label className="block font-bold mb-2" htmlFor="phoneNumber">Phone Number</label>
                  <input
                    id="phoneNumber"
                    type="text"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="Enter phone number"
                    className={`w-full p-2.5 border rounded-xl font-mono text-sm ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'}`}
                  />
                  {phoneError && (
                    <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                  )}
                </div>
              </div>

              {/* Message Input (Optional) */}
              <div className="mb-6">
                <label className="block font-bold mb-2" htmlFor="message">Message (Optional)</label>
                <input
                  id="message"
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter message (optional)"
                  className={`w-full p-2.5 border rounded-xl ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'}`}
                />
              </div>

              {/* Send Message Button */}
              <div className="mb-4">
                <button
                  onClick={handleSendMessage}
                  disabled={!qrData}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold ${
                    qrData
                      ? 'bg-green-500 text-white hover:bg-green-600 shadow-md'
                      : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                  } transition-all duration-200 active:scale-95`}
                >
                  Send Message on WhatsApp
                </button>
              </div>
            </div>

            {/* QR Code Display Section with Theme Colors */}
            <div className="flex-1 mt-8 lg:mt-0">
              {qrData && !phoneError ? (
                <QRCodeDisplay
                  data={qrData}
                  size={size}
                  errorCorrectionLevel={errorCorrectionLevel}
                  shareTitle={`WhatsApp QR ${countryCode}${phoneNumber}`}
                  shareText={`Message to ${countryCode}${phoneNumber}${message ? `: ${message}` : ''}`}
                  headerText={`WhatsApp QR ${countryCode}${phoneNumber}`}
                  visibleButtons={{ copy: true, download: true, share: true, print: true }}
                  bgColor={bgColor}
                  fgColor={fgColor}
                  colorTheme={colorTheme}
                  onColorChange={({ bg, fg, theme }) => { setBgColor(bg); setFgColor(fg); setColorTheme(theme); }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <h2 className="text-xl font-semibold mb-4">
                    Your WhatsApp QR code will appear here!
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Enter a phone number to generate your instant QR code.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}