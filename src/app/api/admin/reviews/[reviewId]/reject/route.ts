import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * POST /api/admin/reviews/[reviewId]/reject
 * Reject a review
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
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

    const reviewId = params.reviewId;

    // Update review status
    await db.collection("reviews").doc(reviewId).update({
      status: "rejected",
      isPublic: false,
      moderatedBy: decodedToken.uid,
      moderatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: "Review rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting review:", error);
    return NextResponse.json(
      { error: "Failed to reject review" },
      { status: 500 }
    );
  }
}
