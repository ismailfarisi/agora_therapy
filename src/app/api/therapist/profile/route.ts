import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

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
    
    // Fetch user data from users collection
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    
    // Fetch therapist profile data from therapistProfiles collection
    const therapistProfileDoc = await db
      .collection("therapistProfiles")
      .doc(decodedToken.uid)
      .get();

    let therapistProfileData = null;
    if (therapistProfileDoc.exists) {
      therapistProfileData = therapistProfileDoc.data();
    }

    // Merge both data sources
    const mergedProfile = {
      ...userData,
      therapistProfile: therapistProfileData,
    };

    console.log("🔍 API - User Data:", JSON.stringify(userData, null, 2));
    console.log("🔍 API - Therapist Profile Data:", JSON.stringify(therapistProfileData, null, 2));
    console.log("🔍 API - Merged Profile:", JSON.stringify(mergedProfile, null, 2));
    
    return NextResponse.json({ profile: mergedProfile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const db = getAdminFirestore();

    console.log("📝 Update request body:", JSON.stringify(body, null, 2));

    // Separate fields by collection
    const userFields: any = {};
    const therapistProfileFields: any = {};

    Object.keys(body).forEach((key) => {
      if (key.startsWith("therapistProfile.")) {
        // Extract the nested path for therapistProfiles collection
        const fieldPath = key.replace("therapistProfile.", "");
        therapistProfileFields[fieldPath] = body[key];
      } else {
        // Fields for users collection
        userFields[key] = body[key];
      }
    });

    console.log("👤 User fields to update:", userFields);
    console.log("🩺 Therapist profile fields to update:", therapistProfileFields);

    // Update users collection if there are user fields
    if (Object.keys(userFields).length > 0) {
      await db
        .collection("users")
        .doc(decodedToken.uid)
        .update({
          ...userFields,
          "metadata.updatedAt": FieldValue.serverTimestamp(),
        });
      console.log("✅ Updated users collection");
    }

    // Update therapistProfiles collection if there are therapist fields
    if (Object.keys(therapistProfileFields).length > 0) {
      await db
        .collection("therapistProfiles")
        .doc(decodedToken.uid)
        .update({
          ...therapistProfileFields,
        });
      console.log("✅ Updated therapistProfiles collection");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
