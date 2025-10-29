'use client';

import React, { useState } from 'react';
import StripePayment from '@/components/payment/StripePayment';
import Link from 'next/link';

export default function PaymentDemoPage() {
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ml' | 'hi' | 'ta'>('en');

  const handlePaymentSuccess = () => {
    setPaymentComplete(!paymentComplete);
    // In a real app, you might redirect to a confirmation page
    // or update the appointment status in the database
  };

  const handleLanguageChange = (language: 'en' | 'ml' | 'hi' | 'ta') => {
    setSelectedLanguage(language);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  ];

  // Demo appointment details
  const demoAppointment = {
    psychologistName: "Dr. Anjali Sharma",
    appointmentDate: "2023-11-15T14:30:00",
    amount: 1500,
  };

  const translations = {
    en: {
      title: "Payment Demo",
      subtitle: "Test the multilingual payment component",
      description: "This page demonstrates the StripePayment component with multilingual support.",
      appointmentDetails: "Appointment Details",
      psychologist: "Psychologist",
      date: "Date",
      time: "Time",
      amount: "Amount",
      selectLanguage: "Select Language",
      backToHome: "Back to Home"
    },
    ml: {
      title: "പേയ്‌മെന്റ് ഡെമോ",
      subtitle: "ബഹുഭാഷാ പേയ്‌മെന്റ് കോമ്പോണന്റ് പരിശോധിക്കുക",
      description: "ഈ പേജ് ബഹുഭാഷാ പിന്തുണയോടെയുള്ള StripePayment കോമ്പോണന്റ് പ്രദർശിപ്പിക്കുന്നു.",
      appointmentDetails: "അപ്പോയിന്റ്മെന്റ് വിശദാംശങ്ങൾ",
      psychologist: "മനഃശാസ്ത്രജ്ഞൻ",
      date: "തീയതി",
      time: "സമയം",
      amount: "തുക",
      selectLanguage: "ഭാഷ തിരഞ്ഞെടുക്കുക",
      backToHome: "ഹോമിലേക്ക് മടങ്ങുക"
    },
    hi: {
      title: "भुगतान डेमो",
      subtitle: "बहुभाषी भुगतान कॉम्पोनेंट का परीक्षण करें",
      description: "यह पेज बहुभाषी समर्थन के साथ StripePayment कॉम्पोनेंट का प्रदर्शन करता है।",
      appointmentDetails: "अपॉइंटमेंट विवरण",
      psychologist: "मनोवैज्ञानिक",
      date: "तारीख",
      time: "समय",
      amount: "राशि",
      selectLanguage: "भाषा चुनें",
      backToHome: "होम पर वापस जाएं"
    },
    ta: {
      title: "கட்டண டெமோ",
      subtitle: "பல மொழி கட்டண கூறுகளை சோதிக்கவும்",
      description: "இந்தப் பக்கம் பல மொழி ஆதரவுடன் StripePayment கூறுகளைக் காட்டுகிறது.",
      appointmentDetails: "சந்திப்பு விவரங்கள்",
      psychologist: "உளவியலாளர்",
      date: "தேதி",
      time: "நேரம்",
      amount: "தொகை",
      selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
      backToHome: "முகப்புக்குத் திரும்பு"
    }
  };

  // Get translations based on selected language
  const t = translations[selectedLanguage];

  // Format date and time
  const appointmentDate = new Date(demoAppointment.appointmentDate);
  const formattedDate = appointmentDate.toLocaleDateString(
    selectedLanguage === 'en' ? 'en-US' : 'en-IN', 
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
  const formattedTime = appointmentDate.toLocaleTimeString(
    selectedLanguage === 'en' ? 'en-US' : 'en-IN', 
    { hour: '2-digit', minute: '2-digit' }
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.title}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{t.subtitle}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">{t.selectLanguage}:</span>
            <div className="flex space-x-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code as 'en' | 'ml' | 'hi' | 'ta')}
                  className={`flex items-center px-3 py-1 rounded-md transition-colors ${
                    selectedLanguage === lang.code
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-2">{lang.flag}</span>
                  <span className="text-sm">{lang.code.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{t.appointmentDetails}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.psychologist}</p>
              <p className="font-medium text-gray-800 dark:text-white">{demoAppointment.psychologistName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.date}</p>
              <p className="font-medium text-gray-800 dark:text-white">{formattedDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.time}</p>
              <p className="font-medium text-gray-800 dark:text-white">{formattedTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.amount}</p>
              <p className="font-medium text-gray-800 dark:text-white">
                ₹{demoAppointment.amount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <StripePayment
            amount={demoAppointment.amount}
            onSuccess={handlePaymentSuccess}
            psychologistName={demoAppointment.psychologistName}
            appointmentDate={demoAppointment.appointmentDate}
            language={selectedLanguage}
          />
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            {t.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
