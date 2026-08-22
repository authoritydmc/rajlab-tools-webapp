import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaFileVideo, FaDownload, FaTrash, FaUpload, FaPlay, FaCog, FaCut, FaExpand, FaVolumeMute, FaCheck, FaExclamationTriangle, FaRedo, FaInfoCircle, FaCompress, FaTachometerAlt, FaWaveSquare, FaEye, FaChartBar } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

const FORMATS = [
  { value: 'mp4', label: 'MP4 (H.264)', mime: 'video/mp4' },
  { value: 'webm', label: 'WEBM (VP9)', mime: 'video/webm' },
  { value: 'avi', label: 'AVI', mime: 'video/x-msvideo' },
  { value: 'mov', label: 'MOV', mime: 'video/quicktime' },
  { value: 'mkv', label: 'MKV', mime: 'video/x-matroska' },
  { value: 'gif', label: 'GIF', mime: 'image/gif' },
  { value: 'mp3', label: 'MP3 (audio only)', mime: 'audio/mpeg' },
  { value: 'm4v', label: 'M4V', mime: 'video/x-m4v' },
];

const RESOLUTIONS = [
  { value: 'original', label: 'Original' },
  { value: '1920:1080', label: '1080p (1920×1080)' },
  { value: '1280:720', label: '720p (1280×720)' },
  { value: '854:480', label: '480p (854×480)' },
  { value: '640:360', label: '360p (640×360)' },
  { value: 'custom', label: 'Custom...' },
];

const QUALITIES = [
  { value: 'ultrafast', label: 'Ultrafast (larger)' },
  { value: 'veryfast', label: 'Veryfast' },
  { value: 'fast', label: 'Fast (balanced)' },
  { value: 'medium', label: 'Medium (default)' },
  { value: 'slow', label: 'Slow (smaller)' },
];

const FPS_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: '60', label: '60 fps' },
  { value: '30', label: '30 fps' },
  { value: '24', label: '24 fps' },
  { value: '15', label: '15 fps' },
  { value: '12', label: '12 fps (GIF)' },
];

const VIDEO_BITRATES = [
  { value: 'auto', label: 'Auto (CRF)' },
  { value: '500k', label: '0.5 Mbps (tiny)' },
  { value: '1000k', label: '1 Mbps (low)' },
  { value: '2500k', label: '2.5 Mbps (med)' },
  { value: '5000k', label: '5 Mbps (high)' },
  { value: '8000k', label: '8 Mbps (very high)' },
];

const AUDIO_BITRATES = [
  { value: '64k', label: '64k' },
  { value: '96k', label: '96k' },
  { value: '128k', label: '128k' },
  { value: '192k', label: '192k' },
  { value: '256k', label: '256k' },
];

