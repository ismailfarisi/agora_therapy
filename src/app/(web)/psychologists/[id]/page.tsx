"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiStar, FiClock, FiBookOpen, FiAward } from 'react-icons/fi';
import CalendlyEmbed from '@/components/booking/CalendlyEmbed';
import { TherapistPublicView } from '@/types/models/therapist';

export default function PsychologistDetail() {
  const params = useParams();
  const id = params.id as string;
  const [psychologist, setPsychologist] = useState<TherapistPublicView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTherapist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchTherapist = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/public/therapists/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPsychologist(data);
      } else {
        setError(true);
      }
    } catch (error) {
      console.error('Error fetching therapist:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading therapist profile...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !psychologist) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Therapist Not Found</h1>
        <p className="mb-8 text-gray-700 dark:text-gray-300">The therapist you are looking for does not exist or has been removed.</p>
        <Link 
          href="/psychologists"
          className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
        >
          <FiArrowLeft className="mr-2" /> Back to All Therapists
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Link 
        href="/psychologists"
        className="inline-flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-8"
      >
        <FiArrowLeft className="mr-2" /> Back to All Psychologists
      </Link>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row">
              <div className="relative w-full md:w-64 h-64">
                <Image 
                  src={psychologist.image} 
                  alt={psychologist.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{psychologist.name}</h1>
                <p className="text-teal-600 dark:text-teal-400 text-lg mb-3">{psychologist.title}</p>
                
                {/* Rating */}
                {psychologist.rating && (
                  <div className="flex items-center mb-4">
                    <div className="flex items-center text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <FiStar 
                          key={i} 
                          className={`${i < Math.floor(psychologist.rating!) ? 'fill-current' : ''}`} 
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      {psychologist.rating.toFixed(1)} {psychologist.reviewCount && `(${psychologist.reviewCount} reviews)`}
                    </span>
                  </div>
                )}
                
                {/* Languages */}
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {psychologist.languages.map((lang, idx) => (
                      <span 
                        key={idx}
                        className="text-sm px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-full"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Experience */}
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <FiClock className="mr-2" />
                  <span>{psychologist.experience} years of experience</span>
                </div>
              </div>
            </div>
            
            {/* Tabs Content */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                <FiBookOpen className="mr-2" /> About
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">{psychologist.bio}</p>
              
              <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {psychologist.specializations.map((spec, idx) => (
                  <span 
                    key={idx}
                    className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Booking */}
        <div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Book a Consultation</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Select a convenient time slot for your consultation with {psychologist.name}.
            </p>
            
            {/* Booking Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Hourly Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ${(psychologist.hourlyRate / 100).toFixed(2)}/hr
              </p>
              <button className="w-full py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-md hover:opacity-90 transition-opacity">
                Book Consultation
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Booking integration coming soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
