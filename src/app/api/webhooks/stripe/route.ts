import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import Stripe from "stripe";
import { emailService } from "@/lib/services/email-service";
import { RtcTokenBuilder, RtcRole } from "agora-token";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Agora configuration
const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
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

    // Handle the event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
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
  const db = getAdminFirestore();

  try {
    // Find appointment by payment intent ID
    const appointmentsSnapshot = await db
      .collection("appointments")
      .where("payment.transactionId", "==", paymentIntent.id)
      .limit(1)
      .get();

    if (appointmentsSnapshot.empty) {
      console.error("No appointment found for payment intent:", paymentIntent.id);
      return;
    }

    const appointmentDoc = appointmentsSnapshot.docs[0];
    const appointmentData = appointmentDoc.data();

    // Generate Agora channel and tokens
    const channelName = `session_${appointmentDoc.id}`;
    const expirationTime = Math.floor(Date.now() / 1000) + 24 * 3600; // 24 hours

    // Generate tokens for both client and therapist
    const clientUid = parseInt(appointmentData.clientId.substring(0, 8), 36);
    const therapistUid = parseInt(appointmentData.therapistId.substring(0, 8), 36);

    const clientToken = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      clientUid,
      RtcRole.PUBLISHER,
      expirationTime,
      expirationTime
    );

    const therapistToken = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      therapistUid,
      RtcRole.PUBLISHER,
      expirationTime,
      expirationTime
    );

    // Generate meeting link
    const meetingLink = `${process.env.NEXT_PUBLIC_APP_URL}/session/${appointmentDoc.id}`;

    // Update appointment with session details
    await appointmentDoc.ref.update({
      status: "confirmed",
      "payment.status": "paid",
      "session.channelId": channelName,
      "session.joinUrl": meetingLink,
      "metadata.confirmedAt": FieldValue.serverTimestamp(),
      "metadata.updatedAt": FieldValue.serverTimestamp(),
    });

    // Store tokens separately for security (not in main appointment doc)
    await db
      .collection("sessionCredentials")
      .doc(appointmentDoc.id)
      .set({
        appointmentId: appointmentDoc.id,
        channelName,
        clientToken,
        therapistToken,
        clientUid,
        therapistUid,
        appId: AGORA_APP_ID,
        expiresAt: new Date(expirationTime * 1000),
        createdAt: FieldValue.serverTimestamp(),
      });

    // Get client and therapist details
    const [clientDoc, therapistDoc, therapistProfileDoc] = await Promise.all([
      db.collection("users").doc(appointmentData.clientId).get(),
      db.collection("users").doc(appointmentData.therapistId).get(),
      db.collection("therapistProfiles").doc(appointmentData.therapistId).get(),
    ]);

    const clientData = clientDoc.data();
    const therapistData = therapistDoc.data();
    const therapistProfileData = therapistProfileDoc.data();

    // Send confirmation emails
    await emailService.sendAppointmentConfirmation({
      clientName: clientData?.profile?.displayName || "Client",
      clientEmail: clientData?.email || "",
      therapistName: therapistData?.profile?.displayName || "Therapist",
      therapistEmail: therapistData?.email || "",
      appointmentDate: appointmentData.scheduledFor.toDate(),
      duration: appointmentData.duration,
      meetingLink,
      amount: appointmentData.payment.amount,
      currency: appointmentData.payment.currency,
    });

    console.log("Payment processed successfully for appointment:", appointmentDoc.id);
  } catch (error) {
    console.error("Error handling payment success:", error);
    throw error;
  }
}
