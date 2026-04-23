'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPodcast,
  faPlus,
  faEdit,
  faTrash,
  faPlay,
  faSpinner,
  faXmark,
  faCircleXmark,
  faSeedling,
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { getYouTubeVideoId } from '@/lib/youtube';

interface PodcastEpisode {
  id: string;
  title: string;
  titleMs: string;
  description: string;
  descriptionMs: string;
  youtubeUrl: string;
  videoId?: string | null;
  thumbnail?: string | null;
  order: number;
  published: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export default function PodcastAdmin() {
  const { user } = useAuth();
  const [language, setLanguage] = useState<Language>('en');
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PodcastEpisode | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [form, setForm] = useState({
    title: '',
    titleMs: '',
    description: '',
    descriptionMs: '',
    youtubeUrl: '',
    order: 0,
    published: true,
  });

  const { t } = useTranslation(language);

  useEffect(() => {
    setLanguage(getCurrentLanguage());
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) loadEpisodes();
  }, [isAdmin]);

  const checkAdmin = async () => {
    if (!auth.currentUser) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/admin/check', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setIsAdmin(!!data?.isAdmin);
      if (!data?.isAdmin) setError('Admin access required');
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadEpisodes = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/podcasts/admin', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setEpisodes(data.episodes || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load podcasts');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      title: '',
      titleMs: '',
      description: '',
      descriptionMs: '',
      youtubeUrl: '',
      order: episodes.length,
      published: true,
    });
    setModalOpen(true);
  };

  const openEdit = (ep: PodcastEpisode) => {
    setEditing(ep);
    setForm({
      title: ep.title,
      titleMs: ep.titleMs,
      description: ep.description,
      descriptionMs: ep.descriptionMs,
      youtubeUrl: ep.youtubeUrl,
      order: ep.order ?? 0,
      published: ep.published !== false,
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!auth.currentUser || !form.title.trim() || !form.youtubeUrl.trim()) {
      setError('Title and YouTube URL are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const token = await auth.currentUser.getIdToken();
      const url = editing ? `/api/podcasts/admin/${editing.id}` : '/api/podcasts/admin';
      const method = editing ? 'PUT' : 'POST';
      const body = editing
        ? { ...form, youtubeUrl: form.youtubeUrl.trim() }
        : {
            title: form.title.trim(),
            titleMs: (form.titleMs || form.title).trim(),
            description: (form.description || '').trim(),
            descriptionMs: (form.descriptionMs || form.description || '').trim(),
            youtubeUrl: form.youtubeUrl.trim(),
            order: form.order,
            published: form.published,
          };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setModalOpen(false);
      loadEpisodes();
    } catch (e: any) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!auth.currentUser || !confirm(language === 'ms' ? 'Padam episod ini?' : 'Delete this episode?')) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api/podcasts/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      loadEpisodes();
    } catch (e: any) {
      setError(e.message || 'Delete failed');
    }
  };

  const seed = async () => {
    if (!auth.currentUser) return;
    setSeeding(true);
    setError(null);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/podcasts/seed?replace=1', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Seed failed');
      await loadEpisodes();
    } catch (e: any) {
      setError(e.message || 'Seed failed');
    } finally {
      setSeeding(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <FontAwesomeIcon icon={faCircleXmark} className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'ms' ? 'Log Masuk Diperlukan' : 'Login Required'}
          </h2>
          <p className="text-gray-600 font-body">
            {language === 'ms' ? 'Sila log masuk untuk mengakses.' : 'Please log in to access.'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <FontAwesomeIcon icon={faCircleXmark} className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'ms' ? 'Akses Ditolak' : 'Access Denied'}
          </h2>
          <p className="text-gray-600 font-body">
            {language === 'ms' ? 'Anda tidak mempunyai akses pentadbir.' : 'You do not have admin access.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-green-900 font-heading mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faPodcast} className="w-8 h-8 text-green-600" />
                {language === 'ms' ? 'Pengurusan Podcast' : 'Podcast Management'}
              </h1>
              <p className="text-gray-600 font-body">
                {language === 'ms' ? 'Tambah dan urus episod podcast (YouTube).' : 'Add and manage podcast episodes (YouTube).'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={seed}
                disabled={seeding}
                className="px-4 py-2 rounded-xl border border-green-600 text-green-700 hover:bg-green-50 font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {seeding ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faSeedling} />}
                {language === 'ms' ? 'Seed 2 Episod' : 'Seed 2 Episodes'}
              </button>
              <button
                type="button"
                onClick={openAdd}
                className="px-6 py-2 rounded-xl bg-green-800 text-white hover:bg-green-900 font-semibold flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                {language === 'ms' ? 'Tambah Episod' : 'Add Episode'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <FontAwesomeIcon icon={faCircleXmark} className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
              aria-label={language === 'ms' ? 'Tutup' : 'Close'}
              title={language === 'ms' ? 'Tutup' : 'Close'}
            >
              <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FontAwesomeIcon icon={faSpinner} className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-body">{language === 'ms' ? 'Memuatkan...' : 'Loading...'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {episodes.length === 0 ? (
              <div className="p-12 text-center">
                <FontAwesomeIcon icon={faPodcast} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-body mb-6">
                  {language === 'ms' ? 'Belum ada episod. Tambah episod pertama atau muatkan episod contoh.' : 'No episodes yet. Add your first episode or load sample episodes.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={openAdd}
                    className="px-5 py-2.5 rounded-xl bg-green-800 text-white hover:bg-green-900 font-semibold flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    {language === 'ms' ? 'Tambah Episod' : 'Add Episode'}
                  </button>
                  <button
                    type="button"
                    onClick={seed}
                    disabled={seeding}
                    className="px-5 py-2.5 rounded-xl border border-green-600 text-green-700 hover:bg-green-50 font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {seeding ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faSeedling} />}
                    {language === 'ms' ? 'Muatkan episod contoh' : 'Load sample episodes'}
                  </button>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {episodes.map((ep) => {
                  const videoId = ep.videoId || (ep.youtubeUrl ? getYouTubeVideoId(ep.youtubeUrl) : null);
                  const thumb = ep.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);
                  return (
                  <li key={ep.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50">
                    <div className="flex-shrink-0 w-32 sm:w-40 aspect-video rounded-lg overflow-hidden bg-gray-200">
                      {thumb ? (
                        <img src={thumb} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FontAwesomeIcon icon={faPodcast} className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 font-heading truncate">{ep.title}</h3>
                      <p className="text-sm text-gray-500 truncate">{ep.youtubeUrl}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={ep.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Play on YouTube"
                      >
                        <FontAwesomeIcon icon={faPlay} className="w-5 h-5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => openEdit(ep)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                        title={language === 'ms' ? 'Edit' : 'Edit'}
                      >
                        <FontAwesomeIcon icon={faEdit} className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(ep.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title={language === 'ms' ? 'Padam' : 'Delete'}
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 font-heading mb-4">
                  {editing ? (language === 'ms' ? 'Edit Episod' : 'Edit Episode') : (language === 'ms' ? 'Tambah Episod' : 'Add Episode')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Title (EN) *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Episode title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Title (MS)</label>
                    <input
                      type="text"
                      value={form.titleMs}
                      onChange={(e) => setForm((f) => ({ ...f, titleMs: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Tajuk episod"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">YouTube URL *</label>
                    <input
                      type="url"
                      value={form.youtubeUrl}
                      onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="https://youtu.be/xxx or https://youtube.com/watch?v=xxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Description (EN)</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Short description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Description (MS)</label>
                    <textarea
                      value={form.descriptionMs}
                      onChange={(e) => setForm((f) => ({ ...f, descriptionMs: e.target.value }))}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Penerangan ringkas"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <label htmlFor="podcast-order" className="block text-sm font-medium text-gray-700 mb-1 font-body">Order</label>
                      <input
                        id="podcast-order"
                        type="number"
                        min={0}
                        value={form.order}
                        onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value, 10) || 0 }))}
                        className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        aria-label={language === 'ms' ? 'Susunan episod' : 'Episode order'}
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.published}
                        onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="text-sm font-body text-gray-700">{language === 'ms' ? 'Diterbitkan' : 'Published'}</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-body"
                  >
                    {language === 'ms' ? 'Batal' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
                    {language === 'ms' ? 'Simpan' : 'Save'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
