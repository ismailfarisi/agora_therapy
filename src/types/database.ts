/**
 * Database Type Definitions
 * TypeScript interfaces for all database entities
 */

import { Timestamp, FieldValue } from "firebase/firestore";

// Common types
export type UserRole = "client" | "therapist" | "admin";
export type UserStatus = "active" | "inactive" | "suspended";
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";
export type SessionType = "individual" | "group" | "consultation" | "follow_up";
export type SessionDeliveryType = "video" | "phone" | "in_person";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";
export type OverrideType = "day_off" | "custom_hours" | "time_off";
export type SessionPlatform = "agora" | "zoom" | "teams";

// User Collection
export interface User {
  id: string; // Firebase Auth UID
  email: string;
  profile: {
    displayName: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    avatarUrl?: string;
    timezone: string;
    locale: string;
  };
  role: UserRole;
  status: UserStatus;
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      shareProfile: boolean;
      allowDirectMessages: boolean;
    };
  };
  metadata: {
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
    lastLoginAt: Timestamp | FieldValue;
    onboardingCompleted: boolean;
  };
}

// Therapist Profile Collection
export interface TherapistProfile {
  id: string; // same as user.id
  credentials: {
    licenseNumber: string;
    licenseState: string;
    licenseExpiry: Timestamp;
    specializations: string[];
    certifications: string[];
  };
  practice: {
    bio: string;
    yearsExperience: number;
    sessionTypes: ("individual" | "couples" | "family" | "group")[];
    languages: string[];
    hourlyRate: number;
    currency: string;
  };
  availability: {
    timezone: string;
    bufferMinutes: number; // time between sessions
    maxDailyHours: number;
    advanceBookingDays: number; // how far ahead clients can book
  };
  verification: {
    isVerified: boolean;
    verifiedAt?: Timestamp;
    verifiedBy?: string;
  };
}

// Time Slots Collection
export interface TimeSlot {
  id: string;
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  duration: number; // minutes
  displayName: string; // "9:00 AM - 10:00 AM"
  isStandard: boolean;
  sortOrder: number;
}

// Therapist Availability Collection
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

// Schedule Overrides Collection
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

// Appointments Collection
export interface Appointment {
  id: string;
  therapistId: string;
  clientId: string;
  scheduledFor: Timestamp;
  timeSlotId: string;
  duration: number; // minutes

  status: AppointmentStatus;

  session: {
    type: SessionType;
    deliveryType: SessionDeliveryType;
    platform?: SessionPlatform;
    channelId?: string;
    accessToken?: string;
    joinUrl?: string;
  };

  payment: {
    amount: number;
    currency: string;
    status: PaymentStatus;
    transactionId?: string;
    method?: string;
    // Enhanced Stripe payment tracking
    stripeCheckoutSessionId?: string;
    stripePaymentIntentId?: string;
    stripeCustomerId?: string;
    paymentRetryCount?: number;
    lastPaymentAttempt?: Timestamp;
    paymentFailureReasons?: string[];
    refundStatus?: "none" | "pending" | "partial" | "full";
    refundedAmount?: number;
    paymentMethodDetails?: {
      type: "card" | "bank_transfer" | "wallet";
      card?: {
        brand: string;
        last4: string;
        exp_month: number;
        exp_year: number;
        funding: "credit" | "debit" | "prepaid" | "unknown";
      };
      wallet?: {
        type: "apple_pay" | "google_pay" | "link" | "paypal";
      };
    };
  };

  communication: {
    clientNotes?: string;
    therapistNotes?: string;
    internalNotes?: string; // admin only
    remindersSent: {
      email: Timestamp[];
      sms: Timestamp[];
    };
  };

  metadata: {
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
    confirmedAt?: Timestamp;
    completedAt?: Timestamp;
    cancelledAt?: Timestamp;
    cancellationReason?: string;
    rescheduledFrom?: string; // previous appointment ID
  };
}

// Audit Logs Collection
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Timestamp;
}

// Notifications Collection
export interface Notification {
  id: string;
  userId: string;
  type:
    | "appointment_reminder"
    | "appointment_confirmed"
    | "appointment_cancelled"
    | "payment_received"
    | "system_message";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  status: "pending" | "sent" | "failed" | "read";
  scheduledFor?: Timestamp;
  sentAt?: Timestamp;
  readAt?: Timestamp;
  createdAt: Timestamp;
}

// Payment Intents Collection
export interface PaymentIntent {
  id: string;
  appointmentId: string;
  clientId: string;
  therapistId: string;
  amount: number;
  currency: string;
  stripePaymentIntentId: string;
  /** Stripe checkout session ID for tracking the complete payment flow */
  stripeCheckoutSessionId?: string;
  status: PaymentStatus;
  /** Payment method details from Stripe */
  paymentMethodDetails?: {
    type: "card" | "bank_transfer" | "wallet";
    card?: {
      brand: string;
      last4: string;
      exp_month: number;
      exp_year: number;
      funding: "credit" | "debit" | "prepaid" | "unknown";
    };
    wallet?: {
      type: "apple_pay" | "google_pay" | "link" | "paypal";
    };
  };
  /** Webhook events received for this payment intent */
  webhookEvents?: PaymentWebhookEvent[];
  /** Refund information if applicable */
  refunds?: PaymentRefund[];
  /** Metadata from Stripe payment intent */
  stripeMetadata?: Record<string, string>;
  metadata: {
    createdAt: Timestamp;
    updatedAt: Timestamp;
    paidAt?: Timestamp;
    refundedAt?: Timestamp;
  };
}

