"use client";

import React, { useState } from "react";
import { Calendar, Settings, TrendingUp, Clock, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";
import { SchedulePreviewWidget } from "./SchedulePreviewWidget";
import { ScheduleConfigurationSection } from "./ScheduleConfigurationSection";
import { ScheduleOverrideSection } from "./ScheduleOverrideSection";
import { ScheduleSetupModal } from "./ScheduleSetupModal";
import { AvailabilityStats } from "@/components/schedule/AvailabilityStats";

import { TherapistProfile } from "@/types/database";

interface EnhancedAvailabilityTabProps {
  profile: TherapistProfile | null;
  onUpdate: (updates: Partial<TherapistProfile>) => Promise<void>;
  isLoading: boolean;
}

/**
 * EnhancedAvailabilityTab - The main container that replaces the existing "Rates & Availability" tab content
 * Provides a comprehensive schedule management interface with improved UX
 */
export const EnhancedAvailabilityTab: React.FC<
  EnhancedAvailabilityTabProps
> = ({ profile, onUpdate, isLoading }) => {
  const { user } = useAuth();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleModalTab, setScheduleModalTab] = useState<
    "schedule" | "overrides"
  >("schedule");

  const handleSetupSchedule = () => {
    setScheduleModalTab("schedule");
    setIsScheduleModalOpen(true);
  };

  const handleManageSchedule = () => {
    setScheduleModalTab("schedule");
    setIsScheduleModalOpen(true);
  };

  const handleManageOverrides = () => {
    setScheduleModalTab("overrides");
    setIsScheduleModalOpen(true);
  };

  const handleAddOverride = () => {
    setScheduleModalTab("overrides");
    setIsScheduleModalOpen(true);
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Please log in to manage your schedule
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Schedule Management
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your availability, rates, and appointment scheduling
            </p>
          </div>
          <Button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Quick Setup
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schedule Configuration */}
          <ScheduleConfigurationSection
            onSetupClick={handleSetupSchedule}
            onManageClick={handleManageSchedule}
          />

          {/* Schedule Overrides */}
          <ScheduleOverrideSection
            onManageOverrides={handleManageOverrides}
            onAddOverride={handleAddOverride}
          />

          {/* Availability Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Availability Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>
                  Availability statistics will be calculated based on your
                  configured schedule.
                </p>
                <p className="mt-2">
                  Set up your recurring schedule to see detailed analytics.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview & Quick Actions */}
        <div className="space-y-6">
          {/* Schedule Preview */}
          <SchedulePreviewWidget />

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleSetupSchedule}
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Edit Weekly Schedule
              </Button>

              <Button
                onClick={handleAddOverride}
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <Clock className="h-4 w-4 mr-2" />
                Add Schedule Exception
              </Button>

              <div className="border-t pt-3 mt-3">
                <div className="text-xs text-muted-foreground">
                  <p className="mb-1">Need help?</p>
                  <p>
                    Set up your recurring weekly schedule first, then add
                    exceptions for holidays or special dates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <p>
                    Set consistent weekly hours to build client trust and
                    predictability
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <p>
                    Use overrides to block vacation days or add extra
                    availability
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <p>
                    Review your availability statistics to optimize scheduling
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schedule Setup Modal */}
      <ScheduleSetupModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        initialTab={scheduleModalTab}
        therapistId={user.uid}
      />
    </div>
  );
};

export default EnhancedAvailabilityTab;
