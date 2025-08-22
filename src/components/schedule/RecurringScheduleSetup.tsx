/**
 * Recurring Schedule Setup Component
 * Wizard for setting up recurring schedules
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  Repeat,
  ChevronRight,
  ChevronLeft,
  Check,
  Settings,
  Copy,
} from "lucide-react";
import { TherapistAvailability, TimeSlot } from "@/types/database";
import { cn } from "@/lib/utils";
import { getDayNames } from "@/lib/utils/calendar-utils";
import { TimeSlotPicker } from "./TimeSlotPicker";
import { timeslotService } from "@/lib/services/timeslot-service";
import { createRecurringSchedule } from "@/lib/services/recurring-schedule-service";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface RecurringScheduleSetupProps {
  timeSlots: TimeSlot[];
  existingAvailability?: TherapistAvailability[];
  onComplete?: (schedule: RecurringScheduleData) => void;
  onCancel?: () => void;
  className?: string;
}

export interface WeeklySchedule {
  [dayOfWeek: number]: string[]; // timeSlotIds
}

export interface RecurringScheduleData {
  pattern: "weekly" | "biweekly" | "monthly";
  schedule: WeeklySchedule;
  monthlyConfig?: {
    type: "dayOfMonth" | "weekOfMonth";
    dayOfMonth?: number;
    weekOfMonth?: number;
    dayOfWeek?: number;
  };
}

type RecurrencePattern = "weekly" | "biweekly" | "monthly";

interface ScheduleStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export function RecurringScheduleSetup({
  timeSlots = [],
  existingAvailability = [],
  onComplete,
  onCancel,
  className,
}: RecurringScheduleSetupProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [recurrencePattern, setRecurrencePattern] =
    useState<RecurrencePattern>("weekly");
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({});
  const [monthlyDayOfMonth, setMonthlyDayOfMonth] = useState<number>(1);
  const [monthlyWeekOfMonth, setMonthlyWeekOfMonth] = useState<number>(1);
  const [monthlyDayOfWeek, setMonthlyDayOfWeek] = useState<number>(1);
  const [monthlyType, setMonthlyType] = useState<"dayOfMonth" | "weekOfMonth">(
    "dayOfMonth"
  );
  const [copyFromDay, setCopyFromDay] = useState<number | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] =
    useState<TimeSlot[]>(timeSlots);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(
    timeSlots.length === 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dayNames = getDayNames("long");
  const daysOfWeek = [1, 2, 3, 4, 5, 6, 0]; // Sunday to Saturday

  // Debug logging
  console.log("🐛 RecurringScheduleSetup - Component rendered");
  console.log("🐛 Props timeSlots:", timeSlots);
  console.log("🐛 Available time slots state:", availableTimeSlots);
  console.log("🐛 Loading time slots:", loadingTimeSlots);

  const steps: ScheduleStep[] = [
    {
      id: "overview",
      title: "Schedule Overview",
      description: "Review your current schedule and plan changes",
      completed: false,
    },
    {
      id: "pattern",
      title: "Recurrence Pattern",
      description: "Choose weekly, biweekly, or monthly recurrence",
      completed: false,
    },
    {
      id: "weekly",
      title: "Schedule Setup",
      description: "Set your availability for the chosen pattern",
      completed: false,
    },
    {
      id: "review",
      title: "Review & Confirm",
      description: "Review your schedule and confirm changes",
      completed: false,
    },
  ];

  // Load time slots if not provided as props
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (timeSlots && timeSlots.length > 0) {
        console.log("🐛 Using props time slots:", timeSlots);
        setAvailableTimeSlots(timeSlots);
        setLoadingTimeSlots(false);
        return;
      }

      try {
        console.log("🐛 Loading time slots from service...");
        setLoadingTimeSlots(true);
        const slots = await timeslotService.getAllTimeSlots();
        console.log("🐛 Time slots loaded:", slots);
        setAvailableTimeSlots(slots);
      } catch (error) {
        console.error("🐛 Error loading time slots:", error);
        setAvailableTimeSlots([]);
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    loadTimeSlots();
  }, [timeSlots]);

  // Initialize schedule from existing availability
  useEffect(() => {
    const initialSchedule: WeeklySchedule = {};

    existingAvailability.forEach((avail) => {
      if (!initialSchedule[avail.dayOfWeek]) {
        initialSchedule[avail.dayOfWeek] = [];
      }
      initialSchedule[avail.dayOfWeek].push(avail.timeSlotId);
    });

    setWeeklySchedule(initialSchedule);
  }, [existingAvailability]);

  const handleDayScheduleChange = (
    dayOfWeek: number,
    timeSlotIds: string[]
  ) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [dayOfWeek]: timeSlotIds,
    }));
  };

  const handleCopyFromDay = (fromDay: number, toDay: number) => {
    const sourceSlots = weeklySchedule[fromDay] || [];
    setWeeklySchedule((prev) => ({
      ...prev,
      [toDay]: [...sourceSlots],
    }));
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    const scheduleData: RecurringScheduleData = {
      pattern: recurrencePattern,
      schedule: weeklySchedule,
      ...(recurrencePattern === "monthly" && {
        monthlyConfig: {
          type: monthlyType,
          ...(monthlyType === "dayOfMonth" && {
            dayOfMonth: monthlyDayOfMonth,
          }),
          ...(monthlyType === "weekOfMonth" && {
            weekOfMonth: monthlyWeekOfMonth,
            dayOfWeek: monthlyDayOfWeek,
          }),
        },
      }),
    };

    try {
      setIsSubmitting(true);
      console.log(
        "🔄 Starting recurring schedule completion with data:",
        scheduleData
      );
      console.log("🔍 Available time slots state:", availableTimeSlots);
      console.log("🔍 Weekly schedule:", weeklySchedule);

      // Ensure user is authenticated
      if (!user) {
        throw new Error("User not authenticated. Please log in and try again.");
      }

      await createRecurringSchedule(
        recurrencePattern,
        weeklySchedule,
        availableTimeSlots
      );

      console.log("✅ Successfully applied recurring schedule");
      onComplete?.(scheduleData);
    } catch (error) {
      console.error("❌ Failed to create recurring schedule:", error);

      // Show user-friendly error message
      let errorMessage = "Failed to save schedule. ";
      if (error instanceof Error) {
        if (error.message.includes("permission-denied")) {
          errorMessage +=
            "Permission denied. Please ensure you are logged in as a therapist.";
        } else if (error.message.includes("not authenticated")) {
          errorMessage += "Please log in and try again.";
        } else {
          errorMessage += error.message;
        }
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalSlotsSelected = () => {
    return Object.values(weeklySchedule).reduce(
      (total, slots) => total + slots.length,
      0
    );
  };

  const getDayScheduleStats = (dayOfWeek: number) => {
    const slots = weeklySchedule[dayOfWeek] || [];
    const timeSlotDetails = slots
      .map((id) => availableTimeSlots.find((ts) => ts.id === id))
      .filter(Boolean) as TimeSlot[];

    if (timeSlotDetails.length === 0) {
      return { count: 0, duration: 0, startTime: null, endTime: null };
    }

    const totalDuration = timeSlotDetails.reduce(
      (sum, slot) => sum + slot.duration,
      0
    );
    const startTimes = timeSlotDetails.map((slot) => slot.startTime).sort();
    const endTimes = timeSlotDetails.map((slot) => slot.endTime).sort();

    return {
      count: slots.length,
      duration: totalDuration,
      startTime: startTimes[0],
      endTime: endTimes[endTimes.length - 1],
    };
  };

  const renderOverviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          Current Schedule Overview
        </h3>
        <p className="text-gray-600">
          Let&apos;s set up your weekly recurring schedule. You can customize
          your availability for each day.
        </p>
      </div>

      {/* Current Schedule Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {daysOfWeek.map((dayOfWeek) => {
          const stats = getDayScheduleStats(dayOfWeek);
          return (
            <div key={dayOfWeek} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{dayNames[dayOfWeek]}</h4>
                <Badge variant={stats.count > 0 ? "default" : "secondary"}>
                  {stats.count} slot{stats.count === 1 ? "" : "s"}
                </Badge>
              </div>

              {stats.count > 0 ? (
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>
                      {stats.startTime} - {stats.endTime}
                    </span>
                  </div>
                  <div>
                    Total: {Math.floor(stats.duration / 60)}h{" "}
                    {stats.duration % 60}m
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No availability set</p>
              )}
            </div>
          );

          const renderPatternStep = () => (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Choose Recurrence Pattern
                </h3>
                <p className="text-gray-600">
                  Select how often your schedule should repeat
                </p>
              </div>

              {/* Pattern Selection */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      value: "weekly",
                      label: "Weekly",
                      description: "Same schedule every week",
                      icon: "🗓️",
                    },
                    {
                      value: "biweekly",
                      label: "Bi-weekly",
                      description: "Every two weeks",
                      icon: "📅",
                    },
                    {
                      value: "monthly",
                      label: "Monthly",
                      description: "Same pattern each month",
                      icon: "🗓️",
                    },
                  ].map((pattern) => (
                    <div
                      key={pattern.value}
                      className={cn(
                        "p-6 border rounded-lg cursor-pointer transition-colors",
                        recurrencePattern === pattern.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() =>
                        setRecurrencePattern(pattern.value as RecurrencePattern)
                      }
                    >
                      <div className="text-center space-y-2">
                        <div className="text-2xl">{pattern.icon}</div>
                        <h4 className="font-medium">{pattern.label}</h4>
                        <p className="text-sm text-gray-600">
                          {pattern.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Monthly Configuration */}
                {recurrencePattern === "monthly" && (
                  <div className="bg-blue-50 p-6 rounded-lg space-y-4">
                    <h4 className="font-medium text-blue-900">
                      Monthly Schedule Options
                    </h4>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          How should the monthly schedule repeat?
                        </label>
                        <Select
                          value={monthlyType}
                          onValueChange={(
                            value: "dayOfMonth" | "weekOfMonth"
                          ) => setMonthlyType(value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dayOfMonth">
                              Same day of month (e.g., 15th of every month)
                            </SelectItem>
                            <SelectItem value="weekOfMonth">
                              Same week and day (e.g., 2nd Tuesday of every
                              month)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {monthlyType === "dayOfMonth" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Day of Month
                          </label>
                          <Select
                            value={monthlyDayOfMonth.toString()}
                            onValueChange={(value) =>
                              setMonthlyDayOfMonth(parseInt(value))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 28 }, (_, i) => i + 1).map(
                                (day) => (
                                  <SelectItem key={day} value={day.toString()}>
                                    {day}
                                    {day === 1
                                      ? "st"
                                      : day === 2
                                      ? "nd"
                                      : day === 3
                                      ? "rd"
                                      : "th"}{" "}
                                    of every month
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {monthlyType === "weekOfMonth" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Week of Month
                            </label>
                            <Select
                              value={monthlyWeekOfMonth.toString()}
                              onValueChange={(value) =>
                                setMonthlyWeekOfMonth(parseInt(value))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1st week</SelectItem>
                                <SelectItem value="2">2nd week</SelectItem>
                                <SelectItem value="3">3rd week</SelectItem>
                                <SelectItem value="4">4th week</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Day of Week
                            </label>
                            <Select
                              value={monthlyDayOfWeek.toString()}
                              onValueChange={(value) =>
                                setMonthlyDayOfWeek(parseInt(value))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {dayNames.map((day, index) => (
                                  <SelectItem
                                    key={index}
                                    value={index.toString()}
                                  >
                                    {day}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Pattern Summary</h4>
                <p className="text-sm text-gray-600">
                  {recurrencePattern === "weekly" &&
                    "Your schedule will repeat every week"}
                  {recurrencePattern === "biweekly" &&
                    "Your schedule will repeat every two weeks"}
                  {recurrencePattern === "monthly" &&
                    monthlyType === "dayOfMonth" &&
                    `Your schedule will repeat on the ${monthlyDayOfMonth}${
                      monthlyDayOfMonth === 1
                        ? "st"
                        : monthlyDayOfMonth === 2
                        ? "nd"
                        : monthlyDayOfMonth === 3
                        ? "rd"
                        : "th"
                    } of every month`}
                  {recurrencePattern === "monthly" &&
                    monthlyType === "weekOfMonth" &&
                    `Your schedule will repeat on the ${
                      monthlyWeekOfMonth === 1
                        ? "1st"
                        : monthlyWeekOfMonth === 2
                        ? "2nd"
                        : monthlyWeekOfMonth === 3
                        ? "3rd"
                        : "4th"
                    } ${dayNames[monthlyDayOfWeek]} of every month`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">What you can do:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Set different time slots for each day of the week</li>
          <li>• Copy schedules between days for consistency</li>
          <li>• Review and adjust before applying changes</li>
          <li>• Override specific dates later with custom schedules</li>
        </ul>
      </div>
    </div>
  );

  const renderPatternStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          Choose Recurrence Pattern
        </h3>
        <p className="text-gray-600">
          Select how often your schedule should repeat
        </p>
      </div>

      {/* Pattern Selection */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              value: "weekly",
              label: "Weekly",
              description: "Same schedule every week",
              icon: "🗓️",
            },
            {
              value: "biweekly",
              label: "Bi-weekly",
              description: "Every two weeks",
              icon: "📅",
            },
            {
              value: "monthly",
              label: "Monthly",
              description: "Same pattern each month",
              icon: "🗓️",
            },
          ].map((pattern) => (
            <div
              key={pattern.value}
              className={cn(
                "p-6 border rounded-lg cursor-pointer transition-colors",
                recurrencePattern === pattern.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() =>
                setRecurrencePattern(pattern.value as RecurrencePattern)
              }
            >
              <div className="text-center space-y-2">
                <div className="text-2xl">{pattern.icon}</div>
                <h4 className="font-medium">{pattern.label}</h4>
                <p className="text-sm text-gray-600">{pattern.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Configuration */}
        {recurrencePattern === "monthly" && (
          <div className="bg-blue-50 p-6 rounded-lg space-y-4">
            <h4 className="font-medium text-blue-900">
              Monthly Schedule Options
            </h4>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  How should the monthly schedule repeat?
                </label>
                <Select
                  value={monthlyType}
                  onValueChange={(value: "dayOfMonth" | "weekOfMonth") =>
                    setMonthlyType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dayOfMonth">
                      Same day of month (e.g., 15th of every month)
                    </SelectItem>
                    <SelectItem value="weekOfMonth">
                      Same week and day (e.g., 2nd Tuesday of every month)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {monthlyType === "dayOfMonth" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Day of Month</label>
                  <Select
                    value={monthlyDayOfMonth.toString()}
                    onValueChange={(value) =>
                      setMonthlyDayOfMonth(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(
                        (day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                            {day === 1
                              ? "st"
                              : day === 2
                              ? "nd"
                              : day === 3
                              ? "rd"
                              : "th"}{" "}
                            of every month
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {monthlyType === "weekOfMonth" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Week of Month</label>
                    <Select
                      value={monthlyWeekOfMonth.toString()}
                      onValueChange={(value) =>
                        setMonthlyWeekOfMonth(parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st week</SelectItem>
                        <SelectItem value="2">2nd week</SelectItem>
                        <SelectItem value="3">3rd week</SelectItem>
                        <SelectItem value="4">4th week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Day of Week</label>
                    <Select
                      value={monthlyDayOfWeek.toString()}
                      onValueChange={(value) =>
                        setMonthlyDayOfWeek(parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dayNames.map((day, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Pattern Summary</h4>
        <p className="text-sm text-gray-600">
          {recurrencePattern === "weekly" &&
            "Your schedule will repeat every week"}
          {recurrencePattern === "biweekly" &&
            "Your schedule will repeat every two weeks"}
          {recurrencePattern === "monthly" &&
            monthlyType === "dayOfMonth" &&
            `Your schedule will repeat on the ${monthlyDayOfMonth}${
              monthlyDayOfMonth === 1
                ? "st"
                : monthlyDayOfMonth === 2
                ? "nd"
                : monthlyDayOfMonth === 3
                ? "rd"
                : "th"
            } of every month`}
          {recurrencePattern === "monthly" &&
            monthlyType === "weekOfMonth" &&
            `Your schedule will repeat on the ${
              monthlyWeekOfMonth === 1
                ? "1st"
                : monthlyWeekOfMonth === 2
                ? "2nd"
                : monthlyWeekOfMonth === 3
                ? "3rd"
                : "4th"
            } ${dayNames[monthlyDayOfWeek]} of every month`}
        </p>
      </div>
    </div>
  );

  const renderWeeklyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Set Weekly Schedule</h3>
        <p className="text-gray-600">
          Configure your availability for each day of the week
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {daysOfWeek.map((dayOfWeek) => {
          const daySlots = weeklySchedule[dayOfWeek] || [];
          const stats = getDayScheduleStats(dayOfWeek);

          return (
            <div key={dayOfWeek} className="space-y-4">
              <div className="flex flex-col items-center">
                <h4 className="font-medium text-center">
                  {dayNames[dayOfWeek]}
                </h4>
                <Badge
                  variant={stats.count > 0 ? "default" : "secondary"}
                  className="mt-1"
                >
                  {stats.count}
                </Badge>
              </div>

              {/* Copy From Day */}
              <div className="flex flex-col gap-2">
                <select
                  value={copyFromDay || ""}
                  onChange={(e) => {
                    const fromDay = parseInt(e.target.value);
                    if (!isNaN(fromDay) && fromDay !== dayOfWeek) {
                      handleCopyFromDay(fromDay, dayOfWeek);
                    }
                    setCopyFromDay(null);
                  }}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="">Copy from...</option>
                  {daysOfWeek
                    .filter(
                      (d) =>
                        d !== dayOfWeek && (weeklySchedule[d]?.length || 0) > 0
                    )
                    .map((d) => (
                      <option key={d} value={d}>
                        {dayNames[d]} ({weeklySchedule[d]?.length || 0} slots)
                      </option>
                    ))}
                </select>
              </div>

              <TimeSlotPicker
                timeSlots={availableTimeSlots}
                selectedSlotIds={daySlots}
                onSelectionChange={(slotIds) =>
                  handleDayScheduleChange(dayOfWeek, slotIds)
                }
                showSelectAll={false}
                showDuration={false}
                groupByDuration={false}
                className="min-h-[400px]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Review Your Schedule</h3>
        <p className="text-gray-600">
          Confirm your weekly schedule before applying changes
        </p>
      </div>

      {/* Schedule Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-medium mb-4">Weekly Schedule Summary</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {daysOfWeek.map((dayOfWeek) => {
            const stats = getDayScheduleStats(dayOfWeek);
            const slots = weeklySchedule[dayOfWeek] || [];

            return (
              <div key={dayOfWeek} className="bg-white p-4 rounded border">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium">{dayNames[dayOfWeek]}</h5>
                  <Badge variant={stats.count > 0 ? "default" : "secondary"}>
                    {stats.count}
                  </Badge>
                </div>

                {stats.count > 0 ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {stats.startTime} - {stats.endTime}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      {Math.floor(stats.duration / 60)}h {stats.duration % 60}m
                      total
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {slots.slice(0, 3).map((slotId) => {
                        const slot = availableTimeSlots.find(
                          (ts) => ts.id === slotId
                        );
                        return slot ? (
                          <Badge
                            key={slotId}
                            variant="outline"
                            className="text-xs"
                          >
                            {slot.startTime}
                          </Badge>
                        ) : null;
                      })}
                      {slots.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{slots.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No availability</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {getTotalSlotsSelected()}
          </div>
          <div className="text-sm text-blue-800">Total Slots</div>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {
              Object.values(weeklySchedule).filter((slots) => slots.length > 0)
                .length
            }
          </div>
          <div className="text-sm text-green-800">Active Days</div>
        </div>

        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(
              (Object.values(weeklySchedule).reduce((sum, slots) => {
                return (
                  sum +
                  slots.reduce((slotSum: number, slotId: string) => {
                    const slot = availableTimeSlots.find(
                      (ts) => ts.id === slotId
                    );
                    return slotSum + (slot?.duration || 0);
                  }, 0)
                );
              }, 0) /
                60) *
                10
            ) / 10}
            h
          </div>
          <div className="text-sm text-purple-800">Per Week</div>
        </div>

        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 capitalize">
            {recurrencePattern}
          </div>
          <div className="text-sm text-orange-800">Recurring</div>
        </div>
      </div>

      {getTotalSlotsSelected() === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <Settings className="h-5 w-5" />
            <span className="font-medium">No Schedule Set</span>
          </div>
          <p className="text-sm text-yellow-700 mt-2">
            You haven&apos;t selected any time slots. Go back to set your
            availability.
          </p>
        </div>
      )}
    </div>
  );

  if (loadingTimeSlots) {
    console.log("🐛 Still loading time slots...");
    return (
      <Card className={cn("w-full max-w-6xl mx-auto", className)}>
        <CardContent className="p-6">
          <div className="text-center">Loading time slots...</div>
        </CardContent>
      </Card>
    );
  }

  if (availableTimeSlots.length === 0) {
    console.log("🐛 No time slots available");
    return (
      <Card className={cn("w-full max-w-6xl mx-auto", className)}>
        <CardContent className="p-6">
          <div className="text-center text-amber-600">
            ⚠️ No time slots available. Please check database setup.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-6xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Recurring Schedule Setup
        </CardTitle>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mt-6">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className={cn(
                  "flex flex-col items-center gap-2 flex-1",
                  index <= currentStep ? "text-blue-600" : "text-gray-400"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    index < currentStep
                      ? "bg-blue-600 text-white"
                      : index === currentStep
                      ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-gray-500 max-w-[120px]">
                    {step.description}
                  </div>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-px mx-4",
                    index < currentStep ? "bg-blue-600" : "bg-gray-300"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {/* Step Content */}
        <div className="min-h-[500px]">
          {currentStep === 0 && renderOverviewStep()}
          {currentStep === 1 && renderPatternStep()}
          {currentStep === 2 && renderWeeklyStep()}
          {currentStep === 3 && renderReviewStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePreviousStep}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}

            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>

          <div className="flex gap-2">
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNextStep}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={getTotalSlotsSelected() === 0 || isSubmitting}
              >
                <Check className="h-4 w-4 mr-2" />
                {isSubmitting ? "Applying..." : "Apply Schedule"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecurringScheduleSetup;
