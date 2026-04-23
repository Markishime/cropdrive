'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faCircleQuestion,
  faMessage,
  faBookOpen,
  faMagnifyingGlass,
  faChevronDown,
  faChevronUp,
  faLeaf,
  faBolt,
  faChartColumn,
  faUsers,
  faShieldHalved,
  faClock,
  faCircleCheck,
  faCircleExclamation,
  faEnvelope,
  faPhone,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';
import { useAuth } from '@/lib/auth';
import SupportForm from '@/components/SupportForm';
import toast from 'react-hot-toast';

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
  icon: IconDefinition;
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
  { id: 'getting-started', label: 'Getting Started', labelMs: 'Bermula', icon: faBookOpen },
  { id: 'analysis', label: 'Analysis & Results', labelMs: 'Analisis & Keputusan', icon: faChartColumn },
  { id: 'billing', label: 'Subscription & Billing', labelMs: 'Langganan & Bil', icon: faShieldHalved },
  { id: 'technical', label: 'Technical', labelMs: 'Teknikal', icon: faBolt },
  { id: 'troubleshooting', label: 'Troubleshooting', labelMs: 'Penyelesaian Masalah', icon: faCircleExclamation }
];

interface ContactFormData {
  name: string;
  email: string;
  organization: string;
  role: string;
  message: string;
}

