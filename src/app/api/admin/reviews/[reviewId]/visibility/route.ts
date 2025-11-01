import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * PATCH /api/admin/reviews/[reviewId]/visibility
 * Toggle review visibility
 */
export async function PATCH(
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
    const body = await request.json();
    const { isPublic } = body;

    // Update review visibility
    await db.collection("reviews").doc(reviewId).update({
      isPublic,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: `Review ${isPublic ? "shown" : "hidden"} successfully`,
    });
  } catch (error) {
    console.error("Error toggling review visibility:", error);
    return NextResponse.json(
      { error: "Failed to toggle review visibility" },
      { status: 500 }
    );
  }
}
