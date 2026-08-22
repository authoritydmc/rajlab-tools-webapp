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

// ── App Check (reCAPTCHA Enterprise) — public site key hardcoded ─────
// Site key is public by design (domain-locked in reCAPTCHA Admin). Hardcoded
// so open-source deploys work without env setup. Override via env if needed.
// 400 on exchangeRecaptchaV3Token → you used V3 provider with an Enterprise key (or vice versa)
// or domain not allowlisted. This project uses Enterprise key 6LfrIJMt... by default.
let appCheck = null;
const hardcodedSiteKey = "6LfrIJMtAAAAAOcUqVTk_vsCTEGBF_bofvKJ7yhY";
// This hardcoded key is reCAPTCHA **Enterprise** (see Google Cloud Console → reCAPTCHA → Key details shows grecaptcha.enterprise.execute).
// Your 400 `exchangeRecaptchaV3Token` error proves the app incorrectly used ReCaptchaV3Provider with an Enterprise key.
// Fix: treat hardcoded key as Enterprise by default. Override only if VITE_RECAPTCHA_V3_SITE_KEY is explicitly set.
const v3Key = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY?.trim();
const enterpriseKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY?.trim();
const recaptchaSiteKey = v3Key || enterpriseKey || hardcodedSiteKey;
// Enterprise if: explicit enterpriseKey set, OR we're falling back to the hardcoded Enterprise key and no v3Key provided.
const isEnterprise = !!enterpriseKey || (!v3Key && recaptchaSiteKey === hardcodedSiteKey);
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

    // Gracefully surface the 400 that happens async (token exchange). Don't crash the app;
    // Firestore writes already fallback to localStorage and rules should allow graceful degradation.
    // Log actionable hint for https://utils.rajlabs.in/ mismatch.
    if (typeof window !== "undefined") {
      window.addEventListener("unhandledrejection", (ev) => {
        const msg = String(ev?.reason?.message || ev?.reason || "");
        if (msg.includes("appCheck") || msg.includes("exchangeRecaptcha") || msg.includes("400")) {
          console.warn(
            "[AppCheck] token exchange failed (400). Likely: site key not authorized for this domain (add utils.rajlabs.in / utility.rajlabs.in in reCAPTCHA Admin + Firebase Console > App Check) or v3 vs Enterprise mismatch. App continues without App Check; Firestore writes may be rejected until fixed. Details:",
            ev.reason
          );
        }
      });
    }
  } catch (e) {
    console.warn(
      "[AppCheck] init failed — check site key (is this key v3 or Enterprise? Add utils.rajlabs.in to allowlist). App will run without App Check.",
      e
    );
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