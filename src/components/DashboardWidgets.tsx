'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldHalved, faLock, faCertificate, faLeaf,
  faFileAlt, faComments, faClockRotateLeft, faBolt
} from '@fortawesome/free-solid-svg-icons';

interface DashboardWidgetsProps {
  language: string;
  uploadsUsed: number;
  uploadsLimit: number;
  onNavigate: (path: string) => void;
}

export const QuickActionsWidget: React.FC<DashboardWidgetsProps> = ({ language, uploadsUsed, uploadsLimit, onNavigate }) => {
  const copy = (en: string, ms: string, id: string) =>
    language === 'id' ? id : language === 'ms' ? ms : en;

  const actions = [
    {
      icon: faFileAlt,
      label: copy('View Reports', 'Lihat Laporan', 'Lihat Laporan'),
      description: copy(`${uploadsUsed} completed`, `${uploadsUsed} selesai`, `${uploadsUsed} selesai`),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      path: '/reports',
    },
    {
      icon: faComments,
      label: copy('Chat with Palmira', 'Bersembang dengan Palmira', 'Obrolan dengan Palmira'),
      description: copy('AI Agronomist', 'Ahli Agronomi AI', 'Ahli Agronomi AI'),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 border-purple-200',
      path: '/palmira',
    },
    {
      icon: faClockRotateLeft,
      label: copy('Analysis History', 'Sejarah Analisis', 'Riwayat Analisis'),
      description: copy('Past results', 'Keputusan lepas', 'Hasil sebelumnya'),
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 border-amber-200',
      path: '/reports',
    },
    {
      icon: faBolt,
      label: copy('New Analysis', 'Analisis Baru', 'Analisis Baru'),
      description: copy(`${Math.max(0, uploadsLimit - uploadsUsed)} remaining`, `${Math.max(0, uploadsLimit - uploadsUsed)} baki`, `${Math.max(0, uploadsLimit - uploadsUsed)} tersisa`),
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 border-green-200',
      path: '/assistant',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, i) => (
        <motion.button
          key={action.path + i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate(action.path)}
          className={`p-4 rounded-2xl border ${action.bgColor} text-left transition-all hover:shadow-lg`}
        >
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-md`}>
            <FontAwesomeIcon icon={action.icon} className="w-5 h-5 text-white" />
          </div>
          <p className="font-bold text-gray-900 text-sm">{action.label}</p>
          <p className="text-xs text-gray-500 mt-1">{action.description}</p>
        </motion.button>
      ))}
    </div>
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

export const UploadProgressWidget: React.FC<DashboardWidgetsProps> = ({ language, uploadsUsed, uploadsLimit }) => {
  const copy = (en: string, ms: string, id: string) =>
    language === 'id' ? id : language === 'ms' ? ms : en;

  const percentage = uploadsLimit === -1 ? 0 : (uploadsUsed / uploadsLimit) * 100;
  const remaining = uploadsLimit === -1 ? Infinity : Math.max(0, uploadsLimit - uploadsUsed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">
          {copy('Upload Progress', 'Kemajuan Muat Naik', 'Progres Unggahan')}
        </h3>
        <span className="text-2xl font-black text-green-700">
          {uploadsUsed}/{uploadsLimit === -1 ? '∞' : uploadsLimit}
        </span>
      </div>
      
      {/* Visual progress */}
      <div className="flex gap-2 mb-3">
        {Array.from({ length: uploadsLimit === -1 ? 2 : uploadsLimit }).map((_, i) => (
          <div
            key={i}
            className={`h-3 flex-1 rounded-full transition-all ${
              i < uploadsUsed
                ? 'bg-gradient-to-r from-green-400 to-green-600 shadow-sm'
                : 'bg-gray-100 border border-gray-200'
            }`}
          />
        ))}
      </div>
      
      <p className="text-sm text-gray-600">
        {remaining === 0
          ? copy('Upload limit reached', 'Had muat naik dicapai', 'Batas unggahan tercapai')
          : remaining === Infinity
          ? copy('Unlimited uploads available', 'Muat naik tanpa had tersedia', 'Unggahan tak terbatas tersedia')
          : copy(`${remaining} upload${remaining > 1 ? 's' : ''} remaining`, `${remaining} muat naik baki`, `${remaining} unggahan tersisa`)
        }
      </p>
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
