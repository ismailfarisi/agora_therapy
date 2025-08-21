"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Camera, PhoneOff } from "lucide-react";

interface VideoControlsProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onSwitchCamera: () => void;
  onLeaveSession: () => void;
  className?: string;
}

export function VideoControls({
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  onSwitchCamera,
  onLeaveSession,
  className = "",
}: VideoControlsProps) {
  return (
    <div className={`flex justify-center space-x-4 ${className}`}>
      {/* Microphone Toggle */}
      <Button
        variant={isAudioEnabled ? "default" : "destructive"}
        size="lg"
        onClick={onToggleAudio}
        className="w-12 h-12 rounded-full p-0"
        title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
      >
        {isAudioEnabled ? (
          <Mic className="h-5 w-5" />
        ) : (
          <MicOff className="h-5 w-5" />
        )}
      </Button>

      {/* Camera Toggle */}
      <Button
        variant={isVideoEnabled ? "default" : "destructive"}
        size="lg"
        onClick={onToggleVideo}
        className="w-12 h-12 rounded-full p-0"
        title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
      >
        {isVideoEnabled ? (
          <Video className="h-5 w-5" />
        ) : (
          <VideoOff className="h-5 w-5" />
        )}
      </Button>

      {/* Switch Camera */}
      <Button
        variant="outline"
        size="lg"
        onClick={onSwitchCamera}
        className="w-12 h-12 rounded-full p-0"
        title="Switch camera"
      >
        <Camera className="h-5 w-5" />
      </Button>

      {/* Leave Session */}
      <Button
        variant="destructive"
        size="lg"
        onClick={onLeaveSession}
        className="w-12 h-12 rounded-full p-0"
        title="End session"
      >
        <PhoneOff className="h-5 w-5" />
      </Button>
    </div>
  );
}
