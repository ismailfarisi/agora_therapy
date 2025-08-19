/**
 * Real-time Therapist Status Hook
 * Live updates for therapist online/offline status and presence
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import realtimeService, {
  type RealtimeEventData,
} from "@/lib/services/realtime-service";
import { useDebounce } from "@/lib/hooks/useDebounce";

interface TherapistStatus {
  therapistId: string;
  isOnline: boolean;
  lastSeen?: Date;
  status: "online" | "offline" | "away" | "busy";
  statusText?: string;
}

interface UseRealtimeTherapistStatusOptions {
  therapistIds: string | string[];
  enableRealtime?: boolean;
  debounceMs?: number;
  onlineThreshold?: number; // minutes
}

interface TherapistStatusState {
  statuses: Map<string, TherapistStatus>;
  isLoading: boolean;
  lastUpdated?: Date;
  changes: {
    therapistId: string;
    previousStatus: string;
    newStatus: string;
    timestamp: Date;
  }[];
}

export function useRealtimeTherapistStatus({
  therapistIds,
  enableRealtime = true,
  debounceMs = 300,
  onlineThreshold = 5, // 5 minutes
}: UseRealtimeTherapistStatusOptions) {
  const [state, setState] = useState<TherapistStatusState>({
    statuses: new Map(),
    isLoading: true,
    changes: [],
  });

  const debouncedTherapistIds = useDebounce(therapistIds, debounceMs);
  const therapistIdArray = useMemo(
    () =>
      Array.isArray(debouncedTherapistIds)
        ? debouncedTherapistIds
        : [debouncedTherapistIds].filter(Boolean),
    [debouncedTherapistIds]
  );

  // Calculate status based on last seen time
  const calculateStatus = useCallback(
    (lastSeen?: Date): "online" | "offline" | "away" => {
      if (!lastSeen) return "offline";

      const now = new Date();
      const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);

      if (diffMinutes <= onlineThreshold) return "online";
      if (diffMinutes <= onlineThreshold * 3) return "away"; // 3x threshold for away
      return "offline";
    },
    [onlineThreshold]
  );

  // Subscribe to therapist status changes
  useEffect(() => {
    if (!enableRealtime || therapistIdArray.length === 0) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    const subscriptions = therapistIdArray.map((therapistId) => {
      return realtimeService.subscribeToTherapistStatus(
        therapistId,
        (isOnline, lastSeen) => {
          const status = calculateStatus(lastSeen);

          setState((prev) => {
            const newStatuses = new Map(prev.statuses);
            const previousStatus = newStatuses.get(therapistId);

            const newStatus: TherapistStatus = {
              therapistId,
              isOnline,
              lastSeen,
              status,
              statusText: getStatusText(status, lastSeen),
            };

            newStatuses.set(therapistId, newStatus);

            // Track status changes
            const newChanges = [...prev.changes];
            if (previousStatus && previousStatus.status !== status) {
              newChanges.unshift({
                therapistId,
                previousStatus: previousStatus.status,
                newStatus: status,
                timestamp: new Date(),
              });

              // Keep last 20 changes
              if (newChanges.length > 20) {
                newChanges.splice(20);
              }
            }

            return {
              ...prev,
              statuses: newStatuses,
              isLoading: false,
              lastUpdated: new Date(),
              changes: newChanges,
            };
          });
        }
      );
    });

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [therapistIdArray, enableRealtime, calculateStatus]);

  // Subscribe to real-time events for additional context
  useEffect(() => {
    if (!enableRealtime) return;

    const unsubscribeTherapistEvents = realtimeService.subscribe(
      "therapist_status",
      (event: RealtimeEventData) => {
        const { therapistId } = event.data as Record<string, unknown> as {
          therapistId: string;
        };

        if (therapistIdArray.includes(therapistId)) {
          // Event already handled by individual subscriptions
          // This could be used for additional processing if needed
        }
      }
    );

    return unsubscribeTherapistEvents;
  }, [enableRealtime, therapistIdArray]);

  // Get status text based on status and last seen
  const getStatusText = useCallback(
    (status: string, lastSeen?: Date): string => {
      switch (status) {
        case "online":
          return "Online now";
        case "away":
          return lastSeen ? `Away since ${formatLastSeen(lastSeen)}` : "Away";
        case "offline":
          return lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : "Offline";
        default:
          return "Unknown";
      }
    },
    []
  );

  // Format last seen time
  const formatLastSeen = useCallback((lastSeen: Date): string => {
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - lastSeen.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return lastSeen.toLocaleDateString();
  }, []);

  // Get status for a specific therapist
  const getTherapistStatus = useCallback(
    (therapistId: string): TherapistStatus | undefined => {
      return state.statuses.get(therapistId);
    },
    [state.statuses]
  );

  // Get all online therapists
  const onlineTherapists = useMemo(() => {
    return Array.from(state.statuses.values()).filter(
      (status) => status.isOnline
    );
  }, [state.statuses]);

  // Get all offline therapists
  const offlineTherapists = useMemo(() => {
    return Array.from(state.statuses.values()).filter(
      (status) => !status.isOnline
    );
  }, [state.statuses]);

  // Get therapists by status
  const getTherapistsByStatus = useCallback(
    (status: "online" | "offline" | "away" | "busy") => {
      return Array.from(state.statuses.values()).filter(
        (therapist) => therapist.status === status
      );
    },
    [state.statuses]
  );

  // Get summary statistics
  const summary = useMemo(() => {
    const total = state.statuses.size;
    const online = onlineTherapists.length;
    const offline = offlineTherapists.length;
    const away = Array.from(state.statuses.values()).filter(
      (s) => s.status === "away"
    ).length;
    const recentChanges = state.changes.filter(
      (change) => Date.now() - change.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    ).length;

    return {
      total,
      online,
      offline,
      away,
      recentChanges,
      lastUpdated: state.lastUpdated,
    };
  }, [
    state.statuses,
    onlineTherapists,
    offlineTherapists,
    state.changes,
    state.lastUpdated,
  ]);

  // Check if therapist is available for booking
  const isAvailableForBooking = useCallback(
    (therapistId: string): boolean => {
      const status = state.statuses.get(therapistId);
      return status ? status.status === "online" : false;
    },
    [state.statuses]
  );

  // Get recently active therapists
  const getRecentlyActive = useCallback(
    (withinMinutes = 30): TherapistStatus[] => {
      const cutoff = new Date(Date.now() - withinMinutes * 60 * 1000);
      return Array.from(state.statuses.values()).filter(
        (status) => status.lastSeen && status.lastSeen >= cutoff
      );
    },
    [state.statuses]
  );

  // Clear change notifications
  const clearChanges = useCallback(() => {
    setState((prev) => ({ ...prev, changes: [] }));
  }, []);

  // Manually refresh status for a therapist
  const refreshTherapistStatus = useCallback(async (therapistId: string) => {
    // Trigger a presence update
    try {
      await realtimeService.updateUserPresence(therapistId);
    } catch (error) {
      console.error("Error refreshing therapist status:", error);
    }
  }, []);

  // Refresh all statuses
  const refresh = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true }));
    // The effect will handle re-subscribing
  }, []);

  return {
    // Data
    statuses: Array.from(state.statuses.values()),
    statusMap: state.statuses,
    isLoading: state.isLoading,
    lastUpdated: state.lastUpdated,
    changes: state.changes,
    summary,
    onlineTherapists,
    offlineTherapists,

    // Methods
    getTherapistStatus,
    getTherapistsByStatus,
    isAvailableForBooking,
    getRecentlyActive,
    clearChanges,
    refreshTherapistStatus,
    refresh,
    formatLastSeen,
  };
}

export default useRealtimeTherapistStatus;
