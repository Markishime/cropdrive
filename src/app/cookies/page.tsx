'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';
import Card, { CardContent } from '@/components/ui/Card';

export default function CookiesPage() {
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

  const { language } = useTranslation(mounted ? currentLanguage : 'en');
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 font-heading">
              {copy('Cookie Policy', 'Dasar Kuki')}
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              {copy('Information about cookie usage on our platform', 'Maklumat tentang penggunaan kuki di platform kami')}
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
                        {copy('Last updated: 29 December 2025', 'Kemaskini terakhir: 29 Disember 2025')}
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('1. Who runs this website', '1. Siapa yang mengendalikan laman web ini')}</h2>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>{copy('Website:', 'Laman web:')}</strong> www.cropdrive.ai</li>
                        <li><strong>{copy('Operator:', 'Pengendali:')}</strong> AGS – Agriculture Global Solutions OÜ</li>
                        <li><strong>{copy('Email:', 'E-mel:')}</strong> contact@agriglobalsolutions.com</li>
                        <li><strong>{copy('Address:', 'Alamat:')}</strong> Sakala tn 7-2, Kesklinna linnaosa, 10141 Tallinn, Harju maakond, Estonia</li>
                      </ul>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('2. Legal standard', '2. Standard undang-undang')}</h2>
                      <p>{copy('This website follows the EU device storage rules.', 'Laman web ini mengikuti peraturan penyimpanan peranti EU.')}</p>
                      <p>{copy('EU ePrivacy Directive 2002/58/EC, Article 5(3), covers storing information on a user device and accessing information already stored on a user device.', 'Arahan ePrivacy EU 2002/58/EC, Perkara 5(3), meliputi penyimpanan maklumat pada peranti pengguna dan mengakses maklumat yang sudah disimpan pada peranti pengguna.')}</p>
                      <p>{copy('Where data links to an identifiable person, GDPR applies, including consent rules in Articles 4(11) and 7, and transparency duties in Article 13.', 'Apabila data dikaitkan dengan individu yang boleh dikenal pasti, GDPR terpakai, termasuk peraturan persetujuan dalam Perkara 4(11) dan 7, serta kewajipan ketelusan dalam Perkara 13.')}</p>
                      <p>{copy('The Planet49 ruling confirms that pre-ticked boxes do not count as consent and that the device storage rule applies regardless of whether the stored information qualifies as personal data.', 'Keputusan Planet49 mengesahkan bahawa kotak yang telah ditanda awal tidak dikira sebagai persetujuan dan peraturan penyimpanan peranti terpakai tanpa mengira sama ada maklumat yang disimpan layak sebagai data peribadi.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('3. What cookies are', '3. Apa itu kuki')}</h2>
                      <p>{copy('Cookies are small text files stored by a website on your device.', 'Kuki ialah fail teks kecil yang disimpan oleh laman web pada peranti anda.')}</p>
                      <p>{copy('This policy also covers similar technologies, such as local storage, session storage, and comparable browser storage.', 'Dasar ini juga meliputi teknologi serupa, seperti storan tempatan, storan sesi dan storan pelayar yang setanding.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('4. What we use on www.cropdrive.ai', '4. Apa yang kami gunakan di www.cropdrive.ai')}</h2>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('4.1 Strictly necessary storage', '4.1 Storan yang sangat diperlukan')}</h3>
                      <p>{copy('These items support functions you request, such as sign-in, language, and basic interface settings.', 'Item ini menyokong fungsi yang anda minta, seperti log masuk, bahasa dan tetapan antara muka asas.')}</p>

                      <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">{copy('Local storage', 'Storan tempatan')}</h4>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>cropdrive-language</strong><br />
                          {copy('Purpose: remembers your language choice.', 'Tujuan: mengingati pilihan bahasa anda.')}<br />
                          {copy('Storage: until you delete site data in your browser, or you change the language.', 'Storan: sehingga anda memadam data laman dalam pelayar anda, atau anda menukar bahasa.')}</li>
                        <li><strong>cropdrive-remember-email</strong><br />
                          {copy('Purpose: remembers your email after you choose "Remember Me".', 'Tujuan: mengingati e-mel anda selepas anda memilih "Ingat Saya".')}<br />
                          {copy('Storage: until you delete site data in your browser, or you overwrite it.', 'Storan: sehingga anda memadam data laman dalam pelayar anda, atau anda menimpa semulanya.')}</li>
                        <li><strong>sidebar-collapsed</strong><br />
                          {copy('Purpose: remembers sidebar display after you change it.', 'Tujuan: mengingati paparan bar sisi selepas anda mengubahnya.')}<br />
                          {copy('Storage: until you delete site data in your browser, or you overwrite it.', 'Storan: sehingga anda memadam data laman dalam pelayar anda, atau anda menimpa semulanya.')}</li>
                      </ul>

                      <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">{copy('Session storage', 'Storan sesi')}</h4>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>pending_analysis_results</strong><br />
                          {copy('Purpose: temporary storage during an analysis workflow.', 'Tujuan: storan sementara semasa aliran kerja analisis.')}<br />
                          {copy('Storage: removed when the browser tab closes.', 'Storan: dikeluarkan apabila tab pelayar ditutup.')}</li>
                      </ul>

                      <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">{copy('Sign-in storage', 'Storan log masuk')}</h4>
                      <p>{copy('Sign-in uses Firebase Authentication.', 'Log masuk menggunakan Firebase Authentication.')}</p>
                      <p>{copy('Firebase stores sign-in state in browser storage to keep you signed in.', 'Firebase menyimpan keadaan log masuk dalam storan pelayar untuk memastikan anda kekal log masuk.')}</p>
                      <p>{copy('Storage: ends after logout, or after deletion of site data in your browser.', 'Storan: tamat selepas log keluar, atau selepas pemadaman data laman dalam pelayar anda.')}</p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('4.2 Analytics', '4.2 Analitik')}</h3>
                      <p>{copy('We use Vercel Web Analytics to measure general website usage and improve the site.', 'Kami menggunakan Vercel Web Analytics untuk mengukur penggunaan laman web secara umum dan meningkatkan laman.')}</p>
                      <p>{copy('Based on current configuration, Vercel Web Analytics runs without cookies on www.cropdrive.ai.', 'Berdasarkan konfigurasi semasa, Vercel Web Analytics berjalan tanpa kuki di www.cropdrive.ai.')}</p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('4.3 Payments', '4.3 Pembayaran')}</h3>
                      <p>{copy('Payments run on Stripe hosted checkout pages on stripe.com.', 'Pembayaran dijalankan di halaman checkout yang dihoskan oleh Stripe di stripe.com.')}</p>
                      <p>{copy('When you start checkout, your browser leaves www.cropdrive.ai and loads Stripe pages.', 'Apabila anda memulakan checkout, pelayar anda meninggalkan www.cropdrive.ai dan memuatkan halaman Stripe.')}</p>
                      <p>{copy('Stripe controls cookies and similar technologies on Stripe pages.', 'Stripe mengawal kuki dan teknologi serupa di halaman Stripe.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('5. Consent', '5. Persetujuan')}</h2>
                      <p>{copy('Under EU rules, consent is required before any non-essential cookies or non-essential device storage starts.', 'Di bawah peraturan EU, persetujuan diperlukan sebelum sebarang kuki bukan penting atau storan peranti bukan penting bermula.')}</p>
                      <p>{copy('Strictly necessary storage for a service you request does not require consent.', 'Storan yang sangat diperlukan untuk perkhidmatan yang anda minta tidak memerlukan persetujuan.')}</p>
                      <p>{copy('If we add non-essential cookies or non-essential device storage in a future update, we will present a consent choice before those technologies start.', 'Jika kami menambah kuki bukan penting atau storan peranti bukan penting dalam kemaskini akan datang, kami akan menyediakan pilihan persetujuan sebelum teknologi tersebut bermula.')}</p>
                      <p>{copy('Consent withdrawal will be available through a cookie settings control on the website.', 'Penarikan persetujuan akan tersedia melalui kawalan tetapan kuki di laman web.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('6. How to manage cookies and storage', '6. Cara mengurus kuki dan storan')}</h2>
                      <p>{copy('You manage cookies and site storage through your browser settings.', 'Anda mengurus kuki dan storan laman melalui tetapan pelayar anda.')}</p>
                      <p>{copy('Deleting site data for www.cropdrive.ai removes cookies and browser storage linked to this website.', 'Memadam data laman untuk www.cropdrive.ai mengeluarkan kuki dan storan pelayar yang dikaitkan dengan laman web ini.')}</p>
                      <p>{copy('Logging out ends the active signed-in session, and browser storage remains until you delete site data.', 'Log keluar menamatkan sesi log masuk aktif, dan storan pelayar kekal sehingga anda memadam data laman.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('7. Updates', '7. Kemaskini')}</h2>
                      <p>{copy('We update this policy when technologies change.', 'Kami mengemaskini dasar ini apabila teknologi berubah.')}</p>
                      <p>{copy('The date at the top shows the current version.', 'Tarikh di bahagian atas menunjukkan versi semasa.')}</p>
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

