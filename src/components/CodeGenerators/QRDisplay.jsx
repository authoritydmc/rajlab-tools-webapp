import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // Use the QRCodeCanvas from the qrcode.react library
import { FaClipboard, FaDownload, FaShareAlt } from 'react-icons/fa'; // Import additional icons
import { toast } from 'react-hot-toast'; // For showing toast notifications
import { useTheme } from '../../themeContext'; // Use theme context

export default function QRCodeDisplay({ 
  data, 
  size, 
  errorCorrectionLevel, 
  shareTitle = 'My QR Code', // Default title for sharing
  shareText = 'Here is my QR Code.', // Default text for sharing
  showHeader = true ,// Control to show or hide header
  headerText="Generated QR Code"
}) {
  const { isDarkMode } = useTheme(); // Get the theme mode
  const qrRef = useRef(null); // Reference to the QRCodeCanvas

  // Function to copy QR code data to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(data);
    toast.success('QR Code data copied to clipboard!');
  };

  // Function to download the QR code as an image
  const handleDownload = () => {
    const canvas = qrRef.current.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qr-code.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR Code downloaded successfully!');
    } else {
      toast.error('Failed to download QR Code.');
    }
  };

  // Function to share the QR code image using the Web Share API
  const handleShare = async () => {
    try {
      const canvas = qrRef.current.querySelector('canvas');
      if (!canvas) throw new Error('Canvas not found');

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Failed to convert QR Code to Blob');

        const file = new File([blob], 'qr-code.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: shareTitle,
            text: shareText,
          });
          toast.success('QR Code shared successfully!');
        } else {
          toast.error('Sharing not supported on this device.');
        }
      }, 'image/png');
    } catch (error) {
      console.error(error);
      toast.error('Failed to share QR Code.');
    }
  };

  return (
    <div
      className={`max-w-2xl mx-auto mt-8 p-6 shadow-lg rounded-md ${
        isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-green-50 text-gray-900 border-gray-300'
      } text-center`}
    >
      {/* Conditionally render header */}
      {showHeader && <h2 className="text-2xl font-bold mb-4">{headerText}</h2>}

      {/* Display instruction if no data */}
      {!data ? (
        <p className="text-gray-500">Please input the data; the QR code will auto-generate and refresh.</p>
      ) : (
        <>
          {/* QR Code Canvas */}
          <div
            className="flex justify-center mb-4 p-4 rounded-md"
            ref={qrRef} // Attach the ref to this div
          >
            <QRCodeCanvas
              value={data}
              size={size}
              level={errorCorrectionLevel} // Set error correction level
              includeMargin={true} // Add some margin around the QR code
              bgColor={isDarkMode ? '#1f2937' : '#ffffff'} // Set background color for QR code based on theme
              fgColor={isDarkMode ? '#ffffff' : '#000000'} // Set foreground color for QR code (QR code itself)
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            {/* Copy Button */}
            <button
              onClick={handleCopyToClipboard}
              className={`flex items-center p-2 rounded-md ${
                isDarkMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-500 text-white hover:bg-green-600'
              } transition-colors duration-300`}
              title="Copy QR Code Data"
            >
              <FaClipboard className="mr-2" /> Copy
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className={`flex items-center p-2 rounded-md ${
                isDarkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } transition-colors duration-300`}
              title="Download QR Code"
            >
              <FaDownload className="mr-2" /> Download
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className={`flex items-center p-2 rounded-md ${
                isDarkMode
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              } transition-colors duration-300`}
              title="Share QR Code"
            >
              <FaShareAlt className="mr-2" /> Share
            </button>
          </div>
        </>
      )}
    </div>
  );
}
