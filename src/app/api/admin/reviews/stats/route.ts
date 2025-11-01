import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

/**
 * GET /api/admin/reviews/stats
 * Fetch review statistics
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

    // Fetch all reviews
    const reviewsSnapshot = await db.collection("reviews").get();

    let totalReviews = 0;
    let pendingReviews = 0;
    let approvedReviews = 0;
    let flaggedReviews = 0;
    let totalRating = 0;

    reviewsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalReviews++;
      totalRating += data.rating || 0;

      if (data.status === "pending") {
        pendingReviews++;
      } else if (data.status === "approved") {
        approvedReviews++;
      } else if (data.status === "flagged") {
        flaggedReviews++;
      }
    });

    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    return NextResponse.json({
      totalReviews,
      pendingReviews,
      approvedReviews,
      flaggedReviews,
      averageRating,
    });
  } catch (error) {
    console.error("Error fetching review stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch review stats" },
      { status: 500 }
    );
  }
}
