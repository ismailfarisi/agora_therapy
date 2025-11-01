import ContactForm from '@/components/ui/ContactForm';
import { Metadata } from 'next';
import { FiMail, FiPhone, FiMapPin, FiMessageSquare } from 'react-icons/fi';


export const metadata: Metadata = {
  title: 'Contact Us | MindGood',
  description: 'Get in touch with MindGood for questions about our mental health services, booking appointments, or general inquiries.',
  keywords: 'contact MindGood, mental health support, psychologist appointment, help, inquiries',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Contact Us</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          Have questions or need assistance? We`re here to help you on your mental health journey.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md text-center">
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto mb-4">
            <FiMail size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Email</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            For general inquiries and support
          </p>
          <a 
            href="mailto:support@mindgood.com" 
            className="text-teal-600 dark:text-teal-400 font-medium hover:underline"
          >
            support@mindgood.com
          </a>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-4">
            <FiPhone size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Phone</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            Available Monday to Friday, 9am - 6pm
          </p>
          <a 
            href="tel:+918001234567" 
            className="text-teal-600 dark:text-teal-400 font-medium hover:underline"
          >
            +91 800 123 4567
          </a>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 mx-auto mb-4">
            <FiMapPin size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Office</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            Our headquarters location
          </p>
          <address className="text-teal-600 dark:text-teal-400 font-medium not-italic">
            123 Mental Health Street<br />
            Bangalore, Karnataka 560001
          </address>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Contact Form */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white flex items-center">
              <FiMessageSquare className="mr-2" /> Send Us a Message
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Fill out the form below and we`ll get back to you as soon as possible.
            </p>
          </div>
          
          <ContactForm />
        </div>
        
        {/* FAQ */}
        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                How do I book an appointment with a psychologist?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                You can book an appointment by visiting a psychologist`s profile and using the Calendly scheduling tool to select a convenient time slot.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                We accept all major credit and debit cards through our secure Stripe payment gateway. Payment is processed at the time of booking.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                How are the online sessions conducted?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Sessions are conducted via secure video conferencing. After booking, you`ll receive a link to join your session at the scheduled time.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Can I change or cancel my appointment?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Yes, you can reschedule or cancel your appointment through the confirmation email you received. Please note that cancellations less than 24 hours before the appointment may incur a fee.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Is my information kept confidential?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Absolutely. We adhere to strict privacy and confidentiality standards. Your personal information and session details are securely protected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
