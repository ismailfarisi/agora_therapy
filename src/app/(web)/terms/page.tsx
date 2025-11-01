'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  
  return (
    <div className="container mx-auto px-4 py-16 mt-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          Terms and Conditions
        </h1>
        
        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-teal-600 dark:prose-a:text-teal-400">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Last Updated: July 12, 2025
          </p>
          
          <div className="mb-8 p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> This is a sample Terms and Conditions document for demonstration purposes. In a production environment, this document should be reviewed by legal professionals to ensure compliance with applicable laws and regulations in your jurisdiction.
            </p>
          </div>
          
          <h2>1. Introduction</h2>
          <p>
            Welcome to MindGood (&apos;we,&apos; &apos;our,&apos; or &apos;us&apos;). These Terms and Conditions govern your use of the MindGood website, mobile applications, and services (collectively, the &quot;Services&quot;).
          </p>
          <p>
            By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Services.
          </p>
          
          <h2>2. Services Description</h2>
          <p>
            MindGood provides a platform that connects users with licensed mental health professionals for online therapy and counseling services. Our Services include:
          </p>
          <ul>
            <li>Scheduling appointments with licensed psychologists</li>
            <li>Participating in online therapy sessions</li>
            <li>Accessing mental health resources and information</li>
            <li>Making payments for professional services</li>
          </ul>
          <p>
            MindGood does not directly provide therapy or counseling services. We facilitate connections between users and independent licensed professionals.
          </p>
          
          <h2>3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password and for all activities that occur under your account.
          </p>
          <p>
            You agree to notify us immediately of any unauthorized use of your account or any other breach of security. We cannot and will not be liable for any loss or damage arising from your failure to comply with this section.
          </p>
          
          <h2>4. User Eligibility</h2>
          <p>
            Our Services are intended for users who are at least 18 years of age or the age of legal majority in their jurisdiction. By using our Services, you represent and warrant that you meet these eligibility requirements.
          </p>
          <p>
            If you are accessing the Services on behalf of a minor, you represent that you are the legal guardian of such minor and take full responsibility for their use of the Services.
          </p>
          
          <h2>5. Payment Terms</h2>
          <p>
            All payments for Services are processed through our third-party payment processor, Stripe. By making a payment, you agree to Stripe's terms of service and privacy policy.
          </p>
          <p>
            Fees for Services are clearly displayed before you complete your booking. All fees are non-refundable except as expressly stated in our Cancellation Policy.
          </p>
          
          <h2>6. Cancellation Policy</h2>
          <p>
            You may reschedule or cancel your appointment up to 24 hours before the scheduled time without any charge. Cancellations made less than 24 hours before the appointment may be subject to a cancellation fee of 50% of the session cost.
          </p>
          <p>
            If a psychologist cancels a session, you will receive a full refund or the option to reschedule at no additional cost.
          </p>
          
          <h2>7. User Conduct</h2>
          <p>
            You agree not to use the Services:
          </p>
          <ul>
            <li>In any way that violates any applicable law or regulation</li>
            <li>To impersonate or attempt to impersonate MindGood, a MindGood employee, another user, or any other person</li>
            <li>To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Services</li>
            <li>To attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Services</li>
            <li>To harass, abuse, or harm another person, including our staff or psychologists</li>
          </ul>
          
          <h2>8. Intellectual Property</h2>
          <p>
            The Services and their entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by MindGood, its licensors, or other providers of such material and are protected by copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
          </p>
          
          <h2>9. Limitation of Liability</h2>
          <p>
            In no event shall MindGood, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul>
            <li>Your access to or use of or inability to access or use the Services</li>
            <li>Any conduct or content of any third party on the Services</li>
            <li>Any content obtained from the Services</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content</li>
          </ul>
          
          <h2>10. Disclaimer</h2>
          <p>
            MindGood is not a healthcare provider. We provide a platform to connect users with independent licensed mental health professionals. We do not endorse any specific psychologist or guarantee the quality of their services.
          </p>
          <p>
            The Services are not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </p>
          <p>
            MindGood is not an emergency service. If you are experiencing a mental health emergency or crisis, please contact your local emergency services, go to your nearest emergency room, or call a crisis helpline immediately.
          </p>
          
          <h2>11. Privacy Policy</h2>
          <p>
            Your use of our Services is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices regarding your personal information.
          </p>
          
          <h2>12. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. When we make changes, we will update the "Last Updated" date at the top of this page and notify you through the Services or by other means.
          </p>
          <p>
            Your continued use of the Services after any such changes constitutes your acceptance of the new Terms.
          </p>
          
          <h2>13. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
          </p>
          
          <h2>14. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p>
            Email: legal@mindgood.com<br />
            Address: MindGood, 123 Health Avenue, Bangalore, Karnataka, India
          </p>
        </div>
        
        <div className="mt-12 flex justify-between items-center">
          <Link 
            href="/"
            className="text-teal-600 dark:text-teal-400 hover:underline"
          >
            Return to Home
          </Link>
          <Link 
            href="/privacy"
            className="text-teal-600 dark:text-teal-400 hover:underline"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
