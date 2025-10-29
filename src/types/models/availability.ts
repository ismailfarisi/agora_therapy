/**
 * Availability Model
 * Time slots, schedules, and availability types
 */

import { Timestamp, FieldValue } from "firebase/firestore";

export type OverrideType = "day_off" | "custom_hours" | "time_off";

export interface TimeSlot {
  id: string;
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  duration: number; // minutes
  displayName: string; // "9:00 AM - 10:00 AM"
  isStandard: boolean;
  sortOrder: number;
}

export interface TherapistAvailability {
  id: string;
  therapistId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  timeSlotId: string;
  status: "available" | "unavailable";
  maxConcurrentClients: number;
  recurringPattern: {
    type: "weekly" | "biweekly" | "monthly";
    endDate?: Timestamp;
  };
  metadata: {
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
    notes?: string;
  };
}

export interface ScheduleOverride {
  id: string;
  therapistId: string;
  date: Timestamp; // specific date
  type: OverrideType;
  affectedSlots?: string[]; // timeSlotIds if partial day
  reason: string;
  isRecurring: boolean;
  recurringUntil?: Timestamp;
  metadata: {
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
    notes?: string;
  };
}

export interface AvailableSlot {
  timeSlotId: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  currency: string;
}

export interface EnhancedAvailableSlot extends AvailableSlot {
  isBooked: boolean;
  therapistTimezone: string;
  localStartTime: string;
  localEndTime: string;
  localDate: string;
  displayTime: string;
  bufferTime?: number;
  isOverride?: boolean;
}
