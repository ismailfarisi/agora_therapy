/**
 * Client Profile View
 * Profile-focused dashboard for clients
 */

"use client";

import { useEffect, useState } from "react";
import { ClientLayout } from "@/components/client/ClientLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  LoadingSpinner,
  PageLoadingSpinner,
} from "@/components/ui/loading-spinner";
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Edit,
  CheckCircle,
  Video,
  FileText
} from "lucide-react";
import Link from "next/link";
import { AppointmentService } from "@/lib/services/appointment-service";
import { Appointment } from "@/types/database";

export default function ClientDashboard() {
  const { user, userData, loading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const data = await AppointmentService.getClientAppointments(user!.uid);
      setAppointments(data);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => {
      const timestamp = apt.scheduledFor as any;
      const appointmentDate = timestamp?.toDate?.() || new Date(timestamp);
      return appointmentDate > new Date() && apt.status !== "cancelled";
    }
  );

  const completedSessions = appointments.filter(
    (apt) => apt.status === "completed"
  ).length;

  if (loading) {
    return <PageLoadingSpinner text="Loading your profile..." />;
  }

  if (!user || !userData) {
    return null;
  }

  return (
    <ClientLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userData.profile?.firstName}!</h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your therapy journey.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-blue-200/60 bg-white shadow-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Total Sessions</p>
                  <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                  <Video className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-blue-200/60 bg-white shadow-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{completedSessions}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-blue-200/60 bg-white shadow-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Upcoming</p>
                  <p className="text-3xl font-bold text-gray-900">{upcomingAppointments.length}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-blue-200/60 bg-white shadow-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Member Since</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userData.metadata?.createdAt ? new Date(userData.metadata.createdAt as unknown as Date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <User className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <Card className="border border-blue-200/60 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                    <CardDescription className="text-sm">
                      Your scheduled therapy sessions
                    </CardDescription>
                  </div>
                  <Link href="/client/appointments">
                    <Button variant="outline" size="sm" className="border-blue-300 hover:bg-blue-50">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAppointments ? (
                  <div className="text-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.slice(0, 3).map((apt) => {
                      const timestamp = apt.scheduledFor as any;
                      const date = timestamp?.toDate?.() || new Date(timestamp);
                      return (
                        <div key={apt.id} className="flex items-center justify-between p-4 border border-blue-200 rounded-lg hover:bg-blue-50/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                              <Video className="h-6 w-6 text-teal-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Session with Therapist
                              </p>
                              <p className="text-sm text-gray-600">
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <Link href="/client/appointments">
                            <Button size="sm" className="bg-teal-500 hover:bg-teal-600">View Details</Button>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No upcoming sessions
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Book your first therapy session to get started
                    </p>
                    <Link href="/client/therapists">
                      <Button className="bg-teal-500 hover:bg-teal-600">Find a Therapist</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="border border-blue-200/60 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription className="text-sm">Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/client/therapists" className="block">
                  <Button variant="outline" className="w-full justify-start border-blue-300 hover:bg-blue-50">
                    <User className="mr-2 h-4 w-4" />
                    Browse Therapists
                  </Button>
                </Link>
                <Link href="/client/appointments" className="block">
                  <Button variant="outline" className="w-full justify-start border-blue-300 hover:bg-blue-50">
                    <Calendar className="mr-2 h-4 w-4" />
                    My Appointments
                  </Button>
                </Link>
                <Link href="/client/invoices" className="block">
                  <Button variant="outline" className="w-full justify-start border-blue-300 hover:bg-blue-50">
                    <FileText className="mr-2 h-4 w-4" />
                    View Invoices
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border border-blue-200/60 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Therapy Tips</CardTitle>
                <CardDescription className="text-sm">For a better session</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2.5 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-0.5">•</span>
                    <span>Choose a quiet, private space</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-0.5">•</span>
                    <span>Test your camera and microphone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-0.5">•</span>
                    <span>Prepare topics to discuss</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-0.5">•</span>
                    <span>Stay hydrated</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
