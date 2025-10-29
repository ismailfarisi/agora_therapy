'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiCalendar, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { getPsychologistById } from '@/lib/data/psychologists';
import CalendlyEmbed from '@/components/booking/CalendlyEmbed';
import StripePayment from '@/components/payment/StripePayment';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}


export default async function Page( { params, searchParams }: PageProps) {
  const { id } = await params;
  return <BookingPage id={id} />;
}

const BookingPage: React.FC<{ id: string }> = ({ id }) => {

  const psychologist = getPsychologistById(id);
  
  const [bookingStep, setBookingStep] = useState<'calendar' | 'payment' | 'confirmation'>('calendar');
  const [appointmentDetails, setAppointmentDetails] = useState<{
    date: string;
    time: string;
  } | null>(null);
  
  // This would normally come from your backend based on the psychologist&apos;s rates
  const consultationFee = 1500; // ₹1500
  
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

  // Simulate Calendly event selection
  const handleCalendlyEventScheduled = () => {
    // In a real implementation, you would get this data from the Calendly event
    setAppointmentDetails({
      date: 'July 15, 2025',
      time: '10:00 AM',
    });
    
    // Move to payment step
    setBookingStep('payment');
  };
  
  // Handle successful payment
  const handlePaymentSuccess = () => {
    setBookingStep('confirmation');
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Link 
        href={`/psychologists/${psychologist.id}`}
        className="inline-flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-8"
      >
        <FiArrowLeft className="mr-2" /> Back to Psychologist Profile
      </Link>
      
      {/* Booking Steps */}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              bookingStep === 'calendar' || bookingStep === 'payment' || bookingStep === 'confirmation'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              <FiCalendar />
            </div>
            <div className={`w-16 h-1 ${
              bookingStep === 'payment' || bookingStep === 'confirmation'
                ? 'bg-teal-500'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              bookingStep === 'payment' || bookingStep === 'confirmation'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              <FiCreditCard />
            </div>
            <div className={`w-16 h-1 ${
              bookingStep === 'confirmation'
                ? 'bg-teal-500'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              bookingStep === 'confirmation'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              <FiCheckCircle />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
          {/* Step Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                <Image 
                  src={psychologist.image} 
                  alt={psychologist.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{psychologist.name}</h1>
                <p className="text-teal-600 dark:text-teal-400">{psychologist.title}</p>
              </div>
            </div>
          </div>
          
          {/* Step Content */}
          <div className="p-6">
            {bookingStep === 'calendar' && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Select Appointment Date & Time</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Choose a convenient time slot for your consultation with {psychologist.name}.
                </p>
                
                <div className="h-[600px] border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <CalendlyEmbed url={psychologist.calendlyLink} />
                </div>
                
                {/* For demo purposes, we'll add a button to simulate Calendly event selection */}
                <div className="mt-6 text-center">
                  <button
                    onClick={handleCalendlyEventScheduled}
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium rounded-md hover:opacity-90 transition-opacity"
                  >
                    Simulate Appointment Selection
                  </button>
                </div>
              </div>
            )}
            
            {bookingStep === 'payment' && appointmentDetails && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Complete Payment</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Secure your appointment with {psychologist.name} by completing the payment.
                </p>
                
                <StripePayment 
                  amount={consultationFee}
                  onSuccess={handlePaymentSuccess}
                  psychologistName={psychologist.name}
                  appointmentDate={`${appointmentDetails.date} at ${appointmentDetails.time}`}
                />
              </div>
            )}
            
            {bookingStep === 'confirmation' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-6">
                  <FiCheckCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Booking Confirmed!</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  Your appointment with {psychologist.name} has been successfully booked and confirmed.
                  You will receive a confirmation email with all the details.
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg max-w-md mx-auto mb-8">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Appointment Details</h3>
                  <div className="text-left space-y-2 text-gray-700 dark:text-gray-300">
                    <p><strong>Psychologist:</strong> {psychologist.name}</p>
                    <p><strong>Date:</strong> {appointmentDetails?.date}</p>
                    <p><strong>Time:</strong> {appointmentDetails?.time}</p>
                    <p><strong>Duration:</strong> 50 minutes</p>
                    <p><strong>Amount Paid:</strong> ₹{consultationFee.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/"
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium rounded-md hover:opacity-90 transition-opacity"
                  >
                    Return to Homepage
                  </Link>
                  <Link 
                    href="/psychologists"
                    className="px-6 py-3 bg-transparent border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Browse More Psychologists
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

