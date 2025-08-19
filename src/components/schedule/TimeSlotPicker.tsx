/**
 * Time Slot Picker Component
 * Component for selecting available time slots
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Plus,
  Minus,
  CheckCircle,
  Circle,
  Settings,
  Filter,
} from "lucide-react";
import { TimeSlot, TherapistAvailability } from "@/types/database";
import { cn } from "@/lib/utils";
import {
  formatTimeForDisplay,
  parseTimeToMinutes,
} from "@/lib/utils/calendar-utils";

export interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedSlotIds: string[];
  onSlotToggle?: (slotId: string, selected: boolean) => void;
  onSelectionChange?: (selectedSlotIds: string[]) => void;
  maxSelections?: number;
  showDuration?: boolean;
  groupByDuration?: boolean;
  showSelectAll?: boolean;
  disabled?: boolean;
  className?: string;
}

export function TimeSlotPicker({
  timeSlots = [],
  selectedSlotIds = [],
  onSlotToggle,
  onSelectionChange,
  maxSelections,
  showDuration = true,
  groupByDuration = false,
  showSelectAll = true,
  disabled = false,
  className,
}: TimeSlotPickerProps) {
  const [localSelection, setLocalSelection] = useState<Set<string>>(
    new Set(selectedSlotIds)
  );
  const [filterDuration, setFilterDuration] = useState<number | null>(null);

  // Sync with external selection changes
  useEffect(() => {
    setLocalSelection(new Set(selectedSlotIds));
  }, [selectedSlotIds]);

  // Get unique durations for filtering
  const availableDurations = [
    ...new Set(timeSlots.map((slot) => slot.duration)),
  ].sort((a, b) => a - b);

  // Filter slots by duration if filter is active
  const filteredSlots = filterDuration
    ? timeSlots.filter((slot) => slot.duration === filterDuration)
    : timeSlots;

  // Group slots by duration if enabled
  const groupedSlots = groupByDuration
    ? filteredSlots.reduce((acc, slot) => {
        if (!acc[slot.duration]) {
          acc[slot.duration] = [];
        }
        acc[slot.duration].push(slot);
        return acc;
      }, {} as Record<number, TimeSlot[]>)
    : { all: filteredSlots };

  // Sort slots within each group by start time
  Object.values(groupedSlots).forEach((slots) => {
    slots.sort(
      (a, b) =>
        parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
    );
  });

  const handleSlotToggle = (slot: TimeSlot) => {
    if (disabled) return;

    const isCurrentlySelected = localSelection.has(slot.id);
    const newSelection = new Set(localSelection);

    if (isCurrentlySelected) {
      newSelection.delete(slot.id);
    } else {
      // Check max selections limit
      if (maxSelections && newSelection.size >= maxSelections) {
        return;
      }
      newSelection.add(slot.id);
    }

    setLocalSelection(newSelection);

    // Notify parent components
    const newSelectionArray = Array.from(newSelection);
    onSlotToggle?.(slot.id, !isCurrentlySelected);
    onSelectionChange?.(newSelectionArray);
  };

  const handleSelectAll = (slots: TimeSlot[], select: boolean) => {
    if (disabled) return;

    const newSelection = new Set(localSelection);

    if (select) {
      // Add all slots, respecting max selections
      for (const slot of slots) {
        if (maxSelections && newSelection.size >= maxSelections) break;
        newSelection.add(slot.id);
      }
    } else {
      // Remove all slots from this group
      slots.forEach((slot) => newSelection.delete(slot.id));
    }

    setLocalSelection(newSelection);
    onSelectionChange?.(Array.from(newSelection));
  };

  const handleClearAll = () => {
    if (disabled) return;

    setLocalSelection(new Set());
    onSelectionChange?.([]);
  };

  const renderTimeSlot = (slot: TimeSlot) => {
    const isSelected = localSelection.has(slot.id);
    const isDisabled =
      disabled ||
      (maxSelections && !isSelected && localSelection.size >= maxSelections);

    return (
      <div
        key={slot.id}
        className={cn(
          "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all",
          isSelected
            ? "border-blue-500 bg-blue-50 text-blue-900"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
          isDisabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !isDisabled && handleSlotToggle(slot)}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {isSelected ? (
              <CheckCircle className="h-5 w-5 text-blue-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
          </div>

          <div className="flex flex-col">
            <span className="font-medium text-sm">{slot.displayName}</span>
            {showDuration && (
              <span className="text-xs text-gray-500">
                {slot.duration} minutes
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={isSelected ? "default" : "secondary"}
            className="text-xs"
          >
            {slot.startTime}
          </Badge>
        </div>
      </div>
    );
  };

  const renderSlotGroup = (duration: number | string, slots: TimeSlot[]) => {
    const groupSelectedCount = slots.filter((slot) =>
      localSelection.has(slot.id)
    ).length;
    const isAllSelected = groupSelectedCount === slots.length;
    const isPartiallySelected =
      groupSelectedCount > 0 && groupSelectedCount < slots.length;

    return (
      <div key={duration} className="space-y-3">
        {groupByDuration && duration !== "all" && (
          <div className="flex items-center justify-between py-2 border-b">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {duration} minute sessions
              <Badge variant="outline" className="ml-2">
                {slots.length} slot{slots.length === 1 ? "" : "s"}
              </Badge>
            </h4>

            {showSelectAll && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(slots, !isAllSelected)}
                  disabled={disabled}
                  className="text-xs"
                >
                  {isAllSelected ? (
                    <>
                      <Minus className="h-3 w-3 mr-1" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3 mr-1" />
                      Select All
                    </>
                  )}
                </Button>

                {groupSelectedCount > 0 && (
                  <Badge variant={isAllSelected ? "default" : "secondary"}>
                    {groupSelectedCount}/{slots.length}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {slots.map(renderTimeSlot)}
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Select Time Slots
        </CardTitle>

        <div className="flex items-center gap-2">
          {availableDurations.length > 1 && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterDuration || ""}
                onChange={(e) =>
                  setFilterDuration(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="text-sm border border-gray-300 rounded px-2 py-1"
                disabled={disabled}
              >
                <option value="">All Durations</option>
                {availableDurations.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration} min
                  </option>
                ))}
              </select>
            </div>
          )}

          {localSelection.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={disabled}
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {filteredSlots.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">No time slots available</p>
            <p className="text-sm text-gray-400">
              {filterDuration
                ? `No ${filterDuration}-minute slots found`
                : "Add some time slots to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSlots).map(([duration, slots]) =>
              renderSlotGroup(duration, slots)
            )}
          </div>
        )}

        {/* Selection Summary */}
        {localSelection.size > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-blue-900">
                  {localSelection.size} time slot
                  {localSelection.size === 1 ? "" : "s"} selected
                </span>
              </div>

              {maxSelections && (
                <Badge
                  variant="outline"
                  className="text-blue-700 border-blue-300"
                >
                  {localSelection.size}/{maxSelections}
                </Badge>
              )}
            </div>

            {maxSelections && localSelection.size >= maxSelections && (
              <p className="text-sm text-blue-700 mt-2">
                Maximum number of time slots selected
              </p>
            )}
          </div>
        )}

        {/* Instructions */}
        {!disabled && filteredSlots.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Click on time slots to select them for your schedule
            {maxSelections && ` (max ${maxSelections} selections)`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TimeSlotPicker;
