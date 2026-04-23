'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';

export default function AboutUsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const { language } = useTranslation(currentLanguage);
  const copy = (en: string, ms: string) => language === 'id' ? toIndonesianText(ms) : language === 'ms' ? ms : en;

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-16 xs:py-20 sm:py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 xs:mb-8 leading-tight font-heading px-2">
              {copy('About', 'Tentang')} <span className="text-yellow-400">{copy('Us', 'Kami')}</span>
            </h1>
            <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-white/90 mb-8 xs:mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-3 xs:px-4">
              {copy('Empowering Malaysian farmers with AI technology for better palm oil farming', 'Memperkasakan petani Malaysia dengan teknologi AI untuk pertanian kelapa sawit yang lebih baik')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* About CropDrive Section */}
      <section className="py-12 xs:py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          {/* Top Intro Block */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12 xs:mb-16"
          >
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-base xs:text-lg sm:text-xl text-gray-700 leading-relaxed font-body">
                {copy('Smallholder farmers produce a large share of Malaysia\'s oil palm, yet yields on many smallholdings stay far below what the crop can deliver. CropDrive Oil Palm Advisor™ exists to close this yield gap so farmers earn more from the land they already manage. When productivity rises on existing planted areas, the industry reduces pressure to expand into new land. This supports sustainable oil palm and helps reduce deforestation.', 'Petani kecil menghasilkan bahagian besar kelapa sawit Malaysia, namun hasil di banyak pekebun kecil kekal jauh di bawah apa yang tanaman ini boleh hasilkan. CropDrive Oil Palm Advisor™ wujud untuk menutup jurang hasil ini supaya petani memperoleh lebih banyak daripada tanah yang mereka sudah uruskan. Apabila produktiviti meningkat di kawasan yang sudah ditanam, industri mengurangkan tekanan untuk berkembang ke tanah baharu. Ini menyokong kelapa sawit lestari dan membantu mengurangkan penebangan hutan.')}
              </p>
            </div>
          </motion.div>

          {/* About-Us Image Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12 xs:mb-16"
          >
            <div className="max-w-3xl mx-auto">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-4 sm:p-6 shadow-lg border border-green-100">
                <div className="relative rounded-xl overflow-hidden">
                  <Image
                    src="/images/About-Us.png"
                    alt="About CropDrive"
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Our First Product */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12 xs:mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black text-gray-900 mb-6 font-heading tracking-tight">
                {copy('Our First Product', 'Produk Pertama Kami')}
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-body">
                {copy('CropDrive Oil Palm Advisor™ is built for practical farm decisions. You get clear, farm specific actions to improve soil conditions, optimise fertiliser use, and prioritise the changes that lift yield. The goal is higher yields, better returns, and less nutrient loss to the environment. We do not sell fertilisers, so recommendations are not driven by fertiliser sales.', 'CropDrive Oil Palm Advisor™ dibina untuk keputusan ladang praktikal. Anda mendapat tindakan yang jelas dan khusus ladang untuk memperbaiki keadaan tanah, mengoptimumkan penggunaan baja, dan mengutamakan perubahan yang meningkatkan hasil. Matlamatnya adalah hasil yang lebih tinggi, pulangan yang lebih baik, dan kurang kehilangan nutrien kepada alam sekitar. Kami tidak menjual baja, jadi cadangan tidak didorong oleh jualan baja.')}
              </p>
            </div>
          </motion.div>

          {/* Our Team */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12 xs:mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black text-gray-900 mb-6 font-heading tracking-tight">
                {copy('Our Team', 'Pasukan Kami')}
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-body mb-6">
                {copy('CropDrive Oil Palm Advisor™ is developed by AGS – Agriculture Global Solutions, based in Germany and operating globally, and led and managed by Dr. Alexander Loladze. We are one international team working across Germany, Malaysia, Australia, and the Philippines, combining agronomy, product development, data work, and farmer support to improve yields on existing oil palm land, raise farmer income, and strengthen sustainable production with less pressure for land expansion and deforestation.', 'CropDrive Oil Palm Advisor™ dibangunkan oleh AGS – Agriculture Global Solutions, berpangkalan di Jerman dan beroperasi di seluruh dunia, dan diketuai serta diuruskan oleh Dr. Alexander Loladze. Kami adalah satu pasukan antarabangsa yang bekerja di Jerman, Malaysia, Australia, dan Filipina, menggabungkan agronomi, pembangunan produk, kerja data, dan sokongan petani untuk meningkatkan hasil di tanah kelapa sawit sedia ada, meningkatkan pendapatan petani, dan mengukuhkan pengeluaran lestari dengan kurang tekanan untuk pengembangan tanah dan penebangan hutan.')}
              </p>
              <div className="mt-6">
                <a
                  href="https://www.agriglobalsolutions.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {copy('Visit AGS – Agriculture Global Solutions', 'Lawati AGS – Agriculture Global Solutions')}
                  <svg className="inline-block w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Our Future */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12 xs:mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black text-gray-900 mb-6 font-heading tracking-tight">
                {copy('Our Future', 'Masa Depan Kami')}
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-body">
                {copy('We will extend the same yield focused approach to other crops, starting with cocoa and coffee. The principle stays the same, improve productivity on existing farmland so smallholder farmers earn more from the land they already manage. This supports sustainable production and reduces pressure for land expansion and deforestation.', 'Kami akan memperluaskan pendekatan yang sama yang memberi tumpuan kepada hasil kepada tanaman lain, bermula dengan koko dan kopi. Prinsipnya tetap sama, meningkatkan produktiviti di tanah pertanian sedia ada supaya petani kecil memperoleh lebih banyak daripada tanah yang mereka sudah uruskan. Ini menyokong pengeluaran lestari dan mengurangkan tekanan untuk pengembangan tanah dan penebangan hutan.')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 xs:py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-3 xs:mb-4 font-heading px-2">
              {copy('Our', 'Nilai')} <span className="text-green-700">{copy('Values', 'Kami')}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                img: '/images/our-values/Precision.png',
                title: copy('Accuracy', 'Ketepatan'),
                desc: copy('Using MPOB guidelines and latest AI, guided by global Good Agricultural Practices (GAP) for accurate analysis', 'Menggunakan garis panduan MPOB dan AI terkini, berpandukan Amalan Pertanian Baik (GAP) global untuk analisis yang tepat')
              },
              {
                img: '/images/our-values/Accessibility.png',
                title: copy('Accessibility', 'Kebolehcapaian'),
                desc: copy('Making AI technology easy and affordable for all farmers', 'Menjadikan teknologi AI mudah dan mampu milik untuk semua petani')
              },
              {
                img: '/images/our-values/Sustainability .png',
                title: copy('Sustainability', 'Kemampanan'),
                desc: copy('Promoting regenerative farming practices for a better future', 'Mempromosikan amalan pertanian regeneratif untuk masa depan yang lebih baik')
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 relative">
                  <Image
                    src={value.img}
                    alt={value.title}
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 font-heading">
                  {value.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-body">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-heading">
              {copy('Join Us Today', 'Sertai Kami Hari Ini')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 font-body">
              {copy('Be part of the smart farming revolution', 'Jadilah sebahagian daripada revolusi pertanian pintar')}
            </p>
            <Link href="/register">
              <button className="px-10 py-5 bg-gradient-to-r from-green-600 to-green-700 text-white font-black rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 uppercase tracking-wide">
                {copy('Get Started Now', 'Mulakan Sekarang')}
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

