/**
 * Availability Settings Component
 * Basic availability preferences for therapist profile
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Calendar, Globe, Settings, Info } from "lucide-react";
import { TherapistProfile } from "@/types/database";

interface AvailabilitySettingsProps {
  profile: TherapistProfile;
  onUpdateAvailability: (
    availability: Partial<TherapistProfile["availability"]>
  ) => void;
  className?: string;
}

export function AvailabilitySettings({
  profile,
  onUpdateAvailability,
  className,
}: AvailabilitySettingsProps) {
  const { availability } = profile;

  const handleFieldChange = (
    field: keyof typeof availability,
    value: string | number
  ) => {
    onUpdateAvailability({
      [field]: value,
    });
  };

  const commonTimezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Central European Time" },
    { value: "Asia/Tokyo", label: "Japan Standard Time" },
    { value: "Asia/Shanghai", label: "China Standard Time" },
    { value: "Australia/Sydney", label: "Australian Eastern Time" },
  ];

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Availability Settings
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Timezone
            </Label>
            <select
              id="timezone"
              value={availability.timezone}
              onChange={(e) => handleFieldChange("timezone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select your timezone</option>
              {commonTimezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Current timezone:{" "}
              {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </div>

          {/* Buffer Time */}
          <div className="space-y-2">
            <Label htmlFor="bufferMinutes" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Buffer Time Between Sessions
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="bufferMinutes"
                type="number"
                min="0"
                max="120"
                step="5"
                value={availability.bufferMinutes}
                onChange={(e) =>
                  handleFieldChange(
                    "bufferMinutes",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-32"
              />
              <span className="text-sm text-gray-600">minutes</span>
            </div>
            <p className="text-xs text-gray-500">
              Time needed between appointments for notes and preparation
            </p>
          </div>

          {/* Max Daily Hours */}
          <div className="space-y-2">
            <Label htmlFor="maxDailyHours" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Maximum Daily Hours
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="maxDailyHours"
                type="number"
                min="1"
                max="16"
                step="0.5"
                value={availability.maxDailyHours}
                onChange={(e) =>
                  handleFieldChange(
                    "maxDailyHours",
                    parseFloat(e.target.value) || 1
                  )
                }
                className="w-32"
              />
              <span className="text-sm text-gray-600">hours per day</span>
            </div>
            <p className="text-xs text-gray-500">
              Maximum number of hours you want to work per day
            </p>
          </div>

          {/* Advance Booking */}
          <div className="space-y-2">
            <Label
              htmlFor="advanceBookingDays"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Advance Booking Period
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="advanceBookingDays"
                type="number"
                min="1"
                max="365"
                value={availability.advanceBookingDays}
                onChange={(e) =>
                  handleFieldChange(
                    "advanceBookingDays",
                    parseInt(e.target.value) || 1
                  )
                }
                className="w-32"
              />
              <span className="text-sm text-gray-600">days in advance</span>
            </div>
            <p className="text-xs text-gray-500">
              How far in advance clients can book appointments
            </p>
          </div>

          {/* Settings Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Current Settings Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Timezone:</span>{" "}
                <span className="text-gray-600">
                  {availability.timezone || "Not set"}
                </span>
              </div>
              <div>
                <span className="font-medium">Buffer Time:</span>{" "}
                <span className="text-gray-600">
                  {availability.bufferMinutes} minutes
                </span>
              </div>
              <div>
                <span className="font-medium">Max Daily Hours:</span>{" "}
                <span className="text-gray-600">
                  {availability.maxDailyHours} hours
                </span>
              </div>
              <div>
                <span className="font-medium">Advance Booking:</span>{" "}
                <span className="text-gray-600">
                  {availability.advanceBookingDays} days
                </span>
              </div>
            </div>
          </div>

          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">About Availability Settings:</p>
                <ul className="text-sm space-y-1">
                  <li>• These are general preferences for your practice</li>
                  <li>
                    • Detailed scheduling is managed in the Schedule section
                  </li>
                  <li>• Buffer time helps prevent back-to-back appointments</li>
                  <li>
                    • You can override these settings for specific time slots
                  </li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Quick Setup Presets */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Quick Setup Presets</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onUpdateAvailability({
                    bufferMinutes: 15,
                    maxDailyHours: 6,
                    advanceBookingDays: 14,
                  })
                }
              >
                Conservative
                <div className="text-xs text-gray-500 mt-1">
                  15min buffer, 6h/day, 14 days advance
                </div>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onUpdateAvailability({
                    bufferMinutes: 10,
                    maxDailyHours: 8,
                    advanceBookingDays: 30,
                  })
                }
              >
                Standard
                <div className="text-xs text-gray-500 mt-1">
                  10min buffer, 8h/day, 30 days advance
                </div>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onUpdateAvailability({
                    bufferMinutes: 5,
                    maxDailyHours: 10,
                    advanceBookingDays: 60,
                  })
                }
              >
                Flexible
                <div className="text-xs text-gray-500 mt-1">
                  5min buffer, 10h/day, 60 days advance
                </div>
              </Button>
            </div>
          </div>

          {/* Advanced Settings Link */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Need More Control?
            </h4>
            <p className="text-sm text-blue-800 mb-3">
              For detailed scheduling, recurring availability patterns, and time
              slot management, use the advanced Schedule Manager.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-800 border-blue-200"
            >
              Open Schedule Manager
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AvailabilitySettings;
