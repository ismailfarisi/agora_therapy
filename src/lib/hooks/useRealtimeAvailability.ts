/**
 * Real-time Availability Hook
 * Live updates for therapist availability changes with enhanced error handling,
 * connection awareness, and advanced synchronization features
 */

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  TherapistAvailability,
  ScheduleOverride,
  Appointment,
} from "@/types/database";
import realtimeService, {
  type RealtimeEventData,
  type ConnectionStatus,
} from "@/lib/services/realtime-service";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { AppointmentService } from "@/lib/services/appointment-service";
import { getDay } from "date-fns";

interface UseRealtimeAvailabilityOptions {
  therapistId: string;
  enableRealtime?: boolean;
  debounceMs?: number;
  includeOverrides?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  retryAttempts?: number;
  retryDelay?: number;
  staleDataThreshold?: number; // minutes
  enableConnectionAwareness?: boolean;
}

interface AvailabilityError {
  type: "connection" | "subscription" | "data" | "validation";
  message: string;
  timestamp: Date;
  isRetryable: boolean;
  retryCount?: number;
}

interface AvailabilityState {
  availability: TherapistAvailability[];
  overrides: ScheduleOverride[];
  appointments: Appointment[];
  isLoading: boolean;
  lastUpdated?: Date;
  isStale: boolean;
  error?: AvailabilityError;
  connectionStatus?: ConnectionStatus;
  changes: {
    type: "availability" | "override" | "appointment";
    action: "created" | "updated" | "deleted";
    timestamp: Date;
    syncId?: string; // for conflict resolution
  }[];
}

