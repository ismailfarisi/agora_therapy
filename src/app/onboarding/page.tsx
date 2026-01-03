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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-1/3 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Sparkles */}
        <div className="absolute top-1/4 left-1/3 text-4xl animate-bounce delay-300">✨</div>
        <div className="absolute top-1/3 right-1/4 text-3xl animate-bounce delay-700">🌟</div>
        <div className="absolute bottom-1/3 left-1/4 text-3xl animate-bounce delay-1000">💫</div>
        <div className="absolute bottom-1/4 right-1/3 text-4xl animate-bounce delay-500">⭐</div>
      </div>

      <OnboardingWizard 
        user={{
          ...userData,
          id: user.uid,
          email: user.email || userData.email || "",
        }} 
        onComplete={handleOnboardingComplete} 
      />
    </div>
  );
}
