/**
 * Availability Setup Step for Therapist Onboarding
 * Simplified version for capturing basic weekly availability
 */

"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, X } from "lucide-react";

interface TimeRange {
  start: string;
  end: string;
}

interface WeeklyHours {
  [dayOfWeek: number]: TimeRange[];
}

interface AvailabilitySetupStepProps {
  weeklyHours: WeeklyHours;
  onWeeklyHoursChange: (hours: WeeklyHours) => void;
}

const DAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

export function AvailabilitySetupStep({
  weeklyHours,
  onWeeklyHoursChange,
}: AvailabilitySetupStepProps) {
  const toggleDay = (dayValue: number) => {
    const newHours = { ...weeklyHours };
    if (newHours[dayValue]) {
      delete newHours[dayValue];
    } else {
      newHours[dayValue] = [{ start: "09:00", end: "17:00" }];
    }
    onWeeklyHoursChange(newHours);
  };

  const updateTimeRange = (
    dayValue: number,
    rangeIndex: number,
    field: "start" | "end",
    value: string
  ) => {
    const newHours = { ...weeklyHours };
    if (newHours[dayValue] && newHours[dayValue][rangeIndex]) {
      newHours[dayValue][rangeIndex][field] = value;
      onWeeklyHoursChange(newHours);
    }
  };

  const addTimeRange = (dayValue: number) => {
    const newHours = { ...weeklyHours };
    if (!newHours[dayValue]) {
      newHours[dayValue] = [];
    }
    newHours[dayValue].push({ start: "09:00", end: "17:00" });
    onWeeklyHoursChange(newHours);
  };

  const removeTimeRange = (dayValue: number, rangeIndex: number) => {
    const newHours = { ...weeklyHours };
    if (newHours[dayValue]) {
      newHours[dayValue].splice(rangeIndex, 1);
      if (newHours[dayValue].length === 0) {
        delete newHours[dayValue];
      }
      onWeeklyHoursChange(newHours);
    }
  };

  const setStandardHours = () => {
    const standardHours: WeeklyHours = {
      1: [{ start: "09:00", end: "17:00" }],
      2: [{ start: "09:00", end: "17:00" }],
      3: [{ start: "09:00", end: "17:00" }],
      4: [{ start: "09:00", end: "17:00" }],
      5: [{ start: "09:00", end: "17:00" }],
    };
    onWeeklyHoursChange(standardHours);
  };

  const getTotalHours = () => {
    let totalMinutes = 0;
    Object.values(weeklyHours).forEach((ranges: TimeRange[]) => {
      ranges.forEach((range: TimeRange) => {
        const [startHour, startMin] = range.start.split(":").map(Number);
        const [endHour, endMin] = range.end.split(":").map(Number);
        const minutes = endHour * 60 + endMin - (startHour * 60 + startMin);
        totalMinutes += minutes;
      });
    });
    return (totalMinutes / 60).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Set Your Availability</h3>
        <p className="text-gray-600 text-sm">
          Choose the days and hours you're available for sessions
        </p>
      </div>

      {/* Quick Setup */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900">Standard Business Hours</p>
            <p className="text-sm text-gray-600">Monday-Friday, 9 AM - 5 PM</p>
          </div>
        </div>
        <Button onClick={setStandardHours} variant="outline" size="sm">
          Apply
        </Button>
      </div>

      {/* Weekly Hours Summary */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Total Weekly Hours:</span>
        <Badge variant="secondary" className="text-lg">
          {getTotalHours()}h
        </Badge>
      </div>

      {/* Days Selection */}
      <div className="space-y-3">
        {DAYS.map((day) => {
          const isActive = !!weeklyHours[day.value];
          const ranges = weeklyHours[day.value] || [];

          return (
            <div
              key={day.value}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${isActive ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className="flex items-center gap-3 flex-1"
                >
                  <div
                    className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center
                      ${isActive ? "bg-blue-600 border-blue-600" : "border-gray-300"}
                    `}
                  >
                    {isActive && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">{day.label}</span>
                </button>

                {isActive && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addTimeRange(day.value)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Time Ranges */}
              {isActive && (
                <div className="space-y-2 ml-8">
                  {ranges.map((range, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={range.start}
                        onChange={(e) =>
                          updateTimeRange(day.value, index, "start", e.target.value)
                        }
                        className="w-32"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="time"
                        value={range.end}
                        onChange={(e) =>
                          updateTimeRange(day.value, index, "end", e.target.value)
                        }
                        className="w-32"
                      />
                      {ranges.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeRange(day.value, index)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {Object.keys(weeklyHours).length === 0 && (
        <div className="text-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          Please select at least one day to continue
        </div>
      )}
    </div>
  );
}
