'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';

export default function GetStartedFarmersPage() {
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

  const benefits = [
    {
      icon: '💰',
      title: language === 'ms' ? 'Harga Mampu Milik' : 'Affordable Pricing',
      desc: language === 'ms' ? 'Pelan khusus untuk petani individu dan pekebun kecil dengan harga yang berpatutan' : 'Special plans for individual farmers and smallholders at affordable prices'
    },
    {
      icon: '📱',
      title: language === 'ms' ? 'Mudah Digunakan' : 'Easy to Use',
      desc: language === 'ms' ? 'Antara muka mesra pengguna - jika boleh guna WhatsApp, boleh guna CropDrive' : 'User-friendly interface - if you can use WhatsApp, you can use CropDrive'
    },
    {
      icon: '🌾',
      title: language === 'ms' ? 'Peningkatan Hasil' : 'Yield Improvement',
      desc: language === 'ms' ? '10-30% peningkatan hasil purata dalam 18-24 bulan' : '10-30% average yield improvement in 18-24 months'
    },
    {
      icon: '📊',
      title: language === 'ms' ? 'Analisis Segera' : 'Instant Analysis',
      desc: language === 'ms' ? 'Dapatkan analisis tanah dan daun dalam 30 saat dengan AI' : 'Get soil and leaf analysis in 30 seconds with AI'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-block bg-yellow-400 text-green-900 px-6 py-2 rounded-full font-bold mb-8 uppercase tracking-wide text-sm">
              {language === 'ms' ? 'Untuk Petani' : 'For Farmers'}
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight font-['Outfit',_sans-serif]">
              {language === 'ms' ? 'Jadikan Ladang Anda' : 'Make Your Farm'}<br />
              <span className="text-yellow-400">{language === 'ms' ? 'Lebih Produktif' : 'More Productive'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms'
                ? 'Teknologi AI terkini kini boleh diakses oleh petani kelapa sawit individu dan pekebun kecil'
                : 'Cutting-edge AI technology now accessible to individual palm oil farmers and smallholders'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 font-black rounded-full hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50 transform hover:scale-105 uppercase tracking-wide">
                  {language === 'ms' ? 'Daftar Sekarang' : 'Register Now'}
                </button>
              </Link>
              <Link href="/pricing">
                <button className="px-10 py-5 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all duration-300 uppercase tracking-wide">
                  {language === 'ms' ? 'Lihat Harga' : 'View Pricing'}
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 font-['Outfit',_sans-serif]">
              {language === 'ms' ? 'Manfaat untuk' : 'Benefits for'} <span className="text-green-700">{language === 'ms' ? 'Petani' : 'Farmers'}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 font-['Outfit',_sans-serif]">
                  {benefit.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Quick Steps */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 font-['Outfit',_sans-serif]">
              {language === 'ms' ? '3 Langkah' : '3 Simple'} <span className="text-green-700">{language === 'ms' ? 'Mudah' : 'Steps'}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: language === 'ms' ? 'Daftar Akaun' : 'Register Account',
                desc: language === 'ms' ? 'Daftar percuma dalam 5 minit' : 'Register for free in 5 minutes'
              },
              {
                step: '2',
                title: language === 'ms' ? 'Muat Naik Laporan' : 'Upload Report',
                desc: language === 'ms' ? 'Muat naik laporan makmal atau ambil gambar' : 'Upload lab report or take a photo'
              },
              {
                step: '3',
                title: language === 'ms' ? 'Terima Cadangan' : 'Get Recommendations',
                desc: language === 'ms' ? 'Dapatkan cadangan AI dalam 30 saat' : 'Get AI recommendations in 30 seconds'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center bg-white p-8 rounded-2xl shadow-lg"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 text-yellow-400 rounded-full flex items-center justify-center text-4xl font-black mx-auto mb-6 shadow-xl">
                  {item.step}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 font-['Outfit',_sans-serif]">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-900 via-green-800 to-green-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 font-['Outfit',_sans-serif]">
              {language === 'ms' ? 'Sedia Bermula?' : 'Ready to Start?'}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {language === 'ms'
                ? 'Sertai ribuan petani yang sudah meningkatkan hasil mereka dengan AI'
                : 'Join thousands of farmers already improving their yields with AI'
              }
            </p>
            <Link href="/register">
              <button className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 font-black rounded-full hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50 transform hover:scale-105 uppercase tracking-wide">
                {language === 'ms' ? 'Daftar Percuma' : 'Register Free'}
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

