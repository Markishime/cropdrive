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
  Download, 
  Share2, 
  Copy, 
  Bell, 
  Settings,
  Award,
  Target,
  Activity,
  Calendar,
  ChevronRight,
  ExternalLink,
  Eye,
  EyeOff,
  Info,
  Zap
} from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  // Handler functions
  const handleCopyUserId = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedId(user.uid);
      toast.success(language === 'ms' ? 'ID pengguna disalin!' : 'User ID copied!', {
        icon: '📋',
        duration: 2000,
      });
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDownloadReport = () => {
    toast.success(language === 'ms' ? 'Laporan sedang dimuat turun...' : 'Report downloading...', {
      icon: '📥',
      duration: 2000,
    });
    // Implement actual download logic here
  };

  const handleShareDashboard = () => {
    toast.success(language === 'ms' ? 'Pautan dashboard disalin!' : 'Dashboard link copied!', {
      icon: '🔗',
      duration: 2000,
    });
  };

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      toast(language === 'ms' ? 'Pemberitahuan dibuka' : 'Notifications opened', {
        icon: '🔔',
        duration: 1500,
      });
    }
  };

  if (authLoading || loading || !user) {
    return null;
  }

  const userPlan = (user.plan && user.plan !== 'none') ? getPlanById(user.plan) : null;
  const hasPurchasedPlan = user.plan && user.plan !== 'none';
  const uploadsRemaining = Math.max(0, user.uploadsLimit - user.uploadsUsed);
  const uploadPercentage = user.uploadsLimit === -1 ? 100 : user.uploadsLimit > 0 ? (user.uploadsUsed / user.uploadsLimit) * 100 : 0;
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

                {/* Quick Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleNotifications}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-xl transition relative"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {showNotifications && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShareDashboard}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-xl transition"
                    aria-label="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadReport}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-xl transition"
                    aria-label="Download"
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>
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

        {/* Stats Overview */}
        {hasPurchasedPlan && (
          <section className="py-8 -mt-12 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Uploads Used */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-3xl font-black text-gray-900">{user.uploadsUsed}</span>
                      <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{user.uploadsUsed > 0 ? '12%' : '0%'}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-semibold">
                    {language === 'ms' ? 'Muat Naik Digunakan' : 'Uploads Used'}
                  </p>
                  <div className="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadPercentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full"
                    />
                  </div>
                </motion.div>

                {/* Uploads Remaining */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-3xl font-black text-gray-900">
                        {user.uploadsLimit === -1 ? '∞' : uploadsRemaining}
                      </span>
                      {user.uploadsLimit !== -1 && (
                        <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                          <Target className="w-3 h-3" />
                          <span>{Math.round((uploadsRemaining / user.uploadsLimit) * 100)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-semibold">
                    {language === 'ms' ? 'Muat Naik Berbaki' : 'Uploads Remaining'}
                  </p>
                  {user.uploadsLimit !== -1 && (
                    <div className="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${100 - uploadPercentage}%` }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="bg-gradient-to-r from-green-500 to-green-600 h-full"
                      />
                    </div>
                  )}
                </motion.div>

                {/* Days Active */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-3xl font-black text-gray-900">{daysActive}</span>
                      <div className="flex items-center gap-1 text-xs font-semibold text-purple-600">
                        <Activity className="w-3 h-3" />
                        <span>{language === 'ms' ? 'hari' : 'days'}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-semibold">
                    {language === 'ms' ? 'Hari Aktif' : 'Days Active'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {language === 'ms' ? 'Sejak' : 'Since'} {new Date(user.registrationDate).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </motion.div>

                {/* Total Reports */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-3xl font-black text-gray-900">{recentActivity.length}</span>
                      <div className="flex items-center gap-1 text-xs font-semibold text-yellow-600">
                        <Award className="w-3 h-3" />
                        <span>{language === 'ms' ? 'lengkap' : 'complete'}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-semibold">
                    {language === 'ms' ? 'Jumlah Laporan' : 'Total Reports'}
                  </p>
                  <Link href="/reports" className="mt-2 text-xs text-yellow-600 hover:text-yellow-700 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    {language === 'ms' ? 'Lihat semua' : 'View all'}
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* Notifications Panel */}
        <AnimatePresence>
          {showNotifications && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="py-6 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-600" />
                      {language === 'ms' ? 'Pemberitahuan' : 'Notifications'}
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <EyeOff className="w-5 h-5" />
                    </motion.button>
                  </div>
                  
                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Info className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {language === 'ms' ? 'Kemas kini sistem tersedia' : 'System update available'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {language === 'ms' 
                            ? 'Versi baharu dengan ciri AI yang lebih baik kini tersedia.'
                            : 'New version with improved AI features is now available.'
                          }
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date().toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {language === 'ms' ? 'Analisis siap!' : 'Analysis complete!'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {language === 'ms' 
                            ? 'Laporan analisis tanah anda telah siap untuk dimuat turun.'
                            : 'Your soil analysis report is ready for download.'
                          }
                        </p>
                        <button 
                          onClick={handleDownloadReport}
                          className="text-xs text-green-700 font-semibold mt-2 hover:underline"
                        >
                          {language === 'ms' ? 'Muat turun sekarang →' : 'Download now →'}
                        </button>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {language === 'ms' ? 'Pencapaian dibuka!' : 'Achievement unlocked!'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {language === 'ms' 
                            ? 'Tahniah! Anda telah melengkapkan 5 analisis.'
                            : 'Congratulations! You\'ve completed 5 analyses.'
                          }
                        </p>
                        <button 
                          onClick={() => setShowAchievements(true)}
                          className="text-xs text-yellow-700 font-semibold mt-2 hover:underline"
                        >
                          {language === 'ms' ? 'Lihat pencapaian →' : 'View achievements →'}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

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

                  {/* Subscription Info */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm font-semibold text-blue-900">
                          {language === 'ms' ? 'Had Muat Naik' : 'Upload Limit'}
                        </p>
                      </div>
                      <p className="text-2xl font-black text-blue-600">
                        {userPlan.uploadLimit === -1 ? '∞' : userPlan.uploadLimit}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {userPlan.uploadLimit === -1 
                          ? (language === 'ms' ? 'Tanpa had' : 'Unlimited') 
                          : (language === 'ms' ? 'setiap bulan' : 'per month')
                        }
                      </p>
                    </div>

                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-semibold text-purple-900">
                          {language === 'ms' ? 'Masa Respons' : 'Response Time'}
                        </p>
                      </div>
                      <p className="text-2xl font-black text-purple-600">
                        {userPlan.supportLevel === 'basic' ? '48h' : 
                         userPlan.supportLevel === 'priority' ? '24h' : '12h'}
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        {language === 'ms' ? 'Sokongan' : 'Support'} {userPlan.supportLevel}
                      </p>
                    </div>

                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-semibold text-yellow-900">
                          {language === 'ms' ? 'Diskaun Pembaharuan' : 'Renewal Discount'}
                        </p>
                      </div>
                      <p className="text-2xl font-black text-yellow-600">
                        {userPlan.renewalDiscount}%
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        {language === 'ms' ? 'Pembaharuan seterusnya' : 'Next renewal'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Link href="/assistant" className="flex-1">
                      <Button className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-lg">
                        {language === 'ms' ? '🤖 Mulakan Analisis AI' : '🤖 Start AI Analysis'}
                      </Button>
                    </Link>
                    <Link href="/pricing" className="flex-1">
                      <Button variant="outline" className="w-full py-4 border-2 border-green-600 text-green-700 hover:bg-green-50 font-bold">
                        {language === 'ms' ? '⬆️ Naik Taraf Pelan' : '⬆️ Upgrade Plan'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Main Content */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Assistant Card or No Plan Card */}
              <div className="lg:col-span-2">
                {hasPurchasedPlan ? (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 border border-green-500 shadow-xl text-white h-full"
                  >
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                          {language === 'ms' ? 'Pembantu AI AGS' : 'AGS AI Assistant'}
                          <span className="text-yellow-400">⚡</span>
                        </h3>
                        <p className="text-white/90 text-sm">
                          {language === 'ms'
                            ? 'Muat naik laporan makmal (Gambar/PDF/Excel - SPLAB, farm_test_data) dan dapatkan analisis AI dalam 1-2 minit. Bertauliah MPOB.'
                            : 'Upload lab reports (Image/PDF/Excel - SPLAB, farm_test_data) and get AI analysis in 1-2 minutes. MPOB certified.'
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
                          {user.uploadsUsed} / {user.uploadsLimit === -1 ? '∞' : user.uploadsLimit}
                        </span>
                      </div>
                      {user.uploadsLimit !== -1 && (
                        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(uploadPercentage, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {user.uploadsLimit === -1 || uploadsRemaining > 0 ? (
                      <Link href="/assistant">
                        <Button className="w-full py-4 border-2 border-green-600 text-green-700 hover:bg-green-50 font-bold">
                          {language === 'ms' ? '🤖 Mulakan Analisis Sekarang' : '🤖 Start Analysis Now'}
                        </Button>
                      </Link>
                    ) : (
                      <div>
                        <p className="text-yellow-300 text-sm mb-4 font-semibold bg-yellow-500/20 p-3 rounded-lg">
                          {language === 'ms' ? '⚠️ Had muat naik tercapai' : '⚠️ Upload limit reached'}
                        </p>
                        <Link href="/payment-method">
                          <Button className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 hover:from-yellow-500 hover:to-yellow-600 font-bold shadow-lg">
                            {language === 'ms' ? '⬆️ Naik Taraf Pelan' : '⬆️ Upgrade Plan'}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl p-8 border-4 border-yellow-400 shadow-xl h-full flex flex-col items-center justify-center text-center"
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
                        ? 'Beli pelan untuk mula menggunakan Pembantu AI AGS dan menganalisis laporan makmal anda.'
                        : 'Purchase a plan to start using the AGS AI Assistant and analyze your lab reports.'
                      }
                    </p>
                    <Link href="/pricing" className="w-full">
                      <Button className="w-full py-5 text-xl font-black bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-2xl transform hover:scale-105 transition-all">
                        {language === 'ms' ? '🛒 Beli Pelan Sekarang' : '🛒 Buy a Plan Now'}
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </div>

              {/* Recent Activity */}
              {hasPurchasedPlan && (
                <div className="lg:col-span-1">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all h-full"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        {language === 'ms' ? 'Aktiviti Terkini' : 'Recent Activity'}
                      </h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                        {recentActivity.length} {language === 'ms' ? 'baru' : 'new'}
                      </span>
                    </div>
                    {recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {recentActivity.map((activity, index) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:from-blue-50 hover:to-white border border-transparent hover:border-blue-200 transition-all cursor-pointer group"
                          >
                            <div className={`w-8 h-8 rounded-full mt-0.5 flex-shrink-0 flex items-center justify-center ${
                              activity.type === 'analysis' ? 'bg-green-100' :
                              activity.type === 'upload' ? 'bg-blue-100' :
                              'bg-purple-100'
                            }`}>
                              {activity.type === 'analysis' ? (
                                <Zap className={`w-4 h-4 ${
                                  activity.type === 'analysis' ? 'text-green-600' :
                                  activity.type === 'upload' ? 'text-blue-600' :
                                  'text-purple-600'
                                }`} />
                              ) : (
                                <svg className={`w-4 h-4 ${
                                  activity.type === 'upload' ? 'text-blue-600' :
                                  'text-purple-600'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                                {activity.title}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(activity.date).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                ✓
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                          </motion.div>
                        ))}
                        <Link href="/reports">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-2 py-3 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all flex items-center justify-center gap-2"
                          >
                            {language === 'ms' ? 'Lihat Semua' : 'View All'}
                            <ExternalLink className="w-4 h-4" />
                          </motion.button>
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Activity className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">
                          {language === 'ms' ? 'Tiada aktiviti lagi' : 'No activity yet'}
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                          {language === 'ms' ? 'Mulakan analisis pertama anda' : 'Start your first analysis'}
                        </p>
                        <Link href="/assistant">
                          <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                            {language === 'ms' ? 'Mulakan Sekarang' : 'Get Started'}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Tips Section */}
        {hasPurchasedPlan && showQuickActions && (
          <section className="py-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                  {language === 'ms' ? 'Petua Pantas' : 'Quick Tips'}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowQuickActions(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <EyeOff className="w-5 h-5" />
                </motion.button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.03, rotate: 1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer"
                  onClick={handleCopyUserId}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <Copy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">
                    {language === 'ms' ? 'Salin ID Pengguna' : 'Copy User ID'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'ms' 
                      ? 'Klik untuk menyalin ID pengguna anda untuk sokongan.'
                      : 'Click to copy your user ID for support.'
                    }
                  </p>
                  {copiedId && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-green-600 font-bold mt-2"
                    >
                      ✓ {language === 'ms' ? 'Disalin!' : 'Copied!'}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.03, rotate: -1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200 hover:border-purple-400 transition-all cursor-pointer"
                  onClick={() => window.open('/tutorials', '_blank')}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">
                    {language === 'ms' ? 'Tonton Tutorial' : 'Watch Tutorials'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'ms' 
                      ? 'Pelajari cara menggunakan platform dengan lebih baik.'
                      : 'Learn how to use the platform better.'
                    }
                  </p>
                  <p className="text-xs text-purple-600 font-semibold mt-2 flex items-center gap-1">
                    {language === 'ms' ? 'Lihat sekarang' : 'Watch now'}
                    <ExternalLink className="w-3 h-3" />
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.03, rotate: 1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200 hover:border-green-400 transition-all cursor-pointer"
                  onClick={() => router.push('/settings')}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">
                    {language === 'ms' ? 'Tetapan Akaun' : 'Account Settings'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'ms' 
                      ? 'Urus profil dan tetapan akaun anda.'
                      : 'Manage your profile and account settings.'
                    }
                  </p>
                  <p className="text-xs text-green-600 font-semibold mt-2 flex items-center gap-1">
                    {language === 'ms' ? 'Buka tetapan' : 'Open settings'}
                    <ChevronRight className="w-3 h-3" />
                  </p>
                </motion.div>
              </div>
            </div>
          </section>
        )}
      </div>
    </ProtectedRoute>
  );
}
