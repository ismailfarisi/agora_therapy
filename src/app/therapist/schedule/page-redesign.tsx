"use client";

import React, { useState, useEffect } from "react";
import { TherapistLayout } from "@/components/therapist/TherapistLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Calendar,
  Clock,
  BarChart3,
  Settings,
  Plus,
  RefreshCw,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { TimeSlotService } from "@/lib/services/timeslot-service";
import { AvailabilityService } from "@/lib/services/availability-service";
import { TherapistAvailability, TimeSlot } from "@/types/database";
import { Timestamp } from "firebase/firestore";
import { WeeklyScheduleView } from "@/components/schedule/WeeklyScheduleView";
import { ImprovedTimeSlotManager } from "@/components/schedule/ImprovedTimeSlotManager";

type ViewMode = "week" | "edit";

export default function TherapistSchedulePageRedesign() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [editingDay, setEditingDay] = useState<number | null>(null);

  // Data state
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availability, setAvailability] = useState<TherapistAvailability[]>([]);

  useEffect(() => {
    if (user?.uid) {
      loadScheduleData();
    }
  }, [user?.uid]);

  const loadScheduleData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      const [slotsData, availabilityData] = await Promise.all([
        TimeSlotService.getStandardTimeSlots(),
        AvailabilityService.getTherapistAvailability(user.uid),
      ]);

      setTimeSlots(slotsData);
      setAvailability(availabilityData);
    } catch (error) {
      console.error("Error loading schedule data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async (schedule: { [dayOfWeek: number]: string[] }) => {
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

      const newAvailability = await AvailabilityService.getTherapistAvailability(
        user.uid
      );
      setAvailability(newAvailability);

      setViewMode("week");
      setEditingDay(null);
    } catch (error) {
      console.error("Error saving schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDay = (dayOfWeek: number) => {
    setEditingDay(dayOfWeek);
    setViewMode("edit");
  };

  const handleQuickToggle = async (dayOfWeek: number, slotId: string) => {
    if (!user?.uid) return;

    try {
      const existingForDay = availability.filter(
        (a) => a.dayOfWeek === dayOfWeek && a.timeSlotId === slotId
      );

      if (existingForDay.length > 0) {
        // Remove
        await AvailabilityService.deleteAvailability(existingForDay[0].id);
      } else {
        // Add
        await AvailabilityService.createAvailability({
          therapistId: user.uid,
          dayOfWeek,
          timeSlotId: slotId,
          status: "available",
          maxConcurrentClients: 1,
          recurringPattern: { type: "weekly" },
          metadata: {
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          },
        });
      }

      await loadScheduleData();
    } catch (error) {
      console.error("Error toggling slot:", error);
    }
  };

  // Calculate stats
  const totalSlots = availability.length;
  const activeDays = new Set(availability.map((a) => a.dayOfWeek)).size;
  const totalHours = (
    availability.reduce((sum, a) => {
      const slot = timeSlots.find((s) => s.id === a.timeSlotId);
      return sum + (slot?.duration || 0);
    }, 0) / 60
  ).toFixed(1);

  // Get upcoming week availability
  const today = new Date();
  const dayOfWeek = today.getDay();
  const upcomingSlots = availability.filter((a) => a.dayOfWeek >= dayOfWeek);

  if (loading) {
    return (
      <TherapistLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </TherapistLayout>
    );
  }

  if (viewMode === "edit") {
    return (
      <TherapistLayout>
        <ImprovedTimeSlotManager
          timeSlots={timeSlots}
          existingAvailability={availability}
          onSave={handleSaveSchedule}
          onCancel={() => {
            setViewMode("week");
            setEditingDay(null);
          }}
        />
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
              Schedule Management
            </h1>
            <p className="text-lg text-gray-600">
              Manage your weekly availability and time slots
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={loadScheduleData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => setViewMode("edit")}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Settings className="h-4 w-4 mr-2" />
              Setup Weekly Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Time Slots</p>
                <p className="text-3xl font-bold text-gray-900">{totalSlots}</p>
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
                <p className="text-3xl font-bold text-gray-900">{activeDays}</p>
              </div>
              <Calendar className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Weekly Hours</p>
                <p className="text-3xl font-bold text-gray-900">{totalHours}h</p>
              </div>
              <BarChart3 className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-3xl font-bold text-gray-900">
                  {upcomingSlots.length}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {totalSlots === 0 && (
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Schedule Set Up Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by setting up your weekly availability. Choose from
              templates or create a custom schedule.
            </p>
            <Button
              onClick={() => setViewMode("edit")}
              size="lg"
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Setup Your Schedule
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Weekly View */}
      {totalSlots > 0 && (
        <WeeklyScheduleView
          timeSlots={timeSlots}
          availability={availability}
          onEditDay={handleEditDay}
          onQuickToggle={handleQuickToggle}
        />
      )}

      {/* Help Section */}
      <Card className="mt-8 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💡 Quick Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-teal-600 mr-2">•</span>
              <span>
                Click on any day card to expand and see all available time slots
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-600 mr-2">•</span>
              <span>
                Use "Setup Weekly Schedule" to quickly configure your entire week
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-600 mr-2">•</span>
              <span>
                Copy schedules between days to save time on similar availability
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-600 mr-2">•</span>
              <span>
                Your schedule automatically repeats weekly until you change it
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </TherapistLayout>
  );
}
