'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';
import { useAuth } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import FAQ from '@/components/ui/FAQ';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const { language, t } = useTranslation(currentLanguage);
  const copy = (en: string, ms: string) => language === 'id' ? toIndonesianText(ms) : language === 'ms' ? ms : en;
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

  // Removed automatic redirect to dashboard - logged in users can access landing page

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
              {copy('Social', 'Sosial')}
            </p>
            <div className="h-16 w-px bg-white/30"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative h-full flex items-center justify-center z-10 pt-6 xs:pt-10 sm:pt-12 md:pt-0 pointer-events-none">
          <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 text-center w-full pointer-events-auto">
            {/* Dynamic Label */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-4 sm:mb-6 md:mb-8"
            >
              <span className="inline-block text-yellow-400 text-[10px] xs:text-xs sm:text-sm font-bold tracking-widest uppercase px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 border-2 border-yellow-400/50 rounded-full backdrop-blur-md bg-white/10 shadow-lg whitespace-nowrap">
                {copy('AI-Powered Agriculture', 'Pertanian Pintar AI')}
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
                  'AI Analysis',
                  800,
                  'AI Analysis in',
                  600,
                  'AI Analysis in 5-8',
                  500,
                  'AI Analysis in 5-8 Minutes',
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
                ] : language === 'id' ? [
                  'Revolusi',
                  800,
                  'Revolusi Kelapa Sawit',
                  600,
                  'Revolusi Kelapa Sawit Anda',
                  3000,
                  'Transformasi',
                  800,
                  'Transformasi Pengelolaan',
                  600,
                  'Transformasi Pengelolaan Perkebunan dengan AI',
                  3000,
                  'Pertanian Presisi',
                  800,
                  'Pertanian Presisi Berbasis Data',
                  600,
                  'Pertanian Presisi Berbasis Data untuk Indonesia',
                  3000,
                  'Analisis AI',
                  800,
                  'Analisis AI dalam',
                  600,
                  'Analisis AI dalam 5-8 Menit',
                  3000,
                  'Maksimalkan Hasil',
                  800,
                  'Maksimalkan Hasil Maksimalkan Untung',
                  600,
                  'Maksimalkan Hasil Maksimalkan Untung Berkelanjutan',
                  3000,
                  'Bergabung dengan 10.000+',
                  800,
                  'Bergabung dengan 10.000+ Pekebun Cerdas',
                  600,
                  'Bergabung dengan 10.000+ Pekebun Cerdas di Seluruh Negeri',
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
                  'Analisis AI dalam',
                  600,
                  'Analisis AI dalam 5-8 Minit',
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
              {copy('AI agronomy for oil palm, giving clear yield and profit decisions in 5-8 minutes.', 'Agronomi AI untuk kelapa sawit, memberikan keputusan hasil dan keuntungan yang jelas dalam 5-8 minit.')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1 }}
              className="flex flex-col sm:flex-row gap-3 xs:gap-4 sm:gap-6 justify-center items-center px-3 xs:px-4 sm:px-6 w-full max-w-2xl mx-auto mb-20 xs:mb-24 sm:mb-8 md:mb-12 relative z-50 pointer-events-auto"
            >
              <Link 
                href="/pricing" 
                className="w-full sm:w-auto relative z-50 pointer-events-auto inline-block"
                style={{ pointerEvents: 'auto' }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 sm:px-10 lg:px-12 py-3.5 sm:py-4 btn-v2-primary rounded-xl font-black text-sm sm:text-base md:text-lg uppercase tracking-wider touch-manipulation cursor-pointer flex items-center justify-center whitespace-nowrap"
                  style={{ pointerEvents: 'auto' }}
                >
                  {copy('🚀 Get Started Now', '🚀 Mulakan Sekarang')}
                </motion.button>
              </Link>
              <Link 
                href="/how-it-works" 
                className="w-full sm:w-auto relative z-50 pointer-events-auto inline-block"
                style={{ pointerEvents: 'auto' }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 sm:px-10 lg:px-12 py-3.5 sm:py-4 btn-v2-glass rounded-xl font-bold text-sm sm:text-base md:text-lg uppercase tracking-wider touch-manipulation cursor-pointer flex items-center justify-center whitespace-nowrap"
                  style={{ pointerEvents: 'auto' }}
                >
                  {copy('▶️ Watch Demo', '▶️ Tonton Demo')}
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
              {copy('Scroll Down', 'Tatal ke Bawah')}
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
        <div className="absolute bottom-2 xs:bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full px-3 xs:px-4 pointer-events-none">
          <p className="text-white/60 text-[9px] xs:text-[10px] sm:text-xs text-center leading-tight">
            © 2025 CROPDRIVE OP ADVISOR™. {copy('TRADEMARKS AND BRANDS ARE THE PROPERTY OF THEIR RESPECTIVE OWNERS', 'TANDA DAGANGAN DAN JENAMA ADALAH HAK MILIK PEMILIKNYA')}
          </p>
        </div>
      </section>

      {/* Who We Serve Section - Two Client Types */}
      <section className="py-10 xs:py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-green-50/50 to-white relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 opacity-30" style={{background:'radial-gradient(ellipse at top, rgba(21,128,61,0.08), transparent 60%), radial-gradient(ellipse at bottom, rgba(34,197,94,0.05), transparent 80%)'}} />
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 xs:mb-10 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-2 xs:mb-3 sm:mb-4 font-heading tracking-tight px-2">
              {copy('Who Do We Serve?', 'Siapa Yang Kami Khidmat?')}
            </h2>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-3 xs:px-4">
              {copy('Tailored solutions for every type of customer', 'Penyelesaian disesuaikan untuk setiap jenis pelanggan')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Farmers Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 border-yellow-200 hover:border-yellow-400 transition-all"
            >
              {/* Farmers Image - Large */}
              <div className="relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden bg-gray-200">
                <Image
                  src="/images/Who-do-we-serve/Farmers.png"
                  alt={copy('Farmers', 'Pekebun Kecil')}
                  width={800}
                  height={600}
                  priority
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>

              <div className="p-6 sm:p-8 lg:p-10">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-green-900 mb-4 sm:mb-6 text-center">
                  {copy('Farmers', 'Pekebun Kecil')}
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
                    {copy('✅ Fixed & transparent prices - No surprises', '✅ Harga tetap & telus - Tiada kejutan')}
                  </p>
                </div>
                <div className="flex items-start space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-700 flex-shrink-0 mt-0.5 xs:mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-800 leading-relaxed">
                    {copy('⚡ Instant access - Start in 5 minutes', '⚡ Akses segera - Mula dalam 5 minit')}
                  </p>
                </div>
                <div className="flex items-start space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-700 flex-shrink-0 mt-0.5 xs:mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-800 leading-relaxed">
                    {copy('📱 Easy-to-use platform - No training needed', '📱 Platform mudah guna - Tiada latihan diperlukan')}
                  </p>
                </div>
                <div className="flex items-start space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-700 flex-shrink-0 mt-0.5 xs:mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-800 leading-relaxed">
                    {copy('🤖 AI analysis in 5-8 minutes', '🤖 Analisis AI dalam 5-8 minit')}
                  </p>
                </div>
              </div>

                <Link href="/pricing">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-6 sm:px-8 py-3 sm:py-4 btn-v2-primary text-white rounded-xl font-black text-base sm:text-lg uppercase tracking-wider"
                  >
                      {copy('🛒 Join Us Now', '🛒 Sertai Sekarang')}
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Organizations Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 border-green-200 hover:border-green-400 transition-all"
            >
              {/* Organizations Image - Large */}
              <div className="relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden bg-gray-200">
                <Image
                  src="/images/Who-do-we-serve/Organizations.png"
                  alt={copy('Organizations', 'Organisasi')}
                  width={800}
                  height={600}
                  priority
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>

              <div className="p-6 sm:p-8 lg:p-10">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-green-900 mb-4 sm:mb-6 text-center">
                  {copy('Organizations', 'Organisasi')}
                </h3>

                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="flex items-start space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-700 flex-shrink-0 mt-0.5 xs:mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-800 leading-relaxed">
                    {copy('💼 Custom solutions for large organizations', '💼 Penyelesaian tersuai untuk organisasi besar')}
                  </p>
                </div>
                <div className="flex items-start space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-700 flex-shrink-0 mt-0.5 xs:mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-800 leading-relaxed">
                    {copy('💰 Special volume-based pricing', '💰 Harga khas berdasarkan volum')}
                  </p>
                </div>
                <div className="flex items-start space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-700 flex-shrink-0 mt-0.5 xs:mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-800 leading-relaxed">
                    {copy('👨‍💼 Dedicated account manager', '👨‍💼 Pengurus akaun dedikasi')}
                  </p>
                </div>
                <div className="flex items-start space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-700 flex-shrink-0 mt-0.5 xs:mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-800 leading-relaxed">
                    {copy('📊 API integration & custom reports', '📊 Integrasi API & laporan tersuai')}
                  </p>
                </div>
                </div>

                <Link href="/get-started/organizations">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-6 sm:px-8 py-3 sm:py-4 btn-v2-primary rounded-xl font-black text-base sm:text-lg uppercase tracking-wider"
                  >
                      {copy('📅 Book A Demo', '📅 Tempah Demo')}
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Image Carousel Section - 5 Images */}
      <section className="py-12 xs:py-16 sm:py-20 bg-gradient-to-b from-green-50 via-white to-green-50/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 premium-mesh"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-10 xs:mb-12 sm:mb-16"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-3 xs:mb-4 font-heading tracking-tight px-2">
              {copy('Why Choose CropDrive?', 'Mengapa Memilih CropDrive?')}
            </h2>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-3 xs:px-4">
              {copy('Cutting-edge AI technology for smarter palm oil farming', 'Teknologi AI terkini untuk pertanian kelapa sawit yang lebih pintar')}
            </p>
          </motion.div>

          {/* 6-Image Carousel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                image: '/images/why-choose-cropdrive/1.  10–15 Minute Analysis.webp',
                title: copy('5-8 Minute Analysis', 'Analisis 5-8 Minit'),
                desc: copy('AI analyzes your lab reports in real-time', 'AI menganalisis laporan makmal anda dalam masa nyata')
              },
              {
                image: '/images/why-choose-cropdrive/2. MPOB Standards.webp',
                title: copy('Industry Standards', 'Standard Industri'),
                desc: copy('All recommendations based on industry best practices', 'Semua cadangan berdasarkan panduan industri terbaik')
              },
              {
                image: '/images/why-choose-cropdrive/3. 150–300 percent ROI.webp',
                title: copy('150–300% ROI', 'ROI 150-300%'),
                desc: copy('Proven return on investment in 3-5 years', 'Pulangan pelaburan terbukti dalam 3-5 tahun')
              },
              {
                image: '/images/why-choose-cropdrive/4. Multi-Farm.webp',
                title: copy('Multi-Farm', 'Multi-Ladang'),
                desc: copy('Manage multiple farms from one dashboard', 'Urus berbilang ladang dari satu papan pemuka')
              },
              {
                image: '/images/why-choose-cropdrive/5. PDF Reports.webp',
                title: copy('PDF Reports', 'Laporan PDF'),
                desc: copy('Export professional reports for meetings', 'Eksport laporan profesional untuk mesyuarat')
              },
              {
                image: '/images/why-choose-cropdrive/6   AI Assistant Available Daily (Optimized).webp',
                title: copy('AI Assistant Available Daily', 'Pembantu AI Tersedia Harian'),
                desc: copy('Get AI support 24/7 for all your questions', 'Dapatkan sokongan AI 24/7 untuk semua soalan anda')
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 border border-green-100 hover:border-green-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
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
              { number: '10-30%', label: copy('Yield Increase', 'Peningkatan Hasil') },
              { number: '80%', label: copy('Time Savings', 'Penjimatan Masa') },
              { number: '20-30%', label: copy('Less Waste', 'Kurang Pembaziran') },
              { number: 'RM 5-10K', label: copy('Savings/Year', 'Jimat/Tahun') },
            ].map((stat, index) => (
              <div key={index} className="text-center bg-green-50 backdrop-blur-sm rounded-xl p-4 xs:p-5 sm:p-6 border-2 border-green-200 hover:border-green-500 transition-all duration-300">
                <p className="text-2xl xs:text-3xl sm:text-4xl font-black text-green-700 mb-1 xs:mb-2">{stat.number}</p>
                <p className="text-gray-700 text-xs xs:text-sm font-semibold uppercase tracking-wide leading-tight">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CropDrive Introduction Section */}
      <section className="py-12 xs:py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white via-green-50/30 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-8 premium-mesh" />
        <div className="absolute top-0 right-1/3 w-80 h-80 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-10 xs:mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 font-heading tracking-tight">
              CropDrive™ Oil Palm <span className="text-green-700">AI Advisor</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl font-semibold text-green-600 mb-4">
              {copy('Smart Farming Intelligence for Oil Palm Plantations', 'Smart Farming Intelligence untuk Ladang Kelapa Sawit')}
            </p>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto mb-4 xs:mb-5 sm:mb-6 leading-relaxed px-3 xs:px-4">
              {copy('Your personal farming expert that analyzes soil and leaf test reports using artificial intelligence. It reads your lab results, compares them to industry standards, and provides detailed recommendations to improve your plantation\'s health and productivity.', 'Pakar pertanian peribadi anda yang menganalisis laporan ujian tanah dan daun menggunakan kecerdasan buatan. Ia membaca keputusan makmal anda, membandingkannya dengan piawaian industri, dan memberikan cadangan terperinci untuk meningkatkan kesihatan dan produktiviti ladang anda.')}
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 xs:gap-3 text-sm xs:text-base sm:text-lg text-green-600 font-semibold bg-green-50 border-2 border-green-200 rounded-xl p-4 xs:p-5 sm:p-6 max-w-2xl mx-auto">
              <span className="text-gray-700">{copy('Simple Process:', 'Proses Mudah:')}</span>
              <div className="flex items-center gap-2">
                <span className="bg-yellow-400 text-green-900 px-3 py-1 rounded-full text-sm font-bold">1</span>
                <span>{copy('Upload Report', 'Muat Naik Laporan')}</span>
              </div>
              <span className="text-yellow-500">→</span>
              <div className="flex items-center gap-2">
                <span className="bg-yellow-400 text-green-900 px-3 py-1 rounded-full text-sm font-bold">2</span>
                <span>{copy('AI Analyzes', 'AI Menganalisis')}</span>
              </div>
              <span className="text-yellow-500">→</span>
              <div className="flex items-center gap-2">
                <span className="bg-yellow-400 text-green-900 px-3 py-1 rounded-full text-sm font-bold">3</span>
                <span>{copy('Get Recommendations', 'Terima Cadangan')}</span>
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
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-8 text-center font-heading tracking-tight">
              {copy('Who Is It For?', 'Untuk Siapa?')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { 
                  img: '/images/who-is-it-for/ICON Oil Palm Farmers.webp',
                    label: copy('Oil Palm Farmers', 'Petani Kelapa Sawit') 
                },
                { 
                  img: '/images/who-is-it-for/ICON  agronomists.webp',
                    label: copy('Agronomists', 'Agronomis') 
                },
                { 
                  img: '/images/who-is-it-for/ICON oil palm estates.webp',
                    label: copy('Oil Palm Estates', 'Estet Kelapa Sawit') 
                },
                { 
                  img: '/images/who-is-it-for/ICON fertilizer suppliers.webp',
                    label: copy('Fertilizer Suppliers', 'Pembekal Baja') 
                },
                { 
                  img: '/images/who-is-it-for/ICON Soil Testing Laboratories.webp',
                    label: copy('Soil Testing Laboratories', 'Makmal Ujian Tanah') 
                },
                { 
                  img: '/images/who-is-it-for/ICON  NGOs Optimized.webp',
                    label: copy('NGOs', 'NGO') 
                },
                { 
                  img: '/images/who-is-it-for/ICON Governmental Agencies.webp',
                    label: copy('Governmental Agencies', 'Agensi Kerajaan') 
                },
                { 
                  img: '/images/who-is-it-for/ICON Academic Institutions.webp',
                    label: copy('Academic Institutions', 'Institusi Akademik') 
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="premium-card p-4 text-center"
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
      <section className="py-12 xs:py-16 sm:py-20 bg-gradient-to-b from-white via-red-50/20 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 premium-mesh" />
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-10 sm:mb-14">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="inline-block text-red-600 text-xs font-bold tracking-widest uppercase mb-4 bg-red-50 px-4 py-1.5 rounded-full border border-red-200"
              >
                {copy('Industry Problem', 'Masalah Industri')}
              </motion.span>
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 xs:mb-6 px-2 font-heading tracking-tight">
                <span className="text-red-600">{copy('The Challenge', 'Cabaran')}</span>
              </h2>
              <p className="text-sm xs:text-base sm:text-lg text-gray-700 px-3 xs:px-4 max-w-3xl mx-auto leading-relaxed">
                {copy('Soil and leaf test results are difficult to interpret without expert support. This often leads to wasted fertilizer, higher costs, missed yield potential, and long-term soil degradation.', 'Keputusan ujian tanah dan daun sukar untuk ditafsir tanpa sokongan pakar. Ini sering membawa kepada pembaziran baja, kos yang lebih tinggi, hasil yang terlepas, dan degradasi tanah jangka panjang.')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  img: '/images/the-challenge/optimized_1_ICON_1_Shortage_of_trained_agronomy_experts_png.png', 
                  text: copy('Shortage of trained agronomy experts', 'Kekurangan pakar agronomi terlatih') 
                },
                { 
                  img: '/images/the-challenge/optimized_2_ICON_Declining_yields_png.png', 
                  text: copy('Declining yields', 'Hasil yang menurun') 
                },
                { 
                  img: '/images/the-challenge/optimized_3_ICON_Financial_losses_from_poor_management_practices_png.png', 
                  text: copy('Financial losses from poor management practices', 'Kerugian kewangan akibat amalan pengurusan yang buruk') 
                },
                { 
                  img: '/images/the-challenge/optimized_4_ICON_Wasted_fertilizer_png.png', 
                  text: copy('Wasted fertilizer', 'Pembaziran baja') 
                },
                { 
                  img: '/images/the-challenge/optimized_5_ICON_High_production_costs_png.png', 
                  text: copy('High production costs', 'Kos pengeluaran yang tinggi') 
                },
                { 
                  img: '/images/the-challenge/optimized_6_ICON_Long-term_soil_degradation_png.png', 
                  text: copy('Long-term soil degradation', 'Degradasi tanah jangka panjang') 
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="flex flex-col items-center text-center bg-white p-6 rounded-2xl border border-red-100 hover:border-red-300 hover:shadow-lg hover:shadow-red-100/50 transition-all shadow-sm"
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
      <section className="py-20 bg-gradient-to-b from-green-50 via-white to-green-50/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-8 premium-mesh" />
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="inline-block text-green-700 text-xs font-bold tracking-widest uppercase mb-4 bg-green-50 px-4 py-1.5 rounded-full border border-green-200"
              >
                {copy('Our Solution', 'Penyelesaian Kami')}
              </motion.span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 font-heading tracking-tight">
                <span className="text-green-700">{copy('How We Help', 'Bagaimana Kami Membantu')}</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {copy('CropDrive™ AI Agronomist interprets test data, provides field-specific recommendations, designs soil health improvement strategies, and links every step to clear economic and return-on-investment values.', 'Agronomis AI CropDrive™ mentafsir data ujian, menyediakan cadangan khusus ladang, mereka bentuk strategi peningkatan kesihatan tanah, dan mengaitkan setiap langkah dengan nilai ekonomi dan pulangan pelaburan yang jelas.')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  img: '/images/how-we-help/optimized_1_ICON_Interprets_test_data_png.png', 
                  text: copy('Interprets test data', 'Mentafsir data ujian') 
                },
                { 
                  img: '/images/how-we-help/optimized_2_ICON_Provides_field-specific_recommendations_png.png', 
                  text: copy('Provides field-specific recommendations', 'Menyediakan cadangan khusus ladang') 
                },
                { 
                  img: '/images/how-we-help/optimized_3_ICON_Designs_soil_health_improvement_strategies_png.png', 
                  text: copy('Designs soil health improvement strategies', 'Mereka bentuk strategi peningkatan kesihatan tanah') 
                },
                { 
                  img: '/images/how-we-help/optimized_4_ICON_Links_every_step_to_clear_economic_and_return-on-investment_values_png.png', 
                  text: copy('Links every step to clear economic and return-on-investment values', 'Mengaitkan setiap langkah dengan nilai ekonomi dan ROI yang jelas') 
                },
                { 
                  img: '/images/how-we-help/optimized_5_ICON_Predicts_yield_growth_and_economic_outcomes_over_several_years_png.png', 
                  text: copy('Predicts yield growth and economic outcomes over several years', 'Meramalkan pertumbuhan hasil dan hasil ekonomi') 
                },
                { 
                  img: '/images/how-we-help/optimized_6_ICON_Supports_soil_health_improvement_through_regenerative_approaches_png.png', 
                  text: copy('Supports soil health improvement through regenerative approaches', 'Menyokong pemulihan kesihatan tanah') 
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
              className="premium-card flex flex-col items-center text-center p-6"
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
                  <p className="text-base font-semibold text-gray-800">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results That Matter Section */}
      <section className="py-20 bg-gradient-to-br from-green-800 via-green-900 to-green-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              <span className="text-yellow-400">{copy('Results That Matter', 'Hasil Yang Penting')}</span>
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto mb-12">
              {copy('Farmers and organizations receive actionable input plans that reduce costs, protect soil, and increase yields. Better resource use strengthens economic returns, improves long-term sustainability, and creates more resilient farming systems.', 'Petani dan organisasi menerima pelan input yang boleh dilaksanakan yang mengurangkan kos, melindungi tanah, dan meningkatkan hasil. Penggunaan sumber yang lebih baik memperkuat pulangan ekonomi, meningkatkan kemampanan jangka panjang, dan mewujudkan sistem pertanian yang lebih berdaya tahan.')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              {
                icon: '/images/how-we-help/optimized_4_ICON_Links_every_step_to_clear_economic_and_return-on-investment_values_png.png',
                number: copy('Up to 25%', 'Sehingga 25%'),
                text: copy('Reduction in fertilizer waste through accurate dosing', 'Pengurangan pembaziran baja melalui dos yang tepat')
              },
              {
                icon: '/images/how-we-help/optimized_3_ICON_Designs_soil_health_improvement_strategies_png.png',
                number: copy('Up to 35%', 'Sehingga 35%'),
                text: copy('Increase in root zone nutrient density under AI-guided input plans', 'Peningkatan ketumpatan nutrien zon akar di bawah pelan input yang dipandu AI')
              },
              {
                icon: '/images/how-we-help/optimized_5_ICON_Predicts_yield_growth_and_economic_outcomes_over_several_years_png.png',
                number: copy('Up to 30%', 'Sehingga 30%'),
                text: copy('Increase in expected return from improved input strategy', 'Peningkatan jangkaan pulangan daripada strategi input yang lebih baik')
              },
              {
                icon: '/images/how-we-help/optimized_6_ICON_Supports_soil_health_improvement_through_regenerative_approaches_png.png',
                number: copy('Up to 50%', 'Sehingga 50%'),
                text: copy('Rise in soil microbial activity with better input balance and timing', 'Peningkatan aktiviti mikrob tanah dengan keseimbangan dan masa input yang lebih baik')
              },
              {
                icon: '/images/how-we-help/optimized_2_ICON_Provides_field-specific_recommendations_png.png',
                number: copy('Up to 25%', 'Sehingga 25%'),
                text: copy('Increase in nutrient uptake efficiency using site-specific dose recommendations', 'Peningkatan kecekapan pengambilan nutrien menggunakan cadangan dos khusus tapak')
              },
              {
                icon: '/images/how-we-help/optimized_1_ICON_Interprets_test_data_png.png',
                number: copy('Up to 21%', 'Sehingga 21%'),
                text: copy('Reduction in yield losses from misapplied inputs', 'Pengurangan kerugian hasil daripada input yang salah aplikasi')
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-center border border-white/20 hover:border-yellow-400/50 hover:bg-white/15 transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto mb-4 relative bg-white rounded-xl p-2 shadow-lg">
                  <Image
                    src={stat.icon}
                    alt={stat.text}
                    width={64}
                    height={64}
                    className="object-contain w-full h-full"
                  />
                </div>
                <div className="text-3xl font-black text-yellow-400 mb-3">{stat.number}</div>
                <p className="text-sm text-green-100 leading-tight">{stat.text}</p>
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
              {copy('Key Benefits & Value', 'Manfaat Utama & Nilai')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { 
                  img: '/images/key-benefits-and-value/optimized_1_ICON_Time_Savings_png.png', 
                  title: copy('Time Savings', 'Penjimatan Masa'),
                  desc: copy('5-8 minutes analysis vs hours of manual work', '5-8 minit analisis vs berjam-jam kerja manual')
                },
                { 
                  img: '/images/key-benefits-and-value/optimized_2_ICON__Cost_Savings_png.png', 
                  title: copy('Cost Savings', 'Penjimatan Kos'),
                  desc: copy('Reduce consultant fees and optimize fertilizer spending', 'Kurangkan yuran perunding dan optimumkan perbelanjaan baja')
                },
                { 
                  img: '/images/key-benefits-and-value/optimized_3_ICON_Revenue_Increase_&_ROI_png.png', 
                  title: copy('Revenue Increase & ROI', 'Peningkatan Pendapatan & ROI'),
                  desc: copy('10-30% yield improvement with 150-300% ROI', '10-30% peningkatan hasil dengan ROI 150-300%')
                },
                { 
                  img: '/images/key-benefits-and-value/optimized_4_ICON_Accuracy_png.png', 
                  title: copy('Accuracy', 'Ketepatan'),
                  desc: copy('AI never makes calculation errors', 'AI tidak pernah membuat kesilapan pengiraan')
                },
                { 
                  img: '/images/key-benefits-and-value/optimized_5_ICON_Accessibility_png.png', 
                  title: copy('Accessibility', 'Kebolehcapaian'),
                  desc: copy('Works on any device, available 24/7', 'Berfungsi pada mana-mana peranti, tersedia 24/7')
                },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="premium-card flex flex-col items-center text-center p-6"
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
                  <p className="text-sm text-gray-600">{benefit.desc}</p>
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
              {copy('The AI Power Behind Your Success', 'Kuasa AI di Sebalik Kejayaan Anda')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {copy('We combine tropical agronomy expertise with artificial intelligence to deliver precise and reliable recommendations', 'Kami menggabungkan pengalaman agronomi tropika dengan kecerdasan buatan untuk memberikan cadangan yang tepat dan boleh dipercayai')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: copy('Machine Learning', 'Pembelajaran Mesin'),
                desc: copy('Our AI learns from thousands of farm analyses to provide better recommendations every day', 'AI kami belajar dari beribu-ribu analisis ladang untuk memberikan cadangan yang lebih baik setiap hari'),
                color: 'from-blue-500 to-cyan-500',
                number: '01'
              },
              {
                title: copy('Data Analytics', 'Analisis Data'),
                desc: copy('Complex data processing in real-time for actionable insights', 'Pemprosesan data kompleks dalam masa nyata untuk insight yang actionable'),
                color: 'from-green-500 to-emerald-500',
                number: '02'
              },
              {
                title: copy('Precise Predictions', 'Ramalan Tepat'),
                desc: copy('Advanced prediction models for accurate yield and ROI forecasts', 'Model ramalan canggih untuk jangkaan hasil dan ROI yang tepat'),
                color: 'from-yellow-500 to-orange-500',
                number: '03'
              },
              {
                title: copy('Soil Science', 'Sains Tanah'),
                desc: copy('Based on scientific research and global best practices', 'Berdasarkan penyelidikan saintifik dan best practices global'),
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
              {copy('How It Works', 'Bagaimana Ia Berfungsi')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {copy('From lab reports to better yields in 5 easy steps', 'Dari laporan makmal ke hasil yang lebih baik dalam 5 langkah mudah')}
            </p>
          </motion.div>

          <div className="space-y-32">
            {[
              {
                step: '01',
                title: copy('Upload Your Report', 'Muat Naik Laporan Anda'),
                desc: copy('Take a photo or upload your soil/leaf analysis report (SPLAB, farm_data). Our AI can read multiple lab report formats', 'Ambil gambar atau muat naik laporan analisis tanah/daun anda (SPLAB, farm_data). AI kami boleh membaca pelbagai format laporan makmal'),
                image: '/images/how-it-works/1. Upload Your Report (Image 01)_optimized.jpg',
                features: [
                  copy('Images, PDF, Excel (SPLAB, farm_data)', 'Gambar, PDF, Excel (SPLAB, farm_data)'),
                  copy('Easy upload', 'Upload mudah'),
                  copy('Secure & encrypted', 'Selamat & terenkripsi')
                ]
              },
              {
                step: '02',
                title: copy('AI Analyzes Data', 'AI Menganalisis Data'),
                desc: copy('Our AI technology processes your data in 5-8 minutes, comparing with industry standards and performing deep analysis', 'Teknologi AI kami memproses data anda dalam 5-8 minit, membandingkan dengan standard industri dan membuat analisis mendalam'),
                image: '/images/how-it-works/2. AI Analyzes Data (Image 02)_optimized.jpg',
                features: [
                  copy('5-8 minute analysis', 'Analisis 5-8 minit'),
                  copy('Industry standards', 'Standard industri'),
                  copy('Deep comparison', 'Perbandingan mendalam')
                ]
              },
              {
                step: '03',
                title: copy('Receive Recommendations', 'Terima Cadangan'),
                desc: copy('Get detailed fertilizer recommendations with 3 budget options, color-coded soil health status, and 5-year forecasts', 'Dapatkan cadangan baja terperinci dengan 3 pilihan bajet, status kesihatan tanah berkod warna, dan ramalan 5 tahun'),
                image: '/images/how-it-works/3. Receive Recommendations (Image 03)_optimized.jpg',
                features: [
                  copy('3 budget options', '3 pilihan bajet'),
                  copy('Color-coded status', 'Status berkod warna'),
                  copy('Long-term forecasts', 'Ramalan jangka panjang')
                ]
              },
              {
                step: '04',
                title: copy('Implement & Track', 'Implementasi & Jejak'),
                desc: copy('Implement recommendations and track your progress over time. See yield improvements and ROI in your dashboard', 'Laksanakan cadangan dan jejak kemajuan anda dari semasa ke semasa. Lihat peningkatan hasil dan ROI dalam papan pemuka anda'),
                image: '/images/how-it-works/4. Implement & Track (Image 04)_optimized.jpg',
                features: [
                  copy('Real-time tracking', 'Penjejakan masa nyata'),
                  copy('Data history', 'Sejarah data'),
                  copy('Progress reports', 'Laporan kemajuan')
                ]
              },
              {
                step: '05',
                title: copy('Keep in Touch with the AI Advisor', 'Terus Berhubung dengan Penasihat AI'),
                desc: copy('Keep in touch with the CropDrive™ AI Advisor for ongoing support throughout the season.', 'Terus berhubung dengan Penasihat AI CropDrive™ untuk sokongan berterusan sepanjang musim.'),
                image: '/images/keep_in_touch_with_the_ai_advisor_optimized.jpg',
                features: [
                  copy('Keep in touch with the AI Advisor for ongoing support.', 'Terus berhubung dengan Penasihat AI untuk sokongan berterusan.'),
                  copy('Quick answers to nutrient, soil, and field management questions.', 'Jawapan pantas untuk soalan nutrien, tanah dan pengurusan ladang.'),
                  copy('Help interpreting new lab reports.', 'Bantuan mentafsir laporan makmal baharu.'),
                  copy('Advice on field symptoms you observe.', 'Nasihat tentang simptom ladang yang anda perhatikan.'),
                  copy('Follow up when results do not match your expectations.', 'Tindak lanjut apabila hasil tidak sepadan dengan jangkaan anda.')
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
                    whileHover={{ scale: 1.03 }}
                    className="relative rounded-3xl overflow-hidden shadow-xl border border-green-100"
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
      <section className="py-20 bg-gradient-to-b from-green-50/40 via-white to-green-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              <span className="text-green-700">{copy('What We Offer', 'Apa Yang Kami Tawarkan')}</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              {copy('We interpret lab results, provide clear fertilization strategies, and deliver long-term investment plans with soil health restoration tailored to each customer.', 'Kami mentafsir keputusan makmal, menyediakan strategi pemupukan yang jelas, dan menyampaikan pelan pelaburan jangka panjang dengan pemulihan kesihatan tanah yang disesuaikan untuk setiap pelanggan.')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                img: '/images/who-is-it-for/ICON Oil Palm Farmers.webp',
                title: copy('Farmers & Estates', 'Petani & Estet'),
                desc: copy('We interpret lab results, provide clear fertilization strategies, and deliver long-term investment plans with soil health restoration tailored to each farm.', 'Kami mentafsir keputusan makmal, menyediakan strategi pemupukan yang jelas, dan menyampaikan pelan pelaburan jangka panjang dengan pemulihan kesihatan tanah yang disesuaikan untuk setiap ladang.')
              },
              {
                img: '/images/who-is-it-for/ICON oil palm estates.webp',
                title: copy('Plantations & Agri-businesses', 'Ladang & Perniagaan Pertanian'),
                desc: copy('Save man-time with fertilization plans delivered in minutes instead of days, ensuring consistency across estates.', 'Jimat masa kerja dengan pelan pemupukan yang disampaikan dalam minit bukannya hari, memastikan konsistensi merentas estet.')
              },
              {
                img: '/images/who-is-it-for/ICON fertilizer suppliers.webp',
                title: copy('Fertilizer Suppliers', 'Pembekal Baja'),
                desc: copy('Boost your fertilizer sales by linking products to tailored field recommendations that deliver clear value to farmers.', 'Tingkatkan jualan baja anda dengan mengaitkan produk kepada cadangan ladang tersuai yang memberikan nilai jelas kepada petani.')
              },
              {
                img: '/images/who-is-it-for/ICON Soil Testing Laboratories.webp',
                title: copy('Soil & Leaf Testing Labs', 'Makmal Ujian Tanah & Daun'),
                desc: copy('Turn raw test results into clear advisory reports, adding value through practical improvement strategies.', 'Tukar keputusan ujian mentah menjadi laporan nasihat yang jelas, menambah nilai melalui strategi peningkatan praktikal.')
              },
              {
                img: '/images/who-is-it-for/ICON  NGOs Optimized.webp',
                title: copy('NGOs & Development Programs', 'NGO & Program Pembangunan'),
                desc: copy('Strengthen farmer cooperatives by adding agronomy services that make advanced tools accessible to smallholders with limited resources.', 'Perkukuh koperasi petani dengan menambah perkhidmatan agronomi yang menjadikan alat canggih boleh diakses oleh pekebun kecil dengan sumber terhad.')
              },
              {
                img: '/images/who-is-it-for/ICON Academic Institutions.webp',
                title: copy('Public, Research & Certification Bodies', 'Badan Awam, Penyelidikan & Pensijilan'),
                desc: copy('Use farm-level data to track adoption, verify impact, and support extension, training, policy, and long-term sustainability.', 'Gunakan data peringkat ladang untuk menjejaki penerimaan, mengesahkan impak, dan menyokong pengembangan, latihan, dasar, dan kemampanan jangka panjang.')
              },
            ].map((segment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-white/85 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-green-100 hover:border-green-400"
              >
                <div className="relative h-56 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-8">
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
                  <h3 className="text-2xl font-black text-green-900 mb-4 text-center">
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
              {copy('Tailored Solutions for', 'Penyelesaian Tersuai untuk')} <span className="text-green-700">{copy('Key Audiences', 'Khalayak Utama')}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: copy('Farmers & Estates', 'Petani & Estet'),
                desc: copy('Turn raw test results into clear advisory reports, adding value through practical improvement strategies.', 'Ubah keputusan ujian mentah menjadi laporan nasihat yang jelas, menambah nilai melalui strategi peningkatan praktikal.'),
                number: '01',
                image: '/images/tailored-solutions/1. Farmers & Estates_optimized.jpg'
              },
              {
                title: copy('Soil & Leaf Testing Labs', 'Makmal Ujian Tanah & Daun'),
                desc: copy('Strengthen farmer cooperatives by adding agronomy services that make advanced tools accessible to smallholders with limited resources.', 'Perkukuh koperasi petani dengan menambah perkhidmatan agronomi yang menjadikan alat canggih boleh diakses oleh pekebun kecil dengan sumber terhad.'),
                number: '02',
                image: '/images/tailored-solutions/2. Soil & Leaf Testing Labs_optimized.jpg'
              },
              {
                title: copy('NGOs & Development Programs', 'NGO & Program Pembangunan'),
                desc: copy('Save man-time with fertilization plans delivered in minutes instead of days, ensuring consistency across estates.', 'Jimat masa kerja dengan pelan pemupukan yang disampaikan dalam minit bukannya hari, memastikan konsistensi merentas estet.'),
                number: '03',
                image: '/images/tailored-solutions/3. NGOs & Development Programs_optimized.jpg'
              },
              {
                title: copy('Plantations & Agri-businesses', 'Ladang & Perniagaan Pertanian'),
                desc: copy('Boost your fertilizer sales by linking products to tailored field recommendations that deliver clear value to farmers.', 'Tingkatkan jualan baja anda dengan mengaitkan produk kepada cadangan ladang tersuai yang memberikan nilai jelas kepada petani.'),
                number: '04',
                image: '/images/tailored-solutions/4. Plantations & Agri-businesses_optimized.jpg'
              },
              {
                title: copy('Fertilizer Suppliers', 'Pembekal Baja'),
                desc: copy('Enhance product adoption through integrated, data-driven recommendations.', 'Tingkatkan penerimaan produk melalui cadangan bersepadu berasaskan data.'),
                number: '05',
                image: '/images/tailored-solutions/5. Fertilizer Suppliers_optimized.jpg'
              },
              {
                title: copy('Public, Research & Certification Bodies', 'Badan Awam, Penyelidikan & Pensijilan'),
                desc: copy('Use farm-level data to track adoption, verify impact, and support extension, training, policy, and long-term sustainability.', 'Gunakan data peringkat ladang untuk menjejaki penerimaan, mengesahkan impak, dan menyokong pengembangan, latihan, dasar, dan kemampanan jangka panjang.'),
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
              {language === 'id'
                ? <><span>Ubah Hasil Uji Laboratorium Menjadi</span> <span className="text-yellow-400">Peningkatan Hasil Nyata</span></>
                : language === 'ms'
                ? <><span>Tukar Keputusan Ujian Makmal Kepada</span> <span className="text-yellow-400">Peningkatan Hasil Sebenar</span></>
                : <>Turn Lab Test Results Into <span className="text-yellow-400">Real Yield Gains</span></>}
            </h2>
            <p className="text-2xl mb-12">
              {copy('Faster, clearer, and reliable decisions backed by science and AI', 'Keputusan yang lebih pantas, jelas, dan boleh dipercayai disokong oleh sains dan AI')}
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
                {copy('For Organizations', 'Untuk Organisasi')}
              </h3>
              <ul className="space-y-4">
                {[
                  copy('Streamline operations with instant, expert-level insights', 'Memperkemas operasi dengan pandangan pakar segera'),
                  copy('Scale support for large networks or programs', 'Meluaskan sokongan untuk rangkaian atau program besar'),
                  copy('Measure and report on sustainability metrics', 'Mengukur dan melaporkan metrik kemampanan'),
                  copy('Increase competitiveness with faster decisions', 'Meningkatkan daya saing dengan keputusan yang lebih pantas'),
                  copy('Reduce man hours through automated analysis', 'Mengurangkan jam kerja melalui analisis automatik'),
                  copy('Lower operational costs across large programs', 'Menurunkan kos operasi merentasi program besar'),
                  copy('Improve profitability with more efficient workflows', 'Meningkatkan keuntungan dengan aliran kerja yang lebih cekap'),
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
                {copy('For Farmers', 'Untuk Petani')}
              </h3>
              <ul className="space-y-4">
                {[
                  copy('Simple, actionable plans from complex data', 'Pelan mudah dan boleh dilaksanakan dari data kompleks'),
                  copy('Cost savings and yield boosts tailored to your fields', 'Penjimatan kos dan peningkatan hasil disesuaikan dengan ladang anda'),
                  copy('Long-term soil health for future seasons', 'Kesihatan tanah jangka panjang untuk musim akan datang'),
                  copy('Access to a qualified AI agronomist at any time', 'Akses kepada agronomis AI bertauliah pada bila-bila masa'),
                  copy('Clear answers to any agronomic questions you face', 'Jawapan jelas untuk sebarang soalan agronomi yang dihadapi'),
                  copy('Support for daily field problems without waiting', 'Sokongan untuk masalah harian di ladang tanpa perlu menunggu'),
                  copy('Reliable guidance for each stage of your crop cycle', 'Panduan yang boleh dipercayai untuk setiap peringkat kitaran tanaman anda'),
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
              {copy('Results Backed by Wide Experience', 'Keputusan Disokong oleh Pengalaman Luas')}
            </p>
            <p className="text-lg max-w-3xl mx-auto">
              {copy('Our AI draws from proven agronomic expertise to deliver trusted outcomes in tropical agriculture.', 'AI kami menggunakan kepakaran agronomi yang terbukti untuk memberikan hasil yang dipercayai dalam pertanian tropika.')}
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
              {copy('What Farmers Can', 'Apa Yang Petani Boleh')} <span className="text-green-700">{copy('Expect', 'Jangkakan')}</span>
            </h2>
            <p className="text-xl text-gray-600">
              {copy('Real results achievable with CropDrive', 'Hasil sebenar yang boleh dicapai dengan CropDrive')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              {
                image: '/images/results-in-numbers/1   30 percent Average Yield Increase (2)_optimized.jpg',
                number: '30%+',
                label: copy('Average Yield Increase', 'Purata Peningkatan Hasil'),
              },
              {
                image: '/images/results-in-numbers/2   20 40 percent improved efficiency (2)_optimized.jpg',
                number: '20–40%',
                label: copy('Improved Efficiency', 'Kecekapan Bertambah Baik'),
              },
              {
                image: '/images/results-in-numbers/3    RM800 2000 less input costs  (2)_optimized.jpg',
                number: 'RM800–2,000/ha',
                label: copy('Lower Input Costs', 'Kos Input Lebih Rendah'),
              },
              {
                image: '/images/results-in-numbers/4   15 20 percent healthier soil profile_optimized.jpg',
                number: '15–25%',
                label: copy('Healthier Soil Status', 'Status Tanah Lebih Sihat'),
              },
              {
                image: '/images/results-in-numbers/5  RM7000 12000 ha additional revenue_optimized.jpg',
                number: 'RM7,000–12,000/ha',
                label: copy('Additional Revenue', 'Pendapatan Tambahan'),
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
                <div className="relative h-32 sm:h-36 md:h-40 overflow-hidden flex items-center justify-center bg-green-50/30">
                  <Image
                    src={stat.image}
                    alt={stat.label}
                    width={120}
                    height={120}
                    sizes="(max-width: 768px) 100px, (max-width: 1280px) 120px, 120px"
                    className="object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="text-2xl font-bold text-green-700 mb-2">{stat.number}</div>
                  <div className="text-base font-medium text-gray-700">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="py-24 bg-gradient-to-b from-white via-green-50/30 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-8 premium-mesh" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 font-heading">
              {copy('Why Farmers', 'Kenapa Petani')} <span className="text-green-700">{copy('Trust Us', 'Mempercayai Kami')}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {copy('We\'re committed to your success with quality guarantees and the best support', 'Kami komited untuk kejayaan anda dengan jaminan kualiti dan sokongan terbaik')}
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
              { icon: '✅', label: copy('Accurate Recommendations', 'Cadangan Tepat') },
              { icon: '🔐', label: copy('Bank-Level Data Security', 'Keselamatan Data Tahap Bank') },
              { icon: '⚗️', label: copy('Research Backed', 'Disokong Penyelidikan') },
              { icon: '🤖', label: copy('Daily AI Assistant', 'Pembantu AI Harian') },
              { icon: '🌱', label: copy('Built for Malaysian Oil Palm', 'Fokus Kelapa Sawit Malaysia') },
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
                    en: 'Science-Based Recommendations',
                    ms: 'Cadangan Berasaskan Sains',
                  },
                  desc: {
                    en: 'Our fertilization and soil-improvement plans follow the latest nutrient standards and international Good Agricultural Practices (GAP) for oil palm. Every recommendation is grounded in verified agronomic science.',
                    ms: 'Pelan pembajaan dan penambahbaikan tanah kami mengikut piawaian nutrien terkini serta Amalan Pertanian Baik antarabangsa untuk kelapa sawit. Setiap cadangan berpaksikan sains agronomi yang disahkan.',
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
                    en: 'All recommendations are built specifically for Malaysian oil palm farmers, designed with local soils, planting conditions, and industry standards in mind. Everything is tailored to real Malaysian field needs, not generic global advice.',
                    ms: 'Semua cadangan dibina khusus untuk petani kelapa sawit Malaysia, direka dengan mengambil kira tanah tempatan, keadaan penanaman dan piawaian industri. Segala-galanya disesuaikan dengan keperluan lapangan Malaysia, bukan nasihat generik global.',
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
                      alt={language === 'id' ? toIndonesianText(trust.title.ms) : language === 'ms' ? trust.title.ms : trust.title.en}
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
                      {language === 'id' ? toIndonesianText(trust.title.ms) : language === 'ms' ? trust.title.ms : trust.title.en}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 text-center leading-relaxed flex-grow mb-0">
                      {language === 'id' ? toIndonesianText(trust.desc.ms) : language === 'ms' ? trust.desc.ms : trust.desc.en}
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
                  {copy('100% Satisfaction Guarantee', 'Jaminan Kepuasan 100%')}
                </h3>
              </div>
              <p className="text-base sm:text-xl text-green-50 max-w-2xl mx-auto">
                {copy('Try risk-free. If you\'re not satisfied with the results within 30 days, we\'ll refund you in full.', 'Cuba tanpa risiko. Jika anda tidak berpuas hati dengan hasil dalam 30 hari, kami akan pulangkan wang anda sepenuhnya.')}
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
              {copy('Powered by', 'Teknologi Yang')} <span className="text-yellow-400">{copy('Advanced AI', 'Dikuasai AI')}</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {copy('Our platform uses cutting-edge AI technology to deliver precise agricultural recommendations', 'Platform kami menggunakan teknologi AI terkini untuk memberikan cadangan pertanian yang tepat')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: copy('Instant Analysis of Your Reports', 'Analisis Laporan Anda Dengan Serta-Merta'),
                desc: copy('Our system reads your soil and leaf test results automatically and highlights what matters. No manual typing. No guessing. You upload your report, and the AI explains the findings in simple steps.', 'Sistem kami membaca hasil ujian tanah dan daun anda secara automatik dan menyerlahkan apa yang penting. Tiada pengetikan manual. Tiada tekaan. Anda muat naik laporan, dan AI menjelaskan penemuan dalam langkah mudah.'),
                icon: '📄'
              },
              {
                title: copy('Smart Recommendations Based on Real Oil Palm Science', 'Cadangan Pintar Berdasarkan Sains Kelapa Sawit Sebenar'),
                desc: copy('Every fertilizer plan is generated using up-to-date oil palm research, industry nutrient standards, and proven agronomy practices. You get clear decisions that match real field conditions.', 'Setiap pelan baja dijana menggunakan penyelidikan kelapa sawit terkini, standard nutrien industri, dan amalan agronomi terbukti. Anda mendapat keputusan yang jelas dan sesuai dengan keadaan lapangan sebenar.'),
                icon: '🔬'
              },
              {
                title: copy('Continuous Support for All Your Field Questions', 'Sokongan Berterusan Untuk Semua Soalan Lapangan Anda'),
                desc: copy('The AI assistant is available every day to answer your questions about fertilizer schedules, nutrient problems, soil issues, and field decisions. You get guidance whenever you need it.', 'Pembantu AI sedia membantu setiap hari untuk menjawab soalan anda tentang jadual baja, masalah nutrien, isu tanah, dan keputusan lapangan. Anda mendapat panduan apabila diperlukan.'),
                icon: '🤖'
              }
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="glass p-8 rounded-2xl border border-gray-600/30 hover:border-yellow-400/40 transition-all glass-shimmer"
              >
                <div className="text-6xl mb-4">{tech.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-yellow-400">{tech.title}</h3>
                <p className="text-gray-300 leading-relaxed">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Podcasts Section */}
      <section className="py-24 bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 font-heading">
              CropDrive <span className="text-yellow-400">{copy('Podcasts', 'Podcast')}</span>
            </h2>
            <p className="text-xl text-green-50 max-w-3xl mx-auto leading-relaxed">
              {copy('Watch and listen to exclusive insights on oil palm farming, AI technology, and AGS consultancy services. Video content that helps enhance your knowledge.', 'Tonton dan dengar pandangan eksklusif tentang pertanian kelapa sawit, teknologi AI, dan perkhidmatan perundingan AGS. Kandungan video yang membantu meningkatkan pengetahuan anda.')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href="/podcasts">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-yellow-400 text-green-900 rounded-full font-black text-lg uppercase tracking-wider shadow-2xl hover:bg-yellow-300 transition-all duration-300 border-4 border-yellow-300"
              >
                {copy('🎧 Watch Podcasts', '🎧 Tonton Podcast')}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-b from-green-50/50 via-white to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-8 premium-mesh" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 font-heading">
              {copy('Frequently Asked Questions', 'Soalan Lazim')}
            </h2>
            <p className="text-xl text-gray-600">
              {copy('Answers to the most commonly asked questions', 'Jawapan kepada soalan yang paling kerap ditanya')}
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
              {copy('Still have questions?', 'Masih ada soalan?')}
            </p>
            <Link href="/contact">
              <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-full hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl">
                {copy('Contact Us', 'Hubungi Kami')}
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
            <h2 className="text-4xl md:text-6xl font-black mb-6 font-heading">
              {copy('Start Transforming Your Farm Today!', 'Mulakan Transformasi Ladang Anda Hari Ini!')}
            </h2>
            
            <p className="text-xl md:text-2xl text-green-50 mb-4 max-w-3xl mx-auto leading-relaxed">
              {copy('Join 3,500+ smart farmers who have already increased their yields by up to 38%', 'Sertai 3,500+ petani pintar yang sudah meningkatkan hasil mereka sehingga 38%')}
            </p>

            <p className="text-lg text-yellow-300 mb-10 font-semibold">
              {copy('✓ Reports in 5-8 minutes', '✓ Laporan dalam 5-8 minit')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/pricing">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-10 py-5 bg-yellow-400 text-green-900 rounded-full font-black text-xl uppercase tracking-wider shadow-2xl hover:bg-yellow-300 transition-all duration-300 border-4 border-yellow-300"
                >
                    {copy('🚀 Join Us Now', '🚀 Sertai Sekarang')}
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
                <span className="text-2xl">🔒</span>
                <span className="font-semibold">{copy('Secure Payment', 'Pembayaran Selamat')}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}