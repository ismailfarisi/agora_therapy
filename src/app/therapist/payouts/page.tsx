"use client";

import React, { useState, useEffect } from "react";
import { TherapistLayout } from "@/components/therapist/TherapistLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed";
  period: {
    startDate: any;
    endDate: any;
  };
  appointments: string[];
  stripePayoutId?: string;
  metadata: {
    createdAt: any;
    processedAt?: any;
    completedAt?: any;
    failureReason?: string;
  };
}

interface PayoutStats {
  totalEarnings: number;
  paidOut: number;
  pending: number;
  totalAppointments: number;
  pendingAppointments: number;
}

export default function TherapistPayoutsPage() {
  const { user, loading: authLoading } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState<PayoutStats>({
    totalEarnings: 0,
    paidOut: 0,
    pending: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchPayouts();
    }
  }, [user?.uid]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const token = await user?.getIdToken();
      const response = await fetch("/api/therapist/payouts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayouts(data.payouts || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error("Error fetching payouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "processing":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "processing":
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "failed":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <TherapistLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </TherapistLayout>
    );
  }

  return (
    <TherapistLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payouts</h1>
        <p className="text-lg text-gray-600">
          Track your earnings and payout history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${(stats.totalEarnings / 100).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              From {stats.totalAppointments} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Paid Out</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${(stats.paidOut / 100).toFixed(2)}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {payouts.filter((p) => p.status === "completed").length} payouts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${(stats.pending / 100).toFixed(2)}
                </p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              From {stats.pendingAppointments} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Payout Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalEarnings > 0
                    ? ((stats.paidOut / stats.totalEarnings) * 100).toFixed(0)
                    : 0}
                  %
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Of total earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Earnings Banner */}
      {stats.pending > 0 && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pending Earnings
                  </h3>
                  <p className="text-sm text-gray-600">
                    You have ${(stats.pending / 100).toFixed(2)} pending from{" "}
                    {stats.pendingAppointments} completed sessions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Next payout</p>
                <p className="text-lg font-semibold text-gray-900">
                  Within 7 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payout History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payout History</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchPayouts}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No payout history yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Payouts are processed weekly for completed sessions
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge
                          className={`${getStatusColor(payout.status)} text-white`}
                        >
                          <span className="flex items-center gap-1">
                            {getStatusIcon(payout.status)}
                            {payout.status.charAt(0).toUpperCase() +
                              payout.status.slice(1)}
                          </span>
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Payout ID: {payout.id.slice(0, 8)}...
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Period
                          </p>
                          <div className="flex items-center text-gray-900">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="text-sm">
                              {formatDate(payout.period.startDate)} -{" "}
                              {formatDate(payout.period.endDate)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Sessions Included
                          </p>
                          <p className="text-sm text-gray-900 font-medium">
                            {payout.appointments.length} sessions
                          </p>
                        </div>
                      </div>

                      {payout.metadata.completedAt && (
                        <div className="text-sm text-gray-600">
                          <span className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Completed on{" "}
                            {formatDate(payout.metadata.completedAt)}
                          </span>
                        </div>
                      )}

                      {payout.metadata.failureReason && (
                        <div className="text-sm text-red-600 mt-2">
                          <span className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {payout.metadata.failureReason}
                          </span>
                        </div>
                      )}

                      {payout.stripePayoutId && (
                        <div className="text-xs text-gray-500 mt-2">
                          Stripe Payout ID: {payout.stripePayoutId}
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-6">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        ${(payout.amount / 100).toFixed(2)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {payout.currency.toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Created {formatDate(payout.metadata.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Payout Information
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <span>
                Payouts are processed weekly for all completed sessions from the
                previous week
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <span>
                Funds typically arrive in your account within 2-5 business days
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <span>
                Platform fee (15%) is automatically deducted from each session
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <span>
                Update your bank details in Settings to ensure smooth payouts
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </TherapistLayout>
  );
}
