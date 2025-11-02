"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Plus,
  Copy,
  Clock,
  Info,
  Sun,
  Moon,
  Coffee,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeRange {
  start: string;
  end: string;
}

interface WeeklyHours {
  [dayOfWeek: number]: TimeRange[];
}

interface WeeklyHoursEditorProps {
  weeklyHours: WeeklyHours;
  onChange: (hours: WeeklyHours) => void;
}

const DAYS = [
  { id: 0, name: "Sunday", short: "S", color: "bg-gray-500" },
  { id: 1, name: "Monday", short: "M", color: "bg-blue-500" },
  { id: 2, name: "Tuesday", short: "T", color: "bg-blue-500" },
  { id: 3, name: "Wednesday", short: "W", color: "bg-blue-500" },
  { id: 4, name: "Thursday", short: "T", color: "bg-blue-500" },
  { id: 5, name: "Friday", short: "F", color: "bg-blue-500" },
  { id: 6, name: "Saturday", short: "S", color: "bg-gray-500" },
];

const TEMPLATES = {
  standard: {
    name: "Standard 9-5",
    icon: Coffee,
    hours: { start: "09:00", end: "17:00" },
    days: [1, 2, 3, 4, 5],
  },
  morning: {
    name: "Morning",
    icon: Sun,
    hours: { start: "08:00", end: "12:00" },
    days: [1, 2, 3, 4, 5],
  },
  evening: {
    name: "Evening",
    icon: Moon,
    hours: { start: "17:00", end: "21:00" },
    days: [1, 2, 3, 4, 5],
  },
  flexible: {
    name: "Flexible",
    icon: Zap,
    hours: { start: "10:00", end: "20:00" },
    days: [0, 1, 2, 3, 4, 5, 6],
  },
};

export function WeeklyHoursEditor({
  weeklyHours,
  onChange,
}: WeeklyHoursEditorProps) {
  const [copySource, setCopySource] = useState<number | null>(null);

  const toggleDay = (dayId: number) => {
    const newHours = { ...weeklyHours };
    if (newHours[dayId] && newHours[dayId].length > 0) {
      delete newHours[dayId];
    } else {
      newHours[dayId] = [{ start: "09:00", end: "17:00" }];
    }
    onChange(newHours);
  };

  const addTimeRange = (dayId: number) => {
    const newHours = { ...weeklyHours };
    if (!newHours[dayId]) {
      newHours[dayId] = [];
    }
    newHours[dayId].push({ start: "09:00", end: "17:00" });
    onChange(newHours);
  };

  const removeTimeRange = (dayId: number, index: number) => {
    const newHours = { ...weeklyHours };
    newHours[dayId].splice(index, 1);
    if (newHours[dayId].length === 0) {
      delete newHours[dayId];
    }
    onChange(newHours);
  };

  const updateTimeRange = (
    dayId: number,
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    const newHours = { ...weeklyHours };
    newHours[dayId][index][field] = value;
    onChange(newHours);
  };

  const copyDay = (fromDay: number, toDay: number) => {
    const newHours = { ...weeklyHours };
    if (weeklyHours[fromDay]) {
      newHours[toDay] = JSON.parse(JSON.stringify(weeklyHours[fromDay]));
    }
    onChange(newHours);
    setCopySource(null);
  };

  const applyTemplate = (templateKey: keyof typeof TEMPLATES) => {
    const template = TEMPLATES[templateKey];
    const newHours: WeeklyHours = {};
    template.days.forEach((day) => {
      newHours[day] = [{ ...template.hours }];
    });
    onChange(newHours);
  };

  const isAvailable = (dayId: number) => {
    return weeklyHours[dayId] && weeklyHours[dayId].length > 0;
  };

  return (
    <div className="space-y-6">
      {/* Templates */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">
              Quick Templates
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(TEMPLATES).map(([key, template]) => {
              const Icon = template.icon;
              return (
                <button
                  key={key}
                  onClick={() =>
                    applyTemplate(key as keyof typeof TEMPLATES)
                  }
                  className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <Icon className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">{template.name}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Hours */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Weekly hours</h3>
          <span className="text-sm text-gray-500">
            Set when you are typically available for meetings
          </span>
        </div>

        {DAYS.map((day) => {
          const dayHours = weeklyHours[day.id] || [];
          const available = isAvailable(day.id);

          return (
            <Card
              key={day.id}
              className={cn(
                "transition-all",
                available && "border-blue-200 bg-blue-50/30"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Day Toggle */}
                  <button
                    onClick={() => toggleDay(day.id)}
                    className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white transition-all",
                      available ? day.color : "bg-gray-300"
                    )}
                  >
                    {day.short}
                  </button>

                  {/* Content */}
                  <div className="flex-1">
                    {!available ? (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-500">Unavailable</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDay(day.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add hours
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Time Ranges */}
                        {dayHours.map((range, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2"
                          >
                            <Input
                              type="time"
                              value={range.start}
                              onChange={(e) =>
                                updateTimeRange(
                                  day.id,
                                  index,
                                  "start",
                                  e.target.value
                                )
                              }
                              className="w-32"
                            />
                            <span className="text-gray-400">-</span>
                            <Input
                              type="time"
                              value={range.end}
                              onChange={(e) =>
                                updateTimeRange(
                                  day.id,
                                  index,
                                  "end",
                                  e.target.value
                                )
                              }
                              className="w-32"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTimeRange(day.id, index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            {index === 0 && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addTimeRange(day.id)}
                                  title="Add another time range"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    copySource === day.id
                                      ? setCopySource(null)
                                      : setCopySource(day.id)
                                  }
                                  className={cn(
                                    copySource === day.id &&
                                      "bg-blue-100 text-blue-700"
                                  )}
                                  title="Copy to other days"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        ))}

                        {/* Copy Paste UI */}
                        {copySource !== null && copySource !== day.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyDay(copySource, day.id)}
                            className="text-blue-600 border-blue-300"
                          >
                            Paste from {DAYS[copySource].name}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
