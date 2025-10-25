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
      title: language === 'ms' ? 'Muat Naik Keputusan Ujian Anda' : 'Upload Your Test Results',
      desc: language === 'ms' 
        ? 'Mulakan dengan memuat naik hasil analisis tanah dan daun anda terus ke platform. Format yang diterima termasuk kebanyakan laporan makmal standard. Petani boleh memuat naik fail melalui akaun CropDrive mereka, manakala organisasi dan makmal boleh mengintegrasikan muat naik pukal.'
        : 'Start by uploading your soil and leaf analysis results directly to the platform. Accepted formats include most standard laboratory reports. Farmers can upload files through their CropDrive account, while organizations and laboratories can integrate bulk uploads.',
      icon: '📤',
      image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800'
    },
    {
      number: '2',
      title: language === 'ms' ? 'Analisis AI' : 'AI Analysis',
      desc: language === 'ms'
        ? 'AI Agronomis CropDrive mentafsir data ujian menggunakan model agronomi yang dibangunkan dari penyelidikan antarabangsa dan disahkan dalam keadaan lapangan tropika. Sistem mengenal pasti jurang nutrien, isu kesihatan tanah, dan ketidakseimbangan, kemudian mereka bentuk strategi persenyawaan dan penambahbaikan yang disesuaikan.'
        : "CropDrive's AI Agronomist interprets the test data using agronomic models developed from international research and validated in tropical field conditions. The system identifies nutrient gaps, soil health issues, and imbalances, then designs tailored fertilization and improvement strategies.",
      icon: '🤖',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'
    },
    {
      number: '3',
      title: language === 'ms' ? 'Terima Laporan Anda' : 'Receive Your Report',
      desc: language === 'ms'
        ? 'Dalam beberapa minit, pengguna menerima laporan nasihat khusus lapangan yang merangkumi: Cadangan baja dengan kadar dan masa, Strategi penambahbaikan kesihatan tanah, Anggaran keseimbangan nutrien dan ROI, Kesan yang dijangka terhadap produktiviti.'
        : 'Within minutes, users receive a field-specific advisory report that includes: Fertilizer recommendations with rates and timing, Soil health improvement strategy, Nutrient balance and ROI estimates, Expected impact on productivity.',
      icon: '📋',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800'
    },
    {
      number: '4',
      title: language === 'ms' ? 'Laksanakan Cadangan' : 'Apply Recommendations',
      desc: language === 'ms'
        ? 'Petani dan estet menggunakan laporan untuk menyesuaikan penggunaan input dan meningkatkan prestasi hasil. Untuk organisasi, CropDrive menyediakan analitik agregat dan integrasi pilihan ke dalam sistem pemantauan untuk pengurusan projek atau rantaian bekalan.'
        : 'Farmers and estates use the report to adjust input use and improve yield performance. For organizations, CropDrive provides aggregated analytics and optional integration into monitoring systems for project or supply chain management.',
      icon: '🌱',
      image: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800'
    },
    {
      number: '5',
      title: language === 'ms' ? 'Jejaki Kemajuan dan Keputusan' : 'Track Progress and Results',
      desc: language === 'ms'
        ? 'Dengan penggunaan yang konsisten, CropDrive membolehkan pengguna membandingkan data bermusim, memantau pemulihan tanah, dan menilai faedah ekonomi pengurusan nutrien yang lebih baik.'
        : 'With consistent use, CropDrive allows users to compare seasonal data, monitor soil restoration, and evaluate the economic benefits of improved nutrient management.',
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
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight font-heading">
              {language === 'ms' ? 'Cara Ia' : 'How It'} <span className="text-yellow-400">{language === 'ms' ? 'Berfungsi' : 'Works'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms'
                ? 'CropDrive™ menukar keputusan ujian makmal pertanian kepada keputusan agronomi yang jelas. Prosesnya mudah, cepat, dan disokong oleh sains.'
                : 'CropDrive™ turns agricultural laboratory test results into clear agronomic decisions. The process is simple, fast, and backed by science.'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 font-heading">
              {language === 'ms' ? 'Lihat Demo' : 'Watch'} <span className="text-yellow-400">{language === 'ms' ? 'Langsung' : 'Demo'}</span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              {language === 'ms'
                ? 'Tonton bagaimana AGS AI Assistant menganalisis laporan makmal anda dalam masa 1-2 minit'
                : 'Watch how AGS AI Assistant analyzes your lab reports in 1-2 minutes'
              }
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
              {/* Demo Video Player */}
              <div className="aspect-video relative">
                <video
                  className="w-full h-full object-cover"
                  controls
                  poster="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=675&fit=crop"
                >
                  <source src="/videos/demo-video.mp4" type="video/mp4" />
                  {language === 'ms' 
                    ? 'Pelayar anda tidak menyokong tag video.'
                    : 'Your browser does not support the video tag.'
                  }
                </video>
                {/* Placeholder overlay - remove once you have the actual video */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-900/90 to-gray-900/90 pointer-events-none">
                  <div className="text-center px-6">
                    <div className="text-6xl mb-4">🎬</div>
                    <p className="text-2xl font-bold text-white mb-2">
                      {language === 'ms' ? 'Video Demo Akan Datang' : 'Demo Video Coming Soon'}
                    </p>               
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20"
              >
                <div className="text-4xl mb-3">📤</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {language === 'ms' ? 'Muat Naik Mudah' : 'Easy Upload'}
                </h3>
                <p className="text-white/80">
                  {language === 'ms'
                    ? 'Muat naik Gambar, PDF, atau Excel (SPLAB, farm_test_data)'
                    : 'Upload Images, PDF, or Excel (SPLAB, farm_test_data)'
                  }
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20"
              >
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {language === 'ms' ? 'Analisis Pantas' : 'Fast Analysis'}
                </h3>
                <p className="text-white/80">
                  {language === 'ms'
                    ? 'Dapatkan hasil analisis dalam masa 1-2 minit'
                    : 'Get analysis results in 1-2 minutes'
                  }
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20"
              >
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {language === 'ms' ? 'Bertauliah MPOB' : 'MPOB Certified'}
                </h3>
                <p className="text-white/80">
                  {language === 'ms'
                    ? 'Cadangan mengikut standard MPOB Malaysia'
                    : 'Recommendations follow MPOB Malaysia standards'
                  }
                </p>
              </motion.div>
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link href="/assistant">
                <button className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 font-black rounded-full hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50 transform hover:scale-105 uppercase tracking-wide">
                  {language === 'ms' ? '🚀 Cuba Sekarang' : '🚀 Try Now'}
                </button>
              </Link>
            </motion.div>
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
                  <div className="bg-yellow-400 text-green-900 text-6xl font-black rounded-full w-24 h-24 flex items-center justify-center mb-6 shadow-xl">
                    {step.number}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-heading">
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
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 font-heading">
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

