'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiFilter, FiX } from 'react-icons/fi';
import { Specialization } from '@/lib/data/psychologists';

interface PsychologistFiltersProps {
  specializations: Specialization[];
  languages: { name: string; code: string }[];
}

const PsychologistFilters: React.FC<PsychologistFiltersProps> = ({ specializations, languages }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial filter values from URL
  const initialLanguage = searchParams.get('language') || '';
  const initialSpecialization = searchParams.get('specialization') || '';
  const initialExperience = searchParams.get('experience') || '';
  
  // State for filters
  const [language, setLanguage] = useState(initialLanguage);
  const [specialization, setSpecialization] = useState(initialSpecialization);
  const [experience, setExperience] = useState(initialExperience);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (language) params.set('language', language);
    if (specialization) params.set('specialization', specialization);
    if (experience) params.set('experience', experience);
    
    router.push(`/psychologists?${params.toString()}`);
  };
  
  // Reset filters
  const resetFilters = () => {
    setLanguage('');
    setSpecialization('');
    setExperience('');
    router.push('/psychologists');
  };
  
  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [language, specialization, experience]);
  
  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-700 dark:text-gray-300"
        >
          <FiFilter />
          {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      
      {/* Filter Container */}
      <div className={`${isFilterOpen ? 'block' : 'hidden'} lg:block bg-white dark:bg-gray-900 rounded-lg shadow-md p-5`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
          <button
            onClick={resetFilters}
            className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
          >
            Reset All
          </button>
        </div>
        
        {/* Language Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Languages</option>
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Specialization Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Specialization
          </label>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Experience Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Experience
          </label>
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Any Experience</option>
            <option value="0-5">0-5 years</option>
            <option value="5-10">5-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
        
        {/* Active Filters */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Active Filters:</h3>
          <div className="flex flex-wrap gap-2">
            {language && (
              <div className="flex items-center bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 text-xs px-2 py-1 rounded-full">
                {languages.find(l => l.code === language)?.name}
                <button onClick={() => setLanguage('')} className="ml-1">
                  <FiX />
                </button>
              </div>
            )}
            {specialization && (
              <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                {specializations.find(s => s.id === specialization)?.name}
                <button onClick={() => setSpecialization('')} className="ml-1">
                  <FiX />
                </button>
              </div>
            )}
            {experience && (
              <div className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs px-2 py-1 rounded-full">
                {experience} years
                <button onClick={() => setExperience('')} className="ml-1">
                  <FiX />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PsychologistFilters;
