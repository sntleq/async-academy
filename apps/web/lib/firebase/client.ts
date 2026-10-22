import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config = {
  apiKey: "AIzaSyD1MnVpvibsWWYPOV-XlQHcGn6-zNMt_KM",
  authDomain: "async-academy-23fe9.firebaseapp.com",
  projectId: "async-academy-23fe9",
  storageBucket: "async-academy-23fe9.firebasestorage.app",
  messagingSenderId: "892709968235",
  appId: "1:892709968235:web:5fb7680e088cad6501d42e",
  measurementId: "G-C3FBDYYPMM"
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId
);

export function getFirebaseClient() {
  if (!isFirebaseConfigured) return null;

  const app = getApps().length ? getApp() : initializeApp(config);
  return { auth: getAuth(app), db: getFirestore(app) };
}
