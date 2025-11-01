import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

/**
 * GET /api/admin/users/stats
 * Fetch user statistics
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

    // Fetch all users
    const usersSnapshot = await db.collection("users").get();

    let totalUsers = 0;
    let activeUsers = 0;
    let clients = 0;
    let therapists = 0;
    let admins = 0;

    usersSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalUsers++;

      if (data.status === "active") {
        activeUsers++;
      }

      switch (data.role) {
        case "client":
          clients++;
          break;
        case "therapist":
          therapists++;
          break;
        case "admin":
          admins++;
          break;
      }
    });

    return NextResponse.json({
      totalUsers,
      activeUsers,
      clients,
      therapists,
      admins,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