// Available Time Slot (computed interface)
export interface AvailableSlot {
  timeSlotId: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  currency: string;
}

// Enhanced Available Slot (computed interface for client booking)
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

// Booking Request (API interface)
export interface BookingRequest {
  therapistId: string;
  clientId: string;
  timeSlotId: string;
  date: Date;
  duration: number;
  sessionType: SessionType;
  clientNotes?: string;
}

// Search Filters (API interface)
export interface TherapistSearchFilters {
  specializations?: string[];
  languages?: string[];
  sessionTypes?: ("individual" | "couples" | "family" | "group")[];
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: {
    date?: Date;
    timeSlots?: string[];
  };
}

// Session Credentials (Agora interface)
export interface SessionCredentials {
  channelId: string;
  token: string;
  uid: number;
  appId: string;
  expiresAt: Date;
}

// Form Data Types
export interface UserRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
}

export interface TherapistOnboardingData {
  credentials: {
    licenseNumber: string;
    licenseState: string;
    licenseExpiry: Date;
    specializations: string[];
    certifications: string[];
  };
  practice: {
    bio: string;
    yearsExperience: number;
    sessionTypes: ("individual" | "couples" | "family" | "group")[];
    languages: string[];
    hourlyRate: number;
    currency: string;
  };
  availability: {
    timezone: string;
    bufferMinutes: number;
    maxDailyHours: number;
    advanceBookingDays: number;
  };
}

/**
 * Payment webhook event logging for audit trail
 */
export interface PaymentWebhookEvent {
  id: string;
  /** Stripe webhook event ID */
  stripeEventId: string;
  /** Type of webhook event received */
  eventType: string;
  /** Stripe object that triggered the event */
  objectId: string;
  /** Raw webhook payload for debugging */
  payload: Record<string, unknown>;
  /** Processing status of the webhook */
  processed: boolean;
  /** Error message if processing failed */
  error?: string;
  /** Related appointment ID if applicable */
  appointmentId?: string;
  /** Related payment intent ID if applicable */
  paymentIntentId?: string;
  /** Timestamp when webhook was received */
  receivedAt: Timestamp;
  /** Timestamp when webhook was processed */
  processedAt?: Timestamp;
}

/**
 * Payment refund information
 */
export interface PaymentRefund {
  id: string;
  /** Stripe refund ID */
  stripeRefundId: string;
  /** Amount refunded in cents */
  amount: number;
  /** Currency of the refund */
  currency: string;
  /** Reason for the refund */
  reason: "duplicate" | "fraudulent" | "requested_by_customer";
  /** Status of the refund from Stripe */
  status: "pending" | "succeeded" | "failed" | "canceled";
  /** Failure reason if refund failed */
  failureReason?: string;
  /** Metadata associated with the refund */
  metadata?: Record<string, string>;
  /** Timestamp when refund was created */
  createdAt: Timestamp;
  /** Timestamp when refund was last updated */
  updatedAt: Timestamp;
}

/**
 * Payment status transition tracking for audit purposes
 */
export interface PaymentStatusTransition {
  id: string;
  /** Related appointment ID */
  appointmentId: string;
  /** Related payment intent ID */
  paymentIntentId?: string;
  /** Previous payment status */
  fromStatus: string;
  /** New payment status */
  toStatus: string;
  /** Reason for status change */
  reason?: string;
  /** Additional context or metadata */
  metadata?: Record<string, unknown>;
  /** User or system that triggered the change */
  triggeredBy: string;
  /** Timestamp of the transition */
  transitionedAt: Timestamp;
}

/**
 * Failed payment retry tracking
 */
export interface PaymentRetryAttempt {
  id: string;
  /** Related appointment ID */
  appointmentId: string;
  /** Related payment intent ID */
  paymentIntentId?: string;
  /** Attempt number (1, 2, 3, etc.) */
  attemptNumber: number;
  /** Stripe error code if available */
  errorCode?: string;
  /** Human-readable error message */
  errorMessage?: string;
  /** Payment method used for this attempt */
  paymentMethod?: {
    type: string;
    last4?: string;
    brand?: string;
  };
  /** Whether this was an automated retry */
  isAutomaticRetry: boolean;
  /** Next scheduled retry timestamp */
  nextRetryAt?: Timestamp;
  /** Current retry status */
  status: "failed" | "pending" | "abandoned";
  /** Timestamp of this retry attempt */
  attemptedAt: Timestamp;
}

/**
 * Enhanced User interface with Stripe integration
 * Extends the existing User interface with payment-related fields
 */
export interface UserPaymentProfile {
  /** Stripe customer ID for payment processing */
  stripeCustomerId?: string;
  /** Stripe account ID for therapists receiving payments */
  stripeAccountId?: string;
  /** Payment method preferences */
  paymentMethods?: {
    preferred?: string;
    savedMethods?: string[];
  };
  /** Payment history summary */
  paymentSummary?: {
    totalSpent?: number;
    totalEarned?: number;
    currency: string;
    lastPaymentDate?: Timestamp;
  };
}
