import { NextRequest, NextResponse } from "next/server";
import { RtcTokenBuilder, RtcRole } from "agora-token";
import { config } from "@/lib/config";
import { getAdminAuth } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];
    let decodedToken;

    try {
      decodedToken = await getAdminAuth().verifyIdToken(idToken);
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const { channelName, uid, role = "publisher" } = await request.json();

    if (!channelName || !uid) {
      return NextResponse.json(
        { error: "Missing required parameters: channelName and uid" },
        { status: 400 }
      );
    }

    // Validate channel name format (should be therapy_session_{appointmentId})
    if (!channelName.startsWith("therapy_session_")) {
      return NextResponse.json(
        { error: "Invalid channel name format" },
        { status: 400 }
      );
    }

    const appointmentId = channelName.replace("therapy_session_", "");

    // TODO: Add more sophisticated permission checking
    // - Verify user has permission to join this specific appointment
    // - Check if appointment is scheduled and active
    // - Validate user role (therapist/client) matches appointment

    const userRole =
      role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    // Token expires in 1 hour by default
    const expirationTime =
      Math.floor(Date.now() / 1000) + config.agora.tempTokenExpiry;

    const token = RtcTokenBuilder.buildTokenWithUid(
      config.agora.appId,
      config.agora.appCertificate,
      channelName,
      parseInt(uid),
      userRole,
      expirationTime,
      expirationTime
    );

    return NextResponse.json({
      token,
      expirationTime,
      channelName,
      uid,
    });
  } catch (error) {
    console.error("Error generating Agora token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
