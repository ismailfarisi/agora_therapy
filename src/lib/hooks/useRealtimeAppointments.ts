/**
 * Real-time Appointments Hook
 * Live updates for appointment changes with conflict detection
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Appointment, AppointmentStatus } from "@/types/database";
import realtimeService, {
  type RealtimeEventData,
  type ConflictData,
} from "@/lib/services/realtime-service";
import { useDebounce } from "@/lib/hooks/useDebounce";

interface UseRealtimeAppointmentsOptions {
  userId: string;
  userType: "client" | "therapist";
  enableRealtime?: boolean;
  debounceMs?: number;
  filterStatus?: AppointmentStatus[];
}

interface AppointmentsState {
  appointments: Appointment[];
  isLoading: boolean;
  lastUpdated?: Date;
  conflicts: ConflictData[];
  changes: {
    appointmentId: string;
    action: "created" | "updated" | "deleted";
    status?: AppointmentStatus;
    timestamp: Date;
  }[];
}

export function useRealtimeAppointments({
  userId,
  userType,
  enableRealtime = true,
  debounceMs = 300,
  filterStatus,
}: UseRealtimeAppointmentsOptions) {
  const [state, setState] = useState<AppointmentsState>({
    appointments: [],
    isLoading: true,
    conflicts: [],
    changes: [],
  });

  const debouncedUserId = useDebounce(userId, debounceMs);

  // Subscribe to appointment changes
  useEffect(() => {
    if (!enableRealtime || !debouncedUserId) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    const unsubscribeAppointments = realtimeService.subscribeToAppointments(
      debouncedUserId,
      userType,
      (appointments) => {
        // Apply status filter if provided
        const filteredAppointments = filterStatus
          ? appointments.filter((apt) => filterStatus.includes(apt.status))
          : appointments;

        setState((prev) => ({
          ...prev,
          appointments: filteredAppointments,
          isLoading: false,
          lastUpdated: new Date(),
        }));
      }
    );

    return unsubscribeAppointments;
  }, [debouncedUserId, userType, enableRealtime, filterStatus]);

  // Subscribe to real-time events for change notifications
  useEffect(() => {
    if (!enableRealtime) return;

    const unsubscribeAppointmentEvents = realtimeService.subscribe(
      "appointment",
      (event: RealtimeEventData) => {
        const { appointment } = event.data as { appointment: Appointment };

        // Only process events for this user
        const isRelevant =
          userType === "client"
            ? appointment.clientId === userId
            : appointment.therapistId === userId;

        if (isRelevant) {
          setState((prev) => ({
            ...prev,
            changes: [
              {
                appointmentId: appointment.id,
                action: event.action,
                status: appointment.status,
                timestamp: event.timestamp,
              },
              ...prev.changes.slice(0, 19), // Keep last 20 changes
            ],
          }));
        }
      }
    );

    return unsubscribeAppointmentEvents;
  }, [enableRealtime, userId, userType]);

  // Subscribe to conflict events
  useEffect(() => {
    if (!enableRealtime) return;

    const unsubscribeConflicts = realtimeService.onConflict((conflict) => {
      setState((prev) => ({
        ...prev,
        conflicts: [conflict, ...prev.conflicts.slice(0, 9)], // Keep last 10 conflicts
      }));
    });

    return unsubscribeConflicts;
  }, [enableRealtime]);

  // Get appointments by status
  const getAppointmentsByStatus = useCallback(
    (status: AppointmentStatus) => {
      return state.appointments.filter((apt) => apt.status === status);
    },
    [state.appointments]
  );

  // Get upcoming appointments
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return state.appointments
      .filter((apt) => {
        const appointmentDate = apt.scheduledFor.toDate();
        return (
          appointmentDate >= now &&
          ["pending", "confirmed"].includes(apt.status)
        );
      })
      .sort(
        (a, b) =>
          a.scheduledFor.toDate().getTime() - b.scheduledFor.toDate().getTime()
      );
  }, [state.appointments]);

  // Get past appointments
  const pastAppointments = useMemo(() => {
    const now = new Date();
    return state.appointments
      .filter((apt) => {
        const appointmentDate = apt.scheduledFor.toDate();
        return (
          appointmentDate < now ||
          ["completed", "cancelled", "no_show"].includes(apt.status)
        );
      })
      .sort(
        (a, b) =>
          b.scheduledFor.toDate().getTime() - a.scheduledFor.toDate().getTime()
      );
  }, [state.appointments]);

  // Get appointment statistics
  const statistics = useMemo(() => {
    const total = state.appointments.length;
    const pending = state.appointments.filter(
      (apt) => apt.status === "pending"
    ).length;
    const confirmed = state.appointments.filter(
      (apt) => apt.status === "confirmed"
    ).length;
    const completed = state.appointments.filter(
      (apt) => apt.status === "completed"
    ).length;
    const cancelled = state.appointments.filter(
      (apt) => apt.status === "cancelled"
    ).length;
    const noShow = state.appointments.filter(
      (apt) => apt.status === "no_show"
    ).length;

    const recentChanges = state.changes.filter(
      (change) => Date.now() - change.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    ).length;

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      noShow,
      recentChanges,
      activeConflicts: state.conflicts.filter((c) => !c.resolved).length,
    };
  }, [state.appointments, state.changes, state.conflicts]);

  // Find appointment by ID
  const findAppointment = useCallback(
    (appointmentId: string) => {
      return state.appointments.find((apt) => apt.id === appointmentId);
    },
    [state.appointments]
  );

  // Get appointments for a specific date
  const getAppointmentsForDate = useCallback(
    (date: Date) => {
      const targetDate = date.toDateString();
      return state.appointments.filter(
        (apt) => apt.scheduledFor.toDate().toDateString() === targetDate
      );
    },
    [state.appointments]
  );

  // Check for time conflicts
  const checkTimeConflict = useCallback(
    (scheduledFor: Date, duration: number, excludeId?: string) => {
      const startTime = scheduledFor.getTime();
      const endTime = startTime + duration * 60 * 1000; // duration in minutes

      return state.appointments.some((apt) => {
        if (excludeId && apt.id === excludeId) return false;
        if (apt.status === "cancelled") return false;

        const aptStart = apt.scheduledFor.toDate().getTime();
        const aptEnd = aptStart + apt.duration * 60 * 1000;

        // Check for overlap
        return startTime < aptEnd && endTime > aptStart;
      });
    },
    [state.appointments]
  );

  // Clear change notifications
  const clearChanges = useCallback(() => {
    setState((prev) => ({ ...prev, changes: [] }));
  }, []);

  // Clear resolved conflicts
  const clearResolvedConflicts = useCallback(() => {
    setState((prev) => ({
      ...prev,
      conflicts: prev.conflicts.filter((c) => !c.resolved),
    }));
  }, []);

  // Mark conflict as resolved
  const resolveConflict = useCallback((conflictId: string) => {
    setState((prev) => ({
      ...prev,
      conflicts: prev.conflicts.map((c) =>
        c.id === conflictId ? { ...c, resolved: true } : c
      ),
    }));
  }, []);

  // Refresh data manually
  const refresh = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true }));
    // The effect will handle re-subscribing
  }, []);

  return {
    // Data
    appointments: state.appointments,
    isLoading: state.isLoading,
    lastUpdated: state.lastUpdated,
    changes: state.changes,
    conflicts: state.conflicts,
    statistics,
    upcomingAppointments,
    pastAppointments,

    // Methods
    getAppointmentsByStatus,
    findAppointment,
    getAppointmentsForDate,
    checkTimeConflict,
    clearChanges,
    clearResolvedConflicts,
    resolveConflict,
    refresh,
  };
}

export default useRealtimeAppointments;
