/**
 * User Profile Page
 * Main profile editing page for all user types
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/stores/auth-store";
import { Navigation } from "@/components/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileCompletion } from "@/components/profile/profile-completion";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bell,
  Shield,
  Eye,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  ProfileService,
  type ProfileUpdateData,
} from "@/lib/services/profile-service";

export default function ProfilePage() {
  const { user, userData, loading: authLoading, refreshUserData } = useAuth();
  const { updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Preferences state
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    privacy: {
      shareProfile: false,
      allowDirectMessages: true,
    },
  });

  useEffect(() => {
    if (userData) {
      setPreferences(
        userData.preferences || {
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          privacy: {
            shareProfile: false,
            allowDirectMessages: true,
          },
        }
      );
    }
  }, [userData]);

  if (authLoading) {
    return <PageLoadingSpinner text="Loading your profile..." />;
  }

  if (!user || !userData) {
    return null; // This will be handled by middleware
  }

  const handleProfileSave = async (data: ProfileUpdateData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await ProfileService.updateProfile(userData.id, data);

      // Update local user data
      updateUser({
        profile: {
          ...userData.profile,
          firstName: data.firstName,
          lastName: data.lastName,
          displayName: data.displayName,
          phoneNumber: data.phoneNumber,
          timezone: data.timezone,
          locale: data.locale,
        },
      });

      await refreshUserData();
      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (file: File): Promise<string> => {
    try {
      const avatarUrl = await ProfileService.uploadProfilePhoto(
        userData.id,
        file
      );

      // Update local user data
      updateUser({
        profile: {
          ...userData.profile,
          avatarUrl,
        },
      });

      await refreshUserData();
      return avatarUrl;
    } catch (err) {
      console.error("Photo upload error:", err);
      throw err;
    }
  };

  const handlePreferenceUpdate = async (
    category: "notifications" | "privacy",
    key: string,
    value: boolean
  ) => {
    setLoading(true);

    try {
      const newPreferences = {
        ...preferences,
        [category]: {
          ...preferences[category],
          [key]: value,
        },
      };

      setPreferences(newPreferences);

      // Update user preferences in database
      await ProfileService.updateProfile(userData.id, {
        firstName: userData.profile.firstName,
        lastName: userData.profile.lastName,
        displayName: userData.profile.displayName,
        phoneNumber: userData.profile.phoneNumber,
        timezone: userData.profile.timezone,
        locale: userData.profile.locale,
      });

      updateUser({ preferences: newPreferences });
      await refreshUserData();
    } catch (err) {
      console.error("Preference update error:", err);
      setError("Failed to update preferences");
    } finally {
      setLoading(false);
    }
  };

  const profileCompletion = ProfileService.calculateProfileCompletion(userData);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Profile Settings
              </h1>
              <p className="text-gray-600">
                Manage your account information and preferences
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  profileCompletion.requiredFieldsComplete
                    ? "default"
                    : "secondary"
                }
                className={
                  profileCompletion.requiredFieldsComplete
                    ? "text-green-600"
                    : "text-yellow-600"
                }
              >
                {profileCompletion.percentage}% Complete
              </Badge>
              {profileCompletion.requiredFieldsComplete ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Profile Completion Warning */}
        {!profileCompletion.requiredFieldsComplete && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please complete the following required fields:{" "}
              {profileCompletion.missingFields.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <ProfileForm
                  user={userData}
                  onSave={handleProfileSave}
                  onPhotoUpload={handlePhotoUpload}
                  loading={loading}
                />
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications">
                            Email Notifications
                          </Label>
                          <p className="text-sm text-gray-600">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={preferences.notifications.email}
                          onCheckedChange={(value) =>
                            handlePreferenceUpdate(
                              "notifications",
                              "email",
                              value
                            )
                          }
                          disabled={loading}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sms-notifications">
                            SMS Notifications
                          </Label>
                          <p className="text-sm text-gray-600">
                            Receive notifications via SMS
                          </p>
                        </div>
                        <Switch
                          id="sms-notifications"
                          checked={preferences.notifications.sms}
                          onCheckedChange={(value) =>
                            handlePreferenceUpdate(
                              "notifications",
                              "sms",
                              value
                            )
                          }
                          disabled={loading}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-notifications">
                            Push Notifications
                          </Label>
                          <p className="text-sm text-gray-600">
                            Receive browser push notifications
                          </p>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={preferences.notifications.push}
                          onCheckedChange={(value) =>
                            handlePreferenceUpdate(
                              "notifications",
                              "push",
                              value
                            )
                          }
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy Tab */}
              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Privacy Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="share-profile">Share Profile</Label>
                          <p className="text-sm text-gray-600">
                            Allow others to discover your profile
                          </p>
                        </div>
                        <Switch
                          id="share-profile"
                          checked={preferences.privacy.shareProfile}
                          onCheckedChange={(value) =>
                            handlePreferenceUpdate(
                              "privacy",
                              "shareProfile",
                              value
                            )
                          }
                          disabled={loading}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="direct-messages">
                            Direct Messages
                          </Label>
                          <p className="text-sm text-gray-600">
                            Allow others to send you direct messages
                          </p>
                        </div>
                        <Switch
                          id="direct-messages"
                          checked={preferences.privacy.allowDirectMessages}
                          onCheckedChange={(value) =>
                            handlePreferenceUpdate(
                              "privacy",
                              "allowDirectMessages",
                              value
                            )
                          }
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProfileCompletion user={userData} />

            {userData.role === "therapist" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Professional Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Complete your professional therapist profile to start
                    accepting clients.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/therapist/profile">Manage Therapist Profile</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
