import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

/**
 * GET /api/admin/payouts
 * Fetch all payouts
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

    // Fetch payouts from Firestore
    const payoutsSnapshot = await db
      .collection("payouts")
      .orderBy("scheduledDate", "desc")
      .limit(100)
      .get();

    const payouts = await Promise.all(
      payoutsSnapshot.docs.map(async (doc) => {
        const data = doc.data();

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
          therapistId: data.therapistId || "",
          therapistName,
          appointmentId: data.appointmentId || "",
          paymentId: data.paymentId || "",
          amount: data.amount || 0,
          platformFee: data.platformFee || 0,
          netAmount: data.netAmount || 0,
          status: data.status || "pending",
          scheduledDate:
            data.scheduledDate?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
          completedDate: data.completedDate?.toDate?.()?.toISOString(),
          stripePayoutId: data.stripePayoutId || "",
          createdAt:
            data.createdAt?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
        };
      })
    );

    return NextResponse.json({ payouts });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}
