/**
 * Profile Completion Component
 * Shows therapist profile completion progress with actionable steps
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Target,
  TrendingUp,
} from "lucide-react";
import { TherapistProfile } from "@/types/database";
import { ProfileCompletionData } from "@/lib/services/therapist-service";

interface ProfileCompletionProps {
  profile: TherapistProfile;
  completionData: ProfileCompletionData;
  onNavigateToSection?: (section: string) => void;
  className?: string;
}

export function ProfileCompletion({
  profile,
  completionData,
  onNavigateToSection,
  className,
}: ProfileCompletionProps) {
  const { percentage, missingFields, completedSections } = completionData;

  const getSectionDisplayName = (section: string): string => {
    const sectionNames: Record<string, string> = {
      credentials: "Professional Credentials",
      practice: "Practice Information",
      availability: "Availability Settings",
    };
    return sectionNames[section] || section;
  };

  const getFieldDisplayName = (fieldPath: string): string => {
    const fieldNames: Record<string, string> = {
      "credentials.licenseNumber": "License Number",
      "credentials.licenseState": "License State",
      "credentials.specializations": "Specializations (at least 1)",
      "practice.bio": "Professional Bio (50+ characters)",
      "practice.yearsExperience": "Years of Experience",
      "practice.sessionTypes": "Session Types (at least 1)",
      "practice.languages": "Languages (at least 1)",
      "practice.hourlyRate": "Hourly Rate",
    };
    return fieldNames[fieldPath] || fieldPath;
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressMessage = (
    percentage: number
  ): { title: string; message: string; variant: "default" | "destructive" } => {
    if (percentage === 100) {
      return {
        title: "Profile Complete!",
        message:
          "Your profile is complete and ready to accept clients. Great work!",
        variant: "default",
      };
    }
    if (percentage >= 80) {
      return {
        title: "Almost There!",
        message:
          "Your profile is nearly complete. Just a few more details to go.",
        variant: "default",
      };
    }
    if (percentage >= 50) {
      return {
        title: "Good Progress",
        message:
          "You're making good progress. Complete the remaining sections to start accepting clients.",
        variant: "default",
      };
    }
    return {
      title: "Get Started",
      message:
        "Complete your profile to start accepting clients and showcase your expertise.",
      variant: "default",
    };
  };

  const progressMessage = getProgressMessage(percentage);

  const nextSteps = missingFields.slice(0, 3).map((field) => ({
    field,
    section: field.split(".")[0],
    displayName: getFieldDisplayName(field),
    priority:
      field.includes("licenseNumber") || field.includes("bio")
        ? "high"
        : "medium",
  }));

  const benefits = [
    "Start accepting client bookings",
    "Appear in therapist search results",
    "Build your professional reputation",
    "Access advanced practice tools",
  ];

  return (
    <div className={className}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle>Profile Completion</CardTitle>
            </div>
            <Badge
              variant={percentage === 100 ? "default" : "secondary"}
              className={
                percentage === 100 ? "bg-green-100 text-green-800" : ""
              }
            >
              {percentage}% Complete
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-gray-600">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
            <div className="grid grid-cols-4 gap-1 text-xs text-gray-500">
              <span>Basic</span>
              <span>Good</span>
              <span>Great</span>
              <span>Complete</span>
            </div>
          </div>

          {/* Progress Message */}
          <Alert>
            {percentage === 100 ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            <div className="ml-2">
              <h4 className="font-medium">{progressMessage.title}</h4>
              <AlertDescription className="mt-1">
                {progressMessage.message}
              </AlertDescription>
            </div>
          </Alert>

          {/* Section Completion Status */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Section Status</h4>
            <div className="grid gap-2">
              {["credentials", "practice"].map((section) => {
                const isCompleted = completedSections.includes(section);
                return (
                  <div
                    key={section}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className="font-medium text-sm">
                        {getSectionDisplayName(section)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isCompleted ? "default" : "secondary"}
                        className={`text-xs ${
                          isCompleted ? "bg-green-100 text-green-800" : ""
                        }`}
                      >
                        {isCompleted ? "Complete" : "In Progress"}
                      </Badge>
                      {!isCompleted && onNavigateToSection && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigateToSection(section)}
                          className="h-6 px-2 text-xs"
                        >
                          Complete <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Steps */}
          {nextSteps.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Next Steps</h4>
              <div className="space-y-2">
                {nextSteps.map((step, index) => (
                  <div
                    key={step.field}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-medium`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {step.displayName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getSectionDisplayName(step.section)}
                        </p>
                      </div>
                    </div>
                    {step.priority === "high" && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {percentage < 100 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Complete your profile to:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-blue-600" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Completion Celebration */}
          {percentage === 100 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-900">
                  Congratulations! 🎉
                </h4>
              </div>
              <p className="text-sm text-green-800">
                Your profile is now complete and live. Clients can discover and
                book appointments with you.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfileCompletion;