function formatBytes(bytes) {
  if (bytes == null || isNaN(bytes)) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
function formatTime(s) {
  if (s == null || isNaN(s)) return '-';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}
function parseBitrate(str) {
  if (!str || str === 'auto') return null;
  const n = parseInt(str.replace('k',''), 10);
  return isNaN(n) ? null : n; // kbps
}

export default function FfmpegTool() {
  const { isDarkMode } = useTheme();
  const [inputFile, setInputFile] = useState(null);
  const [inputPreviewUrl, setInputPreviewUrl] = useState('');
  const [inputMeta, setInputMeta] = useState(null);
  const [outputFormat, setOutputFormat] = useState('mp4');
  const [resolution, setResolution] = useState('original');
  const [customW, setCustomW] = useState(1280);
  const [customH, setCustomH] = useState(720);
  const [quality, setQuality] = useState('medium');
  const [crf, setCrf] = useState(23);
  const [fps, setFps] = useState('original');
  const [videoBitrate, setVideoBitrate] = useState('auto');
  const [audioBitrate, setAudioBitrate] = useState('128k');
  const [muteAudio, setMuteAudio] = useState(false);
  const [trimStart, setTrimStart] = useState('');
  const [trimEnd, setTrimEnd] = useState('');
  const [outputMessages, setOutputMessages] = useState([]);
  const [downloadLink, setDownloadLink] = useState('');
  const [downloadName, setDownloadName] = useState('');
  const [downloadSize, setDownloadSize] = useState(null);
  const [ffmpegState, setFfmpegState] = useState('idle');
  const [loadError, setLoadError] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressTime, setProgressTime] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const ffmpegRef = useRef(null);
  const fileInputRef = useRef(null);
  const siblings = useCategorySiblings('/video-converter');
  const outputPreviewUrl = downloadLink;
  const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';

  useEffect(() => {
    document.title = 'Video Converter | Rajlabs';
    loadFFmpeg();
    return () => {
      if (inputPreviewUrl) URL.revokeObjectURL(inputPreviewUrl);
      if (downloadLink) URL.revokeObjectURL(downloadLink);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addLog = (msg) => {
    setOutputMessages(m => [msg, ...m].slice(0, 200));
    console.log(msg);
  };

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) { try { await ffmpegRef.current.terminate(); } catch {} ; ffmpegRef.current = null; }
    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;
    setFfmpegState('loading');
    setLoadError('');
    addLog('Loading FFmpeg...');
    ffmpeg.on('log', ({ message }) => addLog(message));
    ffmpeg.on('progress', ({ progress, time }) => {
      setProgress(Math.round(progress * 100));
      setProgressTime(time / 1000000);
    });
    const candidates = [];
    if (hasSharedArrayBuffer) {
      candidates.push({ name: 'core-mt jsDelivr', base: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.6/dist/esm', mt: true });
      candidates.push({ name: 'core-mt unpkg', base: 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm', mt: true });
    }
    candidates.push(
      { name: 'core jsDelivr', base: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm', mt: false },
      { name: 'core unpkg', base: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm', mt: false }
    );
    let lastErr = null;
    for (const c of candidates) {
      try {
        addLog(`Trying ${c.name}...`);
        const urls = c.mt
          ? { coreURL: await toBlobURL(`${c.base}/ffmpeg-core.js`, 'text/javascript'), wasmURL: await toBlobURL(`${c.base}/ffmpeg-core.wasm`, 'application/wasm'), workerURL: await toBlobURL(`${c.base}/ffmpeg-core.worker.js`, 'text/javascript') }
          : { coreURL: await toBlobURL(`${c.base}/ffmpeg-core.js`, 'text/javascript'), wasmURL: await toBlobURL(`${c.base}/ffmpeg-core.wasm`, 'application/wasm') };
        await ffmpeg.load(urls);
        addLog(`FFmpeg loaded via ${c.name} ✓`);
        setFfmpegState('ready');
        toast.success('FFmpeg ready');
        return;
      } catch (e) { lastErr = e; addLog(`Failed ${c.name}: ${e?.message || e}`); }
    }
    setFfmpegState('error');
    setLoadError(String(lastErr?.message || lastErr || 'Unknown error'));
    addLog('All FFmpeg load attempts failed.');
    toast.error('FFmpeg failed to load');
  };

  const handleFileChange = (file) => {
    if (!file) return;
    if (inputPreviewUrl) URL.revokeObjectURL(inputPreviewUrl);
    if (downloadLink) { URL.revokeObjectURL(downloadLink); setDownloadLink(''); setDownloadSize(null); }
    setInputFile(file);
    setOutputMessages([]);
    setProgress(0); setProgressTime(0);
    const url = URL.createObjectURL(file);
    setInputPreviewUrl(url);
    setInputMeta({ name: file.name, size: file.size, type: file.type });
    const vid = document.createElement('video');
    vid.preload = 'metadata';
    vid.onloadedmetadata = () => {
      setInputMeta(m => ({ ...m, duration: vid.duration, width: vid.videoWidth, height: vid.videoHeight }));
      URL.revokeObjectURL(vid.src);
    };
    vid.src = url;
  };
  const handleDrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFileChange(f); };

  // Real-time estimates
  const effectiveResolution = useMemo(() => {
    if (resolution === 'original') return inputMeta?.width && inputMeta?.height ? `${inputMeta.width}:${inputMeta.height}` : 'original';
    if (resolution === 'custom') return `${customW}:${customH}`;
    return resolution;
  }, [resolution, customW, customH, inputMeta]);

  const targetPixels = useMemo(() => {
    if (resolution === 'original' || !inputMeta?.width) return (inputMeta?.width || 1280) * (inputMeta?.height || 720);
    if (resolution === 'custom') return customW * customH;
    const [w,h] = resolution.split(':').map(Number);
    return w*h;
  }, [resolution, customW, customH, inputMeta]);
  const sourcePixels = useMemo(() => (inputMeta?.width || 1280) * (inputMeta?.height || 720), [inputMeta]);

  const estimatedSize = useMemo(() => {
    if (!inputMeta?.duration || !inputMeta?.size) return null;
    let dur = inputMeta.duration;
    const s = trimStart.trim(); const en = trimEnd.trim();
    if (s && !isNaN(Number(s))) dur -= Number(s);
    if (en && !isNaN(Number(en))) dur = Math.min(dur, Number(en) - (Number(s)||0));
    if (dur <= 0) dur = inputMeta.duration;
    const vb = parseBitrate(videoBitrate);
    const ab = muteAudio ? 0 : parseBitrate(audioBitrate) || 128;
    if (vb) {
      const bytes = ((vb + ab) * 1000 / 8) * dur;
      return bytes;
    } else {
      // CRF estimate: factor by resolution and CRF
      const resFactor = targetPixels / sourcePixels;
      // CRF 18 ~ 1.2x input bitrate, 23 ~ 0.6x, 28 ~ 0.35x, 32 ~ 0.25x (approx)
      const crfFactor = Math.max(0.2, 1.6 - (crf - 18) * 0.08);
      const durFactor = dur / inputMeta.duration;
      return inputMeta.size * resFactor * crfFactor * durFactor * (muteAudio ? 0.9 : 1);
    }
  }, [inputMeta, videoBitrate, audioBitrate, muteAudio, crf, targetPixels, sourcePixels, trimStart, trimEnd]);

  const compressionPct = useMemo(() => {
    if (!inputMeta?.size || !estimatedSize) return null;
    return Math.round((1 - estimatedSize / inputMeta.size) * 100);
  }, [inputMeta, estimatedSize]);

  const convertVideo = async () => {
    if (!inputFile) { toast.error('Please upload a video first'); return; }
    if (ffmpegState !== 'ready') { toast.error('FFmpeg not ready yet'); return; }
    const ffmpeg = ffmpegRef.current; if (!ffmpeg) return;
    const s = trimStart.trim(); const en = trimEnd.trim();
    if (s && isNaN(Number(s))) { toast.error('Trim start must be seconds'); return; }
    if (en && isNaN(Number(en))) { toast.error('Trim end must be seconds'); return; }
    if (s && en && Number(en) <= Number(s)) { toast.error('Trim end must be > start'); return; }
    if (resolution==='custom' && (!customW || !customH || customW<16 || customH<16)) { toast.error('Custom resolution invalid'); return; }

    setIsConverting(true); setProgress(0); setProgressTime(0); setDownloadLink(''); setDownloadSize(null);
    addLog(`Converting ${inputFile.name} → ${outputFormat.toUpperCase()} | ${effectiveResolution} | ${fps}fps | ${videoBitrate} | CRF ${crf} | ${muteAudio?'mute':audioBitrate} ${s||en ? `| trim ${s||0}-${en||'end'}` : ''}`);
    toast.loading('Converting...');

    try {
      const inName = 'input.' + (inputFile.name.split('.').pop() || 'mp4');
      const outExt = outputFormat === 'gif' ? 'gif' : outputFormat === 'mp3' ? 'mp3' : outputFormat;
      const outName = `output.${outExt}`;
      const finalName = `${inputFile.name.replace(/\.[^/.]+$/, '')}.${outExt}`;
      await ffmpeg.writeFile(inName, await fetchFile(inputFile));
      addLog('Input written to FFmpeg FS');
      const args = [];
      if (s) args.push('-ss', String(Number(s)));
      if (en) args.push('-to', String(Number(en)));
      args.push('-i', inName);

      // Build filter chain
      const vfFilters = [];
      if (resolution !== 'original') {
        const scale = resolution === 'custom' ? `${customW}:${customH}` : resolution;
        vfFilters.push(`scale=${scale}:flags=lanczos`);
      }
      if (fps !== 'original') {
        vfFilters.push(`fps=${fps}`);
      }

      if (outputFormat === 'mp3') {
        args.push('-vn', '-c:a', 'libmp3lame', '-q:a', '2');
        if (audioBitrate && !muteAudio) { args.push('-b:a', audioBitrate); }
      } else if (outputFormat === 'gif') {
        const gScale = vfFilters.length ? vfFilters.join(',') : 'scale=480:-1:flags=lanczos';
        const gFps = fps !== 'original' ? fps : '12';
        // Ensure fps filter present
        const hasFps = vfFilters.some(f=>f.startsWith('fps='));
        const finalVf = hasFps ? gScale : `${gScale},fps=${gFps}`;
        args.push('-vf', finalVf, '-loop', '0');
      } else {
        // Video codecs
        if (vfFilters.length) args.push('-vf', vfFilters.join(','));
        const vb = parseBitrate(videoBitrate);
        if (vb) {
          // Bitrate mode
          if (outputFormat === 'webm') {
            args.push('-c:v', 'libvpx-vp9', '-b:v', videoBitrate);
          } else {
            args.push('-c:v', 'libx264', '-preset', quality, '-b:v', videoBitrate, '-maxrate', videoBitrate, '-bufsize', `${parseInt(videoBitrate)*2}k`);
          }
        } else {
          // CRF mode
          if (outputFormat === 'webm') {
            args.push('-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(crf));
          } else {
            args.push('-c:v', 'libx264', '-preset', quality, '-crf', String(crf), '-pix_fmt', 'yuv420p');
          }
        }
        if (muteAudio) args.push('-an');
        else args.push('-c:a', 'aac', '-b:a', audioBitrate);
        args.push('-movflags', '+faststart');
      }
      args.push(outName);
      addLog(`FFmpeg args: ${args.join(' ')}`);
      await ffmpeg.exec(args);
      addLog('Transcoding finished, reading output...');
      const data = await ffmpeg.readFile(outName);
      const mime = FORMATS.find(f => f.value === outputFormat)?.mime || 'video/mp4';
      const blob = new Blob([data], { type: mime });
      const url = URL.createObjectURL(blob);
      setDownloadLink(url); setDownloadName(finalName); setDownloadSize(blob.size);
      addLog(`Done ✓ ${finalName} (${formatBytes(blob.size)}) | saved ${inputMeta ? Math.round((1 - blob.size/inputMeta.size)*100) : '?'}%`);
      toast.dismiss(); toast.success('Conversion complete!');
      try { await ffmpeg.deleteFile(inName); await ffmpeg.deleteFile(outName); } catch {}
    } catch (e) {
      addLog('Error: ' + (e?.message || e));
      toast.dismiss(); toast.error('Conversion failed: ' + (e?.message || 'unknown'));
    } finally { setIsConverting(false); setProgress(0); }
  };

  const handleClear = () => {
    if (inputPreviewUrl) URL.revokeObjectURL(inputPreviewUrl);
    if (downloadLink) URL.revokeObjectURL(downloadLink);
    setInputFile(null); setInputPreviewUrl(''); setInputMeta(null); setOutputMessages([]); setDownloadLink(''); setDownloadName(''); setDownloadSize(null); setProgress(0); setProgressTime(0); setTrimStart(''); setTrimEnd(''); if (fileInputRef.current) fileInputRef.current.value='';
  };

  const isReady = ffmpegState === 'ready';
  const isLoading = ffmpegState === 'loading';

  return (
    <ToolPageLayout title="Video Converter" icon={<FaFileVideo />} breadcrumb={[{label: 'Multimedia Utilities', path: '/video-converter'}]} siblings={siblings} currentPath="/video-converter" activeParams={{ format: outputFormat }}>
      <div className="w-full">
        <Toaster position="top-right" />
        <div className={`w-full mx-auto shadow-lg rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'}`}>
          {/* Status header + realtime stats */}
          <div className={`flex flex-wrap items-center gap-3 px-4 py-3 border-b text-xs ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-emerald-500 animate-pulse' : isLoading ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="font-bold">{isReady ? 'FFmpeg ready' : isLoading ? 'Loading FFmpeg...' : 'FFmpeg error'}</span>
              {!hasSharedArrayBuffer && <span className={`px-2 py-0.5 rounded-full text-[11px] ${isDarkMode?'bg-amber-500/20 text-amber-400 border border-amber-500/30':'bg-amber-100 text-amber-700 border border-amber-200'}`}>Single-thread</span>}
            </div>
            <div className="ml-auto flex items-center gap-2 flex-wrap">
              {inputMeta && (
                <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border ${isDarkMode?'bg-slate-900 border-slate-700 text-slate-300':'bg-white border-slate-200 text-slate-700'}`}>
                  <FaChartBar size={10} className="text-indigo-400"/> In: {formatBytes(inputMeta.size)} {inputMeta.width?`• ${inputMeta.width}×${inputMeta.height}`:''} {inputMeta.duration?`• ${formatTime(inputMeta.duration)}`:''}
                </span>
              )}
              {inputMeta && estimatedSize && (
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-bold border ${compressionPct>0 ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30':'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                  <FaCompress size={10}/> Est. out: {formatBytes(estimatedSize)} {compressionPct!=null && `(${compressionPct>0?'-':''}${compressionPct}%)`}
                </span>
              )}
              {inputMeta && <span className={`hidden sm:inline-flex items-center gap-1 ${isDarkMode?'text-slate-500':'text-slate-400'}`}><FaExpand size={10}/> {effectiveResolution}</span>}
              {ffmpegState==='error' && <button onClick={loadFFmpeg} className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white inline-flex items-center gap-1"><FaRedo size={11}/> Retry</button>}
              {isLoading && <span className="text-amber-500 font-semibold animate-pulse">Fetching ~30MB WASM...</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left: Input + Realtime Preview */}
            <div className={`flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r ${isDarkMode?'border-slate-700/50':'border-slate-200/50'}`}>
              <div className={`px-3 py-2 flex items-center justify-between border-b text-xs font-bold uppercase tracking-wider ${isDarkMode?'bg-slate-800/50 text-slate-300 border-slate-700/50':'bg-slate-50 text-slate-600 border-slate-200'}`}>
                <span className="inline-flex items-center gap-1.5"><FaUpload className="text-indigo-400" size={12}/> Input & Preview</span>
                <button onClick={handleClear} className={`px-2 py-1 rounded-lg text-xs font-semibold ${isDarkMode?'bg-red-600 text-white hover:bg-red-700':'bg-red-500 text-white hover:bg-red-600'}`}><FaTrash size={10}/> Clear</button>
              </div>

              <div onDragOver={e=>e.preventDefault()} onDrop={handleDrop} onClick={()=>fileInputRef.current?.click()} className={`m-3 p-5 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${isDarkMode ? 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 hover:border-indigo-500/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-indigo-300'} ${!isReady ? 'opacity-60 pointer-events-none' : ''}`}>
                {inputFile ? (
                  <div className="space-y-1">
                    <FaFileVideo className="mx-auto text-indigo-500" size={26}/>
                    <div className={`font-bold text-sm ${isDarkMode?'text-white':'text-slate-800'}`}>{inputFile.name}</div>
                    <div className={`text-xs ${isDarkMode?'text-slate-400':'text-slate-500'}`}>{formatBytes(inputFile.size)} • Click or drop to replace</div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <FaUpload className="mx-auto text-slate-400" size={26}/>
                    <div className={`font-semibold text-sm ${isDarkMode?'text-slate-200':'text-slate-700'}`}>Drop video here or click to browse</div>
                    <div className={`text-xs ${isDarkMode?'text-slate-500':'text-slate-400'}`}>MP4, MOV, AVI, MKV, WEBM... 100% client-side</div>
                    {!isReady && <div className="text-amber-500 text-xs font-bold mt-2">Waiting for FFmpeg...</div>}
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="video/*,audio/*" onChange={e=>handleFileChange(e.target.files?.[0])} className="hidden" />
              </div>

              {inputPreviewUrl ? (
                <div className="px-3 pb-3 space-y-3">
                  <div className={`rounded-xl overflow-hidden border relative ${isDarkMode?'border-slate-700 bg-black':'border-slate-200 bg-black'}`}>
                    <video src={inputPreviewUrl} controls className="w-full max-h-[240px] object-contain" />
                    {/* Overlay resolution badge */}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <span className="px-2 py-1 rounded-full bg-black/70 text-white text-[11px] font-bold border border-white/20">{inputMeta?.width && inputMeta?.height ? `${inputMeta.width}×${inputMeta.height}` : 'Original'}</span>
                      {resolution!=='original' && <span className="px-2 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold">→ {resolution==='custom'? `${customW}×${customH}` : resolution.replace(':','×')}</span>}
                    </div>
                  </div>
                  {/* Realtime size/compression visual */}
                  <div className={`grid grid-cols-3 gap-2 text-xs ${isDarkMode?'text-slate-400':'text-slate-500'}`}>
                    <div className={`p-2.5 rounded-xl border text-center ${isDarkMode?'bg-slate-800 border-slate-700':'bg-white border-slate-200'}`}>
                      <div className={`font-bold text-sm ${isDarkMode?'text-white':'text-slate-800'}`}>{formatBytes(inputMeta?.size)}</div>
                      <div className="flex items-center justify-center gap-1"><FaFileVideo size={10}/> Input</div>
                    </div>
                    <div className={`p-2.5 rounded-xl border text-center ${compressionPct!=null && compressionPct>0 ? 'bg-emerald-500/10 border-emerald-500/30' : isDarkMode?'bg-slate-800 border-slate-700':'bg-white border-slate-200'}`}>
                      <div className={`font-bold text-sm ${compressionPct>0?'text-emerald-600': isDarkMode?'text-white':'text-slate-800'}`}>{estimatedSize? formatBytes(estimatedSize) : '-'}</div>
                      <div className="flex items-center justify-center gap-1"><FaCompress size={10}/> Est. Output</div>
                    </div>
                    <div className={`p-2.5 rounded-xl border text-center ${isDarkMode?'bg-slate-800 border-slate-700':'bg-white border-slate-200'}`}>
                      <div className={`font-bold text-sm ${compressionPct>0?'text-emerald-600':'text-slate-500'}`}>{compressionPct!=null ? `${compressionPct>0?'-':''}${compressionPct}%` : '-'}</div>
                      <div className="flex items-center justify-center gap-1"><FaTachometerAlt size={10}/> Savings</div>
                    </div>
                  </div>
                  {/* Visual scale preview */}
                  <div className={`p-3 rounded-xl border ${isDarkMode?'bg-slate-800/50 border-slate-700':'bg-slate-50 border-slate-200'}`}>
                    <div className={`text-xs font-bold mb-2 flex items-center gap-1 ${isDarkMode?'text-slate-300':'text-slate-700'}`}><FaEye size={11}/> Scale Preview (realtime)</div>
                    <div className="flex items-end gap-2 justify-center">
                      <div className={`rounded-lg border-2 flex items-center justify-center text-[11px] font-bold ${isDarkMode?'bg-slate-700 border-slate-600 text-white':'bg-white border-slate-300 text-slate-700'}`} style={{ width: 120, height: Math.max(30, Math.min(80, 80 * ( (inputMeta?.height||720)/(inputMeta?.width||1280) ))) }}>
                        In: {inputMeta?.width||'?'}×{inputMeta?.height||'?'}
                      </div>
                      <span className="text-indigo-500 font-bold pb-3">→</span>
                      <div className="rounded-lg bg-indigo-600 border-2 border-indigo-500 flex items-center justify-center text-[11px] font-bold text-white shadow" style={{ width: resolution==='original' ? 120 : resolution==='custom' ? Math.min(120, Math.max(40, customW/16)) : Math.min(120, parseInt(resolution.split(':')[0])/16), height: resolution==='original' ? Math.max(30, Math.min(80, 80 * ( (inputMeta?.height||720)/(inputMeta?.width||1280) ))) : resolution==='custom' ? Math.max(30, Math.min(80, 80 * customH/customW)) : Math.max(30, Math.min(80, 80 * parseInt(resolution.split(':')[1])/parseInt(resolution.split(':')[0]))) }}>
                        {resolution==='original' ? 'Original' : resolution==='custom' ? `${customW}×${customH}` : resolution.replace(':','×')}
                      </div>
                    </div>
                    <div className={`mt-2 text-[11px] text-center ${isDarkMode?'text-slate-500':'text-slate-400'}`}>Resolution, CRF & bitrate affect output size — estimate updates instantly</div>
                  </div>
                </div>
              ) : (
                ffmpegState==='error' && !inputFile && (
                  <div className={`mx-3 mb-3 p-3 rounded-xl border flex gap-2 text-xs ${isDarkMode?'bg-red-900/20 border-red-500/30 text-red-300':'bg-red-50 border-red-200 text-red-700'}`}>
                    <FaExclamationTriangle className="shrink-0 mt-0.5" />
                    <div><div className="font-bold">FFmpeg failed to load</div><div className="opacity-80 mt-1">{loadError}</div><button onClick={loadFFmpeg} className="mt-2 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs inline-flex items-center gap-1"><FaRedo size={11}/> Retry</button></div>
                  </div>
                )
              )}
            </div>

            {/* Right: Controls + Output */}
            <div className="flex flex-col min-h-0">
              <div className={`px-3 py-2 flex items-center justify-between border-b text-xs font-bold uppercase tracking-wider ${isDarkMode?'bg-slate-800/50 text-slate-300 border-slate-700/50':'bg-slate-50 text-slate-600 border-slate-200'}`}>
                <span className="inline-flex items-center gap-1.5"><FaCog className="text-emerald-400" size={12}/> Controls — size & compression</span>
                {downloadLink && <span className="text-emerald-500 normal-case tracking-normal flex items-center gap-1"><FaCheck size={10}/> Ready</span>}
              </div>

              <div className="p-4 space-y-4 overflow-auto">
                {/* Core controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDarkMode?'text-slate-300':'text-slate-700'}`}>Output Format</label>
                    <select value={outputFormat} onChange={e=>setOutputFormat(e.target.value)} className={`w-full p-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`}>
                      {FORMATS.map(f=> <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDarkMode?'text-slate-300':'text-slate-700'}`}><FaExpand className="inline mr-1"/> Resolution</label>
                    <select value={resolution} onChange={e=>setResolution(e.target.value)} className={`w-full p-2 border rounded-xl text-sm ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`}>
                      {RESOLUTIONS.map(r=> <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                </div>
                {resolution==='custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={`block text-xs font-bold mb-1 ${isDarkMode?'text-slate-400':'text-slate-600'}`}>Width (px)</label><input type="number" min="16" max="3840" value={customW} onChange={e=>setCustomW(Math.max(16, Number(e.target.value)||16))} className={`w-full p-2 border rounded-xl font-mono text-sm ${isDarkMode?'bg-slate-900 text-white border-slate-700':'bg-white text-slate-900 border-slate-200'}`} /></div>
                    <div><label className={`block text-xs font-bold mb-1 ${isDarkMode?'text-slate-400':'text-slate-600'}`}>Height (px)</label><input type="number" min="16" max="2160" value={customH} onChange={e=>setCustomH(Math.max(16, Number(e.target.value)||16))} className={`w-full p-2 border rounded-xl font-mono text-sm ${isDarkMode?'bg-slate-900 text-white border-slate-700':'bg-white text-slate-900 border-slate-200'}`} /></div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDarkMode?'text-slate-300':'text-slate-700'}`}><FaCompress className="inline mr-1"/> Compression (CRF) {crf}</label>
                    <input type="range" min="18" max="32" value={crf} onChange={e=>setCrf(Number(e.target.value))} disabled={videoBitrate!=='auto' || outputFormat==='mp3' || outputFormat==='gif'} className="w-full accent-indigo-600 disabled:opacity-40" />
                    <div className="flex justify-between text-[11px] opacity-60"><span>18 high</span><span>23 default</span><span>32 tiny</span></div>
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDarkMode?'text-slate-300':'text-slate-700'}`}><FaTachometerAlt className="inline mr-1"/> Video Bitrate</label>
                    <select value={videoBitrate} onChange={e=>setVideoBitrate(e.target.value)} disabled={outputFormat==='mp3' || outputFormat==='gif'} className={`w-full p-2 border rounded-xl text-sm disabled:opacity-40 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`}>
                      {VIDEO_BITRATES.map(b=> <option key={b.value} value={b.value}>{b.label}</option>)}
                    </select>
                    <div className={`text-[11px] mt-1 ${isDarkMode?'text-slate-500':'text-slate-400'}`}>{videoBitrate==='auto' ? 'Using CRF quality slider' : 'Fixed bitrate overrides CRF'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDarkMode?'text-slate-300':'text-slate-700'}`}>FPS</label>
                    <select value={fps} onChange={e=>setFps(e.target.value)} className={`w-full p-2 border rounded-xl text-sm ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`}>
                      {FPS_OPTIONS.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDarkMode?'text-slate-300':'text-slate-700'}`}><FaWaveSquare className="inline mr-1"/> Audio Bitrate</label>
                    <select value={audioBitrate} onChange={e=>setAudioBitrate(e.target.value)} disabled={muteAudio || outputFormat==='gif'} className={`w-full p-2 border rounded-xl text-sm disabled:opacity-40 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`}>
                      {AUDIO_BITRATES.map(b=> <option key={b.value} value={b.value}>{b.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDarkMode?'text-slate-300':'text-slate-700'}`}>Preset</label>
                    <select value={quality} onChange={e=>setQuality(e.target.value)} disabled={outputFormat==='mp3' || outputFormat==='gif' || videoBitrate!=='auto'} className={`w-full p-2 border rounded-xl text-sm disabled:opacity-40 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`}>
                      {QUALITIES.map(q=> <option key={q.value} value={q.value}>{q.label}</option>)}
                    </select>
                  </div>
                </div>

                <button onClick={()=>setShowAdvanced(v=>!v)} className={`w-full py-1.5 rounded-xl text-xs font-bold border ${showAdvanced ? 'bg-indigo-600 text-white border-indigo-600' : isDarkMode?'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                  {showAdvanced ? 'Hide' : 'Show'} trim & audio options
                </button>

                {showAdvanced && (
                  <div className={`p-3 rounded-xl border grid grid-cols-1 sm:grid-cols-3 gap-3 ${isDarkMode?'bg-slate-800/50 border-slate-700':'bg-slate-50 border-slate-200'}`}>
                    <div><label className={`block text-xs font-bold mb-1 flex items-center gap-1 ${isDarkMode?'text-slate-300':'text-slate-700'}`}><FaCut size={11}/> Trim start (s)</label><input value={trimStart} onChange={e=>setTrimStart(e.target.value)} placeholder="e.g. 2.5" className={`w-full p-2 border rounded-xl font-mono text-sm ${isDarkMode?'bg-slate-900 text-white border-slate-700 placeholder-slate-500':'bg-white text-slate-900 border-slate-200 placeholder-slate-400'}`} /></div>
                    <div><label className={`block text-xs font-bold mb-1 ${isDarkMode?'text-slate-300':'text-slate-700'}`}>Trim end (s)</label><input value={trimEnd} onChange={e=>setTrimEnd(e.target.value)} placeholder="e.g. 10" className={`w-full p-2 border rounded-xl font-mono text-sm ${isDarkMode?'bg-slate-900 text-white border-slate-700 placeholder-slate-500':'bg-white text-slate-900 border-slate-200 placeholder-slate-400'}`} /></div>
                    <label className={`flex items-center gap-2 cursor-pointer p-2 rounded-xl border text-xs font-bold justify-center ${muteAudio ? 'bg-red-600 text-white border-red-600' : isDarkMode?'bg-slate-900 border-slate-700 text-slate-300':'bg-white border-slate-200 text-slate-700'}`}>
                      <input type="checkbox" checked={muteAudio} onChange={e=>setMuteAudio(e.target.checked)} className="w-4 h-4 accent-red-600" /><FaVolumeMute /> Remove audio
                    </label>
                  </div>
                )}

                {isConverting && (
                  <div className={`p-3 rounded-xl border ${isDarkMode?'bg-slate-800 border-slate-700':'bg-white border-slate-200'}`}>
                    <div className="flex justify-between text-xs font-bold mb-1"><span className={isDarkMode?'text-slate-300':'text-slate-700'}>Converting...</span><span className="text-indigo-500">{progress}% • {formatTime(progressTime)}</span></div>
                    <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden"><div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
                  </div>
                )}

                <button onClick={convertVideo} disabled={!isReady || isConverting || !inputFile} className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${!isReady || !inputFile ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : isConverting ? 'bg-amber-600 text-white cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow'}`}>
                  {isConverting ? <><FaCog className="animate-spin"/> Converting {progress}%</> : <><FaPlay size={12}/> Convert to {outputFormat.toUpperCase()}</>}
                </button>

                {downloadLink ? (
                  <div className="space-y-3">
                    <div className={`rounded-xl overflow-hidden border ${isDarkMode?'border-slate-700 bg-black':'border-slate-200 bg-black'}`}>
                      {outputFormat==='mp3' ? <audio src={outputPreviewUrl} controls className="w-full" /> : outputFormat==='gif' ? <img src={outputPreviewUrl} alt="Output GIF" className="w-full max-h-[240px] object-contain" /> : <video src={outputPreviewUrl} controls className="w-full max-h-[240px] object-contain" />}
                    </div>
                    <div className={`p-2 rounded-xl border flex items-center justify-between text-xs ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-300':'bg-slate-50 border-slate-200 text-slate-700'}`}>
                      <span className="font-mono">{downloadName} • {formatBytes(downloadSize)}</span>
                      {inputMeta && downloadSize && <span className={`px-2 py-1 rounded-full font-bold text-xs ${downloadSize < inputMeta.size ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>{downloadSize < inputMeta.size ? `-${Math.round((1-downloadSize/inputMeta.size)*100)}%` : `+${Math.round((downloadSize/inputMeta.size-1)*100)}%`}</span>}
                    </div>
                    <a href={downloadLink} download={downloadName} className="w-full py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"><FaDownload /> Download {downloadName}</a>
                  </div>
                ) : (
                  <div className={`text-center py-6 border-2 border-dashed rounded-xl text-xs ${isDarkMode?'border-slate-700 text-slate-500 bg-slate-800/20':'border-slate-200 text-slate-400 bg-slate-50'}`}>
                    <FaPlay className="mx-auto mb-2 opacity-40" size={20}/> Output preview & download appear here
                  </div>
                )}

                <div>
                  <div className={`flex items-center justify-between mb-1 text-xs font-bold ${isDarkMode?'text-slate-300':'text-slate-700'}`}><span className="flex items-center gap-1"><FaInfoCircle size={11}/> Logs</span><button onClick={()=>setOutputMessages([])} className={`px-2 py-1 rounded-lg text-xs border ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-400':'bg-white border-slate-200 text-slate-500'}`}>Clear</button></div>
                  <div className={`h-32 border rounded-xl overflow-auto p-2 font-mono text-xs space-y-1 ${isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-700' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                    {outputMessages.length ? outputMessages.map((m,i)=> <div key={i} className="break-all border-b border-slate-700/20 pb-1 last:border-0">{m}</div>) : <span className="opacity-50">No logs yet</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`px-4 py-3 border-t text-xs text-center ${isDarkMode?'bg-slate-800/30 border-slate-700/50 text-slate-500':'bg-slate-50 border-slate-200 text-slate-400'}`}>
            100% client-side • FFmpeg WASM {outputFormat.toUpperCase()} • Estimated size updates live as you change settings • Large files use more memory
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
