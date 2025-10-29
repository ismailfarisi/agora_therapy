/**
 * Notification Model
 * Notification and messaging types
 */

import { Timestamp } from "firebase/firestore";

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
