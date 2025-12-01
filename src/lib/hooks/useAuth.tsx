/**
 * Authentication Context and Hook
 * Provides authentication state and methods throughout the app
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import {
  onAuthStateChange,
  getCurrentUserData,
  signOutUser,
} from "@/lib/firebase/auth";
import type { User as AppUser } from "@/types/database";

interface AuthContextType {
  user: User | null;
  userData: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Refresh user data from Firestore
  const refreshUserData = async () => {
    console.log("🔄 refreshUserData - Called with user:", user?.uid);
    
    if (user) {
      try {
        console.log("🔄 refreshUserData - Fetching user data...");
        const data = await getCurrentUserData();
        console.log("🔄 refreshUserData - Got data:", data ? "✅ Data received" : "❌ No data");
        console.log("🔄 refreshUserData - Data details:", JSON.stringify(data, null, 2));
        setUserData(data);
      } catch (error) {
        console.error("❌ Error refreshing user data:", error);
        setUserData(null);
      }
    } else {
      console.log("🔄 refreshUserData - No user, setting userData to null");
      setUserData(null);
    }
  };

  // Sign out function
  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  // Listen to authentication state changes
  useEffect(() => {
    console.log("👂 useAuth - Setting up auth state listener");
    
    const unsubscribe = onAuthStateChange(async (authUser) => {
      console.log("🔐 Auth state changed - User:", authUser?.uid || "null");
      setUser(authUser);
      setLoading(true);

      if (authUser) {
        console.log("✅ User authenticated:", authUser.email);
        // Set auth token cookie for middleware
        try {
          const token = await authUser.getIdToken();
          document.cookie = `auth-token=${token}; path=/; secure; samesite=strict`;
          console.log("🍪 Auth token cookie set");

          // Get user data from Firestore
          console.log("📥 Fetching user data from Firestore...");
          await refreshUserData();
        } catch (error) {
          console.error("❌ Error setting auth token:", error);
        }
      } else {
        console.log("❌ No user authenticated");
        // Clear auth token cookie
        document.cookie =
          "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setUserData(null);
      }

      setLoading(false);
      console.log("✅ Auth state processing complete");
    });

    return unsubscribe;
  }, []);

  // Refresh user data when user changes
  useEffect(() => {
    if (user && !userData) {
      refreshUserData();
    }
  }, [user, userData]);

  const value: AuthContextType = {
    user,
    userData,
    loading,
    signOut: handleSignOut,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use authentication context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper hooks for role checking
export function useIsClient() {
  const { userData } = useAuth();
  return userData?.role === "client";
}

export function useIsTherapist() {
  const { userData } = useAuth();
  return userData?.role === "therapist";
}

export function useIsAdmin() {
  const { userData } = useAuth();
  return userData?.role === "admin";
}

// Hook to get user role
export function useUserRole() {
  const { userData } = useAuth();
  return userData?.role || null;
}

// Hook to check if user has completed onboarding
export function useOnboardingStatus() {
  const { userData } = useAuth();
  return userData?.metadata?.onboardingCompleted || false;
}
