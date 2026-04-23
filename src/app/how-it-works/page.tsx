'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';
import { safeGetLocalStorage, isVideoSupported, isIntersectionObserverSupported } from '@/utils/browser-compat';

export default function HowItWorksPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const { language } = useTranslation(currentLanguage);
  const copy = (en: string, ms: string) => language === 'id' ? toIndonesianText(ms) : language === 'ms' ? ms : en;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

  // Listen for language changes
  useEffect(() => {
    if (!mounted) return;

    const handleLanguageChange = (newLang?: Language) => {
      const lang = newLang || getCurrentLanguage();
      if (lang !== currentLanguage) {
        setCurrentLanguage(lang);
      }
    };

    // Listen for storage events (works across tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cropdrive-language' && e.newValue) {
        handleLanguageChange(e.newValue as Language);
      }
    };

    // Listen for custom language change events
    const handleCustomLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.language) {
        handleLanguageChange(customEvent.detail.language);
      } else {
        handleLanguageChange();
      }
    };

    // Poll localStorage periodically to catch changes in same window (only if localStorage is available)
    let pollInterval: NodeJS.Timeout | null = null;
    if (typeof window !== 'undefined') {
      pollInterval = setInterval(() => {
        const lang = getCurrentLanguage();
        if (lang !== currentLanguage) {
          handleLanguageChange(lang);
        }
      }, 1000);

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('languageChanged', handleCustomLanguageChange);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('languageChanged', handleCustomLanguageChange);
      }
    };
  }, [mounted, currentLanguage]);

  // Get video URLs from environment variables or fallback to local paths
  // These videos are publicly accessible to all users (no authentication required)
  const getVideoUrl = (language: Language) => {
    if (language === 'ms' || language === 'id') {
      const url = process.env.NEXT_PUBLIC_VIDEO_MALAYSIAN_URL || '/videos/CropDrive Intro Malaysian.mp4';
      // Ensure URL is absolute if it's a Firebase Storage URL
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      // Relative path - will work for public files
      return url;
    }
    const url = process.env.NEXT_PUBLIC_VIDEO_ENGLISH_URL || '/videos/Cropdrive Intro English.mp4';
    // Ensure URL is absolute if it's a Firebase Storage URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Relative path - will work for public files
    return url;
  };

  // Handle video loading and errors
  // Note: Video source is set via the <source> tag in JSX
  useEffect(() => {
    if (!mounted) return;
    
    // Check if video is supported
    if (!isVideoSupported()) {
      console.warn('Video playback is not supported in this browser');
      return;
    }
    
    if (videoRef.current) {
      const video = videoRef.current;
      
      // Force video to load (helps with public access)
      if (video.readyState === 0) {
        try {
          video.load();
        } catch (error) {
          console.warn('Failed to load video:', error);
        }
      }
      
      // Handle video loading errors (for debugging)
      const handleError = (e: Event) => {
        console.error('Video loading error:', e);
        const videoError = videoRef.current?.error;
        if (videoError) {
          console.error('Video error code:', videoError.code);
          console.error('Video error message:', videoError.message);
          console.error('Video source:', videoRef.current?.src || videoRef.current?.currentSrc);
          console.error('Video network state:', videoRef.current?.networkState);
          // Error code 4 = MEDIA_ERR_SRC_NOT_SUPPORTED
          // Error code 3 = MEDIA_ERR_DECODE
          // Error code 2 = MEDIA_ERR_NETWORK
          // Error code 1 = MEDIA_ERR_ABORTED
        }
      };
      
      const handleLoadedData = () => {
        console.log('Video loaded successfully:', videoRef.current?.src || videoRef.current?.currentSrc);
      };
      
      const handleCanPlay = () => {
        console.log('Video can play:', videoRef.current?.src || videoRef.current?.currentSrc);
      };
      
      video.addEventListener('error', handleError);
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('canplay', handleCanPlay);
      
      return () => {
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [currentLanguage, mounted]);

  if (!mounted) {
    return null;
  }

  const steps = [
    {
      number: '1',
      title: copy('Upload Your Test Results', 'Muat Naik Keputusan Ujian Anda'),
      desc: copy('Start by uploading your soil and leaf analysis results directly to the platform. Accepted formats include most standard laboratory reports. Farmers can upload files through their CropDrive account, while organizations and laboratories can integrate bulk uploads.', 'Mulakan dengan memuat naik hasil analisis tanah dan daun anda terus ke platform. Format yang diterima termasuk kebanyakan laporan makmal standard. Petani boleh memuat naik fail melalui akaun CropDrive mereka, manakala organisasi dan makmal boleh mengintegrasikan muat naik pukal.'),
      icon: '📤',
      image: '/images/how-it-works/1. Upload Your Report (Image 01)_optimized.jpg'
    },
    {
      number: '2',
      title: copy('AI Analysis', 'Analisis AI'),
      desc: copy("CropDrive's AI Agronomist interprets the test data using agronomic models developed from international research and validated in tropical field conditions. The system identifies nutrient gaps, soil health issues, and imbalances, then designs tailored fertilization and improvement strategies.", 'AI Agronomis CropDrive mentafsir data ujian menggunakan model agronomi yang dibangunkan dari penyelidikan antarabangsa dan disahkan dalam keadaan lapangan tropika. Sistem mengenal pasti jurang nutrien, isu kesihatan tanah, dan ketidakseimbangan, kemudian mereka bentuk strategi persenyawaan dan penambahbaikan yang disesuaikan.'),
      icon: '🤖',
      image: '/images/how-it-works/2. AI Analyzes Data (Image 02)_optimized.jpg'
    },
    {
      number: '3',
      title: copy('Receive Your Report', 'Terima Laporan Anda'),
      desc: copy('Within minutes, users receive a field-specific advisory report that includes: Fertilizer recommendations with rates and timing, Soil health improvement strategy, Nutrient balance and ROI estimates, Expected impact on productivity.', 'Dalam beberapa minit, pengguna menerima laporan nasihat khusus lapangan yang merangkumi: Cadangan baja dengan kadar dan masa, Strategi penambahbaikan kesihatan tanah, Anggaran keseimbangan nutrien dan ROI, Kesan yang dijangka terhadap produktiviti.'),
      icon: '📋',
      image: '/images/how-it-works/3. Receive Recommendations (Image 03)_optimized.jpg'
    },
    {
      number: '4',
      title: copy('Apply Recommendations', 'Laksanakan Cadangan'),
      desc: copy('Farmers and estates use the report to adjust input use and improve yield performance. For organizations, CropDrive provides aggregated analytics and optional integration into monitoring systems for project or supply chain management.', 'Petani dan estet menggunakan laporan untuk menyesuaikan penggunaan input dan meningkatkan prestasi hasil. Untuk organisasi, CropDrive menyediakan analitik agregat dan integrasi pilihan ke dalam sistem pemantauan untuk pengurusan projek atau rantaian bekalan.'),
      icon: '🌱',
      image: '/images/how-it-works/4. Implement & Track (Image 04)_optimized.jpg'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-32 overflow-hidden">
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
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight font-heading">
              {copy('How It', 'Cara Ia')} <span className="text-yellow-400">{copy('Works', 'Berfungsi')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {copy('CropDrive™ turns agricultural laboratory test results into clear agronomic decisions. The process is simple, fast, and backed by science.', 'CropDrive™ menukar keputusan ujian makmal pertanian kepada keputusan agronomi yang jelas. Prosesnya mudah, cepat, dan disokong oleh sains.')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            {...(isIntersectionObserverSupported() 
              ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
              : { animate: { opacity: 1, y: 0 } }
            )}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 font-heading">
              {language === 'ms' ? 'Lihat Demo' : 'Watch'} <span className="text-yellow-400">{language === 'ms' ? 'Langsung' : 'Demo'}</span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              {language === 'ms'
                ? 'Tonton bagaimana CropDrive™ Oil Palm AI Advisor menganalisis laporan makmal anda dalam masa 5-8 minit'
                : 'Watch how CropDrive™ Oil Palm AI Advisor analyzes your lab reports in 5-8 minutes'
              }
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            {...(isIntersectionObserverSupported() 
              ? { whileInView: { opacity: 1, scale: 1 }, viewport: { once: true } }
              : { animate: { opacity: 1, scale: 1 } }
            )}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
              {/* Demo Video Player - Publicly accessible to all users (no authentication required) */}
              <div className="aspect-video relative">
                {isVideoSupported() ? (
                  <video
                    key={`video-${currentLanguage}`}
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                    preload="auto"
                    controlsList="nodownload"
                  >
                    <source 
                      key={`source-${currentLanguage}-${getVideoUrl(currentLanguage)}`}
                      src={getVideoUrl(currentLanguage)} 
                      type="video/mp4" 
                    />
                    {language === 'ms' 
                      ? 'Pelayar anda tidak menyokong tag video.'
                      : 'Your browser does not support the video tag.'
                    }
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white p-8 text-center">
                    <div>
                      <p className="text-xl mb-4">
                        {language === 'ms' 
                          ? 'Pelayar anda tidak menyokong pemutaran video.'
                          : 'Your browser does not support video playback.'
                        }
                      </p>
                      <p className="text-sm opacity-75">
                        {language === 'ms'
                          ? 'Sila gunakan pelayar moden seperti Chrome, Firefox, Safari, atau Edge.'
                          : 'Please use a modern browser like Chrome, Firefox, Safari, or Edge.'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Demo Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                {...(isIntersectionObserverSupported() 
                  ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
                  : { animate: { opacity: 1, y: 0 } }
                )}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20"
              >
                <div className="text-4xl mb-3">📤</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {language === 'ms' ? 'Muat Naik Mudah' : 'Easy Upload'}
                </h3>
                <p className="text-white/80">
                  {language === 'ms'
                    ? 'Muat naik Gambar, PDF, atau Excel (SPLAB, farm_data)'
                    : 'Upload Images, PDF, or Excel (SPLAB, farm_data)'
                  }
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                {...(isIntersectionObserverSupported() 
                  ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
                  : { animate: { opacity: 1, y: 0 } }
                )}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20"
              >
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {language === 'ms' ? 'Analisis Pantas' : 'Fast Analysis'}
                </h3>
                <p className="text-white/80">
                  {language === 'ms'
                    ? 'Dapatkan hasil analisis dalam masa 5-8 minit'
                    : 'Get analysis results in 5-8 minutes'
                  }
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                {...(isIntersectionObserverSupported() 
                  ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
                  : { animate: { opacity: 1, y: 0 } }
                )}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20"
              >
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {language === 'id' ? 'Rekomendasi Berbasis ISPO & GAP' : language === 'ms' ? 'Cadangan Berpandukan MPOB & GAP' : 'MPOB & GAP-Based Recommendations'}
                </h3>
                <p className="text-white/80">
                  {language === 'id'
                    ? 'Rekomendasi disusun berdasarkan standar Indonesian Sustainable Palm Oil (ISPO) dan Good Agricultural Practices (GAP) global terbaru'
                    : language === 'ms'
                    ? 'Cadangan berpandukan garis panduan MPOB dan Amalan Pertanian Baik (GAP) global terkini'
                    : 'Recommendations are based on MPOB guidelines and the latest global Good Agricultural Practices (GAP)'
                  }
                </p>
              </motion.div>
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              {...(isIntersectionObserverSupported() 
                ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
                : { animate: { opacity: 1, y: 0 } }
              )}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center mt-12"
            >
              <Link href="/assistant">
                <button className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 font-black rounded-full hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50 transform hover:scale-105 uppercase tracking-wide">
                  {language === 'ms' ? '🚀 Cuba Sekarang' : '🚀 Try Now'}
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              {...(isIntersectionObserverSupported() 
                ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
                : { animate: { opacity: 1, y: 0 } }
              )}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`mb-24 last:mb-0 ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}
            >
              <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}>
                {/* Image */}
                <div className="w-full md:w-1/2">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src={step.image}
                      alt={step.title}
                      width={800}
                      height={600}
                      className="w-full h-96 object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2">
                  <div className="bg-yellow-400 text-green-900 text-6xl font-black rounded-full w-24 h-24 flex items-center justify-center mb-6 shadow-xl">
                    {step.number}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-heading">
                    {step.title}
                  </h2>
                  <p className="text-xl text-gray-700 leading-relaxed mb-8">
                    {step.desc}
                  </p>
                  {index === steps.length - 1 && (
                    <Link href="/register">
                      <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                        {language === 'ms' ? 'Mulakan Sekarang' : 'Get Started Now'}
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-900 via-green-800 to-green-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            {...(isIntersectionObserverSupported() 
              ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
              : { animate: { opacity: 1, y: 0 } }
            )}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 font-heading">
              {language === 'ms' ? 'Sedia untuk Transformasi?' : 'Ready to Transform?'}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {language === 'ms'
                ? 'Sertai ribuan petani yang sudah menggunakan AI untuk hasil yang lebih baik'
                : 'Join thousands of farmers already using AI for better yields'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 font-black rounded-full hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50 transform hover:scale-105 uppercase tracking-wide">
                  {language === 'ms' ? 'Daftar Sekarang' : 'Register Now'}
                </button>
              </Link>
              <Link href="/pricing">
                <button className="px-10 py-5 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all duration-300 uppercase tracking-wide">
                  {language === 'ms' ? 'Lihat Harga' : 'View Pricing'}
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

