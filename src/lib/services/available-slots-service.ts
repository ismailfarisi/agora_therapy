/**
 * Available Slots Calculation Service
 * Service for calculating available appointment slots for therapists
 */

import { Timestamp } from "firebase/firestore";
import { AvailableSlot, TherapistProfile } from "@/types/database";
import { businessConfig } from "@/lib/config";
import { AvailabilityService } from "./availability-service";
import { AppointmentService } from "./appointment-service";
import { TherapistService } from "./therapist-service";
import { TimeSlotService } from "./timeslot-service";
import {
  addDays,
  format,
  startOfDay,
  endOfDay,
  isSameDay,
} from "date-fns";
import {
  convertTimezone,
  getUserTimezone,
} from "@/lib/utils/timezone-utils";

export interface SlotCalculationOptions {
  startDate: Date;
  endDate: Date;
  clientTimezone?: string;
  duration?: number; // minutes
  includeUnavailable?: boolean;
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

export interface TherapistSlotsResult {
  therapistId: string;
  therapistProfile: TherapistProfile;
  availableSlots: EnhancedAvailableSlot[];
  totalSlots: number;
  bookedSlots: number;
  timezone: string;
}

export class AvailableSlotsService {
  /**
   * Calculate available slots for a therapist within a date range
   */
  static async calculateAvailableSlots(
    therapistId: string,
    options: SlotCalculationOptions
  ): Promise<TherapistSlotsResult> {
    try {
      // Get therapist profile
      const therapistProfile = await TherapistService.getProfile(therapistId);
      if (!therapistProfile) {
        throw new Error("Therapist profile not found");
      }

      const clientTimezone = options.clientTimezone || getUserTimezone();
      const therapistTimezone = therapistProfile.availability.timezone;

      // Get all appointments in the date range
      const existingAppointments =
        await AppointmentService.getAppointmentsInRange(
          therapistId,
          options.startDate,
          options.endDate
        );

      const availableSlots: EnhancedAvailableSlot[] = [];
      const currentDate = new Date(options.startDate);

      while (currentDate <= options.endDate) {
        const daySlots = await this.calculateSlotsForDate(
          therapistId,
          therapistProfile,
          currentDate,
          existingAppointments,
          clientTimezone,
          options.duration
        );

        availableSlots.push(...daySlots);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        therapistId,
        therapistProfile,
        availableSlots,
        totalSlots: availableSlots.length,
        bookedSlots: availableSlots.filter((slot) => slot.isBooked).length,
        timezone: therapistTimezone,
      };
    } catch (error) {
      console.error("Error calculating available slots:", error);
      throw new Error("Failed to calculate available slots");
    }
  }

