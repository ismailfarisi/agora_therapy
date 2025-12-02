import { NextRequest, NextResponse } from "next/server";
import { RtcTokenBuilder, RtcRole } from "agora-token";

const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelName, userId } = body;

    console.log("🔑 Token generation request:", { channelName, userId });

    if (!channelName || !userId) {
      return NextResponse.json(
        { error: "Missing channelName or userId" },
        { status: 400 }
      );
    }

    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
      console.error("❌ Missing Agora credentials");
      console.log("App ID present:", !!AGORA_APP_ID);
      console.log("Certificate present:", !!AGORA_APP_CERTIFICATE);
      return NextResponse.json(
        { error: "Agora credentials not configured" },
        { status: 500 }
      );
    }

    // Token expires in 24 hours
    const expirationTimeInSeconds = 86400;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Convert userId to a valid UID (must be a positive 32-bit unsigned integer)
    // Use 0 for string-based user IDs (Agora will handle it)
    const uid = 0;

    console.log("🔧 Token parameters:", {
      appId: AGORA_APP_ID,
      channelName,
      uid,
      currentTimestamp,
      privilegeExpiredTs,
    });

    // Build the token
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs,
      privilegeExpiredTs
    );

    console.log("✅ Token generated successfully");

    return NextResponse.json({
      token,
      appId: AGORA_APP_ID,
      channelName,
      uid,
      expiresAt: privilegeExpiredTs,
    });
  } catch (error) {
    console.error("❌ Error generating Agora token:", error);
    return NextResponse.json(
      { error: "Failed to generate token", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
