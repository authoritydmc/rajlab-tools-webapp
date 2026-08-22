import React, { useState } from 'react';
import { FaCode, FaGithub, FaCopy, FaCheck, FaExternalLinkAlt, FaTerminal, FaChevronDown, FaChevronUp, FaImage, FaLayerGroup, FaReact, FaMarkdown } from 'react-icons/fa';
import { SiPostman } from 'react-icons/si';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { getToolInfo, getGitHubUrl } from '../../utils/toolRegistry';

export default function DeveloperEmbedGuide({ currentPath, activeParams = {} }) {
  const { isDarkMode } = useTheme();
  const [copiedKey, setCopiedKey] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('img'); // 'img' | 'iframe' | 'react' | 'curl' | 'markdown' | 'raw'

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

  const isQrTool = currentPath.includes('qr');

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

  const curlSnippet = `# Fetch raw image via cURL / CLI
curl -o qr-code.png "${rawImageUrl}"

# Or fetch JSON payload with metadata
curl -X GET "${rawJsonUrl}"`;

  const markdownSnippet = isQrTool 
    ? `<!-- Markdown Image Embed (Works in GitHub READMEs, Notion, Obsidian) -->
![${toolInfo.title}](${rawImageUrl})`
    : `[![${toolInfo.title}](${origin}/logo_raj_light.png)](${directToolUrl})`;

  const fetchJsonSnippet = `// Direct Client/Server Fetch
async function getToolOutput() {
  const res = await fetch("${rawJsonUrl}");
  const data = await res.json();
  console.log("Output Payload:", data);
}`;

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
      default: return imgTagSnippet;
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
              Direct branded image links (?raw=image), preset logos, frames, dot styles, iframes, and cURL commands.
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
                    {toolInfo.queryParams.map((param, pIdx) => (
                      <tr key={pIdx} className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                        <td className="px-3.5 py-2.5 font-mono font-bold text-indigo-400">
                          {param.name}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono text-slate-400">
                          {param.aliases && param.aliases.length > 0 ? param.aliases.join(', ') : '-'}
                        </td>
                        <td className="px-3.5 py-2.5 text-amber-400/90 font-mono text-[11px]">
                          {param.type}
                        </td>
                        <td className={`px-3.5 py-2.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {param.description}
                        </td>
                      </tr>
                    ))}
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
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/40">
                <button
                  onClick={() => copyToClipboard(directToolUrl, 'live-url')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    copiedKey === 'live-url' ? 'bg-emerald-600 text-white' : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {copiedKey === 'live-url' ? <FaCheck size={11} /> : <FaCopy size={11} />}
                  <span>Copy Page URL</span>
                </button>
              </div>
            </div>

            {/* Direct Image / Asset URL */}
            {isQrTool && (
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
            )}
          </div>

          {/* Ready-to-use Code Generator Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  ...(isQrTool ? [{ id: 'img', label: 'HTML <img>' }] : []),
                  { id: 'iframe', label: 'HTML <iframe>' },
                  { id: 'react', label: 'React JSX' },
                  { id: 'curl', label: 'cURL / Shell' },
                  { id: 'markdown', label: 'Markdown' },
                  { id: 'raw', label: 'Fetch / JSON API' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === tab.id
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
                ))}
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
