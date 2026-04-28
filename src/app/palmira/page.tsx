'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { getCurrentLanguage, LANGUAGE_CHANGE_EVENT, type Language } from '@/i18n';
import PalmiraOnboarding from '@/components/PalmiraOnboarding';
import PalmiraDashboard from '@/components/PalmiraDashboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

// Palmira is free for all registered users — no subscription check needed.

export default function PalmiraPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [loadingOnboarding, setLoadingOnboarding] = useState(true);
  const isMountedRef = useRef(false);

  const checkOnboarding = async () => {
    if (!user) return;

    if (isMountedRef.current) setLoadingOnboarding(true);
    try {
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      const response = await fetch('/api/palmira/onboarding', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        if (isMountedRef.current) setOnboardingCompleted(result.data?.completed || false);
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
    } finally {
      if (isMountedRef.current) setLoadingOnboarding(false);
    }
  };

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLang(lang);
  }, []);

  // Listen for language changes from the site switcher
  useEffect(() => {
    const handleLanguageChange = () => {
      const lang = getCurrentLanguage();
      setCurrentLang(lang);
    };
    window.addEventListener('storage', handleLanguageChange);
    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange);
    return () => {
      window.removeEventListener('storage', handleLanguageChange);
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange);
    };
  }, []);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!mounted) return;
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [mounted, authLoading, user, router]);

  // Check onboarding status for any authenticated user
  useEffect(() => {
    if (!authLoading && user) {
      checkOnboarding();
    }
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Loading state
  if (!mounted || authLoading || loadingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
        <div className="flex flex-col items-center space-y-4">
          <FontAwesomeIcon icon={faSpinner} className="w-12 h-12 animate-spin text-green-600" spin />
          <p className="text-gray-600 font-medium">
            {currentLang === 'id' ? 'Memuat...' : currentLang === 'ms' ? 'Memuatkan...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Onboarding not completed
  if (onboardingCompleted === false) {
    return (
      <PalmiraOnboarding
        onComplete={handleOnboardingComplete}
        language={currentLang}
      />
    );
  }

  // Main chat interface
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      <div className="flex-1 overflow-hidden">
        <PalmiraDashboard language={currentLang} />
      </div>
    </div>
  );
}
