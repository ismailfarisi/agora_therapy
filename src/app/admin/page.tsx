/**
 * Admin Dashboard
 * Main dashboard for administrators to manage the platform
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Users,
  Calendar,
  Shield,
  TrendingUp,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PlatformStats } from "@/types/database";

export default function AdminDashboard() {
  const { user, userData } = useAuth();
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage the Mindgood platform.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-blue-200 bg-white/80 backdrop-blur hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.users.total || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {stats?.users.newThisMonth || 0} new this month
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white/80 backdrop-blur hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Therapists
              </CardTitle>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.therapists.verified || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {stats?.therapists.pending || 0} pending verification
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white/80 backdrop-blur hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Sessions Today
              </CardTitle>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.appointments.todayCount || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {stats?.appointments.upcoming || 0} upcoming total
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white/80 backdrop-blur hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Platform Revenue
              </CardTitle>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {statsLoading ? '...' : `$${stats?.revenue.thisMonth.toFixed(2) || '0.00'}`}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                ${stats?.revenue.total.toFixed(2) || '0.00'} total
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="border-blue-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Recent Platform Activity</CardTitle>
                <CardDescription className="text-sm">
                  Latest user registrations and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No recent activity
                  </h3>
                  <p className="text-gray-600 text-sm">
                    System activity and user events will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status & Alerts */}
          <div className="space-y-4">
            <Card className="border-blue-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">System Status</CardTitle>
                <CardDescription className="text-sm">Platform health and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="text-sm font-medium">Database</span>
                    <span className="text-sm text-green-600 font-semibold">
                      Healthy
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="text-sm font-medium">Authentication</span>
                    <span className="text-sm text-green-600 font-semibold">
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="text-sm font-medium">Video Service</span>
                    <span className="text-sm text-green-600 font-semibold">
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="text-sm font-medium">Payment System</span>
                    <span className="text-sm text-green-600 font-semibold">
                      Active
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Pending Actions</CardTitle>
                <CardDescription className="text-sm">
                  Items requiring admin attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">No pending actions</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}
