import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";

/**
 * Public API to fetch verified therapists for the psychologists directory
 * No authentication required - this is public data
 */
export async function GET(request: NextRequest) {
  try {
    const db = getAdminFirestore();
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const specialization = searchParams.get('specialization');
    const language = searchParams.get('language');
    const minExperience = searchParams.get('minExperience');
    const featured = searchParams.get('featured') === 'true';

    // Fetch all active users with therapist role
    let usersQuery = db
      .collection("users")
      .where("role", "==", "therapist")
      .where("status", "==", "active");

    const usersSnapshot = await usersQuery.get();

    // Fetch therapist profiles and filter by verification status
    const therapists = await Promise.all(
      usersSnapshot.docs.map(async (doc) => {
        const userData = doc.data();
        
        // Fetch therapist profile
        const therapistProfileDoc = await db
          .collection("therapistProfiles")
          .doc(doc.id)
          .get();

        if (!therapistProfileDoc.exists) {
          return null;
        }

        const profileData = therapistProfileDoc.data();

        // Only include verified therapists
        if (!profileData?.verification?.isVerified) {
          return null;
        }

        // Apply filters
        if (featured && !profileData.isFeatured) {
          return null;
        }

        if (specialization && !profileData.credentials?.specializations?.includes(specialization)) {
          return null;
        }

        if (language && !profileData.practice?.languages?.includes(language)) {
          return null;
        }

        if (minExperience && (profileData.practice?.yearsExperience || 0) < parseInt(minExperience)) {
          return null;
        }

        // Normalize hourly rate (handle both old dollar and new cents format)
        const rawRate = profileData.practice?.hourlyRate || 0;
        const normalizedRate = rawRate < 1000 ? rawRate * 100 : rawRate;

        return {
          id: doc.id,
          name: userData.profile?.displayName || `${userData.profile?.firstName} ${userData.profile?.lastName}`.trim(),
          title: profileData.credentials?.licenseNumber 
            ? `Licensed Therapist - ${profileData.credentials.licenseState || ''}`
            : 'Therapist',
          image: userData.profile?.avatarUrl || '/images/default-avatar.png',
          languages: profileData.practice?.languages || [],
          specializations: profileData.credentials?.specializations || [],
          experience: profileData.practice?.yearsExperience || 0,
          bio: profileData.practice?.bio || '',
          hourlyRate: normalizedRate,
          rating: 5.0, // TODO: Calculate from reviews
          reviewCount: 0, // TODO: Get from reviews collection
          isVerified: true,
          isFeatured: profileData.isFeatured || false,
          verifiedAt: profileData.verification?.verifiedAt,
        };
      })
    );

    // Filter out null values (unverified or filtered out therapists)
    const verifiedTherapists = therapists.filter((t) => t !== null);

    return NextResponse.json({
      therapists: verifiedTherapists,
      total: verifiedTherapists.length,
    });
  } catch (error) {
    console.error("Error fetching public therapists:", error);
    return NextResponse.json(
      { error: "Failed to fetch therapists" },
      { status: 500 }
    );
  }
}
