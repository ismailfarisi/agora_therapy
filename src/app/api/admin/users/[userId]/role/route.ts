import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * PATCH /api/admin/users/[userId]/role
 * Update user role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
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

    // Get request body
    const body = await request.json();
    const { role } = body;

    if (!role || !["client", "therapist", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role value" },
        { status: 400 }
      );
    }

    // Update user role
    const userId = params.userId;
    await db.collection("users").doc(userId).update({
      role,
      "metadata.updatedAt": FieldValue.serverTimestamp(),
    });

    // Update custom claims for role-based access
    await auth.setCustomUserClaims(userId, { role });

    return NextResponse.json({
      success: true,
      message: "User role updated successfully",
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
