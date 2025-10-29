'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { languages } from '../data/psychologists';

type LanguageContextType = {
  currentLanguage: string;
  setLanguage: (code: string) => void;
  languageName: string;
};

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'en',
  setLanguage: () => {},
  languageName: 'English',
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [languageName, setLanguageName] = useState('English');

  useEffect(() => {
    // Check if there's a saved language preference in localStorage
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
      const lang = languages.find(l => l.code === savedLanguage);
      if (lang) {
        setLanguageName(lang.name);
      }
    }
  }, []);

  const setLanguage = (code: string) => {
    setCurrentLanguage(code);
    localStorage.setItem('preferredLanguage', code);
    const lang = languages.find(l => l.code === code);
    if (lang) {
      setLanguageName(lang.name);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, languageName }}>
      {children}
    </LanguageContext.Provider>
  );
};
