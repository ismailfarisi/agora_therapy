"use client";

import React, { useState, useEffect } from "react";
import { TherapistLayout } from "@/components/therapist/TherapistLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { ScheduleOverrides } from "@/components/schedule/ScheduleOverrides";
import { AvailabilityCalendar } from "@/components/availability/AvailabilityCalendar";
import { AvailabilityService } from "@/lib/services/availability-service";
import { TimeSlotService } from "@/lib/services/timeslot-service";
import { ProfileService } from "@/lib/services/profile-service";
import { TimeSlot, TherapistAvailability } from "@/types/database";
import { Timestamp, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { documents } from "@/lib/firebase/collections";
import { cn } from "@/lib/utils";

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
  const [scheduleOverrides, setScheduleOverrides] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<"schedule" | "calendar">("schedule");
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

  // Date-specific overrides (kept for backward compatibility with stats)
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

        // Load existing availability from therapistProfile
        const therapistProfileRef = documents.therapistProfile(user.uid);
        const therapistProfileDoc = await getDoc(therapistProfileRef);
        
        if (therapistProfileDoc.exists()) {
          const profileData = therapistProfileDoc.data();
          const savedWeeklyHours = profileData?.availability?.weeklyHours;
          
          if (savedWeeklyHours && Object.keys(savedWeeklyHours).length > 0) {
            setWeeklyHours(savedWeeklyHours);
          }
        }

        // Load schedule overrides
        const overrides = await AvailabilityService.getScheduleOverrides(user.uid);
        setScheduleOverrides(overrides);
        
        // Convert for stats display
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

      // Save weeklyHours directly to therapistProfile
      const therapistProfileRef = documents.therapistProfile(user.uid);
      await updateDoc(therapistProfileRef, {
        "availability.weeklyHours": weeklyHours,
        "metadata.updatedAt": serverTimestamp(),
      });
      
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

  const handleCreateOverride = async (override: any) => {
    if (!user?.uid) {
      toast.error("Error", "User not authenticated");
      return;
    }

    try {
      const overrideId = await AvailabilityService.createScheduleOverride({
        ...override,
        therapistId: user.uid,
        metadata: {
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          notes: override.metadata?.notes || ""
        }
      });

      // Reload overrides
      const overrides = await AvailabilityService.getScheduleOverrides(user.uid);
      setScheduleOverrides(overrides);
      
      toast.success(
        "Override Created",
        "Schedule override has been added successfully"
      );
    } catch (error) {
      console.error("Error creating override:", error);
      toast.error("Failed", "Failed to create override");
    }
  };

  const handleUpdateOverride = async (id: string, updates: any) => {
    if (!user?.uid) return;
    
    try {
      await AvailabilityService.updateScheduleOverride(id, updates);
      
      // Reload overrides
      const overrides = await AvailabilityService.getScheduleOverrides(user.uid);
      setScheduleOverrides(overrides);
      
      toast.success(
        "Override Updated",
        "Schedule override has been updated successfully"
      );
    } catch (error) {
      console.error("Error updating override:", error);
      toast.error("Failed", "Failed to update override");
    }
  };

  const handleDeleteOverride = async (id: string) => {
    if (!user?.uid) return;
    
    try {
      await AvailabilityService.deleteScheduleOverride(id);
      
      // Reload overrides
      const overrides = await AvailabilityService.getScheduleOverrides(user.uid);
      setScheduleOverrides(overrides);
      setDateOverrides(dateOverrides.filter((o) => o.id !== id));
      
      toast.success("Override Deleted", "Schedule override has been removed");
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

      {/* View Toggle */}
      <div className="mb-6">
        <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white">
          <button
            onClick={() => setActiveView("schedule")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeView === "schedule"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Schedule Editor
          </button>
          <button
            onClick={() => setActiveView("calendar")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeView === "calendar"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Calendar View
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {activeView === "schedule" ? (
          <>
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
                <WeeklyHoursEditor
                  weeklyHours={weeklyHours}
                  onChange={setWeeklyHours}
                />
              </CardContent>
            </Card>

            {/* Schedule Overrides Section */}
            <ScheduleOverrides
              overrides={scheduleOverrides}
              timeSlots={timeSlots}
              onCreateOverride={handleCreateOverride}
              onUpdateOverride={handleUpdateOverride}
              onDeleteOverride={handleDeleteOverride}
            />
          </>
        ) : (
          <AvailabilityCalendar
            weeklyHours={weeklyHours}
            overrides={scheduleOverrides}
            onDayClick={(date) => {
              console.log("Day clicked:", date);
              // Could open a modal to show/edit details for this day
            }}
          />
        )}

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

    </TherapistLayout>
  );
}
