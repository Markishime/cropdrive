'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FileText, Download, Eye, Filter, Calendar, Search, Trash2 } from 'lucide-react';
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
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast.error(language === 'ms' ? 'Ralat memuatkan laporan' : 'Error loading reports');
        // Use mock data as fallback
        setReports([
          {
            id: '1',
            title: language === 'ms' ? 'Analisis Tanah - Januari 2025' : 'Soil Analysis - January 2025',
            type: 'soil',
            date: '2025-01-15',
            status: 'completed',
            recommendations: 12,
            summary: language === 'ms' 
              ? 'pH tanah rendah, perlu menambah kapur'
              : 'Low soil pH, lime addition recommended',
            userId: user?.uid || '',
            createdAt: Timestamp.now()
          },
          {
            id: '2',
            title: language === 'ms' ? 'Analisis Daun - Januari 2025' : 'Leaf Analysis - January 2025',
            type: 'leaf',
            date: '2025-01-10',
            status: 'completed',
            recommendations: 8,
            summary: language === 'ms'
              ? 'Kekurangan nitrogen, tambah baja NPK'
              : 'Nitrogen deficiency, add NPK fertilizer',
            userId: user?.uid || '',
            createdAt: Timestamp.now()
          }
        ]);
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
    return matchesSearch && matchesType;
  });

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {language === 'ms' ? 'Sejarah Laporan' : 'Reports History'}
              </h1>
              <p className="text-gray-600">
                {language === 'ms' 
                  ? 'Lihat dan muat turun laporan analisis AI anda yang telah selesai'
                  : 'View and download your completed AI analysis reports'
                }
              </p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'ms' ? 'Cari laporan...' : 'Search reports...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {language === 'ms' ? 'Semua' : 'All'}
              </button>
              <button
                onClick={() => setFilterType('soil')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  filterType === 'soil'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {language === 'ms' ? 'Tanah' : 'Soil'}
              </button>
              <button
                onClick={() => setFilterType('leaf')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  filterType === 'leaf'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {language === 'ms' ? 'Daun' : 'Leaf'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'ms' ? 'Jumlah Laporan' : 'Total Reports'}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'ms' ? 'Bulan Ini' : 'This Month'}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">2</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'ms' ? 'Analisis Tanah' : 'Soil Analysis'}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {reports.filter(r => r.type === 'soil').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'ms' ? 'Analisis Daun' : 'Leaf Analysis'}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {reports.filter(r => r.type === 'leaf').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {language === 'ms' ? 'Tiada Laporan Dijumpai' : 'No Reports Found'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {language === 'ms'
                      ? 'Cuba cari dengan kata kunci lain atau muat naik laporan baharu'
                      : 'Try searching with different keywords or upload a new report'
                    }
                  </p>
                  <Button onClick={() => router.push('/assistant')}>
                    {language === 'ms' ? 'Muat Naik Laporan' : 'Upload Report'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            filteredReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          report.type === 'soil' ? 'bg-yellow-100' : 'bg-purple-100'
                        }`}>
                          <FileText className={`w-6 h-6 ${
                            report.type === 'soil' ? 'text-yellow-600' : 'text-purple-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
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
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Date(report.date).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US')}
                              </span>
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

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center space-x-1"
                          onClick={() => handleViewReport(report)}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">{language === 'ms' ? 'Lihat' : 'View'}</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center space-x-1"
                          onClick={() => handleDownloadReport(report)}
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">{language === 'ms' ? 'Muat Turun' : 'Download'}</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteReport(report.id)}
                          disabled={deletingId === report.id}
                        >
                          {deletingId === report.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

