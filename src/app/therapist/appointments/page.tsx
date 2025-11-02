"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Video,
  User,
  FileText,
  X,
  Check,
  AlertCircle,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TherapistLayout } from "@/components/therapist/TherapistLayout";
import { useAuth } from "@/lib/hooks/useAuth";
import { AppointmentService } from "@/lib/services/appointment-service";
import { UserProfileService } from "@/lib/services/user-profile-service";
import { VideoSessionModal } from "@/components/video/VideoSessionModal";
import type { Appointment, AppointmentStatus } from "@/types/database";
import { Timestamp } from "firebase/firestore";

interface AppointmentWithClient extends Appointment {
  clientProfile?: {
    firstName: string;
    lastName: string;
    avatar?: string;
    email?: string;
  };
}

const statusConfig = {
  pending: {
    label: "Pending",
    variant: "secondary" as const,
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800",
  },
  confirmed: {
    label: "Confirmed",
    variant: "default" as const,
    icon: Check,
    color: "bg-green-100 text-green-800",
  },
  in_progress: {
    label: "In Progress",
    variant: "default" as const,
    icon: Video,
    color: "bg-blue-100 text-blue-800",
  },
  completed: {
    label: "Completed",
    variant: "outline" as const,
    icon: Check,
    color: "bg-blue-100 text-blue-800",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive" as const,
    icon: X,
    color: "bg-red-100 text-red-800",
  },
  no_show: {
    label: "No Show",
    variant: "destructive" as const,
    icon: AlertCircle,
    color: "bg-red-100 text-red-800",
  },
};

