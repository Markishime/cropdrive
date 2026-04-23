'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import Card, { CardContent } from '@/components/ui/Card';

export default function CookiesPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleStorageChange = () => {
      const lang = getCurrentLanguage();
      setCurrentLanguage(lang);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const { language } = useTranslation(mounted ? currentLanguage : 'en');

  return (
    <div className="min-h-screen bg-gradient-to-br from-palm-50 via-white to-gold-50">
      {/* Hero Section with Dark Background for Navbar Visibility */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white pt-32 pb-20 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-green-400/20 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 rounded-2xl mb-6 shadow-2xl">
              <svg className="w-12 h-12 text-green-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 font-heading">
              {language === 'ms' ? 'Dasar Kuki' : 'Cookie Policy'}
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms' 
                ? 'Maklumat tentang penggunaan kuki di platform kami'
                : 'Information about cookie usage on our platform'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="mb-8 bg-white/70 backdrop-blur-xl border-2 border-green-100 shadow-2xl">
                <CardContent className="p-8 md:p-12">
                  <div className="prose prose-lg max-w-none">
                    <div className="space-y-6 text-gray-700">
                      <p className="text-sm text-gray-500 mb-6">
                        Last updated: 29 December 2025
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Who runs this website</h2>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Website:</strong> www.cropdrive.ai</li>
                        <li><strong>Operator:</strong> AGS – Agriculture Global Solutions OÜ</li>
                        <li><strong>Email:</strong> contact@agriglobalsolutions.com</li>
                        <li><strong>Address:</strong> Sakala tn 7-2, Kesklinna linnaosa, 10141 Tallinn, Harju maakond, Estonia</li>
                      </ul>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Legal standard</h2>
                      <p>
                        This website follows the EU device storage rules.
                      </p>
                      <p>
                        EU ePrivacy Directive 2002/58/EC, Article 5(3), covers storing information on a user device and accessing information already stored on a user device.
                      </p>
                      <p>
                        Where data links to an identifiable person, GDPR applies, including consent rules in Articles 4(11) and 7, and transparency duties in Article 13.
                      </p>
                      <p>
                        The Planet49 ruling confirms that pre-ticked boxes do not count as consent and that the device storage rule applies regardless of whether the stored information qualifies as personal data.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. What cookies are</h2>
                      <p>
                        Cookies are small text files stored by a website on your device.
                      </p>
                      <p>
                        This policy also covers similar technologies, such as local storage, session storage, and comparable browser storage.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. What we use on www.cropdrive.ai</h2>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.1 Strictly necessary storage</h3>
                      <p>
                        These items support functions you request, such as sign-in, language, and basic interface settings.
                      </p>

                      <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Local storage</h4>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>cropdrive-language</strong><br />
                          Purpose: remembers your language choice.<br />
                          Storage: until you delete site data in your browser, or you change the language.</li>
                        <li><strong>cropdrive-remember-email</strong><br />
                          Purpose: remembers your email after you choose "Remember Me".<br />
                          Storage: until you delete site data in your browser, or you overwrite it.</li>
                        <li><strong>sidebar-collapsed</strong><br />
                          Purpose: remembers sidebar display after you change it.<br />
                          Storage: until you delete site data in your browser, or you overwrite it.</li>
                      </ul>

                      <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Session storage</h4>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>pending_analysis_results</strong><br />
                          Purpose: temporary storage during an analysis workflow.<br />
                          Storage: removed when the browser tab closes.</li>
                      </ul>

                      <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Sign-in storage</h4>
                      <p>
                        Sign-in uses Firebase Authentication.
                      </p>
                      <p>
                        Firebase stores sign-in state in browser storage to keep you signed in.
                      </p>
                      <p>
                        Storage: ends after logout, or after deletion of site data in your browser.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.2 Analytics</h3>
                      <p>
                        We use Vercel Web Analytics to measure general website usage and improve the site.
                      </p>
                      <p>
                        Based on current configuration, Vercel Web Analytics runs without cookies on www.cropdrive.ai.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.3 Payments</h3>
                      <p>
                        Payments run on Stripe hosted checkout pages on stripe.com.
                      </p>
                      <p>
                        When you start checkout, your browser leaves www.cropdrive.ai and loads Stripe pages.
                      </p>
                      <p>
                        Stripe controls cookies and similar technologies on Stripe pages.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Consent</h2>
                      <p>
                        Under EU rules, consent is required before any non-essential cookies or non-essential device storage starts.
                      </p>
                      <p>
                        Strictly necessary storage for a service you request does not require consent.
                      </p>
                      <p>
                        If we add non-essential cookies or non-essential device storage in a future update, we will present a consent choice before those technologies start.
                      </p>
                      <p>
                        Consent withdrawal will be available through a cookie settings control on the website.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. How to manage cookies and storage</h2>
                      <p>
                        You manage cookies and site storage through your browser settings.
                      </p>
                      <p>
                        Deleting site data for www.cropdrive.ai removes cookies and browser storage linked to this website.
                      </p>
                      <p>
                        Logging out ends the active signed-in session, and browser storage remains until you delete site data.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Updates</h2>
                      <p>
                        We update this policy when technologies change.
                      </p>
                      <p>
                        The date at the top shows the current version.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-16"
          >
            <Link href="/">
              <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-full hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {language === 'ms' ? 'Kembali ke Laman Utama' : 'Back to Home'}
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

