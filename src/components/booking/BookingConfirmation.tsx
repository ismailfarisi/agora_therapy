"use client";

import React, { useState, useEffect } from "react";
import { format, parseISO, addMinutes } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Users,
} from "lucide-react";
import { AppointmentService } from "@/lib/services/appointment-service";
import { TherapistService } from "@/lib/services/therapist-service";
import { getUserTimezone } from "@/lib/utils/timezone-utils";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import type {
  EnhancedAvailableSlot,
  SessionType,
  TherapistProfile,
  BookingRequest,
} from "@/types/database";

interface BookingConfirmationProps {
  timeSlot: EnhancedAvailableSlot;
  sessionType: SessionType;
  duration: number;
  therapistId: string;
  onBack?: () => void;
  onProceedToPayment?: (notes: string) => void;
  onBookingComplete?: (appointmentId: string) => void;
  clientTimezone?: string;
}

export function BookingConfirmation({
  timeSlot,
  sessionType,
  duration,
  therapistId,
  onBack,
  onProceedToPayment,
  onBookingComplete,
  clientTimezone,
}: BookingConfirmationProps) {
  const [therapist, setTherapist] = useState<TherapistProfile | null>(null);
  const [clientNotes, setClientNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const userTimezone = clientTimezone || getUserTimezone();

  useEffect(() => {
    loadTherapistInfo();
  }, [therapistId]);

  const loadTherapistInfo = async () => {
    try {
      setLoading(true);
      const therapistProfile = await TherapistService.getProfile(therapistId);
      setTherapist(therapistProfile);
    } catch (err) {
      console.error("Failed to load therapist info:", err);
      setError("Failed to load therapist information");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!user || !therapist) return;

    setError(null);

    // Call the payment handler with notes
    onProceedToPayment?.(clientNotes.trim());
  };

  // Keep the old booking submission handler for backward compatibility
  const handleBookingSubmit = async () => {
    if (!user || !therapist) return;

    try {
      setSubmitting(true);
      setError(null);

      const bookingRequest: BookingRequest = {
        therapistId,
        clientId: user.uid,
        timeSlotId: timeSlot.timeSlotId,
        date: timeSlot.date,
        duration,
        sessionType,
        clientNotes: clientNotes.trim() || undefined,
      };

      const result = await AppointmentService.createAppointment(bookingRequest);

      if (result.success && result.appointmentId) {
        setSuccess(true);
        toast.success(
          "Booking Confirmed!",
          "Your appointment has been scheduled successfully."
        );

        // Wait a moment before calling completion handler
        setTimeout(() => {
          onBookingComplete?.(result.appointmentId!);
        }, 2000);
      } else {
        throw new Error(
          result.error ||
            result.conflicts?.[0]?.message ||
            "Failed to create booking"
        );
      }
    } catch (err) {
      console.error("Failed to create booking:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create booking. Please try again.";
      setError(errorMessage);
      toast.error("Booking Failed", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatSessionTime = () => {
    const startTime = new Date(
      `${timeSlot.localDate}T${timeSlot.startTime}:00`
    );
    const endTime = addMinutes(startTime, duration);

    return {
      date: formatInTimeZone(startTime, userTimezone, "EEEE, MMMM d, yyyy"),
      time: `${formatInTimeZone(
        startTime,
        userTimezone,
        "h:mm a"
      )} - ${formatInTimeZone(endTime, userTimezone, "h:mm a")}`,
      timezone: userTimezone,
    };
  };

  const getSessionTypeInfo = () => {
    const sessionTypes = {
      individual: {
        label: "Individual Session",
        icon: User,
        description: "One-on-one therapy session",
      },
      group: {
        label: "Group Session",
        icon: Users,
        description: "Group therapy session",
      },
      consultation: {
        label: "Initial Consultation",
        icon: MessageSquare,
        description: "First-time consultation",
      },
      follow_up: {
        label: "Follow-up Session",
        icon: MessageSquare,
        description: "Follow-up appointment",
      },
    };
    return sessionTypes[sessionType] || sessionTypes.individual;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-2">Loading booking details...</span>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
          <p className="text-muted-foreground mb-4">
            Your appointment has been scheduled successfully. You will receive a
            confirmation email shortly.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatSessionTime().date}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{formatSessionTime().time}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sessionTime = formatSessionTime();
  const sessionInfo = getSessionTypeInfo();
  const SessionIcon = sessionInfo.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Confirm Your Booking
          </CardTitle>
          {onBack && (
            <Button variant="outline" onClick={onBack} disabled={submitting}>
              Back
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Therapist Information */}
        {therapist && (
          <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={therapist.id} />
              <AvatarFallback>
                {therapist.id?.[0]?.toUpperCase() || "T"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold">Dr. {therapist.id}</h4>
              <p className="text-sm text-muted-foreground">
                {therapist.credentials?.specializations?.join(", ") ||
                  "Licensed Therapist"}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>
                  {therapist.practice?.yearsExperience || 0} years experience
                </span>
                <span>•</span>
                <span>
                  {therapist.practice?.sessionTypes?.length || 0} session types
                  available
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Session Details */}
        <div className="space-y-4">
          <h4 className="font-semibold">Session Details</h4>

          <div className="grid gap-4">
            {/* Date & Time */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{sessionTime.date}</div>
                <div className="text-sm text-muted-foreground">
                  {sessionTime.time}
                </div>
              </div>
            </div>

            {/* Session Type */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <SessionIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{sessionInfo.label}</div>
                <div className="text-sm text-muted-foreground">
                  {duration} minutes • {sessionInfo.description}
                </div>
              </div>
            </div>

            {/* Timezone */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Time Zone</div>
                <div className="text-sm text-muted-foreground">
                  {sessionTime.timezone}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Notes for Your Therapist (Optional)
          </label>
          <Textarea
            placeholder="Share anything you'd like your therapist to know about this session..."
            value={clientNotes}
            onChange={(e) => setClientNotes(e.target.value)}
            rows={3}
            disabled={submitting}
          />
          <p className="text-xs text-muted-foreground">
            These notes will be shared with your therapist before the session.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Booking Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={
              onProceedToPayment ? handleProceedToPayment : handleBookingSubmit
            }
            disabled={submitting || !user}
            className="w-full"
            size="lg"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Confirming Booking...
              </>
            ) : onProceedToPayment ? (
              "Proceed to Payment"
            ) : (
              "Confirm Booking"
            )}
          </Button>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {onProceedToPayment
                ? "You'll be taken to secure payment to complete your booking."
                : "By confirming, you agree to our terms of service and cancellation policy."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
