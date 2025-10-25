'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function TermsPage() {
  const { language, t } = useTranslation();

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {language === 'ms' ? 'Syarat Perkhidmatan' : 'Terms of Service'}
            </h1>
            <p className="text-gray-600">
              {language === 'ms' ? 'Terakhir dikemaskini: Januari 2024' : 'Last updated: January 2024'}
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                {language === 'ms' ? (
                  <div className="space-y-6 text-gray-700">
                    <p>
                      Syarat Perkhidmatan ini ("Syarat") mengawal penggunaan anda terhadap platform CropDrive OP Advisor™ ("Platform") yang dikendalikan oleh CropDrive OP Advisor™ ("kami", "kita", atau "milik kami"). Dengan mengakses atau menggunakan Platform, anda bersetuju untuk terikat dengan Syarat ini.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Penerimaan Syarat</h2>

                    <p>
                      Dengan mendaftar, mengakses, atau menggunakan Platform, anda mengakui bahawa anda telah membaca, memahami, dan bersetuju untuk terikat dengan Syarat ini. Jika anda tidak bersetuju dengan mana-mana bahagian Syarat ini, anda tidak boleh menggunakan Platform.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Penerangan Perkhidmatan</h2>

                    <p>
                      CropDrive OP Advisor™ menyediakan platform AI untuk analisis ladang kelapa sawit, termasuk:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Analisis AI laporan tanah dan daun</li>
                      <li>Cadangan agronomi diperibadikan</li>
                      <li>Laporan dan visualisasi trend</li>
                      <li>Sokongan pakar melalui WhatsApp dan email</li>
                      <li>Platform pengurusan ladang berasaskan langganan</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Akaun Pengguna</h2>

                    <p>Untuk menggunakan Platform, anda mestilah:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Berumur sekurang-kurangnya 18 tahun</li>
                      <li>Menyediakan maklumat yang benar dan terkini</li>
                      <li>Mengekalkan kerahsiaan kata laluan anda</li>
                      <li>Bertanggungjawab terhadap semua aktiviti akaun anda</li>
                      <li>Memberitahu kami tentang penggunaan tanpa kebenaran</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Langganan dan Pembayaran</h2>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Pelan Langganan</h3>
                    <p>
                      Platform menawarkan pelan langganan berbeza dengan ciri dan had yang berbeza. Harga dan ciri boleh berubah dengan notis 30 hari.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Pembayaran</h3>
                    <p>
                      Semua pembayaran diproses melalui Stripe dan dibilkan dalam Euro (€). Harga dalam Ringgit Malaysia adalah untuk rujukan sahaja.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Pembaharuan Automatik</h3>
                    <p>
                      Langganan diperbaharui secara automatik melainkan dibatalkan. Anda boleh membatalkan pada bila-bila masa, tetapi akses akan kekal sehingga akhir tempoh bil semasa.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Penggunaan Boleh Diterima</h2>

                    <p>Anda bersetuju untuk:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Menggunakan Platform hanya untuk tujuan yang sah</li>
                      <li>Tidak memuat naik kandungan yang menyalahi undang-undang atau berbahaya</li>
                      <li>Tidak cuba mengakses sistem tanpa kebenaran</li>
                      <li>Tidak menggunakan Platform untuk aktiviti penipuan</li>
                      <li>Menghormati hak harta intelek orang lain</li>
                      <li>Tidak berkongsi akaun anda dengan orang lain</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Harta Intelek</h2>

                    <p>
                      Platform dan kandungannya adalah hak milik eksklusif CropDrive OP Advisor™. Anda diberi lesen terhad untuk menggunakan Platform mengikut Syarat ini.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Penafian Waranti</h2>

                    <p>
                      Platform disediakan "sebagaimana adanya" tanpa waranti apa-apa jenis. Kami tidak menjamin bahawa Platform akan bebas ralat atau tersedia secara berterusan.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Had Liabiliti</h2>

                    <p>
                      Dalam tiada keadaan pun kami akan bertanggungjawab terhadap sebarang kerosakan tidak langsung, sampingan, atau berbangkit yang timbul daripada penggunaan Platform.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Pembayaran Balik</h2>

                    <p>
                      Kami menawarkan jaminan kepuasan 30 hari untuk langganan baharu. Hubungi sokongan untuk permintaan pembayaran balik dalam tempoh ini.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Penamatan</h2>

                    <p>
                      Kami boleh menamatkan akaun anda jika anda melanggar Syarat ini. Anda boleh menamatkan akaun anda pada bila-bila masa dengan menghubungi sokongan.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Undang-undang Terpakai</h2>

                    <p>
                      Syarat ini tertakluk kepada undang-undang Malaysia. Sebarang pertikaian akan diselesaikan melalui mahkamah Malaysia.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Perubahan Syarat</h2>

                    <p>
                      Kami boleh mengemaskini Syarat ini dari semasa ke semasa. Perubahan ketara akan dimaklumkan melalui email atau notis dalam Platform.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Hubungi Kami</h2>

                    <p>
                      Jika anda mempunyai sebarang pertanyaan tentang Syarat ini, sila hubungi kami:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Email: legal@cropdrive.com</li>
                      <li>WhatsApp: +60123456789</li>
                      <li>Alamat: [Alamat pejabat]</li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-6 text-gray-700">
                    <p>
                      These Terms of Service ("Terms") govern your use of the CropDrive OP Advisor™ platform ("Platform") operated by CropDrive OP Advisor™ ("we", "us", or "our"). By accessing or using the Platform, you agree to be bound by these Terms.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Acceptance of Terms</h2>

                    <p>
                      By registering, accessing, or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree with any part of these Terms, you may not use the Platform.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Description of Service</h2>

                    <p>
                      CropDrive OP Advisor™ provides an AI platform for palm oil farm analysis, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>AI analysis of soil and leaf reports</li>
                      <li>Personalized agronomy recommendations</li>
                      <li>Reports and trend visualizations</li>
                      <li>Expert support via WhatsApp and email</li>
                      <li>Subscription-based farm management platform</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">User Accounts</h2>

                    <p>To use the Platform, you must:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Be at least 18 years old</li>
                      <li>Provide accurate and current information</li>
                      <li>Maintain the confidentiality of your password</li>
                      <li>Be responsible for all account activities</li>
                      <li>Notify us of unauthorized use</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Subscriptions and Payments</h2>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Subscription Plans</h3>
                    <p>
                      The Platform offers different subscription plans with varying features and limits. Pricing and features are subject to change with 30 days notice.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Payments</h3>
                    <p>
                      All payments are processed through Stripe and charged in Euros (€). Malaysian Ringgit pricing is for reference only.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Automatic Renewal</h3>
                    <p>
                      Subscriptions automatically renew unless canceled. You may cancel at any time, but access will remain until the end of the current billing period.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Acceptable Use</h2>

                    <p>You agree to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Use the Platform only for lawful purposes</li>
                      <li>Not upload illegal or harmful content</li>
                      <li>Not attempt to access systems without authorization</li>
                      <li>Not use the Platform for fraudulent activities</li>
                      <li>Respect the intellectual property rights of others</li>
                      <li>Not share your account with others</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Intellectual Property</h2>

                    <p>
                      The Platform and its content are the exclusive property of CropDrive OP Advisor™. You are granted a limited license to use the Platform in accordance with these Terms.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Disclaimer of Warranties</h2>

                    <p>
                      The Platform is provided "as is" without any warranties. We do not guarantee that the Platform will be error-free or continuously available.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Limitation of Liability</h2>

                    <p>
                      In no event shall we be liable for any indirect, incidental, or consequential damages arising from the use of the Platform.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Refunds</h2>

                    <p>
                      We offer a 30-day satisfaction guarantee for new subscriptions. Contact support for refund requests within this period.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Termination</h2>

                    <p>
                      We may terminate your account if you violate these Terms. You may terminate your account at any time by contacting support.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Governing Law</h2>

                    <p>
                      These Terms are governed by Malaysian law. Any disputes will be resolved through Malaysian courts.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Changes to Terms</h2>

                    <p>
                      We may update these Terms from time to time. Significant changes will be communicated through email or Platform notices.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Us</h2>

                    <p>
                      If you have any questions about these Terms, please contact us:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Email: legal@cropdrive.com</li>
                      <li>WhatsApp: +60123456789</li>
                      <li>Address: [Office address]</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
              ← {language === 'ms' ? 'Kembali ke Laman Utama' : 'Back to Home'}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
