'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import CalendlyEmbed from '@/components/booking/CalendlyEmbed';
import StripePayment from '@/components/payment/StripePayment';
import { Psychologist } from '@/lib/data/psychologists';

interface BookingClientProps {
  psychologist: Psychologist;
}

export default function BookingClient({ psychologist }: BookingClientProps) {
  const router = useRouter();
  
  const [bookingStep, setBookingStep] = useState<'calendar' | 'payment' | 'confirmation'>('calendar');
  const [appointmentDetails, setAppointmentDetails] = useState<{
    date: string;
    time: string;
  } | null>(null);
  
  // This would normally come from your backend based on the psychologist's rates
  const consultationFee = 1500; // ₹1500

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
  
  const handlePaymentSuccess = () => {
    setBookingStep('confirmation');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Booking Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className={`flex flex-col items-center ${bookingStep === 'calendar' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                bookingStep === 'calendar' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
              }`}>
                <FiCalendar className="w-5 h-5" />
              </div>
              <span className="mt-2 text-sm font-medium">Schedule</span>
            </div>
            
            <div className="w-16 h-0.5 bg-gray-200 mx-2"></div>
            
            <div className={`flex flex-col items-center ${bookingStep === 'payment' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                bookingStep === 'payment' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
              }`}>
                <FiCreditCard className="w-5 h-5" />
              </div>
              <span className="mt-2 text-sm font-medium">Payment</span>
            </div>
            
            <div className="w-16 h-0.5 bg-gray-200 mx-2"></div>
            
            <div className={`flex flex-col items-center ${bookingStep === 'confirmation' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                bookingStep === 'confirmation' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
              }`}>
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <span className="mt-2 text-sm font-medium">Confirmation</span>
            </div>
          </div>
        </div>
        
        {/* Booking Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {bookingStep === 'calendar' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Schedule an Appointment</h2>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Please select a convenient date and time for your session with {psychologist.name}.
              </p>
              
              <div className="mb-6">
                <CalendlyEmbed url={psychologist.id} />
                
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
            </div>
          )}
          
          {bookingStep === 'payment' && appointmentDetails && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h3 className="font-medium mb-2">Appointment Details</h3>
                <p className="text-gray-600 dark:text-gray-300">Date: {appointmentDetails.date}</p>
                <p className="text-gray-600 dark:text-gray-300">Time: {appointmentDetails.time}</p>
                <p className="text-gray-600 dark:text-gray-300">Psychologist: {psychologist.name}</p>
                <p className="font-medium mt-2">Amount: ₹{consultationFee}</p>
              </div>
              
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
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your appointment with {psychologist.name} has been scheduled and confirmed.
                You will receive a confirmation email with all the details.
              </p>
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md max-w-md mx-auto text-left">
                <h3 className="font-medium mb-2">Appointment Details</h3>
                <p className="text-gray-600 dark:text-gray-300">Date: {appointmentDetails?.date}</p>
                <p className="text-gray-600 dark:text-gray-300">Time: {appointmentDetails?.time}</p>
                <p className="text-gray-600 dark:text-gray-300">Psychologist: {psychologist.name}</p>
                <p className="font-medium mt-2">Amount Paid: ₹{consultationFee}</p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium rounded-md hover:opacity-90 transition-opacity"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
