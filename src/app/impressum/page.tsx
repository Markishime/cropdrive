'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import Card, { CardContent } from '@/components/ui/Card';

export default function ImpressumPage() {
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

  const { language } = useTranslation(mounted ? currentLanguage : 'en');

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 font-heading">
              Impressum
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms' 
                ? 'Maklumat syarikat dan tanggungjawab undang-undang'
                : 'Company information and legal responsibility'
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
                    <div className="space-y-6 text-gray-700">
                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Impressum</h2>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Angaben gemäß § 5 TMG:</h3>
                      <div className="bg-green-50 p-6 rounded-xl mb-6 border-2 border-green-200">
                        <p className="font-semibold text-gray-900 mb-2">AGS – Agriculture Global Solutions OÜ</p>
                        <p className="text-gray-700">Sakala tn 7-2</p>
                        <p className="text-gray-700">Kesklinna linnaosa</p>
                        <p className="text-gray-700">10141 Tallinn, Harju maakond</p>
                        <p className="text-gray-700">Estland</p>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Vertreten durch:</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Geschäftsführer: Dr. Aleksandre Loladze</li>
                        <li>Registernummer: 17010632</li>
                        <li>Registergericht: Tartu Maakohtu registriosakond</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Kontakt:</h3>
                      <div className="bg-green-50 p-6 rounded-xl mb-6 border-2 border-green-200">
                        <p className="text-gray-700 mb-2">
                          <span className="font-semibold">Telefon:</span> <a href="tel:+4952218719889" className="text-green-700 hover:text-green-800 underline">+49 5221 8719889</a>
                        </p>
                        <p className="text-gray-700">
                          <span className="font-semibold">E-Mail:</span> <a href="mailto:contact@agriglobalsolutions.com" className="text-green-700 hover:text-green-800 underline">contact@agriglobalsolutions.com</a>
                        </p>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</h3>
                      <div className="bg-green-50 p-6 rounded-xl mb-6 border-2 border-green-200">
                        <p className="font-semibold text-gray-900 mb-2">Dr. Aleksandre Loladze</p>
                        <p className="text-gray-700">Sakala tn 7-2</p>
                        <p className="text-gray-700">Kesklinna linnaosa</p>
                        <p className="text-gray-700">10141 Tallinn, Harju maakond</p>
                        <p className="text-gray-700">Estland</p>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Zielgruppe / Geschäftsbereich:</h3>
                      <p className="text-gray-700">
                        Unsere Dienstleistungen richten sich ausschließlich an Unternehmen, Organisationen und Institutionen (B2B). Ein Verkauf oder eine Leistungserbringung an Verbraucher (§ 13 BGB) findet nicht statt.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Haftung für Inhalte:</h3>
                      <p className="text-gray-700 mb-4">
                        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                      </p>
                      <p className="text-gray-700">
                        Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen entfernen wir diese Inhalte umgehend.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Haftung für Links:</h3>
                      <p className="text-gray-700 mb-4">
                        Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb übernehmen wir für diese fremden Inhalte auch keine Gewähr. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Zum Zeitpunkt der Verlinkung wurden die Seiten auf mögliche Rechtsverstöße überprüft; rechtswidrige Inhalte waren nicht erkennbar.
                      </p>
                      <p className="text-gray-700">
                        Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen entfernen wir solche Links umgehend.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Urheberrecht:</h3>
                      <p className="text-gray-700 mb-4">
                        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors oder Erstellers.
                      </p>
                      <p className="text-gray-700 mb-4">
                        Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
                      </p>
                      <p className="text-gray-700">
                        Soweit Inhalte nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet und als solche gekennzeichnet. Bei Bekanntwerden von Rechtsverletzungen entfernen wir solche Inhalte umgehend.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}

