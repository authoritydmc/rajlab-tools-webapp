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
  } catch (err) {
    // allow retry next time by clearing cooldown
    if (incrementedThisSession._timestamps) delete incrementedThisSession._timestamps[key];
    // Fail silently — App Check enforcement at API layer will reject invalid origins before reaching here
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
