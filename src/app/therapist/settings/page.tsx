"use client";

import React, { useState, useEffect } from "react";
import { TherapistLayout } from "@/components/therapist/TherapistLayout";
import { ProfilePhotoUpload } from "@/components/therapist/ProfilePhotoUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  User,
  Briefcase,
  DollarSign,
  Clock,
  Bell,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface TherapistProfileResponse {
  id: string;
  email: string;
  profile: {
    displayName: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    avatarUrl?: string;
    timezone: string;
    locale: string;
  };
  role: string;
  status: string;
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      shareProfile: boolean;
      allowDirectMessages: boolean;
    };
  };
  metadata: {
    createdAt: any;
    updatedAt: any;
    lastLoginAt: any;
    onboardingCompleted: boolean;
  };
  therapistProfile?: {
    photoURL?: string;
    credentials?: {
      licenseNumber: string;
      licenseState: string;
      licenseExpiry: any;
      specializations: string[];
      certifications: string[];
    };
    practice?: {
      bio: string;
      yearsExperience: number;
      sessionTypes: string[];
      languages: string[];
      hourlyRate: number;
      currency: string;
    };
    availability?: {
      timezone: string;
      bufferMinutes: number;
      maxDailyHours: number;
      advanceBookingDays: number;
    };
    verification?: {
      isVerified: boolean;
      verifiedAt?: any;
    };
  };
}

