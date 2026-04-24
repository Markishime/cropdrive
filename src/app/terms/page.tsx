'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function TermsPage() {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 font-heading">
              {language === 'ms' ? 'Terma dan Syarat' : 'Terms and Conditions'}
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms' 
                ? 'Terma dan Syarat Penggunaan CropDrive.ai'
                : 'Terms and Conditions of Use for CropDrive.ai'
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
                        Effective: April 2026 &nbsp;|&nbsp; Available to users in Malaysia and Indonesia only.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of these Terms</h2>
                      <p>By registering for, accessing, or using CropDrive.ai, you agree to these Terms and Conditions. If you do not agree, do not use the service.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. About the Service</h2>
                      <p>CropDrive.ai is a digital agronomy support service that allows registered users to upload soil test results and leaf test results for analysis. The service is currently available only for users located in Malaysia and Indonesia.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Eligibility</h2>
                      <p>You may use CropDrive.ai only if you are legally able to agree to these Terms and if you are located in Malaysia or Indonesia. By using the service, you confirm that the uploaded test results relate to farms, fields, or operations for which you are authorized to submit data.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Free Service</h2>
                      <p>CropDrive.ai is currently offered free of charge to farmers. We reserve the right to change, limit, suspend, or discontinue the service, in whole or in part, at any time.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Required Registration Information</h2>
                      <p>To use CropDrive.ai, you must provide a valid WhatsApp number, a valid email address, and your location. You agree that this information is accurate and kept reasonably up to date.</p>
                      <p>This contact information will be used only for important service-related communication, including important changes, updates, developments, security notices, technical issues, and support communication. It will also be used if we need to contact you in relation to a problem with your account or uploaded files.</p>
                      <p>We will not use your contact details for unwanted phone calls. We will not sell your contact details to third parties. We will not share your contact details for third-party marketing.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Upload Limits</h2>
                      <p>Each registered member may upload test results for analysis only twice per calendar year. This means a maximum of two upload events per year per member, whether the upload contains soil test results, leaf test results, or both.</p>
                      <p>If you need additional uploads, you may contact us and request extra access. Any such additional access is at our discretion.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Uploaded Reports and Data You Provide</h2>
                      <p>By uploading a soil test report, leaf test report, or related file, you confirm that you have the right to upload it and to allow CropDrive.ai to process it for analysis.</p>
                      <p>You also understand that uploaded files may contain farm information or other details. CropDrive.ai will use the agronomic content of these reports to provide analysis and to improve the service.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Personal Information in Uploaded Reports</h2>
                      <p>CropDrive.ai is designed to use agronomic data such as soil and leaf test values. CropDrive.ai is not intended to use personal names, contact details, or other personal identifiers that may appear inside uploaded reports for marketing, sales, or unrelated profiling.</p>
                      <p>If personal details appear inside an uploaded report, those details will not be included in aggregate datasets used for service improvement, benchmarking, analytics, or product development.</p>
                      <p>We do not intentionally use personal names, phone numbers, email addresses, addresses, or similar identifiers appearing inside uploaded reports for any purpose other than what is technically necessary to operate, secure, support, or troubleshoot the service.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Aggregate and Anonymized Data</h2>
                      <p>By using CropDrive.ai, you agree that we may access, use, store, analyze, and combine agronomic data from uploaded soil and leaf test results in aggregated and anonymized form.</p>
                      <p>This includes, for example, nutrient values, pH, soil characteristics, leaf nutrient values, regional trends, crop-related patterns, and similar non-personal analytical data.</p>
                      <p>This aggregated and anonymized data may be used by CropDrive.ai to improve the platform, improve recommendations, develop new features, conduct benchmarking, generate statistics, train and improve models, and better understand agronomic patterns.</p>
                      <p>Aggregate data will not include your personal contact details.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Contact Details and Location Data</h2>
                      <p>Your WhatsApp number, email address, and location are required for account operation and service communication. Your location may also be used to support country eligibility, regional agronomic interpretation, service quality control, and platform development.</p>
                      <p>We will not sell this information. We will not disclose it to unrelated third parties for marketing purposes.</p>
                      <p>Where strictly necessary to operate, host, maintain, secure, or support the service, limited access may be given to technical service providers acting on our behalf and under confidentiality and data protection obligations. We may also disclose information where required by law.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. No Third-Party Marketing</h2>
                      <p>CropDrive.ai will not share your WhatsApp number, email address, or identifiable uploaded report information with third parties for advertising, solicitation, resale, lead generation, or unrelated commercial use.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Support and User Contact</h2>
                      <p>You may contact us at any time to report bugs, technical problems, errors, and usability issues, or to request help with the service.</p>
                      <p>We may contact you through WhatsApp or email for support, important updates, security notices, product changes, usage issues, or service developments.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. No Guarantee of Results</h2>
                      <p>CropDrive.ai provides informational and decision-support outputs only. Analysis results, interpretations, and recommendations depend on the quality, completeness, readability, and accuracy of the files and data you upload.</p>
                      <p>We do not guarantee that any recommendation will increase yield, improve profitability, prevent disease, correct nutritional problems, or produce any specific agronomic or commercial result.</p>
                      <p>The service does not replace field inspection, laboratory quality control, local professional judgement, or your own responsibility for farm decisions.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">14. Service Availability</h2>
                      <p>We aim to keep CropDrive.ai available and functioning properly, but we do not guarantee uninterrupted service, continuous availability, or error-free operation.</p>
                      <p>The platform may be updated, changed, interrupted, delayed, or temporarily unavailable at any time.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">15. Accuracy of User Inputs</h2>
                      <p>You are responsible for ensuring that the files and information you upload are accurate, lawful, and relevant. You must not upload false, misleading, manipulated, harmful, illegal, or unauthorized material.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">16. Proper Use</h2>
                      <p>You agree not to misuse the service. This includes attempting to interfere with the platform, bypass limits, upload malicious files, scrape the system, use another person's account without permission, or use the service in any unlawful or abusive manner.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">17. Intellectual Property</h2>
                      <p>CropDrive.ai, including its software, workflows, design, analysis methods, written outputs, data structures, and related content, remains the property of CropDrive.ai or its licensors, except for materials you lawfully upload.</p>
                      <p>You keep your rights in the files you upload. You grant CropDrive.ai the right to process, store, analyze, and use those files and their agronomic content as described in these Terms.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">18. Suspension or Termination</h2>
                      <p>We may suspend, restrict, or terminate access to CropDrive.ai if we believe these Terms have been breached, if the service is being misused, if account information is false, if uploads are unauthorized, or if suspension is needed for legal, security, operational, or technical reasons.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">19. Data Retention and Deletion</h2>
                      <p>We may retain uploaded files, agronomic data, account records, logs, and service communications for as long as reasonably necessary to operate the service, maintain security, resolve disputes, improve the platform, meet legal obligations, and preserve aggregate analytical datasets.</p>
                      <p>You may request account closure or deletion of your personal contact data, subject to legal, technical, audit, backup, and operational limitations.</p>
                      <p>Aggregate or anonymized data that no longer identifies you may continue to be retained and used.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">20. Changes to These Terms</h2>
                      <p>We may update these Terms from time to time. If we make material changes, we may notify you through the platform, by WhatsApp, or by email. Continued use of CropDrive.ai after an update means you accept the updated Terms.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">21. Limitation of Liability</h2>
                      <p>To the fullest extent permitted by law, CropDrive.ai and its operators are not liable for indirect, incidental, special, consequential, or business losses arising from use of the service, including loss of profit, loss of yield, loss of data, loss of opportunity, or decisions made based on platform outputs.</p>
                      <p>Use of the service is at your own risk.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">22. Governing Language</h2>
                      <p>If these Terms are translated into another language, the English version controls in case of inconsistency, unless local law requires otherwise.</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">23. Contact</h2>
                      <p>If you have questions, need support, want to report a bug, want to request additional uploads, or want to raise a data-related concern, you may contact CropDrive.ai through the contact details provided on the platform.</p>
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
