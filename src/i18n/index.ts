import en from './en.json';
import ms from './ms.json';
import { LanguageStrings } from '@/types';

export const translations = {
  en,
  ms,
} as const;

export type Language = keyof typeof translations;

export const getTranslation = (language: Language): LanguageStrings => {
  return translations[language];
};

export const getNestedTranslation = (
  obj: LanguageStrings,
  path: string
): string => {
  return path.split('.').reduce((current: any, key: string) => {
    return current?.[key] || path;
  }, obj) as string;
};

export const useTranslation = (language: Language = 'en') => {
  const t = getTranslation(language);

  const translate = (key: string, fallback?: string): string => {
    const translation = getNestedTranslation(t, key);
    return translation !== key ? translation : fallback || key;
  };

  return { t: translate, language };
};

export const getCurrentLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en'; // Default to English on server

  const savedLanguage = localStorage.getItem('cropdrive-language');
  if (savedLanguage === 'en' || savedLanguage === 'ms') {
    return savedLanguage;
  }

  // Default to English if no saved preference
  return 'en';
};

export const setLanguage = (language: Language): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cropdrive-language', language);
    window.location.reload(); // Reload to apply language change
  }
};

export const formatNumber = (num: number, language: Language = 'en'): string => {
  return new Intl.NumberFormat(language === 'ms' ? 'ms-MY' : 'en-US').format(num);
};

export const formatCurrency = (amount: number, currency: 'MYR' | 'EUR', language: Language = 'en'): string => {
  const locale = language === 'ms' ? 'ms-MY' : 'en-US';
  const currencyCode = currency === 'MYR' ? 'MYR' : 'EUR';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

export const formatDate = (date: Date, language: Language = 'en'): string => {
  const locale = language === 'ms' ? 'ms-MY' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};
