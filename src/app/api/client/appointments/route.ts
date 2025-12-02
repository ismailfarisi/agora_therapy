import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = getAdminAuth();
    const db = getAdminFirestore();
    const decodedToken = await auth.verifyIdToken(token);
    const clientId = decodedToken.uid;

    // Get user to verify role
    const userDoc = await db.collection("users").doc(clientId).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== "client") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch appointments for this client
    const appointmentsSnapshot = await db
      .collection("appointments")
      .where("clientId", "==", clientId)
      .orderBy("scheduledFor", "desc")
      .get();

    const appointments = await Promise.all(
      appointmentsSnapshot.docs.map(async (doc) => {
        const data = doc.data();

        // Get therapist details
        const therapistDoc = await db
          .collection("users")
          .doc(data.therapistId)
          .get();
        const therapistData = therapistDoc.data();

        return {
          id: doc.id,
          ...data,
          scheduledFor: data.scheduledFor.toDate().toISOString(),
          therapist: {
            id: data.therapistId,
            name: therapistData?.profile?.displayName || "Therapist",
            image: therapistData?.profile?.avatarUrl || "/images/default-avatar.png",
          },
          metadata: {
            ...data.metadata,
            createdAt: data.metadata?.createdAt?.toDate?.()?.toISOString(),
            updatedAt: data.metadata?.updatedAt?.toDate?.()?.toISOString(),
            confirmedAt: data.metadata?.confirmedAt?.toDate?.()?.toISOString(),
            completedAt: data.metadata?.completedAt?.toDate?.()?.toISOString(),
            cancelledAt: data.metadata?.cancelledAt?.toDate?.()?.toISOString(),
          },
        };
      })
    );

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error fetching client appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
