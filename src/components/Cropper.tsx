import React, { useState, useCallback, useEffect } from 'react';
import EasyCropper from 'react-easy-crop';

interface CropperProps {
  imageFile: File;
  targetWidthMm: number;
  targetHeightMm: number;
  onCropComplete: (croppedImageBlob: Blob | null) => void;
  brightness: number;
  contrast: number;
  saturation: number;
  onDoneEditing: () => void;
}

const Cropper: React.FC<CropperProps> = ({
  imageFile,
  targetWidthMm,
  targetHeightMm,
  onCropComplete,
  brightness,
  contrast,
  saturation,
  onDoneEditing,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    setImageSrc(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  const aspect = targetWidthMm / targetHeightMm;

  const onCropChange = useCallback((newCrop: any) => {
    setCrop(newCrop);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const handleCropComplete = useCallback((_croppedArea: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const generateCroppedImage = async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise<void>((resolve) => {
        if (img.complete) resolve();
        else img.onload = () => resolve();
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height, x, y } = croppedAreaPixels;
      canvas.width = width;
      canvas.height = height;

      // Apply filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

      canvas.toBlob((blob) => {
        onCropComplete(blob);
        onDoneEditing();
      }, 'image/png');
    } catch (e) {
      console.error('Error generating cropped image:', e);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="relative w-full h-[360px] bg-slate-900 rounded-xl overflow-hidden shadow-inner select-none">
        {imageSrc && (
          <EasyCropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={handleCropComplete}
            style={{
              containerStyle: {
                filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
              },
            }}
          />
        )}
        {/* Head/Chin guidelines overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div style={{ aspectRatio: aspect }} className="h-[90%] relative border-2 border-emerald-400/60 border-dashed rounded-sm">
            {/* Guide labels */}
            <div className="absolute top-1 left-2 text-[10px] bg-black/60 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
              Top of head
            </div>
            <div className="absolute bottom-1 left-2 text-[10px] bg-black/60 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
              Chin line
            </div>
            {/* Head oval */}
            <div className="absolute top-[12%] left-[18%] right-[18%] bottom-[24%] border-2 border-dashed border-sky-400/80 rounded-[50%]" />
            {/* Eye level line */}
            <div className="absolute top-[42%] left-0 right-0 border-b border-dashed border-amber-300/60" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Zoom:</label>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
        />
        <span className="text-xs font-mono text-slate-600 dark:text-slate-400 w-10 text-right">{zoom.toFixed(1)}x</span>
      </div>

      <button
        type="button"
        onClick={generateCroppedImage}
        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        Apply Crop & Lock Photo
      </button>
    </div>
  );
};

export default Cropper;
