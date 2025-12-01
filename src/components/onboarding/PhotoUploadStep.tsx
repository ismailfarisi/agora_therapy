/**
 * Photo Upload Step for Onboarding
 * Allows users to upload profile photo during onboarding
 */

"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X, AlertCircle } from "lucide-react";
import Image from "next/image";

interface PhotoUploadStepProps {
  userId: string;
  currentPhotoURL?: string;
  onPhotoUploaded: (photoURL: string) => void;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
}

export function PhotoUploadStep({
  userId,
  currentPhotoURL,
  onPhotoUploaded,
  uploading,
  setUploading,
}: PhotoUploadStepProps) {
  const [previewURL, setPreviewURL] = useState<string | null>(
    currentPhotoURL || null
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a JPG, PNG, or WebP image.");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size too large. Maximum size is 5MB.");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewURL(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      // Upload to API
      const response = await fetch("/api/upload/profile-photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload photo");
      }

      const data = await response.json();
      onPhotoUploaded(data.photoURL);
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      setError(error.message || "Failed to upload photo. Please try again.");
      setPreviewURL(currentPhotoURL || null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreviewURL(null);
    onPhotoUploaded("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Add Your Profile Photo</h3>
        <p className="text-gray-600 text-sm">
          Help others recognize you with a professional photo (optional)
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Photo Preview */}
        <div className="relative">
          <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-white shadow-lg">
            {previewURL ? (
              <Image
                src={previewURL}
                alt="Profile preview"
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="h-16 w-16 text-white opacity-50" />
            )}
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}

          {previewURL && !uploading && (
            <button
              onClick={handleRemove}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-colors"
              aria-label="Remove photo"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Upload Controls */}
        <div className="w-full max-w-md space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            onClick={handleButtonClick}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            <Upload className="h-5 w-5" />
            {previewURL ? "Change Photo" : "Upload Photo"}
          </Button>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="text-center text-sm text-gray-500 space-y-1">
            <p>Accepted formats: JPG, PNG, WebP</p>
            <p>Maximum size: 5MB</p>
            <p>Recommended: Square image, at least 400x400px</p>
          </div>
        </div>
      </div>
    </div>
  );
}
