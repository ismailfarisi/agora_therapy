"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  MessageSquare,
  Settings,
  UserCheck,
  CreditCard,
  RefreshCw,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Therapists",
    href: "/admin/therapists",
    icon: Shield,
  },
  {
    title: "Appointments",
    href: "/admin/appointments",
    icon: Calendar,
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Payouts",
    href: "/admin/payouts",
    icon: DollarSign,
  },
  {
    title: "Refunds",
    href: "/admin/refunds",
    icon: RefreshCw,
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userData, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gradient-to-b from-blue-50 to-cyan-50 border-r border-blue-200">
      {/* User Info */}
      <div className="border-b border-blue-200 px-6 py-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full shadow-lg">
            <span className="text-white font-bold text-2xl">
              {userData?.profile?.firstName?.charAt(0).toUpperCase() || "A"}
            </span>
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">
              {userData?.profile?.displayName || "Admin"}
            </p>
            <p className="text-xs text-gray-600 mt-1">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-white text-teal-600 shadow-sm"
                      : "text-gray-700 hover:bg-blue-100/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="border-t border-blue-200 p-4">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-100/50 transition-all w-full"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
