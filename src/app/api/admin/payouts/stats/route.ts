import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

/**
 * GET /api/admin/payouts/stats
 * Fetch payout statistics
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

    // Fetch all payouts
    const payoutsSnapshot = await db.collection("payouts").get();

    let totalPayouts = 0;
    let pendingPayouts = 0;
    let completedPayouts = 0;
    let totalPaid = 0;
    let platformRevenue = 0;

    payoutsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalPayouts++;

      if (data.status === "pending") {
        pendingPayouts++;
      } else if (data.status === "completed") {
        completedPayouts++;
        totalPaid += data.netAmount || 0;
      }

      platformRevenue += data.platformFee || 0;
    });

    return NextResponse.json({
      totalPayouts,
      pendingPayouts,
      completedPayouts,
      totalPaid,
      platformRevenue,
    });
  } catch (error) {
    console.error("Error fetching payout stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch payout stats" },
      { status: 500 }
    );
  }
}
