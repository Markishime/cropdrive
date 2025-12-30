'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import Card, { CardContent } from '@/components/ui/Card';

export default function RightOfWithdrawalPage() {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 font-heading">
              {language === 'ms' ? 'Hak Penarikan Balik' : 'Right of Withdrawal'}
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms' 
                ? 'Maklumat mengenai hak anda untuk menarik balik kontrak'
                : 'Information about your right to withdraw from the contract'
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
                    {/* English Section */}
                    <div className="mb-12">
                      <div className="flex items-center space-x-4 mb-6 pb-4 border-b-2 border-green-200">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-heading font-black text-gray-900">
                          Right of Withdrawal
                        </h2>
                      </div>

                      <div className="space-y-6 text-gray-700">
                        <div className="bg-blue-50 p-6 rounded-xl mb-6 border-2 border-blue-200">
                          <p className="font-semibold text-gray-900 mb-0">
                            This notice applies to Consumers within the European Union and the European Economic Area who purchase the CropDrive OP Advisor digital service through www.cropdrive.ai.
                          </p>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Right of withdrawal</h3>
                        <p>
                          You have the right to withdraw from this contract within fourteen days without giving any reason. The withdrawal period expires fourteen days after the day the contract is concluded.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">How to exercise the right of withdrawal</h3>
                        <p>
                          To exercise the right of withdrawal, you must inform us of your decision to withdraw from this contract by an unequivocal statement sent by email or by post.
                        </p>
                        <div className="bg-yellow-50 p-6 rounded-xl mb-6 border-2 border-yellow-200">
                          <div className="space-y-2 text-gray-700">
                            <p className="font-semibold text-gray-900">AGS – Agriculture Global Solutions OÜ</p>
                            <p>Sakala tn 7-2, Kesklinna linnaosa</p>
                            <p>10141 Tallinn, Harju maakond, Estonia</p>
                            <p>
                              <span className="font-semibold">Email:</span> <a href="mailto:contact@agriglobalsolutions.com" className="text-green-700 hover:text-green-800 underline">contact@agriglobalsolutions.com</a>
                            </p>
                          </div>
                        </div>
                        <p>
                          To meet the withdrawal deadline, it is sufficient that you send your withdrawal statement before the withdrawal period expires.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Effects of withdrawal</h3>
                        <p>
                          If you withdraw from this contract, we reimburse all payments received from you without undue delay and in any event no later than fourteen days from the day we receive your withdrawal statement. Reimbursement is made using the same payment method used for the original transaction, unless an alternative method is expressly agreed, and no fees are charged for the reimbursement.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Start of service during the withdrawal period and proportionate payment</h3>
                        <p>
                          The CropDrive OP Advisor service is a digital service supplied online and access is normally activated immediately after purchase. Where you request that performance of the digital service begins during the withdrawal period and you later withdraw, you owe a proportionate amount for the service supplied up to the time you informed us of the withdrawal, compared to the full contract term.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Loss of the right of withdrawal for digital content supplied immediately</h3>
                        <p>
                          Where the contract includes digital content not supplied on a tangible medium and you request immediate supply, you acknowledge that the right of withdrawal is lost once the supply of that digital content begins.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Model withdrawal form</h3>
                        <p className="mb-4">
                          Complete and send this form only if you wish to withdraw from the contract.
                        </p>
                        <div className="bg-gray-50 p-6 rounded-xl mb-6 border-2 border-gray-200 font-mono text-sm">
                          <p className="mb-4">To: AGS – Agriculture Global Solutions OÜ, Sakala tn 7-2, Kesklinna linnaosa, 10141 Tallinn, Harju maakond, Estonia, Email: contact@agriglobalsolutions.com</p>
                          <p className="mb-4">I hereby give notice that I withdraw from my contract for the supply of the following service: CropDrive OP Advisor subscription.</p>
                          <p className="mb-2">Ordered on: [date]</p>
                          <p className="mb-2">Account email used for purchase: [email]</p>
                          <p className="mb-2">Name: [name]</p>
                          <p className="mb-2">Address: [address]</p>
                          <p className="mb-2">Date: [date]</p>
                          <p>Signature (only if sent by post): [signature]</p>
                        </div>
                      </div>
                    </div>

                    {/* German Section */}
                    <div className="mt-12 pt-12 border-t-4 border-green-300">
                      <div className="flex items-center space-x-4 mb-6 pb-4 border-b-2 border-red-200">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-heading font-black text-gray-900">
                          Widerrufsrecht
                        </h2>
                      </div>

                      <div className="space-y-6 text-gray-700">
                        <p>
                          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
                        </p>

                        <div className="bg-yellow-50 p-6 rounded-xl mb-6 border-2 border-yellow-200">
                          <p className="font-semibold text-gray-900 mb-3">Um Ihr Widerrufsrecht auszuüben, müssen Sie uns informieren:</p>
                          <div className="space-y-2 text-gray-700">
                            <p><span className="font-semibold">AGS - Agriculture Global Solutions OÜ</span></p>
                            <p>Sakala tn 7-2, Kesklinna linnaosa</p>
                            <p>10141 Tallinn, Harju maakond, Estland</p>
                            <p>
                              <span className="font-semibold">E-Mail:</span> <a href="mailto:contact@agriglobalsolutions.com" className="text-green-700 hover:text-green-800 underline">contact@agriglobalsolutions.com</a>
                            </p>
                          </div>
                          <p className="mt-4 text-gray-700">
                            mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
                          </p>
                        </div>

                        <p>
                          Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Folgen des Widerrufs:</h3>

                        <p>
                          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
                        </p>

                        <p>
                          Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen sollen, so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.
                        </p>
                      </div>
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

