import React, { useState, useEffect } from 'react';
import { useTheme } from '../../themeContext'; // Custom theme context
import { toast, Toaster } from 'react-hot-toast';
import QRCodeDisplay from './QRDisplay'; // QR Code display component
import CountryCodeDropdown from '../common/countryCodeDropdown';

export default function WhatsAppQRGenerator() {
  const { isDarkMode } = useTheme(); // Use theme context
  const [countryCode, setCountryCode] = useState('91'); // Default to India (91)
  const [phoneNumber, setPhoneNumber] = useState(''); // Phone number input
  const [message, setMessage] = useState(''); // Message input
  const [qrData, setQrData] = useState(''); // QR code data
  const [errorCorrectionLevel] = useState('H'); // Fixed to High (H)
  const [phoneError, setPhoneError] = useState(''); // Phone validation error

  // Fixed QR code size
  const size = 256;

  // Validate phone number (must be digits only, 7-15 digits)
  const validatePhoneNumber = (number) => /^[0-9]{7,15}$/.test(number);

  // Generate WhatsApp QR code data when inputs change
  useEffect(() => {
    if (validatePhoneNumber(phoneNumber)) {
      const encodedMessage = encodeURIComponent(message);
      const waLink = `https://wa.me/${countryCode}${phoneNumber}${message ? `?text=${encodedMessage}` : ''}`;
      setQrData(waLink); // Set QR code data
    } else {
      setQrData(''); // Clear QR code data if phone number is invalid
    }
  }, [countryCode, phoneNumber, message]);

  // Handle phone number input and validate it
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);

    if (!validatePhoneNumber(value)) {
      setPhoneError('Invalid phone number. Enter 7-15 digits.');
    } else {
      setPhoneError(''); // Clear error if valid
    }
  };

  // Handle country code input and validate it
  const handleCountryCodeChange = (e) => {
    const value = e.target.value;
    setCountryCode(value);
    // Optional: Add validation for country code if necessary
  };

  // Handle "Send Message on WhatsApp" button click
  const handleSendMessage = () => {
    if (qrData) {
      window.open(qrData, '_blank');
    } else {
      toast.error('Please enter a valid phone number to send a message.');
    }
  };

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-green-50 text-gray-900'} transition-colors duration-300`}>
      <Toaster /> {/* Toast container */}
      <h1 className="text-3xl font-bold mb-8 text-center">WhatsApp QR Code Generator</h1>

      <div className="max-w-5xl mx-auto">
        <div className={`flex flex-col lg:flex-row lg:space-x-8 p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border`}>
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
                  className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
                />
                {/* Show validation error if phone number is invalid */}
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
                className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
              />
            </div>

            {/* Send Message Button */}
            <div className="mb-4">
              <button
                onClick={handleSendMessage}
                disabled={!qrData}
                className={`w-full py-2 px-4 rounded-md font-semibold ${
                  qrData
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                } transition-colors duration-200`}
              >
                Send Message on WhatsApp
              </button>
            </div>
          </div>

      {/* QR Code Display Section */}
<div className="flex-1 mt-8 lg:mt-0">
  {qrData && !phoneError ? (
    <QRCodeDisplay
      data={qrData}
      size={size}
      errorCorrectionLevel={errorCorrectionLevel}
      shareTitle={`WhatsApp QR ${countryCode}${phoneNumber}`}
      shareText={`Message to ${countryCode}${phoneNumber}${message ? `: ${message}` : ''}`} // Conditional sharing text
      headerText={`WhatsApp QR ${countryCode}${phoneNumber}`}
      visibleButtons={{ copy: false, download: false, share: true, print: true }}
    />
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <h2 className="text-2xl font-semibold mb-4">
        Your WhatsApp QR code will appear here!
      </h2>
      <p className="text-lg text-gray-600 mb-6">
        Please enter a valid phone number and optional message. The QR code will be generated automatically based on your input.
      </p>
      <ul className="list-disc list-inside text-gray-500 text-left">
        <li>Ensure the phone number contains 7-15 digits.</li>
        <li>Select the correct country code from the dropdown.</li>
        <li>Optional: Add a message that will pre-fill in WhatsApp.</li>
        <li>The QR code will update in real-time as you type.</li>
      </ul>
    </div>
  )}
</div>

        </div>
      </div>
    </div>
  );
}
