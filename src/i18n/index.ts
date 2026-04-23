import en from './en.json';
import ms from './ms.json';
import id from './id';
import { LanguageStrings } from '@/types';
import { safeGetLocalStorage, safeSetLocalStorage } from '@/utils/browser-compat';

export const LANGUAGE_STORAGE_KEY = 'cropdrive-language';
export const LANGUAGE_CHANGE_EVENT = 'languageChanged';

export const SUPPORTED_LANGUAGES = ['en', 'ms', 'id'] as const;

export const translations = {
  en,
  ms,
  id,
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

  // Use safe localStorage access
  const savedLanguage = safeGetLocalStorage(LANGUAGE_STORAGE_KEY, 'en');
  if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage as Language)) {
    return savedLanguage as Language;
  }

  // Default to English if no saved preference
  return 'en';
};

const dispatchLanguageChange = (language: Language, previousLanguage: Language): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(LANGUAGE_CHANGE_EVENT, {
      detail: { language, previousLanguage },
    })
  );

  try {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: LANGUAGE_STORAGE_KEY,
        oldValue: previousLanguage,
        newValue: language,
        storageArea: window.localStorage,
        url: window.location.href,
      })
    );
  } catch {
    window.dispatchEvent(new Event('storage'));
  }
};

export const subscribeToLanguageChange = (listener: () => void): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleChange = () => listener();

  window.addEventListener('storage', handleChange);
  window.addEventListener(LANGUAGE_CHANGE_EVENT, handleChange as EventListener);

  return () => {
    window.removeEventListener('storage', handleChange);
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleChange as EventListener);
  };
};

export const setLanguage = (language: Language): void => {
  if (typeof window !== 'undefined') {
    const previousLanguage = getCurrentLanguage();

    if (previousLanguage === language) {
      dispatchLanguageChange(language, previousLanguage);
      return;
    }

    safeSetLocalStorage(LANGUAGE_STORAGE_KEY, language);
    dispatchLanguageChange(language, previousLanguage);
  }
};

export const formatNumber = (num: number, language: Language = 'en'): string => {
  const locale = language === 'ms' ? 'ms-MY' : language === 'id' ? 'id-ID' : 'en-US';
  return new Intl.NumberFormat(locale).format(num);
};

export const formatCurrency = (amount: number, currency: 'MYR' | 'EUR', language: Language = 'en'): string => {
  const locale = language === 'ms' ? 'ms-MY' : language === 'id' ? 'id-ID' : 'en-US';
  const currencyCode = currency === 'MYR' ? 'MYR' : 'EUR';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

export const formatDate = (date: Date, language: Language = 'en'): string => {
  const locale = language === 'ms' ? 'ms-MY' : language === 'id' ? 'id-ID' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};
