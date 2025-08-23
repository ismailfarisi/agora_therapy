/**
 * Stripe Server-Side Utilities
 *
 * This file provides server-side Stripe initialization and utilities
 * using the stripe package for Node.js operations.
 */

import Stripe from "stripe";
import { stripeConfig, STRIPE_CONFIG } from "./config";

// Initialize Stripe with secret key
const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

/**
 * Get the Stripe server instance
 */
export function getStripeServer(): Stripe {
  return stripe;
}

/**
 * Create a payment intent for therapy session payment
 */
export async function createPaymentIntent({
  amount,
  currency = STRIPE_CONFIG.currency,
  appointmentId,
  clientId,
  therapistId,
  metadata = {},
}: {
  amount: number;
  currency?: string;
  appointmentId: string;
  clientId: string;
  therapistId: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        [STRIPE_CONFIG.metadata.platform]: "therapy-booking",
        [STRIPE_CONFIG.metadata.appointmentId]: appointmentId,
        [STRIPE_CONFIG.metadata.clientId]: clientId,
        [STRIPE_CONFIG.metadata.therapistId]: therapistId,
        ...metadata,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create payment intent"
    );
  }
}

/**
 * Create a Stripe Checkout session for appointment booking
 */
export async function createCheckoutSession({
  priceData,
  successUrl,
  cancelUrl,
  appointmentId,
  clientId,
  therapistId,
  customerEmail,
  metadata = {},
}: {
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
}): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: [...STRIPE_CONFIG.paymentMethodTypes],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: priceData.productName,
              description: priceData.productDescription,
            },
            unit_amount: Math.round(priceData.unitAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        [STRIPE_CONFIG.metadata.platform]: "therapy-booking",
        [STRIPE_CONFIG.metadata.appointmentId]: appointmentId,
        [STRIPE_CONFIG.metadata.clientId]: clientId,
        [STRIPE_CONFIG.metadata.therapistId]: therapistId,
        ...metadata,
      },
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to create checkout session"
    );
  }
}

/**
 * Retrieve a payment intent by ID
 */
export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to retrieve payment intent"
    );
  }
}

/**
 * Construct webhook event from request
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      stripeConfig.webhookSecret
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Webhook signature verification failed"
    );
  }
}

/**
 * Create or retrieve a Stripe customer
 */
export async function createOrRetrieveCustomer({
  email,
  name,
  userId,
}: {
  email: string;
  name?: string;
  userId: string;
}): Promise<Stripe.Customer> {
  try {
    // First, try to find existing customer by email
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer if not found
    return await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });
  } catch (error) {
    console.error("Error creating/retrieving customer:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to create/retrieve customer"
    );
  }
}

/**
 * Refund a payment
 */
export async function refundPayment(
  paymentIntentId: string,
  amount?: number,
  reason?: Stripe.RefundCreateParams.Reason
): Promise<Stripe.Refund> {
  try {
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
      reason,
    };

    if (amount) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }

    return await stripe.refunds.create(refundParams);
  } catch (error) {
    console.error("Error processing refund:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to process refund"
    );
  }
}

/**
 * Get payment method details
 */
export async function getPaymentMethod(
  paymentMethodId: string
): Promise<Stripe.PaymentMethod> {
  try {
    return await stripe.paymentMethods.retrieve(paymentMethodId);
  } catch (error) {
    console.error("Error retrieving payment method:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to retrieve payment method"
    );
  }
}

// Export the stripe instance for direct usage if needed
export { stripe };
