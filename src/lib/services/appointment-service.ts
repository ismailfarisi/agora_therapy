/**
 * Appointment Booking Service
 * CRUD operations for appointments and booking requests
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
  and,
  or,
  writeBatch,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { collections, documents, generateId } from "@/lib/firebase/collections";
import {
  Appointment,
  BookingRequest,
  AppointmentStatus,
  SessionType,
  TherapistProfile,
} from "@/types/database";
import { businessConfig } from "@/lib/config";
import { AvailabilityService } from "./availability-service";
import { TherapistService } from "./therapist-service";
import { TimeSlotService } from "./timeslot-service";

export interface BookingConflict {
  type:
    | "overlap"
    | "unavailable"
    | "outside_hours"
    | "too_advance"
    | "too_soon";
  message: string;
  conflictingAppointment?: Appointment;
}

export interface AppointmentBookingResult {
  success: boolean;
  appointmentId?: string;
  conflicts?: BookingConflict[];
  error?: string;
}

export class AppointmentService {
  /**
   * Get appointments for a specific client
   */
  static async getClientAppointments(
    clientId: string,
    status?: AppointmentStatus
  ): Promise<Appointment[]> {
    try {
      let q = query(
        collections.appointments(),
        where("clientId", "==", clientId),
        orderBy("scheduledFor", "asc")
      );

      if (status) {
        q = query(q, where("status", "==", status));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
    } catch (error) {
      console.error("Error fetching client appointments:", error);
      throw new Error("Failed to fetch client appointments");
    }
  }

  /**
   * Get appointments for a specific therapist
   */
  static async getTherapistAppointments(
    therapistId: string,
    status?: AppointmentStatus
  ): Promise<Appointment[]> {
    try {
      let q = query(
        collections.appointments(),
        where("therapistId", "==", therapistId),
        orderBy("scheduledFor", "asc")
      );

      if (status) {
        q = query(q, where("status", "==", status));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
    } catch (error) {
      console.error("Error fetching therapist appointments:", error);
      throw new Error("Failed to fetch therapist appointments");
    }
  }

  /**
   * Get appointments for a specific date range
   */
  static async getAppointmentsInRange(
    therapistId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]> {
    try {
      const q = query(
        collections.appointments(),
        where("therapistId", "==", therapistId),
        where("scheduledFor", ">=", Timestamp.fromDate(startDate)),
        where("scheduledFor", "<=", Timestamp.fromDate(endDate)),
        orderBy("scheduledFor", "asc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
    } catch (error) {
      console.error("Error fetching appointments in range:", error);
      throw new Error("Failed to fetch appointments in range");
    }
  }

  /**
   * Get a specific appointment by ID
   */
  static async getAppointment(id: string): Promise<Appointment | null> {
    try {
      const docRef = documents.appointment(id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as Appointment;
    } catch (error) {
      console.error("Error fetching appointment:", error);
      throw new Error("Failed to fetch appointment");
    }
  }

  /**
   * Check for booking conflicts
   */
  static async checkBookingConflicts(
    bookingRequest: BookingRequest
  ): Promise<BookingConflict[]> {
    const conflicts: BookingConflict[] = [];

    try {
      // Check if booking is too far in advance
      const maxAdvanceDays = businessConfig.maxAdvanceBookingDays;
      const maxAdvanceDate = new Date();
      maxAdvanceDate.setDate(maxAdvanceDate.getDate() + maxAdvanceDays);

      if (bookingRequest.date > maxAdvanceDate) {
        conflicts.push({
          type: "too_advance",
          message: `Bookings can only be made ${maxAdvanceDays} days in advance`,
        });
      }

      // Check if booking is too soon
      const minAdvanceHours = businessConfig.minAdvanceBookingHours;
      const minAdvanceDate = new Date();
      minAdvanceDate.setHours(minAdvanceDate.getHours() + minAdvanceHours);

      if (bookingRequest.date < minAdvanceDate) {
        conflicts.push({
          type: "too_soon",
          message: `Bookings must be made at least ${minAdvanceHours} hours in advance`,
        });
      }

      // Get therapist availability for the requested date
      const availability = await AvailabilityService.getAvailabilityForDate(
        bookingRequest.therapistId,
        bookingRequest.date
      );

      // Check if the requested time slot is available
      if (!availability.effectiveSlots.includes(bookingRequest.timeSlotId)) {
        conflicts.push({
          type: "unavailable",
          message: "The requested time slot is not available",
        });
      }

      // Check for overlapping appointments
      const startOfDay = new Date(bookingRequest.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(bookingRequest.date);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAppointments = await this.getAppointmentsInRange(
        bookingRequest.therapistId,
        startOfDay,
        endOfDay
      );

      // Get the time slot details
      const timeSlot = await TimeSlotService.getTimeSlot(
        bookingRequest.timeSlotId
      );
      if (!timeSlot) {
        conflicts.push({
          type: "unavailable",
          message: "Invalid time slot selected",
        });
        return conflicts;
      }

      // Check for overlapping appointments
      for (const appointment of existingAppointments) {
        if (appointment.status === "cancelled") continue;

        const appointmentDate = appointment.scheduledFor.toDate();
        const isSameDay =
          appointmentDate.toDateString() === bookingRequest.date.toDateString();

        if (isSameDay && appointment.timeSlotId === bookingRequest.timeSlotId) {
          conflicts.push({
            type: "overlap",
            message: "This time slot is already booked",
            conflictingAppointment: appointment,
          });
        }
      }
    } catch (error) {
      console.error("Error checking booking conflicts:", error);
      conflicts.push({
        type: "unavailable",
        message: "Unable to verify availability at this time",
      });
    }

    return conflicts;
  }

  /**
   * Create a new appointment booking
   */
  static async createAppointment(
    bookingRequest: BookingRequest
  ): Promise<AppointmentBookingResult> {
    try {
      // Check for conflicts first
      const conflicts = await this.checkBookingConflicts(bookingRequest);
      if (conflicts.length > 0) {
        return {
          success: false,
          conflicts,
        };
      }

      // Get therapist profile for pricing
      const therapistProfile = await TherapistService.getProfile(
        bookingRequest.therapistId
      );
      if (!therapistProfile) {
        return {
          success: false,
          error: "Therapist profile not found",
        };
      }

      // Get time slot details
      const timeSlot = await TimeSlotService.getTimeSlot(
        bookingRequest.timeSlotId
      );
      if (!timeSlot) {
        return {
          success: false,
          error: "Time slot not found",
        };
      }

      // Create appointment within a transaction to ensure consistency
      const appointmentId = await runTransaction(db, async (transaction) => {
        // Double-check conflicts within transaction
        const reCheckConflicts = await this.checkBookingConflicts(
          bookingRequest
        );
        if (reCheckConflicts.length > 0) {
          throw new Error("Booking conflicts detected during final check");
        }

        // Create appointment document
        const appointmentRef = doc(collections.appointments());
        const appointmentData: Omit<Appointment, "id"> = {
          therapistId: bookingRequest.therapistId,
          clientId: bookingRequest.clientId,
          scheduledFor: Timestamp.fromDate(bookingRequest.date),
          timeSlotId: bookingRequest.timeSlotId,
          duration: bookingRequest.duration,
          status: "pending",
          session: {
            type: bookingRequest.sessionType,
          },
          payment: {
            amount: therapistProfile.practice.hourlyRate,
            currency: therapistProfile.practice.currency,
            status: "pending",
          },
          communication: {
            clientNotes: bookingRequest.clientNotes || "",
            remindersSent: {
              email: [],
              sms: [],
            },
          },
          metadata: {
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
        };

        transaction.set(appointmentRef, appointmentData);
        return appointmentRef.id;
      });

      return {
        success: true,
        appointmentId,
      };
    } catch (error) {
      console.error("Error creating appointment:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create appointment",
      };
    }
  }

  /**
   * Update appointment status
   */
  static async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus,
    reason?: string
  ): Promise<void> {
    try {
      const docRef = documents.appointment(appointmentId);
      const updates: Record<string, any> = {
        status,
        "metadata.updatedAt": serverTimestamp(),
      };

      // Add status-specific metadata
      switch (status) {
        case "confirmed":
          updates["metadata.confirmedAt"] = serverTimestamp();
          break;
        case "completed":
          updates["metadata.completedAt"] = serverTimestamp();
          break;
        case "cancelled":
          updates["metadata.cancelledAt"] = serverTimestamp();
          if (reason) {
            updates["metadata.cancellationReason"] = reason;
          }
          break;
      }

      await updateDoc(docRef, updates);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      throw new Error("Failed to update appointment status");
    }
  }

  /**
   * Cancel an appointment
   */
  static async cancelAppointment(
    appointmentId: string,
    reason: string,
    cancelledBy: "client" | "therapist" | "admin"
  ): Promise<void> {
    try {
      const docRef = documents.appointment(appointmentId);
      await updateDoc(docRef, {
        status: "cancelled",
        "metadata.cancelledAt": serverTimestamp(),
        "metadata.cancellationReason": reason,
        "metadata.updatedAt": serverTimestamp(),
        "communication.internalNotes": `Cancelled by ${cancelledBy}: ${reason}`,
      });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      throw new Error("Failed to cancel appointment");
    }
  }

  /**
   * Reschedule an appointment
   */
  static async rescheduleAppointment(
    appointmentId: string,
    newBookingRequest: Omit<BookingRequest, "clientId">
  ): Promise<AppointmentBookingResult> {
    try {
      // Get original appointment
      const originalAppointment = await this.getAppointment(appointmentId);
      if (!originalAppointment) {
        return {
          success: false,
          error: "Original appointment not found",
        };
      }

      // Create new booking request with client ID from original appointment
      const fullBookingRequest: BookingRequest = {
        ...newBookingRequest,
        clientId: originalAppointment.clientId,
      };

      // Check conflicts for new time
      const conflicts = await this.checkBookingConflicts(fullBookingRequest);
      if (conflicts.length > 0) {
        return {
          success: false,
          conflicts,
        };
      }

      // Update appointment within transaction
      await runTransaction(db, async (transaction) => {
        const appointmentRef = documents.appointment(appointmentId);

        // Update appointment with new details
        transaction.update(appointmentRef, {
          scheduledFor: Timestamp.fromDate(fullBookingRequest.date),
          timeSlotId: fullBookingRequest.timeSlotId,
          duration: fullBookingRequest.duration,
          "session.type": fullBookingRequest.sessionType,
          "communication.clientNotes": fullBookingRequest.clientNotes || "",
          "metadata.updatedAt": serverTimestamp(),
          "metadata.rescheduledFrom": appointmentId,
          status: "pending", // Reset to pending after reschedule
        });
      });

      return {
        success: true,
        appointmentId,
      };
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to reschedule appointment",
      };
    }
  }

  /**
   * Subscribe to client appointments (real-time)
   */
  static subscribeToClientAppointments(
    clientId: string,
    callback: (appointments: Appointment[]) => void
  ): () => void {
    const q = query(
      collections.appointments(),
      where("clientId", "==", clientId),
      orderBy("scheduledFor", "asc")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const appointments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Appointment[];
        callback(appointments);
      },
      (error) => {
        console.error("Error in client appointments subscription:", error);
        callback([]);
      }
    );
  }

  /**
   * Get upcoming appointments
   */
  static async getUpcomingAppointments(
    userId: string,
    userType: "client" | "therapist"
  ): Promise<Appointment[]> {
    try {
      const now = new Date();
      const field = userType === "client" ? "clientId" : "therapistId";

      const q = query(
        collections.appointments(),
        where(field, "==", userId),
        where("scheduledFor", ">=", Timestamp.fromDate(now)),
        where("status", "in", ["pending", "confirmed"]),
        orderBy("scheduledFor", "asc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
      throw new Error("Failed to fetch upcoming appointments");
    }
  }

  /**
   * Get appointment statistics
   */
  static async getAppointmentStats(
    userId: string,
    userType: "client" | "therapist"
  ): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  }> {
    try {
      const field = userType === "client" ? "clientId" : "therapistId";
      const q = query(collections.appointments(), where(field, "==", userId));

      const snapshot = await getDocs(q);
      const appointments = snapshot.docs.map((doc) =>
        doc.data()
      ) as Appointment[];

      const stats = {
        total: appointments.length,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
      };

      appointments.forEach((appointment) => {
        if (appointment.status in stats) {
          (stats as any)[appointment.status]++;
        }
      });

      return stats;
    } catch (error) {
      console.error("Error fetching appointment stats:", error);
      throw new Error("Failed to fetch appointment stats");
    }
  }
}

export default AppointmentService;
