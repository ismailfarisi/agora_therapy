import { NextRequest, NextResponse } from "next/server";
import { RtcTokenBuilder, RtcRole } from "agora-token";
import { config, validateAgoraCredentials } from "@/lib/config";
import { getAdminAuth } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 [DEBUG] Token API called:", {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
    });

    // Verify the user is authenticated
    const authHeader = request.headers.get("authorization");
    console.log("🔧 [DEBUG] Authorization header:", {
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.substring(0, 20) + "...",
      startsWithBearer: authHeader?.startsWith("Bearer "),
    });

    if (!authHeader?.startsWith("Bearer ")) {
      console.log("🔧 [DEBUG] Missing or invalid authorization header");
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];
    console.log("🔧 [DEBUG] Extracted ID token:", {
      tokenLength: idToken.length,
      tokenPrefix: idToken.substring(0, 20) + "...",
      isPlaceholder: idToken === "firebase_token_placeholder",
    });

    let decodedToken;

    try {
      decodedToken = await getAdminAuth().verifyIdToken(idToken);
      console.log("🔧 [DEBUG] Token verification successful:", {
        uid: decodedToken.uid,
        email: decodedToken.email,
        iss: decodedToken.iss,
        aud: decodedToken.aud,
        exp: decodedToken.exp,
        iat: decodedToken.iat,
      });
    } catch (error) {
      console.error("🔧 [DEBUG] Token verification failed:", {
        error: error instanceof Error ? error.message : String(error),
        errorCode:
          error && typeof error === "object" && "code" in error
            ? (error as { code: string }).code
            : "unknown",
        idToken: idToken.substring(0, 20) + "...",
        tokenLength: idToken.length,
      });
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const { channelName, uid, role = "publisher" } = await request.json();

    // Validate that the requesting user matches the uid in the request
    if (decodedToken.uid !== uid) {
      console.error("🔧 [DEBUG] UID mismatch:", {
        tokenUid: decodedToken.uid,
        requestedUid: uid,
      });
      return NextResponse.json(
        { error: "User ID mismatch - token does not match requested uid" },
        { status: 403 }
      );
    }
    console.log("🔧 [DEBUG] Request parameters:", {
      channelName,
      uid,
      role,
    });

    if (!channelName || !uid) {
      console.log("🔧 [DEBUG] Missing required parameters");
      return NextResponse.json(
        { error: "Missing required parameters: channelName and uid" },
        { status: 400 }
      );
    }

    // Validate channel name format (should be therapy_session_{appointmentId})
    if (!channelName.startsWith("therapy_session_")) {
      console.log("🔧 [DEBUG] Invalid channel name format:", channelName);
      return NextResponse.json(
        { error: "Invalid channel name format" },
        { status: 400 }
      );
    }

    const appointmentId = channelName.replace("therapy_session_", "");
    console.log("🔧 [DEBUG] Extracted appointment ID:", appointmentId);

    // TODO: Add more sophisticated permission checking
    // - Verify user has permission to join this specific appointment
    // - Check if appointment is scheduled and active
    // - Validate user role (therapist/client) matches appointment

    const userRole =
      role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    // Token expires in 1 hour by default
    const expirationTime =
      Math.floor(Date.now() / 1000) + config.agora.tempTokenExpiry;

    console.log("🔧 [DEBUG] Agora configuration:", {
      appId: config.agora.appId,
      hasAppCertificate: !!config.agora.appCertificate,
      appCertificateLength: config.agora.appCertificate?.length,
      tempTokenExpiry: config.agora.tempTokenExpiry,
      expirationTime,
      isPlaceholderAppId: config.agora.isPlaceholderAppId,
      isPlaceholderCertificate: config.agora.isPlaceholderCertificate,
    });

    // Validate Agora credentials before generating token
    try {
      validateAgoraCredentials();
    } catch (error) {
      console.error("🔧 [DEBUG] Agora credential validation failed:", error);
      return NextResponse.json(
        {
          error: "Invalid Agora configuration",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }

    console.log("🔧 [DEBUG] Building token with parameters:", {
      appId: config.agora.appId,
      channelName,
      uid,
      uidAsNumber: parseInt(uid),
      userRole,
      expirationTime,
    });

    const token = RtcTokenBuilder.buildTokenWithUid(
      config.agora.appId,
      config.agora.appCertificate,
      channelName,
      uid,
      userRole,
      expirationTime,
      expirationTime
    );

    console.log("🔧 [DEBUG] Token generated successfully:", {
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20) + "...",
      expirationTime,
    });

    return NextResponse.json({
      token,
      expirationTime,
      channelName,
      uid,
    });
  } catch (error) {
    console.error("🔧 [DEBUG] Error generating Agora token:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
