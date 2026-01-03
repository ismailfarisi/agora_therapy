"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VideoSession } from "./VideoSession";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface VideoSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  userId: string;
  userRole: "therapist" | "client";
  appointmentTitle?: string;
  duration: number;
  scheduledFor: Date;
}

export function VideoSessionModal({
  isOpen,
  onClose,
  appointmentId,
  userId,
  userRole,
  appointmentTitle,
  duration,
  scheduledFor,
}: VideoSessionModalProps) {
  const handleSessionEnd = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>
              {appointmentTitle
                ? `Video Session - ${appointmentTitle}`
                : "Video Session"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 p-4">
          <VideoSession
            appointmentId={appointmentId}
            userId={userId}
            userRole={userRole}
            duration={duration}
            scheduledFor={scheduledFor}
            onSessionEnd={handleSessionEnd}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}