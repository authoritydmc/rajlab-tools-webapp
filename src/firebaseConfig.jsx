// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider, ReCaptchaEnterpriseProvider, getToken as getAppCheckToken } from "firebase/app-check";
import firebaseConfigData from './firebaseConfig.json'; // Import JSON config

const firebaseApp = initializeApp(firebaseConfigData);

let analytics = null;
try {
  analytics = getAnalytics(firebaseApp);
} catch {
  // Analytics not supported in this environment (e.g. SSR / unsupported browser)
}

// ── App Check (reCAPTCHA v3) — MUST init BEFORE Firestore so Firestore channel includes X-Firebase-AppCheck ─────
// Site key is public by design (domain-locked in reCAPTCHA Admin). Hardcoded
// so open-source deploys work without env setup. Override via env if needed.
// 400 on exchangeRecaptchaV3Token → domain not allowlisted or secret mismatch.
let appCheck = null;
const hardcodedSiteKey = "6LfUX5MtAAAAAKfkcweTqd2WFjR2t_x2jliJu9-p"; // v3 — rajlabs.in (2026-08-22) — domains: utils.rajlabs.in / utility.rajlabs.in / rajlabs.in — clipboard-verified
const v3Key = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY?.trim();
const enterpriseKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY?.trim();
const recaptchaSiteKey = v3Key || enterpriseKey || hardcodedSiteKey;
const isEnterprise = !!enterpriseKey && !v3Key; // v3 by default; Enterprise only if explicitly set via env
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

    // TEMP DEBUG — remove after App Check stable (shows why text-diff got PERMISSION_DENIED despite no visible recaptcha error)
    if (typeof window !== "undefined") {
      console.log(`[AppCheck DEBUG] init key=${recaptchaSiteKey.slice(0,6)}...${recaptchaSiteKey.slice(-4)} provider=${isEnterprise ? 'Enterprise' : 'V3'} host=${window.location.hostname} DEV=${import.meta.env.DEV}`);
      // Log first token fetch (async) — will show 400/ App not registered if misconfigured
      getAppCheckToken(appCheck, false).then(({ token }) => {
        console.log(`[AppCheck DEBUG] ✅ getToken OK provider=${isEnterprise ? 'Enterprise' : 'V3'} token=${token.slice(0,12)}... len=${token.length} time=${new Date().toISOString()}`);
        console.log(`[AppCheck DEBUG] ✅ reCAPTCHA passed — token valid, Firestore writes will include X-Firebase-AppCheck header`);
      }).catch((e) => {
        console.warn(`[AppCheck DEBUG] ❌ getToken FAILED code=${e?.code} message=${e?.message}`, e);
        console.warn(`[AppCheck DEBUG] ❌ reCAPTCHA FAILED — check Site Key ${recaptchaSiteKey.slice(0,6)}... allowed domains, Firebase App Check Secret, and that you are on ${window.location.hostname}`);
      });
      // also log auto-refresh success
      try {
        // @ts-ignore — onTokenChanged is available in v10+
        import('firebase/app-check').then(({ onTokenChanged }) => {
          if (typeof onTokenChanged === 'function') {
            onTokenChanged(appCheck, (tok) => {
              if (tok?.token) {
                const exp = tok.expireTimeMillis;
                const expStr = typeof exp === 'number' ? (()=>{ try{ return new Date(exp).toISOString(); }catch{ return String(exp);} })() : 'n/a';
                console.log(`[AppCheck DEBUG] 🔄 onTokenChanged OK len=${tok.token.length} expires=${expStr}`);
              }
            }, (err) => console.warn(`[AppCheck DEBUG] 🔄 onTokenChanged FAIL`, err));
          }
        });
      } catch {}
      // expose for manual console test: await __APPCHECK_DEBUG.getToken()
      // @ts-ignore
      window.__APPCHECK_DEBUG = { appCheck, getToken: () => getAppCheckToken(appCheck, false), key: recaptchaSiteKey, isEnterprise, testSuccess: () => console.log('[AppCheck DEBUG] ✅ manual getToken test — if you see this with token length, reCAPTCHA passed') };

      // Header logging removed: previous fetch/XHR wrapper broke WebChannel (RangeError) and hid real header.
      // Verify X-Firebase-AppCheck via DevTools Network → Write/channel → Request Headers instead.
      // AppCheck token is auto-attached by SDK when initialized BEFORE Firestore (fixed in 119bff8) — no manual bundle needed.
      // Sending token via document/bundle field is NOT secure: rules' request.app is only populated from verified header, not from data field (spoofable).
    }

    // Gracefully surface the 400 that happens async (token exchange). Don't crash the app;
    // Firestore writes already fallback to localStorage and rules should allow graceful degradation.
    // Log actionable hint for https://utils.rajlabs.in/ mismatch.
    if (typeof window !== "undefined") {
      window.addEventListener("unhandledrejection", (ev) => {
        const msg = String(ev?.reason?.message || ev?.reason || "");
        if (msg.includes("appCheck") || msg.includes("exchangeRecaptcha") || msg.includes("400") || msg.includes("App not registered")) {
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

// Firestore MUST be created AFTER AppCheck so X-Firebase-AppCheck is attached to Write/Listen channels
const db = getFirestore(firebaseApp);

const logFirebaseEvent = (eventName, eventParams = {}) => {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  } else {
    console.warn("Analytics is not supported or not initialized");
  }
};

// Exporting app, db, analytics and helper
export { firebaseApp, analytics, db, appCheck, logFirebaseEvent };