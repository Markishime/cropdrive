'use client';

import React from 'react';
import SupportForm from '@/components/SupportForm';
import ProtectedRoute from '@/components/ProtectedRoute';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';

interface SupportPageClientProps {
  locale: string;
}

export default function SupportPageClient({ locale }: SupportPageClientProps) {
  const isMs = locale === 'ms';
  const isId = locale === 'id';

  return (
    <ProtectedRoute>
      <div className="min-h-screen premium-page-shell premium-mesh">
        {/* Enhanced Header */}
        <section className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 py-12 sm:py-16 lg:py-20 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center sm:text-left"
            >
              <div className="flex items-center justify-center sm:justify-start flex-wrap gap-4 mb-6">
                <div className="text-center sm:text-left">
                  <span className="inline-block text-green-200 text-sm font-bold tracking-widest uppercase mb-3 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                    {isId ? '💬 Hubungi Kami' : isMs ? '💬 Hubungi Kami' : '💬 Contact Us'}
                  </span>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-2 leading-tight">
                    {isId ? 'Pusat' : isMs ? 'Pusat' : 'Support'} <span className="text-yellow-400">{isId ? 'Dukungan' : isMs ? 'Sokongan' : 'Center'}</span>
                  </h1>
                  <p className="text-lg sm:text-xl text-white/90 flex items-center justify-center sm:justify-start gap-2">
                    <FontAwesomeIcon icon={faMessage} className="w-5 h-5" />
                    {isId
                      ? 'Tim ahli kami siap membantu Anda'
                      : isMs
                        ? 'Pasukan pakar kami sedia membantu anda'
                        : 'Our expert team is ready to help you'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto">
            {/* Support Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="premium-panel-strong rounded-[28px] p-4 sm:p-6">
                <SupportForm locale={locale} />
              </div>
            </motion.div>

            {/* Help Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <div className="premium-panel rounded-[24px] bg-gradient-to-r from-blue-50 to-green-50 p-6 border border-blue-200">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faCircleQuestion} className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    {isId ? (
                      <>
                        <strong>Tips:</strong> Agar respons lebih cepat, sertakan detail lengkap tentang masalah Anda dan informasi kebun yang relevan.
                      </>
                    ) : isMs ? (
                      <>
                        <strong>Petua:</strong> Untuk mendapat respons lebih pantas, sertakan butiran lengkap tentang isu anda dan maklumat ladang yang berkaitan.
                      </>
                    ) : (
                      <>
                        <strong>Tip:</strong> For faster response, include complete details about your issue and relevant farm information.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Additional Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div className="premium-panel rounded-xl p-4 shadow-sm">
                <div className="text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="text-xs font-semibold text-gray-900 mb-1">
                    {isId ? 'Respons Cepat' : isMs ? 'Respons Pantas' : 'Quick Response'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {isId ? '12-16 jam' : isMs ? '12-16 jam' : '12-16 hours'}
                  </div>
                </div>
              </div>

              <div className="premium-panel rounded-xl p-4 shadow-sm">
                <div className="text-center">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="text-xs font-semibold text-gray-900 mb-1">
                    {isId ? 'Tim Ahli' : isMs ? 'Pakar Bertauliah' : 'Expert Team'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {isId ? 'Dukungan Profesional' : isMs ? 'Sokongan Profesional' : 'Professional Support'}
                  </div>
                </div>
              </div>

              <div className="premium-panel rounded-xl p-4 shadow-sm">
                <div className="text-center">
                  <div className="text-2xl mb-2">🌐</div>
                  <div className="text-xs font-semibold text-gray-900 mb-1">
                    {isId ? 'Tiga Bahasa' : isMs ? 'Dwibahasa' : 'Multilingual'}
                  </div>
                  <div className="text-xs text-gray-600">EN / MS / ID</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
