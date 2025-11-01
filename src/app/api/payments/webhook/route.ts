import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * POST /api/payments/webhook
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.refunded":
        await handleRefund(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const db = getAdminFirestore();
    const appointmentId = paymentIntent.metadata.appointmentId;

    // Update payment record
    const paymentsSnapshot = await db
      .collection("payments")
      .where("stripePaymentIntentId", "==", paymentIntent.id)
      .get();

    if (!paymentsSnapshot.empty) {
      const paymentDoc = paymentsSnapshot.docs[0];
      await paymentDoc.ref.update({
        status: "succeeded",
        stripePaymentId: paymentIntent.id,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    // Update appointment status
    if (appointmentId) {
      await db.collection("appointments").doc(appointmentId).update({
        paymentStatus: "paid",
        status: "confirmed",
        payoutCreated: false, // Flag to track if payout has been created
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    console.log(`Payment succeeded for appointment: ${appointmentId}`);
  } catch (error) {
    console.error("Error handling payment success:", error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const db = getAdminFirestore();
    const appointmentId = paymentIntent.metadata.appointmentId;

    // Update payment record
    const paymentsSnapshot = await db
      .collection("payments")
      .where("stripePaymentIntentId", "==", paymentIntent.id)
      .get();

    if (!paymentsSnapshot.empty) {
      const paymentDoc = paymentsSnapshot.docs[0];
      await paymentDoc.ref.update({
        status: "failed",
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    // Update appointment status
    if (appointmentId) {
      await db.collection("appointments").doc(appointmentId).update({
        paymentStatus: "failed",
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    console.log(`Payment failed for appointment: ${appointmentId}`);
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}

async function handleRefund(charge: Stripe.Charge) {
  try {
    const db = getAdminFirestore();
    // Find payment by Stripe charge ID
    const paymentsSnapshot = await db
      .collection("payments")
      .where("stripePaymentId", "==", charge.payment_intent)
      .get();

    if (!paymentsSnapshot.empty) {
      const paymentDoc = paymentsSnapshot.docs[0];
      const paymentData = paymentDoc.data();

      await paymentDoc.ref.update({
        status: "refunded",
        refundedAmount: charge.amount_refunded / 100,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Update appointment status
      if (paymentData.appointmentId) {
        await db
          .collection("appointments")
          .doc(paymentData.appointmentId)
          .update({
            paymentStatus: "refunded",
            status: "cancelled",
            updatedAt: FieldValue.serverTimestamp(),
          });
      }

      console.log(`Refund processed for payment: ${paymentDoc.id}`);
    }
  } catch (error) {
    console.error("Error handling refund:", error);
  }
}
