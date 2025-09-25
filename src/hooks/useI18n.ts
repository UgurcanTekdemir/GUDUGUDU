import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import trTranslations from '@/locales/tr.json';
import enTranslations from '@/locales/en.json';

type Language = 'tr' | 'en';
type Translations = typeof trTranslations;

const translations: Record<Language, Translations> = {
  tr: trTranslations,
  en: enTranslations,
};

type I18nContextValue = {
  currentLanguage: Language;
  t: (key: string, fallback?: string) => string;
  changeLanguage: (language: Language) => void;
  availableLanguages: Language[];
  formatNumber: (number: number) => string;
  formatCurrency: (amount: number, currency?: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

// Helper: get nested object values by dot path
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current: any, key: string) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('tr');

  // Initialize from localStorage or browser language once
  useEffect(() => {
    const savedLanguage = (localStorage.getItem('language') as Language) || null;
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
      return;
    }

    const browserLang = (navigator.language || navigator.languages?.[0] || 'tr').slice(0, 2) as Language;
    if (translations[browserLang]) {
      setCurrentLanguage(browserLang);
    }
  }, []);

  // Persist selection
  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  const t = useCallback((key: string, fallback?: string): string => {
    const current = getNestedValue(translations[currentLanguage], key);
    
    if (typeof current === 'string' || typeof current === 'number') {
      return String(current);
    }

    return fallback !== undefined ? fallback : key;
  }, [currentLanguage]);

  const changeLanguage = useCallback((language: Language) => {
    if (language === currentLanguage) return;
    if (!translations[language]) return;
    setCurrentLanguage(language);
  }, [currentLanguage]);

  const formatNumber = useCallback((number: number): string => {
    return new Intl.NumberFormat(currentLanguage === 'tr' ? 'tr-TR' : 'en-US').format(number);
  }, [currentLanguage]);

  const formatCurrency = useCallback((amount: number, currency: string = 'TRY'): string => {
    return new Intl.NumberFormat(currentLanguage === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }, [currentLanguage]);

  const value: I18nContextValue = useMemo(() => ({
    currentLanguage,
    t,
    changeLanguage,
    availableLanguages: Object.keys(translations) as Language[],
    formatNumber,
    formatCurrency,
  }), [currentLanguage, t, changeLanguage, formatNumber, formatCurrency]);

  return React.createElement(I18nContext.Provider, { value }, children);
};

export const useI18n = (): I18nContextValue => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
};
