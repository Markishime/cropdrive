'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useAuth } from '@/lib/auth';
import Card, { CardContent } from '@/components/ui/Card';
import { Play, BookOpen, Video, CheckCircle2, Lock, Crown, Zap } from 'lucide-react';

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
      videoUrl: 'https://www.youtube.com/embed/WEmnzJQ59_Y', // Palm Oil Production Documentary
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
      videoUrl: 'https://www.youtube.com/embed/OUoKOmOH9Gk', // Soil Testing & Analysis for Agriculture
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
      videoUrl: 'https://www.youtube.com/embed/A6Vap76fpH4', // Palm Oil Fertilizer Management
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
      videoUrl: 'https://www.youtube.com/embed/KcxKly5qlOI', // Plant Disease Diagnosis
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
      videoUrl: 'https://www.youtube.com/embed/SaKx1OqELmo', // Smart Agriculture Technology
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
      videoUrl: 'https://www.youtube.com/embed/r9CnVDJFiYs', // Palm Oil Harvesting Process
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
        ? 'AI kami akan menganalisis laporan dan memberikan cadangan dalam 1-2 minit'
        : 'Our AI will analyze your report and provide recommendations within 1-2 minutes',
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
        ? 'Kebanyakan analisis selesai dalam 1-2 minit. Untuk fail yang lebih kompleks atau besar, ia mungkin mengambil masa sehingga 3 minit.'
        : 'Most analyses complete in 1-2 minutes. For more complex or larger files, it may take up to 3 minutes.'
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
                            {language === 'ms' ? 'Analisis 1-2 minit' : '1-2 min analysis'}
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
                      <p className="text-sm text-gray-600">
                        {language === 'ms' 
                          ? 'Mulai dari RM 99/bulan sahaja' 
                          : 'Starting from RM 99/month only'
                        }
                      </p>
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
