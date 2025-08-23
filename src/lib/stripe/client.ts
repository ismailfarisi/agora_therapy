/**
 * Stripe Client-Side Utilities
 *
 * This file provides client-side Stripe initialization and utilities
 * using @stripe/stripe-js for browser-based operations.
 */

"use client";

import { loadStripe, Stripe, StripeCardElement } from "@stripe/stripe-js";
import type { PaymentMethod } from "@stripe/stripe-js";
import { stripeConfig } from "./config";

// Global Stripe promise to avoid loading multiple times
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe client instance
 * This function ensures Stripe is loaded only once and returns the same promise
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(stripeConfig.publishableKey);
  }
  return stripePromise;
}

/**
 * Helper function to redirect to Stripe Checkout
 * @param sessionId - The Stripe checkout session ID
 */
export async function redirectToCheckout(sessionId: string): Promise<void> {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error("Stripe failed to load");
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.error("Stripe checkout redirect error:", error);
      throw new Error(error.message || "Failed to redirect to checkout");
    }
  } catch (error) {
    console.error("Error redirecting to checkout:", error);
    throw error;
  }
}

/**
 * Helper function to confirm a payment intent
 * @param clientSecret - The payment intent client secret
 * @param paymentMethodId - The payment method ID (optional)
 */
export async function confirmPayment(
  clientSecret: string,
  paymentMethodId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error("Stripe failed to load");
    }

    const confirmOptions = paymentMethodId
      ? { payment_method: paymentMethodId }
      : undefined;

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      paymentMethodId ? confirmOptions : undefined
    );

    if (error) {
      console.error("Payment confirmation error:", error);
      return { success: false, error: error.message };
    }

    if (paymentIntent?.status === "succeeded") {
      return { success: true };
    }

    return { success: false, error: "Payment was not successful" };
  } catch (error) {
    console.error("Error confirming payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Helper function to create payment method
 * @param cardElement - The Stripe card element
 * @param billingDetails - Billing details for the payment method
 */
export async function createPaymentMethod(
  cardElement: StripeCardElement,
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  }
): Promise<{ paymentMethod?: PaymentMethod; error?: string }> {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error("Stripe failed to load");
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: billingDetails,
    });

    if (error) {
      console.error("Payment method creation error:", error);
      return { error: error.message };
    }

    return { paymentMethod };
  } catch (error) {
    console.error("Error creating payment method:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Utility to check if Stripe is available
 */
export async function isStripeAvailable(): Promise<boolean> {
  try {
    const stripe = await getStripe();
    return stripe !== null;
  } catch {
    return false;
  }
}
