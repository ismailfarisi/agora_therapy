import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { AVAILABLE_SERVICES, getServiceById } from "@/types/models/service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");

    const db = getAdminFirestore();

    if (serviceId) {
      // Get specific service with therapists
      const service = getServiceById(serviceId);
      if (!service) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }

      // Get therapists offering this service
      const therapistsSnapshot = await db
        .collection("therapistProfiles")
        .where("services", "array-contains", serviceId)
        .where("verification.isVerified", "==", true)
        .get();

      const therapists = [];
      for (const doc of therapistsSnapshot.docs) {
        const therapistData = doc.data();
        
        // Get user data for name and photo
        const userDoc = await db.collection("users").doc(doc.id).get();
        const userData = userDoc.data();

        therapists.push({
          id: doc.id,
          name: userData?.profile?.displayName || "Therapist",
          photoURL: therapistData.photoURL || userData?.profile?.avatarUrl,
          bio: therapistData.practice?.bio,
          yearsExperience: therapistData.practice?.yearsExperience,
          hourlyRate: therapistData.practice?.hourlyRate,
          languages: therapistData.practice?.languages || [],
          sessionTypes: therapistData.practice?.sessionTypes || [],
        });
      }

      return NextResponse.json({
        service,
        therapists,
        count: therapists.length,
      });
    } else {
      // Get all services with therapist counts
      const servicesWithCounts = await Promise.all(
        AVAILABLE_SERVICES.map(async (service) => {
          const snapshot = await db
            .collection("therapistProfiles")
            .where("services", "array-contains", service.id)
            .where("verification.isVerified", "==", true)
            .get();

          return {
            ...service,
            therapistCount: snapshot.size,
          };
        })
      );

      // Group by category
      const groupedServices = servicesWithCounts.reduce((acc, service) => {
        if (!acc[service.category]) {
          acc[service.category] = [];
        }
        acc[service.category].push(service);
        return acc;
      }, {} as Record<string, typeof servicesWithCounts>);

      return NextResponse.json({
        services: servicesWithCounts,
        grouped: groupedServices,
      });
    }
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
