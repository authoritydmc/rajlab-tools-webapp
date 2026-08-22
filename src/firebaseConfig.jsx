// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import firebaseConfigData from './firebaseConfig.json'; // Import JSON config

const firebaseApp = initializeApp(firebaseConfigData);

let analytics = null;
try {
  analytics = getAnalytics(firebaseApp);
} catch {
  // Analytics not supported in this environment (e.g. SSR / unsupported browser)
}

const db = getFirestore(firebaseApp);

// ── App Check (reCAPTCHA v3) — free, public site key hardcoded ─────
// Site key is public by design (domain-locked in reCAPTCHA Admin). Hardcoded
// so open-source deploys work without env setup. Override via env if needed.
let appCheck = null;
const hardcodedSiteKey = "6LfrIJMtAAAAAOcUqVTk_vsCTEGBF_bofvKJ7yhY";
const v3Key = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY?.trim();
const enterpriseKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY?.trim();
const recaptchaSiteKey = v3Key || enterpriseKey || hardcodedSiteKey;
const isEnterprise = !!enterpriseKey && !v3Key;
if (recaptchaSiteKey && typeof window !== "undefined") {
  try {
    if (import.meta.env.DEV) {
      // @ts-ignore — debug token for localhost (register printed token in Console → App Check → Manage debug tokens)
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
    }
    appCheck = initializeAppCheck(firebaseApp, {
      provider: isEnterprise ? new ReCaptchaEnterpriseProvider(recaptchaSiteKey) : new ReCaptchaV3Provider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (e) {
    console.warn("[AppCheck] init failed — check site key", e);
  }
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