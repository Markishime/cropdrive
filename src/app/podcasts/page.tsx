'use client';

import React, { useState, useEffect } from 'react';
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
  faListUl,
  faClock,
  faCirclePlay,
  faMicrophone,
} from '@fortawesome/free-solid-svg-icons';
import { getYouTubeEmbedUrl, getYouTubeVideoId, extractYouTubeVideoIdFromText } from '@/lib/youtube';

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

function getResolvedVideoId(ep: PodcastEpisode): string | null {
  const fromStored =
    ep.videoId && String(ep.videoId).trim().length === 11
      ? String(ep.videoId).trim()
      : null;
  if (fromStored) return fromStored;
  const url = ep.youtubeUrl ? String(ep.youtubeUrl).trim() : '';
  const fromUrl = url ? getYouTubeVideoId(url) : null;
  if (fromUrl) return fromUrl;
  const fromDesc = extractYouTubeVideoIdFromText(ep.description || '') ?? extractYouTubeVideoIdFromText(ep.descriptionMs || '');
  return fromDesc;
}

export default function PodcastsPage() {
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
    loadEpisodes();
  }, []);

  const loadEpisodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/podcasts', {
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load podcasts');
      }
      setEpisodes(data.episodes || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load podcasts');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setSelectedEpisode(null);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  const t = (en: string, ms: string) => (language === 'ms' ? ms : en);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-20 sm:py-28 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:32px_32px]" />
        </div>
        {/* Decorative circles */}
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

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <FontAwesomeIcon icon={faSpinner} className="w-10 h-10 text-green-600 animate-spin mb-4" />
            <p className="text-gray-500 font-body">{t('Loading episodes...', 'Memuatkan episod...')}</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <FontAwesomeIcon icon={faLock} className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-red-700 font-body">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && episodes.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 sm:p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
              <FontAwesomeIcon icon={faHeadphones} className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-heading mb-3">
              {t('No episodes yet', 'Tiada episod lagi')}
            </h2>
            <p className="text-gray-500 font-body max-w-md mx-auto">
              {t('New episodes will appear here. Check back soon for fresh content.', 'Episod baru akan muncul di sini. Sila semak kemudian untuk kandungan terbaru.')}
            </p>
          </div>
        )}

        {/* Episodes */}
        {!loading && !error && episodes.length > 0 && (
          <div className="space-y-12">
            {/* Featured / Latest Episode */}
            <section>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 text-green-900">
                  <FontAwesomeIcon icon={faPodcast} className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-yellow-600">
                    {t('Featured', 'Pilihan')}
                  </span>
                  <h2 className="font-heading text-xl font-bold text-gray-900">
                    {t('Latest Episode', 'Episod Terkini')}
                  </h2>
                </div>
              </motion.div>

              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="group cursor-pointer overflow-hidden rounded-3xl bg-white shadow-xl border border-gray-100 hover:shadow-2xl hover:border-green-200 transition-all duration-300"
                onClick={() => setSelectedEpisode(episodes[0])}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Thumbnail */}
                  <div className="relative w-full lg:w-1/2 aspect-video lg:aspect-auto lg:min-h-[320px] bg-gradient-to-br from-green-800 to-green-900 overflow-hidden">
                    {(() => {
                      const ep = episodes[0];
                      const videoId = getResolvedVideoId(ep);
                      const thumb = ep.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);
                      return thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FontAwesomeIcon icon={faPlay} className="w-24 h-24 text-white/60" />
                        </div>
                      );
                    })()}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center text-green-600 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                        <FontAwesomeIcon icon={faPlay} className="w-8 h-8 ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-400 text-green-900 text-xs font-bold uppercase tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-green-800 animate-pulse" />
                        {t('Episode', 'Episod')} {episodes.length}
                      </span>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-center p-6 sm:p-8 lg:p-10">
                    <h3 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 mb-4 group-hover:text-green-700 transition-colors leading-tight">
                      {language === 'ms' ? episodes[0].titleMs : episodes[0].title}
                    </h3>
                    <p className="text-gray-600 font-body leading-relaxed line-clamp-4 mb-6">
                      {language === 'ms' ? episodes[0].descriptionMs : episodes[0].description || t('CropDrive & AGS insights.', 'Pandangan CropDrive & AGS.')}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-100 text-green-700 font-semibold text-sm hover:bg-green-200 transition-colors">
                        <FontAwesomeIcon icon={faCirclePlay} className="w-4 h-4" />
                        {t('Watch now', 'Tonton sekarang')}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            </section>

            {/* All Episodes - show all so episode 2 is always visible */}
            <section>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex items-center justify-between mb-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-800 text-white">
                    <FontAwesomeIcon icon={faListUl} className="w-5 h-5" />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-gray-900">
                    {t('All Episodes', 'Semua Episod')}
                  </h2>
                </div>
                <span className="rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-800">
                  {episodes.length} {t('episodes', 'episod')}
                </span>
              </motion.div>

              <div className="grid gap-4">
                {episodes.map((ep, index) => {
                  const title = language === 'ms' ? ep.titleMs : ep.title;
                  const desc = language === 'ms' ? ep.descriptionMs : ep.description;
                  const videoId = getResolvedVideoId(ep);
                  const thumb = ep.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null);
                  const episodeNum = episodes.length - index;
                    return (
                      <motion.article
                        key={ep.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.2 + index * 0.05 }}
                        className="group flex cursor-pointer overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-green-200 transition-all duration-300"
                        onClick={() => setSelectedEpisode(ep)}
                      >
                        {/* Thumbnail */}
                        <div className="relative w-40 sm:w-52 flex-shrink-0 aspect-video bg-gradient-to-br from-green-800 to-green-900 overflow-hidden">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <FontAwesomeIcon icon={faPlay} className="w-10 h-10 text-white/70" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center text-green-600 shadow-lg">
                              <FontAwesomeIcon icon={faPlay} className="w-5 h-5 ml-0.5" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <span className="px-2 py-1 rounded-md bg-black/70 text-white text-xs font-semibold">
                              EP {episodeNum}
                            </span>
                          </div>
                        </div>
                        {/* Content */}
                        <div className="flex flex-1 flex-col min-w-0 p-4 sm:p-5">
                          <h3 className="font-heading font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2 mb-1">
                            {title}
                          </h3>
                          <p className="text-sm text-gray-500 font-body line-clamp-2 flex-1">
                            {desc || t('CropDrive & AGS insights.', 'Pandangan CropDrive & AGS.')}
                          </p>
                          <div className="mt-3 flex items-center gap-2 text-green-600 text-sm font-medium">
                            <FontAwesomeIcon icon={faCirclePlay} className="w-4 h-4" />
                            {t('Play episode', 'Main episod')}
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              </section>
          </div>
        )}
      </div>

      {/* Theater Modal */}
      <AnimatePresence>
        {selectedEpisode && (() => {
          const resolvedVideoId = getResolvedVideoId(selectedEpisode);
          const title = language === 'ms' ? selectedEpisode.titleMs : selectedEpisode.title;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-5xl"
              >
                {/* Close button */}
                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  aria-label={t('Close', 'Tutup')}
                >
                  <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                </button>

                {/* Video container */}
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                  {resolvedVideoId ? (
                    <iframe
                      src={getYouTubeEmbedUrl(resolvedVideoId, { autoplay: true })}
                      title={title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white p-6">
                      <FontAwesomeIcon icon={faClock} className="w-16 h-16 text-white/40" />
                      <p className="text-xl font-medium">{t('No video available', 'Tiada video')}</p>
                      <p className="text-sm text-white/60 text-center max-w-sm">
                        {t('This episode does not have a playable video yet.', 'Episod ini belum mempunyai video yang boleh dimainkan.')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Title below video */}
                <div className="mt-4 text-center">
                  <h3 className="text-white font-heading font-bold text-lg sm:text-xl">{title}</h3>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