export function useRealtimeAvailability({
  therapistId,
  enableRealtime = true,
  debounceMs = 300,
  includeOverrides = true,
  dateRange,
  retryAttempts = 3,
  retryDelay = 1000,
  staleDataThreshold = 5, // 5 minutes
  enableConnectionAwareness = true,
}: UseRealtimeAvailabilityOptions) {
  const [state, setState] = useState<AvailabilityState>({
    availability: [],
    overrides: [],
    appointments: [],
    isLoading: true,
    changes: [],
    isStale: false,
  });

  // Enhanced debouncing with priority handling
  const debouncedTherapistId = useDebounce(therapistId, debounceMs);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const staleCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);

  // Enhanced error handling and retry logic
  const handleError = useCallback(
    (error: Error, type: AvailabilityError["type"]) => {
      const isRetryable = type === "connection" || type === "subscription";
      const newError: AvailabilityError = {
        type,
        message: error.message,
        timestamp: new Date(),
        isRetryable,
        retryCount: retryCountRef.current,
      };

      setState((prev) => ({
        ...prev,
        error: newError,
        isLoading: false,
      }));

      // Retry logic for retryable errors
      if (isRetryable && retryCountRef.current < retryAttempts) {
        const delay = retryDelay * Math.pow(2, retryCountRef.current);
        retryTimeoutRef.current = setTimeout(() => {
          retryCountRef.current++;
          setState((prev) => ({ ...prev, isLoading: true, error: undefined }));
          // The subscription will be re-attempted due to dependency changes
        }, delay);
      }
    },
    [retryAttempts, retryDelay]
  );

  // Connection status monitoring
  useEffect(() => {
    if (!enableConnectionAwareness) return;

    const unsubscribeConnection = realtimeService.onConnectionChange(
      (status) => {
        setState((prev) => ({
          ...prev,
          connectionStatus: status,
          isStale: !status.isOnline && prev.lastUpdated ? true : prev.isStale,
        }));

        // Reset retry count when connection is restored
        if (status.isOnline && retryCountRef.current > 0) {
          retryCountRef.current = 0;
        }
      }
    );

    return unsubscribeConnection;
  }, [enableConnectionAwareness]);

  // Stale data detection
  useEffect(() => {
    if (!staleDataThreshold) return;

    staleCheckIntervalRef.current = setInterval(() => {
      setState((prev) => {
        if (!prev.lastUpdated) return prev;

        const now = new Date();
        const staleThresholdMs = staleDataThreshold * 60 * 1000;
        const isStale =
          now.getTime() - prev.lastUpdated.getTime() > staleThresholdMs;

        return { ...prev, isStale };
      });
    }, 60000); // Check every minute

    return () => {
      if (staleCheckIntervalRef.current) {
        clearInterval(staleCheckIntervalRef.current);
      }
    };
  }, [staleDataThreshold]);

  // Enhanced subscription management with error handling and retry logic
  useEffect(() => {
    if (!enableRealtime || !debouncedTherapistId) return;

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: undefined,
      isStale: false,
    }));

    let unsubscribeAvailability: (() => void) | undefined;
    let unsubscribeOverrides: (() => void) | undefined;
    let unsubscribeAppointments: (() => void) | undefined;
    let loadingCount = includeOverrides ? 3 : 2;

    const markLoadingComplete = () => {
      loadingCount--;
      if (loadingCount === 0) {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    try {
      // Subscribe to availability with enhanced error handling
      unsubscribeAvailability =
        realtimeService.subscribeToTherapistAvailability(
          debouncedTherapistId,
          (availability) => {
            setState((prev) => ({
              ...prev,
              availability,
              lastUpdated: new Date(),
              error: undefined,
              isStale: false,
            }));
            markLoadingComplete();
            retryCountRef.current = 0; // Reset retry count on successful update
          }
        );

      // Subscribe to appointments for real-time booking visibility
      unsubscribeAppointments =
        AppointmentService.subscribeToTherapistAppointments(
          debouncedTherapistId,
          (appointments) => {
            setState((prev) => ({
              ...prev,
              appointments,
              lastUpdated: new Date(),
              isStale: false,
            }));
            markLoadingComplete();
          }
        );

      // Subscribe to overrides if enabled
      if (includeOverrides) {
        unsubscribeOverrides = realtimeService.subscribeToScheduleOverrides(
          debouncedTherapistId,
          (overrides) => {
            setState((prev) => ({
              ...prev,
              overrides,
              lastUpdated: new Date(),
              isStale: false,
            }));
            markLoadingComplete();
          },
          dateRange
        );
      }
    } catch (error) {
      handleError(error as Error, "subscription");
    }

    return () => {
      unsubscribeAvailability?.();
      unsubscribeOverrides?.();
      unsubscribeAppointments?.();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [
    debouncedTherapistId,
    enableRealtime,
    includeOverrides,
    dateRange,
    handleError,
    retryCountRef.current, // Add retry count as dependency to trigger re-subscription
  ]);

  // Enhanced real-time event subscription with conflict detection
  useEffect(() => {
    if (!enableRealtime) return;

    const unsubscribeAvailabilityEvents = realtimeService.subscribe(
      "availability",
      (event: RealtimeEventData) => {
        if (
          (event.data as Record<string, unknown>).therapistId === therapistId
        ) {
          const syncId = `${
            event.type
          }_${event.timestamp.getTime()}_${Math.random()}`;
          setState((prev) => ({
            ...prev,
            changes: [
              {
                type: "availability",
                action: event.action,
                timestamp: event.timestamp,
                syncId,
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
          const syncId = `${
            event.type
          }_${event.timestamp.getTime()}_${Math.random()}`;
          setState((prev) => ({
            ...prev,
            changes: [
              {
                type: "override",
                action: event.action,
                timestamp: event.timestamp,
                syncId,
              },
              ...prev.changes.slice(0, 9),
            ],
          }));
        }
      }
    );

    const unsubscribeConflictEvents = realtimeService.onConflict((conflict) => {
      // Handle availability-related conflicts
      if (conflict.type === "availability_conflict") {
        handleError(new Error(conflict.details.requestedAction), "validation");
      }
    });

    return () => {
      unsubscribeAvailabilityEvents();
      unsubscribeOverrideEvents();
      unsubscribeConflictEvents();
    };
  }, [enableRealtime, therapistId, handleError]);

  // Calculate effective availability for a specific date
  const getEffectiveAvailability = useCallback(
    (date: Date) => {
      const dayOfWeek = getDay(date);
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

  // Get available slots for a specific date, filtering out booked appointments
  const getAvailableSlots = useCallback(
    (date: Date) => {
      const { effectiveSlots } = getEffectiveAvailability(date);
      const dateString = date.toISOString().split("T")[0];

      // Get booked appointments for this date
      const bookedSlotIds = state.appointments
        .filter((appointment) => {
          if (appointment.status === "cancelled") return false;
          const appointmentDate = appointment.scheduledFor
            .toDate()
            .toISOString()
            .split("T")[0];
          return appointmentDate === dateString;
        })
        .map((appointment) => appointment.timeSlotId);

      // Filter out booked slots
      return effectiveSlots.filter((slotId) => !bookedSlotIds.includes(slotId));
    },
    [getEffectiveAvailability, state.appointments]
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

  // Enhanced refresh with error recovery
  const refresh = useCallback(() => {
    retryCountRef.current = 0;
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: undefined,
      isStale: false,
    }));
  }, []);

  // Force refresh when data is stale
  const forceRefresh = useCallback(() => {
    setState((prev) => ({
      ...prev,
      availability: [],
      overrides: [],
      changes: [],
      isStale: false,
    }));
    refresh();
  }, [refresh]);

  // Retry failed operations
  const retry = useCallback(() => {
    if (state.error?.isRetryable) {
      refresh();
    }
  }, [state.error, refresh]);

  // Clear errors
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: undefined }));
  }, []);

  // Enhanced cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (staleCheckIntervalRef.current) {
        clearInterval(staleCheckIntervalRef.current);
      }
    };
  }, []);

  return {
    // Data
    availability: state.availability,
    overrides: state.overrides,
    appointments: state.appointments,
    isLoading: state.isLoading,
    lastUpdated: state.lastUpdated,
    changes: state.changes,
    summary,

    // Status indicators
    isStale: state.isStale,
    error: state.error,
    connectionStatus: state.connectionStatus,
    isConnected: state.connectionStatus?.isOnline ?? true,
    hasRetryableError: state.error?.isRetryable ?? false,

    // Enhanced methods
    getEffectiveAvailability,
    getAvailableSlots,
    isSlotAvailable,
    getAvailableDates,
    clearChanges,
    refresh,
    forceRefresh,
    retry,
    clearError,

    // Debugging helpers
    getDebugInfo: useCallback(
      () => ({
        retryCount: retryCountRef.current,
        lastError: state.error,
        connectionStatus: state.connectionStatus,
        isStale: state.isStale,
        changesCount: state.changes.length,
      }),
      [state]
    ),
  };
}

export default useRealtimeAvailability;
