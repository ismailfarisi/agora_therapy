"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  CreditCard,
  HelpCircle,
  Mail,
  Phone,
  Clock,
  User,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { BookingDetails } from "./PaymentStep";

interface PaymentErrorProps {
  error: {
    type:
      | "card_declined"
      | "insufficient_funds"
      | "expired_card"
      | "network_error"
      | "generic"
      | "timeout";
    message: string;
    code?: string;
  };
  bookingDetails: BookingDetails;
  onRetryPayment: () => void;
  onBackToPayment: () => void;
  onStartOver: () => void;
  onContactSupport: () => void;
}

export function PaymentError({
  error,
  bookingDetails,
  onRetryPayment,
  onBackToPayment,
  onStartOver,
  onContactSupport,
}: PaymentErrorProps) {
  const getErrorIcon = () => {
    switch (error.type) {
      case "card_declined":
      case "insufficient_funds":
      case "expired_card":
        return <CreditCard className="h-12 w-12 text-red-600" />;
      case "network_error":
      case "timeout":
        return <RefreshCw className="h-12 w-12 text-orange-600" />;
      default:
        return <AlertCircle className="h-12 w-12 text-red-600" />;
    }
  };

  const getErrorTitle = () => {
    switch (error.type) {
      case "card_declined":
        return "Payment Declined";
      case "insufficient_funds":
        return "Insufficient Funds";
      case "expired_card":
        return "Card Expired";
      case "network_error":
        return "Connection Error";
      case "timeout":
        return "Payment Timeout";
      default:
        return "Payment Failed";
    }
  };

  const getErrorDescription = () => {
    switch (error.type) {
      case "card_declined":
        return "Your card was declined. Please check your card details or try a different payment method.";
      case "insufficient_funds":
        return "There are insufficient funds on your card. Please check your balance or use a different card.";
      case "expired_card":
        return "Your card has expired. Please use a different card or update your card details.";
      case "network_error":
        return "We encountered a network error. Please check your internet connection and try again.";
      case "timeout":
        return "The payment request timed out. Please try again.";
      default:
        return "We encountered an unexpected error while processing your payment. Please try again.";
    }
  };

  const getSuggestedActions = () => {
    switch (error.type) {
      case "card_declined":
        return [
          "Verify your card details are correct",
          "Check if your card has international payments enabled",
          "Contact your bank to authorize the transaction",
          "Try a different payment method",
        ];
      case "insufficient_funds":
        return [
          "Check your account balance",
          "Add funds to your account",
          "Use a different card",
          "Try a different payment method",
        ];
      case "expired_card":
        return [
          "Use a card that hasn&apos;t expired",
          "Update your card information",
          "Contact your bank for a replacement card",
        ];
      case "network_error":
      case "timeout":
        return [
          "Check your internet connection",
          "Try again in a few moments",
          "Refresh the page and retry",
          "Contact support if the problem persists",
        ];
      default:
        return [
          "Try again in a few moments",
          "Use a different payment method",
          "Clear your browser cache",
          "Contact support if the issue persists",
        ];
    }
  };

  const canRetryImmediately = ["network_error", "timeout", "generic"].includes(
    error.type
  );

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Error Header */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {getErrorIcon()}
            <div>
              <h1 className="text-2xl font-bold text-red-900">
                {getErrorTitle()}
              </h1>
              <p className="text-red-700">{getErrorDescription()}</p>
              {error.code && (
                <p className="text-sm text-red-600 mt-2">
                  Error Code: {error.code}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details Reminder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Your Session is Still Available
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {bookingDetails.therapistImage && (
              <img
                src={bookingDetails.therapistImage}
                alt={bookingDetails.therapistName}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold">{bookingDetails.therapistName}</h3>
              <p className="text-sm text-muted-foreground">
                {bookingDetails.therapyType}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(bookingDetails.appointmentDate, "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{bookingDetails.startTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {formatSessionType(bookingDetails.sessionType)}
              </Badge>
            </div>
          </div>

          <div className="text-right">
            <span className="text-lg font-semibold">
              {formatPrice(bookingDetails.price, bookingDetails.currency)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            What You Can Do
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {getSuggestedActions().map((action, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {canRetryImmediately && (
            <Button
              onClick={onRetryPayment}
              className="flex-1"
              aria-label="Retry payment"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onBackToPayment}
            className="flex-1"
            aria-label="Back to payment options"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Try Different Payment
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onStartOver}
            className="flex-1"
            aria-label="Start booking process over"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Start Over
          </Button>
          <Button
            variant="outline"
            onClick={onContactSupport}
            className="flex-1"
            aria-label="Contact customer support"
          >
            <Mail className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </div>
      </div>

      {/* Support Information */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Need Additional Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium">Email Support</p>
              <a
                href="mailto:support@therapyplatform.com"
                className="text-sm text-blue-600 hover:underline"
              >
                support@therapyplatform.com
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">Phone Support</p>
              <a
                href="tel:+1-555-THERAPY"
                className="text-sm text-green-600 hover:underline"
              >
                +1 (555) THERAPY
              </a>
              <p className="text-xs text-muted-foreground">Available 24/7</p>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Include your booking reference and error code when contacting
              support for faster assistance.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="text-center text-xs text-muted-foreground">
        <p>
          🔒 All payment information is securely processed. We never store your
          card details.
        </p>
      </div>
    </div>
  );
}
