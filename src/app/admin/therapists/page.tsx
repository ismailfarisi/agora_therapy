/**
 * Admin Therapists Management Page
 * List, verify, and manage all therapists
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
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Therapist {
  id: string;
  email: string;
  profile: {
    displayName: string;
    firstName: string;
    lastName: string;
  };
  therapistProfile?: {
    credentials: {
      licenseNumber: string;
      specializations: string[];
    };
    practice: {
      yearsExperience: number;
      hourlyRate: number;
      languages: string[];
    };
    verification: {
      isVerified: boolean;
      verifiedAt?: any;
    };
  };
  status: string;
}

export default function TherapistsManagement() {
  const { user, userData, loading } = useAuth();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "verified" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user && userData?.role === "admin") {
      fetchTherapists();
    }
  }, [user, userData]);

  useEffect(() => {
    filterTherapists();
  }, [therapists, filter, searchQuery]);

  const fetchTherapists = async () => {
    try {
      setDataLoading(true);
      const response = await fetch('/api/admin/therapists');
      if (response.ok) {
        const data = await response.json();
        setTherapists(data.therapists || []);
      }
    } catch (error) {
      console.error("Error fetching therapists:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const filterTherapists = () => {
    let filtered = therapists;

    // Apply verification filter
    if (filter === "verified") {
      filtered = filtered.filter(
        (t) => t.therapistProfile?.verification?.isVerified
      );
    } else if (filter === "pending") {
      filtered = filtered.filter(
        (t) => !t.therapistProfile?.verification?.isVerified
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.profile.displayName.toLowerCase().includes(query) ||
          t.email.toLowerCase().includes(query) ||
          t.therapistProfile?.credentials.licenseNumber
            .toLowerCase()
            .includes(query)
      );
    }

    setFilteredTherapists(filtered);
  };

  const handleVerify = async (therapistId: string) => {
    try {
      const response = await fetch(`/api/admin/therapists/${therapistId}/verify`, { 
        method: 'POST' 
      });
      if (response.ok) {
        fetchTherapists();
      }
    } catch (error) {
      console.error("Error verifying therapist:", error);
    }
  };

  const handleReject = async (therapistId: string) => {
    try {
      const response = await fetch(`/api/admin/therapists/${therapistId}/reject`, { 
        method: 'POST' 
      });
      if (response.ok) {
        fetchTherapists();
      }
    } catch (error) {
      console.error("Error rejecting therapist:", error);
    }
  };

  if (loading) {
    return <PageLoadingSpinner text="Loading therapists..." />;
  }

  if (!user || !userData || userData.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Therapist Management
              </h1>
              <p className="text-gray-600">
                Verify and manage therapist profiles
              </p>
            </div>
            <Link href="/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Therapists
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{therapists.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {
                  therapists.filter(
                    (t) => t.therapistProfile?.verification?.isVerified
                  ).length
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Review
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {
                  therapists.filter(
                    (t) => !t.therapistProfile?.verification?.isVerified
                  ).length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or license..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={filter === "verified" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("verified")}
                >
                  Verified
                </Button>
                <Button
                  variant={filter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("pending")}
                >
                  Pending
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Therapists List */}
        <Card>
          <CardHeader>
            <CardTitle>Therapists ({filteredTherapists.length})</CardTitle>
            <CardDescription>
              Review and manage therapist applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading therapists...</p>
              </div>
            ) : filteredTherapists.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No therapists found
                </h3>
                <p className="text-gray-600">
                  {searchQuery || filter !== "all"
                    ? "Try adjusting your filters"
                    : "No therapists have registered yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTherapists.map((therapist) => (
                  <div
                    key={therapist.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {therapist.profile.displayName}
                          </h3>
                          {therapist.therapistProfile?.verification
                            ?.isVerified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Email:</span>{" "}
                            {therapist.email}
                          </div>
                          <div>
                            <span className="font-medium">License:</span>{" "}
                            {therapist.therapistProfile?.credentials
                              .licenseNumber || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium">Experience:</span>{" "}
                            {therapist.therapistProfile?.practice
                              .yearsExperience || 0}{" "}
                            years
                          </div>
                          <div>
                            <span className="font-medium">Rate:</span> $
                            {therapist.therapistProfile?.practice.hourlyRate ||
                              0}
                            /hr
                          </div>
                        </div>

                        {therapist.therapistProfile?.credentials
                          .specializations && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {therapist.therapistProfile.credentials.specializations.map(
                              (spec) => (
                                <span
                                  key={spec}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {spec}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {!therapist.therapistProfile?.verification
                          ?.isVerified && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleVerify(therapist.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(therapist.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Link href={`/admin/therapists/${therapist.id}`}>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
