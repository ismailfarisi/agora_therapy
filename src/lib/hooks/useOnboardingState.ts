/**
 * Onboarding State Management Hook
 * Manages onboarding flow state and data
 */

import { useState, useCallback } from "react";
import { Timestamp } from "firebase/firestore";

export interface OnboardingState {
  basicInfo: {
    firstName: string;
    lastName: string;
    displayName: string;
    phoneNumber?: string;
    timezone: string;
    locale: string;
    photoURL?: string;
  };
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
  therapistProfile?: {
    services: string[]; // Service IDs
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
      weeklyHours: { [dayOfWeek: number]: { start: string; end: string }[] };
    };
  };
}

export function useOnboardingState(
  initialState: OnboardingState,
  isTherapist: boolean
) {
  const [state, setState] = useState<OnboardingState>(initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const updateBasicInfo = useCallback(
    (field: keyof OnboardingState["basicInfo"], value: string) => {
      setState((prev) => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          [field]: value,
        },
      }));
    },
    []
  );

  const setServices = useCallback((services: string[]) => {
    setState((prev) => ({
      ...prev,
      therapistProfile: prev.therapistProfile
        ? {
            ...prev.therapistProfile,
            services,
          }
        : prev.therapistProfile,
    }));
  }, []);

  const updateTherapistCredentials = useCallback(
    (
      field: keyof NonNullable<OnboardingState["therapistProfile"]>["credentials"],
      value: string | string[] | boolean | number
    ) => {
      setState((prev) => ({
        ...prev,
        therapistProfile: prev.therapistProfile
          ? {
              ...prev.therapistProfile,
              credentials: {
                ...prev.therapistProfile.credentials,
                [field]: value,
              },
            }
          : prev.therapistProfile,
      }));
    },
    []
  );

  const updateTherapistPractice = useCallback(
    (
      field: keyof NonNullable<OnboardingState["therapistProfile"]>["practice"],
      value: string | string[] | boolean | number
    ) => {
      setState((prev) => ({
        ...prev,
        therapistProfile: prev.therapistProfile
          ? {
              ...prev.therapistProfile,
              practice: {
                ...prev.therapistProfile.practice,
                [field]: value,
              },
            }
          : prev.therapistProfile,
      }));
    },
    []
  );

  const updateTherapistAvailability = useCallback(
    (
      field: keyof NonNullable<OnboardingState["therapistProfile"]>["availability"],
      value: number | string | { [dayOfWeek: number]: { start: string; end: string }[] }
    ) => {
      setState((prev) => ({
        ...prev,
        therapistProfile: prev.therapistProfile
          ? {
              ...prev.therapistProfile,
              availability: {
                ...prev.therapistProfile.availability,
                [field]: value,
              },
            }
          : prev.therapistProfile,
      }));
    },
    []
  );

  const setPhotoURL = useCallback((url: string) => {
    setState((prev) => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        photoURL: url,
      },
    }));
  }, []);

  const validateStep = useCallback(
    (stepId: string): boolean => {
      switch (stepId) {
        case "basic-info":
          return !!(
            state.basicInfo.firstName &&
            state.basicInfo.lastName &&
            state.basicInfo.displayName
          );

        case "photo":
          return true; // Photo is optional

        case "credentials":
          if (!isTherapist || !state.therapistProfile) return true;
          return !!(
            state.therapistProfile.credentials.licenseNumber &&
            state.therapistProfile.credentials.licenseState
          );

        case "practice":
          if (!isTherapist || !state.therapistProfile) return true;
          return !!(
            state.therapistProfile.practice.bio &&
            state.therapistProfile.practice.yearsExperience > 0
          );

        case "rates":
          if (!isTherapist || !state.therapistProfile) return true;
          return state.therapistProfile.practice.hourlyRate > 0;

        default:
          return true;
      }
    },
    [state, isTherapist]
  );

  return {
    state,
    setState,
    currentStep,
    setCurrentStep,
    uploadingPhoto,
    setUploadingPhoto,
    updateBasicInfo,
    setServices,
    updateTherapistCredentials,
    updateTherapistPractice,
    updateTherapistAvailability,
    setPhotoURL,
    validateStep,
  };
}
