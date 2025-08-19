/**
 * Real-time Availability Hook
 * Live updates for therapist availability changes
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TherapistAvailability, ScheduleOverride } from "@/types/database";
import realtimeService, {
  type RealtimeEventData,
} from "@/lib/services/realtime-service";
import { useDebounce } from "@/lib/hooks/useDebounce";

interface UseRealtimeAvailabilityOptions {
  therapistId: string;
  enableRealtime?: boolean;
  debounceMs?: number;
  includeOverrides?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

interface AvailabilityState {
  availability: TherapistAvailability[];
  overrides: ScheduleOverride[];
  isLoading: boolean;
  lastUpdated?: Date;
  changes: {
    type: "availability" | "override";
    action: "created" | "updated" | "deleted";
    timestamp: Date;
  }[];
}

export function useRealtimeAvailability({
  therapistId,
  enableRealtime = true,
  debounceMs = 300,
  includeOverrides = true,
  dateRange,
}: UseRealtimeAvailabilityOptions) {
  const [state, setState] = useState<AvailabilityState>({
    availability: [],
    overrides: [],
    isLoading: true,
    changes: [],
  });

  const debouncedTherapistId = useDebounce(therapistId, debounceMs);

  // Subscribe to availability changes
  useEffect(() => {
    if (!enableRealtime || !debouncedTherapistId) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    const unsubscribeAvailability =
      realtimeService.subscribeToTherapistAvailability(
        debouncedTherapistId,
        (availability) => {
          setState((prev) => ({
            ...prev,
            availability,
            isLoading: false,
            lastUpdated: new Date(),
          }));
        }
      );

    let unsubscribeOverrides: (() => void) | undefined;

    if (includeOverrides) {
      unsubscribeOverrides = realtimeService.subscribeToScheduleOverrides(
        debouncedTherapistId,
        (overrides) => {
          setState((prev) => ({
            ...prev,
            overrides,
            lastUpdated: new Date(),
          }));
        },
        dateRange
      );
    }

    return () => {
      unsubscribeAvailability();
      unsubscribeOverrides?.();
    };
  }, [debouncedTherapistId, enableRealtime, includeOverrides, dateRange]);

  // Subscribe to real-time events for change notifications
  useEffect(() => {
    if (!enableRealtime) return;

    const unsubscribeAvailabilityEvents = realtimeService.subscribe(
      "availability",
      (event: RealtimeEventData) => {
        if (
          (event.data as Record<string, unknown>).therapistId === therapistId
        ) {
          setState((prev) => ({
            ...prev,
            changes: [
              {
                type: "availability",
                action: event.action,
                timestamp: event.timestamp,
              },
              ...prev.changes.slice(0, 9), // Keep last 10 changes
            ],
          }));
        }
      }
    );

    const unsubscribeOverrideEvents = realtimeService.subscribe(
      "override",
      (event: RealtimeEventData) => {
        if (
          (event.data as Record<string, unknown>).therapistId === therapistId
        ) {
          setState((prev) => ({
            ...prev,
            changes: [
              {
                type: "override",
                action: event.action,
                timestamp: event.timestamp,
              },
              ...prev.changes.slice(0, 9),
            ],
          }));
        }
      }
    );

    return () => {
      unsubscribeAvailabilityEvents();
      unsubscribeOverrideEvents();
    };
  }, [enableRealtime, therapistId]);

  // Calculate effective availability for a specific date
  const getEffectiveAvailability = useCallback(
    (date: Date) => {
      const dayOfWeek = date.getDay();
      const dateKey = date.toDateString();

      // Get regular availability for this day
      const dayAvailability = state.availability.filter(
        (avail) => avail.dayOfWeek === dayOfWeek && avail.status === "available"
      );

      // Get overrides for this date
      const dateOverrides = state.overrides.filter(
        (override) => override.date.toDate().toDateString() === dateKey
      );

      // Apply overrides
      let effectiveSlots = dayAvailability.map((avail) => avail.timeSlotId);

      dateOverrides.forEach((override) => {
        switch (override.type) {
          case "day_off":
            effectiveSlots = [];
            break;
          case "time_off":
            if (override.affectedSlots) {
              effectiveSlots = effectiveSlots.filter(
                (slotId) => !override.affectedSlots!.includes(slotId)
              );
            }
            break;
          case "custom_hours":
            if (override.affectedSlots) {
              effectiveSlots = override.affectedSlots;
            }
            break;
        }
      });

      return {
        availability: dayAvailability,
        overrides: dateOverrides,
        effectiveSlots,
      };
    },
    [state.availability, state.overrides]
  );

  // Get availability summary statistics
  const summary = useMemo(() => {
    const totalSlots = state.availability.length;
    const activeSlots = state.availability.filter(
      (avail) => avail.status === "available"
    ).length;
    const overrideCount = state.overrides.length;
    const recentChanges = state.changes.filter(
      (change) => Date.now() - change.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    ).length;

    return {
      totalSlots,
      activeSlots,
      overrideCount,
      recentChanges,
      lastUpdated: state.lastUpdated,
    };
  }, [state.availability, state.overrides, state.changes, state.lastUpdated]);

  // Check if a specific time slot is available on a date
  const isSlotAvailable = useCallback(
    (date: Date, timeSlotId: string) => {
      const { effectiveSlots } = getEffectiveAvailability(date);
      return effectiveSlots.includes(timeSlotId);
    },
    [getEffectiveAvailability]
  );

  // Get available dates within a range
  const getAvailableDates = useCallback(
    (startDate: Date, endDate: Date) => {
      const availableDates: Date[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const { effectiveSlots } = getEffectiveAvailability(currentDate);
        if (effectiveSlots.length > 0) {
          availableDates.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return availableDates;
    },
    [getEffectiveAvailability]
  );

  // Clear change notifications
  const clearChanges = useCallback(() => {
    setState((prev) => ({ ...prev, changes: [] }));
  }, []);

  // Refresh data manually
  const refresh = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true }));
    // The effect will handle re-subscribing
  }, []);

  return {
    // Data
    availability: state.availability,
    overrides: state.overrides,
    isLoading: state.isLoading,
    lastUpdated: state.lastUpdated,
    changes: state.changes,
    summary,

    // Methods
    getEffectiveAvailability,
    isSlotAvailable,
    getAvailableDates,
    clearChanges,
    refresh,
  };
}

export default useRealtimeAvailability;
