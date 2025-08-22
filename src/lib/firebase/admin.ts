/**
 * Firebase Admin Configuration
 * Handles server-side Firebase operations with admin privileges
 */

import {
  initializeApp,
  getApps,
  cert,
  App,
  ServiceAccount,
} from "firebase-admin/app";
import { credential } from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { config } from "../config";
import serviceAccount from "../../../firebase-admin.json";

let adminApp: App;

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin(): App {
  if (getApps().length === 0) {
    // Initialize with service account credentials
    adminApp = initializeApp({
      credential: cert({
        projectId: config.firebase.projectId,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      }),
    });
  } else {
    adminApp = getApps()[0] as App;
  }

  return adminApp;
}

// Get Firebase Admin services
export function getAdminAuth() {
  if (!adminApp) initializeFirebaseAdmin();
  return getAuth(adminApp);
}

export function getAdminFirestore() {
  if (!adminApp) initializeFirebaseAdmin();
  return getFirestore(adminApp);
}

export function getAdminStorage() {
  if (!adminApp) initializeFirebaseAdmin();
  return getStorage(adminApp);
}

// Utility functions for common admin operations
export async function verifyIdToken(idToken: string) {
  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    throw new Error("Invalid authentication token");
  }
}

export async function createCustomToken(
  uid: string,
  additionalClaims?: object
) {
  try {
    const auth = getAdminAuth();
    return await auth.createCustomToken(uid, additionalClaims);
  } catch (error) {
    console.error("Error creating custom token:", error);
    throw new Error("Failed to create authentication token");
  }
}

export async function setUserClaims(uid: string, customClaims: object) {
  try {
    const auth = getAdminAuth();
    await auth.setCustomUserClaims(uid, customClaims);
  } catch (error) {
    console.error("Error setting custom claims:", error);
    throw new Error("Failed to set user permissions");
  }
}

export async function getUserByEmail(email: string) {
  try {
    const auth = getAdminAuth();
    return await auth.getUserByEmail(email);
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
}

export async function deleteUser(uid: string) {
  try {
    const auth = getAdminAuth();
    await auth.deleteUser(uid);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}

// Initialize on module load
initializeFirebaseAdmin();
