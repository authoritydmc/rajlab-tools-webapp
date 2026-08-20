const AudioCtx = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
let ctx = null;

function getCtx() {
  if (!ctx && AudioCtx) ctx = new AudioCtx();
  return ctx;
}

function soundEnabled() {
  return window.__rajlabsSound !== false;
}

export function playHoverSound() {
  if (!soundEnabled()) return;
  try {
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, c.currentTime + 0.05);
    gain.gain.setValueAtTime(0.025, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.08);
  } catch {}
}

export function playClickSound() {
  if (!soundEnabled()) return;
  try {
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, c.currentTime + 0.1);
    gain.gain.setValueAtTime(0.04, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.12);
  } catch {}
}

export function playFavSound() {
  if (!soundEnabled()) return;
  try {
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, c.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(1200, c.currentTime + 0.15);
    gain.gain.setValueAtTime(0.05, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.2);
  } catch {}
}
