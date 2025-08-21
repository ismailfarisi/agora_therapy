"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Wifi, WifiOff, Loader2, Users } from "lucide-react";

interface ConnectionStatusProps {
  status:
    | "connecting"
    | "connected"
    | "disconnected"
    | "failed"
    | "reconnecting";
  participantCount: number;
  className?: string;
}

export function ConnectionStatus({
  status,
  participantCount,
  className = "",
}: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "connecting":
        return {
          variant: "secondary" as const,
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: "Connecting...",
          description: "Establishing video connection",
        };
      case "connected":
        return {
          variant: "default" as const,
          icon: <Wifi className="h-3 w-3" />,
          text: "Connected",
          description: "Video session is active",
        };
      case "reconnecting":
        return {
          variant: "secondary" as const,
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: "Reconnecting...",
          description: "Attempting to restore connection",
        };
      case "failed":
        return {
          variant: "destructive" as const,
          icon: <WifiOff className="h-3 w-3" />,
          text: "Connection Failed",
          description: "Unable to establish connection",
        };
      case "disconnected":
      default:
        return {
          variant: "secondary" as const,
          icon: <WifiOff className="h-3 w-3" />,
          text: "Disconnected",
          description: "Not connected to video session",
        };
    }
  };

  const { variant, icon, text, description } = getStatusConfig();

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge variant={variant} className="flex items-center space-x-1">
              {icon}
              <span>{text}</span>
            </Badge>
            <span className="text-sm text-gray-600">{description}</span>
          </div>

          {(status === "connected" || status === "reconnecting") && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>
                {participantCount} participant
                {participantCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
