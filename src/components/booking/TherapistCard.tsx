/**
 * TherapistCard Component
 * Displays therapist information in a card format for browsing and selection
 */

"use client";

import { useState } from "react";
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
import { TherapistProfile } from "@/types/database";
import { formatInTimezone, getUserTimezone } from "@/lib/utils/timezone-utils";

interface TherapistCardProps {
  therapist: TherapistProfile;
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
  userDisplayName,
  showAvailabilityPreview = true,
  nextAvailableSlot,
  onBookNow,
  onViewProfile,
  className = "",
}: TherapistCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
                onClick={() => setIsExpanded(!isExpanded)}
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

        {/* Next Available Slot */}
        {showAvailabilityPreview && (
          <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg">
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 text-primary mr-2" />
              <span className="text-muted-foreground">Next available:</span>
            </div>
            <div className="text-sm font-medium">{formatNextAvailable()}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onViewProfile?.(therapist.id)}
          >
            View Profile
          </Button>
          <Button
            className="flex-1"
            onClick={() => onBookNow?.(therapist.id)}
            disabled={!nextAvailableSlot}
          >
            {nextAvailableSlot ? "Book Now" : "No Availability"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
