/**
 * Stripe Configuration
 *
 * This file contains the Stripe configuration for the therapy booking platform.
 * It handles environment variables, validation, and configuration constants.
 */

// Environment variable validation
function validateRequiredEnvVar(
  name: string,
  value: string | undefined
): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Stripe Environment Variables
export const stripeConfig = {
  // Client-side publishable key (safe to expose to browser)
  publishableKey: validateRequiredEnvVar(
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ),

  // Server-side secret key (never expose to browser)
  secretKey: validateRequiredEnvVar(
    "STRIPE_SECRET_KEY",
    process.env.STRIPE_SECRET_KEY
  ),

  // Webhook endpoint secret for signature verification
  webhookSecret: validateRequiredEnvVar(
    "STRIPE_WEBHOOK_SECRET",
    process.env.STRIPE_WEBHOOK_SECRET
  ),
} as const;

// Stripe Configuration Constants
export const STRIPE_CONFIG = {
  // Currency for payments
  currency: "usd" as const,

  // Payment method types to accept
  paymentMethodTypes: ["card"] as const,

  // Metadata keys for tracking
  metadata: {
    platform: "therapy-booking",
    appointmentId: "appointment_id",
    clientId: "client_id",
    therapistId: "therapist_id",
  },

  // Webhook events we want to handle
  webhookEvents: [
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "checkout.session.completed",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
  ] as const,

  // Success and cancel URLs for Stripe Checkout
  urls: {
    success: "/client/appointments?payment=success",
    cancel: "/client/appointments?payment=cancelled",
  },
} as const;

// Type exports for TypeScript support
export type StripeWebhookEvent = (typeof STRIPE_CONFIG.webhookEvents)[number];
export type SupportedCurrency = typeof STRIPE_CONFIG.currency;
export type SupportedPaymentMethod =
  (typeof STRIPE_CONFIG.paymentMethodTypes)[number];

// Helper function to get the base URL for webhook URLs
export function getBaseUrl(): string {
  if (process.env.NODE_ENV === "production") {
    return process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com";
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

// Helper function to construct full URLs
export function getStripeUrls() {
  const baseUrl = getBaseUrl();
  return {
    success: `${baseUrl}${STRIPE_CONFIG.urls.success}`,
    cancel: `${baseUrl}${STRIPE_CONFIG.urls.cancel}`,
    webhook: `${baseUrl}/api/stripe/webhook`,
  };
}
