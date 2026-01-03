"use client";

import React from "react";
import { ClientSidebar } from "@/components/client/ClientSidebar";
import Header from "../layout/Header";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 px-28">
      <Header />
      <div className="flex h-screen pt-16">
        <ClientSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
