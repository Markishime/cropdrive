'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';

export default function ConsumerInfoPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

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

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-palm-50 via-white to-gold-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white pt-32 pb-20 overflow-hidden">
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
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight font-heading">
              {copy('Consumer ', 'Maklumat ')}<span className="text-yellow-400">{copy('Information', 'Pengguna')}</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              {copy('Verbraucherinformationen', 'Verbraucherinformationen')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* English Version */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 font-heading">
              {copy('Consumer Information', 'Maklumat Pengguna')}
            </h2>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                {copy(
                  'If you have a complaint about a CropDrive OP Advisor subscription, please contact AGS – Agriculture Global Solutions OÜ by email at',
                  'Jika anda mempunyai aduan mengenai langganan CropDrive OP Advisor, sila hubungi AGS – Agriculture Global Solutions OÜ melalui e-mel di'
                )}{' '}
                <a href="mailto:contact@agriglobalsolutions.com" className="text-green-700 hover:text-green-800 underline font-semibold">contact@agriglobalsolutions.com</a>
                {copy(', by phone at', ', melalui telefon di')}{' '}
                <a href="tel:+4915163105462" className="text-green-700 hover:text-green-800">+49 15163105462</a>
                {copy(', or by post to Sakala tn 7-2, Kesklinna linnaosa, 10141 Tallinn, Harju maakond, Estonia.', ', atau melalui pos ke Sakala tn 7-2, Kesklinna linnaosa, 10141 Tallinn, Harju maakond, Estonia.')}
              </p>

              <p className="text-gray-700 leading-relaxed mb-6">
                {copy(
                  'Please include the account email used for purchase and the payment date, so we can identify the transaction. We provide an initial response within 24 hours and aim to resolve the matter within 14 days, depending on the complexity of the issue and the information provided.',
                  'Sila sertakan e-mel akaun yang digunakan untuk pembelian dan tarikh pembayaran, supaya kami dapat mengenal pasti transaksi tersebut. Kami memberikan respons awal dalam tempoh 24 jam dan bertujuan untuk menyelesaikan perkara tersebut dalam tempoh 14 hari, bergantung kepada kerumitan isu dan maklumat yang diberikan.'
                )}
              </p>

              <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-xl mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{copy('Consumer Arbitration Board', 'Lembaga Timbang Tara Pengguna')}</h3>
                <p className="text-gray-700 leading-relaxed mb-0">
                  {copy(
                    'AGS is neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.',
                    'AGS tidak bersedia dan tidak bertanggungjawab untuk mengambil bahagian dalam prosiding penyelesaian pertikaian di hadapan lembaga timbang tara pengguna.'
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* German Version */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 font-heading">
              Verbraucherinformationen
            </h2>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                Wenn Sie eine Beschwerde über ein CropDrive OP Advisor-Abonnement haben, kontaktieren Sie bitte AGS – Agriculture Global Solutions OÜ per E-Mail unter{' '}
                <a href="mailto:contact@agriglobalsolutions.com" className="text-green-700 hover:text-green-800 underline font-semibold">contact@agriglobalsolutions.com</a>
                , telefonisch unter{' '}
                <a href="tel:+4915163105462" className="text-green-700 hover:text-green-800">+49 15163105462</a>
                {' '}oder per Post an Sakala tn 7-2, Kesklinna linnaosa, 10141 Tallinn, Harju maakond, Estland.
              </p>

              <p className="text-gray-700 leading-relaxed mb-6">
                Bitte geben Sie die für den Kauf verwendete Kontakt-E-Mail-Adresse und das Zahlungsdatum an, damit wir die Transaktion identifizieren können. Wir antworten innerhalb von 24 Stunden und bemühen uns, die Angelegenheit innerhalb von 14 Tagen zu lösen, abhängig von der Komplexität des Problems und den bereitgestellten Informationen.
              </p>

              <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-xl mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Verbraucherschlichtungsstelle</h3>
                <p className="text-gray-700 leading-relaxed mb-0">
                  AGS ist weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-br from-green-900 via-green-800 to-green-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 font-heading">
              {copy('Need Assistance?', 'Perlukan Bantuan?')}
            </h2>
            <p className="text-lg text-white/90 mb-8">
              {copy('Benötigen Sie Hilfe?', 'Benötigen Sie Hilfe?')}
            </p>
            <a 
              href="mailto:contact@agriglobalsolutions.com"
              className="inline-block px-10 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 font-black rounded-full hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50 transform hover:scale-105 uppercase tracking-wide"
            >
              {copy('Contact Us', 'Hubungi Kami')}
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

