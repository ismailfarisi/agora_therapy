import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/admin/payouts/[payoutId]/process
 * Process a payout to therapist
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ payoutId: string }> }
) {
  const { payoutId } = await params;
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

    // Get payout details
    const payoutDoc = await db.collection("payouts").doc(payoutId).get();

    if (!payoutDoc.exists) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    }

    const payoutData = payoutDoc.data();

    if (payoutData?.status !== "pending") {
      return NextResponse.json(
        { error: "Payout is not in pending status" },
        { status: 400 }
      );
    }

    // Get therapist's Stripe Connect account ID
    const therapistDoc = await db
      .collection("users")
      .doc(payoutData.therapistId)
      .get();

    if (!therapistDoc.exists) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    const therapistData = therapistDoc.data();
    const stripeAccountId = therapistData?.stripeConnectAccountId;

    if (!stripeAccountId) {
      // Update payout status to failed
      await payoutDoc.ref.update({
        status: "failed",
        failureReason: "Therapist has not connected Stripe account",
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json(
        { error: "Therapist has not connected their Stripe account" },
        { status: 400 }
      );
    }

    // Update status to processing
    await payoutDoc.ref.update({
      status: "processing",
      updatedAt: FieldValue.serverTimestamp(),
    });

    try {
      // Create a transfer to the connected account
      const transfer = await stripe.transfers.create({
        amount: Math.round(payoutData.netAmount * 100), // Convert to cents
        currency: "usd",
        destination: stripeAccountId,
        description: `Payout for appointment ${payoutData.appointmentId}`,
        metadata: {
          payoutId: payoutId,
          appointmentId: payoutData.appointmentId,
          therapistId: payoutData.therapistId,
        },
      });

      // Update payout as completed
      await payoutDoc.ref.update({
        status: "completed",
        stripePayoutId: transfer.id,
        completedDate: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        message: "Payout processed successfully",
        transferId: transfer.id,
      });
    } catch (stripeError: any) {
      console.error("Stripe transfer error:", stripeError);

      // Update payout as failed
      await payoutDoc.ref.update({
        status: "failed",
        failureReason: stripeError.message || "Stripe transfer failed",
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json(
        { error: "Failed to process payout via Stripe" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing payout:", error);
    return NextResponse.json(
      { error: "Failed to process payout" },
      { status: 500 }
    );
  }
}
