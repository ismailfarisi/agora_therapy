"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  Video,
  Phone,
  MapPin,
  Copy,
  CalendarPlus,
  Mail,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export interface PaymentSuccessData {
  bookingReference: string;
  therapistName: string;
  therapistEmail?: string;
  therapistImage?: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  duration: number;
  sessionType: "individual" | "group" | "consultation" | "follow_up";
  therapyType: string;
  amount: number;
  currency: string;
  meetingLink?: string;
  address?: string;
  phoneNumber?: string;
}

interface PaymentSuccessProps {
  data: PaymentSuccessData;
  onViewAppointments: () => void;
  onBookAnother: () => void;
}

export function PaymentSuccess({
  data,
  onViewAppointments,
  onBookAnother,
}: PaymentSuccessProps) {
  const [copied, setCopied] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price / 100);
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case "individual":
        return <User className="h-4 w-4" />;
      case "group":
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const generateCalendarEvent = () => {
    const startDateTime = new Date(data.appointmentDate);
    const [startHour, startMinute] = data.startTime.split(":");
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + data.duration);

    const formatDateTime = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const title = encodeURIComponent(
      `Therapy Session with ${data.therapistName}`
    );
    const details = encodeURIComponent(
      `Therapy session - ${formatSessionType(data.sessionType)}\n` +
        `Booking Reference: ${data.bookingReference}\n` +
        (data.meetingLink ? `Meeting Link: ${data.meetingLink}\n` : "") +
        (data.address ? `Location: ${data.address}\n` : "") +
        (data.phoneNumber ? `Phone: ${data.phoneNumber}\n` : "")
    );

    const location = encodeURIComponent(
      data.meetingLink ? "Online Video Call" : data.address || "Therapy Session"
    );

    const startTime = formatDateTime(startDateTime);
    const endTime = formatDateTime(endDateTime);

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;

    window.open(googleCalendarUrl, "_blank");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <div>
              <h1 className="text-2xl font-bold text-green-900">
                Payment Successful!
              </h1>
              <p className="text-green-700">
                Your therapy session has been booked
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg inline-block">
              <p className="text-sm font-medium text-muted-foreground">
                Booking Reference
              </p>
              <div className="flex items-center gap-2">
                <code className="text-lg font-mono">
                  {data.bookingReference}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(data.bookingReference)}
                  aria-label="Copy booking reference"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 mt-1">
                  Copied to clipboard!
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Therapist Info */}
          <div className="flex items-center gap-3">
            {data.therapistImage && (
              <img
                src={data.therapistImage}
                alt={data.therapistName}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold">{data.therapistName}</h3>
              <p className="text-sm text-muted-foreground">
                {data.therapyType}
              </p>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(data.appointmentDate, "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {data.startTime} - {data.endTime} ({data.duration} min)
              </span>
            </div>
          </div>

          {/* Session Type */}
          <div className="flex items-center gap-2">
            {getSessionTypeIcon(data.sessionType)}
            <Badge variant="secondary">
              {formatSessionType(data.sessionType)}
            </Badge>
          </div>

          {/* Session Access Information */}
          {data.meetingLink && (
            <Alert>
              <Video className="h-4 w-4" />
              <AlertDescription>
                <strong>Video Meeting Link:</strong>
                <br />
                <a
                  href={data.meetingLink}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {data.meetingLink}
                </a>
              </AlertDescription>
            </Alert>
          )}

          {data.phoneNumber && (
            <Alert>
              <Phone className="h-4 w-4" />
              <AlertDescription>
                <strong>Phone Number:</strong>
                <br />
                <a
                  href={`tel:${data.phoneNumber}`}
                  className="text-blue-600 hover:underline"
                >
                  {data.phoneNumber}
                </a>
              </AlertDescription>
            </Alert>
          )}

          {data.address && (
            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                <strong>Location:</strong>
                <br />
                {data.address}
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Info */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span className="font-semibold">
                {formatPrice(data.amount, data.currency)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CalendarPlus className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium">Add to Calendar</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Don&apos;t forget your appointment - add it to your calendar
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={generateCalendarEvent}
                className="text-blue-600"
              >
                <CalendarPlus className="h-4 w-4 mr-2" />
                Add to Google Calendar
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium">Confirmation Email</h4>
              <p className="text-sm text-muted-foreground">
                A confirmation email with all details has been sent to your
                email address
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-medium">Pre-Session Preparation</h4>
              <p className="text-sm text-muted-foreground">
                Consider jotting down any topics or questions you&apos;d like to
                discuss
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          onClick={onViewAppointments}
          className="flex-1"
          aria-label="View all appointments"
        >
          <Calendar className="mr-2 h-4 w-4" />
          View My Appointments
        </Button>
        <Button
          onClick={onBookAnother}
          className="flex-1"
          aria-label="Book another session"
        >
          Book Another Session
        </Button>
      </div>

      {/* Support Information */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need help or have questions? Contact our support team at{" "}
              <a
                href="mailto:support@therapyplatform.com"
                className="text-blue-600 hover:underline"
              >
                support@therapyplatform.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
