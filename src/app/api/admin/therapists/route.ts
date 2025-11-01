import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

/**
 * GET /api/admin/therapists
 * Fetch all therapists
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

    // Fetch all users with therapist role
    const therapistsSnapshot = await db
      .collection("users")
      .where("role", "==", "therapist")
      .get();

    const therapists = therapistsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || "",
        profile: {
          displayName: data.profile?.displayName || "",
          firstName: data.profile?.firstName || "",
          lastName: data.profile?.lastName || "",
          phoneNumber: data.profile?.phoneNumber || "",
          avatarUrl: data.profile?.avatarUrl || "",
        },
        therapistProfile: data.therapistProfile || {
          credentials: {
            licenseNumber: "",
            specializations: [],
          },
          practice: {
            yearsExperience: 0,
            hourlyRate: 0,
            languages: [],
          },
          verification: {
            isVerified: false,
          },
        },
        status: data.status || "active",
        metadata: {
          createdAt: data.metadata?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          lastLoginAt: data.metadata?.lastLoginAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        },
      };
    });

    return NextResponse.json({ therapists });
  } catch (error) {
    console.error("Error fetching therapists:", error);
    return NextResponse.json(
      { error: "Failed to fetch therapists" },
      { status: 500 }
    );
  }
}
