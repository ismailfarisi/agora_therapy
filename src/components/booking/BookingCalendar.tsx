"use client";

import React, { useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isBefore,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRealtimeAvailability } from "@/lib/hooks/useRealtimeAvailability";
import { formatInTimezone, getUserTimezone } from "@/lib/utils/timezone-utils";
import { TherapistProfile, EnhancedAvailableSlot } from "@/types/database";
import { Calendar, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingCalendarProps {
  therapist: TherapistProfile;
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  clientTimezone?: string;
  minBookingAdvanceHours?: number;
}

export function BookingCalendar({
  therapist,
  selectedDate,
  onDateSelect,
  clientTimezone = getUserTimezone(),
  minBookingAdvanceHours = 24,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { availability, isLoading, error, retry, getAvailableSlots } =
    useRealtimeAvailability({
      therapistId: therapist.id,
      enableRealtime: true,
      includeOverrides: true,
    });

  // Calculate availability count for each date in the current month
  const availabilityByDate = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const availabilityMap = new Map<string, number>();

    // Check each day in the current month
    const daysInCurrentMonth = eachDayOfInterval({
      start: monthStart,
      end: monthEnd,
    });

    daysInCurrentMonth.forEach((date) => {
      const availableSlotIds = getAvailableSlots(date);
      const dateKey = format(date, "yyyy-MM-dd");
      availabilityMap.set(dateKey, availableSlotIds.length);
    });

    return availabilityMap;
  }, [availability, currentMonth, getAvailableSlots]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const isDateAvailable = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return (availabilityByDate.get(dateKey) || 0) > 0;
  };

  const isDateBookable = (date: Date) => {
    const now = new Date();
    const minBookingTime = new Date(
      now.getTime() + minBookingAdvanceHours * 60 * 60 * 1000
    );
    return !isBefore(date, minBookingTime);
  };

  const handleDateClick = (date: Date) => {
    if (isDateAvailable(date) && isDateBookable(date)) {
      onDateSelect(date);
    }
  };

  const getDayContent = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const slotCount = availabilityByDate.get(dateKey) || 0;
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const isAvailable = isDateAvailable(date);
    const isBookable = isDateBookable(date);
    const isTodayDate = isToday(date);

    return (
      <Button
        variant={isSelected ? "default" : "ghost"}
        size="sm"
        onClick={() => handleDateClick(date)}
        disabled={!isAvailable || !isBookable}
        className={cn(
          "h-12 w-12 p-0 flex flex-col items-center justify-center relative",
          isTodayDate && "ring-2 ring-primary ring-offset-2",
          isAvailable && isBookable && "hover:bg-accent",
          !isBookable && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "text-sm",
            isSelected && "text-primary-foreground",
            !isAvailable && "text-muted-foreground"
          )}
        >
          {format(date, "d")}
        </span>
        {isAvailable && (
          <Badge
            variant="secondary"
            className={cn(
              "absolute -bottom-1 text-xs px-1 py-0 h-4 min-w-0",
              isSelected && "bg-primary-foreground text-primary"
            )}
          >
            {slotCount}
          </Badge>
        )}
      </Button>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load calendar.
              <Button variant="link" onClick={retry} className="p-0 ml-1">
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Select Date
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose a date to see available time slots
        </p>
      </CardHeader>
      <CardContent>
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Week Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground p-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((date) => (
            <div key={date.toISOString()} className="flex justify-center">
              {getDayContent(date)}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
              3
            </Badge>
            <span>Number shows available time slots</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary rounded"></div>
            <span>Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
