'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';

export default function ReviewsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleStorageChange = () => {
      const lang = getCurrentLanguage();
      setCurrentLanguage(lang);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const { language, t } = useTranslation(mounted ? currentLanguage : 'en');
  const copy = (en: string, ms: string) => language === 'id' ? toIndonesianText(ms) : language === 'ms' ? ms : en;
  const localize = (en: string, ms: string) => language === 'id' ? toIndonesianText(ms) : language === 'ms' ? ms : en;

  const testimonials = [
    {
      name: 'Ahmad bin Hassan',
      nameMs: 'Ahmad bin Hassan',
      location: 'Johor Bahru, Johor',
      locationMs: 'Johor Bahru, Johor',
      rating: 5,
      message: 'CropDrive has completely transformed how I manage my oil palm plantation. The AI analysis is incredibly accurate and the recommendations have helped me increase my yield by 25% in just 6 months.',
      messageMs: 'CropDrive telah mengubah sepenuhnya cara saya mengurus ladang kelapa sawit. Analisis AI sangat tepat dan cadangan telah membantu saya meningkatkan hasil sebanyak 25% dalam masa 6 bulan sahaja.',
      imageUrl: '/testimonials/ahmad.jpg',
      featured: true,
    },
    {
      name: 'Siti Nurhaliza',
      nameMs: 'Siti Nurhaliza',
      location: 'Kuching, Sarawak',
      locationMs: 'Kuching, Sarawak',
      rating: 5,
      message: 'As a small-scale farmer, I was skeptical about AI technology. But CropDrive made it so simple! The soil analysis helped me identify nutrient deficiencies I never knew existed.',
      messageMs: 'Sebagai petani kecil, saya ragu-ragu dengan teknologi AI. Tetapi CropDrive menjadikannya sangat mudah! Analisis tanah membantu saya mengenal pasti kekurangan nutrien yang saya tidak tahu wujud.',
      imageUrl: '/testimonials/siti.jpg',
      featured: true,
    },
    {
      name: 'Raj Kumar',
      nameMs: 'Raj Kumar',
      location: 'Teluk Intan, Perak',
      locationMs: 'Teluk Intan, Perak',
      rating: 5,
      message: 'The trend analysis feature is amazing. I can now track my farm\'s progress over time and make data-driven decisions. My fertilizer costs have decreased by 30%.',
      messageMs: 'Ciri analisis trend sangat mengagumkan. Saya kini boleh menjejaki kemajuan ladang dari masa ke semasa dan membuat keputusan berasaskan data. Kos baja saya telah berkurang sebanyak 30%.',
      imageUrl: '/testimonials/raj.jpg',
      featured: true,
    },
    {
      name: 'Fatimah Abdullah',
      nameMs: 'Fatimah Abdullah',
      location: 'Kota Kinabalu, Sabah',
      locationMs: 'Kota Kinabalu, Sabah',
      rating: 5,
      message: 'Customer support is excellent! They respond quickly via WhatsApp and really understand farming challenges. The mobile app makes it easy to upload reports from the field.',
      messageMs: 'Sokongan pelanggan sangat baik! Mereka respons pantas melalui WhatsApp dan benar-benar memahami cabaran pertanian. Apl mudah alih memudahkan saya memuat naik laporan dari ladang.',
      imageUrl: '/testimonials/fatimah.jpg',
      featured: false,
    },
    {
      name: 'Lim Wei Chong',
      nameMs: 'Lim Wei Chong',
      location: 'Batu Pahat, Johor',
      locationMs: 'Batu Pahat, Johor',
      rating: 5,
      message: 'I\'ve tried other farm management apps, but CropDrive is by far the most user-friendly. The AI recommendations are practical and have improved my harvesting efficiency.',
      messageMs: 'Saya telah mencuba apl pengurusan ladang lain, tetapi CropDrive adalah yang paling mesra pengguna. Cadangan AI sangat praktikal dan telah meningkatkan kecekapan penuaian saya.',
      imageUrl: '/testimonials/lim.jpg',
      featured: false,
    },
    {
      name: 'Maria Santos',
      nameMs: 'Maria Santos',
      location: 'Sandakan, Sabah',
      locationMs: 'Sandakan, Sabah',
      rating: 5,
      message: 'The comparative analysis feature helps me understand year-to-year progress. I can see exactly which areas need improvement and track the effectiveness of my farming practices.',
      messageMs: 'Ciri analisis perbandingan membantu saya memahami kemajuan tahun ke tahun. Saya boleh melihat dengan tepat kawasan mana yang perlu diperbaiki dan menjejaki keberkesanan amalan pertanian saya.',
      imageUrl: '/testimonials/maria.jpg',
      featured: false,
    },
  ];

  const stats = [
    {
      number: '10,000+',
      label: copy('Active Farmers', 'Petani Aktif'),
      labelMs: 'Petani Aktif',
    },
    {
      number: '50,000+',
      label: copy('Analyses Completed', 'Analisis Dilakukan'),
      labelMs: 'Analisis Dilakukan',
    },
    {
      number: '98%',
      label: copy('Customer Satisfaction', 'Kepuasan Pelanggan'),
      labelMs: 'Kepuasan Pelanggan',
    },
    {
      number: '25%',
      label: copy('Average Yield Increase', 'Peningkatan Hasil Purata'),
      labelMs: 'Peningkatan Hasil Purata',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-yellow-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-green-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.span
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block text-yellow-400 text-xs sm:text-sm font-bold tracking-widest uppercase mb-6 bg-white/10 px-5 py-2 rounded-full border border-yellow-400/30 backdrop-blur-sm"
            >
              {copy('Trusted by Farmers', 'Dipercayai oleh Petani')}
            </motion.span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 leading-tight font-heading">
              {copy('What Farmers', 'Apa yang Petani')} <span className="text-yellow-400">{copy('Say', 'Katakan')}</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              {copy('Success stories from Malaysian palm oil farmers using CropDrive', 'Kisah kejayaan dari petani kelapa sawit Malaysia yang menggunakan CropDrive')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center premium-card p-5 sm:p-6"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-green-700 mb-1 sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm sm:text-base font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Testimonials */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-white via-green-50/30 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-8 premium-mesh" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 font-heading tracking-tight">
              {copy('Featured', 'Testimoni')} <span className="text-green-700">{copy('Testimonials', 'Unggulan')}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.filter(t => t.featured).map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className="premium-card p-6 sm:p-8 h-full flex flex-col"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed flex-grow text-sm sm:text-base italic">
                  &ldquo;{localize(testimonial.message, testimonial.messageMs)}&rdquo;
                </p>

                <div className="flex items-center pt-4 border-t border-gray-100">
                  <div className="w-11 h-11 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center mr-3 shadow-md">
                    <span className="text-white font-bold text-base">
                      {localize(testimonial.name, testimonial.nameMs).charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm sm:text-base">
                      {localize(testimonial.name, testimonial.nameMs)}
                    </div>
                    <div className="text-gray-500 text-xs sm:text-sm">
                      {localize(testimonial.location, testimonial.locationMs)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Testimonials */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 font-heading tracking-tight">
              {copy('More', 'Lebih Banyak')} <span className="text-green-700">{copy('Testimonials', 'Testimoni')}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="premium-card p-5 sm:p-6 h-full flex flex-col"
              >
                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed text-sm flex-grow italic">
                  &ldquo;{localize(testimonial.message, testimonial.messageMs)}&rdquo;
                </p>

                <div className="flex items-center pt-3 border-t border-gray-100">
                  <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center mr-3 shadow-sm">
                    <span className="text-white font-bold text-sm">
                      {localize(testimonial.name, testimonial.nameMs).charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">
                      {localize(testimonial.name, testimonial.nameMs)}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {localize(testimonial.location, testimonial.locationMs)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-20 sm:py-24 bg-gradient-to-br from-green-900 via-green-800 to-green-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-yellow-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-green-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 font-heading">
              {copy('Join Thousands of', 'Sertai Ribuan')} <span className="text-yellow-400">{copy('Successful Farmers', 'Petani Berjaya')}</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              {copy('Start your journey to better yields with AI today', 'Mulakan perjalanan anda untuk hasil yang lebih baik dengan AI hari ini')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <motion.button
                className="px-10 py-5 btn-v2-primary rounded-xl font-black uppercase text-base tracking-wider"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {copy('🚀 Start Free Trial', '🚀 Mula Percubaan Percuma')}
              </motion.button>
              <motion.button
                className="px-10 py-5 border-2 border-white text-white rounded-xl font-bold uppercase text-base tracking-wider hover:border-yellow-400 hover:text-yellow-400 hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {copy('View Pricing', 'Lihat Harga')}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
