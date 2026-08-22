import LocalStorageUtils from './localStorageUtils';
import { KEYS } from './constants';

const QP = KEYS.QR_CUSTOM_PREFS;

/**
 * Persistable QR customization shape
 * { bgColor, fgColor, colorTheme, dotStyle, cornerSquareStyle, cornerDotStyle, logo, frame, frameText, frameColor }
 */

export function saveQRPrefs(prefs) {
  try {
    // Avoid persisting huge base64 custom logos – skip if logo is data URL > 2k
    const toSave = { ...prefs };
    if (typeof toSave.logo === 'string' && toSave.logo.startsWith('data:') && toSave.logo.length > 4096) {
      delete toSave.logo;
    }
    // Don't persist customLogoUrl base64 directly
    delete toSave.customLogoUrl;
    const existing = LocalStorageUtils.getItem(QP) || {};
    const merged = { ...existing, ...toSave };
    LocalStorageUtils.setItem(QP, merged);
  } catch (_) { /* quota or privacy mode – ignore */ }
}

export function loadQRPrefs() {
  try {
    const v = LocalStorageUtils.getItem(QP);
    if (v && typeof v === 'object') return v;
    return null;
  } catch { return null; }
}

// Returns true if current URL has any QR customization query param – then query should override saved prefs
export function hasQRCustomQueryOverride(searchString) {
  try {
    const sp = new URLSearchParams(searchString || (typeof window !== 'undefined' ? window.location.search : ''));
    const keys = ['bg','bgColor','fg','fgColor','theme','colorTheme','mode','logo','icon','dotStyle','dots','pattern','eyeFrame','corner','eye','cornerDotStyle','frame','frameStyle','frameText','cta','frameColor','fc'];
    return keys.some(k => sp.has(k));
  } catch { return false; }
}
