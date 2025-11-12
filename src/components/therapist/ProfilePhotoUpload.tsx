"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Camera, Trash2, Upload, AlertCircle } from "lucide-react";
import { TherapistService } from "@/lib/services/therapist-service";
import { useToast } from "@/lib/hooks/useToast";
import Image from "next/image";

interface ProfilePhotoUploadProps {
  therapistId: string;
  currentPhotoURL?: string;
  onPhotoUpdated: (photoURL: string | null) => void;
}

export function ProfilePhotoUpload({
  therapistId,
  currentPhotoURL,
  onPhotoUpdated,
}: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(currentPhotoURL || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid File Type", "Please upload a JPG, PNG, or WebP image.");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File Too Large", "Maximum file size is 5MB.");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewURL(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const photoURL = await TherapistService.uploadProfilePhoto(therapistId, file);
      setPreviewURL(photoURL);
      onPhotoUpdated(photoURL);
      toast.success("Photo Uploaded", "Your profile photo has been updated successfully.");
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error("Upload Failed", error.message || "Failed to upload photo. Please try again.");
      setPreviewURL(currentPhotoURL || null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your profile photo?")) {
      return;
    }

    try {
      setDeleting(true);
      await TherapistService.deleteProfilePhoto(therapistId);
      setPreviewURL(null);
      onPhotoUpdated(null);
      toast.success("Photo Deleted", "Your profile photo has been removed.");
    } catch (error: any) {
      console.error("Error deleting photo:", error);
      toast.error("Delete Failed", "Failed to delete photo. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Profile Photo
        </CardTitle>
        <CardDescription>
          Upload a professional photo to help clients recognize you. Max size: 5MB.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Photo Preview */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              {previewURL ? (
                <Image
                  src={previewURL}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-4xl">
                  {therapistId[0]?.toUpperCase() || "T"}
                </span>
              )}
            </div>
            {(uploading || deleting) && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <LoadingSpinner size="md" />
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1 space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleButtonClick}
                disabled={uploading || deleting}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {previewURL ? "Change Photo" : "Upload Photo"}
              </Button>

              {previewURL && (
                <Button
                  onClick={handleDelete}
                  disabled={uploading || deleting}
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-600">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Accepted formats: JPG, PNG, WebP. Recommended: Square image, at least 400x400px.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
