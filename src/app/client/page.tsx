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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-4xl">
                    {userData.profile?.firstName?.[0] || "C"}
                    {userData.profile?.lastName?.[0] || ""}
                  </span>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {userData.profile?.firstName} {userData.profile?.lastName}
                    </h1>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Client
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    {userData.profile?.phoneNumber && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{userData.profile.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                <Link href="/client/settings">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
                </div>
                <Video className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{completedSessions}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-3xl font-bold text-gray-900">{upcomingAppointments.length}</p>
                </div>
                <Calendar className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Member Since</p>
                  <p className="text-xl font-bold text-gray-900">
                    {new Date(userData.createdAt as any).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <User className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">0</div>
              <p className="text-xs text-muted-foreground">Unread messages</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Recent Sessions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Sessions</CardTitle>
                    <CardDescription>
                      Your latest therapy appointments
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No sessions yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Book your first therapy session to get started on your
                    mental health journey.
                  </p>
                  <Link href="/client/therapists">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Find a Therapist
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/client/therapists" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Browse Therapists
                  </Button>
                </Link>
                <Link href="/client/appointments" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    View My Sessions
                  </Button>
                </Link>
                <Link href="/profile" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Tips for your first session</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Choose a quiet, private space</li>
                  <li>• Test your camera and microphone</li>
                  <li>• Prepare topics you&apos;d like to discuss</li>
                  <li>• Have water nearby to stay hydrated</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
