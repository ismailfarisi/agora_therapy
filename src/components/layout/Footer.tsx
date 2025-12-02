'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-10 h-10">
                <Image 
                  src="/logo.svg" 
                  alt="MindGood Logo" 
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                MindGood
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Connecting you with psychologists who speak your language. Get professional mental health support in Malayalam, Tamil, Hindi, Telugu, and Kannada.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-gray-500 hover:text-teal-500 transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-teal-500 transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-500 hover:text-teal-500 transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-gray-500 hover:text-teal-500 transition-colors">
                <FaLinkedin size={20} />
              </a>
              <a href="#" aria-label="YouTube" className="text-gray-500 hover:text-teal-500 transition-colors">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-500 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-500 transition-colors text-sm">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/psychologists" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-500 transition-colors text-sm">
                  Find a Psychologist
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-500 transition-colors text-sm">
                  Blog & Resources
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-500 transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-500 transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-500 transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services#job-stress" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-500 transition-colors text-sm">
                  Job Stress Management
                </Link>
              </li>
              <li>
                <Link href="/services#career-building" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-500 transition-colors text-sm">
                  Career Building
                </Link>
              </li>
              <li>
                <Link href="/services#family-orientation" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-500 transition-colors text-sm">
                  Family Orientation
                </Link>
              </li>
              <li>
                <Link href="/services#learning-disabilities" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-500 transition-colors text-sm">
                  Learning Disabilities
                </Link>
              </li>
              <li>
                <Link href="/services#anxiety-depression" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-500 transition-colors text-sm">
                  Anxiety & Depression
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Contact Us</h3>
            <ul className="space-y-2">
              <li className="text-gray-600 dark:text-gray-400 text-sm">
                <strong>Email:</strong> support@mindgood.com
              </li>
              <li className="text-gray-600 dark:text-gray-400 text-sm">
                <strong>Phone:</strong> +971 505134930
              </li>
              <li className="text-gray-600 dark:text-gray-400 text-sm">
                <strong>Hours:</strong> Mon-Sat: 9am - 7pm
              </li>
            </ul>
            <div className="mt-4">
              <Link 
                href="/contact" 
                className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © {currentYear} MindGood. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-500 transition-colors text-xs">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-500 transition-colors text-xs">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
