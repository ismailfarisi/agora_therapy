"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiCalendar, FiClock, FiCreditCard, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { TherapistPublicView } from '@/types/models/therapist';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '@/lib/hooks/useAuth';
import CheckoutForm from '@/components/booking/CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type BookingStep = 'datetime' | 'payment' | 'confirmation';

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const therapistId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [therapist, setTherapist] = useState<TherapistPublicView | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<BookingStep>('datetime');
  
  // Booking state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState(50); // minutes
  const [clientNotes, setClientNotes] = useState('');
  
  // Payment state
  const [clientSecret, setClientSecret] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    fetchTherapist();
  }, [therapistId]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push(`/login?redirect=/booking/${therapistId}`);
    }
  }, [authLoading, user, router, therapistId]);

  const fetchTherapist = async () => {
    try {
      const response = await fetch(`/api/public/therapists/${therapistId}`);
      if (response.ok) {
        const data = await response.json();
        setTherapist(data);
      }
    } catch (error) {
      console.error('Error fetching therapist:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({ time, available: true });
      }
    }
    return slots;
  };

  const handleContinueToPayment = async () => {
    if (!selectedDate || !selectedTime || !therapist) {
      alert('Please select a date and time');
      return;
    }

    try {
      setLoading(true);
      
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledFor = new Date(selectedDate);
      scheduledFor.setHours(hours, minutes, 0, 0);

      // Create booking
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapistId,
          scheduledFor: scheduledFor.toISOString(),
          duration,
          sessionType: 'individual',
          clientNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setAppointmentId(data.appointmentId);
      setAmount(data.amount);
      setStep('payment');
    } catch (error) {
      console.error('Error creating booking:', (error as Error).message);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setStep('confirmation');
  };

  // Show loading while checking auth or fetching therapist
  if (authLoading || (loading && !therapist)) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  if (!therapist) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Therapist Not Found</h1>
        <Link href="/psychologists" className="text-teal-600 hover:text-teal-700">
          Back to Therapists
        </Link>
      </div>
    );
  }

  const timeSlots = generateTimeSlots();
  const sessionFee = (therapist.hourlyRate * duration) / 60;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Link 
        href={`/psychologists/${therapist.id}`}
        className="inline-flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-8"
      >
        <FiArrowLeft className="mr-2" /> Back to Profile
      </Link>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-center">
          <div className={`flex items-center ${step === 'datetime' ? 'text-teal-600' : step === 'payment' || step === 'confirmation' ? 'text-teal-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'datetime' || step === 'payment' || step === 'confirmation' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              <FiCalendar />
            </div>
            <span className="ml-2 font-medium hidden sm:inline">Date & Time</span>
          </div>
          <div className={`w-16 h-1 mx-2 ${step === 'payment' || step === 'confirmation' ? 'bg-teal-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step === 'payment' ? 'text-teal-600' : step === 'confirmation' ? 'text-teal-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'payment' || step === 'confirmation' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              <FiCreditCard />
            </div>
            <span className="ml-2 font-medium hidden sm:inline">Payment</span>
          </div>
          <div className={`w-16 h-1 mx-2 ${step === 'confirmation' ? 'bg-teal-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step === 'confirmation' ? 'text-teal-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'confirmation' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              <FiCheckCircle />
            </div>
            <span className="ml-2 font-medium hidden sm:inline">Confirmed</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
          {/* Therapist Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                <Image 
                  src={therapist.image}
                  alt={therapist.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{therapist.name}</h1>
                <p className="text-teal-600 dark:text-teal-400">{therapist.title}</p>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6">
            {step === 'datetime' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Select Date & Time</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Date Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Date
                    </label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      minDate={new Date()}
                      inline
                      className="w-full"
                      calendarClassName="!bg-white dark:!bg-gray-800 !border-gray-300 dark:!border-gray-700"
                    />
                  </div>

                  {/* Time Slots */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Time
                    </label>
                    {selectedDate ? (
                      <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedTime(slot.time)}
                            disabled={!slot.available}
                            className={`p-3 rounded-md text-sm font-medium transition-colors ${
                              selectedTime === slot.time
                                ? 'bg-teal-600 text-white'
                                : slot.available
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                                : 'bg-gray-50 dark:bg-gray-900 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        Please select a date first
                      </p>
                    )}
                  </div>
                </div>

                {/* Session Details */}
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start">
                    <FiInfo className="text-blue-600 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
                    <div className="text-sm text-blue-900 dark:text-blue-100">
                      <p className="font-medium mb-2">Session Information</p>
                      <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                        <li>• Duration: {duration} minutes</li>
                        <li>• Session Fee: ${(sessionFee / 100).toFixed(2)}</li>
                        <li>• Video session via secure platform</li>
                        <li>• You'll receive a confirmation email with meeting link</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes for Therapist (Optional)
                  </label>
                  <textarea
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Any specific concerns or topics you'd like to discuss..."
                  />
                </div>

                {/* Cancellation Policy */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Cancellation Policy</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Free cancellation up to 24 hours before the appointment. Cancellations within 24 hours will incur a 50% charge.
                  </p>
                </div>

                {/* Continue Button */}
                <button
                  onClick={handleContinueToPayment}
                  disabled={!selectedDate || !selectedTime || loading}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </button>
              </div>
            )}

            {step === 'payment' && clientSecret && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Complete Payment</h2>
                
                {/* Booking Summary */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Date:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Time:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{duration} minutes</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-white font-medium">Total:</span>
                      <span className="text-gray-900 dark:text-white font-bold text-lg">
                        ${(amount / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stripe Payment Form */}
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm 
                    clientSecret={clientSecret}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              </div>
            )}

            {step === 'confirmation' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-6">
                  <FiCheckCircle size={40} />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Booking Confirmed!</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  Your appointment with {therapist.name} has been successfully booked. You will receive a confirmation email with the meeting link shortly.
                </p>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg max-w-md mx-auto mb-8">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Appointment Details</h3>
                  <div className="text-left space-y-2 text-gray-700 dark:text-gray-300">
                    <p><strong>Therapist:</strong> {therapist.name}</p>
                    <p><strong>Date:</strong> {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><strong>Time:</strong> {selectedTime}</p>
                    <p><strong>Duration:</strong> {duration} minutes</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/client/appointments"
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium rounded-md hover:opacity-90 transition-opacity"
                  >
                    View My Appointments
                  </Link>
                  <Link 
                    href="/"
                    className="px-6 py-3 bg-transparent border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Return to Homepage
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
