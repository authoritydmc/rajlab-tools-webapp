import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../themeContext';

function FlipUnit({ value, dark }) {
  const [display, setDisplay] = useState(value);
  const [prev, setPrev] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (value !== display) {
      setPrev(display);
      setFlipping(true);
      timer.current = setTimeout(() => {
        setDisplay(value);
        setFlipping(false);
      }, 350);
    }
    return () => clearTimeout(timer.current);
  }, [value, display]);

  const pad = (n) => String(n).padStart(2, '0');
  const cur = pad(display);
  const old = pad(prev);

  const topBg = dark ? 'bg-slate-800' : 'bg-zinc-800';
  const botBg = dark ? 'bg-slate-900' : 'bg-zinc-900';
  const txt = dark ? 'text-indigo-300' : 'text-amber-100';
  const divider = dark ? 'bg-black/60' : 'bg-black/50';
  const notch = dark ? 'bg-black/40' : 'bg-black/40';

  return (
    <div
      className="relative w-[30px] h-[40px] sm:w-[36px] sm:h-[48px] rounded-md select-none"
      style={{ perspective: '300px', boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }}
    >
      {/* ── Top static: always shows current ── */}
      <div className={`absolute inset-x-0 top-0 h-1/2 ${topBg} ${txt} flex items-end justify-center overflow-hidden rounded-t-md`}>
        <span className="font-mono text-lg sm:text-xl font-bold" style={{ lineHeight: '2' }}>{cur}</span>
      </div>

      {/* ── Bottom static: always shows current ── */}
      <div className={`absolute inset-x-0 bottom-0 h-1/2 ${botBg} ${txt} flex items-start justify-center overflow-hidden rounded-b-md`}>
        <span className="font-mono text-lg sm:text-xl font-bold" style={{ lineHeight: '2', marginTop: '-1em' }}>{cur}</span>
      </div>

      {/* ── Flip top: old value falls down ── */}
      {flipping && (
        <div
          className={`absolute inset-x-0 top-0 h-1/2 ${topBg} ${txt} flex items-end justify-center overflow-hidden rounded-t-md z-20`}
          style={{ transformOrigin: '50% 100%', animation: 'flipDown 0.3s ease-in forwards' }}
        >
          <span className="font-mono text-lg sm:text-xl font-bold" style={{ lineHeight: '2' }}>{old}</span>
        </div>
      )}

      {/* ── Flip bottom: new value swings up ── */}
      {flipping && (
        <div
          className={`absolute inset-x-0 bottom-0 h-1/2 ${botBg} ${txt} flex items-start justify-center overflow-hidden rounded-b-md z-20`}
          style={{ transformOrigin: '50% 0%', transform: 'rotateX(90deg)', animation: 'flipUp 0.3s 0.2s ease-out forwards' }}
        >
          <span className="font-mono text-lg sm:text-xl font-bold" style={{ lineHeight: '2', marginTop: '-1em' }}>{cur}</span>
        </div>
      )}

      {/* ── Center slit ── */}
      <div className={`absolute inset-x-0 top-1/2 h-[2px] -translate-y-px z-30 ${divider}`} />

      {/* ── Side rivets ── */}
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[7px] rounded-r-sm z-30 ${notch}`} />
      <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-[4px] h-[7px] rounded-l-sm z-30 ${notch}`} />

      {/* ── Subtle inner highlight ── */}
      <div className="absolute inset-0 rounded-md pointer-events-none z-30" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)' }} />
    </div>
  );
}

function Separator({ dark }) {
  return (
    <div className="flex flex-col items-center justify-center gap-[7px] mx-[4px]">
      <div className={`w-[6px] h-[6px] rounded-full ${dark ? 'bg-amber-500/50' : 'bg-amber-400/60'} animate-pulse`} />
      <div className={`w-[6px] h-[6px] rounded-full ${dark ? 'bg-amber-500/50' : 'bg-amber-400/60'} animate-pulse`} />
    </div>
  );
}

export default function FlipClock() {
  const { isDarkMode } = useTheme();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>
      <FlipUnit value={now.getHours()} dark={isDarkMode} />
      <Separator dark={isDarkMode} />
      <FlipUnit value={now.getMinutes()} dark={isDarkMode} />
      <Separator dark={isDarkMode} />
      <FlipUnit value={now.getSeconds()} dark={isDarkMode} />
    </div>
  );
}
