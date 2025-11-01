import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

/**
 * GET /api/admin/payments/stats
 * Fetch payment statistics
 */
export async function GET(request: NextRequest) {
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

    // Fetch all payments
    const paymentsSnapshot = await db.collection("payments").get();

    let totalRevenue = 0;
    let successfulPayments = 0;
    let failedPayments = 0;
    let refundedAmount = 0;

    paymentsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const amount = data.amount || 0;

      if (data.status === "succeeded") {
        totalRevenue += amount;
        successfulPayments++;
      } else if (data.status === "failed") {
        failedPayments++;
      } else if (data.status === "refunded") {
        refundedAmount += amount;
      }
    });

    return NextResponse.json({
      totalRevenue,
      totalTransactions: paymentsSnapshot.size,
      successfulPayments,
      failedPayments,
      refundedAmount,
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment stats" },
      { status: 500 }
    );
  }
}
