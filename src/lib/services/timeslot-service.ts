/**
 * Time Slot Management Service
 * CRUD operations for standard time slots
 */

import {
  collection,
  doc,
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
import { db } from "@/lib/firebase/client";
import { collections, documents, generateId } from "@/lib/firebase/collections";
import { TimeSlot } from "@/types/database";
import { businessConfig } from "@/lib/config";

export class TimeSlotService {
  /**
   * Get all time slots ordered by sort order
   */
  static async getTimeSlots(): Promise<TimeSlot[]> {
    try {
      const q = query(collections.timeSlots(), orderBy("sortOrder", "asc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TimeSlot[];
    } catch (error) {
      console.error("Error fetching time slots:", error);
      throw new Error("Failed to fetch time slots");
    }
  }

  /**
   * Get standard time slots only
   */
  static async getStandardTimeSlots(): Promise<TimeSlot[]> {
    try {
      const q = query(
        collections.timeSlots(),
        where("isStandard", "==", true),
        orderBy("sortOrder", "asc")
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TimeSlot[];
    } catch (error) {
      console.error("Error fetching standard time slots:", error);
      throw new Error("Failed to fetch standard time slots");
    }
  }

  /**
   * Get a specific time slot by ID
   */
  static async getTimeSlot(id: string): Promise<TimeSlot | null> {
    try {
      const docRef = documents.timeSlot(id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as TimeSlot;
    } catch (error) {
      console.error("Error fetching time slot:", error);
      throw new Error("Failed to fetch time slot");
    }
  }

  /**
   * Create a new time slot
   */
  static async createTimeSlot(
    timeSlotData: Omit<TimeSlot, "id">
  ): Promise<string> {
    try {
      // Validate time slot data
      this.validateTimeSlot(timeSlotData);

      const docRef = await addDoc(collections.timeSlots(), {
        ...timeSlotData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating time slot:", error);
      throw new Error("Failed to create time slot");
    }
  }

  /**
   * Update an existing time slot
   */
  static async updateTimeSlot(
    id: string,
    updates: Partial<Omit<TimeSlot, "id">>
  ): Promise<void> {
    try {
      // Validate updates if they include time data
      if (updates.startTime || updates.endTime || updates.duration) {
        const existing = await this.getTimeSlot(id);
        if (!existing) {
          throw new Error("Time slot not found");
        }

        const updatedData = { ...existing, ...updates };
        this.validateTimeSlot(updatedData);
      }

      const docRef = documents.timeSlot(id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating time slot:", error);
      throw new Error("Failed to update time slot");
    }
  }

  /**
   * Delete a time slot
   */
  static async deleteTimeSlot(id: string): Promise<void> {
    try {
      // TODO: Check if time slot is in use by appointments or availability
      // For now, we'll allow deletion but this should be enhanced

      const docRef = documents.timeSlot(id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting time slot:", error);
      throw new Error("Failed to delete time slot");
    }
  }

  /**
   * Generate standard time slots automatically
   * @param startTime - Start time in 24h format (e.g., "09:00")
   * @param endTime - End time in 24h format (e.g., "17:00")
   * @param intervalMinutes - Interval between slots in minutes
   * @param duration - Duration of each slot in minutes
   */
  static async generateStandardTimeSlots(
    startTime: string,
    endTime: string,
    intervalMinutes: number = 60,
    duration: number = businessConfig.defaultAppointmentDuration
  ): Promise<string[]> {
    try {
      const slots = this.calculateTimeSlots(
        startTime,
        endTime,
        intervalMinutes,
        duration
      );
      const createdIds: string[] = [];

      // Create each time slot
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const id = await this.createTimeSlot({
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: slot.duration,
          displayName: slot.displayName,
          isStandard: true,
          sortOrder: i * 10, // Leave gaps for manual insertions
        });
        createdIds.push(id);
      }

      return createdIds;
    } catch (error) {
      console.error("Error generating standard time slots:", error);
      throw new Error("Failed to generate standard time slots");
    }
  }

  /**
   * Calculate time slots between two times
   */
  private static calculateTimeSlots(
    startTime: string,
    endTime: string,
    intervalMinutes: number,
    duration: number
  ) {
    const slots = [];
    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);

    let current = start;
    while (current < end) {
      const slotEnd = current + duration;

      // Don't create slot if it would extend past end time
      if (slotEnd > end) break;

      const startTimeStr = this.formatTime(current);
      const endTimeStr = this.formatTime(slotEnd);
      const displayName = this.formatDisplayTime(startTimeStr, endTimeStr);

      slots.push({
        startTime: startTimeStr,
        endTime: endTimeStr,
        duration,
        displayName,
      });

      current += intervalMinutes;
    }

    return slots;
  }

  /**
   * Parse time string (HH:MM) to minutes since midnight
   */
  private static parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Format minutes since midnight to time string (HH:MM)
   */
  private static formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  }

  /**
   * Format display time for UI (e.g., "9:00 AM - 10:00 AM")
   */
  private static formatDisplayTime(startTime: string, endTime: string): string {
    const formatFor12Hour = (timeStr: string): string => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const displayMinutes =
        minutes === 0 ? "" : `:${minutes.toString().padStart(2, "0")}`;
      return `${displayHours}${displayMinutes} ${period}`;
    };

    return `${formatFor12Hour(startTime)} - ${formatFor12Hour(endTime)}`;
  }

  /**
   * Validate time slot data
   */
  private static validateTimeSlot(timeSlot: Omit<TimeSlot, "id">): void {
    if (!timeSlot.startTime || !timeSlot.endTime) {
      throw new Error("Start time and end time are required");
    }

    if (!timeSlot.startTime.match(/^\d{2}:\d{2}$/)) {
      throw new Error("Start time must be in HH:MM format");
    }

    if (!timeSlot.endTime.match(/^\d{2}:\d{2}$/)) {
      throw new Error("End time must be in HH:MM format");
    }

    const startMinutes = this.parseTime(timeSlot.startTime);
    const endMinutes = this.parseTime(timeSlot.endTime);

    if (startMinutes >= endMinutes) {
      throw new Error("Start time must be before end time");
    }

    if (timeSlot.duration <= 0) {
      throw new Error("Duration must be positive");
    }

    const calculatedDuration = endMinutes - startMinutes;
    if (Math.abs(calculatedDuration - timeSlot.duration) > 1) {
      throw new Error("Duration doesn't match start and end times");
    }
  }

  /**
   * Subscribe to time slots changes (real-time)
   */
  static subscribeToTimeSlots(
    callback: (timeSlots: TimeSlot[]) => void,
    standardOnly: boolean = false
  ): () => void {
    const baseQuery = standardOnly
      ? query(
          collections.timeSlots(),
          where("isStandard", "==", true),
          orderBy("sortOrder", "asc")
        )
      : query(collections.timeSlots(), orderBy("sortOrder", "asc"));

    return onSnapshot(
      baseQuery,
      (snapshot) => {
        const timeSlots = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TimeSlot[];
        callback(timeSlots);
      },
      (error) => {
        console.error("Error in time slots subscription:", error);
      }
    );
  }

  /**
   * Check if a time slot conflicts with existing slots
   */
  static async checkTimeSlotConflict(
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const allSlots = await this.getTimeSlots();
      const startMinutes = this.parseTime(startTime);
      const endMinutes = this.parseTime(endTime);

      return allSlots.some((slot) => {
        if (excludeId && slot.id === excludeId) return false;

        const slotStartMinutes = this.parseTime(slot.startTime);
        const slotEndMinutes = this.parseTime(slot.endTime);

        // Check for overlap
        return (
          (startMinutes < slotEndMinutes && endMinutes > slotStartMinutes) ||
          (slotStartMinutes < endMinutes && slotEndMinutes > startMinutes)
        );
      });
    } catch (error) {
      console.error("Error checking time slot conflict:", error);
      throw new Error("Failed to check time slot conflict");
    }
  }

  /**
   * Bulk create time slots
   */
  static async bulkCreateTimeSlots(
    slots: Omit<TimeSlot, "id">[]
  ): Promise<string[]> {
    try {
      const createdIds: string[] = [];

      for (const slot of slots) {
        const id = await this.createTimeSlot(slot);
        createdIds.push(id);
      }

      return createdIds;
    } catch (error) {
      console.error("Error bulk creating time slots:", error);
      throw new Error("Failed to bulk create time slots");
    }
  }

  /**
   * Get time slots for a specific duration
   */
  static async getTimeSlotsForDuration(duration: number): Promise<TimeSlot[]> {
    try {
      const q = query(
        collections.timeSlots(),
        where("duration", "==", duration),
        orderBy("sortOrder", "asc")
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TimeSlot[];
    } catch (error) {
      console.error("Error fetching time slots for duration:", error);
      throw new Error("Failed to fetch time slots for duration");
    }
  }
}

export default TimeSlotService;
