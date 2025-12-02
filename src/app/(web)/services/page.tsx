"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight, FiSearch } from 'react-icons/fi';
import { Service } from '@/types/models/service';

interface TherapistCard {
  id: string;
  name: string;
  image: string;
  languages: string[];
  specializations: string[];
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [therapistsByService, setTherapistsByService] = useState<Record<string, TherapistCard[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/public/services');
      if (response.ok) {
        const data = await response.json();
        const activeServices = data.services.filter((s: Service) => s.detailedDescription || s.helpPoints);
        setServices(activeServices);
        setFilteredServices(activeServices);
        
        // Fetch therapists for each service
        activeServices.forEach((service: Service) => {
          fetchTherapistsForService(service.id);
        });
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter services based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredServices(services);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = services.filter((service) => 
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.detailedDescription?.toLowerCase().includes(query) ||
        service.helpPoints?.some(point => point.toLowerCase().includes(query))
      );
      setFilteredServices(filtered);
    }
  }, [searchQuery, services]);

  const fetchTherapistsForService = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/public/therapists?specialization=${serviceId}`);
      if (response.ok) {
        const data = await response.json();
        setTherapistsByService(prev => ({
          ...prev,
          [serviceId]: data.therapists.slice(0, 6) // Get 6 therapists
        }));
      }
    } catch (error) {
      console.error(`Error fetching therapists for ${serviceId}:`, error);
    }
  };
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Our Services</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          We provide specialized mental health support in multiple languages to address a variety of concerns.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services (e.g., anxiety, depression, couples therapy...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Found {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {searchQuery ? `No services found for "${searchQuery}"` : 'No services available at the moment.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-24">
          {filteredServices.map((service, index) => {
            const relatedTherapists = therapistsByService[service.id] || [];
            
            return (
              <section 
                key={service.id} 
                id={service.id}
                className={`scroll-mt-20 ${index % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-800 py-12 -mx-4 px-4'}`}
              >
                <div className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                  <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{service.name}</h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      {service.detailedDescription || service.description}
                    </p>
                    
                    {service.helpPoints && service.helpPoints.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">How We Can Help</h3>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                          {service.helpPoints.map((point, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2 text-teal-500">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="pt-4">
                      <Link 
                        href={`/psychologists?specialization=${service.id}`}
                        className="inline-flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
                      >
                        Find a specialist <FiArrowRight className="ml-2" />
                      </Link>
                    </div>
                  </div>
                  
                  <div className="relative">
                    {/* Related Therapists Grid */}
                    {relatedTherapists.length > 0 && (
                      <div className="mt-6">
                        <div className="grid grid-cols-3 gap-0 rounded-lg overflow-hidden shadow-lg">
                          {relatedTherapists.map((therapist) => (
                            <Link 
                              key={therapist.id}
                              href={`/psychologists/${therapist.id}`}
                              className="relative aspect-square group overflow-hidden"
                            >
                              {/* Full Image Background */}
                              <Image 
                                src={therapist.image} 
                                alt={therapist.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              
                              {/* Gradient Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                              
                              {/* Text Overlay at Bottom */}
                              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                <p className="font-semibold text-sm leading-tight mb-1">
                                  {therapist.name}
                                </p>
                                <p className="text-xs opacity-90">
                                  {therapist.languages[0] || 'Multiple languages'}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
      
      {/* CTA Section */}
      <div className="mt-24 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-8 md:p-12 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Take the First Step?</h2>
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
    </div>
  );
}
