/**
 * Therapist Profile Validation Schemas
 * Zod schemas for form validation
 */

import { z } from "zod";

// Base validation schemas
export const credentialsSchema = z.object({
  licenseNumber: z
    .string()
    .min(1, "License number is required")
    .max(50, "License number must be less than 50 characters"),
  licenseState: z
    .string()
    .min(1, "License state is required")
    .max(50, "License state must be less than 50 characters"),
  licenseExpiry: z.date().optional(),
  specializations: z
    .array(z.string())
    .min(1, "At least one specialization is required")
    .max(10, "Maximum 10 specializations allowed"),
  certifications: z
    .array(z.string())
    .max(10, "Maximum 10 certifications allowed"),
});

export const practiceSchema = z.object({
  bio: z
    .string()
    .min(50, "Bio must be at least 50 characters")
    .max(2000, "Bio must be less than 2000 characters"),
  yearsExperience: z
    .number()
    .min(0, "Years of experience cannot be negative")
    .max(50, "Years of experience cannot exceed 50"),
  sessionTypes: z
    .array(z.enum(["individual", "couples", "family", "group"]))
    .min(1, "At least one session type is required"),
  languages: z
    .array(z.string())
    .min(1, "At least one language is required")
    .max(10, "Maximum 10 languages allowed"),
  hourlyRate: z
    .number()
    .min(1, "Hourly rate must be at least $1")
    .max(1000, "Hourly rate cannot exceed $1000"),
  currency: z
    .string()
    .min(3, "Currency code is required")
    .max(3, "Currency code must be 3 characters")
    .default("USD"),
});

export const availabilitySchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
  bufferMinutes: z
    .number()
    .min(0, "Buffer time cannot be negative")
    .max(120, "Buffer time cannot exceed 2 hours"),
  maxDailyHours: z
    .number()
    .min(1, "Must allow at least 1 hour per day")
    .max(16, "Cannot exceed 16 hours per day"),
  advanceBookingDays: z
    .number()
    .min(1, "Must allow at least 1 day advance booking")
    .max(365, "Cannot exceed 365 days advance booking"),
});

// Complete therapist profile schema
export const therapistProfileSchema = z.object({
  credentials: credentialsSchema,
  practice: practiceSchema,
  availability: availabilitySchema,
});

// Partial schema for updates
export const therapistProfileUpdateSchema = z.object({
  credentials: credentialsSchema.partial(),
  practice: practiceSchema.partial(),
  availability: availabilitySchema.partial(),
});

// Document upload validation
export const documentUploadSchema = z.object({
  file: z
    .instanceof(File, { message: "Please select a file" })
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "File size must be less than 10MB"
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
      "Only JPEG, PNG, and PDF files are allowed"
    ),
  documentType: z.enum(["license", "certification", "insurance", "other"]),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
});

// Search filters validation
export const therapistSearchFiltersSchema = z.object({
  specializations: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  sessionTypes: z
    .array(z.enum(["individual", "couples", "family", "group"]))
    .optional(),
  priceRange: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
    })
    .refine(
      (data) => data.min <= data.max,
      "Minimum price must be less than maximum price"
    )
    .optional(),
  availability: z
    .object({
      date: z.date().optional(),
      timeSlots: z.array(z.string()).optional(),
    })
    .optional(),
});

// Form field validation helpers
export const validateSpecialization = (value: string): string | null => {
  if (!value.trim()) return "Specialization cannot be empty";
  if (value.length > 100)
    return "Specialization must be less than 100 characters";
  return null;
};

export const validateCertification = (value: string): string | null => {
  if (!value.trim()) return "Certification cannot be empty";
  if (value.length > 100)
    return "Certification must be less than 100 characters";
  return null;
};

export const validateLanguage = (value: string): string | null => {
  if (!value.trim()) return "Language cannot be empty";
  if (value.length > 50) return "Language must be less than 50 characters";
  return null;
};

// Type exports for TypeScript
export type TherapistProfileFormData = z.infer<typeof therapistProfileSchema>;
export type TherapistProfileUpdateData = z.infer<
  typeof therapistProfileUpdateSchema
>;
export type DocumentUploadData = z.infer<typeof documentUploadSchema>;
export type TherapistSearchFiltersData = z.infer<
  typeof therapistSearchFiltersSchema
>;
export type CredentialsData = z.infer<typeof credentialsSchema>;
export type PracticeData = z.infer<typeof practiceSchema>;
export type AvailabilityData = z.infer<typeof availabilitySchema>;

// Form validation utilities
export const getFieldError = (
  errors: Record<string, unknown>,
  fieldPath: string
): string | undefined => {
  const keys = fieldPath.split(".");
  let error = errors;

  for (const key of keys) {
    if (error?.[key]) {
      error = error[key] as Record<string, unknown>;
    } else {
      return undefined;
    }
  }

  return (error as { message?: string })?.message;
};

export const hasFieldError = (
  errors: Record<string, unknown>,
  fieldPath: string
): boolean => {
  return !!getFieldError(errors, fieldPath);
};

// Validation state helpers
export const getValidationState = (
  errors: Record<string, unknown>,
  fieldPath: string
): "valid" | "invalid" | "default" => {
  if (hasFieldError(errors, fieldPath)) {
    return "invalid";
  }
  return "default";
};
