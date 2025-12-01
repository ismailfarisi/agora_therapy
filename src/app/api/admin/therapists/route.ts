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

    // Fetch therapist profiles for all therapists
    const therapists = await Promise.all(
      therapistsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Fetch therapist profile from therapistProfiles collection
        const therapistProfileDoc = await db
          .collection("therapistProfiles")
          .doc(doc.id)
          .get();
        
        const therapistProfileData = therapistProfileDoc.exists
          ? therapistProfileDoc.data()
          : null;

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
          therapistProfile: therapistProfileData
            ? {
                services: therapistProfileData.services || [],
                credentials: {
                  licenseNumber: therapistProfileData.credentials?.licenseNumber || "",
                  licenseState: therapistProfileData.credentials?.licenseState || "",
                  licenseExpiry: therapistProfileData.credentials?.licenseExpiry
                    ?.toDate?.()
                    ?.toISOString(),
                  specializations: therapistProfileData.credentials?.specializations || [],
                  certifications: therapistProfileData.credentials?.certifications || [],
                },
                practice: {
                  bio: therapistProfileData.practice?.bio || "",
                  yearsExperience: therapistProfileData.practice?.yearsExperience || 0,
                  sessionTypes: therapistProfileData.practice?.sessionTypes || [],
                  hourlyRate: therapistProfileData.practice?.hourlyRate || 0,
                  languages: therapistProfileData.practice?.languages || [],
                  currency: therapistProfileData.practice?.currency || "USD",
                },
                availability: {
                  timezone: therapistProfileData.availability?.timezone || "UTC",
                  bufferMinutes: therapistProfileData.availability?.bufferMinutes || 15,
                  maxDailyHours: therapistProfileData.availability?.maxDailyHours || 8,
                  advanceBookingDays: therapistProfileData.availability?.advanceBookingDays || 30,
                },
                verification: {
                  isVerified: therapistProfileData.verification?.isVerified || false,
                  verifiedAt: therapistProfileData.verification?.verifiedAt
                    ?.toDate?.()
                    ?.toISOString(),
                  verifiedBy: therapistProfileData.verification?.verifiedBy,
                },
              }
            : {
                services: [],
                credentials: {
                  licenseNumber: "",
                  licenseState: "",
                  specializations: [],
                  certifications: [],
                },
                practice: {
                  bio: "",
                  yearsExperience: 0,
                  sessionTypes: [],
                  hourlyRate: 0,
                  languages: [],
                  currency: "USD",
                },
                availability: {
                  timezone: "UTC",
                  bufferMinutes: 15,
                  maxDailyHours: 8,
                  advanceBookingDays: 30,
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
      })
    );

    return NextResponse.json({ therapists });
  } catch (error) {
    console.error("Error fetching therapists:", error);
    return NextResponse.json(
      { error: "Failed to fetch therapists" },
      { status: 500 }
    );
  }
}
