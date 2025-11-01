import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

/**
 * GET /api/admin/reviews
 * Fetch all reviews
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

    // Fetch reviews from Firestore
    const reviewsSnapshot = await db
      .collection("reviews")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const reviews = await Promise.all(
      reviewsSnapshot.docs.map(async (doc) => {
        const data = doc.data();

        // Fetch client name
        let clientName = "Unknown";
        if (data.clientId) {
          const clientDoc = await db.collection("users").doc(data.clientId).get();
          if (clientDoc.exists) {
            const clientData = clientDoc.data();
            clientName = clientData?.profile?.displayName || "Unknown";
          }
        }

        // Fetch therapist name
        let therapistName = "Unknown";
        if (data.therapistId) {
          const therapistDoc = await db
            .collection("users")
            .doc(data.therapistId)
            .get();
          if (therapistDoc.exists) {
            const therapistData = therapistDoc.data();
            therapistName = therapistData?.profile?.displayName || "Unknown";
          }
        }

        return {
          id: doc.id,
          appointmentId: data.appointmentId || "",
          clientId: data.clientId || "",
          clientName,
          therapistId: data.therapistId || "",
          therapistName,
          rating: data.rating || 0,
          comment: data.comment || "",
          status: data.status || "pending",
          isPublic: data.isPublic !== undefined ? data.isPublic : false,
          createdAt:
            data.createdAt?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
          moderatedBy: data.moderatedBy || "",
          moderatedAt: data.moderatedAt?.toDate?.()?.toISOString(),
        };
      })
    );

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
