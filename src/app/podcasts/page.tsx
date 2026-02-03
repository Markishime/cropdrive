'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPodcast,
  faPlay,
  faSpinner,
  faLock,
  faXmark,
  faHeadphones,
} from '@fortawesome/free-solid-svg-icons';
import { getYouTubeEmbedUrl, getYouTubeVideoId } from '@/lib/youtube';

interface PodcastEpisode {
  id: string;
  title: string;
  titleMs: string;
  description: string;
  descriptionMs: string;
  youtubeUrl: string;
  videoId: string | null;
  thumbnail: string | null;
  order: number;
  published: boolean;
  createdAt: string | null;
}

export default function PodcastsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ms'>('en');
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null);

  useEffect(() => {
    setMounted(true);
    setLanguage(getCurrentLanguage() as 'en' | 'ms');
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }
    if (user && (!user.plan || user.plan === 'none')) {
      router.replace('/pricing');
      return;
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !user.plan || user.plan === 'none') return;
    loadEpisodes();
  }, [user]);

  const loadEpisodes = async () => {
    const { auth } = await import('@/lib/firebase');
    if (!auth.currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/podcasts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          router.replace('/pricing');
          return;
        }
        throw new Error(data.error || 'Failed to load podcasts');
      }
      setEpisodes(data.episodes || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load podcasts');
      if (e.message?.includes('plan')) router.replace('/pricing');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setSelectedEpisode(null);

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!user) return null;
  if (!user.plan || user.plan === 'none') return null;

  const t = (en: string, ms: string) => (language === 'ms' ? ms : en);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section - Matching Analysis History */}
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
              {t('CropDrive', 'CropDrive')} <span className="text-yellow-400">{t('Podcasts', 'Podcast')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {t(
                'Watch and listen to insights on oil palm farming, AI, and AGS consultancy. Stay on CropDrive — no redirects.',
                'Tonton dan dengar pandangan tentang pertanian kelapa sawit, AI, dan perundingan AGS. Kekal di CropDrive — tiada redirect.'
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FontAwesomeIcon icon={faSpinner} className="w-12 h-12 text-green-600 animate-spin mb-4" />
            <p className="text-gray-600 font-body">{t('Loading episodes...', 'Memuatkan episod...')}</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <FontAwesomeIcon icon={faLock} className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-800 font-body">{error}</p>
          </div>
        ) : episodes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <FontAwesomeIcon icon={faHeadphones} className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 font-heading mb-2">
              {t('No episodes yet', 'Tiada episod lagi')}
            </h2>
            <p className="text-gray-600 font-body">
              {t('New episodes will appear here. Check back soon.', 'Episod baru akan muncul di sini. Sila semak kemudian.')}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {episodes.map((ep, index) => {
              const title = language === 'ms' ? ep.titleMs : ep.title;
              const desc = language === 'ms' ? ep.descriptionMs : ep.description;
              const videoId = ep.videoId || (ep.youtubeUrl && getYouTubeVideoId(ep.youtubeUrl));
              const thumb = ep.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null);
              return (
                <motion.div
                  key={ep.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedEpisode(ep)}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:border-green-200 transition-all duration-300 h-full flex flex-col">
                    <div className="relative aspect-video bg-gray-900">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-800 to-green-900">
                          <FontAwesomeIcon icon={faPlay} className="w-16 h-16 text-white/80" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center text-green-600 shadow-xl group-hover:scale-110 transition-transform">
                          <FontAwesomeIcon icon={faPlay} className="w-6 h-6 ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-gray-900 font-heading line-clamp-2 mb-2 group-hover:text-green-700 transition-colors">
                        {title}
                      </h3>
                      <p className="text-sm text-gray-600 font-body line-clamp-2 flex-1">
                        {desc || t('CropDrive & AGS insights.', 'Pandangan CropDrive & AGS.')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Theater modal */}
      <AnimatePresence>
        {selectedEpisode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
            >
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label={t('Close', 'Tutup')}
              >
                <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
              </button>
              {selectedEpisode.videoId ? (
                <iframe
                  src={getYouTubeEmbedUrl(selectedEpisode.videoId, { autoplay: true })}
                  title={language === 'ms' ? selectedEpisode.titleMs : selectedEpisode.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <p>{t('Invalid video', 'Video tidak sah')}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
