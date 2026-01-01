'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function TermsPage() {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 font-heading">
              {language === 'ms' ? 'Syarat Perkhidmatan' : 'Terms of Service'}
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms' 
                ? 'Syarat dan peraturan penggunaan platform kami'
                : 'Terms and rules for using our platform'
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

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Operator</h2>
                      <p>
                        The operator of www.cropdrive.ai and the CropDrive OP Advisor service is AGS – Agriculture Global Solutions OÜ, Sakala tn 7-2, Kesklinna linnaosa, 10141 Tallinn, Harju maakond, Estonia. Contact email: contact@agriglobalsolutions.com.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Definitions</h2>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>"AGS"</strong> means AGS – Agriculture Global Solutions OÜ.</li>
                        <li><strong>"Website"</strong> means www.cropdrive.ai and any pages, subpages, and related interfaces operated under the CropDrive OP Advisor brand.</li>
                        <li><strong>"Service"</strong> means the digital agronomy advisory and decision-support service provided through the Website, including subscriptions, user accounts, digital outputs, and any related digital content.</li>
                        <li><strong>"User"</strong> means any person accessing or using the Website or Service.</li>
                        <li><strong>"Consumer"</strong> means a natural person acting outside trade, business, or profession.</li>
                        <li><strong>"Business Client"</strong> means any legal entity or any natural person acting for trade, business, or profession.</li>
                        <li><strong>"Subscription"</strong> means a Consumer subscription plan displayed on the Website.</li>
                        <li><strong>"Business Services"</strong> means services provided to Business Clients outside the Subscription plans, including customization, configuration, integration, enterprise support, bespoke deliverables, and any tailored development of digital tools.</li>
                      </ul>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Scope, acceptance, and precedence</h2>
                      <p>
                        These Terms govern access to and use of the Website and Service. Access to the Website or use of the Service constitutes acceptance of these Terms. Business Services are provided under a separate written agreement concluded between AGS and the Business Client. The separate written agreement prevails over these Terms for the scope covered by the separate written agreement.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Service channels, intended users, and market presentation</h2>
                      <p>
                        The Website offers Subscriptions intended for Malaysian oil palm farmers, with pricing displayed in Malaysian Ringgit (RM). Subscription checkout is offered for Consumer purchases only. Business Services are discussed and agreed case by case, with scope, deliverables, acceptance criteria, timelines, pricing, payment methods, and payment schedules defined in the separate written agreement. Market presentation on the Website does not limit mandatory rights arising under applicable law in the User place of residence.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Eligibility and age</h2>
                      <p>
                        Purchase and registration are intended for adults. By registering an account or purchasing a Subscription, the User represents age 18 or above.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Accounts, credentials, and security</h2>
                      <p>
                        Use of the Service requires an account. The User undertakes to provide accurate, complete, and current account information and to maintain confidentiality of credentials. The User bears responsibility for activity performed through the account. AGS reserves the right to suspend, restrict, or terminate access where a material breach, fraud indicators, abuse, or a security risk is identified, including to protect the Service, other users, and third-party systems supporting hosting, authentication, and payments.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Inputs required for Consumer Subscriptions</h2>
                      <p>
                        The Service delivers advisory outputs based on user-provided inputs. Consumer Subscriptions are designed around the upload and analysis of soil test results and leaf tissue analysis. Failure to provide required inputs, provision of incomplete inputs, or provision of inaccurate inputs limits the Service outputs and affects performance expectations.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Advisory outputs and yield outcomes</h2>
                      <p>
                        The Service provides agronomic advisory outputs intended to support yield improvement when the User follows the advisory plan with sustained compliance. Yield improvement is a target outcome linked to user compliance, quality of input data, timing of field operations, site conditions, palm age, soil properties, nutrient availability, pest pressure, disease pressure, weather, and comparable external variables outside AGS control. No fixed yield figure, financial outcome, or field performance outcome is warranted. The User remains responsible for farm management decisions, procurement decisions, and field implementation.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Ordering, contract formation, and delivery for Consumer Subscriptions</h2>
                      <p>
                        Subscription plans, pricing, billing interval, and key commercial conditions are displayed on the Website prior to checkout. Payment is processed through Stripe Checkout on Stripe-hosted pages. A binding contract for a Subscription is formed upon successful payment confirmation and activation of Subscription access linked to the User account. Digital access starts after payment confirmation and activation. Where activation does not occur after payment confirmation, the User should contact contact@agriglobalsolutions.com for investigation and resolution.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Payments</h2>
                      <p>
                        Consumer Subscription payments are processed through Stripe Checkout and are linked to the Subscription plans shown on the Website. Stripe terms govern the payment processing on Stripe-hosted pages. Business Services payment methods and payment schedules are defined in the separate written agreement.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Subscription term, renewal, and cancellation for Consumer Subscriptions</h2>
                      <p>
                        For the flexible Installment plan (Pay Over Time), billing occurs in monthly instalments and the Subscription carries a 12-month minimum term. Cancellation is permitted at any time, with cancellation taking effect as a non-renewal at the end of the minimum term, and cancellation does not release the User from payment of remaining instalments due within the 12-month minimum term.
                      </p>
                      <p>
                        For the Pay Upfront plan, billing occurs as a single annual payment for a one-year term, cancellation is permitted at any time as a non-renewal, and access continues until the end of the paid annual term.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Fees, refunds, and charge disputes</h2>
                      <p>
                        All fees are non-refundable after payment. Mandatory rights under applicable law remain unaffected. Where a duplicate charge or billing error is identified, AGS processes correction after verification. Billing dispute communications should be sent to contact@agriglobalsolutions.com with the account email, payment date, and payment amount.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Consumer withdrawal rights where mandatory law grants such rights</h2>
                      <p>
                        Certain jurisdictions grant statutory withdrawal rights for distance contracts. For digital services supplied immediately after purchase, mandatory rules in some jurisdictions treat express consent to immediate supply and acknowledgement of withdrawal-right loss as a condition for immediate supply. Where such mandatory rules apply, checkout collects the required consent and acknowledgement before immediate supply starts. Mandatory rights remain unaffected.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">14. User data, confidentiality, and aggregation</h2>
                      <p>
                        The User retains rights in uploaded content and uploaded data. The User grants AGS a limited licence to process uploaded content and uploaded data for service delivery, account support, fraud prevention, security, troubleshooting, and quality management. AGS does not disclose personal data contained in uploaded soil and leaf test reports for commercial purposes or unrelated purposes. AGS aggregates non-personal agronomic variables from reports, including chemical composition values, for scientific and analytical purposes, with aggregation designed to exclude personal identifiers and direct attribution to an identifiable individual.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">15. Intellectual property and licence</h2>
                      <p>
                        All Website content, software, workflows, designs, trademarks, and service elements remain the property of AGS or licensors. A Subscription grants a limited, personal, non-exclusive, non-transferable right to access and use the Service during an active Subscription term, subject to these Terms. Business Services licensing and ownership terms are defined in the separate written agreement. Copying, redistribution, resale, sublicensing, reverse engineering, or creation of derivative works from the Service or Website content is prohibited without prior written permission from AGS.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">16. Acceptable use</h2>
                      <p>
                        The User undertakes to refrain from unauthorised access attempts, interference with service operation, interference with security controls, uploading malware, introducing harmful code, and use of the Service for unlawful activity. AGS reserves the right to take protective action, including suspension or termination, where unacceptable use is identified.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">17. Third-party systems</h2>
                      <p>
                        The Service depends on third-party providers for hosting, analytics, authentication, and payments. Planned maintenance and urgent security updates occur as required. AGS does not assume responsibility for outages or failures originating from third-party systems outside AGS control, subject to mandatory law.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">18. Support</h2>
                      <p>
                        Support is provided through contact@agriglobalsolutions.com. Target response time is within 24 hours, subject to workload and issue complexity.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">19. Changes to the Service and these Terms</h2>
                      <p>
                        AGS updates the Service for security, performance, compliance, and feature development. AGS updates these Terms from time to time. Updated Terms apply to new purchases from the publication date. For ongoing Subscriptions, updated Terms apply from the next renewal date, unless mandatory law requires a different approach.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">20. Liability</h2>
                      <p>
                        The Service provides advisory outputs and decision-support information. Farm decisions and implementation remain the User responsibility. For Consumers, liability limitations apply only to the extent permitted by mandatory consumer law. For Business Clients, liability is limited to direct damages and excludes indirect loss, loss of profit, and consequential loss to the extent permitted by law. Nothing in these Terms excludes liability for intent or liability which mandatory law treats as non-excludable.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">21. Governing law and jurisdiction</h2>
                      <p>
                        These Terms are governed by the laws of Estonia, excluding conflict-of-law rules. Mandatory consumer protection rules applicable in the Consumer place of habitual residence remain unaffected. Jurisdiction lies with the competent courts of Estonia, subject to mandatory consumer forum rules applicable to Consumer claims.
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">22. Language</h2>
                      <p>
                        The Website provides an English version and a Bahasa Malaysia version through a language toggle. For Malaysia consumer disclosures, the Bahasa Malaysia version governs where a conflict exists.
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
