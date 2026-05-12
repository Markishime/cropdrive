'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';

export default function AccessibilityPage() {
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
  const copy = (en: string, ms: string) => language === 'id' ? toIndonesianText(ms) : language === 'ms' ? ms : en;

  return (
    <div className="min-h-screen">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 font-heading">
              {copy('Accessibility Notice', 'Notis Kebolehcapaian')}
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              {copy('Our commitment to providing an inclusive digital experience for everyone', 'Komitmen kami untuk menyediakan pengalaman digital yang inklusif untuk semua')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* English Section */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12 border-2 border-green-100">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-heading font-black text-gray-900">
                    {copy('English', 'Bahasa Melayu')}
                  </h2>
                  <p className="text-gray-600">{copy('Accessibility Statement', 'Kenyataan Kebolehcapaian')}</p>
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-8">
                  {copy('CropDrive OP Advisor, available at www.cropdrive.ai, is committed to providing an accessible digital experience for all users, including people with disabilities. We work to improve usability and accessibility on an ongoing basis and aim to align our design and development with the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA.', 'CropDrive OP Advisor, tersedia di www.cropdrive.ai, komited untuk menyediakan pengalaman digital yang boleh diakses untuk semua pengguna, termasuk orang kurang upaya. Kami berusaha untuk meningkatkan kebolehgunaan dan kebolehcapaian secara berterusan dan bertujuan untuk menyelaraskan reka bentuk dan pembangunan kami dengan Garis Panduan Kebolehcapaian Kandungan Web (WCAG) 2.1 pada Tahap AA.')}
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('Measures to support accessibility', 'Langkah untuk menyokong kebolehcapaian')}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {copy('We design and develop core user journeys with accessibility in mind, including navigation, forms, and subscription purchase flows. We review new pages and features for accessibility issues and address problems identified through internal testing and user feedback.', 'Kami mereka bentuk dan membangunkan perjalanan pengguna teras dengan mengambil kira kebolehcapaian, termasuk navigasi, borang dan aliran pembelian langganan. Kami menyemak halaman dan ciri baharu untuk isu kebolehcapaian dan menangani masalah yang dikenal pasti melalui ujian dalaman dan maklum balas pengguna.')}
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('Feedback and contact', 'Maklum balas dan hubungi')}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {copy('If you encounter an accessibility barrier on www.cropdrive.ai, or if you need content in an alternative format, please contact us:', 'Jika anda menemui halangan kebolehcapaian di www.cropdrive.ai, atau jika anda memerlukan kandungan dalam format alternatif, sila hubungi kami:')}
                </p>
                <div className="bg-green-50 p-6 rounded-xl mb-6 border-2 border-green-200">
                  <ul className="list-none space-y-2 text-gray-700">
                    <li><strong>{copy('Email:', 'E-mel:')}</strong> <a href="mailto:contact@agriglobalsolutions.com" className="text-green-700 hover:text-green-800 underline">contact@agriglobalsolutions.com</a></li>
                    <li><strong>{copy('Phone:', 'Telefon:')}</strong> <a href="tel:+4915163105462" className="text-green-700 hover:text-green-800">+49 15163105462</a></li>
                    <li><strong>{copy('Postal address:', 'Alamat pos:')}</strong> AGS – Agriculture Global Solutions OÜ, Sakala tn 7-2, Kesklinna linnaosa, 10141 Tallinn, Harju maakond, Estonia</li>
                  </ul>
                </div>
                <p className="text-gray-700 leading-relaxed mb-8">
                  {copy('We aim to respond to accessibility feedback within 14 days.', 'Kami bertujuan untuk memberi respons kepada maklum balas kebolehcapaian dalam tempoh 14 hari.')}
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('Compatibility', 'Keserasian')}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {copy('www.cropdrive.ai is designed to work with current major browsers, including Chrome, Firefox, Safari, and Edge, and with common assistive technologies, including screen readers.', 'www.cropdrive.ai direka bentuk untuk berfungsi dengan pelayar utama semasa, termasuk Chrome, Firefox, Safari dan Edge, serta dengan teknologi bantuan biasa, termasuk pembaca skrin.')}
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('Technical specifications', 'Spesifikasi teknikal')}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {copy('The website relies on modern web technologies, including Next.js, TypeScript, and Tailwind CSS.', 'Laman web ini bergantung pada teknologi web moden, termasuk Next.js, TypeScript dan Tailwind CSS.')}
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('Limitations and alternatives', 'Had dan alternatif')}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {copy('Some third-party pages and components, including Stripe-hosted checkout pages, are controlled by third parties and may not fully meet accessibility standards in all cases. If you experience a barrier during checkout, contact us and we will help you complete the purchase through an alternative route. Some downloadable documents, if provided on the website, may not always be fully accessible. On request, we will provide an accessible alternative format.', 'Beberapa halaman dan komponen pihak ketiga, termasuk halaman checkout yang dihoskan oleh Stripe, dikawal oleh pihak ketiga dan mungkin tidak sepenuhnya memenuhi standard kebolehcapaian dalam semua kes. Jika anda mengalami halangan semasa checkout, hubungi kami dan kami akan membantu anda melengkapkan pembelian melalui laluan alternatif. Beberapa dokumen yang boleh dimuat turun, jika disediakan di laman web, mungkin tidak selalu boleh diakses sepenuhnya. Atas permintaan, kami akan menyediakan format alternatif yang boleh diakses.')}
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('Need help', 'Perlukan bantuan')}</h2>
                <p className="text-gray-700 leading-relaxed mb-8">
                  {copy('If you need assistance using the service or accessing content, contact us at', 'Jika anda memerlukan bantuan menggunakan perkhidmatan atau mengakses kandungan, hubungi kami di')}{' '}
                  <a href="mailto:contact@agriglobalsolutions.com" className="text-green-700 hover:text-green-800 underline font-semibold">contact@agriglobalsolutions.com</a>.
                </p>
              </div>
            </div>

            {/* German Section */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-green-100">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-heading font-black text-gray-900">
                    Deutsch
                  </h2>
                  <p className="text-gray-600">Barrierefreiheitserklärung</p>
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-8">
                  CropDrive OP Advisor, verfügbar unter www.cropdrive.ai, ist bestrebt, allen Nutzern, einschließlich Menschen mit Behinderungen, ein barrierefreies digitales Erlebnis zu bieten. Wir arbeiten kontinuierlich daran, die Benutzerfreundlichkeit und Barrierefreiheit zu verbessern und streben an, unser Design und unsere Entwicklung an die Web Content Accessibility Guidelines (WCAG) 2.1 Level AA auszurichten.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Maßnahmen zur Unterstützung der Barrierefreiheit</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Wir gestalten und entwickeln Kernbenutzerreisen mit Blick auf Barrierefreiheit, einschließlich Navigation, Formularen und Abonnement-Kaufprozessen. Wir überprüfen neue Seiten und Funktionen auf Barrierefreiheitsprobleme und beheben Probleme, die durch interne Tests und Benutzerfeedback identifiziert wurden.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Feedback und Kontakt</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Wenn Sie auf www.cropdrive.ai auf eine Barrierefreiheitsbarriere stoßen oder Inhalte in einem alternativen Format benötigen, kontaktieren Sie uns bitte:
                </p>
                <div className="bg-green-50 p-6 rounded-xl mb-6 border-2 border-green-200">
                  <ul className="list-none space-y-2 text-gray-700">
                    <li><strong>E-Mail:</strong> <a href="mailto:contact@agriglobalsolutions.com" className="text-green-700 hover:text-green-800 underline">contact@agriglobalsolutions.com</a></li>
                    <li><strong>Telefon:</strong> <a href="tel:+4915163105462" className="text-green-700 hover:text-green-800">+49 15163105462</a></li>
                    <li><strong>Postanschrift:</strong> AGS – Agriculture Global Solutions OÜ, Sakala tn 7-2, Kesklinna linnaosa, 10141 Tallinn, Harju maakond, Estland</li>
                  </ul>
                </div>
                <p className="text-gray-700 leading-relaxed mb-8">
                  Wir bemühen uns, innerhalb von 14 Tagen auf Barrierefreiheitsfeedback zu antworten.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Kompatibilität</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  www.cropdrive.ai ist so konzipiert, dass es mit aktuellen gängigen Browsern, einschließlich Chrome, Firefox, Safari und Edge, sowie mit gängigen Hilfstechnologien, einschließlich Screenreadern, funktioniert.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Technische Spezifikationen</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Die Website basiert auf modernen Webtechnologien, einschließlich Next.js, TypeScript und Tailwind CSS.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Einschränkungen und Alternativen</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Einige Seiten und Komponenten von Drittanbietern, einschließlich Stripe-gehosteter Checkout-Seiten, werden von Dritten kontrolliert und entsprechen möglicherweise nicht in allen Fällen vollständig den Barrierefreiheitsstandards. Wenn Sie während des Checkouts auf eine Barriere stoßen, kontaktieren Sie uns und wir helfen Ihnen, den Kauf über einen alternativen Weg abzuschließen. Einige herunterladbare Dokumente, falls auf der Website bereitgestellt, sind möglicherweise nicht immer vollständig barrierefrei. Auf Anfrage stellen wir ein barrierefreies alternatives Format bereit.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Benötigen Sie Hilfe</h2>
                <p className="text-gray-700 leading-relaxed mb-8">
                  Wenn Sie Hilfe bei der Nutzung des Dienstes oder beim Zugriff auf Inhalte benötigen, kontaktieren Sie uns unter{' '}
                  <a href="mailto:contact@agriglobalsolutions.com" className="text-green-700 hover:text-green-800 underline font-semibold">contact@agriglobalsolutions.com</a>.
                </p>
              </div>
            </div>

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
                  {copy('Back to Home', 'Kembali ke Laman Utama')}
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
