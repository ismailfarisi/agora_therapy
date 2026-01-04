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
    gender?: "male" | "female" | "prefer-not-to-say";
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
      gender: user.profile?.gender,
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
      title: "Welcome! Let's Get Started",
      description: "Share what feels comfortable - we're here for you",
      icon: UserIcon,
      required: true,
    },
    {
      id: "preferences",
      title: "Your Comfort Matters",
      description: "Help us personalize your experience",
      icon: Bell,
      required: false,
    },
    {
      id: "complete",
      title: "You're All Set! 🌟",
      description: "Welcome to your safe space for healing",
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
          <div className="space-y-6">
            {/* Welcome Message - Different for Client vs Therapist */}
            {!isTherapist ? (
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="text-lg">🌸</span> <strong>Welcome to your healing journey.</strong> We're so glad you're here. 
                  This is a safe, judgment-free space where your well-being comes first. Take your time filling this out - 
                  there's no rush, and you can always update your information later.
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="text-lg">👋</span> <strong>Welcome to MindGood.</strong> Let's set up your professional profile. 
                  This information will help clients find and connect with you. You can update these details anytime from your profile settings.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={data.basicInfo.firstName}
                  onChange={(e) => updateBasicInfo("firstName", e.target.value)}
                  placeholder="Enter your first name"
                />
                {!isTherapist && (
                  <p className="text-xs text-gray-500 italic">
                    💭 Feel free to use any name you're comfortable with - it doesn't have to be your real name
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                </Label>
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
              {!isTherapist && (
                <p className="text-xs text-gray-500 italic">
                  ✨ This is how we'll greet you - choose what makes you feel most comfortable
                </p>
              )}
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
              {!isTherapist && (
                <p className="text-xs text-gray-500 italic">
                  📱 Only if you'd like appointment reminders via text - completely optional
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender (Optional)</Label>
              <Select
                value={data.basicInfo.gender || ""}
                onValueChange={(value) => updateBasicInfo("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              {!isTherapist && (
                <>
                  {data.basicInfo.gender === "male" && (
                    <p className="text-xs text-teal-600 italic flex items-center gap-1">
                      💙 We're here to support you on your journey to wellness
                    </p>
                  )}
                  {data.basicInfo.gender === "female" && (
                    <p className="text-xs text-pink-600 italic flex items-center gap-1">
                      💗 Your mental health matters, and we're honored to be part of your journey
                    </p>
                  )}
                  {data.basicInfo.gender === "prefer-not-to-say" && (
                    <p className="text-xs text-purple-600 italic flex items-center gap-1">
                      💜 Your privacy is important to us - we're here for you, no matter what
                    </p>
                  )}
                </>
              )}
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
                {!isTherapist && (
                  <p className="text-xs text-gray-500 italic">
                    🌍 Helps us schedule sessions at times that work best for you
                  </p>
                )}
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
                  onChange={(e) => updateTherapistAvailability("bufferMinutes", e.target.value === '' ? 15 : parseInt(e.target.value))}
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
            {/* Warm Introduction */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="text-lg">🌟</span> <strong>Your comfort is our priority.</strong> These settings help us 
                communicate with you in ways that feel right for you. You're in control and can change these anytime.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-4 text-gray-800">
                ✨ We&apos;ll set up your preferences later
              </h3>
              <p className="text-gray-600 leading-relaxed">
                You can customize your notification and privacy settings in your profile after completing setup. 
                Don't worry - we'll only send you important updates, and you have full control over what you receive.
              </p>
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="text-center space-y-6">
            <div>
              <div className="relative">
                <CheckCircle className="h-20 w-20 text-teal-500 mx-auto mb-4 animate-pulse" />
                <span className="absolute top-0 left-1/2 -translate-x-1/2 text-3xl">🎉</span>
              </div>
              <h3 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                You&apos;re All Set! Welcome Home 🌟
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed max-w-md mx-auto">
                We&apos;re honored to be part of your wellness journey. Remember, taking this step 
                shows incredible courage and self-care.
              </p>
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 p-6 rounded-lg">
              <h4 className="font-semibold text-teal-900 mb-3 text-lg">
                💫 Your Next Steps
              </h4>
              <ul className="text-sm text-gray-700 space-y-3 text-left max-w-md mx-auto">
                {user.role === "client" && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-500 mt-0.5">✓</span>
                      <span><strong>Find Your Therapist:</strong> Browse caring professionals who match your needs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-500 mt-0.5">✓</span>
                      <span><strong>Book When Ready:</strong> Schedule your first session at a time that works for you</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-500 mt-0.5">✓</span>
                      <span><strong>Take Your Time:</strong> There&apos;s no rush - explore at your own pace</span>
                    </li>
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
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="w-full max-w-3xl relative z-10">
        {/* Header - Different for Client vs Therapist */}
        {!isTherapist ? (
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-block mb-4 relative">
              <div className="text-7xl animate-bounce-slow">🌻</div>
              <div className="absolute -top-2 -right-2 text-3xl animate-spin-slow">☀️</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-3 animate-fade-in-up">
              Welcome to Your Happy Place! 🌈
            </h1>
            <p className="text-lg text-gray-700 max-w-xl mx-auto leading-relaxed">
              ✨ Let's create your personal garden of wellness together - one beautiful step at a time
            </p>
          </div>
        ) : (
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-block mb-4 relative">
              <div className="text-6xl animate-bounce-slow">🎯</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 animate-fade-in-up">
              Welcome to MindGood
            </h1>
            <p className="text-lg text-gray-700 max-w-xl mx-auto leading-relaxed">
              Let's set up your professional profile and get you ready to help clients
            </p>
          </div>
        )}

        {/* Progress Bar - Different styling for Client vs Therapist */}
        {!isTherapist ? (
          <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-amber-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-xl">🌱</span>
                Growing: Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm font-semibold bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent">
                {progress}% Blooming! 🌸
              </span>
            </div>
            <div className="relative h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 rounded-full transition-all duration-500 ease-out shadow-lg"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-blue-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-xl">📋</span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {progress}% Complete
              </span>
            </div>
            <div className="relative h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out shadow-lg"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
              </div>
            </div>
          </div>
        )}

        {/* Joyful Steps Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isAccessible = index <= currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="relative group">
                    <button
                      onClick={() => isAccessible && setCurrentStep(index)}
                      disabled={!isAccessible}
                      className={`flex items-center justify-center w-14 h-14 rounded-full border-3 transition-all duration-300 transform ${
                        isCompleted
                          ? "bg-gradient-to-br from-green-400 to-teal-400 border-green-300 text-white shadow-lg scale-100 hover:scale-110"
                          : isActive
                          ? "bg-gradient-to-br from-amber-400 via-pink-400 to-purple-400 border-pink-300 text-white shadow-xl scale-110 animate-pulse-soft"
                          : isAccessible
                          ? "border-gray-300 text-gray-400 hover:border-pink-300 hover:scale-105 bg-white"
                          : "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                      }`}
                    >
                      {isCompleted ? (
                        <div className="relative">
                          <CheckCircle className="h-6 w-6" />
                          <span className="absolute -top-1 -right-1 text-xs">✨</span>
                        </div>
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </button>
                    {/* Tooltip */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {step.title}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="relative w-12 h-1 mx-1">
                      <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
                      <div
                        className={`absolute inset-0 rounded-full transition-all duration-500 ${
                          isCompleted ? "bg-gradient-to-r from-green-400 to-teal-400 w-full" : "w-0"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Vibrant Main Content Card */}
        <div className="mb-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white overflow-hidden transform transition-all duration-500 hover:shadow-3xl">
          {/* Colorful Header Gradient */}
          <div className="bg-gradient-to-r from-amber-100 via-pink-100 to-purple-100 border-b-2 border-pink-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-pink-400 flex items-center justify-center shadow-lg">
                    {React.createElement(steps[currentStep].icon, {
                      className: "h-6 w-6 text-white",
                    })}
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {steps[currentStep].title}
                  </h2>
                </div>
                <p className="text-gray-700 ml-15 text-sm leading-relaxed">
                  {steps[currentStep].description}
                </p>
              </div>
              {steps[currentStep].required && (
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-md">✨ Required</Badge>
              )}
            </div>
          </div>
          <div className="p-8">{renderCurrentStep()}</div>
        </div>

        {/* Joyful Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 border-2 border-gray-300 hover:border-pink-400 hover:bg-pink-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-6 text-base font-semibold rounded-xl"
          >
            <ChevronLeft className="h-5 w-5" />
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleFinishOnboarding}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 hover:from-amber-600 hover:via-pink-600 hover:to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-6 text-base font-bold rounded-xl"
            >
              {loading ? (
                <>
                  <span className="animate-spin">🌟</span>
                  Creating Your Garden...
                </>
              ) : (
                <>
                  Let's Bloom! 🌺
                  <CheckCircle className="h-5 w-5" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-8 py-6 text-base font-bold rounded-xl"
            >
              Continue Growing 🌱
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
