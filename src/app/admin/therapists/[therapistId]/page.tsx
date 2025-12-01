/**
 * Admin Therapist Detail Page
 * View detailed information about a specific therapist
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/useAuth";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Clock,
  DollarSign,
  Award,
  Languages,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { TherapistAdminView } from "@/types/models/therapist";

export default function TherapistDetailPage({
  params,
}: {
  params: Promise<{ therapistId: string }>;
}) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const [therapist, setTherapist] = useState<TherapistAdminView | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Helper function to normalize hourly rate (handle both old dollar format and new cents format)
  const normalizeHourlyRate = (rate: number): number => {
    // If rate is less than 1000, it's likely in the old dollar format, convert to cents
    // If rate is >= 1000, it's already in cents format
    return rate < 1000 ? rate * 100 : rate;
  };

  // Helper function to display hourly rate
  const displayHourlyRate = (rate: number): string => {
    const normalizedRate = normalizeHourlyRate(rate);
    return (normalizedRate / 100).toFixed(2);
  };

  // Calculate profile completeness
  const calculateCompleteness = (therapist: TherapistAdminView): number => {
    if (!therapist.therapistProfile) return 0;
    
    const checks = [
      // Basic info
      !!therapist.profile.phoneNumber,
      // Services
      therapist.therapistProfile.services && therapist.therapistProfile.services.length > 0,
      // Credentials
      !!therapist.therapistProfile.credentials.licenseNumber,
      !!therapist.therapistProfile.credentials.licenseState,
      !!therapist.therapistProfile.credentials.licenseExpiry,
      therapist.therapistProfile.credentials.specializations.length > 0,
      // Practice
      !!therapist.therapistProfile.practice.bio && therapist.therapistProfile.practice.bio.length >= 50,
      therapist.therapistProfile.practice.yearsExperience > 0,
      therapist.therapistProfile.practice.languages.length > 0,
      therapist.therapistProfile.practice.hourlyRate > 0,
      therapist.therapistProfile.practice.sessionTypes.length > 0,
    ];
    
    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  };

  useEffect(() => {
    if (user && userData?.role === "admin") {
      fetchTherapistDetail();
    }
  }, [user, userData, resolvedParams.therapistId]);

  const fetchTherapistDetail = async () => {
    try {
      setDataLoading(true);
      console.log('Fetching therapist:', resolvedParams.therapistId);
      const response = await fetch(`/api/admin/therapists/${resolvedParams.therapistId}`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Therapist data:', data);
        setTherapist(data.therapist);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert(`Failed to load therapist: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error fetching therapist detail:", error);
      alert('An error occurred while loading therapist details.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `/api/admin/therapists/${resolvedParams.therapistId}/verify`,
        {
          method: "POST",
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Therapist verified successfully!');
        await fetchTherapistDetail();
      } else {
        alert(`Error: ${data.error || 'Failed to verify therapist'}`);
      }
    } catch (error) {
      console.error("Error verifying therapist:", error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this therapist application? This will suspend their account.")) {
      return;
    }
    try {
      setActionLoading(true);
      const response = await fetch(
        `/api/admin/therapists/${resolvedParams.therapistId}/reject`,
        {
          method: "POST",
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Therapist application rejected successfully.');
        await fetchTherapistDetail();
      } else {
        alert(`Error: ${data.error || 'Failed to reject therapist'}`);
      }
    } catch (error) {
      console.error("Error rejecting therapist:", error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || dataLoading) {
    return <PageLoadingSpinner text="Loading therapist details..." />;
  }

  if (!user || !userData || userData.role !== "admin") {
    return null;
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Therapist Not Found</CardTitle>
            <CardDescription>
              The therapist you're looking for doesn't exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/therapists">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Therapists
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/admin/therapists">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Therapists
              </Button>
            </Link>
            <div className="flex gap-2">
              {!therapist.therapistProfile?.verification?.isVerified && (
                <>
                  <Button
                    onClick={handleVerify}
                    disabled={actionLoading}
                    variant="default"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={actionLoading}
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {therapist.profile.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {therapist.profile.displayName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {therapist.therapistProfile?.verification?.isVerified ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                    <Clock className="w-4 h-4 mr-1" />
                    Pending Verification
                  </span>
                )}
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    therapist.status === "active"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {therapist.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completeness */}
        {therapist.therapistProfile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Profile Completeness</span>
                <span className="text-2xl font-bold">
                  {calculateCompleteness(therapist)}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      calculateCompleteness(therapist) === 100
                        ? "bg-green-500"
                        : calculateCompleteness(therapist) >= 70
                        ? "bg-blue-500"
                        : calculateCompleteness(therapist) >= 40
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${calculateCompleteness(therapist)}%` }}
                  />
                </div>
                {calculateCompleteness(therapist) < 100 && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Some profile information is incomplete. Sections marked as "Not provided" need attention.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{therapist.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">
                    {therapist.profile.phoneNumber || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        {therapist.therapistProfile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Services Offered</CardTitle>
            </CardHeader>
            <CardContent>
              {therapist.therapistProfile.services &&
              therapist.therapistProfile.services.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {therapist.therapistProfile.services.map((service) => (
                    <span
                      key={service}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Not provided</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Credentials */}
        {therapist.therapistProfile && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Credentials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        License Number
                      </p>
                      <p className="font-medium">
                        {therapist.therapistProfile.credentials.licenseNumber ||
                          "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">License State</p>
                      <p className="font-medium">
                        {therapist.therapistProfile.credentials.licenseState ||
                          "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      License Expiry Date
                    </p>
                    <p className="font-medium">
                      {therapist.therapistProfile.credentials.licenseExpiry
                        ? new Date(
                            therapist.therapistProfile.credentials.licenseExpiry
                          ).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      Specializations
                    </p>
                    {therapist.therapistProfile.credentials.specializations
                      .length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {therapist.therapistProfile.credentials.specializations.map(
                          (spec) => (
                            <span
                              key={spec}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {spec}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Not provided</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      Certifications
                    </p>
                    {therapist.therapistProfile.credentials.certifications
                      .length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {therapist.therapistProfile.credentials.certifications.map(
                          (cert) => (
                            <span
                              key={cert}
                              className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                            >
                              <Award className="w-3 h-3 inline mr-1" />
                              {cert}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Not provided</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Practice Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Practice Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Professional Bio</p>
                    {therapist.therapistProfile.practice.bio ? (
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {therapist.therapistProfile.practice.bio}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic">Not provided</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="font-medium">
                          {therapist.therapistProfile.practice.yearsExperience > 0
                            ? `${therapist.therapistProfile.practice.yearsExperience} years`
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Hourly Rate</p>
                        <p className="font-medium">
                          {therapist.therapistProfile.practice.hourlyRate > 0
                            ? `$${displayHourlyRate(therapist.therapistProfile.practice.hourlyRate)}/hr`
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      Languages
                    </p>
                    {therapist.therapistProfile.practice.languages.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {therapist.therapistProfile.practice.languages.map(
                          (lang) => (
                            <span
                              key={lang}
                              className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                            >
                              {lang}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Not provided</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Session Types</p>
                    {therapist.therapistProfile.practice.sessionTypes.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {therapist.therapistProfile.practice.sessionTypes.map(
                          (type) => (
                            <span
                              key={type}
                              className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full capitalize"
                            >
                              {type}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Not provided</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability Settings */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Availability Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Timezone</p>
                    <p className="font-medium">
                      {therapist.therapistProfile.availability.timezone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Buffer Between Sessions</p>
                    <p className="font-medium">
                      {therapist.therapistProfile.availability.bufferMinutes}{" "}
                      minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Max Daily Hours</p>
                    <p className="font-medium">
                      {therapist.therapistProfile.availability.maxDailyHours}{" "}
                      hours
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Advance Booking</p>
                    <p className="font-medium">
                      {therapist.therapistProfile.availability.advanceBookingDays}{" "}
                      days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Account Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {therapist.metadata?.createdAt && (
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">
                    {new Date(therapist.metadata.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
              {therapist.metadata?.lastLoginAt && (
                <div>
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="font-medium">
                    {new Date(therapist.metadata.lastLoginAt).toLocaleString()}
                  </p>
                </div>
              )}
              {therapist.therapistProfile?.verification?.verifiedAt && (
                <div>
                  <p className="text-sm text-gray-500">Verified At</p>
                  <p className="font-medium">
                    {new Date(
                      therapist.therapistProfile.verification.verifiedAt
                    ).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
