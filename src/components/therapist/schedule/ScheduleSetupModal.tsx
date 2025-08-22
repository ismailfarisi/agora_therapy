"use client";

import React, { useState } from "react";
import { X, Calendar, Settings, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecurringScheduleSetup } from "@/components/schedule/RecurringScheduleSetup";
import { ScheduleOverrides } from "@/components/schedule/ScheduleOverrides";
import { cn } from "@/lib/utils";

interface ScheduleSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "schedule" | "overrides";
  therapistId: string;
}

/**
 * ScheduleSetupModal - Container modal that embeds existing schedule components
 * Provides a unified interface for managing both recurring schedule and overrides
 */
export const ScheduleSetupModal: React.FC<ScheduleSetupModalProps> = ({
  isOpen,
  onClose,
  initialTab = "schedule",
  therapistId,
}) => {
  const [activeTab, setActiveTab] = useState<"schedule" | "overrides">(
    initialTab
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to close without saving?"
      );
      if (!confirmed) return;
    }
    onClose();
    setHasUnsavedChanges(false);
  };

  const handleTabChange = (value: string) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Switching tabs will discard them. Continue?"
      );
      if (!confirmed) return;
      setHasUnsavedChanges(false);
    }
    setActiveTab(value as "schedule" | "overrides");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onInteractOutside={(e) => {
          if (hasUnsavedChanges) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="flex-shrink-0 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Management
            </DialogTitle>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge variant="destructive" className="text-xs">
                  Unsaved Changes
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          {hasUnsavedChanges && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                You have unsaved changes. Make sure to save your changes before
                closing.
              </AlertDescription>
            </Alert>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Recurring Schedule
              </TabsTrigger>
              <TabsTrigger
                value="overrides"
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Schedule Overrides
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="schedule"
              className="flex-1 overflow-auto mt-4 space-y-0"
            >
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Set up your recurring weekly schedule. These time slots will
                  be available for booking every week unless overridden.
                </div>

                <RecurringScheduleSetup
                  timeSlots={[]} // Will be loaded by the component
                  onComplete={() => setHasUnsavedChanges(false)}
                  onCancel={() => handleClose()}
                />
              </div>
            </TabsContent>

            <TabsContent
              value="overrides"
              className="flex-1 overflow-auto mt-4 space-y-0"
            >
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Create exceptions to your regular schedule for specific dates.
                  You can block dates or set custom availability.
                </div>

                <ScheduleOverrides
                  overrides={[]} // Will be loaded by the component
                  timeSlots={[]} // Will be loaded by the component
                  onCreateOverride={() => setHasUnsavedChanges(true)}
                  onUpdateOverride={() => setHasUnsavedChanges(true)}
                  onDeleteOverride={() => setHasUnsavedChanges(true)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Changes are saved automatically when you submit forms above
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                {hasUnsavedChanges ? "Cancel" : "Close"}
              </Button>
              {activeTab === "schedule" && (
                <Button
                  onClick={() => setActiveTab("overrides")}
                  variant="default"
                >
                  Next: Overrides
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleSetupModal;
