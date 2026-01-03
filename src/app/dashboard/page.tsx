"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUserRole } from "@/lib/hooks/useAuth";
import { Loader2 } from "lucide-react";

/**
 * Dashboard Redirect Page
 * Redirects users to their role-specific dashboard
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const userRole = useUserRole();

  useEffect(() => {
    
    if (!loading) {
      
      if (!user) {
        router.push("/login");
      } else if (userRole) {
        
        // Redirect based on role using helper hook
        switch (userRole) {
          case "admin":
            router.push("/admin");
            break;
          case "therapist":
            router.push("/therapist");
            break;
          case "client":
            router.push("/client");
            break;
        }
      } else if (user && !userRole) {
        console.warn("⚠️ Dashboard - User exists but no role defined");
        setTimeout(() => {
          if (!userRole) {
            router.push("/onboarding");
          }
        }, 500);
      }
    } else {
      console.log("⏳ Dashboard - Still loading auth state...");
    }
  }, [user, userRole, loading, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
