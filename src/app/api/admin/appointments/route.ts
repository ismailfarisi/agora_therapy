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

    // Get user to verify admin role
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const therapistId = searchParams.get("therapistId");
    const clientId = searchParams.get("clientId");

    // Build query
    let query = db.collection("appointments").orderBy("scheduledFor", "desc");

    if (status) {
      query = query.where("status", "==", status) as any;
    }
    if (therapistId) {
      query = query.where("therapistId", "==", therapistId) as any;
    }
    if (clientId) {
      query = query.where("clientId", "==", clientId) as any;
    }

    const appointmentsSnapshot = await query.limit(100).get();

    const appointments = await Promise.all(
      appointmentsSnapshot.docs.map(async (doc) => {
        const data = doc.data();

        // Get client and therapist details
        const [clientDoc, therapistDoc] = await Promise.all([
          db.collection("users").doc(data.clientId).get(),
          db.collection("users").doc(data.therapistId).get(),
        ]);

        const clientData = clientDoc.data();
        const therapistData = therapistDoc.data();

        return {
          id: doc.id,
          ...data,
          scheduledFor: data.scheduledFor.toDate().toISOString(),
          client: {
            id: data.clientId,
            name: clientData?.profile?.displayName || "Client",
            email: clientData?.email || "",
            image: clientData?.profile?.avatarUrl || "/images/default-avatar.png",
          },
          therapist: {
            id: data.therapistId,
            name: therapistData?.profile?.displayName || "Therapist",
            email: therapistData?.email || "",
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

    return NextResponse.json({ appointments, total: appointments.length });
  } catch (error) {
    console.error("Error fetching admin appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
