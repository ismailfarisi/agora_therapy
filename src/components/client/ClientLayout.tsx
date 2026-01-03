"use client";

import React from "react";
import { ClientSidebar } from "@/components/client/ClientSidebar";
import Header from "../layout/Header";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Header />
      <div className="flex pt-20 px-26">
              <ClientSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      </div>

    </div>
  );
}
