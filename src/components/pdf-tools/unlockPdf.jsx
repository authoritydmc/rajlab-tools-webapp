import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useTheme } from '../../themeContext';
import { FaFilePdf, FaDownload, FaUpload, FaUnlockAlt } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

export default function UnlockPdfTool() {
  const { isDarkMode } = useTheme();
  const [pdfFile, setPdfFile] = useState(null);
  const [password, setPassword] = useState('');
  const [unlockedPdfUrl, setUnlockedPdfUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (unlockedPdfUrl) URL.revokeObjectURL(unlockedPdfUrl);
    };
  }, [unlockedPdfUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }
    if (unlockedPdfUrl) URL.revokeObjectURL(unlockedPdfUrl);
    setPdfFile(file);
    setUnlockedPdfUrl(null);
    setPassword('');
  };

  const handleUnlock = async () => {
    if (!pdfFile) {
      toast.error('Please upload a valid PDF.');
      return;
    }

    setIsProcessing(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { 
        password: password || undefined,
        ignoreEncryption: !password 
      });

      const newPdfBytes = await pdf.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      if (unlockedPdfUrl) URL.revokeObjectURL(unlockedPdfUrl);
      const url = URL.createObjectURL(blob);
      setUnlockedPdfUrl(url);
      toast.success('PDF unlocked successfully!');
    } catch (error) {
      console.error('Unlock error:', error);
      if (error.message && error.message.includes('encrypted')) {
        toast.error('Incorrect password or file is heavily encrypted.');
      } else {
        toast.error(`Unlock failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const siblings = useCategorySiblings('/unlock-pdf');
  return (
    <ToolPageLayout title="Unlock PDF" icon={<FaUnlockAlt />} breadcrumb={[{label: 'PDF Tools', path: '/unlock-pdf'}]} siblings={siblings} currentPath="/unlock-pdf">
      <div className="w-full">
        <Toaster />

        <div className={`w-full mx-auto p-6 shadow-lg rounded-md border ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'}`}>
          <p className="mb-4 text-center">Remove password security from your PDF file so you don't have to enter it again.</p>

          <div className="flex justify-center mb-6">
            <label className={`cursor-pointer px-6 py-3 rounded-md flex items-center gap-2 transition-colors ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
              <FaUpload /> Select PDF file
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {pdfFile && (
            <div className="flex flex-col items-center gap-6">
              <div className={`flex items-center gap-3 p-3 rounded border w-full ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <FaFilePdf className="text-red-500 text-2xl" />
                <div className="font-medium truncate max-w-[250px]">{pdfFile.name}</div>
              </div>

              <div className="w-full">
                <label className="block mb-2 font-medium">Password (if required to open):</label>
                <input
                  type="password"
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                />
                <p className="text-xs mt-2 text-gray-500">Note: You must know the password to unlock the file permanently.</p>
              </div>

              <button
                onClick={handleUnlock}
                disabled={isProcessing}
                className={`px-8 py-3 flex items-center gap-2 rounded-md font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
              >
                <FaUnlockAlt /> {isProcessing ? 'Unlocking...' : 'Unlock PDF'}
              </button>

              {unlockedPdfUrl && (
                <a
                  href={unlockedPdfUrl}
                  download="unlocked_document.pdf"
                  onClick={(e) => e.stopPropagation()}
                  className={`flex items-center gap-2 px-6 py-3 rounded-md transition-colors ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
                >
                  <FaDownload /> Download Unlocked PDF
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
