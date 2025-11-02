"use client";

import React, { useState, useEffect } from "react";
import { TherapistLayout } from "@/components/therapist/TherapistLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Calendar,
  Clock,
  Settings as SettingsIcon,
  List,
  CalendarDays,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { WeeklyHoursEditor } from "@/components/availability/WeeklyHoursEditor";
import { DateSpecificHoursModal } from "@/components/availability/DateSpecificHoursModal";

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
  const [activeView, setActiveView] = useState<"list" | "calendar">("list");
  const [showDateModal, setShowDateModal] = useState(false);

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

  const handleSaveWeeklyHours = async () => {
    // TODO: Save to backend
    console.log("Saving weekly hours:", weeklyHours);
  };

  const handleApplyDateOverride = (dates: Date[], hours: TimeRange[]) => {
    const newOverrides = dates.map((date) => ({
      id: `${date.getTime()}-${Math.random()}`,
      date,
      hours: [...hours],
    }));
    setDateOverrides([...dateOverrides, ...newOverrides]);
  };

  const handleDeleteOverride = (id: string) => {
    setDateOverrides(dateOverrides.filter((o) => o.id !== id));
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
      <Tabs defaultValue="schedules" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedules">
            <Clock className="h-4 w-4 mr-2" />
            Schedules
          </TabsTrigger>
          <TabsTrigger value="calendar-settings">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Calendar settings
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Advanced settings
          </TabsTrigger>
        </TabsList>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Working hours (default)</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Active on: 1 event type
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setActiveView(activeView === "list" ? "calendar" : "list")
                    }
                  >
                    {activeView === "list" ? (
                      <>
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Calendar
                      </>
                    ) : (
                      <>
                        <List className="h-4 w-4 mr-2" />
                        List
                      </>
                    )}
                  </Button>
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
            >
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* Calendar Settings Tab */}
        <TabsContent value="calendar-settings">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">Calendar settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings Tab */}
        <TabsContent value="advanced">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">Advanced settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Date-specific Hours Modal */}
      <DateSpecificHoursModal
        open={showDateModal}
        onClose={() => setShowDateModal(false)}
        onApply={handleApplyDateOverride}
      />
    </TherapistLayout>
  );
}
