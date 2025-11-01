import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

/**
 * GET /api/admin/refunds/stats
 * Fetch refund statistics
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

    // Fetch all refunds
    const refundsSnapshot = await db.collection("refunds").get();

    let totalRefunds = 0;
    let pendingRefunds = 0;
    let completedRefunds = 0;
    let totalRefunded = 0;

    refundsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalRefunds++;

      if (data.status === "pending") {
        pendingRefunds++;
      } else if (data.status === "completed") {
        completedRefunds++;
        totalRefunded += data.amount || 0;
      }
    });

    return NextResponse.json({
      totalRefunds,
      pendingRefunds,
      completedRefunds,
      totalRefunded,
    });
  } catch (error) {
    console.error("Error fetching refund stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch refund stats" },
      { status: 500 }
    );
  }
}
