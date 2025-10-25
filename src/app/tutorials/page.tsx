'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function TutorialsPage() {
  const { language, t } = useTranslation();

  const tutorials = [
    {
      title: language === 'ms' ? 'Memulakan dengan CropDrive' : 'Getting Started with CropDrive',
      description: language === 'ms'
        ? 'Panduan lengkap untuk mendaftar dan menyediakan akaun anda'
        : 'Complete guide to registering and setting up your account',
      steps: [
        language === 'ms' ? 'Daftar akaun baru' : 'Register a new account',
        language === 'ms' ? 'Sahkan email anda' : 'Verify your email',
        language === 'ms' ? 'Lengkapkan profil ladang' : 'Complete your farm profile',
        language === 'ms' ? 'Pilih pelan langganan' : 'Choose a subscription plan',
      ],
      videoUrl: '#',
      duration: '5 min',
    },
    {
      title: language === 'ms' ? 'Memuat Naik Laporan Makmal' : 'Uploading Lab Reports',
      description: language === 'ms'
        ? 'Cara memuat naik dan memproses laporan tanah dan daun anda'
        : 'How to upload and process your soil and leaf reports',
      steps: [
        language === 'ms' ? 'Pilih jenis analisis' : 'Select analysis type',
        language === 'ms' ? 'Muat naik fail PDF' : 'Upload PDF files',
        language === 'ms' ? 'Tunggu pemprosesan AI' : 'Wait for AI processing',
        language === 'ms' ? 'Lihat keputusan' : 'View results',
      ],
      videoUrl: '#',
      duration: '3 min',
    },
    {
      title: language === 'ms' ? 'Memahami Keputusan AI' : 'Understanding AI Results',
      description: language === 'ms'
        ? 'Cara membaca dan menggunakan cadangan AI untuk ladang anda'
        : 'How to read and use AI recommendations for your farm',
      steps: [
        language === 'ms' ? 'Baca ringkasan analisis' : 'Read analysis summary',
        language === 'ms' ? 'Semak cadangan' : 'Review recommendations',
        language === 'ms' ? 'Lihat perbandingan standard' : 'View standard comparisons',
        language === 'ms' ? 'Eksport laporan' : 'Export reports',
      ],
      videoUrl: '#',
      duration: '4 min',
    },
    {
      title: language === 'ms' ? 'Menggunakan Aplikasi Mudah Alih' : 'Using Mobile App',
      description: language === 'ms'
        ? 'Petua untuk menggunakan CropDrive pada telefon pintar anda'
        : 'Tips for using CropDrive on your smartphone',
      steps: [
        language === 'ms' ? 'Ambil gambar laporan' : 'Take photos of reports',
        language === 'ms' ? 'Muat naik gambar' : 'Upload images',
        language === 'ms' ? 'Gunakan kamera dalam apl' : 'Use in-app camera',
        language === 'ms' ? 'Kongsi keputusan' : 'Share results',
      ],
      videoUrl: '#',
      duration: '2 min',
    },
  ];

  const faqs = [
    {
      question: language === 'ms' ? 'Apakah format fail yang disokong?' : 'What file formats are supported?',
      answer: language === 'ms'
        ? 'Kami menyokong fail PDF, JPG, dan PNG. Saiz maksimum ialah 10MB.'
        : 'We support PDF, JPG, and PNG files. Maximum size is 10MB.',
    },
    {
      question: language === 'ms' ? 'Berapa lama masa pemprosesan?' : 'How long does processing take?',
      answer: language === 'ms'
        ? 'Kebanyakan analisis selesai dalam 30 saat. Untuk fail yang kompleks, ia mungkin mengambil masa sehingga 1 minit.'
        : 'Most analyses complete in 30 seconds. For complex files, it may take up to 1 minute.',
    },
    {
      question: language === 'ms' ? 'Adakah data saya selamat?' : 'Is my data secure?',
      answer: language === 'ms'
        ? 'Ya, semua data disulitkan dan disimpan dengan selamat. Kami tidak berkongsi data anda dengan pihak ketiga.'
        : 'Yes, all data is encrypted and stored securely. We do not share your data with third parties.',
    },
    {
      question: language === 'ms' ? 'Bolehkah saya eksport laporan?' : 'Can I export reports?',
      answer: language === 'ms'
        ? 'Ya, anda boleh memuat turun laporan dalam format PDF dengan graf dan cadangan.'
        : 'Yes, you can download reports in PDF format with graphs and recommendations.',
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
            {language === 'ms' ? 'Tutorial & Panduan' : 'Tutorials & Guides'}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {language === 'ms'
              ? 'Ketahui cara mendapatkan yang terbaik dari CropDrive dengan panduan langkah demi langkah'
              : 'Learn how to get the most out of CropDrive with step-by-step guides'
            }
          </p>
        </motion.div>

        {/* Tutorials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {tutorials.map((tutorial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-glow transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-600">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {tutorial.duration}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {tutorial.title}
                  </h3>

                  <p className="text-gray-600 mb-6">
                    {tutorial.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    {tutorial.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-center">
                        <svg
                          className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">{step}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-4">
                    <Button variant="outline" className="flex-1">
                      {language === 'ms' ? 'Tonton Video' : 'Watch Video'}
                    </Button>
                    <Button className="flex-1">
                      {language === 'ms' ? 'Mulakan' : 'Start'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {language === 'ms' ? 'Petua Pantas' : 'Quick Tips'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'ms'
                ? 'Petua berguna untuk mendapatkan hasil terbaik dari platform'
                : 'Useful tips for getting the best results from the platform'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: language === 'ms' ? 'Kualiti Gambar' : 'Image Quality',
                description: language === 'ms'
                  ? 'Pastikan laporan jelas dan terang untuk hasil AI terbaik'
                  : 'Ensure reports are clear and well-lit for best AI results',
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: language === 'ms' ? 'Masa Terbaik' : 'Best Time',
                description: language === 'ms'
                  ? 'Muat naik pada waktu bukan puncak untuk pemprosesan lebih pantas'
                  : 'Upload during off-peak hours for faster processing',
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: language === 'ms' ? 'Sokongan' : 'Support',
                description: language === 'ms'
                  ? 'Hubungi kami melalui WhatsApp untuk bantuan segera'
                  : 'Contact us via WhatsApp for immediate assistance',
              },
            ].map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      {tip.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {tip.title}
                    </h3>
                    <p className="text-gray-600">
                      {tip.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {language === 'ms' ? 'Soalan Lazim' : 'Frequently Asked Questions'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {language === 'ms' ? 'Perlu Bantuan?' : 'Need Help?'}
              </h3>
              <p className="text-gray-600 mb-6">
                {language === 'ms'
                  ? 'Pasukan sokongan kami sedia membantu anda dengan sebarang pertanyaan atau masalah.'
                  : 'Our support team is ready to help you with any questions or issues.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  {language === 'ms' ? 'WhatsApp Sokongan' : 'WhatsApp Support'}
                </Button>
                <Button variant="outline">
                  {language === 'ms' ? 'Pusat Bantuan' : 'Help Center'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
