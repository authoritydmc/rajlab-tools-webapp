import React, { useState, useRef, useEffect } from 'react';
import { FaCode, FaGithub, FaCopy, FaCheck, FaExternalLinkAlt, FaTerminal, FaChevronDown, FaChevronUp, FaImage, FaLayerGroup, FaReact, FaMarkdown, FaRobot, FaMagic } from 'react-icons/fa';
import { SiPostman } from 'react-icons/si';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { getToolInfo, getGitHubUrl } from '../../utils/toolRegistry';
import QRCodeStyling from 'qr-code-styling';
import { getPresetLogoUrl, detectBrandFromData } from '../../utils/qrLogoPresets';

export default function DeveloperEmbedGuide({ currentPath, activeParams = {} }) {
  const { isDarkMode } = useTheme();
  const [copiedKey, setCopiedKey] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('img'); // 'img' | 'ai' | 'iframe' | 'react' | 'curl' | 'markdown' | 'raw'
  const [previewSize, setPreviewSize] = useState(null);
  const [previewMargin, setPreviewMargin] = useState(null);
  const previewRef = useRef(null);
  const previewQrRef = useRef(null);

  const toolInfo = getToolInfo(currentPath);
  const githubUrl = getGitHubUrl(currentPath);

  if (!toolInfo) return null;

  // Build current query string from activeParams
  const searchParams = new URLSearchParams();
  if (activeParams && typeof activeParams === 'object') {
    Object.entries(activeParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.set(k, String(v));
      }
    });
  }
  
  const queryString = searchParams.toString();
  const origin = window.location.origin;
  const directToolUrl = `${origin}${currentPath}${queryString ? `?${queryString}` : ''}`;
  const embedUrl = `${origin}${currentPath}?${queryString ? `${queryString}&` : ''}embed=true`;
  const rawImageUrl = `${origin}${currentPath}?${queryString ? `${queryString}&` : ''}raw=image`;
  const rawSvgUrl = `${origin}${currentPath}?${queryString ? `${queryString}&` : ''}raw=svg`;
  const rawJsonUrl = `${origin}${currentPath}?${queryString ? `${queryString}&` : ''}raw=json`;
  const rawTextUrl = `${origin}${currentPath}?${queryString ? `${queryString}&` : ''}raw=text`;

  const IMAGE_TOOLS = ['/qr-code-generator', '/upi-code-generator', '/whatsapp-qr-code'];
  const isImageTool = IMAGE_TOOLS.includes(currentPath);
  // Legacy alias for older code branches
  const isQrTool = isImageTool;
  const hasRawParam = toolInfo.queryParams?.some(p => p.name === 'raw');
  const hasImageRaw = isImageTool;
  const hasJsonRaw = hasRawParam && !['/qr-scanner','/json-diff-checker','/regex-tester','/timestamp-converter','/css-unit-converter','/color-picker','/markdown-preview','/image-to-base64','/base64-to-image','/print-cost-estimator','/image-compressor','/video-converter','/merge-pdf','/split-pdf','/unlock-pdf','/unlock-excel'].includes(currentPath);

  const extractOptions = (typeStr) => {
    if (!typeStr) return [];
    const quoted = typeStr.match(/"([^"]+)"/g);
    if (quoted) return quoted.map(s => s.replace(/"/g, '')).slice(0, 8);
    // fallback for boolean / number hints
    if (typeStr.includes('boolean')) return ['true','false'];
    return [];
  };
  const isParamActive = (name, aliases = []) => {
    if (activeParams[name] !== undefined) return true;
    return aliases.some(a => activeParams[a] !== undefined);
  };
  const getRawUrlWithSize = (sz, margin) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('size', String(sz));
    if (margin !== undefined) sp.set('margin', String(margin));
    sp.set('raw', 'image');
    return `${origin}${currentPath}?${sp.toString()}`;
  };
  const effectivePreviewSize = previewSize ?? (activeParams.size ? Number(activeParams.size) : 256);
  const effectivePreviewMargin = previewMargin ?? 10;
  const effectivePreviewUrl = getRawUrlWithSize(effectivePreviewSize, effectivePreviewMargin);

  // Build QR data for live canvas preview (so <img> not needed)
  const getPreviewQrData = () => {
    if (currentPath === '/upi-code-generator') {
      const pa = activeParams.pa || activeParams.upi || activeParams.vpa || 'demo@ybl';
      let link = `upi://pay?pa=${encodeURIComponent(pa)}&cu=INR`;
      if (activeParams.pn) link += `&pn=${encodeURIComponent(activeParams.pn)}`;
      if (activeParams.am || activeParams.amount) link += `&am=${encodeURIComponent(activeParams.am || activeParams.amount)}`;
      return link;
    }
    if (currentPath === '/whatsapp-qr-code') {
      const phone = activeParams.phone || activeParams.number || activeParams.p || '919876543210';
      const code = activeParams.code || activeParams.cc || '91';
      const msg = activeParams.message || activeParams.msg || '';
      const cleanPhone = String(phone).replace(/\s+/g, '');
      return `https://wa.me/${code}${cleanPhone}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
    }
    return activeParams.data || activeParams.text || activeParams.url || activeParams.q || 'https://rajlabs.in';
  };
  const previewQrData = hasImageRaw ? getPreviewQrData() : '';

  useEffect(() => {
    if (!hasImageRaw || !previewRef.current) return;
    const logo = activeParams.logo || activeParams.icon || 'none';
    const logoUrl = getPresetLogoUrl(logo !== 'auto' ? logo : (detectBrandFromData(previewQrData) || 'none'));
    const bg = activeParams.bg ? `#${String(activeParams.bg).replace('#','')}` : (activeParams.theme==='dark' ? '#0f172a' : '#ffffff');
    const fg = activeParams.fg ? `#${String(activeParams.fg).replace('#','')}` : (activeParams.theme==='dark' ? '#ffffff' : '#000000');
    const opts = {
      width: Math.max(32, Math.min(256, effectivePreviewSize)),
      height: Math.max(32, Math.min(256, effectivePreviewSize)),
      data: previewQrData,
      margin: effectivePreviewMargin,
      qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: logoUrl ? 'H' : 'M' },
      imageOptions: { hideBackgroundDots: true, imageSize: 0.3, margin: 4, crossOrigin: 'anonymous' },
      dotsOptions: { color: fg, type: activeParams.dots || activeParams.dotStyle || 'square' },
      backgroundOptions: { color: bg },
      cornersSquareOptions: { color: fg, type: activeParams.corner || activeParams.eyeFrame || 'square' },
      cornersDotOptions: { color: fg, type: 'square' },
      image: logoUrl || undefined,
    };
    if (!previewQrRef.current) {
      previewQrRef.current = new QRCodeStyling(opts);
      previewRef.current.innerHTML = '';
      previewQrRef.current.append(previewRef.current);
    } else {
      previewQrRef.current.update(opts);
    }
  }, [hasImageRaw, previewQrData, effectivePreviewSize, effectivePreviewMargin, activeParams]);

  // Interactive Embed & API Snippets
  const imgTagSnippet = `<!-- Embed live branded QR image directly into any website or email -->
<img
  src="${rawImageUrl}"
  alt="${toolInfo.title}"
  width="${activeParams.size || 256}"
  height="${activeParams.size || 256}"
  loading="lazy"
/>`;

  const iframeSnippet = `<!-- Headless responsive widget embed -->
<iframe
  src="${embedUrl}"
  width="100%"
  height="480"
  frameborder="0"
  style="border-radius: 16px; border: 1px solid rgba(148,163,184,0.2); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);"
  title="${toolInfo.title}"
  allow="clipboard-write"
></iframe>`;

  const reactSnippet = isQrTool
    ? `// 1. Direct Image Component in React / Next.js
export function BrandedQRCode() {
  return (
    <img
      src="${rawImageUrl}"
      alt="${toolInfo.title}"
      width={${activeParams.size || 256}}
      height={${activeParams.size || 256}}
      className="rounded-2xl shadow-lg"
    />
  );
}`
    : `// Responsive Embed in React
export function EmbeddedTool() {
  return (
    <iframe
      src="${embedUrl}"
      width="100%"
      height="480"
      className="rounded-2xl border border-slate-700/50 shadow-xl"
      title="${toolInfo.title}"
      allow="clipboard-write"
    />
  );
}`;

  const curlSnippet = hasImageRaw
    ? `# Fetch raw image via cURL / CLI
curl -o qr-code.png "${rawImageUrl}"

# Or fetch JSON payload with metadata
curl -X GET "${rawJsonUrl}"`
    : hasJsonRaw
    ? `# Fetch raw output via cURL
curl -X GET "${rawJsonUrl}"
# For plain text
curl -X GET "${rawTextUrl}"`
    : `# Embed via iframe
curl -X GET "${embedUrl}"`;

  const markdownSnippet = hasImageRaw 
    ? `<!-- Markdown Image Embed (Works in GitHub READMEs, Notion, Obsidian) -->
![${toolInfo.title}](${rawImageUrl})`
    : `[![${toolInfo.title}](${origin}/logo_raj_light.png)](${directToolUrl})`;

  const fetchJsonSnippet = hasImageRaw
    ? `// Fetch branded QR image metadata
async function getToolOutput() {
  const res = await fetch("${rawJsonUrl}");
  const data = await res.json();
  console.log("Output Payload:", data);
}`
    : hasJsonRaw
    ? `// Direct Client/Server Fetch
async function getToolOutput() {
  const res = await fetch("${rawJsonUrl}");
  const data = await res.json();
  console.log("Output Payload:", data);
}`
    : `// Embed the tool via iframe
// src="${embedUrl}"`;

  // AI Prompt for integration — copy-paste into ChatGPT/Claude/Cursor to let AI integrate this tool
  const aiPromptSnippet = `You are an expert developer assistant. Integrate the Rajlabs Utilities tool "${toolInfo.title}" (${toolInfo.description}) into my app.

Tool URL: ${origin}${currentPath}
Current live example (with my current inputs):
- Interactive UI: ${directToolUrl}
- Embed iframe: ${embedUrl}
${hasImageRaw ? `- Raw branded image (for <img> / email / popup): ${rawImageUrl}
  Query controls: size=32..1024 (popup: 64-96, tooltip: 128, card: 256, print: 512) , margin=0..40 (whitespace, 0=tight), logo=upi/gpay/phonepe/paytm/whatsapp/rajlabs/link/wifi/none, frame=none/banner-bottom/banner-top, frameText, theme=light/dark, bg/fg hex without #, dots=square/rounded/dots/classy, corner=square/extra-rounded/dot
  Variants: small popup: ${getRawUrlWithSize(64, 0)} | tooltip: ${getRawUrlWithSize(128, 2)} | hi-res: ${getRawUrlWithSize(512, 10)}
  HTML: <img src="${rawImageUrl}" width="${activeParams.size || 256}" height="${activeParams.size || 256}" loading="lazy" alt="${toolInfo.title}" />
  React: <img src="${rawImageUrl}" width={${activeParams.size || 256}} height={${activeParams.size || 256}} />
  cURL: curl -o qr.png "${rawImageUrl}"
  SVG: ${rawSvgUrl}
  JSON metadata: ${rawJsonUrl}` : hasJsonRaw ? `- Raw JSON API: ${rawJsonUrl}
