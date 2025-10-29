'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiChevronDown, FiChevronUp, FiSearch } from 'react-icons/fi';

// FAQ data structure
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// FAQ categories
const categories = [
  'General',
  'Appointments',
  'Payments',
  'Therapy',
  'Technical',
];

// FAQ data
const faqData: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What is MindGood?',
    answer: 'MindGood is a multilingual mental health platform that connects individuals with licensed psychologists who speak their native language. Our platform offers online therapy sessions, resources, and support in Malayalam, Tamil, Hindi, Telugu, Kannada, and English.',
    category: 'General',
  },
  {
    id: 'faq-2',
    question: 'How do I book an appointment with a psychologist?',
    answer: 'Booking an appointment is simple. Browse our list of psychologists, filter by language or specialization if needed, and select a psychologist that matches your requirements. On their profile page, you can view their availability and book a session directly through our integrated Calendly system.',
    category: 'Appointments',
  },
  {
    id: 'faq-3',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards through our secure Stripe payment gateway. Payment is required at the time of booking to confirm your appointment.',
    category: 'Payments',
  },
  {
    id: 'faq-4',
    question: 'What is your cancellation policy?',
    answer: 'You can reschedule or cancel your appointment up to 24 hours before the scheduled time without any charge. Cancellations made less than 24 hours before the appointment may be subject to a cancellation fee of 50% of the session cost.',
    category: 'Appointments',
  },
  {
    id: 'faq-5',
    question: 'Are the therapy sessions confidential?',
    answer: 'Absolutely. We maintain strict confidentiality in accordance with professional ethical standards and legal requirements. Your personal information and session details are encrypted and securely stored. Our psychologists are bound by professional confidentiality requirements.',
    category: 'Therapy',
  },
  {
    id: 'faq-6',
    question: 'How long is a typical therapy session?',
    answer: 'Standard therapy sessions are 50 minutes long. Some psychologists may offer extended sessions of 80 minutes for certain types of therapy or initial consultations.',
    category: 'Therapy',
  },
  {
    id: 'faq-7',
    question: 'Can I change my psychologist if I\'m not comfortable?',
    answer: 'Yes, you can switch to a different psychologist at any time. We understand that finding the right match is important for effective therapy. You can browse other psychologists on our platform and book with someone new for your next session.',
    category: 'Therapy',
  },
  {
    id: 'faq-8',
    question: 'Do you offer emergency mental health services?',
    answer: 'MindGood is not an emergency service. If you\'re experiencing a mental health emergency or crisis, please contact your local emergency services, go to your nearest emergency room, or call a crisis helpline immediately.',
    category: 'General',
  },
  {
    id: 'faq-9',
    question: 'How do I join my online therapy session?',
    answer: 'Once your appointment is confirmed, you\'ll receive an email with a link to join your session. You can also access this link from your dashboard under "Upcoming Appointments." Simply click the link at the scheduled time to join the video session. We recommend testing your camera and microphone beforehand.',
    category: 'Technical',
  },
  {
    id: 'faq-10',
    question: 'What if I experience technical issues during my session?',
    answer: 'If you encounter technical difficulties during your session, try refreshing your browser or reconnecting. If problems persist, you can contact our technical support team via the chat function on our website or by emailing support@mindgood.com. If significant session time is lost due to technical issues on our end, we\'ll arrange a complimentary make-up session.',
    category: 'Technical',
  },
  {
    id: 'faq-11',
    question: 'Are your psychologists licensed?',
    answer: 'Yes, all psychologists on MindGood are licensed professionals with valid credentials. We verify their qualifications, experience, and licensing status before they join our platform. You can view each psychologist\'s qualifications on their profile page.',
    category: 'General',
  },
  {
    id: 'faq-12',
    question: 'Can I get a receipt for insurance reimbursement?',
    answer: 'Yes, after each session, you\'ll receive a receipt that you can submit to your insurance provider for potential reimbursement. Please check with your insurance company about their specific requirements for mental health service coverage.',
    category: 'Payments',
  },
  {
    id: 'faq-13',
    question: 'How do I update my payment information?',
    answer: 'You can update your payment information by logging into your account, navigating to the "Settings" section in your dashboard, and selecting "Payment Methods." From there, you can add, edit, or remove payment methods.',
    category: 'Payments',
  },
  {
    id: 'faq-14',
    question: 'What languages do your psychologists speak?',
    answer: 'Our psychologists collectively offer services in Malayalam, Tamil, Hindi, Telugu, Kannada, and English. You can filter psychologists by language on our search page to find professionals who speak your preferred language.',
    category: 'General',
  },
  {
    id: 'faq-15',
    question: 'How do I prepare for my first therapy session?',
    answer: 'For your first session, find a quiet, private space where you won\'t be interrupted. Have a good internet connection and test your camera and microphone beforehand. Consider what you\'d like to discuss and any goals you have for therapy. It\'s normal to feel nervous, but remember that the first session is often about getting to know each other and establishing comfort.',
    category: 'Therapy',
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  // Filter FAQs based on category and search query
  const filteredFAQs = faqData.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-16 mt-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-center text-gray-700 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          Find answers to common questions about MindGood`s services, appointments, payments, and more. If you can`t find what you`re looking for, please contact our support team.
        </p>
        
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeCategory === 'All'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeCategory === category
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item) => (
              <div 
                key={item.id}
                className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full flex justify-between items-center p-4 md:p-6 text-left bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white">{item.question}</h3>
                  {openItems.includes(item.id) ? (
                    <FiChevronUp className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  ) : (
                    <FiChevronDown className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  )}
                </button>
                
                {openItems.includes(item.id) && (
                  <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-800">
                    <p className="text-gray-700 dark:text-gray-300">{item.answer}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                No FAQs found matching your search.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
                className="text-teal-600 dark:text-teal-400 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
        
        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-6 text-white text-center">
          <h2 className="text-xl font-bold mb-3">Still have questions?</h2>
          <p className="mb-4 opacity-90">
            Our support team is ready to help you with any questions or concerns.
          </p>
          <Link 
            href="/contact"
            className="inline-block px-6 py-2 bg-white text-teal-600 rounded-full font-medium hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
