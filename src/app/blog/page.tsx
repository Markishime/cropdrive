'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faBookOpen,
  faBolt,
  faLeaf,
  faChartLine,
  faChartColumn,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation, getCurrentLanguage } from '@/i18n';

interface BlogPost {
  id: string;
  title: string;
  titleMs: string;
  excerpt: string;
  excerptMs: string;
  content: string;
  contentMs: string;
  author: string;
  authorMs: string;
  date: string;
  readTime: string;
  readTimeMs: string;
  category: string;
  categoryMs: string;
  tags: string[];
  tagsMs: string[];
  image: string;
  featured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: 'ai-revolution-palm-oil',
    title: 'The AI Revolution in Palm Oil Farming: How Technology is Transforming Agriculture',
    titleMs: 'Revolusi AI dalam Pertanian Kelapa Sawit: Bagaimana Teknologi Mengubah Pertanian',
    excerpt: 'Discover how artificial intelligence is revolutionizing palm oil farming practices, improving yields and sustainability through data-driven insights.',
    excerptMs: 'Ketahui bagaimana kecerdasan buatan merevolusikan amalan pertanian kelapa sawit, meningkatkan hasil dan kelestarian melalui pandangan berasaskan data.',
    content: 'Palm oil farming has traditionally relied on manual observation and experience-based decision making. However, the integration of artificial intelligence is transforming this industry in unprecedented ways...',
    contentMs: 'Pertanian kelapa sawit secara tradisional bergantung pada pemerhatian manual dan membuat keputusan berdasarkan pengalaman. Walau bagaimanapun, integrasi kecerdasan buatan mengubah industri ini dengan cara yang belum pernah terjadi sebelumnya...',
    author: 'Dr. Sarah Chen',
    authorMs: 'Dr. Sarah Chen',
    date: '2025-01-15',
    readTime: '8 min read',
    readTimeMs: '8 minit bacaan',
    category: 'Technology',
    categoryMs: 'Teknologi',
    tags: ['AI', 'Palm Oil', 'Agriculture', 'Sustainability'],
    tagsMs: ['AI', 'Kelapa Sawit', 'Pertanian', 'Kelestarian'],
    image: '/images/blog/ai-palm-oil.jpg',
    featured: true
  },
  {
    id: 'soil-health-analysis',
    title: 'Understanding Soil Health: The Foundation of Successful Palm Oil Cultivation',
    titleMs: 'Memahami Kesihatan Tanah: Asas Penanaman Kelapa Sawit yang Berjaya',
    excerpt: 'Learn about the critical role of soil health in palm oil production and how modern analysis techniques can optimize farming practices.',
    excerptMs: 'Pelajari tentang peranan kritikal kesihatan tanah dalam pengeluaran kelapa sawit dan bagaimana teknik analisis moden boleh mengoptimumkan amalan pertanian.',
    content: 'Soil health is the cornerstone of successful palm oil cultivation. Understanding soil composition, nutrient levels, and microbial activity is essential for maximizing yields...',
    contentMs: 'Kesihatan tanah adalah asas kejayaan penanaman kelapa sawit. Memahami komposisi tanah, tahap nutrien, dan aktiviti mikrob adalah penting untuk memaksimumkan hasil...',
    author: 'Prof. Ahmad Razak',
    authorMs: 'Prof. Ahmad Razak',
    date: '2025-01-10',
    readTime: '6 min read',
    readTimeMs: '6 minit bacaan',
    category: 'Agriculture',
    categoryMs: 'Pertanian',
    tags: ['Soil Health', 'Palm Oil', 'Farming', 'Nutrition'],
    tagsMs: ['Kesihatan Tanah', 'Kelapa Sawit', 'Pertanian', 'Nutrisi'],
    image: '/images/blog/soil-health.jpg',
    featured: true
  },
  {
    id: 'sustainable-palm-oil',
    title: 'Sustainable Palm Oil: Balancing Productivity and Environmental Responsibility',
    titleMs: 'Kelapa Sawit Lestari: Menyeimbangkan Produktiviti dan Tanggungjawab Alam Sekitar',
    excerpt: 'Explore the latest developments in sustainable palm oil production and how technology is helping farmers meet environmental standards.',
    excerptMs: 'Terokai perkembangan terkini dalam pengeluaran kelapa sawit lestari dan bagaimana teknologi membantu petani memenuhi standard alam sekitar.',
    content: 'The palm oil industry faces increasing pressure to adopt sustainable practices. Modern technology and innovative farming techniques are making it possible to maintain high productivity...',
    contentMs: 'Industri kelapa sawit menghadapi tekanan yang semakin meningkat untuk mengamalkan amalan lestari. Teknologi moden dan teknik pertanian inovatif menjadikannya mungkin untuk mengekalkan produktiviti yang tinggi...',
    author: 'Dr. Maria Santos',
    authorMs: 'Dr. Maria Santos',
    date: '2025-01-05',
    readTime: '7 min read',
    readTimeMs: '7 minit bacaan',
    category: 'Sustainability',
    categoryMs: 'Kelestarian',
    tags: ['Sustainability', 'Environment', 'Palm Oil', 'Certification'],
    tagsMs: ['Kelestarian', 'Alam Sekitar', 'Kelapa Sawit', 'Pensijilan'],
    image: '/images/blog/sustainable-palm.jpg',
    featured: true
  },
  {
    id: 'disease-detection-ai',
    title: 'Early Disease Detection: How AI is Saving Palm Oil Crops',
    titleMs: 'Pengesanan Penyakit Awal: Bagaimana AI Menyelamatkan Tanaman Kelapa Sawit',
    excerpt: 'Discover how artificial intelligence is enabling early detection of palm oil diseases, preventing crop loss and improving farm management.',
    excerptMs: 'Ketahui bagaimana kecerdasan buatan membolehkan pengesanan awal penyakit kelapa sawit, mencegah kehilangan tanaman dan meningkatkan pengurusan ladang.',
    content: 'Palm oil diseases can devastate entire plantations if not detected early. Traditional monitoring methods are often insufficient for large-scale operations...',
    contentMs: 'Penyakit kelapa sawit boleh memusnahkan keseluruhan ladang jika tidak dikesan awal. Kaedah pemantauan tradisional sering tidak mencukupi untuk operasi berskala besar...',
    author: 'Dr. Li Wei',
    authorMs: 'Dr. Li Wei',
    date: '2024-12-28',
    readTime: '5 min read',
    readTimeMs: '5 minit bacaan',
    category: 'Technology',
    categoryMs: 'Teknologi',
    tags: ['Disease Detection', 'AI', 'Crop Protection', 'Palm Oil'],
    tagsMs: ['Pengesanan Penyakit', 'AI', 'Perlindungan Tanaman', 'Kelapa Sawit'],
    image: '/images/blog/disease-detection.jpg'
  },
  {
    id: 'yield-optimization',
    title: 'Maximizing Palm Oil Yields: Data-Driven Farming Strategies',
    titleMs: 'Memaksimumkan Hasil Kelapa Sawit: Strategi Pertanian Berasaskan Data',
    excerpt: 'Learn how data analytics and AI can help palm oil farmers optimize their yields while maintaining sustainable practices.',
    excerptMs: 'Pelajari bagaimana analitik data dan AI boleh membantu petani kelapa sawit mengoptimumkan hasil mereka sambil mengekalkan amalan lestari.',
    content: 'In the competitive palm oil industry, maximizing yields while maintaining quality and sustainability is crucial. Modern data-driven approaches are revolutionizing how farmers...',
    contentMs: 'Dalam industri kelapa sawit yang kompetitif, memaksimumkan hasil sambil mengekalkan kualiti dan kelestarian adalah penting. Pendekatan berasaskan data moden merevolusikan cara petani...',
    author: 'Eng. Raj Kumar',
    authorMs: 'Eng. Raj Kumar',
    date: '2024-12-20',
    readTime: '6 min read',
    readTimeMs: '6 minit bacaan',
    category: 'Farming',
    categoryMs: 'Pertanian',
    tags: ['Yield Optimization', 'Data Analytics', 'Farming', 'Productivity'],
    tagsMs: ['Pengoptimuman Hasil', 'Analitik Data', 'Pertanian', 'Produktiviti'],
    image: '/images/blog/yield-optimization.jpg'
  },
  {
    id: 'future-agritech',
    title: 'The Future of AgriTech: Innovations Shaping Palm Oil Farming',
    titleMs: 'Masa Depan AgriTech: Inovasi Membentuk Pertanian Kelapa Sawit',
    excerpt: 'Explore emerging technologies that are set to transform the palm oil industry, from IoT sensors to advanced AI analytics.',
    excerptMs: 'Terokai teknologi baru yang akan mengubah industri kelapa sawit, dari sensor IoT hingga analitik AI lanjutan.',
    content: 'The palm oil industry is on the cusp of a technological revolution. From Internet of Things (IoT) sensors to advanced machine learning algorithms...',
    contentMs: 'Industri kelapa sawit berada di ambang revolusi teknologi. Dari sensor Internet of Things (IoT) hingga algoritma pembelajaran mesin lanjutan...',
    author: 'Dr. James Mitchell',
    authorMs: 'Dr. James Mitchell',
    date: '2024-12-15',
    readTime: '9 min read',
    readTimeMs: '9 minit bacaan',
    category: 'Innovation',
    categoryMs: 'Inovasi',
    tags: ['AgriTech', 'IoT', 'Innovation', 'Future'],
    tagsMs: ['AgriTech', 'IoT', 'Inovasi', 'Masa Depan'],
    image: '/images/blog/future-agritech.jpg'
  }
];

