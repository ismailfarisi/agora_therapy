"use client";

import { TherapistSidebar } from "./TherapistSidebar";

interface TherapistLayoutProps {
  children: React.ReactNode;
}

export function TherapistLayout({ children }: TherapistLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TherapistSidebar />
      <div className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
