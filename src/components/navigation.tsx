/**
 * Main Navigation Component
 * Responsive navigation with role-based menu items
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Calendar,
  Users,
  Shield,
} from "lucide-react";

export function Navigation() {
  const { user, userData, signOut, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const getNavItems = () => {
    if (!userData) return [];

    const baseItems = [{ href: "/", label: "Home", icon: null }];

    switch (userData.role) {
      case "client":
        return [
          ...baseItems,
          { href: "/client", label: "Dashboard", icon: null },
          {
            href: "/client/appointments",
            label: "My Sessions",
            icon: Calendar,
          },
          { href: "/client/therapists", label: "Find Therapists", icon: Users },
        ];
      case "therapist":
        return [
          ...baseItems,
          { href: "/therapist", label: "Dashboard", icon: null },
          {
            href: "/therapist/appointments",
            label: "My Sessions",
            icon: Calendar,
          },
          { href: "/therapist/clients", label: "My Clients", icon: Users },
          { href: "/therapist/schedule", label: "Schedule", icon: Calendar },
        ];
      case "admin":
        return [
          ...baseItems,
          { href: "/admin", label: "Admin", icon: Shield },
          { href: "/admin/users", label: "Users", icon: Users },
          { href: "/admin/appointments", label: "Sessions", icon: Calendar },
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">TC</span>
              </div>
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">
              TherapyConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <>
                {/* Desktop User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={userData?.profile?.avatarUrl}
                          alt={userData?.profile?.displayName || "User"}
                        />
                        <AvatarFallback>
                          {userData?.profile?.firstName?.[0]?.toUpperCase() ||
                            userData?.email?.[0]?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">
                        {userData?.profile?.displayName || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userData?.email}
                      </p>
                      {userData?.role && (
                        <p className="text-xs leading-none text-muted-foreground capitalize">
                          {userData.role}
                        </p>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && user && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
