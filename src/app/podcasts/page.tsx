'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentLanguage, type Language } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPodcast,
  faCirclePlay,
  faMicrophone,
} from '@fortawesome/free-solid-svg-icons';

export default function PodcastsPage() {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    setMounted(true);
    setLanguage(getCurrentLanguage());
  }, []);

  // Listen for language switches
  useEffect(() => {
    const handleStorage = () => setLanguage(getCurrentLanguage());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  const t = (en: string, ms: string) => (language === 'id' ? toIndonesianText(ms) : language === 'ms' ? ms : en);

  const PLAYLIST_IDS: Record<Language, string> = {
    en: 'PLWm-f6XL_xMzp-ScHE90XhF1Wkn9H9rrN',
    ms: 'PLWm-f6XL_xMxRwO_EJ3csHpqUu3mpSSSH',
    id: 'PLuiPKzDpdjBLIzz_m0Y5tHFRyfCifGGTE',
  };

  const playlistId = PLAYLIST_IDS[language] ?? PLAYLIST_IDS['en'];
  const embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}&rel=0&modestbranding=1`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50/20 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:32px_32px]" />
        </div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-green-400/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-400/20 border-2 border-yellow-400/40 mb-6">
              <FontAwesomeIcon icon={faMicrophone} className="w-8 h-8 text-yellow-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight font-heading">
              {t('CropDrive', 'CropDrive')} <span className="text-yellow-400">{t('Podcasts', 'Podcast')}</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed font-body">
              {t(
                'Exclusive video content on oil palm farming, AI technology, and AGS consultancy insights. Watch directly on CropDrive.',
                'Kandungan video eksklusif tentang pertanian kelapa sawit, teknologi AI, dan pandangan perundingan AGS. Tonton terus di CropDrive.'
              )}
            </p>
            <div className="flex items-center justify-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCirclePlay} className="w-4 h-4 text-yellow-400" />
                {t('Watch anytime', 'Tonton bila-bila masa')}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faPodcast} className="w-4 h-4 text-yellow-400" />
                {t('No redirects', 'Tiada redirect')}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Playlist embed */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl overflow-hidden shadow-2xl border border-green-100"
        >
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title={t('CropDrive Podcast Playlist', 'Senarai Main Podcast CropDrive')}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-gray-500 mt-6"
        >
          {t(
            'Use the playlist controls inside the player to browse all episodes.',
            'Gunakan kawalan senarai main dalam pemain untuk melayari semua episod.'
          )}
        </motion.p>
      </div>
    </div>
  );
}

