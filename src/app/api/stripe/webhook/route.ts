import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";

import Stripe from "stripe";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import type { WebhookResponse, WebhookError } from "@/types/stripe-api";

// Store processed webhook IDs to handle idempotency
const processedWebhooks = new Set<string>();

interface AppointmentMetadata {
  appointmentRef: string;
  therapistId: string;
  therapistName: string;
  therapistEmail: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: string;
  notes?: string;
}

async function createAppointment(
  metadata: AppointmentMetadata,
  paymentIntentId: string,
  amount?: number
) {
  try {
    // Validate required metadata fields
    if (
      !metadata.therapistId ||
      !metadata.clientId ||
      !metadata.appointmentDate
    ) {
      throw new Error("Missing required appointment metadata");
    }

    const db = getAdminFirestore();
    const appointmentData = {
      therapistId: metadata.therapistId,
      clientId: metadata.clientId,
      scheduledFor: Timestamp.fromDate(
        new Date(`${metadata.appointmentDate}T${metadata.appointmentTime}`)
      ),
      duration: parseInt(metadata.duration),
      status: "confirmed" as const,
      payment: {
        amount: amount || 0,
        currency: "usd",
        status: "paid" as const,
        transactionId: paymentIntentId,
        method: "card",
      },
      session: {
        type: "individual" as const,
        deliveryType: "video" as const,
        platform: "agora" as const,
      },
      communication: {
        clientNotes: metadata.notes || "",
        therapistNotes: "",
        remindersSent: {
          email: [],
          sms: [],
        },
      },
      metadata: {
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        confirmedAt: Timestamp.now(),
      },
      // Additional fields for tracking
      appointmentRef: metadata.appointmentRef,
      therapistName: metadata.therapistName,
      clientName: metadata.clientName,
      clientEmail: metadata.clientEmail,
    };

    // Create appointment document
    const appointmentRef = db.collection("appointments").doc();
    await appointmentRef.set(appointmentData);

    console.log(
      `Appointment created: ${appointmentRef.id} for ${metadata.appointmentRef}`
    );
    return appointmentRef.id;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
}

async function updateAppointmentPaymentStatus(
  appointmentRef: string,
  status: "paid" | "failed" | "refunded",
  paymentIntentId: string
) {
  try {
    const db = getAdminFirestore();
    const appointmentsQuery = await db
      .collection("appointments")
      .where("appointmentRef", "==", appointmentRef)
      .limit(1)
      .get();

    if (appointmentsQuery.empty) {
      console.error(`No appointment found with ref: ${appointmentRef}`);
      return;
    }

    const appointmentDoc = appointmentsQuery.docs[0];
    await appointmentDoc.ref.update({
      "payment.status": status,
      "payment.transactionId": paymentIntentId,
      "metadata.updatedAt": Timestamp.now(),
      ...(status === "failed" && { status: "cancelled" }),
    });

    console.log(
      `Appointment ${appointmentDoc.id} payment status updated to: ${status}`
    );
  } catch (error) {
    console.error("Error updating appointment payment status:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found");
      return NextResponse.json<WebhookError>(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return NextResponse.json<WebhookError>(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    // Verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return NextResponse.json<WebhookError>(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle idempotency - prevent processing the same event multiple times
    if (processedWebhooks.has(event.id)) {
      console.log(`Event ${event.id} already processed, skipping`);
      return NextResponse.json<WebhookResponse>({ received: true });
    }

    console.log(`Processing webhook event: ${event.type} (${event.id})`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status === "paid" && session.metadata) {
          try {
            const metadata = session.metadata as unknown as AppointmentMetadata;

            // Retrieve payment intent to get amount
            if (session.payment_intent) {
              const paymentIntent = await stripe.paymentIntents.retrieve(
                session.payment_intent as string
              );

              // Create appointment with payment amount
              await createAppointment(
                metadata,
                paymentIntent.id,
                paymentIntent.amount / 100 // Convert from cents
              );
            }
          } catch (error) {
            console.error(
              "Error processing checkout.session.completed:",
              error
            );
            // Don't return error - let Stripe know we received the event
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        if (paymentIntent.metadata?.appointmentRef) {
          try {
            await updateAppointmentPaymentStatus(
              paymentIntent.metadata.appointmentRef,
              "paid",
              paymentIntent.id
            );
          } catch (error) {
            console.error("Error processing payment_intent.succeeded:", error);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        if (paymentIntent.metadata?.appointmentRef) {
          try {
            await updateAppointmentPaymentStatus(
              paymentIntent.metadata.appointmentRef,
              "failed",
              paymentIntent.id
            );
          } catch (error) {
            console.error(
              "Error processing payment_intent.payment_failed:",
              error
            );
          }
        }
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;

        // Log dispute for manual review
        console.warn(
          `Payment dispute created: ${dispute.id} for charge: ${dispute.charge}`
        );

        // Could implement automatic appointment status updates here
        break;
      }

      case "invoice.payment_succeeded": {
        // Handle subscription payments if implemented later
        console.log(
          "Invoice payment succeeded - not implemented for one-time payments"
        );
        break;
      }

      case "customer.subscription.deleted": {
        // Handle subscription cancellation if implemented later
        console.log(
          "Subscription deleted - not implemented for one-time payments"
        );
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    processedWebhooks.add(event.id);

    // Clean up old processed events (keep last 1000)
    if (processedWebhooks.size > 1000) {
      const oldEvents = Array.from(processedWebhooks).slice(0, 100);
      oldEvents.forEach((eventId) => processedWebhooks.delete(eventId));
    }

    return NextResponse.json<WebhookResponse>({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json<WebhookError>(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json<WebhookError>(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
