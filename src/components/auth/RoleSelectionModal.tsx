"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Stethoscope, ArrowRight } from "lucide-react";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "signup";
}

export function RoleSelectionModal({
  isOpen,
  onClose,
  mode,
}: RoleSelectionModalProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"client" | "therapist" | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    
    const path = mode === "login" ? "/login" : "/register";
    router.push(`${path}?role=${selectedRole}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {mode === "login" ? "Welcome Back!" : "Get Started"}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {mode === "login"
              ? "Please select how you'd like to sign in"
              : "Choose your role to create your account"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {/* Client Option */}
          <Card
            className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedRole === "client"
                ? "border-2 border-teal-500 bg-teal-50 dark:bg-teal-950"
                : "border-2 border-transparent hover:border-gray-300"
            }`}
            onClick={() => setSelectedRole("client")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedRole === "client"
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">I'm Looking for Therapy</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Find professional therapists and book sessions for mental health support
                </p>
              </div>
              {selectedRole === "client" && (
                <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}
            </div>
          </Card>

          {/* Therapist Option */}
          <Card
            className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedRole === "therapist"
                ? "border-2 border-blue-500 bg-blue-50 dark:bg-blue-950"
                : "border-2 border-transparent hover:border-gray-300"
            }`}
            onClick={() => setSelectedRole("therapist")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedRole === "therapist"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                <Stethoscope className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">I'm a Therapist</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Join our platform to offer professional therapy services to clients
                </p>
              </div>
              {selectedRole === "therapist" && (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={
              selectedRole === "client"
                ? "bg-teal-500 hover:bg-teal-600"
                : selectedRole === "therapist"
                ? "bg-blue-500 hover:bg-blue-600"
                : ""
            }
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
