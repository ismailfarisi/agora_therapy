/**
 * Firebase Client Configuration
 * Handles client-side Firebase operations (auth, firestore)
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { firebaseConfig, appConfig } from "../config";

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (appConfig.isDevelopment && typeof window !== "undefined") {
  // Only connect if we haven't already connected
  try {
    connectAuthEmulator(auth, "http://localhost:9099", {
      disableWarnings: true,
    });
  } catch (error) {
    // Emulator already connected or not available
  }

  try {
    connectFirestoreEmulator(db, "localhost", 8080);
  } catch (error) {
    // Emulator already connected or not available
  }

  try {
    connectStorageEmulator(storage, "localhost", 9199);
  } catch (error) {
    // Emulator already connected or not available
  }

  try {
    connectFunctionsEmulator(functions, "localhost", 5001);
  } catch (error) {
    // Emulator already connected or not available
  }
}

export default app;
