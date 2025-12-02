/**
 * Schedule Overrides Component
 * Management of exceptions and time off
 */

"use client";

import React, { useState } from "react";
import { Timestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarOff,
  Plus,
  Edit,
  Trash2,
  Clock,
  AlertTriangle,
  Calendar,
  Settings,
} from "lucide-react";
import { ScheduleOverride, TimeSlot, OverrideType } from "@/types/database";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ScheduleOverridesProps {
  overrides: ScheduleOverride[];
  timeSlots: TimeSlot[];
  onCreateOverride?: (override: Omit<ScheduleOverride, "id">) => void;
  onUpdateOverride?: (id: string, override: Partial<ScheduleOverride>) => void;
  onDeleteOverride?: (id: string) => void;
  className?: string;
}

interface OverrideFormData {
  date: string;
  type: OverrideType;
  reason: string;
  affectedSlots?: string[];
  isRecurring: boolean;
  recurringUntil?: string;
  notes: string;
}

export function ScheduleOverrides({
  overrides = [],
  timeSlots = [],
  onCreateOverride,
  onUpdateOverride,
  onDeleteOverride,
  className,
}: ScheduleOverridesProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOverride, setEditingOverride] =
    useState<ScheduleOverride | null>(null);
  const [formData, setFormData] = useState<OverrideFormData>({
    date: "",
    type: "day_off",
    reason: "",
    affectedSlots: [],
    isRecurring: false,
    recurringUntil: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      date: "",
      type: "day_off",
      reason: "",
      affectedSlots: [],
      isRecurring: false,
      recurringUntil: "",
      notes: "",
    });
  };

  const handleCreateOverride = () => {
    setEditingOverride(null);
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleEditOverride = (override: ScheduleOverride) => {
    setEditingOverride(override);
    setFormData({
      date: format(override.date.toDate(), "yyyy-MM-dd"),
      type: override.type,
      reason: override.reason,
      affectedSlots: override.affectedSlots || [],
      isRecurring: override.isRecurring,
      recurringUntil: override.recurringUntil
        ? format(override.recurringUntil.toDate(), "yyyy-MM-dd")
        : "",
      notes: override.metadata?.notes || "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = () => {
    const overrideData: Partial<ScheduleOverride> = {
      date: Timestamp.fromDate(new Date(formData.date)),
      type: formData.type,
      reason: formData.reason,
      affectedSlots:
        formData.type === "day_off" ? undefined : formData.affectedSlots,
      isRecurring: formData.isRecurring,
      recurringUntil: formData.recurringUntil
        ? Timestamp.fromDate(new Date(formData.recurringUntil))
        : undefined,
    };

    // Add notes to metadata if provided
    if (formData.notes) {
      overrideData.metadata = {
        ...overrideData.metadata,
        notes: formData.notes,
      } as ScheduleOverride['metadata'];
    }

    if (editingOverride) {
      onUpdateOverride?.(editingOverride.id, overrideData);
    } else {
      onCreateOverride?.(overrideData as Omit<ScheduleOverride, "id">);
    }

    setIsCreateDialogOpen(false);
    resetForm();
    setEditingOverride(null);
  };

  const handleDeleteOverride = (override: ScheduleOverride) => {
    if (
      window.confirm("Are you sure you want to delete this schedule override?")
    ) {
      onDeleteOverride?.(override.id);
    }
  };

  const getOverrideTypeColor = (type: OverrideType) => {
    switch (type) {
      case "day_off":
        return "destructive";
      case "time_off":
        return "secondary";
      case "custom_hours":
        return "default";
      default:
        return "secondary";
    }
  };

  const getOverrideTypeIcon = (type: OverrideType) => {
    switch (type) {
      case "day_off":
        return <CalendarOff className="h-4 w-4" />;
      case "time_off":
        return <Clock className="h-4 w-4" />;
      case "custom_hours":
        return <Settings className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getOverrideTypeLabel = (type: OverrideType) => {
    switch (type) {
      case "day_off":
        return "Day Off";
      case "time_off":
        return "Time Off";
      case "custom_hours":
        return "Custom Hours";
      default:
        return type;
    }
  };

  const getAffectedSlotsText = (affectedSlots?: string[]) => {
    if (!affectedSlots || affectedSlots.length === 0) return "All slots";

    const slotTimes = affectedSlots
      .map((slotId) => timeSlots.find((ts) => ts.id === slotId)?.startTime)
      .filter(Boolean)
      .sort();

    if (slotTimes.length <= 3) {
      return slotTimes.join(", ");
    }

    return `${slotTimes.slice(0, 2).join(", ")} +${slotTimes.length - 2} more`;
  };

  // Sort overrides by date
  const sortedOverrides = [...overrides].sort(
    (a, b) => a.date.toDate().getTime() - b.date.toDate().getTime()
  );

  // Separate upcoming and past overrides
  const now = new Date();
  const upcomingOverrides = sortedOverrides.filter(
    (o) => o.date.toDate() >= now
  );
  const pastOverrides = sortedOverrides.filter((o) => o.date.toDate() < now);

  const renderOverrideCard = (override: ScheduleOverride) => (
    <div
      key={override.id}
      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getOverrideTypeIcon(override.type)}
          <div>
            <h4 className="font-medium">{override.reason}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getOverrideTypeColor(override.type)}>
                {getOverrideTypeLabel(override.type)}
              </Badge>
              {override.isRecurring && (
                <Badge variant="outline" className="text-xs">
                  Recurring
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditOverride(override)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteOverride(override)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          <span>{format(override.date.toDate(), "EEEE, MMMM d, yyyy")}</span>
        </div>

        {override.type !== "day_off" && (
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Affects: {getAffectedSlotsText(override.affectedSlots)}</span>
          </div>
        )}

        {override.isRecurring && override.recurringUntil && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3 w-3" />
            <span>
              Until: {format(override.recurringUntil.toDate(), "MMM d, yyyy")}
            </span>
          </div>
        )}

        {override.metadata?.notes && (
          <div className="text-xs text-gray-500 mt-2 italic">
            "{override.metadata.notes}"
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Card className={cn("w-full", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarOff className="h-5 w-5" />
            Schedule Overrides
          </CardTitle>

          <Button onClick={handleCreateOverride}>
            <Plus className="h-4 w-4 mr-2" />
            Add Override
          </Button>
        </CardHeader>

        <CardContent>
          {sortedOverrides.length === 0 ? (
            <div className="text-center py-8">
              <CalendarOff className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">No schedule overrides</p>
              <p className="text-sm text-gray-400 mb-4">
                Add overrides to manage time off, custom hours, or schedule
                changes
              </p>
              <Button variant="outline" onClick={handleCreateOverride}>
                <Plus className="h-4 w-4 mr-2" />
                Create Override
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Upcoming Overrides */}
              {upcomingOverrides.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Upcoming Overrides ({upcomingOverrides.length})
                  </h4>
                  <div className="space-y-3">
                    {upcomingOverrides.map(renderOverrideCard)}
                  </div>
                </div>
              )}

              {/* Past Overrides */}
              {pastOverrides.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Past Overrides ({pastOverrides.length})
                  </h4>
                  <div className="space-y-3 opacity-75">
                    {pastOverrides.slice(0, 5).map(renderOverrideCard)}
                    {pastOverrides.length > 5 && (
                      <div className="text-center text-sm text-gray-500">
                        and {pastOverrides.length - 5} more past overrides...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Override Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingOverride
                ? "Edit Schedule Override"
                : "Create Schedule Override"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                min={format(new Date(), "yyyy-MM-dd")}
              />
            </div>

            <div>
              <Label htmlFor="type">Override Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: e.target.value as OverrideType,
                    affectedSlots:
                      e.target.value === "day_off" ? [] : prev.affectedSlots,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="day_off">Day Off</option>
                <option value="time_off">Time Off (Specific Hours)</option>
                <option value="custom_hours">Custom Hours</option>
              </select>
            </div>

            <div>
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="e.g., Vacation, Medical appointment..."
              />
            </div>

            {formData.type !== "day_off" && (
              <div>
                <Label>Affected Time Slots</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                  {timeSlots.map((slot) => (
                    <label
                      key={slot.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={
                          formData.affectedSlots?.includes(slot.id) || false
                        }
                        onChange={(e) => {
                          const currentSlots = formData.affectedSlots || [];
                          const newSlots = e.target.checked
                            ? [...currentSlots, slot.id]
                            : currentSlots.filter((id) => id !== slot.id);
                          setFormData((prev) => ({
                            ...prev,
                            affectedSlots: newSlots,
                          }));
                        }}
                      />
                      <span>{slot.displayName}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isRecurring: e.target.checked,
                  }))
                }
              />
              <Label htmlFor="isRecurring">Recurring override</Label>
            </div>

            {formData.isRecurring && (
              <div>
                <Label htmlFor="recurringUntil">Recurring Until</Label>
                <Input
                  id="recurringUntil"
                  type="date"
                  value={formData.recurringUntil}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      recurringUntil: e.target.value,
                    }))
                  }
                  min={formData.date}
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Any additional details..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                  setEditingOverride(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.date || !formData.reason}
                className="flex-1"
              >
                {editingOverride ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ScheduleOverrides;
