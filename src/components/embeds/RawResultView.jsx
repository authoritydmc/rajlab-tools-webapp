import React, { useRef, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import QRCodeStyling from 'qr-code-styling';
import SparkMD5 from 'spark-md5';
import * as yaml from 'js-yaml';
import Papa from 'papaparse';
import { getPresetLogoUrl, detectBrandFromData } from '../../utils/qrLogoPresets';

const QR_SLUGS = ['qr-code-generator', 'upi-code-generator', 'whatsapp-qr-code'];
const IMAGE_MODES = ['image', 'png', 'jpg', 'jpeg', 'svg', 'canvas'];

function isQrSlug(slug) {
  if (!slug) return false;
  return QR_SLUGS.includes(slug) || slug.includes('qr');
}

function getQrDataForSlug(slug, searchParams, fallbackInput) {
  if (slug === 'upi-code-generator') {
    const pa = searchParams.get('pa') || searchParams.get('upi') || searchParams.get('vpa');
    if (pa) {
      const pn = searchParams.get('pn') || searchParams.get('name');
      const am = searchParams.get('am') || searchParams.get('amount');
      let upiLink = `upi://pay?pa=${encodeURIComponent(pa)}&cu=INR`;
      if (pn && pn.trim()) upiLink += `&pn=${encodeURIComponent(pn.trim())}`;
      if (am) upiLink += `&am=${encodeURIComponent(am)}`;
      return upiLink;
    }
    return fallbackInput || 'upi://pay?pa=example@upi&cu=INR';
  }
  if (slug === 'whatsapp-qr-code') {
    const phone = searchParams.get('phone') || searchParams.get('number') || searchParams.get('p');
    const code = searchParams.get('code') || searchParams.get('cc') || searchParams.get('country') || '91';
    const message = searchParams.get('message') || searchParams.get('msg') || searchParams.get('text') || '';
    if (phone) {
      const cleanPhone = phone.replace(/\s+/g, '');
      const encodedMsg = message ? `?text=${encodeURIComponent(message)}` : '';
      return `https://wa.me/${code}${cleanPhone}${encodedMsg}`;
    }
    return fallbackInput || 'https://wa.me/919876543210';
  }
  // generic qr
  return fallbackInput || 'https://rajlabs.in';
}

export default function RawResultView() {
  const { toolSlug } = useParams();
  const [searchParams] = useSearchParams();
  const containerRef = useRef(null);
  const qrInstance = useRef(null);
  const [qrReady, setQrReady] = useState(false);

  // Derive slug from params or current pathname (supports ?raw= on normal tool route)
  let pathnameSlug = '';
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path.startsWith('/raw/')) pathnameSlug = path.replace(/^\/raw\//, '').split('/')[0].split('?')[0];
    else pathnameSlug = path.replace(/^\//, '').split('/')[0].split('?')[0];
  }
  const rawSlug = (toolSlug || pathnameSlug || '').replace(/^\//, '').split('?')[0];
  const slug = rawSlug || '';

  const isQr = isQrSlug(slug);
  const rawParamRaw = searchParams.get('raw') || searchParams.get('format') || '';
  const rawMode = (rawParamRaw ? rawParamRaw.toLowerCase() : (isQr ? 'image' : 'json'));
  const shouldDownload = searchParams.get('download') === 'true' || searchParams.get('download') === '1';
  const isImageMode = IMAGE_MODES.includes(rawMode);

  // Common inputs fallback
  const inputDataFallback = searchParams.get('data') || searchParams.get('text') || searchParams.get('input') || searchParams.get('q') || searchParams.get('url') || searchParams.get('json') || searchParams.get('csv') || searchParams.get('xml') || searchParams.get('yaml') || '';
  const qrData = isQr ? getQrDataForSlug(slug, searchParams, inputDataFallback) : inputDataFallback;

  // Async SHA hashes for embed hash-generator (WebCrypto + SparkMD5)
  const [asyncHashes, setAsyncHashes] = useState(null);
  useEffect(() => {
    if (slug !== 'hash-generator') return;
    const text = inputDataFallback || 'Hello World';
    let cancelled = false;
    async function shaHex(algo, msg) {
      const data = new TextEncoder().encode(msg);
      const buf = await crypto.subtle.digest(algo, data);
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
    }
    (async () => {
      try {
        const [sha1, sha256, sha512] = await Promise.all([
          shaHex('SHA-1', text),
          shaHex('SHA-256', text),
          shaHex('SHA-512', text),
        ]);
        if (!cancelled) setAsyncHashes({ md5: SparkMD5.hash(text), sha1, sha256, sha512 });
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [slug, inputDataFallback]);

  // QR Parameters
  const size = parseInt(searchParams.get('size') || searchParams.get('s') || 256);
  // Allow developer full control: 32px (tiny popup) up to 1024px (print)
  const rawSizeNum = Number(size);
  const qrSize = Number.isFinite(rawSizeNum) && rawSizeNum > 0 ? Math.max(32, Math.min(1024, rawSizeNum)) : 256;
  const marginParam = parseInt(searchParams.get('margin') || searchParams.get('m') || '10', 10);
  const qrMargin = Number.isFinite(marginParam) ? Math.max(0, Math.min(40, marginParam)) : 10;
  const ec = searchParams.get('errorCorrectionLevel') || searchParams.get('ec') || 'M';
  const theme = (searchParams.get('theme') || searchParams.get('mode') || 'light').toLowerCase();
  let defaultBg = theme === 'dark' ? '#0f172a' : '#ffffff';
  let defaultFg = theme === 'dark' ? '#ffffff' : '#000000';

  const customBg = searchParams.get('bg') || searchParams.get('bgColor');
  const customFg = searchParams.get('fg') || searchParams.get('fgColor');
  const bgColor = customBg ? (customBg.startsWith('#') ? customBg : `#${customBg}`) : defaultBg;
  const fgColor = customFg ? (customFg.startsWith('#') ? customFg : `#${customFg}`) : defaultFg;

  const logoParam = searchParams.get('logo') || searchParams.get('icon');
  // For QR, resolved logo based on actual qrData if auto
  const resolvedLogo = (logoParam && logoParam !== 'auto') 
    ? logoParam 
    : (isQr ? (detectBrandFromData(qrData) || 'none') : 'none');
  const dotStyle = searchParams.get('dotStyle') || searchParams.get('dots') || searchParams.get('pattern') || 'square';
  const cornerSquareStyle = searchParams.get('eyeFrame') || searchParams.get('corner') || searchParams.get('eye') || 'square';
  const cornerDotStyle = searchParams.get('eyeBall') || searchParams.get('eyeball') || 'square';
  const frame = searchParams.get('frame') || 'none';
  const frameText = searchParams.get('frameText') || searchParams.get('cta') || 'SCAN ME';
  const frameColor = searchParams.get('frameColor') || searchParams.get('fc') || '#000000';

  const logoUrl = getPresetLogoUrl(resolvedLogo);

  // Render QR Canvas - plain image mode
  useEffect(() => {
    if (!containerRef.current || !isQr || !isImageMode) return;

    const effectiveEc = logoUrl ? 'H' : ec;

    const options = {
      width: qrSize,
      height: qrSize,
      data: qrData || 'https://rajlabs.in',
      margin: qrMargin,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: effectiveEc,
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
      setQrReady(true);
    } else {
      qrInstance.current.update(options);
    }

    // auto download if requested
    if (shouldDownload && qrInstance.current) {
      const ext = rawMode === 'svg' ? 'svg' : 'png';
      setTimeout(() => qrInstance.current?.download({ name: slug || 'qr-code', extension: ext }), 400);
    }
  }, [qrData, size, qrSize, qrMargin, ec, bgColor, fgColor, dotStyle, cornerSquareStyle, cornerDotStyle, logoUrl, isImageMode, isQr, slug, shouldDownload, rawMode]);

  // Also update when rawMode switches to svg - handle extension

  // Compute tool results for non-QR or json modes
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
        const text = inputDataFallback || 'Hello World';
        const hashes = asyncHashes || {
          md5: SparkMD5.hash(text),
          sha1: 'computing...',
          sha256: 'computing...',
          sha512: 'computing...',
        };
        const outText = hashes.sha256 !== 'computing...' ? hashes.sha256 : hashes.md5;
        return { text: outText, json: { success: true, input: text, hashes } };
      }
      case 'jwt-decoder': {
        const token = searchParams.get('token') || searchParams.get('jwt') || inputDataFallback;
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
          const res = mode === 'decode' ? atob(inputDataFallback) : btoa(inputDataFallback);
          return { text: res, json: { success: true, mode, input: inputDataFallback, output: res } };
        } catch (e) {
          return { text: 'Base64 operation failed', json: { success: false, error: e.message } };
        }
      }
      case 'url-encoder-decoder': {
        const mode = searchParams.get('mode') || 'encode';
        const res = mode === 'decode' ? decodeURIComponent(inputDataFallback) : encodeURIComponent(inputDataFallback);
        return { text: res, json: { success: true, mode, input: inputDataFallback, output: res } };
      }
      case 'timestamp-converter': {
        const tsParam = searchParams.get('ts') || searchParams.get('time') || Date.now();
        let num = Number(tsParam);
        if (num < 10000000000) num *= 1000;
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
          const parsed = JSON.parse(inputDataFallback || '[]');
          const csv = Papa.unparse(parsed);
          return { text: csv, json: { success: true, csv } };
        } catch (e) {
          return { text: 'Invalid JSON', json: { success: false, error: e.message } };
        }
      }
      case 'csv-to-json': {
        try {
          const parsed = Papa.parse(inputDataFallback || '', { header: true });
          return { text: JSON.stringify(parsed.data, null, 2), json: { success: true, data: parsed.data } };
        } catch (e) {
          return { text: 'Invalid CSV', json: { success: false, error: e.message } };
        }
      }
      case 'json-to-yaml': {
        try {
          const parsed = JSON.parse(inputDataFallback || '{}');
          const yml = yaml.dump(parsed);
          return { text: yml, json: { success: true, yaml: yml } };
        } catch (e) {
          return { text: 'Invalid JSON', json: { success: false, error: e.message } };
        }
      }
      case 'yaml-to-json': {
        try {
          const parsed = yaml.load(inputDataFallback || '');
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
      case 'qr-code-generator':
      case 'upi-code-generator':
      case 'whatsapp-qr-code': {
        // For QR tools, json mode should return metadata + data
        return { text: qrData, json: { success: true, tool: slug, data: qrData, size, logo: resolvedLogo, frame, frameText } };
      }
      default:
        return { text: inputDataFallback, json: { success: true, tool: slug || 'unknown', data: inputDataFallback } };
    }
  };

  const { text: resultText, json: resultJson } = computeResult();

  // --- Raw Plaintext Mode (text / csv / yaml / xml) ---
  if (['text','plain','csv','yaml','xml'].includes(rawMode)) {
    return (
      <pre style={{ margin: 0, padding: '1rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#ffffff', color: '#0f172a' }}>
        {resultText}
      </pre>
    );
  }

  // --- Raw JSON Mode - truly raw JSON without HTML chrome (header already hidden by MainLayout) ---
  if (rawMode === 'json' || (!isQr && !isImageMode)) {
    return (
      <pre style={{ margin: 0, padding: '1rem', fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#ffffff', color: '#0f172a' }}>
        {JSON.stringify(resultJson, null, 2)}
      </pre>
    );
  }

  // --- QR Code Plain Image Mode - no toolbar/chrome, just centered QR ---
  // Developer can control exact pixel size via ?size= (32-1024) and whitespace via ?margin= (0-40, alias ?m=)
  // Use ?size=64&margin=0 for tiny popup, ?size=128 for tooltip, ?size=512 for print
  if (isQr && isImageMode) {
    const outerBg = frame !== 'none' ? frameColor : '#ffffff';
    const isSmall = qrSize <= 128;
    return (
      <div
        className="w-full flex flex-col items-center justify-center select-none"
        style={{ backgroundColor: outerBg, margin: 0, padding: frame !== 'none' ? (isSmall ? '6px' : '8px') : '0', minHeight: '100vh', minWidth: '100vw' }}
      >
        {frame === 'banner-top' && (
          <div className="text-white font-extrabold uppercase tracking-wider px-4 text-center" style={{ color: '#ffffff', fontSize: isSmall ? '11px' : '13px', marginBottom: isSmall ? '4px' : '6px' }}>
            {frameText}
          </div>
        )}
        <div
          ref={containerRef}
          className="flex items-center justify-center"
          style={{ backgroundColor: bgColor, padding: 0, borderRadius: frame !== 'none' ? '10px' : '0', lineHeight: 0, display: 'inline-flex' }}
        />
        {frame === 'banner-bottom' && (
          <div className="text-white font-extrabold uppercase tracking-wider px-4 text-center" style={{ color: '#ffffff', fontSize: isSmall ? '11px' : '13px', marginTop: isSmall ? '4px' : '6px' }}>
            {frameText}
          </div>
        )}
        {/* Hidden but ensures canvas renders even before useEffect */}
        {!qrReady && <span className="sr-only">Generating QR...</span>}
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-white text-slate-900 p-4 font-mono text-xs">
      <pre>{JSON.stringify(resultJson, null, 2)}</pre>
    </div>
  );
}
