import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { psychologists, specializations, languages } from '@/lib/data/psychologists';
import PsychologistFilters from '@/components/psychologists/PsychologistFilters';

export const metadata: Metadata = {
  title: 'Find a Psychologist | MindGood',
  description: 'Connect with professional psychologists who speak your language. Filter by specialization, language, and experience level.',
  keywords: 'psychologist, therapist, counselor, mental health, Malayalam, Tamil, Hindi, Telugu, Kannada',
};

import { Suspense } from 'react';

export default function PsychologistsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]">Loading...</div>}>
        <div className="space-y-12">
          <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Find Your Psychologist</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          Browse our directory of experienced psychologists and filter by language, specialization, and more to find the perfect match for your needs.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters - Client Component */}
        <div className="lg:col-span-1">
          <PsychologistFilters 
            specializations={specializations} 
            languages={languages} 
          />
        </div>

        {/* Psychologists Grid - Server Component */}
        <div className="lg:col-span-3">
          <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {psychologists.map((psychologist) => (
              <div 
                key={psychologist.id}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image 
                    src={psychologist.image} 
                    alt={psychologist.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">{psychologist.name}</h2>
                  <p className="text-teal-600 dark:text-teal-400 mb-2">{psychologist.title}</p>
                  
                  {/* Languages */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {psychologist.languages.slice(0, 2).map((lang) => (
                        <span 
                          key={lang.code}
                          className="text-xs px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-full"
                        >
                          {lang.name}
                        </span>
                      ))}
                      {psychologist.languages.length > 2 && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                          +{psychologist.languages.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Specializations */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {psychologist.specializations.slice(0, 2).map((spec) => (
                        <span 
                          key={spec}
                          className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                        >
                          {spec.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                      {psychologist.specializations.length > 2 && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                          +{psychologist.specializations.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center text-yellow-500">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      </div>
                      <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">
                        {psychologist.rating}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {psychologist.experience} yrs exp
                    </span>
                  </div>
                  
                  <Link 
                    href={`/psychologists/${psychologist.id}`}
                    className="block w-full mt-4 py-2 text-center bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-md hover:opacity-90 transition-opacity"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
