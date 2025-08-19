/**
 * Availability Statistics Component
 * Analytics and availability statistics display
 */

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  TherapistAvailability,
  ScheduleOverride,
  TimeSlot,
} from "@/types/database";
import { cn } from "@/lib/utils";
import { getDayNames } from "@/lib/utils/calendar-utils";

export interface AvailabilityStatsProps {
  availability: TherapistAvailability[];
  overrides: ScheduleOverride[];
  timeSlots: TimeSlot[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  className?: string;
}

export function AvailabilityStats({
  availability = [],
  overrides = [],
  timeSlots = [],
  dateRange,
  className,
}: AvailabilityStatsProps) {
  const dayNames = getDayNames("short");

  // Calculate availability by day of week
  const availabilityByDay = availability.reduce((acc, avail) => {
    if (!acc[avail.dayOfWeek]) {
      acc[avail.dayOfWeek] = [];
    }
    acc[avail.dayOfWeek].push(avail);
    return acc;
  }, {} as Record<number, TherapistAvailability[]>);

  // Calculate total weekly hours
  const totalWeeklyHours =
    availability.reduce((total, avail) => {
      const timeSlot = timeSlots.find((ts) => ts.id === avail.timeSlotId);
      return total + (timeSlot?.duration || 0);
    }, 0) / 60;

  // Calculate average daily hours
  const activeDays = Object.keys(availabilityByDay).length;
  const averageDailyHours = activeDays > 0 ? totalWeeklyHours / activeDays : 0;

  // Count overrides by type
  const overrideStats = overrides.reduce((acc, override) => {
    acc[override.type] = (acc[override.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get busiest and quietest days
  const dayStats = Object.entries(availabilityByDay).map(([day, slots]) => ({
    dayOfWeek: parseInt(day),
    dayName: dayNames[parseInt(day)],
    slotCount: slots.length,
    totalHours:
      slots.reduce((total, slot) => {
        const timeSlot = timeSlots.find((ts) => ts.id === slot.timeSlotId);
        return total + (timeSlot?.duration || 0);
      }, 0) / 60,
  }));

  const busiestDay = dayStats.reduce(
    (max, day) => (day.totalHours > max.totalHours ? day : max),
    { dayName: "None", totalHours: 0, slotCount: 0, dayOfWeek: -1 }
  );

  const quietestDay = dayStats.reduce(
    (min, day) => (day.totalHours < min.totalHours ? day : min),
    { dayName: "None", totalHours: Infinity, slotCount: 0, dayOfWeek: -1 }
  );

  // Calculate utilization rate (assuming 8 hours per day maximum)
  const maxPossibleHours = 8 * 7; // 8 hours per day, 7 days
  const utilizationRate = (totalWeeklyHours / maxPossibleHours) * 100;

  const stats = [
    {
      title: "Weekly Hours",
      value: `${totalWeeklyHours.toFixed(1)}h`,
      subtitle: `${availability.length} time slots`,
      icon: <Clock className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Days",
      value: `${activeDays}`,
      subtitle: `of 7 days`,
      icon: <Calendar className="h-5 w-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Daily Average",
      value: `${averageDailyHours.toFixed(1)}h`,
      subtitle: "per active day",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Utilization",
      value: `${utilizationRate.toFixed(0)}%`,
      subtitle: "of potential hours",
      icon: <BarChart3 className="h-5 w-5" />,
      color: utilizationRate > 50 ? "text-green-600" : "text-orange-600",
      bgColor: utilizationRate > 50 ? "bg-green-50" : "bg-orange-50",
    },
  ];

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Availability Statistics
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className={cn("p-4 rounded-lg", stat.bgColor)}>
              <div className="flex items-center justify-between">
                <div className={stat.color}>{stat.icon}</div>
                <Badge variant="outline" className="text-xs">
                  {stat.subtitle}
                </Badge>
              </div>
              <div className="mt-2">
                <div className={cn("text-2xl font-bold", stat.color)}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Schedule Overview */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Weekly Schedule</h4>
          <div className="grid grid-cols-7 gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
              const daySlots = availabilityByDay[dayOfWeek] || [];
              const dayHours =
                daySlots.reduce((total, slot) => {
                  const timeSlot = timeSlots.find(
                    (ts) => ts.id === slot.timeSlotId
                  );
                  return total + (timeSlot?.duration || 0);
                }, 0) / 60;

              const maxDayHours = Math.max(
                ...dayStats.map((d) => d.totalHours),
                1
              );
              const heightPercent = (dayHours / maxDayHours) * 100;

              return (
                <div key={dayOfWeek} className="text-center">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    {dayNames[dayOfWeek]}
                  </div>
                  <div className="relative h-20 bg-gray-100 rounded flex items-end justify-center">
                    {dayHours > 0 && (
                      <div
                        className="bg-blue-500 rounded-sm w-full transition-all"
                        style={{ height: `${Math.max(heightPercent, 10)}%` }}
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white drop-shadow-sm">
                        {dayHours > 0 ? `${dayHours.toFixed(1)}h` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {daySlots.length} slot{daySlots.length === 1 ? "" : "s"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Schedule Insights
            </h4>
            <div className="space-y-3">
              {busiestDay.totalHours > 0 && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-green-900">
                      Busiest Day: {busiestDay.dayName}
                    </div>
                    <div className="text-xs text-green-700">
                      {busiestDay.totalHours.toFixed(1)} hours,{" "}
                      {busiestDay.slotCount} slots
                    </div>
                  </div>
                </div>
              )}

              {quietestDay.totalHours < Infinity &&
                quietestDay.totalHours > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-blue-900">
                        Lightest Day: {quietestDay.dayName}
                      </div>
                      <div className="text-xs text-blue-700">
                        {quietestDay.totalHours.toFixed(1)} hours,{" "}
                        {quietestDay.slotCount} slots
                      </div>
                    </div>
                  </div>
                )}

              {utilizationRate < 30 && (
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="text-sm font-medium text-orange-900">
                      Low Utilization
                    </div>
                    <div className="text-xs text-orange-700">
                      Consider adding more availability
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Schedule Overrides
            </h4>
            <div className="space-y-3">
              {Object.keys(overrideStats).length === 0 ? (
                <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg text-center">
                  No schedule overrides
                </div>
              ) : (
                Object.entries(overrideStats).map(([type, count]) => {
                  const getTypeInfo = (overrideType: string) => {
                    switch (overrideType) {
                      case "day_off":
                        return {
                          label: "Days Off",
                          icon: <XCircle className="h-4 w-4" />,
                          color: "text-red-600",
                          bg: "bg-red-50",
                        };
                      case "time_off":
                        return {
                          label: "Time Off",
                          icon: <Clock className="h-4 w-4" />,
                          color: "text-yellow-600",
                          bg: "bg-yellow-50",
                        };
                      case "custom_hours":
                        return {
                          label: "Custom Hours",
                          icon: <Calendar className="h-4 w-4" />,
                          color: "text-blue-600",
                          bg: "bg-blue-50",
                        };
                      default:
                        return {
                          label: type,
                          icon: <Calendar className="h-4 w-4" />,
                          color: "text-gray-600",
                          bg: "bg-gray-50",
                        };
                    }
                  };

                  const typeInfo = getTypeInfo(type);

                  return (
                    <div
                      key={type}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        typeInfo.bg
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={typeInfo.color}>{typeInfo.icon}</div>
                        <span className="text-sm font-medium">
                          {typeInfo.label}
                        </span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {(utilizationRate < 30 || activeDays < 5) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recommendations
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              {utilizationRate < 30 && (
                <div>
                  • Consider increasing your weekly availability to reach more
                  clients
                </div>
              )}
              {activeDays < 5 && (
                <div>
                  • Adding availability on {7 - activeDays} more day
                  {7 - activeDays === 1 ? "" : "s"} could improve client access
                </div>
              )}
              {totalWeeklyHours < 20 && (
                <div>• Current schedule is well below full-time capacity</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AvailabilityStats;
