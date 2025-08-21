"use client";

import React, { useEffect, useState, useRef } from "react";
import { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";
import {
  agoraService,
  VideoSessionConfig,
  VideoSessionState,
} from "@/lib/services/agora-service";
import { VideoControls } from "./VideoControls";
import { ConnectionStatus } from "./ConnectionStatus";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface VideoSessionProps {
  appointmentId: string;
  userId: string;
  userRole: "therapist" | "client";
  onSessionEnd?: () => void;
  className?: string;
}

export function VideoSession({
  appointmentId,
  userId,
  userRole,
  onSessionEnd,
  className = "",
}: VideoSessionProps) {
  const [sessionState, setSessionState] = useState<VideoSessionState>(
    agoraService.getCurrentState()
  );
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Generate channel name based on appointment ID
  const channelName = `therapy_session_${appointmentId}`;

  useEffect(() => {
    const unsubscribe = agoraService.onStateChange(setSessionState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Play local video when track is available
    if (sessionState.isVideoEnabled && localVideoRef.current) {
      const localVideoTrack = agoraService.getLocalVideoTrack();
      if (localVideoTrack) {
        localVideoTrack.play(localVideoRef.current);
      }
    }
  }, [sessionState.isVideoEnabled]);

  useEffect(() => {
    // Play remote videos when users join
    sessionState.remoteUsers.forEach((user) => {
      if (user.videoTrack && remoteVideoRefs.current[user.uid.toString()]) {
        user.videoTrack.play(remoteVideoRefs.current[user.uid.toString()]!);
      }
      if (user.audioTrack) {
        user.audioTrack.play();
      }
    });
  }, [sessionState.remoteUsers]);

  const handleJoinSession = async () => {
    try {
      setIsJoining(true);
      setError(null);

      const config: VideoSessionConfig = {
        appointmentId,
        userId,
        userRole,
        channelName,
      };

      // In a real implementation, you'd get the Firebase token from useAuth or similar
      const firebaseToken = "placeholder_token";
      await agoraService.joinSession(config, firebaseToken);
    } catch (err) {
      console.error("Failed to join session:", err);
      setError(
        err instanceof Error ? err.message : "Failed to join video session"
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveSession = async () => {
    try {
      await agoraService.leaveSession();
      onSessionEnd?.();
    } catch (err) {
      console.error("Failed to leave session:", err);
      setError(
        err instanceof Error ? err.message : "Failed to leave video session"
      );
    }
  };

  const handleToggleVideo = async () => {
    try {
      await agoraService.toggleVideo();
    } catch (err) {
      console.error("Failed to toggle video:", err);
      setError("Failed to toggle video");
    }
  };

  const handleToggleAudio = async () => {
    try {
      await agoraService.toggleAudio();
    } catch (err) {
      console.error("Failed to toggle audio:", err);
      setError("Failed to toggle audio");
    }
  };

  const handleSwitchCamera = async () => {
    try {
      await agoraService.switchCamera();
    } catch (err) {
      console.error("Failed to switch camera:", err);
      setError("Failed to switch camera");
    }
  };

  if (
    !sessionState.isConnected &&
    sessionState.connectionStatus === "disconnected"
  ) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Video Session</h3>
              <p className="text-sm text-gray-600">
                Ready to join your therapy session
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleJoinSession}
              disabled={isJoining}
              className="w-full"
            >
              {isJoining ? "Joining..." : "Join Video Session"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <ConnectionStatus
        status={sessionState.connectionStatus}
        participantCount={sessionState.participantCount}
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {/* Local Video */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <div
                ref={localVideoRef}
                className="w-full h-48 bg-gray-900 rounded-lg overflow-hidden"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                You ({userRole})
              </div>
              {!sessionState.isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center rounded-lg">
                  <span className="text-white">Video Off</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Remote Videos */}
        {sessionState.remoteUsers.map((user: IAgoraRTCRemoteUser) => (
          <Card key={user.uid}>
            <CardContent className="p-4">
              <div className="relative">
                <div
                  ref={(el) => {
                    remoteVideoRefs.current[user.uid.toString()] = el;
                  }}
                  className="w-full h-48 bg-gray-900 rounded-lg overflow-hidden"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {userRole === "therapist" ? "Client" : "Therapist"}
                </div>
                {!user.videoTrack && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center rounded-lg">
                    <span className="text-white">Video Off</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Show waiting message if no remote users */}
        {sessionState.remoteUsers.length === 0 && (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-gray-600">
                Waiting for {userRole === "therapist" ? "client" : "therapist"}{" "}
                to join...
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <VideoControls
        isVideoEnabled={sessionState.isVideoEnabled}
        isAudioEnabled={sessionState.isAudioEnabled}
        onToggleVideo={handleToggleVideo}
        onToggleAudio={handleToggleAudio}
        onSwitchCamera={handleSwitchCamera}
        onLeaveSession={handleLeaveSession}
      />
    </div>
  );
}