export default function HelpCenterPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQs, setExpandedFAQs] = useState<Set<number>>(new Set());
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactFormData, setContactFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    organization: '',
    role: '',
    message: '',
  });

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
  const copy = (en: string, ms: string) => language === 'id' ? toIndonesianText(ms) : language === 'ms' ? ms : en;
  const faqQuestion = (faq: FAQ) => copy(faq.question, faq.questionMs);
  const faqAnswer = (faq: FAQ) => copy(faq.answer, faq.answerMs);
  const categoryLabel = (category?: Category) => category ? copy(category.label, category.labelMs) : '';

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
      faqQuestion(faq).toLowerCase().includes(searchQuery.toLowerCase()) ||
      faqAnswer(faq).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactFormData.name || !contactFormData.email || !contactFormData.message) {
      toast.error(copy('Please fill in all required fields', 'Sila isi semua medan yang diperlukan'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactFormData.email)) {
      toast.error(copy('Please enter a valid email address', 'Sila masukkan alamat e-mel yang sah'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactFormData),
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        toast.success(copy('Your message has been sent! We\'ll get back to you soon.', 'Mesej anda telah dihantar! Kami akan menghubungi anda tidak lama lagi.'),
          { duration: 5000 }
        );
        setContactFormData({
          name: '',
          email: '',
          organization: '',
          role: '',
          message: '',
        });
      } else {
        throw new Error(data.error || data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(copy('Failed to send message. Please try again or email us directly.', 'Gagal menghantar mesej. Sila cuba lagi atau e-mel kami terus.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
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
              {copy('Help', 'Pusat')} <span className="text-yellow-400">{copy('Center', 'Bantuan')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {copy('Get help and support for the CropDrive smart AI platform. Find answers to frequently asked questions or contact our support team.', 'Dapatkan bantuan dan sokongan untuk platform AI pintar CropDrive. Cari jawapan kepada soalan lazim atau hubungi pasukan sokongan kami.')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Features Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-24"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              {copy('What Can We Help You With?', 'Apa Yang Boleh Kami Bantu?')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {copy('The CropDrive platform offers comprehensive support for all your palm oil farm analysis needs.', 'Platform CropDrive menawarkan sokongan komprehensif untuk semua keperluan analisis ladang kelapa sawit anda.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: faLeaf,
                title: language === 'ms' ? 'Analisis Tanah & Daun' : 'Soil & Leaf Analysis',
                description: language === 'ms'
                  ? 'Bantuan dengan analisis kesihatan tanah dan pengesanan penyakit daun.'
                  : 'Help with soil health analysis and leaf disease detection.'
              },
              {
                icon: faChartColumn,
                title: language === 'ms' ? 'Laporan & Keputusan' : 'Reports & Results',
                description: language === 'ms'
                  ? 'Memahami dan mentafsir laporan analisis anda.'
                  : 'Understanding and interpreting your analysis reports.'
              },
              {
                icon: faUsers,
                title: language === 'ms' ? 'Akaun & Langganan' : 'Account & Subscription',
                description: language === 'ms'
                  ? 'Pengurusan akaun, pengebilan, dan pilihan langganan.'
                  : 'Account management, billing, and subscription options.'
              },
              {
                icon: faBolt,
                title: language === 'ms' ? 'Teknikal' : 'Technical',
                description: language === 'ms'
                  ? 'Sokongan teknikal dan penyelesaian masalah.'
                  : 'Technical support and troubleshooting.'
              },
              {
                icon: faShieldHalved,
                title: language === 'ms' ? 'Keselamatan & Privasi' : 'Security & Privacy',
                description: language === 'ms'
                  ? 'Maklumat tentang keselamatan data dan privasi.'
                  : 'Information about data security and privacy.'
              },
              {
                icon: faClock,
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
                className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <FontAwesomeIcon icon={feature.icon} className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-24"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              {copy('Frequently Asked Questions', 'Soalan Lazim')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {copy('Find answers to the most frequently asked questions.', 'Cari jawapan kepada soalan yang paling kerap ditanya.')}
            </p>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-end">
              {/* Search */}
              <div className="flex-1 w-full">
                <label htmlFor="faq-search" className="block text-sm font-medium text-gray-700 mb-2">
                  {copy('Search Questions', 'Cari Soalan')}
                </label>
                <div className="relative">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    id="faq-search"
                    type="text"
                    placeholder={copy('Search questions...', 'Cari soalan...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="md:w-64 w-full">
                <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  {copy('Category', 'Kategori')}
                </label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all bg-white"
                >
                  <option value="all">
                    {copy('All Categories', 'Semua Kategori')}
                  </option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {categoryLabel(category)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-3 sm:space-y-4">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1 pr-4">
                    {(() => {
                      const category = categories.find(cat => cat.id === faq.category);
                      const icon = category?.icon || faCircleQuestion;
                      return <FontAwesomeIcon icon={icon} className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mt-1 flex-shrink-0" />;
                    })()}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">
                        {faqQuestion(faq)}
                      </h3>
                      <div className="flex items-center">
                        <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                          {(() => {
                            const category = categories.find(cat => cat.id === faq.category);
                            return categoryLabel(category);
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {expandedFAQs.has(index) ? (
                    <FontAwesomeIcon icon={faChevronUp} className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <FontAwesomeIcon icon={faChevronDown} className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>

                {expandedFAQs.has(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-5 sm:px-6 pb-4 sm:pb-5"
                  >
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        {faqAnswer(faq)}
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <FontAwesomeIcon icon={faCircleQuestion} className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                {copy('No Questions Found', 'Tiada Soalan Dijumpai')}
              </h3>
              <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto">
                {copy('Try searching with different keywords.', 'Cuba cari dengan kata kunci yang berbeza.')}
              </p>
            </div>
          )}
        </motion.section>

        {/* Contact Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-24"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              {copy('Contact Us', 'Hubungi Kami')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {copy("Can't find the answer you're looking for? Our support team is here to help.", 'Tidak menemui jawapan yang anda cari? Pasukan sokongan kami sedia membantu.')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
            {/* Contact Information */}
            <div className="space-y-6 sm:space-y-8">
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6">
                  {copy('Contact Information', 'Maklumat Hubungan')}
                </h3>

                <div className="space-y-5 sm:space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {copy('Email', 'Emel')}
                      </h4>
                      <p className="text-gray-700 font-medium">support@cropdrive.com</p>
                      <p className="text-sm text-gray-500 mt-1.5">
                        {copy('We respond within 12-16 hours', 'Kami membalas dalam 12-16 jam')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faPhone} className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {copy('Phone', 'Telefon')}
                      </h4>
                      <p className="text-gray-700 font-medium">+60 3-1234 5678</p>
                      <p className="text-sm text-gray-500 mt-1.5">
                        {copy('Monday - Friday, 9:00 AM - 6:00 PM MST', 'Isnin - Jumaat, 9:00 AM - 6:00 PM MST')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faLocationDot} className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {copy('Address', 'Alamat')}
                      </h4>
                      <p className="text-gray-700 font-medium">
                        CropDrive OP Advisor™<br />
                        Kuala Lumpur, Malaysia
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Times */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 sm:p-8 border-2 border-green-200 shadow-md">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5">
                  {copy('Response Times', 'Masa Respons')}
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between bg-white/60 rounded-lg px-4 py-3">
                    <span className="text-sm sm:text-base text-gray-700 font-medium">
                      {copy('Email Support', 'Sokongan Emel')}
                    </span>
                    <span className="font-bold text-green-700 text-sm sm:text-base">
                      {copy('12-16 hours', '12-16 jam')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white/60 rounded-lg px-4 py-3">
                    <span className="text-sm sm:text-base text-gray-700 font-medium">
                      {copy('AI Analysis', 'Analisis AI')}
                    </span>
                    <span className="font-bold text-green-700 text-sm sm:text-base">
                      {copy('2-15 minutes', '2-15 minit')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white/60 rounded-lg px-4 py-3">
                    <span className="text-sm sm:text-base text-gray-700 font-medium">
                      {language === 'ms' ? 'Isu Kritikal' : 'Critical Issues'}
                    </span>
                    <span className="font-bold text-red-700 text-sm sm:text-base">
                      {language === 'ms' ? '4-6 jam' : '4-6 hours'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form or Support Form */}
            <div>
              {!authLoading && !user ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100"
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                    {language === 'ms' ? 'Hantar Mesej' : 'Send Message'}
                  </h3>
                  <form onSubmit={handleContactSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="contact-name" className="block text-sm font-semibold text-gray-700 mb-2">
                          {language === 'ms' ? 'Nama Penuh' : 'Full Name'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="contact-name"
                          name="name"
                          value={contactFormData.name}
                          onChange={handleContactInputChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          placeholder={language === 'ms' ? 'Masukkan nama anda' : 'Enter your name'}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="block text-sm font-semibold text-gray-700 mb-2">
                          {language === 'ms' ? 'E-mel' : 'Email'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="contact-email"
                          name="email"
                          value={contactFormData.email}
                          onChange={handleContactInputChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          placeholder="you@example.com"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="contact-organization" className="block text-sm font-semibold text-gray-700 mb-2">
                          {language === 'ms' ? 'Organisasi (pilihan)' : 'Organization (optional)'}
                        </label>
                        <input
                          type="text"
                          id="contact-organization"
                          name="organization"
                          value={contactFormData.organization}
                          onChange={handleContactInputChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          placeholder={language === 'ms' ? 'Nama syarikat atau ladang' : 'Company or farm name'}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-role" className="block text-sm font-semibold text-gray-700 mb-2">
                          {language === 'ms' ? 'Peranan Anda' : 'Your Role'}
                        </label>
                        <input
                          type="text"
                          id="contact-role"
                          name="role"
                          value={contactFormData.role}
                          onChange={handleContactInputChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          placeholder={language === 'ms' ? 'Contoh: Petani, NGO, Makmal' : 'e.g. Farmer, NGO, Lab'}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block text-sm font-semibold text-gray-700 mb-2">
                        {language === 'ms' ? 'Mesej Anda' : 'Your Message'} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        value={contactFormData.message}
                        onChange={handleContactInputChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base min-h-[140px] resize-y focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        placeholder={language === 'ms' ? 'Bagaimana kami boleh membantu anda?' : 'How can we help you?'}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold text-base shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {language === 'ms' ? 'Menghantar...' : 'Sending...'}
                        </>
                      ) : (
                        language === 'ms' ? 'Hantar Mesej' : 'Send Message'
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <SupportForm locale={currentLanguage} />
              )}
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
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-12">
            {language === 'ms' ? 'Pautan Berguna' : 'Quick Links'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                href: '/pricing',
                label: language === 'ms' ? 'Harga' : 'Pricing',
                icon: faCircleCheck
              },
              {
                href: '/features',
                label: language === 'ms' ? 'Ciri-ciri' : 'Features',
                icon: faBolt
              },
              {
                href: '/tutorials',
                label: language === 'ms' ? 'Tutorial' : 'Tutorials',
                icon: faBookOpen
              },
              {
                href: '/contact',
                label: language === 'ms' ? 'Hubungi Kami' : 'Contact Us',
                icon: faMessage
              }
            ].map((link, index) => (
              <motion.a
                key={link.href}
                href={link.href}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="bg-white rounded-xl shadow-md p-5 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col items-center border border-gray-100 group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-green-600 transition-colors">
                  <FontAwesomeIcon icon={link.icon} className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <span className="font-semibold text-gray-900 text-sm sm:text-base">{link.label}</span>
              </motion.a>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
