/**
 * TherapistCard Component
 * Displays therapist information in a card format for browsing and selection
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Video,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TherapistProfile,
  TherapistAvailability,
  TimeSlot,
} from "@/types/database";
import { formatInTimezone, getUserTimezone } from "@/lib/utils/timezone-utils";
import { getDayNames } from "@/lib/utils/calendar-utils";

interface TherapistCardProps {
  therapist: TherapistProfile;
  availability?: TherapistAvailability[];
  timeSlots?: TimeSlot[];
  userDisplayName?: string;
  showAvailabilityPreview?: boolean;
  nextAvailableSlot?: {
    date: Date;
    displayTime: string;
  };
  onBookNow?: (therapistId: string) => void;
  onViewProfile?: (therapistId: string) => void;
  className?: string;
}

export default function TherapistCard({
  therapist,
  availability = [],
  timeSlots = [],
  userDisplayName,
  showAvailabilityPreview = true,
  nextAvailableSlot,
  onBookNow,
  onViewProfile,
  className = "",
}: TherapistCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const dayNames = getDayNames("short"); // ['Sun', 'Mon', 'Tue', ...]

  // Get availability summary
  const getAvailabilitySummary = () => {
    if (!availability || availability.length === 0) {
      return {
        status: "not-available",
        message: "Availability not set",
        hasAvailability: false,
      };
    }

    // Group availability by day
    const availabilityByDay = availability.reduce((acc, avail) => {
      if (!acc[avail.dayOfWeek]) {
        acc[avail.dayOfWeek] = [];
      }
      acc[avail.dayOfWeek].push(avail);
      return acc;
    }, {} as Record<number, TherapistAvailability[]>);

    const availableDays = Object.keys(availabilityByDay).map(Number).sort();

    if (availableDays.length === 0) {
      return {
        status: "not-available",
        message: "No availability",
        hasAvailability: false,
      };
    }

    return {
      status: "available",
      message: `Available ${availableDays.length} day${
        availableDays.length > 1 ? "s" : ""
      }/week`,
      hasAvailability: true,
      days: availableDays.slice(0, 3).map((dayOfWeek) => ({
        day: dayNames[dayOfWeek],
        count: availabilityByDay[dayOfWeek].length,
      })),
    };
  };

  const availabilitySummary = getAvailabilitySummary();

  const getTherapistInitials = () => {
    if (userDisplayName) {
      return userDisplayName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return therapist.id.slice(0, 2).toUpperCase();
  };

  const getTherapistName = () => {
    return userDisplayName || `Therapist ${therapist.id.slice(-4)}`;
  };

  const formatNextAvailable = () => {
    if (!nextAvailableSlot) return "No availability";

    const today = new Date();
    const slotDate = nextAvailableSlot.date;

    // Check if it's today, tomorrow, or another day
    const isToday = slotDate.toDateString() === today.toDateString();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = slotDate.toDateString() === tomorrow.toDateString();

    let dateText: string;
    if (isToday) {
      dateText = "Today";
    } else if (isTomorrow) {
      dateText = "Tomorrow";
    } else {
      dateText = slotDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    return `${dateText} at ${nextAvailableSlot.displayTime}`;
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case "individual":
        return <User className="w-3 h-3" />;
      case "couples":
        return <User className="w-3 h-3" />; // Could use a couples icon
      case "family":
        return <User className="w-3 h-3" />; // Could use a family icon
      case "group":
        return <User className="w-3 h-3" />; // Could use a group icon
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const formatPrice = () => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: therapist.practice.currency,
    }).format(therapist.practice.hourlyRate);
  };

  return (
    <Link href={`/client/therapists/${therapist.id}`} className="block">
      <Card className={`hover:shadow-md transition-shadow ${className}`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={""} alt={getTherapistName()} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getTherapistInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{getTherapistName()}</h3>
                {therapist.verification.isVerified && (
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    <span>Verified Therapist</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                {formatPrice()}/hr
              </div>
              <div className="text-sm text-muted-foreground">
                {therapist.practice.yearsExperience} years exp.
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Specializations */}
          <div>
            <div className="flex flex-wrap gap-1 mb-2">
              {therapist.credentials.specializations
                .slice(0, 3)
                .map((spec, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              {therapist.credentials.specializations.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{therapist.credentials.specializations.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Bio Preview */}
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isExpanded
                ? therapist.practice.bio
                : `${therapist.practice.bio.slice(0, 120)}...`}
              {therapist.practice.bio.length > 120 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsExpanded(!isExpanded);
                  }}
                  className="text-primary hover:underline ml-1 text-sm"
                >
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </p>
          </div>

          {/* Session Types */}
          <div className="flex flex-wrap gap-2">
            {therapist.practice.sessionTypes.map((type, index) => (
              <div
                key={index}
                className="flex items-center text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md"
              >
                {getSessionTypeIcon(type)}
                <span className="ml-1 capitalize">{type}</span>
              </div>
            ))}
          </div>

          {/* Languages */}
          {therapist.practice.languages.length > 0 && (
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="font-medium mr-2">Languages:</span>
              <span>{therapist.practice.languages.join(", ")}</span>
            </div>
          )}

          {/* Availability Display */}
          {showAvailabilityPreview && (
            <div className="py-3 px-4 bg-muted/30 rounded-lg space-y-2">
              <div className="flex items-center text-sm">
                <Calendar
                  className={`w-4 h-4 mr-2 ${
                    availabilitySummary.hasAvailability
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                />
                <span
                  className={
                    availabilitySummary.hasAvailability
                      ? "text-green-600 font-medium"
                      : "text-gray-500"
                  }
                >
                  {availabilitySummary.message}
                </span>
              </div>

              {availabilitySummary.hasAvailability &&
                availabilitySummary.days && (
                  <div className="flex gap-2 text-xs text-muted-foreground ml-6">
                    {availabilitySummary.days.map(({ day, count }) => (
                      <Badge
                        key={day}
                        variant="outline"
                        className="text-xs py-0"
                      >
                        {day}: {count} slot{count > 1 ? "s" : ""}
                      </Badge>
                    ))}
                  </div>
                )}

              {nextAvailableSlot && (
                <div className="text-sm font-medium ml-6 text-primary">
                  Next: {formatNextAvailable()}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                onBookNow?.(therapist.id);
              }}
              disabled={!availabilitySummary.hasAvailability}
            >
              {availabilitySummary.hasAvailability
                ? "Book Now"
                : "Not Available"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
