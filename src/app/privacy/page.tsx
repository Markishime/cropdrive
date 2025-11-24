'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function PrivacyPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ms'>('en');

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

  const { language, t } = useTranslation(mounted ? currentLanguage : 'en');

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 font-heading">
              {language === 'ms' ? 'Dasar Privasi' : 'Privacy Policy'}
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms' 
                ? 'Komitmen kami untuk melindungi privasi dan data peribadi anda'
                : 'Our commitment to protecting your privacy and personal data'
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
                          CropDrive OP Advisor™ ("kami", "kita", atau "platform kami") menghormati privasi anda dan komited untuk melindungi maklumat peribadi anda. Dasar Privasi ini menerangkan bagaimana kami mengumpul, menggunakan, mendedahkan, dan melindungi maklumat anda apabila anda menggunakan platform kami.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Maklumat yang Kami Kumpul</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Maklumat Akaun</h3>
                        <p>
                          Apabila anda mendaftar akaun, kami mengumpul:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Nama penuh</li>
                          <li>Alamat email</li>
                          <li>Nombor telefon (pilihan)</li>
                          <li>Nama ladang (pilihan)</li>
                          <li>Lokasi ladang (pilihan)</li>
                          <li>Pilihan bahasa</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Data Muat Naik</h3>
                        <p>
                          Apabila anda memuat naik laporan makmal:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Fail PDF, gambar, atau dokumen</li>
                          <li>Metadata fail (saiz, tarikh, jenis)</li>
                          <li>Keputusan analisis AI</li>
                          <li>Rekod penggunaan platform</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Maklumat Teknikal</h3>
                        <p>
                          Kami secara automatik mengumpul:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Alamat IP dan maklumat peranti</li>
                          <li>Data penggunaan dan analitik</li>
                          <li>Kuki dan teknologi penjejakan</li>
                          <li>Maklumat log pelayan</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Bagaimana Kami Menggunakan Maklumat Anda</h2>

                        <p>Kami menggunakan maklumat anda untuk:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Menyediakan dan mengekalkan platform</li>
                          <li>Memproses dan menganalisis muat naik anda</li>
                          <li>Menghantar cadangan AI dan laporan</li>
                          <li>Mengurus langganan dan pembayaran</li>
                          <li>Memberikan sokongan pelanggan</li>
                          <li>Meningkatkan platform dan perkhidmatan</li>
                          <li>Mematuhi obligasi undang-undang</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Perkongsian Maklumat</h2>

                        <p>
                          Kami tidak menjual, menyewa, atau memajak maklumat peribadi anda kepada pihak ketiga. Kami hanya berkongsi maklumat dalam situasi berikut:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Dengan pembekal perkhidmatan yang membantu operasi platform</li>
                          <li>Dengan rakan kongsi teknologi (seperti Google Document AI untuk pemprosesan PDF)</li>
                          <li>Apabila dikehendaki oleh undang-undang</li>
                          <li>Dalam kes penipuan atau keselamatan</li>
                          <li>Dengan kebenaran nyata anda</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Keselamatan Data</h2>

                        <p>
                          Kami melaksanakan langkah-langkah keselamatan yang sesuai untuk melindungi maklumat anda:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Enkripsi data dalam transit dan rehat</li>
                          <li>Kawalan akses berasaskan peranan</li>
                          <li>Audit keselamatan tetap</li>
                          <li>Pematuhan standard industri</li>
                          <li>Kemaskini keselamatan berkala</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Hak Anda</h2>

                        <p>Anda mempunyai hak berikut berkenaan data peribadi anda:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Akses dan kemaskini maklumat anda</li>
                          <li>Meminta penghapusan data</li>
                          <li>Membantah pemprosesan</li>
                          <li>Meminta pemindahan data</li>
                          <li>Menarik balik kebenaran</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Pengekalan Data</h2>

                        <p>
                          Kami menyimpan maklumat anda selama yang diperlukan untuk tujuan yang dinyatakan atau seperti yang dikehendaki oleh undang-undang. Data langganan biasanya disimpan selama 7 tahun untuk tujuan cukai dan perakaunan.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Kuki dan Teknologi Penjejakan</h2>

                        <p>
                          Kami menggunakan kuki dan teknologi serupa untuk meningkatkan pengalaman anda. Anda boleh mengawal tetapan kuki melalui pelayar web anda.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Perubahan kepada Dasar Ini</h2>

                        <p>
                          Kami mungkin mengemaskini Dasar Privasi ini dari semasa ke semasa. Kami akan memberitahu anda tentang perubahan ketara melalui email atau notis dalam platform.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Hubungi Kami</h2>

                        <p>
                          Jika anda mempunyai sebarang pertanyaan tentang Dasar Privasi ini, sila hubungi kami:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Email: privacy@cropdrive.com</li>
                          <li>WhatsApp: +60123456789</li>
                          <li>Alamat: [Alamat pejabat]</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="space-y-6 text-gray-700">
                        <p>
                          CropDrive OP Advisor™ ("we", "us", or "our platform") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Information We Collect</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Account Information</h3>
                        <p>
                          When you register an account, we collect:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Full name</li>
                          <li>Email address</li>
                          <li>Phone number (optional)</li>
                          <li>Farm name (optional)</li>
                          <li>Farm location (optional)</li>
                          <li>Language preference</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Upload Data</h3>
                        <p>
                          When you upload lab reports:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>PDF files, images, or documents</li>
                          <li>File metadata (size, date, type)</li>
                          <li>AI analysis results</li>
                          <li>Platform usage records</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Technical Information</h3>
                        <p>
                          We automatically collect:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>IP address and device information</li>
                          <li>Usage data and analytics</li>
                          <li>Cookies and tracking technologies</li>
                          <li>Server log information</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>

                        <p>We use your information to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Provide and maintain the platform</li>
                          <li>Process and analyze your uploads</li>
                          <li>Deliver AI recommendations and reports</li>
                          <li>Manage subscriptions and payments</li>
                          <li>Provide customer support</li>
                          <li>Improve the platform and services</li>
                          <li>Comply with legal obligations</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Information Sharing</h2>

                        <p>
                          We do not sell, rent, or lease your personal information to third parties. We only share information in the following circumstances:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>With service providers who assist platform operations</li>
                          <li>With technology partners (such as Google Document AI for PDF processing)</li>
                          <li>When required by law</li>
                          <li>In cases of fraud or security</li>
                          <li>With your explicit consent</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Data Security</h2>

                        <p>
                          We implement appropriate security measures to protect your information:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Encryption of data in transit and at rest</li>
                          <li>Role-based access controls</li>
                          <li>Regular security audits</li>
                          <li>Industry standard compliance</li>
                          <li>Regular security updates</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Your Rights</h2>

                        <p>You have the following rights regarding your personal data:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Access and update your information</li>
                          <li>Request data deletion</li>
                          <li>Object to processing</li>
                          <li>Request data portability</li>
                          <li>Withdraw consent</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Data Retention</h2>

                        <p>
                          We retain your information for as long as necessary for the stated purposes or as required by law. Subscription data is typically retained for 7 years for tax and accounting purposes.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Cookies and Tracking Technologies</h2>

                        <p>
                          We use cookies and similar technologies to enhance your experience. You can control cookie settings through your web browser.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Changes to This Policy</h2>

                        <p>
                          We may update this Privacy Policy from time to time. We will notify you of significant changes through email or platform notices.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Us</h2>

                        <p>
                          If you have any questions about this Privacy Policy, please contact us:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Email: privacy@cropdrive.com</li>
                          <li>WhatsApp: +60123456789</li>
                          <li>Address: [Office address]</li>
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
