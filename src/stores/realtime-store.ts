/**
 * Real-time State Management Store
 * Zustand store for managing real-time synchronization state
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import realtimeService, {
  type ConnectionStatus,
  type ConflictData,
  type RealtimeEventData,
} from "@/lib/services/realtime-service";
import {
  TherapistAvailability,
  Appointment,
  ScheduleOverride,
} from "@/types/database";

interface RealtimeNotification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: Date;
  dismissed?: boolean;
  autoHide?: boolean;
  duration?: number;
}

interface RealtimeState {
  // Connection status
  connectionStatus: ConnectionStatus;
  isConnected: boolean;

  // Real-time data
  availabilityUpdates: Map<string, TherapistAvailability[]>; // therapistId -> availability
  appointmentUpdates: Map<string, Appointment[]>; // userId -> appointments
  overrideUpdates: Map<string, ScheduleOverride[]>; // therapistId -> overrides

  // Notifications and events
  notifications: RealtimeNotification[];
  conflicts: ConflictData[];
  recentEvents: RealtimeEventData[];

  // Settings
  settings: {
    enableNotifications: boolean;
    enableSounds: boolean;
    notificationDuration: number;
    maxRecentEvents: number;
  };

  // Actions
  updateConnectionStatus: (status: ConnectionStatus) => void;
  addNotification: (
    notification: Omit<RealtimeNotification, "id" | "timestamp">
  ) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;

  addConflict: (conflict: ConflictData) => void;
  resolveConflict: (conflictId: string) => void;
  clearResolvedConflicts: () => void;

  updateAvailability: (
    therapistId: string,
    availability: TherapistAvailability[]
  ) => void;
  updateAppointments: (userId: string, appointments: Appointment[]) => void;
  updateOverrides: (therapistId: string, overrides: ScheduleOverride[]) => void;

  addRecentEvent: (event: RealtimeEventData) => void;
  clearRecentEvents: () => void;

  updateSettings: (settings: Partial<RealtimeState["settings"]>) => void;

  // Initialization and cleanup
  initialize: () => void;
  cleanup: () => void;
}

export const useRealtimeStore = create<RealtimeState>()(
  devtools(
    (set, get) => ({
      // Initial state
      connectionStatus: {
        isOnline: navigator.onLine,
        reconnectAttempts: 0,
      },
      isConnected: false,
      availabilityUpdates: new Map(),
      appointmentUpdates: new Map(),
      overrideUpdates: new Map(),
      notifications: [],
      conflicts: [],
      recentEvents: [],

      settings: {
        enableNotifications: true,
        enableSounds: true,
        notificationDuration: 5000,
        maxRecentEvents: 50,
      },

      // Connection status actions
      updateConnectionStatus: (status) => {
        const wasConnected = get().isConnected;
        const isConnected = status.isOnline;

        set({
          connectionStatus: status,
          isConnected,
        });

        // Add notification for connection changes
        if (wasConnected !== isConnected) {
          get().addNotification({
            type: isConnected ? "success" : "warning",
            title: isConnected ? "Connected" : "Connection Lost",
            message: isConnected
              ? "Real-time updates restored"
              : "Attempting to reconnect...",
            autoHide: isConnected,
            duration: isConnected ? 3000 : undefined,
          });
        }
      },

      // Notification actions
      addNotification: (notificationData) => {
        const notification: RealtimeNotification = {
          id: `notification_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          timestamp: new Date(),
          ...notificationData,
        };

        set((state) => ({
          notifications: [notification, ...state.notifications.slice(0, 19)], // Keep last 20
        }));

        // Auto-hide if specified
        if (notification.autoHide) {
          setTimeout(() => {
            get().dismissNotification(notification.id);
          }, notification.duration || get().settings.notificationDuration);
        }
      },

      dismissNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, dismissed: true } : n
          ),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // Conflict actions
      addConflict: (conflict) => {
        set((state) => ({
          conflicts: [conflict, ...state.conflicts.slice(0, 9)], // Keep last 10
        }));

        // Add notification for conflicts
        get().addNotification({
          type: "warning",
          title: "Booking Conflict Detected",
          message: "Please review the conflict and take action",
          autoHide: false,
        });
      },

      resolveConflict: (conflictId) => {
        set((state) => ({
          conflicts: state.conflicts.map((c) =>
            c.id === conflictId ? { ...c, resolved: true } : c
          ),
        }));
      },

      clearResolvedConflicts: () => {
        set((state) => ({
          conflicts: state.conflicts.filter((c) => !c.resolved),
        }));
      },

      // Data update actions
      updateAvailability: (therapistId, availability) => {
        set((state) => {
          const newUpdates = new Map(state.availabilityUpdates);
          newUpdates.set(therapistId, availability);
          return { availabilityUpdates: newUpdates };
        });
      },

      updateAppointments: (userId, appointments) => {
        set((state) => {
          const newUpdates = new Map(state.appointmentUpdates);
          newUpdates.set(userId, appointments);
          return { appointmentUpdates: newUpdates };
        });
      },

      updateOverrides: (therapistId, overrides) => {
        set((state) => {
          const newUpdates = new Map(state.overrideUpdates);
          newUpdates.set(therapistId, overrides);
          return { overrideUpdates: newUpdates };
        });
      },

      // Event tracking actions
      addRecentEvent: (event) => {
        set((state) => {
          const maxEvents = state.settings.maxRecentEvents;
          const newEvents = [
            event,
            ...state.recentEvents.slice(0, maxEvents - 1),
          ];
          return { recentEvents: newEvents };
        });

        // Add notification for significant events
        if (event.type === "appointment" && event.action === "created") {
          get().addNotification({
            type: "success",
            title: "New Appointment",
            message: "A new appointment has been scheduled",
            autoHide: true,
          });
        } else if (event.type === "appointment" && event.action === "updated") {
          get().addNotification({
            type: "info",
            title: "Appointment Updated",
            message: "An appointment has been modified",
            autoHide: true,
          });
        }
      },

      clearRecentEvents: () => {
        set({ recentEvents: [] });
      },

      // Settings actions
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      // Initialization and cleanup
      initialize: () => {
        const state = get();

        // Set up connection status monitoring
        const unsubscribeConnection = realtimeService.onConnectionChange(
          (status) => {
            state.updateConnectionStatus(status);
          }
        );

        // Set up conflict monitoring
        const unsubscribeConflicts = realtimeService.onConflict((conflict) => {
          state.addConflict(conflict);
        });

        // Set up general event monitoring
        const unsubscribeEvents = realtimeService.subscribe("*", (event) => {
          state.addRecentEvent(event);
        });

        // Store cleanup functions (you might want to store these in state if needed)
        (window as Record<string, unknown>).__realtimeCleanup = () => {
          unsubscribeConnection();
          unsubscribeConflicts();
          unsubscribeEvents();
        };
      },

      cleanup: () => {
        // Call stored cleanup functions
        const windowWithCleanup = window as Record<string, unknown>;
        if (windowWithCleanup.__realtimeCleanup) {
          (windowWithCleanup.__realtimeCleanup as () => void)();
          delete windowWithCleanup.__realtimeCleanup;
        }

        // Reset state
        set({
          availabilityUpdates: new Map(),
          appointmentUpdates: new Map(),
          overrideUpdates: new Map(),
          notifications: [],
          conflicts: [],
          recentEvents: [],
        });
      },
    }),
    {
      name: "realtime-store",
    }
  )
);

// Selectors
export const selectConnectionStatus = (state: RealtimeState) =>
  state.connectionStatus;
export const selectIsConnected = (state: RealtimeState) => state.isConnected;
export const selectNotifications = (state: RealtimeState) =>
  state.notifications.filter((n) => !n.dismissed);
export const selectActiveConflicts = (state: RealtimeState) =>
  state.conflicts.filter((c) => !c.resolved);
export const selectRecentEvents = (state: RealtimeState) => state.recentEvents;
export const selectSettings = (state: RealtimeState) => state.settings;

// Helper function to get availability for a therapist
export const selectTherapistAvailability =
  (therapistId: string) => (state: RealtimeState) =>
    state.availabilityUpdates.get(therapistId) || [];

// Helper function to get appointments for a user
export const selectUserAppointments =
  (userId: string) => (state: RealtimeState) =>
    state.appointmentUpdates.get(userId) || [];

// Helper function to get overrides for a therapist
export const selectTherapistOverrides =
  (therapistId: string) => (state: RealtimeState) =>
    state.overrideUpdates.get(therapistId) || [];

export default useRealtimeStore;
