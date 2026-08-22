import React, { useRef, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { FaDownload, FaCopy, FaCheck, FaExternalLinkAlt } from 'react-icons/fa';
import CryptoJS from 'crypto-js';

export default function RawResultView() {
  const { toolSlug } = useParams();
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  const slug = (toolSlug || '').replace(/^\//, '');
  const rawMode = (searchParams.get('raw') || searchParams.get('format') || 'image').toLowerCase();
  const shouldDownload = searchParams.get('download') === 'true' || searchParams.get('download') === '1';

  // QR Parameters
  const data = searchParams.get('data') || searchParams.get('text') || searchParams.get('url') || searchParams.get('q') || '';
  const size = parseInt(searchParams.get('size') || searchParams.get('s') || 300);
  const ec = searchParams.get('errorCorrectionLevel') || searchParams.get('ec') || 'M';
  
  // Theme / Color Parameters (Default Standard Black-on-White)
  const theme = (searchParams.get('theme') || searchParams.get('mode') || 'light').toLowerCase();
  let defaultBg = theme === 'dark' ? '#0f172a' : '#ffffff';
  let defaultFg = theme === 'dark' ? '#ffffff' : '#000000';

  const customBg = searchParams.get('bg') || searchParams.get('bgColor');
  const customFg = searchParams.get('fg') || searchParams.get('fgColor');
  const bgColor = customBg ? (customBg.startsWith('#') ? customBg : `#${customBg}`) : defaultBg;
  const fgColor = customFg ? (customFg.startsWith('#') ? customFg : `#${customFg}`) : defaultFg;

  // Auto download trigger if download=true
  useEffect(() => {
    if (shouldDownload && qrRef.current) {
      setTimeout(() => {
        const canvas = qrRef.current.querySelector('canvas');
        if (canvas) {
          const url = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = url;
          link.download = `${slug || 'qr-code'}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }, 300);
    }
  }, [shouldDownload, slug]);

  const copyImage = async () => {
    try {
      const canvas = qrRef.current?.querySelector('canvas');
      if (canvas && window.ClipboardItem) {
        canvas.toBlob(async (blob) => {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      } else {
        await navigator.clipboard.writeText(data);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadImage = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${slug || 'qr-code'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // --- Raw JSON Mode ---
  if (rawMode === 'json') {
    let resultPayload = { success: true, tool: slug, timestamp: new Date().toISOString() };

    if (slug.includes('qr') || slug === 'qr-code-generator') {
      resultPayload = {
        ...resultPayload,
        data,
        size,
        errorCorrectionLevel: ec,
        bgColor,
        fgColor,
        theme,
      };
    } else if (slug === 'hash-generator') {
      resultPayload.input = data;
      resultPayload.hashes = {
        md5: CryptoJS.MD5(data).toString(),
        sha256: CryptoJS.SHA256(data).toString(),
      };
    } else if (slug === 'uuid-generator') {
      const count = parseInt(searchParams.get('count') || 5);
      resultPayload.uuids = Array.from({ length: count }, () => crypto.randomUUID());
    } else if (slug === 'base64-encoder-decoder') {
      const isEncode = searchParams.get('mode') !== 'decode';
      resultPayload.mode = isEncode ? 'encode' : 'decode';
      resultPayload.input = data;
      resultPayload.output = isEncode ? btoa(data) : atob(data);
    }

    return (
      <div className="min-h-screen bg-slate-950 text-emerald-400 p-4 font-mono text-xs overflow-auto">
        <pre>{JSON.stringify(resultPayload, null, 2)}</pre>
      </div>
    );
  }

  // --- Raw SVG Mode ---
  if (rawMode === 'svg') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
        <div className="p-4 rounded-2xl shadow-2xl" style={{ backgroundColor: bgColor }}>
          <QRCodeSVG
            value={data || 'https://rajlabs.in'}
            size={size}
            level={ec}
            includeMargin={true}
            bgColor={bgColor}
            fgColor={fgColor}
          />
        </div>
      </div>
    );
  }

  // --- Raw Text Mode ---
  if (rawMode === 'text' || rawMode === 'plain') {
    let rawText = data;
    if (slug === 'uuid-generator') {
      const count = parseInt(searchParams.get('count') || 5);
      rawText = Array.from({ length: count }, () => crypto.randomUUID()).join('\n');
    } else if (slug === 'base64-encoder-decoder') {
      rawText = searchParams.get('mode') === 'decode' ? atob(data) : btoa(data);
    } else if (slug === 'hash-generator') {
      rawText = CryptoJS.SHA256(data).toString();
    }

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-mono text-sm whitespace-pre select-all">
        {rawText}
      </div>
    );
  }

  // --- Default: Standalone Pure Image Canvas View ---
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-950 select-none relative group">
      {/* Floating Toolbar on Hover */}
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity bg-slate-900/80 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-xl z-20">
        <button
          onClick={copyImage}
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
          title="Open in Full Editor"
        >
          <FaExternalLinkAlt size={12} />
        </a>
      </div>

      {/* Standalone Canvas */}
      <div 
        ref={qrRef}
        className="p-4 rounded-2xl shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
        style={{ backgroundColor: bgColor }}
      >
        <QRCodeCanvas
          value={data || 'https://rajlabs.in'}
          size={size}
          level={ec}
          includeMargin={true}
          bgColor={bgColor}
          fgColor={fgColor}
        />
      </div>

      {/* Direct Info Label */}
      <div className="mt-4 text-center">
        <span className="text-[11px] font-mono text-slate-500">
          {bgColor === '#ffffff' ? 'Standard White BG' : 'Dark BG'} &bull; {size}x{size}px
        </span>
      </div>
    </div>
  );
}
