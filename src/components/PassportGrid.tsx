import React, { useState, useEffect, useMemo } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import Cropper from './Cropper';
import { useTheme } from '../themeContext';
import Breadcrumbs from './Breadcrumbs';
import passportFormats from '../utils/passportFormats';
import { mmToPoints, mmToPixels } from '../utils/dimensions';
import GridPreview, { PhotoItem } from './GridPreview';
import {
  FaEdit,
  FaDownload,
  FaUndoAlt,
  FaPrint,
  FaSlidersH,
  FaImage,
  FaPlus,
  FaTrash,
  FaCheck,
  FaLayerGroup,
  FaArrowsAltH,
  FaFilePdf,
  FaFileImage,
} from 'react-icons/fa';
import { triggerChaiModal } from '../chaiModalContext';

// Paper sizes in mm
const PAPER_SIZES: Record<string, { widthMm: number; heightMm: number; label: string }> = {
  A4: { widthMm: 210, heightMm: 297, label: 'A4 (210 × 297 mm)' },
  Letter: { widthMm: 215.9, heightMm: 279.4, label: 'US Letter (8.5 × 11 in)' },
  '4x6 in': { widthMm: 101.6, heightMm: 152.4, label: '4 × 6 in Photo Paper' },
};

interface PhotoEntry {
  id: string;
  name: string;
  originalFile: File;
  croppedBlob: Blob | null;
  copies: number;
  brightness: number;
  contrast: number;
  saturation: number;
}

