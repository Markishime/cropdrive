'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';

export default function HowItWorksPage() {
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

  const steps = [
    {
      number: '1',
      title: language === 'ms' ? 'Muat Naik Laporan' : 'Upload Report',
      desc: language === 'ms' 
        ? 'Muat naik PDF atau gambar laporan makmal tanah/daun anda. AI kami menyokong semua format lab.'
        : 'Upload your soil/leaf lab report PDF or image. Our AI supports all lab formats.',
      icon: '📤',
      image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800'
    },
    {
      number: '2',
      title: language === 'ms' ? 'AI Menganalisis (30 saat)' : 'AI Analyzes (30 seconds)',
      desc: language === 'ms'
        ? 'Google Gemini AI membaca data, membandingkan dengan standard MPOB, dan mengenal pasti isu nutrien.'
        : 'Google Gemini AI reads data, compares to MPOB standards, and identifies nutrient issues.',
      icon: '🤖',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'
    },
    {
      number: '3',
      title: language === 'ms' ? 'Terima 3 Pilihan Bajet' : 'Receive 3 Budget Options',
      desc: language === 'ms'
        ? 'Dapatkan cadangan Tinggi, Sederhana, dan Rendah dengan kos, ROI 5 tahun, dan amalan regeneratif.'
        : 'Get High, Medium, and Low recommendations with costs, 5-year ROI, and regenerative practices.',
      icon: '💰',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800'
    },
    {
      number: '4',
      title: language === 'ms' ? 'Eksport Laporan PDF' : 'Export PDF Report',
      desc: language === 'ms'
        ? 'Muat turun laporan profesional lengkap untuk mesyuarat, pembekal, dan dokumentasi.'
        : 'Download complete professional report for meetings, suppliers, and documentation.',
      icon: '📄',
      image: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800'
    },
    {
      number: '5',
      title: language === 'ms' ? 'Laksana & Pantau' : 'Implement & Monitor',
      desc: language === 'ms'
        ? 'Laksanakan cadangan, muat naik ujian berkala, bandingkan keputusan, dan jejaki peningkatan.'
        : 'Implement recommendations, upload periodic tests, compare results, and track improvements.',
      icon: '📈',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'
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
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight font-['Outfit',_sans-serif]">
              {language === 'ms' ? 'Cara Ia' : 'How It'} <span className="text-yellow-400">{language === 'ms' ? 'Berfungsi' : 'Works'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms'
                ? 'Dari muat naik laporan hingga hasil yang boleh diambil tindakan dalam 5 langkah mudah'
                : 'From report upload to actionable results in 5 simple steps'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`mb-24 last:mb-0 ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}
            >
              <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}>
                {/* Image */}
                <div className="w-full md:w-1/2">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <img 
                      src={step.image}
                      alt={step.title}
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 text-8xl opacity-50">{step.icon}</div>
                  </div>
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2">
                  <div className="inline-block bg-yellow-400 text-green-900 text-6xl font-black rounded-full w-24 h-24 flex items-center justify-center mb-6 shadow-xl">
                    {step.number}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-['Outfit',_sans-serif]">
                    {step.title}
                  </h2>
                  <p className="text-xl text-gray-700 leading-relaxed mb-8">
                    {step.desc}
                  </p>
                  {index === steps.length - 1 && (
                    <Link href="/register">
                      <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                        {language === 'ms' ? 'Mulakan Sekarang' : 'Get Started Now'}
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
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
              {language === 'ms' ? 'Sedia untuk Transformasi?' : 'Ready to Transform?'}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {language === 'ms'
                ? 'Sertai ribuan petani yang sudah menggunakan AI untuk hasil yang lebih baik'
                : 'Join thousands of farmers already using AI for better yields'
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
    </div>
  );
}

