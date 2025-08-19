/**
 * Profile Completion Component
 * Shows progress and encourages profile completion
 */

"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  User as UserIcon,
  Phone,
  Globe,
  Languages,
  FileText,
  Shield,
} from "lucide-react";
import Link from "next/link";
import type { User, TherapistProfile } from "@/types/database";

interface ProfileCompletionProps {
  user: User;
  therapistProfile?: TherapistProfile | null;
  className?: string;
}

interface CompletionItem {
  id: string;
  label: string;
  completed: boolean;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  link?: string;
  required: boolean;
}

export function ProfileCompletion({
  user,
  therapistProfile,
  className = "",
}: ProfileCompletionProps) {
  const completionItems = useMemo(() => {
    const baseItems: CompletionItem[] = [
      {
        id: "basic-info",
        label: "Basic Information",
        completed: !!(
          user.profile.firstName &&
          user.profile.lastName &&
          user.profile.displayName
        ),
        icon: UserIcon,
        description: "Complete your name and display name",
        link: "/profile",
        required: true,
      },
      {
        id: "contact",
        label: "Contact Information",
        completed: !!user.profile.phoneNumber,
        icon: Phone,
        description: "Add your phone number for better communication",
        link: "/profile",
        required: false,
      },
      {
        id: "location",
        label: "Location & Language",
        completed: !!(user.profile.timezone && user.profile.locale),
        icon: Globe,
        description: "Set your timezone and preferred language",
        link: "/profile",
        required: true,
      },
      {
        id: "avatar",
        label: "Profile Photo",
        completed: !!user.profile.avatarUrl,
        icon: UserIcon,
        description: "Upload a profile photo to personalize your account",
        link: "/profile",
        required: false,
      },
    ];

    // Add therapist-specific items
    if (user.role === "therapist") {
      baseItems.push(
        {
          id: "credentials",
          label: "Professional Credentials",
          completed: !!(
            therapistProfile?.credentials?.licenseNumber &&
            therapistProfile?.credentials?.licenseState
          ),
          icon: Shield,
          description: "Add your professional license information",
          link: "/therapist/profile",
          required: true,
        },
        {
          id: "practice",
          label: "Practice Information",
          completed: !!(
            therapistProfile?.practice?.bio &&
            therapistProfile?.credentials?.specializations?.length
          ),
          icon: FileText,
          description: "Complete your practice profile and specializations",
          link: "/therapist/profile",
          required: true,
        },
        {
          id: "languages",
          label: "Languages & Session Types",
          completed: !!(
            therapistProfile?.practice?.languages?.length &&
            therapistProfile?.practice?.sessionTypes?.length
          ),
          icon: Languages,
          description: "Specify languages and types of therapy you offer",
          link: "/therapist/profile",
          required: true,
        }
      );
    }

    return baseItems;
  }, [user, therapistProfile]);

  const completedCount = completionItems.filter(
    (item) => item.completed
  ).length;
  const requiredCount = completionItems.filter((item) => item.required).length;
  const requiredCompleted = completionItems.filter(
    (item) => item.required && item.completed
  ).length;
  const totalCount = completionItems.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);
  const requiredPercentage = Math.round(
    (requiredCompleted / requiredCount) * 100
  );

  const getStatusColor = () => {
    if (requiredPercentage === 100) return "text-green-600";
    if (requiredPercentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusText = () => {
    if (requiredPercentage === 100) return "Complete";
    if (requiredPercentage >= 50) return "Almost Done";
    return "Needs Attention";
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Profile Completion
              <Badge
                variant={requiredPercentage === 100 ? "default" : "secondary"}
                className={getStatusColor()}
              >
                {getStatusText()}
              </Badge>
            </CardTitle>
            <div className="text-right text-sm text-gray-600">
              {completedCount} of {totalCount} completed
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {/* Required vs Optional */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex justify-between">
                <span className="text-gray-600">Required</span>
                <span className="font-medium">
                  {requiredCompleted}/{requiredCount}
                </span>
              </div>
              <Progress value={requiredPercentage} className="h-1 mt-1" />
            </div>
            <div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-medium">
                  {completedCount}/{totalCount}
                </span>
              </div>
              <Progress value={completionPercentage} className="h-1 mt-1" />
            </div>
          </div>

          {/* Completion Items */}
          <div className="space-y-3">
            {completionItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    item.completed
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {item.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle
                        className={`h-5 w-5 ${
                          item.required ? "text-red-500" : "text-gray-400"
                        }`}
                      />
                    )}
                  </div>

                  <Icon
                    className={`h-4 w-4 ${
                      item.completed ? "text-green-600" : "text-gray-400"
                    }`}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${
                          item.completed ? "text-green-900" : "text-gray-900"
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.required && !item.completed && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        item.completed ? "text-green-700" : "text-gray-600"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>

                  {!item.completed && item.link && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={item.link}>Complete</Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          {requiredPercentage < 100 && (
            <div className="pt-4 border-t">
              <Button className="w-full" asChild>
                <Link href="/profile">Complete Profile Setup</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
