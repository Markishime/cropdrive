'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function PrivacyPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ms'>('en');

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

  const { language, t } = useTranslation(mounted ? currentLanguage : 'en');

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 font-heading">
              {language === 'ms' ? 'Dasar Privasi' : 'Privacy Policy'}
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms' 
                ? 'Komitmen kami untuk melindungi privasi dan data peribadi anda'
                : 'Our commitment to protecting your privacy and personal data'
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
                        Last updated: 30 December 2025
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Data controller</h2>
                      <p>
                        AGS – Agriculture Global Solutions OÜ
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Registered address:</strong> Sakala tn 7-2, Kesklinna linnaosa, 10141 Tallinn, Harju maakond, Estonia</li>
                        <li><strong>Email:</strong> contact@agriglobalsolutions.com</li>
                        <li><strong>Phone:</strong> +49 15163105462</li>
                      </ul>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Scope</h2>
                      <p>
                        This policy covers personal data processing on www.cropdrive.ai and related app pages.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Legal framework followed</h2>
                      <p>
                        This website follows EU data protection rules.
                      </p>
                      <p>
                        GDPR applies to personal data processing.
                      </p>
                      <p>
                        EU ePrivacy rules apply to device storage and similar technologies, see the separate <Link href="/cookies" className="text-green-600 hover:text-green-700 font-semibold underline">Cookie Policy</Link>.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Personal data collected</h2>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">A. Account and login data</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Email address.</li>
                        <li>Authentication status and security tokens handled through Firebase Authentication.</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">B. Service usage data</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Basic device and browser data.</li>
                        <li>Page views and feature usage data collected through Vercel Web Analytics.</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">C. Customer support and contact data</h3>
                      <p>
                        Name, email, phone number, message content, when you contact AGS through forms, email, or messaging.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">D. Payment flow data</h3>
                      <p>
                        Subscription purchase is handled on Stripe hosted checkout pages on stripe.com.
                      </p>
                      <p>
                        Payment data is processed by Stripe on Stripe pages.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Purposes and legal basis</h2>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">A. Providing the service</h3>
                      <p>
                        <strong>Purpose:</strong> create accounts, sign in, deliver app functions, provide requested outputs.
                      </p>
                      <p>
                        <strong>Legal basis:</strong> performance of a contract or steps before a contract under GDPR Article 6(1)(b).
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">B. Security and fraud prevention</h3>
                      <p>
                        <strong>Purpose:</strong> protect accounts, prevent abuse, keep the service stable.
                      </p>
                      <p>
                        <strong>Legal basis:</strong> legitimate interests under GDPR Article 6(1)(f).
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">C. Product improvement and basic analytics</h3>
                      <p>
                        <strong>Purpose:</strong> understand aggregated usage patterns, improve pages and features.
                      </p>
                      <p>
                        <strong>Legal basis:</strong> legitimate interests under GDPR Article 6(1)(f), limited to privacy focused analytics described in this policy.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">D. Payments and billing administration</h3>
                      <p>
                        <strong>Purpose:</strong> enable subscriptions, handle payment confirmation, manage billing records required for business operations.
                      </p>
                      <p>
                        <strong>Legal basis:</strong> performance of a contract under GDPR Article 6(1)(b), plus legal obligation under GDPR Article 6(1)(c) where bookkeeping or tax rules require recordkeeping.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">E. Marketing communications</h3>
                      <p>
                        <strong>Purpose:</strong> send marketing messages only when you opt in.
                      </p>
                      <p>
                        <strong>Legal basis:</strong> consent under GDPR Article 6(1)(a), with withdrawal available at any time.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Sharing and service providers</h2>
                      <p>
                        AGS shares personal data with service providers only for the purposes listed above.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">A. Hosting and analytics</h3>
                      <p>
                        Vercel, for hosting and Vercel Web Analytics.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">B. Authentication</h3>
                      <p>
                        Google Firebase, for sign in and account authentication.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">C. Payments</h3>
                      <p>
                        Stripe, for hosted checkout and payment processing on stripe.com.
                      </p>

                      <p className="mt-4">
                        Each provider processes data under contractual terms for data protection and security.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. International data transfers</h2>
                      <p>
                        Some service providers process data outside the EEA.
                      </p>
                      <p>
                        AGS uses EU transfer safeguards where required, including EU Standard Contractual Clauses under Commission Implementing Decision (EU) 2021/914.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Retention</h2>
                      <p>
                        AGS keeps personal data only for as long as needed for the purposes in section 5.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Operational data</h3>
                      <p>
                        Account data is stored while an account remains active. Deletion follows a verified request or account removal flow.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Support communications</h3>
                      <p>
                        Support messages are stored for case handling and business records, then deleted or anonymised based on internal retention rules.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Billing records</h3>
                      <p>
                        Billing and invoice related records are stored for statutory retention periods where required by law.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Stripe</h3>
                      <p>
                        Payment card data is handled by Stripe on Stripe pages, under Stripe retention rules.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Your rights under GDPR</h2>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Access.</li>
                        <li>Rectification.</li>
                        <li>Erasure.</li>
                        <li>Restriction.</li>
                        <li>Data portability.</li>
                        <li>Objection to processing based on legitimate interests.</li>
                        <li>Withdrawal of consent, where processing is based on consent.</li>
                      </ul>
                      <p className="mt-4">
                        Rights are exercised by emailing contact@agriglobalsolutions.com.
                      </p>
                      <p>
                        AGS verifies identity before releasing or deleting account data.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Complaints</h2>
                      <p>
                        A complaint can be filed with a supervisory authority in the EU.
                      </p>
                      <p>
                        A complaint can be filed in the EU Member State of habitual residence, place of work, or place of the alleged infringement, under GDPR Article 77.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Automated decision making</h2>
                      <p>
                        CropDrive generates agronomic outputs for decision support.
                      </p>
                      <p>
                        No solely automated decision with legal or similarly significant effect is used for access, pricing, or eligibility.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Security</h2>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Transport encryption is used for website traffic.</li>
                        <li>Access to internal systems is restricted to authorised personnel.</li>
                        <li>Service providers apply security controls for hosting, authentication, and payments.</li>
                      </ul>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Children</h2>
                      <p>
                        The service is intended for adults.
                      </p>
                      <p>
                        AGS does not knowingly collect personal data from children under 16.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">14. Changes</h2>
                      <p>
                        Updates are posted on this page with a revised "Last updated" date.
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
