'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getCurrentLanguage, setLanguage as setLang, subscribeToLanguageChange } from '@/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => getCurrentLanguage());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLanguageState(getCurrentLanguage());

    return subscribeToLanguageChange(() => {
      setLanguageState(getCurrentLanguage());
    });
  }, []);

  const setLanguage = (lang: Language) => {
    setLang(lang);
  };

  if (!mounted) {
    // Return children with default language during SSR
    return <LanguageContext.Provider value={{ language: 'en', setLanguage }}>{children}</LanguageContext.Provider>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
