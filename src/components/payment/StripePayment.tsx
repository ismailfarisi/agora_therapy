'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe, StripeCardElementChangeEvent } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { FiLock, FiCreditCard, FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import { FaApplePay, FaGooglePay, FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa';
import LanguageSelector from './LanguageSelector';

// In production, this should be loaded from environment variables
// For security, use NEXT_PUBLIC_ prefix for client-side env variables
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

// Multilingual content for payment component
const translations = {
  en: {
    paymentSuccessful: 'Payment Successful!',
    confirmationMessage: 'Your appointment has been confirmed. You will receive a confirmation email shortly.',
    appointmentReference: 'Appointment Reference:',
    transactionId: 'Transaction ID:',
    appointmentSummary: 'Appointment Summary',
    psychologist: 'Psychologist:',
    dateTime: 'Date & Time:',
    totalAmount: 'Total Amount:',
    billingInformation: 'Billing Information',
    fullName: 'Full Name *',
    emailAddress: 'Email Address *',
    phoneNumber: 'Phone Number',
    paymentMethod: 'Payment Method',
    cardOption: 'Credit/Debit Card',
    upiOption: 'UPI',
    netbankingOption: 'Net Banking',
    cardDetails: 'Card Details *',
    testCardInfo: 'For testing, use card number: 4242 4242 4242 4242',
    upiInstructions: 'Enter your UPI ID to make a payment directly from your bank account.',
    verify: 'Verify',
    demoNote: 'Note: This is a demo. No actual payment will be processed.',
    netbankingInstructions: 'Select your bank to proceed with net banking payment.',
    selectBank: 'Select your bank',
    processing: 'Processing Payment...',
    paySecurely: 'Pay Securely',
    securePayment: 'Secure payment processed by Stripe',
    formError: 'Please fill in all required fields and complete payment information.',
    processingError: 'Payment processing is not available right now. Please try again later.'
  },
  ml: {
    paymentSuccessful: 'പേയ്‌മെന്റ് വിജയകരമായി!',
    confirmationMessage: 'നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് സ്ഥിരീകരിച്ചു. നിങ്ങൾക്ക് ഉടൻ തന്നെ ഒരു സ്ഥിരീകരണ ഇമെയിൽ ലഭിക്കും.',
    appointmentReference: 'അപ്പോയിന്റ്മെന്റ് റഫറൻസ്:',
    transactionId: 'ഇടപാട് ഐഡി:',
    appointmentSummary: 'അപ്പോയിന്റ്മെന്റ് സംഗ്രഹം',
    psychologist: 'മനഃശാസ്ത്രജ്ഞൻ:',
    dateTime: 'തീയതിയും സമയവും:',
    totalAmount: 'ആകെ തുക:',
    billingInformation: 'ബില്ലിംഗ് വിവരങ്ങൾ',
    fullName: 'മുഴുവൻ പേര് *',
    emailAddress: 'ഇമെയിൽ വിലാസം *',
    phoneNumber: 'ഫോൺ നമ്പർ',
    paymentMethod: 'പണമടയ്ക്കൽ രീതി',
    cardOption: 'ക്രെഡിറ്റ്/ഡെബിറ്റ് കാർഡ്',
    upiOption: 'UPI',
    netbankingOption: 'നെറ്റ് ബാങ്കിംഗ്',
    cardDetails: 'കാർഡ് വിശദാംശങ്ങൾ *',
    testCardInfo: 'പരിശോധനയ്ക്കായി, കാർഡ് നമ്പർ ഉപയോഗിക്കുക: 4242 4242 4242 4242',
    upiInstructions: 'നിങ്ങളുടെ ബാങ്ക് അക്കൗണ്ടിൽ നിന്ന് നേരിട്ട് പണമടയ്ക്കാൻ നിങ്ങളുടെ UPI ഐഡി നൽകുക.',
    verify: 'പരിശോധിക്കുക',
    demoNote: 'കുറിപ്പ്: ഇത് ഒരു ഡെമോ ആണ്. യഥാർത്ഥ പണമിടപാട് നടത്തുന്നതല്ല.',
    netbankingInstructions: 'നെറ്റ് ബാങ്കിംഗ് പേയ്‌മെന്റ് തുടരുന്നതിന് നിങ്ങളുടെ ബാങ്ക് തിരഞ്ഞെടുക്കുക.',
    selectBank: 'നിങ്ങളുടെ ബാങ്ക് തിരഞ്ഞെടുക്കുക',
    processing: 'പണമിടപാട് നടക്കുന്നു...',
    paySecurely: 'സുരക്ഷിതമായി പണമടയ്ക്കുക',
    securePayment: 'സ്ട്രൈപ്പ് വഴി സുരക്ഷിത പണമിടപാട്',
    formError: 'ദയവായി എല്ലാ ആവശ്യമുള്ള ഫീൽഡുകളും പൂരിപ്പിച്ച് പേയ്‌മെന്റ് വിവരങ്ങൾ പൂർത്തിയാക്കുക.',
    processingError: 'പേയ്‌മെന്റ് പ്രോസസ്സിംഗ് ഇപ്പോൾ ലഭ്യമല്ല. ദയവായി പിന്നീട് വീണ്ടും ശ്രമിക്കുക.'
  },
  hi: {
    paymentSuccessful: 'भुगतान सफल!',
    confirmationMessage: 'आपकी अपॉइंटमेंट की पुष्टि हो गई है। आपको जल्द ही एक पुष्टिकरण ईमेल प्राप्त होगा।',
    appointmentReference: 'अपॉइंटमेंट संदर्भ:',
    transactionId: 'लेनदेन आईडी:',
    appointmentSummary: 'अपॉइंटमेंट सारांश',
    psychologist: 'मनोवैज्ञानिक:',
    dateTime: 'दिनांक और समय:',
    totalAmount: 'कुल राशि:',
    billingInformation: 'बिलिंग जानकारी',
    fullName: 'पूरा नाम *',
    emailAddress: 'ईमेल पता *',
    phoneNumber: 'फोन नंबर',
    paymentMethod: 'भुगतान का तरीका',
    cardOption: 'क्रेडिट/डेबिट कार्ड',
    upiOption: 'UPI',
    netbankingOption: 'नेट बैंकिंग',
    cardDetails: 'कार्ड विवरण *',
    testCardInfo: 'परीक्षण के लिए, कार्ड नंबर का उपयोग करें: 4242 4242 4242 4242',
    upiInstructions: 'अपने बैंक खाते से सीधे भुगतान करने के लिए अपनी UPI आईडी दर्ज करें।',
    verify: 'सत्यापित करें',
    demoNote: 'नोट: यह एक डेमो है। कोई वास्तविक भुगतान प्रोसेस नहीं किया जाएगा।',
    netbankingInstructions: 'नेट बैंकिंग भुगतान के लिए अपना बैंक चुनें।',
    selectBank: 'अपना बैंक चुनें',
    processing: 'भुगतान प्रोसेसिंग...',
    paySecurely: 'सुरक्षित भुगतान करें',
    securePayment: 'स्ट्राइप द्वारा सुरक्षित भुगतान प्रोसेसिंग',
    formError: 'कृपया सभी आवश्यक फ़ील्ड भरें और भुगतान जानकारी पूरी करें।',
    processingError: 'भुगतान प्रोसेसिंग अभी उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।'
  },
  ta: {
    paymentSuccessful: 'கட்டணம் வெற்றிகரமாக செலுத்தப்பட்டது!',
    confirmationMessage: 'உங்கள் சந்திப்பு உறுதி செய்யப்பட்டுள்ளது. விரைவில் உறுதிப்படுத்தல் மின்னஞ்சலைப் பெறுவீர்கள்.',
    appointmentReference: 'சந்திப்பு குறிப்பு:',
    transactionId: 'பரிவர்த்தனை ஐடி:',
    appointmentSummary: 'சந்திப்பு சுருக்கம்',
    psychologist: 'உளவியலாளர்:',
    dateTime: 'தேதி & நேரம்:',
    totalAmount: 'மொத்த தொகை:',
    billingInformation: 'பில்லிங் தகவல்',
    fullName: 'முழு பெயர் *',
    emailAddress: 'மின்னஞ்சல் முகவரி *',
    phoneNumber: 'தொலைபேசி எண்',
    paymentMethod: 'கட்டண முறை',
    cardOption: 'கிரெடிட்/டெபிட் கார்டு',
    upiOption: 'UPI',
    netbankingOption: 'நெட் பேங்கிங்',
    cardDetails: 'கார்டு விவரங்கள் *',
    testCardInfo: 'சோதனைக்கு, கார்டு எண்ணைப் பயன்படுத்தவும்: 4242 4242 4242 4242',
    upiInstructions: 'உங்கள் வங்கி கணக்கில் இருந்து நேரடியாக பணம் செலுத்த உங்கள் UPI ஐடியை உள்ளிடவும்.',
    verify: 'சரிபார்க்கவும்',
    demoNote: 'குறிப்பு: இது ஒரு டெமோ. உண்மையான பணப்பரிவர்த்தனை செயல்படுத்தப்படாது.',
    netbankingInstructions: 'நெட் பேங்கிங் கட்டணத்தைத் தொடர உங்கள் வங்கியைத் தேர்ந்தெடுக்கவும்.',
    selectBank: 'உங்கள் வங்கியைத் தேர்ந்தெடுக்கவும்',
    processing: 'கட்டணம் செயலாக்கப்படுகிறது...',
    paySecurely: 'பாதுகாப்பாக செலுத்துங்கள்',
    securePayment: 'ஸ்ட்ரைப் மூலம் பாதுகாப்பான கட்டண செயலாக்கம்',
    formError: 'அனைத்து தேவையான புலங்களையும் நிரப்பி கட்டண தகவலை முடிக்கவும்.',
    processingError: 'கட்டண செயலாக்கம் தற்போது கிடைக்கவில்லை. பிறகு மீண்டும் முயற்சிக்கவும்.'
  }
};

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  psychologistName: string;
  appointmentDate: string;
  language?: 'en' | 'ml' | 'hi' | 'ta'; // Add language prop for multilingual support
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  amount, 
  onSuccess, 
  psychologistName,
  appointmentDate,
  language = 'en' // Default to English
}) => {
  // State to track the current language
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ml' | 'hi' | 'ta'>(language as 'en' | 'ml' | 'hi' | 'ta');
  
  // Get translations based on selected language
  const t = translations[currentLanguage] || translations.en;
  
  // Handle language change
  const handleLanguageChange = (newLang: string) => {
    setCurrentLanguage(newLang as 'en' | 'ml' | 'hi' | 'ta');
  };
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [cardComplete, setCardComplete] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Form validation
  const isFormComplete = () => {
    return (
      billingDetails.name.trim() !== '' && 
      billingDetails.email.trim() !== '' && 
      (paymentMethod !== 'card' || cardComplete)
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setPaymentError(t.processingError);
      return;
    }

    if (!isFormComplete()) {
      setPaymentError(t.formError);
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    // In a real implementation, you would create a payment intent on your server
    // and return the client secret to complete the payment on the client side
    
    try {
      // Simulate API call to create payment intent
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // This is where you would normally confirm the payment with Stripe
      // const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      //   payment_method: {
      //     card: elements.getElement(CardElement)!,
      //     billing_details: {
      //       name: billingDetails.name,
      //       email: billingDetails.email,
      //       phone: billingDetails.phone
      //     }
      //   }
      // });
      
      // if (error) {
      //   throw new Error(error.message);
      // }
      
      // For demo, we'll just simulate success
      setPaymentSuccess(true);
      
      // Log analytics event (in a real app)
      console.log('Payment successful', { amount, psychologistName, appointmentDate });
      
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error: unknown) {
      console.error('Payment error:', error);
      setPaymentError((error as Error).message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCardChange = (event: StripeCardElementChangeEvent) => {
    setCardComplete(event.complete);
    if (event.error) {
      setPaymentError(event.error.message);
    } else {
      setPaymentError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-end mb-4">
        <LanguageSelector 
          currentLanguage={currentLanguage} 
          onLanguageChange={handleLanguageChange} 
          compact={true} 
        />
      </div>
      {paymentSuccess ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-4">
            <FiCheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{t.paymentSuccessful}</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {t.confirmationMessage}
          </p>
          <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            <p>{t.appointmentReference} <span className="font-medium">MG-{Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}</span></p>
            <p>{t.transactionId} <span className="font-medium">TXN-{Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}</span></p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 p-4 rounded-md border border-teal-100 dark:border-teal-800/30 mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t.appointmentSummary}</h3>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p><span className="font-medium">{t.psychologist}</span> {psychologistName}</p>
              <p><span className="font-medium">{t.dateTime}</span> {appointmentDate}</p>
              <div className="mt-3 pt-3 border-t border-teal-100 dark:border-teal-800/30 flex justify-between items-center">
                <span className="font-medium">{t.totalAmount}</span>
                <span className="text-lg font-bold">₹{amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t.billingInformation}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  id="name"
                  value={billingDetails.name}
                  onChange={(e) => setBillingDetails({...billingDetails, name: e.target.value})}
                  required
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.emailAddress}
                </label>
                <input
                  type="email"
                  id="email"
                  value={billingDetails.email}
                  onChange={(e) => setBillingDetails({...billingDetails, email: e.target.value})}
                  required
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.phoneNumber}
              </label>
              <input
                type="tel"
                id="phone"
                value={billingDetails.phone}
                onChange={(e) => setBillingDetails({...billingDetails, phone: e.target.value})}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t.paymentMethod}</h3>
            
            <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-3 px-4 text-center ${paymentMethod === 'card' ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}
              >
                <FiCreditCard className="inline mr-2" /> {t.cardOption}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`flex-1 py-3 px-4 text-center ${paymentMethod === 'upi' ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {t.upiOption}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`flex-1 py-3 px-4 text-center ${paymentMethod === 'netbanking' ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {t.netbankingOption}
              </button>
            </div>

            {paymentMethod === 'card' && (
              <div>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t.cardDetails}
                    </label>
                    <div className="flex space-x-1">
                      <FaCcVisa className="text-blue-700" size={20} />
                      <FaCcMastercard className="text-red-600" size={20} />
                      <FaCcAmex className="text-blue-500" size={20} />
                    </div>
                  </div>
                  <div className="border border-gray-300 dark:border-gray-700 rounded-md p-4 bg-white dark:bg-gray-800">
                    <CardElement
                      onChange={handleCardChange}
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                          invalid: {
                            color: '#9e2146',
                          },
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <FiInfo className="mr-2 text-teal-500" />
                  {t.testCardInfo}
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="p-4 border border-gray-300 dark:border-gray-700 rounded-md">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {t.upiInstructions}
                </p>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="yourname@upi"
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-l-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button 
                    type="button" 
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 rounded-r-md"
                  >
                    {t.verify}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {t.demoNote}
                </p>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="p-4 border border-gray-300 dark:border-gray-700 rounded-md">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {t.netbankingInstructions}
                </p>
                <select className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                  <option value="">{t.selectBank}</option>
                  <option value="sbi">State Bank of India</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="axis">Axis Bank</option>
                  <option value="kotak">Kotak Mahindra Bank</option>
                </select>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {t.demoNote}
                </p>
              </div>
            )}
          </div>
          
          {paymentError && (
            <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md text-sm flex items-start">
              <FiAlertTriangle className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}
          
          <button
            type="submit"
            disabled={!stripe || isProcessing || !isFormComplete()}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-70"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t.processing}
              </>
            ) : (
              <>
                <FiLock />
                {t.paySecurely} ₹{amount.toFixed(2)}
              </>
            )}
          </button>
          
          <div className="flex flex-col items-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            <div className="flex items-center mb-2">
              <FiLock className="mr-2" />
              {t.securePayment}
            </div>
            <div className="flex space-x-3">
              <FaCcVisa size={24} />
              <FaCcMastercard size={24} />
              <FaCcAmex size={24} />
              <FaApplePay size={24} />
              <FaGooglePay size={24} />
            </div>
          </div>
        </>
      )}
    </form>
  );
};

interface StripePaymentProps {
  amount: number;
  onSuccess: () => void;
  psychologistName: string;
  appointmentDate: string;
  language?: 'en' | 'ml' | 'hi' | 'ta'; // Add language prop
}

const StripePayment: React.FC<StripePaymentProps> = (props) => {
  // Get language from URL or context if not provided as prop
  const [detectedLanguage, setDetectedLanguage] = useState<'en' | 'ml' | 'hi' | 'ta'>('en');
  
  useEffect(() => {
    // In a real app, you might get this from a context or URL
    // For demo purposes, we'll just use the prop or default to English
    if (typeof window !== 'undefined') {
      // Could detect from localStorage, URL params, etc.
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');
      if (langParam && ['en', 'ml', 'hi', 'ta'].includes(langParam as string)) {
        setDetectedLanguage(langParam as 'en' | 'ml' | 'hi' | 'ta');
      }
    }
  }, []);

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} language={props.language || detectedLanguage} />
    </Elements>
  );
};

export default StripePayment;
