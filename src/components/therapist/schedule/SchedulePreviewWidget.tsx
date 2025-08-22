"use client";

import React from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRealtimeAvailability } from "@/lib/hooks/useRealtimeAvailability";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";

/**
 * SchedulePreviewWidget - Shows next 7 days of availability
 * Provides a quick overview of the therapist's upcoming schedule
 */
export const SchedulePreviewWidget: React.FC = () => {
  const { user } = useAuth();
  const { availability, isLoading, error } = useRealtimeAvailability({
    therapistId: user?.uid || "",
    enableRealtime: true,
  });

  // Generate next 7 days starting from today
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  const getAvailabilityForDay = (date: Date) => {
    if (!availability) return { slots: 0, status: "unavailable" as const };

    const dayOfWeek = date.getDay();
    const dayAvailability = availability.filter(
      (a) => a.dayOfWeek === dayOfWeek && a.status === "available"
    );

    if (!dayAvailability.length)
      return { slots: 0, status: "unavailable" as const };

    const availableSlots = dayAvailability.length;

    if (availableSlots === 0)
      return { slots: 0, status: "unavailable" as const };
    if (availableSlots <= 2)
      return { slots: availableSlots, status: "limited" as const };
    return { slots: availableSlots, status: "available" as const };
  };

  const getStatusBadge = (
    status: "available" | "limited" | "unavailable",
    slots: number
  ) => {
    const variants = {
      available: { variant: "default" as const, text: `${slots} slots` },
      limited: { variant: "secondary" as const, text: `${slots} slots` },
      unavailable: { variant: "outline" as const, text: "Unavailable" },
    };

    return variants[status];
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Schedule Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">
            Error loading schedule preview
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Schedule Preview - Next 7 Days
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner className="h-6 w-6" />
          </div>
        ) : (
          <div className="space-y-2">
            {weekDays.map((date, index) => {
              const { slots, status } = getAvailabilityForDay(date);
              const badgeInfo = getStatusBadge(status, slots);
              const isToday = index === 0;

              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    "flex items-center justify-between py-2 px-3 rounded-lg transition-colors",
                    isToday && "bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">
                      {format(date, "EEE")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(date, "MMM d")}
                      {isToday && (
                        <span className="ml-1 text-xs font-medium text-primary">
                          (Today)
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={badgeInfo.variant} className="text-xs">
                    {badgeInfo.text}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && availability && (
          <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
            Click &quot;Manage Schedule&quot; to configure your availability
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SchedulePreviewWidget;
