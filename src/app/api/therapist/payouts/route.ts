import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);

    if (!decodedToken.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminFirestore();

    // Get all payouts for this therapist
    const payoutsSnapshot = await db
      .collection("payouts")
      .where("therapistId", "==", decodedToken.uid)
      .orderBy("metadata.createdAt", "desc")
      .limit(100)
      .get();

    const payouts = payoutsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get all completed appointments for earnings calculation
    const appointmentsSnapshot = await db
      .collection("appointments")
      .where("therapistId", "==", decodedToken.uid)
      .where("status", "==", "completed")
      .where("payment.status", "==", "paid")
      .get();

    const appointments = appointmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate total earnings
    const totalEarnings = appointments.reduce(
      (sum, apt: any) => sum + (apt.payment?.amount || 0),
      0
    );

    // Calculate pending payout (appointments not yet included in a payout)
    const payoutAppointmentIds = new Set(
      payouts.flatMap((p: any) => p.appointments || [])
    );
    const pendingAppointments = appointments.filter(
      (apt) => !payoutAppointmentIds.has(apt.id)
    );
    const pendingAmount = pendingAppointments.reduce(
      (sum, apt: any) => sum + (apt.payment?.amount || 0),
      0
    );

    // Calculate paid out amount
    const paidOutAmount = payouts
      .filter((p: any) => p.status === "completed")
      .reduce((sum, p: any) => sum + (p.amount || 0), 0);

    return NextResponse.json({
      payouts,
      stats: {
        totalEarnings,
        paidOut: paidOutAmount,
        pending: pendingAmount,
        totalAppointments: appointments.length,
        pendingAppointments: pendingAppointments.length,
      },
    });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}
