/**
 * Stripe TypeScript Types
 *
 * This file contains custom TypeScript types for Stripe integration
 * specific to the therapy booking platform.
 */

import type Stripe from "stripe";

// Appointment-specific metadata types
export interface AppointmentMetadata {
  appointment_id: string;
  client_id: string;
  therapist_id: string;
  platform: "therapy-booking";
  session_duration?: string;
  session_type?: "individual" | "couple" | "group";
  appointment_date?: string;
  appointment_time?: string;
}

// Payment intent creation parameters
export interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  appointmentId: string;
  clientId: string;
  therapistId: string;
  metadata?: Record<string, string>;
}

// Checkout session creation parameters
export interface CreateCheckoutSessionParams {
  priceData: {
    unitAmount: number;
    productName: string;
    productDescription?: string;
  };
  successUrl: string;
  cancelUrl: string;
  appointmentId: string;
  clientId: string;
  therapistId: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

// Customer creation/retrieval parameters
export interface CustomerParams {
  email: string;
  name?: string;
  userId: string;
}

// Refund parameters
export interface RefundParams {
  paymentIntentId: string;
  amount?: number;
  reason?: Stripe.RefundCreateParams.Reason;
}

// Webhook event types specific to our platform
export type TherapyPlatformWebhookEvent =
  | "payment_intent.succeeded"
  | "payment_intent.payment_failed"
  | "checkout.session.completed"
  | "invoice.payment_succeeded"
  | "invoice.payment_failed"
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted";

// Payment status for appointments
export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled"
  | "refunded"
  | "partially_refunded";

// Payment method information
export interface PaymentMethodInfo {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

// Appointment payment details
export interface AppointmentPayment {
  id: string;
  appointmentId: string;
  clientId: string;
  therapistId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentIntentId?: string;
  paymentMethodId?: string;
  paymentMethod?: PaymentMethodInfo;
  stripeCustomerId?: string;
  receiptUrl?: string;
  refunded?: boolean;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, string | number | boolean>;
}

// Pricing configuration for therapy sessions
export interface TherapySessionPricing {
  sessionType: "individual" | "couple" | "group";
  duration: 30 | 45 | 60 | 90; // minutes
  basePrice: number;
  currency: string;
  therapistId?: string; // for therapist-specific pricing
}

// Webhook payload types
export interface WebhookPayload {
  event: Stripe.Event;
  metadata: AppointmentMetadata;
}

// Error types for Stripe operations
export interface StripeError {
  type: "stripe_error" | "validation_error" | "api_error";
  message: string;
  code?: string;
  param?: string;
  statusCode?: number;
}

// Payment confirmation result
export interface PaymentConfirmationResult {
  success: boolean;
  paymentIntent?: Stripe.PaymentIntent;
  error?: StripeError;
}

// Client-side payment result
export interface ClientPaymentResult {
  success: boolean;
  paymentMethod?: PaymentMethodInfo;
  error?: string;
}

// Subscription types for recurring appointments
export interface TherapySubscription {
  id: string;
  clientId: string;
  therapistId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: Stripe.Subscription.Status;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  sessionsPerPeriod: number;
  pricePerSession: number;
  currency: string;
  metadata?: Record<string, string | number | boolean>;
}

// Payout information for therapists
export interface TherapistPayout {
  therapistId: string;
  appointmentId: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  currency: string;
  payoutDate?: Date;
  payoutStatus: "pending" | "paid" | "failed";
  stripeTransferId?: string;
}

// Configuration types
export type SupportedCurrency = "usd" | "eur" | "gbp" | "cad" | "aud";
export type SupportedPaymentMethod = "card";

// Utility types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: StripeError;
}

// Stripe webhook handler function type
export type WebhookHandler = (
  event: Stripe.Event,
  metadata: AppointmentMetadata
) => Promise<void>;

// Export commonly used Stripe types
export type { Stripe as StripeInstance } from "stripe";

export type StripePaymentIntent = Stripe.PaymentIntent;
export type StripeCheckoutSession = Stripe.Checkout.Session;
export type StripeCustomer = Stripe.Customer;
export type StripePaymentMethod = Stripe.PaymentMethod;
export type StripeRefund = Stripe.Refund;
export type StripeEvent = Stripe.Event;
export type StripeSubscription = Stripe.Subscription;
