/**
 * Stripe Integration Index
 *
 * This file exports all Stripe-related utilities, types, and configurations
 * for easy importing throughout the therapy booking platform.
 */

// Configuration exports
export {
  stripeConfig,
  STRIPE_CONFIG,
  getBaseUrl,
  getStripeUrls,
  type StripeWebhookEvent,
  type SupportedCurrency,
  type SupportedPaymentMethod,
} from "./config";

// Client-side utilities
export {
  getStripe,
  redirectToCheckout,
  confirmPayment,
  createPaymentMethod,
  isStripeAvailable,
} from "./client";

// Server-side utilities
export {
  getStripeServer,
  createPaymentIntent,
  createCheckoutSession,
  retrievePaymentIntent,
  constructWebhookEvent,
  createOrRetrieveCustomer,
  refundPayment,
  getPaymentMethod,
  stripe,
} from "./server";

// Type exports
export type {
  AppointmentMetadata,
  CreatePaymentIntentParams,
  CreateCheckoutSessionParams,
  CustomerParams,
  RefundParams,
  TherapyPlatformWebhookEvent,
  PaymentStatus,
  PaymentMethodInfo,
  AppointmentPayment,
  TherapySessionPricing,
  WebhookPayload,
  StripeError,
  PaymentConfirmationResult,
  ClientPaymentResult,
  TherapySubscription,
  TherapistPayout,
  ApiResponse,
  WebhookHandler,
  StripeInstance,
  StripePaymentIntent,
  StripeCheckoutSession,
  StripeCustomer,
  StripePaymentMethod,
  StripeRefund,
  StripeEvent,
  StripeSubscription,
} from "./types";
