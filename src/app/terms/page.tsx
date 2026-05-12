'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function TermsPage() {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 font-heading">
              {copy('Terms and Conditions', 'Terma dan Syarat')}
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              {copy('Terms and Conditions of Use for CropDrive.ai', 'Terma dan Syarat Penggunaan CropDrive.ai')}
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
                        {copy('Effective: April 2026  |  Available to users in Malaysia and Indonesia only.', 'Berkuat kuasa: April 2026  |  Tersedia untuk pengguna di Malaysia dan Indonesia sahaja.')}
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('1. Acceptance of these Terms', '1. Penerimaan Terma Ini')}</h2>
                      <p>{copy('By registering for, accessing, or using CropDrive.ai, you agree to these Terms and Conditions. If you do not agree, do not use the service.', 'Dengan mendaftar, mengakses atau menggunakan CropDrive.ai, anda bersetuju dengan Terma dan Syarat ini. Jika anda tidak bersetuju, jangan gunakan perkhidmatan ini.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('2. About the Service', '2. Mengenai Perkhidmatan')}</h2>
                      <p>{copy('CropDrive.ai is a digital agronomy support service that allows registered users to upload soil test results and leaf test results for analysis. The service is currently available only for users located in Malaysia and Indonesia.', 'CropDrive.ai ialah perkhidmatan sokongan agronomi digital yang membolehkan pengguna berdaftar memuat naik keputusan ujian tanah dan keputusan ujian daun untuk analisis. Perkhidmatan ini pada masa ini hanya tersedia untuk pengguna yang berada di Malaysia dan Indonesia.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('3. Eligibility', '3. Kelayakan')}</h2>
                      <p>{copy('You may use CropDrive.ai only if you are legally able to agree to these Terms and if you are located in Malaysia or Indonesia. By using the service, you confirm that the uploaded test results relate to farms, fields, or operations for which you are authorized to submit data.', 'Anda boleh menggunakan CropDrive.ai hanya jika anda secara sah boleh bersetuju dengan Terma ini dan jika anda berada di Malaysia atau Indonesia. Dengan menggunakan perkhidmatan ini, anda mengesahkan bahawa keputusan ujian yang dimuat naik berkaitan dengan ladang, kebun atau operasi yang anda dibenarkan untuk menyerahkan data.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('4. Free Service', '4. Perkhidmatan Percuma')}</h2>
                      <p>{copy('CropDrive.ai is currently offered free of charge to farmers. We reserve the right to change, limit, suspend, or discontinue the service, in whole or in part, at any time.', 'CropDrive.ai pada masa ini ditawarkan secara percuma kepada petani. Kami berhak untuk menukar, mengehadkan, menggantung atau menghentikan perkhidmatan, secara keseluruhan atau sebahagian, pada bila-bila masa.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('5. Required Registration Information', '5. Maklumat Pendaftaran yang Diperlukan')}</h2>
                      <p>{copy('To use CropDrive.ai, you must provide a valid WhatsApp number, a valid email address, and your location. You agree that this information is accurate and kept reasonably up to date.', 'Untuk menggunakan CropDrive.ai, anda mesti menyediakan nombor WhatsApp yang sah, alamat e-mel yang sah dan lokasi anda. Anda bersetuju bahawa maklumat ini adalah tepat dan dikemas kini secara munasabah.')}</p>
                      <p>{copy('This contact information will be used only for important service-related communication, including important changes, updates, developments, security notices, technical issues, and support communication. It will also be used if we need to contact you in relation to a problem with your account or uploaded files.', 'Maklumat hubungan ini akan digunakan hanya untuk komunikasi berkaitan perkhidmatan yang penting, termasuk perubahan penting, kemaskini, pembangunan, notis keselamatan, isu teknikal dan komunikasi sokongan. Ia juga akan digunakan jika kami perlu menghubungi anda berkenaan masalah dengan akaun atau fail yang dimuat naik anda.')}</p>
                      <p>{copy('We will not use your contact details for unwanted phone calls. We will not sell your contact details to third parties. We will not share your contact details for third-party marketing.', 'Kami tidak akan menggunakan butiran hubungan anda untuk panggilan telefon yang tidak diingini. Kami tidak akan menjual butiran hubungan anda kepada pihak ketiga. Kami tidak akan berkongsi butiran hubungan anda untuk pemasaran pihak ketiga.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('6. Upload Limits', '6. Had Muat Naik')}</h2>
                      <p>{copy('Each registered member may upload test results for analysis only twice per calendar year. This means a maximum of two upload events per year per member, whether the upload contains soil test results, leaf test results, or both.', 'Setiap ahli berdaftar boleh memuat naik keputusan ujian untuk analisis hanya dua kali setiap tahun kalendar. Ini bermaksud maksimum dua peristiwa muat naik setahun bagi setiap ahli, sama ada muat naik mengandungi keputusan ujian tanah, keputusan ujian daun atau kedua-duanya.')}</p>
                      <p>{copy('If you need additional uploads, you may contact us and request extra access. Any such additional access is at our discretion.', 'Jika anda memerlukan muat naik tambahan, anda boleh menghubungi kami dan meminta akses tambahan. Sebarang akses tambahan sedemikian adalah mengikut budi bicara kami.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('7. Uploaded Reports and Data You Provide', '7. Laporan yang Dimuat Naik dan Data yang Anda Sediakan')}</h2>
                      <p>{copy('By uploading a soil test report, leaf test report, or related file, you confirm that you have the right to upload it and to allow CropDrive.ai to process it for analysis.', 'Dengan memuat naik laporan ujian tanah, laporan ujian daun atau fail berkaitan, anda mengesahkan bahawa anda mempunyai hak untuk memuat naiknya dan membenarkan CropDrive.ai memprosesnya untuk analisis.')}</p>
                      <p>{copy('You also understand that uploaded files may contain farm information or other details. CropDrive.ai will use the agronomic content of these reports to provide analysis and to improve the service.', 'Anda juga memahami bahawa fail yang dimuat naik mungkin mengandungi maklumat ladang atau butiran lain. CropDrive.ai akan menggunakan kandungan agronomi laporan ini untuk menyediakan analisis dan meningkatkan perkhidmatan.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('8. Personal Information in Uploaded Reports', '8. Maklumat Peribadi dalam Laporan yang Dimuat Naik')}</h2>
                      <p>{copy('CropDrive.ai is designed to use agronomic data such as soil and leaf test values. CropDrive.ai is not intended to use personal names, contact details, or other personal identifiers that may appear inside uploaded reports for marketing, sales, or unrelated profiling.', 'CropDrive.ai direka untuk menggunakan data agronomi seperti nilai ujian tanah dan daun. CropDrive.ai tidak bertujuan menggunakan nama peribadi, butiran hubungan atau pengecam peribadi lain yang mungkin muncul dalam laporan yang dimuat naik untuk pemasaran, jualan atau pemprofilan yang tidak berkaitan.')}</p>
                      <p>{copy('If personal details appear inside an uploaded report, those details will not be included in aggregate datasets used for service improvement, benchmarking, analytics, or product development.', 'Jika butiran peribadi muncul dalam laporan yang dimuat naik, butiran tersebut tidak akan disertakan dalam set data agregat yang digunakan untuk peningkatan perkhidmatan, penandaarasan, analitik atau pembangunan produk.')}</p>
                      <p>{copy('We do not intentionally use personal names, phone numbers, email addresses, addresses, or similar identifiers appearing inside uploaded reports for any purpose other than what is technically necessary to operate, secure, support, or troubleshoot the service.', 'Kami tidak sengaja menggunakan nama peribadi, nombor telefon, alamat e-mel, alamat atau pengecam serupa yang muncul dalam laporan yang dimuat naik untuk sebarang tujuan selain daripada yang perlu secara teknikal untuk mengendalikan, mengamankan, menyokong atau menyelesaikan masalah perkhidmatan.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('9. Aggregate and Anonymized Data', '9. Data Agregat dan Tanpa Nama')}</h2>
                      <p>{copy('By using CropDrive.ai, you agree that we may access, use, store, analyze, and combine agronomic data from uploaded soil and leaf test results in aggregated and anonymized form.', 'Dengan menggunakan CropDrive.ai, anda bersetuju bahawa kami boleh mengakses, menggunakan, menyimpan, menganalisis dan menggabungkan data agronomi daripada keputusan ujian tanah dan daun yang dimuat naik dalam bentuk agregat dan tanpa nama.')}</p>
                      <p>{copy('This includes, for example, nutrient values, pH, soil characteristics, leaf nutrient values, regional trends, crop-related patterns, and similar non-personal analytical data.', 'Ini termasuk, sebagai contoh, nilai nutrien, pH, ciri tanah, nilai nutrien daun, trend serantau, corak berkaitan tanaman dan data analitik bukan peribadi yang serupa.')}</p>
                      <p>{copy('This aggregated and anonymized data may be used by CropDrive.ai to improve the platform, improve recommendations, develop new features, conduct benchmarking, generate statistics, train and improve models, and better understand agronomic patterns.', 'Data agregat dan tanpa nama ini boleh digunakan oleh CropDrive.ai untuk meningkatkan platform, meningkatkan cadangan, membangunkan ciri baharu, menjalankan penandaarasan, menjana statistik, melatih dan meningkatkan model, serta lebih memahami corak agronomi.')}</p>
                      <p>{copy('Aggregate data will not include your personal contact details.', 'Data agregat tidak akan termasuk butiran hubungan peribadi anda.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('10. Contact Details and Location Data', '10. Butiran Hubungan dan Data Lokasi')}</h2>
                      <p>{copy('Your WhatsApp number, email address, and location are required for account operation and service communication. Your location may also be used to support country eligibility, regional agronomic interpretation, service quality control, and platform development.', 'Nombor WhatsApp, alamat e-mel dan lokasi anda diperlukan untuk operasi akaun dan komunikasi perkhidmatan. Lokasi anda juga boleh digunakan untuk menyokong kelayakan negara, tafsiran agronomi serantau, kawalan kualiti perkhidmatan dan pembangunan platform.')}</p>
                      <p>{copy('We will not sell this information. We will not disclose it to unrelated third parties for marketing purposes.', 'Kami tidak akan menjual maklumat ini. Kami tidak akan mendedahkannya kepada pihak ketiga yang tidak berkaitan untuk tujuan pemasaran.')}</p>
                      <p>{copy('Where strictly necessary to operate, host, maintain, secure, or support the service, limited access may be given to technical service providers acting on our behalf and under confidentiality and data protection obligations. We may also disclose information where required by law.', 'Apabila sangat diperlukan untuk mengendalikan, mengehoskan, mengekalkan, mengamankan atau menyokong perkhidmatan, akses terhad boleh diberikan kepada penyedia perkhidmatan teknikal yang bertindak bagi pihak kami dan di bawah kewajipan kerahsiaan dan perlindungan data. Kami juga boleh mendedahkan maklumat apabila dikehendaki oleh undang-undang.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('11. No Third-Party Marketing', '11. Tiada Pemasaran Pihak Ketiga')}</h2>
                      <p>{copy('CropDrive.ai will not share your WhatsApp number, email address, or identifiable uploaded report information with third parties for advertising, solicitation, resale, lead generation, or unrelated commercial use.', 'CropDrive.ai tidak akan berkongsi nombor WhatsApp, alamat e-mel atau maklumat laporan yang dimuat naik yang boleh dikenal pasti dengan pihak ketiga untuk pengiklanan, permintaan, jualan semula, penjanaan petunjuk atau penggunaan komersial yang tidak berkaitan.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('12. Support and User Contact', '12. Sokongan dan Hubungan Pengguna')}</h2>
                      <p>{copy('You may contact us at any time to report bugs, technical problems, errors, and usability issues, or to request help with the service.', 'Anda boleh menghubungi kami pada bila-bila masa untuk melaporkan pepijat, masalah teknikal, ralat dan isu kebolehgunaan, atau untuk meminta bantuan dengan perkhidmatan.')}</p>
                      <p>{copy('We may contact you through WhatsApp or email for support, important updates, security notices, product changes, usage issues, or service developments.', 'Kami boleh menghubungi anda melalui WhatsApp atau e-mel untuk sokongan, kemaskini penting, notis keselamatan, perubahan produk, isu penggunaan atau pembangunan perkhidmatan.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('13. No Guarantee of Results', '13. Tiada Jaminan Keputusan')}</h2>
                      <p>{copy('CropDrive.ai provides informational and decision-support outputs only. Analysis results, interpretations, and recommendations depend on the quality, completeness, readability, and accuracy of the files and data you upload.', 'CropDrive.ai menyediakan output maklumat dan sokongan keputusan sahaja. Keputusan analisis, tafsiran dan cadangan bergantung kepada kualiti, kelengkapan, kebolehbacaan dan ketepatan fail dan data yang anda muat naik.')}</p>
                      <p>{copy('We do not guarantee that any recommendation will increase yield, improve profitability, prevent disease, correct nutritional problems, or produce any specific agronomic or commercial result.', 'Kami tidak menjamin bahawa sebarang cadangan akan meningkatkan hasil, meningkatkan keuntungan, mencegah penyakit, membetulkan masalah pemakanan, atau menghasilkan sebarang keputusan agronomi atau komersial tertentu.')}</p>
                      <p>{copy('The service does not replace field inspection, laboratory quality control, local professional judgement, or your own responsibility for farm decisions.', 'Perkhidmatan ini tidak menggantikan pemeriksaan lapangan, kawalan kualiti makmal, pertimbangan profesional tempatan atau tanggungjawab anda sendiri untuk keputusan ladang.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('14. Service Availability', '14. Ketersediaan Perkhidmatan')}</h2>
                      <p>{copy('We aim to keep CropDrive.ai available and functioning properly, but we do not guarantee uninterrupted service, continuous availability, or error-free operation.', 'Kami bertujuan untuk memastikan CropDrive.ai tersedia dan berfungsi dengan baik, tetapi kami tidak menjamin perkhidmatan tanpa gangguan, ketersediaan berterusan atau operasi tanpa ralat.')}</p>
                      <p>{copy('The platform may be updated, changed, interrupted, delayed, or temporarily unavailable at any time.', 'Platform mungkin dikemas kini, diubah, diganggu, ditangguhkan atau tidak tersedia buat sementara waktu pada bila-bila masa.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('15. Accuracy of User Inputs', '15. Ketepatan Input Pengguna')}</h2>
                      <p>{copy('You are responsible for ensuring that the files and information you upload are accurate, lawful, and relevant. You must not upload false, misleading, manipulated, harmful, illegal, or unauthorized material.', 'Anda bertanggungjawab untuk memastikan fail dan maklumat yang anda muat naik adalah tepat, sah dan relevan. Anda tidak boleh memuat naik bahan palsu, mengelirukan, dimanipulasi, berbahaya, haram atau tidak dibenarkan.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('16. Proper Use', '16. Penggunaan yang Betul')}</h2>
                      <p>{copy('You agree not to misuse the service. This includes attempting to interfere with the platform, bypass limits, upload malicious files, scrape the system, use another person\'s account without permission, or use the service in any unlawful or abusive manner.', 'Anda bersetuju untuk tidak menyalahgunakan perkhidmatan. Ini termasuk cuba mengganggu platform, memintas had, memuat naik fail berniat jahat, mengikis sistem, menggunakan akaun orang lain tanpa kebenaran, atau menggunakan perkhidmatan dengan cara yang menyalahi undang-undang atau kasar.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('17. Intellectual Property', '17. Harta Intelek')}</h2>
                      <p>{copy('CropDrive.ai, including its software, workflows, design, analysis methods, written outputs, data structures, and related content, remains the property of CropDrive.ai or its licensors, except for materials you lawfully upload.', 'CropDrive.ai, termasuk perisian, aliran kerja, reka bentuk, kaedah analisis, output bertulis, struktur data dan kandungan berkaitan, kekal sebagai hak milik CropDrive.ai atau pemberi lesennya, kecuali bahan yang anda muat naik secara sah.')}</p>
                      <p>{copy('You keep your rights in the files you upload. You grant CropDrive.ai the right to process, store, analyze, and use those files and their agronomic content as described in these Terms.', 'Anda mengekalkan hak anda dalam fail yang anda muat naik. Anda memberikan CropDrive.ai hak untuk memproses, menyimpan, menganalisis dan menggunakan fail tersebut dan kandungan agronominya seperti yang diterangkan dalam Terma ini.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('18. Suspension or Termination', '18. Penggantungan atau Penamatan')}</h2>
                      <p>{copy('We may suspend, restrict, or terminate access to CropDrive.ai if we believe these Terms have been breached, if the service is being misused, if account information is false, if uploads are unauthorized, or if suspension is needed for legal, security, operational, or technical reasons.', 'Kami boleh menggantung, menyekat atau menamatkan akses ke CropDrive.ai jika kami percaya Terma ini telah dilanggar, jika perkhidmatan disalahgunakan, jika maklumat akaun palsu, jika muat naik tidak dibenarkan, atau jika penggantungan diperlukan atas sebab undang-undang, keselamatan, operasi atau teknikal.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('19. Data Retention and Deletion', '19. Penyimpanan dan Pemadaman Data')}</h2>
                      <p>{copy('We may retain uploaded files, agronomic data, account records, logs, and service communications for as long as reasonably necessary to operate the service, maintain security, resolve disputes, improve the platform, meet legal obligations, and preserve aggregate analytical datasets.', 'Kami boleh menyimpan fail yang dimuat naik, data agronomi, rekod akaun, log dan komunikasi perkhidmatan selagi munasabah diperlukan untuk mengendalikan perkhidmatan, mengekalkan keselamatan, menyelesaikan pertikaian, meningkatkan platform, memenuhi kewajipan undang-undang dan mengekalkan set data analitik agregat.')}</p>
                      <p>{copy('You may request account closure or deletion of your personal contact data, subject to legal, technical, audit, backup, and operational limitations.', 'Anda boleh meminta penutupan akaun atau pemadaman data hubungan peribadi anda, tertakluk kepada had undang-undang, teknikal, audit, sandaran dan operasi.')}</p>
                      <p>{copy('Aggregate or anonymized data that no longer identifies you may continue to be retained and used.', 'Data agregat atau tanpa nama yang tidak lagi mengenal pasti anda boleh terus disimpan dan digunakan.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('20. Changes to These Terms', '20. Perubahan kepada Terma Ini')}</h2>
                      <p>{copy('We may update these Terms from time to time. If we make material changes, we may notify you through the platform, by WhatsApp, or by email. Continued use of CropDrive.ai after an update means you accept the updated Terms.', 'Kami mungkin mengemas kini Terma ini dari semasa ke semasa. Jika kami membuat perubahan material, kami mungkin memberitahu anda melalui platform, WhatsApp atau e-mel. Penggunaan berterusan CropDrive.ai selepas kemaskini bermaksud anda menerima Terma yang dikemas kini.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('21. Limitation of Liability', '21. Had Liabiliti')}</h2>
                      <p>{copy('To the fullest extent permitted by law, CropDrive.ai and its operators are not liable for indirect, incidental, special, consequential, or business losses arising from use of the service, including loss of profit, loss of yield, loss of data, loss of opportunity, or decisions made based on platform outputs.', 'Setakat yang dibenarkan oleh undang-undang, CropDrive.ai dan pengendalinya tidak bertanggungjawab untuk kerugian tidak langsung, sampingan, khas, akibat atau perniagaan yang timbul daripada penggunaan perkhidmatan, termasuk kehilangan keuntungan, kehilangan hasil, kehilangan data, kehilangan peluang atau keputusan yang dibuat berdasarkan output platform.')}</p>
                      <p>{copy('Use of the service is at your own risk.', 'Penggunaan perkhidmatan ini adalah atas risiko anda sendiri.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('22. Governing Language', '22. Bahasa yang Mentadbir')}</h2>
                      <p>{copy('If these Terms are translated into another language, the English version controls in case of inconsistency, unless local law requires otherwise.', 'Jika Terma ini diterjemahkan ke bahasa lain, versi Bahasa Inggeris menguasai sekiranya berlaku percanggahan, melainkan undang-undang tempatan memerlukan sebaliknya.')}</p>

                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{copy('23. Contact', '23. Hubungi')}</h2>
                      <p>{copy('If you have questions, need support, want to report a bug, want to request additional uploads, or want to raise a data-related concern, you may contact CropDrive.ai through the contact details provided on the platform.', 'Jika anda mempunyai soalan, memerlukan sokongan, ingin melaporkan pepijat, ingin meminta muat naik tambahan atau ingin membangkitkan kebimbangan berkaitan data, anda boleh menghubungi CropDrive.ai melalui butiran hubungan yang disediakan di platform.')}</p>
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
