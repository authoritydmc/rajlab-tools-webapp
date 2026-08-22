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
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('M');
  const [upiError, setUpiError] = useState('');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fgColor, setFgColor] = useState('#000000');
  const [colorTheme, setColorTheme] = useState('light');

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

    if (qPa) {
      setUpi(qPa);
      if (!validateUpiAddress(qPa)) {
        setUpiError('Invalid UPI address format. Use either all digits or format user@bank');
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
      setUpiError('Invalid UPI address format. Use either all digits or format user@bank');
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
        theme: colorTheme !== 'light' ? colorTheme : undefined,
        bg: colorTheme === 'custom' ? bgColor.replace('#', '') : undefined,
        fg: colorTheme === 'custom' ? fgColor.replace('#', '') : undefined,
      }}
    >
      <div className={`w-full mx-auto p-6 shadow-lg rounded-2xl ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'} border`}>
        <div className="mb-4">
          <label className="block font-bold mb-2 text-sm sm:text-base" htmlFor="upi">
            Enter UPI Address / VPA <span className="text-red-500">*</span>
          </label>
          <input
            id="upi"
            value={upi}
            onChange={handleUpiChange}
            placeholder="UPI Address (e.g., someone@upi or 1234567890)"
            className={`w-full p-2.5 border rounded-xl font-mono text-sm ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'}`}
          />
          {upiError && <p className="text-red-500 text-sm mt-2">{upiError}</p>}
        </div>

        {/* Receiver's Name Input (Optional) */}
        <div className="mb-4">
          <label className="block font-bold mb-2 text-sm sm:text-base" htmlFor="name">
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
          <label className="block font-bold mb-2 text-sm sm:text-base" htmlFor="amount">Amount (Optional)</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in INR (optional)"
            className={`w-full p-2.5 border rounded-xl ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'}`}
          />
        </div>

        {/* QR Code Size */}
        <div className="mb-4">
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

      {/* QR Code Display with Color Themes */}
      {qrData && !upiError && (
        <QRCodeDisplay
          data={qrData}
          size={parseInt(size) || 256}
          errorCorrectionLevel={errorCorrectionLevel}
          shareTitle="UPI QR"
          shareText={`Paying ${name} (${upi}) ${amount ? ` ₹${amount}` : ''}`}
          headerText="UPI QR code"
          bgColor={bgColor}
          fgColor={fgColor}
          colorTheme={colorTheme}
          onColorChange={({ bg, fg, theme }) => { setBgColor(bg); setFgColor(fg); setColorTheme(theme); }}
        />
      )}
    </ToolPageLayout>
  );
}
