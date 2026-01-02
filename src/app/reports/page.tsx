'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import { FileText, Eye, Calendar, Search, Trash2, Plus, RefreshCw, X } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import toast from 'react-hot-toast';

interface Report {
  id: string;
  title: string;
  type: 'soil' | 'leaf';
  date: string;
  status: 'completed' | 'processing';
  recommendations: number;
  summary: string;
  userId: string;
  createdAt: Timestamp;
  fileUrl?: string;
  analysisData?: any;
}

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    try {
      const lang = getCurrentLanguage();
      setCurrentLang(lang);
    } catch (e) {
      // getCurrentLanguage might fail if localStorage is not available
      setCurrentLang('en');
    }
  }, []);

  const { language } = useTranslation(currentLang);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Process report data from Firestore document
  const processReportDoc = useCallback((doc: any, currentUserId: string): Report | null => {
    const data = doc.data();
    
    // Support both field name formats: 'userId' (website) or 'user_id' (AI assistant)
    const userId = data.userId || data.user_id;
    const reportStatus = data.status || 'completed';
    
    // Debug logging for troubleshooting
    if (userId === currentUserId) {
      console.log(`📄 Processing report ${doc.id}:`, {
        userId,
        status: reportStatus,
        title: data.title,
        hasCreatedAt: !!data.createdAt,
        hasTimestamp: !!data.timestamp,
        createdAtType: data.createdAt ? typeof data.createdAt : 'missing',
        timestampType: data.timestamp ? typeof data.timestamp : 'missing',
        reportTypes: data.report_types,
        type: data.type
      });
    }
    
    // Only include completed reports for current user
    if (!userId || userId !== currentUserId) {
      if (userId) {
        console.log(`⏭️ Skipping report ${doc.id}: userId mismatch (${userId} !== ${currentUserId})`);
      }
      return null;
    }
    
    if (reportStatus !== 'completed') {
      console.log(`⏭️ Skipping report ${doc.id}: status is "${reportStatus}", not "completed"`);
      return null;
    }
    
    // Handle report_types array (AI assistant format) vs type string (website format)
    // AI assistant sends: report_types: ["soil", "leaf"] (array)
    // Website format: type: "soil" (string)
    let reportType: 'soil' | 'leaf' = 'soil';
    if (data.type) {
      // Website format: single type string
      reportType = data.type as 'soil' | 'leaf';
    } else if (data.report_types && Array.isArray(data.report_types)) {
      // AI assistant format: array of types
      // Use first type, or default to 'soil' if array is empty
      if (data.report_types.length > 0) {
        reportType = data.report_types[0] as 'soil' | 'leaf';
      }
      // If array has both soil and leaf, prefer soil for display
      if (data.report_types.includes('soil')) {
        reportType = 'soil';
      } else if (data.report_types.includes('leaf')) {
        reportType = 'leaf';
      }
    }
    
    // Handle timestamp formats - AI assistant uses string timestamp
    let reportDate: string;
    let createdAt: Timestamp;
    
    if (data.createdAt?.toDate) {
      // Firestore Timestamp format (website)
      createdAt = data.createdAt;
      reportDate = data.createdAt.toDate().toISOString().split('T')[0];
    } else if (data.createdAt?.seconds) {
      // Firestore Timestamp with seconds property
      createdAt = Timestamp.fromMillis(data.createdAt.seconds * 1000);
      reportDate = new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0];
    } else if (data.timestamp) {
      // AI assistant format: ISO string timestamp
      const timestampDate = new Date(data.timestamp);
      if (!isNaN(timestampDate.getTime())) {
        reportDate = timestampDate.toISOString().split('T')[0];
        createdAt = Timestamp.fromDate(timestampDate);
      } else {
        // Fallback if timestamp is invalid
        reportDate = data.date || new Date().toISOString().split('T')[0];
        createdAt = Timestamp.now();
      }
    } else if (data.date) {
      // Date string format
      reportDate = data.date;
      const dateObj = new Date(data.date);
      createdAt = !isNaN(dateObj.getTime()) ? Timestamp.fromDate(dateObj) : Timestamp.now();
    } else {
      // No date found, use current date
      reportDate = new Date().toISOString().split('T')[0];
      createdAt = Timestamp.now();
    }
    
    // Extract title - AI assistant might use different field names
    const reportTitle = data.title || 
                       data.reportTitle || 
                       data.report_title ||
                       `Analysis Report - ${reportDate}`;
    
    // Extract summary - AI assistant might use different field names
    const reportSummary = data.summary || 
                         data.description || 
                         data.report_summary ||
                         '';
    
    // Extract recommendations count
    const recommendationsCount = data.recommendations || 
                                data.recommendationsCount || 
                                data.recommendations_count ||
                                (data.recommendations && Array.isArray(data.recommendations) ? data.recommendations.length : 0) ||
                                0;
    
    return {
      id: doc.id,
      title: reportTitle,
      type: reportType,
      date: reportDate,
      status: data.status || 'completed',
      recommendations: recommendationsCount,
      summary: reportSummary,
      userId: userId || currentUserId,
      createdAt: createdAt,
      fileUrl: data.fileUrl || data.file_url || data.fileURL,
      analysisData: data.analysisData || data.analysis_data || null
    };
  }, []);

  // Fetch reports from Firestore with real-time listener
  useEffect(() => {
    if (!user?.uid || !mounted) return;

    setLoadingReports(true);
    console.log('🔍 Setting up real-time reports listener for user:', user.uid);

    // Check authentication status
    if (!user) {
      console.error('❌ No user found when setting up reports listener');
      setLoadingReports(false);
      return;
    }

    console.log('✅ User authenticated:', {
      uid: user.uid,
      email: user.email,
      isAuthenticated: !!user.uid
    });

    // Refresh the authentication token to ensure it's valid
    const refreshToken = async () => {
      try {
        const auth = getAuth();
        if (auth.currentUser) {
          await auth.currentUser.getIdToken(true); // Force refresh
          console.log('🔄 Authentication token refreshed');
        }
      } catch (tokenError) {
        console.error('❌ Error refreshing auth token:', tokenError);
      }
    };

    refreshToken();

    const reportsRef = collection(db, 'analysis_results');
    
    // Try to set up real-time listener with orderBy
    let unsubscribe: (() => void) | null = null;
    
    // Set up listeners for both userId (website format) and user_id (AI assistant format)
    // We'll merge results from both queries
    let unsubscribe1: (() => void) | null = null;
    let unsubscribe2: (() => void) | null = null;
    const allReports = new Map<string, Report>();
    
    const updateReportsFromMap = () => {
      const reportsArray = Array.from(allReports.values());
      reportsArray.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.date).getTime();
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.date).getTime();
        return dateB - dateA;
      });
      setReports(reportsArray);
      setLoadingReports(false);
      console.log(`✅ Merged reports: ${reportsArray.length} total reports for user ${user.uid}`);
    };
    
    try {
      // Query 1: user_id (primary format used by AI assistant)
      // Query without status filter to avoid Firestore rule limitations with compound queries
      // We'll filter for completed reports on the client side
      const q1 = query(
        reportsRef,
        where('user_id', '==', user.uid)
      );
      
      unsubscribe1 = onSnapshot(
        q1,
        (snapshot) => {
          console.log(`📊 Query 1 (user_id): ${snapshot.size} reports found`);
          snapshot.forEach((doc) => {
            const report = processReportDoc(doc, user.uid);
            // Filter for completed reports on client side
            if (report && report.status === 'completed') {
              allReports.set(doc.id, report);
            }
          });
          updateReportsFromMap();
        },
        (error: any) => {
          console.error('❌ Query 1 (user_id) error:', {
            code: error.code,
            message: error.message,
            userId: user.uid,
            isAuthenticated: !!user.uid
          });
          setLoadingReports(false);
        }
      );
      
      // Query 2: userId (website format) - backup query for older reports that might use userId
      // Query without status filter to avoid Firestore rule limitations with compound queries
      try {
        const q2 = query(
          reportsRef,
          where('userId', '==', user.uid)
        );
        
        unsubscribe2 = onSnapshot(
          q2,
          (snapshot) => {
            console.log(`📊 Query 2 (userId): ${snapshot.size} reports found`);
            snapshot.forEach((doc) => {
              const report = processReportDoc(doc, user.uid);
              // Filter for completed reports on client side
              if (report && report.status === 'completed') {
                allReports.set(doc.id, report);
              }
            });
            updateReportsFromMap();
          },
          (error: any) => {
            console.warn('⚠️ Query 2 (userId) error:', {
              code: error.code,
              message: error.message
            });
          }
        );
      } catch (err) {
        console.error('❌ Error setting up query 2:', err);
      }
      
      // Set up cleanup function
      unsubscribe = () => {
        if (unsubscribe1) unsubscribe1();
        if (unsubscribe2) unsubscribe2();
      };
      
    } catch (err) {
      console.error('❌ Error setting up queries:', err);
      setLoadingReports(false);
      setReports([]);
    }
    
      // Also listen for custom events as backup and trigger a manual refresh
    const handleReportSaved = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const eventUserId = customEvent.detail?.userId;
      const currentUserId = user?.uid;
      
      console.log('📢 Reports page: Received analysisReportSaved event', {
        eventUserId,
        currentUserId,
        reportId: customEvent.detail?.reportId,
        timestamp: new Date().toISOString()
      });

      // Real-time listener should handle this automatically, but trigger a manual refresh as backup
      if (currentUserId && (!eventUserId || eventUserId === currentUserId)) {
        console.log('✅ Event received for current user - triggering manual refresh as backup');
        
        // Wait a bit for Firestore to sync, then manually fetch the new report
        setTimeout(async () => {
          try {
            const reportsRef = collection(db, 'analysis_results');
            // Query using user_id (primary format) first
            const simpleQuery = query(
              reportsRef,
              where('user_id', '==', currentUserId)
            );
            
            const snapshot = await getDocs(simpleQuery);
            console.log(`🔄 Manual refresh: Found ${snapshot.size} reports for user ${currentUserId} using user_id`);
            
            const newReports: Report[] = [];
            snapshot.forEach((doc) => {
              const report = processReportDoc(doc, currentUserId);
              if (report && report.status === 'completed') {
                newReports.push(report);
              }
            });
            
            // Also try userId format as backup
            try {
              const backupQuery = query(
                reportsRef,
                where('userId', '==', currentUserId)
              );
              const backupSnapshot = await getDocs(backupQuery);
              console.log(`🔄 Manual refresh backup: Found ${backupSnapshot.size} reports using userId`);
              backupSnapshot.forEach((doc) => {
                const report = processReportDoc(doc, currentUserId);
                if (report && report.status === 'completed') {
                  newReports.push(report);
                }
              });
            } catch (backupError) {
              console.warn('⚠️ Backup query failed:', backupError);
            }
            
            // Merge with existing reports
            const existingIds = new Set(reports.map(r => r.id));
            const reportsToAdd = newReports.filter(r => !existingIds.has(r.id));
            
            if (reportsToAdd.length > 0) {
              console.log(`✅ Adding ${reportsToAdd.length} new reports from manual refresh`);
              const updatedReports = [...reports, ...reportsToAdd].sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.date).getTime();
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.date).getTime();
                return dateB - dateA;
              });
              setReports(updatedReports);
            }
          } catch (error) {
            console.error('❌ Error in manual refresh:', error);
          }
        }, 2000); // Wait 2 seconds for Firestore to sync
      }
    };
    
    window.addEventListener('analysisReportSaved', handleReportSaved);
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      window.removeEventListener('analysisReportSaved', handleReportSaved);
    };
  }, [user?.uid, mounted, processReportDoc]);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.summary.toLowerCase().includes(searchQuery.toLowerCase());
    // Only show completed reports (already filtered in fetch, but double-check)
    return matchesSearch && report.status === 'completed';
  });

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm(language === 'ms' ? 'Adakah anda pasti mahu memadam laporan ini?' : 'Are you sure you want to delete this report?')) {
      return;
    }

    setDeletingId(reportId);
    try {
      await deleteDoc(doc(db, 'analysis_results', reportId));
      setReports(reports.filter(r => r.id !== reportId));
      toast.success(language === 'ms' ? '✓ Laporan dipadam' : '✓ Report deleted');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error(language === 'ms' ? '✗ Ralat memadam laporan' : '✗ Error deleting report');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">
            {language === 'ms' ? 'Memuatkan...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight font-heading">
              {language === 'ms' ? 'Sejarah' : 'Analysis'} <span className="text-yellow-400">{language === 'ms' ? 'Analisis' : 'History'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms'
                ? 'Lihat semua laporan analisis yang telah selesai dan akses cadangan agronomi anda.'
                : 'View all completed analysis reports and access your agronomic recommendations.'
              }
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setLoadingReports(true);
                  setReports([]);
                  setTimeout(() => {
                    window.location.reload();
                  }, 100);
                }}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
                title={language === 'ms' ? 'Muat Semula' : 'Refresh'}
              >
                <RefreshCw className={`w-5 h-5 ${loadingReports ? 'animate-spin' : ''}`} />
                {language === 'ms' ? 'Muat Semula' : 'Refresh'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/assistant')}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 px-6 py-3 rounded-lg font-black flex items-center gap-2 transition shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                {language === 'ms' ? 'Analisis Baharu' : 'New Analysis'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-end">
              <div className="flex-1 w-full">
                <label htmlFor="reports-search" className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ms' ? 'Cari Laporan' : 'Search Reports'}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    id="reports-search"
                    name="reports-search"
                    type="text"
                    placeholder={language === 'ms' ? 'Cari laporan...' : 'Search reports...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reports List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-24"
        >
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 sm:p-16 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl mx-auto mb-6 flex items-center justify-center">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">
                {language === 'ms' ? 'Tiada Laporan Dijumpai' : 'No Reports Found'}
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                {language === 'ms'
                  ? 'Cuba cari dengan kata kunci lain atau muat naik laporan baharu'
                  : 'Try searching with different keywords or upload a new report'
                }
              </p>
              <button
                onClick={() => router.push('/assistant')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                {language === 'ms' ? 'Muat Naik Laporan' : 'Upload Report'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:gap-8">
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      {/* Report Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-green-700" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
                            {report.title}
                          </h3>
                          
                          {report.summary && (
                            <p className="text-base text-gray-600 mb-4 line-clamp-2">{report.summary}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(report.date).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={() => handleViewReport(report)}
                          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition shadow-lg hover:shadow-xl"
                        >
                          <Eye className="w-5 h-5" />
                          <span>{language === 'ms' ? 'Lihat' : 'View'}</span>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          disabled={deletingId === report.id}
                          className="flex items-center justify-center w-12 h-12 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 border border-red-200 hover:border-red-300"
                          title={language === 'ms' ? 'Padam' : 'Delete'}
                        >
                          {deletingId === report.id ? (
                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedReport(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">{selectedReport.title}</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                aria-label={language === 'ms' ? 'Tutup' : 'Close'}
                title={language === 'ms' ? 'Tutup' : 'Close'}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto flex-1">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {language === 'ms' ? 'Tarikh' : 'Date'}
                  </h3>
                  <p className="text-gray-600">
                    {new Date(selectedReport.date).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                {selectedReport.summary && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {language === 'ms' ? 'Ringkasan' : 'Summary'}
                    </h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{selectedReport.summary}</p>
                  </div>
                )}

                {selectedReport.analysisData && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {language === 'ms' ? 'Data Analisis' : 'Analysis Data'}
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(selectedReport.analysisData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {!selectedReport.summary && !selectedReport.analysisData && (
                  <div className="text-center py-8 text-gray-500">
                    {language === 'ms' ? 'Tiada maklumat tambahan tersedia' : 'No additional information available'}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

