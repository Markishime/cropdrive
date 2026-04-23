'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';
import { useAuth } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';

export default function FeaturesPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const { language, t } = useTranslation(currentLanguage);
  const copy = (en: string, ms: string) => language === 'id' ? toIndonesianText(ms) : language === 'ms' ? ms : en;
  const { user } = useAuth();
  
  const currentPlan = user?.plan || 'start';

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

  if (!mounted) {
    return null;
  }

  // 11 Core Features as described in the CropDrive™ Oil Palm AI Advisor document
  const features = [
    {
      number: '1',
      icon: '📄',
      title: copy('Smart Document Reading (OCR & AI)', 'Pembacaan Dokumen Pintar (OCR & AI)'),
      description: copy('Automatically reads lab reports (Image/PDF/Excel - SPLAB, farm_data), extracts all data without manual typing. Works with different lab formats, handwritten or scanned documents. Processes in ~5-8 minutes.', 'Membaca laporan makmal (Gambar/PDF/Excel - SPLAB, farm_data) secara automatik, mengekstrak semua data tanpa taipan manual. Berfungsi dengan format makmal yang berbeza, dokumen tulisan tangan atau diimbas. Proses dalam ~5-8 minit.'),
      benefits: [
        copy('Saves hours of manual data entry', 'Jimat berjam-jam kemasukan data manual'),
        copy('Eliminates typing errors', 'Hapuskan kesilapan taipan'),
        copy('No need to change your current lab', 'Tiada perlu tukar makmal semasa'),
        copy('Can read handwritten documents', 'Baca dokumen tulisan tangan'),
      ],
    },
    {
      number: '2',
      icon: '🔬',
      title: language === 'id' ? 'Analisis Nutrisi Cerdas' : language === 'ms' ? 'Analisis Nutrien Pintar' : 'Intelligent Nutrient Analysis',
      description: language === 'id'
        ? 'Membandingkan hasil dengan standar Indonesian Sustainable Palm Oil (ISPO) dan Good Agricultural Practices (GAP) global terbaik. Tingkat keparahan diberi kode warna: HIJAU (Seimbang), KUNING (Rendah), MERAH (Kritis). Menunjukkan kesenjangan tepat untuk setiap nutrisi dan memprioritaskan masalah dari yang paling mendesak.'
        : language === 'ms'
        ? 'Bandingkan keputusan dengan garis panduan MPOB dan Amalan Pertanian Baik (GAP) global. Tahap keterukan berkod warna: HIJAU (Seimbang), KUNING (Rendah), MERAH (Kritikal). Tunjukkan jurang tepat untuk setiap nutrien dan utamakan masalah dari paling mendesak.'
        : 'Compares results against MPOB guidelines and best global Good Agricultural Practices (GAP). Color-coded severity levels: GREEN (Balanced), YELLOW (Low), RED (Critical). Shows exact gaps for every nutrient and prioritizes problems from most to least urgent.',
      benefits: [
        language === 'id' ? 'Tahu persis apa yang perlu perhatian' : language === 'ms' ? 'Tahu apa yang perlu perhatian' : 'Know exactly what needs attention',
        language === 'id' ? 'Pahami tingkat keparahan dalam sekali lihat' : language === 'ms' ? 'Fahami keterukan sekilas pandang' : 'Understand severity at a glance',
        language === 'id' ? 'Fokus pada isu paling kritis terlebih dahulu' : language === 'ms' ? 'Fokus pada isu kritikal dahulu' : 'Focus on critical issues first',
        language === 'id' ? 'Perbandingan dengan standar ISPO & GAP global' : language === 'ms' ? 'Perbandingan dengan garis panduan MPOB & GAP global' : 'Comparison against MPOB guidelines & global GAP',
      ],
    },
    {
      number: '3',
      icon: '🤖',
      title: language === 'ms' ? 'Cadangan Berkuasa AI' : 'AI-Powered Recommendations',
      description: language === 'ms'
        ? 'Dikuasakan oleh Google Gemini AI, menyediakan tiga pilihan pelaburan untuk setiap masalah: TINGGI (Pantas, premium), SEDERHANA (Seimbang), RENDAH (Bajet). Termasuk nama produk tepat, kadar aplikasi (kg/hektar), kos anggaran dalam RM, jangkaan peningkatan hasil.'
        : 'Powered by Google Gemini AI, providing three investment options for every problem: HIGH (Fast, premium), MEDIUM (Balanced), LOW (Budget). Includes exact product names, application rates (kg/hectare), cost estimates in RM, expected yield improvements.',
      benefits: [
        language === 'ms' ? 'Pilih penyelesaian sesuai bajet' : 'Choose solution that fits your budget',
        language === 'ms' ? 'Tahu apa yang perlu dibeli dan berapa' : 'Know exactly what to buy and how much',
        language === 'ms' ? 'Fahami kos sebelum komitmen' : 'Understand costs before committing',
        language === 'ms' ? 'Lihat unjuran pulangan pelaburan' : 'See projected returns on investment',
      ],
    },
    {
      number: '4',
      icon: '🌱',
      title: language === 'ms' ? 'Integrasi Pertanian Regeneratif' : 'Regenerative Agriculture Integration',
      description: language === 'ms'
        ? 'Amalan mampan untuk kurangkan pergantungan baja jangka panjang: Sungkupan EFB (40-60 tan/ha/tahun), Tanaman Penutup Legum (nitrogen percuma!), Pengkomposan (EFB + POME), Aplikasi Biochar (tahan berdekad-dekad).'
        : 'Sustainable practices to reduce long-term fertilizer dependence: EFB Mulching (40-60 tonnes/ha/year), Leguminous Cover Crops (FREE nitrogen!), Composting (EFB + POME), Biochar Application (lasts decades).',
      benefits: [
        language === 'ms' ? 'Kos baja lebih rendah tahun demi tahun' : 'Lower fertilizer costs year after year',
        language === 'ms' ? 'Kemampanan alam sekitar' : 'Environmental sustainability',
        language === 'ms' ? 'Kesihatan tanah bertambah baik' : 'Improved soil health over time',
        language === 'ms' ? 'Kurang pergantungan kimia' : 'Reduced dependency on chemicals',
      ],
    },
    {
      number: '5',
      icon: '📊',
      title: language === 'ms' ? 'Ramalan Impak Ekonomi' : 'Economic Impact Forecasting',
      description: language === 'ms'
        ? 'Unjuran kewangan 5 tahun untuk setiap pilihan pelaburan dengan pecahan tahun demi tahun: Kos pelaburan, Peningkatan hasil, Pendapatan tambahan, Keuntungan bersih, Peratusan ROI. Perbandingan sebelah menyebelah semua senario dan analisis pulang modal.'
        : '5-year financial projections for each investment option with year-by-year breakdown: Investment costs, Yield improvements, Additional revenue, Net profit, ROI percentage. Side-by-side comparison of all scenarios and break-even analysis.',
      benefits: [
        language === 'ms' ? 'Buat keputusan perniagaan berdasarkan maklumat' : 'Make informed business decisions',
        language === 'ms' ? 'Justifikasi pelaburan kepada pengurusan/bank' : 'Justify investments to management/banks',
        language === 'ms' ? 'Rancang aliran tunai strategik' : 'Plan cash flow strategically',
        language === 'ms' ? 'Pilih pilihan sesuai bajet' : 'Choose options matching your budget',
      ],
    },
    {
      number: '6',
      icon: '📑',
      title: language === 'ms' ? 'Laporan PDF Profesional' : 'Professional PDF Reports',
      description: language === 'ms'
        ? 'Eksport analisis lengkap ke format PDF dengan pemformatan profesional sesuai untuk mesyuarat. Termasuk jadual analisis nutrien lengkap, penunjuk keterukan berkod warna, semua cadangan AI dengan kos, cadangan pertanian regeneratif, ramalan ekonomi 5 tahun, graf dan carta.'
        : 'Export complete analysis to PDF format with professional formatting suitable for meetings. Includes complete nutrient analysis tables, color-coded severity indicators, all AI recommendations with costs, regenerative agriculture suggestions, 5-year economic forecasts, graphs and charts.',
      benefits: [
        language === 'ms' ? 'Penampilan profesional' : 'Professional appearance',
        language === 'ms' ? 'Mudah dikongsi' : 'Easy to share',
        language === 'ms' ? 'Dokumentasi lengkap' : 'Complete documentation',
        language === 'ms' ? 'Rekod kekal' : 'Permanent records',
      ],
    },
    {
      number: '7',
      icon: '📈',
      title: language === 'ms' ? 'Penjejakan Data Sejarah' : 'Historical Data Tracking',
      description: language === 'ms'
        ? 'Simpan setiap analisis secara automatik. Bandingkan keputusan merentasi tempoh masa berbeza. Jejaki peningkatan dari rawatan. Kenal pasti corak bermusim. Lihat trend (bertambah baik atau buruk). Papan pemuka menunjukkan semua analisis terdahulu dengan tarikh dan status.'
        : 'Saves every analysis automatically. Compare results across different time periods. Track improvements from treatments. Identify seasonal patterns. View trends (getting better or worse). Dashboard shows all previous analyses with dates and status.',
      benefits: [
        language === 'ms' ? 'Buktikan rawatan berkesan' : 'Prove that treatments are working',
        language === 'ms' ? 'Pelajari corak unik ladang anda' : 'Learn your plantation\'s unique patterns',
        language === 'ms' ? 'Kesan masalah awal' : 'Catch problems early',
        language === 'ms' ? 'Pembuatan keputusan berasaskan data' : 'Data-driven decision making',
      ],
    },
    {
      number: '8',
      icon: '🏢',
      title: language === 'ms' ? 'Pengurusan Berbilang Ladang' : 'Multi-Farm Management',
      description: language === 'ms'
        ? 'Urus berbilang ladang dari satu papan pemuka. Jejaki blok atau estet berbeza secara berasingan. Bandingkan prestasi merentas lokasi. Utamakan perhatian di mana paling diperlukan. Contoh: Ladang 1 - Kluang (150 ha): 3 isu Kritikal, Ladang 2 - Mersing (80 ha): Semua seimbang ✅'
        : 'Manage multiple plantations from one dashboard. Track different blocks or estates separately. Compare performance across locations. Prioritize attention where most needed. Example: Farm 1 - Kluang (150 ha): 3 Critical issues, Farm 2 - Mersing (80 ha): All balanced ✅',
      benefits: [
        language === 'ms' ? 'Pengurusan berpusat' : 'Centralized management',
        language === 'ms' ? 'Perbandingan pantas merentas ladang' : 'Quick comparison across farms',
        language === 'ms' ? 'Peruntukan sumber cekap' : 'Efficient resource allocation',
        language === 'ms' ? 'Pengawasan lebih baik' : 'Better oversight',
      ],
    },
    {
      number: '9',
      icon: '🔐',
      title: language === 'ms' ? 'Pengesahan Pengguna & Keselamatan Data' : 'User Authentication & Data Security',
      description: language === 'ms'
        ? 'Log masuk selamat dengan e-mel dan kata laluan. Penyulitan tahap bank (Google Firebase). Kawalan akses berasaskan peranan: Admin (akses penuh), Pengurus (lihat dan analisis data), Pelihat (akses baca sahaja). Tetapan semula kata laluan melalui e-mel. Sandaran awan automatik.'
        : 'Secure login with email and password. Bank-level encryption (Google Firebase). Role-based access control: Admin (full access), Manager (view and analyze data), Viewer (read-only). Password reset via email. Automatic cloud backup.',
      benefits: [
        language === 'ms' ? 'Data anda kekal sulit' : 'Your data stays confidential',
        language === 'ms' ? 'Kawalan akses untuk ahli pasukan' : 'Controlled access for team members',
        language === 'ms' ? 'Tidak pernah hilang data' : 'Never lose data',
        language === 'ms' ? 'Kerja dari mana-mana' : 'Work from anywhere',
      ],
    },
    {
      number: '10',
      icon: '📱',
      title: language === 'ms' ? 'Reka Bentuk Mesra Mudah Alih' : 'Mobile-Friendly Design',
      description: language === 'ms'
        ? 'Berfungsi sempurna pada telefon pintar dan tablet. Muat naik foto laporan terus dari kamera telefon. Reka bentuk responsif menyesuaikan dengan saiz skrin. Kongsi laporan melalui WhatsApp, e-mel, dll. Berfungsi pada sambungan internet perlahan.'
        : 'Works perfectly on smartphones and tablets. Upload photos of reports directly from phone camera. Responsive design adapts to screen size. Share reports via WhatsApp, email, etc. Functions on slow internet connections.',
      benefits: [
        language === 'ms' ? 'Semak hasil semasa di ladang' : 'Check results while in the field',
        language === 'ms' ? 'Tiada komputer diperlukan' : 'No computer required',
        language === 'ms' ? 'Keputusan pantas di tempat' : 'Quick decisions on the spot',
        language === 'ms' ? 'Akses mudah di mana-mana' : 'Convenient access anywhere',
      ],
    },
    {
      number: '11',
      icon: '⚙️',
      title: language === 'ms' ? 'Panel Admin (Untuk Pengurus)' : 'Admin Panel (For Managers)',
      description: language === 'ms'
        ? 'Konfigurasikan tetapan analisis AI. Urus akaun pengguna dan kebenaran. Pantau penggunaan sistem. Sesuaikan parameter analisis. Lihat laporan seluruh organisasi. Jejaki statistik penggunaan.'
        : 'Configure AI analysis settings. Manage user accounts and permissions. Monitor system usage. Customize analysis parameters. View organization-wide reports. Track usage statistics.',
      benefits: [
        language === 'ms' ? 'Kawalan berpusat' : 'Centralized control',
        language === 'ms' ? 'Pengurusan pengguna' : 'User management',
        language === 'ms' ? 'Pemantauan sistem' : 'System monitoring',
        language === 'ms' ? 'Pilihan penyesuaian' : 'Customization options',
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Logged-in User Banner */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium">
                {copy(`✓ Your Current Plan: ${currentPlan.toUpperCase()} • All features below are available to you!`, `✓ Pelan Semasa Anda: ${currentPlan.toUpperCase()} • Semua ciri di bawah tersedia untuk anda!`)}
              </p>
            </div>
            {currentPlan === 'start' && (
              <Link href="/pricing">
                <Button className="bg-yellow-400 text-green-900 hover:bg-yellow-300 font-bold px-6 py-2 text-sm">
                  {copy('Upgrade Now', 'Naik Taraf Sekarang')}
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Hero Section with Green Gradient */}
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
            <motion.span
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block text-yellow-400 text-sm font-bold tracking-widest uppercase mb-6"
            >
              {copy('11 Core Features', '11 Ciri Utama')}
            </motion.span>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              {language === 'ms' ? 'CropDrive™ Oil Palm AI Advisor' : 'CropDrive™ Oil Palm AI Advisor'}<br />
              <span className="text-yellow-400">{copy('FEATURES', 'CIRI-CIRI')}</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {copy('Latest technology for accurate, comprehensive, and easy-to-use palm oil farm analysis', 'Teknologi terkini untuk analisis ladang kelapa sawit yang tepat, menyeluruh, dan mudah digunakan')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="px-8 py-4 bg-yellow-400 text-green-900 rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-yellow-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                  {copy('Sign Up Now', 'Daftar Sekarang')}
                </button>
              </Link>
              <Link href="/get-started/farmers">
                <button className="px-8 py-4 border-2 border-white/30 text-white rounded-xl font-medium uppercase text-sm tracking-wider hover:border-yellow-400 hover:text-yellow-400 transition-all duration-200 hover:bg-white/10">
                  {copy('Learn More', 'Ketahui Lebih Lanjut')}
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid Section - All 11 Core Features */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: (index % 2) * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-white border-l-4 border-yellow-400">
                  <CardContent className="p-8">
                    <div className="flex items-start mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-700 to-green-900 rounded-full flex items-center justify-center text-yellow-400 text-2xl font-black mr-4 flex-shrink-0">
                        {feature.number}
                      </div>
                      <div className="text-5xl">{feature.icon}</div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-4 uppercase tracking-wide">
                      {feature.title}
                    </h3>

                    <p className="text-gray-700 mb-6 leading-relaxed text-base">
                      {feature.description}
                    </p>

                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      <p className="text-sm font-bold text-green-700 uppercase tracking-wide mb-2">
                        {copy('Benefits:', 'Manfaat:')}
                      </p>
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center">
                          <svg
                            className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-800 font-medium text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Capabilities Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 uppercase">
              {copy('Technical', 'Keupayaan')} <span className="text-green-700">{copy('Capabilities', 'Teknikal')}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Supported Formats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-lg border-2 border-blue-200"
            >
              <div className="text-5xl mb-4 text-center">📁</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center uppercase">
                {copy('Supported Formats', 'Format Disokong')}
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  <span>{copy('Images (JPG, PNG)', 'Gambar (JPG, PNG)')}</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  <span>PDF {copy('reports (any laboratory)', 'laporan (mana-mana makmal)')}</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Excel (.xlsx, .xls)</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  <span className="font-semibold text-green-700">SPLAB {copy('reports', 'laporan')}</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  <span className="font-semibold text-green-700">farm_data {copy('reports', 'laporan')}</span>
                </li>
              </ul>
            </motion.div>

            {/* Soil Tests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl shadow-lg border-2 border-green-200"
            >
              <div className="text-5xl mb-4 text-center">🧪</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center uppercase">
                {copy('Soil Tests', 'Ujian Tanah')}
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  <span>pH {copy('(acidity/alkalinity)', '(keasidan/alkaliniti)')}</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  <span>CEC</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  <span>{copy('Base Saturation (Ca, Mg, K, Na)', 'Ketepuan Asas (Ca, Mg, K, Na)')}</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  <span>{copy('Exchangeable Nutrients', 'Nutrien Boleh Tukar')}</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  <span>{copy('Available Phosphorus (P)', 'Fosforus Tersedia (P)')}</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  <span>{copy('Total Nitrogen (N)', 'Nitrogen Total (N)')}</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  <span>{copy('Micronutrients (B, Cu, Zn, Mn, Fe, Al)', 'Mikronutrien (B, Cu, Zn, Mn, Fe, Al)')}</span>
                </li>
              </ul>
            </motion.div>

            {/* Leaf Tests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-yellow-50 to-white p-8 rounded-xl shadow-lg border-2 border-yellow-200"
            >
              <div className="text-5xl mb-4 text-center">🍃</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center uppercase">
                {copy('Leaf Tissue Tests', 'Ujian Tisu Daun')}
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  <span>{copy('Macronutrients (N, P, K, Ca, Mg)', 'Makronutrien (N, P, K, Ca, Mg)')}</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  <span>{copy('Micronutrients (B, Cu, Zn, Cl)', 'Mikronutrien (B, Cu, Zn, Cl)')}</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  <span>{copy('Nutrient Ratios (K:Mg, Ca:Mg, etc.)', 'Nisbah Nutrien (K:Mg, Ca:Mg, dll)')}</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                <span className="font-semibold">
                  {copy('MPOB guidelines & Good Agricultural Practices (GAP)', 'Garis panduan MPOB & Amalan Pertanian Baik (GAP)')}
                </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-16">
              <span className="inline-block text-yellow-500 text-sm font-bold tracking-widest uppercase mb-4">
                {copy('Simple & Fast', 'Mudah & Pantas')}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 uppercase">
                {copy('User', 'Perjalanan')} <span className="text-green-700">{copy('Journey', 'Pengguna')}</span>
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                {copy('Simple 5-step process from upload to action', 'Proses mudah 5 langkah dari muat naik ke tindakan')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                {
                  step: '1',
                  title: language === 'ms' ? 'MUAT NAIK' : 'UPLOAD',
                  description: language === 'ms'
                    ? 'Log masuk ke papan pemuka, klik "Muat Naik Laporan", pilih PDF/foto hasil makmal'
                    : 'Log into dashboard, click "Upload Report", select PDF/photo of lab results',
                  icon: '📤',
                },
                {
                  step: '2',
                  title: language === 'ms' ? 'ANALISIS (30s)' : 'ANALYSIS (30s)',
                  description: language === 'ms'
                    ? 'AI membaca semua data automatik, bandingkan dengan garis panduan MPOB dan Amalan Pertanian Baik (GAP) global, kenal pasti isu, jana cadangan'
                    : 'AI reads all data automatically, compares to MPOB guidelines and global Good Agricultural Practices (GAP), identifies issues, generates recommendations',
                  icon: '🤖',
                },
                {
                  step: '3',
                  title: language === 'ms' ? 'SEMAK HASIL' : 'REVIEW RESULTS',
                  description: language === 'ms'
                    ? 'Lihat status nutrien berkod warna, baca cadangan AI, semak 3 pilihan pelaburan, lihat ramalan kewangan 5 tahun'
                    : 'See color-coded nutrient status, read AI recommendations, check 3 investment options, view 5-year financial projections',
                  icon: '📊',
                },
                {
                  step: '4',
                  title: language === 'ms' ? 'AMBIL TINDAKAN' : 'TAKE ACTION',
                  description: language === 'ms'
                    ? 'Pilih pilihan pelaburan sesuai bajet, muat turun laporan PDF profesional, kongsi dengan pembekal, laksanakan cadangan'
                    : 'Choose investment option that fits budget, download professional PDF report, share with suppliers, implement recommendations',
                  icon: '✅',
                },
                {
                  step: '5',
                  title: language === 'ms' ? 'PANTAU' : 'MONITOR',
                  description: language === 'ms'
                    ? 'Muat naik ujian baru secara berkala, bandingkan dengan hasil terdahulu, sahkan peningkatan, sesuaikan rawatan'
                    : 'Upload new tests periodically, compare with previous results, verify improvements, adjust treatments',
                  icon: '📈',
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="relative bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border-2 border-green-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-xl">
                    <div className="text-5xl mb-4">{step.icon}</div>
                    
                    <div className="w-16 h-16 bg-gradient-to-br from-green-700 to-green-900 text-yellow-400 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4 shadow-lg">
                      {step.step}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
                      {step.title}
                    </h3>

                    <p className="text-gray-700 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-green-900 via-green-800 to-green-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase">
              {copy('Ready to', 'Sedia untuk')} <span className="text-yellow-400">{copy('Start?', 'Memulakan?')}</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {copy('Don\'t guess - know exactly what your plantation needs!', 'Jangan teka - tahu apa yang ladang anda perlukan dengan ketepatan!')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/register">
                <button className="px-10 py-5 bg-yellow-400 text-green-900 rounded-xl font-bold uppercase text-base tracking-wider hover:bg-yellow-300 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105">
                  {copy('Join Now', 'Sertai Sekarang')}
                </button>
              </Link>
              <Link href="/pricing">
                <button className="px-10 py-5 border-2 border-white text-white rounded-xl font-medium uppercase text-base tracking-wider hover:border-yellow-400 hover:text-yellow-400 hover:bg-white/10 transition-all duration-200">
                  {copy('View Plans', 'Lihat Pelan Harga')}
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
