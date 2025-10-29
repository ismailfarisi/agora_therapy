import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FiUsers, FiGlobe, FiHeart, FiCheck } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'About Us | MindGood',
  description: 'Learn about MindGood, our mission to provide accessible mental health support in multiple Indian languages, and our team of qualified psychologists.',
  keywords: 'about MindGood, mental health mission, multilingual therapy, Indian languages, psychologists',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">About MindGood</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
          Breaking language barriers to make mental health support accessible to everyone across India.
        </p>
      </div>
      
      {/* Our Story */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Our Story</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              MindGood was founded with a simple yet powerful vision: to make quality mental health support accessible to everyone in their native language.
            </p>
            <p>
              We recognized that language barriers often prevent people from seeking the help they need, especially in a diverse country like India with multiple regional languages. Many individuals feel more comfortable expressing their deepest thoughts and emotions in their mother tongue.
            </p>
            <p>
              Our platform connects individuals with licensed psychologists who speak Malayalam, Tamil, Hindi, Telugu, Kannada, and English, ensuring that language is never a barrier to receiving quality mental health support.
            </p>
            <p>
              Today, MindGood is growing into a community where cultural understanding meets professional expertise, making mental healthcare truly accessible for all.
            </p>
          </div>
        </div>
        <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
          <Image 
            src="/images/about/our-story.jpg" 
            alt="MindGood team meeting"
            fill
            className="object-cover"
          />
        </div>
      </div>
      
      {/* Our Mission & Values */}
      <div className="mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Our Mission & Values</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            We`re guided by a commitment to accessible, culturally-sensitive mental healthcare.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4">
              <FiUsers size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Accessibility</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We believe mental health support should be available to everyone, regardless of language or location.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <FiGlobe size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Cultural Competence</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We honor diverse cultural backgrounds and ensure our approach is sensitive to cultural nuances.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
              <FiHeart size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Compassion</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We approach every individual with empathy, understanding, and genuine care for their wellbeing.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
              <FiCheck size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Quality</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We maintain high standards of professional care with licensed and experienced psychologists.
            </p>
          </div>
        </div>
      </div>
      
      {/* Why Choose Us */}
      <div className="mb-24 bg-gray-50 dark:bg-gray-800 py-16 -mx-4 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Why Choose MindGood</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Our unique approach to mental health support sets us apart.
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-full">
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">01</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Language-First Approach</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We prioritize matching you with psychologists who speak your preferred language fluently, ensuring nothing gets lost in translation during your sessions.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-full">
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">02</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Cultural Understanding</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Our psychologists understand the cultural contexts that shape mental health experiences in different communities across India.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-full">
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">03</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Specialized Expertise</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  From job stress to learning disabilities, our psychologists have specialized training to address specific mental health concerns.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-full">
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">04</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Seamless Booking</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Our integration with Calendly makes scheduling appointments simple and convenient, with secure payment options through Stripe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-8 md:p-12 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Start Your Mental Health Journey Today</h2>
          <p className="text-lg mb-8 opacity-90">
            Connect with a psychologist who speaks your language and understands your cultural background.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/psychologists"
              className="px-8 py-3 bg-white text-teal-600 rounded-full font-bold hover:bg-gray-100 transition-colors"
            >
              Find a Psychologist
            </Link>
            <Link 
              href="/services"
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-colors"
            >
              Explore Our Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
