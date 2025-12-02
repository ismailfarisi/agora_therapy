import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

interface AppointmentData {
  id: string;
  clientId: string;
  scheduledFor: Timestamp | Date;
  status: string;
  payment?: {
    amount: number;
  };
  [key: string]: unknown;
}

function toDate(value: Timestamp | Date | null | undefined): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  return (value as Timestamp).toDate();
}

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

    // Get all appointments for this therapist
    const appointmentsSnapshot = await db
      .collection("appointments")
      .where("therapistId", "==", decodedToken.uid)
      .where("status", "in", ["completed", "confirmed", "in_progress"])
      .get();

    // Get unique client IDs
    const clientIds = new Set<string>();
    const appointmentsByClient = new Map<string, AppointmentData[]>();

    appointmentsSnapshot.docs.forEach((doc) => {
      const appointment = { id: doc.id, ...doc.data() } as AppointmentData;
      const clientId = appointment.clientId;
      clientIds.add(clientId);

      if (!appointmentsByClient.has(clientId)) {
        appointmentsByClient.set(clientId, []);
      }
      appointmentsByClient.get(clientId)?.push(appointment);
    });

    // Fetch client details
    const clients = await Promise.all(
      Array.from(clientIds).map(async (clientId) => {
        const userDoc = await db.collection("users").doc(clientId).get();
        const userData = userDoc.data();

        const clientAppointments = appointmentsByClient.get(clientId) || [];
        const completedAppointments = clientAppointments.filter(
          (a) => a.status === "completed"
        );
        const upcomingAppointments = clientAppointments.filter(
          (a) => a.status === "confirmed" || a.status === "in_progress"
        );

        // Calculate total spent
        const totalSpent = completedAppointments.reduce(
          (sum, apt) => sum + (apt.payment?.amount || 0),
          0
        );

        // Get last appointment date
        const lastAppointment = completedAppointments.sort((a, b) => {
          const dateA = toDate(a.scheduledFor);
          const dateB = toDate(b.scheduledFor);
          return dateB.getTime() - dateA.getTime();
        })[0];

        return {
          id: clientId,
          name: userData?.name || "Unknown",
          email: userData?.email || "",
          phone: userData?.phone || "",
          avatar: userData?.avatar || null,
          totalAppointments: clientAppointments.length,
          completedAppointments: completedAppointments.length,
          upcomingAppointments: upcomingAppointments.length,
          totalSpent,
          lastAppointmentDate: lastAppointment?.scheduledFor || null,
          firstAppointmentDate:
            clientAppointments.sort((a, b) => {
              const dateA = toDate(a.scheduledFor);
              const dateB = toDate(b.scheduledFor);
              return dateA.getTime() - dateB.getTime();
            })[0]?.scheduledFor || null,
        };
      })
    );

    // Sort by last appointment date (most recent first)
    clients.sort((a, b) => {
      const dateA = toDate(a.lastAppointmentDate as Timestamp | Date | null);
      const dateB = toDate(b.lastAppointmentDate as Timestamp | Date | null);
      return dateB.getTime() - dateA.getTime();
    });

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
