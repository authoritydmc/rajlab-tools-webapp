import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const FEEDBACK_COLLECTION = 'feedback';

/**
 * Persist a rating + optional comment to Firestore.
 * Firestore collection: `feedback`
 *
 * Document shape:
 *  {
 *    rating: number (1-5),
 *    comment: string (0-500),
 *    tool: string            // downloadLabel / tool slug, e.g. "General" | "Merge PDF"
 *    path: string            // window.location.pathname at submission time
 *    url: string             // window.location.href
 *    userAgent: string
 *    appVersion: string
 *    createdAt: serverTimestamp()
 *    clientTimestamp: ISO string  // fallback / local time
 *  }
 *
 * Writes are intentionally public (no auth) — guarded by firestore.rules
 * validation + optional App Check in the future. Caller should handle errors.
 */
export async function submitFeedbackToFirestore({ rating, comment = '', tool = 'General' }) {
  const safeRating = Math.min(5, Math.max(1, Number(rating) || 5));
  const safeComment = String(comment || '').trim().slice(0, 500);
  const safeTool = String(tool || 'General').slice(0, 120);

  const doc = {
    rating: safeRating,
    comment: safeComment,
    tool: safeTool,
    path: typeof window !== 'undefined' ? window.location.pathname : '',
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : '',
    createdAt: serverTimestamp(),
    clientTimestamp: new Date().toISOString(),
  };

  // TEMP DEBUG — log AppCheck + result (remove after stable)
  try {
    const { appCheck } = await import('../firebaseConfig');
    if (appCheck) {
      const { getToken } = await import('firebase/app-check');
      getToken(appCheck, false).then(({ token }) => console.log(`[feedback DEBUG] ${safeTool} AppCheck OK len=${token.length}`)).catch((e) => console.warn(`[feedback DEBUG] ${safeTool} AppCheck FAIL`, e?.code, e?.message));
    } else {
      console.warn(`[feedback DEBUG] ${safeTool} appCheck is null`);
    }
  } catch {}
  const ref = await addDoc(collection(db, FEEDBACK_COLLECTION), doc);
  console.log(`[feedback DEBUG] ${safeTool} submit OK id=${ref.id} rating=${safeRating}`);
  return ref.id;
}

/**
 * Convenience: submit a star rating without a comment.
 */
export async function submitRatingToFirestore({ rating, tool = 'General' }) {
  return submitFeedbackToFirestore({ rating, comment: '', tool });
}

export const FEEDBACK_COLLECTION_NAME = FEEDBACK_COLLECTION;
