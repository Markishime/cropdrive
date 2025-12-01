'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import { useAuth } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import FAQ from '@/components/ui/FAQ';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ms'>('en');
  const { language, t } = useTranslation(currentLanguage);
  const [activeSection, setActiveSection] = useState(1);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

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

  useEffect(() => {
    if (mounted && !authLoading && user) {
      router.replace('/dashboard');
    }
  }, [mounted, authLoading, user, router]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Screen with Image Carousel Background */}
      <section className="relative min-h-[calc(100vh-4rem)] sm:min-h-screen overflow-hidden pt-24 sm:pt-28">
        {/* Background Video with Overlay */}
        <div className="absolute inset-0">
          <video
            src="/videos/Farmer_s_Oil_Palm_Land_Drone_Shot.mp4"
            autoPlay
            muted
            playsInline
            loop
            className="w-full h-full object-cover"
          />
          {/* Lighter overlay to make video more visible */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/50 via-green-800/40 to-green-900/50"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>


        {/* Social Links */}
        <div className="absolute left-8 bottom-12 z-20 hidden lg:block">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-white text-xs uppercase tracking-widest transform -rotate-90 origin-center mb-12">
              {language === 'ms' ? 'Sosial' : 'Social'}
            </p>
            <div className="h-16 w-px bg-white/30"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative h-full flex items-center justify-center z-10 pt-6 xs:pt-10 sm:pt-12 md:pt-0">
          <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 text-center w-full">
            {/* Dynamic Label */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-4 sm:mb-6 md:mb-8"
            >
              <span className="inline-block text-yellow-400 text-[10px] xs:text-xs sm:text-sm font-bold tracking-widest uppercase px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 border-2 border-yellow-400/50 rounded-full backdrop-blur-md bg-white/10 shadow-lg whitespace-nowrap">
                {language === 'ms' ? 'Pertanian Pintar AI' : 'AI-Powered Agriculture'}
              </span>
            </motion.div>

            {/* Main Quote with Enhanced Typewriter Effect */}
            <motion.h1
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3, type: "spring", stiffness: 100 }}
              className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 xs:mb-6 sm:mb-8 leading-[1.1] sm:leading-tight min-h-[120px] xs:min-h-[160px] sm:min-h-[200px] md:min-h-[240px] lg:min-h-[280px] font-heading drop-shadow-2xl tracking-tight px-2 xs:px-4"
              style={{ textShadow: '0 8px 32px rgba(0,0,0,0.6)', letterSpacing: '-0.03em' }}
            >
              <TypeAnimation
                sequence={language === 'en' ? [
                  'Revolutionize',
                  800,
                  'Revolutionize Your',
                  600,
                  'Revolutionize Your Palm Oil',
                  500,
                  'Revolutionize Your Palm Oil Operations',
                  3000,
                  'Transform',
                  800,
                  'Transform Plantation',
                  600,
                  'Transform Plantation Management',
                  500,
                  'Transform Plantation Management with AI',
                  3000,
                  'Data-Driven',
                  800,
                  'Data-Driven Precision',
                  600,
                  'Data-Driven Precision Agriculture',
                  500,
                  'Data-Driven Precision Agriculture for Malaysia',
                  3000,
                  'MPOB Certified',
                  800,
                  'MPOB Certified AI',
                  600,
                  'MPOB Certified AI Analysis',
                  500,
                  'MPOB Certified AI Analysis in 10-15 Minutes',
                  3000,
                  'Maximize Yield',
                  800,
                  'Maximize Yield Maximize Profits',
                  600,
                  'Maximize Yield Maximize Profits Sustainably',
                  3000,
                  'Join 10,000+',
                  800,
                  'Join 10,000+ Smart Farmers',
                  600,
                  'Join 10,000+ Smart Farmers Nationwide',
                  3000,
                ] : [
                  'Revolusi',
                  800,
                  'Revolusi Kelapa Sawit',
                  600,
                  'Revolusi Kelapa Sawit Anda',
                  3000,
                  'Transformasi',
                  800,
                  'Transformasi Pengurusan',
                  600,
                  'Transformasi Pengurusan Ladang dengan AI',
                  3000,
                  'Pertanian Presisi',
                  800,
                  'Pertanian Presisi Berdata',
                  600,
                  'Pertanian Presisi Berdata untuk Malaysia',
                  3000,
                  'Analisis AI',
                  800,
                  'Analisis AI Bertauliah MPOB',
                  600,
                  'Analisis AI Bertauliah MPOB dalam 10-15 Minit',
                  3000,
                  'Maksimum Hasil',
                  800,
                  'Maksimum Hasil Maksimum Untung',
                  600,
                  'Maksimum Hasil Maksimum Untung Lestari',
                  3000,
                  'Sertai 10,000+',
                  800,
                  'Sertai 10,000+ Petani Pintar',
                  600,
                  'Sertai 10,000+ Petani Pintar Seluruh Negara',
                  3000,
                ]}
                wrapper="span"
                speed={80}
                deletionSpeed={60}
                repeat={Infinity}
                cursor={true}
                className="inline-block bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent font-black"
                style={{ 
                  whiteSpace: 'pre-line', 
                  display: 'inline',
                  textShadow: '0 0 60px rgba(250, 204, 21, 0.5), 0 0 100px rgba(250, 204, 21, 0.3)',
                  fontWeight: '900',
                  WebkitTextStroke: '1px rgba(255, 255, 255, 0.1)'
                }}
              />
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-4 xs:mb-6 sm:mb-8 md:mb-10 leading-relaxed px-3 xs:px-4 sm:px-6"
              style={{ textShadow: '0 4px 16px rgba(0,0,0,0.5)' }}
            >
              {language === 'ms' 
                ? 'Tingkatkan hasil kelapa sawit anda dengan analisis AI bertauliah MPOB dalam masa 10-15 minit. Sertai ribuan pekebun pintar di seluruh Malaysia.'
                : 'Boost your palm oil yield with MPOB-certified AI analysis in 10-15 minutes. Join thousands of smart farmers across Malaysia.'
              }
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1 }}
              className="flex flex-col sm:flex-row gap-3 xs:gap-4 sm:gap-6 justify-center items-center px-3 xs:px-4 sm:px-6 w-full max-w-2xl mx-auto mb-20 xs:mb-24 sm:mb-8 md:mb-12"
            >
              <Link href="/pricing" className="w-full sm:w-auto max-w-xs sm:max-w-none">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-6 xs:px-8 sm:px-10 py-3 xs:py-3.5 sm:py-4 md:py-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 rounded-full font-black text-sm xs:text-base sm:text-lg uppercase tracking-wider shadow-2xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 touch-manipulation"
                >
                  {language === 'ms' ? '🚀 Mulakan Sekarang' : '🚀 Get Started Now'}
                </motion.button>
              </Link>
              <Link href="/how-it-works" className="w-full sm:w-auto max-w-xs sm:max-w-none">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-6 xs:px-8 sm:px-10 py-3 xs:py-3.5 sm:py-4 md:py-5 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-full font-bold text-sm xs:text-base sm:text-lg uppercase tracking-wider shadow-2xl hover:bg-white/20 transition-all duration-300 touch-manipulation"
                >
                  {language === 'ms' ? '▶️ Tonton Demo' : '▶️ Watch Demo'}
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Decorative Pattern - Right Side */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 hidden xl:block">
          <svg width="200" height="600" viewBox="0 0 200 600" fill="none" className="opacity-20">
            <path d="M100 50L100 550M50 100L150 100M50 200L150 200M50 300L150 300M50 400L150 400M50 500L150 500" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  className="text-yellow-400" />
            <circle cx="100" cy="100" r="20" stroke="currentColor" strokeWidth="2" className="text-yellow-400" />
            <circle cx="100" cy="200" r="20" stroke="currentColor" strokeWidth="2" className="text-yellow-400" />
            <circle cx="100" cy="300" r="20" stroke="currentColor" strokeWidth="2" className="text-yellow-400" />
            <circle cx="100" cy="400" r="20" stroke="currentColor" strokeWidth="2" className="text-yellow-400" />
            <circle cx="100" cy="500" r="20" stroke="currentColor" strokeWidth="2" className="text-yellow-400" />
          </svg>
        </div>


        {/* Animated Mouse Scroll Indicator - Centered */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-2 xs:bottom-4 sm:bottom-8 left-0 right-0 z-20 flex justify-center hidden sm:flex"
        >
          <div className="flex flex-col items-center justify-center space-y-2 xs:space-y-3">
            <p className="text-white text-[10px] xs:text-xs uppercase tracking-[0.2em] font-bold text-center">
              {language === 'ms' ? 'Tatal ke Bawah' : 'Scroll Down'}
            </p>
            
            {/* Animated Mouse */}
            <motion.div
              animate={{ 
                y: [0, 10, 0],
                opacity: [1, 0.7, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative flex items-center justify-center"
            >
              <div className="w-6 h-9 xs:w-7 xs:h-11 border-[2px] xs:border-[2.5px] border-white/70 rounded-full p-0.5 xs:p-1 backdrop-blur-sm bg-white/10 flex items-start justify-center">
                <motion.div
                  animate={{ 
                    y: [0, 10, 0],
                    opacity: [1, 0, 1]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-1 h-1.5 xs:w-1.5 xs:h-2 bg-yellow-400 rounded-full mt-0.5 xs:mt-1"
                />
              </div>
            </motion.div>

            {/* Animated Arrow */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex items-center justify-center"
            >
              <svg 
                className="w-5 h-5 xs:w-6 xs:h-6 text-yellow-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Copyright Footer */}
        <div className="absolute bottom-2 xs:bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-20 w-full px-3 xs:px-4">
          <p className="text-white/60 text-[9px] xs:text-[10px] sm:text-xs text-center leading-tight">
            © 2025 CROPDRIVE OP ADVISOR™. {language === 'ms' ? 'TANDA DAGANGAN DAN JENAMA ADALAH HAK MILIK PEMILIKNYA' : 'TRADEMARKS AND BRANDS ARE THE PROPERTY OF THEIR RESPECTIVE OWNERS'}
          </p>
        </div>
      </section>

      {/* Who We Serve Section - Two Client Types */}
      <section className="py-10 xs:py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 xs:mb-10 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-2 xs:mb-3 sm:mb-4 font-heading tracking-tight px-2">
              {language === 'ms' ? 'Siapa Yang Kami Khidmat?' : 'Who Do We Serve?'}
            </h2>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-3 xs:px-4">
              {language === 'ms' 
                ? 'Penyelesaian disesuaikan untuk setiap jenis pelanggan'
                : 'Tailored solutions for every type of customer'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 xs:gap-6 sm:gap-8 lg:gap-12">
            {/* Farmers Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl sm:rounded-3xl p-5 xs:p-6 sm:p-8 lg:p-10 border-2 sm:border-4 border-yellow-300 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {/* Palm Fruit Icon */}
              <div className="mb-3 xs:mb-4 sm:mb-6 w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 text-green-900" viewBox="0 0 64 64" fill="currentColor">
                  <circle cx="32" cy="28" r="10" opacity="0.9"/>
                  <circle cx="26" cy="34" r="8" opacity="0.8"/>
                  <circle cx="38" cy="34" r="8" opacity="0.8"/>
                  <circle cx="32" cy="40" r="7" opacity="0.7"/>
                  <circle cx="22" cy="28" r="7" opacity="0.7"/>
                  <circle cx="42" cy="28" r="7" opacity="0.7"/>
                  <rect x="30" y="42" width="4" height="12" rx="2" opacity="0.9"/>
                </svg>
              </div>

              <h3 className="text-xl xs:text-2xl sm:text-3xl font-black text-green-900 mb-2 xs:mb-3 sm:mb-4 text-center">
                {language === 'ms' ? 'Pekebun Kecil' : 'Farmers'}
              </h3>

              <p className="text-sm xs:text-base sm:text-lg text-green-900/80 font-semibold mb-3 xs:mb-4 sm:mb-6 text-center">
                {''}
              </p>

              <div className="space-y-2 xs:space-y-3 sm:space-y-4 mb-5 xs:mb-6 sm:mb-8">
                <div className="flex items-start space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-700 flex-shrink-0 mt-0.5 xs:mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-800 leading-relaxed">
                    {language === 'ms' 
                      ? '✅ Harga tetap & telus - Tiada kejutan'
                      : '✅ Fixed & transparent prices - No surprises'
                    }
                  </p>
                </div>
                <div className="flex items-start space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-700 flex-shrink-0 mt-0.5 xs:mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-800 leading-relaxed">
                    {language === 'ms' 
                      ? '⚡ Akses segera - Mula dalam 5 minit'
                      : '⚡ Instant access - Start in 5 minutes'
                    }
                  </p>
                </div>
                <div className="flex items-start space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-700 flex-shrink-0 mt-0.5 xs:mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-800 leading-relaxed">
                    {language === 'ms' 
                      ? '📱 Platform mudah guna - Tiada latihan diperlukan'
                      : '📱 Easy-to-use platform - No training needed'
                    }
                  </p>
                </div>
                <div className="flex items-start space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-700 flex-shrink-0 mt-0.5 xs:mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-800 leading-relaxed">
                    {language === 'ms' 
                      ? '🤖 Analisis AI dalam 10-15 minit'
                      : '🤖 AI analysis in 10-15 minutes'
                    }
                  </p>
                </div>
              </div>

              <Link href="/pricing">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-5 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-4 bg-green-900 text-yellow-400 rounded-full font-black text-sm xs:text-base sm:text-lg uppercase tracking-wider shadow-xl hover:bg-green-800 transition-all duration-300 touch-manipulation"
                >
                  {language === 'ms' ? '🛒 Sertai Sekarang' : '🛒 Join Us Now'}
                </motion.button>
              </Link>
            </motion.div>

            {/* Organizations Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl sm:rounded-3xl p-5 xs:p-6 sm:p-8 lg:p-10 border-2 sm:border-4 border-green-600 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {/* Plantation Icon */}
              <div className="mb-3 xs:mb-4 sm:mb-6 w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 text-white" viewBox="0 0 64 64" fill="currentColor">
                  <rect x="10" y="35" width="12" height="20" opacity="0.8"/>
                  <rect x="26" y="30" width="12" height="25" opacity="0.9"/>
                  <rect x="42" y="25" width="12" height="30" opacity="0.8"/>
                  <rect x="8" y="55" width="48" height="4" opacity="0.7"/>
                  <path d="M10 35 L16 15 L22 35" opacity="0.6"/>
                  <path d="M26 30 L32 10 L38 30" opacity="0.7"/>
                  <path d="M42 25 L48 8 L54 25" opacity="0.6"/>
                </svg>
              </div>

              <h3 className="text-xl xs:text-2xl sm:text-3xl font-black text-green-900 mb-2 xs:mb-3 sm:mb-4 text-center">
                {language === 'ms' ? 'Organisasi' : 'Organizations'}
              </h3>

              <p className="text-sm xs:text-base sm:text-lg text-green-900/80 font-semibold mb-3 xs:mb-4 sm:mb-6 text-center">
                {''}
              </p>

              <div className="space-y-2 xs:space-y-3 sm:space-y-4 mb-5 xs:mb-6 sm:mb-8">
                <div className="flex items-start space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-700 flex-shrink-0 mt-0.5 xs:mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-800 leading-relaxed">
                    {language === 'ms' 
                      ? '💼 Penyelesaian tersuai untuk organisasi besar'
                      : '💼 Custom solutions for large organizations'
                    }
                  </p>
                </div>
                <div className="flex items-start space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-700 flex-shrink-0 mt-0.5 xs:mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-800 leading-relaxed">
                    {language === 'ms' 
                      ? '💰 Harga khas berdasarkan volum'
                      : '💰 Special volume-based pricing'
                    }
                  </p>
                </div>
                <div className="flex items-start space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-700 flex-shrink-0 mt-0.5 xs:mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-800 leading-relaxed">
                    {language === 'ms' 
                      ? '👨‍💼 Pengurus akaun dedikasi'
                      : '👨‍💼 Dedicated account manager'
                    }
                  </p>
                </div>
                <div className="flex items-start space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-700 flex-shrink-0 mt-0.5 xs:mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-800 leading-relaxed">
                    {language === 'ms' 
                      ? '📊 Integrasi API & laporan tersuai'
                      : '📊 API integration & custom reports'
                    }
                  </p>
                </div>
              </div>

              <Link href="/get-started/organizations">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-5 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full font-black text-sm xs:text-base sm:text-lg uppercase tracking-wider shadow-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 touch-manipulation"
                >
                  {language === 'ms' ? '📅 Tempah Demo' : '📅 Book A Demo'}
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Image Carousel Section - 5 Images */}
      <section className="py-12 xs:py-16 sm:py-20 bg-gradient-to-br from-green-900 via-green-800 to-green-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-10 xs:mb-12 sm:mb-16"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 xs:mb-4 font-heading tracking-tight px-2">
              {language === 'ms' ? 'Mengapa Memilih CropDrive?' : 'Why Choose CropDrive?'}
            </h2>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto px-3 xs:px-4">
              {language === 'ms' 
                ? 'Teknologi AI terkini untuk pertanian kelapa sawit yang lebih pintar'
                : 'Cutting-edge AI technology for smarter palm oil farming'
              }
            </p>
          </motion.div>

          {/* 6-Image Carousel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                image: '/images/why-choose-cropdrive/1.  10–15 Minute Analysis.webp',
                title: language === 'ms' ? 'Analisis 10-15 Minit' : '10–15 Minute Analysis',
                desc: language === 'ms' ? 'AI menganalisis laporan makmal anda dalam masa nyata' : 'AI analyzes your lab reports in real-time'
              },
              {
                image: '/images/why-choose-cropdrive/2. MPOB Standards.webp',
                title: language === 'ms' ? 'Standard MPOB' : 'MPOB Standards',
                desc: language === 'ms' ? 'Semua cadangan berdasarkan panduan MPOB' : 'All recommendations based on MPOB guidelines'
              },
              {
                image: '/images/why-choose-cropdrive/3. 150–300 percent ROI.webp',
                title: language === 'ms' ? 'ROI 150-300%' : '150–300% ROI',
                desc: language === 'ms' ? 'Pulangan pelaburan terbukti dalam 3-5 tahun' : 'Proven return on investment in 3-5 years'
              },
              {
                image: '/images/why-choose-cropdrive/4. Multi-Farm.webp',
                title: language === 'ms' ? 'Multi-Ladang' : 'Multi-Farm',
                desc: language === 'ms' ? 'Urus berbilang ladang dari satu papan pemuka' : 'Manage multiple farms from one dashboard'
              },
              {
                image: '/images/why-choose-cropdrive/5. PDF Reports.webp',
                title: language === 'ms' ? 'Laporan PDF' : 'PDF Reports',
                desc: language === 'ms' ? 'Eksport laporan profesional untuk mesyuarat' : 'Export professional reports for meetings'
              },
              {
                image: '/images/why-choose-cropdrive/6   AI Assistant Available Daily (Optimized).webp',
                title: language === 'ms' ? 'Pembantu AI Tersedia Harian' : 'AI Assistant Available Daily',
                desc: language === 'ms' ? 'Dapatkan sokongan AI 24/7 untuk semua soalan anda' : 'Get AI support 24/7 for all your questions'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-yellow-400/60 transition-all duration-500"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={400}
                    height={256}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <motion.div 
                    className="absolute top-4 right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                    viewport={{ once: true }}
                  >
                    <span className="text-green-900 font-black text-xl">{index + 1}</span>
                  </motion.div>
                </div>
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-black text-gray-900 mb-2 font-heading tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-10 xs:mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 xs:gap-4 sm:gap-6"
          >
            {[
              { number: '10-30%', label: language === 'ms' ? 'Peningkatan Hasil' : 'Yield Increase' },
              { number: '80%', label: language === 'ms' ? 'Penjimatan Masa' : 'Time Savings' },
              { number: '20-30%', label: language === 'ms' ? 'Kurang Pembaziran' : 'Less Waste' },
              { number: 'RM 5-10K', label: language === 'ms' ? 'Jimat/Tahun' : 'Savings/Year' },
            ].map((stat, index) => (
              <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 xs:p-5 sm:p-6 border-2 border-yellow-400/30 hover:border-yellow-400 transition-all duration-300">
                <p className="text-2xl xs:text-3xl sm:text-4xl font-black text-yellow-400 mb-1 xs:mb-2">{stat.number}</p>
                <p className="text-white/90 text-xs xs:text-sm font-semibold uppercase tracking-wide leading-tight">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CropDrive Introduction Section */}
      <section className="py-12 xs:py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-10 xs:mb-12 sm:mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              CropDrive™ Oil Palm AI Advisor
            </h2>
            <p className="text-2xl md:text-3xl font-semibold text-green-700 mb-4">
              {language === 'ms' 
                ? 'Smart Farming Intelligence untuk Ladang Kelapa Sawit'
                : 'Smart Farming Intelligence for Oil Palm Plantations'
              }
            </p>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto mb-4 xs:mb-5 sm:mb-6 leading-relaxed px-3 xs:px-4">
              {language === 'ms'
                ? 'Pakar pertanian peribadi anda yang menganalisis laporan ujian tanah dan daun menggunakan kecerdasan buatan. Ia membaca keputusan makmal anda, membandingkannya dengan piawaian MPOB, dan memberikan cadangan terperinci untuk meningkatkan kesihatan dan produktiviti ladang anda.'
                : 'Your personal farming expert that analyzes soil and leaf test reports using artificial intelligence. It reads your lab results, compares them to MPOB standards, and provides detailed recommendations to improve your plantation\'s health and productivity.'
              }
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 xs:gap-3 text-sm xs:text-base sm:text-lg text-green-600 font-semibold bg-green-50 border-2 border-green-200 rounded-xl p-4 xs:p-5 sm:p-6 max-w-2xl mx-auto">
              <span className="text-gray-700">{language === 'ms' ? 'Proses Mudah:' : 'Simple Process:'}</span>
              <div className="flex items-center gap-2">
                <span className="bg-yellow-400 text-green-900 px-3 py-1 rounded-full text-sm font-bold">1</span>
                <span>{language === 'ms' ? 'Muat Naik Laporan' : 'Upload Report'}</span>
              </div>
              <span className="text-yellow-500">→</span>
              <div className="flex items-center gap-2">
                <span className="bg-yellow-400 text-green-900 px-3 py-1 rounded-full text-sm font-bold">2</span>
                <span>{language === 'ms' ? 'AI Menganalisis' : 'AI Analyzes'}</span>
              </div>
              <span className="text-yellow-500">→</span>
              <div className="flex items-center gap-2">
                <span className="bg-yellow-400 text-green-900 px-3 py-1 rounded-full text-sm font-bold">3</span>
                <span>{language === 'ms' ? 'Terima Cadangan' : 'Get Recommendations'}</span>
              </div>
            </div>
          </motion.div>

          {/* Who Is It For */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {language === 'ms' ? 'Untuk Siapa?' : 'Who Is It For?'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { 
                  img: '/images/who-is-it-for/ICON Oil Palm Farmers.webp',
                  label: language === 'ms' ? 'Petani Kelapa Sawit' : 'Oil Palm Farmers' 
                },
                { 
                  img: '/images/who-is-it-for/ICON  agronomists.webp',
                  label: language === 'ms' ? 'Agronomis' : 'Agronomists' 
                },
                { 
                  img: '/images/who-is-it-for/ICON oil palm estates.webp',
                  label: language === 'ms' ? 'Estet Kelapa Sawit' : 'Oil Palm Estates' 
                },
                { 
                  img: '/images/who-is-it-for/ICON fertilizer suppliers.webp',
                  label: language === 'ms' ? 'Pembekal Baja' : 'Fertilizer Suppliers' 
                },
                { 
                  img: '/images/who-is-it-for/ICON Soil Testing Laboratories.webp',
                  label: language === 'ms' ? 'Makmal Ujian Tanah' : 'Soil Testing Laboratories' 
                },
                { 
                  img: '/images/who-is-it-for/ICON  NGOs Optimized.webp',
                  label: language === 'ms' ? 'NGO' : 'NGOs' 
                },
                { 
                  img: '/images/who-is-it-for/ICON Governmental Agencies.webp',
                  label: language === 'ms' ? 'Agensi Kerajaan' : 'Governmental Agencies' 
                },
                { 
                  img: '/images/who-is-it-for/ICON Academic Institutions.webp',
                  label: language === 'ms' ? 'Institusi Akademik' : 'Academic Institutions' 
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-3 relative">
                    <Image
                      src={item.img}
                      alt={item.label}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section className="py-12 xs:py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 xs:mb-6 sm:mb-8 text-center px-2">
              <span className="text-red-600">{language === 'ms' ? 'Cabaran' : 'The Challenge'}</span>
            </h2>
            <p className="text-sm xs:text-base sm:text-lg text-gray-700 mb-10 text-center px-3 xs:px-4 max-w-3xl mx-auto">
              {language === 'ms'
                ? 'Keputusan ujian tanah dan daun sukar untuk ditafsir tanpa sokongan pakar. Ini sering membawa kepada pembaziran baja, kos yang lebih tinggi, hasil yang terlepas, dan degradasi tanah jangka panjang.'
                : 'Soil and leaf test results are difficult to interpret without expert support. This often leads to wasted fertilizer, higher costs, missed yield potential, and long-term soil degradation.'
              }
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  img: '/images/the-challenge/optimized_1_ICON_1_Shortage_of_trained_agronomy_experts_png.png', 
                  text: language === 'ms' ? 'Kekurangan pakar agronomi terlatih' : 'Shortage of trained agronomy experts' 
                },
                { 
                  img: '/images/the-challenge/optimized_2_ICON_Declining_yields_png.png', 
                  text: language === 'ms' ? 'Hasil yang menurun' : 'Declining yields' 
                },
                { 
                  img: '/images/the-challenge/optimized_3_ICON_Financial_losses_from_poor_management_practices_png.png', 
                  text: language === 'ms' ? 'Kerugian kewangan akibat amalan pengurusan yang buruk' : 'Financial losses from poor management practices' 
                },
                { 
                  img: '/images/the-challenge/optimized_4_ICON_Wasted_fertilizer_png.png', 
                  text: language === 'ms' ? 'Pembaziran baja' : 'Wasted fertilizer' 
                },
                { 
                  img: '/images/the-challenge/optimized_5_ICON_High_production_costs_png.png', 
                  text: language === 'ms' ? 'Kos pengeluaran yang tinggi' : 'High production costs' 
                },
                { 
                  img: '/images/the-challenge/optimized_6_ICON_Long-term_soil_degradation_png.png', 
                  text: language === 'ms' ? 'Degradasi tanah jangka panjang' : 'Long-term soil degradation' 
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="flex flex-col items-center text-center bg-red-50 p-6 rounded-2xl border-2 border-red-200 hover:border-red-400 transition-all"
                >
                  <div className="w-20 h-20 mb-4 relative">
                    <Image
                      src={item.img}
                      alt={item.text}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-base font-semibold text-gray-900">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How We Help Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
              <span className="text-green-700">{language === 'ms' ? 'Bagaimana Kami Membantu' : 'How We Help'}</span>
            </h2>
            <p className="text-2xl font-semibold text-green-700 mb-12 text-center">
              {language === 'ms' ? 'Agronomis AI CropDrive™ mentafsir data ujian, menyediakan cadangan khusus ladang, mereka bentuk strategi peningkatan kesihatan tanah, dan mengaitkan setiap langkah dengan nilai ekonomi dan pulangan pelaburan yang jelas.' : 'CropDrive™ AI Agronomist interprets test data, provides field-specific recommendations, designs soil health improvement strategies, and links every step to clear economic and return-on-investment values.'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  img: '/images/how-we-help/optimized_1_ICON_Interprets_test_data_png.png', 
                  text: language === 'ms' ? 'Mentafsir data ujian' : 'Interprets test data' 
                },
                { 
                  img: '/images/how-we-help/optimized_2_ICON_Provides_field-specific_recommendations_png.png', 
                  text: language === 'ms' ? 'Menyediakan cadangan khusus ladang' : 'Provides field-specific recommendations' 
                },
                { 
                  img: '/images/how-we-help/optimized_3_ICON_Designs_soil_health_improvement_strategies_png.png', 
                  text: language === 'ms' ? 'Mereka bentuk strategi peningkatan kesihatan tanah' : 'Designs soil health improvement strategies' 
                },
                { 
                  img: '/images/how-we-help/optimized_4_ICON_Links_every_step_to_clear_economic_and_return-on-investment_values_png.png', 
                  text: language === 'ms' ? 'Mengaitkan setiap langkah dengan nilai ekonomi dan ROI yang jelas' : 'Links every step to clear economic and return-on-investment values' 
                },
                { 
                  img: '/images/how-we-help/optimized_5_ICON_Predicts_yield_growth_and_economic_outcomes_over_several_years_png.png', 
                  text: language === 'ms' ? 'Meramalkan pertumbuhan hasil dan hasil ekonomi' : 'Predicts yield growth and economic outcomes over several years' 
                },
                { 
                  img: '/images/how-we-help/optimized_6_ICON_Supports_soil_health_improvement_through_regenerative_approaches_png.png', 
                  text: language === 'ms' ? 'Menyokong pemulihan kesihatan tanah' : 'Supports soil health improvement through regenerative approaches' 
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="flex flex-col items-center text-center bg-white p-6 rounded-2xl shadow-lg border-2 border-green-200 hover:border-green-500 transition-all"
                >
                  <div className="w-20 h-20 mb-4 relative">
                    <Image
                      src={item.img}
                      alt={item.text}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-base font-semibold text-gray-900">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results That Matter Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              <span className="text-yellow-400">{language === 'ms' ? 'Hasil Yang Penting' : 'Results That Matter'}</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12">
              {language === 'ms'
                ? 'Petani dan organisasi menerima pelan input yang boleh dilaksanakan yang mengurangkan kos, melindungi tanah, dan meningkatkan hasil. Penggunaan sumber yang lebih baik memperkuat pulangan ekonomi, meningkatkan kemampanan jangka panjang, dan mewujudkan sistem pertanian yang lebih berdaya tahan.'
                : 'Farmers and organizations receive actionable input plans that reduce costs, protect soil, and increase yields. Better resource use strengthens economic returns, improves long-term sustainability, and creates more resilient farming systems.'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              {
                icon: '/images/how-we-help/optimized_4_ICON_Links_every_step_to_clear_economic_and_return-on-investment_values_png.png',
                number: language === 'ms' ? 'Sehingga 25%' : 'Up to 25%',
                text: language === 'ms' ? 'Pengurangan pembaziran baja melalui dos yang tepat' : 'Reduction in fertilizer waste through accurate dosing'
              },
              {
                icon: '/images/how-we-help/optimized_3_ICON_Designs_soil_health_improvement_strategies_png.png',
                number: language === 'ms' ? 'Sehingga 35%' : 'Up to 35%',
                text: language === 'ms' ? 'Peningkatan ketumpatan nutrien zon akar di bawah pelan input yang dipandu AI' : 'Increase in root zone nutrient density under AI-guided input plans'
              },
              {
                icon: '/images/how-we-help/optimized_5_ICON_Predicts_yield_growth_and_economic_outcomes_over_several_years_png.png',
                number: language === 'ms' ? 'Sehingga 30%' : 'Up to 30%',
                text: language === 'ms' ? 'Peningkatan jangkaan pulangan daripada strategi input yang lebih baik' : 'Increase in expected return from improved input strategy'
              },
              {
                icon: '/images/how-we-help/optimized_6_ICON_Supports_soil_health_improvement_through_regenerative_approaches_png.png',
                number: language === 'ms' ? 'Sehingga 50%' : 'Up to 50%',
                text: language === 'ms' ? 'Peningkatan aktiviti mikrob tanah dengan keseimbangan dan masa input yang lebih baik' : 'Rise in soil microbial activity with better input balance and timing'
              },
              {
                icon: '/images/how-we-help/optimized_2_ICON_Provides_field-specific_recommendations_png.png',
                number: language === 'ms' ? 'Sehingga 25%' : 'Up to 25%',
                text: language === 'ms' ? 'Peningkatan kecekapan pengambilan nutrien menggunakan cadangan dos khusus tapak' : 'Increase in nutrient uptake efficiency using site-specific dose recommendations'
              },
              {
                icon: '/images/how-we-help/optimized_1_ICON_Interprets_test_data_png.png',
                number: language === 'ms' ? 'Sehingga 21%' : 'Up to 21%',
                text: language === 'ms' ? 'Pengurangan kerugian hasil daripada input yang salah aplikasi' : 'Reduction in yield losses from misapplied inputs'
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-center border-2 border-white/20 hover:border-yellow-400 transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <Image
                    src={stat.icon}
                    alt={stat.text}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div className="text-3xl font-black text-yellow-400 mb-3">{stat.number}</div>
                <p className="text-sm text-blue-100 leading-tight">{stat.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center">
              {language === 'ms' ? 'Manfaat Utama & Nilai' : 'Key Benefits & Value'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { 
                  img: '/images/key-benefits-and-value/optimized_1_ICON_Time_Savings_png.png', 
                  title: language === 'ms' ? 'Penjimatan Masa' : 'Time Savings',
                  desc: language === 'ms' ? '10-15 minit analisis vs berjam-jam kerja manual' : '10-15 minutes analysis vs hours of manual work'
                },
                { 
                  img: '/images/key-benefits-and-value/optimized_2_ICON__Cost_Savings_png.png', 
                  title: language === 'ms' ? 'Penjimatan Kos' : 'Cost Savings',
                  desc: language === 'ms' ? 'Kurangkan yuran perunding dan optimumkan perbelanjaan baja' : 'Reduce consultant fees and optimize fertilizer spending'
                },
                { 
                  img: '/images/key-benefits-and-value/optimized_3_ICON_Revenue_Increase_&_ROI_png.png', 
                  title: language === 'ms' ? 'Peningkatan Pendapatan & ROI' : 'Revenue Increase & ROI',
                  desc: language === 'ms' ? '10-30% peningkatan hasil dengan ROI 150-300%' : '10-30% yield improvement with 150-300% ROI'
                },
                { 
                  img: '/images/key-benefits-and-value/optimized_4_ICON_Accuracy_png.png', 
                  title: language === 'ms' ? 'Ketepatan' : 'Accuracy',
                  desc: language === 'ms' ? 'AI tidak pernah membuat kesilapan pengiraan' : 'AI never makes calculation errors'
                },
                { 
                  img: '/images/key-benefits-and-value/optimized_5_ICON_Accessibility_png.png', 
                  title: language === 'ms' ? 'Kebolehcapaian' : 'Accessibility',
                  desc: language === 'ms' ? 'Berfungsi pada mana-mana peranti, tersedia 24/7' : 'Works on any device, available 24/7'
                },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="flex flex-col items-center text-center bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg border-2 border-green-200 hover:border-green-500 transition-all"
                >
                  <div className="w-20 h-20 mb-4 relative">
                    <Image
                      src={benefit.img}
                      alt={benefit.title}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-700">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Technology Behind CropDrive Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(30deg, #0ea5e9 12%, transparent 12.5%, transparent 87%, #0ea5e9 87.5%, #0ea5e9), linear-gradient(150deg, #0ea5e9 12%, transparent 12.5%, transparent 87%, #0ea5e9 87.5%, #0ea5e9)',
            backgroundSize: '40px 70px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 font-heading tracking-tight">
              {language === 'ms' ? 'Kuasa AI di Sebalik Kejayaan Anda' : 'The AI Power Behind Your Success'}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms' 
                ? 'Kami menggabungkan pengalaman agronomi tropika dengan kecerdasan buatan untuk memberikan cadangan yang tepat dan boleh dipercayai'
                : 'We combine tropical agronomy expertise with artificial intelligence to deliver precise and reliable recommendations'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: language === 'ms' ? 'Pembelajaran Mesin' : 'Machine Learning',
                desc: language === 'ms' ? 'AI kami belajar dari beribu-ribu analisis ladang untuk memberikan cadangan yang lebih baik setiap hari' : 'Our AI learns from thousands of farm analyses to provide better recommendations every day',
                color: 'from-blue-500 to-cyan-500',
                number: '01'
              },
              {
                title: language === 'ms' ? 'Analisis Data' : 'Data Analytics',
                desc: language === 'ms' ? 'Pemprosesan data kompleks dalam masa nyata untuk insight yang actionable' : 'Complex data processing in real-time for actionable insights',
                color: 'from-green-500 to-emerald-500',
                number: '02'
              },
              {
                title: language === 'ms' ? 'Ramalan Tepat' : 'Precise Predictions',
                desc: language === 'ms' ? 'Model ramalan canggih untuk jangkaan hasil dan ROI yang tepat' : 'Advanced prediction models for accurate yield and ROI forecasts',
                color: 'from-yellow-500 to-orange-500',
                number: '03'
              },
              {
                title: language === 'ms' ? 'Sains Tanah' : 'Soil Science',
                desc: language === 'ms' ? 'Berdasarkan penyelidikan MPOB dan best practices global' : 'Based on MPOB research and global best practices',
                color: 'from-purple-500 to-pink-500',
                number: '04'
              }
            ].map((tech, index) => (
                <motion.div
                  key={index}
                initial={{ opacity: 0, y: 60, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: index * 0.2, type: "spring", stiffness: 100 }}
                  viewport={{ once: true }}
                whileHover={{ scale: 1.08, y: -15, rotateY: 5 }}
                className="relative bg-white/10 backdrop-blur-lg p-8 rounded-3xl border-2 border-white/20 hover:border-yellow-400 transition-all duration-500 shadow-2xl group"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 opacity-20 overflow-hidden">
                  <div className={`w-full h-full bg-gradient-to-br ${tech.color} rounded-bl-full transform translate-x-8 -translate-y-8`}></div>
                </div>
                <motion.div 
                  className={`w-20 h-20 bg-gradient-to-br ${tech.color} rounded-2xl flex items-center justify-center mb-6 shadow-2xl relative z-10`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                >
                  <span className="text-white font-black text-3xl">{tech.number}</span>
                </motion.div>
                <h3 className="text-2xl font-black text-white mb-4 font-heading tracking-tight relative z-10">{tech.title}</h3>
                <p className="text-gray-300 leading-relaxed font-medium relative z-10">{tech.desc}</p>
                </motion.div>
              ))}
            </div>
        </div>
      </section>

      {/* How It Works - Step by Step Process */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 font-heading tracking-tight">
              {language === 'ms' ? 'Bagaimana Ia Berfungsi' : 'How It Works'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'ms' 
                ? 'Dari laporan makmal ke hasil yang lebih baik dalam 5 langkah mudah'
                : 'From lab reports to better yields in 5 easy steps'
              }
            </p>
          </motion.div>

          <div className="space-y-32">
            {[
              {
                step: '01',
                title: language === 'ms' ? 'Muat Naik Laporan Anda' : 'Upload Your Report',
                desc: language === 'ms' ? 'Ambil gambar atau muat naik laporan analisis tanah/daun anda (SPLAB, farm_test_data). AI kami boleh membaca pelbagai format laporan makmal' : 'Take a photo or upload your soil/leaf analysis report (SPLAB, farm_test_data). Our AI can read multiple lab report formats',
                image: '/images/how-it-works/1. Upload Your Report (Image 01)_optimized.jpg',
                features: [
                  language === 'ms' ? 'Gambar, PDF, Excel (SPLAB, farm_test_data)' : 'Images, PDF, Excel (SPLAB, farm_test_data)',
                  language === 'ms' ? 'Upload mudah' : 'Easy upload',
                  language === 'ms' ? 'Selamat & terenkripsi' : 'Secure & encrypted'
                ]
              },
              {
                step: '02',
                title: language === 'ms' ? 'AI Menganalisis Data' : 'AI Analyzes Data',
                desc: language === 'ms' ? 'Teknologi AI kami memproses data anda dalam 10-15 minit, membandingkan dengan standard MPOB dan membuat analisis mendalam' : 'Our AI technology processes your data in 10-15 minutes, comparing with MPOB standards and performing deep analysis',
                image: '/images/how-it-works/2. AI Analyzes Data (Image 02)_optimized.jpg',
                features: [
                  language === 'ms' ? 'Analisis 10-15 minit' : '10-15 minute analysis',
                  language === 'ms' ? 'Standard MPOB' : 'MPOB standards',
                  language === 'ms' ? 'Perbandingan mendalam' : 'Deep comparison'
                ]
              },
              {
                step: '03',
                title: language === 'ms' ? 'Terima Cadangan' : 'Receive Recommendations',
                desc: language === 'ms' ? 'Dapatkan cadangan baja terperinci dengan 3 pilihan bajet, status kesihatan tanah berkod warna, dan ramalan 5 tahun' : 'Get detailed fertilizer recommendations with 3 budget options, color-coded soil health status, and 5-year forecasts',
                image: '/images/how-it-works/3. Receive Recommendations (Image 03)_optimized.jpg',
                features: [
                  language === 'ms' ? '3 pilihan bajet' : '3 budget options',
                  language === 'ms' ? 'Status berkod warna' : 'Color-coded status',
                  language === 'ms' ? 'Ramalan jangka panjang' : 'Long-term forecasts'
                ]
              },
              {
                step: '04',
                title: language === 'ms' ? 'Implementasi & Jejak' : 'Implement & Track',
                desc: language === 'ms' ? 'Laksanakan cadangan dan jejak kemajuan anda dari semasa ke semasa. Lihat peningkatan hasil dan ROI dalam papan pemuka anda' : 'Implement recommendations and track your progress over time. See yield improvements and ROI in your dashboard',
                image: '/images/how-it-works/4. Implement & Track (Image 04)_optimized.jpg',
                features: [
                  language === 'ms' ? 'Penjejakan masa nyata' : 'Real-time tracking',
                  language === 'ms' ? 'Sejarah data' : 'Data history',
                  language === 'ms' ? 'Laporan kemajuan' : 'Progress reports'
                ]
              },
              {
                step: '05',
                title: language === 'ms' ? 'Terus Berhubung dengan Penasihat AI' : 'Keep in Touch with the AI Advisor',
                desc: language === 'ms'
                  ? 'Terus berhubung dengan Penasihat AI CropDrive™ untuk sokongan berterusan sepanjang musim.'
                  : 'Keep in touch with the CropDrive™ AI Advisor for ongoing support throughout the season.',
                image: '/images/keep_in_touch_with_the_ai_advisor_optimized.jpg',
                features: [
                  language === 'ms' ? 'Terus berhubung dengan Penasihat AI untuk sokongan berterusan.' : 'Keep in touch with the AI Advisor for ongoing support.',
                  language === 'ms' ? 'Jawapan pantas untuk soalan nutrien, tanah dan pengurusan ladang.' : 'Quick answers to nutrient, soil, and field management questions.',
                  language === 'ms' ? 'Bantuan mentafsir laporan makmal baharu.' : 'Help interpreting new lab reports.',
                  language === 'ms' ? 'Nasihat tentang simptom ladang yang anda perhatikan.' : 'Advice on field symptoms you observe.',
                  language === 'ms' ? 'Tindak lanjut apabila hasil tidak sepadan dengan jangkaan anda.' : 'Follow up when results do not match your expectations.'
                ]
              }
            ].map((step, index) => (
                <motion.div
                  key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
              >
                {/* Image Side */}
                <div className="flex-1 relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative rounded-3xl overflow-hidden shadow-2xl"
                  >
                    <Image
                      src={step.image}
                      alt={step.title}
                      width={600}
                      height={400}
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute top-6 left-6 w-20 h-20 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-xl">
                      <span className="text-3xl font-black text-green-900">{step.step}</span>
                    </div>
                  </motion.div>
                </div>

                {/* Content Side */}
                <div className="flex-1">
                  <h3 className="text-4xl font-black text-gray-900 mb-6 font-heading tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    {step.desc}
                  </p>
                  <ul className="space-y-3">
                    {step.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center text-gray-700"
                      >
                        <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-lg font-medium">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              <span className="text-blue-700">{language === 'ms' ? 'Apa Yang Kami Tawarkan' : 'What We Offer'}</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              {language === 'ms'
                ? 'Kami mentafsir keputusan makmal, menyediakan strategi pemupukan yang jelas, dan menyampaikan pelan pelaburan jangka panjang dengan pemulihan kesihatan tanah yang disesuaikan untuk setiap pelanggan.'
                : 'We interpret lab results, provide clear fertilization strategies, and deliver long-term investment plans with soil health restoration tailored to each customer.'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                img: '/images/who-is-it-for/ICON Oil Palm Farmers.webp',
                title: language === 'ms' ? 'Petani & Estet' : 'Farmers & Estates',
                desc: language === 'ms'
                  ? 'Kami mentafsir keputusan makmal, menyediakan strategi pemupukan yang jelas, dan menyampaikan pelan pelaburan jangka panjang dengan pemulihan kesihatan tanah yang disesuaikan untuk setiap ladang.'
                  : 'We interpret lab results, provide clear fertilization strategies, and deliver long-term investment plans with soil health restoration tailored to each farm.'
              },
              {
                img: '/images/who-is-it-for/ICON oil palm estates.webp',
                title: language === 'ms' ? 'Ladang & Perniagaan Pertanian' : 'Plantations & Agri-businesses',
                desc: language === 'ms'
                  ? 'Jimat masa kerja dengan pelan pemupukan yang disampaikan dalam minit bukannya hari, memastikan konsistensi merentas estet.'
                  : 'Save man-time with fertilization plans delivered in minutes instead of days, ensuring consistency across estates.'
              },
              {
                img: '/images/who-is-it-for/ICON fertilizer suppliers.webp',
                title: language === 'ms' ? 'Pembekal Baja' : 'Fertilizer Suppliers',
                desc: language === 'ms'
                  ? 'Tingkatkan jualan baja anda dengan mengaitkan produk kepada cadangan ladang tersuai yang memberikan nilai jelas kepada petani.'
                  : 'Boost your fertilizer sales by linking products to tailored field recommendations that deliver clear value to farmers.'
              },
              {
                img: '/images/who-is-it-for/ICON Soil Testing Laboratories.webp',
                title: language === 'ms' ? 'Makmal Ujian Tanah & Daun' : 'Soil & Leaf Testing Labs',
                desc: language === 'ms'
                  ? 'Tukar keputusan ujian mentah menjadi laporan nasihat yang jelas, menambah nilai melalui strategi peningkatan praktikal.'
                  : 'Turn raw test results into clear advisory reports, adding value through practical improvement strategies.'
              },
              {
                img: '/images/who-is-it-for/ICON  NGOs Optimized.webp',
                title: language === 'ms' ? 'NGO & Program Pembangunan' : 'NGOs & Development Programs',
                desc: language === 'ms'
                  ? 'Perkukuh koperasi petani dengan menambah perkhidmatan agronomi yang menjadikan alat canggih boleh diakses oleh pekebun kecil dengan sumber terhad.'
                  : 'Strengthen farmer cooperatives by adding agronomy services that make advanced tools accessible to smallholders with limited resources.'
              },
              {
                img: '/images/who-is-it-for/ICON Academic Institutions.webp',
                title: language === 'ms' ? 'Badan Awam, Penyelidikan & Pensijilan' : 'Public, Research & Certification Bodies',
                desc: language === 'ms'
                  ? 'Gunakan data peringkat ladang untuk menjejaki penerimaan, mengesahkan impak, dan menyokong pengembangan, latihan, dasar, dan kemampanan jangka panjang.'
                  : 'Use farm-level data to track adoption, verify impact, and support extension, training, policy, and long-term sustainability.'
              },
            ].map((segment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-blue-100 hover:border-blue-400"
              >
                <div className="relative h-56 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center p-8">
                  <div className="w-32 h-32 relative">
                    <Image
                      src={segment.img}
                      alt={segment.title}
                      width={128}
                      height={128}
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-black text-blue-900 mb-4 text-center">
                    {segment.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-center">
                    {segment.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tailored Solutions Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {language === 'ms' ? 'Penyelesaian Tersuai untuk' : 'Tailored Solutions for'} <span className="text-green-700">{language === 'ms' ? 'Khalayak Utama' : 'Key Audiences'}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: language === 'ms' ? 'Petani & Estet' : 'Farmers & Estates',
                desc: language === 'ms' 
                  ? 'Ubah keputusan ujian mentah menjadi laporan nasihat yang jelas, menambah nilai melalui strategi peningkatan praktikal.'
                  : 'Turn raw test results into clear advisory reports, adding value through practical improvement strategies.',
                number: '01',
                image: '/images/tailored-solutions/1. Farmers & Estates_optimized.jpg'
              },
              {
                title: language === 'ms' ? 'Makmal Ujian Tanah & Daun' : 'Soil & Leaf Testing Labs',
                desc: language === 'ms'
                  ? 'Perkukuh koperasi petani dengan menambah perkhidmatan agronomi yang menjadikan alat canggih boleh diakses oleh pekebun kecil dengan sumber terhad.'
                  : 'Strengthen farmer cooperatives by adding agronomy services that make advanced tools accessible to smallholders with limited resources.',
                number: '02',
                image: '/images/tailored-solutions/2. Soil & Leaf Testing Labs_optimized.jpg'
              },
              {
                title: language === 'ms' ? 'NGO & Program Pembangunan' : 'NGOs & Development Programs',
                desc: language === 'ms'
                  ? 'Jimat masa kerja dengan pelan pemupukan yang disampaikan dalam minit bukannya hari, memastikan konsistensi merentas estet.'
                  : 'Save man-time with fertilization plans delivered in minutes instead of days, ensuring consistency across estates.',
                number: '03',
                image: '/images/tailored-solutions/3. NGOs & Development Programs_optimized.jpg'
              },
              {
                title: language === 'ms' ? 'Ladang & Perniagaan Pertanian' : 'Plantations & Agri-businesses',
                desc: language === 'ms'
                  ? 'Tingkatkan jualan baja anda dengan mengaitkan produk kepada cadangan ladang tersuai yang memberikan nilai jelas kepada petani.'
                  : 'Boost your fertilizer sales by linking products to tailored field recommendations that deliver clear value to farmers.',
                number: '04',
                image: '/images/tailored-solutions/4. Plantations & Agri-businesses_optimized.jpg'
              },
              {
                title: language === 'ms' ? 'Pembekal Baja' : 'Fertilizer Suppliers',
                desc: language === 'ms'
                  ? 'Tingkatkan penerimaan produk melalui cadangan bersepadu berasaskan data.'
                  : 'Enhance product adoption through integrated, data-driven recommendations.',
                number: '05',
                image: '/images/tailored-solutions/5. Fertilizer Suppliers_optimized.jpg'
              },
              {
                title: language === 'ms' ? 'Badan Awam, Penyelidikan & Pensijilan' : 'Public, Research & Certification Bodies',
                desc: language === 'ms'
                  ? 'Gunakan data peringkat ladang untuk menjejaki penerimaan, mengesahkan impak, dan menyokong pengembangan, latihan, dasar, dan kemampanan jangka panjang.'
                  : 'Use farm-level data to track adoption, verify impact, and support extension, training, policy, and long-term sustainability.',
                number: '06',
                image: '/images/tailored-solutions/6. Public, Research & Certification Bodies_optimized.jpg'
              },
            ].map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1, type: "spring" }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-green-200 hover:border-yellow-400 overflow-hidden group"
              >
                <div className="h-48 overflow-hidden">
                  <Image
                    src={solution.image}
                    alt={solution.title}
                    width={400}
                    height={250}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <motion.div
                    className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-600 to-green-800 rounded-2xl mb-4 shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="text-white font-black text-xl">{solution.number}</span>
                  </motion.div>
                  <h3 className="text-xl font-black text-gray-900 mb-3 font-heading tracking-tight">{solution.title}</h3>
                  <p className="text-gray-700 leading-relaxed font-medium">{solution.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Turn Lab Results Section */}
      <section className="py-24 bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              {language === 'ms'
                ? <><span>Tukar Keputusan Ujian Makmal Kepada</span> <span className="text-yellow-400">Peningkatan Hasil Sebenar</span></>
                : <>Turn Lab Test Results Into <span className="text-yellow-400">Real Yield Gains</span></>
              }
            </h2>
            <p className="text-2xl mb-12">
              {language === 'ms'
                ? 'Keputusan yang lebih pantas, jelas, dan boleh dipercayai disokong oleh sains dan AI'
                : 'Faster, clearer, and reliable decisions backed by science and AI'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* For Organizations */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-yellow-400"
            >
              <h3 className="text-3xl font-bold text-yellow-400 mb-6">
                {language === 'ms' ? 'Untuk Organisasi' : 'For Organizations'}
              </h3>
              <ul className="space-y-4">
                {[
                  language === 'ms' ? 'Memperkemas operasi dengan pandangan pakar segera' : 'Streamline operations with instant, expert-level insights',
                  language === 'ms' ? 'Meluaskan sokongan untuk rangkaian atau program besar' : 'Scale support for large networks or programs',
                  language === 'ms' ? 'Mengukur dan melaporkan metrik kemampanan' : 'Measure and report on sustainability metrics',
                  language === 'ms' ? 'Meningkatkan daya saing dengan keputusan yang lebih pantas' : 'Increase competitiveness with faster decisions',
                  language === 'ms' ? 'Mengurangkan jam kerja melalui analisis automatik' : 'Reduce man hours through automated analysis',
                  language === 'ms' ? 'Menurunkan kos operasi merentasi program besar' : 'Lower operational costs across large programs',
                  language === 'ms' ? 'Meningkatkan keuntungan dengan aliran kerja yang lebih cekap' : 'Improve profitability with more efficient workflows',
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <svg className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* For Farmers */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-yellow-400"
            >
              <h3 className="text-3xl font-bold text-yellow-400 mb-6">
                {language === 'ms' ? 'Untuk Petani' : 'For Farmers'}
              </h3>
              <ul className="space-y-4">
                {[
                  language === 'ms' ? 'Pelan mudah dan boleh dilaksanakan dari data kompleks' : 'Simple, actionable plans from complex data',
                  language === 'ms' ? 'Penjimatan kos dan peningkatan hasil disesuaikan dengan ladang anda' : 'Cost savings and yield boosts tailored to your fields',
                  language === 'ms' ? 'Kesihatan tanah jangka panjang untuk musim akan datang' : 'Long-term soil health for future seasons',
                  language === 'ms' ? 'Akses kepada agronomis AI bertauliah pada bila-bila masa' : 'Access to a qualified AI agronomist at any time',
                  language === 'ms' ? 'Jawapan jelas untuk sebarang soalan agronomi yang dihadapi' : 'Clear answers to any agronomic questions you face',
                  language === 'ms' ? 'Sokongan untuk masalah harian di ladang tanpa perlu menunggu' : 'Support for daily field problems without waiting',
                  language === 'ms' ? 'Panduan yang boleh dipercayai untuk setiap peringkat kitaran tanaman anda' : 'Reliable guidance for each stage of your crop cycle',
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <svg className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <p className="text-xl italic mb-8">
              {language === 'ms' ? 'Keputusan Disokong oleh Pengalaman Luas' : 'Results Backed by Wide Experience'}
            </p>
            <p className="text-lg max-w-3xl mx-auto">
              {language === 'ms'
                ? 'AI kami menggunakan kepakaran agronomi yang terbukti untuk memberikan hasil yang dipercayai dalam pertanian tropika.'
                : 'Our AI draws from proven agronomic expertise to deliver trusted outcomes in tropical agriculture.'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* What Farmers Can Expect Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 font-heading">
              {language === 'ms' ? 'Apa Yang Petani Boleh' : 'What Farmers Can'} <span className="text-green-700">{language === 'ms' ? 'Jangkakan' : 'Expect'}</span>
            </h2>
            <p className="text-xl text-gray-600">
              {language === 'ms' 
                ? 'Hasil sebenar yang boleh dicapai dengan CropDrive'
                : 'Real results achievable with CropDrive'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              {
                image: '/images/results-in-numbers/1   30 percent Average Yield Increase (2)_optimized.jpg',
                number: '30%+',
                label: language === 'ms' ? 'Purata Peningkatan Hasil' : 'Average Yield Increase',
              },
              {
                image: '/images/results-in-numbers/2   20 40 percent improved efficiency (2)_optimized.jpg',
                number: '20–40%',
                label: language === 'ms' ? 'Kecekapan Bertambah Baik' : 'Improved Efficiency',
              },
              {
                image: '/images/results-in-numbers/3    RM800 2000 less input costs  (2)_optimized.jpg',
                number: 'RM800–2,000/ha',
                label: language === 'ms' ? 'Kos Input Lebih Rendah' : 'Lower Input Costs',
              },
              {
                image: '/images/results-in-numbers/4   15 20 percent healthier soil profile_optimized.jpg',
                number: '15–25%',
                label: language === 'ms' ? 'Status Tanah Lebih Sihat' : 'Healthier Soil Status',
              },
              {
                image: '/images/results-in-numbers/5  RM7000 12000 ha additional revenue_optimized.jpg',
                number: 'RM7,000–12,000/ha',
                label: language === 'ms' ? 'Pendapatan Tambahan' : 'Additional Revenue',
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="bg-white rounded-3xl text-center shadow-xl border-2 border-green-200 hover:border-yellow-400 transition-all overflow-hidden group"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={stat.image}
                    alt={stat.label}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 20vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="text-4xl font-black text-green-700 mb-2">{stat.number}</div>
                  <div className="text-lg font-semibold text-gray-700">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="py-24 bg-gradient-to-br from-green-50 via-yellow-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 font-heading">
              {language === 'ms' ? 'Kenapa Petani' : 'Why Farmers'} <span className="text-green-700">{language === 'ms' ? 'Mempercayai Kami' : 'Trust Us'}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'ms'
                ? 'Kami komited untuk kejayaan anda dengan jaminan kualiti dan sokongan terbaik'
                : 'We\'re committed to your success with quality guarantees and the best support'
              }
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4 md:gap-5 mb-16"
          >
            {[
              { icon: '✅', label: language === 'ms' ? 'Disahkan MPOB' : 'MPOB Verified' },
              { icon: '🔐', label: language === 'ms' ? 'Keselamatan Data Tahap Bank' : 'Bank-Level Data Security' },
              { icon: '⚗️', label: language === 'ms' ? 'Disokong Penyelidikan' : 'Research Backed' },
              { icon: '🤖', label: language === 'ms' ? 'Pembantu AI Harian' : 'Daily AI Assistant' },
              { icon: '🌱', label: language === 'ms' ? 'Fokus Kelapa Sawit Malaysia' : 'Built for Malaysian Oil Palm' },
            ].map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg border border-green-100 text-sm font-semibold text-green-800"
              >
                <span className="text-lg">{badge.icon}</span>
                {badge.label}
              </div>
            ))}
          </motion.div>

          <div className="relative max-w-7xl mx-auto">
            <div className="absolute inset-y-6 inset-x-10 border border-dashed border-green-200/50 rounded-[40px] pointer-events-none"></div>
            
            <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8 px-4">
              {[
                {
                  image: '/images/why-farmers-trust-us/1. MPOB-Aligned Recommendations_optimized.jpg',
                  title: {
                    en: 'MPOB-Aligned Recommendations',
                    ms: 'Cadangan Selari MPOB',
                  },
                  desc: {
                    en: 'Our fertilization and soil-improvement plans follow the latest MPOB nutrient standards and international Good Agricultural Practices (GAP) for oil palm. Every recommendation is grounded in verified agronomic science.',
                    ms: 'Pelan pembajaan dan penambahbaikan tanah kami mengikut piawaian nutrien MPOB terkini serta Amalan Pertanian Baik antarabangsa untuk kelapa sawit. Setiap cadangan berpaksikan sains agronomi yang disahkan.',
                  },
                },
                {
                  image: '/images/why-farmers-trust-us/2   Clear, Actionable Advice_optimized.jpg',
                  title: {
                    en: 'Clear, Actionable Advice',
                    ms: 'Nasihat Jelas dan Mudah Diamal',
                  },
                  desc: {
                    en: 'Every recommendation includes simple field steps, so farmers no longer have to guess or interpret soil and leaf test results. The system does the analysis for them and turns it into easy actions they can apply immediately.',
                    ms: 'Setiap cadangan disertakan langkah lapangan yang ringkas, jadi petani tidak lagi perlu meneka atau mentafsir keputusan ujian tanah dan daun. Sistem menganalisis untuk anda dan menukarnya kepada tindakan mudah yang boleh dilaksanakan serta-merta.',
                  },
                },
                {
                  image: '/images/why-farmers-trust-us/3. Research-Driven Accuracy_optimized.jpg',
                  title: {
                    en: 'Research-Driven Accuracy',
                    ms: 'Ketepatan Berpandukan Penyelidikan',
                  },
                  desc: {
                    en: 'All insights are generated using AI models trained on current oil palm research, nutrient response studies, and peer-reviewed science. Every output is based on measurable field data, not guesswork.',
                    ms: 'Semua pandangan dijana menggunakan model AI yang dilatih dengan penyelidikan kelapa sawit terkini, kajian tindak balas nutrien dan sains disemak rakan sebaya. Setiap output berasaskan data lapangan yang boleh diukur, bukan tekaan.',
                  },
                },
                {
                  image: '/images/why-farmers-trust-us/4. Daily AI Support for Farmers_optimized.jpg',
                  title: {
                    en: 'Daily AI Support for Farmers',
                    ms: 'Sokongan AI Harian untuk Petani',
                  },
                  desc: {
                    en: 'Subscribers receive continuous assistance from our AI agronomy assistant, available every day to answer questions about fertilizer plans, soil tests, nutrient corrections, and field decisions.',
                    ms: 'Pelanggan menerima bantuan berterusan daripada pembantu agronomi AI kami, tersedia setiap hari untuk menjawab soalan tentang pelan baja, ujian tanah, pembetulan nutrien dan keputusan lapangan.',
                  },
                },
                {
                  image: '/images/why-farmers-trust-us/5. Localized Oil Palm Knowledge_optimized.jpg',
                  title: {
                    en: 'Localized Oil Palm Knowledge',
                    ms: 'Pengetahuan Kelapa Sawit Setempat',
                  },
                  desc: {
                    en: 'All recommendations are built specifically for Malaysian oil palm farmers, designed with local soils, planting conditions, and MPOB standards in mind. Everything is tailored to real Malaysian field needs, not generic global advice.',
                    ms: 'Semua cadangan dibina khusus untuk petani kelapa sawit Malaysia, direka dengan mengambil kira tanah tempatan, keadaan penanaman dan piawaian MPOB. Segala-galanya disesuaikan dengan keperluan lapangan Malaysia, bukan nasihat generik global.',
                  },
                },
              ].map((trust, index) => (
                <motion.div
                  key={trust.title.en}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -12, scale: 1.03 }}
                  className="bg-white rounded-3xl shadow-xl border-2 border-green-200 hover:border-yellow-400 transition-all duration-300 overflow-hidden group flex flex-col h-full"
                >
                  <div className="relative w-full h-52 overflow-hidden bg-white">
                    <Image
                      src={trust.image}
                      alt={language === 'ms' ? trust.title.ms : trust.title.en}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 20vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 sm:p-6 flex flex-col flex-grow min-h-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white font-black text-base flex items-center justify-center mb-3 mx-auto shadow-md">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-3 text-center font-heading leading-tight">
                      {language === 'ms' ? trust.title.ms : trust.title.en}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 text-center leading-relaxed flex-grow mb-0">
                      {language === 'ms' ? trust.desc.ms : trust.desc.en}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Money-Back Guarantee Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="w-full max-w-3xl mx-auto bg-gradient-to-r from-green-600 to-green-700 text-white px-6 sm:px-10 py-8 rounded-3xl shadow-2xl border-4 border-yellow-400">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-between gap-3 sm:gap-4 mb-4 text-center sm:text-left">
                <span className="text-5xl sm:text-6xl">✓</span>
                <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                  {language === 'ms' ? 'Jaminan Kepuasan 100%' : '100% Satisfaction Guarantee'}
                </h3>
              </div>
              <p className="text-base sm:text-xl text-green-50 max-w-2xl mx-auto">
                {language === 'ms'
                  ? 'Cuba tanpa risiko. Jika anda tidak berpuas hati dengan hasil dalam 30 hari, kami akan pulangkan wang anda sepenuhnya.'
                  : 'Try risk-free. If you\'re not satisfied with the results within 30 days, we\'ll refund you in full.'
                }
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 font-heading">
              {language === 'ms' ? 'Teknologi Yang' : 'Powered by'} <span className="text-yellow-400">{language === 'ms' ? 'Dikuasai AI' : 'Advanced AI'}</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {language === 'ms'
                ? 'Platform kami menggunakan teknologi AI terkini untuk memberikan cadangan pertanian yang tepat'
                : 'Our platform uses cutting-edge AI technology to deliver precise agricultural recommendations'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: language === 'ms' ? 'Analisis Laporan Anda Dengan Serta-Merta' : 'Instant Analysis of Your Reports',
                desc: language === 'ms'
                  ? 'Sistem kami membaca hasil ujian tanah dan daun anda secara automatik dan menyerlahkan apa yang penting. Tiada pengetikan manual. Tiada tekaan. Anda muat naik laporan, dan AI menjelaskan penemuan dalam langkah mudah.'
                  : 'Our system reads your soil and leaf test results automatically and highlights what matters. No manual typing. No guessing. You upload your report, and the AI explains the findings in simple steps.',
                icon: '📄'
              },
              {
                title: language === 'ms' ? 'Cadangan Pintar Berdasarkan Sains Kelapa Sawit Sebenar' : 'Smart Recommendations Based on Real Oil Palm Science',
                desc: language === 'ms'
                  ? 'Setiap pelan baja dijana menggunakan penyelidikan kelapa sawit terkini, standard nutrien MPOB, dan amalan agronomi terbukti. Anda mendapat keputusan yang jelas dan sesuai dengan keadaan lapangan sebenar.'
                  : 'Every fertilizer plan is generated using up-to-date oil palm research, MPOB nutrient standards, and proven agronomy practices. You get clear decisions that match real field conditions.',
                icon: '🔬'
              },
              {
                title: language === 'ms' ? 'Sokongan Berterusan Untuk Semua Soalan Lapangan Anda' : 'Continuous Support for All Your Field Questions',
                desc: language === 'ms'
                  ? 'Pembantu AI sedia membantu setiap hari untuk menjawab soalan anda tentang jadual baja, masalah nutrien, isu tanah, dan keputusan lapangan. Anda mendapat panduan apabila diperlukan.'
                  : 'The AI assistant is available every day to answer your questions about fertilizer schedules, nutrient problems, soil issues, and field decisions. You get guidance whenever you need it.',
                icon: '🤖'
              }
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border-2 border-gray-700 hover:border-yellow-400 transition-all"
              >
                <div className="text-6xl mb-4">{tech.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-yellow-400">{tech.title}</h3>
                <p className="text-gray-300 leading-relaxed">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 font-heading">
              {language === 'ms' ? 'Soalan Lazim' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-xl text-gray-600">
              {language === 'ms'
                ? 'Jawapan kepada soalan yang paling kerap ditanya'
                : 'Answers to the most commonly asked questions'
              }
            </p>
          </motion.div>

          <FAQ language={language} />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-lg text-gray-600 mb-4">
              {language === 'ms' ? 'Masih ada soalan?' : 'Still have questions?'}
            </p>
            <Link href="/contact">
              <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-full hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl">
                {language === 'ms' ? 'Hubungi Kami' : 'Contact Us'}
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Enhanced with Urgency */}
      <section className="py-24 bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Urgency Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-block mb-6"
            >
              <div className="bg-yellow-400 text-green-900 px-6 py-2 rounded-full font-black text-sm uppercase tracking-wider shadow-lg">
                {language === 'ms' ? '⚡ Tawaran Masa Terhad' : '⚡ Limited Time Offer'}
              </div>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-black mb-6 font-heading">
              {language === 'ms' ? 'Mulakan Transformasi Ladang Anda Hari Ini!' : 'Start Transforming Your Farm Today!'}
            </h2>
            
            <p className="text-xl md:text-2xl text-green-50 mb-4 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms'
                ? 'Sertai 3,500+ petani pintar yang sudah meningkatkan hasil mereka sehingga 38%'
                : 'Join 3,500+ smart farmers who have already increased their yields by up to 38%'
              }
            </p>

            <p className="text-lg text-yellow-300 mb-10 font-semibold">
              {language === 'ms'
                ? '✓ Mula dalam 5 minit • ✓ Laporan dalam 10-15 minit • ✓ Jaminan wang dikembalikan'
                : '✓ Start in 5 minutes • ✓ Reports in 10-15 minutes • ✓ Money-back guarantee'
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/pricing">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-10 py-5 bg-yellow-400 text-green-900 rounded-full font-black text-xl uppercase tracking-wider shadow-2xl hover:bg-yellow-300 transition-all duration-300 border-4 border-yellow-300"
                >
                  {language === 'ms' ? '🚀 Sertai Sekarang' : '🚀 Join Us Now'}
                </motion.button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-6 text-sm text-green-50"
            >
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-xl">★★★★★</span>
                <span className="font-semibold">{language === 'ms' ? '4.9/5 Penilaian' : '4.9/5 Rating'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                <span className="font-semibold">{language === 'ms' ? 'Pembayaran Selamat' : 'Secure Payment'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="font-semibold">{language === 'ms' ? 'Jaminan 30 Hari' : '30-Day Guarantee'}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}