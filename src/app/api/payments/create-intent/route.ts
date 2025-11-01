import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/payments/create-intent
 * Create a Stripe payment intent for booking a session
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await getAdminAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get request body
    const body = await request.json();
    const { appointmentId, amount, currency = "usd" } = body;

    if (!appointmentId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify appointment exists and belongs to user
    const db = getAdminFirestore();
    const appointmentDoc = await db
      .collection("appointments")
      .doc(appointmentId)
      .get();

    if (!appointmentDoc.exists) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const appointmentData = appointmentDoc.data();
    if (appointmentData?.clientId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to pay for this appointment" },
        { status: 403 }
      );
    }

    // Check if payment already exists
    const existingPayment = await db
      .collection("payments")
      .where("appointmentId", "==", appointmentId)
      .where("status", "==", "succeeded")
      .get();

    if (!existingPayment.empty) {
      return NextResponse.json(
        { error: "Payment already completed for this appointment" },
        { status: 400 }
      );
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        appointmentId,
        clientId: userId,
        therapistId: appointmentData?.therapistId || "",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create payment record in Firestore
    const paymentRef = db.collection("payments").doc();
    await paymentRef.set({
      id: paymentRef.id,
      appointmentId,
      clientId: userId,
      therapistId: appointmentData?.therapistId || "",
      amount,
      currency,
      status: "pending",
      stripePaymentIntentId: paymentIntent.id,
      paymentMethod: "card",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      paymentId: paymentRef.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
