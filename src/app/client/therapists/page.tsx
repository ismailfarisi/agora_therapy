"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Star,
  User as UserIcon,
} from "lucide-react";
import {
  TherapistProfile,
  TherapistAvailability,
  TimeSlot,
  User as UserType,
} from "@/types/database";
import { TherapistService } from "@/lib/services/therapist-service";
import { TimeSlotService } from "@/lib/services/timeslot-service";
import { UserProfileService } from "@/lib/services/user-profile-service";
import TherapistCard from "@/components/booking/TherapistCard";
import { useRouter } from "next/navigation";

interface EnhancedTherapistProfile extends TherapistProfile {
  user: UserType;
}

interface TherapistWithAvailability {
  profile: EnhancedTherapistProfile;
  availability: TherapistAvailability[];
  timeSlots: TimeSlot[];
}

interface Filters {
  specialization: string;
  location: string;
  availability: string;
  searchTerm: string;
}

export default function TherapistsPage() {
  const [therapists, setTherapists] = useState<TherapistWithAvailability[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<
    TherapistWithAvailability[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    specialization: "",
    location: "",
    availability: "",
    searchTerm: "",
  });

  const router = useRouter();

  useEffect(() => {
    loadTherapists();
  }, []);

  const loadTherapists = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Loading therapists with availability...");

      // Load therapists, availability, and time slots in parallel
      const [therapistProfiles, allAvailability, allTimeSlots] =
        await Promise.all([
          TherapistService.searchTherapists({}),
          TherapistService.getAllTherapistsWithAvailability(),
          TimeSlotService.getTimeSlots(),
        ]);

      console.log("Loaded data:", {
        therapistProfiles: therapistProfiles.length,
        availability: allAvailability.length,
        timeSlots: allTimeSlots.length,
      });

      // Combine the data
      const therapistsWithAvailability: TherapistWithAvailability[] =
        await Promise.all(
          therapistProfiles.map(async (profile) => {
            const user = await UserProfileService.getUserProfile(profile.id);
            if (!user) {
              // Skip if user profile is not found
              return null;
            }

            const availability = allAvailability
              .filter((avail) => avail.therapist.id === profile.id)
              .flatMap((avail) => avail.availability);

            const timeSlots = allTimeSlots.filter((slot: TimeSlot) =>
              availability.some((avail) => avail.timeSlotId === slot.id)
            );

            return {
              profile: { ...profile, user },
              availability,
              timeSlots,
            };
          })
        ).then(
          (results) =>
            results.filter(
              (result) => result !== null
            ) as TherapistWithAvailability[]
        );

      console.log(
        "Combined therapists with availability:",
        therapistsWithAvailability
      );

      setTherapists(therapistsWithAvailability);
      setFilteredTherapists(therapistsWithAvailability);
    } catch (error) {
      console.error("Error loading therapists:", error);
      setError("Failed to load therapists. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filters, therapists]);

  const applyFilters = () => {
    let filtered = [...therapists];

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (therapist) =>
          therapist.profile.user.profile.firstName
            .toLowerCase()
            .includes(searchLower) ||
          therapist.profile.user.profile.lastName
            .toLowerCase()
            .includes(searchLower) ||
          therapist.profile.credentials?.specializations?.some((spec) =>
            spec.toLowerCase().includes(searchLower)
          ) ||
          therapist.profile.practice.bio?.toLowerCase().includes(searchLower)
      );
    }

    // Specialization filter
    if (filters.specialization) {
      filtered = filtered.filter((therapist) =>
        therapist.profile.credentials?.specializations?.includes(
          filters.specialization
        )
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter((therapist) =>
        therapist.profile.user.profile.timezone
          ?.toLowerCase()
          .includes(filters.location.toLowerCase())
      );
    }

    // Availability filter - now uses real availability data
    if (filters.availability === "available") {
      filtered = filtered.filter(
        (therapist) =>
          therapist.availability.length > 0 &&
          therapist.profile.verification.isVerified
      );
    }

    setFilteredTherapists(filtered);
  };

  const handleBookNow = (therapistId: string) => {
    router.push(`/client/booking/${therapistId}`);
  };

  const handleViewProfile = (therapistId: string) => {
    router.push(`/client/therapists/${therapistId}`);
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading therapists...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadTherapists}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get unique specializations for filter
  const allSpecializations = Array.from(
    new Set(
      therapists.flatMap((t) => t.profile.credentials?.specializations || [])
    )
  ).sort();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find a Therapist</h1>
        <p className="text-muted-foreground">
          Connect with qualified therapists who can help you
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search therapists..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter("searchTerm", e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.specialization}
              onValueChange={(value) =>
                updateFilter("specialization", value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Specializations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {allSpecializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Location"
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
            />

            <Select
              value={filters.availability}
              onValueChange={(value) =>
                updateFilter("availability", value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Therapists" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Therapists</SelectItem>
                <SelectItem value="available">Available Now</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {(filters.searchTerm ||
            filters.specialization ||
            filters.location ||
            filters.availability) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {filters.searchTerm}
                  <button
                    onClick={() => updateFilter("searchTerm", "")}
                    className="ml-1 hover:bg-gray-200 rounded"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.specialization && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.specialization}
                  <button
                    onClick={() => updateFilter("specialization", "")}
                    className="ml-1 hover:bg-gray-200 rounded"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Location: {filters.location}
                  <button
                    onClick={() => updateFilter("location", "")}
                    className="ml-1 hover:bg-gray-200 rounded"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.availability && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Available Now
                  <button
                    onClick={() => updateFilter("availability", "")}
                    className="ml-1 hover:bg-gray-200 rounded"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setFilters({
                    specialization: "",
                    location: "",
                    availability: "",
                    searchTerm: "",
                  })
                }
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          {filteredTherapists.length} Therapist
          {filteredTherapists.length !== 1 ? "s" : ""} Found
        </h2>
      </div>

      {filteredTherapists.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No therapists found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or removing some filters.
            </p>
            <Button
              onClick={() =>
                setFilters({
                  specialization: "",
                  location: "",
                  availability: "",
                  searchTerm: "",
                })
              }
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTherapists.map((therapist) => (
            <TherapistCard
              key={therapist.profile.id}
              therapist={therapist.profile}
              availability={therapist.availability}
              timeSlots={therapist.timeSlots}
              onBookNow={handleBookNow}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
