import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useTheme } from '../../themeContext';
import { FaLock, FaUpload, FaDownload, FaKey, FaShieldAlt, FaCheck, FaFilePdf, FaEye, FaEyeSlash, FaFile, FaTimes } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import { triggerChaiModal } from '../../chaiModalContext';

export default function ProtectPdf() {
  const { isDarkMode } = useTheme();
  const [pdfFile, setPdfFile] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [protectedPdfUrl, setProtectedPdfUrl] = useState(null);
  const [protectedPdfSize, setProtectedPdfSize] = useState(null);
  const [downloadFilename, setDownloadFilename] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (protectedPdfUrl) URL.revokeObjectURL(protectedPdfUrl);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [protectedPdfUrl, previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please select a valid PDF file.');
      return;
    }
    if (protectedPdfUrl) URL.revokeObjectURL(protectedPdfUrl);
    setProtectedPdfUrl(null);
    setProtectedPdfSize(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setShowPreview(false);
    setPdfFile(file);
    setDownloadFilename(`protected_${file.name.replace('.pdf', '')}.pdf`);
  };

  const handleProtect = async () => {
    if (!pdfFile) {
      toast.error('Please upload a PDF file.');
      return;
    }
    if (!password) {
      toast.error('Please enter a password to protect your PDF.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsProcessing(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      // Use pdf-lib's encrypt method directly
      pdfDoc.encrypt({
        userPassword: password,
        ownerPassword: password,
        permissions: {
          printing: 'highResolution',
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: true,
          contentAccessibility: true,
        }
      });

      const protectedBytes = await pdfDoc.save();
      const blob = new Blob([protectedBytes], { type: 'application/pdf' });
      
      if (protectedPdfUrl) URL.revokeObjectURL(protectedPdfUrl);
      const url = URL.createObjectURL(blob);
      setProtectedPdfUrl(url);
      setProtectedPdfSize(protectedBytes.length);
      
      // Create preview URL
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
      setShowPreview(true);
      
      toast.success('PDF protected successfully!');
    } catch (err) {
      console.error('Protect error:', err);
      toast.error('Failed to protect PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (protectedPdfUrl) URL.revokeObjectURL(protectedPdfUrl);
    setProtectedPdfUrl(null);
    setProtectedPdfSize(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setShowPreview(false);
    setPassword('');
    setConfirmPassword('');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const siblings = useCategorySiblings('/protect-pdf');

  return (
    <ToolPageLayout
      title="Protect PDF (Add Password)"
      icon={<FaShieldAlt />}
      breadcrumb={[{ label: 'PDF Tools', path: '/protect-pdf' }]}
      siblings={siblings}
      currentPath="/protect-pdf"
    >
      <div className="w-full">
        <Toaster />

        <div className={`w-full max-w-4xl mx-auto p-6 sm:p-8 shadow-xl rounded-3xl border ${
          isDarkMode ? 'bg-slate-900/70 border-slate-700/60 backdrop-blur-xl' : 'bg-white/80 border-slate-200/70 backdrop-blur-xl'
        }`}>
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <FaLock size={24} />
            </div>
            <h2 className="text-xl font-bold mb-1">Encrypt & Password Protect PDF</h2>
            <p className="text-sm text-slate-400">
              Set strong password protection on your PDF document completely offline and securely in your browser.
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <label className={`cursor-pointer px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold transition-all shadow-lg ${
              isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
            }`}>
              <FaUpload /> {pdfFile ? 'Change PDF File' : 'Select PDF File'}
              <input 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </label>
          </div>

          {pdfFile && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className={`flex items-center gap-3 p-3.5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <FaFilePdf className="text-red-500 text-2xl shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate">{pdfFile.name}</div>
                  <div className="text-xs text-slate-400">Original: {formatFileSize(pdfFile.size)}</div>
                </div>
                <button
                  onClick={() => {
                    setPdfFile(null);
                    handleReset();
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                  title="Remove file"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Set Document Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter strong password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat password..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 pt-2">
                <button
                  onClick={handleProtect}
                  disabled={!password || password !== confirmPassword || isProcessing}
                  className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaShieldAlt /> {isProcessing ? 'Encrypting PDF...' : 'Protect & Encrypt PDF'}
                </button>
              </div>

              {protectedPdfUrl && (
                <div className={`mt-6 p-5 rounded-2xl border animate-fade-in ${
                  isDarkMode ? 'bg-emerald-900/20 border-emerald-700/50' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="flex items-center gap-2 mb-4">
                    <FaCheck className="text-emerald-500" />
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">PDF Protected Successfully!</span>
                  </div>

                  {/* Preview Section */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Preview
                      </label>
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          showPreview 
                            ? 'bg-indigo-600 text-white' 
                            : isDarkMode 
                              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                      </button>
                    </div>
                    
                    {showPreview && previewUrl && (
                      <div className={`rounded-xl overflow-hidden border ${
                        isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-100'
                      }`}>
                        <iframe
                          src={previewUrl}
                          className="w-full h-96"
                          title="PDF Preview"
                        />
                      </div>
                    )}
                  </div>

                  {/* Download Section */}
                  <div className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-300'
                  }`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                          Filename
                        </label>
                        <div className="flex items-center gap-2">
                          <FaFile className="text-slate-400" />
                          <input
                            type="text"
                            value={downloadFilename}
                            onChange={(e) => setDownloadFilename(e.target.value)}
                            className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                          File Size
                        </label>
                        <div className={`px-3 py-2 rounded-lg border text-sm font-mono ${
                          isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                        }`}>
                          {protectedPdfSize ? formatFileSize(protectedPdfSize) : 'Calculating...'}
                        </div>
                      </div>
                    </div>

                    <a
                      href={protectedPdfUrl}
                      download={downloadFilename.endsWith('.pdf') ? downloadFilename : `${downloadFilename}.pdf`}
                      onClick={() => setTimeout(() => triggerChaiModal('Protect PDF'), 600)}
                      className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-600/25 transition-all"
                    >
                      <FaDownload /> Download Encrypted PDF
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
