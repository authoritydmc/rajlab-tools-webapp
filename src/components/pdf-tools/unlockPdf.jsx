import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useTheme } from '../../themeContext';
import { FaFilePdf, FaDownload, FaUpload, FaUnlockAlt, FaEye, FaExternalLinkAlt, FaFile } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import { triggerChaiModal } from '../../chaiModalContext';
import { pdfjsLib } from '../../utils/pdfWorker';

export default function UnlockPdfTool() {
  const { isDarkMode } = useTheme();
  const [pdfFile, setPdfFile] = useState(null);
  const [password, setPassword] = useState('');
  const [unlockedPdfUrl, setUnlockedPdfUrl] = useState(null);
  const [unlockedPdfSize, setUnlockedPdfSize] = useState(null);
  const [unlockedNumPages, setUnlockedNumPages] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadFilename, setDownloadFilename] = useState('unlocked_document.pdf');

  useEffect(() => {
    return () => {
      if (unlockedPdfUrl) URL.revokeObjectURL(unlockedPdfUrl);
    };
  }, [unlockedPdfUrl]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }
    if (unlockedPdfUrl) URL.revokeObjectURL(unlockedPdfUrl);
    setPdfFile(file);
    setUnlockedPdfUrl(null);
    setUnlockedPdfSize(null);
    setUnlockedNumPages(0);
    setPassword('');
    setDownloadFilename(`unlocked_${file.name.replace('.pdf', '')}.pdf`);
  };

  const handleUnlock = async () => {
    if (!pdfFile) {
      toast.error('Please upload a valid PDF.');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Unlocking PDF...');
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      // pdf-lib does NOT support decrypting password-protected PDFs — it only has ignoreEncryption.
      // We use pdfjs-dist (which has full decryption for all standard handlers: RC4/AES 128/256) to
      // validate the password and render the decrypted content, then rebuild an unencrypted PDF
      // with pdf-lib. This preserves visual fidelity for statements/bank PDFs.
      let pdfDocProxy = null;
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: data.slice(0),
          password: password || undefined,
          isEvalSupported: true,
          useWorkerFetch: false,
        });
        pdfDocProxy = await loadingTask.promise;
      } catch (loadErr) {
        console.error('Unlock error:', loadErr);
        const msg = (loadErr?.message || '').toLowerCase();
        const name = loadErr?.name || '';
        const code = loadErr?.code;
        const isPasswordErr = name === 'PasswordException' || msg.includes('password') || msg.includes('encrypted') || code === 1 || code === 2;
        if (isPasswordErr) {
          if (code === 2 || msg.includes('incorrect')) {
            throw new Error('Incorrect password. Please check caps lock and try again.');
          }
          if (code === 1 || !password) {
            throw new Error('This PDF is password-protected. Please enter the password.');
          }
          throw new Error('Incorrect password. Please try again.');
        }
        throw loadErr;
      }

      // Try vector-preserving shortcut: pdfjs getData() after successful decryption.
      // For some PDFs getData() returns decrypted bytes that pdf-lib can save without re-rasterizing.
      // If it still fails we fall through to the raster pipeline.
      try {
        if (typeof pdfDocProxy.getData === 'function') {
          const rawData = await pdfDocProxy.getData();
          if (rawData && rawData.length > 0) {
            const testDoc = await PDFDocument.load(rawData, { ignoreEncryption: false });
            const vectorBytes = await testDoc.save();
            const blob = new Blob([vectorBytes], { type: 'application/pdf' });
            if (unlockedPdfUrl) URL.revokeObjectURL(unlockedPdfUrl);
            const url = URL.createObjectURL(blob);
            setUnlockedPdfUrl(url);
            setUnlockedPdfSize(vectorBytes.length);
            setUnlockedNumPages(pdfDocProxy.numPages || testDoc.getPageCount());
            try { pdfDocProxy.destroy(); } catch {}
            toast.dismiss(toastId);
            toast.success('PDF unlocked successfully!');
            return;
          }
        }
      } catch (vectorErr) {
        // fall through to raster — expected for most encrypted PDFs
        console.warn('Vector shortcut failed, using raster fallback:', vectorErr?.message);
      }

      // Raster fallback: render each page via pdfjs canvas and embed as JPEG in a new pdf-lib doc
      // This works for every encryption handler (RC4/AES) because pdfjs already decrypted the stream.
      const newPdf = await PDFDocument.create();
      const numPages = pdfDocProxy.numPages;
      for (let i = 1; i <= numPages; i++) {
        toast.loading(`Rendering page ${i} of ${numPages}...`, { id: toastId });
        const page = await pdfDocProxy.getPage(i);
        const viewport1 = page.getViewport({ scale: 1 });
        // 2x scale for print-quality output (balance quality vs memory)
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        // eslint-disable-next-line no-await-in-loop
        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const base64 = dataUrl.split(',')[1];
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let j = 0; j < len; j++) bytes[j] = binary.charCodeAt(j);
        // eslint-disable-next-line no-await-in-loop
        const jpg = await newPdf.embedJpg(bytes);
        const pdfPage = newPdf.addPage([viewport1.width, viewport1.height]);
        pdfPage.drawImage(jpg, { x: 0, y: 0, width: viewport1.width, height: viewport1.height });
        if (page.cleanup) page.cleanup();
      }

      const newPdfBytes = await newPdf.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      if (unlockedPdfUrl) URL.revokeObjectURL(unlockedPdfUrl);
      const url = URL.createObjectURL(blob);
      setUnlockedPdfUrl(url);
      setUnlockedPdfSize(newPdfBytes.length);
      setUnlockedNumPages(numPages);
      try { pdfDocProxy.destroy(); } catch {}
      toast.dismiss(toastId);
      toast.success(`PDF unlocked successfully! ${numPages} page(s) decrypted.`);
    } catch (error) {
      console.error('Unlock error:', error);
      toast.dismiss(toastId);
      const msg = (error?.message || '').toLowerCase();
      if (msg.includes('incorrect password') || msg.includes('password-protected')) {
        toast.error(error.message);
      } else if (msg.includes('password')) {
        toast.error('Incorrect password. Please try again.');
      } else if (msg.includes('encrypted')) {
        toast.error('Failed to decrypt PDF. Try re-entering the password.');
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
                  onKeyDown={(e) => { if (e.key === 'Enter' && !isProcessing) handleUnlock(); }}
                  className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                />
                <p className="text-xs mt-2 text-gray-500">Note: You must know the password to unlock the file permanently. Works for RC4 & AES 128/256 encrypted statements.</p>
              </div>

              <button
                onClick={handleUnlock}
                disabled={isProcessing}
                className={`px-8 py-3 flex items-center gap-2 rounded-md font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
              >
                <FaUnlockAlt /> {isProcessing ? 'Unlocking...' : 'Unlock PDF'}
              </button>

              {unlockedPdfUrl && (
                <div className={`w-full p-4 rounded-xl border ${
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
                        {unlockedPdfSize ? formatFileSize(unlockedPdfSize) : 'Calculating...'}
                      </div>
                    </div>
                  </div>

                  <a
                    href={unlockedPdfUrl}
                    download={downloadFilename.endsWith('.pdf') ? downloadFilename : `${downloadFilename}.pdf`}
                    onClick={() => setTimeout(() => triggerChaiModal('Unlock PDF'), 600)}
                    className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-600/25 transition-all"
                  >
                    <FaDownload /> Download Unlocked PDF
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Live preview — must be shown when unlocked data exists */}
          {unlockedPdfUrl && (
            <div className={`mt-6 rounded-2xl border overflow-hidden shadow-lg ${isDarkMode ? 'bg-slate-900/70 border-slate-700/60 backdrop-blur-xl' : 'bg-white border-slate-200'}`}>
              <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b ${isDarkMode ? 'border-slate-700/60 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <FaEye className="text-indigo-500" /> Preview — Unlocked PDF
                  {unlockedNumPages ? <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">{unlockedNumPages} {unlockedNumPages === 1 ? 'page' : 'pages'}</span> : null}
                </h3>
                <div className="flex items-center gap-2">
                  <a
                    href={unlockedPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-white' : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'}`}
                  >
                    <FaExternalLinkAlt size={11} /> Open in new tab
                  </a>
                  <a
                    href={unlockedPdfUrl}
                    download={(pdfFile?.name?.replace(/\.pdf$/i, '') || 'document') + '_unlocked.pdf'}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                  >
                    <FaDownload size={11} /> Download
                  </a>
                </div>
              </div>
              <div className="w-full bg-white">
                <iframe
                  src={unlockedPdfUrl}
                  title="Unlocked PDF preview"
                  className="w-full border-0"
                  style={{ height: '72vh', minHeight: '520px' }}
                />
              </div>
              <p className={`text-[11px] text-center px-4 py-2 border-t ${isDarkMode ? 'text-slate-400 border-slate-800 bg-slate-900/40' : 'text-slate-500 border-slate-200 bg-slate-50'}`}>
                Live preview rendered from the decrypted file. If the iframe is blank in your browser, use <span className="font-semibold">Open in new tab</span> or <span className="font-semibold">Download</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
