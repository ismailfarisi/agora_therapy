import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * GET /api/cron/process-payouts
 * Scheduled job to create payouts for completed sessions after 4 days
 * This should be called by a cron job (e.g., Vercel Cron, GitHub Actions)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminFirestore();

    // Calculate date 4 days ago
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

    // Find completed appointments that are 4+ days old and haven't been paid out
    const appointmentsSnapshot = await db
      .collection("appointments")
      .where("status", "==", "completed")
      .where("paymentStatus", "==", "paid")
      .where("payoutCreated", "==", false)
      .get();

    const payoutsCreated: string[] = [];
    const errors: string[] = [];

    for (const appointmentDoc of appointmentsSnapshot.docs) {
      const appointmentData = appointmentDoc.data();
      const appointmentDate = appointmentData.scheduledDate?.toDate();

      // Check if appointment is at least 4 days old
      if (!appointmentDate || appointmentDate > fourDaysAgo) {
        continue;
      }

      try {
        // Get payment details
        const paymentSnapshot = await db
          .collection("payments")
          .where("appointmentId", "==", appointmentDoc.id)
          .where("status", "==", "succeeded")
          .limit(1)
          .get();

        if (paymentSnapshot.empty) {
          errors.push(`No payment found for appointment ${appointmentDoc.id}`);
          continue;
        }

        const paymentData = paymentSnapshot.docs[0].data();
        const sessionAmount = paymentData.amount || 0;

        // Calculate platform fee (10%) and net amount (90%)
        const platformFee = sessionAmount * 0.1;
        const netAmount = sessionAmount * 0.9;

        // Create payout record
        const payoutRef = db.collection("payouts").doc();
        await payoutRef.set({
          id: payoutRef.id,
          therapistId: appointmentData.therapistId,
          appointmentId: appointmentDoc.id,
          paymentId: paymentSnapshot.docs[0].id,
          amount: sessionAmount,
          platformFee: platformFee,
          netAmount: netAmount,
          status: "pending",
          scheduledDate: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Mark appointment as payout created
        await appointmentDoc.ref.update({
          payoutCreated: true,
          payoutId: payoutRef.id,
          updatedAt: FieldValue.serverTimestamp(),
        });

        payoutsCreated.push(payoutRef.id);
      } catch (error) {
        console.error(
          `Error creating payout for appointment ${appointmentDoc.id}:`,
          error
        );
        errors.push(
          `Failed to create payout for appointment ${appointmentDoc.id}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      payoutsCreated: payoutsCreated.length,
      payoutIds: payoutsCreated,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error processing payouts:", error);
    return NextResponse.json(
      { error: "Failed to process payouts" },
      { status: 500 }
    );
  }
}
