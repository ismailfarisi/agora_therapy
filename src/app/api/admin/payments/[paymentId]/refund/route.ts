import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/admin/payments/[paymentId]/refund
 * Initiate a refund for a payment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;
  try {
    // Verify admin authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = getAdminAuth();
    const db = getAdminFirestore();
    const decodedToken = await auth.verifyIdToken(token);
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { reason = "Admin initiated refund" } = body;

    // Get payment details
    const paymentDoc = await db.collection("payments").doc(paymentId).get();

    if (!paymentDoc.exists) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const paymentData = paymentDoc.data();

    if (paymentData?.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment is not in succeeded status" },
        { status: 400 }
      );
    }

    if (!paymentData.stripePaymentIntentId) {
      return NextResponse.json(
        { error: "No Stripe payment intent found" },
        { status: 400 }
      );
    }

    // Create refund record
    const refundRef = db.collection("refunds").doc();
    await refundRef.set({
      id: refundRef.id,
      paymentId: paymentId,
      appointmentId: paymentData.appointmentId || "",
      amount: paymentData.amount || 0,
      reason,
      status: "pending",
      requestedBy: decodedToken.uid,
      requestedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Process refund with Stripe
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentData.stripePaymentIntentId,
        reason: "requested_by_customer",
        metadata: {
          refundId: refundRef.id,
          paymentId: paymentId,
          appointmentId: paymentData.appointmentId || "",
          reason: reason,
        },
      });

      // Update refund record
      await refundRef.update({
        status: "completed",
        stripeRefundId: refund.id,
        processedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Update payment status
      await paymentDoc.ref.update({
        status: "refunded",
        refundId: refundRef.id,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Update appointment status
      if (paymentData.appointmentId) {
        await db.collection("appointments").doc(paymentData.appointmentId).update({
          paymentStatus: "refunded",
          status: "cancelled",
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      return NextResponse.json({
        success: true,
        message: "Refund processed successfully",
        refundId: refundRef.id,
        stripeRefundId: refund.id,
      });
    } catch (stripeError) {
      const error = stripeError as Error;
      console.error("Stripe refund error:", error);

      // Update refund as failed
      await refundRef.update({
        status: "failed",
        failureReason: error.message || "Stripe refund failed",
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json(
        { error: "Failed to process refund via Stripe" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing refund:", error);
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 }
    );
  }
}
