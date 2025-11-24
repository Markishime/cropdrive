'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentLanguage } from '@/i18n';

export default function SupportRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Get user's preferred language and redirect to locale-specific support page
    const locale = getCurrentLanguage();
    router.replace(`/${locale}/support`);
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-palm-50 via-white to-gold-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-palm-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-soil-600 font-medium">Loading Support...</p>
      </div>
    </div>
  );
}

