/**
 * Zustand Store for Authentication State
 * Global state management for user authentication
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { User as AppUser } from "@/types/database";

interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<AppUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set(
          {
            user,
            isAuthenticated: !!user,
            isLoading: false,
          },
          false,
          "setUser"
        ),

      setLoading: (loading) => set({ isLoading: loading }, false, "setLoading"),

      clearUser: () =>
        set(
          {
            user: null,
            isAuthenticated: false,
            isLoading: false,
          },
          false,
          "clearUser"
        ),

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set(
            {
              user: { ...currentUser, ...updates },
            },
            false,
            "updateUser"
          );
        }
      },
    }),
    {
      name: "auth-store",
    }
  )
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectIsClient = (state: AuthState) =>
  state.user?.role === "client";
export const selectIsTherapist = (state: AuthState) =>
  state.user?.role === "therapist";
export const selectIsAdmin = (state: AuthState) => state.user?.role === "admin";
