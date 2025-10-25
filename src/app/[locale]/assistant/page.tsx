'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTranslation, getCurrentLanguage } from '@/i18n';

export default function AIAssistantPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ms'>('en');
  const { language } = useTranslation(currentLanguage);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-900">
        <div className="text-white text-xl">
          {language === 'ms' ? 'Memuatkan...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.span
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block text-yellow-400 text-sm font-bold tracking-widest uppercase mb-6"
            >
              {language === 'ms' ? 'AI Berkuasa' : 'AI-Powered'}
            </motion.span>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {language === 'ms' ? 'AGS AI' : 'AGS AI'} <span className="text-yellow-400">{language === 'ms' ? 'PEMBANTU' : 'ASSISTANT'}</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms'
                ? 'Pakar pertanian peribadi anda yang menggunakan AI untuk analisis tanah dan daun. Dikuasakan oleh Google Gemini AI dan Document AI untuk hasil terbaik.'
                : 'Your personal farming expert using AI for soil and leaf analysis. Powered by Google Gemini AI and Document AI for best results.'
              }
            </p>
            
            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-yellow-400">
                <p className="text-3xl font-black text-yellow-400 mb-1">30s</p>
                <p className="text-sm text-white/90">{language === 'ms' ? 'Analisis' : 'Analysis'}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-yellow-400">
                <p className="text-3xl font-black text-yellow-400 mb-1">3</p>
                <p className="text-sm text-white/90">{language === 'ms' ? 'Pilihan Bajet' : 'Budget Options'}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-yellow-400">
                <p className="text-3xl font-black text-yellow-400 mb-1">MPOB</p>
                <p className="text-sm text-white/90">{language === 'ms' ? 'Standard' : 'Standards'}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Assistant Iframe Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-yellow-400"
          >
            {/* Instructions Banner */}
            <div className="bg-gradient-to-r from-green-700 to-green-900 p-4 text-white">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    {language === 'ms' ? 'Cara Menggunakan AGS AI Assistant' : 'How to Use AGS AI Assistant'}
                  </h3>
                  <ul className="text-sm space-y-1 text-white/90">
                    <li>• {language === 'ms' ? 'Muat naik laporan makmal tanah atau daun anda' : 'Upload your soil or leaf lab reports'}</li>
                    <li>• {language === 'ms' ? 'AI akan menganalisis dan memberikan cadangan' : 'AI will analyze and provide recommendations'}</li>
                    <li>• {language === 'ms' ? 'Dapatkan pandangan terperinci tentang kesihatan tanah anda' : 'Get detailed insights on your soil health'}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Embedded Streamlit App */}
            <div className="relative" style={{ height: 'calc(100vh - 350px)', minHeight: '600px' }}>
              {/* Get Streamlit URL from environment variable */}
              {(() => {
                const streamlitUrl = process.env.NEXT_PUBLIC_AI_ASSISTANT_URL || '';
                const isConfigured = streamlitUrl && streamlitUrl !== '' && !streamlitUrl.includes('your-streamlit');
                
                if (isConfigured) {
                  return (
                    <iframe
                      src={streamlitUrl}
                      title="AGS AI Assistant"
                      className="w-full h-full border-0"
                      allow="camera; microphone"
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                      loading="lazy"
                    />
                  );
                }
                
                return (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center p-8">
                      <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg
                          className="w-10 h-10 text-green-900"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {language === 'ms' ? 'AGS AI Assistant Akan Datang!' : 'AGS AI Assistant Coming Soon!'}
                      </h2>
                      <p className="text-gray-600 max-w-md mx-auto mb-6">
                        {language === 'ms'
                          ? 'Pembantu AI kami sedang dalam pembangunan akhir. Ia akan tersedia tidak lama lagi untuk membantu anda menganalisis tanah dan memberikan cadangan baja yang tepat.'
                          : 'Our AI assistant is in final development. It will be available soon to help you analyze soil and provide precise fertilizer recommendations.'
                        }
                      </p>
                      <p className="text-sm text-gray-500 font-mono bg-gray-200 p-2 rounded">
                        {language === 'ms'
                          ? 'Tentukan NEXT_PUBLIC_AI_ASSISTANT_URL dalam .env.local'
                          : 'Set NEXT_PUBLIC_AI_ASSISTANT_URL in .env.local'
                        }
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>

          {/* What You Get Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <div className="bg-gradient-to-br from-yellow-50 to-white border-4 border-yellow-400 rounded-xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center uppercase">
                {language === 'ms' ? 'Apa Yang Anda Akan Dapat' : 'What You Will Get'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-4xl mb-3 text-center">🎨</div>
                  <h4 className="font-bold text-gray-900 mb-2 text-center">
                    {language === 'ms' ? 'Kod Warna' : 'Color-Coded'}
                  </h4>
                  <p className="text-sm text-gray-600 text-center">
                    {language === 'ms'
                      ? 'Status nutrien: Hijau (Seimbang), Kuning (Rendah), Merah (Kritikal)'
                      : 'Nutrient status: Green (Balanced), Yellow (Low), Red (Critical)'
                    }
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-4xl mb-3 text-center">💰</div>
                  <h4 className="font-bold text-gray-900 mb-2 text-center">
                    {language === 'ms' ? '3 Pilihan Bajet' : '3 Budget Options'}
                  </h4>
                  <p className="text-sm text-gray-600 text-center">
                    {language === 'ms'
                      ? 'Tinggi (Pantas), Sederhana (Seimbang), Rendah (Bajet)'
                      : 'High (Fast), Medium (Balanced), Low (Budget)'
                    }
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-4xl mb-3 text-center">📊</div>
                  <h4 className="font-bold text-gray-900 mb-2 text-center">
                    {language === 'ms' ? 'Ramalan 5 Tahun' : '5-Year Forecast'}
                  </h4>
                  <p className="text-sm text-gray-600 text-center">
                    {language === 'ms'
                      ? 'Unjuran ROI lengkap dengan pecahan tahun demi tahun'
                      : 'Complete ROI projections with year-by-year breakdown'
                    }
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-yellow-400">
              <h3 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide">
                {language === 'ms' ? 'Sokongan 24/7' : '24/7 Support'}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === 'ms'
                  ? 'Hubungi kami melalui WhatsApp atau email jika anda perlukan bantuan.'
                  : 'Contact us via WhatsApp or email if you need assistance.'
                }
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-yellow-400">
              <h3 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide">
                {language === 'ms' ? 'Tutorial Video' : 'Video Tutorials'}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === 'ms'
                  ? 'Tonton tutorial kami untuk memaksimumkan penggunaan AI Assistant.'
                  : 'Watch our tutorials to maximize your use of AI Assistant.'
                }
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-yellow-400">
              <h3 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide">
                {language === 'ms' ? 'Standard MPOB' : 'MPOB Standards'}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === 'ms'
                  ? 'Semua cadangan berdasarkan standard MPOB yang terkini.'
                  : 'All recommendations based on latest MPOB standards.'
                }
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-yellow-400">
              <h3 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide">
                {language === 'ms' ? 'Laporan PDF' : 'PDF Reports'}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === 'ms'
                  ? 'Eksport analisis lengkap ke PDF untuk mesyuarat dan dokumentasi.'
                  : 'Export complete analysis to PDF for meetings and documentation.'
                }
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

