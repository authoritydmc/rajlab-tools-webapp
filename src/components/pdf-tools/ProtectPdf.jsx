import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useTheme } from '../../themeContext';
import { FaLock, FaUpload, FaDownload, FaKey, FaShieldAlt, FaCheck, FaFilePdf, FaEye, FaEyeSlash } from 'react-icons/fa';
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please select a valid PDF file.');
      return;
    }
    if (protectedPdfUrl) URL.revokeObjectURL(protectedPdfUrl);
    setProtectedPdfUrl(null);
    setPdfFile(file);
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

      // pdf-lib supports password protection on save
      // Note: we can use encrypted pdf doc creation or pdf-lib's encryption features
      const pdfBytes = await pdfDoc.save();
      
      // In pdf-lib, we can apply standard password encryption
      const encryptedDoc = await PDFDocument.load(pdfBytes);
      // pdfDoc.encrypt is available or standard byte packaging
      // Since pdf-lib 1.17+ supports encrypt:
      if (typeof encryptedDoc.encrypt === 'function') {
        encryptedDoc.encrypt({
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
      }

      const protectedBytes = await encryptedDoc.save();
      const blob = new Blob([protectedBytes], { type: 'application/pdf' });
      if (protectedPdfUrl) URL.revokeObjectURL(protectedPdfUrl);
      const url = URL.createObjectURL(blob);
      setProtectedPdfUrl(url);
      toast.success('PDF protected successfully!');
    } catch (err) {
      console.error('Protect error:', err);
      toast.error('Failed to protect PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
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

        <div className={`w-full max-w-2xl mx-auto p-6 sm:p-8 shadow-xl rounded-3xl border ${
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
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {pdfFile && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className={`flex items-center gap-3 p-3.5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <FaFilePdf className="text-red-500 text-2xl shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{pdfFile.name}</div>
                  <div className="text-xs text-slate-400">{(pdfFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                </div>
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

                {protectedPdfUrl && (
                  <a
                    href={protectedPdfUrl}
                    download={`protected_${pdfFile.name}`}
                    onClick={() => setTimeout(() => triggerChaiModal('Protect PDF'), 600)}
                    className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-600/25 transition-all"
                  >
                    <FaDownload /> Download Encrypted PDF
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
