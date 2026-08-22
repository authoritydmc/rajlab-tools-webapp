// signatureStorage.js
// Persistent preferences + reusable signature library for the PDF Editor & Signer.
// Everything stays on-device (localStorage) — 100% client-side, no uploads.

const PREFS_KEY = 'rajlabs_pdf_editor_prefs';
const SIGS_KEY = 'rajlabs_pdf_editor_signatures';

export const DEFAULT_PREFS = {
  fontSize: 16,
  textColor: '#000000',
  strokeColor: '#000000',
  strokeWidth: 3,
  fontFamily: 'cursive',
  typedText: '',
};

const MAX_SAVED_SIGNS = 12;

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

/** Load saved editor preferences merged over defaults. */
export function loadPrefs() {
  try {
    return { ...DEFAULT_PREFS, ...safeParse(localStorage.getItem(PREFS_KEY), {}) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

/** Merge a patch of preferences into localStorage. Returns true on success. */
export function savePrefs(patch) {
  try {
    const next = { ...loadPrefs(), ...patch };
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

/** Load the user's saved signature library (newest first). */
export function loadSignatures() {
  try {
    const list = safeParse(localStorage.getItem(SIGS_KEY), []);
    return Array.isArray(list) ? list.filter(s => s && s.id && s.dataUrl) : [];
  } catch {
    return [];
  }
}

function persistSignatures(list) {
  try {
    localStorage.setItem(SIGS_KEY, JSON.stringify(list));
    return true;
  } catch {
    // Storage full — drop oldest entries and retry once.
    try {
      localStorage.setItem(SIGS_KEY, JSON.stringify(list.slice(0, Math.max(1, Math.floor(list.length / 2)))));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Add a signature image to the library. Dedupes by dataUrl so re-using
 * the same sign never creates duplicate cards.
 * @param {string} dataUrl PNG data URL of the signature.
 * @param {string} name Friendly label shown in the Saved tab.
 * @returns {{ ok: boolean, entry?: object }}
 */
export function addSignature(dataUrl, name = 'My Sign') {
  if (!dataUrl) return { ok: false };
  const existing = loadSignatures();
  if (existing.some(s => s.dataUrl === dataUrl)) {
    return { ok: true, entry: existing.find(s => s.dataUrl === dataUrl) };
  }
  const entry = {
    id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: String(name || 'My Sign').slice(0, 40),
    dataUrl,
    createdAt: Date.now(),
  };
  const ok = persistSignatures([entry, ...existing].slice(0, MAX_SAVED_SIGNS));
  return { ok, entry };
}

/** Remove a saved signature by id. */
export function removeSignature(id) {
  const next = loadSignatures().filter(s => s.id !== id);
  persistSignatures(next);
  return next;
}

/**
 * Downscale large uploaded images before persisting them so they fit
 * comfortably inside the localStorage quota. Transparency is preserved.
 * @returns {Promise<string>} compressed PNG data URL
 */
export function compressImageForStorage(dataUrl, maxWidth = 700) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxWidth / Math.max(img.width, 1));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