export default function TherapistAppointmentsPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithClient | null>(null);
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isStartingVideo, setIsStartingVideo] = useState(false);
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

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = AppointmentService.subscribeToTherapistAppointments(
      user.uid,
      async (appointmentData) => {
        try {
          // Fetch client profiles for each appointment
          const appointmentsWithClients = await Promise.all(
            appointmentData.map(async (appointment) => {
              try {
                const clientProfile = await UserProfileService.getUserProfile(
                  appointment.clientId
                );
                return {
                  ...appointment,
                  clientProfile: clientProfile
                    ? {
                        firstName:
                          clientProfile.profile?.firstName || "Unknown",
                        lastName: clientProfile.profile?.lastName || "Client",
                        avatar: clientProfile.profile?.avatarUrl,
                        email: clientProfile.email,
                      }
                    : undefined,
                };
              } catch (error) {
                console.error("Error fetching client profile:", error);
                return {
                  ...appointment,
                  clientProfile: {
                    firstName: "Unknown",
                    lastName: "Client",
                  },
                };
              }
            })
          );

          setAppointments(appointmentsWithClients);
          setError(null);
        } catch (err) {
          console.error("Error processing appointments:", err);
          setError("Failed to load appointment details");
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe?.();
  }, [user?.uid]);

  const handleStatusUpdate = async (
    appointmentId: string,
    newStatus: AppointmentStatus
  ) => {
    if (!user?.uid) return;

    setIsUpdating(true);
    try {
      await AppointmentService.updateAppointmentStatus(
        appointmentId,
        newStatus
      );

      // If adding notes, also update them
      if (notes.trim() && selectedAppointment) {
        // Add therapist notes to the communication object
        const appointment = await AppointmentService.getAppointment(
          appointmentId
        );
        if (appointment) {
          // Update the appointment document with therapist notes
          // This would typically require an updateAppointment method
          console.log("Adding therapist notes:", notes.trim());
        }
        setNotes("");
      }
      setError(null);
    } catch (error) {
      console.error("Error updating appointment:", error);
      setError("Failed to update appointment status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNotes = async (appointmentId: string) => {
    if (!notes.trim()) return;

    setIsUpdating(true);
    try {
      // For now, we'll add this to the communication.therapistNotes field
      // This would require extending the AppointmentService with an updateAppointmentNotes method
      console.log(
        "Adding therapist notes to appointment:",
        appointmentId,
        notes.trim()
      );

      // Simulate success for now
      setNotes("");
      setSelectedAppointment(null);
      setError(null);
    } catch (error) {
      console.error("Error adding notes:", error);
      setError("Failed to add notes");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartVideoSession = async (
    appointment: AppointmentWithClient
  ) => {
    if (!user?.uid || !appointment.id) return;

    try {
      setVideoSessionModal({
        isOpen: true,
        appointmentId: appointment.id,
        appointmentTitle: `Session with ${appointment.clientProfile?.firstName} ${appointment.clientProfile?.lastName}`,
      });
      setError(null);
    } catch (error) {
      console.error("Error starting video session:", error);
      setError("Unable to start video session. Please try again.");
    }
  };

  const filterAppointments = (status: string) => {
    const now = new Date();

    switch (status) {
      case "upcoming":
        return appointments.filter((apt) => {
          const appointmentDate =
            apt.scheduledFor instanceof Timestamp
              ? apt.scheduledFor.toDate()
              : new Date(apt.scheduledFor);
          return (
            (apt.status === "pending" || apt.status === "confirmed") &&
            appointmentDate >= now
          );
        });
      case "past":
        return appointments.filter((apt) => {
          const appointmentDate =
            apt.scheduledFor instanceof Timestamp
              ? apt.scheduledFor.toDate()
              : new Date(apt.scheduledFor);
          return (
            apt.status === "completed" ||
            (apt.status !== "cancelled" &&
              apt.status !== "no_show" &&
              appointmentDate < now)
          );
        });
      case "cancelled":
        return appointments.filter(
          (apt) => apt.status === "cancelled" || apt.status === "no_show"
        );
      default:
        return appointments;
    }
  };

  const formatDateTime = (scheduledFor: Timestamp | string | Date) => {
    const date =
      scheduledFor instanceof Timestamp
        ? scheduledFor.toDate()
        : new Date(scheduledFor);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  };

  const canStartVideo = (appointment: AppointmentWithClient) => {
    if (appointment.status !== "confirmed") return false;

    const now = new Date();
    const appointmentStart =
      appointment.scheduledFor instanceof Timestamp
        ? appointment.scheduledFor.toDate()
        : new Date(appointment.scheduledFor);
    const timeDiff = appointmentStart.getTime() - now.getTime();

    // Allow starting 15 minutes before appointment time and up to 1 hour after
    return timeDiff <= 15 * 60 * 1000 && timeDiff >= -60 * 60 * 1000;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Appointments
          </h1>
          <p className="text-lg text-gray-600">
            Manage your therapy appointments and sessions
          </p>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">
              Upcoming ({filterAppointments("upcoming").length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({filterAppointments("past").length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({filterAppointments("cancelled").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            {filterAppointments(selectedTab).length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {selectedTab} appointments
                  </h3>
                  <p className="text-gray-500">
                    {selectedTab === "upcoming"
                      ? "You don't have any upcoming appointments."
                      : `No ${selectedTab} appointments found.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterAppointments(selectedTab).map((appointment) => {
                  const { date, time } = formatDateTime(
                    appointment.scheduledFor
                  );
                  const statusInfo = statusConfig[appointment.status];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <Card
                      key={appointment.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-600" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-lg font-medium text-gray-900">
                                  {appointment.clientProfile?.firstName}{" "}
                                  {appointment.clientProfile?.lastName}
                                </h3>
                                <Badge className={statusInfo.color}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusInfo.label}
                                </Badge>
                              </div>

                              <div className="flex items-center text-sm text-gray-500 space-x-4">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {date}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {time} ({appointment.duration} min)
                                </div>
                              </div>

                              <div className="mt-2 text-sm">
                                <span className="font-medium">
                                  Session Type:{" "}
                                </span>
                                <span className="capitalize">
                                  {appointment.session?.type || "Individual"}
                                </span>
                              </div>

                              {appointment.communication?.clientNotes && (
                                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  <strong>Client Notes:</strong>{" "}
                                  {appointment.communication.clientNotes}
                                </div>
                              )}

                              {appointment.communication?.therapistNotes && (
                                <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                                  <strong>My Notes:</strong>{" "}
                                  {appointment.communication.therapistNotes}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Video Session Button */}
                            {canStartVideo(appointment) && (
                              <Button
                                onClick={() =>
                                  handleStartVideoSession(appointment)
                                }
                                disabled={isStartingVideo}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Video className="w-4 h-4 mr-2" />
                                Start Session
                              </Button>
                            )}

                            {/* Action Buttons */}
                            {appointment.status === "pending" && (
                              <>
                                <Button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      appointment.id,
                                      "confirmed"
                                    )
                                  }
                                  disabled={isUpdating}
                                  size="sm"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Confirm
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      appointment.id,
                                      "cancelled"
                                    )
                                  }
                                  disabled={isUpdating}
                                  variant="outline"
                                  size="sm"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </>
                            )}

                            {appointment.status === "confirmed" &&
                              selectedTab === "past" && (
                                <Button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      appointment.id,
                                      "completed"
                                    )
                                  }
                                  disabled={isUpdating}
                                  size="sm"
                                >
                                  Mark Complete
                                </Button>
                              )}

                            {/* Add Notes Button */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setNotes(
                                      appointment.communication
                                        ?.therapistNotes || ""
                                    );
                                  }}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  {appointment.communication?.therapistNotes
                                    ? "Edit Notes"
                                    : "Add Notes"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    {appointment.communication?.therapistNotes
                                      ? "Edit Notes"
                                      : "Add Notes"}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="notes">Session Notes</Label>
                                    <Textarea
                                      id="notes"
                                      placeholder="Add your notes about this session..."
                                      value={notes}
                                      onChange={(e) => setNotes(e.target.value)}
                                      rows={4}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setNotes("");
                                      setSelectedAppointment(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleAddNotes(appointment.id)
                                    }
                                    disabled={isUpdating || !notes.trim()}
                                  >
                                    {isUpdating ? (
                                      <LoadingSpinner size="sm" />
                                    ) : (
                                      "Save Notes"
                                    )}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Alert for video session requirements */}
        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Video sessions can be started 15 minutes before the scheduled
            appointment time. Make sure you have a stable internet connection
            and camera/microphone access.
          </AlertDescription>
        </Alert>

        {/* Video Session Modal */}
        {videoSessionModal.isOpen && user && (
          <VideoSessionModal
            isOpen={videoSessionModal.isOpen}
            onClose={() =>
              setVideoSessionModal({
                isOpen: false,
                appointmentId: "",
                appointmentTitle: "",
              })
            }
            appointmentId={videoSessionModal.appointmentId}
            userId={user.uid}
            userRole="therapist"
            appointmentTitle={videoSessionModal.appointmentTitle}
          />
        )}
    </TherapistLayout>
  );
}