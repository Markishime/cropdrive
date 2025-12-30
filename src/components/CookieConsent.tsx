'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import { safeGetLocalStorage, safeSetLocalStorage } from '@/utils/browser-compat';
import { X, Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ms'>('en');

  useEffect(() => {
    setMounted(true);
    try {
      const lang = getCurrentLanguage();
      setCurrentLanguage(lang);
    } catch (e) {
      setCurrentLanguage('en');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Check if user has already given consent
    const consent = safeGetLocalStorage('cropdrive-cookie-consent', null);
    
    // Only show banner if consent hasn't been given
    if (consent === null) {
      setShowBanner(true);
    }
  }, [mounted]);

  const { language } = useTranslation(mounted ? currentLanguage : 'en');

  const handleAccept = () => {
    safeSetLocalStorage('cropdrive-cookie-consent', 'accepted');
    safeSetLocalStorage('cropdrive-cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    
    // Dispatch event for other components to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookieConsentAccepted'));
    }
  };

  const handleReject = () => {
    safeSetLocalStorage('cropdrive-cookie-consent', 'rejected');
    safeSetLocalStorage('cropdrive-cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    
    // Dispatch event for other components to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookieConsentRejected'));
    }
  };

  const handleClose = () => {
    // Close without storing consent (user can still interact with site)
    // But we'll remember they dismissed it for this session
    safeSetLocalStorage('cropdrive-cookie-consent-dismissed', 'true');
    setShowBanner(false);
  };

  if (!mounted || !showBanner) {
    return null;
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-white border-t-4 border-green-600 shadow-2xl"
          role="dialog"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-description"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Cookie Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-green-600" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 
                  id="cookie-consent-title"
                  className="text-lg font-bold text-gray-900 mb-2"
                >
                  {language === 'ms' ? 'Kuki dan Penyimpanan Peranti' : 'Cookies & Device Storage'}
                </h3>
                <p 
                  id="cookie-consent-description"
                  className="text-sm text-gray-700 mb-3"
                >
                  {language === 'ms' 
                    ? 'Kami menggunakan penyimpanan peranti yang diperlukan untuk fungsi asas seperti bahasa dan log masuk. Kami juga menggunakan Vercel Analytics tanpa kuki. Lihat '
                    : 'We use necessary device storage for basic functions like language and sign-in. We also use Vercel Analytics without cookies. See '}
                  <Link 
                    href="/cookies" 
                    className="text-green-600 hover:text-green-700 font-semibold underline"
                  >
                    {language === 'ms' ? 'Dasar Kuki' : 'Cookie Policy'}
                  </Link>
                  {language === 'ms' ? ' untuk maklumat lanjut.' : ' for details.'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleReject}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  aria-label={language === 'ms' ? 'Tolak' : 'Reject'}
                >
                  {language === 'ms' ? 'Tolak' : 'Reject'}
                </button>
                <button
                  onClick={handleAccept}
                  className="px-6 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-md"
                  aria-label={language === 'ms' ? 'Terima' : 'Accept'}
                >
                  {language === 'ms' ? 'Terima' : 'Accept'}
                </button>
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  aria-label={language === 'ms' ? 'Tutup' : 'Close'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

