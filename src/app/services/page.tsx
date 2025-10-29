import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { specializations, getPsychologistsBySpecialization } from '@/lib/data/psychologists';

export const metadata: Metadata = {
  title: 'Our Services | MindGood',
  description: 'Explore our range of mental health services including job stress management, career building, family orientation, and learning disability support.',
  keywords: 'mental health services, job stress, career counseling, family therapy, learning disabilities, dyslexia, ADHD',
};

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Our Services</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          We provide specialized mental health support in multiple languages to address a variety of concerns.
        </p>
      </div>

      {/* Services List */}
      <div className="space-y-24">
        {specializations.map((specialization, index) => {
          // Get psychologists for this specialization
          const relatedPsychologists = getPsychologistsBySpecialization(specialization.id).slice(0, 3);
          
          return (
            <section 
              key={specialization.id} 
              id={specialization.id}
              className={`scroll-mt-20 ${index % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-800 py-12 -mx-4 px-4'}`}
            >
              <div className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{specialization.name}</h2>
                  <p className="text-lg text-gray-700 dark:text-gray-300">{specialization.description}</p>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">How We Can Help</h3>
                    
                    {specialization.id === 'job-stress' && (
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Identify workplace stressors and develop coping strategies
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Learn techniques for managing burnout and maintaining work-life balance
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Develop communication skills for difficult workplace situations
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Create personalized stress management plans
                        </li>
                      </ul>
                    )}
                    
                    {specialization.id === 'career-building' && (
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Explore career options aligned with your values and strengths
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Develop strategies for professional growth and advancement
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Navigate career transitions and changes with confidence
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Build resilience for workplace challenges
                        </li>
                      </ul>
                    )}
                    
                    {specialization.id === 'family-orientation' && (
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Improve communication and resolve conflicts within the family
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Address parenting challenges and develop effective strategies
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Navigate life transitions that affect family dynamics
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Strengthen relationships and build a supportive family environment
                        </li>
                      </ul>
                    )}
                    
                    {specialization.id === 'learning-disabilities' && (
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Comprehensive assessment and understanding of learning challenges
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Develop personalized strategies for dyslexia, ADHD, and other learning disabilities
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Support for parents and educators in creating effective learning environments
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Build confidence and self-advocacy skills
                        </li>
                      </ul>
                    )}
                    
                    {specialization.id === 'anxiety' && (
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Learn effective techniques to manage anxiety symptoms
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Identify triggers and develop personalized coping strategies
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Practice mindfulness and relaxation techniques
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Build resilience and confidence in challenging situations
                        </li>
                      </ul>
                    )}
                    
                    {specialization.id === 'depression' && (
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Develop strategies to manage depressive symptoms
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Rebuild motivation and engagement with life
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Address negative thought patterns and build positive thinking
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-teal-500">•</span>
                          Create a support system and self-care routine
                        </li>
                      </ul>
                    )}
                  </div>
                  
                  <div className="pt-4">
                    <Link 
                      href={`/psychologists?specialization=${specialization.id}`}
                      className="inline-flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
                    >
                      Find a specialist <FiArrowRight className="ml-2" />
                    </Link>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden shadow-lg">
                    <Image 
                      src={`/images/services/${specialization.id}.jpg`} 
                      alt={specialization.name}
                      width={600}
                      height={450}
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Related Psychologists */}
                  {relatedPsychologists.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                        Specialists in this area:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {relatedPsychologists.map((psych) => (
                          <Link 
                            key={psych.id}
                            href={`/psychologists/${psych.id}`}
                            className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded-md shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                              <Image 
                                src={psych.image} 
                                alt={psych.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{psych.name}</p>
                              <p className="text-xs text-teal-600 dark:text-teal-400">{psych.languages[0].name}</p>
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
