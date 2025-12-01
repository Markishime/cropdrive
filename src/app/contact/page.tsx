'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';

export default function ContactUsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ms'>('en');
  const { language } = useTranslation(currentLanguage);

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-16 xs:py-20 sm:py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 xs:mb-8 leading-tight font-heading px-2">
              {language === 'ms' ? 'Hubungi' : 'Contact'} <span className="text-yellow-400">{language === 'ms' ? 'Kami' : 'Us'}</span>
            </h1>
            <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-white/90 mb-8 xs:mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-3 xs:px-4">
              {language === 'ms'
                ? 'Isi borang di bawah atau hubungi kami terus melalui e-mel untuk respons yang cepat.'
                : 'Fill in the form below or reach us directly by email for a quick response.'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 font-heading">
              {language === 'ms' ? 'Borang Hubungi' : 'Contact Form'}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'ms'
                ? 'Isi butiran anda di bawah dan kami akan menghubungi anda secepat mungkin. Untuk respons lebih cepat, e-mel kami di'
                : 'Share your details below and we\'ll get back to you as soon as possible. For quicker reach, email us at'}
              {' '}
              <a href="mailto:contact@agriglobalsolutions.com" className="text-green-700 font-semibold underline">
                contact@agriglobalsolutions.com
              </a>
              .
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'ms' ? 'Nama Penuh' : 'Full Name'}
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={language === 'ms' ? 'Masukkan nama anda' : 'Enter your name'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'ms' ? 'E-mel' : 'Email'}
                </label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'ms' ? 'Organisasi (pilihan)' : 'Organization (optional)'}
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={language === 'ms' ? 'Nama syarikat atau ladang' : 'Company or farm name'}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'ms' ? 'Peranan Anda' : 'Your Role'}
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={language === 'ms' ? 'Contoh: Petani, NGO, Makmal' : 'e.g. Farmer, NGO, Lab'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'ms' ? 'Mesej Anda' : 'Your Message'}
              </label>
              <textarea
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base min-h-[140px] resize-y focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder={language === 'ms' ? 'Bagaimana kami boleh membantu anda?' : 'How can we help you?'}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                {language === 'ms'
                  ? 'Dengan menghantar, anda bersetuju untuk dihubungi oleh pasukan CropDrive.'
                  : 'By submitting, you agree to be contacted by the CropDrive team.'}
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold text-base sm:text-lg shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
              >
                {language === 'ms' ? 'Hantar Mesej' : 'Send Message'}
              </button>
            </div>
          </motion.form>
        </div>
      </section>
    </div>
  );
}
