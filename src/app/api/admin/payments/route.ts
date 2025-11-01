import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

/**
 * GET /api/admin/payments
 * Fetch all payment transactions
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

    // Fetch payments from Firestore
    const paymentsSnapshot = await db
      .collection("payments")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const payments = await Promise.all(
      paymentsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Fetch related appointment data
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
          appointmentId: data.appointmentId || "",
          clientName,
          therapistName,
          amount: data.amount || 0,
          status: data.status || "pending",
          paymentMethod: data.paymentMethod || "card",
          stripePaymentId: data.stripePaymentId || "",
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
      })
    );

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
