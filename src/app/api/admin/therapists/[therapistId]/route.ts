import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

/**
 * GET /api/admin/therapists/[therapistId]
 * Fetch a specific therapist's details
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ therapistId: string }> }
) {
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

    const { therapistId } = await context.params;

    // Fetch user data
    const therapistDoc = await db.collection("users").doc(therapistId).get();
    
    if (!therapistDoc.exists) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    const therapistData = therapistDoc.data();

    // Fetch therapist profile from therapistProfiles collection
    const therapistProfileDoc = await db
      .collection("therapistProfiles")
      .doc(therapistId)
      .get();

    const therapistProfileData = therapistProfileDoc.exists
      ? therapistProfileDoc.data()
      : null;

    const therapist = {
      id: therapistDoc.id,
      email: therapistData?.email || "",
      profile: {
        displayName: therapistData?.profile?.displayName || "",
        firstName: therapistData?.profile?.firstName || "",
        lastName: therapistData?.profile?.lastName || "",
        phoneNumber: therapistData?.profile?.phoneNumber || "",
        avatarUrl: therapistData?.profile?.avatarUrl || "",
      },
      therapistProfile: therapistProfileData
        ? {
            services: therapistProfileData.services || [],
            credentials: {
              licenseNumber:
                therapistProfileData.credentials?.licenseNumber || "",
              licenseState:
                therapistProfileData.credentials?.licenseState || "",
              licenseExpiry: therapistProfileData.credentials?.licenseExpiry
                ?.toDate?.()
                ?.toISOString(),
              specializations:
                therapistProfileData.credentials?.specializations || [],
              certifications:
                therapistProfileData.credentials?.certifications || [],
            },
            practice: {
              bio: therapistProfileData.practice?.bio || "",
              yearsExperience:
                therapistProfileData.practice?.yearsExperience || 0,
              sessionTypes: therapistProfileData.practice?.sessionTypes || [],
              languages: therapistProfileData.practice?.languages || [],
              hourlyRate: therapistProfileData.practice?.hourlyRate || 0,
              currency: therapistProfileData.practice?.currency || "USD",
            },
            availability: {
              timezone: therapistProfileData.availability?.timezone || "UTC",
              bufferMinutes:
                therapistProfileData.availability?.bufferMinutes || 15,
              maxDailyHours:
                therapistProfileData.availability?.maxDailyHours || 8,
              advanceBookingDays:
                therapistProfileData.availability?.advanceBookingDays || 30,
            },
            verification: {
              isVerified:
                therapistProfileData.verification?.isVerified || false,
              verifiedAt: therapistProfileData.verification?.verifiedAt
                ?.toDate?.()
                ?.toISOString(),
              verifiedBy: therapistProfileData.verification?.verifiedBy,
            },
          }
        : undefined,
      status: therapistData?.status || "active",
      metadata: {
        createdAt:
          therapistData?.metadata?.createdAt?.toDate?.()?.toISOString() ||
          new Date().toISOString(),
        lastLoginAt:
          therapistData?.metadata?.lastLoginAt?.toDate?.()?.toISOString() ||
          new Date().toISOString(),
      },
    };

    return NextResponse.json({ therapist });
  } catch (error) {
    console.error("Error fetching therapist:", error);
    return NextResponse.json(
      { error: "Failed to fetch therapist" },
      { status: 500 }
    );
  }
}
