'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import Card, { CardContent } from '@/components/ui/Card';

export default function CookiesPage() {
  const { language } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-palm-50 via-white to-gold-50">
      {/* Hero Section with Dark Background for Navbar Visibility */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white pt-32 pb-20 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-green-400/20 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 rounded-2xl mb-6 shadow-2xl">
              <svg className="w-12 h-12 text-green-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 font-heading">
              {language === 'ms' ? 'Dasar Kuki' : 'Cookie Policy'}
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms' 
                ? 'Maklumat tentang penggunaan kuki di platform kami'
                : 'Information about cookie usage on our platform'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="mb-8 bg-white/70 backdrop-blur-xl border-2 border-green-100 shadow-2xl">
                <CardContent className="p-8 md:p-12">
                  <div className="prose prose-lg max-w-none">
                    {language === 'ms' ? (
                      <div className="space-y-6 text-gray-700">
                        <p>
                          CropDrive OP Advisor™ ("kami", "kita", atau "platform kami") menggunakan kuki dan teknologi penjejakan yang serupa untuk meningkatkan pengalaman anda di platform kami. Dasar Kuki ini menerangkan bagaimana kami menggunakan kuki dan teknologi serupa.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Apakah Kuki?</h2>
                        <p>
                          Kuki adalah fail teks kecil yang diletakkan pada peranti anda apabila anda melayari laman web. Kuki membantu laman web mengingati maklumat tentang lawatan anda, seperti pilihan bahasa dan keutamaan anda.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Jenis Kuki yang Kami Gunakan</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Kuki Penting</h3>
                        <p>
                          Kuki ini diperlukan untuk platform berfungsi dengan betul. Tanpa kuki ini, beberapa ciri mungkin tidak tersedia.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Kuki sesi untuk autentikasi pengguna</li>
                          <li>Kuki keselamatan untuk melindungi daripada serangan</li>
                          <li>Kuki pilihan bahasa</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Kuki Analitik</h3>
                        <p>
                          Kuki ini membantu kami memahami bagaimana pengguna berinteraksi dengan platform kami. Kami menggunakan perkhidmatan seperti Google Analytics untuk mengumpul data ini.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Menganalisis lalu lintas laman web</li>
                          <li>Memahami tingkah laku pengguna</li>
                          <li>Meningkatkan pengalaman pengguna</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Kuki Prestasi</h3>
                        <p>
                          Kuki ini membantu kami meningkatkan prestasi platform dengan mengingati pilihan anda dan mengoptimumkan muatan halaman.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Menguruskan Kuki</h2>
                        <p>
                          Anda boleh mengawal dan menguruskan kuki melalui tetapan pelayar web anda. Kebanyakan pelayar membenarkan anda untuk:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Melihat kuki yang disimpan</li>
                          <li>Memadam kuki</li>
                          <li>Menyekat kuki dari laman web tertentu</li>
                          <li>Menyekat semua kuki</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Kuki Pihak Ketiga</h2>
                        <p>
                          Kami juga menggunakan perkhidmatan pihak ketiga yang mungkin meletakkan kuki pada peranti anda:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Google Analytics untuk analisis</li>
                          <li>Stripe untuk pemprosesan pembayaran</li>
                          <li>Firebase untuk autentikasi dan penyimpanan data</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Perubahan kepada Dasar Ini</h2>
                        <p>
                          Kami mungkin mengemaskini Dasar Kuki ini dari semasa ke semasa. Kami akan memberitahu anda tentang perubahan ketara melalui email atau notis dalam platform.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Hubungi Kami</h2>
                        <p>
                          Jika anda mempunyai sebarang pertanyaan tentang Dasar Kuki ini, sila hubungi kami:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Email: contact@agriglobalsolutions.com</li>
                          <li>WhatsApp: +60123456789</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="space-y-6 text-gray-700">
                        <p>
                          CropDrive OP Advisor™ ("we", "us", or "our platform") uses cookies and similar tracking technologies to enhance your experience on our platform. This Cookie Policy explains how we use cookies and similar technologies.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What Are Cookies?</h2>
                        <p>
                          Cookies are small text files that are placed on your device when you visit a website. Cookies help websites remember information about your visit, such as your language preferences and settings.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Types of Cookies We Use</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Essential Cookies</h3>
                        <p>
                          These cookies are necessary for the platform to function properly. Without these cookies, some features may not be available.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Session cookies for user authentication</li>
                          <li>Security cookies to protect against attacks</li>
                          <li>Language preference cookies</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Analytics Cookies</h3>
                        <p>
                          These cookies help us understand how users interact with our platform. We use services like Google Analytics to collect this data.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Analyzing website traffic</li>
                          <li>Understanding user behavior</li>
                          <li>Improving user experience</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Performance Cookies</h3>
                        <p>
                          These cookies help us improve platform performance by remembering your preferences and optimizing page loads.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Managing Cookies</h2>
                        <p>
                          You can control and manage cookies through your web browser settings. Most browsers allow you to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>View stored cookies</li>
                          <li>Delete cookies</li>
                          <li>Block cookies from specific websites</li>
                          <li>Block all cookies</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Third-Party Cookies</h2>
                        <p>
                          We also use third-party services that may place cookies on your device:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Google Analytics for analytics</li>
                          <li>Stripe for payment processing</li>
                          <li>Firebase for authentication and data storage</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Changes to This Policy</h2>
                        <p>
                          We may update this Cookie Policy from time to time. We will notify you of significant changes through email or platform notices.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Us</h2>
                        <p>
                          If you have any questions about this Cookie Policy, please contact us:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Email: contact@agriglobalsolutions.com</li>
                          <li>WhatsApp: +60123456789</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-16"
          >
            <Link href="/">
              <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-full hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {language === 'ms' ? 'Kembali ke Laman Utama' : 'Back to Home'}
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

