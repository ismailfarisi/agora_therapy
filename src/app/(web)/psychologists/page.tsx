"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PsychologistFilters from '@/components/psychologists/PsychologistFilters';

interface Therapist {
  id: string;
  name: string;
  title: string;
  image: string;
  languages: string[];
  specializations: string[];
  experience: number;
  bio: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
}

export default function PsychologistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: '',
    language: '',
    minExperience: '',
  });

  useEffect(() => {
    fetchTherapists();
  }, [filters]);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.specialization) params.append('specialization', filters.specialization);
      if (filters.language) params.append('language', filters.language);
      if (filters.minExperience) params.append('minExperience', filters.minExperience);

      const response = await fetch(`/api/public/therapists?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTherapists(data.therapists);
      }
    } catch (error) {
      console.error('Error fetching therapists:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Find Your Therapist</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Browse our directory of verified, experienced therapists and filter by language, specialization, and more to find the perfect match for your needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters - Client Component */}
          <div className="lg:col-span-1">
            <PsychologistFilters 
              onFilterChange={setFilters}
            />
          </div>

          {/* Therapists Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading therapists...</p>
                </div>
              </div>
            ) : therapists.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">No therapists found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {therapists.map((therapist) => (
                  <div 
                    key={therapist.id}
                    className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-800">
                      <Image 
                        src={therapist.image} 
                        alt={therapist.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{therapist.name}</h2>
                        {therapist.isVerified && (
                          <span className="text-blue-600 dark:text-blue-400" title="Verified Therapist">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <p className="text-teal-600 dark:text-teal-400 mb-2">{therapist.title}</p>
                      
                      {/* Languages */}
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {therapist.languages.slice(0, 2).map((lang, idx) => (
                            <span 
                              key={idx}
                              className="text-xs px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-full"
                            >
                              {lang}
                            </span>
                          ))}
                          {therapist.languages.length > 2 && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                              +{therapist.languages.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Specializations */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {therapist.specializations.slice(0, 2).map((spec, idx) => (
                            <span 
                              key={idx}
                              className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                            >
                              {spec}
                            </span>
                          ))}
                          {therapist.specializations.length > 2 && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                              +{therapist.specializations.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="flex items-center text-yellow-500">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          </div>
                          <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">
                            {therapist.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {therapist.experience} yrs exp
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${(therapist.hourlyRate / 100).toFixed(2)}/hr
                        </span>
                      </div>
                      
                      <Link 
                        href={`/psychologists/${therapist.id}`}
                        className="block w-full mt-4 py-2 text-center bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-md hover:opacity-90 transition-opacity"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
