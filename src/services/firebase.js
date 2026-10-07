import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Orbit Solar Multi-Tenant SaaS Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLg85Z-hTITE-EasoIrm-gxHbXKTVAk2c",
  authDomain: "orbit-system-e42c4.firebaseapp.com",
  projectId: "orbit-system-e42c4",
  storageBucket: "orbit-system-e42c4.firebasestorage.app",
  messagingSenderId: "125524652388",
  appId: "1:125524652388:web:384c4f0cf388fe3b4eca71",
  measurementId: "G-7MS008TDYK"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Safe Analytics Initialization (Supported in browser environments)
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics fallback if disabled or adblock active
  });
}

export default app;
