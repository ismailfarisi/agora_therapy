/**
 * Profile Service
 * Handles profile management operations
 */

import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase/client";
import { documents } from "@/lib/firebase/collections";
import type { User } from "@/types/database";

export interface ProfileUpdateData {
  firstName: string;
  lastName: string;
  displayName: string;
  phoneNumber?: string;
  timezone: string;
  locale: string;
}

export class ProfileService {
  /**
   * Update user profile information
   */
  static async updateProfile(
    userId: string,
    data: ProfileUpdateData
  ): Promise<void> {
    try {
      const userRef = documents.user(userId);

      await updateDoc(userRef, {
        "profile.firstName": data.firstName,
        "profile.lastName": data.lastName,
        "profile.displayName": data.displayName,
        "profile.phoneNumber": data.phoneNumber || null,
        "profile.timezone": data.timezone,
        "profile.locale": data.locale,
        "metadata.updatedAt": serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw new Error("Failed to update profile");
    }
  }

  /**
   * Upload and set user profile photo
   */
  static async uploadProfilePhoto(userId: string, file: File): Promise<string> {
    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image");
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image must be smaller than 5MB");
      }

      // Get current user data to check for existing avatar
      const userRef = documents.user(userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() as User | undefined;

      // Delete old avatar if exists
      if (userData?.profile?.avatarUrl) {
        try {
          const oldImageRef = ref(storage, `avatars/${userId}/avatar`);
          await deleteObject(oldImageRef);
        } catch (error) {
          // Ignore error if file doesn't exist
          console.log("Old avatar file not found, continuing...");
        }
      }

      // Create a unique filename with timestamp
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const fileName = `avatar_${timestamp}.${fileExtension}`;

      // Create storage reference
      const storageRef = ref(storage, `avatars/${userId}/${fileName}`);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update user profile with new avatar URL
      await updateDoc(userRef, {
        "profile.avatarUrl": downloadURL,
        "metadata.updatedAt": serverTimestamp(),
      });

      return downloadURL;
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to upload photo");
    }
  }

  /**
   * Get user profile data
   */
  static async getProfile(userId: string): Promise<User | null> {
    try {
      const userRef = documents.user(userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      return userDoc.data() as User;
    } catch (error) {
      console.error("Error getting profile:", error);
      throw new Error("Failed to get profile");
    }
  }

  /**
   * Calculate profile completion percentage
   */
  static calculateProfileCompletion(user: User): {
    percentage: number;
    requiredFieldsComplete: boolean;
    missingFields: string[];
  } {
    const requiredFields = [
      { key: "firstName", label: "First Name", value: user.profile.firstName },
      { key: "lastName", label: "Last Name", value: user.profile.lastName },
      {
        key: "displayName",
        label: "Display Name",
        value: user.profile.displayName,
      },
      { key: "timezone", label: "Timezone", value: user.profile.timezone },
      { key: "locale", label: "Language", value: user.profile.locale },
    ];

    const optionalFields = [
      {
        key: "phoneNumber",
        label: "Phone Number",
        value: user.profile.phoneNumber,
      },
      {
        key: "avatarUrl",
        label: "Profile Photo",
        value: user.profile.avatarUrl,
      },
    ];

    const allFields = [...requiredFields, ...optionalFields];

    const completedRequired = requiredFields.filter(
      (field) => field.value
    ).length;
    const completedOptional = optionalFields.filter(
      (field) => field.value
    ).length;
    const totalCompleted = completedRequired + completedOptional;

    const percentage = Math.round((totalCompleted / allFields.length) * 100);
    const requiredFieldsComplete = completedRequired === requiredFields.length;
    const missingFields = requiredFields
      .filter((field) => !field.value)
      .map((field) => field.label);

    return {
      percentage,
      requiredFieldsComplete,
      missingFields,
    };
  }

  /**
   * Mark onboarding as completed
   */
  static async completeOnboarding(userId: string): Promise<void> {
    try {
      const userRef = documents.user(userId);

      await updateDoc(userRef, {
        "metadata.onboardingCompleted": true,
        "metadata.updatedAt": serverTimestamp(),
      });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      throw new Error("Failed to complete onboarding");
    }
  }
}
