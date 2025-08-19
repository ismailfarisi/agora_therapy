/**
 * Real-time Synchronization Service
 * Unified WebSocket-like real-time updates using Firebase
 * Cross-component state synchronization and conflict resolution
 */

import {
  onSnapshot,
  query,
  where,
  orderBy,
  collection,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
  DocumentSnapshot,
  QuerySnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { collections, documents } from "@/lib/firebase/collections";
import {
  TherapistAvailability,
  Appointment,
  ScheduleOverride,
  User,
  AppointmentStatus,
} from "@/types/database";

interface RealtimeEventData {
  type: "availability" | "appointment" | "override" | "therapist_status";
  action: "created" | "updated" | "deleted";
  data: Record<string, unknown>;
  timestamp: Date;
  source?: string;
}

interface ConnectionStatus {
  isOnline: boolean;
  lastSeen?: Date;
  reconnectAttempts: number;
  latency?: number;
}

interface ConflictData {
  id: string;
  type: "booking_conflict" | "availability_conflict" | "override_conflict";
  details: {
    conflictingEntity: Record<string, unknown>;
    requestedAction: string;
    timestamp: Date;
  };
  resolved: boolean;
}

type EventCallback = (event: RealtimeEventData) => void;
type ConflictCallback = (conflict: ConflictData) => void;
type ConnectionCallback = (status: ConnectionStatus) => void;

class RealtimeService {
  private eventListeners: Map<string, Set<EventCallback>> = new Map();
  private conflictListeners: Set<ConflictCallback> = new Set();
  private connectionListeners: Set<ConnectionCallback> = new Set();
  private subscriptions: Map<string, Unsubscribe> = new Map();
  private connectionStatus: ConnectionStatus = {
    isOnline: navigator.onLine,
    reconnectAttempts: 0,
  };
  private heartbeatInterval?: NodeJS.Timeout;
  private reconnectTimeout?: NodeJS.Timeout;

  constructor() {
    this.setupConnectionMonitoring();
    this.startHeartbeat();
  }

  /**
   * Subscribe to real-time events
   */
  subscribe(eventType: string, callback: EventCallback): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }

    this.eventListeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(eventType);
          this.cleanupSubscription(eventType);
        }
      }
    };
  }

  /**
   * Subscribe to conflict events
   */
  onConflict(callback: ConflictCallback): () => void {
    this.conflictListeners.add(callback);
    return () => this.conflictListeners.delete(callback);
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionListeners.add(callback);
    // Immediately call with current status
    callback(this.connectionStatus);
    return () => this.connectionListeners.delete(callback);
  }

  /**
   * Subscribe to therapist availability changes
   */
  subscribeToTherapistAvailability(
    therapistId: string,
    callback: (availability: TherapistAvailability[]) => void
  ): () => void {
    const subscriptionKey = `availability_${therapistId}`;

    const q = query(
      collections.therapistAvailability(),
      where("therapistId", "==", therapistId),
      orderBy("dayOfWeek", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const availability = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TherapistAvailability[];

        callback(availability);

        // Emit real-time event
        this.emitEvent({
          type: "availability",
          action: "updated",
          data: { therapistId, availability },
          timestamp: new Date(),
        });
      },
      (error) => {
        console.error("Error in availability subscription:", error);
        this.handleConnectionError(error);
      }
    );

    this.subscriptions.set(subscriptionKey, unsubscribe);

    return () => {
      unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    };
  }

  /**
   * Subscribe to appointment changes
   */
  subscribeToAppointments(
    userId: string,
    userType: "client" | "therapist",
    callback: (appointments: Appointment[]) => void
  ): () => void {
    const subscriptionKey = `appointments_${userType}_${userId}`;
    const field = userType === "client" ? "clientId" : "therapistId";

    const q = query(
      collections.appointments(),
      where(field, "==", userId),
      orderBy("scheduledFor", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const appointments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Appointment[];

        callback(appointments);

        // Check for conflicts and emit events
        this.processAppointmentChanges(snapshot, userId, userType);
      },
      (error) => {
        console.error("Error in appointments subscription:", error);
        this.handleConnectionError(error);
      }
    );

    this.subscriptions.set(subscriptionKey, unsubscribe);

    return () => {
      unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    };
  }

  /**
   * Subscribe to schedule overrides
   */
  subscribeToScheduleOverrides(
    therapistId: string,
    callback: (overrides: ScheduleOverride[]) => void,
    dateRange?: { from: Date; to: Date }
  ): () => void {
    const subscriptionKey = `overrides_${therapistId}`;

    let q = query(
      collections.scheduleOverrides(),
      where("therapistId", "==", therapistId),
      orderBy("date", "asc")
    );

    // Add date filtering if provided
    if (dateRange) {
      q = query(
        q,
        where("date", ">=", Timestamp.fromDate(dateRange.from)),
        where("date", "<=", Timestamp.fromDate(dateRange.to))
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const overrides = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ScheduleOverride[];

        callback(overrides);

        // Emit real-time event
        this.emitEvent({
          type: "override",
          action: "updated",
          data: { therapistId, overrides },
          timestamp: new Date(),
        });
      },
      (error) => {
        console.error("Error in overrides subscription:", error);
        this.handleConnectionError(error);
      }
    );

    this.subscriptions.set(subscriptionKey, unsubscribe);

    return () => {
      unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    };
  }

  /**
   * Subscribe to therapist online status
   */
  subscribeToTherapistStatus(
    therapistId: string,
    callback: (isOnline: boolean, lastSeen?: Date) => void
  ): () => void {
    const subscriptionKey = `status_${therapistId}`;

    const unsubscribe = onSnapshot(
      documents.user(therapistId),
      (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data() as User;
          const lastLogin = userData.metadata.lastLoginAt as Timestamp;
          const isOnline = this.calculateOnlineStatus(lastLogin);

          callback(isOnline, lastLogin?.toDate());

          // Emit real-time event
          this.emitEvent({
            type: "therapist_status",
            action: "updated",
            data: { therapistId, isOnline, lastSeen: lastLogin?.toDate() },
            timestamp: new Date(),
          });
        }
      },
      (error) => {
        console.error("Error in therapist status subscription:", error);
        this.handleConnectionError(error);
      }
    );

    this.subscriptions.set(subscriptionKey, unsubscribe);

    return () => {
      unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    };
  }

  /**
   * Handle booking conflicts in real-time
   */
  async handleBookingConflict(
    appointmentData: Record<string, unknown>,
    existingAppointment?: Appointment
  ): Promise<{ canProceed: boolean; conflict?: ConflictData }> {
    if (!existingAppointment) {
      return { canProceed: true };
    }

    const conflict: ConflictData = {
      id: `booking_${Date.now()}`,
      type: "booking_conflict",
      details: {
        conflictingEntity: existingAppointment as unknown as Record<
          string,
          unknown
        >,
        requestedAction: "book_appointment",
        timestamp: new Date(),
      },
      resolved: false,
    };

    // Emit conflict to all listeners
    this.emitConflict(conflict);

    // Auto-resolve conflicts with cancelled appointments
    if (existingAppointment.status === "cancelled") {
      return { canProceed: true };
    }

    return { canProceed: false, conflict };
  }

  /**
   * Update user's last seen timestamp
   */
  async updateUserPresence(userId: string): Promise<void> {
    try {
      await updateDoc(documents.user(userId), {
        "metadata.lastLoginAt": serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating user presence:", error);
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Force reconnection attempt
   */
  reconnect(): void {
    this.connectionStatus.reconnectAttempts++;
    this.updateConnectionStatus({ isOnline: true });
    this.startHeartbeat();
  }

  /**
   * Clean up all subscriptions
   */
  cleanup(): void {
    // Unsubscribe from all Firebase listeners
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions.clear();

    // Clear all event listeners
    this.eventListeners.clear();
    this.conflictListeners.clear();
    this.connectionListeners.clear();

    // Clear intervals and timeouts
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // Remove network event listeners
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
  }

  // Private methods

  private setupConnectionMonitoring(): void {
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
  }

  private handleOnline = (): void => {
    this.updateConnectionStatus({
      isOnline: true,
      reconnectAttempts: 0,
    });
  };

  private handleOffline = (): void => {
    this.updateConnectionStatus({ isOnline: false });
  };

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      this.performHeartbeat();
    }, 30000); // 30 seconds
  }

  private async performHeartbeat(): Promise<void> {
    const startTime = Date.now();

    try {
      // Simple Firebase read to check connectivity
      await getDoc(doc(db, "heartbeat", "test"));
      const latency = Date.now() - startTime;

      this.updateConnectionStatus({
        isOnline: true,
        latency,
        reconnectAttempts: 0,
      });
    } catch (error) {
      this.handleConnectionError(error as Error);
    }
  }

  private handleConnectionError(error: Error): void {
    console.error("Connection error:", error);

    this.updateConnectionStatus({
      isOnline: false,
      reconnectAttempts: this.connectionStatus.reconnectAttempts + 1,
    });

    // Implement exponential backoff for reconnection
    const backoffDelay = Math.min(
      1000 * Math.pow(2, this.connectionStatus.reconnectAttempts),
      30000
    );

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.reconnect();
    }, backoffDelay);
  }

  private updateConnectionStatus(updates: Partial<ConnectionStatus>): void {
    const wasOnline = this.connectionStatus.isOnline;
    this.connectionStatus = {
      ...this.connectionStatus,
      ...updates,
      lastSeen: new Date(),
    };

    // Notify connection listeners
    this.connectionListeners.forEach((callback) => {
      callback(this.connectionStatus);
    });

    // If we just came back online, restart heartbeat
    if (!wasOnline && this.connectionStatus.isOnline) {
      this.startHeartbeat();
    }
  }

  private emitEvent(event: RealtimeEventData): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error("Error in event callback:", error);
        }
      });
    }
  }

  private emitConflict(conflict: ConflictData): void {
    this.conflictListeners.forEach((callback) => {
      try {
        callback(conflict);
      } catch (error) {
        console.error("Error in conflict callback:", error);
      }
    });
  }

  private cleanupSubscription(eventType: string): void {
    // Clean up any subscriptions related to this event type
    const keysToRemove: string[] = [];
    this.subscriptions.forEach((unsubscribe, key) => {
      if (key.includes(eventType)) {
        unsubscribe();
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach((key) => {
      this.subscriptions.delete(key);
    });
  }

  private processAppointmentChanges(
    snapshot: QuerySnapshot,
    userId: string,
    userType: "client" | "therapist"
  ): void {
    snapshot.docChanges().forEach((change) => {
      const appointment = {
        id: change.doc.id,
        ...change.doc.data(),
      } as Appointment;

      let action: "created" | "updated" | "deleted";
      switch (change.type) {
        case "added":
          action = "created";
          break;
        case "modified":
          action = "updated";
          break;
        case "removed":
          action = "deleted";
          break;
      }

      this.emitEvent({
        type: "appointment",
        action,
        data: { appointment, userId, userType },
        timestamp: new Date(),
      });
    });
  }

  private calculateOnlineStatus(lastLogin?: Timestamp): boolean {
    if (!lastLogin) return false;

    const now = new Date();
    const lastLoginDate = lastLogin.toDate();
    const diffMinutes = (now.getTime() - lastLoginDate.getTime()) / (1000 * 60);

    // Consider user online if they were active within last 5 minutes
    return diffMinutes < 5;
  }
}

// Create singleton instance
export const realtimeService = new RealtimeService();

// Export types
export type { RealtimeEventData, ConnectionStatus, ConflictData };

export default realtimeService;
