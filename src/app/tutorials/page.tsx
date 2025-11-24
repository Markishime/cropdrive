'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useAuth } from '@/lib/auth';
import Card, { CardContent } from '@/components/ui/Card';
import { Play, BookOpen, Video, CheckCircle2, Lock, Crown, Zap, GraduationCap, Clock, Users } from 'lucide-react';

export default function TutorialsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useAuth();

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
  const hasPlan = user && user.plan && user.plan !== 'none';

  const videoTutorials = [
    {
      id: 1,
      title: language === 'ms' ? 'Pengenalan Kepada Kelapa Sawit' : 'Introduction to Palm Oil Cultivation',
      description: language === 'ms'
        ? 'Panduan lengkap tentang penanaman kelapa sawit, dari benih hingga tuaian'
        : 'Complete guide to palm oil cultivation, from seedling to harvest',
      duration: '12:45',
      thumbnail: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&h=450&fit=crop',
      videoUrl: 'https://www.youtube.com/embed/8_TtP96qC1Q',
      category: language === 'ms' ? 'Permulaan' : 'Getting Started',
      views: '2.4K'
    },
    {
      id: 2,
      title: language === 'ms' ? 'Analisis Tanah & Keperluan Nutrien' : 'Soil Analysis & Nutrient Requirements',
      description: language === 'ms'
        ? 'Memahami analisis tanah dan keperluan nutrien untuk kelapa sawit'
        : 'Understanding soil analysis and nutrient requirements for oil palm',
      duration: '15:30',
      thumbnail: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=450&fit=crop',
      videoUrl: 'https://www.youtube.com/embed/kOYQaEVz5Gs',
      category: language === 'ms' ? 'Analisis' : 'Analysis',
      views: '3.1K'
    },
    {
      id: 3,
      title: language === 'ms' ? 'Pengurusan Baja Kelapa Sawit' : 'Oil Palm Fertilizer Management',
      description: language === 'ms'
        ? 'Teknik dan strategi penggunaan baja yang betul untuk hasil maksimum'
        : 'Proper fertilizer techniques and strategies for maximum yield',
      duration: '18:22',
      thumbnail: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=450&fit=crop',
      videoUrl: 'https://www.youtube.com/embed/vKXEdccWY7s',
      category: language === 'ms' ? 'Cadangan' : 'Recommendations',
      views: '1.8K'
    },
    {
      id: 4,
      title: language === 'ms' ? 'Diagnosis Penyakit Daun' : 'Leaf Disease Diagnosis',
      description: language === 'ms'
        ? 'Mengenal pasti dan mengrawat penyakit daun kelapa sawit yang biasa'
        : 'Identifying and treating common oil palm leaf diseases',
      duration: '14:50',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
      videoUrl: 'https://www.youtube.com/embed/u4HvF0wQqJU',
      category: language === 'ms' ? 'Lanjutan' : 'Advanced',
      views: '1.2K'
    },
    {
      id: 5,
      title: language === 'ms' ? 'Teknologi Smart Farming' : 'Smart Farming Technology',
      description: language === 'ms'
        ? 'Menggunakan AI dan IoT untuk meningkatkan produktiviti ladang kelapa sawit'
        : 'Using AI and IoT to boost oil palm plantation productivity',
      duration: '16:40',
      thumbnail: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=450&fit=crop',
      videoUrl: 'https://www.youtube.com/embed/WjZc5DkqFqs',
      category: language === 'ms' ? 'Petua' : 'Tips',
      views: '2.7K'
    },
    {
      id: 6,
      title: language === 'ms' ? 'Penuaian & Pengendalian Buah' : 'Harvesting & Fruit Handling',
      description: language === 'ms'
        ? 'Teknik penuaian yang betul dan pengendalian tandan buah segar (TBS)'
        : 'Proper harvesting techniques and fresh fruit bunch (FFB) handling',
      duration: '11:15',
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop',
      videoUrl: 'https://www.youtube.com/embed/Qfr7Sg2_HEU',
      category: language === 'ms' ? 'Tuaian' : 'Harvesting',
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
        ? 'AI kami akan menganalisis laporan dan memberikan cadangan dalam 10-15 minit'
        : 'Our AI will analyze your report and provide recommendations within 10-15 minutes',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      icon: <CheckCircle2 className="w-8 h-8 text-green-600" />
    }
  ];

  const faqs = [
    {
      question: language === 'ms' ? 'Apakah format fail yang disokong?' : 'What file formats are supported?',
      answer: language === 'ms'
        ? 'Kami menyokong Gambar (JPG, PNG), PDF, dan Excel (.xlsx, .xls). Termasuk laporan SPLAB dan farm_test_data. Saiz maksimum ialah 10MB setiap fail.'
        : 'We support Images (JPG, PNG), PDF, and Excel (.xlsx, .xls) files. Including SPLAB and farm_test_data reports. Maximum size is 10MB per file.'
    },
    {
      question: language === 'ms' ? 'Berapa lama masa pemprosesan AI?' : 'How long does AI processing take?',
      answer: language === 'ms'
        ? 'Kebanyakan analisis selesai dalam 10-15 minit. Untuk fail yang lebih kompleks atau besar, ia mungkin mengambil masa lebih lama.'
        : 'Most analyses complete in 10-15 minutes. For more complex or larger files, it may take longer.'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Enhanced Header with Quick Stats */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center sm:text-left"
          >
            <div className="flex items-center justify-center sm:justify-start flex-wrap gap-4 mb-6">
              <div className="text-center sm:text-left">
                <span className="inline-block text-green-200 text-sm font-bold tracking-widest uppercase mb-3 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  {language === 'ms' ? '📚 Pusat Pembelajaran' : '📚 Learning Center'}
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-2 leading-tight">
                  {language === 'ms' ? 'Tutorial &' : 'Tutorials &'} <span className="text-yellow-400">{language === 'ms' ? 'Panduan' : 'Guides'}</span>
                </h1>
                <p className="text-lg sm:text-xl text-white/90 flex items-center justify-center sm:justify-start gap-2">
                  <GraduationCap className="w-5 h-5" />
                  {language === 'ms'
                    ? 'Belajar cara maksimumkan penggunaan CropDrive AI'
                    : 'Learn how to maximize CropDrive AI usage'
                  }
                </p>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Premium Upgrade Banner - Only shown to logged-in users without plans */}
        {user && !hasPlan && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-300 shadow-xl overflow-hidden">
              <CardContent className="p-8 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-yellow-300/20 to-transparent rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-300/20 to-transparent rounded-full blur-3xl -ml-32 -mb-32"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start space-x-2 mb-3">
                        <Crown className="w-6 h-6 text-yellow-600" />
                        <span className="text-yellow-700 font-bold text-sm uppercase tracking-wide">
                          {language === 'ms' ? 'Tingkatkan Akaun Anda' : 'Upgrade Your Account'}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        {language === 'ms' 
                          ? '🚀 Buka Kuasa Penuh AI untuk Ladang Anda' 
                          : '🚀 Unlock Full AI Power for Your Farm'
                        }
                      </h3>
                      <p className="text-gray-700 text-lg mb-4">
                        {language === 'ms'
                          ? 'Dapatkan analisis tanah AI, cadangan baja pintar, dan banyak lagi!'
                          : 'Get AI soil analysis, smart fertilizer recommendations, and much more!'
                        }
                      </p>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-green-700">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-semibold">
                            {language === 'ms' ? 'Analisis 10-15 minit' : '10-15 min analysis'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-green-700">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-semibold">
                            {language === 'ms' ? 'Laporan terperinci' : 'Detailed reports'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-green-700">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-semibold">
                            {language === 'ms' ? 'Sokongan 24/7' : '24/7 support'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center space-y-3">
                      <Link href="/pricing">
                        <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-lg shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                          <Zap className="w-5 h-5" />
                          <span>{language === 'ms' ? 'Pilih Pelan Sekarang' : 'Choose Plan Now'}</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

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
                    onClick={() => {
                      if (activeVideo !== tutorial.id && tutorial.videoUrl && !tutorial.videoUrl.includes('VIDEO_ID')) {
                        setActiveVideo(tutorial.id);
                      }
                    }}
                  >
                    {activeVideo === tutorial.id && tutorial.videoUrl && !tutorial.videoUrl.includes('VIDEO_ID') ? (
                      <div className="relative w-full h-full">
                        <iframe
                          key={tutorial.id}
                          src={`${tutorial.videoUrl}?rel=0&modestbranding=1&autoplay=1&enablejsapi=1`}
                          title={tutorial.title}
                          className="w-full h-full absolute top-0 left-0"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          loading="lazy"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveVideo(null);
                          }}
                          className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 z-10 transition-colors"
                          aria-label={language === 'ms' ? 'Tutup video' : 'Close video'}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <img
                          src={tutorial.thumbnail}
                          alt={tutorial.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                          {tutorial.videoUrl && !tutorial.videoUrl.includes('VIDEO_ID') ? (
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl cursor-pointer">
                              <Play className="w-8 h-8 text-green-600 ml-1" fill="currentColor" />
                            </div>
                          ) : (
                            <div className="text-center px-4">
                              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-2xl">
                                <Lock className="w-8 h-8 text-white" />
                              </div>
                              <p className="text-white text-sm font-semibold">
                                {language === 'ms' ? 'Video Belum Tersedia' : 'Video Not Available'}
                              </p>
                            </div>
                          )}
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
