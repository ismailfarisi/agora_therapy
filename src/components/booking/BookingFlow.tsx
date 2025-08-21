"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Calendar, Clock, User, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingCalendar } from "./BookingCalendar";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { BookingConfirmation } from "./BookingConfirmation";
import {
  SessionType,
  TherapistProfile,
  BookingRequest,
} from "../../types/database";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { AppointmentService } from "@/lib/services/appointment-service";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";

interface BookingFlowProps {
  therapist: TherapistProfile;
  onBookingComplete?: (bookingId: string) => void;
  onCancel?: () => void;
  className?: string;
}

type BookingStep = "calendar" | "timeSlot" | "confirmation" | "success";

interface BookingState {
  selectedDate: Date | null;
  selectedSlot: {
    id: string;
    startTime: string;
    endTime: string;
    sessionTypes: SessionType[];
    timezone: string;
  } | null;
  selectedSessionType: SessionType | null;
  notes: string;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({
  therapist,
  onBookingComplete,
  onCancel,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>("calendar");
  const [bookingState, setBookingState] = useState<BookingState>({
    selectedDate: null,
    selectedSlot: null,
    selectedSessionType: null,
    notes: "",
  });
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add authentication and toast hooks
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDateSelect = useCallback((date: Date) => {
    setBookingState((prev) => ({
      ...prev,
      selectedDate: date,
      selectedSlot: null, // Reset slot when date changes
      selectedSessionType: null,
    }));
    setCurrentStep("timeSlot");
    setError(null);
  }, []);

  const handleSlotSelect = useCallback(
    (
      slot: {
        id: string;
        startTime: string;
        endTime: string;
        sessionTypes: SessionType[];
        timezone: string;
      },
      sessionType: SessionType
    ) => {
      setBookingState((prev) => ({
        ...prev,
        selectedSlot: slot,
        selectedSessionType: sessionType,
      }));
      setCurrentStep("confirmation");
      setError(null);
    },
    []
  );

  const handleBookingConfirm = useCallback(
    async (notes: string) => {
      console.log("[BookingFlow] Starting booking confirmation process");

      if (
        !bookingState.selectedDate ||
        !bookingState.selectedSlot ||
        !bookingState.selectedSessionType
      ) {
        const errorMsg = "Missing booking information";
        console.error("[BookingFlow] Validation failed:", errorMsg);
        setError(errorMsg);
        return;
      }

      if (!user) {
        const errorMsg = "User authentication required";
        console.error("[BookingFlow] Auth failed:", errorMsg);
        setError(errorMsg);
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        console.log("[BookingFlow] Creating booking request", {
          therapistId: therapist.id,
          clientId: user.uid,
          date: bookingState.selectedDate,
          timeSlotId: bookingState.selectedSlot.id,
          sessionType: bookingState.selectedSessionType,
          notes: notes.trim(),
        });

        // Create the booking request
        const bookingRequest: BookingRequest = {
          therapistId: therapist.id,
          clientId: user.uid,
          timeSlotId: bookingState.selectedSlot.id,
          date: bookingState.selectedDate,
          duration: 60, // Default duration - should be determined by session type
          sessionType: bookingState.selectedSessionType,
          clientNotes: notes.trim() || undefined,
        };

        console.log(
          "[BookingFlow] Calling AppointmentService.createAppointment"
        );
        const result = await AppointmentService.createAppointment(
          bookingRequest
        );

        if (result.success && result.appointmentId) {
          console.log(
            "[BookingFlow] Booking created successfully:",
            result.appointmentId
          );

          setBookingId(result.appointmentId);
          setBookingState((prev) => ({ ...prev, notes }));
          setCurrentStep("success");

          // Show success toast
          toast.success(
            "Booking Confirmed!",
            "Your appointment has been scheduled successfully."
          );

          if (onBookingComplete) {
            onBookingComplete(result.appointmentId);
          }
        } else {
          // Handle booking conflicts or errors
          const errorMsg =
            result.error ||
            result.conflicts?.[0]?.message ||
            "Failed to create booking";
          console.error("[BookingFlow] Booking failed:", { result, errorMsg });

          throw new Error(errorMsg);
        }
      } catch (err) {
        console.error("[BookingFlow] Booking creation failed:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create booking";
        setError(errorMessage);

        // Show error toast
        toast.error("Booking Failed", errorMessage);
      } finally {
        setIsSubmitting(false);
        console.log("[BookingFlow] Booking process completed");
      }
    },
    [bookingState, onBookingComplete, therapist.id, user, toast]
  );

  const handleBack = useCallback(() => {
    switch (currentStep) {
      case "timeSlot":
        setCurrentStep("calendar");
        break;
      case "confirmation":
        setCurrentStep("timeSlot");
        break;
      case "success":
        // Don't allow going back from success
        break;
      default:
        setCurrentStep("calendar");
    }
    setError(null);
  }, [currentStep]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  const getStepTitle = () => {
    switch (currentStep) {
      case "calendar":
        return "Select Date";
      case "timeSlot":
        return "Choose Time Slot";
      case "confirmation":
        return "Confirm Booking";
      case "success":
        return "Booking Confirmed";
      default:
        return "Book Appointment";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "calendar":
        return "Pick a date that works for you";
      case "timeSlot":
        return "Select an available time slot and session type";
      case "confirmation":
        return "Review your booking details and confirm";
      case "success":
        return "Your appointment has been successfully scheduled";
      default:
        return "";
    }
  };

  const formatBookingDetails = () => {
    if (!bookingState.selectedDate || !bookingState.selectedSlot) return "";

    const date = format(bookingState.selectedDate, "EEEE, MMMM d, yyyy");
    const startTime = bookingState.selectedSlot.startTime;
    const endTime = bookingState.selectedSlot.endTime;

    return `${date} at ${startTime} - ${endTime}`;
  };

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {currentStep !== "calendar" && currentStep !== "success" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
              <p className="text-gray-600 mt-1">{getStepDescription()}</p>
            </div>
          </div>

          {currentStep !== "success" && onCancel && (
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center space-x-4">
          {[
            { step: "calendar", icon: Calendar, label: "Date" },
            { step: "timeSlot", icon: Clock, label: "Time" },
            { step: "confirmation", icon: User, label: "Confirm" },
            { step: "success", icon: CheckCircle, label: "Done" },
          ].map(({ step, icon: Icon, label }, index) => {
            const isActive = currentStep === step;
            const isCompleted =
              ["calendar", "timeSlot", "confirmation", "success"].indexOf(
                currentStep
              ) > index;

            return (
              <div key={step} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    isActive
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : isCompleted
                      ? "border-green-600 bg-green-50 text-green-600"
                      : "border-gray-300 bg-gray-50 text-gray-400"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    "ml-2 text-sm font-medium",
                    isActive
                      ? "text-blue-600"
                      : isCompleted
                      ? "text-green-600"
                      : "text-gray-500"
                  )}
                >
                  {label}
                </span>
                {index < 3 && (
                  <div
                    className={cn(
                      "ml-4 w-12 h-0.5",
                      isCompleted ? "bg-green-600" : "bg-gray-300"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Booking Summary */}
        {(currentStep === "confirmation" || currentStep === "success") &&
          bookingState.selectedDate && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {formatBookingDetails()}
                </span>
                {bookingState.selectedSessionType && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full ml-2">
                    {bookingState.selectedSessionType}
                  </span>
                )}
              </div>
            </div>
          )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="min-h-[500px]">
        {currentStep === "calendar" && (
          <BookingCalendar
            therapist={therapist}
            onDateSelect={handleDateSelect}
          />
        )}

        {currentStep === "timeSlot" && bookingState.selectedDate && (
          <TimeSlotSelector
            therapistId={therapist.id}
            selectedDate={bookingState.selectedDate}
            onSlotSelect={(slot, sessionType, duration) => {
              handleSlotSelect(
                {
                  id: slot.timeSlotId,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  sessionTypes: [sessionType],
                  timezone: therapist.availability?.timezone || "UTC",
                },
                sessionType
              );
            }}
          />
        )}

        {currentStep === "confirmation" &&
          bookingState.selectedDate &&
          bookingState.selectedSlot && (
            <BookingConfirmation
              timeSlot={{
                timeSlotId: bookingState.selectedSlot.id,
                date: bookingState.selectedDate,
                startTime: bookingState.selectedSlot.startTime,
                endTime: bookingState.selectedSlot.endTime,
                duration: 60,
                price: therapist.practice?.hourlyRate || 0,
                currency: therapist.practice?.currency || "USD",
                isBooked: false,
                therapistTimezone: therapist.availability?.timezone || "UTC",
                localStartTime: bookingState.selectedSlot.startTime,
                localEndTime: bookingState.selectedSlot.endTime,
                localDate: format(bookingState.selectedDate, "yyyy-MM-dd"),
                displayTime: `${bookingState.selectedSlot.startTime} - ${bookingState.selectedSlot.endTime}`,
              }}
              sessionType={bookingState.selectedSessionType!}
              duration={60}
              therapistId={therapist.id}
              onBookingComplete={(appointmentId) => {
                if (onBookingComplete) {
                  onBookingComplete(appointmentId);
                }
              }}
              onBack={handleBack}
            />
          )}

        {currentStep === "success" && bookingId && (
          <div className="text-center space-y-6 py-12">
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-green-900">
                Booking Confirmed!
              </h3>
              <p className="text-gray-600">
                Your appointment has been successfully scheduled.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg max-w-md mx-auto">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-mono">{bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Therapist:</span>
                  <span>Dr. {therapist.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span>{formatBookingDetails()}</span>
                </div>
                {bookingState.selectedSessionType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Session Type:</span>
                    <span className="capitalize">
                      {bookingState.selectedSessionType}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                You will receive a confirmation email shortly with your
                appointment details.
              </p>

              <div className="flex justify-center space-x-3">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  size="sm"
                >
                  Print Details
                </Button>
                {onBookingComplete && (
                  <Button
                    onClick={() => onBookingComplete(bookingId)}
                    size="sm"
                  >
                    Done
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingFlow;
