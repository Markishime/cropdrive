'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import { FileText, Eye, Calendar, Search, Trash2, Plus, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc, getDoc, Timestamp, onSnapshot } from 'firebase/firestore';
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
  const [fullReportData, setFullReportData] = useState<any>(null);
  const [loadingFullReport, setLoadingFullReport] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  
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

  const handleDeleteClick = (report: Report) => {
    setReportToDelete(report);
  };

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;

    const reportId = reportToDelete.id;
    setDeletingId(reportId);
    setReportToDelete(null);
    
    try {
      await deleteDoc(doc(db, 'analysis_results', reportId));
      setReports(reports.filter(r => r.id !== reportId));
      toast.success(
        language === 'ms' 
          ? '✓ Laporan berjaya dipadam' 
          : '✓ Report successfully deleted',
        {
          duration: 3000,
          icon: '🗑️',
        }
      );
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error(
        language === 'ms' 
          ? '✗ Ralat memadam laporan. Sila cuba lagi.' 
          : '✗ Error deleting report. Please try again.',
        {
          duration: 4000,
        }
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setReportToDelete(null);
  };

  const handleViewReport = async (report: Report) => {
    setSelectedReport(report);
    setLoadingFullReport(true);
    setFullReportData(null);
    
    try {
      // Fetch the full document from Firestore
      const reportDoc = await getDoc(doc(db, 'analysis_results', report.id));
      if (reportDoc.exists()) {
        const data = reportDoc.data();
        // Convert Firestore Timestamps to readable format
        const processedData: any = {};
        for (const [key, value] of Object.entries(data)) {
          if (value && typeof value === 'object' && 'toDate' in value) {
            // Firestore Timestamp
            processedData[key] = value.toDate().toISOString();
          } else if (value && typeof value === 'object' && 'seconds' in value) {
            // Timestamp with seconds property
            processedData[key] = new Date(value.seconds * 1000).toISOString();
          } else {
            processedData[key] = value;
          }
        }
        setFullReportData(processedData);
      } else {
        toast.error(
          language === 'ms' 
            ? 'Laporan tidak dijumpai' 
            : 'Report not found'
        );
      }
    } catch (error) {
      console.error('Error fetching full report:', error);
      toast.error(
        language === 'ms' 
          ? 'Ralat memuatkan laporan' 
          : 'Error loading report'
      );
    } finally {
      setLoadingFullReport(false);
    }
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
                          onClick={() => handleDeleteClick(report)}
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
              {loadingFullReport ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">
                      {language === 'ms' ? 'Memuatkan data laporan...' : 'Loading report data...'}
                    </p>
                  </div>
                </div>
              ) : fullReportData ? (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {language === 'ms' ? 'Maklumat Asas' : 'Basic Information'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fullReportData.title && (
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            {language === 'ms' ? 'Tajuk Laporan' : 'Report Title'}
                          </h4>
                          <p className="text-gray-900 font-medium">{fullReportData.title}</p>
                        </div>
                      )}
                      {fullReportData.date && (
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            {language === 'ms' ? 'Tarikh Analisis' : 'Analysis Date'}
                          </h4>
                          <p className="text-gray-900 font-medium">
                            {new Date(fullReportData.date).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                      {fullReportData.status && (
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            {language === 'ms' ? 'Status' : 'Status'}
                          </h4>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            fullReportData.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {fullReportData.status === 'completed' 
                              ? (language === 'ms' ? 'Selesai' : 'Completed')
                              : (language === 'ms' ? 'Sedang Diproses' : 'Processing')}
                          </span>
                        </div>
                      )}
                      {fullReportData.type && (
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            {language === 'ms' ? 'Jenis Analisis' : 'Analysis Type'}
                          </h4>
                          <p className="text-gray-900 font-medium capitalize">
                            {fullReportData.type === 'soil' 
                              ? (language === 'ms' ? 'Tanah' : 'Soil')
                              : fullReportData.type === 'leaf'
                              ? (language === 'ms' ? 'Daun' : 'Leaf')
                              : fullReportData.type}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  {fullReportData.summary && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {language === 'ms' ? 'Ringkasan Analisis' : 'Analysis Summary'}
                      </h3>
                      <div className="bg-white p-5 rounded-lg border border-gray-200">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {fullReportData.summary}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {(fullReportData.recommendations || fullReportData.recommendationsCount || (Array.isArray(fullReportData.recommendations) && fullReportData.recommendations.length > 0)) && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {language === 'ms' ? 'Cadangan' : 'Recommendations'}
                      </h3>
                      <div className="bg-white p-5 rounded-lg border border-gray-200">
                        {Array.isArray(fullReportData.recommendations) ? (
                          <ul className="space-y-3">
                            {fullReportData.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="flex items-start gap-3">
                                <span className="text-green-600 font-bold mt-1">•</span>
                                <span className="text-gray-700 flex-1">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-700">
                            {language === 'ms' 
                              ? `${fullReportData.recommendationsCount || fullReportData.recommendations || 0} cadangan tersedia`
                              : `${fullReportData.recommendationsCount || fullReportData.recommendations || 0} recommendations available`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Analysis Data */}
                  {fullReportData.analysisData && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {language === 'ms' ? 'Data Analisis Terperinci' : 'Detailed Analysis Data'}
                      </h3>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                        <div className="overflow-x-auto">
                          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-white p-4 rounded-lg border border-gray-300">
                            {JSON.stringify(fullReportData.analysisData, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Information */}
                  {(fullReportData.fileUrl || fullReportData.file_url || fullReportData.fileURL) && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {language === 'ms' ? 'Fail Terlampir' : 'Attached File'}
                      </h3>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <a 
                          href={fullReportData.fileUrl || fullReportData.file_url || fullReportData.fileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 font-semibold underline flex items-center gap-2"
                        >
                          {language === 'ms' ? 'Lihat Fail' : 'View File'}
                          <Eye className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Technical Details (Collapsible) */}
                  <details className="bg-gray-50 rounded-lg border border-gray-200">
                    <summary className="p-4 cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                      {language === 'ms' ? 'Maklumat Teknikal (Pilihan)' : 'Technical Details (Optional)'}
                    </summary>
                    <div className="p-4 pt-0 border-t border-gray-200">
                      <div className="bg-white rounded-lg p-4 border border-gray-300">
                        <div className="overflow-x-auto">
                          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                            {JSON.stringify(fullReportData, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {language === 'ms' ? 'Tiada data tersedia' : 'No data available'}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {reportToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleDeleteCancel}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-gray-900 mb-1">
                    {language === 'ms' ? 'Padam Laporan?' : 'Delete Report?'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'ms' 
                      ? 'Tindakan ini tidak boleh dibatalkan.' 
                      : 'This action cannot be undone.'}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {language === 'ms' ? 'Laporan:' : 'Report:'}
                </p>
                <p className="text-gray-900 font-semibold">{reportToDelete.title}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(reportToDelete.date).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  {language === 'ms' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletingId === reportToDelete.id}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-bold hover:from-red-700 hover:to-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deletingId === reportToDelete.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {language === 'ms' ? 'Memadam...' : 'Deleting...'}
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      {language === 'ms' ? 'Padam' : 'Delete'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

