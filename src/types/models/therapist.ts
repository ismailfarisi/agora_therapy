/**
 * Therapist Model
 * Therapist profile and related types
 * 
 * Note: These types are used across:
 * - Onboarding wizard (with Date objects)
 * - Admin views (with serialized ISO strings via TherapistAdminView)
 * - Client-side services (with Firestore Timestamps)
 */

import { Timestamp } from "firebase/firestore";

export interface TherapistProfile {
  id: string; // same as user.id
  photoURL?: string; // Profile photo URL from Firebase Storage
  services: string[]; // Array of service IDs from AVAILABLE_SERVICES
  credentials: {
    licenseNumber: string;
    licenseState: string;
    licenseExpiry: Timestamp;
    specializations: string[];
    certifications: string[];
  };
  practice: {
    bio: string;
    yearsExperience: number;
    sessionTypes: ("individual" | "couples" | "family" | "group")[];
    languages: string[];
    hourlyRate: number;
    currency: string;
  };
  availability: {
    timezone: string;
    bufferMinutes: number; // time between sessions
    maxDailyHours: number;
    advanceBookingDays: number; // how far ahead clients can book
  };
  verification: {
    isVerified: boolean;
    verifiedAt?: Timestamp;
    verifiedBy?: string;
  };
  isFeatured?: boolean; // Manually set in Firebase to feature on homepage
}

export interface TherapistOnboardingData {
  credentials: {
    licenseNumber: string;
    licenseState: string;
    licenseExpiry: Date;
    specializations: string[];
    certifications: string[];
  };
  practice: {
    bio: string;
    yearsExperience: number;
    sessionTypes: ("individual" | "couples" | "family" | "group")[];
    languages: string[];
    hourlyRate: number;
    currency: string;
  };
  availability: {
    timezone: string;
    bufferMinutes: number;
    maxDailyHours: number;
    advanceBookingDays: number;
  };
}

export interface TherapistSearchFilters {
  specializations?: string[];
  languages?: string[];
  sessionTypes?: ("individual" | "couples" | "family" | "group")[];
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: {
    date?: Date;
    timeSlots?: string[];
  };
}

/**
 * Therapist data for admin views
 * Includes user profile and therapist profile with serialized dates
 */
export interface TherapistAdminView {
  id: string;
  email: string;
  profile: {
    displayName: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    avatarUrl?: string;
  };
  therapistProfile?: {
    services?: string[];
    credentials: {
      licenseNumber: string;
      licenseState: string;
      licenseExpiry?: string; // ISO string for API responses
      specializations: string[];
      certifications: string[];
    };
    practice: {
      bio: string;
      yearsExperience: number;
      sessionTypes: ("individual" | "couples" | "family" | "group")[];
      hourlyRate: number;
      languages: string[];
      currency: string;
    };
    availability: {
      timezone: string;
      bufferMinutes: number;
      maxDailyHours: number;
      advanceBookingDays: number;
    };
    verification: {
      isVerified: boolean;
      verifiedAt?: string; // ISO string for API responses
      verifiedBy?: string;
    };
    isFeatured?: boolean; // Manually set in Firebase to feature on homepage
  };
  status: string;
  metadata?: {
    createdAt: string;
    lastLoginAt: string;
  };
}
