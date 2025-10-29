/**
 * Payment Model
 * Payment, payout, and refund types
 */

import { Timestamp, FieldValue } from "firebase/firestore";

export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

export interface PaymentIntent {
  id: string;
  appointmentId: string;
  clientId: string;
  therapistId: string;
  amount: number;
  currency: string;
  stripePaymentIntentId: string;
  status: PaymentStatus;
  metadata: {
    createdAt: Timestamp;
    updatedAt: Timestamp;
    paidAt?: Timestamp;
    refundedAt?: Timestamp;
  };
}

export interface Payout {
  id: string;
  therapistId: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed";
  period: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
  appointments: string[]; // appointment IDs included
  stripePayoutId?: string;
  metadata: {
    createdAt: Timestamp | FieldValue;
    processedAt?: Timestamp;
    completedAt?: Timestamp;
    failureReason?: string;
  };
}

export interface Refund {
  id: string;
  appointmentId: string;
  paymentIntentId: string;
  clientId: string;
  therapistId: string;
  amount: number;
  currency: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "completed";
  stripeRefundId?: string;
  metadata: {
    requestedAt: Timestamp;
    requestedBy: string; // user ID
    approvedAt?: Timestamp;
    approvedBy?: string; // admin ID
    completedAt?: Timestamp;
    rejectionReason?: string;
  };
}
