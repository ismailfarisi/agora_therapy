import { NextResponse } from "next/server";
import { AVAILABLE_SERVICES, SERVICE_CATEGORIES } from "@/types/models/service";

/**
 * Public API to fetch available therapy services/specializations
 * No authentication required - this is public data
 */
export async function GET() {
  try {
    // Only return active services
    const activeServices = AVAILABLE_SERVICES.filter(service => service.isActive);

    return NextResponse.json({
      services: activeServices,
      categories: SERVICE_CATEGORIES,
      total: activeServices.length,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
