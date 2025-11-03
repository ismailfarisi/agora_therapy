"use client";

import { useEffect, useState } from "react";
import { ClientLayout } from "@/components/client/ClientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Search, 
  MapPin, 
  Star, 
  Calendar, 
  DollarSign,
  Filter,
  Clock
} from "lucide-react";
import Link from "next/link";
import { TherapistService } from "@/lib/services/therapist-service";
import { TherapistProfile } from "@/types/database";

export default function TherapistsPage() {
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");

  useEffect(() => {
    loadTherapists();
  }, []);

  const loadTherapists = async () => {
    try {
      setLoading(true);
      const data = await TherapistService.getAllTherapists();
      setTherapists(data);
    } catch (error) {
      console.error("Error loading therapists:", error);
    } finally {
      setLoading(false);
    }
  };

  const specialties = [
    "all",
    "Anxiety",
    "Depression",
    "Relationships",
    "Trauma",
    "Stress",
    "Family",
  ];

  const filteredTherapists = therapists.filter((therapist) => {
    const matchesSearch =
      searchQuery === "" ||
      therapist.profile?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.profile?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.specializations?.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesSpecialty =
      selectedSpecialty === "all" ||
      therapist.specializations?.includes(selectedSpecialty);

    return matchesSearch && matchesSpecialty;
  });

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Find a Therapist
        </h1>
        <p className="text-lg text-gray-600">
          Browse our qualified therapists and book your session
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by name or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Specialty Filter */}
        <div className="flex gap-2 flex-wrap">
          {specialties.map((specialty) => (
            <Badge
              key={specialty}
              variant={selectedSpecialty === specialty ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedSpecialty(specialty)}
            >
              {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredTherapists.length} therapist
        {filteredTherapists.length !== 1 ? "s" : ""}
      </div>

      {/* Therapists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTherapists.map((therapist) => (
          <Card key={therapist.userId} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {therapist.profile?.firstName?.[0] || "T"}
                      {therapist.profile?.lastName?.[0] || ""}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Dr. {therapist.profile?.firstName}{" "}
                      {therapist.profile?.lastName}
                    </CardTitle>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {therapist.rating?.average?.toFixed(1) || "5.0"}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({therapist.rating?.count || 0})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Specializations */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Specializations
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {therapist.specializations?.slice(0, 3).map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {(therapist.specializations?.length || 0) > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{(therapist.specializations?.length || 0) - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{therapist.yearsOfExperience || 5}+ years experience</span>
                </div>

                {/* Location */}
                {therapist.profile?.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{therapist.profile.location}</span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>
                    ${therapist.pricing?.sessionRate || 100}/session
                  </span>
                </div>

                {/* Bio Preview */}
                {therapist.bio && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {therapist.bio}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button asChild className="flex-1">
                    <Link href={`/client/therapists/${therapist.userId}`}>
                      View Profile
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/client/book/${therapist.userId}`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Book
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTherapists.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No therapists found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}
    </ClientLayout>
  );
}
