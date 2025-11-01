"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Loader2 } from "lucide-react";

/**
 * Dashboard Redirect Page
 * Redirects users to their role-specific dashboard
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        router.push("/login");
      } else if (userData) {
        // Redirect based on role
        switch (userData.role) {
          case "admin":
            router.push("/admin");
            break;
          case "therapist":
            router.push("/therapist");
            break;
          case "client":
            router.push("/client");
            break;
          default:
            // Unknown role, redirect to home
            router.push("/");
        }
      }
    }
  }, [user, userData, loading, router]);

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
