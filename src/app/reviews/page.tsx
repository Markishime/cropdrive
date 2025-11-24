'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import Card, { CardContent } from '@/components/ui/Card';

export default function ReviewsPage() {
  const { language, t } = useTranslation();

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
      label: language === 'ms' ? 'Petani Aktif' : 'Active Farmers',
      labelMs: 'Petani Aktif',
    },
    {
      number: '50,000+',
      label: language === 'ms' ? 'Analisis Dilakukan' : 'Analyses Completed',
      labelMs: 'Analisis Dilakukan',
    },
    {
      number: '98%',
      label: language === 'ms' ? 'Kepuasan Pelanggan' : 'Customer Satisfaction',
      labelMs: 'Kepuasan Pelanggan',
    },
    {
      number: '25%',
      label: language === 'ms' ? 'Peningkatan Hasil Purata' : 'Average Yield Increase',
      labelMs: 'Peningkatan Hasil Purata',
    },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {language === 'ms' ? 'Apa yang Petani Katakan' : 'What Farmers Say'}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {language === 'ms'
              ? 'Kisah kejayaan dari petani kelapa sawit Malaysia yang menggunakan CropDrive'
              : 'Success stories from Malaysian palm oil farmers using CropDrive'
            }
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">
                {language === 'ms' ? stat.labelMs : stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured Testimonials */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {language === 'ms' ? 'Testimoni Unggulan' : 'Featured Testimonials'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.filter(t => t.featured).map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-glow transition-all duration-300">
                  <CardContent className="p-8">
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

                    <p className="text-gray-700 mb-6 leading-relaxed">
                      "{language === 'ms' ? testimonial.messageMs : testimonial.message}"
                    </p>

                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-semibold text-lg">
                          {(language === 'ms' ? testimonial.nameMs : testimonial.name).charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {language === 'ms' ? testimonial.nameMs : testimonial.name}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {language === 'ms' ? testimonial.locationMs : testimonial.location}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* All Testimonials */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {language === 'ms' ? 'Lebih Banyak Testimoni' : 'More Testimonials'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-glow transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
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

                    <p className="text-gray-700 mb-4 leading-relaxed text-sm">
                      "{language === 'ms' ? testimonial.messageMs : testimonial.message}"
                    </p>

                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-semibold text-sm">
                          {(language === 'ms' ? testimonial.nameMs : testimonial.name).charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {language === 'ms' ? testimonial.nameMs : testimonial.name}
                        </div>
                        <div className="text-gray-600 text-xs">
                          {language === 'ms' ? testimonial.locationMs : testimonial.location}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              {language === 'ms' ? 'Sertai Ribuan Petani Berjaya' : 'Join Thousands of Successful Farmers'}
            </h2>
            <p className="text-xl text-primary-100 mb-6">
              {language === 'ms'
                ? 'Mulakan perjalanan anda untuk hasil yang lebih baik dengan AI hari ini'
                : 'Start your journey to better yields with AI today'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {language === 'ms' ? 'Mula Percubaan Percuma' : 'Start Free Trial'}
              </motion.button>
              <motion.button
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {language === 'ms' ? 'Lihat Harga' : 'View Pricing'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
