import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { FaClipboard, FaDownload, FaShareAlt, FaPrint } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../themeContext';

export default function QRCodeDisplay({
  data,
  size,
  errorCorrectionLevel,
  shareTitle = 'QR Code',
  shareText = '',
  showHeader = true,
  headerText = "Generated QR Code"
}) {
  const { isDarkMode } = useTheme();
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

  // Function to print the QR code
  const handlePrint = () => {
    const canvas = qrRef.current.querySelector('canvas'); // Reference to the QR code canvas
    if (canvas) {
      const printWindow = window.open('', '_blank'); // Open a new window for printing
      printWindow.document.write('<html><head><title>Print QR Code</title>');
      printWindow.document.write('<style>body { text-align: center; font-family: Arial, sans-serif; }</style>'); // Add styles for print
      printWindow.document.write('</head><body>');
      printWindow.document.write('<h2>' + shareTitle + '</h2>'); // Print header
      printWindow.document.write('<img src="' + canvas.toDataURL() + '" />'); // Print QR Code
      printWindow.document.write('<p>' + shareText + '</p>'); // Print share text
  
      // Adding a footer
      const currentUrl = window.location.href; // Get current URL
      printWindow.document.write('<footer style="margin-top: 20px; font-size: 12px; color: gray;">'); // Footer styling
      printWindow.document.write('Printed from: <a href="' + currentUrl + '">' + currentUrl + '</a>'); // Print footer
      printWindow.document.write('</footer>');
      printWindow.document.write('</body></html>');
      printWindow.document.close(); // Close the document for writing
      printWindow.focus(); // Focus the new window
  
      printWindow.print(); // Trigger print dialog
      // Optionally, you can close the print window after a timeout
      setTimeout(() => printWindow.close(), 5000); // Close the window after 5 seconds
    } else {
      toast.error('Failed to find QR Code for printing.'); // Error message if no canvas is found
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
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
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

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className={`flex items-center p-2 rounded-md ${
                isDarkMode
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              } transition-colors duration-300`}
              title="Print QR Code"
            >
              <FaPrint className="mr-2" /> Print
            </button>
          </div>
        </>
      )}
    </div>
  );
}
