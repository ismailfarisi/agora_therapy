/**
 * Onboarding Page
 * Initial setup for new users
 */

"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/stores/auth-store";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingPage() {
  const { user, userData, loading, refreshUserData } = useAuth();
  const { updateUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Redirect if user has already completed onboarding
    if (userData && userData.metadata.onboardingCompleted) {
      const redirectPath =
        userData.role === "client"
          ? "/client"
          : userData.role === "therapist"
          ? "/therapist"
          : "/admin";
      router.push(redirectPath);
    }
  }, [userData, router]);

  if (loading) {
    return <PageLoadingSpinner text="Setting up your account..." />;
  }

  if (!user || !userData) {
    return null; // This will be handled by middleware
  }

  // If onboarding is already completed, redirect
  if (userData.metadata.onboardingCompleted) {
    return <PageLoadingSpinner text="Redirecting to your dashboard..." />;
  }

  const handleOnboardingComplete = async () => {
    // Update local state
    updateUser({
      metadata: {
        ...userData.metadata,
        onboardingCompleted: true,
      },
    });

    // Refresh user data from server
    await refreshUserData();
  };

  return (
    <OnboardingWizard 
      user={{
        ...userData,
        id: user.uid, // Add Firebase Auth UID
        email: user.email || userData.email || "",
      }} 
      onComplete={handleOnboardingComplete} 
    />
  );
}
