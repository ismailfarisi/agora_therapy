'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft } from 'react-icons/fi';

export default function NotFoundPage() {
  
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center max-w-lg">
        <div className="relative w-48 h-48 mx-auto mb-8">
          <Image 
            src="/images/404-illustration.svg" 
            alt="Page not found" 
            fill
            className="object-contain"
          />
        </div>
        
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Page Not Found
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Oops! The page you`re looking for doesn`t exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
          >
            <FiArrowLeft className="mr-2" /> Back to Home
          </Link>
          
          <Link 
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Contact Support
          </Link>
        </div>
        
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Looking for something specific?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link 
              href="/psychologists"
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-teal-600 dark:text-teal-400">Find a Psychologist</h3>
            </Link>
            <Link 
              href="/services"
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-teal-600 dark:text-teal-400">Our Services</h3>
            </Link>
            <Link 
              href="/blog"
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-teal-600 dark:text-teal-400">Blog & Resources</h3>
            </Link>
            <Link 
              href="/faq"
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-teal-600 dark:text-teal-400">FAQ</h3>
            </Link>
            <Link 
              href="/about"
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-teal-600 dark:text-teal-400">About Us</h3>
            </Link>
            <Link 
              href="/contact"
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-teal-600 dark:text-teal-400">Contact Us</h3>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