  /**
   * Calculate available slots for a specific date
   */
  private static async calculateSlotsForDate(
    therapistId: string,
    therapistProfile: TherapistProfile,
    date: Date,
    existingAppointments: {
      scheduledFor: Timestamp;
      timeSlotId: string;
      status: string;
    }[],
    clientTimezone: string,
    requestedDuration?: number
  ): Promise<EnhancedAvailableSlot[]> {
    const slots: EnhancedAvailableSlot[] = [];

    try {
      // Check if date is too far in advance or too soon
      const now = new Date();
      const maxAdvanceDate = addDays(now, businessConfig.maxAdvanceBookingDays);
      const minAdvanceDate = new Date(
        now.getTime() + businessConfig.minAdvanceBookingHours * 60 * 60 * 1000
      );

      if (date > maxAdvanceDate || date < minAdvanceDate) {
        return slots; // Return empty array for dates outside booking window
      }

      // Get therapist availability for this date
      const availability = await AvailabilityService.getAvailabilityForDate(
        therapistId,
        date
      );

      // Get all time slots
      const allTimeSlots = await TimeSlotService.getTimeSlots();

      // Filter appointments for this specific date
      const dayAppointments = existingAppointments.filter((appointment) => {
        const appointmentDate = appointment.scheduledFor.toDate();
        return (
          isSameDay(appointmentDate, date) && appointment.status !== "cancelled"
        );
      });

      // Process each effective time slot
      for (const timeSlotId of availability.effectiveSlots) {
        const timeSlot = allTimeSlots.find((slot) => slot.id === timeSlotId);
        if (!timeSlot) continue;

        // Skip if duration doesn't match requested duration
        if (requestedDuration && timeSlot.duration !== requestedDuration) {
          continue;
        }

        // Check if this slot is booked
        const isBooked = dayAppointments.some(
          (appointment) => appointment.timeSlotId === timeSlotId
        );

        // Convert times to client timezone
        const therapistTimezone = therapistProfile.availability.timezone;
        const slotDateTime = new Date(date);
        const [hours, minutes] = timeSlot.startTime.split(":").map(Number);
        slotDateTime.setHours(hours, minutes, 0, 0);

        const clientSlotDateTime = convertTimezone(
          slotDateTime,
          therapistTimezone,
          clientTimezone
        );

        const endDateTime = new Date(
          slotDateTime.getTime() + timeSlot.duration * 60 * 1000
        );
        const clientEndDateTime = convertTimezone(
          endDateTime,
          therapistTimezone,
          clientTimezone
        );

        // Create enhanced available slot
        const enhancedSlot: EnhancedAvailableSlot = {
          timeSlotId,
          date: clientSlotDateTime,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          duration: timeSlot.duration,
          price: therapistProfile.practice.hourlyRate,
          currency: therapistProfile.practice.currency,
          isBooked,
          therapistTimezone,
          localStartTime: format(clientSlotDateTime, "HH:mm"),
          localEndTime: format(clientEndDateTime, "HH:mm"),
          localDate: format(clientSlotDateTime, "yyyy-MM-dd"),
          displayTime: `${format(clientSlotDateTime, "h:mm a")} - ${format(
            clientEndDateTime,
            "h:mm a"
          )}`,
          bufferTime: therapistProfile.availability.bufferMinutes,
          isOverride: availability.overrides.some((override) =>
            override.affectedSlots?.includes(timeSlotId)
          ),
        };

        slots.push(enhancedSlot);
      }
    } catch (error) {
      console.error(`Error calculating slots for date ${date}:`, error);
    }

    return slots.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  /**
   * Get next available slot for a therapist
   */
  static async getNextAvailableSlot(
    therapistId: string,
    fromDate: Date = new Date(),
    clientTimezone?: string
  ): Promise<EnhancedAvailableSlot | null> {
    try {
      const endDate = addDays(fromDate, businessConfig.maxAdvanceBookingDays);
      const options: SlotCalculationOptions = {
        startDate: fromDate,
        endDate,
        clientTimezone,
      };

      const result = await this.calculateAvailableSlots(therapistId, options);
      const availableSlots = result.availableSlots.filter(
        (slot) => !slot.isBooked
      );

      return availableSlots.length > 0 ? availableSlots[0] : null;
    } catch (error) {
      console.error("Error getting next available slot:", error);
      return null;
    }
  }

  /**
   * Check slot availability in real-time
   */
  static async checkSlotAvailability(
    therapistId: string,
    timeSlotId: string,
    date: Date
  ): Promise<{
    available: boolean;
    reason?: string;
    conflictingAppointment?: {
      scheduledFor: Timestamp;
      timeSlotId: string;
      status: string;
    };
  }> {
    try {
      // Get therapist availability for the date
      const availability = await AvailabilityService.getAvailabilityForDate(
        therapistId,
        date
      );

      // Check if slot is in effective slots
      if (!availability.effectiveSlots.includes(timeSlotId)) {
        return {
          available: false,
          reason: "Time slot is not available for this date",
        };
      }

      // Check for existing appointments
      const startOfDayDate = startOfDay(date);
      const endOfDayDate = endOfDay(date);
      const appointments = await AppointmentService.getAppointmentsInRange(
        therapistId,
        startOfDayDate,
        endOfDayDate
      );

      const conflicting = appointments.find(
        (appointment) =>
          appointment.timeSlotId === timeSlotId &&
          appointment.status !== "cancelled" &&
          isSameDay(appointment.scheduledFor.toDate(), date)
      );

      if (conflicting) {
        return {
          available: false,
          reason: "Time slot is already booked",
          conflictingAppointment: conflicting,
        };
      }

      return { available: true };
    } catch (error) {
      console.error("Error checking slot availability:", error);
      return {
        available: false,
        reason: "Unable to verify availability",
      };
    }
  }

  /**
   * Get available slots for multiple therapists
   */
  static async getAvailableSlotsForTherapists(
    therapistIds: string[],
    options: SlotCalculationOptions
  ): Promise<TherapistSlotsResult[]> {
    const results: TherapistSlotsResult[] = [];

    for (const therapistId of therapistIds) {
      try {
        const result = await this.calculateAvailableSlots(therapistId, options);
        results.push(result);
      } catch (error) {
        console.error(
          `Error getting slots for therapist ${therapistId}:`,
          error
        );
        // Continue with other therapists even if one fails
      }
    }

    return results;
  }

  /**
   * Find available slots matching specific criteria
   */
  static async findMatchingSlots(
    therapistIds: string[],
    criteria: {
      startDate: Date;
      endDate: Date;
      duration?: number;
      timePreferences?: string[]; // e.g., ["morning", "afternoon", "evening"]
      dayPreferences?: number[]; // 0-6 (Sunday-Saturday)
      clientTimezone?: string;
      maxResults?: number;
    }
  ): Promise<{
    slots: (EnhancedAvailableSlot & {
      therapistId: string;
      therapistProfile: TherapistProfile;
    })[];
    totalFound: number;
  }> {
    const allSlots: (EnhancedAvailableSlot & {
      therapistId: string;
      therapistProfile: TherapistProfile;
    })[] = [];

    const options: SlotCalculationOptions = {
      startDate: criteria.startDate,
      endDate: criteria.endDate,
      duration: criteria.duration,
      clientTimezone: criteria.clientTimezone,
    };

    // Get slots from all therapists
    const therapistResults = await this.getAvailableSlotsForTherapists(
      therapistIds,
      options
    );

    // Flatten and enhance slots
    for (const result of therapistResults) {
      for (const slot of result.availableSlots) {
        if (!slot.isBooked) {
          allSlots.push({
            ...slot,
            therapistId: result.therapistId,
            therapistProfile: result.therapistProfile,
          });
        }
      }
    }

    // Apply filters
    let filteredSlots = allSlots;

    // Filter by day preferences
    if (criteria.dayPreferences && criteria.dayPreferences.length > 0) {
      filteredSlots = filteredSlots.filter((slot) => {
        const dayOfWeek = slot.date.getDay();
        return criteria.dayPreferences!.includes(dayOfWeek);
      });
    }

    // Filter by time preferences
    if (criteria.timePreferences && criteria.timePreferences.length > 0) {
      filteredSlots = filteredSlots.filter((slot) => {
        const hour = slot.date.getHours();
        return criteria.timePreferences!.some((preference) => {
          switch (preference) {
            case "morning":
              return hour >= 6 && hour < 12;
            case "afternoon":
              return hour >= 12 && hour < 17;
            case "evening":
              return hour >= 17 && hour < 22;
            default:
              return true;
          }
        });
      });
    }

    // Sort by date/time
    filteredSlots.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Apply max results limit
    const maxResults = criteria.maxResults || filteredSlots.length;
    const finalSlots = filteredSlots.slice(0, maxResults);

    return {
      slots: finalSlots,
      totalFound: filteredSlots.length,
    };
  }
}

export default AvailableSlotsService;
