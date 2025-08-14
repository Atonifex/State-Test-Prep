import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics, isSupported } from "firebase/analytics"; // Optional: add when Measurement ID is available

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID as string | undefined,
};

function createFirebaseApp() {
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId) {
    console.warn("Firebase config is missing or incomplete. Check NEXT_PUBLIC_ env vars.");
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

const app = createFirebaseApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// TODO(step 13): Enable offline persistence for Firestore and add robust retry for queued writes.
// Example later: enableIndexedDbPersistence(db).catch(() => {/* fallback */});

// Optional: Analytics (uncomment when Measurement ID is provided)
// (async () => {
//   if (typeof window !== 'undefined' && (await isSupported())) {
//     getAnalytics(app);
//   }
// })(); 