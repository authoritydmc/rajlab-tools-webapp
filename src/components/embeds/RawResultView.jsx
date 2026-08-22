import React, { useRef, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import QRCodeStyling from 'qr-code-styling';
import { FaDownload, FaCopy, FaCheck, FaExternalLinkAlt } from 'react-icons/fa';
import CryptoJS from 'crypto-js';
import { getPresetLogoUrl } from '../../utils/qrLogoPresets';

export default function RawResultView() {
  const { toolSlug } = useParams();
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);
  const qrInstance = useRef(null);

  const slug = (toolSlug || '').replace(/^\//, '');
  const rawMode = (searchParams.get('raw') || searchParams.get('format') || 'image').toLowerCase();
  const shouldDownload = searchParams.get('download') === 'true' || searchParams.get('download') === '1';

  // QR Parameters
  const data = searchParams.get('data') || searchParams.get('text') || searchParams.get('url') || searchParams.get('q') || 'https://rajlabs.in';
  const size = parseInt(searchParams.get('size') || searchParams.get('s') || 300);
  const ec = searchParams.get('errorCorrectionLevel') || searchParams.get('ec') || 'M';
  
  // Theme & Styling
  const theme = (searchParams.get('theme') || searchParams.get('mode') || 'light').toLowerCase();
  let defaultBg = theme === 'dark' ? '#0f172a' : '#ffffff';
  let defaultFg = theme === 'dark' ? '#ffffff' : '#000000';

  const customBg = searchParams.get('bg') || searchParams.get('bgColor');
  const customFg = searchParams.get('fg') || searchParams.get('fgColor');
  const bgColor = customBg ? (customBg.startsWith('#') ? customBg : `#${customBg}`) : defaultBg;
  const fgColor = customFg ? (customFg.startsWith('#') ? customFg : `#${customFg}`) : defaultFg;

  // Customizer styling parameters
  const logoParam = searchParams.get('logo') || searchParams.get('icon');
  const dotStyle = searchParams.get('dotStyle') || searchParams.get('dots') || searchParams.get('pattern') || 'square';
  const cornerSquareStyle = searchParams.get('eyeFrame') || searchParams.get('corner') || searchParams.get('eye') || 'square';
  const cornerDotStyle = searchParams.get('eyeBall') || searchParams.get('eyeball') || 'square';
  const frame = searchParams.get('frame') || 'none';
  const frameText = searchParams.get('frameText') || searchParams.get('cta') || 'SCAN ME';
  const frameColor = searchParams.get('frameColor') || searchParams.get('fc') || '#000000';

  const logoUrl = getPresetLogoUrl(logoParam);

  // Render QRCodeStyling inside canvas container
  useEffect(() => {
    if (!containerRef.current || rawMode === 'json' || rawMode === 'text') return;

    const options = {
      width: size,
      height: size,
      data,
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: logoUrl ? 'H' : ec,
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.3,
        margin: 6,
        crossOrigin: 'anonymous',
      },
      dotsOptions: {
        color: fgColor,
        type: dotStyle,
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        color: fgColor,
        type: cornerSquareStyle,
      },
      cornersDotOptions: {
        color: fgColor,
        type: cornerDotStyle,
      },
      image: logoUrl || undefined,
    };

    if (!qrInstance.current) {
      qrInstance.current = new QRCodeStyling(options);
      containerRef.current.innerHTML = '';
      qrInstance.current.append(containerRef.current);
    } else {
      qrInstance.current.update(options);
    }
  }, [data, size, ec, bgColor, fgColor, dotStyle, cornerSquareStyle, cornerDotStyle, logoUrl, rawMode]);

  // Auto download trigger if download=true
  useEffect(() => {
    if (shouldDownload && qrInstance.current) {
      setTimeout(() => {
        qrInstance.current.download({ name: slug || 'qr-code', extension: 'png' });
      }, 300);
    }
  }, [shouldDownload, slug]);

  const copyData = async () => {
    await navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = () => {
    if (qrInstance.current) {
      qrInstance.current.download({ name: slug || 'qr-code', extension: 'png' });
    }
  };

  // --- Raw JSON Mode ---
  if (rawMode === 'json') {
    let resultPayload = { 
      success: true, 
      tool: slug, 
      data, 
      size, 
      dotStyle,
      cornerSquareStyle,
      logo: logoParam || 'none',
      frame,
      frameText: frame !== 'none' ? frameText : undefined,
      timestamp: new Date().toISOString() 
    };

    if (slug === 'hash-generator') {
      resultPayload.hashes = {
        md5: CryptoJS.MD5(data).toString(),
        sha256: CryptoJS.SHA256(data).toString(),
      };
    } else if (slug === 'uuid-generator') {
      const count = parseInt(searchParams.get('count') || 5);
      resultPayload.uuids = Array.from({ length: count }, () => crypto.randomUUID());
    }

    return (
      <div className="min-h-screen bg-slate-950 text-emerald-400 p-4 font-mono text-xs overflow-auto">
        <pre>{JSON.stringify(resultPayload, null, 2)}</pre>
      </div>
    );
  }

  // --- Raw Text Mode ---
  if (rawMode === 'text' || rawMode === 'plain') {
    let rawText = data;
    if (slug === 'uuid-generator') {
      const count = parseInt(searchParams.get('count') || 5);
      rawText = Array.from({ length: count }, () => crypto.randomUUID()).join('\n');
    } else if (slug === 'hash-generator') {
      rawText = CryptoJS.SHA256(data).toString();
    }

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-mono text-sm whitespace-pre select-all">
        {rawText}
      </div>
    );
  }

  // --- Default: Standalone Branded Canvas Output View ---
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-950 select-none relative group">
      {/* Floating Toolbar on Hover */}
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity bg-slate-900/80 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-xl z-20">
        <button
          onClick={copyData}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-all"
        >
          {copied ? <FaCheck className="text-emerald-400" size={11} /> : <FaCopy size={11} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        <button
          onClick={downloadImage}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-sm"
        >
          <FaDownload size={11} />
          <span>Download</span>
        </button>

        <a
          href={`/${slug}${window.location.search}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          title="Open in Editor"
        >
          <FaExternalLinkAlt size={12} />
        </a>
      </div>

      {/* Branded QR Container with Optional Outer Frame */}
      <div 
        className="transition-all duration-300 flex flex-col items-center justify-center shadow-2xl rounded-3xl overflow-hidden"
        style={{
          backgroundColor: frame !== 'none' ? frameColor : bgColor,
          padding: frame !== 'none' ? '18px 18px' : '8px',
        }}
      >
        {frame === 'banner-top' && (
          <div className="text-white font-extrabold text-sm uppercase tracking-wider mb-2 px-4 text-center">
            {frameText}
          </div>
        )}

        <div 
          ref={containerRef}
          className="rounded-2xl overflow-hidden flex items-center justify-center p-2"
          style={{ backgroundColor: bgColor }}
        />

        {frame === 'banner-bottom' && (
          <div className="text-white font-extrabold text-sm uppercase tracking-wider mt-2 px-4 text-center">
            {frameText}
          </div>
        )}
      </div>

      {/* Info Label */}
      <div className="mt-4 text-center">
        <span className="text-[11px] font-mono text-slate-500">
          {logoParam ? `${logoParam.toUpperCase()} Logo &bull; ` : ''}{dotStyle} dots &bull; {size}x{size}px
        </span>
      </div>
    </div>
  );
}
