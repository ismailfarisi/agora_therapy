/**
 * Availability Calendar Component
 * Interactive calendar for setting therapist availability
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  generateCalendarMonth,
  getDayNames,
  getCalendarNavigation,
  type CalendarDay,
  type CalendarView,
} from "@/lib/utils/calendar-utils";
import {
  TherapistAvailability,
  TimeSlot,
  ScheduleOverride,
} from "@/types/database";
import { cn } from "@/lib/utils";

export interface AvailabilityCalendarProps {
  therapistId: string;
  availability: TherapistAvailability[];
  overrides: ScheduleOverride[];
  timeSlots: TimeSlot[];
  onDateClick?: (date: Date) => void;
  onAvailabilityChange?: (dayOfWeek: number, timeSlotIds: string[]) => void;
  onOverrideCreate?: (date: Date) => void;
  view?: CalendarView;
  selectedDate?: Date;
  className?: string;
}

export function AvailabilityCalendar({
  therapistId,
  availability = [],
  overrides = [],
  timeSlots = [],
  onDateClick,
  onAvailabilityChange,
  onOverrideCreate,
  view = "month",
  selectedDate,
  className,
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [dragMode, setDragMode] = useState<"select" | "deselect" | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const navigation = getCalendarNavigation(currentDate, view);
  const calendar = generateCalendarMonth(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );
  const dayNames = getDayNames("short");

  // Group availability by day of week
  const availabilityByDay = availability.reduce((acc, avail) => {
    if (!acc[avail.dayOfWeek]) {
      acc[avail.dayOfWeek] = [];
    }
    acc[avail.dayOfWeek].push(avail);
    return acc;
  }, {} as Record<number, TherapistAvailability[]>);

  // Group overrides by date
  const overridesByDate = overrides.reduce((acc, override) => {
    const dateKey = override.date.toDate().toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(override);
    return acc;
  }, {} as Record<string, ScheduleOverride[]>);

  const getDateAvailability = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dateKey = date.toDateString();

    const dayAvailability = availabilityByDay[dayOfWeek] || [];
    const dayOverrides = overridesByDate[dateKey] || [];

    // Check for day off override
    const hasDayOff = dayOverrides.some((o) => o.type === "day_off");
    if (hasDayOff) {
      return { available: [], overridden: true, type: "day_off" };
    }

    // Apply time off overrides
    let availableSlots = dayAvailability.map((a) => a.timeSlotId);
    dayOverrides.forEach((override) => {
      if (override.type === "time_off" && override.affectedSlots) {
        availableSlots = availableSlots.filter(
          (id) => !override.affectedSlots!.includes(id)
        );
      } else if (override.type === "custom_hours" && override.affectedSlots) {
        availableSlots = override.affectedSlots;
      }
    });

    return {
      available: availableSlots,
      overridden: dayOverrides.length > 0,
      type: dayOverrides[0]?.type || null,
    };
  };

  const handleDateClick = (day: CalendarDay) => {
    if (onDateClick) {
      onDateClick(day.date);
    }
  };

  const handleDragStart = (day: CalendarDay, mode: "select" | "deselect") => {
    if (!day.isCurrentMonth) return;

    setDragMode(mode);
    setIsDragging(true);

    // Toggle availability for this day
    const { available } = getDateAvailability(day.date);
    const hasAvailability = available.length > 0;

    if (onAvailabilityChange) {
      const newSlotIds =
        mode === "select" && !hasAvailability
          ? timeSlots.map((ts) => ts.id)
          : [];
      onAvailabilityChange(day.dayOfWeek, newSlotIds);
    }
  };

  const handleDragEnter = (day: CalendarDay) => {
    if (!isDragging || !dragMode || !day.isCurrentMonth) return;

    const { available } = getDateAvailability(day.date);
    const hasAvailability = available.length > 0;

    if (onAvailabilityChange) {
      const newSlotIds =
        dragMode === "select" && !hasAvailability
          ? timeSlots.map((ts) => ts.id)
          : [];
      onAvailabilityChange(day.dayOfWeek, newSlotIds);
    }
  };

  const handleDragEnd = () => {
    setDragMode(null);
    setIsDragging(false);
  };

  const renderCalendarDay = (day: CalendarDay) => {
    const { available, overridden, type } = getDateAvailability(day.date);
    const hasAvailability = available.length > 0;
    const isSelected =
      selectedDate && day.date.toDateString() === selectedDate.toDateString();

    let dayColor = "";
    let dayText = "";

    if (!day.isCurrentMonth) {
      dayColor = "text-gray-400";
    } else if (overridden) {
      if (type === "day_off") {
        dayColor = "bg-red-100 text-red-800 border border-red-200";
        dayText = "Day Off";
      } else {
        dayColor = "bg-yellow-100 text-yellow-800 border border-yellow-200";
        dayText = "Modified";
      }
    } else if (hasAvailability) {
      dayColor = "bg-green-100 text-green-800 border border-green-200";
      dayText = `${available.length} slot${available.length === 1 ? "" : "s"}`;
    } else if (day.isWeekend) {
      dayColor = "bg-gray-100 text-gray-600";
      dayText = "Weekend";
    } else {
      dayColor = "hover:bg-gray-50 text-gray-700";
      dayText = "No availability";
    }

    return (
      <div
        key={day.date.toISOString()}
        className={cn(
          "relative h-20 p-2 border cursor-pointer transition-colors select-none",
          dayColor,
          isSelected && "ring-2 ring-blue-500",
          day.isToday && "ring-1 ring-blue-300",
          day.isCurrentMonth && "hover:bg-opacity-80",
          isDragging && day.isCurrentMonth && "hover:bg-blue-50"
        )}
        onClick={() => handleDateClick(day)}
        onMouseDown={(e) => {
          e.preventDefault();
          const mode = hasAvailability ? "deselect" : "select";
          handleDragStart(day, mode);
        }}
        onMouseEnter={() => handleDragEnter(day)}
        onMouseUp={handleDragEnd}
      >
        <div className="flex justify-between items-start h-full">
          <span
            className={cn(
              "text-sm font-medium",
              day.isToday &&
                "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            )}
          >
            {day.dayNumber}
          </span>

          {day.isCurrentMonth && (
            <div className="flex flex-col items-end text-xs space-y-1">
              {hasAvailability && (
                <Badge variant="secondary" className="text-xs px-1">
                  {available.length}
                </Badge>
              )}
              {overridden && (
                <Badge
                  variant={type === "day_off" ? "destructive" : "default"}
                  className="text-xs px-1"
                >
                  {type === "day_off" ? "Off" : "Mod"}
                </Badge>
              )}
            </div>
          )}
        </div>

        {day.isCurrentMonth && (
          <div className="absolute bottom-1 left-2 right-2 text-xs text-center opacity-75 truncate">
            {dayText}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Availability Calendar
        </CardTitle>

        <div className="flex items-center gap-2">
          <Button
            variant={showAvailableOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAvailableOnly(!showAvailableOnly)}
          >
            {showAvailableOnly ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
            {showAvailableOnly ? "All Days" : "Available Only"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOverrideCreate?.(currentDate)}
          >
            <Plus className="h-4 w-4" />
            Override
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(navigation.previous)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(navigation.today)}
            >
              Today
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(navigation.next)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <h3 className="text-lg font-semibold">{navigation.title}</h3>
        </div>

        {/* Day Names Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((dayName) => (
            <div
              key={dayName}
              className="h-8 flex items-center justify-center text-sm font-medium text-gray-600 bg-gray-50 rounded"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendar.weeks.flatMap((week) => week.days).map(renderCalendarDay)}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
            <span>Day Off</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span>Modified Hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
            <span>No Availability</span>
          </div>
        </div>

        {/* Drag Instructions */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          Click and drag to quickly set availability for multiple days
        </div>
      </CardContent>
    </Card>
  );
}

export default AvailabilityCalendar;
