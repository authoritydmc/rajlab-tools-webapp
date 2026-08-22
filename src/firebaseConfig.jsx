// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import firebaseConfigData from './firebaseConfig.json'; // Import JSON config

const firebaseApp = initializeApp(firebaseConfigData);

let analytics = null;
try {
  analytics = getAnalytics(firebaseApp);
} catch {
  // Analytics not supported in this environment (e.g. SSR / unsupported browser)
}

const db = getFirestore(firebaseApp);

// ── App Check (reCAPTCHA Enterprise) — non-invasive, invisible ────────
// Set VITE_RECAPTCHA_ENTERPRISE_SITE_KEY in .env (or hosting env) to enable.
// For local dev, set VITE_APPCHECK_DEBUG_TOKEN=true to auto-enable debug token
// and register it in Firebase Console → App Check → Manage debug tokens.
// If key is missing, App Check is skipped (writes still work until rules enforce).
let appCheck = null;
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY?.trim();
if (recaptchaSiteKey && typeof window !== "undefined") {
  try {
    if (import.meta.env.DEV) {
      // @ts-ignore — debug token for localhost
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
    }
    appCheck = initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (e) {
    console.warn("[AppCheck] init failed — check site key", e);
  }
} else if (import.meta.env.DEV) {
  console.info("[AppCheck] skipped — set VITE_RECAPTCHA_ENTERPRISE_SITE_KEY to enable");
}

const logFirebaseEvent = (eventName, eventParams = {}) => {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  } else {
    console.warn("Analytics is not supported or not initialized");
  }
};

// Exporting app, db, analytics and helper
export { firebaseApp, analytics, db, appCheck, logFirebaseEvent };