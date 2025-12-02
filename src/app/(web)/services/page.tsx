"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
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
  const [therapistsByService, setTherapistsByService] = useState<Record<string, TherapistCard[]>>({});
  const [loading, setLoading] = useState(true);

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

  const fetchTherapistsForService = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/public/therapists?specialization=${serviceId}`);
      if (response.ok) {
        const data = await response.json();
        setTherapistsByService(prev => ({
          ...prev,
          [serviceId]: data.therapists.slice(0, 3)
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
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          We provide specialized mental health support in multiple languages to address a variety of concerns.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 dark:text-gray-400 text-lg">No services available at the moment.</p>
        </div>
      ) : (
        <div className="space-y-24">
          {services.map((service, index) => {
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
                    <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900 dark:to-blue-900 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="text-6xl mb-4">🧠</div>
                        <p className="text-gray-600 dark:text-gray-300 font-medium">{service.name}</p>
                      </div>
                    </div>
                    
                    {/* Related Therapists */}
                    {relatedTherapists.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                          Specialists in this area:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {relatedTherapists.map((therapist) => (
                            <Link 
                              key={therapist.id}
                              href={`/psychologists/${therapist.id}`}
                              className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded-md shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                <Image 
                                  src={therapist.image} 
                                  alt={therapist.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{therapist.name}</p>
                                <p className="text-xs text-teal-600 dark:text-teal-400">
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
