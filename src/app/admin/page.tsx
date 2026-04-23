'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faScrewdriverWrench,
  faNewspaper,
  faPodcast,
  faBookOpen,
  faChartLine,
  faFolderOpen,
  faSpinner,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

export default function AdminHubPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setMounted(true);
    setLanguage(getCurrentLanguage());
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    const check = async () => {
      try {
        const { auth } = await import('@/lib/firebase');
        if (!auth.currentUser) {
          setChecking(false);
          return;
        }
        const token = await auth.currentUser.getIdToken();
        const res = await fetch('/api/admin/check', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setIsAdmin(!!data?.isAdmin);
      } catch {
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };
    check();
  }, [user, authLoading]);

  useEffect(() => {
    if (!checking && !authLoading && (!user || !isAdmin)) {
      router.replace('/dashboard');
    }
  }, [checking, authLoading, user, isAdmin, router]);

  const t = (en: string, ms: string) => (language === 'ms' ? ms : en);

  if (!mounted || authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <FontAwesomeIcon icon={faSpinner} className="w-10 h-10 text-green-600 animate-spin" />
          <p className="text-gray-600">{t('Loading...', 'Memuatkan...')}</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const links = [
    {
      href: '/admin/blog',
      icon: faNewspaper,
      title: t('Blog', 'Blog'),
      titleMs: 'Blog',
      desc: t('Create and manage blog posts.', 'Cipta dan urus catatan blog.'),
    },
    {
      href: '/admin/podcasts',
      icon: faPodcast,
      title: t('Podcasts', 'Podcast'),
      titleMs: 'Podcast',
      desc: t('Add and manage podcast episodes.', 'Tambah dan urus episod podcast.'),
    },
    {
      href: '/admin/palmira/knowledge-base',
      icon: faBookOpen,
      title: t('Palmira Knowledge Base', 'Pangkalan Pengetahuan Palmira'),
      titleMs: 'Pangkalan Pengetahuan Palmira',
      desc: t('Manage Palmira AI knowledge base documents.', 'Urus dokumen pangkalan pengetahuan Palmira AI.'),
    },
    {
      href: '/admin/operations',
      icon: faFolderOpen,
      title: t('Operations Access', 'Akses Operasi'),
      titleMs: 'Akses Operasi',
      desc: t('Access uploaded files, report copies, and Palmira logs by user.', 'Akses fail dimuat naik, salinan laporan, dan log Palmira mengikut pengguna.'),
    },
    {
      href: '/admin/subscriber-analytics',
      icon: faChartLine,
      title: t('Subscriber Analytics', 'Analitik Pelanggan'),
      titleMs: 'Analitik Pelanggan',
      desc: t('Track growth and geographic distribution across markets.', 'Jejak pertumbuhan dan taburan geografi merentas pasaran.'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-400/20 border-2 border-yellow-400/40">
              <FontAwesomeIcon icon={faScrewdriverWrench} className="w-6 h-6 text-yellow-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
              {t('Manage pages', 'Urus halaman')}
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-white/90 text-lg"
          >
            {t('Manage all admin content for Blog, Podcasts, and Palmira.', 'Urus semua kandungan admin untuk Blog, Podcast, dan Palmira.')}
          </motion.p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ul className="space-y-4">
          {links.map((item, index) => (
            <motion.li
              key={item.href}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + index * 0.08 }}
            >
              <Link
                href={item.href}
                className="flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-200 bg-white shadow-sm hover:border-green-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-green-100 text-green-800 group-hover:bg-green-200 transition-colors">
                  <FontAwesomeIcon icon={item.icon} className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-heading font-bold text-lg text-gray-900 group-hover:text-green-800">
                    {language === 'ms' ? item.titleMs : item.title}
                  </h2>
                  <p className="text-sm text-gray-600 font-body">{item.desc}</p>
                </div>
                <FontAwesomeIcon icon={faArrowRight} className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
