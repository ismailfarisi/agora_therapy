import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const db = getAdminFirestore();

    // Get therapist profile
    const therapistProfileDoc = await db
      .collection("therapistProfiles")
      .doc(id)
      .get();

    if (!therapistProfileDoc.exists) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    const therapistProfileData = therapistProfileDoc.data();

    // Check if therapist is verified
    if (!therapistProfileData?.verification?.isVerified) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    // Get user data for name and photo
    const userDoc = await db.collection("users").doc(id).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    // Normalize hourly rate (handle both old dollar format and new cents format)
    let hourlyRate = therapistProfileData.practice?.hourlyRate || 0;
    if (hourlyRate < 1000) {
      // Likely in dollars, convert to cents
      hourlyRate = hourlyRate * 100;
    }

    // Build therapist public view
    const therapist = {
      id: therapistProfileDoc.id,
      name: userData.profile?.displayName || `${userData.profile?.firstName} ${userData.profile?.lastName}`,
      title: therapistProfileData.credentials?.specializations?.[0] || "Therapist",
      image: userData.profile?.avatarUrl || therapistProfileData.photoURL || "/images/default-avatar.png",
      languages: therapistProfileData.practice?.languages || [],
      specializations: therapistProfileData.credentials?.specializations || [],
      experience: therapistProfileData.practice?.yearsExperience || 0,
      bio: therapistProfileData.practice?.bio || "",
      hourlyRate: hourlyRate,
      rating: undefined, // TODO: Calculate from reviews
      reviewCount: undefined, // TODO: Count from reviews
      isVerified: therapistProfileData.verification?.isVerified || false,
      isFeatured: therapistProfileData.isFeatured || false,
    };

    return NextResponse.json(therapist);
  } catch (error) {
    console.error("Error fetching therapist:", error);
    return NextResponse.json(
      { error: "Failed to fetch therapist" },
      { status: 500 }
    );
  }
}
