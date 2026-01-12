/**
 * Availability Calendar Component
 * Visual calendar showing working hours, days off, and schedule overrides
 */

"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CalendarOff,
  Settings,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { ScheduleOverride } from "@/types/database";

interface TimeRange {
  start: string;
  end: string;
}

interface WeeklyHours {
  [dayOfWeek: number]: TimeRange[];
}

interface AvailabilityCalendarProps {
  weeklyHours: WeeklyHours;
  overrides: ScheduleOverride[];
  onDayClick?: (date: Date) => void;
  className?: string;
}

export function AvailabilityCalendar({
  weeklyHours,
  overrides,
  onDayClick,
  className,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const getOverrideForDate = (date: Date): ScheduleOverride | undefined => {
    return overrides.find((override) => {
      const overrideDate = override.date.toDate();
      return isSameDay(overrideDate, date);
    });
  };

  const getWorkingHoursForDate = (date: Date): TimeRange[] | null => {
    const dayOfWeek = getDay(date);
    const override = getOverrideForDate(date);

    // Check for override first
    if (override) {
      if (override.type === "day_off") {
        return null; // Day off
      }
      // For time_off or custom_hours, we'd need to convert affectedSlots to time ranges
      // For now, return null to indicate override exists
      return null;
    }

    // Return regular weekly hours
    return weeklyHours[dayOfWeek] || null;
  };

  const getDayStatus = (date: Date): {
    type: "working" | "day_off" | "override" | "not_working";
    label: string;
    color: string;
  } => {
    const override = getOverrideForDate(date);
    const workingHours = getWorkingHoursForDate(date);

    if (override) {
      if (override.type === "day_off") {
        return {
          type: "day_off",
          label: "Day Off",
          color: "bg-red-100 border-red-300 text-red-700",
        };
      } else if (override.type === "time_off") {
        return {
          type: "override",
          label: "Time Off",
          color: "bg-orange-100 border-orange-300 text-orange-700",
        };
      } else {
        return {
          type: "override",
          label: "Custom Hours",
          color: "bg-purple-100 border-purple-300 text-purple-700",
        };
      }
    }

    if (workingHours && workingHours.length > 0) {
      return {
        type: "working",
        label: "Working",
        color: "bg-green-100 border-green-300 text-green-700",
      };
    }

    return {
      type: "not_working",
      label: "Not Available",
      color: "bg-gray-50 border-gray-200 text-gray-400",
    };
  };

  const formatTimeRanges = (ranges: TimeRange[]): string => {
    if (!ranges || ranges.length === 0) return "";
    return ranges.map((r) => `${r.start}-${r.end}`).join(", ");
  };

  const getTotalHoursForDate = (date: Date): number => {
    const workingHours = getWorkingHoursForDate(date);
    if (!workingHours) return 0;

    let totalMinutes = 0;
    workingHours.forEach((range) => {
      const [startHour, startMin] = range.start.split(":").map(Number);
      const [endHour, endMin] = range.end.split(":").map(Number);
      const minutes = endHour * 60 + endMin - (startHour * 60 + startMin);
      totalMinutes += minutes;
    });

    return totalMinutes / 60;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Availability Calendar
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300"></div>
            <span className="text-xs text-gray-600">Working</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300"></div>
            <span className="text-xs text-gray-600">Day Off</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-100 border-2 border-orange-300"></div>
            <span className="text-xs text-gray-600">Time Off</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-100 border-2 border-purple-300"></div>
            <span className="text-xs text-gray-600">Custom Hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-50 border-2 border-gray-200"></div>
            <span className="text-xs text-gray-600">Not Available</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => {
            const status = getDayStatus(day);
            const workingHours = getWorkingHoursForDate(day);
            const override = getOverrideForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const totalHours = getTotalHoursForDate(day);

            return (
              <button
                key={index}
                onClick={() => onDayClick?.(day)}
                className={cn(
                  "relative min-h-[100px] p-2 rounded-lg border-2 transition-all hover:shadow-md",
                  status.color,
                  !isCurrentMonth && "opacity-40",
                  isToday && "ring-2 ring-blue-500 ring-offset-2",
                  "flex flex-col items-start justify-start text-left"
                )}
              >
                {/* Date Number */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isToday && "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {override && (
                    <CalendarOff className="h-3 w-3" />
                  )}
                </div>

                {/* Working Hours Info */}
                {workingHours && workingHours.length > 0 && (
                  <div className="text-xs space-y-1 w-full">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="font-medium">{totalHours}h</span>
                    </div>
                    <div className="text-[10px] leading-tight opacity-75">
                      {formatTimeRanges(workingHours)}
                    </div>
                  </div>
                )}

                {/* Override Info */}
                {override && (
                  <div className="text-xs mt-1 w-full">
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1 py-0 h-auto"
                    >
                      {status.label}
                    </Badge>
                    {override.reason && (
                      <p className="text-[10px] mt-1 opacity-75 truncate">
                        {override.reason}
                      </p>
                    )}
                  </div>
                )}

                {/* Not Working */}
                {!workingHours && !override && (
                  <div className="text-xs text-gray-400 italic">
                    Not available
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
