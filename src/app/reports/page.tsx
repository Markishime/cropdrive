'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FileText, Download, Eye, Filter, Calendar, Search, Trash2, TrendingUp, BarChart3, CheckCircle2, Clock, ArrowUpRight, Share2, Star, Plus, ChevronDown } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header with Gradient Background */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 relative overflow-hidden"
        >
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500 to-blue-500 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-16 h-16 bg-gradient-to-br from-green-600 via-green-500 to-green-700 rounded-2xl flex items-center justify-center shadow-xl"
                >
                  <FileText className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                    {language === 'ms' ? 'Sejarah Laporan' : 'Reports History'}
                    <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                      {reports.length} {language === 'ms' ? 'laporan' : 'reports'}
                    </span>
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <BarChart3 className="w-4 h-4" />
                    {language === 'ms' 
                      ? 'Lihat dan urus laporan analisis AI anda'
                      : 'View and manage your AI analysis reports'
                    }
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toast.success(language === 'ms' ? '📤 Eksport akan tersedia!' : '📤 Export coming soon!')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition border-2 border-gray-200 hover:border-green-300"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === 'ms' ? 'Eksport' : 'Export'}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/assistant')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">{language === 'ms' ? 'Laporan Baharu' : 'New Report'}</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Filter Bar */}
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition" />
                <input
                  type="text"
                  placeholder={language === 'ms' ? '🔍 Cari laporan...' : '🔍 Search reports...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-200 focus:border-green-600 transition-all shadow-sm hover:shadow-md font-medium"
                />
              </div>

              {/* Type Filter */}
              <div className="flex flex-wrap gap-2">
                {['all', 'soil', 'leaf'].map((type) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilterType(type as any)}
                    className={`px-6 py-4 rounded-2xl font-bold transition-all shadow-sm hover:shadow-md ${
                      filterType === type
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300'
                    }`}
                  >
                    {type === 'all' ? (language === 'ms' ? '📊 Semua' : '📊 All') :
                     type === 'soil' ? (language === 'ms' ? '🌱 Tanah' : '🌱 Soil') :
                     (language === 'ms' ? '🍃 Daun' : '🍃 Leaf')}
                  </motion.button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap gap-2">
                {['all', 'completed', 'processing'].map((status) => (
                  <motion.button
                    key={status}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilterStatus(status as any)}
                    className={`px-5 py-4 rounded-2xl font-bold transition-all shadow-sm hover:shadow-md ${
                      filterStatus === status
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {status === 'all' ? '🔄' : status === 'completed' ? '✅' : '⏳'}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Reports */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 shadow-xl border-2 border-gray-200 hover:border-green-400 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold">+12%</span>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-1">
              {language === 'ms' ? 'Jumlah Laporan' : 'Total Reports'}
            </p>
            <p className="text-4xl font-black text-gray-900">{reports.length}</p>
          </motion.div>

          {/* This Month */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 shadow-xl border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                <Star className="w-4 h-4" />
                <span className="text-xs font-bold">{language === 'ms' ? 'Baharu' : 'New'}</span>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-1">
              {language === 'ms' ? 'Bulan Ini' : 'This Month'}
            </p>
            <p className="text-4xl font-black text-gray-900">{thisMonthReports}</p>
          </motion.div>

          {/* Completed */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-gradient-to-br from-white to-green-50 rounded-3xl p-6 shadow-xl border-2 border-green-200 hover:border-green-400 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                <span className="text-xs font-bold">✓ {completedReports}/{reports.length}</span>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-1">
              {language === 'ms' ? 'Selesai' : 'Completed'}
            </p>
            <p className="text-4xl font-black text-gray-900">{completedReports}</p>
          </motion.div>

          {/* Processing */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-gradient-to-br from-white to-yellow-50 rounded-3xl p-6 shadow-xl border-2 border-yellow-200 hover:border-yellow-400 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full animate-pulse">
                <span className="text-xs font-bold">⏳ {language === 'ms' ? 'Aktif' : 'Active'}</span>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-1">
              {language === 'ms' ? 'Sedang Diproses' : 'Processing'}
            </p>
            <p className="text-4xl font-black text-gray-900">{processingReports}</p>
          </motion.div>
        </motion.div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border-2 border-gray-200 p-16 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl mx-auto mb-6 flex items-center justify-center"
              >
                <FileText className="w-12 h-12 text-gray-400" />
              </motion.div>
              <h3 className="text-3xl font-black text-gray-900 mb-3">
                {language === 'ms' ? '📭 Tiada Laporan Dijumpai' : '📭 No Reports Found'}
              </h3>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                {language === 'ms'
                  ? 'Cuba cari dengan kata kunci lain atau muat naik laporan baharu untuk memulakan analisis AI anda'
                  : 'Try searching with different keywords or upload a new report to start your AI analysis'
                }
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/assistant')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition"
              >
                <Plus className="w-5 h-5" />
                {language === 'ms' ? 'Muat Naik Laporan Baharu' : 'Upload New Report'}
                <ArrowUpRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          ) : (
            filteredReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.01, y: -5 }}
                className="group"
              >
                <div className="bg-white rounded-3xl shadow-lg border-2 border-gray-200 hover:border-green-300 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      {/* Report Info */}
                      <div className="flex items-start gap-5 flex-1 min-w-0">
                        {/* Icon */}
                        <motion.div 
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                            report.type === 'soil' 
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' 
                              : 'bg-gradient-to-br from-purple-400 to-purple-600'
                          }`}
                        >
                          <FileText className="w-8 h-8 text-white" />
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-xl font-black text-gray-900 truncate group-hover:text-green-600 transition">
                              {report.title}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                              report.type === 'soil'
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                : 'bg-purple-100 text-purple-800 border border-purple-300'
                            }`}>
                              {report.type === 'soil'
                                ? (language === 'ms' ? '🌱 Tanah' : '🌱 Soil')
                                : (language === 'ms' ? '🍃 Daun' : '🍃 Leaf')
                              }
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 ${
                              report.status === 'completed'
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : 'bg-yellow-100 text-yellow-800 border border-yellow-300 animate-pulse'
                            }`}>
                              {report.status === 'completed' ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {language === 'ms' ? 'Selesai' : 'Completed'}
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3.5 h-3.5" />
                                  {language === 'ms' ? 'Diproses' : 'Processing'}
                                </>
                              )}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{report.summary}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg font-semibold">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(report.date).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold">
                              <BarChart3 className="w-3.5 h-3.5" />
                              {report.recommendations} {language === 'ms' ? 'cadangan' : 'recommendations'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0 lg:flex-col">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewReport(report)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition flex-1 lg:flex-initial lg:w-full justify-center"
                        >
                          <Eye className="w-4 h-4" />
                          <span>{language === 'ms' ? 'Lihat' : 'View'}</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDownloadReport(report)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition flex-1 lg:flex-initial lg:w-full justify-center"
                        >
                          <Download className="w-4 h-4" />
                          <span>{language === 'ms' ? 'Muat' : 'Download'}</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteReport(report.id)}
                          disabled={deletingId === report.id}
                          className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 hover:border-red-400 rounded-xl font-bold shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex-1 lg:flex-initial lg:w-full justify-center"
                        >
                          {deletingId === report.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </motion.button>
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

