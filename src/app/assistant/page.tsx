'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  ExternalLink, 
  RefreshCw,
  Maximize2,
  Info,
  Zap,
  CheckCircle2,
  Upload
} from 'lucide-react';

export default function AssistantPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const lang = (localStorage.getItem('cropdrive-language') || 'en') as 'en' | 'ms';
    setCurrentLang(lang);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && (user.plan === 'none' || !user.plan)) {
      router.push('/pricing');
    }
  }, [user, authLoading, router]);

  const language = currentLang;
  const AGS_AI_URL = 'https://ags-ai-assistant.streamlit.app/?embedded=true';

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const handleFullscreen = () => {
    const iframe = document.getElementById('ags-iframe');
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      }
    }
  };

  if (authLoading || !user || user.plan === 'none' || !user.plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">
            {language === 'ms' ? 'Memuatkan...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 shadow-lg border-b-4 border-yellow-400"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <MessageSquare className="w-7 h-7 text-green-900" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                  {language === 'ms' ? 'Pembantu AI AGS' : 'AGS AI Assistant'}
                  <Zap className="w-5 h-5 text-yellow-400" />
                </h1>
                <p className="text-sm text-white/80 font-medium">
                  {language === 'ms' 
                    ? 'Analisis Laporan Makmal dengan AI' 
                    : 'Lab Report Analysis with AI'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl transition-all duration-200 border border-white/20 font-semibold"
                title={language === 'ms' ? 'Muat Semula' : 'Refresh'}
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">
                  {language === 'ms' ? 'Muat Semula' : 'Refresh'}
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFullscreen}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl transition-all duration-200 border border-white/20 font-semibold"
                title={language === 'ms' ? 'Skrin Penuh' : 'Fullscreen'}
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">
                  {language === 'ms' ? 'Penuh' : 'Full'}
                </span>
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://ags-ai-assistant.streamlit.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-green-900 rounded-xl transition-all duration-200 font-bold shadow-lg"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">
                  {language === 'ms' ? 'Buka' : 'Open'}
                </span>
              </motion.a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Guide Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 sm:px-6 lg:px-8 shadow-md"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-200 flex-shrink-0" />
              <p className="text-sm font-semibold">
                {language === 'ms' 
                  ? '💡 Panduan Pantas: Muat naik laporan makmal (Gambar/PDF/Excel - SPLAB, farm_test_data) → Tunggu 1-2 minit → Dapatkan analisis terperinci!'
                  : '💡 Quick Guide: Upload lab report (Image/PDF/Excel - SPLAB, farm_test_data) → Wait 1-2 minutes → Get detailed analysis!'
                }
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium bg-white/10 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'ms' ? 'Bertauliah MPOB' : 'MPOB Certified'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Assistant Embedded */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 z-10"
          >
            <div className="text-center space-y-4">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-20 h-20 border-4 border-green-600 border-t-transparent rounded-full mx-auto"
              />
              <div>
                <p className="text-xl font-bold text-gray-800 mb-2">
                  {language === 'ms' ? 'Memuatkan Pembantu AI...' : 'Loading AI Assistant...'}
                </p>
                <p className="text-sm text-gray-600">
                  {language === 'ms' ? 'Sila tunggu sebentar' : 'Please wait a moment'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span>{language === 'ms' ? 'Menyambung ke pelayan AI' : 'Connecting to AI server'}</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <iframe
          key={iframeKey}
          id="ags-iframe"
          src={AGS_AI_URL}
          className="w-full h-full border-0"
          title="AGS AI Assistant"
          onLoad={() => setIsLoading(false)}
          allow="camera; microphone; clipboard-read; clipboard-write; accelerometer; gyroscope"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ 
            width: '100%', 
            height: '100%',
            border: 'none',
            overflow: 'hidden'
          }}
        />
      </div>

      {/* Bottom Tips Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white border-t-2 border-gray-200 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                1
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {language === 'ms' ? 'Muat Naik' : 'Upload'}
                </p>
                <p className="text-gray-600 text-xs">
                  {language === 'ms' ? 'Gambar/PDF/Excel (SPLAB, farm_test_data)' : 'Image/PDF/Excel (SPLAB, farm_test_data)'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                2
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {language === 'ms' ? 'Analisis' : 'Analyze'}
                </p>
                <p className="text-gray-600 text-xs">
                  {language === 'ms' ? 'AI proses ~1-2 minit' : 'AI processes ~1-2 minutes'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                3
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {language === 'ms' ? 'Cadangan' : 'Recommendations'}
                </p>
                <p className="text-gray-600 text-xs">
                  {language === 'ms' ? 'Dapatkan cadangan baja' : 'Get fertilizer advice'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