export default function TherapistSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<TherapistProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bio: "",
    yearsExperience: 0,
    hourlyRate: 0,
    timezone: "",
    bufferMinutes: 15,
    maxDailyHours: 8,
    advanceBookingDays: 30,
  });

  useEffect(() => {
    if (user?.uid) {
      fetchProfile();
    }
  }, [user?.uid]);

  useEffect(() => {
    console.log("Profile :: ", profile);
    if (profile) {
      // Extract name from profile.profile (nested structure from API)
      const displayName = profile.profile?.displayName || "";
      const firstName = profile.profile?.firstName || "";
      const lastName = profile.profile?.lastName || "";
      const fullName = displayName || `${firstName} ${lastName}`.trim();
      
      // Normalize hourly rate (handle both old dollar format and new cents format)
      const rawRate = profile.therapistProfile?.practice?.hourlyRate || 0;
      const normalizedRate = rawRate < 1000 ? rawRate * 100 : rawRate;
      
      setFormData({
        name: fullName,
        phone: profile.profile?.phoneNumber || "",
        bio: profile.therapistProfile?.practice?.bio || "",
        yearsExperience: profile.therapistProfile?.practice?.yearsExperience || 0,
        hourlyRate: normalizedRate,
        timezone: profile.therapistProfile?.availability?.timezone || "",
        bufferMinutes: profile.therapistProfile?.availability?.bufferMinutes || 15,
        maxDailyHours: profile.therapistProfile?.availability?.maxDailyHours || 8,
        advanceBookingDays:
          profile.therapistProfile?.availability?.advanceBookingDays || 30,
      });
      
      console.log("✅ Form data set:", {
        name: fullName,
        phone: profile.profile?.phoneNumber,
        hasTherapistProfile: !!profile.therapistProfile,
      });
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await user?.getIdToken();
      const response = await fetch("/api/therapist/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📋 Profile API Response:", JSON.stringify(data, null, 2));
        console.log("👤 User data:", user);
        console.log("📞 Phone from profile:", data.profile?.profile.phoneMumber);
        setProfile(data.profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpdated = (photoURL: string | null) => {
    if (profile) {
      setProfile({
        ...profile,
        profile: {
          ...profile.profile,
          avatarUrl: photoURL || undefined,
        },
        therapistProfile: profile.therapistProfile ? {
          ...profile.therapistProfile,
          photoURL: photoURL || undefined,
        } : undefined,
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);
      const token = await user?.getIdToken();

      const updateData = {
        name: formData.name,
        phone: formData.phone,
        "therapistProfile.practice.bio": formData.bio,
        "therapistProfile.practice.yearsExperience": formData.yearsExperience,
        "therapistProfile.practice.hourlyRate": formData.hourlyRate,
        "therapistProfile.availability.timezone": formData.timezone,
        "therapistProfile.availability.bufferMinutes": formData.bufferMinutes,
        "therapistProfile.availability.maxDailyHours": formData.maxDailyHours,
        "therapistProfile.availability.advanceBookingDays":
          formData.advanceBookingDays,
      };

      const response = await fetch("/api/therapist/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setSaveSuccess(true);
        await fetchProfile();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <TherapistLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </TherapistLayout>
    );
  }

  if (!profile) {
    return (
      <TherapistLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Failed to load profile</p>
        </div>
      </TherapistLayout>
    );
  }

  return (
    <TherapistLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-lg text-gray-600">
          Manage your profile and preferences
        </p>
      </div>

      {/* Verification Status */}
      {profile.therapistProfile?.verification?.isVerified ? (
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">
                  Verified Therapist
                </p>
                <p className="text-sm text-green-700">
                  Your profile has been verified by our team
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900">
                  Verification Pending
                </p>
                <p className="text-sm text-yellow-700">
                  Your profile is under review. You'll be notified once verified.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="practice">
            <Briefcase className="h-4 w-4 mr-2" />
            Practice
          </TabsTrigger>
          <TabsTrigger value="rates">
            <DollarSign className="h-4 w-4 mr-2" />
            Rates
          </TabsTrigger>
          <TabsTrigger value="availability">
            <Clock className="h-4 w-4 mr-2" />
            Availability
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Profile Photo Upload */}
          {user?.uid && (
            <ProfilePhotoUpload
              therapistId={user.uid}
              currentPhotoURL={profile?.profile?.avatarUrl || profile.therapistProfile?.photoURL}
              onPhotoUpdated={handlePhotoUpdated}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email} disabled />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>License Number</Label>
                  <Input
                    value={
                      profile.therapistProfile?.credentials?.licenseNumber || ""
                    }
                    disabled
                  />
                </div>
                <div>
                  <Label>License State</Label>
                  <Input
                    value={
                      profile.therapistProfile?.credentials?.licenseState || ""
                    }
                    disabled
                  />
                </div>
              </div>

              <div>
                <Label>Specializations</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.therapistProfile?.credentials?.specializations.map(
                    (spec, index) => (
                      <Badge key={index} variant="secondary">
                        {spec}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              <div>
                <Label>Certifications</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.therapistProfile?.credentials?.certifications.map(
                    (cert, index) => (
                      <Badge key={index} variant="outline">
                        {cert}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Contact support to update credentials
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Practice Tab */}
        <TabsContent value="practice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Practice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  rows={6}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Tell clients about your background, approach, and specialties..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be displayed on your public profile
                </p>
              </div>

              <div>
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  value={formData.yearsExperience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yearsExperience: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <Label>Session Types</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.therapistProfile?.practice?.sessionTypes.map(
                    (type, index) => (
                      <Badge key={index} variant="secondary">
                        {type}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              <div>
                <Label>Languages</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.therapistProfile?.practice?.languages.map(
                    (lang, index) => (
                      <Badge key={index} variant="outline">
                        {lang}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rates Tab */}
        <TabsContent value="rates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Rates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.hourlyRate / 100}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hourlyRate: Math.round(
                          parseFloat(e.target.value) * 100
                        ),
                      })
                    }
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Platform fee (15%) will be deducted from this amount
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Rate Breakdown
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Your Rate:</span>
                    <span className="font-semibold">
                      ${(formData.hourlyRate / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Platform Fee (15%):</span>
                    <span className="text-red-600">
                      -${((formData.hourlyRate * 0.15) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-blue-300 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">
                      You Receive:
                    </span>
                    <span className="font-bold text-green-600">
                      ${((formData.hourlyRate * 0.85) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Availability Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) =>
                    setFormData({ ...formData, timezone: e.target.value })
                  }
                  placeholder="e.g., America/New_York"
                />
              </div>

              <div>
                <Label htmlFor="bufferMinutes">
                  Buffer Time Between Sessions (minutes)
                </Label>
                <Input
                  id="bufferMinutes"
                  type="number"
                  min="0"
                  step="5"
                  value={formData.bufferMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bufferMinutes: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Time between sessions for breaks and notes
                </p>
              </div>

              <div>
                <Label htmlFor="maxDailyHours">
                  Maximum Daily Hours
                </Label>
                <Input
                  id="maxDailyHours"
                  type="number"
                  min="1"
                  max="24"
                  value={formData.maxDailyHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxDailyHours: parseInt(e.target.value) || 8,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="advanceBookingDays">
                  Advance Booking Window (days)
                </Label>
                <Input
                  id="advanceBookingDays"
                  type="number"
                  min="1"
                  value={formData.advanceBookingDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      advanceBookingDays: parseInt(e.target.value) || 30,
                    })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  How far in advance clients can book
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">New Appointment Bookings</p>
                    <p className="text-sm text-gray-500">
                      Get notified when clients book sessions
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    defaultChecked
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">Appointment Reminders</p>
                    <p className="text-sm text-gray-500">
                      Reminders 24 hours before sessions
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    defaultChecked
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">Payout Notifications</p>
                    <p className="text-sm text-gray-500">
                      Updates on payout processing
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    defaultChecked
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">Client Messages</p>
                    <p className="text-sm text-gray-500">
                      Notifications for new messages
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    defaultChecked
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-gray-500">
                      Platform updates and tips
                    </p>
                  </div>
                  <input type="checkbox" className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4 mt-8">
        {saveSuccess && (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Settings saved successfully!</span>
          </div>
        )}
        <Button
          onClick={handleSaveProfile}
          disabled={saving}
          size="lg"
          className="min-w-[150px]"
        >
          {saving ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </TherapistLayout>
  );
}
