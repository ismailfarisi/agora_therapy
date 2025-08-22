"use client";

import React from "react";
import {
  Calendar,
  Clock,
  Settings,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRealtimeAvailability } from "@/lib/hooks/useRealtimeAvailability";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";

interface ScheduleConfigurationSectionProps {
  onSetupClick: () => void;
  onManageClick: () => void;
}

/**
 * ScheduleConfigurationSection - Card component showing schedule status and setup buttons
 * Displays current schedule configuration status and provides action buttons
 */
export const ScheduleConfigurationSection: React.FC<
  ScheduleConfigurationSectionProps
> = ({ onSetupClick, onManageClick }) => {
  const { user } = useAuth();
  const { availability, isLoading, error } = useRealtimeAvailability({
    therapistId: user?.uid || "",
    enableRealtime: true,
  });

  const getScheduleStatus = () => {
    if (!availability || availability.length === 0) {
      return {
        status: "not_configured" as const,
        title: "Schedule Not Set Up",
        description:
          "Configure your recurring weekly schedule to start accepting appointments",
        icon: AlertCircle,
        iconColor: "text-amber-500",
        badgeVariant: "secondary" as const,
        badgeText: "Setup Required",
      };
    }

    const activeSlots = availability.filter(
      (avail) => avail.status === "available"
    );

    if (activeSlots.length === 0) {
      return {
        status: "inactive" as const,
        title: "Schedule Configured",
        description:
          "Your schedule is set up but no time slots are currently active",
        icon: Clock,
        iconColor: "text-blue-500",
        badgeVariant: "outline" as const,
        badgeText: "Inactive",
      };
    }

    return {
      status: "active" as const,
      title: "Schedule Active",
      description:
        "Your recurring schedule is configured and accepting appointments",
      icon: CheckCircle,
      iconColor: "text-green-500",
      badgeVariant: "default" as const,
      badgeText: "Active",
    };
  };

  const scheduleInfo = getScheduleStatus();
  const StatusIcon = scheduleInfo.icon;

  const getActiveSlotsSummary = () => {
    if (!availability) return null;

    const activeDaysByDayOfWeek = availability.reduce((acc, avail) => {
      if (avail.status === "available") {
        acc[avail.dayOfWeek] = (acc[avail.dayOfWeek] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    const activeDays = Object.keys(activeDaysByDayOfWeek).length;
    const totalSlots = availability.filter(
      (avail) => avail.status === "available"
    ).length;

    if (activeDays === 0) return null;

    return `${activeDays} day${
      activeDays === 1 ? "" : "s"
    } • ${totalSlots} slot${totalSlots === 1 ? "" : "s"} per week`;
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Schedule Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              Error loading schedule configuration
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Schedule Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner className="h-6 w-6" />
          </div>
        ) : (
          <>
            {/* Status Section */}
            <div className="flex items-start gap-3">
              <div className={cn("mt-0.5", scheduleInfo.iconColor)}>
                <StatusIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm">{scheduleInfo.title}</h3>
                  <Badge
                    variant={scheduleInfo.badgeVariant}
                    className="text-xs"
                  >
                    {scheduleInfo.badgeText}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {scheduleInfo.description}
                </p>
                {getActiveSlotsSummary() && (
                  <p className="text-xs text-muted-foreground font-medium">
                    {getActiveSlotsSummary()}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {scheduleInfo.status === "not_configured" ? (
                <Button onClick={onSetupClick} className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Set Up Schedule
                </Button>
              ) : (
                <>
                  <Button
                    onClick={onManageClick}
                    variant="default"
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Schedule
                  </Button>
                  <Button onClick={onSetupClick} variant="outline" size="sm">
                    <Clock className="h-4 w-4 mr-2" />
                    Edit Hours
                  </Button>
                </>
              )}
            </div>

            {/* Quick Stats */}
            {scheduleInfo.status === "active" && (
              <div className="pt-3 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">
                      {availability
                        ? Object.keys(
                            availability.reduce((acc, avail) => {
                              if (avail.status === "available")
                                acc[avail.dayOfWeek] = true;
                              return acc;
                            }, {} as Record<number, boolean>)
                          ).length
                        : 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Active Days
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      {availability
                        ? availability.filter(
                            (avail) => avail.status === "available"
                          ).length
                        : 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Weekly Slots
                    </div>
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

export default ScheduleConfigurationSection;
