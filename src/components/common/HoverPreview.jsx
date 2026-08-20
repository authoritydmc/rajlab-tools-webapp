import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../themeContext';

export default function HoverPreview({ children, tool, enabled = true }) {
  const { isDarkMode } = useTheme();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);
  const [mount, setMount] = useState(false);

  useEffect(() => { setMount(true); return () => setMount(false); }, []);

  const onMove = useCallback((e) => {
    setPos({ x: e.clientX + 16, y: e.clientY + 16 });
  }, []);

  if (!enabled || !tool || !mount) return children;

  const tooltip = show && tool.description ? createPortal(
    <div
      style={{ left: pos.x, top: pos.y, position: 'fixed', zIndex: 9999, pointerEvents: 'none' }}
      className={`max-w-xs p-3 rounded-xl border shadow-2xl backdrop-blur-md transition-opacity duration-200 ${
        isDarkMode
          ? 'bg-slate-800/95 border-slate-700/80 text-slate-200'
          : 'bg-white/95 border-slate-200 text-slate-700'
      }`}
    >
      <div className={`text-xs font-bold mb-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
        {tool.name}
      </div>
      <div className="text-[11px] leading-relaxed opacity-80">
        {tool.description.length > 120 ? tool.description.slice(0, 120) + '...' : tool.description}
      </div>
      <div className={`mt-1.5 text-[10px] flex items-center gap-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
        Click to open
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <span
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onMouseMove={onMove}
    >
      {children}
      {tooltip}
    </span>
  );
}
