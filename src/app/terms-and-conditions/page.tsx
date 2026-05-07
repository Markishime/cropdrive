'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';
import Card, { CardContent } from '@/components/ui/Card';

export default function TermsAndConditionsPage() {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 font-heading">
              {copy('Terms and Conditions', 'Terma dan Syarat')}
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              {copy('Business terms and conditions for B2B services', 'Syarat dan peraturan perniagaan untuk perkhidmatan B2B')}
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
                          {copy('Terms and Conditions', 'Terma dan Syarat')}
                        </h2>
                      </div>

                      <div className="space-y-6 text-gray-700">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('1. General Information', '1. Maklumat Am')}</h3>
                          <div className="bg-green-50 p-6 rounded-xl mb-4 border-2 border-green-200">
                            <ul className="list-none space-y-2">
                              <li><span className="font-semibold">{copy('Company name:', 'Nama syarikat:')} </span> AGS – Agriculture Global Solutions OÜ</li>
                              <li><span className="font-semibold">{copy('Address:', 'Alamat:')} </span> Sakala tn 7-2, Kesklinna linnaosa, 10141 Tallinn, Harju maakond, Estonia</li>
                              <li><span className="font-semibold">{copy('Operational Headquarters:', 'Ibu pejabat operasi:')} </span> Herford, Germany</li>
                              <li><span className="font-semibold">{copy('Contact:', 'Hubungi:')} </span> <a href="mailto:contact@agriglobalsolutions.com" className="text-green-700 hover:text-green-800 underline">contact@agriglobalsolutions.com</a></li>
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('2. B2B Services Only', '2. Perkhidmatan B2B Sahaja')}</h3>
                          <p>
                            {copy('CropDrive is a service operated by AGS – Agriculture Global Solutions OÜ and is intended exclusively for business customers, organizations, and institutions. Contracts with consumers as defined by §13 BGB are explicitly excluded.', 'CropDrive ialah perkhidmatan yang dikendalikan oleh AGS – Agriculture Global Solutions OÜ dan ditujukan secara eksklusif untuk pelanggan perniagaan, organisasi dan institusi. Kontrak dengan pengguna seperti yang ditakrifkan oleh §13 BGB dikecualikan secara eksplisit.')}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('3. Scope of Services', '3. Skop Perkhidmatan')}</h3>
                          <p>
                            {copy('We provide specialized agricultural consultancy and digital advisory services. All service details, deliverables, and obligations are determined in individual agreements with each client.', 'Kami menyediakan perkhidmatan perundingan pertanian khusus dan perkhidmatan nasihat digital. Semua butiran perkhidmatan, hasil kerja dan kewajipan ditentukan dalam perjanjian individu dengan setiap pelanggan.')}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('4. Payment Terms', '4. Syarat Pembayaran')}</h3>
                          <p>
                            {copy('Payment terms, including due dates, advance payments, and installment options, are specified in individual contracts. Payment methods are also agreed case-by-case.', 'Syarat pembayaran, termasuk tarikh akhir, bayaran pendahuluan dan pilihan ansuran, dinyatakan dalam kontrak individu. Kaedah pembayaran juga dipersetujui secara kes demi kes.')}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('5. Delivery of Services', '5. Penyampaian Perkhidmatan')}</h3>
                          <p>
                            {copy('Delivery timelines and methods are defined per contract. AGS commits to fulfilling services in accordance with the agreed terms.', 'Garis masa dan kaedah penyampaian ditakrifkan mengikut kontrak. AGS komited untuk memenuhi perkhidmatan mengikut terma yang dipersetujui.')}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('6. Cancellation and Termination', '6. Pembatalan dan Penamatan')}</h3>
                          <p>
                            {copy('Cancellation conditions and early termination penalties (if any) are outlined in individual contracts.', 'Syarat pembatalan dan penalti penamatan awal (jika ada) digariskan dalam kontrak individu.')}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('7. Liability', '7. Liabiliti')}</h3>
                          <p>
                            {copy('Unless otherwise agreed, AGS\'s liability is limited to gross negligence and willful misconduct. Liability for indirect or consequential damages is excluded to the extent legally permissible.', 'Melainkan dipersetujui sebaliknya, liabiliti AGS terhad kepada kecuaian besar dan salah laku yang disengajakan. Liabiliti untuk kerosakan tidak langsung atau akibat dikecualikan setakat yang dibenarkan oleh undang-undang.')}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('8. Confidentiality', '8. Kerahsiaan')}</h3>
                          <p>
                            {copy('All parties are obligated to maintain confidentiality. Separate non-disclosure agreements may be signed when required.', 'Semua pihak berkewajipan untuk mengekalkan kerahsiaan. Perjanjian tidak mendedahkan berasingan boleh ditandatangani apabila diperlukan.')}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('9. Intellectual Property', '9. Harta Intelek')}</h3>
                          <p>
                            {copy('All rights related to reports, data, content, or tools produced during the service are governed by individual contracts.', 'Semua hak berkaitan laporan, data, kandungan atau alat yang dihasilkan semasa perkhidmatan dikawal oleh kontrak individu.')}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('10. Dispute Resolution', '10. Penyelesaian Pertikaian')}</h3>
                          <p>
                            {copy('Unless otherwise agreed, all contracts are subject to German law. Jurisdiction is Herford, Germany. Dispute resolution through mediation or arbitration may be agreed upon in writing.', 'Melainkan dipersetujui sebaliknya, semua kontrak tertakluk kepada undang-undang Jerman. Bidang kuasa ialah Herford, Jerman. Penyelesaian pertikaian melalui pengantaraan atau timbang tara boleh dipersetujui secara bertulis.')}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('11. Amendments', '11. Pindaan')}</h3>
                          <p>
                            {copy('We reserve the right to amend these Terms and Conditions at any time. The latest version is available on the website and applies to future contracts.', 'Kami berhak untuk meminda Terma dan Syarat ini pada bila-bila masa. Versi terkini boleh didapati di laman web dan terpakai untuk kontrak masa hadapan.')}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{copy('12. Data Protection', '12. Perlindungan Data')}</h3>
                          <p>
                            {copy('We process personal data in compliance with the GDPR and the German Federal Data Protection Act (BDSG). Please refer to our ', 'Kami memproses data peribadi dengan mematuhi GDPR dan Akta Perlindungan Data Persekutuan Jerman (BDSG). Sila rujuk ')}<Link href="/privacy" className="text-green-700 hover:text-green-800 underline font-semibold">{copy('Privacy Policy', 'Dasar Privasi')}</Link>{copy(' for details.', ' untuk maklumat lanjut.')}
                          </p>
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
                          Allgemeine Geschäftsbedingungen (AGB)
                        </h2>
                      </div>

                      <div className="space-y-6 text-gray-700">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1. Allgemeine Informationen</h3>
                          <div className="bg-red-50 p-6 rounded-xl mb-4 border-2 border-red-200">
                            <ul className="list-none space-y-2">
                              <li><span className="font-semibold">Firmenname:</span> AGS – Agriculture Global Solutions OÜ</li>
                              <li><span className="font-semibold">Adresse:</span> Sakala tn 7-2, Kesklinna linnaosa, 10141 Tallinn, Harju maakond, Estland</li>
                              <li><span className="font-semibold">Operativer Hauptsitz:</span> Herford, Deutschland</li>
                              <li><span className="font-semibold">Kontakt:</span> <a href="mailto:contact@agriglobalsolutions.com" className="text-green-700 hover:text-green-800 underline">contact@agriglobalsolutions.com</a></li>
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2. Ausschließliche B2B-Dienstleistungen</h3>
                          <p>
                            CropDrive ist ein Service von AGS – Agriculture Global Solutions OÜ und richtet sich ausschließlich an Geschäftskunden, Organisationen und Institutionen. Verträge mit Verbrauchern im Sinne von §13 BGB sind ausgeschlossen.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3. Leistungsumfang</h3>
                          <p>
                            Wir bieten spezialisierte landwirtschaftliche Beratungs- und digitale Unterstützungsdienste an. Der konkrete Leistungsumfang wird jeweils individuell vertraglich geregelt.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4. Zahlungsbedingungen</h3>
                          <p>
                            Zahlungsbedingungen, einschließlich Fälligkeit, Anzahlungen und Raten, werden im jeweiligen Vertrag vereinbart. Akzeptierte Zahlungsmethoden sind ebenfalls individuell festzulegen.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5. Erbringung der Dienstleistungen</h3>
                          <p>
                            Art und Zeitrahmen der Leistungserbringung werden vertraglich geregelt. AGS verpflichtet sich zur ordnungsgemäßen Umsetzung gemäß den vereinbarten Bedingungen.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6. Kündigung und Vertragsbeendigung</h3>
                          <p>
                            Kündigungsfristen und etwaige Gebühren bei vorzeitiger Vertragsbeendigung werden im jeweiligen Vertrag festgelegt.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7. Haftung</h3>
                          <p>
                            Soweit gesetzlich zulässig, haftet AGS nur für vorsätzliches oder grob fahrlässiges Verhalten. Eine Haftung für mittelbare Schäden ist ausgeschlossen, sofern nicht gesetzlich zwingend geregelt.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">8. Vertraulichkeit</h3>
                          <p>
                            Beide Parteien verpflichten sich zur Vertraulichkeit. Bei Bedarf werden gesonderte Geheimhaltungsvereinbarungen geschlossen.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9. Geistiges Eigentum</h3>
                          <p>
                            Nutzungs- und Eigentumsrechte an Berichten, Daten, Inhalten oder digitalen Tools werden im Vertrag geregelt.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10. Streitbeilegung</h3>
                          <p>
                            Sofern nicht anders vereinbart, gilt deutsches Recht. Gerichtsstand ist Herford, Deutschland. Eine außergerichtliche Streitbeilegung (z. B. Mediation oder Schiedsgericht) kann schriftlich vereinbart werden.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">11. Änderungen</h3>
                          <p>
                            AGS behält sich vor, diese AGB jederzeit zu ändern. Die aktuelle Fassung ist auf der Website veröffentlicht und gilt für zukünftige Verträge.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">12. Datenschutz</h3>
                          <p>
                            Personenbezogene Daten werden gemäß DSGVO und dem Bundesdatenschutzgesetz (BDSG) verarbeitet. Details finden Sie in unserer <Link href="/privacy" className="text-green-700 hover:text-green-800 underline font-semibold">Datenschutzerklärung</Link>.
                          </p>
                        </div>
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
                  {copy('Back to Home', 'Kembali ke Laman Utama')}
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

