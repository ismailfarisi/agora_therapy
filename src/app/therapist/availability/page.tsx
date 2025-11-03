"use client";

import React, { useState, useEffect } from "react";
import { TherapistLayout } from "@/components/therapist/TherapistLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/lib/hooks/useToast";
import {
  Calendar,
  Clock,
  CalendarDays,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { WeeklyHoursEditor } from "@/components/availability/WeeklyHoursEditor";
import { DateSpecificHoursModal } from "@/components/availability/DateSpecificHoursModal";
import { AvailabilityService } from "@/lib/services/availability-service";
import { TimeSlotService } from "@/lib/services/timeslot-service";
import { TimeSlot, TherapistAvailability } from "@/types/database";
import { Timestamp } from "firebase/firestore";

interface TimeRange {
  start: string;
  end: string;
}

interface WeeklyHours {
  [dayOfWeek: number]: TimeRange[];
}

interface DateOverride {
  id: string;
  date: Date;
  hours: TimeRange[];
}

export default function TherapistAvailabilityPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const { toast } = useToast();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Weekly hours state
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours>({
    1: [{ start: "09:00", end: "17:00" }],
    2: [{ start: "09:00", end: "17:00" }],
    3: [{ start: "09:00", end: "17:00" }],
    4: [{ start: "09:00", end: "17:00" }],
    5: [{ start: "09:00", end: "17:00" }],
  });

  // Date-specific overrides
  const [dateOverrides, setDateOverrides] = useState<DateOverride[]>([]);

  // Load existing availability and time slots
  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);

        // Load time slots
        const slots = await TimeSlotService.getTimeSlots();
        setTimeSlots(slots);

        // Load existing availability
        const availability = await AvailabilityService.getTherapistAvailability(user.uid);
        
        // Convert availability records to weekly hours format
        if (availability.length > 0) {
          const converted = convertAvailabilityToWeeklyHours(availability, slots);
          setWeeklyHours(converted);
        }

        // Load schedule overrides
        const overrides = await AvailabilityService.getScheduleOverrides(user.uid);
        const convertedOverrides = overrides.map(override => ({
          id: override.id,
          date: (override.date as Timestamp).toDate(),
          hours: override.affectedSlots?.map(slotId => {
            const slot = slots.find(s => s.id === slotId);
            return {
              start: slot?.startTime || "09:00",
              end: slot?.endTime || "17:00"
            };
          }) || []
        }));
        setDateOverrides(convertedOverrides);
      } catch (error) {
        console.error("Error loading availability:", error);
        toast.error("Load Failed", "Failed to load your availability data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const handleSaveWeeklyHours = async () => {
    if (!user?.uid) {
      toast.error("Error", "User not authenticated");
      return;
    }

    try {
      setLoading(true);

      // Convert weekly hours to time slot IDs
      const weeklySchedule: { [dayOfWeek: number]: string[] } = {};
      
      for (const [dayStr, ranges] of Object.entries(weeklyHours)) {
        const dayOfWeek = parseInt(dayStr);
        const slotIds: string[] = [];

        for (const range of ranges) {
          // Find all time slots that fall within this range
          const matchingSlots = timeSlots.filter(slot => {
            return slot.startTime >= range.start && slot.endTime <= range.end;
          });
          slotIds.push(...matchingSlots.map(s => s.id));
        }

        if (slotIds.length > 0) {
          weeklySchedule[dayOfWeek] = slotIds;
        }
      }

      // Save to backend
      await AvailabilityService.setWeeklySchedule(user.uid, weeklySchedule);
      
      toast.success(
        "Availability Updated",
        "Your weekly hours have been saved successfully"
      );
    } catch (error) {
      console.error("Error saving weekly hours:", error);
      toast.error(
        "Save Failed",
        "Failed to save your availability. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert availability records to weekly hours
  const convertAvailabilityToWeeklyHours = (
    availability: TherapistAvailability[],
    slots: TimeSlot[]
  ): WeeklyHours => {
    const weeklyHours: WeeklyHours = {};

    // Group by day of week
    const byDay: { [day: number]: string[] } = {};
    availability.forEach(av => {
      if (!byDay[av.dayOfWeek]) {
        byDay[av.dayOfWeek] = [];
      }
      byDay[av.dayOfWeek].push(av.timeSlotId);
    });

    // Convert to time ranges
    for (const [dayStr, slotIds] of Object.entries(byDay)) {
      const day = parseInt(dayStr);
      const daySlots = slotIds
        .map(id => slots.find(s => s.id === id))
        .filter(Boolean)
        .sort((a, b) => (a!.startTime || "").localeCompare(b!.startTime || ""));

      if (daySlots.length > 0) {
        // Group consecutive slots into ranges
        const ranges: TimeRange[] = [];
        let currentRange: TimeRange | null = null;

        for (const slot of daySlots) {
          if (!slot) continue;

          if (!currentRange) {
            currentRange = { start: slot.startTime, end: slot.endTime };
          } else if (currentRange.end === slot.startTime) {
            // Extend current range
            currentRange.end = slot.endTime;
          } else {
            // Start new range
            ranges.push(currentRange);
            currentRange = { start: slot.startTime, end: slot.endTime };
          }
        }

        if (currentRange) {
          ranges.push(currentRange);
        }

        weeklyHours[day] = ranges;
      }
    }

    return weeklyHours;
  };

  const handleApplyDateOverride = async (dates: Date[], hours: TimeRange[]) => {
    if (!user?.uid) {
      toast.error("Error", "User not authenticated");
      return;
    }

    try {
      // Convert time ranges to slot IDs
      const slotIds: string[] = [];
      for (const range of hours) {
        const matchingSlots = timeSlots.filter(slot => {
          return slot.startTime >= range.start && slot.endTime <= range.end;
        });
        slotIds.push(...matchingSlots.map(s => s.id));
      }

      // Create overrides for each date
      const newOverrides: DateOverride[] = [];
      for (const date of dates) {
        const overrideId = await AvailabilityService.createScheduleOverride({
          therapistId: user.uid,
          date: Timestamp.fromDate(date),
          type: "custom_hours",
          reason: "Custom hours for specific date",
          affectedSlots: slotIds,
          isRecurring: false,
          metadata: {
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            notes: "Custom hours for specific date"
          }
        });

        newOverrides.push({
          id: overrideId,
          date,
          hours: [...hours]
        });
      }

      setDateOverrides([...dateOverrides, ...newOverrides]);
      
      toast.success(
        "Date Override Added",
        `Added specific hours for ${dates.length} date${dates.length !== 1 ? 's' : ''}`
      );
    } catch (error) {
      console.error("Error creating date override:", error);
      toast.error("Failed", "Failed to create date override");
    }
  };

  const handleDeleteOverride = async (id: string) => {
    try {
      await AvailabilityService.deleteScheduleOverride(id);
      setDateOverrides(dateOverrides.filter((o) => o.id !== id));
      toast.success("Override Deleted", "Date-specific hours have been removed");
    } catch (error) {
      console.error("Error deleting override:", error);
      toast.error("Failed", "Failed to delete override");
    }
  };

  const getTotalWeeklyHours = () => {
    let totalMinutes = 0;
    Object.values(weeklyHours).forEach((ranges: TimeRange[]) => {
      ranges.forEach((range: TimeRange) => {
        const [startHour, startMin] = range.start.split(":").map(Number);
        const [endHour, endMin] = range.end.split(":").map(Number);
        const minutes =
          endHour * 60 + endMin - (startHour * 60 + startMin);
        totalMinutes += minutes;
      });
    });
    return (totalMinutes / 60).toFixed(1);
  };

  const getActiveDays = () => {
    return Object.keys(weeklyHours).length;
  };

  if (authLoading || loading) {
    return (
      <TherapistLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </TherapistLayout>
    );
  }

  return (
    <TherapistLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Availability
            </h1>
            <p className="text-lg text-gray-600">
              Manage when you're available for appointments
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setLoading(true)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Weekly Hours</p>
                <p className="text-3xl font-bold text-gray-900">
                  {getTotalWeeklyHours()}h
                </p>
              </div>
              <Clock className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Days</p>
                <p className="text-3xl font-bold text-gray-900">
                  {getActiveDays()}
                </p>
              </div>
              <Calendar className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Date Overrides</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dateOverrides.length}
                </p>
              </div>
              <CalendarDays className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Working hours (default)</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Set your weekly availability schedule
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              {/* Weekly Hours Section */}
              <div className="flex-1">
                <WeeklyHoursEditor
                  weeklyHours={weeklyHours}
                  onChange={setWeeklyHours}
                />
              </div>

              {/* Date-specific Hours Section */}
              <div className="w-80">
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <CalendarDays className="h-5 w-5 text-gray-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Date-specific hours
                        </h3>
                        <p className="text-sm text-gray-600">
                          Adjust hours for specific days
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => setShowDateModal(true)}
                      className="w-full"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add hours
                    </Button>

                    {/* List of overrides */}
                    {dateOverrides.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-medium text-gray-600 uppercase">
                          Overrides ({dateOverrides.length})
                        </p>
                        {dateOverrides.map((override) => (
                          <div
                            key={override.id}
                            className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {override.date.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                              <p className="text-xs text-gray-600">
                                {override.hours
                                  .map((h) => `${h.start}-${h.end}`)
                                  .join(", ")}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteOverride(override.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveWeeklyHours}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Date-specific Hours Modal */}
      <DateSpecificHoursModal
        open={showDateModal}
        onClose={() => setShowDateModal(false)}
        onApply={handleApplyDateOverride}
      />
    </TherapistLayout>
  );
}
