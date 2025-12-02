"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { Language } from '@/lib/constants/languages';
import { Service } from '@/types/models/service';
import { TherapistPublicView } from '@/types/models/therapist';

export default function Home() {
  const [popularLanguages, setPopularLanguages] = useState<Language[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [featuredTherapists, setFeaturedTherapists] = useState<TherapistPublicView[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [therapistsLoading, setTherapistsLoading] = useState(true);

  useEffect(() => {
    fetchLanguages();
    fetchServices();
    fetchFeaturedTherapists();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await fetch('/api/public/languages');
      if (response.ok) {
        const data = await response.json();
        // Get the popular Indian languages
        const popular = data.languages.filter((lang: Language) => 
          data.popularIndianLanguages.includes(lang.code)
        );
        setPopularLanguages(popular.slice(0, 6)); // Show first 6
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
      // Fallback to default languages
      setPopularLanguages([
        { code: 'ml', name: 'Malayalam', region: 'India' },
        { code: 'ta', name: 'Tamil', region: 'India' },
        { code: 'hi', name: 'Hindi', region: 'India' },
        { code: 'te', name: 'Telugu', region: 'India' },
        { code: 'kn', name: 'Kannada', region: 'India' },
        { code: 'en', name: 'English', region: 'India' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/public/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services.slice(0, 6)); // Show first 6 services
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchFeaturedTherapists = async () => {
    try {
      const response = await fetch('/api/public/therapists?featured=true');
      if (response.ok) {
        const data = await response.json();
        setFeaturedTherapists(data.therapists.slice(0, 3)); // Show first 3 featured
      }
    } catch (error) {
      console.error('Error fetching featured therapists:', error);
    } finally {
      setTherapistsLoading(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-500/10 to-blue-600/10 dark:from-teal-900/20 dark:to-blue-900/20 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
                Mental Health Support in <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">Your Language</span>
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Connect with professional psychologists who speak Malayalam, Tamil, Hindi, Telugu, and Kannada. Get support for job stress, career building, family issues, and learning disabilities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="/psychologists" 
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium hover:opacity-90 transition-opacity text-center"
                >
                  Find a Psychologist
                </Link>
                <Link 
                  href="/services" 
                  className="px-6 py-3 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-center"
                >
                  Explore Services
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 rounded-lg overflow-hidden shadow-xl">
                <Image 
                  src="/images/hero-image.webp" 
                  alt="Psychologist session" 
                  width={600} 
                  height={400}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl z-0"></div>
              <div className="absolute -top-6 -left-6 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Language Support Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Support in Your Language</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform connects you with psychologists who speak your native language, ensuring effective communication and cultural understanding.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {popularLanguages.map((language) => (
                <div key={language.code} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-teal-500/20 to-blue-600/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                      {language.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{language.name}</h3>
                  {language.nativeName && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{language.nativeName}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Our Services</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              We provide specialized support for a variety of mental health concerns.
            </p>
          </div>
          
          {servicesLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div key={service.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{service.name}</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">{service.description}</p>
                    <Link 
                      href={`/psychologists?specialization=${service.id}`}
                      className="inline-flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                    >
                      Find Therapists <FiArrowRight className="ml-2" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link 
              href="/psychologists"
              className="inline-flex items-center px-6 py-3 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              View All Psychologists <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Therapists */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Featured Therapists</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Meet our top-rated, verified therapists ready to help you in your language of choice.
            </p>
          </div>
          
          {therapistsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : featuredTherapists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">No featured therapists available at the moment.</p>
              <Link 
                href="/psychologists"
                className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-md hover:opacity-90 transition-opacity"
              >
                View All Therapists
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTherapists.map((therapist) => (
                <div key={therapist.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-64 overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <Image 
                      src={therapist.image} 
                      alt={therapist.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{therapist.name}</h3>
                      {therapist.isVerified && (
                        <span className="text-blue-600 dark:text-blue-400" title="Verified Therapist">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <p className="text-teal-600 dark:text-teal-400 mb-3">{therapist.title}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {therapist.languages.slice(0, 3).map((lang, idx) => (
                        <span 
                          key={idx}
                          className="text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-full"
                        >
                          {lang}
                        </span>
                      ))}
                      {therapist.languages.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                          +{therapist.languages.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {therapist.experience} years experience
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${(therapist.hourlyRate / 100).toFixed(0)}/hr
                      </span>
                    </div>
                    <Link 
                      href={`/psychologists/${therapist.id}`}
                      className="block w-full py-2 text-center bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-md hover:opacity-90 transition-opacity"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link 
              href="/psychologists"
              className="inline-flex items-center px-6 py-3 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              View All Therapists <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">How It Works</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Getting started with MindGood is simple and straightforward.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Find Your Match',
                description: 'Browse our directory of psychologists and filter by language, specialization, and availability.'
              },
              {
                title: 'Book a Session',
                description: 'Schedule a consultation through our integrated Calendly system at a time that works for you.'
              },
              {
                title: 'Start Your Journey',
                description: 'Connect with your psychologist via secure video call and begin your path to better mental health.'
              }
            ].map((step, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-700 dark:text-gray-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-500 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Take the First Step?</h2>
            <p className="text-lg mb-8 opacity-90">
              Connect with a psychologist who understands your language and culture. Start your journey to better mental health today.
            </p>
            <Link 
              href="/psychologists"
              className="inline-block px-8 py-4 bg-white text-teal-600 rounded-full font-bold hover:bg-gray-100 transition-colors"
            >
              Find Your Psychologist
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
