import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiStar, FiClock, FiBookOpen, FiAward } from 'react-icons/fi';
import { getPsychologistById } from '@/lib/data/psychologists';
import CalendlyEmbed from '@/components/booking/CalendlyEmbed';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}



// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const id =  (await params).id;
  const psychologist = getPsychologistById(id);
  
  if (!psychologist) {
    return {
      title: 'Psychologist Not Found - MindGood',
      description: 'The requested psychologist profile could not be found.',
    };
  }

  return {
    title: `${psychologist.name} - ${psychologist.title} | MindGood`,
    description: `Book a consultation with ${psychologist.name}, a ${psychologist.title} with ${psychologist.experience} years of experience. Specializing in ${psychologist.specializations.join(', ')}.`,
    keywords: `${psychologist.name}, psychologist, mental health, ${psychologist.languages.map(l => l.name).join(', ')}, ${psychologist.specializations.join(', ')}`,
  };
}

export default async function PsychologistDetail({ params, searchParams }: PageProps) {
  const id =  (await params).id;
  const psychologist = getPsychologistById(id);
  
  if (!psychologist) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Psychologist Not Found</h1>
        <p className="mb-8">The psychologist you are looking for does not exist or has been removed.</p>
        <Link 
          href="/psychologists"
          className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
        >
          <FiArrowLeft className="mr-2" /> Back to All Psychologists
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
                <div className="flex items-center mb-4">
                  <div className="flex items-center text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i} 
                        className={`${i < Math.floor(psychologist.rating) ? 'fill-current' : ''}`} 
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {psychologist.rating} ({psychologist.reviewCount} reviews)
                  </span>
                </div>
                
                {/* Languages */}
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {psychologist.languages.map((lang) => (
                      <span 
                        key={lang.code}
                        className="text-sm px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-full"
                      >
                        {lang.name} ({lang.proficiency})
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
              
              <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white flex items-center">
                <FiAward className="mr-2" /> Education & Credentials
              </h3>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 mb-6">
                {psychologist.education.map((edu, index) => (
                  <li key={index} className="mb-1">{edu}</li>
                ))}
              </ul>
              
              <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {psychologist.specializations.map((spec) => (
                  <span 
                    key={spec}
                    className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                  >
                    {spec.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
            
            {/* Calendly Integration */}
            <div className="h-[600px] border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <CalendlyEmbed url={psychologist.calendlyLink} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
