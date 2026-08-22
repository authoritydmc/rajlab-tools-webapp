import React, { useRef, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import QRCodeStyling from 'qr-code-styling';
import { FaDownload, FaCopy, FaCheck, FaExternalLinkAlt } from 'react-icons/fa';
import CryptoJS from 'crypto-js';
import * as yaml from 'js-yaml';
import Papa from 'papaparse';
import { getPresetLogoUrl, detectBrandFromData } from '../../utils/qrLogoPresets';

export default function RawResultView() {
  const { toolSlug } = useParams();
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);
  const qrInstance = useRef(null);

  const slug = (toolSlug || '').replace(/^\//, '');
  const rawMode = (searchParams.get('raw') || searchParams.get('format') || (slug.includes('qr') ? 'image' : 'json')).toLowerCase();
  const shouldDownload = searchParams.get('download') === 'true' || searchParams.get('download') === '1';

  // Common inputs
  const inputData = searchParams.get('data') || searchParams.get('text') || searchParams.get('input') || searchParams.get('q') || searchParams.get('url') || searchParams.get('json') || searchParams.get('csv') || searchParams.get('xml') || searchParams.get('yaml') || '';

  // QR Parameters
  const size = parseInt(searchParams.get('size') || searchParams.get('s') || 300);
  const ec = searchParams.get('errorCorrectionLevel') || searchParams.get('ec') || 'M';
  const theme = (searchParams.get('theme') || searchParams.get('mode') || 'light').toLowerCase();
  let defaultBg = theme === 'dark' ? '#0f172a' : '#ffffff';
  let defaultFg = theme === 'dark' ? '#ffffff' : '#000000';

  const customBg = searchParams.get('bg') || searchParams.get('bgColor');
  const customFg = searchParams.get('fg') || searchParams.get('fgColor');
  const bgColor = customBg ? (customBg.startsWith('#') ? customBg : `#${customBg}`) : defaultBg;
  const fgColor = customFg ? (customFg.startsWith('#') ? customFg : `#${customFg}`) : defaultFg;

  const logoParam = searchParams.get('logo') || searchParams.get('icon');
  const resolvedLogo = (logoParam && logoParam !== 'auto') 
    ? logoParam 
    : (detectBrandFromData(inputData) || 'none');
  const dotStyle = searchParams.get('dotStyle') || searchParams.get('dots') || searchParams.get('pattern') || 'square';
  const cornerSquareStyle = searchParams.get('eyeFrame') || searchParams.get('corner') || searchParams.get('eye') || 'square';
  const cornerDotStyle = searchParams.get('eyeBall') || searchParams.get('eyeball') || 'square';
  const frame = searchParams.get('frame') || 'none';
  const frameText = searchParams.get('frameText') || searchParams.get('cta') || 'SCAN ME';
  const frameColor = searchParams.get('frameColor') || searchParams.get('fc') || '#000000';

  const logoUrl = getPresetLogoUrl(resolvedLogo);

  // Render QR Canvas if QR tool and image mode
  useEffect(() => {
    if (!containerRef.current || !slug.includes('qr') || rawMode === 'json' || rawMode === 'text') return;

    const options = {
      width: size,
      height: size,
      data: inputData || 'https://rajlabs.in',
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
  }, [inputData, size, ec, bgColor, fgColor, dotStyle, cornerSquareStyle, cornerDotStyle, logoUrl, rawMode, slug]);

  // Compute tool results dynamically
  const computeResult = () => {
    switch (slug) {
      case 'password-generator': {
        const length = parseInt(searchParams.get('length') || searchParams.get('len') || 16);
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
        let pwd = '';
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);
        for (let i = 0; i < length; i++) {
          pwd += chars[array[i] % chars.length];
        }
        return { text: pwd, json: { success: true, length, password: pwd } };
      }

      case 'uuid-generator': {
        const count = parseInt(searchParams.get('count') || searchParams.get('n') || 5);
        const uppercase = searchParams.get('uppercase') === 'true';
        const nodashes = searchParams.get('nodashes') === 'true';
        let uuids = Array.from({ length: count }, () => {
          let u = crypto.randomUUID();
          if (nodashes) u = u.replace(/-/g, '');
          if (uppercase) u = u.toUpperCase();
          return u;
        });
        return { text: uuids.join('\n'), json: { success: true, count, uuids } };
      }

      case 'hash-generator': {
        const text = inputData || 'Hello World';
        const hashes = {
          md5: CryptoJS.MD5(text).toString(),
          sha1: CryptoJS.SHA1(text).toString(),
          sha256: CryptoJS.SHA256(text).toString(),
          sha512: CryptoJS.SHA512(text).toString(),
        };
        return { text: hashes.sha256, json: { success: true, input: text, hashes } };
      }

      case 'jwt-decoder': {
        const token = searchParams.get('token') || searchParams.get('jwt') || inputData;
        try {
          const parts = token.split('.');
          if (parts.length < 2) throw new Error('Invalid JWT format');
          const header = JSON.parse(atob(parts[0]));
          const payload = JSON.parse(atob(parts[1]));
          return { text: JSON.stringify(payload, null, 2), json: { success: true, header, payload } };
        } catch (e) {
          return { text: 'Invalid JWT Token', json: { success: false, error: e.message } };
        }
      }

      case 'base64-encoder-decoder': {
        const mode = searchParams.get('mode') || 'encode';
        try {
          const res = mode === 'decode' ? atob(inputData) : btoa(inputData);
          return { text: res, json: { success: true, mode, input: inputData, output: res } };
        } catch (e) {
          return { text: 'Base64 operation failed', json: { success: false, error: e.message } };
        }
      }

      case 'url-encoder-decoder': {
        const mode = searchParams.get('mode') || 'encode';
        const res = mode === 'decode' ? decodeURIComponent(inputData) : encodeURIComponent(inputData);
        return { text: res, json: { success: true, mode, input: inputData, output: res } };
      }

      case 'timestamp-converter': {
        const tsParam = searchParams.get('ts') || searchParams.get('time') || Date.now();
        let num = Number(tsParam);
        if (num < 10000000000) num *= 1000; // convert seconds to ms
        const d = new Date(num);
        const res = {
          epochSeconds: Math.floor(d.getTime() / 1000),
          epochMillis: d.getTime(),
          utc: d.toUTCString(),
          iso: d.toISOString(),
          local: d.toLocaleString(),
        };
        return { text: d.toISOString(), json: { success: true, ...res } };
      }

      case 'css-unit-converter': {
        const val = parseFloat(searchParams.get('val') || searchParams.get('v') || 16);
        const basePx = parseFloat(searchParams.get('base') || 16);
        const conversions = {
          px: `${val}px`,
          rem: `${val / basePx}rem`,
          em: `${val / basePx}em`,
          pt: `${val * 0.75}pt`,
          percent: `${(val / basePx) * 100}%`,
        };
        return { text: `${val / basePx}rem`, json: { success: true, input: val, basePx, conversions } };
      }

      case 'json-to-csv': {
        try {
          const parsed = JSON.parse(inputData || '[]');
          const csv = Papa.unparse(parsed);
          return { text: csv, json: { success: true, csv } };
        } catch (e) {
          return { text: 'Invalid JSON', json: { success: false, error: e.message } };
        }
      }

      case 'csv-to-json': {
        try {
          const parsed = Papa.parse(inputData || '', { header: true });
          return { text: JSON.stringify(parsed.data, null, 2), json: { success: true, data: parsed.data } };
        } catch (e) {
          return { text: 'Invalid CSV', json: { success: false, error: e.message } };
        }
      }

      case 'json-to-yaml': {
        try {
          const parsed = JSON.parse(inputData || '{}');
          const yml = yaml.dump(parsed);
          return { text: yml, json: { success: true, yaml: yml } };
        } catch (e) {
          return { text: 'Invalid JSON', json: { success: false, error: e.message } };
        }
      }

      case 'yaml-to-json': {
        try {
          const parsed = yaml.load(inputData || '');
          return { text: JSON.stringify(parsed, null, 2), json: { success: true, data: parsed } };
        } catch (e) {
          return { text: 'Invalid YAML', json: { success: false, error: e.message } };
        }
      }

      case 'lorem-ipsum': {
        const count = parseInt(searchParams.get('count') || searchParams.get('n') || 3);
        const loremSentences = [
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
          "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        ];
        const res = Array.from({ length: count }, (_, i) => loremSentences[i % loremSentences.length]).join(' ');
        return { text: res, json: { success: true, count, lorem: res } };
      }

      default:
        return { text: inputData, json: { success: true, tool: slug, data: inputData } };
    }
  };

  const { text: resultText, json: resultJson } = computeResult();

  const copyToClipboard = async (content) => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Raw Plaintext Mode ---
  if (rawMode === 'text' || rawMode === 'plain' || rawMode === 'csv' || rawMode === 'yaml' || rawMode === 'xml') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-mono text-sm whitespace-pre select-all">
        {resultText}
      </div>
    );
  }

  // --- Raw JSON Mode ---
  if (rawMode === 'json' || !slug.includes('qr')) {
    return (
      <div className="min-h-screen bg-slate-950 text-emerald-400 p-6 font-mono text-xs overflow-auto select-all">
        <pre>{JSON.stringify(resultJson, null, 2)}</pre>
      </div>
    );
  }

  // --- QR Code Canvas Mode ---
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-950 select-none relative group">
      {/* Floating Toolbar */}
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity bg-slate-900/80 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-xl z-20">
        <button
          onClick={() => copyToClipboard(inputData)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-all"
        >
          {copied ? <FaCheck className="text-emerald-400" size={11} /> : <FaCopy size={11} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        <button
          onClick={() => qrInstance.current?.download({ name: slug || 'qr-code', extension: 'png' })}
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

      {/* Branded QR Container */}
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
