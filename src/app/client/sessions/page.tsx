"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClientLayout } from "@/components/client/ClientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Video, 
  Calendar, 
  Clock, 
  User,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { AppointmentService } from "@/lib/services/appointment-service";
import { Appointment } from "@/types/database";
import { useToast } from "@/lib/hooks/useToast";

export default function SessionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.uid) {
      loadSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await AppointmentService.getClientAppointments(user!.uid);
      // Only show confirmed appointments
      const confirmedSessions = data.filter(
        (apt) => apt.status === "confirmed" || apt.status === "completed"
      );
      setAppointments(confirmedSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast.error("Load Failed", "Failed to load your sessions");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isActiveNow = (appointment: Appointment) => {
    const timestamp = appointment.scheduledFor as any;
    const appointmentDate = timestamp?.toDate?.() || new Date(timestamp);
    const now = new Date();
    const endTime = new Date(
      appointmentDate.getTime() + (appointment.duration || 60) * 60 * 1000
    );
    return (
      now >= appointmentDate &&
      now <= endTime &&
      appointment.status === "confirmed"
    );
  };

  const handleJoinSession = (appointment: Appointment) => {
    // Navigate to the session page
    router.push(`/session/${appointment.id}`);
  };

  const getSessionStatus = (appointment: Appointment) => {
    if (appointment.status === "completed") {
      return {
        icon: CheckCircle,
        text: "Completed",
        color: "text-green-600 bg-green-50",
      };
    }
    if (isActiveNow(appointment)) {
      return {
        icon: Video,
        text: "Active Now",
        color: "text-green-600 bg-green-50",
      };
    }
    const timestamp = appointment.scheduledFor as any;
    const appointmentDate = timestamp?.toDate?.() || new Date(timestamp);
    if (appointmentDate > new Date()) {
      return {
        icon: Clock,
        text: "Upcoming",
        color: "text-blue-600 bg-blue-50",
      };
    }
    return {
      icon: XCircle,
      text: "Missed",
      color: "text-red-600 bg-red-50",
    };
  };

  if (loading) {
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
          View and manage your therapy sessions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Sessions
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {appointments.length}
                </p>
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
                <p className="text-3xl font-bold text-gray-900">
                  {
                    appointments.filter((apt) => apt.status === "completed")
                      .length
                  }
                </p>
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
                <p className="text-3xl font-bold text-gray-900">
                  {
                    appointments.filter(
                      (apt) =>
                        apt.status === "confirmed" &&
                        (apt.scheduledFor as any)?.toDate?.() > new Date()
                    ).length
                  }
                </p>
              </div>
              <Calendar className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No sessions yet
              </h3>
              <p className="text-gray-600 mb-6">
                Book your first therapy session to get started
              </p>
              <Button>Find a Therapist</Button>
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => {
            const status = getSessionStatus(appointment);
            const StatusIcon = status.icon;

            return (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">
                          Session with Dr. {appointment.therapistId}
                        </CardTitle>
                        <Badge className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.text}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(appointment.scheduledFor)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(appointment.scheduledFor)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {appointment.duration} min
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Session Type */}
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Session Type:{" "}
                      </span>
                      <span className="text-sm text-gray-600 capitalize">
                        {appointment.session?.type || "Individual Therapy"}
                      </span>
                    </div>

                    {/* Notes */}
                    {appointment.communication?.clientNotes && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Notes:{" "}
                        </span>
                        <span className="text-sm text-gray-600">
                          {appointment.communication.clientNotes}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {isActiveNow(appointment) && (
                        <Button
                          onClick={() => handleJoinSession(appointment)}
                          className="bg-green-600 hover:bg-green-700 animate-pulse"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Join Now
                        </Button>
                      )}
                      {appointment.status === "confirmed" &&
                        !isActiveNow(appointment) &&
                        (appointment.scheduledFor as any)?.toDate?.() >
                          new Date() && (
                          <Button
                            onClick={() => handleJoinSession(appointment)}
                            variant="outline"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Join Session
                          </Button>
                        )}
                      {appointment.status === "completed" && (
                        <Button variant="outline" disabled>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Session Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </ClientLayout>
  );
}
