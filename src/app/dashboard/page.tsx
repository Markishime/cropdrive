'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/i18n';
import { getPlanById } from '@/lib/subscriptions';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Award,
  Target,
  Activity,
  Calendar,
  ChevronRight,
  ExternalLink,
  Eye,
  EyeOff,
  BarChart2,
  PieChart,
  LineChart,
  Zap
} from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');

  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const lang = (localStorage.getItem('cropdrive-language') || 'en') as 'en' | 'ms';
    setCurrentLang(lang);
  }, []);

  // Silently refresh user data when returning from purchase
  useEffect(() => {
    if (typeof window !== 'undefined' && mounted && refreshUser) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('refresh') === 'true') {
        console.log('🔄 Silently refreshing user data after purchase...');
        
        // Silently poll for updates without showing notification
        let pollCount = 0;
        const maxPolls = 15; // 15 attempts over 45 seconds
        const pollInterval = 3000; // 3 seconds
        
        const silentPoll = async () => {
          try {
            await refreshUser();
            pollCount++;
            console.log(`✅ Silent refresh attempt ${pollCount}/${maxPolls}`);
            
            if (pollCount < maxPolls) {
              setTimeout(silentPoll, pollInterval);
            } else {
              console.log('✅ Silent polling complete');
            }
          } catch (error) {
            console.error('Error during silent refresh:', error);
            if (pollCount < maxPolls) {
              setTimeout(silentPoll, pollInterval);
            }
          }
        };
        
        // Start immediately and clean URL
        silentPoll();
        window.history.replaceState({}, '', '/dashboard');
      }
    }
  }, [mounted, refreshUser]);

  const { language } = useTranslation(mounted ? currentLang : 'en');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      setLoading(false);
    }
  }, [user, authLoading, router]);

  // Listen for language changes
  useEffect(() => {
    const handleStorageChange = () => {
      const lang = (localStorage.getItem('cropdrive-language') || 'en') as 'en' | 'ms';
      setCurrentLang(lang);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for analysis report saved events to refresh user data
  useEffect(() => {
    if (!mounted || !refreshUser || !user?.uid) return;
    
    const handleReportSaved = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const eventUserId = customEvent.detail?.userId;
      const currentUserId = user.uid;

      console.log('📢 Dashboard: Received analysisReportSaved event', {
        eventUserId,
        currentUserId,
        reportId: customEvent.detail?.reportId,
        uploadsUsed: customEvent.detail?.uploadsUsed,
        uploadsLimit: customEvent.detail?.uploadsLimit
      });

      // Only refresh if the event is for the current user
      if (!eventUserId || eventUserId === currentUserId) {
        console.log('✅ Dashboard: Refreshing user data from Firestore for user:', currentUserId);
        console.log('📊 Current user data before refresh:', {
          uploadsUsed: user.uploadsUsed,
          uploadsLimit: user.uploadsLimit
        });
        await refreshUser();
        console.log('✅ Dashboard: User data refreshed from Firestore');
        console.log('📊 Updated user data:', {
          uploadsUsed: user.uploadsUsed,
          uploadsLimit: user.uploadsLimit
        });
      } else {
        console.log('⚠️ Dashboard: Ignoring event - user ID mismatch');
      }
    };
    
    window.addEventListener('analysisReportSaved', handleReportSaved);
    return () => {
      window.removeEventListener('analysisReportSaved', handleReportSaved);
    };
  }, [mounted, refreshUser, user?.uid]);

  // Handler functions - Notifications moved to AuthenticatedNavbar

  if (authLoading || loading || !user) {
    return null;
  }

  const userPlan = (user.plan && user.plan !== 'none') ? getPlanById(user.plan) : null;
  const hasPurchasedPlan = user.plan && user.plan !== 'none';
  // Ensure uploadsUsed and uploadsLimit are numbers (handle undefined/null)
  const uploadsUsed = user.uploadsUsed ?? 0;
  const uploadsLimit = user.uploadsLimit ?? 0;
  const uploadsRemaining = uploadsLimit === -1 ? Infinity : Math.max(0, uploadsLimit - uploadsUsed);
  const uploadPercentage = uploadsLimit === -1 ? 100 : uploadsLimit > 0 ? (uploadsUsed / uploadsLimit) * 100 : 0;
  const isUploadLimitExceeded = uploadsLimit !== -1 && uploadsUsed >= uploadsLimit;

  // Debug logging for uploads data
  console.log('📊 Dashboard uploads data:', {
    uploadsUsed,
    uploadsLimit,
    uploadsRemaining,
    uploadPercentage,
    isUploadLimitExceeded,
    userPlan: user.plan,
    hasPurchasedPlan
  });
  const daysActive = Math.floor((Date.now() - new Date(user.registrationDate).getTime()) / (1000 * 60 * 60 * 24));
  
  // Real-time activity based on user data
  const recentActivity = hasPurchasedPlan ? [
    {
      id: 1,
      type: 'analysis',
      title: language === 'ms' ? 'Analisis Laporan Daun' : 'Leaf Report Analysis',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: 2,
      type: 'upload',
      title: language === 'ms' ? 'Muat Naik Laporan Tanah' : 'Soil Report Upload',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    }
  ] : [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        {/* Hero Header */}
        <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-12 sm:py-16 lg:py-20 relative overflow-hidden">
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
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
                {/* Welcome Section */}
                <div className="flex-1">
                  <motion.span
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-block text-yellow-400 text-sm font-bold tracking-widest uppercase mb-4 bg-white/10 px-4 py-2 rounded-full border border-yellow-400/30"
                  >
                    {language === 'ms' ? 'Papan Pemuka' : 'Dashboard'}
                  </motion.span>
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight"
                  >
                    {language === 'ms' ? 'Selamat kembali' : 'Welcome back'},<br />
                    <span className="text-yellow-400">
                      {user.displayName}!
                    </span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg sm:text-xl text-white/90 max-w-2xl flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    {language === 'ms' ? 'Papan pemuka analisis ladang AI anda' : 'Your AI farm analysis dashboard'}
                  </motion.p>
                </div>

                {/* Quick Action Buttons - Removed download button, notifications moved to navbar */}
                <div className="flex gap-3 relative">
                  {/* Notifications moved to AuthenticatedNavbar */}
                </div>
              </div>

              {/* Current Plan Card - Only show if user has purchased a plan */}
              {hasPurchasedPlan && userPlan && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-2xl p-6 border-2 border-white/20 shadow-2xl"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-white/70 font-semibold uppercase">
                          {language === 'ms' ? 'Pelan Semasa' : 'Current Plan'}
                        </p>
                        <p className="text-2xl font-black text-white">
                          {language === 'ms' ? userPlan.nameMs : userPlan.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-3xl font-black text-yellow-400">
                          RM{userPlan.monthlyPrice}
                        </p>
                        <p className="text-xs text-white/70">
                          {language === 'ms' ? '/bulan' : '/month'}
                        </p>
                      </div>
                      <Link href="/pricing">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-yellow-400 hover:bg-yellow-500 text-green-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition"
                        >
                          {language === 'ms' ? 'Naik Taraf' : 'Upgrade'}
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
        {/* Notifications moved to AuthenticatedNavbar */}

        {/* Current Plan Details - Show plan features */}
        {hasPurchasedPlan && userPlan && (
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border-2 border-green-200 overflow-hidden"
              >
                {/* Plan Header */}
                <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 p-8 text-white">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="inline-block bg-yellow-400 text-green-900 px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider mb-4">
                        {language === 'ms' ? '✓ Pelan Aktif' : '✓ Active Plan'}
                      </div>
                      <h2 className="text-4xl font-black mb-2">
                        {language === 'ms' ? userPlan.nameMs : userPlan.name}
                      </h2>
                      <p className="text-green-100 text-lg">
                        {language === 'ms' 
                          ? 'Terima kasih kerana mempercayai CropDrive untuk meningkatkan hasil ladang anda!'
                          : 'Thank you for trusting CropDrive to improve your farm yields!'
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-black text-yellow-400">
                        RM{userPlan.monthlyPrice}
                      </div>
                      <div className="text-green-100 text-sm">
                        {language === 'ms' ? '/bulan' : '/month'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plan Features */}
                <div className="p-8">
                  <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {language === 'ms' ? 'Ciri-ciri Pelan Anda' : 'Your Plan Features'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userPlan.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className={`flex items-start gap-3 p-4 rounded-xl ${
                          feature.included 
                            ? 'bg-green-50 border-2 border-green-200' 
                            : 'bg-gray-50 border-2 border-gray-200 opacity-50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          feature.included ? 'bg-green-600' : 'bg-gray-400'
                        }`}>
                          {feature.included ? (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${
                            feature.included ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {language === 'ms' ? feature.nameMs : feature.name}
                          </p>
                          {feature.limit && feature.included && (
                            <p className="text-sm text-green-700 font-medium mt-1">
                              {language === 'ms' ? `Had: ${feature.limit}` : `Limit: ${feature.limit}`}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Button 
                        onClick={() => router.push('/assistant')}
                        className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-lg"
                      >
                        {language === 'ms' ? '🤖 Mulakan Analisis AI' : '🤖 Start AI Analysis'}
                      </Button>
                    </div>
                    <div className="flex-1">
                      <Button 
                        onClick={() => router.push('/pricing')}
                        variant="outline" 
                        className="w-full py-4 border-2 border-green-600 text-green-700 hover:bg-green-50 font-bold"
                      >
                        {language === 'ms' ? '⬆️ Naik Taraf Pelan' : '⬆️ Upgrade Plan'}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* No Plan Message */}
        {!hasPurchasedPlan && (
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl p-8 border-4 border-yellow-400 shadow-xl flex flex-col items-center justify-center text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-4">
                  {language === 'ms' ? '🔒 Tiada Pelan Aktif' : '🔒 No Active Plan'}
                </h3>
                <p className="text-gray-700 text-lg mb-6 max-w-md font-medium">
                  {language === 'ms'
                    ? 'Beli pelan untuk mula menggunakan CropDrive™ Oil Palm AI Advisor dan menganalisis laporan makmal anda.'
                    : 'Purchase a plan to start using the CropDrive™ Oil Palm AI Advisor and analyze your lab reports.'
                  }
                </p>
                <Link href="/pricing" className="w-full max-w-md">
                  <Button className="w-full py-5 text-xl font-black bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-2xl transform hover:scale-105 transition-all">
                    {language === 'ms' ? '🛒 Beli Pelan Sekarang' : '🛒 Buy a Plan Now'}
                  </Button>
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* CropDrive AI Advisor - Centered */}
        {hasPurchasedPlan && (
          <section className="py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.01 }}
                className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 border border-green-500 shadow-xl text-white"
              >
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                      {language === 'ms' ? 'CropDrive™ Oil Palm AI Advisor' : 'CropDrive™ Oil Palm AI Advisor'}
                      <span className="text-yellow-400">⚡</span>
                    </h3>
                    <p className="text-white/90 text-sm">
                      {language === 'ms'
                        ? 'Muat naik laporan makmal (Gambar/PDF/Excel - SPLAB, farm_test_data) dan dapatkan analisis AI dalam 5-8 minit.'
                        : 'Upload lab reports (Image/PDF/Excel - SPLAB, farm_test_data) and get AI analysis in 5-8 minutes.'
                      }
                    </p>
                  </div>
                </div>

                {/* Upload Progress */}
                <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">
                      {language === 'ms' ? 'Penggunaan Muat Naik' : 'Upload Usage'}
                    </span>
                    <span className="text-sm font-bold">
                      {uploadsUsed} / {uploadsLimit === -1 ? '∞' : uploadsLimit}
                    </span>
                  </div>
                  {uploadsLimit !== -1 && (
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          uploadPercentage >= 80 
                            ? 'bg-gradient-to-r from-orange-400 to-red-500' 
                            : 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                        }`}
                        style={{ width: `${Math.min(uploadPercentage, 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {!isUploadLimitExceeded ? (
                  <Button 
                    onClick={() => router.push('/assistant')}
                    className="w-full py-4 bg-green-350 text-green-700 hover:bg-gray-50 font-bold shadow-lg"
                  >
                    {language === 'ms' ? '🤖 Mulakan Analisis Sekarang' : '🤖 Start Analysis Now'}
                  </Button>
                ) : (
                  <div>
                    <p className="text-yellow-300 text-sm mb-4 font-semibold bg-yellow-500/20 p-3 rounded-lg">
                      {language === 'ms' ? '⚠️ Had muat naik tercapai' : '⚠️ Upload limit reached'}
                    </p>
                    <Button 
                      onClick={() => router.push('/payment-method')}
                      className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 hover:from-yellow-500 hover:to-yellow-600 font-bold shadow-lg"
                    >
                      {language === 'ms' ? '⬆️ Naik Taraf Pelan' : '⬆️ Upgrade Plan'}
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>
          </section>
        )}

      </div>
    </ProtectedRoute>
  );
}
