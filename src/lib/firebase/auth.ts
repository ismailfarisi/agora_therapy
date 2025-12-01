/**
 * Firebase Authentication Utilities
 * Provides helper functions for authentication operations
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./client";
import { documents } from "./collections";
import type { User as AppUser, UserRole } from "@/types/database";

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Auth state listener
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Sign up with email and password
export async function signUpWithEmail(
  email: string,
  password: string,
  userData: {
    firstName: string;
    lastName: string;
    role: UserRole;
    phoneNumber?: string;
  }
): Promise<UserCredential> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const { user } = userCredential;

    // Update Firebase Auth profile
    await updateProfile(user, {
      displayName: `${userData.firstName} ${userData.lastName}`,
    });

    // Create user document in Firestore
    const userDoc: AppUser = {
      id: user.uid,
      email: user.email!,
      profile: {
        displayName: `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        ...(userData.phoneNumber && { phoneNumber: userData.phoneNumber }),
        ...(user.photoURL && { avatarUrl: user.photoURL }),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: navigator.language || "en-US",
      },
      role: userData.role,
      status: "active",
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
        privacy: {
          shareProfile: false,
          allowDirectMessages: true,
        },
      },
      metadata: {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        onboardingCompleted: false,
      },
    };

    await setDoc(documents.user(user.uid), userDoc);

    // Send email verification
    if (user.email) {
      await sendEmailVerification(user);
    }

    return userCredential;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}

// Sign in with email and password
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update last login time
    const userRef = documents.user(userCredential.user.uid);
    await setDoc(
      userRef,
      {
        metadata: {
          lastLoginAt: serverTimestamp(),
        },
      },
      { merge: true }
    );

    return userCredential;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

// Sign in with Google
export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const { user } = userCredential;

    // Check if user exists in Firestore
    const userDoc = await getDoc(documents.user(user.uid));

    if (!userDoc.exists()) {
      // Create new user document for Google sign-in
      const names = user.displayName?.split(" ") || ["", ""];
      const userData: AppUser = {
        id: user.uid,
        email: user.email!,
        profile: {
          displayName: user.displayName || "",
          firstName: names[0] || "",
          lastName: names.slice(1).join(" ") || "",
          ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
          ...(user.photoURL && { avatarUrl: user.photoURL }),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          locale: navigator.language || "en-US",
        },
        role: "client", // Default role for Google sign-in
        status: "active",
        preferences: {
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          privacy: {
            shareProfile: false,
            allowDirectMessages: true,
          },
        },
        metadata: {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          onboardingCompleted: false,
        },
      };

      await setDoc(documents.user(user.uid), userData);
    } else {
      // Update last login time
      await setDoc(
        documents.user(user.uid),
        {
          metadata: {
            lastLoginAt: serverTimestamp(),
          },
        },
        { merge: true }
      );
    }

    return userCredential;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

// Send password reset email
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

// Sign out
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

// Get current user data from Firestore
export async function getCurrentUserData(): Promise<AppUser | null> {
  try {
    const user = auth.currentUser;
    console.log("🔍 getCurrentUserData - Auth current user:", user?.uid);
    
    if (!user) {
      console.log("❌ getCurrentUserData - No current user");
      return null;
    }

    const userDocRef = documents.user(user.uid);
    console.log("🔍 getCurrentUserData - Fetching doc for user:", user.uid);
    
    const userDoc = await getDoc(userDocRef);
    console.log("🔍 getCurrentUserData - Doc exists:", userDoc.exists());
    
    if (!userDoc.exists()) {
      console.log("❌ getCurrentUserData - User document does not exist");
      return null;
    }

    const userData = userDoc.data() as AppUser;
    console.log("✅ getCurrentUserData - User data:", JSON.stringify(userData, null, 2));
    console.log("📞 getCurrentUserData - Phone number:", userData?.profile?.phoneNumber);
    
    return userData;
  } catch (error) {
    console.error("❌ Error getting current user data:", error);
    return null;
  }
}

// Check if user has specific role
export async function hasRole(role: UserRole): Promise<boolean> {
  try {
    const userData = await getCurrentUserData();
    return userData?.role === role || false;
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
}
