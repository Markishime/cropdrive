'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';

export default function GetStartedOrganizationsPage() {
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
      icon: '🏢',
      title: language === 'ms' ? 'Pengurusan Multi-Ladang' : 'Multi-Farm Management',
      desc: language === 'ms' ? 'Urus berbilang ladang dan estet dari satu papan pemuka berpusat' : 'Manage multiple farms and estates from one centralized dashboard'
    },
    {
      icon: '👥',
      title: language === 'ms' ? 'Kawalan Akses Tim' : 'Team Access Control',
      desc: language === 'ms' ? 'Tetapkan peranan dan kebenaran berbeza untuk ahli pasukan' : 'Set different roles and permissions for team members'
    },
    {
      icon: '📊',
      title: language === 'ms' ? 'Laporan Analitik' : 'Analytics Reports',
      desc: language === 'ms' ? 'Laporan komprehensif dan analitik untuk keputusan berdasarkan data' : 'Comprehensive reports and analytics for data-driven decisions'
    },
    {
      icon: '🔗',
      title: language === 'ms' ? 'Integrasi API' : 'API Integration',
      desc: language === 'ms' ? 'Integrasikan dengan sistem sedia ada melalui API kami' : 'Integrate with existing systems through our API'
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
              {language === 'ms' ? 'Untuk Organisasi' : 'For Organizations'}
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight font-['Outfit',_sans-serif]">
              {language === 'ms' ? 'Transformasi' : 'Transform Your'}<br />
              <span className="text-yellow-400">{language === 'ms' ? 'Operasi Ladang' : 'Farm Operations'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms'
                ? 'Penyelesaian perusahaan untuk ladang besar, organisasi, dan syarikat agrikultur'
                : 'Enterprise solutions for large plantations, organizations, and agricultural companies'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 font-black rounded-full hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50 transform hover:scale-105 uppercase tracking-wide">
                  {language === 'ms' ? 'Jadualkan Demo' : 'Schedule Demo'}
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-10 py-5 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all duration-300 uppercase tracking-wide">
                  {language === 'ms' ? 'Hubungi Sales' : 'Contact Sales'}
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
              {language === 'ms' ? 'Ciri-ciri' : 'Enterprise'} <span className="text-green-700">{language === 'ms' ? 'Perusahaan' : 'Features'}</span>
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

      {/* Use Cases */}
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
              {language === 'ms' ? 'Sesuai' : 'Perfect'} <span className="text-green-700">{language === 'ms' ? 'Untuk' : 'For'}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: language === 'ms' ? 'Ladang Besar' : 'Large Plantations',
                desc: language === 'ms' ? '1,000+ hektar dengan pelbagai blok dan kawasan' : '1,000+ hectares with multiple blocks and sections',
                icon: '🌴'
              },
              {
                title: language === 'ms' ? 'Syarikat Agri' : 'Agri Companies',
                desc: language === 'ms' ? 'Urus portfolio ladang merentasi lokasi berbeza' : 'Manage portfolio of farms across different locations',
                icon: '🏭'
              },
              {
                title: language === 'ms' ? 'Makmal & NGO' : 'Labs & NGOs',
                desc: language === 'ms' ? 'Tambah nilai dengan perkhidmatan analisis AI' : 'Add value with AI analysis services',
                icon: '🔬'
              }
            ].map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center bg-white p-8 rounded-2xl shadow-lg"
              >
                <div className="text-6xl mb-4">{useCase.icon}</div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 font-['Outfit',_sans-serif]">
                  {useCase.title}
                </h3>
                <p className="text-gray-600">
                  {useCase.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
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
              {language === 'ms' ? 'Harga' : 'Custom'} <span className="text-green-700">{language === 'ms' ? 'Tersuai' : 'Pricing'}</span>
            </h2>
            <p className="text-xl text-gray-600">
              {language === 'ms'
                ? 'Hubungi kami untuk pakej tersuai berdasarkan saiz dan keperluan organisasi anda'
                : 'Contact us for custom packages based on your organization size and needs'
              }
            </p>
          </motion.div>

          <div className="bg-gradient-to-br from-green-50 to-white p-12 rounded-3xl shadow-2xl max-w-4xl mx-auto">
            <div className="text-center">
              <h3 className="text-3xl font-black text-gray-900 mb-6 font-['Outfit',_sans-serif]">
                {language === 'ms' ? 'Jadualkan Konsultasi Percuma' : 'Schedule Free Consultation'}
              </h3>
              <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                {language === 'ms'
                  ? 'Tim kami akan membantu anda memahami bagaimana CropDrive boleh mengubah operasi ladang anda'
                  : 'Our team will help you understand how CropDrive can transform your farm operations'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 uppercase tracking-wide">
                    {language === 'ms' ? 'Minta Demo' : 'Request Demo'}
                  </button>
                </Link>
                <Link href="/pricing">
                  <button className="px-8 py-4 border-2 border-green-600 text-green-700 font-bold rounded-full hover:bg-green-50 transition-all duration-300 uppercase tracking-wide">
                    {language === 'ms' ? 'Lihat Harga Standard' : 'View Standard Pricing'}
                  </button>
                </Link>
              </div>
            </div>
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
              {language === 'ms' ? 'Mari Berbincang' : 'Let\'s Talk'}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {language === 'ms'
                ? 'Hubungi pasukan kami untuk mengetahui lebih lanjut tentang penyelesaian perusahaan'
                : 'Contact our team to learn more about enterprise solutions'
              }
            </p>
            <Link href="/contact">
              <button className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 font-black rounded-full hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50 transform hover:scale-105 uppercase tracking-wide">
                {language === 'ms' ? 'Hubungi Kami' : 'Contact Us'}
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

