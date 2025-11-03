"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { AppointmentService } from "@/lib/services/appointment-service";
import { ClientLayout } from "@/components/client/ClientLayout";
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
import { Calendar, Clock, User, Video, AlertCircle, Download, FileText } from "lucide-react";
import { Appointment, AppointmentStatus } from "@/types/database";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";
import { useToast } from "@/lib/hooks/useToast";

export default function MySessionsPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.uid) {
      loadAppointments();
    }
  }, [user?.uid]);

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

  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
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
    const timestamp = appointment.scheduledFor as any;
    const appointmentDate = timestamp?.toDate?.() || new Date(timestamp);
    return appointmentDate > new Date() && appointment.status !== "cancelled";
  };

  const isPast = (appointment: Appointment) => {
    const timestamp = appointment.scheduledFor as any;
    const appointmentDate = timestamp?.toDate?.() || new Date(timestamp);
    return appointmentDate <= new Date() || appointment.status === "completed";
  };

  const isActiveNow = (appointment: Appointment) => {
    const timestamp = appointment.scheduledFor as any;
    const appointmentDate = timestamp?.toDate?.() || new Date(timestamp);
    const now = new Date();
    const endTime = new Date(appointmentDate.getTime() + (appointment.duration || 60) * 60 * 1000);
    return now >= appointmentDate && now <= endTime && appointment.status === "confirmed";
  };

  const isCancelled = (appointment: Appointment) => {
    return appointment.status === "cancelled";
  };

  const upcomingAppointments = appointments.filter(isUpcoming);
  const pastAppointments = appointments.filter(isPast);
  const cancelledAppointments = appointments.filter(isCancelled);

  const handleJoinSession = (appointment: Appointment) => {
    if (appointment.session?.joinUrl) {
      window.open(appointment.session.joinUrl, "_blank");
      toast.success("Joining Session", "Opening video session in new tab");
    } else {
      toast.error(
        "Link Not Available",
        "Session link is not available yet. Please check back closer to your appointment time."
      );
    }
  };

  const handleDownloadInvoice = async (appointment: Appointment) => {
    try {
      // TODO: Implement actual invoice generation/download
      // For now, create a simple text invoice
      const invoiceData = `
INVOICE
========================================
Appointment ID: ${appointment.id}
Date: ${formatDate(appointment.scheduledFor)}
Time: ${formatTime(appointment.scheduledFor)}
Duration: ${appointment.duration} minutes
Therapist: ${appointment.therapistId}
Session Type: ${appointment.session?.type || "Individual Therapy"}
Amount: $${appointment.payment?.amount || "0.00"}
Status: ${appointment.payment?.status || "Pending"}
========================================
      `;
      
      const blob = new Blob([invoiceData], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${appointment.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("Invoice Downloaded", "Your invoice has been downloaded successfully");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Download Failed", "Failed to download invoice. Please try again.");
    }
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
      toast.success("Appointment Cancelled", "Your appointment has been cancelled successfully");
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      toast.error("Cancellation Failed", "Failed to cancel appointment. Please try again.");
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

          <div className="flex flex-wrap gap-2 mt-4">
            {/* Download Invoice Button - Show for all appointments */}
            <Button
              variant="outline"
              onClick={() => handleDownloadInvoice(appointment)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>

            {/* Join Now - Only for active sessions */}
            {isActiveNow(appointment) && (
              <Button
                onClick={() => handleJoinSession(appointment)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 animate-pulse"
                disabled={!appointment.session?.joinUrl}
              >
                <Video className="h-4 w-4" />
                Join Now
              </Button>
            )}

            {/* Join Session - For upcoming but not yet active */}
            {isUpcoming(appointment) && !isActiveNow(appointment) && (
              <Button
                onClick={() => handleJoinSession(appointment)}
                className="flex items-center gap-2"
                disabled={!appointment.session?.joinUrl}
              >
                <Video className="h-4 w-4" />
                Join Session
              </Button>
            )}

            {/* Reschedule and Cancel - Only for upcoming */}
            {isUpcoming(appointment) && (
              <>
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
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (authLoading || loading) {
    return (
      <ClientLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
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
    </ClientLayout>
  );
}
