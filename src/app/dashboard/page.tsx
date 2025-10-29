'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiCalendar, FiClock, FiUser, FiVideo, FiFileText, FiSettings } from 'react-icons/fi';

// Mock data for upcoming appointments
const upcomingAppointments = [
  {
    id: 'apt-1',
    psychologistId: 'priya-sharma',
    psychologistName: 'Dr. Priya Sharma',
    psychologistImage: '/images/psychologists/priya-sharma.jpg',
    date: 'July 15, 2025',
    time: '10:00 AM',
    duration: '50 minutes',
    status: 'confirmed',
    meetingLink: 'https://meet.google.com/abc-defg-hij'
  },
  {
    id: 'apt-2',
    psychologistId: 'anand-kumar',
    psychologistName: 'Dr. Anand Kumar',
    psychologistImage: '/images/psychologists/anand-kumar.jpg',
    date: 'July 22, 2025',
    time: '2:30 PM',
    duration: '50 minutes',
    status: 'confirmed',
    meetingLink: 'https://meet.google.com/xyz-uvwx-yz'
  }
];

// Mock data for past appointments
const pastAppointments = [
  {
    id: 'apt-3',
    psychologistId: 'meena-krishnan',
    psychologistName: 'Dr. Meena Krishnan',
    psychologistImage: '/images/psychologists/meena-krishnan.jpg',
    date: 'June 30, 2025',
    time: '11:00 AM',
    duration: '50 minutes',
    status: 'completed',
    notes: 'Follow-up scheduled for next month'
  },
  {
    id: 'apt-4',
    psychologistId: 'vikram-desai',
    psychologistName: 'Dr. Vikram Desai',
    psychologistImage: '/images/psychologists/vikram-desai.jpg',
    date: 'June 15, 2025',
    time: '3:00 PM',
    duration: '50 minutes',
    status: 'completed',
    notes: 'Discussed career transition strategies'
  }
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  return (
    <div className="container mx-auto px-4 py-16 mt-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">My Dashboard</h1>
      
      <div className="grid md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-teal-500">
                <Image 
                  src="/images/user-avatar.jpg" 
                  alt="User Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rahul Menon</h2>
                <p className="text-teal-600 dark:text-teal-400">Patient</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              <Link 
                href="/dashboard"
                className="flex items-center px-4 py-2 rounded-md bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium"
              >
                <FiCalendar className="mr-3" /> Appointments
              </Link>
              <Link 
                href="/dashboard/profile"
                className="flex items-center px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FiUser className="mr-3" /> My Profile
              </Link>
              <Link 
                href="/dashboard/notes"
                className="flex items-center px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FiFileText className="mr-3" /> Session Notes
              </Link>
              <Link 
                href="/dashboard/settings"
                className="flex items-center px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FiSettings className="mr-3" /> Settings
              </Link>
            </nav>
          </div>
          
          <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg p-6 text-white">
            <h3 className="font-bold mb-2">Need Help?</h3>
            <p className="text-sm mb-4 opacity-90">
              Our support team is available 24/7 to assist you with any questions.
            </p>
            <Link 
              href="/contact"
              className="inline-block px-4 py-2 bg-white text-teal-600 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-3">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              <button
                className={`flex-1 py-4 text-center font-medium ${
                  activeTab === 'upcoming'
                    ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400'
                }`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming Appointments
              </button>
              <button
                className={`flex-1 py-4 text-center font-medium ${
                  activeTab === 'past'
                    ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400'
                }`}
                onClick={() => setActiveTab('past')}
              >
                Past Appointments
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'upcoming' ? (
                <>
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-6">
                      {upcomingAppointments.map((appointment) => (
                        <div 
                          key={appointment.id}
                          className="border border-gray-200 dark:border-gray-800 rounded-lg p-6"
                        >
                          <div className="flex flex-col md:flex-row md:items-center">
                            <div className="flex items-center mb-4 md:mb-0 md:mr-6">
                              <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                                <Image 
                                  src={appointment.psychologistImage} 
                                  alt={appointment.psychologistName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">
                                  {appointment.psychologistName}
                                </h3>
                                <Link 
                                  href={`/psychologists/${appointment.psychologistId}`}
                                  className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                                >
                                  View Profile
                                </Link>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 md:ml-auto">
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <FiCalendar className="mr-2" />
                                <span>{appointment.date}</span>
                              </div>
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <FiClock className="mr-2" />
                                <span>{appointment.time} ({appointment.duration})</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
                            <a 
                              href={appointment.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                            >
                              <FiVideo className="mr-2" /> Join Session
                            </a>
                            
                            <Link 
                              href={`/dashboard/reschedule/${appointment.id}`}
                              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              Reschedule
                            </Link>
                            
                            <Link 
                              href={`/dashboard/cancel/${appointment.id}`}
                              className="inline-flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            >
                              Cancel
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        You don`t have any upcoming appointments.
                      </p>
                      <Link 
                        href="/psychologists"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-md hover:opacity-90 transition-opacity"
                      >
                        Book a Consultation
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {pastAppointments.length > 0 ? (
                    <div className="space-y-6">
                      {pastAppointments.map((appointment) => (
                        <div 
                          key={appointment.id}
                          className="border border-gray-200 dark:border-gray-800 rounded-lg p-6"
                        >
                          <div className="flex flex-col md:flex-row md:items-center">
                            <div className="flex items-center mb-4 md:mb-0 md:mr-6">
                              <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                                <Image 
                                  src={appointment.psychologistImage} 
                                  alt={appointment.psychologistName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">
                                  {appointment.psychologistName}
                                </h3>
                                <Link 
                                  href={`/psychologists/${appointment.psychologistId}`}
                                  className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                                >
                                  View Profile
                                </Link>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 md:ml-auto">
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <FiCalendar className="mr-2" />
                                <span>{appointment.date}</span>
                              </div>
                              <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <FiClock className="mr-2" />
                                <span>{appointment.time} ({appointment.duration})</span>
                              </div>
                            </div>
                          </div>
                          
                          {appointment.notes && (
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Notes:</strong> {appointment.notes}
                              </p>
                            </div>
                          )}
                          
                          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <Link 
                              href={`/dashboard/book/${appointment.psychologistId}`}
                              className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                            >
                              Book Follow-up
                            </Link>
                            
                            <Link 
                              href={`/dashboard/notes/${appointment.id}`}
                              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              View Full Notes
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-700 dark:text-gray-300">
                        You don`t have any past appointments.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
