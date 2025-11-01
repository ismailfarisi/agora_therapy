"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Shield,
  Calendar,
  CreditCard,
  DollarSign,
  RefreshCw,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

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
    <div className="flex h-screen w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-teal-500 rounded-lg">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="text-xl font-bold text-gray-900">MindGood</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-teal-100 rounded-full">
            <span className="text-teal-600 font-semibold text-sm">
              {userData?.profile?.firstName?.charAt(0).toUpperCase() || "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userData?.profile?.displayName || "Admin"}
            </p>
            <p className="text-xs text-gray-500 truncate">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-teal-50 text-teal-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
