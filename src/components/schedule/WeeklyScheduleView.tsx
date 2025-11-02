"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Calendar,
  CheckCircle,
  Circle,
} from "lucide-react";
import { TimeSlot, TherapistAvailability } from "@/types/database";
import { cn } from "@/lib/utils";

interface WeeklyScheduleViewProps {
  timeSlots: TimeSlot[];
  availability: TherapistAvailability[];
  onEditDay: (dayOfWeek: number) => void;
  onQuickToggle: (dayOfWeek: number, slotId: string) => void;
}

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

export function WeeklyScheduleView({
  timeSlots,
  availability,
  onEditDay,
  onQuickToggle,
}: WeeklyScheduleViewProps) {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  // Get availability by day
  const getAvailabilityForDay = (dayOfWeek: number) => {
    return availability.filter((a) => a.dayOfWeek === dayOfWeek);
  };

  // Get time slots for a day
  const getSlotsForDay = (dayOfWeek: number) => {
    const dayAvailability = getAvailabilityForDay(dayOfWeek);
    return timeSlots
      .filter((slot) =>
        dayAvailability.some((a) => a.timeSlotId === slot.id)
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Calculate week dates
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(
      today.getDate() - currentDay + currentWeekOffset * 7
    );

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();
  const isCurrentWeek = currentWeekOffset === 0;

  const renderDayCard = (dayOfWeek: number, date: Date) => {
    const slots = getSlotsForDay(dayOfWeek);
    const isExpanded = expandedDay === dayOfWeek;
    const isToday =
      date.toDateString() === new Date().toDateString() && isCurrentWeek;

    return (
      <Card
        key={dayOfWeek}
        className={cn(
          "transition-all cursor-pointer hover:shadow-md",
          isToday && "border-2 border-teal-500",
          isExpanded && "ring-2 ring-teal-500"
        )}
        onClick={() => setExpandedDay(isExpanded ? null : dayOfWeek)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    "font-semibold text-lg",
                    isToday && "text-teal-600"
                  )}
                >
                  {DAY_NAMES[dayOfWeek]}
                </h3>
                {isToday && (
                  <Badge variant="default" className="bg-teal-500 text-xs">
                    Today
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">{date.getDate()}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {slots.length}
              </div>
              <p className="text-xs text-gray-500">slots</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {slots.length === 0 ? (
            <div className="text-center py-4">
              <Circle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No availability</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditDay(dayOfWeek);
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Slots
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Show first 3 slots */}
              {slots.slice(0, isExpanded ? slots.length : 3).map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-2 bg-teal-50 rounded border border-teal-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {slot.startTime}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {slot.duration}m
                  </span>
                </div>
              ))}

              {/* Show more indicator */}
              {!isExpanded && slots.length > 3 && (
                <div className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-teal-600"
                  >
                    +{slots.length - 3} more
                  </Button>
                </div>
              )}

              {/* Edit button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditDay(dayOfWeek);
                }}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit Schedule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isCurrentWeek ? "This Week" : `Week of ${weekDates[0].toLocaleDateString()}`}
          </h3>
          <p className="text-sm text-gray-600">
            {weekDates[0].toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}{" "}
            -{" "}
            {weekDates[6].toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {!isCurrentWeek && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekOffset(0)}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Today
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) =>
          renderDayCard(dayOfWeek, weekDates[dayOfWeek])
        )}
      </div>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-600">Total Slots This Week</p>
                <p className="text-2xl font-bold text-gray-900">
                  {availability.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Days</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(availability.map((a) => a.dayOfWeek)).size}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hours Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(
                    availability.reduce((sum, a) => {
                      const slot = timeSlots.find((s) => s.id === a.timeSlotId);
                      return sum + (slot?.duration || 0);
                    }, 0) / 60
                  ).toFixed(1)}
                  h
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
