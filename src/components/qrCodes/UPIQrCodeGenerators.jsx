import React, { useState, useEffect } from 'react';
import { useTheme } from '../../themeContext';
import { toast, Toaster } from 'react-hot-toast';
import LocalStorageUtils from '../../utils/localStorageUtils';
import { KEYS } from '../../utils/constants';
import QRCodeDisplay from './QRDisplay';
export default function UPIPaymentSettings() {
  const { isDarkMode } = useTheme(); // Use theme context
  const [upi, setUpi] = useState(''); // UPI address
  const [name, setName] = useState(''); // Receiver's name
  const [amount, setAmount] = useState(''); // Amount (optional)
  const [qrData, setQrData] = useState(''); // QR Code Data
  const [size, setSize] = useState(256); // Default QR code size
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('M'); // Default error correction level
  const [upiError, setUpiError] = useState(''); // UPI validation error

  // Function to validate the UPI address
  const validateUpiAddress = (upiAddress) => {
    // Regex for either all digits (mobile UPI) or "user@bank"
    const upiPattern = /^[0-9]+$|^[a-zA-Z0-9._]+@[a-zA-Z0-9]+$/;
    return upiPattern.test(upiAddress);
  };

  // Effect to automatically retrieve stored UPI address and receiver's name from localStorage
  useEffect(() => {
    const storedUpi = LocalStorageUtils.getItem(KEYS.UPI_ADDRESS);
    const storedName = LocalStorageUtils.getItem(KEYS.UPI_NAME);

    if (storedUpi) setUpi(storedUpi);
    if (storedName) setName(storedName);
  }, []);

  // Effect to automatically generate the UPI link and update QR code data
  useEffect(() => {
    // Only set the QR code data if UPI address is valid and name is provided
    if (upi && name && !upiError) {
      let upiLink = `upi://pay?pa=${upi}&pn=${name}&cu=INR`;
      if (amount) {
        upiLink += `&am=${amount}`;
      }
      setQrData(upiLink);
    } else {
      setQrData(''); // Clear QR code data if required fields are missing or invalid
    }
  }, [upi, name, amount, upiError]);

  // Handle UPI input change and validate
  const handleUpiChange = (e) => {
    const value = e.target.value;
    setUpi(value);
    if (!validateUpiAddress(value)) {
      setUpiError('Invalid UPI address format. Use either all digits or format user@bank');
    } else {
      setUpiError(''); // Clear error if valid
    }

    // Store valid UPI address in localStorage
    if (validateUpiAddress(value)) {
      LocalStorageUtils.setItem(KEYS.UPI_ADDRESS,value);
    }
  };

  // Handle name change and store in localStorage
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);

    // Store name in localStorage
    LocalStorageUtils.setItem(KEYS.UPI_NAME,value);

  };

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-green-50 text-gray-900'} transition-colors duration-300`}>
      <Toaster /> {/* Toast container */}
      <h1 className="text-3xl font-bold mb-8 text-center">UPI Payment QR Code Generator</h1>

      <div className={`max-w-2xl mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-150 border-gray-300'} border`}>
        {/* UPI Address Input */}
        <div className="mb-4">
          <label className="block font-bold mb-2" htmlFor="upi">Enter UPI Address</label>
          <input
            id="upi"
            value={upi}
            onChange={handleUpiChange}
            placeholder="UPI Address (e.g., someone@upi or 1234567890)"
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
          />
          {/* Display validation error if UPI is invalid */}
          {upiError && (
            <p className="text-red-500 text-sm mt-2">{upiError}</p>
          )}
        </div>

        {/* Receiver's Name Input */}
        <div className="mb-4">
          <label className="block font-bold mb-2" htmlFor="name">Receiver's Name</label>
          <input
            id="name"
            value={name}
            onChange={handleNameChange}
            placeholder="Receiver's Name"
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
          />
        </div>

        {/* Amount Input (Optional) */}
        <div className="mb-4">
          <label className="block font-bold mb-2" htmlFor="amount">Amount (Optional)</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount (optional)"
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
          />
        </div>

        {/* QR Code Size */}
        <div className="mb-4">
          <label className="block font-bold mb-2" htmlFor="size">QR Code Size (px)</label>
          <input
            id="size"
            type="number"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
          />
        </div>

        {/* Error Correction Level */}
        <div className="mb-4">
          <label className="block font-bold mb-2" htmlFor="errorCorrectionLevel">Error Correction Level</label>
          <select
            id="errorCorrectionLevel"
            value={errorCorrectionLevel}
            onChange={(e) => setErrorCorrectionLevel(e.target.value)}
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
          >
            <option value="L">Low (L)</option>
            <option value="M">Medium (M)</option>
            <option value="Q">Quartile (Q)</option>
            <option value="H">High (H)</option>
          </select>
        </div>
      </div>

      {/* QR Code Display */}
      {qrData && !upiError && (
        <QRCodeDisplay
          data={qrData}
          size={parseInt(size)}
          errorCorrectionLevel={errorCorrectionLevel}
          shareTitle="UPI QR"
          shareText={`Paying ${name} (${upi}) ${amount ? ` ₹${amount}` : ''}`} // Conditional sharing text
          headerText='UPI QR code'
        />
      )}
    </div>
  );
}
