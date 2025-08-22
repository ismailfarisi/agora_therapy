"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { AppointmentService } from "@/lib/services/appointment-service";
import { Navigation } from "@/components/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, Video, AlertCircle } from "lucide-react";
import { VideoSessionModal } from "@/components/video/VideoSessionModal";
import { Appointment, AppointmentStatus } from "@/types/database";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";

export default function MySessionsPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoSessionModal, setVideoSessionModal] = useState<{
    isOpen: boolean;
    appointmentId: string;
    appointmentTitle: string;
  }>({
    isOpen: false,
    appointmentId: "",
    appointmentTitle: "",
  });

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AppointmentService.getClientAppointments(user!.uid);
      setAppointments(data);
    } catch (err) {
      console.error("Error loading appointments:", err);
      setError("Failed to load your appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadAppointments();
    }
  }, [user?.uid]);

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp?.toDate?.() || new Date();
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timestamp: Timestamp) => {
    const date = timestamp?.toDate?.() || new Date();
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isUpcoming = (appointment: Appointment) => {
    const appointmentDate = appointment.scheduledFor?.toDate?.() || new Date();
    return appointmentDate > new Date() && appointment.status !== "cancelled";
  };

  const isPast = (appointment: Appointment) => {
    const appointmentDate = appointment.scheduledFor?.toDate?.() || new Date();
    return appointmentDate <= new Date() || appointment.status === "completed";
  };

  const isCancelled = (appointment: Appointment) => {
    return appointment.status === "cancelled";
  };

  const upcomingAppointments = appointments.filter(isUpcoming);
  const pastAppointments = appointments.filter(isPast);
  const cancelledAppointments = appointments.filter(isCancelled);

  const handleJoinSession = (appointment: Appointment) => {
    setVideoSessionModal({
      isOpen: true,
      appointmentId: appointment.id,
      appointmentTitle: `Session with Therapist ${appointment.therapistId}`,
    });
  };

  const handleCloseVideoSession = () => {
    setVideoSessionModal({
      isOpen: false,
      appointmentId: "",
      appointmentTitle: "",
    });
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      await AppointmentService.updateAppointmentStatus(
        appointmentId,
        "cancelled",
        "Cancelled by client"
      );
      await loadAppointments();
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      alert("Failed to cancel appointment. Please try again.");
    }
  };

  const handleRescheduleAppointment = (appointmentId: string) => {
    // This would typically open a rescheduling modal or redirect to booking flow
    alert("Rescheduling functionality will be implemented soon.");
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {formatDate(appointment.scheduledFor)}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4" />
              {formatTime(appointment.scheduledFor)} - {appointment.duration}{" "}
              minutes
            </CardDescription>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status.charAt(0).toUpperCase() +
              appointment.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-600" />
            <span className="font-medium">
              Therapist {appointment.therapistId}
            </span>
          </div>

          <div>
            <span className="font-medium">Session Type: </span>
            <span className="capitalize">
              {appointment.session?.type || "Individual Therapy"}
            </span>
          </div>

          {appointment.communication?.clientNotes && (
            <div>
              <span className="font-medium">Notes: </span>
              <span>{appointment.communication.clientNotes}</span>
            </div>
          )}

          {isUpcoming(appointment) && (
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => handleJoinSession(appointment)}
                className="flex items-center gap-2"
                disabled={!appointment.session?.joinUrl}
              >
                <Video className="h-4 w-4" />
                Join Session
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRescheduleAppointment(appointment.id)}
              >
                Reschedule
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleCancelAppointment(appointment.id)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-6xl mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Sessions</h1>
          <p className="text-lg text-gray-600">
            Manage your therapy appointments and join upcoming sessions
          </p>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No upcoming appointments
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Ready to book your next therapy session?
                  </p>
                  <Button asChild>
                    <Link href="/client/therapists">Find a Therapist</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No past appointments
                  </h3>
                  <p className="text-gray-600">
                    Your completed sessions will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pastAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6">
            {cancelledAppointments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No cancelled appointments
                  </h3>
                  <p className="text-gray-600">
                    Your cancelled sessions will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              cancelledAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Video Session Modal */}
      <VideoSessionModal
        isOpen={videoSessionModal.isOpen}
        onClose={handleCloseVideoSession}
        appointmentId={videoSessionModal.appointmentId}
        userId={user?.uid || ""}
        userRole="client"
        appointmentTitle={videoSessionModal.appointmentTitle}
      />
    </div>
  );
}
