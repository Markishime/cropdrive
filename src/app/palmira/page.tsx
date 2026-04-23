'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import PalmiraOnboarding from '@/components/PalmiraOnboarding';
import PalmiraDashboard from '@/components/PalmiraDashboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function PalmiraPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [loadingOnboarding, setLoadingOnboarding] = useState(true);
  const [membershipActive, setMembershipActive] = useState(false);
  const [loadingMembership, setLoadingMembership] = useState(true);
  const [isContractExpired, setIsContractExpired] = useState(false);
  const [contractEndDate, setContractEndDate] = useState<Date | null>(null);
  const isMountedRef = useRef(false);

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

  // Redirect unauthenticated users (avoid side-effects during render)
  useEffect(() => {
    if (!mounted) return;
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [mounted, authLoading, user, router]);

  // Check membership
  useEffect(() => {
    if (!authLoading && user) {
      checkMembership();
    }
  }, [user, authLoading]);

  // Check onboarding status
  useEffect(() => {
    if (!authLoading && user && membershipActive) {
      checkOnboarding();
    }
  }, [user, authLoading, membershipActive]);

  const checkMembership = async () => {
    if (!user) return;
    
    if (isMountedRef.current) setLoadingMembership(true);
    try {
      // Use server-side membership check (Admin SDK) to avoid client-side
      // Firestore rules/index issues and ensure Stripe period dates are respected.
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch('/api/membership', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      // Check if user is within their 1-year contract period
      const withinContract = !!result?.success && !!result?.data?.isWithinContract;
      const contractExpired = !!result?.success && !!result?.data?.isContractExpired;
      
      if (isMountedRef.current) {
        setMembershipActive(withinContract);
        setIsContractExpired(contractExpired);
        if (result?.data?.contractEndDate) {
          setContractEndDate(new Date(result.data.contractEndDate));
        }
      }
      
      // Only show "Subscription Expired" if contract has ended (after 1 year)
      if (contractExpired) {
        toast.error(
          currentLang === 'ms'
            ? 'Langganan anda telah tamat. Sila langgan pelan baharu.'
            : 'Your subscription has expired. Please subscribe to a new plan.'
        );
        setTimeout(() => {
          router.push('/pricing');
        }, 2000);
      }
      // All users can now access Palmira - no plan required for free access
    } catch (error) {
      console.error('Error checking membership:', error);
    } finally {
      if (isMountedRef.current) setLoadingMembership(false);
    }
  };

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

  // Loading state
  if (!mounted || authLoading || loadingMembership || loadingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
        <div className="flex flex-col items-center space-y-4">
          <FontAwesomeIcon icon={faSpinner} className="w-12 h-12 animate-spin text-green-600" spin />
          <p className="text-gray-600 font-medium">
            {currentLang === 'ms' ? 'Memuatkan...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Membership not active - only show expired subscription warning, otherwise allow access
  if (isContractExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faCircleExclamation} className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">
            {currentLang === 'ms' ? 'Langganan Tamat' : 'Subscription Expired'}
          </h1>
          <p className="text-gray-600 mb-6">
            {currentLang === 'ms'
              ? 'Langganan anda telah tamat. Sila langgan pelan baharu untuk terus menggunakan CropDrive AI Assistant.'
              : 'Your subscription has expired. Please subscribe to a new plan to continue using CropDrive AI Assistant.'}
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition"
          >
            {currentLang === 'ms' ? 'Langgan Semula' : 'Subscribe Again'}
          </button>
        </motion.div>
      </div>
    );
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
      {/* Dashboard Interface */}
      <div className="flex-1 overflow-hidden">
        <PalmiraDashboard language={currentLang} />
      </div>
    </div>
  );
}
