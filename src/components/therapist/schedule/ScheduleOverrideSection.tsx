"use client";

import React from "react";
import { CalendarX, Plus, Edit, Clock } from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRealtimeAvailability } from "@/lib/hooks/useRealtimeAvailability";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { ScheduleOverride } from "@/types/database";

interface ScheduleOverrideSectionProps {
  onManageOverrides: () => void;
  onAddOverride: () => void;
}

/**
 * ScheduleOverrideSection - Card component showing override summary and management buttons
 * Displays current schedule overrides and provides management actions
 */
export const ScheduleOverrideSection: React.FC<
  ScheduleOverrideSectionProps
> = ({ onManageOverrides, onAddOverride }) => {
  const { user } = useAuth();
  const { overrides, isLoading, error } = useRealtimeAvailability({
    therapistId: user?.uid || "",
    enableRealtime: true,
    includeOverrides: true,
  });

  const getActiveOverrides = () => {
    if (!overrides) return [];

    const today = new Date();
    const futureDate = addDays(today, 30); // Show overrides for next 30 days

    return overrides
      .filter((override) => {
        const overrideDate = override.date.toDate();
        return (
          isAfter(overrideDate, today) && isBefore(overrideDate, futureDate)
        );
      })
      .sort(
        (a, b) =>
          new Date(a.date.toDate()).getTime() -
          new Date(b.date.toDate()).getTime()
      );
  };

  const getPastOverrides = () => {
    if (!overrides) return [];

    const today = new Date();
    return overrides.filter((override) => {
      const overrideDate = override.date.toDate();
      return isBefore(overrideDate, today);
    });
  };

  const getOverrideTypeInfo = (override: ScheduleOverride) => {
    if (override.type === "day_off") {
      return {
        type: "Day Off",
        icon: CalendarX,
        variant: "destructive" as const,
        description: "Day blocked",
      };
    }

    if (override.type === "time_off") {
      const slotCount = override.affectedSlots?.length || 0;
      return {
        type: "Time Off",
        icon: Clock,
        variant: "secondary" as const,
        description: `${slotCount} slot${slotCount === 1 ? "" : "s"} blocked`,
      };
    }

    if (override.type === "custom_hours") {
      const slotCount = override.affectedSlots?.length || 0;
      return {
        type: "Custom Hours",
        icon: Clock,
        variant: "default" as const,
        description: `${slotCount} slot${slotCount === 1 ? "" : "s"}`,
      };
    }

    return {
      type: "Override",
      icon: Edit,
      variant: "outline" as const,
      description: "Modified",
    };
  };

  const activeOverrides = getActiveOverrides();
  const pastOverrides = getPastOverrides();

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarX className="h-5 w-5" />
            Schedule Overrides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <CalendarX className="h-4 w-4" />
            <span className="text-sm">Error loading schedule overrides</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarX className="h-5 w-5" />
            Schedule Overrides
          </div>
          {activeOverrides.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeOverrides.length} active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner className="h-6 w-6" />
          </div>
        ) : (
          <>
            {/* Active Overrides */}
            {activeOverrides.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Upcoming Overrides
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activeOverrides.slice(0, 5).map((override) => {
                    const typeInfo = getOverrideTypeInfo(override);
                    const TypeIcon = typeInfo.icon;

                    return (
                      <div
                        key={override.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-muted-foreground">
                            <TypeIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              {format(override.date.toDate(), "EEE, MMM d")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {override.reason || typeInfo.description}
                            </div>
                          </div>
                        </div>
                        <Badge variant={typeInfo.variant} className="text-xs">
                          {typeInfo.type}
                        </Badge>
                      </div>
                    );
                  })}

                  {activeOverrides.length > 5 && (
                    <div className="text-center py-2">
                      <span className="text-xs text-muted-foreground">
                        +{activeOverrides.length - 5} more overrides
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <CalendarX className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No upcoming schedule overrides
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add overrides to modify your schedule for specific dates
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={onAddOverride}
                variant="default"
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Override
              </Button>
              {activeOverrides.length > 0 && (
                <Button onClick={onManageOverrides} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Manage All
                </Button>
              )}
            </div>

            {/* Summary Stats */}
            {(activeOverrides.length > 0 || pastOverrides.length > 0) && (
              <div className="pt-3 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">
                      {activeOverrides.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      {pastOverrides.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Past</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleOverrideSection;
