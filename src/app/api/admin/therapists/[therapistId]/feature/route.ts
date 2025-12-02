import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

/**
 * Toggle featured status for a therapist
 * Admin only
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ therapistId: string }> }
) {
  const { therapistId } = await context.params;
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

    const { therapistId } = await context.params;
    const body = await request.json();
    const { isFeatured } = body;

    if (typeof isFeatured !== "boolean") {
      return NextResponse.json(
        { error: "isFeatured must be a boolean" },
        { status: 400 }
      );
    }

    // Check if therapist profile exists
    const therapistProfileDoc = await db
      .collection("therapistProfiles")
      .doc(therapistId)
      .get();

    if (!therapistProfileDoc.exists) {
      return NextResponse.json(
        { error: "Therapist profile not found" },
        { status: 404 }
      );
    }

    const profileData = therapistProfileDoc.data();

    // Only allow featuring verified therapists
    if (isFeatured && !profileData?.verification?.isVerified) {
      return NextResponse.json(
        { error: "Only verified therapists can be featured" },
        { status: 400 }
      );
    }

    // Update featured status
    await db.collection("therapistProfiles").doc(therapistId).update({
      isFeatured: isFeatured,
    });

    return NextResponse.json({
      success: true,
      message: `Therapist ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
    });
  } catch (error) {
    console.error("Error toggling featured status:", error);
    return NextResponse.json(
      { error: "Failed to update featured status" },
      { status: 500 }
    );
  }
}
