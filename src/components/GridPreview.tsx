import React, { useEffect, useRef } from 'react';
import { mmToPixels } from '../utils/dimensions';

export interface PhotoItem {
  id: string;
  name: string;
  blob: Blob | null;
  copies: number;
}

interface GridPreviewProps {
  photos: PhotoItem[];
  photoWidthMm: number;
  photoHeightMm: number;
  dpi: number;
  marginMm: number;
  spacingMm: number;
  paperSize: { widthMm: number; heightMm: number };
  bgColor: string;
}

const GridPreview: React.FC<GridPreviewProps> = ({
  photos,
  photoWidthMm,
  photoHeightMm,
  dpi,
  marginMm,
  spacingMm,
  paperSize,
  bgColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let active = true;
    const createdUrls: string[] = [];

    const draw = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Use a preview DPI (capped at 150 for super responsive rendering)
      const previewDpi = Math.min(dpi, 150);
      const canvasW = mmToPixels(paperSize.widthMm, previewDpi);
      const canvasH = mmToPixels(paperSize.heightMm, previewDpi);

      canvas.width = canvasW;
      canvas.height = canvasH;

      // Draw paper background
      ctx.fillStyle = bgColor || '#ffffff';
      ctx.fillRect(0, 0, canvasW, canvasH);

      const photoWPx = mmToPixels(photoWidthMm, previewDpi);
      const photoHPx = mmToPixels(photoHeightMm, previewDpi);
      const marginPx = mmToPixels(marginMm, previewDpi);
      const spacingPx = mmToPixels(spacingMm, previewDpi);

      const usableWpx = canvasW - 2 * marginPx + spacingPx;
      const usableHpx = canvasH - 2 * marginPx + spacingPx;
      const cols = Math.max(1, Math.floor(usableWpx / (photoWPx + spacingPx)));
      const rows = Math.max(1, Math.floor(usableHpx / (photoHPx + spacingPx)));
      const maxCells = cols * rows;

      // Flatten photos according to their individual copy counts
      const slots: { blob: Blob | null; label: string }[] = [];
      photos.forEach((p) => {
        for (let c = 0; c < p.copies; c++) {
          slots.push({ blob: p.blob, label: p.name });
        }
      });

      const total = Math.min(slots.length, maxCells);

      // Preload image elements for distinct blobs
      const imageMap = new Map<Blob, HTMLImageElement>();
      for (const slot of slots.slice(0, total)) {
        if (slot.blob && !imageMap.has(slot.blob)) {
          const url = URL.createObjectURL(slot.blob);
          createdUrls.push(url);
          const img = new Image();
          img.src = url;
          await new Promise<void>((res) => {
            img.onload = () => res();
            img.onerror = () => res();
          });
          imageMap.set(slot.blob, img);
        }
      }

      if (!active) {
        createdUrls.forEach((u) => URL.revokeObjectURL(u));
        return;
      }

      // Draw from TOP of page down
      for (let i = 0; i < total; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = marginPx + col * (photoWPx + spacingPx);
        // TOP-LEFT coordinate: y starts from top margin downwards
        const y = marginPx + row * (photoHPx + spacingPx);

        const slot = slots[i];
        if (slot.blob && imageMap.has(slot.blob)) {
          const img = imageMap.get(slot.blob)!;
          ctx.drawImage(img, x, y, photoWPx, photoHPx);

          // Subtle cut line around photo
          ctx.strokeStyle = 'rgba(0,0,0,0.18)';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
          ctx.strokeRect(x, y, photoWPx, photoHPx);
        } else {
          // Empty / placeholder slot
          ctx.strokeStyle = '#cbd5e1';
          ctx.fillStyle = '#f8fafc';
          ctx.setLineDash([4, 4]);
          ctx.fillRect(x, y, photoWPx, photoHPx);
          ctx.strokeRect(x, y, photoWPx, photoHPx);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(slot.label || `Photo #${i + 1}`, x + photoWPx / 2, y + photoHPx / 2);
        }
      }

      // Draw dashed placeholders for the rest of the sheet grid up to maxCells (optional ghost grid)
      if (total === 0) {
        ctx.strokeStyle = '#e2e8f0';
        ctx.setLineDash([3, 3]);
        for (let i = 0; i < Math.min(cols * 3, maxCells); i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = marginPx + col * (photoWPx + spacingPx);
          const y = marginPx + row * (photoHPx + spacingPx);
          ctx.strokeRect(x, y, photoWPx, photoHPx);
        }
      }
    };

    draw();

    return () => {
      active = false;
      createdUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [photos, photoWidthMm, photoHeightMm, dpi, marginMm, spacingMm, paperSize, bgColor]);

  return (
    <div className="flex justify-center items-center bg-slate-900/5 dark:bg-slate-950/40 p-4 sm:p-6 rounded-2xl overflow-auto border border-dashed border-slate-300 dark:border-slate-700 min-h-[360px]">
      <canvas
        ref={canvasRef}
        className="bg-white shadow-2xl rounded-sm max-h-[560px] w-auto max-w-full object-contain transition-all"
      />
    </div>
  );
};

export default GridPreview;
