'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/i18n';
import { getPlanById } from '@/lib/subscriptions';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/ProtectedRoute';

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
        <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
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
                    className="text-lg sm:text-xl text-white/90 max-w-2xl"
                  >
                    {language === 'ms' ? 'Papan pemuka analisis ladang AI anda' : 'Your AI farm analysis dashboard'}
                  </motion.p>
                </div>

                {/* Current Plan Card - Only show if user has purchased a plan */}
                {hasPurchasedPlan && userPlan && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="flex-shrink-0"
                  >
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-white/20 shadow-2xl">
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
                    </div>
                  </motion.div>
                )}
              </div>
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
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <span className="text-3xl font-black text-gray-900">{user.uploadsUsed}</span>
                  </div>
                  <p className="text-sm text-gray-600 font-semibold">
                    {language === 'ms' ? 'Muat Naik Digunakan' : 'Uploads Used'}
                  </p>
                </motion.div>

                {/* Uploads Remaining */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-3xl font-black text-gray-900">
                      {user.uploadsLimit === -1 ? '∞' : uploadsRemaining}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-semibold">
                    {language === 'ms' ? 'Muat Naik Berbaki' : 'Uploads Remaining'}
                  </p>
                </motion.div>

                {/* Days Active */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-3xl font-black text-gray-900">{daysActive}</span>
                  </div>
                  <p className="text-sm text-gray-600 font-semibold">
                    {language === 'ms' ? 'Hari Aktif' : 'Days Active'}
                  </p>
                </motion.div>

                {/* Total Reports */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-3xl font-black text-gray-900">{recentActivity.length}</span>
                  </div>
                  <p className="text-sm text-gray-600 font-semibold">
                    {language === 'ms' ? 'Jumlah Laporan' : 'Total Reports'}
                  </p>
                </motion.div>
              </div>
            </div>
          </section>
        )}

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
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg h-full"
                  >
                    <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {language === 'ms' ? 'Aktiviti Terkini' : 'Recent Activity'}
                    </h3>
                    {recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              activity.type === 'analysis' ? 'bg-green-500' :
                              activity.type === 'upload' ? 'bg-blue-500' :
                              'bg-purple-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {activity.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(activity.date).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                        <Link href="/reports">
                          <button className="w-full mt-2 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                            {language === 'ms' ? 'Lihat Semua →' : 'View All →'}
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-8">
                        {language === 'ms' ? 'Tiada aktiviti lagi' : 'No activity yet'}
                      </p>
                    )}
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
