import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// If you have keys from ://google.com, swap them out here!
const firebaseConfig = {
  apiKey: "MOCK_API_KEY_FOR_LOCAL_DEV",
  authDomain: "://firebaseapp.com",
  projectId: "summarist-app",
  storageBucket: "://appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

// Initialize Firebase safely for Next.js hot-reloading environment
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
