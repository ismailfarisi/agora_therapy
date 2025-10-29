'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import LanguageSelector from '../language-selector/LanguageSelector';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '@/lib/hooks/useAuth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, userData } = useAuth();

  const getDashboardLink = () => {
    if (!user || !userData) return '/login';
    
    switch (userData.role) {
      case 'admin':
        return '/admin';
      case 'therapist':
        return '/therapist';
      case 'client':
        return '/client';
      default:
        return '/login';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Psychologists', path: '/psychologists' },
    { name: 'Blog', path: '/blog' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-28 h-12">
            <Image 
              src="/Mindgood.png" 
              alt="MindGood Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          {/* <span className="text-xl font-bold bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
            MindGood
          </span> */}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`text-sm font-medium transition-colors hover:text-teal-500 ${
                pathname === link.path
                  ? 'text-teal-500'
                  : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <LanguageSelector />
          {user ? (
            <Link
              href={getDashboardLink()}
              className="px-4 py-2 rounded-full border-2 border-teal-500 text-teal-500 font-medium text-sm hover:bg-teal-500 hover:text-white transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-full border-2 border-teal-500 text-teal-500 font-medium text-sm hover:bg-teal-500 hover:text-white transition-all"
            >
              Login
            </Link>
          )}
          <Link 
            href="/psychologists" 
            className="px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Book Consultation
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 dark:text-gray-200"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium py-2 transition-colors hover:text-teal-500 ${
                  pathname === link.path
                    ? 'text-teal-500'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <LanguageSelector />
              {user ? (
                <Link
                  href={getDashboardLink()}
                  className="px-4 py-2 rounded-full border-2 border-teal-500 text-teal-500 font-medium text-sm hover:bg-teal-500 hover:text-white transition-all text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full border-2 border-teal-500 text-teal-500 font-medium text-sm hover:bg-teal-500 hover:text-white transition-all text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
              <Link 
                href="/psychologists" 
                className="px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium text-sm hover:opacity-90 transition-opacity text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Book Consultation
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
