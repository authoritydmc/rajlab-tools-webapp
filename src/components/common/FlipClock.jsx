import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../themeContext';

function FlipCard({ value, dark }) {
  const [current, setCurrent] = useState(value);
  const [prev, setPrev] = useState(value);
  const [phase, setPhase] = useState('idle');
  const timerRef = useRef(null);

  const pad = (n) => String(n).padStart(2, '0');

  useEffect(() => {
    if (value !== current) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPrev(current);
      setPhase('flipping-down');
      timerRef.current = setTimeout(() => {
        setCurrent(value);
        setPhase('flipping-up');
        timerRef.current = setTimeout(() => {
          setPhase('idle');
        }, 300);
      }, 300);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [value, current]);

  const bgT = dark ? 'bg-slate-700' : 'bg-white';
  const bgB = dark ? 'bg-slate-800' : 'bg-slate-100';
  const txT = dark ? 'text-indigo-300' : 'text-indigo-600';
  const txB = dark ? 'text-indigo-400' : 'text-indigo-500';
  const ln = dark ? 'bg-black/40' : 'bg-black/10';
  const sh = dark ? 'shadow-black/30' : 'shadow-black/10';
  const notch = dark ? 'bg-black/30' : 'bg-black/10';

  const isFlipping = phase !== 'idle';
  const curText = pad(current);
  const prevText = pad(prev);

  return (
    <div
      className={`relative w-[28px] h-[38px] sm:w-[34px] sm:h-[44px] rounded-lg font-mono text-lg sm:text-xl font-bold select-none shadow-md ${sh}`}
      style={{ perspective: '300px' }}
    >
      {/* ── STATIC TOP: always NEW ── */}
      <div className={`absolute inset-x-0 top-0 h-1/2 ${bgT} ${txT} flex items-end justify-center overflow-hidden rounded-t-lg z-0`}>
        <span style={{ lineHeight: '2' }}>{curText}</span>
      </div>

      {/* ── STATIC BOTTOM: always NEW ── */}
      <div className={`absolute inset-x-0 bottom-0 h-1/2 ${bgB} ${txB} flex items-start justify-center overflow-hidden rounded-b-lg z-0`}>
        <span style={{ lineHeight: '2', marginTop: '-1em' }}>{curText}</span>
      </div>

      {/* ── FLIP-DOWN CARD: OLD number, falls from top ── */}
      {phase === 'flipping-down' && (
        <div
          className={`absolute inset-x-0 top-0 h-1/2 ${bgT} ${txT} flex items-end justify-center overflow-hidden rounded-t-lg z-20 backface-hidden`}
          style={{ transformOrigin: '50% 100%', animation: 'flipTopCard 0.3s ease-in forwards' }}
        >
          <span style={{ lineHeight: '2' }}>{prevText}</span>
        </div>
      )}

      {/* ── FLIP-UP CARD: NEW number, rises from bottom ── */}
      {phase === 'flipping-up' && (
        <div
          className={`absolute inset-x-0 bottom-0 h-1/2 ${bgB} ${txB} flex items-start justify-center overflow-hidden rounded-b-lg z-20 backface-hidden`}
          style={{ transformOrigin: '50% 0%', transform: 'rotateX(90deg)', animation: 'flipBotCard 0.3s ease-out forwards' }}
        >
          <span style={{ lineHeight: '2', marginTop: '-1em' }}>{curText}</span>
        </div>
      )}

      {/* ── Center divider ── */}
      <div className={`absolute inset-x-0 top-1/2 h-[1px] -translate-y-px z-30 ${ln}`} />
      {/* Notches */}
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[6px] rounded-r-sm z-30 ${notch}`} />
      <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[6px] rounded-l-sm z-30 ${notch}`} />
    </div>
  );
}

function Separator({ dark }) {
  return (
    <div className="flex flex-col items-center justify-center gap-[6px] mx-[3px]">
      <div className={`w-[5px] h-[5px] rounded-full ${dark ? 'bg-indigo-400/70' : 'bg-indigo-500/50'} animate-pulse`} />
      <div className={`w-[5px] h-[5px] rounded-full ${dark ? 'bg-indigo-400/70' : 'bg-indigo-500/50'} animate-pulse`} />
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
    <div className="flex items-center">
      <FlipCard value={now.getHours()} dark={isDarkMode} />
      <Separator dark={isDarkMode} />
      <FlipCard value={now.getMinutes()} dark={isDarkMode} />
      <Separator dark={isDarkMode} />
      <FlipCard value={now.getSeconds()} dark={isDarkMode} />
    </div>
  );
}
