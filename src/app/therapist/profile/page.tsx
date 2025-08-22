/**
 * Therapist Profile Management Page
 * Enhanced with Firebase integration and new components
 */

"use client";

import { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { Navigation } from "@/components/navigation";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  FileText,
  Languages,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Save,
  Loader2,
  Upload,
  Target,
  Settings,
} from "lucide-react";

// Import new components
import { VerificationStatus } from "@/components/therapist/VerificationStatus";
import { ProfileCompletion } from "@/components/therapist/ProfileCompletion";
import { DocumentUpload } from "@/components/therapist/DocumentUpload";
import { EnhancedAvailabilityTab } from "@/components/therapist/schedule";

// Import services and validation
import {
  TherapistService,
  ProfileCompletionData,
} from "@/lib/services/therapist-service";
import { therapistProfileSchema } from "@/lib/validations/therapist-profile";
import { TherapistProfile } from "@/types/database";

export default function TherapistProfilePage() {
  const { user, userData, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [activeTab, setActiveTab] = useState("credentials");

  // Profile state
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [completionData, setCompletionData] = useState<ProfileCompletionData>({
    percentage: 0,
    missingFields: [],
    completedSections: [],
  });

  // Form data for local changes
  const [profileData, setProfileData] = useState({
    credentials: {
      licenseNumber: "",
      licenseState: "",
      specializations: [] as string[],
      certifications: [] as string[],
    },
    practice: {
      bio: "",
      yearsExperience: 0,
      sessionTypes: [] as string[],
      languages: [] as string[],
      hourlyRate: 0,
      currency: "USD",
    },
    availability: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      bufferMinutes: 15,
      maxDailyHours: 8,
      advanceBookingDays: 30,
    },
  });

  const [newSpecialization, setNewSpecialization] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  const sessionTypes = ["individual", "couples", "family", "group"];

  const commonSpecializations = [
    "Anxiety Disorders",
    "Depression",
    "PTSD/Trauma",
    "Relationship Issues",
    "Addiction",
    "Eating Disorders",
    "ADHD",
    "Bipolar Disorder",
    "OCD",
    "Grief and Loss",
    "Stress Management",
    "Child and Adolescent Therapy",
  ];

  const commonLanguages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Mandarin",
    "Arabic",
    "Japanese",
    "Korean",
  ];

  // Load profile data on mount
  useEffect(() => {
    if (user?.uid && userData?.role === "therapist") {
      loadProfileData();
    }
  }, [user?.uid, userData?.role]);

  // Calculate completion data when profile changes
  useEffect(() => {
    if (profile) {
      const completion = TherapistService.calculateProfileCompletion(profile);
      setCompletionData(completion);
    }
  }, [profile]);

  const loadProfileData = async () => {
    if (!user?.uid) return;

    setInitialLoading(true);
    try {
      const profileData = await TherapistService.getProfile(user.uid);

      if (profileData) {
        setProfile(profileData);
        // Update local form data
        setProfileData({
          credentials: {
            licenseNumber: profileData.credentials.licenseNumber,
            licenseState: profileData.credentials.licenseState,
            specializations: profileData.credentials.specializations,
            certifications: profileData.credentials.certifications,
          },
          practice: {
            bio: profileData.practice.bio,
            yearsExperience: profileData.practice.yearsExperience,
            sessionTypes: profileData.practice.sessionTypes,
            languages: profileData.practice.languages,
            hourlyRate: profileData.practice.hourlyRate,
            currency: profileData.practice.currency,
          },
          availability: {
            timezone: profileData.availability.timezone,
            bufferMinutes: profileData.availability.bufferMinutes,
            maxDailyHours: profileData.availability.maxDailyHours,
            advanceBookingDays: profileData.availability.advanceBookingDays,
          },
        });
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Failed to load profile data");
      toast.error("Failed to load profile", "Please try refreshing the page");
    } finally {
      setInitialLoading(false);
    }
  };

  if (authLoading || initialLoading) {
    return <PageLoadingSpinner text="Loading your profile..." />;
  }

  if (!user || !userData || userData.role !== "therapist") {
    return null; // This will be handled by middleware
  }

  const handleSaveProfile = async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Create proper profile data with required fields
      const profileUpdateData: Partial<TherapistProfile> = {
        credentials: {
          ...profileData.credentials,
          licenseExpiry:
            profile?.credentials.licenseExpiry ||
            Timestamp.fromDate(
              new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            ), // Default 1 year from now
        },
        practice: {
          ...profileData.practice,
          sessionTypes: profileData.practice.sessionTypes as (
            | "individual"
            | "couples"
            | "family"
            | "group"
          )[],
        },
        availability: profileData.availability,
      };

      // Save to Firebase
      await TherapistService.saveProfile(user.uid, profileUpdateData);

      // Reload profile data
      await loadProfileData();

      setSuccess("Profile updated successfully!");
      toast.success(
        "Profile Updated",
        "Your therapist profile has been saved successfully"
      );
    } catch (err) {
      console.error("Profile save error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to save profile. Please try again.";
      setError(errorMessage);
      toast.error("Save Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addSpecialization = () => {
    if (
      newSpecialization &&
      !profileData.credentials.specializations.includes(newSpecialization)
    ) {
      setProfileData((prev) => ({
        ...prev,
        credentials: {
          ...prev.credentials,
          specializations: [
            ...prev.credentials.specializations,
            newSpecialization,
          ],
        },
      }));
      setNewSpecialization("");
    }
  };

  const removeSpecialization = (spec: string) => {
    setProfileData((prev) => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        specializations: prev.credentials.specializations.filter(
          (s) => s !== spec
        ),
      },
    }));
  };

  const addCertification = () => {
    if (
      newCertification &&
      !profileData.credentials.certifications.includes(newCertification)
    ) {
      setProfileData((prev) => ({
        ...prev,
        credentials: {
          ...prev.credentials,
          certifications: [
            ...prev.credentials.certifications,
            newCertification,
          ],
        },
      }));
      setNewCertification("");
    }
  };

  const removeCertification = (cert: string) => {
    setProfileData((prev) => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        certifications: prev.credentials.certifications.filter(
          (c) => c !== cert
        ),
      },
    }));
  };

  const addLanguage = () => {
    if (newLanguage && !profileData.practice.languages.includes(newLanguage)) {
      setProfileData((prev) => ({
        ...prev,
        practice: {
          ...prev.practice,
          languages: [...prev.practice.languages, newLanguage],
        },
      }));
      setNewLanguage("");
    }
  };

  const removeLanguage = (lang: string) => {
    setProfileData((prev) => ({
      ...prev,
      practice: {
        ...prev.practice,
        languages: prev.practice.languages.filter((l) => l !== lang),
      },
    }));
  };

  const toggleSessionType = (type: string) => {
    setProfileData((prev) => ({
      ...prev,
      practice: {
        ...prev.practice,
        sessionTypes: prev.practice.sessionTypes.includes(type)
          ? prev.practice.sessionTypes.filter((t) => t !== type)
          : [...prev.practice.sessionTypes, type],
      },
    }));
  };

  const updateField = (
    section: "credentials" | "practice" | "availability",
    field: string,
    value: string | number | string[]
  ) => {
    setProfileData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Therapist Profile
              </h1>
              <p className="text-gray-600">
                Complete your professional profile to start accepting clients
              </p>
            </div>
            <div className="flex items-center gap-2">
              {profile?.verification.isVerified ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Pending Verification
                </Badge>
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

        {/* Profile Completion */}
        {profile && (
          <ProfileCompletion
            profile={profile}
            completionData={completionData}
            onNavigateToSection={(section) => setActiveTab(section)}
            className="mb-6"
          />
        )}

        {/* Profile Form */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="practice">Practice Info</TabsTrigger>
            <TabsTrigger value="rates">Rates & Availability</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Credentials Tab */}
          <TabsContent value="credentials">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Professional Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={profileData.credentials.licenseNumber}
                      onChange={(e) =>
                        updateField(
                          "credentials",
                          "licenseNumber",
                          e.target.value
                        )
                      }
                      placeholder="Enter your license number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseState">License State</Label>
                    <Input
                      id="licenseState"
                      value={profileData.credentials.licenseState}
                      onChange={(e) =>
                        updateField(
                          "credentials",
                          "licenseState",
                          e.target.value
                        )
                      }
                      placeholder="e.g., California, New York"
                    />
                  </div>
                </div>

                {/* Specializations */}
                <div className="space-y-4">
                  <Label>Specializations</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSpecialization}
                      onChange={(e) => setNewSpecialization(e.target.value)}
                      placeholder="Add a specialization"
                      onKeyPress={(e) =>
                        e.key === "Enter" && addSpecialization()
                      }
                    />
                    <Button onClick={addSpecialization} variant="outline">
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {commonSpecializations.map((spec) => (
                      <Button
                        key={spec}
                        variant={
                          profileData.credentials.specializations.includes(spec)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          if (
                            profileData.credentials.specializations.includes(
                              spec
                            )
                          ) {
                            removeSpecialization(spec);
                          } else {
                            setProfileData((prev) => ({
                              ...prev,
                              credentials: {
                                ...prev.credentials,
                                specializations: [
                                  ...prev.credentials.specializations,
                                  spec,
                                ],
                              },
                            }));
                          }
                        }}
                      >
                        {spec}
                      </Button>
                    ))}
                  </div>

                  {profileData.credentials.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profileData.credentials.specializations.map((spec) => (
                        <Badge
                          key={spec}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {spec}
                          <button
                            onClick={() => removeSpecialization(spec)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Certifications */}
                <div className="space-y-4">
                  <Label>Additional Certifications</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      placeholder="Add a certification"
                      onKeyPress={(e) =>
                        e.key === "Enter" && addCertification()
                      }
                    />
                    <Button onClick={addCertification} variant="outline">
                      Add
                    </Button>
                  </div>

                  {profileData.credentials.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profileData.credentials.certifications.map((cert) => (
                        <Badge
                          key={cert}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {cert}
                          <button
                            onClick={() => removeCertification(cert)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Practice Info Tab */}
          <TabsContent value="practice">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Practice Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.practice.bio}
                    onChange={(e) =>
                      updateField("practice", "bio", e.target.value)
                    }
                    placeholder="Tell clients about your approach, experience, and philosophy..."
                    rows={6}
                  />
                  <p className="text-xs text-gray-500">
                    This will be visible to potential clients when they browse
                    therapists.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    max="50"
                    value={profileData.practice.yearsExperience}
                    onChange={(e) =>
                      updateField(
                        "practice",
                        "yearsExperience",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                  />
                </div>

                {/* Session Types */}
                <div className="space-y-4">
                  <Label>Session Types Offered</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {sessionTypes.map((type) => (
                      <Button
                        key={type}
                        variant={
                          profileData.practice.sessionTypes.includes(type)
                            ? "default"
                            : "outline"
                        }
                        onClick={() => toggleSessionType(type)}
                        className="capitalize"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-4">
                  <Label>Languages Spoken</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Add a language"
                      onKeyPress={(e) => e.key === "Enter" && addLanguage()}
                    />
                    <Button onClick={addLanguage} variant="outline">
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {commonLanguages.map((lang) => (
                      <Button
                        key={lang}
                        variant={
                          profileData.practice.languages.includes(lang)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          if (profileData.practice.languages.includes(lang)) {
                            removeLanguage(lang);
                          } else {
                            setProfileData((prev) => ({
                              ...prev,
                              practice: {
                                ...prev.practice,
                                languages: [...prev.practice.languages, lang],
                              },
                            }));
                          }
                        }}
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>

                  {profileData.practice.languages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profileData.practice.languages.map((lang) => (
                        <Badge
                          key={lang}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {lang}
                          <button
                            onClick={() => removeLanguage(lang)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rates & Availability Tab */}
          <TabsContent value="rates">
            <div className="space-y-6">
              {/* Basic Rate Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Rates & Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly Rate</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={profileData.practice.hourlyRate}
                        onChange={(e) =>
                          updateField(
                            "practice",
                            "hourlyRate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Input
                        id="currency"
                        value={profileData.practice.currency}
                        onChange={(e) =>
                          updateField("practice", "currency", e.target.value)
                        }
                        placeholder="USD"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Availability Section */}
              <EnhancedAvailabilityTab
                profile={profile}
                onUpdate={async (updates) => {
                  if (user?.uid) {
                    await TherapistService.saveProfile(user.uid, updates);
                    await loadProfileData();
                  }
                }}
                isLoading={loading}
              />
            </div>
          </TabsContent>

          {/* Verification Status Tab */}
          <TabsContent value="verification">
            {profile && <VerificationStatus profile={profile} />}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            {user?.uid && (
              <DocumentUpload
                therapistId={user.uid}
                onUploadComplete={(result) => {
                  toast.success(
                    "Document Uploaded",
                    `${result.filename} uploaded successfully`
                  );
                }}
                onUploadError={(error) => {
                  toast.error("Upload Failed", error);
                }}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <Button onClick={handleSaveProfile} disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
