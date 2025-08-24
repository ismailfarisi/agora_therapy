"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, CreditCard, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/hooks/useAuth";

export interface BookingDetails {
  therapistId: string;
  therapistName: string;
  therapistImage?: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  duration: number;
  sessionType: "individual" | "group" | "consultation" | "follow_up";
  price: number;
  currency: string;
  clientNotes?: string;
  therapyType: string;
}

interface PaymentStepProps {
  bookingDetails: BookingDetails;
  onBack: () => void;
  onPaymentSuccess: (sessionId: string) => void;
  onPaymentError: (error: string) => void;
}

export function PaymentStep({
  bookingDetails,
  onBack,
  onPaymentSuccess,
  onPaymentError,
}: PaymentStepProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price / 100);
  };

  const formatSessionType = (type: string) => {
    switch (type) {
      case "individual":
        return "Individual Session";
      case "group":
        return "Group Session";
      case "consultation":
        return "Initial Consultation";
      case "follow_up":
        return "Follow-up Session";
      default:
        return type;
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Check if user is authenticated
      if (!user) {
        setError("You must be logged in to make a payment");
        setIsProcessing(false);
        return;
      }

      // Get Firebase ID token
      let token: string;
      try {
        token = await user.getIdToken();
      } catch (tokenError) {
        console.error("Failed to get ID token:", tokenError);
        setError("Authentication error. Please try logging in again.");
        setIsProcessing(false);
        return;
      }

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          therapistId: bookingDetails.therapistId,
          therapistName: bookingDetails.therapistName,
          therapistEmail: "therapist@example.com", // This should come from therapist data
          appointmentDate: format(bookingDetails.appointmentDate, "yyyy-MM-dd"),
          appointmentTime: bookingDetails.startTime,
          duration: bookingDetails.duration,
          amount: Math.max(bookingDetails.price / 100, 1), // Ensure minimum $1 for testing
          currency: bookingDetails.currency,
          clientName: "Client Name", // This should come from user data
          clientEmail: "client@example.com", // This should come from user data
          notes: bookingDetails.clientNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const { sessionId, url } = await response.json();

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        onPaymentSuccess(sessionId);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Therapist Info */}
          <div className="flex items-center gap-3">
            {bookingDetails.therapistImage && (
              <img
                src={bookingDetails.therapistImage}
                alt={bookingDetails.therapistName}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold">{bookingDetails.therapistName}</h3>
              <p className="text-sm text-muted-foreground">
                {bookingDetails.therapyType}
              </p>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(bookingDetails.appointmentDate, "EEEE, MMMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {bookingDetails.startTime} - {bookingDetails.endTime}
              </span>
            </div>
          </div>

          {/* Session Type and Duration */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {formatSessionType(bookingDetails.sessionType)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {bookingDetails.duration} minutes
            </span>
          </div>

          {/* Client Notes */}
          {bookingDetails.clientNotes && (
            <div>
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {bookingDetails.clientNotes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Session Fee</span>
            <span className="font-semibold">
              {formatPrice(bookingDetails.price, bookingDetails.currency)}
            </span>
          </div>
          <hr />
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total</span>
            <span>
              {formatPrice(bookingDetails.price, bookingDetails.currency)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1"
        >
          Back to Details
        </Button>
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="flex-1"
          aria-label="Proceed to secure payment"
        >
          {isProcessing ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Securely
            </>
          )}
        </Button>
      </div>

      {/* Security Notice */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          🔒 Your payment is secured by Stripe. We never store your card
          details.
        </p>
      </div>
    </div>
  );
}
