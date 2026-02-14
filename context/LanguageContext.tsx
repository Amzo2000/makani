"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: keyof typeof translations['en'], key?: string) => any;
  dir: 'ltr' | 'rtl';
  hasLanguagePreference: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'makani.language';
const COOKIE_KEY = 'makani_language';

const isLanguage = (value: string): value is Language => {
  return value === 'en' || value === 'fr' || value === 'ar';
};

type LanguageProviderProps = {
  children: React.ReactNode;
  initialLanguage?: Language;
  initialHasPreference?: boolean;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  initialLanguage = 'en',
  initialHasPreference = false,
}) => {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [hasLanguagePreference, setHasLanguagePreference] = useState<boolean>(initialHasPreference);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setHasLanguagePreference(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage access issues.
    }
    try {
      document.cookie = `${COOKIE_KEY}=${lang}; Path=/; Max-Age=31536000`;
    } catch {
      // Ignore cookie access issues.
    }
  };

  useEffect(() => {
    if (initialHasPreference) {
      return;
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && isLanguage(stored)) {
        setLanguageState(stored);
        setHasLanguagePreference(true);
        return;
      }
    } catch {
      // Ignore storage access issues and use defaults.
    }
    setHasLanguagePreference(false);
  }, [initialHasPreference]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (section: keyof typeof translations['en'], key?: string) => {
    const sectionData = translations[language][section];
    if (key && typeof sectionData === 'object') {
      // @ts-ignore
      return sectionData[key] || key;
    }
    return sectionData;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, hasLanguagePreference }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
