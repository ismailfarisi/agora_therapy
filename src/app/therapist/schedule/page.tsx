/**
 * Therapist Schedule Management Page
 * Main schedule management interface for therapists
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Settings,
  BarChart3,
  Plus,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";

// Import our schedule components
import { AvailabilityCalendar } from "@/components/schedule/AvailabilityCalendar";
import { TimeSlotPicker } from "@/components/schedule/TimeSlotPicker";
import {
  RecurringScheduleSetup,
  type WeeklySchedule,
} from "@/components/schedule/RecurringScheduleSetup";
import { ScheduleOverrides } from "@/components/schedule/ScheduleOverrides";
import { AvailabilityStats } from "@/components/schedule/AvailabilityStats";

// Import services
import { TimeSlotService } from "@/lib/services/timeslot-service";
import { AvailabilityService } from "@/lib/services/availability-service";

// Import types
import {
  TherapistAvailability,
  TimeSlot,
  ScheduleOverride,
} from "@/types/database";
import { Timestamp } from "firebase/firestore";

export default function TherapistSchedulePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [showRecurringSetup, setShowRecurringSetup] = useState(false);

  // Data state
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availability, setAvailability] = useState<TherapistAvailability[]>([]);
  const [overrides, setOverrides] = useState<ScheduleOverride[]>([]);

  // Load initial data
  useEffect(() => {
    if (user?.uid) {
      loadScheduleData();
    }
  }, [user?.uid]);

  const loadScheduleData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      // Load time slots
      const slotsData = await TimeSlotService.getStandardTimeSlots();
      setTimeSlots(slotsData);

      // Load therapist availability
      const availabilityData =
        await AvailabilityService.getTherapistAvailability(user.uid);
      setAvailability(availabilityData);

      // Load schedule overrides for the next 3 months
      const fromDate = new Date();
      const toDate = new Date();
      toDate.setMonth(toDate.getMonth() + 3);

      const overridesData = await AvailabilityService.getScheduleOverrides(
        user.uid,
        fromDate,
        toDate
      );
      setOverrides(overridesData);
    } catch (error) {
      console.error("Error loading schedule data:", error);
      toast({
        title: "Error",
        description:
          "Failed to load schedule data. Please refresh and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = async (
    dayOfWeek: number,
    timeSlotIds: string[]
  ) => {
    if (!user?.uid) return;

    try {
      // Remove existing availability for this day
      const existingForDay = availability.filter(
        (a) => a.dayOfWeek === dayOfWeek
      );
      for (const existing of existingForDay) {
        await AvailabilityService.deleteAvailability(existing.id);
      }

      // Create new availability records
      const createdIds: string[] = [];
      for (const timeSlotId of timeSlotIds) {
        const id = await AvailabilityService.createAvailability({
          therapistId: user.uid,
          dayOfWeek,
          timeSlotId,
          status: "available",
          maxConcurrentClients: 1,
          recurringPattern: { type: "weekly" },
          metadata: {
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          },
        });
        createdIds.push(id);
      }

      // Update local state
      const newAvailability = availability.filter(
        (a) => a.dayOfWeek !== dayOfWeek
      );
      const addedAvailability = await Promise.all(
        createdIds.map((id) => AvailabilityService.getAvailabilityRecord(id))
      );

      setAvailability([
        ...newAvailability,
        ...(addedAvailability.filter(Boolean) as TherapistAvailability[]),
      ]);

      toast({
        title: "Success",
        description: "Availability updated successfully",
      });
    } catch (error) {
      console.error("Error updating availability:", error);
      toast({
        title: "Error",
        description: "Failed to update availability. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRecurringScheduleComplete = async (schedule: WeeklySchedule) => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      const scheduleData = Object.entries(schedule).map(
        ([dayStr, timeSlotIds]) => ({
          dayOfWeek: parseInt(dayStr),
          timeSlotIds,
        })
      );

      await AvailabilityService.bulkSetAvailability(user.uid, scheduleData);

      // Reload availability data
      const newAvailability =
        await AvailabilityService.getTherapistAvailability(user.uid);
      setAvailability(newAvailability);

      setShowRecurringSetup(false);
      toast({
        title: "Success",
        description: "Weekly schedule applied successfully",
      });
    } catch (error) {
      console.error("Error applying recurring schedule:", error);
      toast({
        title: "Error",
        description: "Failed to apply schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOverride = async (
    overrideData: Omit<ScheduleOverride, "id">
  ) => {
    if (!user?.uid) return;

    try {
      const overrideWithTherapist = {
        ...overrideData,
        therapistId: user.uid,
        date: Timestamp.fromDate(overrideData.date as any),
        recurringUntil: overrideData.recurringUntil
          ? Timestamp.fromDate(overrideData.recurringUntil as any)
          : undefined,
      } as Omit<ScheduleOverride, "id">;

      await AvailabilityService.createScheduleOverride(overrideWithTherapist);

      // Reload overrides
      const newOverrides = await AvailabilityService.getScheduleOverrides(
        user.uid
      );
      setOverrides(newOverrides);

      toast({
        title: "Success",
        description: "Schedule override created successfully",
      });
    } catch (error) {
      console.error("Error creating override:", error);
      toast({
        title: "Error",
        description: "Failed to create override. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateOverride = async (
    id: string,
    updates: Partial<ScheduleOverride>
  ) => {
    try {
      const updateData = {
        ...updates,
        date: updates.date
          ? Timestamp.fromDate(updates.date as any)
          : undefined,
        recurringUntil: updates.recurringUntil
          ? Timestamp.fromDate(updates.recurringUntil as any)
          : undefined,
      };

      await AvailabilityService.updateScheduleOverride(id, updateData);

      // Update local state
      setOverrides((prev) =>
        prev.map((override) =>
          override.id === id ? { ...override, ...updates } : override
        )
      );

      toast({
        title: "Success",
        description: "Schedule override updated successfully",
      });
    } catch (error) {
      console.error("Error updating override:", error);
      toast({
        title: "Error",
        description: "Failed to update override. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOverride = async (id: string) => {
    try {
      await AvailabilityService.deleteScheduleOverride(id);

      // Remove from local state
      setOverrides((prev) => prev.filter((override) => override.id !== id));

      toast({
        title: "Success",
        description: "Schedule override deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting override:", error);
      toast({
        title: "Error",
        description: "Failed to delete override. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (showRecurringSetup) {
    return (
      <div className="container mx-auto p-6">
        <RecurringScheduleSetup
          timeSlots={timeSlots}
          existingAvailability={availability}
          onComplete={handleRecurringScheduleComplete}
          onCancel={() => setShowRecurringSetup(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Schedule Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your availability and schedule settings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadScheduleData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button onClick={() => setShowRecurringSetup(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Setup Weekly Schedule
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Time Slots</p>
                <p className="text-2xl font-bold">{availability.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Days</p>
                <p className="text-2xl font-bold">
                  {new Set(availability.map((a) => a.dayOfWeek)).size}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Weekly Hours</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    (availability.reduce((total, avail) => {
                      const slot = timeSlots.find(
                        (ts) => ts.id === avail.timeSlotId
                      );
                      return total + (slot?.duration || 0);
                    }, 0) /
                      60) *
                      10
                  ) / 10}
                  h
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overrides</p>
                <p className="text-2xl font-bold">{overrides.length}</p>
              </div>
              <Settings className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="timeslots">Time Slots</TabsTrigger>
          <TabsTrigger value="overrides">Overrides</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <AvailabilityCalendar
            therapistId={user?.uid || ""}
            availability={availability}
            overrides={overrides}
            timeSlots={timeSlots}
            onDateClick={setSelectedDate}
            onAvailabilityChange={handleAvailabilityChange}
            onOverrideCreate={(date) => {
              setSelectedDate(date);
              setActiveTab("overrides");
            }}
            selectedDate={selectedDate}
          />
        </TabsContent>

        <TabsContent value="timeslots" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Time Slots</CardTitle>
              </CardHeader>
              <CardContent>
                <TimeSlotPicker
                  timeSlots={timeSlots}
                  selectedSlotIds={[]}
                  showSelectAll={false}
                  disabled={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setShowRecurringSetup(true)}
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Setup Weekly Recurring Schedule
                </Button>

                <Button variant="outline" className="w-full" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Schedule (Coming Soon)
                </Button>

                <Button variant="outline" className="w-full" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Export Schedule (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overrides" className="space-y-4">
          <ScheduleOverrides
            overrides={overrides}
            timeSlots={timeSlots}
            onCreateOverride={handleCreateOverride}
            onUpdateOverride={handleUpdateOverride}
            onDeleteOverride={handleDeleteOverride}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AvailabilityStats
            availability={availability}
            overrides={overrides}
            timeSlots={timeSlots}
            dateRange={{
              from: new Date(),
              to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
