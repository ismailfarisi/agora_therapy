"use client";

import React, { useState, useEffect } from "react";
import { format, parseISO, addMinutes } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Clock, Users, MapPin } from "lucide-react";
import { AvailabilityService } from "@/lib/services/availability-service";
import { TimeSlotService } from "@/lib/services/timeslot-service";
import { getUserTimezone } from "@/lib/utils/timezone-utils";
import type {
  TimeSlot,
  SessionType,
  EnhancedAvailableSlot,
} from "@/types/database";

interface TimeSlotSelectorProps {
  therapistId: string;
  selectedDate: Date;
  onSlotSelect: (
    slot: EnhancedAvailableSlot,
    sessionType: SessionType,
    duration: number
  ) => void;
  onBack?: () => void;
  clientTimezone?: string;
}

const SESSION_TYPES: {
  value: SessionType;
  label: string;
  duration: number;
  maxClients: number;
}[] = [
  {
    value: "individual",
    label: "Individual Session",
    duration: 50,
    maxClients: 1,
  },
  {
    value: "consultation",
    label: "Initial Consultation",
    duration: 30,
    maxClients: 1,
  },
  {
    value: "follow_up",
    label: "Follow-up Session",
    duration: 25,
    maxClients: 1,
  },
  { value: "group", label: "Group Session", duration: 90, maxClients: 8 },
];

export function TimeSlotSelector({
  therapistId,
  selectedDate,
  onSlotSelect,
  onBack,
  clientTimezone,
}: TimeSlotSelectorProps) {
  const [availableSlots, setAvailableSlots] = useState<EnhancedAvailableSlot[]>(
    []
  );
  const [allTimeSlots, setAllTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionType, setSelectedSessionType] =
    useState<SessionType>("individual");
  const [selectedDuration, setSelectedDuration] = useState(50);
  const [error, setError] = useState<string | null>(null);

  const userTimezone = clientTimezone || getUserTimezone();

  useEffect(() => {
    loadTimeSlots();
  }, []);

  useEffect(() => {
    if (allTimeSlots.length > 0) {
      loadAvailableSlots();
    }
  }, [therapistId, selectedDate, selectedSessionType, allTimeSlots]);

  const loadTimeSlots = async () => {
    try {
      const timeSlots = await TimeSlotService.getTimeSlots();
      setAllTimeSlots(timeSlots);
    } catch (err) {
      console.error("Failed to load time slots:", err);
      setError("Failed to load time slots");
    }
  };

  const loadAvailableSlots = async () => {
    try {
      setLoading(true);
      setError(null);

      const sessionTypeConfig = SESSION_TYPES.find(
        (type) => type.value === selectedSessionType
      );
      if (!sessionTypeConfig) return;

      // Get availability for the selected date
      const availability = await AvailabilityService.getAvailabilityForDate(
        therapistId,
        selectedDate,
        userTimezone, // therapist timezone (assuming same as client for now)
        userTimezone // client timezone
      );

      // Convert effective slots to enhanced available slots
      const enhancedSlots: EnhancedAvailableSlot[] = availability.effectiveSlots
        .map((timeSlotId) => {
          const timeSlot = allTimeSlots.find((slot) => slot.id === timeSlotId);
          if (!timeSlot) return null;

          return {
            timeSlotId: timeSlot.id,
            date: selectedDate,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            duration: timeSlot.duration,
            price: 100, // Default price - should come from therapist profile
            currency: "USD",
            isBooked: false,
            therapistTimezone: userTimezone,
            localStartTime: timeSlot.startTime,
            localEndTime: timeSlot.endTime,
            localDate: format(selectedDate, "yyyy-MM-dd"),
            displayTime: `${timeSlot.startTime} - ${timeSlot.endTime}`,
          };
        })
        .filter((slot): slot is EnhancedAvailableSlot => slot !== null);

      setAvailableSlots(enhancedSlots);
    } catch (err) {
      console.error("Failed to load available slots:", err);
      setError("Failed to load available time slots. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSessionTypeChange = (sessionType: SessionType) => {
    const config = SESSION_TYPES.find((type) => type.value === sessionType);
    if (config) {
      setSelectedSessionType(sessionType);
      setSelectedDuration(config.duration);
    }
  };

  const handleSlotClick = (slot: EnhancedAvailableSlot) => {
    onSlotSelect(slot, selectedSessionType, selectedDuration);
  };

  const formatSlotTime = (slot: EnhancedAvailableSlot) => {
    const startTime = new Date(`${slot.localDate}T${slot.startTime}:00`);
    const endTime = addMinutes(startTime, selectedDuration);

    return `${formatInTimeZone(
      startTime,
      userTimezone,
      "h:mm a"
    )} - ${formatInTimeZone(endTime, userTimezone, "h:mm a")}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-2">Loading available time slots...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Select Time Slot
          </CardTitle>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Back to Calendar
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          Times shown in: {userTimezone}
        </div>
        <div className="text-sm font-medium">
          {format(selectedDate, "EEEE, MMMM d, yyyy")}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Session Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Session Type</label>
          <Select
            value={selectedSessionType}
            onValueChange={handleSessionTypeChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SESSION_TYPES.map((sessionType) => (
                <SelectItem key={sessionType.value} value={sessionType.value}>
                  <div className="flex items-center gap-2">
                    <span>{sessionType.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {sessionType.duration}min
                    </Badge>
                    {sessionType.maxClients > 1 && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {sessionType.maxClients} max
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAvailableSlots}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Available Slots */}
        {availableSlots.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Available Time Slots</h4>
            <div className="grid gap-2">
              {availableSlots.map((slot) => {
                const sessionTypeConfig = SESSION_TYPES.find(
                  (type) => type.value === selectedSessionType
                );
                return (
                  <Button
                    key={slot.timeSlotId}
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => handleSlotClick(slot)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">
                            {formatSlotTime(slot)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {selectedDuration} minutes • {selectedSessionType}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {sessionTypeConfig &&
                          sessionTypeConfig.maxClients > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              1/{sessionTypeConfig.maxClients}
                            </Badge>
                          )}
                        <Badge variant="secondary">Available</Badge>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium mb-2">No Available Slots</h4>
            <p className="text-sm text-muted-foreground mb-4">
              No time slots are available for the selected date and session
              type.
            </p>
            <div className="space-y-2">
              <Button variant="outline" onClick={loadAvailableSlots}>
                Refresh
              </Button>
              {onBack && (
                <Button variant="ghost" onClick={onBack}>
                  Choose Different Date
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
