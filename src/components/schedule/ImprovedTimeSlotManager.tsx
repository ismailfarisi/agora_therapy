"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Copy,
  Trash2,
  CheckCircle,
  Circle,
  Sun,
  Moon,
  Coffee,
  Zap,
  Calendar,
  Save,
} from "lucide-react";
import { TimeSlot, TherapistAvailability } from "@/types/database";
import { cn } from "@/lib/utils";

export interface WeeklySchedule {
  [dayOfWeek: number]: string[]; // timeSlotIds
}

interface ImprovedTimeSlotManagerProps {
  timeSlots: TimeSlot[];
  existingAvailability?: TherapistAvailability[];
  onSave: (schedule: WeeklySchedule) => void;
  onCancel?: () => void;
}

// Pre-defined templates
const SCHEDULE_TEMPLATES = {
  standard: {
    name: "Standard 9-5",
    icon: Coffee,
    description: "Monday-Friday, 9 AM - 5 PM",
    schedule: [1, 2, 3, 4, 5], // Mon-Fri
    timeRange: { start: "09:00", end: "17:00" },
  },
  morning: {
    name: "Morning Hours",
    icon: Sun,
    description: "Monday-Friday, 8 AM - 12 PM",
    schedule: [1, 2, 3, 4, 5],
    timeRange: { start: "08:00", end: "12:00" },
  },
  evening: {
    name: "Evening Hours",
    icon: Moon,
    description: "Monday-Friday, 5 PM - 9 PM",
    schedule: [1, 2, 3, 4, 5],
    timeRange: { start: "17:00", end: "21:00" },
  },
  flexible: {
    name: "Flexible",
    icon: Zap,
    description: "All days, 10 AM - 8 PM",
    schedule: [0, 1, 2, 3, 4, 5, 6],
    timeRange: { start: "10:00", end: "20:00" },
  },
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function ImprovedTimeSlotManager({
  timeSlots,
  existingAvailability = [],
  onSave,
  onCancel,
}: ImprovedTimeSlotManagerProps) {
  const [schedule, setSchedule] = useState<WeeklySchedule>({});
  const [selectedDay, setSelectedDay] = useState<number>(1); // Default to Monday
  const [copySource, setCopySource] = useState<number | null>(null);

  // Initialize from existing availability
  useEffect(() => {
    const initialSchedule: WeeklySchedule = {};
    existingAvailability.forEach((avail) => {
      if (!initialSchedule[avail.dayOfWeek]) {
        initialSchedule[avail.dayOfWeek] = [];
      }
      initialSchedule[avail.dayOfWeek].push(avail.timeSlotId);
    });
    setSchedule(initialSchedule);
  }, [existingAvailability]);

  // Group time slots by time of day
  const groupSlotsByTimeOfDay = (slots: TimeSlot[]) => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];

    slots.forEach((slot) => {
      const hour = parseInt(slot.startTime.split(":")[0]);
      if (hour < 12) morning.push(slot);
      else if (hour < 17) afternoon.push(slot);
      else evening.push(slot);
    });

    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = groupSlotsByTimeOfDay(timeSlots);

  const toggleSlot = (dayOfWeek: number, slotId: string) => {
    setSchedule((prev) => {
      const daySlots = prev[dayOfWeek] || [];
      const newDaySlots = daySlots.includes(slotId)
        ? daySlots.filter((id) => id !== slotId)
        : [...daySlots, slotId];

      return {
        ...prev,
        [dayOfWeek]: newDaySlots,
      };
    });
  };

  const selectAllForDay = (dayOfWeek: number, slots: TimeSlot[]) => {
    const slotIds = slots.map((s: TimeSlot) => s.id);
    setSchedule((prev) => ({
      ...prev,
      [dayOfWeek]: [...new Set([...(prev[dayOfWeek] || []), ...slotIds])],
    }));
  };

  const clearDay = (dayOfWeek: number) => {
    setSchedule((prev) => ({
      ...prev,
      [dayOfWeek]: [],
    }));
  };

  const copyDay = (fromDay: number, toDay: number) => {
    setSchedule((prev) => ({
      ...prev,
      [toDay]: [...(prev[fromDay] || [])],
    }));
    setCopySource(null);
  };

  const applyTemplate = (templateKey: keyof typeof SCHEDULE_TEMPLATES) => {
    const template = SCHEDULE_TEMPLATES[templateKey];
    const newSchedule: WeeklySchedule = {};

    template.schedule.forEach((day) => {
      const slotsInRange = timeSlots.filter((slot) => {
        return (
          slot.startTime >= template.timeRange.start &&
          slot.startTime < template.timeRange.end
        );
      });
      newSchedule[day] = slotsInRange.map((s) => s.id);
    });

    setSchedule(newSchedule);
  };

  const getTotalHoursPerWeek = () => {
    let totalMinutes = 0;
    Object.values(schedule).forEach((daySlots: string[]) => {
      daySlots.forEach((slotId: string) => {
        const slot = timeSlots.find((s: TimeSlot) => s.id === slotId);
        if (slot) totalMinutes += slot.duration;
      });
    });
    return (totalMinutes / 60).toFixed(1);
  };

  const renderTimeSlotButton = (slot: TimeSlot, dayOfWeek: number) => {
    const isSelected = schedule[dayOfWeek]?.includes(slot.id) || false;

    return (
      <button
        key={slot.id}
        onClick={() => toggleSlot(dayOfWeek, slot.id)}
        className={cn(
          "flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left",
          isSelected
            ? "border-teal-500 bg-teal-50 shadow-sm"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        )}
      >
        <div className="flex items-center justify-between w-full mb-1">
          <span
            className={cn(
              "text-sm font-semibold",
              isSelected ? "text-teal-700" : "text-gray-700"
            )}
          >
            {slot.startTime}
          </span>
          {isSelected ? (
            <CheckCircle className="h-4 w-4 text-teal-600" />
          ) : (
            <Circle className="h-4 w-4 text-gray-300" />
          )}
        </div>
        <span className="text-xs text-gray-500">{slot.duration} min</span>
      </button>
    );
  };

  const renderDayColumn = (dayOfWeek: number) => {
    const daySlots = schedule[dayOfWeek] || [];
    const slotsCount = daySlots.length;

    return (
      <div
        key={dayOfWeek}
        className={cn(
          "flex flex-col border-2 rounded-lg p-4 transition-all",
          selectedDay === dayOfWeek
            ? "border-teal-500 bg-teal-50/30"
            : "border-gray-200 bg-white"
        )}
      >
        {/* Day Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">
              {DAY_NAMES_FULL[dayOfWeek]}
            </h3>
            <Badge variant={slotsCount > 0 ? "default" : "outline"}>
              {slotsCount} slots
            </Badge>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectAllForDay(dayOfWeek, timeSlots)}
              className="flex-1 text-xs"
            >
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearDay(dayOfWeek)}
              className="flex-1 text-xs"
            >
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                copySource === dayOfWeek
                  ? setCopySource(null)
                  : setCopySource(dayOfWeek)
              }
              className={cn(
                "flex-1 text-xs",
                copySource === dayOfWeek && "bg-blue-100 border-blue-500"
              )}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>

          {/* Paste button if copy source is set */}
          {copySource !== null && copySource !== dayOfWeek && (
            <Button
              variant="default"
              size="sm"
              onClick={() => copyDay(copySource, dayOfWeek)}
              className="w-full mt-2 text-xs bg-blue-600"
            >
              Paste from {DAY_NAMES[copySource]}
            </Button>
          )}
        </div>

        {/* Time Slots */}
        <div className="space-y-2 flex-1 overflow-y-auto max-h-96">
          {morning.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sun className="h-3 w-3 text-yellow-500" />
                <span className="text-xs font-medium text-gray-600">
                  Morning
                </span>
              </div>
              <div className="space-y-1">
                {morning.map((slot) => renderTimeSlotButton(slot, dayOfWeek))}
              </div>
            </div>
          )}

          {afternoon.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Coffee className="h-3 w-3 text-orange-500" />
                <span className="text-xs font-medium text-gray-600">
                  Afternoon
                </span>
              </div>
              <div className="space-y-1">
                {afternoon.map((slot) => renderTimeSlotButton(slot, dayOfWeek))}
              </div>
            </div>
          )}

          {evening.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Moon className="h-3 w-3 text-indigo-500" />
                <span className="text-xs font-medium text-gray-600">
                  Evening
                </span>
              </div>
              <div className="space-y-1">
                {evening.map((slot) => renderTimeSlotButton(slot, dayOfWeek))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Weekly Schedule Setup
          </h2>
          <p className="text-gray-600 mt-1">
            Select your available time slots for each day of the week
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Clock className="h-4 w-4 mr-2" />
            {getTotalHoursPerWeek()}h/week
          </Badge>
        </div>
      </div>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(SCHEDULE_TEMPLATES).map(([key, template]) => {
              const Icon = template.icon;
              return (
                <button
                  key={key}
                  onClick={() =>
                    applyTemplate(key as keyof typeof SCHEDULE_TEMPLATES)
                  }
                  className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all"
                >
                  <Icon className="h-8 w-8 text-teal-600 mb-2" />
                  <span className="font-medium text-sm text-gray-900">
                    {template.name}
                  </span>
                  <span className="text-xs text-gray-500 text-center mt-1">
                    {template.description}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Availability</CardTitle>
          <p className="text-sm text-gray-600">
            Click time slots to toggle availability. Use Copy to duplicate a
            day's schedule.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {[0, 1, 2, 3, 4, 5, 6].map((day) => renderDayColumn(day))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Schedule Summary
              </h3>
              <div className="flex flex-wrap gap-4 text-sm">
                {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                  const count = schedule[day]?.length || 0;
                  if (count === 0) return null;
                  return (
                    <div key={day} className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-teal-600" />
                      <span className="text-gray-700">
                        <strong>{DAY_NAMES[day]}:</strong> {count} slot
                        {count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-3">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                onClick={() => onSave(schedule)}
                size="lg"
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
