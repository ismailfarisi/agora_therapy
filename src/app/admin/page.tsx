/**
 * Admin Dashboard
 * Main dashboard for administrators to manage the platform
 */

"use client";

import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/useAuth";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Users,
  Calendar,
  Shield,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CreditCard,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PlatformStats } from "@/types/database";

export default function AdminDashboard() {
  const { user, userData, loading } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user && userData?.role === 'admin') {
      fetchStats();
    }
  }, [user, userData]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return <PageLoadingSpinner text="Loading admin dashboard..." />;
  }

  if (!user || !userData || userData.role !== "admin") {
    return null; // This will be handled by middleware
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Monitor and manage the Mindgood platform.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {statsLoading ? '...' : stats?.users.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.users.newThisMonth || 0} new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Therapists
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statsLoading ? '...' : stats?.therapists.verified || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.therapists.pending || 0} pending verification
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sessions Today
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {statsLoading ? '...' : stats?.appointments.todayCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.appointments.upcoming || 0} upcoming total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Platform Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {statsLoading ? '...' : `$${stats?.revenue.thisMonth.toFixed(2) || '0.00'}`}
              </div>
              <p className="text-xs text-muted-foreground">
                ${stats?.revenue.total.toFixed(2) || '0.00'} total
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Platform Activity</CardTitle>
                    <CardDescription>
                      Latest user registrations and system events
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View All Logs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No recent activity
                  </h3>
                  <p className="text-gray-600">
                    System activity and user events will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Tools */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Tools</CardTitle>
                <CardDescription>
                  Platform management and utilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/users" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                </Link>
                <Link href="/admin/therapists" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Verify Therapists
                  </Button>
                </Link>
                <Link href="/admin/appointments" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    View All Sessions
                  </Button>
                </Link>
                <Link href="/admin/payments" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payments & Transactions
                  </Button>
                </Link>
                <Link href="/admin/payouts" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Therapist Payouts
                  </Button>
                </Link>
                <Link href="/admin/refunds" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refund Requests
                  </Button>
                </Link>
                <Link href="/admin/reviews" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Reviews & Ratings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Platform health and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <span className="text-sm text-green-600 font-medium">
                      Healthy
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Authentication</span>
                    <span className="text-sm text-green-600 font-medium">
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Video Service</span>
                    <span className="text-sm text-green-600 font-medium">
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment System</span>
                    <span className="text-sm text-green-600 font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Actions</CardTitle>
                <CardDescription>
                  Items requiring admin attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertTriangle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">No pending actions</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
