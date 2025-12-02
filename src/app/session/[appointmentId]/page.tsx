"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { VideoSession } from "@/components/video/VideoSession";
import { AppointmentService } from "@/lib/services/appointment-service";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Video } from "lucide-react";
import type { Appointment } from "@/types/database";

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"therapist" | "client" | null>(null);

  const appointmentId = params.appointmentId as string;

  useEffect(() => {
    const loadAppointment = async () => {
      if (!user || !appointmentId) return;

      try {
        setLoading(true);
        const apt = await AppointmentService.getAppointment(appointmentId);
        
        if (!apt) {
          setError("Appointment not found");
          return;
        }

        // Determine user role
        if (apt.therapistId === user.uid) {
          setUserRole("therapist");
        } else if (apt.clientId === user.uid) {
          setUserRole("client");
        } else {
          setError("You are not authorized to join this session");
          return;
        }

        // Check if appointment is confirmed or in progress
        if (apt.status !== "confirmed" && apt.status !== "in_progress") {
          setError(`This session is ${apt.status}. Only confirmed sessions can be joined.`);
          return;
        }

        setAppointment(apt);
      } catch (err) {
        console.error("Error loading appointment:", err);
        setError("Failed to load appointment details");
      } finally {
        setLoading(false);
      }
    };

    loadAppointment();
  }, [user, appointmentId]);

  const handleSessionEnd = () => {
    // Redirect based on user role
    if (userRole === "therapist") {
      router.push("/therapist/appointments");
    } else {
      router.push("/client/sessions");
    }
  };

  const handleGoBack = () => {
    if (userRole === "therapist") {
      router.push("/therapist/appointments");
    } else {
      router.push("/client/sessions");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !appointment || !userRole || !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error || "Unable to load session"}</AlertDescription>
        </Alert>
        <Button onClick={handleGoBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={handleGoBack} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-teal-600" />
                <h1 className="text-xl font-semibold">Therapy Session</h1>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {userRole === "therapist" ? "Therapist View" : "Client View"}
            </div>
          </div>
        </div>
      </div>

      {/* Video Session */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Session Details
            </h2>
            <p className="text-sm text-gray-600">
              Appointment ID: {appointmentId}
            </p>
            <p className="text-sm text-gray-600">
              Duration: {appointment.duration} minutes
            </p>
          </div>

          <VideoSession
            appointmentId={appointmentId}
            userId={user.uid}
            userRole={userRole}
            onSessionEnd={handleSessionEnd}
            className="w-full"
          />
        </div>

        {/* Session Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Session Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Ensure you have a stable internet connection</li>
            <li>• Use headphones for better audio quality</li>
            <li>• Find a quiet, private space for your session</li>
            <li>• Test your camera and microphone before starting</li>
            {userRole === "client" && (
              <li>• Your session is confidential and secure</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
