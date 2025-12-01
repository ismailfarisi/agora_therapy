'use client';

import React, { useState } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';

interface PsychologistFiltersProps {
  onFilterChange: (filters: { specialization: string; language: string; minExperience: string }) => void;
}

// Common specializations - can be moved to a constants file later
const SPECIALIZATIONS = [
  'Anxiety',
  'Depression',
  'Stress Management',
  'Relationship Issues',
  'Career Counseling',
  'Family Therapy',
  'Trauma',
  'Addiction',
  'ADHD',
  'OCD',
];

// Common languages - can be moved to a constants file later
const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Japanese',
  'Arabic',
  'Hindi',
  'Portuguese',
];

const PsychologistFilters: React.FC<PsychologistFiltersProps> = ({ onFilterChange }) => {
  // State for filters
  const [language, setLanguage] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Handle filter changes
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    onFilterChange({ specialization, language: value, minExperience });
  };

  const handleSpecializationChange = (value: string) => {
    setSpecialization(value);
    onFilterChange({ specialization: value, language, minExperience });
  };

  const handleExperienceChange = (value: string) => {
    setMinExperience(value);
    onFilterChange({ specialization, language, minExperience: value });
  };
  
  // Reset filters
  const resetFilters = () => {
    setLanguage('');
    setSpecialization('');
    setMinExperience('');
    onFilterChange({ specialization: '', language: '', minExperience: '' });
  };
  
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
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Languages</option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
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
            onChange={(e) => handleSpecializationChange(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Specializations</option>
            {SPECIALIZATIONS.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
        
        {/* Experience Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Minimum Experience
          </label>
          <select
            value={minExperience}
            onChange={(e) => handleExperienceChange(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Any Experience</option>
            <option value="1">1+ years</option>
            <option value="3">3+ years</option>
            <option value="5">5+ years</option>
            <option value="10">10+ years</option>
          </select>
        </div>
        
        {/* Active Filters */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Active Filters:</h3>
          <div className="flex flex-wrap gap-2">
            {language && (
              <div className="flex items-center bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 text-xs px-2 py-1 rounded-full">
                {language}
                <button onClick={() => handleLanguageChange('')} className="ml-1">
                  <FiX />
                </button>
              </div>
            )}
            {specialization && (
              <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                {specialization}
                <button onClick={() => handleSpecializationChange('')} className="ml-1">
                  <FiX />
                </button>
              </div>
            )}
            {minExperience && (
              <div className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs px-2 py-1 rounded-full">
                {minExperience}+ years
                <button onClick={() => handleExperienceChange('')} className="ml-1">
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
