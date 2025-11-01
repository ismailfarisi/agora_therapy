import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * GET /api/admin/settings
 * Fetch platform settings
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

    // Fetch settings from Firestore
    const settingsDoc = await db.collection("platform").doc("settings").get();

    if (!settingsDoc.exists) {
      // Return default settings if none exist
      return NextResponse.json({
        settings: {
          supportEmail: "",
          supportPhone: "",
          businessHours: "",
          platformName: "MindGood",
          platformCommission: 10,
          payoutScheduleDays: 4,
          currency: "USD",
          timezone: "UTC",
          termsOfService: "",
          privacyPolicy: "",
          refundPolicy: "",
          cancellationPolicy: "",
          enableVideoSessions: true,
          enableReviews: true,
          enableNewRegistrations: true,
          maintenanceMode: false,
          emailNotifications: true,
          smsNotifications: false,
          adminNotifications: true,
        },
      });
    }

    return NextResponse.json({ settings: settingsDoc.data() });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 * Update platform settings
 */
export async function PUT(request: NextRequest) {
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

    // Get settings from request body
    const settings = await request.json();

    // Validate required fields
    if (!settings.supportEmail || !settings.supportPhone) {
      return NextResponse.json(
        { error: "Support email and phone are required" },
        { status: 400 }
      );
    }

    // Validate commission rate
    if (
      settings.platformCommission < 0 ||
      settings.platformCommission > 100
    ) {
      return NextResponse.json(
        { error: "Commission rate must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Update settings in Firestore
    await db
      .collection("platform")
      .doc("settings")
      .set(
        {
          ...settings,
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: decodedToken.uid,
        },
        { merge: true }
      );

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
