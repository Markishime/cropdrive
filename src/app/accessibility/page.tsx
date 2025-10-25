'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from '@/i18n';

export default function AccessibilityPage() {
  const { language } = useTranslation();

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
              {language === 'ms' ? 'Notis Kebolehcapaian' : 'Accessibility Notice'}
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms'
                ? 'Komitmen kami untuk menyediakan pengalaman digital yang inklusif untuk semua'
                : 'Our commitment to providing an inclusive digital experience for everyone'
              }
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
                    English
                  </h2>
                  <p className="text-gray-600">Accessibility Statement</p>
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-6 rounded-2xl mb-8 border-2 border-green-200">
                  <p className="text-lg text-gray-800 font-semibold mb-0">
                    🌱 AGS - Agriculture Global Solutions OÜ is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
                  </p>
                </div>

                <div className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-0">
                      Measures to Support Accessibility
                    </h2>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-lg">We follow best practices and guidelines as defined by the <strong>Web Content Accessibility Guidelines (WCAG) 2.1</strong>, aiming to meet AA standards.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-lg">We conduct regular assessments and updates to enhance accessibility on our website.</span>
                    </li>
                  </ul>
                </div>

                <div className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-0">
                      Feedback
                    </h2>
                  </div>
                  <p className="text-lg text-gray-700 mb-6">
                    We welcome your feedback on the accessibility of our website. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:
                  </p>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl mb-8 border-2 border-green-300 shadow-lg">
                    <h3 className="text-xl font-heading font-semibold text-gray-800 mb-3">
                      Contact Information:
                    </h3>
                    <p className="text-gray-700">AGS - Agriculture Global Solutions OÜ</p>
                    <p className="text-gray-700">Sakala tn 7-2,</p>
                    <p className="text-gray-700">Kesklinna linnaosa,</p>
                    <p className="text-gray-700">10141 Tallinn, Harju maakond,</p>
                    <p className="text-gray-700">Estonia</p>
                    <p className="text-gray-700">
                      Email: <a href="mailto:contact@cropdrive.com" className="text-green-700 hover:underline font-semibold">contact@cropdrive.com</a>
                    </p>
                    <p className="text-gray-700">Phone: +49 5221 8719889</p>
                  </div>

                  <p className="text-lg text-gray-700 mb-8">
                    We aim to respond to accessibility feedback within 14 days.
                  </p>
                </div>

                <div className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-0">
                      Compatibility with Browsers and Assistive Technology
                    </h2>
                  </div>
                  <p className="text-lg text-gray-700 mb-4">
                    Our website is designed to be compatible with the following:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                      <span className="text-gray-700 text-lg">Major browsers such as Chrome, Firefox, Safari, and Edge</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                      <span className="text-gray-700 text-lg">Assistive technologies including screen readers</span>
                    </li>
                  </ul>
                </div>

                <div className="mb-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-0">
                      Technical Specifications
                    </h2>
                  </div>
                  <p className="text-lg text-gray-700 mb-4">
                    Our website relies on the following technologies to work with accessibility:
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {['HTML', 'CSS', 'JavaScript'].map((tech) => (
                      <div key={tech} className="bg-gray-100 p-4 rounded-xl text-center border-2 border-gray-200 hover:border-green-400 transition-all">
                        <span className="text-gray-800 font-bold text-lg">{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-0">
                      Limitations and Alternatives
                    </h2>
                  </div>
                  <p className="text-lg text-gray-700 mb-6">
                    Despite our efforts to ensure the accessibility of our website, some limitations may still exist. Below is a description of known limitations and potential solutions:
                  </p>
                  <ul className="space-y-4">
                    <li className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
                      <div className="flex items-start">
                        <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <strong className="text-gray-900">PDF Documents:</strong>
                          <p className="text-gray-700 mt-1">Some of our PDF documents may not be fully accessible. We are working on providing accessible alternatives and improving the accessibility of these documents.</p>
                        </div>
                      </div>
                    </li>
                    <li className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
                      <div className="flex items-start">
                        <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <strong className="text-gray-900">Third-Party Content:</strong>
                          <p className="text-gray-700 mt-1">Some third-party content embedded in our website, such as videos and widgets, may not fully comply with accessibility standards. We are working with our partners to improve this.</p>
                        </div>
                      </div>
                    </li>
                  </ul>
                  <div className="mt-6 p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
                    <p className="text-lg text-gray-800">
                      <strong>Need help?</strong> If you need any assistance or an alternative format, please contact us at{' '}
                      <a href="mailto:contact@agriglobalsolutions.com" className="text-green-700 hover:text-green-800 hover:underline font-bold">
                        contact@agriglobalsolutions.com
                      </a>
                    </p>
                  </div>
                </div>
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
                <div className="bg-gradient-to-r from-red-50 to-yellow-50 p-6 rounded-2xl mb-8 border-2 border-red-200">
                  <p className="text-lg text-gray-800 font-semibold mb-0">
                    🇩🇪 AGS - Agriculture Global Solutions OÜ ist bestrebt, die digitale Barrierefreiheit für Menschen mit Behinderungen zu gewährleisten. Wir verbessern kontinuierlich die Benutzererfahrung für alle und wenden die relevanten Barrierefreiheitsstandards an.
                  </p>
                </div>

                <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-6 mt-12">
                  Maßnahmen zur Unterstützung der Barrierefreiheit
                </h2>
                <ul className="space-y-3 text-gray-700 mb-8">
                  <li>Wir folgen den besten Praktiken und Richtlinien, wie sie in den Web Content Accessibility Guidelines (WCAG) 2.1 definiert sind, mit dem Ziel, die AA-Standards zu erfüllen.</li>
                  <li>Wir führen regelmäßige Bewertungen und Aktualisierungen durch, um die Barrierefreiheit auf unserer Website zu verbessern.</li>
                </ul>

                <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-6 mt-12">
                  Feedback
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Wir freuen uns über Ihr Feedback zur Barrierefreiheit unserer Website. Wenn Sie auf Barrieren stoßen oder Verbesserungsvorschläge haben, kontaktieren Sie uns bitte:
                </p>

                <div className="bg-gray-100 p-6 rounded-lg mb-8">
                  <h3 className="text-xl font-heading font-semibold text-gray-800 mb-3">
                    Kontaktdaten:
                  </h3>
                  <p className="text-gray-700">AGS - Agriculture Global Solutions OÜ</p>
                  <p className="text-gray-700">Sakala tn 7-2,</p>
                  <p className="text-gray-700">Kesklinna linnaosa,</p>
                  <p className="text-gray-700">10141 Tallinn, Harju maakond,</p>
                  <p className="text-gray-700">Estland</p>
                  <p className="text-gray-700">
                    E-Mail: <a href="mailto:contact@cropdrive.com" className="text-green-700 hover:underline font-semibold">contact@cropdrive.com</a>
                  </p>
                  <p className="text-gray-700">Telefon: +49 5221 8719889</p>
                </div>

                <p className="text-lg text-gray-700 mb-8">
                  Wir bemühen uns, innerhalb von 14 Tagen auf Ihr Feedback zur Barrierefreiheit zu antworten.
                </p>

                <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-6 mt-12">
                  Kompatibilität mit Browsern und Hilfstechnologien
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Unsere Website ist mit den folgenden kompatibel:
                </p>
                <ul className="space-y-3 text-gray-700 mb-8">
                  <li>Gängige Browser wie Chrome, Firefox, Safari und Edge</li>
                  <li>Hilfstechnologien einschließlich Screenreadern</li>
                </ul>

                <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-6 mt-12">
                  Technische Spezifikationen
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Unsere Website verwendet die folgenden Technologien zur Unterstützung der Barrierefreiheit:
                </p>
                <ul className="space-y-3 text-gray-700 mb-8">
                  <li>HTML</li>
                  <li>CSS</li>
                  <li>JavaScript</li>
                </ul>

                <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-6 mt-12">
                  Einschränkungen und Alternativen
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  Trotz unserer Bemühungen, die Barrierefreiheit unserer Website zu gewährleisten, können einige Einschränkungen bestehen bleiben. Nachfolgend eine Beschreibung der bekannten Einschränkungen und möglichen Lösungen:
                </p>
                <ul className="space-y-4 text-gray-700 mb-8">
                  <li>
                    <strong>PDF-Dokumente:</strong> Einige unserer PDF-Dokumente sind möglicherweise nicht vollständig barrierefrei. Wir arbeiten daran, barrierefreie Alternativen bereitzustellen und die Barrierefreiheit dieser Dokumente zu verbessern.
                  </li>
                  <li>
                    <strong>Inhalte Dritter:</strong> Einige eingebettete Inhalte von Drittanbietern, wie Videos und Widgets, entsprechen möglicherweise nicht vollständig den Barrierefreiheitsstandards. Wir arbeiten mit unseren Partnern daran, dies zu verbessern.
                  </li>
                </ul>
                <p className="text-lg text-gray-700 mb-8">
                  Wenn Sie Hilfe benötigen oder ein alternatives Format wünschen, kontaktieren Sie uns bitte unter{' '}
                  <a href="mailto:contact@agriglobalsolutions.com" className="text-green-700 hover:underline font-semibold">
                    contact@agriglobalsolutions.com
                  </a>.
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
                  {language === 'ms' ? 'Kembali ke Laman Utama' : 'Back to Home'}
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
