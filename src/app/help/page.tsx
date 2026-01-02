'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  MessageSquare,
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Leaf,
  Zap,
  BarChart3,
  Users,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import SupportForm from '@/components/SupportForm';

interface FAQ {
  question: string;
  questionMs: string;
  answer: string;
  answerMs: string;
  category: string;
}

interface Category {
  id: string;
  label: string;
  labelMs: string;
  icon: React.ComponentType<{ className?: string }>;
}

const faqs: FAQ[] = [
  // Getting Started
  {
    question: "How do I get started with CropDrive?",
    questionMs: "Bagaimana saya boleh bermula dengan CropDrive?",
    answer: "To get started, create an account and choose a subscription plan that fits your needs. You can then upload images of your palm oil farm for analysis. Our AI will process the images and provide detailed insights about soil health, leaf condition, and recommendations for improvement.",
    answerMs: "Untuk bermula, buat akaun dan pilih pelan langganan yang sesuai dengan keperluan anda. Anda boleh memuat naik gambar ladang kelapa sawit anda untuk analisis. AI kami akan memproses gambar dan memberikan pandangan terperinci tentang kesihatan tanah, keadaan daun, dan cadangan untuk penambahbaikan.",
    category: "getting-started"
  },
  {
    question: "What types of analysis can CropDrive perform?",
    questionMs: "Apakah jenis analisis yang boleh dilakukan oleh CropDrive?",
    answer: "CropDrive specializes in palm oil farm analysis including soil health assessment, leaf disease detection, nutrient deficiency identification, and yield optimization recommendations. We also provide weather impact analysis and seasonal farming advice.",
    answerMs: "CropDrive khusus dalam analisis ladang kelapa sawit termasuk penilaian kesihatan tanah, pengesanan penyakit daun, pengenalpastian kekurangan nutrien, dan cadangan pengoptimuman hasil. Kami juga menyediakan analisis impak cuaca dan nasihat pertanian bermusim.",
    category: "getting-started"
  },

  // Analysis & Results
  {
    question: "How long does analysis take?",
    questionMs: "Berapa lama analisis mengambil masa?",
    answer: "Most analyses are completed within 2-5 minutes. Complex analyses with multiple images or detailed soil testing may take up to 15 minutes. You'll receive an email notification when your analysis is complete.",
    answerMs: "Kebanyakan analisis selesai dalam masa 2-5 minit. Analisis kompleks dengan pelbagai gambar atau ujian tanah terperinci mungkin mengambil masa sehingga 15 minit. Anda akan menerima pemberitahuan emel apabila analisis anda selesai.",
    category: "analysis"
  },
  {
    question: "Can I analyze both soil and leaf samples together?",
    questionMs: "Bolehkah saya menganalisis sampel tanah dan daun bersama-sama?",
    answer: "Yes! You can upload multiple images including both soil and leaf samples in a single analysis. Our AI will process all images and provide comprehensive recommendations covering both soil health and plant condition.",
    answerMs: "Ya! Anda boleh memuat naik pelbagai gambar termasuk sampel tanah dan daun dalam satu analisis. AI kami akan memproses semua gambar dan memberikan cadangan komprehensif meliputi kesihatan tanah dan keadaan tumbuhan.",
    category: "analysis"
  },

  // Subscription & Billing
  {
    question: "What subscription plans are available?",
    questionMs: "Apakah pelan langganan yang tersedia?",
    answer: "We offer three plans: Smart (5 analyses/month), Pro (25 analyses/month), and Precision (unlimited analyses/month). Each plan includes different levels of support and advanced features. Visit our pricing page for detailed comparisons.",
    answerMs: "Kami menawarkan tiga pelan: Smart (5 analisis/bulan), Pro (25 analisis/bulan), dan Precision (analisis tanpa had/bulan). Setiap pelan termasuk tahap sokongan dan ciri lanjutan yang berbeza. Lawati halaman harga kami untuk perbandingan terperinci.",
    category: "billing"
  },
  {
    question: "Can I change my subscription plan?",
    questionMs: "Bolehkah saya menukar pelan langganan saya?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, or at the next billing cycle for downgrades. Visit your account settings or contact support for assistance.",
    answerMs: "Ya, anda boleh menaik taraf atau menurunkan pelan anda pada bila-bila masa. Perubahan berkuat kuasa serta-merta untuk naik taraf, atau pada kitaran bil seterusnya untuk turun taraf. Lawati tetapan akaun anda atau hubungi sokongan untuk bantuan.",
    category: "billing"
  },

  // Technical Support
  {
    question: "What image formats are supported?",
    questionMs: "Apakah format gambar yang disokong?",
    answer: "We support JPG, JPEG, PNG, and WebP formats. Images should be at least 800x600 pixels for best results. Maximum file size is 10MB per image. For optimal analysis, ensure good lighting and clear focus on the subject.",
    answerMs: "Kami menyokong format JPG, JPEG, PNG, dan WebP. Gambar harus sekurang-kurangnya 800x600 piksel untuk hasil terbaik. Saiz fail maksimum ialah 10MB setiap gambar. Untuk analisis optimum, pastikan pencahayaan yang baik dan fokus jelas pada subjek.",
    category: "technical"
  },
  {
    question: "Is my data secure?",
    questionMs: "Adakah data saya selamat?",
    answer: "Yes, we take data security seriously. All images and analysis data are encrypted and stored securely. We comply with GDPR and local data protection regulations. Your farm data is never shared with third parties without your explicit consent.",
    answerMs: "Ya, kami mengambil keselamatan data dengan serius. Semua gambar dan data analisis dienkripsi dan disimpan dengan selamat. Kami mematuhi GDPR dan peraturan perlindungan data tempatan. Data ladang anda tidak pernah dikongsi dengan pihak ketiga tanpa persetujuan eksplisit anda.",
    category: "technical"
  },

  // Troubleshooting
  {
    question: "Why did my analysis fail?",
    questionMs: "Mengapa analisis saya gagal?",
    answer: "Analysis can fail due to poor image quality, insufficient lighting, or images that are too blurry. Make sure your images are well-lit, in focus, and show the subject clearly. If issues persist, contact our support team with details about your analysis.",
    answerMs: "Analisis boleh gagal disebabkan kualiti gambar yang buruk, pencahayaan yang tidak mencukupi, atau gambar yang terlalu kabur. Pastikan gambar anda terang, fokus, dan menunjukkan subjek dengan jelas. Jika masalah berterusan, hubungi pasukan sokongan kami dengan butiran tentang analisis anda.",
    category: "troubleshooting"
  },
  {
    question: "I forgot my password. How can I reset it?",
    questionMs: "Saya lupa kata laluan saya. Bagaimana saya boleh menetapkannya semula?",
    answer: "Click the 'Forgot Password' link on the login page. Enter your email address and we'll send you a password reset link. Follow the instructions in the email to create a new password.",
    answerMs: "Klik pautan 'Lupa Kata Laluan' pada halaman log masuk. Masukkan alamat emel anda dan kami akan menghantar pautan tetapan semula kata laluan. Ikuti arahan dalam emel untuk membuat kata laluan baharu.",
    category: "troubleshooting"
  }
];

