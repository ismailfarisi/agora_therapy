"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TherapistProfile } from "@/types/database";
import TherapistService from "@/lib/services/therapist-service";
import { UserProfileService } from "@/lib/services/user-profile-service";
import { User } from "@/types/database";
import BookingFlow from "@/components/booking/BookingFlow";

export default function TherapistPage() {
  const { id } = useParams();
  const [therapist, setTherapist] = useState<TherapistProfile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof id === "string") {
      const fetchTherapistData = async () => {
        try {
          setLoading(true);
          const therapistProfile = await TherapistService.getProfile(id);
          const userProfile = await UserProfileService.getUserProfile(id);
          if (therapistProfile && userProfile) {
            setTherapist(therapistProfile);
            setUser(userProfile);
          } else {
            setError("Therapist not found");
          }
        } catch (err) {
          setError("Failed to fetch therapist data");
        } finally {
          setLoading(false);
        }
      };

      fetchTherapistData();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!therapist || !user) {
    return <div>Therapist not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">
        {user.profile.firstName} {user.profile.lastName}
      </h1>
      <p className="text-xl text-gray-600 mb-4">
        {therapist.credentials.specializations.join(", ")}
      </p>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-2">About</h2>
        <p>{therapist.practice.bio}</p>
      </div>
      <div className="mt-8">
        <BookingFlow therapist={therapist} />
      </div>
    </div>
  );
}
