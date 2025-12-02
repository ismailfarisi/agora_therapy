/**
 * Appointment Model
 * Appointment/session related types
 */

import { Timestamp, FieldValue } from "firebase/firestore";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export type SessionType = "individual" | "group" | "consultation" | "follow_up";
export type SessionDeliveryType = "video" | "phone" | "in_person";
export type SessionPlatform = "agora" | "zoom" | "teams";

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

export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

export interface BookingRequest {
  therapistId: string;
  clientId: string;
  timeSlotId: string;
  date: Date;
  duration: number;
  sessionType: SessionType;
  deliveryType?: SessionDeliveryType;
  clientNotes?: string;
}

export interface SessionCredentials {
  channelId: string;
  token: string;
  uid: number;
  appId: string;
  expiresAt: Date;
}
