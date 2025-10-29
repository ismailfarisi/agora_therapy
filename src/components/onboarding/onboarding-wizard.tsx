/**
 * Onboarding Wizard Component
 * Multi-step onboarding flow for new users
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
  UserCheck,
  Bell,
} from "lucide-react";
import { ProfileService } from "@/lib/services/profile-service";
import type { User } from "@/types/database";

export interface OnboardingData {
  basicInfo: {
    firstName: string;
    lastName: string;
    displayName: string;
    phoneNumber?: string;
    timezone: string;
    locale: string;
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
  const [data, setData] = useState<OnboardingData>({
    basicInfo: {
      firstName: user.profile.firstName || "",
      lastName: user.profile.lastName || "",
      displayName: user.profile.displayName || "",
      phoneNumber: user.profile.phoneNumber || "",
      timezone: user.profile.timezone || "UTC",
      locale: user.profile.locale || "en-US",
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
  });

  const steps: StepConfig[] = [
    {
      id: "basic-info",
      title: "Basic Information",
      description: "Tell us about yourself",
      icon: UserIcon,
      required: true,
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

  const handleFinishOnboarding = async () => {
    setLoading(true);

    try {
      await ProfileService.updateProfile(user.id, data.basicInfo);
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
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="locale">Language</Label>
                <Select
                  value={data.basicInfo.locale}
                  onValueChange={(value) => updateBasicInfo("locale", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {locales.map((locale) => (
                      <SelectItem key={locale.value} value={locale.value}>
                        {locale.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
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
