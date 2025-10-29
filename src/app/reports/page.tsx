'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import { FileText, Download, Eye, Calendar, Search, Trash2, CheckCircle2, Clock, Share2, Plus } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
}

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'soil' | 'leaf'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'processing'>('all');
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLang(lang);
  }, []);

  const { language } = useTranslation(currentLang);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch reports from Firestore
  useEffect(() => {
    const fetchReports = async () => {
      if (!user?.uid) return;

      setLoadingReports(true);
      try {
        const reportsRef = collection(db, 'reports');
        const q = query(
          reportsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedReports: Report[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedReports.push({
            id: doc.id,
            title: data.title || '',
            type: data.type || 'soil',
            date: data.date || new Date().toISOString().split('T')[0],
            status: data.status || 'completed',
            recommendations: data.recommendations || 0,
            summary: data.summary || '',
            userId: data.userId,
            createdAt: data.createdAt,
            fileUrl: data.fileUrl
          });
        });
        
        setReports(fetchedReports);
        
        // If no reports found, just set empty array (no error)
        if (fetchedReports.length === 0) {
          console.log('No reports found for user');
        }
      } catch (error: any) {
        console.error('Error fetching reports:', error);
        
        // Only show error toast for actual errors, not missing index
        if (error.code !== 'failed-precondition' && error.code !== 'permission-denied') {
          toast.error(language === 'ms' ? 'Ralat memuatkan laporan' : 'Error loading reports');
        }
        
        // Set empty array on error (don't use mock data)
        setReports([]);
      } finally {
        setLoadingReports(false);
      }
    };

    if (user && mounted) {
      fetchReports();
    }
  }, [user, mounted, language]);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const completedReports = reports.filter(r => r.status === 'completed').length;
  const processingReports = reports.filter(r => r.status === 'processing').length;
  const thisMonthReports = reports.filter(r => {
    const reportDate = new Date(r.date);
    const now = new Date();
    return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
  }).length;

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm(language === 'ms' ? 'Adakah anda pasti mahu memadam laporan ini?' : 'Are you sure you want to delete this report?')) {
      return;
    }

    setDeletingId(reportId);
    try {
      await deleteDoc(doc(db, 'reports', reportId));
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
    // For now, just show a message. You can implement a modal or redirect to a detail page
    toast.success(language === 'ms' ? `Membuka laporan: ${report.title}` : `Opening report: ${report.title}`);
    // TODO: Implement report viewing logic
  };

  const handleDownloadReport = (report: Report) => {
    if (report.fileUrl) {
      window.open(report.fileUrl, '_blank');
    } else {
      toast.error(language === 'ms' ? 'Tiada fail untuk dimuat turun' : 'No file available for download');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Enhanced Header with Quick Stats */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 py-12 sm:py-16 lg:py-20 relative overflow-hidden">
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
            className="text-center sm:text-left"
          >
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-2 leading-tight">
                  {language === 'ms' ? 'Sejarah' : 'Reports'} <span className="text-yellow-400">{language === 'ms' ? 'Laporan' : 'History'}</span>
                </h1>
                <p className="text-lg sm:text-xl text-white/90 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {language === 'ms' 
                    ? 'Lihat dan urus laporan analisis AI anda'
                    : 'View and manage your AI analysis reports'
                  }
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toast.success(language === 'ms' ? 'Eksport akan tersedia tidak lama lagi' : 'Export coming soon')}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition"
                >
                  <Share2 className="w-4 h-4" />
                  {language === 'ms' ? 'Eksport' : 'Export'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/assistant')}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'ms' ? 'Baharu' : 'New Report'}
                </motion.button>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm font-medium">
                    {language === 'ms' ? 'Jumlah Laporan' : 'Total Reports'}
                  </span>
                  <FileText className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-2xl font-black text-white">{reports.length}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm font-medium">
                    {language === 'ms' ? 'Bulan Ini' : 'This Month'}
                  </span>
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-2xl font-black text-white">{thisMonthReports}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm font-medium">
                    {language === 'ms' ? 'Selesai' : 'Completed'}
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-2xl font-black text-white">{completedReports}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm font-medium">
                    {language === 'ms' ? 'Sedang Diproses' : 'Processing'}
                  </span>
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-2xl font-black text-white">{processingReports}</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'ms' ? 'Cari laporan...' : 'Search reports...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-2">
              {['all', 'soil', 'leaf'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={`px-4 py-2.5 rounded-lg font-medium transition ${
                    filterType === type
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type === 'all' ? (language === 'ms' ? 'Semua' : 'All') :
                   type === 'soil' ? (language === 'ms' ? 'Tanah' : 'Soil') :
                   (language === 'ms' ? 'Daun' : 'Leaf')}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {['all', 'completed', 'processing'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-2.5 rounded-lg font-medium transition ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status === 'all' ? (language === 'ms' ? 'Semua' : 'All') :
                   status === 'completed' ? (language === 'ms' ? 'Selesai' : 'Completed') :
                   (language === 'ms' ? 'Diproses' : 'Processing')}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {language === 'ms' ? 'Tiada Laporan Dijumpai' : 'No Reports Found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {language === 'ms'
                  ? 'Cuba cari dengan kata kunci lain atau muat naik laporan baharu'
                  : 'Try searching with different keywords or upload a new report'
                }
              </p>
              <button
                onClick={() => router.push('/assistant')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                <Plus className="w-5 h-5" />
                {language === 'ms' ? 'Muat Naik Laporan' : 'Upload Report'}
              </button>
            </motion.div>
          ) : (
            filteredReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Report Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          report.type === 'soil' ? 'bg-yellow-100' : 'bg-purple-100'
                        }`}>
                          <FileText className={`w-6 h-6 ${
                            report.type === 'soil' ? 'text-yellow-600' : 'text-purple-600'
                          }`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-lg font-bold text-gray-900 truncate">
                              {report.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              report.type === 'soil'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {report.type === 'soil'
                                ? (language === 'ms' ? 'Tanah' : 'Soil')
                                : (language === 'ms' ? 'Daun' : 'Leaf')
                              }
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{report.summary}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(report.date).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US')}
                            </span>
                            <span>
                              {report.recommendations} {language === 'ms' ? 'cadangan' : 'recommendations'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full ${
                              report.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {report.status === 'completed'
                                ? (language === 'ms' ? 'Selesai' : 'Completed')
                                : (language === 'ms' ? 'Sedang Diproses' : 'Processing')
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewReport(report)}
                          className="flex items-center gap-1 px-3 py-2 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">{language === 'ms' ? 'Lihat' : 'View'}</span>
                        </button>
                        
                        <button
                          onClick={() => handleDownloadReport(report)}
                          className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">{language === 'ms' ? 'Muat' : 'Download'}</span>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          disabled={deletingId === report.id}
                          className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        >
                          {deletingId === report.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

