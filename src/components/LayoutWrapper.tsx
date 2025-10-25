'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { OnboardingModal } from '@/components/OnboardingModal';

export function LayoutWrapper({ children, locale }: { children: React.ReactNode; locale: string }) {
  const pathname = usePathname();
  const [user, loading] = useAuthState(auth);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Hide navbar and footer on auth pages and dashboard
  const isAuthPage = pathname.includes('/login') || 
                     pathname.includes('/register') || 
                     pathname.includes('/forgot-password');
  
  const isDashboardPage = pathname.includes('/dashboard');

  // Show onboarding on first visit for logged-in users (not on auth pages)
  useEffect(() => {
    if (!loading && user && !isAuthPage && !isDashboardPage) {
      const hasSeenOnboarding = localStorage.getItem('cropdrive-onboarding-seen');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user, loading, isAuthPage, isDashboardPage]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('cropdrive-onboarding-seen', 'true');
  };

  // Auth pages - no navbar/footer
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Dashboard - no navbar/footer (has its own sidebar)
  if (isDashboardPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      
      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={handleCloseOnboarding}
      />
    </div>
  );
}