function PassportGrid() {
  const [format, setFormat] = useState('Indian');
  const [paper, setPaper] = useState('A4');
  const [downloadType, setDownloadType] = useState<'pdf' | 'png'>('pdf');

  // Format specifications
  const defaultSpec = passportFormats[format] || { widthMm: 35, heightMm: 45, dpi: 300 };
  const [photoWidthMm, setPhotoWidthMm] = useState(defaultSpec.widthMm);
  const [photoHeightMm, setPhotoHeightMm] = useState(defaultSpec.heightMm);
  const [dpi, setDpi] = useState(defaultSpec.dpi || 300);
  const { isDarkMode } = useTheme();

  // Layout parameters
  const [marginMm, setMarginMm] = useState(5);
  const [spacingMm, setSpacingMm] = useState(2);
  const [bgColor, setBgColor] = useState('#ffffff');

  // Multi-person photo list state
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [isEditingCrop, setIsEditingCrop] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // When standard format changes, sync width/height/dpi
  useEffect(() => {
    const spec = passportFormats[format];
    if (spec) {
      setPhotoWidthMm(spec.widthMm);
      setPhotoHeightMm(spec.heightMm);
      setDpi(spec.dpi || 300);
    }
  }, [format]);

  // Calculate current grid capacity and columns/rows per row on paper
  const gridCapacity = useMemo(() => {
    const paperSpec = PAPER_SIZES[paper];
    const usableW = paperSpec.widthMm - 2 * marginMm + spacingMm;
    const usableH = paperSpec.heightMm - 2 * marginMm + spacingMm;
    const cols = Math.max(1, Math.floor(usableW / (photoWidthMm + spacingMm)));
    const rows = Math.max(1, Math.floor(usableH / (photoHeightMm + spacingMm)));
    const maxCells = cols * rows;
    return { cols, rows, maxCells };
  }, [paper, marginMm, spacingMm, photoWidthMm, photoHeightMm]);

  // Calculate total copies requested across all photos
  const totalCopies = useMemo(() => {
    return photos.reduce((acc, p) => acc + (p.copies || 0), 0);
  }, [photos]);

  // Handle uploading photos (single or batch)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newEntries: PhotoEntry[] = Array.from(e.target.files).map((file, idx) => {
        const id = `photo_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`;
        // Suggest multiple of columns (e.g. fill 1 row by default)
        const defaultCopies = gridCapacity.cols > 0 ? gridCapacity.cols : 5;
        return {
          id,
          name: file.name.replace(/\.[^/.]+$/, ''),
          originalFile: file,
          croppedBlob: null,
          copies: defaultCopies,
          brightness: 100,
          contrast: 100,
          saturation: 100,
        };
      });

      setPhotos((prev) => [...prev, ...newEntries]);
      // Open cropper for the first newly added photo
      setActivePhotoId(newEntries[0].id);
      setIsEditingCrop(true);
      e.target.value = '';
    }
  };

  const activePhoto = useMemo(() => {
    return photos.find((p) => p.id === activePhotoId) || null;
  }, [photos, activePhotoId]);

  const updatePhoto = (id: string, updates: Partial<PhotoEntry>) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (activePhotoId === id) {
      const remaining = photos.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        setActivePhotoId(remaining[0].id);
      } else {
        setActivePhotoId(null);
        setIsEditingCrop(false);
      }
    }
  };

  // Helper to set copies to multiples of columns for clean rows
  const setCopiesMultipleOfRow = (id: string, multiplier: number) => {
    const cols = gridCapacity.cols;
    updatePhoto(id, { copies: Math.max(1, cols * multiplier) });
  };

  // Generate and download full grid
  const handleGenerate = async () => {
    if (photos.length === 0) {
      alert('Please upload at least one photo.');
      return;
    }
    setIsGenerating(true);

    try {
      const paperSpec = PAPER_SIZES[paper];
      const pageWidthPt = mmToPoints(paperSpec.widthMm);
      const pageHeightPt = mmToPoints(paperSpec.heightMm);
      const photoWPt = mmToPoints(photoWidthMm);
      const photoHPt = mmToPoints(photoHeightMm);
      const marginPt = mmToPoints(marginMm);
      const spacingPt = mmToPoints(spacingMm);

      const usableW = pageWidthPt - 2 * marginPt + spacingPt;
      const usableH = pageHeightPt - 2 * marginPt + spacingPt;
      const cols = Math.max(1, Math.floor(usableW / (photoWPt + spacingPt)));
      const rows = Math.max(1, Math.floor(usableH / (photoHPt + spacingPt)));
      const maxCells = cols * rows;

      // Prepare slots
      const slots: { blob: Blob | File }[] = [];
      photos.forEach((p) => {
        const itemBlob = p.croppedBlob || p.originalFile;
        for (let c = 0; c < p.copies; c++) {
          slots.push({ blob: itemBlob });
        }
      });

      const total = Math.min(slots.length, maxCells);

      if (downloadType === 'pdf') {
        const pdfDoc = await PDFDocument.create();
        const pageObj = pdfDoc.addPage([pageWidthPt, pageHeightPt]);

        // Background color
        pageObj.drawRectangle({
          x: 0,
          y: 0,
          width: pageWidthPt,
          height: pageHeightPt,
          color: rgb(1, 1, 1),
        });

        // Cache embedded images
        const pdfImageCache = new Map<Blob | File, any>();
        for (const slot of slots.slice(0, total)) {
          if (!pdfImageCache.has(slot.blob)) {
            const buf = await slot.blob.arrayBuffer();
            const embedded = await pdfDoc.embedPng(buf).catch(async () => {
              return await pdfDoc.embedJpg(buf);
            });
            pdfImageCache.set(slot.blob, embedded);
          }
        }

        // Draw from TOP downwards in PDF coordinate system
        for (let i = 0; i < total; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = marginPt + col * (photoWPt + spacingPt);
          // In PDF, Y=0 is bottom, so top margin is: pageHeightPt - marginPt - (row + 1)*photoHPt - row*spacingPt
          const y = pageHeightPt - marginPt - (row + 1) * photoHPt - row * spacingPt;

          const img = pdfImageCache.get(slots[i].blob);
          if (img) {
            pageObj.drawImage(img, { x, y, width: photoWPt, height: photoHPt });
          }
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `passport_grid_${paper}_${Date.now()}.pdf`;
        link.click();
        URL.revokeObjectURL(link.href);
        setTimeout(() => triggerChaiModal('Passport Photo Sheet (PDF)'), 600);
      } else {
        // PNG generation
        const canvas = document.createElement('canvas');
        const canvasW = mmToPixels(paperSpec.widthMm, dpi);
        const canvasH = mmToPixels(paperSpec.heightMm, dpi);
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvasW, canvasH);

        const photoWPx = mmToPixels(photoWidthMm, dpi);
        const photoHPx = mmToPixels(photoHeightMm, dpi);
        const marginPx = mmToPixels(marginMm, dpi);
        const spacingPx = mmToPixels(spacingMm, dpi);

        const usableWpx = canvasW - 2 * marginPx + spacingPx;
        const usableHpx = canvasH - 2 * marginPx + spacingPx;
        const colsPx = Math.max(1, Math.floor(usableWpx / (photoWPx + spacingPx)));
        const rowsPx = Math.max(1, Math.floor(usableHpx / (photoHPx + spacingPx)));
        const maxCellsPx = colsPx * rowsPx;
        const totalPx = Math.min(slots.length, maxCellsPx);

        const imageMap = new Map<Blob | File, HTMLImageElement>();
        for (const slot of slots.slice(0, totalPx)) {
          if (!imageMap.has(slot.blob)) {
            const url = URL.createObjectURL(slot.blob);
            const img = new Image();
            img.src = url;
            await new Promise<void>((res) => {
              img.onload = () => res();
              img.onerror = () => res();
            });
            imageMap.set(slot.blob, img);
          }
        }

        // Draw top-down
        for (let i = 0; i < totalPx; i++) {
          const col = i % colsPx;
          const row = Math.floor(i / colsPx);
          const x = marginPx + col * (photoWPx + spacingPx);
          const y = marginPx + row * (photoHPx + spacingPx);

          const img = imageMap.get(slots[i].blob);
          if (img) {
            ctx.drawImage(img, x, y, photoWPx, photoHPx);
          }
        }

        canvas.toBlob((blob) => {
          if (!blob) return;
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `passport_grid_${paper}_${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(link.href);
          setTimeout(() => triggerChaiModal('Passport Photo Sheet (PNG)'), 600);
        }, 'image/png');
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to generate printable document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Reusable input styling for dark/light mode
  const inputClass = `w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border outline-none transition-colors ${
    isDarkMode
      ? 'bg-slate-900/90 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500'
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
  }`;

  const labelClass = `block text-[11px] font-semibold uppercase tracking-wider mb-1 ${
    isDarkMode ? 'text-slate-400' : 'text-slate-600'
  }`;

  const cardClass = `p-4 rounded-xl border shadow-sm ${
    isDarkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-white border-slate-200'
  }`;

  // Prepare photos for GridPreview component
  const previewPhotoItems: PhotoItem[] = photos.map((p) => ({
    id: p.id,
    name: p.name,
    blob: p.croppedBlob || p.originalFile,
    copies: p.copies,
  }));

  return (
    <div
      className={`flex flex-col p-4 md:p-6 min-h-screen transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="mb-4">
        <Breadcrumbs
          crumbs={[
            { name: 'Home', link: '/' },
            { name: 'Photo Tools', link: '/' },
            { name: 'Passport Photo Grid Maker' },
          ]}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Stack & Layout Controls */}
        <div className="w-full lg:w-[440px] flex-shrink-0 space-y-4">
          {/* 1. Multi-Photo Stack List */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <FaLayerGroup className="text-indigo-500" /> Photo Queue ({photos.length})
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Add multiple people to print on the same sheet.
                </p>
              </div>

              <label className="cursor-pointer py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95">
                <FaPlus className="text-[10px]" /> Add Photo
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                <FaImage className="mx-auto text-3xl text-slate-400 mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  No photos in stack. Upload photos to start.
                </p>
                <label className="cursor-pointer py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-all">
                  Upload Photo
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {photos.map((item, idx) => {
                  const isSelected = item.id === activePhotoId;
                  const thumbUrl = item.croppedBlob
                    ? URL.createObjectURL(item.croppedBlob)
                    : URL.createObjectURL(item.originalFile);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setActivePhotoId(item.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 shadow-sm'
                          : isDarkMode
                          ? 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={thumbUrl}
                          alt={item.name}
                          className="w-10 h-12 object-cover rounded-md border border-slate-300 dark:border-slate-700 flex-shrink-0 bg-white"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate max-w-[130px] sm:max-w-[160px]">
                            #{idx + 1} {item.name}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            {item.croppedBlob ? (
                              <span className="text-emerald-500 font-medium flex items-center gap-0.5">
                                <FaCheck className="text-[9px]" /> Cropped
                              </span>
                            ) : (
                              <span className="text-amber-500 font-medium">Uncropped</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Photo Copies & Quick Multiple Buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <div className="text-right">
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase">
                            Copies
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={1}
                              max={60}
                              value={item.copies}
                              onChange={(e) =>
                                updatePhoto(item.id, { copies: Math.max(1, Number(e.target.value)) })
                              }
                              className="w-12 px-1.5 py-1 text-xs text-center font-bold rounded border outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setActivePhotoId(item.id);
                            setIsEditingCrop(true);
                          }}
                          className="p-2 text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="Crop/Adjust this photo"
                        >
                          <FaEdit className="text-xs" />
                        </button>

                        <button
                          type="button"
                          onClick={() => removePhoto(item.id)}
                          className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Remove photo"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Row Filler suggestion */}
            {activePhoto && (
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Quick Fill Rows ({gridCapacity.cols} per row):
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((mult) => {
                    const rowCopies = gridCapacity.cols * mult;
                    return (
                      <button
                        key={mult}
                        type="button"
                        onClick={() => setCopiesMultipleOfRow(activePhoto.id, mult)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                          activePhoto.copies === rowCopies
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                        }`}
                        title={`Set to ${rowCopies} copies (${mult} full row${mult > 1 ? 's' : ''})`}
                      >
                        {rowCopies} ({mult}R)
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. Paper & Grid Specifications */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-200 dark:border-slate-700">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <FaPrint className="text-emerald-500" /> Paper & Layout Setup
              </h2>
              <span className="text-[11px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                {gridCapacity.cols} cols × {gridCapacity.rows} rows (Max {gridCapacity.maxCells})
              </span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}>Standard</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className={inputClass}
                  >
                    {Object.keys(passportFormats).map((key) => (
                      <option key={key} value={key} className={isDarkMode ? 'bg-slate-900 text-white' : ''}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Paper Size</label>
                  <select
                    value={paper}
                    onChange={(e) => setPaper(e.target.value)}
                    className={inputClass}
                  >
                    {Object.entries(PAPER_SIZES).map(([key, val]) => (
                      <option key={key} value={key} className={isDarkMode ? 'bg-slate-900 text-white' : ''}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass}>Width (mm)</label>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={photoWidthMm}
                    onChange={(e) => setPhotoWidthMm(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Height (mm)</label>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={photoHeightMm}
                    onChange={(e) => setPhotoHeightMm(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Print DPI</label>
                  <input
                    type="number"
                    min={72}
                    max={600}
                    value={dpi}
                    onChange={(e) => setDpi(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass}>Margin (mm)</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={marginMm}
                    onChange={(e) => setMarginMm(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Gap (mm)</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={spacingMm}
                    onChange={(e) => setSpacingMm(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Background</label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full h-8 p-0 rounded cursor-pointer border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Export / Download Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
              <span>Total Photos on Sheet:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                {Math.min(totalCopies, gridCapacity.maxCells)} / {gridCapacity.maxCells} slots filled
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDownloadType('pdf')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  downloadType === 'pdf'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-slate-300'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                Download PDF
              </button>
              <button
                type="button"
                onClick={() => setDownloadType('png')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  downloadType === 'png'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-slate-300'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                Download PNG
              </button>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || photos.length === 0}
              className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                photos.length === 0
                  ? 'bg-slate-500 opacity-60 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 active:scale-[0.99] cursor-pointer'
              }`}
            >
              <FaDownload />
              {isGenerating
                ? 'Generating...'
                : `Download Printable ${downloadType.toUpperCase()} Sheet`}
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Editor / Preview */}
        <div className="flex-1 w-full space-y-4">
          {/* Active Cropper Card (When editing) */}
          {activePhoto && isEditingCrop && (
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-200 dark:border-slate-700">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <FaEdit className="text-indigo-500" /> Frame & Crop: {activePhoto.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Align head within the guidelines for official {format} passport standards.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updatePhoto(activePhoto.id, { brightness: 100, contrast: 100, saturation: 100 });
                    }}
                    className="text-xs text-slate-500 hover:text-slate-400 flex items-center gap-1 cursor-pointer"
                    title="Reset brightness/contrast"
                  >
                    <FaUndoAlt className="text-[10px]" /> Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingCrop(false)}
                    className="text-xs px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 font-medium hover:bg-slate-300"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Adjustments toolbar */}
              <div className="grid grid-cols-3 gap-3 mb-3 p-2 rounded-lg bg-slate-100 dark:bg-slate-900/50 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                    <span>Brightness</span>
                    <span className="font-mono">{activePhoto.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={180}
                    value={activePhoto.brightness}
                    onChange={(e) => updatePhoto(activePhoto.id, { brightness: Number(e.target.value) })}
                    className="w-full accent-indigo-600 h-1 bg-slate-300 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                    <span>Contrast</span>
                    <span className="font-mono">{activePhoto.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={180}
                    value={activePhoto.contrast}
                    onChange={(e) => updatePhoto(activePhoto.id, { contrast: Number(e.target.value) })}
                    className="w-full accent-indigo-600 h-1 bg-slate-300 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                    <span>Saturation</span>
                    <span className="font-mono">{activePhoto.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={activePhoto.saturation}
                    onChange={(e) => updatePhoto(activePhoto.id, { saturation: Number(e.target.value) })}
                    className="w-full accent-indigo-600 h-1 bg-slate-300 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <Cropper
                imageFile={activePhoto.originalFile}
                targetWidthMm={photoWidthMm}
                targetHeightMm={photoHeightMm}
                onCropComplete={(blob) => updatePhoto(activePhoto.id, { croppedBlob: blob })}
                brightness={activePhoto.brightness}
                contrast={activePhoto.contrast}
                saturation={activePhoto.saturation}
                onDoneEditing={() => setIsEditingCrop(false)}
              />
            </div>
          )}

          {/* Top-Down WYSIWYG Print Preview */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <FaPrint className="text-indigo-500" /> WYSIWYG Print Sheet Preview (Starts Top-to-Bottom)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Shows the exact layout on {paper} paper ({gridCapacity.cols} photos per row).
                </p>
              </div>
            </div>

            <GridPreview
              photos={previewPhotoItems}
              photoWidthMm={photoWidthMm}
              photoHeightMm={photoHeightMm}
              dpi={dpi}
              marginMm={marginMm}
              spacingMm={spacingMm}
              paperSize={PAPER_SIZES[paper]}
              bgColor={bgColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PassportGrid;
