/**
 * Agora Video Service
 * Handles video session management, token generation, and media controls
 */

import type {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  ILocalTrack,
} from "agora-rtc-sdk-ng";
import { config } from "@/lib/config";

// Dynamically import AgoraRTC to avoid SSR issues
let AgoraRTC: typeof import("agora-rtc-sdk-ng").default;

export interface VideoSessionConfig {
  appointmentId: string;
  userId: string;
  userRole: "therapist" | "client";
  channelName: string;
}

export interface VideoSessionState {
  isConnected: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  remoteUsers: IAgoraRTCRemoteUser[];
  connectionStatus:
    | "connecting"
    | "connected"
    | "disconnected"
    | "failed"
    | "reconnecting";
  participantCount: number;
}

export class AgoraService {
  private client: IAgoraRTCClient | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private sessionConfig: VideoSessionConfig | null = null;
  private stateCallbacks: ((state: VideoSessionState) => void)[] = [];
  private retryAttempts = 0;
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;

  private currentState: VideoSessionState = {
    isConnected: false,
    isVideoEnabled: false,
    isAudioEnabled: false,
    remoteUsers: [],
    connectionStatus: "disconnected",
    participantCount: 0,
  };

  constructor() {
    // Initialize client as null, will be created when needed
    this.initializeAgoraRTC();
  }

