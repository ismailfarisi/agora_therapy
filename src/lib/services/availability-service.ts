/**
 * Availability Management Service
 * CRUD operations for therapist availability and schedule overrides
 */

import {
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { collections, documents } from "@/lib/firebase/collections";
import {
  TherapistAvailability,
  ScheduleOverride,
} from "@/types/database";
import { TimeSlotService } from "./timeslot-service";

export class AvailabilityService {
  /**
   * Get all availability records for a therapist
   */
  static async getTherapistAvailability(
    therapistId: string
  ): Promise<TherapistAvailability[]> {
    try {
      const q = query(
        collections.therapistAvailability(),
        where("therapistId", "==", therapistId),
        orderBy("dayOfWeek", "asc")
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TherapistAvailability[];
    } catch (error) {
      console.error("Error fetching therapist availability:", error);
      throw new Error("Failed to fetch therapist availability");
    }
  }

  /**
   * Get availability for a specific day of the week
   */
  static async getAvailabilityForDay(
    therapistId: string,
    dayOfWeek: number
  ): Promise<TherapistAvailability[]> {
    try {
      const q = query(
        collections.therapistAvailability(),
        where("therapistId", "==", therapistId),
        where("dayOfWeek", "==", dayOfWeek),
        where("status", "==", "available")
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TherapistAvailability[];
    } catch (error) {
      console.error("Error fetching availability for day:", error);
      throw new Error("Failed to fetch availability for day");
    }
  }

  /**
   * Create availability record
   */
  static async createAvailability(
    availabilityData: Omit<TherapistAvailability, "id">
  ): Promise<string> {
    try {
      // Validate the availability data
      await this.validateAvailability(availabilityData);

      const docRef = await addDoc(collections.therapistAvailability(), {
        ...availabilityData,
        metadata: {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          notes: availabilityData.metadata?.notes || "",
        },
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating availability:", error);
      throw new Error("Failed to create availability");
    }
  }

  /**
   * Update availability record
   */
  static async updateAvailability(
    id: string,
    updates: Partial<Omit<TherapistAvailability, "id">>
  ): Promise<void> {
    try {
      if (updates.timeSlotId || updates.therapistId || updates.dayOfWeek) {
        // If key fields are being updated, validate the entire record
        const existing = await this.getAvailabilityRecord(id);
        if (!existing) {
          throw new Error("Availability record not found");
        }

        const updatedData = { ...existing, ...updates };
        await this.validateAvailability(updatedData);
      }

      const docRef = documents.therapistAvailability(id);
      await updateDoc(docRef, {
        ...updates,
        "metadata.updatedAt": serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating availability:", error);
      throw new Error("Failed to update availability");
    }
  }

  /**
   * Delete availability record
   */
  static async deleteAvailability(id: string): Promise<void> {
    try {
      const docRef = documents.therapistAvailability(id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting availability:", error);
      throw new Error("Failed to delete availability");
    }
  }

  /**
   * Get a single availability record
   */
  static async getAvailabilityRecord(
    id: string
  ): Promise<TherapistAvailability | null> {
    try {
      const docRef = documents.therapistAvailability(id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as TherapistAvailability;
    } catch (error) {
      console.error("Error fetching availability record:", error);
      throw new Error("Failed to fetch availability record");
    }
  }

  /**
   * Set weekly recurring schedule for therapist
   */
  static async setWeeklySchedule(
    therapistId: string,
    weeklySchedule: {
      [dayOfWeek: number]: string[]; // day -> array of timeSlotIds
    },
    recurringPattern: TherapistAvailability["recurringPattern"] = {
      type: "weekly",
    }
  ): Promise<string[]> {
    try {
      // Clear existing weekly availability
      await this.clearWeeklyAvailability(therapistId);

      const createdIds: string[] = [];

      // Create new availability records
      for (const [dayStr, timeSlotIds] of Object.entries(weeklySchedule)) {
        const dayOfWeek = parseInt(dayStr);

        for (const timeSlotId of timeSlotIds) {
          const id = await this.createAvailability({
            therapistId,
            dayOfWeek,
            timeSlotId,
            status: "available",
            maxConcurrentClients: 1, // Default to 1, can be customized
            recurringPattern,
            metadata: {
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              notes: "Weekly recurring schedule",
            },
          });
          createdIds.push(id);
        }
      }

      return createdIds;
    } catch (error) {
      console.error("Error setting weekly schedule:", error);
      throw new Error("Failed to set weekly schedule");
    }
  }

  /**
   * Clear existing weekly availability for a therapist
   */
  private static async clearWeeklyAvailability(
    therapistId: string
  ): Promise<void> {
    const existing = await this.getTherapistAvailability(therapistId);
    const weeklyRecords = existing.filter(
      (record) => record.recurringPattern.type === "weekly"
    );

    for (const record of weeklyRecords) {
      await this.deleteAvailability(record.id);
    }
  }

  /**
   * Get schedule overrides for a therapist
   */
  static async getScheduleOverrides(
    therapistId: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<ScheduleOverride[]> {
    try {
      let q = query(
        collections.scheduleOverrides(),
        where("therapistId", "==", therapistId),
        orderBy("date", "asc")
      );

      // Add date filtering if provided
      if (fromDate) {
        q = query(q, where("date", ">=", Timestamp.fromDate(fromDate)));
      }
      if (toDate) {
        q = query(q, where("date", "<=", Timestamp.fromDate(toDate)));
      }

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ScheduleOverride[];
    } catch (error) {
      console.error("Error fetching schedule overrides:", error);
      throw new Error("Failed to fetch schedule overrides");
    }
  }

  /**
   * Create schedule override
   */
  static async createScheduleOverride(
    overrideData: Omit<ScheduleOverride, "id">
  ): Promise<string> {
    try {
      const docRef = await addDoc(collections.scheduleOverrides(), {
        ...overrideData,
        metadata: {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          notes: overrideData.metadata?.notes || "",
        },
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating schedule override:", error);
      throw new Error("Failed to create schedule override");
    }
  }

  /**
   * Update schedule override
   */
  static async updateScheduleOverride(
    id: string,
    updates: Partial<Omit<ScheduleOverride, "id">>
  ): Promise<void> {
    try {
      const docRef = documents.scheduleOverride(id);
      await updateDoc(docRef, {
        ...updates,
        "metadata.updatedAt": serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating schedule override:", error);
      throw new Error("Failed to update schedule override");
    }
  }

  /**
   * Delete schedule override
   */
  static async deleteScheduleOverride(id: string): Promise<void> {
    try {
      const docRef = documents.scheduleOverride(id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting schedule override:", error);
      throw new Error("Failed to delete schedule override");
    }
  }

  /**
   * Calculate actual availability for a specific date
   * Takes into account recurring availability and any overrides
   */
  static async getAvailabilityForDate(
    therapistId: string,
    date: Date,
    therapistTimezone?: string,
    clientTimezone?: string
  ): Promise<{
    available: TherapistAvailability[];
    overrides: ScheduleOverride[];
    effectiveSlots: string[]; // timeSlotIds that are actually available
  }> {
    try {
      const dayOfWeek = date.getDay();

      // Get regular availability for this day of week
      const regularAvailability = await this.getAvailabilityForDay(
        therapistId,
        dayOfWeek
      );

      // Get any overrides for this specific date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const overrides = await this.getScheduleOverrides(
        therapistId,
        startOfDay,
        endOfDay
      );

      // Calculate effective availability
      let effectiveSlots = regularAvailability.map((av) => av.timeSlotId);

      // Apply overrides
      for (const override of overrides) {
        switch (override.type) {
          case "day_off":
            // Day off overrides everything - no availability
            effectiveSlots = [];
            break;
          case "time_off":
            // Remove specific time slots
            if (override.affectedSlots) {
              effectiveSlots = effectiveSlots.filter(
                (slotId) => !override.affectedSlots!.includes(slotId)
              );
            }
            break;
          case "custom_hours":
            // Replace regular availability with custom slots
            if (override.affectedSlots) {
              effectiveSlots = override.affectedSlots;
            }
            break;
        }
      }

      // If timezone conversion is needed and timezones are provided
      if (
        therapistTimezone &&
        clientTimezone &&
        therapistTimezone !== clientTimezone
      ) {
        try {
          const { convertAvailabilityTimeSlots, isSameTimezone } = await import(
            "@/lib/utils/timezone-utils"
          );

          // Only convert if timezones are actually different
          if (!isSameTimezone(therapistTimezone, clientTimezone)) {
            // Get all time slots to enable conversion
            const { TimeSlotService } = await import("./timeslot-service");
            const allTimeSlots = await TimeSlotService.getTimeSlots();

            // Convert effective slots to client timezone
            const dateString = date.toISOString().split("T")[0];
            effectiveSlots = convertAvailabilityTimeSlots(
              effectiveSlots,
              dateString,
              therapistTimezone,
              clientTimezone,
              allTimeSlots.map((slot) => ({
                id: slot.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
              }))
            );
          }
        } catch (error) {
          console.warn("Error converting availability timezone:", error);
          // Continue with original slots on error
        }
      }

      return {
        available: regularAvailability,
        overrides,
        effectiveSlots,
      };
    } catch (error) {
      console.error("Error calculating availability for date:", error);
      throw new Error("Failed to calculate availability for date");
    }
  }

  /**
   * Check for scheduling conflicts
   */
  static async checkAvailabilityConflict(
    therapistId: string,
    dayOfWeek: number,
    timeSlotId: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const q = query(
        collections.therapistAvailability(),
        where("therapistId", "==", therapistId),
        where("dayOfWeek", "==", dayOfWeek),
        where("timeSlotId", "==", timeSlotId)
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.some((doc) =>
        excludeId ? doc.id !== excludeId : true
      );
    } catch (error) {
      console.error("Error checking availability conflict:", error);
      throw new Error("Failed to check availability conflict");
    }
  }

  /**
   * Subscribe to availability changes (real-time)
   */
  static subscribeToAvailability(
    therapistId: string,
    callback: (availability: TherapistAvailability[]) => void
  ): () => void {
    const q = query(
      collections.therapistAvailability(),
      where("therapistId", "==", therapistId),
      orderBy("dayOfWeek", "asc")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const availability = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TherapistAvailability[];
        callback(availability);
      },
      (error) => {
        console.error("Error in availability subscription:", error);
      }
    );
  }

  /**
   * Subscribe to schedule overrides (real-time)
   */
  static subscribeToOverrides(
    therapistId: string,
    callback: (overrides: ScheduleOverride[]) => void,
    fromDate?: Date,
    toDate?: Date
  ): () => void {
    let q = query(
      collections.scheduleOverrides(),
      where("therapistId", "==", therapistId),
      orderBy("date", "asc")
    );

    // Add date filtering if provided
    if (fromDate) {
      q = query(q, where("date", ">=", Timestamp.fromDate(fromDate)));
    }
    if (toDate) {
      q = query(q, where("date", "<=", Timestamp.fromDate(toDate)));
    }

    return onSnapshot(
      q,
      (snapshot) => {
        const overrides = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ScheduleOverride[];
        callback(overrides);
      },
      (error) => {
        console.error("Error in overrides subscription:", error);
      }
    );
  }

  /**
   * Bulk set availability for multiple days
   */
  static async bulkSetAvailability(
    therapistId: string,
    availabilityData: Array<{
      dayOfWeek: number;
      timeSlotIds: string[];
    }>,
    recurringPattern: TherapistAvailability["recurringPattern"] = {
      type: "weekly",
    }
  ): Promise<string[]> {
    try {
      const createdIds: string[] = [];

      for (const { dayOfWeek, timeSlotIds } of availabilityData) {
        // Clear existing availability for this day
        const existing = await this.getAvailabilityForDay(
          therapistId,
          dayOfWeek
        );
        for (const record of existing) {
          await this.deleteAvailability(record.id);
        }

        // Create new availability records
        for (const timeSlotId of timeSlotIds) {
          const id = await this.createAvailability({
            therapistId,
            dayOfWeek,
            timeSlotId,
            status: "available",
            maxConcurrentClients: 1,
            recurringPattern,
            metadata: {
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
          });
          createdIds.push(id);
        }
      }

      return createdIds;
    } catch (error) {
      console.error("Error bulk setting availability:", error);
      throw new Error("Failed to bulk set availability");
    }
  }

  /**
   * Get availability statistics
   */
  static async getAvailabilityStats(
    therapistId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<{
    totalSlots: number;
    availableSlots: number;
    overriddenSlots: number;
    dayOffCount: number;
  }> {
    try {
      const availability = await this.getTherapistAvailability(therapistId);
      const overrides = await this.getScheduleOverrides(
        therapistId,
        fromDate,
        toDate
      );

      // Calculate stats based on date range
      const dayCount = Math.ceil(
        (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalSlots = availability.length * dayCount;

      let overriddenSlots = 0;
      let dayOffCount = 0;

      for (const override of overrides) {
        if (override.type === "day_off") {
          dayOffCount++;
          overriddenSlots += availability.length;
        } else if (override.affectedSlots) {
          overriddenSlots += override.affectedSlots.length;
        }
      }

      return {
        totalSlots,
        availableSlots: totalSlots - overriddenSlots,
        overriddenSlots,
        dayOffCount,
      };
    } catch (error) {
      console.error("Error getting availability stats:", error);
      throw new Error("Failed to get availability stats");
    }
  }

  /**
   * Validate availability data
   */
  private static async validateAvailability(
    availability: Omit<TherapistAvailability, "id">
  ): Promise<void> {
    // Check if day of week is valid (0-6)
    if (availability.dayOfWeek < 0 || availability.dayOfWeek > 6) {
      throw new Error(
        "Day of week must be between 0 (Sunday) and 6 (Saturday)"
      );
    }

    // Check if time slot exists
    const timeSlot = await TimeSlotService.getTimeSlot(availability.timeSlotId);
    if (!timeSlot) {
      throw new Error("Time slot not found");
    }

    // Check for conflicts
    const hasConflict = await this.checkAvailabilityConflict(
      availability.therapistId,
      availability.dayOfWeek,
      availability.timeSlotId
    );

    if (hasConflict) {
      throw new Error("Availability conflict detected for this time slot");
    }

    // Validate max concurrent clients
    if (availability.maxConcurrentClients < 1) {
      throw new Error("Max concurrent clients must be at least 1");
    }
  }
}

export default AvailabilityService;
