'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function PrivacyPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

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
  const copy = (en: string, ms: string) => language === 'id' ? toIndonesianText(ms) : language === 'ms' ? ms : en;

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
              {copy('Privacy Policy', 'Dasar Privasi')}
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              {copy('Our commitment to protecting your privacy and personal data', 'Komitmen kami untuk melindungi privasi dan data peribadi anda')}
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
                    <div className="space-y-6 text-gray-700">
                      <p className="text-sm text-gray-500 mb-6">
                        {copy('Last updated: 30 December 2025', 'Kemaskini terakhir: 30 Disember 2025')}
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('1. Data controller', '1. Pengawal data')}</h2>
                      <p>{copy('AGS – Agriculture Global Solutions OÜ', 'AGS – Agriculture Global Solutions OÜ')}</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>{copy('Registered address:', 'Alamat berdaftar:')}</strong> Sakala tn 7-2, Kesklinna linnaosa, 10141 Tallinn, Harju maakond, Estonia</li>
                        <li><strong>{copy('Email:', 'E-mel:')}</strong> contact@agriglobalsolutions.com</li>
                        <li><strong>{copy('Phone:', 'Telefon:')}</strong> +49 15163105462</li>
                      </ul>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('2. Scope', '2. Skop')}</h2>
                      <p>{copy('This policy covers personal data processing on www.cropdrive.ai and related app pages.', 'Dasar ini meliputi pemprosesan data peribadi di www.cropdrive.ai dan halaman aplikasi berkaitan.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('3. Legal framework followed', '3. Rangka kerja undang-undang yang diikuti')}</h2>
                      <p>{copy('This website follows EU data protection rules.', 'Laman web ini mengikuti peraturan perlindungan data EU.')}</p>
                      <p>{copy('GDPR applies to personal data processing.', 'GDPR terpakai untuk pemprosesan data peribadi.')}</p>
                      <p>{copy('EU ePrivacy rules apply to device storage and similar technologies, see the separate ', 'Peraturan ePrivacy EU terpakai untuk storan peranti dan teknologi serupa, lihat ')}<Link href="/cookies" className="text-green-600 hover:text-green-700 font-semibold underline">{copy('Cookie Policy', 'Dasar Kuki')}</Link>{copy('.', '.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('4. Personal data collected', '4. Data peribadi yang dikumpul')}</h2>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('A. Account and login data', 'A. Data akaun dan log masuk')}</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>{copy('Email address.', 'Alamat e-mel.')}</li>
                        <li>{copy('Authentication status and security tokens handled through Firebase Authentication.', 'Status pengesahan dan token keselamatan yang dikendalikan melalui Firebase Authentication.')}</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('B. Service usage data', 'B. Data penggunaan perkhidmatan')}</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>{copy('Basic device and browser data.', 'Data peranti dan pelayar asas.')}</li>
                        <li>{copy('Page views and feature usage data collected through Vercel Web Analytics.', 'Paparan halaman dan data penggunaan ciri yang dikumpul melalui Vercel Web Analytics.')}</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('C. Customer support and contact data', 'C. Data sokongan pelanggan dan hubungan')}</h3>
                      <p>{copy('Name, email, phone number, message content, when you contact AGS through forms, email, or messaging.', 'Nama, e-mel, nombor telefon, kandungan mesej, apabila anda menghubungi AGS melalui borang, e-mel atau pemesejan.')}</p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('D. Payment flow data', 'D. Data aliran pembayaran')}</h3>
                      <p>{copy('Subscription purchase is handled on Stripe hosted checkout pages on stripe.com.', 'Pembelian langganan dikendalikan di halaman checkout yang dihoskan oleh Stripe di stripe.com.')}</p>
                      <p>{copy('Payment data is processed by Stripe on Stripe pages.', 'Data pembayaran diproses oleh Stripe di halaman Stripe.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('5. Purposes and legal basis', '5. Tujuan dan asas undang-undang')}</h2>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('A. Providing the service', 'A. Menyediakan perkhidmatan')}</h3>
                      <p><strong>{copy('Purpose:', 'Tujuan:')}</strong> {copy('create accounts, sign in, deliver app functions, provide requested outputs.', 'mencipta akaun, log masuk, menyampaikan fungsi aplikasi, menyediakan output yang diminta.')}</p>
                      <p><strong>{copy('Legal basis:', 'Asas undang-undang:')}</strong> {copy('performance of a contract or steps before a contract under GDPR Article 6(1)(b).', 'pelaksanaan kontrak atau langkah sebelum kontrak di bawah Perkara 6(1)(b) GDPR.')}</p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('B. Security and fraud prevention', 'B. Keselamatan dan pencegahan penipuan')}</h3>
                      <p><strong>{copy('Purpose:', 'Tujuan:')}</strong> {copy('protect accounts, prevent abuse, keep the service stable.', 'melindungi akaun, mencegah penyalahgunaan, mengekalkan kestabilan perkhidmatan.')}</p>
                      <p><strong>{copy('Legal basis:', 'Asas undang-undang:')}</strong> {copy('legitimate interests under GDPR Article 6(1)(f).', 'kepentingan sah di bawah Perkara 6(1)(f) GDPR.')}</p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('C. Product improvement and basic analytics', 'C. Penambahbaikan produk dan analitik asas')}</h3>
                      <p><strong>{copy('Purpose:', 'Tujuan:')}</strong> {copy('understand aggregated usage patterns, improve pages and features.', 'memahami corak penggunaan agregat, meningkatkan halaman dan ciri.')}</p>
                      <p><strong>{copy('Legal basis:', 'Asas undang-undang:')}</strong> {copy('legitimate interests under GDPR Article 6(1)(f), limited to privacy focused analytics described in this policy.', 'kepentingan sah di bawah Perkara 6(1)(f) GDPR, terhad kepada analitik berfokus privasi yang diterangkan dalam dasar ini.')}</p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('D. Payments and billing administration', 'D. Pentadbiran pembayaran dan pengebilan')}</h3>
                      <p><strong>{copy('Purpose:', 'Tujuan:')}</strong> {copy('enable subscriptions, handle payment confirmation, manage billing records required for business operations.', 'membolehkan langganan, mengendalikan pengesahan pembayaran, mengurus rekod pengebilan yang diperlukan untuk operasi perniagaan.')}</p>
                      <p><strong>{copy('Legal basis:', 'Asas undang-undang:')}</strong> {copy('performance of a contract under GDPR Article 6(1)(b), plus legal obligation under GDPR Article 6(1)(c) where bookkeeping or tax rules require recordkeeping.', 'pelaksanaan kontrak di bawah Perkara 6(1)(b) GDPR, ditambah kewajipan undang-undang di bawah Perkara 6(1)(c) GDPR apabila peraturan perakaunan atau cukai memerlukan penyimpanan rekod.')}</p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('E. Marketing communications', 'E. Komunikasi pemasaran')}</h3>
                      <p><strong>{copy('Purpose:', 'Tujuan:')}</strong> {copy('send marketing messages only when you opt in.', 'menghantar mesej pemasaran hanya apabila anda memilih untuk menyertai.')}</p>
                      <p><strong>{copy('Legal basis:', 'Asas undang-undang:')}</strong> {copy('consent under GDPR Article 6(1)(a), with withdrawal available at any time.', 'persetujuan di bawah Perkara 6(1)(a) GDPR, dengan penarikan tersedia pada bila-bila masa.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('6. Sharing and service providers', '6. Perkongsian dan penyedia perkhidmatan')}</h2>
                      <p>{copy('AGS shares personal data with service providers only for the purposes listed above.', 'AGS berkongsi data peribadi dengan penyedia perkhidmatan hanya untuk tujuan yang disenaraikan di atas.')}</p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('A. Hosting and analytics', 'A. Pengehosan dan analitik')}</h3>
                      <p>{copy('Vercel, for hosting and Vercel Web Analytics.', 'Vercel, untuk pengehosan dan Vercel Web Analytics.')}</p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('B. Authentication', 'B. Pengesahan')}</h3>
                      <p>{copy('Google Firebase, for sign in and account authentication.', 'Google Firebase, untuk log masuk dan pengesahan akaun.')}</p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('C. Payments', 'C. Pembayaran')}</h3>
                      <p>{copy('Stripe, for hosted checkout and payment processing on stripe.com.', 'Stripe, untuk checkout yang dihoskan dan pemprosesan pembayaran di stripe.com.')}</p>

                      <p className="mt-4">{copy('Each provider processes data under contractual terms for data protection and security.', 'Setiap penyedia memproses data di bawah terma kontrak untuk perlindungan data dan keselamatan.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('7. International data transfers', '7. Pemindahan data antarabangsa')}</h2>
                      <p>{copy('Some service providers process data outside the EEA.', 'Sesetengah penyedia perkhidmatan memproses data di luar EEA.')}</p>
                      <p>{copy('AGS uses EU transfer safeguards where required, including EU Standard Contractual Clauses under Commission Implementing Decision (EU) 2021/914.', 'AGS menggunakan perlindungan pemindahan EU apabila diperlukan, termasuk Klausa Kontrak Standard EU di bawah Keputusan Pelaksanaan Suruhanjaya (EU) 2021/914.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('8. Retention', '8. Penyimpanan')}</h2>
                      <p>{copy('AGS keeps personal data only for as long as needed for the purposes in section 5.', 'AGS menyimpan data peribadi hanya selama yang diperlukan untuk tujuan dalam bahagian 5.')}</p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('Operational data', 'Data operasi')}</h3>
                      <p>{copy('Account data is stored while an account remains active. Deletion follows a verified request or account removal flow.', 'Data akaun disimpan selagi akaun kekal aktif. Pemadaman mengikut permintaan yang disahkan atau aliran pembuangan akaun.')}</p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('Support communications', 'Komunikasi sokongan')}</h3>
                      <p>{copy('Support messages are stored for case handling and business records, then deleted or anonymised based on internal retention rules.', 'Mesej sokongan disimpan untuk pengendalian kes dan rekod perniagaan, kemudian dipadam atau dianonimkan berdasarkan peraturan penyimpanan dalaman.')}</p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('Billing records', 'Rekod pengebilan')}</h3>
                      <p>{copy('Billing and invoice related records are stored for statutory retention periods where required by law.', 'Rekod berkaitan pengebilan dan invois disimpan untuk tempoh penyimpanan berkanun apabila dikehendaki oleh undang-undang.')}</p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Stripe</h3>
                      <p>{copy('Payment card data is handled by Stripe on Stripe pages, under Stripe retention rules.', 'Data kad pembayaran dikendalikan oleh Stripe di halaman Stripe, di bawah peraturan penyimpanan Stripe.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('9. Your rights under GDPR', '9. Hak anda di bawah GDPR')}</h2>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>{copy('Access.', 'Akses.')}</li>
                        <li>{copy('Rectification.', 'Pembetulan.')}</li>
                        <li>{copy('Erasure.', 'Pemadaman.')}</li>
                        <li>{copy('Restriction.', 'Sekatan.')}</li>
                        <li>{copy('Data portability.', 'Kebolehpindahan data.')}</li>
                        <li>{copy('Objection to processing based on legitimate interests.', 'Bantahan terhadap pemprosesan berdasarkan kepentingan sah.')}</li>
                        <li>{copy('Withdrawal of consent, where processing is based on consent.', 'Penarikan persetujuan, apabila pemprosesan berdasarkan persetujuan.')}</li>
                      </ul>
                      <p className="mt-4">{copy('Rights are exercised by emailing contact@agriglobalsolutions.com.', 'Hak dilaksanakan dengan menghantar e-mel ke contact@agriglobalsolutions.com.')}</p>
                      <p>{copy('AGS verifies identity before releasing or deleting account data.', 'AGS mengesahkan identiti sebelum melepaskan atau memadam data akaun.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('10. Complaints', '10. Aduan')}</h2>
                      <p>{copy('A complaint can be filed with a supervisory authority in the EU.', 'Aduan boleh difailkan kepada pihak berkuasa penyeliaan di EU.')}</p>
                      <p>{copy('A complaint can be filed in the EU Member State of habitual residence, place of work, or place of the alleged infringement, under GDPR Article 77.', 'Aduan boleh difailkan di Negara Ahli EU tempat kediaman biasa, tempat kerja atau tempat pelanggaran yang didakwa, di bawah Perkara 77 GDPR.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('11. Automated decision making', '11. Pembuatan keputusan automatik')}</h2>
                      <p>{copy('CropDrive generates agronomic outputs for decision support.', 'CropDrive menjana output agronomi untuk sokongan keputusan.')}</p>
                      <p>{copy('No solely automated decision with legal or similarly significant effect is used for access, pricing, or eligibility.', 'Tiada keputusan automatik semata-mata dengan kesan undang-undang atau kesan yang sama pentingnya digunakan untuk akses, harga atau kelayakan.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('12. Security', '12. Keselamatan')}</h2>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>{copy('Transport encryption is used for website traffic.', 'Penyulitan pengangkutan digunakan untuk trafik laman web.')}</li>
                        <li>{copy('Access to internal systems is restricted to authorised personnel.', 'Akses kepada sistem dalaman terhad kepada kakitangan yang diberi kuasa.')}</li>
                        <li>{copy('Service providers apply security controls for hosting, authentication, and payments.', 'Penyedia perkhidmatan menggunakan kawalan keselamatan untuk pengehosan, pengesahan dan pembayaran.')}</li>
                      </ul>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('13. Children', '13. Kanak-kanak')}</h2>
                      <p>{copy('The service is intended for adults.', 'Perkhidmatan ini ditujukan untuk orang dewasa.')}</p>
                      <p>{copy('AGS does not knowingly collect personal data from children under 16.', 'AGS tidak sengaja mengumpul data peribadi daripada kanak-kanak di bawah 16 tahun.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('14. Changes', '14. Perubahan')}</h2>
                      <p>{copy('Updates are posted on this page with a revised "Last updated" date.', 'Kemaskini disiarkan di halaman ini dengan tarikh "Kemaskini terakhir" yang disemak.')}</p>
                    </div>
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
              {copy('Back to Home', 'Kembali ke Laman Utama')}
            </button>
          </Link>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
