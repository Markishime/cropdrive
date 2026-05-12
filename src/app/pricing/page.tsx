'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';
import { useAuth } from '@/lib/auth';

export default function PricingPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const { language, t } = useTranslation(currentLanguage);
  const copy = (en: string, ms: string) => language === 'id' ? toIndonesianText(ms) : language === 'ms' ? ms : en;
  const { user } = useAuth();


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


  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-dot-grid"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <>
              <motion.span
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-block text-yellow-400 text-sm font-bold tracking-widest uppercase mb-6"
              >
                {language === 'id' ? '🎉 Akses Percuma' : language === 'ms' ? '🎉 Akses Percuma' : '🎉 Free Access'}
              </motion.span>

              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
                {language === 'id' ? 'Percuma untuk Semua Petani' : language === 'ms' ? 'Percuma untuk Semua Petani' : 'Free for All Farmers'}
              </h1>

              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                {language === 'id'
                  ? 'Dapatkan akses gratis ke analisis laporan tanaman. Mulai dengan 2 laporan gratis per bulan.'
                  : language === 'ms'
                  ? 'Dapatkan akses percuma ke analisis laporan tanaman. Bermula dengan 2 laporan percuma sebulan.'
                  : 'Get free access to AI-powered crop analysis. Start with 2 free reports per month.'}
              </p>
            </>

            {/* Organizations Banner */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="max-w-2xl mx-auto bg-green-600 backdrop-blur-sm border-2 border-green-400 rounded-xl sm:rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-white font-bold text-2xl sm:text-3xl">
                  {language === 'id'
                    ? '✨ Platform Sepenuhnya Percuma'
                    : language === 'ms'
                    ? '✨ Platform Sepenuhnya Percuma'
                    : '✨ Completely Free Platform'}
                </h2>
                <p className="text-white/90 text-base sm:text-lg leading-relaxed">
                  {language === 'id'
                    ? 'CropDrive kini tersedia sepenuhnya percuma untuk semua petani. Dapatkan akses ke analisis laporan tanaman bertenaga AI, tanpa bayaran berulang atau komitmen. Mulai dengan sehingga 2 analisis laporan percuma setiap bulan.'
                    : language === 'ms'
                    ? 'CropDrive kini tersedia sepenuhnya percuma untuk semua petani. Dapatkan akses ke analisis laporan tanaman bertenaga AI, tanpa bayaran berulang atau komitmen. Mulai dengan sehingga 2 analisis laporan percuma setiap bulan.'
                    : 'CropDrive is now completely free for all farmers. Get access to AI-powered crop report analysis, with no recurring payments or commitments. Start with up to 2 free report analyses every month.'}
                </p>
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto px-8 py-3 bg-white text-green-700 rounded-full font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 touch-manipulation whitespace-nowrap"
                  >
                    {language === 'id'
                      ? '🚀 Daftar Percuma Sekarang'
                      : language === 'ms'
                      ? '🚀 Daftar Percuma Sekarang'
                      : '🚀 Sign Up Free Now'}
                  </motion.button>
                </Link>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Free Access Features Section */}
      <section id="pricing-plans" className="py-24 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {language === 'id'
                ? 'Apa yang Anda Dapat Secara Percuma'
                : language === 'ms'
                ? 'Apa yang Anda Dapat Secara Percuma'
                : 'What You Get for Free'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'id'
                ? 'Akses penuh ke semua fitur analisis tanaman bertenaga AI kami tanpa bayaran'
                : language === 'ms'
                ? 'Akses penuh ke semua ciri analisis tanaman bertenaga AI kami tanpa bayaran'
                : 'Full access to all of our AI-powered crop analysis features at no cost'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-600"
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">🤖</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {language === 'id' ? 'Analisis AI' : language === 'ms' ? 'Analisis AI' : 'AI-Powered Analysis'}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'id'
                      ? 'Dapatkan rekomendasi nutrisi terperinci dan wawasan pertanian dari teknologi AI canggih kami dalam hitungan menit.'
                      : language === 'ms'
                      ? 'Dapatkan rekomendasi nutrien terperinci dan pandangan pertanian dari teknologi AI canggih kami dalam hitungan minit.'
                      : 'Get detailed nutrient recommendations and farming insights from our advanced AI technology in minutes.'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-600"
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">📊</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {language === 'id' ? 'Pelacakan Laporan' : language === 'ms' ? 'Penjejakan Laporan' : 'Report History'}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'id'
                      ? 'Simpan dan lihat semua analisis laporan anda. Bandingkan hasil dari waktu ke waktu untuk melacak kemajuan pertanian anda.'
                      : language === 'ms'
                      ? 'Simpan dan lihat semua analisis laporan anda. Bandingkan keputusan dari masa ke masa untuk menjejaki kemajuan pertanian anda.'
                      : 'Save and view all your report analyses. Compare results over time to track your farm\'s progress.'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-600"
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">💬</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {language === 'id' ? 'Asisten AI Palmira' : language === 'ms' ? 'Pembantu AI Palmira' : 'AI Assistant Palmira'}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'id'
                      ? 'Tanya kepada Palmira AI kami pertanyaan tentang pertanian anda. Dapatkan jawaban instan dan saran yang dipersonalisasi.'
                      : language === 'ms'
                      ? 'Tanya kepada AI Palmira kami soalan tentang pertanian anda. Dapatkan jawapan segera dan cadangan yang dipersonalisasi.'
                      : 'Ask our Palmira AI assistant questions about your farm. Get instant answers and personalized suggestions.'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-600"
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">🔐</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {language === 'id' ? 'Akses Aman' : language === 'ms' ? 'Akses Selamat' : 'Secure Access'}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'id'
                      ? 'Data pertanian anda dilindungi dengan enkripsi tingkat enterprise. Hanya anda yang dapat mengakses analisis dan laporan anda.'
                      : language === 'ms'
                      ? 'Data pertanian anda dilindungi dengan enkripsi peringkat perusahaan. Hanya anda boleh mengakses analisis dan laporan anda.'
                      : 'Your farm data is protected with enterprise-grade encryption. Only you can access your analyses and reports.'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Monthly Report Cap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-white text-center shadow-xl"
          >
            <h3 className="text-3xl font-bold mb-3">
              {language === 'id' ? '📋 2 Analisis Laporan Percuma Per Pengguna' : language === 'ms' ? '📋 2 Analisis Laporan Percuma Per Pengguna' : '📋 2 Free Report Analyses Per User'}
            </h3>
            <p className="text-lg text-white/90">
              {language === 'id'
                ? 'Analisis hingga 2 laporan tanaman setiap bulan tanpa biaya. Sempurna untuk sebagian besar petani kecil dan menengah untuk memantau kesehatan tanaman mereka secara konsisten.'
                : language === 'ms'
                ? 'Analisis sehingga 2 laporan tanaman setiap bulan tanpa bayaran. Sempurna bagi kebanyakan petani kecil dan sederhana untuk memantau kesihatan tanaman mereka secara konsisten.'
                : 'Analyze up to 2 crop reports every month at no cost. Perfect for most small and medium farmers to consistently monitor their crop health.'}
            </p>
          </motion.div>
        </div>
      </section>


      {/* ROI Example Section */}
      <section className="py-24 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {copy('Oil Palm Plantation Results with', 'Keputusan Ladang Kelapa Sawit dengan')} <span className="text-green-700">CropDrive™</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-6xl mx-auto">
            {/* Before CropDrive */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-red-50 p-8 rounded-xl border-4 border-red-200 shadow-xl overflow-hidden"
            >
              <div className="mb-6">
                <img 
                  src="/images/Before-Cropdrive.jpg" 
                  alt={copy('Before CropDrive', 'Sebelum CropDrive')}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-red-700 uppercase mb-2">
                    {copy('Before CropDrive™', 'Sebelum CropDrive™')}
                  </h3>
                </div>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li>
                  <span>{copy('Yield: 20 tonnes FFB/ha/year', 'Hasil: 20 tan FFB/ha/tahun')}</span>
                </li>
                <li>
                  <span>{copy('Consultant fees: RM 4,000 per year', 'Yuran perunding: RM 4,000 setahun')}</span>
                </li>
                <li>
                  <span>{copy('Analysis time: 2 days per report', 'Masa analisis: 2 hari setiap laporan')}</span>
                </li>
                <li>
                  <span>{copy('Fertilizer: high wastage', 'Baja: pembaziran tinggi')}</span>
                </li>
                <li>
                  <span>{copy('Nutrient planning: unclear and manual', 'Perancangan nutrien: tidak jelas dan manual')}</span>
                </li>
              </ul>
            </motion.div>

            {/* After CropDrive */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-green-50 p-8 rounded-xl border-4 border-green-400 shadow-xl overflow-hidden"
            >
              <div className="mb-6">
                <img 
                  src="/images/After-Cropdrive.jpg" 
                  alt={copy('After CropDrive', 'Selepas CropDrive')}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-green-700 uppercase mb-2">
                    {copy('After CropDrive™', 'Selepas CropDrive™')}
                  </h3>
                </div>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li>
                  <span className="font-semibold">{copy('Yield: 28 tonnes FFB/ha/year (+40% vs baseline)', 'Hasil: 28 tan FFB/ha/tahun (+40% berbanding asas)')}</span>
                </li>
                <li>
                  <span className="font-semibold">{copy('Consultant fees: no routine agronomy fees', 'Yuran perunding: tiada yuran agronomi rutin')}</span>
                </li>
                <li>
                  <span>{copy('Analysis time: 5-8 minutes per report', 'Masa analisis: 5-8 minit setiap laporan')}</span>
                </li>
                <li>
                  <span>{copy('Fertilizer wastage: 20% reduction', 'Pembaziran baja: pengurangan 20%')}</span>
                </li>
                <li>
                  <span>{copy('Nutrient planning: precise, consistent and accurate', 'Perancangan nutrien: tepat, konsisten dan tepat')}</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* ROI Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-yellow-50 to-white p-10 rounded-2xl shadow-2xl border-4 border-yellow-400 max-w-4xl mx-auto"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center uppercase">
              {copy('Investment & Returns', 'Pelaburan & Pulangan')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-sm text-gray-600 mb-2">{copy('Payback Period', 'Tempoh Pulang Modal')}</p>
                <p className="text-4xl font-black text-green-700">18-24</p>
                <p className="text-gray-600">{copy('months', 'bulan')}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-sm text-gray-600 mb-2">{copy('5-Year Total Profit', 'Keuntungan 5 Tahun')}</p>
                <p className="text-4xl font-black text-green-700">RM 800K+</p>
                <p className="text-gray-600">{copy('additional', 'tambahan')}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <p className="text-sm text-gray-600 mb-2">{copy('Return on Investment', 'Pulangan Pelaburan')}</p>
              <p className="text-5xl font-black text-green-700 mb-2">267%</p>
              <p className="text-gray-600">{copy('over 5 years', 'dalam 5 tahun')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Success Metrics Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 uppercase">
              {copy('Success', 'Metrik')} <span className="text-green-700">{copy('Metrics', 'Kejayaan')}</span>
            </h2>
            <p className="text-xl text-gray-600">
              {copy('Typical results after 18-24 months:', 'Keputusan biasa selepas 18-24 bulan:')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { value: '10-30%', label: copy('Yield Improvement', 'Peningkatan Hasil') },
              { value: '20-30%', label: copy('Reduced Fertilizer Waste', 'Kurang Pembaziran Baja') },
              { value: '80%', label: copy('Time Savings', 'Penjimatan Masa') },
              { value: '100%', label: copy('Accuracy Improvement', 'Ketepatan Bertambah') },
              { value: 'RM 5-10K', label: copy('Consultant Savings/Year', 'Jimat Perunding/Tahun') },
              { value: '150-300%', label: copy('ROI in 3-5 Years', 'ROI 3-5 Tahun') },
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl shadow-lg text-center border-2 border-green-200 hover:border-yellow-400 transition-all duration-300"
              >
                <p className="text-3xl font-black text-green-700 mb-2">{metric.value}</p>
                <p className="text-sm text-gray-700 font-medium">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-b from-green-50/40 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-16">
              <span className="inline-block text-yellow-500 text-sm font-bold tracking-widest uppercase mb-4">
                {copy('Questions?', 'Ada Soalan?')}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 uppercase">
                {copy('Frequently', 'Soalan')} <span className="text-green-700">{copy('Asked', 'Lazim')}</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {[
                {
                  question: language === 'id' ? 'Apa itu CropDrive?' : language === 'ms' ? 'Apakah CropDrive?' : 'What is CropDrive?',
                  answer: language === 'id' ? 'CropDrive adalah platform analisis tanaman bertenaga AI yang membantu petani mengoptimalkan hasil panen mereka melalui rekomendasi nutrisi yang dipersonalisasi dan wawasan pertanian berbasis data.' : language === 'ms' ? 'CropDrive ialah platform analisis tanaman bertenaga AI yang membantu petani mengoptimalkan hasil panen mereka melalui cadangan nutrien yang dipersonalisasi dan pandangan pertanian berasaskan data.' : 'CropDrive is an AI-powered crop analysis platform that helps farmers optimize their yields through personalized nutrient recommendations and data-driven farming insights.',
                },
                {
                  question: language === 'id' ? 'Berapa biaya untuk menggunakan CropDrive?' : language === 'ms' ? 'Berapa kos untuk menggunakan CropDrive?' : 'How much does CropDrive cost?',
                  answer: language === 'id' ? 'CropDrive sepenuhnya gratis! Anda dapat menganalisis hingga 2 laporan tanaman per bulan tanpa biaya apapun. Tidak ada bayaran tersembunyi atau komitmen jangka panjang.' : language === 'ms' ? 'CropDrive sepenuhnya gratis! Anda boleh menganalisis sehingga 2 laporan tanaman sebulan tanpa sebarang kos. Tiada yuran tersembunyi atau komitmen jangka panjang.' : 'CropDrive is completely free! You can analyze up to 2 crop reports per month at no cost. There are no hidden fees or long-term commitments.',
                },
                {
                  question: language === 'id' ? 'Bagaimana cara memulai?' : language === 'ms' ? 'Bagaimana cara memulakan?' : 'How do I get started?',
                  answer: language === 'id' ? 'Cukup daftar dengan email Anda, lengkapi profil pertanian Anda, dan unggah laporan tanaman Anda untuk dianalisis. Proses analisis biasanya hanya membutuhkan beberapa menit.' : language === 'ms' ? 'Cukup daftar dengan email anda, lengkapi profil pertanian anda, dan muat naik laporan tanaman anda untuk dianalisis. Proses analisis biasanya hanya mengambil beberapa minit.' : 'Simply sign up with your email, complete your farm profile, and upload your crop reports for analysis. The analysis process typically takes just a few minutes.',
                },
                {
                  question: language === 'id' ? 'Apa yang terjadi setelah saya mencapai 2 laporan bulanan?' : language === 'ms' ? 'Apa yang terjadi setelah saya mencapai 2 laporan bulanan?' : 'What happens after I reach my 2 monthly reports?',
                  answer: language === 'id' ? 'Anda dapat terus menggunakan fitur lainnya seperti asisten AI Palmira untuk pertanyaan dan konsultasi. Anda dapat melihat dan membandingkan laporan analisis sebelumnya Anda kapan saja.' : language === 'ms' ? 'Anda boleh terus menggunakan ciri lain seperti pembantu AI Palmira untuk soalan dan perundingan. Anda boleh melihat dan membandingkan laporan analisis sebelumnya anda pada bila-bila masa.' : 'You can continue using other features like the Palmira AI assistant for questions and consultations. You can view and compare your previous analysis reports anytime.',
                },
                {
                  question: language === 'id' ? 'Apakah data saya aman?' : language === 'ms' ? 'Adakah data saya selamat?' : 'Is my data safe?',
                  answer: language === 'id' ? 'Ya, kami menggunakan enkripsi tingkat enterprise dan server aman Firebase untuk melindungi semua data pertanian Anda. Hanya Anda yang dapat mengakses informasi pribadi dan analisis Anda.' : language === 'ms' ? 'Ya, kami menggunakan enkripsi peringkat perusahaan dan pelayan selamat Firebase untuk melindungi semua data pertanian anda. Hanya anda boleh mengakses maklumat peribadi dan analisis anda.' : 'Yes, we use enterprise-grade encryption and secure Firebase servers to protect all your farm data. Only you can access your personal information and analyses.',
                },
                {
                  question: language === 'id' ? 'Bagaimana dengan dukungan?' : language === 'ms' ? 'Bagaimana tentang sokongan?' : 'What about support?',
                  answer: language === 'id' ? 'Hubungi kami melalui halaman kontak atau kirim email. Tim kami akan merespons secepat mungkin untuk membantu pertanyaan atau masalah Anda.' : language === 'ms' ? 'Hubungi kami melalui halaman hubungan atau hantar emel. Pasukan kami akan membalas secepat mungkin untuk membantu soalan atau masalah anda.' : 'Contact us through our contact page or send an email. Our team will respond as quickly as possible to help with your questions or issues.',
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border-2 border-green-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Main free access CTA */}
      <section className="relative py-24 bg-gradient-to-br from-green-900 via-green-800 to-green-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-dot-grid"></div>
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
              {language === 'id'
                ? 'Siap untuk Memulai?'
                : language === 'ms'
                ? 'Sedia untuk Memulai?'
                : 'Ready to Get Started?'}
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {language === 'id'
                ? 'Bergabunglah dengan ribuan petani di seluruh Asia yang sudah menggunakan CropDrive untuk hasil panen yang lebih baik.'
                : language === 'ms'
                ? 'Sertai ribuan petani di seluruh Asia yang sudah menggunakan CropDrive untuk hasil panen yang lebih baik.'
                : 'Join thousands of farmers across Asia already using CropDrive for better crop yields.'}
            </p>
            {!user ? (
              <Link href="/register">
                <button className="px-10 py-5 bg-yellow-400 text-green-900 rounded-lg font-bold uppercase text-base tracking-wider hover:bg-yellow-300 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105">
                  {language === 'id'
                    ? '🚀 Daftar Gratis Sekarang'
                    : language === 'ms'
                    ? '🚀 Daftar Gratis Sekarang'
                    : '🚀 Sign Up Free Now'}
                </button>
              </Link>
            ) : (
              <Link href="/assistant">
                <button className="px-10 py-5 bg-yellow-400 text-green-900 rounded-lg font-bold uppercase text-base tracking-wider hover:bg-yellow-300 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105">
                  {language === 'id'
                    ? '🤖 Mulai Analisis Sekarang'
                    : language === 'ms'
                    ? '🤖 Mulai Analisis Sekarang'
                    : '🤖 Start Analysis Now'}
                </button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

    </div>
  );
}
