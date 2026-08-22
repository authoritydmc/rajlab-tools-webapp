import { useState, useEffect, useRef, useCallback } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useTheme } from '../../themeContext';
import {
  FaFilePdf, FaUpload, FaDownload, FaFont, FaSignature,
  FaEraser, FaSearchPlus, FaSearchMinus, FaTrash,
  FaArrowLeft, FaArrowRight, FaHighlighter
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import { triggerChaiModal } from '../../chaiModalContext';
import { pdfjsLib } from '../../utils/pdfWorker';
import SignatureModal from './SignatureModal';
import { loadPrefs, savePrefs } from '../../utils/signatureStorage';

function deriveOutputFilename(original, hasSignatures, hasOtherAnnotations) {
  const base = original ? original.replace(/\.pdf$/i, '') : 'document';
  if (hasSignatures) return base + '_signed.pdf';
  if (hasOtherAnnotations) return base + '_edited.pdf';
  return base + '_edited.pdf';
}

export default function PdfEditor() {
  const { isDarkMode } = useTheme();
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDocProxy, setPdfDocProxy] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const [activeTool, setActiveTool] = useState('select');
  const [annotations, setAnnotations] = useState({});
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);

  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState('#000000');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);

  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [pendingSignature, setPendingSignature] = useState(null);
  const [pendingSigSize] = useState({ w: 150, h: 60 });
  const [mousePos, setMousePos] = useState(null);
  const [showFilenameModal, setShowFilenameModal] = useState(false);
  const [outputFilename, setOutputFilename] = useState('');

  const canvasRef = useRef(null);
  const pageContainerRef = useRef(null);
  const [pageDimensions, setPageDimensions] = useState({ width: 600, height: 800 });

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawPath, setCurrentDrawPath] = useState([]);
  const [dragState, setDragState] = useState(null);

  useEffect(() => {
    try {
      const prefs = loadPrefs();
      if (prefs.fontSize) setFontSize(prefs.fontSize);
      if (prefs.textColor) setTextColor(prefs.textColor);
      if (prefs.strokeColor) setStrokeColor(prefs.strokeColor);
      if (prefs.strokeWidth) setStrokeWidth(prefs.strokeWidth);
    } catch (e) { /* localStorage unavailable */ }
  }, []);

  useEffect(() => {
    savePrefs({ fontSize, textColor, strokeColor, strokeWidth });
  }, [fontSize, textColor, strokeColor, strokeWidth]);

  useEffect(() => {
    return () => { if (downloadUrl) URL.revokeObjectURL(downloadUrl); };
  }, [downloadUrl]);

  useEffect(() => {
    if (activeTool === 'select' || activeTool === 'draw') {
      setPendingSignature(null);
    }
  }, [activeTool]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isSignatureModalOpen) {
          setIsSignatureModalOpen(false);
        } else if (activeTool !== 'select') {
          setActiveTool('select');
          setPendingSignature(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, isSignatureModalOpen]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please select a valid PDF file.');
      return;
    }
    setIsProcessing(true);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setPdfFile(file);
    setAnnotations({});
    setSelectedAnnotationId(null);
    setCurrentPage(1);
    setActiveTool('select');
    setPendingSignature(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setPdfDocProxy(pdf);
      setNumPages(pdf.numPages);
      toast.success('PDF loaded: ' + pdf.numPages + ' pages.');
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      const isLocked = msg.includes('password') || msg.includes('encrypted') || msg.includes('locked') || err.code === 1 || err.name === 'PasswordException';
      if (isLocked) {
        toast.custom(() => (
          <div className={`flex flex-col gap-2 p-4 rounded-xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <span className="font-semibold text-sm">This PDF is password-protected</span>
            <span className="text-xs opacity-80">You need to unlock it before editing.</span>
            <a href="/unlock-pdf" className="inline-block mt-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg text-center transition-colors">
              Open Unlock PDF Tool
            </a>
          </div>
        ), { duration: 12000, position: 'top-center' });
      } else {
        toast.error('Failed to load PDF. It might be corrupted or encrypted.');
      }
      setPdfFile(null);
    } finally {
      setIsProcessing(false);
    }
    e.target.value = '';
  };

  useEffect(() => {
    if (!pdfDocProxy) return;
    let renderTask = null;
    const renderPage = async () => {
      try {
        const page = await pdfDocProxy.getPage(currentPage);
        const viewport = page.getViewport({ scale: zoom });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        setPageDimensions({ width: viewport.width, height: viewport.height });
        renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Page render error:', err);
        }
      }
    };
    renderPage();
    return () => { if (renderTask) renderTask.cancel(); };
  }, [pdfDocProxy, currentPage, zoom]);

  const handlePageMouseMove = useCallback((e) => {
    if (!pageContainerRef.current) return;
    if (!['text', 'whiteout', 'highlight', 'signature-place'].includes(activeTool)) {
      if (mousePos) setMousePos(null);
      return;
    }
    const rect = pageContainerRef.current.getBoundingClientRect();
    setMousePos({ x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom });
  }, [activeTool, zoom, mousePos]);

  const handlePageMouseLeave = useCallback(() => { setMousePos(null); }, []);

  const addAnnotationToPage = useCallback((pageNum, ann) => {
    setAnnotations(prev => ({ ...prev, [pageNum]: [...(prev[pageNum] || []), ann] }));
  }, []);

  const updateAnnotation = useCallback((id, updates) => {
    setAnnotations(prev => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).map(a => a.id === id ? { ...a, ...updates } : a)
    }));
  }, [currentPage]);

  const deleteAnnotation = useCallback((id) => {
    setAnnotations(prev => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).filter(a => a.id !== id)
    }));
    if (selectedAnnotationId === id) setSelectedAnnotationId(null);
  }, [currentPage, selectedAnnotationId]);

  const handleCanvasClick = (e) => {
    if (activeTool === 'select' || activeTool === 'draw') return;
    if (!pageContainerRef.current) return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    const newId = Date.now().toString();

    if (activeTool === 'signature-place' && pendingSignature) {
      addAnnotationToPage(currentPage, {
        id: newId, type: 'signature',
        x: x - pendingSigSize.w / 2, y: y - pendingSigSize.h / 2,
        width: pendingSigSize.w, height: pendingSigSize.h,
        dataUrl: pendingSignature
      });
      setSelectedAnnotationId(newId);
      setPendingSignature(null);
      setActiveTool('select');
    } else if (activeTool === 'text') {
      addAnnotationToPage(currentPage, {
        id: newId, type: 'text', x, y,
        text: 'Type text here...', fontSize, color: textColor,
        width: 160, height: 32,
      });
      setSelectedAnnotationId(newId);
      setActiveTool('select');
    } else if (activeTool === 'whiteout') {
      addAnnotationToPage(currentPage, {
        id: newId, type: 'whiteout', x, y,
        width: 120, height: 30, color: '#FFFFFF',
      });
      setSelectedAnnotationId(newId);
      setActiveTool('select');
    } else if (activeTool === 'highlight') {
      addAnnotationToPage(currentPage, {
        id: newId, type: 'highlight', x, y,
        width: 140, height: 24, color: 'rgba(254, 240, 138, 0.5)',
      });
      setSelectedAnnotationId(newId);
      setActiveTool('select');
    }
  };

  const handleSaveSignature = (dataUrl) => {
    setPendingSignature(dataUrl);
    setActiveTool('signature-place');
    toast.success('Click anywhere on the page to place your signature', { icon: '\u{1F446}' });
  };

  const handleDrawStart = (e) => {
    if (activeTool !== 'draw') return;
    setIsDrawing(true);
    const rect = pageContainerRef.current.getBoundingClientRect();
    setCurrentDrawPath([[(e.clientX - rect.left) / zoom, (e.clientY - rect.top) / zoom]]);
  };

  const handleDrawMove = (e) => {
    if (!isDrawing || activeTool !== 'draw') return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    setCurrentDrawPath(prev => [...prev, [(e.clientX - rect.left) / zoom, (e.clientY - rect.top) / zoom]]);
  };

  const handleDrawEnd = () => {
    if (!isDrawing || activeTool !== 'draw') return;
    setIsDrawing(false);
    if (currentDrawPath.length > 1) {
      addAnnotationToPage(currentPage, {
        id: Date.now().toString(), type: 'draw', path: currentDrawPath,
        color: textColor, strokeWidth: strokeWidth,
      });
    }
    setCurrentDrawPath([]);
  };

  const handleMouseDownOnAnnotation = (e, ann) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    setSelectedAnnotationId(ann.id);
    setDragState({
      id: ann.id, startX: e.clientX, startY: e.clientY,
      origX: ann.x, origY: ann.y
    });
  };

  const handleMouseMoveGlobal = (e) => {
    if (!dragState) return;
    updateAnnotation(dragState.id, {
      x: Math.max(0, dragState.origX + (e.clientX - dragState.startX) / zoom),
      y: Math.max(0, dragState.origY + (e.clientY - dragState.startY) / zoom)
    });
  };

  const handleMouseUpGlobal = () => { if (dragState) setDragState(null); };

  const handleExportPdf = () => {
    if (!pdfFile) return;
    const hasSign = Object.values(annotations).some(arr => (arr || []).some(a => a.type === 'signature'));
    const hasOther = Object.values(annotations).some(arr => (arr || []).some(a => a.type !== 'signature'));
    setOutputFilename(deriveOutputFilename(pdfFile.name, hasSign, hasOther));
    setShowFilenameModal(true);
  };

  const handleConfirmExport = async () => {
    setShowFilenameModal(false);
    setIsProcessing(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (let p = 1; p <= pages.length; p++) {
        const pageAnns = annotations[p] || [];
        if (pageAnns.length === 0) continue;
        const page = pages[p - 1];
        const { height: pdfHeight } = page.getSize();

        for (const ann of pageAnns) {
          if (ann.type === 'text') {
            const hex = (ann.color || '#000000').replace('#', '');
            page.drawText(ann.text, {
              x: ann.x, y: pdfHeight - ann.y - (ann.fontSize || 16),
              size: ann.fontSize || 16, font: helveticaFont,
              color: rgb(parseInt(hex.substring(0, 2), 16) / 255 || 0, parseInt(hex.substring(2, 4), 16) / 255 || 0, parseInt(hex.substring(4, 6), 16) / 255 || 0)
            });
          } else if (ann.type === 'signature') {
            try {
              const sig = await pdfDoc.embedPng(ann.dataUrl);
              page.drawImage(sig, { x: ann.x, y: pdfHeight - ann.y - ann.height, width: ann.width, height: ann.height });
            } catch (err) { console.error('Signature embed error:', err); }
          } else if (ann.type === 'whiteout') {
            page.drawRectangle({ x: ann.x, y: pdfHeight - ann.y - ann.height, width: ann.width, height: ann.height, color: rgb(1, 1, 1) });
          } else if (ann.type === 'highlight') {
            page.drawRectangle({ x: ann.x, y: pdfHeight - ann.y - ann.height, width: ann.width, height: ann.height, color: rgb(0.99, 0.94, 0.54), opacity: 0.4 });
          } else if (ann.type === 'draw' && ann.path?.length > 1) {
            const hex = (ann.color || '#000000').replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16) / 255 || 0;
            const g = parseInt(hex.substring(2, 4), 16) / 255 || 0;
            const b = parseInt(hex.substring(4, 6), 16) / 255 || 0;
            for (let i = 0; i < ann.path.length - 1; i++) {
              page.drawLine({
                start: { x: ann.path[i][0], y: pdfHeight - ann.path[i][1] },
                end: { x: ann.path[i + 1][0], y: pdfHeight - ann.path[i + 1][1] },
                thickness: ann.strokeWidth || 2, color: rgb(r, g, b)
              });
            }
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      toast.success('PDF ready for download!');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to process PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const pageCursor =
    activeTool === 'select' ? 'default' :
    activeTool === 'draw' ? 'crosshair' :
    activeTool === 'text' ? 'text' :
    activeTool === 'signature-place' ? 'copy' : 'crosshair';

  const placeHint = (() => {
    if (activeTool === 'signature-place' && pendingSignature) return 'Click on the page to drop your signature';
    if (activeTool === 'text') return 'Click on the page to add text';
    if (activeTool === 'whiteout') return 'Click on the page to place a whiteout box';
    if (activeTool === 'highlight') return 'Click on the page to place a highlight';
    return null;
  })();

  const currentPageAnnotations = annotations[currentPage] || [];
  const hasAnyAnnotations = Object.values(annotations).some(arr => (arr || []).length > 0);
  const siblings = useCategorySiblings('/pdf-editor');

  const toolBtn = (tool, label, icon) => (
    <button
      onClick={() => { setActiveTool(tool); if (tool !== 'signature-place') setPendingSignature(null); }}
      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
        activeTool === tool
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
          : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
      title={label}
    >
      {icon} {label}
    </button>
  );

  return (
    <ToolPageLayout
      title="PDF Editor & Signer Studio"
      icon={<FaFilePdf />}
      breadcrumb={[{ label: 'PDF Tools', path: '/pdf-editor' }]}
      siblings={siblings}
      currentPath="/pdf-editor"
    >
      <div className="w-full flex flex-col gap-4 select-none" onMouseMove={handleMouseMoveGlobal} onMouseUp={handleMouseUpGlobal}>
        <Toaster position="top-center" />

        {showFilenameModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <div className="px-6 py-4 border-b border-slate-700/50">
                <h3 className="text-lg font-bold flex items-center gap-2"><FaDownload className="text-emerald-500" /> Save Your PDF</h3>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">File name:</label>
                  <input type="text" value={outputFilename} onChange={(e) => setOutputFilename(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                </div>
                {downloadUrl ? (
                  <a href={downloadUrl} download={outputFilename || 'document.pdf'}
                    onClick={() => { setShowFilenameModal(false); setTimeout(() => triggerChaiModal('PDF Editor'), 600); }}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <FaDownload /> Download PDF
                  </a>
                ) : (
                  <button onClick={handleConfirmExport} disabled={isProcessing}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                  >
                    <FaDownload /> {isProcessing ? 'Processing...' : 'Generate PDF'}
                  </button>
                )}
              </div>
              <div className={`flex justify-end px-6 py-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <button onClick={() => setShowFilenameModal(false)} className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-lg ${isDarkMode ? 'bg-slate-900/80 border-slate-700/60 backdrop-blur-xl' : 'bg-white/80 border-slate-200/80 backdrop-blur-xl'}`}>
          <div className="flex items-center gap-2 flex-wrap">
            <label className={`cursor-pointer px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
              <FaUpload /> {pdfFile ? 'Change PDF' : 'Upload PDF'}
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </label>
            {numPages > 0 && (
              <div className="flex items-center gap-1.5 ml-2">
                <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-2 rounded-lg border border-slate-700 disabled:opacity-30 hover:bg-slate-500/10 text-xs" title="Previous Page"><FaArrowLeft /></button>
                <span className="text-xs font-semibold px-2">Page {currentPage} of {numPages}</span>
                <button disabled={currentPage >= numPages} onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                  className="p-2 rounded-lg border border-slate-700 disabled:opacity-30 hover:bg-slate-500/10 text-xs" title="Next Page"><FaArrowRight /></button>
              </div>
            )}
          </div>

          {pdfFile && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {toolBtn('select', 'Select', null)}
              {toolBtn('text', 'Text', <FaFont />)}
              <button onClick={() => setIsSignatureModalOpen(true)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTool === 'signature-place'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`} title="Sign PDF">
                <FaSignature /> Sign
              </button>
              {toolBtn('whiteout', 'Whiteout', <FaEraser />)}
              {toolBtn('highlight', 'Highlight', <FaHighlighter />)}
              {toolBtn('draw', 'Draw', null)}
              <div className="flex items-center gap-1 ml-2 border-l border-slate-700/50 pl-2">
                <button onClick={() => setZoom(z => Math.max(0.6, z - 0.2))} className="p-2 rounded-lg hover:bg-slate-500/10 text-xs" title="Zoom Out"><FaSearchMinus /></button>
                <span className="text-xs font-medium w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(2.5, z + 0.2))} className="p-2 rounded-lg hover:bg-slate-500/10 text-xs" title="Zoom In"><FaSearchPlus /></button>
              </div>
            </div>
          )}

          {pdfFile && (
            <button onClick={handleExportPdf} disabled={isProcessing || !hasAnyAnnotations}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
              title={!hasAnyAnnotations ? 'Add some annotations first' : 'Export PDF with all edits'}>
              <FaDownload /> Export PDF
            </button>
          )}
        </div>

        {pdfFile && placeHint && (
          <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border ${isDarkMode ? 'bg-indigo-900/40 border-indigo-700/50 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
            <span className="animate-pulse">{placeHint}</span>
            <span className="opacity-60">| Press Esc to cancel</span>
          </div>
        )}

        {!pdfFile ? (
          <div className={`flex flex-col items-center justify-center p-16 rounded-3xl border-2 border-dashed ${isDarkMode ? 'border-slate-800 bg-slate-900/30 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'}`}>
            <FaFilePdf size={56} className="text-indigo-500 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-200 mb-1">All-in-One PDF Editor</h3>
            <p className="text-sm text-slate-400 max-w-md text-center mb-6">
              Add signatures, stamps, type text, whiteout/erase content, highlight, fill forms, and annotate PDF documents directly in your browser.
            </p>
            <label className="cursor-pointer px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-xl shadow-indigo-600/25 transition-all">
              <FaUpload /> Choose PDF File to Start
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          <div className="flex justify-center overflow-auto p-4 max-h-[80vh] border rounded-2xl border-slate-700/50 bg-slate-950/40">
            <div ref={pageContainerRef} onClick={handleCanvasClick}
              onMouseDown={handleDrawStart}
              onMouseMove={(e) => { handleDrawMove(e); handlePageMouseMove(e); }}
              onMouseUp={handleDrawEnd}
              onMouseLeave={handlePageMouseLeave}
              style={{ width: pageDimensions.width, height: pageDimensions.height, position: 'relative', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)', cursor: pageCursor }}
              className="bg-white">

              <canvas ref={canvasRef} className="block pointer-events-none" />

              {isDrawing && currentDrawPath.length > 1 && (
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                  <polyline points={currentDrawPath.map(([x, y]) => x * zoom + ',' + y * zoom).join(' ')} fill="none" stroke={strokeColor} strokeWidth={strokeWidth * zoom} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}

              {activeTool === 'signature-place' && pendingSignature && mousePos && (
                <img src={pendingSignature} alt="" style={{
                  position: 'absolute',
                  left: mousePos.x * zoom - pendingSigSize.w * zoom / 2,
                  top: mousePos.y * zoom - pendingSigSize.h * zoom / 2,
                  width: pendingSigSize.w * zoom, height: pendingSigSize.h * zoom,
                  opacity: 0.55, pointerEvents: 'none', zIndex: 20,
                  border: '2px dashed #6366f1', borderRadius: 4,
                }} />
              )}

              {activeTool === 'text' && mousePos && (
                <div style={{
                  position: 'absolute', left: mousePos.x * zoom, top: mousePos.y * zoom - 8,
                  fontSize: fontSize * zoom + 'px', color: textColor, opacity: 0.5,
                  pointerEvents: 'none', zIndex: 20,
                  border: '1.5px dashed #6366f1', borderRadius: 4, padding: '2px 6px',
                  whiteSpace: 'nowrap', fontFamily: 'sans-serif',
                }}>Aa</div>
              )}

              {activeTool === 'whiteout' && mousePos && (
                <div style={{
                  position: 'absolute', left: mousePos.x * zoom, top: mousePos.y * zoom,
                  width: 120 * zoom, height: 30 * zoom,
                  backgroundColor: '#ffffff', border: '1.5px dashed #6366f1',
                  borderRadius: 2, pointerEvents: 'none', zIndex: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }} />
              )}

              {activeTool === 'highlight' && mousePos && (
                <div style={{
                  position: 'absolute', left: mousePos.x * zoom, top: mousePos.y * zoom,
                  width: 140 * zoom, height: 24 * zoom,
                  backgroundColor: 'rgba(254, 240, 138, 0.45)', border: '1.5px dashed #f59e0b',
                  borderRadius: 2, pointerEvents: 'none', zIndex: 20,
                }} />
              )}

              {currentPageAnnotations.map((ann) => {
                const isSel = selectedAnnotationId === ann.id;
                const selCls = isSel ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-transparent hover:border-indigo-300';
                const delBtn = isSel && (
                  <div className="absolute -top-7 right-0 flex items-center gap-1 bg-slate-900 text-white rounded p-1 shadow-lg text-[10px]">
                    <button onClick={() => deleteAnnotation(ann.id)} className="text-red-400 hover:text-red-300 p-0.5"><FaTrash size={10} /></button>
                  </div>
                );

                if (ann.type === 'text') {
                  return (
                    <div key={ann.id} onMouseDown={(e) => handleMouseDownOnAnnotation(e, ann)}
                      style={{ position: 'absolute', left: ann.x * zoom, top: ann.y * zoom, cursor: 'move', zIndex: 10 }}
                      className={`p-1 group rounded border ${selCls}`}>
                      <input type="text" value={ann.text} onChange={(e) => updateAnnotation(ann.id, { text: e.target.value })}
                        style={{ fontSize: (ann.fontSize || 16) * zoom + 'px', color: ann.color || '#000000', backgroundColor: 'transparent', outline: 'none', border: 'none', minWidth: '100px' }} />
                      {delBtn}
                    </div>
                  );
                }
                if (ann.type === 'signature') {
                  return (
                    <div key={ann.id} onMouseDown={(e) => handleMouseDownOnAnnotation(e, ann)}
                      style={{ position: 'absolute', left: ann.x * zoom, top: ann.y * zoom, width: ann.width * zoom, height: ann.height * zoom, cursor: 'move', zIndex: 10 }}
                      className={`group rounded border ${selCls}`}>
                      <img src={ann.dataUrl} alt="Signature" className="w-full h-full object-contain pointer-events-none" />
                      {delBtn}
                    </div>
                  );
                }
                if (ann.type === 'whiteout') {
                  return (
                    <div key={ann.id} onMouseDown={(e) => handleMouseDownOnAnnotation(e, ann)}
                      style={{ position: 'absolute', left: ann.x * zoom, top: ann.y * zoom, width: ann.width * zoom, height: ann.height * zoom, backgroundColor: '#FFFFFF', cursor: 'move', zIndex: 9 }}
                      className={`border ${isSel ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-300'}`}>
                      {delBtn}
                    </div>
                  );
                }
                if (ann.type === 'highlight') {
                  return (
                    <div key={ann.id} onMouseDown={(e) => handleMouseDownOnAnnotation(e, ann)}
                      style={{ position: 'absolute', left: ann.x * zoom, top: ann.y * zoom, width: ann.width * zoom, height: ann.height * zoom, backgroundColor: 'rgba(254, 240, 138, 0.4)', cursor: 'move', zIndex: 8 }}
                      className={`border ${isSel ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-transparent hover:border-amber-400'}`}>
                      {delBtn}
                    </div>
                  );
                }
                if (ann.type === 'draw' && ann.path?.length > 1) {
                  return (
                    <svg key={ann.id} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9 }}>
                      <polyline points={ann.path.map(([x, y]) => x * zoom + ',' + y * zoom).join(' ')} fill="none" stroke={ann.color || '#000000'} strokeWidth={(ann.strokeWidth || 2) * zoom} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        <SignatureModal isOpen={isSignatureModalOpen} onClose={() => setIsSignatureModalOpen(false)} onSaveSignature={handleSaveSignature} />
      </div>
    </ToolPageLayout>
  );
}
