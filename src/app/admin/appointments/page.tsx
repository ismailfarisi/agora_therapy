/**
 * Admin Appointments Management Page
 * View and manage all appointments/sessions
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
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Video,
  Filter,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Appointment {
  id: string;
  therapistId: string;
  clientId: string;
  therapistName: string;
  clientName: string;
  scheduledFor: Date;
  duration: number;
  status: string;
  payment: {
    amount: number;
    status: string;
  };
}

export default function AppointmentsManagement() {
  const { user, userData, loading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");

  useEffect(() => {
    if (user && userData?.role === "admin") {
      fetchAppointments();
    }
  }, [user, userData]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, filter]);

  const fetchAppointments = async () => {
    try {
      setDataLoading(true);
      // API call would go here
      setAppointments([]);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;
    const now = new Date();

    if (filter === "upcoming") {
      filtered = filtered.filter(
        (a) => a.status === "confirmed" && new Date(a.scheduledFor) > now
      );
    } else if (filter === "completed") {
      filtered = filtered.filter((a) => a.status === "completed");
    } else if (filter === "cancelled") {
      filtered = filtered.filter((a) => a.status === "cancelled");
    }

    setFilteredAppointments(filtered);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      confirmed: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return badges[status as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <PageLoadingSpinner text="Loading appointments..." />;
  }

  if (!user || !userData || userData.role !== "admin") {
    return null;
  }

  const upcomingCount = appointments.filter(
    (a) => a.status === "confirmed" && new Date(a.scheduledFor) > new Date()
  ).length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const cancelledCount = appointments.filter((a) => a.status === "cancelled").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Appointments Management
              </h1>
              <p className="text-gray-600">View and manage all therapy sessions</p>
            </div>
            <Link href="/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcomingCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{cancelledCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "upcoming" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("upcoming")}
              >
                Upcoming
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("completed")}
              >
                Completed
              </Button>
              <Button
                variant={filter === "cancelled" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("cancelled")}
              >
                Cancelled
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>Sessions ({filteredAppointments.length})</CardTitle>
            <CardDescription>All therapy appointments on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading appointments...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No appointments found
                </h3>
                <p className="text-gray-600">
                  {filter !== "all"
                    ? "Try adjusting your filters"
                    : "No appointments have been scheduled yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.therapistName} → {appointment.clientName}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Date:</span>{" "}
                            {new Date(appointment.scheduledFor).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Time:</span>{" "}
                            {new Date(appointment.scheduledFor).toLocaleTimeString()}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span>{" "}
                            {appointment.duration} minutes
                          </div>
                          <div>
                            <span className="font-medium">Payment:</span> $
                            {(appointment.payment.amount / 100).toFixed(2)} (
                            {appointment.payment.status})
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Link href={`/admin/appointments/${appointment.id}`}>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
