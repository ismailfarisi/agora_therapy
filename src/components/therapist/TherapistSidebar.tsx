"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";

const menuItems = [
  {
    name: "Dashboard",
    href: "/therapist",
    icon: LayoutDashboard,
  },
  {
    name: "Appointments",
    href: "/therapist/appointments",
    icon: Clock,
  },
  {
    name: "My Schedule",
    href: "/therapist/schedule",
    icon: Calendar,
  },
  {
    name: "My Clients",
    href: "/therapist/clients",
    icon: Users,
  },
  {
    name: "Payouts",
    href: "/therapist/payouts",
    icon: DollarSign,
  },
  {
    name: "Settings",
    href: "/therapist/settings",
    icon: Settings,
  },
];

export function TherapistSidebar() {
  const pathname = usePathname();
  const { userData, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-start pl-4 h-16 border-b border-gray-200">
            <Link href="/therapist" className="flex items-center">
              <Image
                src="/Mindgood.png"
                alt="MindGood"
                width={140}
                height={40}
                className="object-contain"
              />
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <span className="text-teal-600 font-semibold">
                    {userData?.profile?.firstName?.[0] ||
                      userData?.email?.[0]?.toUpperCase() ||
                      "T"}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Dr.{" "}
                  {userData?.profile?.lastName ||
                    userData?.profile?.firstName ||
                    "Therapist"}
                </p>
                <p className="text-xs text-gray-500">Therapist</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-teal-50 text-teal-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? "text-teal-600" : "text-gray-400"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-600" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
