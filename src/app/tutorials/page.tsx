'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import Card, { CardContent } from '@/components/ui/Card';
import { Play, BookOpen, Video, Image, CheckCircle2, Download, ExternalLink } from 'lucide-react';

export default function TutorialsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [activeVideo, setActiveVideo] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const lang = (localStorage.getItem('cropdrive-language') || 'en') as 'en' | 'ms';
    setCurrentLang(lang);
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleStorageChange = () => {
      const lang = (localStorage.getItem('cropdrive-language') || 'en') as 'en' | 'ms';
      setCurrentLang(lang);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const { language } = useTranslation(mounted ? currentLang : 'en');

  const videoTutorials = [
    {
      id: 1,
      title: language === 'ms' ? 'Memulakan dengan CropDrive' : 'Getting Started with CropDrive',
      description: language === 'ms'
        ? 'Panduan lengkap untuk mendaftar, menyediakan akaun, dan memulakan perjalanan AI anda'
        : 'Complete guide to registering, setting up your account, and starting your AI journey',
      duration: '5:32',
      thumbnail: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&h=450&fit=crop',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video
      category: language === 'ms' ? 'Permulaan' : 'Getting Started',
      views: '2.4K'
    },
    {
      id: 2,
      title: language === 'ms' ? 'Memuat Naik & Menganalisis Laporan Makmal' : 'Uploading & Analyzing Lab Reports',
      description: language === 'ms'
        ? 'Cara memuat naik laporan tanah dan daun, serta memahami keputusan analisis AI'
        : 'How to upload soil and leaf reports and understand AI analysis results',
      duration: '8:15',
      thumbnail: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=450&fit=crop',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video
      category: language === 'ms' ? 'Analisis' : 'Analysis',
      views: '3.1K'
    },
    {
      id: 3,
      title: language === 'ms' ? 'Memahami Cadangan Baja AI' : 'Understanding AI Fertilizer Recommendations',
      description: language === 'ms'
        ? 'Tafsiran mendalam tentang cadangan baja yang diberikan oleh AI'
        : 'In-depth interpretation of AI-generated fertilizer recommendations',
      duration: '6:45',
      thumbnail: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=450&fit=crop',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video
      category: language === 'ms' ? 'Cadangan' : 'Recommendations',
      views: '1.8K'
    },
    {
      id: 4,
      title: language === 'ms' ? 'Menggunakan Dashboard & Ciri Premium' : 'Using Dashboard & Premium Features',
      description: language === 'ms'
        ? 'Panduan lengkap dashboard, perbandingan tahun ke tahun, dan ciri-ciri premium'
        : 'Complete dashboard guide, year-over-year comparisons, and premium features',
      duration: '10:20',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video
      category: language === 'ms' ? 'Lanjutan' : 'Advanced',
      views: '1.2K'
    },
    {
      id: 5,
      title: language === 'ms' ? 'Tips & Best Practices' : 'Tips & Best Practices',
      description: language === 'ms'
        ? 'Petua terbaik untuk mengoptimumkan hasil analisis dan meningkatkan produktiviti ladang'
        : 'Best tips to optimize analysis results and improve farm productivity',
      duration: '7:50',
      thumbnail: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=450&fit=crop',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video
      category: language === 'ms' ? 'Petua' : 'Tips',
      views: '2.7K'
    },
    {
      id: 6,
      title: language === 'ms' ? 'Mobile App Tutorial' : 'Mobile App Tutorial',
      description: language === 'ms'
        ? 'Cara menggunakan aplikasi mudah alih CropDrive untuk akses di mana-mana sahaja'
        : 'How to use the CropDrive mobile app for access anywhere',
      duration: '4:30',
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video
      category: language === 'ms' ? 'Mudah Alih' : 'Mobile',
      views: '1.5K'
    }
  ];

  const guideSteps = [
    {
      step: 1,
      title: language === 'ms' ? 'Daftar Akaun' : 'Create Account',
      description: language === 'ms'
        ? 'Daftar dengan email anda dan sahkan akaun melalui email pengesahan'
        : 'Sign up with your email and verify your account via confirmation email',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      icon: <CheckCircle2 className="w-8 h-8 text-green-600" />
    },
    {
      step: 2,
      title: language === 'ms' ? 'Pilih Pelan' : 'Choose Plan',
      description: language === 'ms'
        ? 'Pilih pelan yang sesuai dengan saiz ladang dan keperluan anda'
        : 'Select the plan that fits your farm size and requirements',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop',
      icon: <CheckCircle2 className="w-8 h-8 text-green-600" />
    },
    {
      step: 3,
      title: language === 'ms' ? 'Muat Naik Laporan' : 'Upload Reports',
      description: language === 'ms'
        ? 'Muat naik laporan makmal tanah atau daun dalam format PDF, JPG, atau PNG'
        : 'Upload soil or leaf lab reports in PDF, JPG, or PNG format',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop',
      icon: <CheckCircle2 className="w-8 h-8 text-green-600" />
    },
    {
      step: 4,
      title: language === 'ms' ? 'Dapatkan Analisis AI' : 'Get AI Analysis',
      description: language === 'ms'
        ? 'AI kami akan menganalisis laporan dan memberikan cadangan dalam 30 saat'
        : 'Our AI will analyze your report and provide recommendations within 30 seconds',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      icon: <CheckCircle2 className="w-8 h-8 text-green-600" />
    }
  ];

  const downloadableResources = [
    {
      title: language === 'ms' ? 'Panduan Pengguna Lengkap (PDF)' : 'Complete User Guide (PDF)',
      description: language === 'ms' ? '45 halaman panduan terperinci' : '45-page detailed guide',
      size: '12 MB',
      type: 'PDF'
    },
    {
      title: language === 'ms' ? 'Contoh Laporan Analisis' : 'Sample Analysis Report',
      description: language === 'ms' ? 'Contoh laporan untuk rujukan' : 'Example report for reference',
      size: '3 MB',
      type: 'PDF'
    },
    {
      title: language === 'ms' ? 'Quick Reference Card' : 'Quick Reference Card',
      description: language === 'ms' ? 'Kad rujukan pantas untuk guna harian' : 'Quick reference for daily use',
      size: '500 KB',
      type: 'PDF'
    }
  ];

  const faqs = [
    {
      question: language === 'ms' ? 'Apakah format fail yang disokong?' : 'What file formats are supported?',
      answer: language === 'ms'
        ? 'Kami menyokong fail PDF, JPG, PNG, dan JPEG. Saiz maksimum ialah 10MB setiap fail.'
        : 'We support PDF, JPG, PNG, and JPEG files. Maximum size is 10MB per file.'
    },
    {
      question: language === 'ms' ? 'Berapa lama masa pemprosesan AI?' : 'How long does AI processing take?',
      answer: language === 'ms'
        ? 'Kebanyakan analisis selesai dalam 20-30 saat. Untuk fail yang lebih kompleks atau besar, ia mungkin mengambil masa sehingga 1 minit.'
        : 'Most analyses complete in 20-30 seconds. For more complex or larger files, it may take up to 1 minute.'
    },
    {
      question: language === 'ms' ? 'Adakah data saya selamat dan sulit?' : 'Is my data secure and confidential?',
      answer: language === 'ms'
        ? 'Ya, semua data disulitkan end-to-end dan disimpan dengan selamat di server kami. Kami tidak berkongsi data anda dengan mana-mana pihak ketiga.'
        : 'Yes, all data is end-to-end encrypted and stored securely on our servers. We do not share your data with any third parties.'
    },
    {
      question: language === 'ms' ? 'Bolehkah saya eksport laporan analisis?' : 'Can I export analysis reports?',
      answer: language === 'ms'
        ? 'Ya, anda boleh memuat turun laporan lengkap dalam format PDF dengan semua graf, jadual, dan cadangan.'
        : 'Yes, you can download complete reports in PDF format with all graphs, tables, and recommendations.'
    },
    {
      question: language === 'ms' ? 'Adakah sokongan tersedia dalam Bahasa Malaysia?' : 'Is support available in Bahasa Malaysia?',
      answer: language === 'ms'
        ? 'Ya, kami menawarkan sokongan penuh dalam Bahasa Malaysia dan English melalui WhatsApp, email, dan live chat.'
        : 'Yes, we offer full support in both Bahasa Malaysia and English via WhatsApp, email, and live chat.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-green-600 text-sm font-bold tracking-widest uppercase mb-4 bg-green-50 px-4 py-2 rounded-full">
            {language === 'ms' ? 'Pusat Pembelajaran' : 'Learning Center'}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {language === 'ms' ? 'Tutorial & Panduan' : 'Tutorials & Guides'}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {language === 'ms'
              ? 'Ketahui cara mendapatkan yang terbaik dari CropDrive dengan tutorial video, panduan langkah demi langkah, dan sumber muat turun'
              : 'Learn how to get the most out of CropDrive with video tutorials, step-by-step guides, and downloadable resources'
            }
          </p>
        </motion.div>

        {/* Video Tutorials Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {language === 'ms' ? 'Tutorial Video' : 'Video Tutorials'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoTutorials.map((tutorial, index) => (
              <motion.div
                key={tutorial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer h-full">
                  <div 
                    className="relative aspect-video bg-gray-200 overflow-hidden"
                    onClick={() => setActiveVideo(activeVideo === tutorial.id ? null : tutorial.id)}
                  >
                    {activeVideo === tutorial.id ? (
                      <iframe
                        src={tutorial.videoUrl}
                        title={tutorial.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        <img
                          src={tutorial.thumbnail}
                          alt={tutorial.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                            <Play className="w-8 h-8 text-green-600 ml-1" fill="currentColor" />
                          </div>
                        </div>
                        <div className="absolute top-3 left-3">
                          <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            {tutorial.category}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <span className="bg-black/80 text-white text-xs font-bold px-3 py-1 rounded-full">
                            {tutorial.duration}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      {tutorial.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {tutorial.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Play className="w-3 h-3" />
                        <span>{tutorial.views} {language === 'ms' ? 'tontonan' : 'views'}</span>
                      </span>
                      <span>{tutorial.duration}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Step-by-Step Guide Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-900" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {language === 'ms' ? 'Panduan Langkah Demi Langkah' : 'Step-by-Step Guide'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guideSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 h-full">
                  <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {step.step}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Downloadable Resources */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {language === 'ms' ? 'Sumber Muat Turun' : 'Downloadable Resources'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {downloadableResources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-red-600 font-bold text-sm">{resource.type}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {resource.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{resource.size}</span>
                          <button className="text-blue-600 text-sm font-semibold flex items-center space-x-1 hover:text-blue-700">
                            <span>{language === 'ms' ? 'Muat Turun' : 'Download'}</span>
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
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
              {language === 'ms' ? 'Soalan Lazim (FAQ)' : 'Frequently Asked Questions (FAQ)'}
            </h2>
            <p className="text-gray-600">
              {language === 'ms'
                ? 'Jawapan kepada soalan yang sering ditanya'
                : 'Answers to commonly asked questions'
              }
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start">
                      <span className="text-green-600 mr-3 flex-shrink-0">Q:</span>
                      <span>{faq.question}</span>
                    </h3>
                    <p className="text-gray-600 flex items-start">
                      <span className="text-yellow-500 mr-3 flex-shrink-0 font-bold">A:</span>
                      <span>{faq.answer}</span>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Need More Help CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                {language === 'ms' ? 'Perlukan Bantuan Lanjut?' : 'Need More Help?'}
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                {language === 'ms'
                  ? 'Pasukan sokongan kami sedia membantu anda 24/7 melalui WhatsApp, Email, atau Live Chat'
                  : 'Our support team is ready to help you 24/7 via WhatsApp, Email, or Live Chat'
                }
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button className="px-8 py-4 bg-white text-green-700 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-200 shadow-xl">
                  {language === 'ms' ? 'Hubungi Sokongan' : 'Contact Support'}
                </button>
                <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-colors duration-200">
                  {language === 'ms' ? 'Jadualkan Demo' : 'Schedule Demo'}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
