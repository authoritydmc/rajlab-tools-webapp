import React, { useState } from 'react';
import { FaCode, FaGithub, FaCopy, FaCheck, FaExternalLinkAlt, FaTerminal, FaChevronDown, FaChevronUp, FaImage } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { getToolInfo, getGitHubUrl } from '../../utils/toolRegistry';

export default function DeveloperEmbedGuide({ currentPath, activeParams = {} }) {
  const { isDarkMode } = useTheme();
  const [copiedKey, setCopiedKey] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('iframe'); // 'iframe' | 'img' | 'raw' | 'react' | 'markdown'

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
  const rawJsonUrl = `${origin}${currentPath}?${queryString ? `${queryString}&` : ''}raw=json`;

  const isQrTool = currentPath.includes('qr');

  const iframeSnippet = `<iframe
  src="${embedUrl}"
  width="100%"
  height="450"
  frameborder="0"
  style="border-radius: 12px; border: 1px solid rgba(148,163,184,0.2);"
  title="${toolInfo.title}"
  allow="clipboard-write"
></iframe>`;

  const imgTagSnippet = `<img
  src="${rawImageUrl}"
  alt="${toolInfo.title}"
  width="${activeParams.size || 256}"
  height="${activeParams.size || 256}"
/>`;

  const markdownSnippet = isQrTool 
    ? `![${toolInfo.title}](${rawImageUrl})`
    : `[![${toolInfo.title}](${origin}/logo_raj_light.png)](${directToolUrl})`;

  const reactSnippet = isQrTool 
    ? `// Use directly as an Image tag
<img src="${rawImageUrl}" alt="${toolInfo.title}" width={${activeParams.size || 256}} />`
    : `// Embed as iframe in React
<iframe
  src="${embedUrl}"
  width="100%"
  height="450"
  style={{ borderRadius: '12px', border: '1px solid rgba(148,163,184,0.2)' }}
  title="${toolInfo.title}"
  allow="clipboard-write"
/>`;

  const fetchJsonSnippet = `// Direct API / Raw JSON Fetch
fetch("${rawJsonUrl}")
  .then(res => res.json())
  .then(data => console.log(data));`;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getActiveSnippet = () => {
    switch (activeTab) {
      case 'iframe': return iframeSnippet;
      case 'img': return imgTagSnippet;
      case 'raw': return fetchJsonSnippet;
      case 'react': return reactSnippet;
      case 'markdown': return markdownSnippet;
      default: return iframeSnippet;
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
              Developer Guide, Direct Image & Embed API
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
              }`}>
                Open Source
              </span>
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Direct URLs with query parameters, clean image embeds (?raw=image), iframes, and white/dark themes.
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
            <span>View Source</span>
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
                Supported Query Parameters
              </h4>
              <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Auto-generates on page load
              </span>
            </div>

            {toolInfo.queryParams && toolInfo.queryParams.length > 0 ? (
              <div className={`overflow-x-auto rounded-xl border ${isDarkMode ? 'border-slate-700/50 bg-slate-950/40' : 'border-slate-200 bg-slate-50/50'}`}>
                <table className="w-full text-left text-xs">
                  <thead className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-900/60' : 'border-slate-200 text-slate-600 bg-slate-100'}`}>
                    <tr>
                      <th className="px-3.5 py-2.5 font-semibold">Parameter</th>
                      <th className="px-3.5 py-2.5 font-semibold">Aliases</th>
                      <th className="px-3.5 py-2.5 font-semibold">Type</th>
                      <th className="px-3.5 py-2.5 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {toolInfo.queryParams.map((param, pIdx) => (
                      <tr key={pIdx} className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                        <td className="px-3.5 py-2 font-mono font-bold text-indigo-400">
                          {param.name}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-slate-400">
                          {param.aliases && param.aliases.length > 0 ? param.aliases.join(', ') : '-'}
                        </td>
                        <td className="px-3.5 py-2 text-amber-400/90 font-mono">
                          {param.type}
                        </td>
                        <td className={`px-3.5 py-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {param.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>

          {/* Live Direct URLs */}
          <div className="space-y-2">
            {/* Live Interactive Page URL */}
            <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Direct URL (With User Inputs)
                  </span>
                  <div className="font-mono text-xs text-emerald-400 break-all select-all">
                    {directToolUrl}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyToClipboard(directToolUrl, 'live-url')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      copiedKey === 'live-url'
                        ? 'bg-emerald-600 text-white'
                        : isDarkMode
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {copiedKey === 'live-url' ? <FaCheck size={12} /> : <FaCopy size={12} />}
                    <span>{copiedKey === 'live-url' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Direct Raw Image / Asset URL */}
            {isQrTool && (
              <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 text-indigo-400`}>
                      Pure Direct Image Endpoint (?raw=image)
                    </span>
                    <div className="font-mono text-xs text-indigo-300 break-all select-all">
                      {rawImageUrl}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => copyToClipboard(rawImageUrl, 'raw-img-url')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        copiedKey === 'raw-img-url'
                          ? 'bg-emerald-600 text-white'
                          : isDarkMode
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {copiedKey === 'raw-img-url' ? <FaCheck size={12} /> : <FaCopy size={12} />}
                      <span>{copiedKey === 'raw-img-url' ? 'Copied' : 'Copy Image URL'}</span>
                    </button>
                    <a
                      href={rawImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
                    >
                      <FaExternalLinkAlt size={11} />
                      <span>Open Image</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Embed Snippets Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'iframe', label: 'HTML <iframe>' },
                  ...(isQrTool ? [{ id: 'img', label: 'HTML <img>' }] : []),
                  { id: 'react', label: 'React JSX' },
                  { id: 'markdown', label: 'Markdown' },
                  { id: 'raw', label: 'Direct Fetch / JSON' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === tab.id
                        ? isDarkMode
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                        : isDarkMode
                          ? 'text-slate-400 hover:text-slate-200'
                          : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => copyToClipboard(getActiveSnippet(), activeTab)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 ${
                  copiedKey === activeTab
                    ? 'bg-emerald-600 text-white'
                    : isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {copiedKey === activeTab ? <FaCheck size={11} /> : <FaCopy size={11} />}
                <span>{copiedKey === activeTab ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Box */}
            <div className={`relative rounded-xl overflow-hidden border p-3.5 font-mono text-xs ${
              isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}>
              <pre className="overflow-x-auto whitespace-pre">
                {getActiveSnippet()}
              </pre>
            </div>
          </div>

          {/* GitHub Source Footer Note */}
          <div className={`pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
            isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center gap-2">
              <FaGithub className="text-slate-400" size={16} />
              <span>
                Exact Component File:{' '}
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
              <span>View / Edit on GitHub</span>
              <FaExternalLinkAlt size={10} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
