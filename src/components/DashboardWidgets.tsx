'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldHalved, faLock, faCertificate, faLeaf,
  faBolt, faChartBar, faVial, faSeedling
} from '@fortawesome/free-solid-svg-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface DashboardWidgetsProps {
  language: string;
  uploadsUsed: number;
  uploadsLimit: number;
  onNavigate: (path: string) => void;
}

interface AnalysisReport {
  id: string;
  type: string;
  date: string;
  title: string;
  recommendations?: number;
  analysisData?: any;
}

export const DataVisualizationWidget: React.FC<DashboardWidgetsProps & { userId?: string }> = ({ language, uploadsUsed, uploadsLimit, onNavigate, userId }) => {
  const copy = (en: string, ms: string, id: string) =>
    language === 'id' ? id : language === 'ms' ? ms : en;

  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const fetchReports = async () => {
      try {
        const reportsRef = collection(db, 'analysis_results');
        const q1 = query(reportsRef, where('userId', '==', userId), where('status', '==', 'completed'));
        const q2 = query(reportsRef, where('user_id', '==', userId), where('status', '==', 'completed'));
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const map = new Map<string, AnalysisReport>();
        [...snap1.docs, ...snap2.docs].forEach(d => {
          if (!map.has(d.id)) {
            const data = d.data();
            const types = data.report_types || [];
            map.set(d.id, {
              id: d.id,
              type: types.includes('leaf') ? 'leaf' : types.includes('soil') ? 'soil' : (data.type || 'soil'),
              date: data.createdAt?.toDate?.()?.toISOString() || data.timestamp || data.created_at || '',
              title: data.title || data.report_title || 'Analysis Report',
              recommendations: data.recommendations?.length || data.recommendation_count || 0,
              analysisData: data.analysis_data || data.analysisData || null,
            });
          }
        });
        setReports(Array.from(map.values()));
      } catch (e) {
        console.warn('DataViz: Error loading reports', e);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [userId]);

  const soilCount = reports.filter(r => r.type === 'soil').length;
  const leafCount = reports.filter(r => r.type === 'leaf').length;
  const totalRecommendations = reports.reduce((acc, r) => acc + (r.recommendations || 0), 0);
  const remaining = uploadsLimit === -1 ? Infinity : Math.max(0, uploadsLimit - uploadsUsed);

  // Mini bar chart data for report activity
  const barData = (() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('en-US', { month: 'short' });
      months[key] = 0;
    }
    reports.forEach(r => {
      if (r.date) {
        const d = new Date(r.date);
        const key = d.toLocaleDateString('en-US', { month: 'short' });
        if (key in months) months[key]++;
      }
    });
    return Object.entries(months).map(([month, count]) => ({ month, count }));
  })();
  const maxBar = Math.max(...barData.map(d => d.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-800 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faChartBar} className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {copy('Analysis Overview', 'Gambaran Analisis', 'Ikhtisar Analisis')}
              </h3>
              <p className="text-sm text-white/70">
                {copy('Your farm data at a glance', 'Data ladang anda sekilas pandang', 'Data kebun Anda sekilas')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/reports')}
            className="text-sm font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all"
          >
            {copy('View All →', 'Lihat Semua →', 'Lihat Semua →')}
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={faChartBar} className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-bold text-green-700 uppercase">{copy('Total', 'Jumlah', 'Total')}</span>
                </div>
                <p className="text-3xl font-black text-gray-900">{uploadsUsed}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {remaining === Infinity
                    ? copy('Unlimited', 'Tanpa had', 'Tak terbatas')
                    : copy(`of ${uploadsLimit} used`, `daripada ${uploadsLimit}`, `dari ${uploadsLimit} digunakan`)
                  }
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={faVial} className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-700 uppercase">{copy('Soil', 'Tanah', 'Tanah')}</span>
                </div>
                <p className="text-3xl font-black text-gray-900">{soilCount}</p>
                <p className="text-xs text-gray-500 mt-1">{copy('analyses', 'analisis', 'analisis')}</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={faSeedling} className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700 uppercase">{copy('Leaf', 'Daun', 'Daun')}</span>
                </div>
                <p className="text-3xl font-black text-gray-900">{leafCount}</p>
                <p className="text-xs text-gray-500 mt-1">{copy('analyses', 'analisis', 'analisis')}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={faBolt} className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-700 uppercase">{copy('Tips', 'Cadangan', 'Saran')}</span>
                </div>
                <p className="text-3xl font-black text-gray-900">{totalRecommendations}</p>
                <p className="text-xs text-gray-500 mt-1">{copy('recommendations', 'cadangan', 'rekomendasi')}</p>
              </div>
            </div>

            {/* Activity Chart */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <h4 className="text-sm font-bold text-gray-700 mb-4">
                {copy('Analysis Activity (Last 6 Months)', 'Aktiviti Analisis (6 Bulan Terakhir)', 'Aktivitas Analisis (6 Bulan Terakhir)')}
              </h4>
              <div className="flex items-end gap-3 h-28">
                {barData.map((bar, i) => (
                  <div key={bar.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-gray-600">{bar.count > 0 ? bar.count : ''}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: bar.count > 0 ? `${(bar.count / maxBar) * 100}%` : '4px' }}
                      transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 200 }}
                      className={`w-full rounded-lg ${bar.count > 0 ? 'bg-gradient-to-t from-green-500 to-emerald-400 shadow-sm' : 'bg-gray-200'}`}
                      style={{ minHeight: '4px' }}
                    />
                    <span className="text-[10px] font-semibold text-gray-500 mt-1">{bar.month}</span>
                  </div>
                ))}
              </div>
              {reports.length === 0 && (
                <p className="text-center text-sm text-gray-400 mt-3">
                  {copy('No analyses yet. Start your first one!', 'Belum ada analisis. Mulakan yang pertama!', 'Belum ada analisis. Mulai yang pertama!')}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export const TrustSignalsWidget: React.FC<{ language: string }> = ({ language }) => {
  const copy = (en: string, ms: string, id: string) =>
    language === 'id' ? id : language === 'ms' ? ms : en;

  const signals = [
    {
      icon: faShieldHalved,
      label: copy('GDPR Compliant', 'Patuh GDPR', 'Sesuai GDPR'),
      color: 'text-green-600',
    },
    {
      icon: faLock,
      label: copy('End-to-End Encrypted', 'Disulitkan Hujung ke Hujung', 'Terenkripsi End-to-End'),
      color: 'text-blue-600',
    },
    {
      icon: faCertificate,
      label: copy('EU Registered', 'Berdaftar EU', 'Terdaftar EU'),
      color: 'text-purple-600',
    },
    {
      icon: faLeaf,
      label: copy('Palm Oil Specialist', 'Pakar Kelapa Sawit', 'Spesialis Kelapa Sawit'),
      color: 'text-emerald-600',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
    >
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
        {copy('Trust & Security', 'Kepercayaan & Keselamatan', 'Kepercayaan & Keamanan')}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {signals.map((signal, i) => (
          <div key={i} className="flex items-center gap-2">
            <FontAwesomeIcon icon={signal.icon} className={`w-4 h-4 ${signal.color}`} />
            <span className="text-xs font-semibold text-gray-700">{signal.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const ProcessingStatusWidget: React.FC<{ language: string; isProcessing?: boolean }> = ({ language, isProcessing = false }) => {
  const copy = (en: string, ms: string, id: string) =>
    language === 'id' ? id : language === 'ms' ? ms : en;

  if (!isProcessing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FontAwesomeIcon icon={faBolt} className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gray-900">
            {copy('Analysis in Progress', 'Analisis Sedang Dijalankan', 'Analisis Sedang Berlangsung')}
          </h3>
          <p className="text-sm text-gray-600">
            {copy('Your report is being analyzed by AI. This usually takes 5-8 minutes.', 'Laporan anda sedang dianalisis oleh AI. Ini biasanya mengambil masa 5-8 minit.', 'Laporan Anda sedang dianalisis oleh AI. Ini biasanya memakan waktu 5-8 menit.')}
          </p>
        </div>
      </div>
      {/* Progress animation */}
      <div className="mt-4 h-2 bg-blue-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ width: '40%' }}
        />
      </div>
    </motion.div>
  );
};
