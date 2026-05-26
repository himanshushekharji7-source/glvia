import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if credentials are valid and not default placeholders
const isConfigValid = 
  !!firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "your_firebase_api_key" && 
  !firebaseConfig.apiKey.startsWith("your_");

let authInstance: Auth | null = null;

if (isConfigValid) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(app);
  } catch (error) {
    console.error("Failed to initialize Firebase Auth:", error);
  }
} else {
  if (typeof window !== "undefined") {
    console.warn("Firebase Auth config is missing or invalid. OTP login features will not work.");
  }
}

export const auth = authInstance as Auth;
export const googleProvider = new GoogleAuthProvider();
