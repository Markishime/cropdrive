'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';

export default function AboutUsPage() {
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
              {language === 'ms' ? 'Tentang' : 'About'} <span className="text-yellow-400">{language === 'ms' ? 'Kami' : 'Us'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms'
                ? 'Memperkasakan petani Malaysia dengan teknologi AI untuk pertanian kelapa sawit yang lebih baik'
                : 'Empowering Malaysian farmers with AI technology for better palm oil farming'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* About CropDrive Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <p className="text-2xl text-gray-700 leading-relaxed mb-8">
                {language === 'ms'
                  ? 'CropDrive™ adalah platform agronomi digital yang dibangunkan oleh AGS – Agriculture Global Solutions, sebuah konsultansi pertanian yang berpangkalan di Jerman dan beroperasi di seluruh dunia.'
                  : 'CropDrive™ is a digital agronomy platform developed by AGS – Agriculture Global Solutions, an agricultural consultancy based in Germany and operating globally.'
                }
              </p>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                {language === 'ms'
                  ? 'Kami membangunkan alat praktikal yang didorong oleh AI yang membantu petani dan organisasi membuat keputusan agronomi dan pelaburan berdasarkan data. Fokus semasa kami adalah pada penyelesaian pertanian digital berasaskan AI untuk kelapa sawit di Malaysia, dengan perancangan pengembangan ke Indonesia dan negara tropika lain.'
                  : 'We develop practical AI-driven tools that help farmers and organizations make data-based agronomic and investment decisions. Our current focus is on AI-based digital agriculture solutions for oil palm in Malaysia, with planned expansion to Indonesia and other tropical countries.'
                }
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800"
                alt="Palm Oil Plantation"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-heading">
                {language === 'ms' ? 'Produk Pertama Kami' : 'Our First Product'}
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                {language === 'ms'
                  ? 'Produk pertama kami, CropDrive AI Agronomist, menukar keputusan ujian tanah dan daun kepada cadangan tepat khusus lapangan yang mengurangkan pembaziran, meningkatkan hasil, dan membimbing pengurusan tanah jangka panjang.'
                  : 'Our first product, the CropDrive AI Agronomist, turns soil and leaf test results into precise, field-specific recommendations that reduce waste, improve yields, and guide long-term soil management.'
                }
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-heading">
                {language === 'ms' ? 'Pasukan Kami' : 'Our Team'}
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                {language === 'ms'
                  ? 'Pasukan kami menggabungkan pengalaman lapangan yang mendalam dalam agronomi tropika, kesuburan tanah, dan pertanian presisi dengan sains data maju. Kami bekerjasama dengan perniagaan pertanian, institusi penyelidikan, NGO, dan agensi pembangunan untuk menjadikan agronomi digital yang boleh dipercayai dapat diakses oleh ladang semua saiz.'
                  : 'Our team combines deep field experience in tropical agronomy, soil fertility, and precision agriculture with advanced data science. We collaborate with agricultural businesses, research institutions, NGOs, and development agencies to make reliable digital agronomy accessible to farms of all sizes.'
                }
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"
                alt="Agricultural Team"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-green-50 to-white p-10 rounded-3xl shadow-xl">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 font-heading text-center">
                {language === 'ms' ? 'Masa Depan Kami' : 'Our Future'}
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                {language === 'ms'
                  ? 'Semasa kami terus berkembang, portfolio tanaman CropDrive akan berkembang ke koko dan kopi, membawa pendekatan berasaskan sains yang sama ke tanaman tropika utama lain. Misi kami adalah untuk menghubungkan data sebenar dengan hasil sebenar, memastikan setiap cadangan membawa kepada peningkatan yang boleh diukur dalam produktiviti dan kemampanan.'
                  : "As we continue to grow, CropDrive's crop portfolio will expand into cocoa and coffee, bringing the same science-based approach to other key tropical crops. Our mission is to connect real data with real results, ensuring every recommendation leads to measurable improvement in productivity and sustainability."
                }
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 font-heading">
              {language === 'ms' ? 'Nilai' : 'Our'} <span className="text-green-700">{language === 'ms' ? 'Kami' : 'Values'}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: language === 'ms' ? 'Ketepatan' : 'Accuracy',
                desc: language === 'ms' 
                  ? 'Menggunakan standard MPOB dan AI terkini untuk analisis yang tepat'
                  : 'Using MPOB standards and latest AI for accurate analysis'
              },
              {
                icon: '🤝',
                title: language === 'ms' ? 'Kebolehcapaian' : 'Accessibility',
                desc: language === 'ms'
                  ? 'Menjadikan teknologi AI mudah dan mampu milik untuk semua petani'
                  : 'Making AI technology easy and affordable for all farmers'
              },
              {
                icon: '🌱',
                title: language === 'ms' ? 'Kemampanan' : 'Sustainability',
                desc: language === 'ms'
                  ? 'Mempromosikan amalan pertanian regeneratif untuk masa depan yang lebih baik'
                  : 'Promoting regenerative farming practices for a better future'
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                <div className="text-6xl mb-6">{value.icon}</div>
                <h3 className="text-2xl font-black text-gray-900 mb-4 font-heading">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-green-900 via-green-800 to-green-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 font-heading">
              {language === 'ms' ? 'Pencapaian Kami' : 'Our Achievements'}
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '10,000+', label: language === 'ms' ? 'Petani Berdaftar' : 'Registered Farmers' },
              { number: '50,000+', label: language === 'ms' ? 'Analisis Selesai' : 'Analyses Completed' },
              { number: '100,000+', label: language === 'ms' ? 'Hektar Diuruskan' : 'Hectares Managed' },
              { number: '150-300%', label: language === 'ms' ? 'Purata ROI' : 'Average ROI' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-8 border-2 border-yellow-400/30"
              >
                <p className="text-5xl font-black text-yellow-400 mb-3">{stat.number}</p>
                <p className="text-white/90 text-sm font-semibold uppercase tracking-wide">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-heading">
              {language === 'ms' ? 'Sertai Kami Hari Ini' : 'Join Us Today'}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {language === 'ms'
                ? 'Jadilah sebahagian daripada revolusi pertanian pintar'
                : 'Be part of the smart farming revolution'
              }
            </p>
            <Link href="/register">
              <button className="px-10 py-5 bg-gradient-to-r from-green-600 to-green-700 text-white font-black rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 uppercase tracking-wide">
                {language === 'ms' ? 'Mulakan Sekarang' : 'Get Started Now'}
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

