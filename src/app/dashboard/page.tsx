'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useTranslation, type Language } from '@/i18n';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWandSparkles } from '@fortawesome/free-solid-svg-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('en');

  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const lang = (localStorage.getItem('cropdrive-language') || 'en') as Language;
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
      const lang = (localStorage.getItem('cropdrive-language') || 'en') as Language;
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
  }, [mounted, refreshUser, user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real-time listener to count reports and sync uploadsUsed
  useEffect(() => {
    if (!mounted || !user?.uid) return;

    console.log('📊 Dashboard: Setting up real-time reports listener to count uploads...');
    
    const reportsRef = collection(db, 'analysis_results');
    
    // Query for both userId and user_id formats, only completed reports
    const q1 = query(reportsRef, where('userId', '==', user.uid), where('status', '==', 'completed'));
    const q2 = query(reportsRef, where('user_id', '==', user.uid), where('status', '==', 'completed'));
    
    const allReports = new Set<string>();
    let lastCount = 0;
    
    const syncUploads = async () => {
      const count = allReports.size;
      if (count !== lastCount) {
        lastCount = count;
        console.log('📊 Dashboard: Total completed reports count:', count);
        
        // If user.uploadsUsed doesn't match, sync it
        if (user.uploadsUsed !== count) {
          console.log(`🔄 Dashboard: uploadsUsed mismatch (${user.uploadsUsed} vs ${count}), syncing...`);
          try {
            const firebaseUser = auth.currentUser;
            if (firebaseUser) {
              const token = await firebaseUser.getIdToken();
              const response = await fetch('/api/sync-uploads', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
              
              if (response.ok) {
                const data = await response.json();
                console.log('✅ Dashboard: Uploads synced successfully:', data);
                // Refresh user data to get updated uploadsUsed
                if (refreshUser) {
                  await refreshUser();
                }
              } else {
                console.warn('⚠️ Dashboard: Failed to sync uploads, refreshing user data instead');
                if (refreshUser) {
                  await refreshUser();
                }
              }
            }
          } catch (error) {
            console.error('❌ Dashboard: Error syncing uploads:', error);
            // Fallback to refresh user data
            if (refreshUser) {
              await refreshUser();
            }
          }
        }
      }
    };
    
    const unsubscribe1 = onSnapshot(q1, (snapshot) => {
      snapshot.forEach((doc) => {
        allReports.add(doc.id);
      });
      syncUploads();
    }, (error) => {
      console.warn('⚠️ Dashboard: Error in userId query:', error);
    });
    
    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      snapshot.forEach((doc) => {
        allReports.add(doc.id);
      });
      syncUploads();
    }, (error) => {
      console.warn('⚠️ Dashboard: Error in user_id query:', error);
    });
    
    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [mounted, user?.uid, user?.uploadsUsed, refreshUser]);

  // Handler functions - Notifications moved to AuthenticatedNavbar

  if (authLoading || loading || !user) {
    return null;
  }

  // Ensure uploadsUsed and uploadsLimit are numbers (handle undefined/null)
  const uploadsUsed = user.uploadsUsed ?? 0;
  const uploadsLimit = user.uploadsLimit ?? 2;
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
    userPlan: user.plan
  });
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
                    {language === 'id' ? 'Dasbor' : language === 'ms' ? 'Papan Pemuka' : 'Dashboard'}
                  </motion.span>
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight"
                  >
                    {language === 'id' ? 'Selamat datang kembali' : language === 'ms' ? 'Selamat kembali' : 'Welcome back'},<br />
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
                    <FontAwesomeIcon icon={faWandSparkles} className="w-5 h-5 text-yellow-400" />
                    {language === 'id' ? 'Dasbor analisis kebun AI Anda' : language === 'ms' ? 'Papan pemuka analisis ladang AI anda' : 'Your AI farm analysis dashboard'}
                  </motion.p>
                </div>

                {/* Quick Action Buttons - Removed download button, notifications moved to navbar */}
                <div className="flex gap-3 relative">
                  {/* Notifications moved to AuthenticatedNavbar */}
                </div>
              </div>

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
                        <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm11.707-2.707a1 1 0 00-1.414-1.414L9 9.172 7.707 7.879a1 1 0 00-1.414 1.414L9 12l4.707-4.707z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-white/70 font-semibold uppercase">
                        {language === 'id' ? 'Akses Akun' : language === 'ms' ? 'Akses Akaun' : 'Account Access'}
                      </p>
                      <p className="text-2xl font-black text-white">
                        {language === 'id' ? 'Semua Fitur AI Gratis' : language === 'ms' ? 'Semua Ciri AI Percuma' : 'All AI Features Are Free'}
                      </p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-white/80 font-semibold">
                      {language === 'id' ? 'Batas unggah laporan:' : language === 'ms' ? 'Had muat naik laporan:' : 'Report upload limit:'}
                    </p>
                    <p className="text-3xl font-black text-yellow-400">
                      2
                    </p>
                    <p className="text-xs text-white/70">
                      {language === 'id' ? 'setiap pengguna' : language === 'ms' ? 'setiap pengguna' : 'per user'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
        {/* Notifications moved to AuthenticatedNavbar */}

        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border-2 border-green-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 p-8 text-white">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="inline-block bg-yellow-400 text-green-900 px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider mb-4">
                      {language === 'id' ? '✓ Akses Gratis Aktif' : language === 'ms' ? '✓ Akses Percuma Aktif' : '✓ Free Access Active'}
                    </div>
                    <h2 className="text-4xl font-black mb-2">
                      {language === 'id' ? 'Akses AI CropDrive' : language === 'ms' ? 'Akses AI CropDrive' : 'CropDrive AI Access'}
                    </h2>
                    <p className="text-green-100 text-lg">
                      {language === 'id'
                        ? 'Website, AI Assistant, dan Palmira kini gratis untuk semua pengguna.'
                        : language === 'ms'
                        ? 'Laman web, AI Assistant, dan Palmira kini percuma untuk semua pengguna.'
                        : 'The website, AI Assistant, and Palmira are now free for all users.'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black text-yellow-400">
                      2
                    </div>
                    <div className="text-green-100 text-sm">
                      {language === 'id' ? 'maksimum laporan setiap pengguna' : language === 'ms' ? 'maksimum laporan setiap pengguna' : 'maximum reports per user'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {language === 'id' ? 'Akses & Batas Laporan Anda' : language === 'ms' ? 'Akses & Had Laporan Anda' : 'Your Access & Report Limit'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border-2 border-green-200">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-green-600">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {language === 'id' ? 'Akses Penuh AI & Palmira' : language === 'ms' ? 'Akses Penuh AI & Palmira' : 'Full AI & Palmira Access'}
                      </p>
                      <p className="text-sm text-green-700 font-medium mt-1">
                        {language === 'id' ? 'Gratis untuk semua pengguna terdaftar' : language === 'ms' ? 'Percuma untuk semua pengguna berdaftar' : 'Free for all registered users'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border-2 border-green-200">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-green-600">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {language === 'id' ? 'Batas Unggah Laporan' : language === 'ms' ? 'Had Muat Naik Laporan' : 'Report Upload Limit'}
                      </p>
                      <p className="text-sm text-green-700 font-medium mt-1">
                        {language === 'id' ? 'Maksimum 2 laporan per pengguna' : language === 'ms' ? 'Maksimum 2 laporan bagi setiap pengguna' : 'Maximum of 2 reports per user'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    onClick={() => router.push('/assistant')}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-lg"
                  >
                    {language === 'id' ? '🤖 Mulai Analisis AI' : language === 'ms' ? '🤖 Mulakan Analisis AI' : '🤖 Start AI Analysis'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CropDrive AI Advisor - Centered */}
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
                      {language === 'id'
                        ? 'Unggah laporan laboratorium (Gambar/PDF/Excel - SPLAB, farm_test_data) dan dapatkan analisis AI dalam 5-8 menit.'
                        : language === 'ms'
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
                      {language === 'id' ? 'Penggunaan Unggahan' : language === 'ms' ? 'Penggunaan Muat Naik' : 'Upload Usage'}
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
                  {language === 'id' ? '🤖 Mulai Analisis Sekarang' : language === 'ms' ? '🤖 Mulakan Analisis Sekarang' : '🤖 Start Analysis Now'}
                </Button>
              ) : (
                <div>
                  <p className="text-yellow-300 text-sm mb-4 font-semibold bg-yellow-500/20 p-3 rounded-lg">
                    {language === 'id'
                      ? '⚠️ Batas 2 unggahan laporan telah tercapai untuk akun ini.'
                      : language === 'ms'
                      ? '⚠️ Had 2 muat naik laporan telah dicapai untuk akaun ini.'
                      : '⚠️ The 2-report upload limit has been reached for this account.'}
                  </p>
                  <Button
                    onClick={() => router.push('/reports')}
                    className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 hover:from-yellow-500 hover:to-yellow-600 font-bold shadow-lg"
                  >
                    {language === 'id' ? '📄 Lihat Laporan Anda' : language === 'ms' ? '📄 Lihat Laporan Anda' : '📄 View Your Reports'}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

      </div>
    </ProtectedRoute>
  );
}
