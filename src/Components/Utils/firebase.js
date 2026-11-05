import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const requiredConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
];

export const firebaseConfigured = requiredConfig.every(Boolean);
const firebaseApp = firebaseConfigured ? initializeApp(firebaseConfig) : null;

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const analyticsReady = firebaseApp && firebaseConfig.measurementId
  ? isSupported()
    .then((supported) => supported ? getAnalytics(firebaseApp) : null)
    .catch((error) => {
      console.error('Firebase Analytics could not be initialized:', error);
      return null;
    })
  : Promise.resolve(null);

export const requireFirebaseAuth = () => {
  if (!auth) {
    throw new Error('Firebase is not configured. Add the Yokan Vault Firebase Web App values to client/.env.');
  }
  return auth;
};
