/**
 * User Model
 * Core user entity and related types
 */

import { Timestamp, FieldValue } from "firebase/firestore";

export type UserRole = "client" | "therapist" | "admin";
export type UserStatus = "active" | "inactive" | "suspended";

export interface User {
  id: string; // Firebase Auth UID
  email: string;
  profile: {
    displayName: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    avatarUrl?: string;
    timezone: string;
    locale: string;
  };
  role: UserRole;
  status: UserStatus;
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      shareProfile: boolean;
      allowDirectMessages: boolean;
    };
  };
  metadata: {
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
    lastLoginAt: Timestamp | FieldValue;
    onboardingCompleted: boolean;
  };
}

export interface UserRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
}
