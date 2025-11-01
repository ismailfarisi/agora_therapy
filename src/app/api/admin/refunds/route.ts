import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

/**
 * GET /api/admin/refunds
 * Fetch all refunds
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

    // Fetch refunds from Firestore
    const refundsSnapshot = await db
      .collection("refunds")
      .orderBy("requestedAt", "desc")
      .limit(100)
      .get();

    const refunds = await Promise.all(
      refundsSnapshot.docs.map(async (doc) => {
        const data = doc.data();

        // Fetch client and therapist names
        let clientName = "Unknown";
        let therapistName = "Unknown";

        if (data.appointmentId) {
          const appointmentDoc = await db
            .collection("appointments")
            .doc(data.appointmentId)
            .get();

          if (appointmentDoc.exists) {
            const appointmentData = appointmentDoc.data();

            // Fetch client name
            if (appointmentData?.clientId) {
              const clientDoc = await db
                .collection("users")
                .doc(appointmentData.clientId)
                .get();
              if (clientDoc.exists) {
                const clientData = clientDoc.data();
                clientName = clientData?.profile?.displayName || "Unknown";
              }
            }

            // Fetch therapist name
            if (appointmentData?.therapistId) {
              const therapistDoc = await db
                .collection("users")
                .doc(appointmentData.therapistId)
                .get();
              if (therapistDoc.exists) {
                const therapistData = therapistDoc.data();
                therapistName = therapistData?.profile?.displayName || "Unknown";
              }
            }
          }
        }

        return {
          id: doc.id,
          paymentId: data.paymentId || "",
          appointmentId: data.appointmentId || "",
          clientName,
          therapistName,
          amount: data.amount || 0,
          reason: data.reason || "",
          status: data.status || "pending",
          requestedBy: data.requestedBy || "",
          requestedAt:
            data.requestedAt?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
          processedAt: data.processedAt?.toDate?.()?.toISOString(),
          stripeRefundId: data.stripeRefundId || "",
        };
      })
    );

    return NextResponse.json({ refunds });
  } catch (error) {
    console.error("Error fetching refunds:", error);
    return NextResponse.json(
      { error: "Failed to fetch refunds" },
      { status: 500 }
    );
  }
}