- Raw text: ${rawTextUrl}
- Embed iframe: ${embedUrl}
- cURL: curl "${rawJsonUrl}"` : `- Embed iframe: ${embedUrl}`}

Supported query params:
${toolInfo.queryParams?.map(p => `- ${p.name} (${p.aliases?.join(', ')||'no alias'}): ${p.type} — ${p.description}`).join('\n')}

Instructions for you (AI):
1. Generate production-ready code (React / Next.js / Vue / plain HTML + JS / Python) that calls the raw endpoint with proper query encoding.
2. Respect size/margin for responsive popups vs print.
3. Handle CORS (same-origin fetch allowed) and show error handling.
4. Do NOT use the interactive UI URL for <img> — use ?raw=image for images, ?raw=json for data.
5. Provide copy-pasteable snippet + explanation.

Current queryString: "${queryString || '(none — using defaults)'}"
Source: ${githubUrl}
`;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getActiveSnippet = () => {
    switch (activeTab) {
      case 'img': return imgTagSnippet;
      case 'iframe': return iframeSnippet;
      case 'react': return reactSnippet;
      case 'curl': return curlSnippet;
      case 'markdown': return markdownSnippet;
      case 'raw': return fetchJsonSnippet;
      case 'ai': return aiPromptSnippet;
      default: return hasImageRaw ? imgTagSnippet : iframeSnippet;
    }
  };

  return (
    <div className={`w-full mt-8 rounded-2xl border transition-all duration-300 overflow-hidden shadow-md ${
      isDarkMode 
        ? 'bg-slate-900/70 border-slate-700/60 backdrop-blur-xl' 
        : 'bg-white/80 border-slate-200/80 backdrop-blur-xl'
    }`}>
      {/* Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors border-b ${
          isDarkMode 
            ? 'bg-slate-800/50 hover:bg-slate-800/80 border-slate-700/50' 
            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/60'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${
            isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
          }`}>
            <FaCode />
          </div>
          <div>
            <h3 className={`text-base font-bold flex items-center gap-2 ${
              isDarkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              Developer Guide, Image API & Embed SDK
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
              }`}>
                REST / Query API
              </span>
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {hasImageRaw ? 'Direct branded image links (?raw=image), preset logos, frames, dot styles, iframes, and cURL commands.' : hasJsonRaw ? 'Direct raw JSON/text endpoints (?raw=json), iframe embeds, and cURL/JS fetch snippets — live URLs update as you type.' : 'Iframe embeds, live URLs, and code snippets — parameters update dynamically.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
              isDarkMode 
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600 hover:text-white' 
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:text-black shadow-sm'
            }`}
            title="View source on GitHub"
          >
            <FaGithub size={14} />
            <span>Source Code</span>
          </a>
          <button className={`p-2 rounded-lg text-slate-400 hover:text-slate-200 transition-colors`}>
            {isExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Query Parameters Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                <FaTerminal className="text-indigo-400" size={12} />
                Supported Query Parameters & Presets
              </h4>
              <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Parameters are applied dynamically
              </span>
            </div>

            {toolInfo.queryParams && toolInfo.queryParams.length > 0 ? (
              <div className={`overflow-x-auto rounded-xl border ${isDarkMode ? 'border-slate-700/50 bg-slate-950/40' : 'border-slate-200 bg-slate-50/50'}`}>
                <table className="w-full text-left text-xs">
                  <thead className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-900/60' : 'border-slate-200 text-slate-600 bg-slate-100'}`}>
                    <tr>
                      <th className="px-3.5 py-2.5 font-semibold">Param</th>
                      <th className="px-3.5 py-2.5 font-semibold">Aliases</th>
                      <th className="px-3.5 py-2.5 font-semibold">Type / Options</th>
                      <th className="px-3.5 py-2.5 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {toolInfo.queryParams.map((param, pIdx) => {
                      const active = isParamActive(param.name, param.aliases);
                      const opts = extractOptions(param.type);
                      return (
                        <tr key={pIdx} className={`${active ? (isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50/70') : ''} ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'} transition-colors`}>
                          <td className="px-3.5 py-2.5 font-mono font-bold">
                            <button
                              onClick={() => copyToClipboard(`${param.name}=${param.default !== undefined && param.default !== '' ? param.default : 'value'}`, `param-${pIdx}`)}
                              className={`px-1.5 py-0.5 rounded text-xs font-bold transition-colors ${active ? 'bg-indigo-600 text-white' : 'text-indigo-400 hover:bg-indigo-500/20'}`}
                              title="Click to copy param example"
                            >
                              {param.name}
                            </button>
                            {active && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Active in current URL" />}
                          </td>
                          <td className="px-3.5 py-2.5 font-mono text-slate-400 text-[11px]">
                            {param.aliases && param.aliases.length > 0 ? param.aliases.join(', ') : '-'}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <div className="text-amber-400/90 font-mono text-[11px] mb-1">{param.type}</div>
                            {opts.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {opts.map(opt => {
                                  const isOptActive = String(activeParams[param.name]) === opt || (param.aliases||[]).some(a => String(activeParams[a])===opt);
                                  return (
                                    <button
                                      key={opt}
                                      onClick={() => copyToClipboard(`${param.name}=${opt}`, `opt-${pIdx}-${opt}`)}
                                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${isOptActive ? 'bg-indigo-600 text-white border-indigo-500' : isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-indigo-500/50 hover:text-white' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                                      title={`Copy ${param.name}=${opt}`}
                                    >
                                      {copiedKey === `opt-${pIdx}-${opt}` ? '✓' : ''} {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                          <td className={`px-3.5 py-2.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            {param.description}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>

          {/* Direct API Endpoints Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Live Configured Tool URL */}
            <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Interactive UI URL (With Current Inputs)
                </span>
                <div className="font-mono text-xs text-emerald-400 break-all select-all mb-2">
                  {directToolUrl}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/40 flex-wrap">
                <button
                  onClick={() => copyToClipboard(directToolUrl, 'live-url')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    copiedKey === 'live-url' ? 'bg-emerald-600 text-white' : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {copiedKey === 'live-url' ? <FaCheck size={11} /> : <FaCopy size={11} />}
                  <span>Copy Page URL</span>
                </button>
                {hasImageRaw && (
                  <button
                    onClick={() => copyToClipboard(rawImageUrl, 'live-raw-url')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      copiedKey === 'live-raw-url' ? 'bg-emerald-600 text-white' : isDarkMode ? 'bg-indigo-900/40 text-indigo-300 hover:bg-indigo-800/60 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                    title="Copy RAW image URL (?raw=image) for direct <img> embedding"
                  >
                    {copiedKey === 'live-raw-url' ? <FaCheck size={11} /> : <FaImage size={11} />}
                    <span>Copy RAW URL</span>
                  </button>
                )}
                {hasJsonRaw && !hasImageRaw && (
                  <button
                    onClick={() => copyToClipboard(rawJsonUrl, 'live-raw-url')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      copiedKey === 'live-raw-url' ? 'bg-emerald-600 text-white' : isDarkMode ? 'bg-emerald-900/30 text-emerald-300 hover:bg-emerald-800/50 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                    title="Copy RAW JSON URL (?raw=json)"
                  >
                    {copiedKey === 'live-raw-url' ? <FaCheck size={11} /> : <FaCopy size={11} />}
                    <span>Copy RAW URL</span>
                  </button>
                )}
              </div>
            </div>

            {/* Direct Image / Raw Data Endpoint - only show if tool supports raw */}
            {hasImageRaw ? (
              <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 text-indigo-400`}>
                    Direct Branded Image Endpoint (?raw=image)
                  </span>
                  <div className="font-mono text-xs text-indigo-300 break-all select-all mb-2">
                    {rawImageUrl}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/40">
                  <button
                    onClick={() => copyToClipboard(rawImageUrl, 'raw-img-url')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      copiedKey === 'raw-img-url' ? 'bg-emerald-600 text-white' : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {copiedKey === 'raw-img-url' ? <FaCheck size={11} /> : <FaCopy size={11} />}
                    <span>Copy Image Link</span>
                  </button>
                  <a
                    href={rawImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
                  >
                    <FaExternalLinkAlt size={10} />
                    <span>View Image</span>
                  </a>
                </div>
              </div>
            ) : hasJsonRaw ? (
              <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 text-emerald-400`}>
                    Direct Raw Data Endpoint (?raw=json)
                  </span>
                  <div className="font-mono text-xs text-emerald-300 break-all select-all mb-2">
                    {rawJsonUrl}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/40">
                  <button
                    onClick={() => copyToClipboard(rawJsonUrl, 'raw-json-url')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      copiedKey === 'raw-json-url' ? 'bg-emerald-600 text-white' : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {copiedKey === 'raw-json-url' ? <FaCheck size={11} /> : <FaCopy size={11} />}
                    <span>Copy JSON Link</span>
                  </button>
                  <a
                    href={rawJsonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
                  >
                    <FaExternalLinkAlt size={10} />
                    <span>View JSON</span>
                  </a>
                </div>
              </div>
            ) : null}
          </div>

          {/* Live realtime preview for image tools — canvas-based, no <img> */}
          {hasImageRaw && (
            <div className={`p-4 rounded-xl border space-y-3 ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-24 h-24 rounded-xl overflow-hidden border flex items-center justify-center shrink-0 p-1 ${isDarkMode ? 'bg-white border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div ref={previewRef} className="w-full h-full flex items-center justify-center [&>canvas]:max-w-full [&>canvas]:max-h-full [&>canvas]:w-auto [&>canvas]:h-auto" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-bold flex items-center gap-1.5 flex-wrap ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    <FaImage className="text-indigo-400" size={12} />
                    Live Realtime Preview
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>auto-updates</span>
                    <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>size via ?size= & ?margin=</span>
                    {(previewSize || previewMargin!==null) && <button onClick={() => { setPreviewSize(null); setPreviewMargin(null); }} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-200 hover:bg-slate-600">Reset</button>}
                  </div>
                  <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Developer controls size: <code className="font-mono bg-slate-800/50 px-1 rounded">size=32..1024</code> (popup 64, tooltip 128), whitespace <code className="font-mono bg-slate-800/50 px-1 rounded">margin=0..40</code> (0 = tight). Now {effectivePreviewSize}×{effectivePreviewSize} margin {effectivePreviewMargin}</p>
                  <div className="font-mono text-[11px] text-indigo-400 break-all mt-1 select-all">{effectivePreviewUrl}</div>
                </div>
                <a href={effectivePreviewUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white">Open</a>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-700/20">
                <span className={`text-[11px] font-semibold self-center ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Quick sizes:</span>
                {[
                  { sz: 64, label: '64 popup', margin: 0 },
                  { sz: 96, label: '96 small', margin: 1 },
                  { sz: 128, label: '128 tooltip', margin: 2 },
                  { sz: 256, label: '256 card', margin: 10 },
                  { sz: 512, label: '512 print', margin: 10 },
                ].map(({sz, label, margin}) => {
                  const isSel = effectivePreviewSize===sz && effectivePreviewMargin===margin;
                  return (
                    <button key={sz} onClick={() => { setPreviewSize(sz); setPreviewMargin(margin); copyToClipboard(getRawUrlWithSize(sz, margin), `size-${sz}`); }} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${isSel ? 'bg-indigo-600 text-white border-indigo-500 shadow' : copiedKey===`size-${sz}` ? 'bg-emerald-600 text-white border-emerald-500' : isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-500/40 hover:text-amber-300' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400'}`} title={`Preview + copy ${sz}px`}>
                      {isSel ? '● ' : copiedKey===`size-${sz}` ? '✓ ' : ''}{label}
                    </button>
                  );
                })}
                <button onClick={() => { setPreviewSize(64); setPreviewMargin(0); copyToClipboard(getRawUrlWithSize(64,0), 'size-tight'); }} className={`px-2 py-1 rounded-full text-[11px] font-mono border ${previewMargin===0 && previewSize===64 ? 'bg-amber-500 text-slate-900 border-amber-400' : isDarkMode ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>tight: &margin=0</button>
              </div>
            </div>
          )}

          {/* Ready-to-use Code Generator Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  ...(hasImageRaw ? [{ id: 'img', label: 'HTML <img>' }] : []),
                  { id: 'ai', label: '✨ AI Prompt', isAi: true },
                  { id: 'iframe', label: 'HTML <iframe>' },
                  { id: 'react', label: 'React JSX' },
                  { id: 'curl', label: 'cURL / Shell' },
                  { id: 'markdown', label: 'Markdown' },
                  { id: 'raw', label: 'Fetch / JSON API' },
                ].map(tab => {
                  const isAi = tab.isAi;
                  const isActive = activeTab === tab.id;
                  if (isAi) {
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border relative overflow-hidden ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-900 border-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.7)] animate-pulse'
                            : 'bg-gradient-to-r from-amber-500/15 via-yellow-400/15 to-amber-500/15 text-amber-300 border-amber-500/40 hover:from-amber-500/25 hover:via-yellow-400/25 hover:to-amber-500/25 hover:border-amber-400 hover:shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                        }`}
                        style={{ boxShadow: isActive ? '0 0 20px rgba(251,191,36,0.6), 0 0 40px rgba(251,191,36,0.3)' : undefined }}
                      >
                        <FaRobot size={12} />
                        {tab.label}
                        {!isActive && <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%' }} />}
                      </button>
                    );
                  }
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? isDarkMode
                            ? 'bg-indigo-600 text-white shadow-md font-bold'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold'
                          : isDarkMode
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => copyToClipboard(getActiveSnippet(), activeTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                  copiedKey === activeTab
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {copiedKey === activeTab ? <FaCheck size={11} /> : <FaCopy size={11} />}
                <span>{copiedKey === activeTab ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Box */}
            <div className={`relative rounded-2xl overflow-hidden border p-4 font-mono text-xs ${
              isDarkMode ? 'bg-slate-950/90 border-slate-800 text-slate-300' : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}>
              <pre className="overflow-x-auto whitespace-pre">
                {getActiveSnippet()}
              </pre>
            </div>
          </div>

          {/* GitHub Source Footer */}
          <div className={`pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
            isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center gap-2">
              <FaGithub className="text-slate-400" size={16} />
              <span>
                Component Source:{' '}
                <code className="font-mono text-indigo-400 font-semibold">{toolInfo.sourceFile}</code>
              </span>
            </div>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-semibold underline hover:text-indigo-400 flex items-center gap-1 transition-colors ${
                isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
              }`}
            >
              <span>Contribute on GitHub</span>
              <FaExternalLinkAlt size={10} />
            </a>
          </div>

        </div>
      )}
    </div>
  );
}