const categories = [
  { id: 'all', label: 'All Posts', labelMs: 'Semua Pos', icon: faBookOpen },
  { id: 'technology', label: 'Technology', labelMs: 'Teknologi', icon: faBolt },
  { id: 'agriculture', label: 'Agriculture', labelMs: 'Pertanian', icon: faLeaf },
  { id: 'sustainability', label: 'Sustainability', labelMs: 'Kelestarian', icon: faChartLine },
  { id: 'farming', label: 'Farming', labelMs: 'Pertanian', icon: faChartColumn },
  { id: 'innovation', label: 'Innovation', labelMs: 'Inovasi', icon: faEye }
];

export default function BlogPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ms'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

  // Get all unique tags
  const allTags = Array.from(
    new Set(blogPosts.flatMap(post => language === 'ms' ? post.tagsMs : post.tags))
  );

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchQuery === '' ||
      (language === 'ms' ? post.titleMs : post.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (language === 'ms' ? post.excerptMs : post.excerpt).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (language === 'ms' ? post.tagsMs : post.tags).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' ||
      post.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag =>
        (language === 'ms' ? post.tagsMs : post.tags).includes(tag)
      );

    return matchesSearch && matchesCategory && matchesTags;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              <span className="text-yellow-400">{language === 'ms' ? 'Blog' : 'Blog'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms'
                ? 'Pandangan terkini tentang teknologi AI, pertanian lestari, dan inovasi dalam industri kelapa sawit Malaysia.'
                : 'Latest insights on AI technology, sustainable agriculture, and innovations in Malaysia\'s palm oil industry.'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-24"
        >
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 lg:p-8 border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-end">
              {/* Search */}
              <div className="flex-1 w-full">
                <label htmlFor="blog-search" className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ms' ? 'Cari Artikel' : 'Search Articles'}
                </label>
                <div className="relative">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    id="blog-search"
                    type="text"
                    placeholder={language === 'ms' ? 'Cari artikel...' : 'Search articles...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="lg:w-64 w-full">
                <label htmlFor="blog-category-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ms' ? 'Kategori' : 'Category'}
                </label>
                <select
                  id="blog-category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all bg-white"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {language === 'ms' ? category.labelMs : category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div className="mt-5 sm:mt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {language === 'ms' ? 'Tag:' : 'Tags:'}
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                        selectedTags.includes(tag)
                          ? 'bg-green-600 text-white shadow-md hover:bg-green-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-12">
              {language === 'ms' ? 'Artikel Pilihan' : 'Featured Articles'}
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-16 sm:p-20 text-center border border-gray-100">
              <h3 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
                {language === 'ms' ? 'AKAN DATANG' : 'COMING SOON'}
              </h3>
              <p className="text-xl text-gray-600">
                {language === 'ms'
                  ? 'Kami sedang menyediakan kandungan blog yang menarik untuk anda. Sila kembali tidak lama lagi!'
                  : 'We are preparing exciting blog content for you. Please check back soon!'
                }
              </p>
            </div>
          </motion.section>
        )}

        {/* All Posts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-24"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-3">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">
              {language === 'ms' ? 'Semua Artikel' : 'All Articles'}
            </h2>
            <div className="text-sm sm:text-base text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
              {filteredPosts.length} {language === 'ms' ? 'artikel' : 'articles'}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-16 sm:p-20 text-center border border-gray-100">
            <h3 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
              {language === 'ms' ? 'AKAN DATANG' : 'COMING SOON'}
            </h3>
            <p className="text-xl text-gray-600">
              {language === 'ms'
                ? 'Kami sedang menyediakan kandungan blog yang menarik untuk anda. Sila kembali tidak lama lagi!'
                : 'We are preparing exciting blog content for you. Please check back soon!'
              }
            </p>
          </div>
        </motion.section>

        {/* Newsletter Signup */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 lg:p-10 text-center text-white shadow-xl border-4 border-green-500/20">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                {language === 'ms' ? 'Jangan Ketinggalan!' : 'Stay Updated!'}
              </h2>
              <p className="text-xl text-green-100 mb-8 leading-relaxed">
                {language === 'ms'
                  ? 'Dapatkan kemas kini terkini tentang teknologi AI, tip pertanian, dan berita industri kelapa sawit terus ke peti masuk anda.'
                  : 'Get the latest updates on AI technology, farming tips, and palm oil industry news delivered straight to your inbox.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
                <label htmlFor="newsletter-email" className="sr-only">
                  {language === 'ms' ? 'Alamat emel' : 'Email address'}
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder={language === 'ms' ? 'Alamat emel anda' : 'Your email address'}
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none shadow-lg"
                />
                <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-bold hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap">
                  {language === 'ms' ? 'Langgan' : 'Subscribe'}
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
