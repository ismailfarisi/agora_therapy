/**
 * Onboarding Wizard Component
 * Multi-step onboarding flow for new users with proper state management
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  User as UserIcon,
  Camera,
  Bell,
  Briefcase,
  DollarSign,
  Shield,
  Clock,
  Upload,
  X,
  FileText,
} from "lucide-react";
import { ProfileService } from "@/lib/services/profile-service";
import { TherapistService } from "@/lib/services/therapist-service";
import type { User } from "@/types/database";
import { Textarea } from "@/components/ui/textarea";
import { Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";
import { useOnboardingState, type OnboardingState } from "@/lib/hooks/useOnboardingState";
import { TIMEZONES, TIMEZONE_GROUPS, getUserTimezone } from "@/lib/constants/timezones";
import { LANGUAGES, LANGUAGE_GROUPS } from "@/lib/constants/languages";
import { PhotoUploadStep } from "./PhotoUploadStep";
import { ServicesSelectionStep } from "./ServicesSelectionStep";
import { LanguageMultiSelect } from "./LanguageMultiSelect";
import { AvailabilitySetupStep } from "./AvailabilitySetupStep";

export interface OnboardingData {
  basicInfo: {
    firstName: string;
    lastName: string;
    displayName: string;
    phoneNumber?: string;
    timezone: string;
    locale: string; // Primary language for UI
    languages: string[]; // All languages user speaks
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
    services: string[];
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

interface OnboardingWizardProps {
  user: User;
  onComplete: () => void;
}

interface StepConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  required: boolean;
}

const timezones = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Australia/Sydney", label: "Sydney" },
];

const locales = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es-ES", label: "Spanish" },
  { value: "fr-FR", label: "French" },
  { value: "de-DE", label: "German" },
  { value: "it-IT", label: "Italian" },
  { value: "pt-BR", label: "Portuguese" },
  { value: "ja-JP", label: "Japanese" },
  { value: "ko-KR", label: "Korean" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
  { value: "ar-AE", label: "Arabic" },
];

export function OnboardingWizard({ user, onComplete }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [certificateURLs, setCertificateURLs] = useState<string[]>([]);
  const isTherapist = user.role === "therapist";
  
  console.log("🎯 OnboardingWizard - User role:", user.role);
  console.log("🎯 OnboardingWizard - isTherapist:", isTherapist);
  console.log("🎯 OnboardingWizard - User data:", JSON.stringify(user, null, 2));
  
  const [data, setData] = useState<OnboardingData>({
    basicInfo: {
      firstName: user.profile?.firstName || "",
      lastName: user.profile?.lastName || "",
      displayName: user.profile?.displayName || "",
      phoneNumber: user.profile?.phoneNumber || "",
      timezone: user.profile?.timezone || "UTC",
      locale: user.profile?.locale || "en", // Default to English language code
      languages: user.profile?.languages || ["en"], // Default to English
    },
    preferences: {
      notifications: user.preferences?.notifications || {
        email: true,
        sms: false,
        push: true,
      },
      privacy: user.preferences?.privacy || {
        shareProfile: false,
        allowDirectMessages: true,
      },
    },
    ...(isTherapist && {
      therapistProfile: {
        services: [], // Service IDs will be selected during onboarding
        credentials: {
          licenseNumber: "",
          licenseState: "",
          licenseExpiry: new Date(),
          specializations: [],
          certifications: [],
        },
        practice: {
          bio: "",
          yearsExperience: 0,
          sessionTypes: [],
          languages: [], // Will be copied from basicInfo.languages when saving
          hourlyRate: 10000, // Default $100.00 (stored in cents)
          currency: "USD",
        },
        availability: {
          timezone: user.profile?.timezone || "UTC",
          bufferMinutes: 15,
          maxDailyHours: 8,
          advanceBookingDays: 30,
          weeklyHours: {}, // Will be set in availability step
        },
      },
    }),
  });

  const clientSteps: StepConfig[] = [
    {
      id: "basic-info",
      title: "Basic Information",
      description: "Tell us about yourself",
      icon: UserIcon,
      required: true,
    },
    {
      id: "photo",
      title: "Profile Photo",
      description: "Add your photo (optional)",
      icon: Camera,
      required: false,
    },
    {
      id: "preferences",
      title: "Preferences",
      description: "Set your preferences",
      icon: Bell,
      required: false,
    },
    {
      id: "complete",
      title: "All Set!",
      description: "Welcome to Mindgood",
      icon: CheckCircle,
      required: false,
    },
  ];

  const therapistSteps: StepConfig[] = [
    {
      id: "basic-info",
      title: "Basic Information",
      description: "Tell us about yourself",
      icon: UserIcon,
      required: true,
    },
    {
      id: "photo",
      title: "Profile Photo",
      description: "Add your photo (optional)",
      icon: Camera,
      required: false,
    },
    {
      id: "services",
      title: "Services Offered",
      description: "Select services you provide",
      icon: Briefcase,
      required: true,
    },
    {
      id: "credentials",
      title: "Credentials",
      description: "Your professional credentials",
      icon: Shield,
      required: true,
    },
    {
      id: "practice",
      title: "Practice Details",
      description: "About your practice",
      icon: Briefcase,
      required: true,
    },
    {
      id: "rates",
      title: "Rates",
      description: "Set your hourly rate",
      icon: DollarSign,
      required: true,
    },
    {
      id: "availability",
      title: "Availability",
      description: "Set your weekly schedule",
      icon: Clock,
      required: true,
    },
    {
      id: "complete",
      title: "All Set!",
      description: "Welcome to Mindgood",
      icon: CheckCircle,
      required: false,
    },
  ];

  const steps = isTherapist ? therapistSteps : clientSteps;

  const progress = Math.round(((currentStep + 1) / steps.length) * 100);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateBasicInfo = (
    field: keyof OnboardingData["basicInfo"],
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: value,
      },
    }));
  };

  const updateTherapistCredentials = (
    field: keyof NonNullable<OnboardingData["therapistProfile"]>["credentials"],
    value: string | string[] | boolean | number | Date
  ) => {
    setData((prev) => ({
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
  };

  const updateTherapistPractice = (
    field: keyof NonNullable<OnboardingData["therapistProfile"]>["practice"],
    value: string | string[] | boolean | number
  ) => {
    setData((prev) => ({
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
  };

  const updateTherapistAvailability = (
    field: keyof NonNullable<OnboardingData["therapistProfile"]>["availability"],
    value: number | string | Record<number, { start: string; end: string }[]>
  ) => {
    setData((prev) => ({
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
  };

  const handleCertificateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (certificateURLs.length + files.length > 6) {
      alert("You can upload a maximum of 6 certificates");
      return;
    }

    setUploadingCertificate(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (file.type !== "application/pdf") {
          throw new Error(`${file.name} is not a PDF file`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} exceeds 5MB size limit`);
        }

        // Upload to Firebase Storage
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `certificates/${user.id}/${fileName}`);
        
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        return downloadURL;
      });

      const newURLs = await Promise.all(uploadPromises);
      setCertificateURLs((prev) => [...prev, ...newURLs]);
      
      // Update the certifications in the data state
      if (data.therapistProfile) {
        updateTherapistCredentials("certifications", [...certificateURLs, ...newURLs]);
      }
    } catch (error) {
      const err = error as Error;
      console.error("Error uploading certificates:", err);
      alert(err.message || "Failed to upload certificates");
    } finally {
      setUploadingCertificate(false);
      // Reset the input
      event.target.value = "";
    }
  };

  const handleRemoveCertificate = (index: number) => {
    const newURLs = certificateURLs.filter((_, i) => i !== index);
    setCertificateURLs(newURLs);
    
    if (data.therapistProfile) {
      updateTherapistCredentials("certifications", newURLs);
    }
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);

    try {
      // Update basic profile
      await ProfileService.updateProfile(user.id, data.basicInfo);
      
      // If therapist, save therapist profile
      if (isTherapist && data.therapistProfile) {
        const therapistData = {
          ...data.therapistProfile,
          credentials: {
            ...data.therapistProfile.credentials,
            licenseExpiry: Timestamp.fromDate(data.therapistProfile.credentials.licenseExpiry),
            certifications: certificateURLs, // Use the uploaded certificate URLs
          },
          practice: {
            ...data.therapistProfile.practice,
            // Use languages from basicInfo since we removed the duplicate field
            languages: data.basicInfo.languages,
          },
        };
        await TherapistService.saveProfile(user.id, therapistData);
      }
      
      // Mark onboarding as complete
      await ProfileService.completeOnboarding(user.id);

      onComplete();

      const redirectPath =
        user.role === "client"
          ? "/client"
          : user.role === "therapist"
          ? "/therapist"
          : "/admin";
      router.push(redirectPath);
    } catch (error) {
      console.error("Onboarding completion error:", error);
    } finally {
      setLoading(false);
    }
  };

  const canGoNext = () => {
    const currentStepConfig = steps[currentStep];

    if (currentStepConfig.id === "complete") {
      return false;
    }

    if (currentStepConfig.id === "basic-info" && currentStepConfig.required) {
      return !!(
        data.basicInfo.firstName &&
        data.basicInfo.lastName &&
        data.basicInfo.displayName
      );
    }

    if (isTherapist && data.therapistProfile) {
      if (currentStepConfig.id === "services") {
        return data.therapistProfile.services.length > 0;
      }

      if (currentStepConfig.id === "credentials") {
        return !!(
          data.therapistProfile.credentials.licenseNumber &&
          data.therapistProfile.credentials.licenseState
        );
      }

      if (currentStepConfig.id === "practice") {
        return !!(
          data.therapistProfile.practice.bio &&
          data.therapistProfile.practice.yearsExperience > 0
        );
      }

      if (currentStepConfig.id === "rates") {
        return data.therapistProfile.practice.hourlyRate > 0;
      }

      if (currentStepConfig.id === "availability") {
        return Object.keys(data.therapistProfile.availability.weeklyHours).length > 0;
      }
    }

    return true;
  };

  const renderCurrentStep = () => {
    switch (steps[currentStep].id) {
      case "basic-info":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={data.basicInfo.firstName}
                  onChange={(e) => updateBasicInfo("firstName", e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={data.basicInfo.lastName}
                  onChange={(e) => updateBasicInfo("lastName", e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={data.basicInfo.displayName}
                onChange={(e) => updateBasicInfo("displayName", e.target.value)}
                placeholder="How would you like to be addressed?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={data.basicInfo.phoneNumber}
                onChange={(e) => updateBasicInfo("phoneNumber", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={data.basicInfo.timezone}
                  onValueChange={(value) => updateBasicInfo("timezone", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {Object.entries(TIMEZONE_GROUPS).map(([region, tzList]) => (
                      <div key={region}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-gray-700 bg-gray-100">
                          {region}
                        </div>
                        {tzList.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <LanguageMultiSelect
                  selectedLanguages={data.basicInfo.languages}
                  onLanguagesChange={(languages) => {
                    setData((prev) => ({
                      ...prev,
                      basicInfo: {
                        ...prev.basicInfo,
                        languages,
                        locale: languages.length > 0 ? languages[0] : prev.basicInfo.locale,
                      },
                    }));
                  }}
                  label="Languages You Speak"
                  placeholder="Search and select all languages you speak..."
                />
              </div>
            </div>
          </div>
        );

      case "services":
        if (!isTherapist || !data.therapistProfile) return null;
        return (
          <ServicesSelectionStep
            selectedServices={data.therapistProfile.services}
            onServicesChange={(services) => {
              setData((prev) => ({
                ...prev,
                therapistProfile: prev.therapistProfile
                  ? {
                      ...prev.therapistProfile,
                      services,
                    }
                  : prev.therapistProfile,
              }));
            }}
          />
        );

      case "credentials":
        if (!isTherapist || !data.therapistProfile) return null;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number *</Label>
                <Input
                  id="licenseNumber"
                  value={data.therapistProfile.credentials.licenseNumber}
                  onChange={(e) => updateTherapistCredentials("licenseNumber", e.target.value)}
                  placeholder="Enter your license number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseState">License State *</Label>
                <Input
                  id="licenseState"
                  value={data.therapistProfile.credentials.licenseState}
                  onChange={(e) => updateTherapistCredentials("licenseState", e.target.value)}
                  placeholder="e.g., CA, NY"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseExpiry">License Expiry Date</Label>
              <Input
                id="licenseExpiry"
                type="date"
                value={data.therapistProfile.credentials.licenseExpiry.toISOString().split('T')[0]}
                onChange={(e) => updateTherapistCredentials("licenseExpiry", new Date(e.target.value))}
              />
            </div>

            {/* Certificate Upload Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Professional Certificates (Optional)</Label>
                <span className="text-sm text-gray-500">
                  {certificateURLs.length}/6 uploaded
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Upload your professional certificates, licenses, or qualifications (PDF only, max 5MB each)
              </p>

              {/* Upload Button */}
              {certificateURLs.length < 6 && (
                <div>
                  <input
                    type="file"
                    id="certificate-upload"
                    accept="application/pdf"
                    multiple
                    onChange={handleCertificateUpload}
                    className="hidden"
                    disabled={uploadingCertificate}
                  />
                  <label htmlFor="certificate-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={uploadingCertificate}
                      onClick={() => document.getElementById('certificate-upload')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingCertificate ? "Uploading..." : "Upload Certificates"}
                    </Button>
                  </label>
                </div>
              )}

              {/* Uploaded Certificates List */}
              {certificateURLs.length > 0 && (
                <div className="space-y-2">
                  {certificateURLs.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            Certificate {index + 1}
                          </p>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View PDF
                          </a>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCertificate(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case "practice":
        if (!isTherapist || !data.therapistProfile) return null;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio *</Label>
              <Textarea
                id="bio"
                value={data.therapistProfile.practice.bio}
                onChange={(e) => updateTherapistPractice("bio", e.target.value)}
                placeholder="Tell clients about your approach and experience..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years of Experience *</Label>
              <Input
                id="yearsExperience"
                type="number"
                min="0"
                value={data.therapistProfile.practice.yearsExperience}
                onChange={(e) => updateTherapistPractice("yearsExperience", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        );

      case "rates":
        if (!isTherapist || !data.therapistProfile) return null;
        return (
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (USD) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.therapistProfile.practice.hourlyRate / 100}
                    onChange={(e) =>
                      updateTherapistPractice(
                        "hourlyRate",
                        Math.round(parseFloat(e.target.value) * 100)
                      )
                    }
                    placeholder="100.00"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Platform fee (15%) will be deducted from this amount
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Rate Breakdown
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Your Rate:</span>
                    <span className="font-semibold">
                      ${(data.therapistProfile.practice.hourlyRate / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Platform Fee (15%):</span>
                    <span className="text-red-600">
                      -${((data.therapistProfile.practice.hourlyRate * 0.15) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-blue-300 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">
                      You Receive:
                    </span>
                    <span className="font-bold text-green-600">
                      ${((data.therapistProfile.practice.hourlyRate * 0.85) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bufferMinutes">Buffer Between Sessions (minutes)</Label>
                <Input
                  id="bufferMinutes"
                  type="number"
                  min="0"
                  value={data.therapistProfile.availability.bufferMinutes}
                  onChange={(e) => updateTherapistAvailability("bufferMinutes", parseInt(e.target.value) || 15)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxDailyHours">Max Daily Hours</Label>
                <Input
                  id="maxDailyHours"
                  type="number"
                  min="1"
                  max="16"
                  value={data.therapistProfile.availability.maxDailyHours}
                  onChange={(e) => updateTherapistAvailability("maxDailyHours", parseInt(e.target.value) || 8)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="advanceBookingDays">Advance Booking (days)</Label>
                <Input
                  id="advanceBookingDays"
                  type="number"
                  min="1"
                  value={data.therapistProfile.availability.advanceBookingDays}
                  onChange={(e) => updateTherapistAvailability("advanceBookingDays", parseInt(e.target.value) || 30)}
                />
              </div>
            </div>
          </div>
        );

      case "availability":
        if (!isTherapist || !data.therapistProfile) return null;
        return (
          <AvailabilitySetupStep
            weeklyHours={data.therapistProfile.availability.weeklyHours}
            onWeeklyHoursChange={(weeklyHours) => {
              setData((prev) => ({
                ...prev,
                therapistProfile: prev.therapistProfile
                  ? {
                      ...prev.therapistProfile,
                      availability: {
                        ...prev.therapistProfile.availability,
                        weeklyHours,
                      },
                    }
                  : prev.therapistProfile,
              }));
            }}
          />
        );

      case "photo":
        return (
          <PhotoUploadStep
            userId={user.id}
            currentPhotoURL={data.basicInfo.photoURL}
            onPhotoUploaded={(photoURL) => updateBasicInfo("photoURL", photoURL)}
            uploading={loading}
            setUploading={setLoading}
          />
        );

      case "preferences":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-4">
                We&apos;ll set up your preferences later
              </h3>
              <p className="text-gray-600">
                You can customize your notification and privacy settings in your
                profile after completing setup.
              </p>
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="text-center space-y-6">
            <div>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Welcome to Mindgood!
              </h3>
              <p className="text-gray-600">
                Your account is ready. You can now start exploring the platform.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                What&apos;s Next?
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {user.role === "client" && (
                  <>
                    <li>• Browse and connect with therapists</li>
                    <li>• Book your first therapy session</li>
                    <li>• Complete your profile for better matches</li>
                  </>
                )}
                {user.role === "therapist" && (
                  <>
                    <li>• Complete your professional profile</li>
                    <li>• Set your availability and rates</li>
                    <li>• Start accepting client appointments</li>
                  </>
                )}
                {user.role === "admin" && (
                  <>
                    <li>• Access the admin dashboard</li>
                    <li>• Manage users and therapist verifications</li>
                    <li>• Monitor platform activity</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Mindgood
          </h1>
          <p className="text-gray-600">
            Let&apos;s set up your account in a few simple steps
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {progress}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isAccessible = index <= currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => isAccessible && setCurrentStep(index)}
                    disabled={!isAccessible}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isActive
                        ? "bg-blue-500 border-blue-500 text-white"
                        : isAccessible
                        ? "border-gray-300 text-gray-500 hover:border-gray-400"
                        : "border-gray-200 text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-2 ${
                        isCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(steps[currentStep].icon, {
                    className: "h-5 w-5",
                  })}
                  {steps[currentStep].title}
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  {steps[currentStep].description}
                </p>
              </div>
              {steps[currentStep].required && (
                <Badge variant="secondary">Required</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>{renderCurrentStep()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleFinishOnboarding}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? "Finishing..." : "Get Started"}
              <CheckCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
