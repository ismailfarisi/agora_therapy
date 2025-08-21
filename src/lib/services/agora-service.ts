/**
 * Agora Video Service
 * Handles video session management, token generation, and media controls
 */

import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  ILocalTrack,
} from "agora-rtc-sdk-ng";
import { config } from "@/lib/config";

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
  private client: IAgoraRTCClient;
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
    this.client = AgoraRTC.createClient({
      mode: "rtc",
      codec: "vp8",
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
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
    this.updateState({
      remoteUsers: this.client.remoteUsers,
      participantCount:
        this.client.remoteUsers.length +
        (this.currentState.isConnected ? 1 : 0),
    });
  };

  private handleUserJoined = (user: IAgoraRTCRemoteUser) => {
    console.log("User joined:", user.uid);
    this.updateState({
      remoteUsers: this.client.remoteUsers,
      participantCount:
        this.client.remoteUsers.length +
        (this.currentState.isConnected ? 1 : 0),
    });
  };

  private handleUserLeft = (user: IAgoraRTCRemoteUser) => {
    console.log("User left:", user.uid);
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
      participantCount: this.client.remoteUsers.length + (isConnected ? 1 : 0),
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
    if (!this.sessionConfig) {
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
      const response = await fetch("/api/agora/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await this.getFirebaseToken()}`,
        },
        body: JSON.stringify({
          channelName,
          uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to generate token: ${response.statusText} - ${
            errorData.error || "Unknown error"
          }`
        );
      }

      const { token } = await response.json();
      return token;
    } catch (error) {
      console.error("Error generating Agora token:", error);
      throw error;
    }
  }

  private async getFirebaseToken(): Promise<string> {
    // This would be implemented to get the current user's Firebase auth token
    // For now, we'll return a placeholder - this should be injected from the component
    return "firebase_token_placeholder";
  }

  public async joinSession(
    config: VideoSessionConfig,
    firebaseToken?: string
  ): Promise<void> {
    try {
      this.sessionConfig = config;
      this.retryAttempts = 0;
      this.updateState({ connectionStatus: "connecting" });

      // Override token getter if provided
      if (firebaseToken) {
        this.getFirebaseToken = async () => firebaseToken;
      }

      const token = await this.generateToken(config.channelName, config.userId);

      await this.client.join(
        config.agora.appId,
        config.channelName,
        token,
        config.userId
      );

      // Create and publish local tracks
      await this.initializeLocalTracks();

      this.updateState({
        isConnected: true,
        connectionStatus: "connected",
        participantCount: this.client.remoteUsers.length + 1,
      });
    } catch (error) {
      console.error("Error joining session:", error);
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
      const [videoTrack, audioTrack] = await Promise.all([
        AgoraRTC.createCameraVideoTrack({ optimizationMode: "motion" }),
        AgoraRTC.createMicrophoneAudioTrack(),
      ]);

      this.localVideoTrack = videoTrack;
      this.localAudioTrack = audioTrack;

      await this.client.publish([videoTrack, audioTrack]);

      this.updateState({
        isVideoEnabled: true,
        isAudioEnabled: true,
      });
    } catch (error) {
      console.error("Error initializing local tracks:", error);
      // Continue without local tracks if initialization fails
      this.updateState({
        isVideoEnabled: false,
        isAudioEnabled: false,
      });
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
        this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
        await this.client.publish([this.localVideoTrack as ILocalTrack]);
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
        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await this.client.publish([this.localAudioTrack as ILocalTrack]);
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
    return this.client.remoteUsers;
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
