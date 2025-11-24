'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import { auth } from '@/lib/firebase';
import { 
  MessageSquare, 
  RefreshCw,
  Maximize2,
  Info,
  Zap,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AssistantPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { language } = useTranslation(mounted ? currentLang : 'en');

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLang(lang);
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleStorageChange = () => {
      const lang = getCurrentLanguage();
      setCurrentLang(lang);
      // Reload iframe with new language
      setIframeKey(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom language change events
    window.addEventListener('languageChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('languageChanged', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    // For testing: Allow access without payment
    // Remove this condition once you want to enforce payment
    // else if (user && (user.plan === 'none' || !user.plan)) {
    //   router.push('/pricing');
    // }
  }, [user, authLoading, router]);

  // Build iframe URL with parameters
  const buildIframeUrl = () => {
    const baseUrl = 'https://ags-ai-assistant.streamlit.app/?embedded=true';
    const params = new URLSearchParams();
    
    // Add language parameter
    params.append('lang', currentLang);
    
    // Add user ID (for tracking)
    if (user?.uid) {
      params.append('userId', user.uid);
    }
    
    // Add plan information
    const userPlan = user?.plan || 'none';
    params.append('plan', userPlan);
    
    // Add plan limits
    const planLimits = {
      start: { uploadLimit: 10, features: ['basic'] },
      smart: { uploadLimit: 50, features: ['basic', 'priority'] },
      precision: { uploadLimit: -1, features: ['basic', 'priority', 'premium', 'comparative', 'early_access'] },
    };
    
    const limits = planLimits[userPlan as keyof typeof planLimits] || planLimits.start;
    params.append('uploadLimit', limits.uploadLimit.toString());
    params.append('features', limits.features.join(','));
    
    return `${baseUrl}&${params.toString()}`;
  };

  const AGS_AI_URL = buildIframeUrl();

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== 'https://ags-ai-assistant.streamlit.app') {
        return;
      }

      try {
        const data = event.data;
        
        // Handle analysis completion
        if (data.type === 'ANALYSIS_COMPLETE' && user?.uid) {
          console.log('📊 Analysis completed:', data);
          
          // Get Firebase auth token
          const firebaseUser = auth.currentUser;
          if (!firebaseUser) {
            toast.error(language === 'ms' ? 'Sesi tamat. Sila log masuk semula.' : 'Session expired. Please login again.');
            return;
          }

          const token = await firebaseUser.getIdToken();

          // Try API first, fallback to direct Firestore save
          try {
            const response = await fetch('/api/save-analysis-report', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                userId: user.uid,
                title: data.title || `Analysis Report - ${new Date().toLocaleDateString()}`,
                type: data.analysisType || 'soil', // 'soil' or 'leaf'
                summary: data.summary || '',
                recommendations: data.recommendationsCount || 0,
                fileUrl: data.fileUrl || null,
                analysisData: data.analysisData || null,
              }),
            });

            if (response.ok) {
              const result = await response.json();
              toast.success(
                language === 'ms' 
                  ? '✅ Laporan analisis telah disimpan!' 
                  : '✅ Analysis report saved!',
                {
                  duration: 4000,
                  icon: '📊',
                }
              );
              console.log('Report saved:', result.reportId);
            } else {
              throw new Error('API save failed');
            }
          } catch (apiError) {
            // Fallback: Save directly to Firestore (security rules will validate)
            console.log('API save failed, trying direct Firestore save...');
            try {
              const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
              const { db } = await import('@/lib/firebase');
              
              const reportData = {
                userId: user.uid,
                title: data.title || `Analysis Report - ${new Date().toLocaleDateString()}`,
                type: data.analysisType || 'soil',
                summary: data.summary || '',
                recommendations: data.recommendationsCount || 0,
                status: 'completed' as const,
                date: new Date().toISOString().split('T')[0],
                fileUrl: data.fileUrl || null,
                analysisData: data.analysisData || null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              };

              const docRef = await addDoc(collection(db, 'analysis_results'), reportData);
              toast.success(
                language === 'ms' 
                  ? '✅ Laporan analisis telah disimpan!' 
                  : '✅ Analysis report saved!',
                {
                  duration: 4000,
                  icon: '📊',
                }
              );
              console.log('Report saved directly:', docRef.id);
            } catch (firestoreError) {
              console.error('Error saving report:', firestoreError);
              toast.error(
                language === 'ms' 
                  ? 'Ralat menyimpan laporan' 
                  : 'Error saving report'
              );
            }
          }
        }

        // Handle language change request from iframe
        if (data.type === 'LANGUAGE_CHANGE_REQUEST') {
          const newLang = data.language;
          if (newLang === 'en' || newLang === 'ms') {
            localStorage.setItem('cropdrive-language', newLang);
            setCurrentLang(newLang);
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('languageChanged'));
            // Reload iframe
            setIframeKey(prev => prev + 1);
          }
        }

        // Handle feature restriction notifications
        if (data.type === 'FEATURE_RESTRICTED') {
          const message = language === 'ms'
            ? `Ciri ini hanya tersedia untuk pelan ${data.requiredPlan || 'lebih tinggi'}. Sila naik taraf pelan anda.`
            : `This feature is only available for ${data.requiredPlan || 'higher'} plan. Please upgrade your plan.`;
          
          toast.error(message, {
            duration: 5000,
            icon: '🔒',
          });
          
          // Show a follow-up toast with action after a short delay
          setTimeout(() => {
            toast(
              (t) => (
                <div className="flex items-center gap-3">
                  <span>{language === 'ms' ? 'Lihat pelan tersedia' : 'View available plans'}</span>
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      router.push('/pricing');
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    {language === 'ms' ? 'Lihat Pelan' : 'View Plans'}
                  </button>
                </div>
              ),
              {
                duration: 6000,
                icon: '💡',
              }
            );
          }, 500);
        }
      } catch (error) {
        console.error('Error handling iframe message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [user, language, router]);

  // Send initial configuration to iframe when it loads
  const handleIframeLoad = () => {
    setIsLoading(false);
    
    // Send configuration to iframe
    if (iframeRef.current?.contentWindow && user) {
      const config = {
        type: 'CONFIG',
        language: currentLang,
        userId: user.uid,
        plan: user.plan || 'none',
        userEmail: user.email,
      };
      
      iframeRef.current.contentWindow.postMessage(config, 'https://ags-ai-assistant.streamlit.app');
    }
  };

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

  // For testing: Only check if user is authenticated, not if they have a plan
  if (authLoading || !user) {
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
                  {language === 'ms' ? 'CropDrive™ Oil Palm AI Advisor' : 'CropDrive™ Oil Palm AI Advisor'}
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
                  ? '💡 Panduan Pantas: Muat naik laporan makmal (Gambar/PDF/Excel - SPLAB, farm_test_data) → Tunggu 10-15 minit → Dapatkan analisis terperinci!'
                  : '💡 Quick Guide: Upload lab report (Image/PDF/Excel - SPLAB, farm_test_data) → Wait 10-15 minutes → Get detailed analysis!'
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
          ref={iframeRef}
          key={iframeKey}
          id="ags-iframe"
          src={AGS_AI_URL}
          className="w-full h-full border-0"
          title="CropDrive™ Oil Palm AI Advisor"
          onLoad={handleIframeLoad}
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

    </div>
  );
}
