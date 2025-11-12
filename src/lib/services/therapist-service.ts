/**
 * Therapist Service
 * Firebase operations for therapist profile management
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  collection,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  StorageReference,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase/client";
import { documents, collections } from "@/lib/firebase/collections";
import {
  TherapistProfile,
  TherapistOnboardingData,
  TherapistSearchFilters,
} from "@/types/database";

export type ProfileCompletionData = {
  percentage: number;
  missingFields: string[];
  completedSections: string[];
};

export type DocumentUploadResult = {
  url: string;
  filename: string;
  uploadedAt: Date;
};

export class TherapistService {
  /**
   * Get therapist profile by ID
   */
  static async getProfile(
    therapistId: string
  ): Promise<TherapistProfile | null> {
    try {
      const docRef = documents.therapistProfile(therapistId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as TherapistProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching therapist profile:", error);
      throw new Error("Failed to fetch therapist profile");
    }
  }

  /**
   * Create or update therapist profile
   */
  static async saveProfile(
    therapistId: string,
    profileData: Partial<TherapistProfile>
  ): Promise<void> {
    try {
      const docRef = documents.therapistProfile(therapistId);
      const existingDoc = await getDoc(docRef);

      if (existingDoc.exists()) {
        // Update existing profile
        await updateDoc(docRef, {
          ...profileData,
          metadata: {
            ...existingDoc.data().metadata,
            updatedAt: serverTimestamp(),
          },
        });
      } else {
        // Create new profile
        const newProfile: TherapistProfile = {
          id: therapistId,
          credentials: {
            licenseNumber: "",
            licenseState: "",
            licenseExpiry: Timestamp.now(),
            specializations: [],
            certifications: [],
          },
          practice: {
            bio: "",
            yearsExperience: 0,
            sessionTypes: [],
            languages: [],
            hourlyRate: 0,
            currency: "USD",
          },
          availability: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            bufferMinutes: 15,
            maxDailyHours: 8,
            advanceBookingDays: 30,
          },
          verification: {
            isVerified: false,
          },
          ...profileData,
        };

        await setDoc(docRef, newProfile);
      }
    } catch (error) {
      console.error("Error saving therapist profile:", error);
      throw new Error("Failed to save therapist profile");
    }
  }

  /**
   * Subscribe to real-time profile updates
   */
  static subscribeToProfile(
    therapistId: string,
    callback: (profile: TherapistProfile | null) => void
  ): () => void {
    const docRef = documents.therapistProfile(therapistId);

    return onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          callback(doc.data() as TherapistProfile);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error("Error in profile subscription:", error);
        callback(null);
      }
    );
  }

  /**
   * Calculate profile completion percentage
   */
  static calculateProfileCompletion(
    profile: TherapistProfile
  ): ProfileCompletionData {
    const requiredFields = [
      { section: "credentials", field: "licenseNumber" },
      { section: "credentials", field: "licenseState" },
      { section: "credentials", field: "specializations", minLength: 1 },
      { section: "practice", field: "bio", minLength: 50 },
      { section: "practice", field: "yearsExperience", min: 0 },
      { section: "practice", field: "sessionTypes", minLength: 1 },
      { section: "practice", field: "languages", minLength: 1 },
      { section: "practice", field: "hourlyRate", min: 1 },
    ];

    const completedFields: string[] = [];
    const missingFields: string[] = [];

    requiredFields.forEach(({ section, field, minLength, min }) => {
      const value = (profile as any)[section][field];
      const fieldName = `${section}.${field}`;

      if (Array.isArray(value)) {
        if (value.length >= (minLength || 1)) {
          completedFields.push(fieldName);
        } else {
          missingFields.push(fieldName);
        }
      } else if (typeof value === "string") {
        if (value.trim().length >= (minLength || 1)) {
          completedFields.push(fieldName);
        } else {
          missingFields.push(fieldName);
        }
      } else if (typeof value === "number") {
        if (value >= (min || 0)) {
          completedFields.push(fieldName);
        } else {
          missingFields.push(fieldName);
        }
      }
    });

    const percentage = Math.round(
      (completedFields.length / requiredFields.length) * 100
    );

    const completedSections: string[] = [];
    ["credentials", "practice"].forEach((section) => {
      const sectionFields = requiredFields.filter((f) => f.section === section);
      const completedInSection = completedFields.filter((f) =>
        f.startsWith(section)
      ).length;
      if (completedInSection === sectionFields.length) {
        completedSections.push(section);
      }
    });

    return {
      percentage,
      missingFields,
      completedSections,
    };
  }

  /**
   * Upload verification document
   */
  static async uploadDocument(
    therapistId: string,
    file: File,
    documentType: string
  ): Promise<DocumentUploadResult> {
    try {
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const filename = `${documentType}_${timestamp}.${fileExtension}`;
      const storagePath = `therapist-documents/${therapistId}/${filename}`;

      const storageRef: StorageReference = ref(storage, storagePath);

      // Upload file
      const uploadResult = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(uploadResult.ref);

      return {
        url,
        filename,
        uploadedAt: new Date(),
      };
    } catch (error) {
      console.error("Error uploading document:", error);
      throw new Error("Failed to upload document");
    }
  }

  /**
   * Delete verification document
   */
  static async deleteDocument(
    therapistId: string,
    filename: string
  ): Promise<void> {
    try {
      const storagePath = `therapist-documents/${therapistId}/${filename}`;
      const storageRef: StorageReference = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Error deleting document:", error);
      throw new Error("Failed to delete document");
    }
  }

  /**
   * Upload therapist profile photo (stores locally in public folder)
   */
  static async uploadProfilePhoto(
    therapistId: string,
    file: File
  ): Promise<string> {
    try {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        throw new Error("Invalid file type. Please upload a JPG, PNG, or WebP image.");
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("File size too large. Maximum size is 5MB.");
      }

      // Create FormData to send file to API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("therapistId", therapistId);

      // Upload to API endpoint
      const response = await fetch("/api/upload/therapist-photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload photo");
      }

      const data = await response.json();
      const photoURL = data.photoURL;

      // Update therapist profile with photo URL
      const docRef = documents.therapistProfile(therapistId);
      await updateDoc(docRef, {
        photoURL: photoURL,
        "metadata.updatedAt": serverTimestamp(),
      });

      return photoURL;
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      throw error;
    }
  }

  /**
   * Delete therapist profile photo
   */
  static async deleteProfilePhoto(therapistId: string): Promise<void> {
    try {
      // Get current profile to find photo URL
      const profile = await this.getProfile(therapistId);
      if (!profile?.photoURL) {
        return;
      }

      // Delete via API endpoint
      const response = await fetch("/api/upload/therapist-photo", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          therapistId,
          photoURL: profile.photoURL 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete photo");
      }

      // Remove photo URL from profile
      const docRef = documents.therapistProfile(therapistId);
      await updateDoc(docRef, {
        photoURL: null,
        "metadata.updatedAt": serverTimestamp(),
      });
    } catch (error) {
      console.error("Error deleting profile photo:", error);
      throw new Error("Failed to delete profile photo");
    }
  }

  /**
   * Update verification status (admin only)
   */
  static async updateVerificationStatus(
    therapistId: string,
    isVerified: boolean,
    verifiedBy?: string
  ): Promise<void> {
    try {
      const docRef = documents.therapistProfile(therapistId);
      await updateDoc(docRef, {
        "verification.isVerified": isVerified,
        "verification.verifiedAt": isVerified ? serverTimestamp() : null,
        "verification.verifiedBy": isVerified ? verifiedBy : null,
      });
    } catch (error) {
      console.error("Error updating verification status:", error);
      throw new Error("Failed to update verification status");
    }
  }

  /**
   * Search therapists with filters
   */
  static async searchTherapists(
    filters: TherapistSearchFilters = {}
  ): Promise<TherapistProfile[]> {
    try {
      let q = query(collections.therapistProfiles());

      // Add filters
      if (filters.specializations && filters.specializations.length > 0) {
        q = query(
          q,
          where(
            "credentials.specializations",
            "array-contains-any",
            filters.specializations
          )
        );
      }

      if (filters.languages && filters.languages.length > 0) {
        q = query(
          q,
          where("practice.languages", "array-contains-any", filters.languages)
        );
      }

      if (filters.sessionTypes && filters.sessionTypes.length > 0) {
        q = query(
          q,
          where(
            "practice.sessionTypes",
            "array-contains-any",
            filters.sessionTypes
          )
        );
      }

      // Only return verified therapists
      q = query(q, where("verification.isVerified", "==", true));

      // Order by rating (if we add ratings later) or alphabetically
      q = query(q, orderBy("practice.yearsExperience", "desc"), limit(50));

      const querySnapshot = await getDocs(q);
      const therapists: TherapistProfile[] = [];

      querySnapshot.forEach((doc) => {
        const therapist = doc.data() as TherapistProfile;

        // Apply price range filter client-side
        if (filters.priceRange) {
          const { min, max } = filters.priceRange;
          if (
            therapist.practice.hourlyRate < min ||
            therapist.practice.hourlyRate > max
          ) {
            return;
          }
        }

        therapists.push(therapist);
      });

      return therapists;
    } catch (error) {
      console.error("Error searching therapists:", error);
      throw new Error("Failed to search therapists");
    }
  }

  /**
   * Delete therapist profile
   */
  static async deleteProfile(therapistId: string): Promise<void> {
    try {
      const docRef = documents.therapistProfile(therapistId);
      await deleteDoc(docRef);

      // TODO: Also clean up related data (availability, appointments, etc.)
    } catch (error) {
      console.error("Error deleting therapist profile:", error);
      throw new Error("Failed to delete therapist profile");
    }
  }

  /**
   * Batch update multiple therapists (admin function)
   */
  static async batchUpdateProfiles(
    updates: { therapistId: string; data: Partial<TherapistProfile> }[]
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      updates.forEach(({ therapistId, data }) => {
        const docRef = documents.therapistProfile(therapistId);
        batch.update(docRef, data);
      });

      await batch.commit();
    } catch (error) {
      console.error("Error in batch update:", error);
      throw new Error("Failed to update multiple profiles");
    }
  }

  /**
   * Convert onboarding data to profile format
   */
  static convertOnboardingDataToProfile(
    therapistId: string,
    onboardingData: TherapistOnboardingData
  ): TherapistProfile {
    return {
      id: therapistId,
      credentials: {
        ...onboardingData.credentials,
        licenseExpiry: Timestamp.fromDate(
          onboardingData.credentials.licenseExpiry
        ),
      },
      practice: onboardingData.practice,
      availability: onboardingData.availability,
      verification: {
        isVerified: false,
      },
    };
  }
}

export default TherapistService;
