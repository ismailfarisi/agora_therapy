import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { specializations, psychologists } from "@/lib/data/psychologists";

// This component is server-rendered for better SEO
export default function Home() {
  // Get featured psychologists (first 3)
  const featuredPsychologists = psychologists.slice(0, 3);

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
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {['Malayalam', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'English'].map((language) => (
              <div key={language} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-teal-500/20 to-blue-600/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {language.charAt(0)}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">{language}</h3>
              </div>
            ))}
          </div>
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specializations.slice(0, 6).map((specialization) => (
              <div key={specialization.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{specialization.name}</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{specialization.description}</p>
                  <Link 
                    href={`/services#${specialization.id}`}
                    className="inline-flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                  >
                    Learn more <FiArrowRight className="ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Psychologists */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Meet Our Psychologists</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Our team of experienced professionals is ready to help you in your language of choice.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPsychologists.map((psychologist) => (
              <div key={psychologist.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-64 overflow-hidden">
                  <Image 
                    src={psychologist.image} 
                    alt={psychologist.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">{psychologist.name}</h3>
                  <p className="text-teal-600 dark:text-teal-400 mb-3">{psychologist.title}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {psychologist.languages.map((lang) => (
                      <span 
                        key={lang.code}
                        className="text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-full"
                      >
                        {lang.name}
                      </span>
                    ))}
                  </div>
                  <Link 
                    href={`/psychologists/${psychologist.id}`}
                    className="block w-full py-2 text-center bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-md hover:opacity-90 transition-opacity"
                  >
                    Book Consultation
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
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
