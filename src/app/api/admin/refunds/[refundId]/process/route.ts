import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/admin/refunds/[refundId]/process
 * Process a pending refund
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { refundId: string } }
) {
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

    const refundId = params.refundId;

    // Get refund details
    const refundDoc = await db.collection("refunds").doc(refundId).get();

    if (!refundDoc.exists) {
      return NextResponse.json({ error: "Refund not found" }, { status: 404 });
    }

    const refundData = refundDoc.data();

    if (refundData?.status !== "pending") {
      return NextResponse.json(
        { error: "Refund is not in pending status" },
        { status: 400 }
      );
    }

    // Get payment details
    const paymentDoc = await db
      .collection("payments")
      .doc(refundData.paymentId)
      .get();

    if (!paymentDoc.exists) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const paymentData = paymentDoc.data();

    if (!paymentData?.stripePaymentIntentId) {
      return NextResponse.json(
        { error: "No Stripe payment intent found" },
        { status: 400 }
      );
    }

    // Update refund status to processing
    await refundDoc.ref.update({
      status: "processing",
      updatedAt: FieldValue.serverTimestamp(),
    });

    try {
      // Process refund with Stripe
      const refund = await stripe.refunds.create({
        payment_intent: paymentData.stripePaymentIntentId,
        reason: "requested_by_customer",
        metadata: {
          refundId: refundId,
          paymentId: refundData.paymentId,
          appointmentId: refundData.appointmentId || "",
        },
      });

      // Update refund as completed
      await refundDoc.ref.update({
        status: "completed",
        stripeRefundId: refund.id,
        processedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Update payment status
      await paymentDoc.ref.update({
        status: "refunded",
        refundId: refundId,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Update appointment status
      if (refundData.appointmentId) {
        await db
          .collection("appointments")
          .doc(refundData.appointmentId)
          .update({
            paymentStatus: "refunded",
            status: "cancelled",
            updatedAt: FieldValue.serverTimestamp(),
          });
      }

      return NextResponse.json({
        success: true,
        message: "Refund processed successfully",
        stripeRefundId: refund.id,
      });
    } catch (stripeError: any) {
      console.error("Stripe refund error:", stripeError);

      // Update refund as failed
      await refundDoc.ref.update({
        status: "failed",
        failureReason: stripeError.message || "Stripe refund failed",
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
