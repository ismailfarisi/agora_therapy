/**
 * Appointment Booking Service with Payment Integration
 * CRUD operations for appointments and booking requests with Stripe payment verification
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
  FieldValue,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { collections, documents, generateId } from "@/lib/firebase/collections";
import {
  Appointment,
  BookingRequest,
  AppointmentStatus,
  SessionType,
  TherapistProfile,
  PaymentIntent,
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

// New payment-related interfaces
interface CreateAppointmentWithPaymentData extends BookingRequest {
  paymentIntentId: string;
  amount: number;
  currency: string;
  requiresPayment?: boolean;
}

interface PaymentVerificationResult {
  isValid: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
}

export class AppointmentService {
  private static readonly PAYMENT_INTENTS_COLLECTION = "paymentIntents";
  private static readonly processedWebhooks = new Set<string>(); // Simple in-memory idempotency check

  /**
   * Get appointments for a specific client with optional payment filtering
   */
  static async getClientAppointments(
    clientId: string,
    status?: AppointmentStatus,
    includePaymentPending: boolean = true
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
      const appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];

      // Filter out payment pending appointments if requested
      if (!includePaymentPending) {
        return appointments.filter(
          (apt) =>
            !apt.payment ||
            apt.payment.status === "paid" ||
            apt.payment.status === "refunded"
        );
      }

      return appointments;
    } catch (error) {
      console.error("Error fetching client appointments:", error);
      throw new Error("Failed to fetch client appointments");
    }
  }

  /**
   * Get appointments for a specific therapist with optional payment filtering
   */
  static async getTherapistAppointments(
    therapistId: string,
    status?: AppointmentStatus,
    includePaymentPending: boolean = true
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
      const appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];

      // Filter out payment pending appointments if requested
      if (!includePaymentPending) {
        return appointments.filter(
          (apt) =>
            !apt.payment ||
            apt.payment.status === "paid" ||
            apt.payment.status === "refunded"
        );
      }

      return appointments;
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
   * Get appointment by payment intent ID
   */
  static async getAppointmentByPaymentIntent(
    paymentIntentId: string
  ): Promise<Appointment | null> {
    try {
      const appointmentQuery = query(
        collections.appointments(),
        where("payment.transactionId", "==", paymentIntentId)
      );

      const snapshot = await getDocs(appointmentQuery);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as Appointment;
    } catch (error) {
      console.error("Error getting appointment by payment intent:", error);
      return null;
    }
  }

  /**
   * Create appointment with payment verification (for direct booking)
   */
  static async createAppointmentWithPayment(
    data: CreateAppointmentWithPaymentData
  ): Promise<AppointmentBookingResult> {
    try {
      // Verify payment before creating appointment
      const paymentVerification = await this.verifyPayment(
        data.paymentIntentId
      );

      if (!paymentVerification.isValid) {
        return {
          success: false,
          error: `Payment verification failed: ${paymentVerification.error}`,
        };
      }

      // Check for booking conflicts
      const conflicts = await this.checkBookingConflicts(data);
      if (conflicts.length > 0) {
        return {
          success: false,
          conflicts,
        };
      }

      // Get therapist profile for additional validation
      const therapistProfile = await TherapistService.getProfile(
        data.therapistId
      );
      if (!therapistProfile) {
        return {
          success: false,
          error: "Therapist profile not found",
        };
      }

      // Get time slot details
      const timeSlot = await TimeSlotService.getTimeSlot(data.timeSlotId);
      if (!timeSlot) {
        return {
          success: false,
          error: "Time slot not found",
        };
      }

      // Create appointment within a transaction to ensure consistency
      const appointmentId = await runTransaction(db, async (transaction) => {
        // Double-check conflicts within transaction
        const reCheckConflicts = await this.checkBookingConflicts(data);
        if (reCheckConflicts.length > 0) {
          throw new Error("Booking conflicts detected during final check");
        }

        // Create appointment document
        const appointmentRef = doc(collections.appointments());
        const appointmentData: Omit<Appointment, "id"> = {
          therapistId: data.therapistId,
          clientId: data.clientId,
          scheduledFor: Timestamp.fromDate(data.date),
          timeSlotId: data.timeSlotId,
          duration: data.duration,
          status: "confirmed", // Confirmed because payment verified
          session: {
            type: data.sessionType,
            deliveryType: "video" as const,
            platform: "agora" as const,
            channelId: `therapy_session_${appointmentRef.id}`,
          },
          payment: {
            amount: data.amount,
            currency: data.currency,
            status: "pending", // Will be updated by webhook
            transactionId: data.paymentIntentId,
            method: "card",
          },
          communication: {
            clientNotes: data.clientNotes || "",
            remindersSent: {
              email: [],
              sms: [],
            },
          },
          metadata: {
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            confirmedAt: serverTimestamp() as Timestamp, // FieldValue for server-side, Timestamp on read
          },
        };

        transaction.set(appointmentRef, appointmentData);

        console.log("Appointment created with payment verification:", {
          appointmentId: appointmentRef.id,
          paymentIntentId: data.paymentIntentId,
          amount: data.amount,
          currency: data.currency,
        });

        return appointmentRef.id;
      });

      return {
        success: true,
        appointmentId,
      };
    } catch (error) {
      console.error("Error creating appointment with payment:", error);
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
   * Create appointment after payment confirmation (for webhook usage)
   */
  static async createAppointmentAfterPayment(
    appointmentData: BookingRequest,
    paymentIntentId: string,
    amount: number,
    currency: string,
    webhookId?: string
  ): Promise<string> {
    try {
      // Check idempotency for webhook processing
      if (webhookId && this.processedWebhooks.has(webhookId)) {
        console.log("Webhook already processed:", webhookId);
        // Try to find existing appointment with this payment intent
        const existingAppointment = await this.getAppointmentByPaymentIntent(
          paymentIntentId
        );
        if (existingAppointment) {
          return existingAppointment.id;
        }
      }

      return await runTransaction(db, async (transaction) => {
        // Get therapist profile for additional data
        const therapistProfile = await TherapistService.getProfile(
          appointmentData.therapistId
        );
        if (!therapistProfile) {
          throw new Error("Therapist profile not found");
        }

        // Create appointment with completed payment status
        const appointmentRef = doc(collections.appointments());
        const appointmentDocData: Omit<Appointment, "id"> = {
          therapistId: appointmentData.therapistId,
          clientId: appointmentData.clientId,
          scheduledFor: Timestamp.fromDate(appointmentData.date),
          timeSlotId: appointmentData.timeSlotId,
          duration: appointmentData.duration,
          status: "confirmed",
          session: {
            type: appointmentData.sessionType,
            deliveryType: "video" as const,
            platform: "agora" as const,
            channelId: `therapy_session_${appointmentRef.id}`,
          },
          payment: {
            amount: amount,
            currency: currency.toLowerCase(),
            status: "paid",
            transactionId: paymentIntentId,
            method: "card",
          },
          communication: {
            clientNotes: appointmentData.clientNotes || "",
            remindersSent: {
              email: [],
              sms: [],
            },
          },
          metadata: {
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            confirmedAt: serverTimestamp() as Timestamp, // FieldValue for server-side, Timestamp on read
          },
        };

        transaction.set(appointmentRef, appointmentDocData);

        // Mark webhook as processed
        if (webhookId) {
          this.processedWebhooks.add(webhookId);
        }

        console.log("Appointment created after payment confirmation:", {
          appointmentId: appointmentRef.id,
          paymentIntentId,
          amount,
          currency,
          webhookId,
        });

        return appointmentRef.id;
      });
    } catch (error) {
      console.error("Error creating appointment after payment:", error);
      throw error;
    }
  }

  /**
   * Update appointment payment status
   */
  static async updateAppointmentPaymentStatus(
    paymentIntentId: string,
    status: "pending" | "paid" | "failed" | "refunded",
    webhookId?: string
  ): Promise<void> {
    try {
      // Check idempotency for webhook processing
      if (webhookId && this.processedWebhooks.has(webhookId)) {
        console.log(
          "Payment status update webhook already processed:",
          webhookId
        );
        return;
      }

      const appointmentQuery = query(
        collections.appointments(),
        where("payment.transactionId", "==", paymentIntentId)
      );

      const snapshot = await getDocs(appointmentQuery);

      if (snapshot.empty) {
        console.warn(
          "No appointment found for payment intent:",
          paymentIntentId
        );
        return;
      }

      const appointmentDoc = snapshot.docs[0];

      const updateData: Record<
        string,
        string | Timestamp | FieldValue | undefined
      > = {
        "payment.status": status,
        "metadata.updatedAt": serverTimestamp(),
      };

      // Cancel appointment if payment failed
      if (status === "failed") {
        updateData.status = "cancelled";
      }

      await updateDoc(appointmentDoc.ref, updateData);

      // Mark webhook as processed
      if (webhookId) {
        this.processedWebhooks.add(webhookId);
      }

      console.log("Appointment payment status updated:", {
        appointmentId: appointmentDoc.id,
        paymentIntentId,
        newStatus: status,
        webhookId,
      });
    } catch (error) {
      console.error("Error updating appointment payment status:", error);
      throw error;
    }
  }

  /**
   * Handle payment failure
   */
  static async handlePaymentFailure(
    paymentIntentId: string,
    reason?: string
  ): Promise<void> {
    try {
      const appointmentQuery = query(
        collections.appointments(),
        where("payment.transactionId", "==", paymentIntentId)
      );

      const snapshot = await getDocs(appointmentQuery);

      if (snapshot.empty) {
        console.warn(
          "No appointment found for failed payment intent:",
          paymentIntentId
        );
        return;
      }

      const appointmentDoc = snapshot.docs[0];

      await updateDoc(appointmentDoc.ref, {
        status: "cancelled",
        "payment.status": "failed",
        "communication.internalNotes": reason
          ? `Payment failed: ${reason}`
          : "Payment failed",
        "metadata.updatedAt": serverTimestamp(),
        "metadata.cancelledAt": serverTimestamp(),
        "metadata.cancellationReason": reason || "Payment failed",
      });

      console.log("Appointment cancelled due to payment failure:", {
        appointmentId: appointmentDoc.id,
        paymentIntentId,
        reason,
      });
    } catch (error) {
      console.error("Error handling payment failure:", error);
      throw error;
    }
  }

  /**
   * Verify payment intent status
   */
  private static async verifyPayment(
    paymentIntentId: string
  ): Promise<PaymentVerificationResult> {
    try {
      console.log("🔍 [DEBUG] Verifying payment intent:", paymentIntentId);

      // Get payment intent from database
      const paymentIntentQuery = query(
        collection(db, this.PAYMENT_INTENTS_COLLECTION),
        where("stripePaymentIntentId", "==", paymentIntentId)
      );

      const snapshot = await getDocs(paymentIntentQuery);

      if (snapshot.empty) {
        console.log(
          "❌ [DEBUG] Payment intent not found in database:",
          paymentIntentId
        );
        return {
          isValid: false,
          error: "Payment intent not found",
        };
      }

      const paymentIntent = snapshot.docs[0].data() as PaymentIntent;
      console.log("💳 [DEBUG] Payment intent data:", {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        appointmentId: paymentIntent.appointmentId,
      });

      // Verify payment is successful
      if (paymentIntent.status !== "paid") {
        console.log(
          "⚠️ [DEBUG] Payment not completed. Status:",
          paymentIntent.status
        );
        return {
          isValid: false,
          error: `Payment not completed. Status: ${paymentIntent.status}`,
        };
      }

      console.log("✅ [DEBUG] Payment verification successful");
      return {
        isValid: true,
        paymentIntent,
      };
    } catch (error) {
      console.error("💥 [DEBUG] Error verifying payment:", error);
      return {
        isValid: false,
        error: `Payment verification error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Get pending payment appointments
   */
  static async getPendingPaymentAppointments(): Promise<Appointment[]> {
    try {
      const appointmentsQuery = query(
        collections.appointments(),
        where("payment.status", "==", "pending"),
        orderBy("metadata.createdAt", "desc")
      );

      const snapshot = await getDocs(appointmentsQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
    } catch (error) {
      console.error("Error fetching pending payment appointments:", error);
      throw new Error("Failed to fetch pending payment appointments");
    }
  }

  /**
   * Get failed payment appointments
   */
  static async getFailedPaymentAppointments(): Promise<Appointment[]> {
    try {
      const appointmentsQuery = query(
        collections.appointments(),
        where("payment.status", "==", "failed"),
        orderBy("metadata.updatedAt", "desc")
      );

      const snapshot = await getDocs(appointmentsQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
    } catch (error) {
      console.error("Error fetching failed payment appointments:", error);
      throw new Error("Failed to fetch failed payment appointments");
    }
  }

  /**
   * Validate payment data and booking consistency
   */
  static async validateBookingWithPayment(
    appointmentData: BookingRequest,
    paymentAmount: number,
    currency: string
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Validate payment data
      const paymentValidation = this.validatePaymentData(
        paymentAmount,
        currency,
        appointmentData.duration,
        appointmentData.therapistId
      );

      if (!paymentValidation.isValid) {
        return paymentValidation;
      }

      // Validate appointment slot availability
      if (appointmentData.date < new Date()) {
        return {
          isValid: false,
          error: "Cannot book appointments in the past",
        };
      }

      // Additional validations could include:
      // - Check if therapist exists and is active
      // - Verify time slot is available
      // - Check if client has conflicting appointments

      return { isValid: true };
    } catch (error) {
      console.error("Error validating booking with payment:", error);
      return {
        isValid: false,
        error: `Validation error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  private static validatePaymentData(
    amount: number,
    currency: string,
    duration: number,
    therapistId: string
  ): { isValid: boolean; error?: string } {
    // Basic validation
    if (amount <= 0) {
      return { isValid: false, error: "Payment amount must be greater than 0" };
    }

    if (!currency || currency.length !== 3) {
      return { isValid: false, error: "Invalid currency code" };
    }

    if (duration <= 0) {
      return {
        isValid: false,
        error: "Appointment duration must be greater than 0",
      };
    }

    if (!therapistId) {
      return { isValid: false, error: "Therapist ID is required" };
    }

    return { isValid: true };
  }

  /**
   * Original createAppointment method (maintained for backward compatibility)
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
            deliveryType: "video" as const,
            ...(true && {
              platform: "agora" as const,
              channelId: `therapy_session_${appointmentRef.id}`,
            }),
          },
          payment: {
            amount: therapistProfile.practice.hourlyRate,
            currency: therapistProfile.practice.currency,
            status: "paid", // Default for non-payment appointments
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
   * Check for booking conflicts with group session support
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

      // Get session type limits for group sessions
      const sessionTypeLimits = {
        individual: 1,
        consultation: 1,
        follow_up: 1,
        group: 8,
      };

      const maxConcurrentClients =
        sessionTypeLimits[bookingRequest.sessionType] || 1;

      // Check for overlapping appointments with group session support
      const overlappingAppointments = existingAppointments.filter(
        (appointment) => {
          if (appointment.status === "cancelled") return false;

          const appointmentDate = appointment.scheduledFor.toDate();
          const isSameDay =
            appointmentDate.toDateString() ===
            bookingRequest.date.toDateString();

          return (
            isSameDay && appointment.timeSlotId === bookingRequest.timeSlotId
          );
        }
      );

      if (overlappingAppointments.length > 0) {
        // For individual sessions, any overlap is a conflict
        if (bookingRequest.sessionType === "individual") {
          conflicts.push({
            type: "overlap",
            message:
              "Individual sessions cannot overlap with other appointments",
            conflictingAppointment: overlappingAppointments[0],
          });
        }
        // For group sessions, check if adding this appointment would exceed limits
        else if (bookingRequest.sessionType === "group") {
          // Check if existing appointments are also group sessions
          const groupAppointments = overlappingAppointments.filter(
            (apt) => apt.session.type === "group"
          );

          if (groupAppointments.length > 0) {
            // Count existing clients in group sessions (assuming 1 client per appointment for now)
            const existingClientCount = groupAppointments.length;

            if (existingClientCount >= maxConcurrentClients) {
              conflicts.push({
                type: "overlap",
                message: `Group session capacity exceeded. Maximum ${maxConcurrentClients} clients allowed.`,
                conflictingAppointment: groupAppointments[0],
              });
            }
          } else {
            // Mixed session types - not allowed
            conflicts.push({
              type: "overlap",
              message: "Cannot book different session types at the same time",
              conflictingAppointment: overlappingAppointments[0],
            });
          }
        } else {
          // Other session types with overlap
          conflicts.push({
            type: "overlap",
            message: "This time slot is already booked",
            conflictingAppointment: overlappingAppointments[0],
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
   * Update appointment status
   */
  static async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus,
    reason?: string
  ): Promise<void> {
    try {
      const docRef = documents.appointment(appointmentId);
      const updates: Record<
        string,
        string | Timestamp | FieldValue | undefined
      > = {
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
      // Check if appointment has payment that needs to be handled
      const appointment = await this.getAppointment(appointmentId);
      if (
        appointment?.payment?.transactionId &&
        appointment.payment.status === "paid"
      ) {
        console.warn(
          "Cancelling appointment with completed payment - consider refund:",
          {
            appointmentId: appointmentId,
            paymentIntentId: appointment.payment.transactionId,
          }
        );
      }

      const docRef = documents.appointment(appointmentId);
      await updateDoc(docRef, {
        status: "cancelled",
        "metadata.cancelledAt": serverTimestamp(),
        "metadata.cancellationReason": reason,
        "metadata.updatedAt": serverTimestamp(),
        "communication.internalNotes": `Cancelled by ${cancelledBy}: ${reason}`,
      });

      console.log("Appointment cancelled:", appointmentId);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      throw new Error("Failed to cancel appointment");
    }
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
        const status = appointment.status;
        if (
          status === "pending" ||
          status === "confirmed" ||
          status === "completed" ||
          status === "cancelled"
        ) {
          stats[status]++;
        }
      });

      return stats;
    } catch (error) {
      console.error("Error fetching appointment stats:", error);
      throw new Error("Failed to fetch appointment stats");
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
   * Subscribe to therapist appointments (real-time)
   */
  static subscribeToTherapistAppointments(
    therapistId: string,
    callback: (appointments: Appointment[]) => void
  ): () => void {
    const q = query(
      collections.appointments(),
      where("therapistId", "==", therapistId),
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
        console.error("Error in therapist appointments subscription:", error);
        callback([]);
      }
    );
  }
}

export default AppointmentService;
