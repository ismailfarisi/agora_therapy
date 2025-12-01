import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * POST /api/admin/therapists/[therapistId]/reject
 * Reject a therapist application
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ therapistId: string }> }
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

    const { therapistId } = await context.params;

    // Check if therapist profile exists
    const therapistProfileDoc = await db
      .collection("therapistProfiles")
      .doc(therapistId)
      .get();

    if (!therapistProfileDoc.exists) {
      return NextResponse.json(
        { error: "Therapist profile not found. Please ensure the therapist has completed onboarding." },
        { status: 404 }
      );
    }

    // Update therapist verification status to rejected in therapistProfiles collection
    await db.collection("therapistProfiles").doc(therapistId).update({
      "verification.isVerified": false,
      "verification.rejectedAt": FieldValue.serverTimestamp(),
      "verification.rejectedBy": decodedToken.uid,
    });

    // Suspend the user account
    await db.collection("users").doc(therapistId).update({
      status: "suspended",
      "metadata.updatedAt": FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: "Therapist application rejected",
    });
  } catch (error) {
    console.error("Error rejecting therapist:", error);
    return NextResponse.json(
      { error: "Failed to reject therapist" },
      { status: 500 }
    );
  }
}