const categories: Category[] = [
  { id: 'getting-started', label: 'Getting Started', labelMs: 'Bermula', icon: BookOpen },
  { id: 'analysis', label: 'Analysis & Results', labelMs: 'Analisis & Keputusan', icon: BarChart3 },
  { id: 'billing', label: 'Subscription & Billing', labelMs: 'Langganan & Bil', icon: Shield },
  { id: 'technical', label: 'Technical', labelMs: 'Teknikal', icon: Zap },
  { id: 'troubleshooting', label: 'Troubleshooting', labelMs: 'Penyelesaian Masalah', icon: AlertCircle }
];

export default function HelpCenterPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ms'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQs, setExpandedFAQs] = useState<Set<number>>(new Set());

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

  const { language } = useTranslation(mounted ? currentLanguage : 'en');

  const toggleFAQ = (index: number) => {
    const newExpanded = new Set(expandedFAQs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFAQs(newExpanded);
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.questionMs.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answerMs.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <HelpCircle className="w-16 h-16 text-white mr-4" />
              <h1 className="text-4xl sm:text-5xl font-black text-white">
                {language === 'ms' ? 'Pusat Bantuan' : 'Help Center'}
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              {language === 'ms'
                ? 'Dapatkan bantuan dan sokongan untuk platform AI pintar CropDrive. Cari jawapan kepada soalan lazim atau hubungi pasukan sokongan kami.'
                : 'Get help and support for the CropDrive smart AI platform. Find answers to frequently asked questions or contact our support team.'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Features Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {language === 'ms' ? 'Apa Yang Boleh Kami Bantu?' : 'What Can We Help You With?'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {language === 'ms'
                ? 'Platform CropDrive menawarkan sokongan komprehensif untuk semua keperluan analisis ladang kelapa sawit anda.'
                : 'The CropDrive platform offers comprehensive support for all your palm oil farm analysis needs.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: language === 'ms' ? 'Analisis Tanah & Daun' : 'Soil & Leaf Analysis',
                description: language === 'ms'
                  ? 'Bantuan dengan analisis kesihatan tanah dan pengesanan penyakit daun.'
                  : 'Help with soil health analysis and leaf disease detection.'
              },
              {
                icon: BarChart3,
                title: language === 'ms' ? 'Laporan & Keputusan' : 'Reports & Results',
                description: language === 'ms'
                  ? 'Memahami dan mentafsir laporan analisis anda.'
                  : 'Understanding and interpreting your analysis reports.'
              },
              {
                icon: Users,
                title: language === 'ms' ? 'Akaun & Langganan' : 'Account & Subscription',
                description: language === 'ms'
                  ? 'Pengurusan akaun, pengebilan, dan pilihan langganan.'
                  : 'Account management, billing, and subscription options.'
              },
              {
                icon: Zap,
                title: language === 'ms' ? 'Teknikal' : 'Technical',
                description: language === 'ms'
                  ? 'Sokongan teknikal dan penyelesaian masalah.'
                  : 'Technical support and troubleshooting.'
              },
              {
                icon: Shield,
                title: language === 'ms' ? 'Keselamatan & Privasi' : 'Security & Privacy',
                description: language === 'ms'
                  ? 'Maklumat tentang keselamatan data dan privasi.'
                  : 'Information about data security and privacy.'
              },
              {
                icon: Clock,
                title: language === 'ms' ? 'Masa Respons' : 'Response Times',
                description: language === 'ms'
                  ? 'Jangkaan masa untuk sokongan dan analisis.'
                  : 'Expected times for support and analysis.'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <feature.icon className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {language === 'ms' ? 'Soalan Lazim' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-lg text-gray-600">
              {language === 'ms'
                ? 'Cari jawapan kepada soalan yang paling kerap ditanya.'
                : 'Find answers to the most frequently asked questions.'
              }
            </p>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={language === 'ms' ? 'Cari soalan...' : 'Search questions...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="md:w-64">
                <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ms' ? 'Kategori' : 'Category'}
                </label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                >
                  <option value="all">
                    {language === 'ms' ? 'Semua Kategori' : 'All Categories'}
                  </option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {language === 'ms' ? category.labelMs : category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    {(() => {
                      const category = categories.find(cat => cat.id === faq.category);
                      const IconComponent = category?.icon || HelpCircle;
                      return <IconComponent className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />;
                    })()}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {language === 'ms' ? faq.questionMs : faq.question}
                      </h3>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {(() => {
                            const category = categories.find(cat => cat.id === faq.category);
                            return language === 'ms' ? category?.labelMs : category?.label;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {expandedFAQs.has(index) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {expandedFAQs.has(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-4"
                  >
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-gray-700 leading-relaxed">
                        {language === 'ms' ? faq.answerMs : faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {language === 'ms' ? 'Tiada Soalan Dijumpai' : 'No Questions Found'}
              </h3>
              <p className="text-gray-600">
                {language === 'ms'
                  ? 'Cuba cari dengan kata kunci yang berbeza.'
                  : 'Try searching with different keywords.'
                }
              </p>
            </div>
          )}
        </motion.section>

        {/* Contact Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {language === 'ms' ? 'Hubungi Kami' : 'Contact Us'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {language === 'ms'
                ? 'Tidak menemui jawapan yang anda cari? Pasukan sokongan kami sedia membantu.'
                : "Can't find the answer you're looking for? Our support team is here to help."
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {language === 'ms' ? 'Maklumat Hubungan' : 'Contact Information'}
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {language === 'ms' ? 'Emel' : 'Email'}
                      </h4>
                      <p className="text-gray-600">support@cropdrive.com</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {language === 'ms'
                          ? 'Kami membalas dalam 12-16 jam'
                          : 'We respond within 12-16 hours'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {language === 'ms' ? 'Telefon' : 'Phone'}
                      </h4>
                      <p className="text-gray-600">+60 3-1234 5678</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {language === 'ms'
                          ? 'Isnin - Jumaat, 9:00 AM - 6:00 PM MST'
                          : 'Monday - Friday, 9:00 AM - 6:00 PM MST'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {language === 'ms' ? 'Alamat' : 'Address'}
                      </h4>
                      <p className="text-gray-600">
                        CropDrive OP Advisor™<br />
                        Kuala Lumpur, Malaysia
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Times */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border border-green-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {language === 'ms' ? 'Masa Respons' : 'Response Times'}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">
                      {language === 'ms' ? 'Sokongan Emel' : 'Email Support'}
                    </span>
                    <span className="font-semibold text-green-700">
                      {language === 'ms' ? '12-16 jam' : '12-16 hours'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">
                      {language === 'ms' ? 'Analisis AI' : 'AI Analysis'}
                    </span>
                    <span className="font-semibold text-green-700">
                      {language === 'ms' ? '2-15 minit' : '2-15 minutes'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">
                      {language === 'ms' ? 'Isu Kritikal' : 'Critical Issues'}
                    </span>
                    <span className="font-semibold text-red-700">
                      {language === 'ms' ? '4-6 jam' : '4-6 hours'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <SupportForm locale={currentLanguage} />
            </div>
          </div>
        </motion.section>

        {/* Quick Links */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {language === 'ms' ? 'Pautan Berguna' : 'Quick Links'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                href: '/pricing',
                label: language === 'ms' ? 'Harga' : 'Pricing',
                icon: CheckCircle
              },
              {
                href: '/features',
                label: language === 'ms' ? 'Ciri-ciri' : 'Features',
                icon: Zap
              },
              {
                href: '/tutorials',
                label: language === 'ms' ? 'Tutorial' : 'Tutorials',
                icon: BookOpen
              },
              {
                href: '/contact',
                label: language === 'ms' ? 'Hubungi Kami' : 'Contact Us',
                icon: MessageSquare
              }
            ].map((link, index) => (
              <motion.a
                key={link.href}
                href={link.href}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col items-center"
              >
                <link.icon className="w-8 h-8 text-green-600 mb-3" />
                <span className="font-semibold text-gray-900">{link.label}</span>
              </motion.a>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
