"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "admin")) {
      router.push("/login");
    }
  }, [user, userData, loading, router]);

  if (loading) {
    return <PageLoadingSpinner text="Loading admin dashboard..." />;
  }

  if (!user || !userData || userData.role !== "admin") {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
