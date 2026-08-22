import {
  collection,
  doc,
  getDocs,
  setDoc,
  onSnapshot,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// ── Debug helper: write to _debug collection (no App Check required) ───────
async function writeDebugDoc(data) {
  try {
    const debugRef = doc(db, '_debug', `${data.slug}-${data.phase}-${Date.now()}`);
    await setDoc(debugRef, {
      ts: new Date().toISOString(),
      host: typeof window !== 'undefined' ? window.location.hostname : 'ssr',
      isDev: typeof import.meta !== 'undefined' ? !!import.meta.env.DEV : false,
      env: typeof import.meta !== 'undefined' ? (import.meta.env.MODE || 'unknown') : 'ssr',
      ...data,
    });
  } catch (e) {
    // Debug write itself failed — likely rules not deployed yet. Log to console only.
    console.warn('[toolUsage DEBUG] _debug write failed (rules not deployed?):', e?.message);
  }
}

const COLLECTION = 'tool_usage';

// Throttle in-memory so a single session doesn't spam counts on re-renders.
const incrementedThisSession = new Set();

function normalizeSlug(linkOrSlug) {
  if (!linkOrSlug) return '';
  return String(linkOrSlug).replace(/^\//, '').trim().slice(0, 200);
}

function formatCount(n) {
  const v = Number(n) || 0;
  if (v >= 1000000) return `${(v / 1000000).toFixed(v >= 10000000 ? 0 : 1).replace(/\.0$/, '')}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1).replace(/\.0$/, '')}k`;
  return String(v);
}

/**
 * Increment community usage counter for a tool.
 * Uses Firestore `increment(1)` with `setDoc(merge:true)` so missing docs are created.
 * Fire-and-forget safe — callers don't need to await.
 *
 * @param {string} linkOrSlug - e.g. "/merge-pdf" or "merge-pdf"
 * @param {{ title?: string }} meta - optional display title for new doc
 */
export async function incrementToolUsage(linkOrSlug, meta = {}) {
  const slug = normalizeSlug(linkOrSlug);
  if (!slug) return;

  // Once per session per slug — prevents double-count on React StrictMode / re-mounts.
  // If you *want* to count every click, remove this guard or key by timestamp.
  const key = `tool_usage:${slug}`;
  // We still want to count repeated *navigations* in same session after 30s cooldown
  // So we only block hyper-rapid double calls (<2s).
  if (incrementedThisSession.has(key)) {
    const last = incrementedThisSession._timestamps?.[key] || 0;
    if (Date.now() - last < 2000) return;
  }
  incrementedThisSession.add(key);
  if (!incrementedThisSession._timestamps) incrementedThisSession._timestamps = {};
  incrementedThisSession._timestamps[key] = Date.now();

  const ref = doc(db, COLLECTION, slug);

  // ── Gather App Check diagnostic info before the write ──────────────
  let acInfo = { appCheckPresent: false, tokenLen: 0, tokenPrefix: '', provider: 'none', siteKey: '', error: '' };
  try {
    const { appCheck } = await import('../firebaseConfig');
    const siteKey = import.meta.env?.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY?.trim()
      || import.meta.env?.VITE_RECAPTCHA_V3_SITE_KEY?.trim()
      || '6LfUX5Mt...9-p';
    const isEnterprise = !!import.meta.env?.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY && !import.meta.env?.VITE_RECAPTCHA_V3_SITE_KEY;

    acInfo.siteKey = siteKey;
    acInfo.provider = isEnterprise ? 'Enterprise' : 'V3';
    acInfo.appCheckPresent = !!appCheck;

    if (appCheck) {
      const { getToken } = await import('firebase/app-check');
      try {
        const { token, expireTimeMillis, attemptsCount } = await getToken(appCheck, false);
        acInfo.tokenLen = token.length;
        acInfo.tokenPrefix = token.slice(0, 20);
        acInfo.expireTime = new Date(expireTimeMillis).toISOString();
        acInfo.attemptsCount = attemptsCount;
        acInfo.error = '';
        console.log(`[toolUsage DEBUG] ${slug} AppCheck token OK len=${token.length} prefix=${token.slice(0,12)}... attempts=${attemptsCount}`);
      } catch (e) {
        acInfo.error = `${e?.code || 'unknown'}: ${e?.message || 'no message'}`;
        console.warn(`[toolUsage DEBUG] ${slug} AppCheck getToken FAILED`, e?.code, e?.message);
      }
    } else {
      acInfo.error = 'appCheck object is null — init failed?';
      console.warn(`[toolUsage DEBUG] ${slug} appCheck is null`);
    }

    // Also try to inspect what the SDK will actually attach
    // The Firebase SDK checks internal state; log what we can access
    acInfo.internalState = typeof appCheck?.getUid === 'function' ? 'has getUid' : 'no getUid';
  } catch (e) {
    acInfo.error = `import/setup failed: ${e?.message}`;
  }

  // ── Pre-write debug doc (phase=pre-write) ──────────────────────────
  await writeDebugDoc({ slug, phase: 'pre-write', ...acInfo });

  // ── Attempt the Firestore write ────────────────────────────────────
  try {
    await setDoc(
      ref,
      {
        slug,
        link: `/${slug}`,
        title: meta.title ? String(meta.title).slice(0, 120) : slug,
        count: increment(1),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`[toolUsage DEBUG] ${slug} increment OK — Firestore 200`);

    // Success debug doc — we now know request.app was validated
    await writeDebugDoc({ slug, phase: 'success', ...acInfo, error: '' });
  } catch (err) {
    console.warn('[toolUsage] increment failed for', slug, err?.message, 'code=', err?.code);

    // Failure debug doc — capture EVERYTHING: what we sent, what failed
    await writeDebugDoc({
      slug,
      phase: 'failure',
      ...acInfo,
      error: `${err?.code || 'unknown'}: ${err?.message || 'no message'}`,
      // extra detail about the failure
      fullErrorCode: err?.code || '',
      fullErrorMsg: err?.message || '',
      // What Firestore rules expect vs what we sent
      ruleExpectation: 'request.app != null (App Check token must be verified server-side)',
      hint: 'If appCheckPresent=true and tokenLen>0 but still permission-denied, the Firebase Console secret key does NOT match the site key. Go to Firebase Console > Project Settings > App Check > reCAPTCHA and verify.',
    });

    // allow retry next time by clearing cooldown
    if (incrementedThisSession._timestamps) delete incrementedThisSession._timestamps[key];
    throw err;
  }
}

/**
 * One-shot fetch of all counters. Returns Map: "/merge-pdf" -> count
 */
export async function getToolUsageMap() {
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const map = {};
    snap.forEach((d) => {
      const data = d.data();
      const link = data.link || `/${d.id}`;
      map[link] = Number(data.count) || 0;
    });
    return map;
  } catch (err) {
    console.warn('[toolUsage] getToolUsageMap failed', err?.message);
    return {};
  }
}

/**
 * Live subscription — calls `cb(map)` whenever any counter changes.
 * Returns unsubscribe function.
 */
export function subscribeToolUsage(cb) {
  try {
    return onSnapshot(
      collection(db, COLLECTION),
      (snap) => {
        const map = {};
        snap.forEach((d) => {
          const data = d.data();
          const link = data.link || `/${d.id}`;
          map[link] = Number(data.count) || 0;
        });
        cb(map);
      },
      (err) => {
        console.warn('[toolUsage] subscribe failed', err?.message);
        cb({});
      }
    );
  } catch (err) {
    console.warn('[toolUsage] subscribe setup failed', err?.message);
    cb({});
    return () => {};
  }
}

export { formatCount, COLLECTION as TOOL_USAGE_COLLECTION, normalizeSlug };