  private async initializeAgoraRTC() {
    if (typeof window === "undefined") {
      return; // Don't initialize on server side
    }

    try {
      AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      this.client = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });
      this.setupEventListeners();
    } catch (error) {
      console.error("Failed to initialize Agora RTC:", error);
    }
  }

  private setupEventListeners() {
    if (!this.client) return;

    this.client.on("user-published", this.handleUserPublished.bind(this));
    this.client.on("user-unpublished", this.handleUserUnpublished.bind(this));
    this.client.on("user-joined", this.handleUserJoined.bind(this));
    this.client.on("user-left", this.handleUserLeft.bind(this));
    this.client.on(
      "connection-state-change",
      this.handleConnectionStateChange.bind(this)
    );
  }

  private handleUserPublished = async (
    user: IAgoraRTCRemoteUser,
    mediaType: "audio" | "video"
  ) => {
    try {
      if (!this.client) return;
      await this.client.subscribe(user, mediaType);
      this.updateState({
        remoteUsers: this.client.remoteUsers,
        participantCount:
          this.client.remoteUsers.length +
          (this.currentState.isConnected ? 1 : 0),
      });
    } catch (error) {
      console.error("Error subscribing to user:", error);
    }
  };

  private handleUserUnpublished = (
    user: IAgoraRTCRemoteUser,
    mediaType: "audio" | "video"
  ) => {
    if (!this.client) return;
    this.updateState({
      remoteUsers: this.client.remoteUsers,
      participantCount:
        this.client.remoteUsers.length +
        (this.currentState.isConnected ? 1 : 0),
    });
  };

  private handleUserJoined = (user: IAgoraRTCRemoteUser) => {
    console.log("User joined:", user.uid);
    if (!this.client) return;
    this.updateState({
      remoteUsers: this.client.remoteUsers,
      participantCount:
        this.client.remoteUsers.length +
        (this.currentState.isConnected ? 1 : 0),
    });
  };

  private handleUserLeft = (user: IAgoraRTCRemoteUser) => {
    console.log("User left:", user.uid);
    if (!this.client) return;
    this.updateState({
      remoteUsers: this.client.remoteUsers,
      participantCount:
        this.client.remoteUsers.length +
        (this.currentState.isConnected ? 1 : 0),
    });
  };

  private handleConnectionStateChange = (
    currentState: string,
    prevState: string,
    reason?: string
  ) => {
    console.log("Connection state changed:", {
      currentState,
      prevState,
      reason,
    });

    let connectionStatus: VideoSessionState["connectionStatus"] =
      "disconnected";
    let isConnected = false;

    switch (currentState) {
      case "CONNECTING":
        connectionStatus = "connecting";
        break;
      case "CONNECTED":
        connectionStatus = "connected";
        isConnected = true;
        this.retryAttempts = 0; // Reset retry count on successful connection
        break;
      case "DISCONNECTED":
        connectionStatus = "disconnected";
        break;
      case "RECONNECTING":
        connectionStatus = "reconnecting";
        break;
      case "DISCONNECTING":
        connectionStatus = "disconnected";
        break;
    }

    this.updateState({
      connectionStatus,
      isConnected,
      participantCount: this.client
        ? this.client.remoteUsers.length + (isConnected ? 1 : 0)
        : 0,
    });

    // Handle automatic reconnection on failure
    if (
      currentState === "DISCONNECTED" &&
      prevState === "CONNECTED" &&
      reason !== "LEAVE"
    ) {
      this.handleDisconnection();
    }
  };

  private handleDisconnection() {
    if (this.retryAttempts < this.maxRetries && this.sessionConfig) {
      this.retryAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.retryAttempts - 1), 10000);

      console.log(
        `Connection lost, retrying in ${delay}ms (attempt ${this.retryAttempts}/${this.maxRetries})`
      );

      this.retryTimeout = setTimeout(async () => {
        try {
          await this.rejoinSession();
        } catch (error) {
          console.error("Retry failed:", error);
          if (this.retryAttempts >= this.maxRetries) {
            this.updateState({ connectionStatus: "failed" });
          }
        }
      }, delay);
    } else {
      this.updateState({ connectionStatus: "failed" });
    }
  }

  private async rejoinSession() {
    if (!this.sessionConfig || !this.client) {
      throw new Error("No session config available for retry");
    }

    this.updateState({ connectionStatus: "reconnecting" });

    const token = await this.generateToken(
      this.sessionConfig.channelName,
      this.sessionConfig.userId
    );

    await this.client.join(
      config.agora.appId,
      this.sessionConfig.channelName,
      token,
      this.sessionConfig.userId
    );

    // Republish local tracks if they exist
    if (this.localVideoTrack || this.localAudioTrack) {
      const tracks = [this.localVideoTrack, this.localAudioTrack].filter(
        Boolean
      ) as ILocalTrack[];
      if (tracks.length > 0) {
        await this.client.publish(tracks);
      }
    }
  }

  private updateState(partialState: Partial<VideoSessionState>) {
    this.currentState = { ...this.currentState, ...partialState };
    this.stateCallbacks.forEach((callback) => {
      try {
        callback(this.currentState);
      } catch (error) {
        console.error("Error in state callback:", error);
      }
    });
  }

  public onStateChange(
    callback: (state: VideoSessionState) => void
  ): () => void {
    this.stateCallbacks.push(callback);
    return () => {
      const index = this.stateCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateCallbacks.splice(index, 1);
      }
    };
  }

  private async generateToken(
    channelName: string,
    uid: string
  ): Promise<string> {
    try {
      console.log("🔧 [DEBUG] Starting token generation:", {
        channelName,
        uid,
        timestamp: new Date().toISOString(),
      });

      const firebaseToken = await this.getFirebaseToken();
      console.log("🔧 [DEBUG] Firebase token obtained:", {
        tokenLength: firebaseToken.length,
        isPlaceholder: firebaseToken === "firebase_token_placeholder",
        tokenPrefix: firebaseToken.substring(0, 20) + "...",
      });

      const response = await fetch("/api/agora/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify({
          channelName,
          uid,
        }),
      });

      console.log("🔧 [DEBUG] Token API response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("🔧 [DEBUG] Token API error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
          requestBody: { channelName, uid },
        });
        throw new Error(
          `Failed to generate token: ${response.statusText} - ${
            errorData.error || "Unknown error"
          }`
        );
      }

      const { token } = await response.json();
      console.log("🔧 [DEBUG] Token generated successfully:", {
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 20) + "...",
      });
      return token;
    } catch (error) {
      console.error("🔧 [DEBUG] Error generating Agora token:", error);
      throw error;
    }
  }

  private async getFirebaseToken(): Promise<string> {
    console.log(
      "🔧 [DEBUG] getFirebaseToken called - checking for auth context"
    );

    // Try to get Firebase auth token from the current context
    try {
      // Import Firebase auth dynamically to avoid SSR issues
      const { getAuth } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase/client");

      const currentUser = getAuth().currentUser || auth.currentUser;

      if (currentUser) {
        console.log("🔧 [DEBUG] Found authenticated user, getting token");
        const token = await currentUser.getIdToken();
        console.log("🔧 [DEBUG] Retrieved valid Firebase token");
        return token;
      } else {
        console.warn("🔧 [DEBUG] No authenticated user found");
        throw new Error(
          "No authenticated user - please ensure user is logged in before joining video session"
        );
      }
    } catch (error) {
      console.error("🔧 [DEBUG] Error getting Firebase token:", error);
      throw new Error(
        "Failed to get authentication token - please ensure you are logged in"
      );
    }
  }

  public async joinSession(
    videoConfig: VideoSessionConfig,
    firebaseToken?: string
  ): Promise<void> {
    try {
      console.log("🔧 [DEBUG] Starting joinSession:", {
        videoConfig,
        firebaseTokenProvided: !!firebaseToken,
        agoraAppId: config.agora.appId,
        isPlaceholderAppId: config.agora.isPlaceholderAppId,
        isPlaceholderCertificate: config.agora.isPlaceholderCertificate,
        timestamp: new Date().toISOString(),
      });

      // Ensure Agora RTC is initialized
      if (!this.client) {
        await this.initializeAgoraRTC();
        if (!this.client) {
          throw new Error("Failed to initialize Agora RTC client");
        }
      }

      this.sessionConfig = videoConfig;
      this.retryAttempts = 0;
      this.updateState({ connectionStatus: "connecting" });

      // Override token getter if provided
      if (firebaseToken) {
        console.log(
          "🔧 [DEBUG] Overriding getFirebaseToken with provided token"
        );
        this.getFirebaseToken = async () => firebaseToken;
      }

      const token = await this.generateToken(
        videoConfig.channelName,
        videoConfig.userId
      );

      console.log("🔧 [DEBUG] Attempting to join Agora channel:", {
        appId: config.agora.appId,
        channelName: videoConfig.channelName,
        userId: videoConfig.userId,
        tokenLength: token,
      });
      await this.client.join(
        config.agora.appId,
        videoConfig.channelName,
        token,
        videoConfig.userId
      );

      console.log("🔧 [DEBUG] Successfully joined Agora channel");

      // Create and publish local tracks after joining
      await this.initializeLocalTracks();

      this.updateState({
        isConnected: true,
        connectionStatus: "connected",
        participantCount: this.client.remoteUsers.length + 1,
      });

      console.log("🔧 [DEBUG] joinSession completed successfully");
    } catch (error) {
      console.error("🔧 [DEBUG] Error joining session:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        config: {
          appId: config.agora.appId,
          channelName: videoConfig?.channelName,
          userId: videoConfig?.userId,
        },
      });
      this.updateState({
        connectionStatus: "failed",
        isConnected: false,
        participantCount: 0,
      });
      throw error;
    }
  }

  public async leaveSession(): Promise<void> {
    try {
      // Clear any pending retry
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
        this.retryTimeout = null;
      }

      if (!this.client) return;

      // Unpublish local tracks
      if (this.localVideoTrack || this.localAudioTrack) {
        const tracks = [this.localVideoTrack, this.localAudioTrack].filter(
          Boolean
        ) as ILocalTrack[];
        if (tracks.length > 0) {
          await this.client.unpublish(tracks);
        }
      }

      // Close local tracks
      await this.cleanupLocalTracks();

      // Leave channel
      await this.client.leave();

      this.sessionConfig = null;
      this.retryAttempts = 0;
      this.updateState({
        isConnected: false,
        isVideoEnabled: false,
        isAudioEnabled: false,
        remoteUsers: [],
        connectionStatus: "disconnected",
        participantCount: 0,
      });
    } catch (error) {
      console.error("Error leaving session:", error);
      throw error;
    }
  }

  private async initializeLocalTracks(): Promise<void> {
    try {
      if (!AgoraRTC) {
        throw new Error("Agora RTC not initialized");
      }

      console.log("🔧 [DEBUG] Starting device diagnostics...");

      // Check if media devices are available
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error("Media devices API not available");
      }

      // Check available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      const audioDevices = devices.filter(
        (device) => device.kind === "audioinput"
      );

      console.log("🔧 [DEBUG] Available devices:", {
        totalDevices: devices.length,
        videoDevices: videoDevices.length,
        audioDevices: audioDevices.length,
        videoDeviceList: videoDevices.map((d) => ({
          id: d.deviceId,
          label: d.label || "Unknown",
        })),
        audioDeviceList: audioDevices.map((d) => ({
          id: d.deviceId,
          label: d.label || "Unknown",
        })),
      });

      if (videoDevices.length === 0) {
        console.warn("🔧 [DEBUG] No video devices found");
      }

      if (audioDevices.length === 0) {
        console.warn("🔧 [DEBUG] No audio devices found");
      }

      // Check permissions before attempting to create tracks
      console.log("🔧 [DEBUG] Checking media permissions...");
      let permissionsGranted = false;

      try {
        const permissions = await Promise.all([
          navigator.permissions
            ?.query({ name: "camera" as PermissionName })
            .catch(() => null),
          navigator.permissions
            ?.query({ name: "microphone" as PermissionName })
            .catch(() => null),
        ]);

        console.log("🔧 [DEBUG] Permission states:", {
          camera: permissions[0]?.state || "unknown",
          microphone: permissions[1]?.state || "unknown",
        });

        permissionsGranted = permissions.some((p) => p?.state === "granted");
      } catch (error) {
        console.log(
          "🔧 [DEBUG] Permission API not available, will attempt direct access"
        );
      }

      // Attempt to create tracks
      console.log("🔧 [DEBUG] Attempting to create media tracks...");

      const trackPromises: Promise<
        ICameraVideoTrack | IMicrophoneAudioTrack | null
      >[] = [];

      // Only attempt video track if we have video devices
      if (videoDevices.length > 0) {
        console.log("🔧 [DEBUG] Creating camera video track with config:", {
          optimizationMode: "motion",
        });
        trackPromises.push(
          AgoraRTC.createCameraVideoTrack({ optimizationMode: "motion" }).catch(
            (error) => {
              console.error("🔧 [DEBUG] Camera track creation failed:", error);
              return null;
            }
          )
        );
      } else {
        console.log(
          "🔧 [DEBUG] Skipping video track creation - no video devices available"
        );
        trackPromises.push(Promise.resolve(null));
      }

      // Only attempt audio track if we have audio devices
      if (audioDevices.length > 0) {
        console.log("🔧 [DEBUG] Creating microphone audio track");
        trackPromises.push(
          AgoraRTC.createMicrophoneAudioTrack().catch((error) => {
            console.error("🔧 [DEBUG] Audio track creation failed:", error);
            return null;
          })
        );
      } else {
        console.log(
          "🔧 [DEBUG] Skipping audio track creation - no audio devices available"
        );
        trackPromises.push(Promise.resolve(null));
      }

      const [videoTrack, audioTrack] = await Promise.all(trackPromises);

      console.log("🔧 [DEBUG] Track creation results:", {
        videoTrack: !!videoTrack,
        audioTrack: !!audioTrack,
        videoTrackId: videoTrack?.getTrackId?.() || "N/A",
        audioTrackId: audioTrack?.getTrackId?.() || "N/A",
      });

      this.localVideoTrack = videoTrack as ICameraVideoTrack | null;
      this.localAudioTrack = audioTrack as IMicrophoneAudioTrack | null;

      // Only publish tracks that were successfully created
      const tracksToPublish = [videoTrack, audioTrack].filter(
        Boolean
      ) as ILocalTrack[];

      if (this.client && tracksToPublish.length > 0) {
        console.log("🔧 [DEBUG] Publishing tracks:", tracksToPublish.length);
        await this.client.publish(tracksToPublish);
      } else if (tracksToPublish.length === 0) {
        console.warn("🔧 [DEBUG] No tracks to publish");
      }

      this.updateState({
        isVideoEnabled: !!videoTrack,
        isAudioEnabled: !!audioTrack,
      });

      console.log("🔧 [DEBUG] Local tracks initialized successfully:", {
        videoEnabled: !!videoTrack,
        audioEnabled: !!audioTrack,
      });
    } catch (error) {
      console.error("🔧 [DEBUG] Error initializing local tracks:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      });

      // Continue without local tracks if initialization fails
      this.updateState({
        isVideoEnabled: false,
        isAudioEnabled: false,
      });

      // Re-throw the error so it can be handled by the caller
      throw error;
    }
  }

  private async cleanupLocalTracks(): Promise<void> {
    if (this.localVideoTrack) {
      this.localVideoTrack.close();
      this.localVideoTrack = null;
    }

    if (this.localAudioTrack) {
      this.localAudioTrack.close();
      this.localAudioTrack = null;
    }
  }

  public async toggleVideo(): Promise<void> {
    if (!this.localVideoTrack) {
      // Try to create video track if it doesn't exist
      try {
        if (!AgoraRTC) {
          throw new Error("Agora RTC not initialized");
        }
        this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
        if (this.client) {
          await this.client.publish([this.localVideoTrack as ILocalTrack]);
        }
        this.updateState({ isVideoEnabled: true });
      } catch (error) {
        console.error("Error creating video track:", error);
        throw new Error("Failed to enable video");
      }
      return;
    }

    const enabled = this.localVideoTrack.enabled;
    await this.localVideoTrack.setEnabled(!enabled);

    this.updateState({
      isVideoEnabled: !enabled,
    });
  }

  public async toggleAudio(): Promise<void> {
    if (!this.localAudioTrack) {
      // Try to create audio track if it doesn't exist
      try {
        if (!AgoraRTC) {
          throw new Error("Agora RTC not initialized");
        }
        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        if (this.client) {
          await this.client.publish([this.localAudioTrack as ILocalTrack]);
        }
        this.updateState({ isAudioEnabled: true });
      } catch (error) {
        console.error("Error creating audio track:", error);
        throw new Error("Failed to enable audio");
      }
      return;
    }

    const enabled = this.localAudioTrack.enabled;
    await this.localAudioTrack.setEnabled(!enabled);

    this.updateState({
      isAudioEnabled: !enabled,
    });
  }

  public async switchCamera(): Promise<void> {
    if (!this.localVideoTrack) {
      throw new Error("No video track available");
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      if (videoDevices.length <= 1) {
        throw new Error("No additional cameras available");
      }

      // Switch to next camera
      const currentDevice = this.localVideoTrack.getTrackLabel();
      const currentIndex = videoDevices.findIndex(
        (device) => device.label === currentDevice
      );
      const nextIndex = (currentIndex + 1) % videoDevices.length;

      await this.localVideoTrack.setDevice(videoDevices[nextIndex].deviceId);
    } catch (error) {
      console.error("Error switching camera:", error);
      throw error;
    }
  }

  public getLocalVideoTrack(): ICameraVideoTrack | null {
    return this.localVideoTrack;
  }

  public getLocalAudioTrack(): IMicrophoneAudioTrack | null {
    return this.localAudioTrack;
  }

  public getRemoteUsers(): IAgoraRTCRemoteUser[] {
    return this.client?.remoteUsers || [];
  }

  public getCurrentState(): VideoSessionState {
    return { ...this.currentState };
  }

  public dispose(): void {
    this.leaveSession().catch(console.error);
    this.stateCallbacks.length = 0;

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }
}

// Create a singleton instance
export const agoraService = new AgoraService();
