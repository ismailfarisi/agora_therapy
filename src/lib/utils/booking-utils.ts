/**
 * Booking Utility Functions
 * Helper functions for appointment booking operations
 */

import {
  format,
  addMinutes,
  isBefore,
  isAfter,
  isSameDay,
  parseISO,
} from "date-fns";
import {
  BookingRequest,
  Appointment,
  SessionType,
  AppointmentStatus,
  TimeSlot,
  TherapistProfile,
} from "@/types/database";
import { businessConfig } from "@/lib/config";
import {
  convertTimezone,
  getUserTimezone,
  formatInTimezone,
} from "./timezone-utils";

export interface BookingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BookingPricing {
  basePrice: number;
  discounts: { type: string; amount: number; description: string }[];
  fees: { type: string; amount: number; description: string }[];
  totalPrice: number;
  currency: string;
}

export interface BookingTimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  displayTime: string;
  duration: number;
  isAvailable: boolean;
  price: number;
  currency: string;
}

/**
 * Validate a booking request
 */
export function validateBookingRequest(
  bookingRequest: BookingRequest,
  therapistProfile?: TherapistProfile
): BookingValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!bookingRequest.therapistId) {
    errors.push("Therapist ID is required");
  }

  if (!bookingRequest.clientId) {
    errors.push("Client ID is required");
  }

  if (!bookingRequest.timeSlotId) {
    errors.push("Time slot ID is required");
  }

  if (!bookingRequest.date) {
    errors.push("Date is required");
  }

  if (!bookingRequest.sessionType) {
    errors.push("Session type is required");
  }

  // Validate date constraints
  if (bookingRequest.date) {
    const now = new Date();
    const maxAdvanceDate = new Date(
      now.getTime() + businessConfig.maxAdvanceBookingDays * 24 * 60 * 60 * 1000
    );
    const minAdvanceDate = new Date(
      now.getTime() + businessConfig.minAdvanceBookingHours * 60 * 60 * 1000
    );

    if (isBefore(bookingRequest.date, now)) {
      errors.push("Cannot book appointments in the past");
    }

    if (isBefore(bookingRequest.date, minAdvanceDate)) {
      errors.push(
        `Appointments must be booked at least ${businessConfig.minAdvanceBookingHours} hours in advance`
      );
    }

    if (isAfter(bookingRequest.date, maxAdvanceDate)) {
      errors.push(
        `Appointments can only be booked up to ${businessConfig.maxAdvanceBookingDays} days in advance`
      );
    }
  }

  // Validate duration
  if (bookingRequest.duration <= 0) {
    errors.push("Duration must be greater than 0");
  }

  if (bookingRequest.duration > businessConfig.maxDailyHours * 60) {
    errors.push(`Duration cannot exceed ${businessConfig.maxDailyHours} hours`);
  }

  // Validate session type
  const validSessionTypes: SessionType[] = ["video", "phone", "in_person"];
  if (
    bookingRequest.sessionType &&
    !validSessionTypes.includes(bookingRequest.sessionType)
  ) {
    errors.push("Invalid session type");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate booking pricing
 */
export function calculateBookingPricing(
  bookingRequest: BookingRequest,
  therapistProfile: TherapistProfile,
  options: {
    applyDiscounts?: boolean;
    includeFeatureFlags?: string[];
  } = {}
): BookingPricing {
  const basePrice =
    therapistProfile.practice.hourlyRate * (bookingRequest.duration / 60);
  const discounts: { type: string; amount: number; description: string }[] = [];
  const fees: { type: string; amount: number; description: string }[] = [];

  // Apply discounts if enabled
  if (options.applyDiscounts) {
    // First-time client discount (example)
    // This would typically check against user history
    // discounts.push({
    //   type: "first_time",
    //   amount: basePrice * 0.1,
    //   description: "10% first-time client discount"
    // });
  }

  const totalDiscounts = discounts.reduce(
    (sum, discount) => sum + discount.amount,
    0
  );
  const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalPrice = basePrice - totalDiscounts + totalFees;

  return {
    basePrice,
    discounts,
    fees,
    totalPrice,
    currency: therapistProfile.practice.currency,
  };
}

/**
 * Format appointment time for display
 */
export function formatAppointmentTime(
  appointment: Appointment,
  timezone?: string,
  format24Hour: boolean = false
): {
  date: string;
  time: string;
  datetime: string;
  timezone: string;
} {
  const appointmentDate = appointment.scheduledFor.toDate();
  const displayTimezone = timezone || getUserTimezone();

  const formatOptions = {
    hour12: !format24Hour,
    timeZone: displayTimezone,
  };

  return {
    date: appointmentDate.toLocaleDateString("en-US", {
      timeZone: displayTimezone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: appointmentDate.toLocaleTimeString("en-US", {
      timeZone: displayTimezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: !format24Hour,
    }),
    datetime: appointmentDate.toLocaleString("en-US", {
      timeZone: displayTimezone,
      ...formatOptions,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    timezone: displayTimezone,
  };
}

/**
 * Get appointment status badge properties
 */
export function getAppointmentStatusBadge(status: AppointmentStatus): {
  label: string;
  variant: "default" | "destructive" | "outline" | "secondary";
  color: string;
} {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        variant: "outline",
        color: "#f59e0b", // amber
      };
    case "confirmed":
      return {
        label: "Confirmed",
        variant: "default",
        color: "#10b981", // green
      };
    case "in_progress":
      return {
        label: "In Progress",
        variant: "secondary",
        color: "#3b82f6", // blue
      };
    case "completed":
      return {
        label: "Completed",
        variant: "secondary",
        color: "#6b7280", // gray
      };
    case "cancelled":
      return {
        label: "Cancelled",
        variant: "destructive",
        color: "#ef4444", // red
      };
    case "no_show":
      return {
        label: "No Show",
        variant: "destructive",
        color: "#dc2626", // red
      };
    default:
      return {
        label: "Unknown",
        variant: "outline",
        color: "#6b7280", // gray
      };
  }
}

/**
 * Check if appointment can be cancelled
 */
export function canCancelAppointment(
  appointment: Appointment,
  userRole: "client" | "therapist" | "admin" = "client"
): {
  canCancel: boolean;
  reason?: string;
  hoursUntilAppointment?: number;
} {
  const now = new Date();
  const appointmentTime = appointment.scheduledFor.toDate();
  const hoursUntilAppointment =
    (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Check if appointment is in the past
  if (isBefore(appointmentTime, now)) {
    return {
      canCancel: false,
      reason: "Cannot cancel past appointments",
      hoursUntilAppointment,
    };
  }

  // Check appointment status
  if (appointment.status === "cancelled") {
    return {
      canCancel: false,
      reason: "Appointment is already cancelled",
      hoursUntilAppointment,
    };
  }

  if (appointment.status === "completed") {
    return {
      canCancel: false,
      reason: "Cannot cancel completed appointments",
      hoursUntilAppointment,
    };
  }

  if (appointment.status === "in_progress") {
    return {
      canCancel: userRole === "admin",
      reason:
        userRole !== "admin"
          ? "Cannot cancel appointments that are in progress"
          : undefined,
      hoursUntilAppointment,
    };
  }

  // Check minimum cancellation notice (24 hours for clients, none for therapists/admins)
  if (userRole === "client" && hoursUntilAppointment < 24) {
    return {
      canCancel: false,
      reason: "Appointments must be cancelled at least 24 hours in advance",
      hoursUntilAppointment,
    };
  }

  return {
    canCancel: true,
    hoursUntilAppointment,
  };
}

/**
 * Check if appointment can be rescheduled
 */
export function canRescheduleAppointment(
  appointment: Appointment,
  userRole: "client" | "therapist" | "admin" = "client"
): {
  canReschedule: boolean;
  reason?: string;
} {
  const cancelResult = canCancelAppointment(appointment, userRole);

  if (!cancelResult.canCancel) {
    return {
      canReschedule: false,
      reason: cancelResult.reason,
    };
  }

  // Additional reschedule-specific checks
  if (appointment.metadata?.rescheduledFrom) {
    return {
      canReschedule: userRole === "admin",
      reason:
        userRole !== "admin"
          ? "This appointment has already been rescheduled once"
          : undefined,
    };
  }

  return {
    canReschedule: true,
  };
}

/**
 * Generate booking confirmation details
 */
export function generateBookingConfirmation(
  appointment: Appointment,
  therapistProfile: TherapistProfile,
  timeSlot?: TimeSlot
): {
  confirmationNumber: string;
  appointmentDetails: {
    date: string;
    time: string;
    duration: string;
    sessionType: string;
    therapist: string;
    location?: string;
  };
  pricing: {
    amount: number;
    currency: string;
    formattedAmount: string;
  };
  nextSteps: string[];
} {
  const confirmationNumber = `APT-${appointment.id.slice(-8).toUpperCase()}`;
  const appointmentTime = formatAppointmentTime(appointment);

  const nextSteps: string[] = [
    "You will receive a confirmation email shortly",
    "The therapist will confirm your appointment within 24 hours",
  ];

  if (appointment.session.type === "video") {
    nextSteps.push(
      "A video session link will be provided before your appointment"
    );
  } else if (appointment.session.type === "phone") {
    nextSteps.push("The therapist will call you at the scheduled time");
  } else if (appointment.session.type === "in_person") {
    nextSteps.push("Please arrive 10 minutes early for your in-person session");
  }

  nextSteps.push(
    "You can reschedule or cancel up to 24 hours before your appointment"
  );

  return {
    confirmationNumber,
    appointmentDetails: {
      date: appointmentTime.date,
      time: appointmentTime.time,
      duration: `${appointment.duration} minutes`,
      sessionType: appointment.session.type,
      therapist: therapistProfile.id, // Would use actual name from user profile
      location:
        appointment.session.type === "in_person"
          ? "Therapist's office"
          : undefined,
    },
    pricing: {
      amount: appointment.payment.amount,
      currency: appointment.payment.currency,
      formattedAmount: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: appointment.payment.currency,
      }).format(appointment.payment.amount),
    },
    nextSteps,
  };
}

/**
 * Parse time slot into display format
 */
export function parseTimeSlotForDisplay(
  timeSlot: TimeSlot,
  date: Date,
  timezone?: string
): BookingTimeSlot {
  const [startHours, startMinutes] = timeSlot.startTime.split(":").map(Number);
  const [endHours, endMinutes] = timeSlot.endTime.split(":").map(Number);

  const startDateTime = new Date(date);
  startDateTime.setHours(startHours, startMinutes, 0, 0);

  const endDateTime = new Date(date);
  endDateTime.setHours(endHours, endMinutes, 0, 0);

  const displayTime = `${format(startDateTime, "h:mm a")} - ${format(
    endDateTime,
    "h:mm a"
  )}`;

  return {
    id: timeSlot.id,
    date: startDateTime,
    startTime: timeSlot.startTime,
    endTime: timeSlot.endTime,
    displayTime,
    duration: timeSlot.duration,
    isAvailable: true, // This would be determined by availability service
    price: 0, // This would be set by the calling code
    currency: "USD", // This would be set by the calling code
  };
}

/**
 * Group time slots by date
 */
export function groupTimeSlotsByDate(
  slots: BookingTimeSlot[]
): Record<string, BookingTimeSlot[]> {
  const grouped: Record<string, BookingTimeSlot[]> = {};

  slots.forEach((slot) => {
    const dateKey = format(slot.date, "yyyy-MM-dd");
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(slot);
  });

  // Sort slots within each date group
  Object.keys(grouped).forEach((dateKey) => {
    grouped[dateKey] = grouped[dateKey].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  });

  return grouped;
}

export default {
  validateBookingRequest,
  calculateBookingPricing,
  formatAppointmentTime,
  getAppointmentStatusBadge,
  canCancelAppointment,
  canRescheduleAppointment,
  generateBookingConfirmation,
  parseTimeSlotForDisplay,
  groupTimeSlotsByDate,
};
