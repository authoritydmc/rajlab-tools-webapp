import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useTheme } from '../../themeContext';
import { 
  FaFilePdf, FaUpload, FaDownload, FaFont, FaSignature, 
  FaSquare, FaEraser, FaSearchPlus, FaSearchMinus, FaTrash,
  FaArrowLeft, FaArrowRight, FaUndo, FaCheck, FaTimes, FaHighlighter
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import { triggerChaiModal } from '../../chaiModalContext';
import { pdfjsLib } from '../../utils/pdfWorker';
import SignatureModal from './SignatureModal';

export default function PdfEditor() {
  const { isDarkMode } = useTheme();
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDocProxy, setPdfDocProxy] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  // Active Tool: 'select' | 'text' | 'signature' | 'whiteout' | 'highlight' | 'draw'
  const [activeTool, setActiveTool] = useState('select');
  
  // Annotation state per page: { [pageNum]: Array<Annotation> }
  const [annotations, setAnnotations] = useState({});
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);

  // Styling controls
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState('#000000');
  
  // Signature Modal state
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  // Canvas ref for PDF page background
  const canvasRef = useRef(null);
  const pageContainerRef = useRef(null);
  const [pageDimensions, setPageDimensions] = useState({ width: 600, height: 800 });

  // Freehand drawing on page
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawPath, setCurrentDrawPath] = useState([]);

  // Dragging / Resizing state
  const [dragState, setDragState] = useState(null);

  // Cleanup download URL on unmount
  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  // Load PDF file into PDF.js proxy
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

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setPdfDocProxy(pdf);
      setNumPages(pdf.numPages);
      toast.success(`PDF loaded: ${pdf.numPages} pages.`);
    } catch (err) {
      console.error('PDF load error:', err);
      toast.error('Failed to load PDF. It might be corrupted or encrypted.');
      setPdfFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Render current page onto canvas
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

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Page render error:', err);
        }
      }
    };

    renderPage();

    return () => {
      if (renderTask) renderTask.cancel();
    };
  }, [pdfDocProxy, currentPage, zoom]);

  // Add Annotation handlers
  const handleCanvasClick = (e) => {
    if (activeTool === 'select' || activeTool === 'draw') return;
    if (!pageContainerRef.current) return;

    const rect = pageContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const newId = Date.now().toString();

    if (activeTool === 'text') {
      const newAnn = {
        id: newId,
        type: 'text',
        x,
        y,
        text: 'Type text here...',
        fontSize: fontSize,
        color: textColor,
        width: 160,
        height: 32,
      };
      addAnnotationToPage(currentPage, newAnn);
      setSelectedAnnotationId(newId);
      setActiveTool('select');
    } else if (activeTool === 'whiteout') {
      const newAnn = {
        id: newId,
        type: 'whiteout',
        x,
        y,
        width: 120,
        height: 30,
        color: '#FFFFFF',
      };
      addAnnotationToPage(currentPage, newAnn);
      setSelectedAnnotationId(newId);
      setActiveTool('select');
    } else if (activeTool === 'highlight') {
      const newAnn = {
        id: newId,
        type: 'highlight',
        x,
        y,
        width: 140,
        height: 24,
        color: 'rgba(254, 240, 138, 0.5)', // Yellow highlight
      };
      addAnnotationToPage(currentPage, newAnn);
      setSelectedAnnotationId(newId);
      setActiveTool('select');
    }
  };

  const addAnnotationToPage = (pageNum, ann) => {
    setAnnotations(prev => ({
      ...prev,
      [pageNum]: [...(prev[pageNum] || []), ann]
    }));
  };

  const updateAnnotation = (id, updates) => {
    setAnnotations(prev => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).map(a => a.id === id ? { ...a, ...updates } : a)
    }));
  };

  const deleteAnnotation = (id) => {
    setAnnotations(prev => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).filter(a => a.id !== id)
    }));
    if (selectedAnnotationId === id) setSelectedAnnotationId(null);
  };

  // Add signature from modal
  const handleSaveSignature = (dataUrl) => {
    const newId = Date.now().toString();
    const newAnn = {
      id: newId,
      type: 'signature',
      x: 50,
      y: 50,
      width: 150,
      height: 60,
      dataUrl: dataUrl
    };
    addAnnotationToPage(currentPage, newAnn);
    setSelectedAnnotationId(newId);
    setActiveTool('select');
  };

  // Freehand drawing handlers
  const handleDrawStart = (e) => {
    if (activeTool !== 'draw') return;
    setIsDrawing(true);
    const rect = pageContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setCurrentDrawPath([[x, y]]);
  };

  const handleDrawMove = (e) => {
    if (!isDrawing || activeTool !== 'draw') return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setCurrentDrawPath(prev => [...prev, [x, y]]);
  };

  const handleDrawEnd = () => {
    if (!isDrawing || activeTool !== 'draw') return;
    setIsDrawing(false);
    if (currentDrawPath.length > 1) {
      const newId = Date.now().toString();
      const newAnn = {
        id: newId,
        type: 'draw',
        path: currentDrawPath,
        color: textColor,
        strokeWidth: 2,
      };
      addAnnotationToPage(currentPage, newAnn);
    }
    setCurrentDrawPath([]);
  };

  // Dragging annotations
  const handleMouseDownOnAnnotation = (e, ann) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    setSelectedAnnotationId(ann.id);
    setDragState({
      id: ann.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: ann.x,
      origY: ann.y
    });
  };

  const handleMouseMoveGlobal = (e) => {
    if (!dragState) return;
    const deltaX = (e.clientX - dragState.startX) / zoom;
    const deltaY = (e.clientY - dragState.startY) / zoom;
    updateAnnotation(dragState.id, {
      x: Math.max(0, dragState.origX + deltaX),
      y: Math.max(0, dragState.origY + deltaY)
    });
  };

  const handleMouseUpGlobal = () => {
    if (dragState) setDragState(null);
  };

  // Export edited PDF with pdf-lib
  const handleExportPdf = async () => {
    if (!pdfFile) return;

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

        // Match PDF coordinates (PDF origin is bottom-left, browser is top-left)
        for (const ann of pageAnns) {
          if (ann.type === 'text') {
            const hex = ann.color.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16) / 255 || 0;
            const g = parseInt(hex.substring(2, 4), 16) / 255 || 0;
            const b = parseInt(hex.substring(4, 6), 16) / 255 || 0;

            page.drawText(ann.text, {
              x: ann.x,
              y: pdfHeight - ann.y - (ann.fontSize || 16),
              size: ann.fontSize || 16,
              font: helveticaFont,
              color: rgb(r, g, b)
            });
          } else if (ann.type === 'signature') {
            try {
              const signatureImage = await pdfDoc.embedPng(ann.dataUrl);
              page.drawImage(signatureImage, {
                x: ann.x,
                y: pdfHeight - ann.y - ann.height,
                width: ann.width,
                height: ann.height
              });
            } catch (err) {
              console.error('Signature embed error:', err);
            }
          } else if (ann.type === 'whiteout') {
            page.drawRectangle({
              x: ann.x,
              y: pdfHeight - ann.y - ann.height,
              width: ann.width,
              height: ann.height,
              color: rgb(1, 1, 1)
            });
          } else if (ann.type === 'highlight') {
            page.drawRectangle({
              x: ann.x,
              y: pdfHeight - ann.y - ann.height,
              width: ann.width,
              height: ann.height,
              color: rgb(0.99, 0.94, 0.54),
              opacity: 0.4
            });
          } else if (ann.type === 'draw' && ann.path?.length > 1) {
            const hex = (ann.color || '#000000').replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16) / 255 || 0;
            const g = parseInt(hex.substring(2, 4), 16) / 255 || 0;
            const b = parseInt(hex.substring(4, 6), 16) / 255 || 0;

            for (let i = 0; i < ann.path.length - 1; i++) {
              const [p1x, p1y] = ann.path[i];
              const [p2x, p2y] = ann.path[i + 1];
              page.drawLine({
                start: { x: p1x, y: pdfHeight - p1y },
                end: { x: p2x, y: pdfHeight - p2y },
                thickness: ann.strokeWidth || 2,
                color: rgb(r, g, b)
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
      toast.success('PDF exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPageAnnotations = annotations[currentPage] || [];
  const siblings = useCategorySiblings('/pdf-editor');

  return (
    <ToolPageLayout
      title="PDF Editor & Signer Studio"
      icon={<FaFilePdf />}
      breadcrumb={[{ label: 'PDF Tools', path: '/pdf-editor' }]}
      siblings={siblings}
      currentPath="/pdf-editor"
    >
      <div 
        className="w-full flex flex-col gap-4 select-none"
        onMouseMove={handleMouseMoveGlobal}
        onMouseUp={handleMouseUpGlobal}
      >
        <Toaster />

        {/* TOP TOOLBAR */}
        <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-lg ${
          isDarkMode ? 'bg-slate-900/80 border-slate-700/60 backdrop-blur-xl' : 'bg-white/80 border-slate-200/80 backdrop-blur-xl'
        }`}>
          {/* File input & page navigation */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className={`cursor-pointer px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}>
              <FaUpload /> {pdfFile ? 'Change PDF' : 'Upload PDF'}
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </label>

            {numPages > 0 && (
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-2 rounded-lg border border-slate-700 disabled:opacity-30 hover:bg-slate-500/10 text-xs"
                  title="Previous Page"
                >
                  <FaArrowLeft />
                </button>
                <span className="text-xs font-semibold px-2">
                  Page {currentPage} of {numPages}
                </span>
                <button
                  disabled={currentPage >= numPages}
                  onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                  className="p-2 rounded-lg border border-slate-700 disabled:opacity-30 hover:bg-slate-500/10 text-xs"
                  title="Next Page"
                >
                  <FaArrowRight />
                </button>
              </div>
            )}
          </div>

          {/* Tools palette (active only when file loaded) */}
          {pdfFile && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveTool('select')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTool === 'select'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Select & Move Tool"
              >
                Select
              </button>

              <button
                onClick={() => setActiveTool('text')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTool === 'text'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Add Text to PDF"
              >
                <FaFont /> Text
              </button>

              <button
                onClick={() => setIsSignatureModalOpen(true)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Sign PDF"
              >
                <FaSignature /> Sign
              </button>

              <button
                onClick={() => setActiveTool('whiteout')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTool === 'whiteout'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Whiteout / Erase Content"
              >
                <FaEraser /> Whiteout
              </button>

              <button
                onClick={() => setActiveTool('highlight')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTool === 'highlight'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Highlight Area"
              >
                <FaHighlighter /> Highlight
              </button>

              <button
                onClick={() => setActiveTool('draw')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTool === 'draw'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Freehand Draw / Annotate"
              >
                Draw
              </button>

              {/* Zoom controls */}
              <div className="flex items-center gap-1 ml-2 border-l border-slate-700/50 pl-2">
                <button
                  onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}
                  className="p-2 rounded-lg hover:bg-slate-500/10 text-xs"
                  title="Zoom Out"
                >
                  <FaSearchMinus />
                </button>
                <span className="text-xs font-medium w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
                  className="p-2 rounded-lg hover:bg-slate-500/10 text-xs"
                  title="Zoom In"
                >
                  <FaSearchPlus />
                </button>
              </div>
            </div>
          )}

          {/* Export / Download button */}
          {pdfFile && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPdf}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                <FaDownload /> {isProcessing ? 'Processing...' : 'Apply & Save PDF'}
              </button>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={`edited_${pdfFile.name || 'document.pdf'}`}
                  onClick={() => setTimeout(() => triggerChaiModal('PDF Editor'), 600)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition-all"
                >
                  Download
                </a>
              )}
            </div>
          )}
        </div>

        {/* MAIN WORKSPACE CANVAS */}
        {!pdfFile ? (
          <div className={`flex flex-col items-center justify-center p-16 rounded-3xl border-2 border-dashed ${
            isDarkMode ? 'border-slate-800 bg-slate-900/30 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'
          }`}>
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
            {/* Page container with canvas and overlays */}
            <div
              ref={pageContainerRef}
              onClick={handleCanvasClick}
              onMouseDown={handleDrawStart}
              onMouseMove={handleDrawMove}
              onMouseUp={handleDrawEnd}
              style={{
                width: pageDimensions.width,
                height: pageDimensions.height,
                position: 'relative',
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
                cursor: activeTool === 'draw' ? 'crosshair' : activeTool === 'select' ? 'default' : 'crosshair'
              }}
              className="bg-white"
            >
              {/* PDF Background Canvas */}
              <canvas ref={canvasRef} className="block pointer-events-none" />

              {/* Freehand active draw line */}
              {isDrawing && currentDrawPath.length > 1 && (
                <svg
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                  }}
                >
                  <polyline
                    points={currentDrawPath.map(([x, y]) => `${x * zoom},${y * zoom}`).join(' ')}
                    fill="none"
                    stroke={textColor}
                    strokeWidth={2 * zoom}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}

              {/* Rendered Annotations & Overlays */}
              {currentPageAnnotations.map((ann) => {
                const isSelected = selectedAnnotationId === ann.id;

                if (ann.type === 'text') {
                  return (
                    <div
                      key={ann.id}
                      onMouseDown={(e) => handleMouseDownOnAnnotation(e, ann)}
                      style={{
                        position: 'absolute',
                        left: ann.x * zoom,
                        top: ann.y * zoom,
                        transform: 'none',
                        cursor: 'move',
                        zIndex: 10
                      }}
                      className={`p-1 group rounded border ${
                        isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-transparent hover:border-indigo-300'
                      }`}
                    >
                      <input
                        type="text"
                        value={ann.text}
                        onChange={(e) => updateAnnotation(ann.id, { text: e.target.value })}
                        style={{
                          fontSize: `${(ann.fontSize || 16) * zoom}px`,
                          color: ann.color || '#000000',
                          backgroundColor: 'transparent',
                          outline: 'none',
                          border: 'none',
                          minWidth: '100px'
                        }}
                      />
                      {isSelected && (
                        <div className="absolute -top-7 right-0 flex items-center gap-1 bg-slate-900 text-white rounded p-1 shadow-lg text-[10px]">
                          <button onClick={() => deleteAnnotation(ann.id)} className="text-red-400 hover:text-red-300 p-0.5">
                            <FaTrash size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                if (ann.type === 'signature') {
                  return (
                    <div
                      key={ann.id}
                      onMouseDown={(e) => handleMouseDownOnAnnotation(e, ann)}
                      style={{
                        position: 'absolute',
                        left: ann.x * zoom,
                        top: ann.y * zoom,
                        width: ann.width * zoom,
                        height: ann.height * zoom,
                        cursor: 'move',
                        zIndex: 10
                      }}
                      className={`group rounded border ${
                        isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-transparent hover:border-indigo-300'
                      }`}
                    >
                      <img src={ann.dataUrl} alt="Signature" className="w-full h-full object-contain pointer-events-none" />
                      {isSelected && (
                        <div className="absolute -top-7 right-0 flex items-center gap-1 bg-slate-900 text-white rounded p-1 shadow-lg text-[10px]">
                          <button onClick={() => deleteAnnotation(ann.id)} className="text-red-400 hover:text-red-300 p-0.5">
                            <FaTrash size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                if (ann.type === 'whiteout') {
                  return (
                    <div
                      key={ann.id}
                      onMouseDown={(e) => handleMouseDownOnAnnotation(e, ann)}
                      style={{
                        position: 'absolute',
                        left: ann.x * zoom,
                        top: ann.y * zoom,
                        width: ann.width * zoom,
                        height: ann.height * zoom,
                        backgroundColor: '#FFFFFF',
                        cursor: 'move',
                        zIndex: 9
                      }}
                      className={`border ${
                        isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-7 right-0 flex items-center gap-1 bg-slate-900 text-white rounded p-1 shadow-lg text-[10px]">
                          <button onClick={() => deleteAnnotation(ann.id)} className="text-red-400 hover:text-red-300 p-0.5">
                            <FaTrash size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                if (ann.type === 'highlight') {
                  return (
                    <div
                      key={ann.id}
                      onMouseDown={(e) => handleMouseDownOnAnnotation(e, ann)}
                      style={{
                        position: 'absolute',
                        left: ann.x * zoom,
                        top: ann.y * zoom,
                        width: ann.width * zoom,
                        height: ann.height * zoom,
                        backgroundColor: 'rgba(254, 240, 138, 0.4)',
                        cursor: 'move',
                        zIndex: 8
                      }}
                      className={`border ${
                        isSelected ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-transparent hover:border-amber-400'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-7 right-0 flex items-center gap-1 bg-slate-900 text-white rounded p-1 shadow-lg text-[10px]">
                          <button onClick={() => deleteAnnotation(ann.id)} className="text-red-400 hover:text-red-300 p-0.5">
                            <FaTrash size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                if (ann.type === 'draw' && ann.path?.length > 1) {
                  return (
                    <svg
                      key={ann.id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 9
                      }}
                    >
                      <polyline
                        points={ann.path.map(([x, y]) => `${x * zoom},${y * zoom}`).join(' ')}
                        fill="none"
                        stroke={ann.color || '#000000'}
                        strokeWidth={(ann.strokeWidth || 2) * zoom}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  );
                }

                return null;
              })}
            </div>
          </div>
        )}

        {/* Signature Creation Modal */}
        <SignatureModal
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          onSaveSignature={handleSaveSignature}
        />
      </div>
    </ToolPageLayout>
  );
}
