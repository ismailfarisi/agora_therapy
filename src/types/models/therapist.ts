/**
 * Therapist Model
 * Therapist profile and related types
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
