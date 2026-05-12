'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

// Hide navbar for this page
export const dynamic = 'force-dynamic';

const TERMS_SECTIONS_EN = [
  {
    title: '1. Acceptance of these Terms',
    body: 'By registering for, accessing, or using CropDrive.ai, you agree to these Terms and Conditions. If you do not agree, do not use the service.',
  },
  {
    title: '2. About the Service',
    body: 'CropDrive.ai is a digital agronomy support service that allows registered users to upload soil test results and leaf test results for analysis. The service is currently available only for users located in Malaysia and Indonesia.',
  },
  {
    title: '3. Eligibility',
    body: 'You may use CropDrive.ai only if you are legally able to agree to these Terms and if you are located in Malaysia or Indonesia. By using the service, you confirm that the uploaded test results relate to farms, fields, or operations for which you are authorized to submit data.',
  },
  {
    title: '4. Free Service',
    body: 'CropDrive.ai is currently offered free of charge to farmers. We reserve the right to change, limit, suspend, or discontinue the service, in whole or in part, at any time.',
  },
  {
    title: '5. Required Registration Information',
    body: 'To use CropDrive.ai, you must provide a valid WhatsApp number, a valid email address, and your location. You agree that this information is accurate and kept reasonably up to date.\n\nThis contact information will be used only for important service-related communication, including important changes, updates, developments, security notices, technical issues, and support communication. It will also be used if we need to contact you in relation to a problem with your account or uploaded files.\n\nWe will not use your contact details for unwanted phone calls. We will not sell your contact details to third parties. We will not share your contact details for third-party marketing.',
  },
  {
    title: '6. Upload Limits',
    body: 'Each registered member may upload test results for analysis only twice per calendar year. This means a maximum of two upload events per year per member, whether the upload contains soil test results, leaf test results, or both.\n\nIf you need additional uploads, you may contact us and request extra access. Any such additional access is at our discretion.',
  },
  {
    title: '7. Uploaded Reports and Data You Provide',
    body: 'By uploading a soil test report, leaf test report, or related file, you confirm that you have the right to upload it and to allow CropDrive.ai to process it for analysis.\n\nYou also understand that uploaded files may contain farm information or other details. CropDrive.ai will use the agronomic content of these reports to provide analysis and to improve the service.',
  },
  {
    title: '8. Personal Information in Uploaded Reports',
    body: 'CropDrive.ai is designed to use agronomic data such as soil and leaf test values. CropDrive.ai is not intended to use personal names, contact details, or other personal identifiers that may appear inside uploaded reports for marketing, sales, or unrelated profiling.\n\nIf personal details appear inside an uploaded report, those details will not be included in aggregate datasets used for service improvement, benchmarking, analytics, or product development.\n\nWe do not intentionally use personal names, phone numbers, email addresses, addresses, or similar identifiers appearing inside uploaded reports for any purpose other than what is technically necessary to operate, secure, support, or troubleshoot the service.',
  },
  {
    title: '9. Aggregate and Anonymized Data',
    body: 'By using CropDrive.ai, you agree that we may access, use, store, analyze, and combine agronomic data from uploaded soil and leaf test results in aggregated and anonymized form.\n\nThis includes, for example, nutrient values, pH, soil characteristics, leaf nutrient values, regional trends, crop-related patterns, and similar non-personal analytical data.\n\nThis aggregated and anonymized data may be used by CropDrive.ai to improve the platform, improve recommendations, develop new features, conduct benchmarking, generate statistics, train and improve models, and better understand agronomic patterns.\n\nAggregate data will not include your personal contact details.',
  },
  {
    title: '10. Contact Details and Location Data',
    body: 'Your WhatsApp number, email address, and location are required for account operation and service communication. Your location may also be used to support country eligibility, regional agronomic interpretation, service quality control, and platform development.\n\nWe will not sell this information. We will not disclose it to unrelated third parties for marketing purposes.\n\nWhere strictly necessary to operate, host, maintain, secure, or support the service, limited access may be given to technical service providers acting on our behalf and under confidentiality and data protection obligations. We may also disclose information where required by law.',
  },
  {
    title: '11. No Third-Party Marketing',
    body: 'CropDrive.ai will not share your WhatsApp number, email address, or identifiable uploaded report information with third parties for advertising, solicitation, resale, lead generation, or unrelated commercial use.',
  },
  {
    title: '12. Support and User Contact',
    body: 'You may contact us at any time to report bugs, technical problems, errors, and usability issues, or to request help with the service.\n\nWe may contact you through WhatsApp or email for support, important updates, security notices, product changes, usage issues, or service developments.',
  },
  {
    title: '13. No Guarantee of Results',
    body: 'CropDrive.ai provides informational and decision-support outputs only. Analysis results, interpretations, and recommendations depend on the quality, completeness, readability, and accuracy of the files and data you upload.\n\nWe do not guarantee that any recommendation will increase yield, improve profitability, prevent disease, correct nutritional problems, or produce any specific agronomic or commercial result.\n\nThe service does not replace field inspection, laboratory quality control, local professional judgement, or your own responsibility for farm decisions.',
  },
  {
    title: '14. Service Availability',
    body: 'We aim to keep CropDrive.ai available and functioning properly, but we do not guarantee uninterrupted service, continuous availability, or error-free operation.\n\nThe platform may be updated, changed, interrupted, delayed, or temporarily unavailable at any time.',
  },
  {
    title: '15. Accuracy of User Inputs',
    body: 'You are responsible for ensuring that the files and information you upload are accurate, lawful, and relevant. You must not upload false, misleading, manipulated, harmful, illegal, or unauthorized material.',
  },
  {
    title: '16. Proper Use',
    body: 'You agree not to misuse the service. This includes attempting to interfere with the platform, bypass limits, upload malicious files, scrape the system, use another person\'s account without permission, or use the service in any unlawful or abusive manner.',
  },
  {
    title: '17. Intellectual Property',
    body: 'CropDrive.ai, including its software, workflows, design, analysis methods, written outputs, data structures, and related content, remains the property of CropDrive.ai or its licensors, except for materials you lawfully upload.\n\nYou keep your rights in the files you upload. You grant CropDrive.ai the right to process, store, analyze, and use those files and their agronomic content as described in these Terms.',
  },
  {
    title: '18. Suspension or Termination',
    body: 'We may suspend, restrict, or terminate access to CropDrive.ai if we believe these Terms have been breached, if the service is being misused, if account information is false, if uploads are unauthorized, or if suspension is needed for legal, security, operational, or technical reasons.',
  },
  {
    title: '19. Data Retention and Deletion',
    body: 'We may retain uploaded files, agronomic data, account records, logs, and service communications for as long as reasonably necessary to operate the service, maintain security, resolve disputes, improve the platform, meet legal obligations, and preserve aggregate analytical datasets.\n\nYou may request account closure or deletion of your personal contact data, subject to legal, technical, audit, backup, and operational limitations.\n\nAggregate or anonymized data that no longer identifies you may continue to be retained and used.',
  },
  {
    title: '20. Changes to These Terms',
    body: 'We may update these Terms from time to time. If we make material changes, we may notify you through the platform, by WhatsApp, or by email. Continued use of CropDrive.ai after an update means you accept the updated Terms.',
  },
  {
    title: '21. Limitation of Liability',
    body: 'To the fullest extent permitted by law, CropDrive.ai and its operators are not liable for indirect, incidental, special, consequential, or business losses arising from use of the service, including loss of profit, loss of yield, loss of data, loss of opportunity, or decisions made based on platform outputs.\n\nUse of the service is at your own risk.',
  },
  {
    title: '22. Governing Language',
    body: 'If these Terms are translated into another language, the English version controls in case of inconsistency, unless local law requires otherwise.',
  },
  {
    title: '23. Contact',
    body: 'If you have questions, need support, want to report a bug, want to request additional uploads, or want to raise a data-related concern, you may contact CropDrive.ai through the contact details provided on the platform.',
  },
];

const TERMS_SECTIONS_MS = [
  {
    title: '1. Penerimaan Terma Ini',
    body: 'Dengan mendaftar, mengakses, atau menggunakan CropDrive.ai, anda bersetuju dengan Terma dan Syarat ini. Jika anda tidak bersetuju, jangan gunakan perkhidmatan ini.',
  },
  {
    title: '2. Mengenai Perkhidmatan',
    body: 'CropDrive.ai ialah perkhidmatan sokongan agronomi digital yang membolehkan pengguna berdaftar memuat naik keputusan ujian tanah dan keputusan ujian daun untuk analisis. Perkhidmatan ini kini hanya tersedia untuk pengguna yang berada di Malaysia dan Indonesia.',
  },
  {
    title: '3. Kelayakan',
    body: 'Anda boleh menggunakan CropDrive.ai hanya jika anda layak dari segi undang-undang untuk bersetuju dengan Terma ini dan jika anda berada di Malaysia atau Indonesia. Dengan menggunakan perkhidmatan ini, anda mengesahkan bahawa keputusan ujian yang dimuat naik berkaitan dengan ladang, bidang, atau operasi yang anda diberi kuasa untuk menghantar data.',
  },
  {
    title: '4. Perkhidmatan Percuma',
    body: 'CropDrive.ai kini ditawarkan secara percuma kepada petani. Kami berhak untuk mengubah, mengehadkan, menggantung, atau menghentikan perkhidmatan ini, secara keseluruhan atau sebahagian, pada bila-bila masa.',
  },
  {
    title: '5. Maklumat Pendaftaran Yang Diperlukan',
    body: 'Untuk menggunakan CropDrive.ai, anda mesti menyediakan nombor WhatsApp yang sah, alamat emel yang sah, dan lokasi anda. Anda bersetuju bahawa maklumat ini adalah tepat dan dikemas kini secara munasabah.\n\nMaklumat hubungan ini akan digunakan hanya untuk komunikasi berkaitan perkhidmatan yang penting, termasuk perubahan penting, kemas kini, perkembangan, notis keselamatan, isu teknikal, dan komunikasi sokongan. Ia juga akan digunakan jika kami perlu menghubungi anda berkaitan masalah dengan akaun atau fail yang dimuat naik.\n\nKami tidak akan menggunakan butiran hubungan anda untuk panggilan telefon yang tidak diingini. Kami tidak akan menjual butiran hubungan anda kepada pihak ketiga. Kami tidak akan berkongsi butiran hubungan anda untuk pemasaran pihak ketiga.',
  },
  {
    title: '6. Had Muat Naik',
    body: 'Setiap ahli berdaftar boleh memuat naik keputusan ujian untuk analisis hanya dua kali setiap tahun kalendar. Ini bermakna maksimum dua acara muat naik setahun bagi setiap ahli, sama ada muat naik mengandungi keputusan ujian tanah, keputusan ujian daun, atau kedua-duanya.\n\nJika anda memerlukan muat naik tambahan, anda boleh menghubungi kami dan meminta akses tambahan. Sebarang akses tambahan tersebut adalah mengikut budi bicara kami.',
  },
  {
    title: '7. Laporan Yang Dimuat Naik dan Data Yang Anda Sediakan',
    body: 'Dengan memuat naik laporan ujian tanah, laporan ujian daun, atau fail berkaitan, anda mengesahkan bahawa anda mempunyai hak untuk memuat naiknya dan membenarkan CropDrive.ai memprosesnya untuk analisis.\n\nAnda juga memahami bahawa fail yang dimuat naik mungkin mengandungi maklumat ladang atau butiran lain. CropDrive.ai akan menggunakan kandungan agronomi laporan ini untuk menyediakan analisis dan untuk menambah baik perkhidmatan.',
  },
  {
    title: '8. Maklumat Peribadi dalam Laporan Yang Dimuat Naik',
    body: 'CropDrive.ai direka untuk menggunakan data agronomi seperti nilai ujian tanah dan daun. CropDrive.ai tidak bertujuan menggunakan nama peribadi, butiran hubungan, atau pengecam peribadi lain yang mungkin terdapat dalam laporan yang dimuat naik untuk pemasaran, jualan, atau pemprofilan yang tidak berkaitan.\n\nJika butiran peribadi terdapat dalam laporan yang dimuat naik, butiran tersebut tidak akan dimasukkan dalam set data agregat yang digunakan untuk penambahbaikan perkhidmatan, penanda aras, analitik, atau pembangunan produk.\n\nKami tidak sengaja menggunakan nama peribadi, nombor telefon, alamat emel, alamat, atau pengecam serupa yang terdapat dalam laporan yang dimuat naik untuk sebarang tujuan selain apa yang diperlukan secara teknikal untuk mengendalikan, mengamankan, menyokong, atau menyelesaikan masalah perkhidmatan.',
  },
  {
    title: '9. Data Agregat dan Tanpa Nama',
    body: 'Dengan menggunakan CropDrive.ai, anda bersetuju bahawa kami boleh mengakses, menggunakan, menyimpan, menganalisis, dan menggabungkan data agronomi daripada keputusan ujian tanah dan daun yang dimuat naik dalam bentuk agregat dan tanpa nama.\n\nIni termasuk, sebagai contoh, nilai nutrien, pH, ciri tanah, nilai nutrien daun, trend serantau, corak berkaitan tanaman, dan data analitik bukan peribadi yang serupa.\n\nData agregat dan tanpa nama ini boleh digunakan oleh CropDrive.ai untuk menambah baik platform, menambah baik cadangan, membangunkan ciri baharu, menjalankan penanda aras, menjana statistik, melatih dan menambah baik model, dan memahami corak agronomi dengan lebih baik.\n\nData agregat tidak akan termasuk butiran hubungan peribadi anda.',
  },
  {
    title: '10. Butiran Hubungan dan Data Lokasi',
    body: 'Nombor WhatsApp, alamat emel, dan lokasi anda diperlukan untuk operasi akaun dan komunikasi perkhidmatan. Lokasi anda juga boleh digunakan untuk menyokong kelayakan negara, tafsiran agronomi serantau, kawalan kualiti perkhidmatan, dan pembangunan platform.\n\nKami tidak akan menjual maklumat ini. Kami tidak akan mendedahkannya kepada pihak ketiga yang tidak berkaitan untuk tujuan pemasaran.\n\nDi mana perlu secara ketat untuk mengendalikan, mengehoskan, menyelenggara, mengamankan, atau menyokong perkhidmatan, akses terhad boleh diberikan kepada penyedia perkhidmatan teknikal yang bertindak bagi pihak kami dan di bawah obligasi kerahsiaan dan perlindungan data. Kami juga boleh mendedahkan maklumat apabila dikehendaki oleh undang-undang.',
  },
  {
    title: '11. Tiada Pemasaran Pihak Ketiga',
    body: 'CropDrive.ai tidak akan berkongsi nombor WhatsApp, alamat emel, atau maklumat laporan yang dimuat naik yang boleh dikenal pasti dengan pihak ketiga untuk pengiklanan, permintaan, penjualan semula, penjanaan petunjuk, atau penggunaan komersial yang tidak berkaitan.',
  },
  {
    title: '12. Sokongan dan Hubungan Pengguna',
    body: 'Anda boleh menghubungi kami pada bila-bila masa untuk melaporkan pepijat, masalah teknikal, ralat, dan isu kebolehgunaan, atau untuk meminta bantuan dengan perkhidmatan.\n\nKami boleh menghubungi anda melalui WhatsApp atau emel untuk sokongan, kemas kini penting, notis keselamatan, perubahan produk, isu penggunaan, atau perkembangan perkhidmatan.',
  },
  {
    title: '13. Tiada Jaminan Keputusan',
    body: 'CropDrive.ai menyediakan output maklumat dan sokongan keputusan sahaja. Keputusan analisis, tafsiran, dan cadangan bergantung pada kualiti, kelengkapan, kebolehbacaan, dan ketepatan fail dan data yang anda muat naik.\n\nKami tidak menjamin bahawa sebarang cadangan akan meningkatkan hasil, meningkatkan keuntungan, mencegah penyakit, membetulkan masalah pemakanan, atau menghasilkan sebarang keputusan agronomi atau komersial yang tertentu.\n\nPerkhidmatan ini tidak menggantikan pemeriksaan lapangan, kawalan kualiti makmal, pertimbangan profesional tempatan, atau tanggungjawab anda sendiri untuk keputusan ladang.',
  },
  {
    title: '14. Ketersediaan Perkhidmatan',
    body: 'Kami berhasrat untuk memastikan CropDrive.ai tersedia dan berfungsi dengan baik, tetapi kami tidak menjamin perkhidmatan tanpa gangguan, ketersediaan berterusan, atau operasi tanpa ralat.\n\nPlatform ini boleh dikemas kini, diubah, diganggu, ditangguhkan, atau tidak tersedia buat sementara waktu pada bila-bila masa.',
  },
  {
    title: '15. Ketepatan Input Pengguna',
    body: 'Anda bertanggungjawab untuk memastikan bahawa fail dan maklumat yang anda muat naik adalah tepat, sah, dan relevan. Anda tidak boleh memuat naik bahan yang palsu, mengelirukan, dimanipulasi, berbahaya, haram, atau tidak dibenarkan.',
  },
  {
    title: '16. Penggunaan Yang Betul',
    body: 'Anda bersetuju untuk tidak menyalahgunakan perkhidmatan. Ini termasuk percubaan untuk mengganggu platform, memintas had, memuat naik fail berniat jahat, mengikis sistem, menggunakan akaun orang lain tanpa kebenaran, atau menggunakan perkhidmatan dengan cara yang menyalahi undang-undang atau menyalahgunakan.',
  },
  {
    title: '17. Harta Intelek',
    body: 'CropDrive.ai, termasuk perisian, aliran kerja, reka bentuk, kaedah analisis, output bertulis, struktur data, dan kandungan berkaitan, kekal sebagai hak milik CropDrive.ai atau pemberi lesennya, kecuali bahan yang anda muat naik secara sah.\n\nAnda mengekalkan hak anda dalam fail yang anda muat naik. Anda memberikan CropDrive.ai hak untuk memproses, menyimpan, menganalisis, dan menggunakan fail tersebut dan kandungan agronominya seperti yang diterangkan dalam Terma ini.',
  },
  {
    title: '18. Penggantungan atau Penamatan',
    body: 'Kami boleh menggantung, menyekat, atau menamatkan akses kepada CropDrive.ai jika kami percaya Terma ini telah dilanggar, jika perkhidmatan disalahgunakan, jika maklumat akaun adalah palsu, jika muat naik tidak dibenarkan, atau jika penggantungan diperlukan atas sebab undang-undang, keselamatan, operasi, atau teknikal.',
  },
  {
    title: '19. Pengekalan dan Pemadaman Data',
    body: 'Kami boleh menyimpan fail yang dimuat naik, data agronomi, rekod akaun, log, dan komunikasi perkhidmatan selama yang diperlukan secara munasabah untuk mengendalikan perkhidmatan, mengekalkan keselamatan, menyelesaikan pertikaian, menambah baik platform, memenuhi obligasi undang-undang, dan memelihara set data analitik agregat.\n\nAnda boleh meminta penutupan akaun atau pemadaman data hubungan peribadi anda, tertakluk kepada had undang-undang, teknikal, audit, sandaran, dan operasi.\n\nData agregat atau tanpa nama yang tidak lagi mengenal pasti anda boleh terus disimpan dan digunakan.',
  },
  {
    title: '20. Perubahan kepada Terma Ini',
    body: 'Kami boleh mengemas kini Terma ini dari semasa ke semasa. Jika kami membuat perubahan material, kami boleh memberitahu anda melalui platform, WhatsApp, atau emel. Penggunaan berterusan CropDrive.ai selepas kemas kini bermakna anda menerima Terma yang dikemas kini.',
  },
  {
    title: '21. Had Liabiliti',
    body: 'Setakat yang dibenarkan sepenuhnya oleh undang-undang, CropDrive.ai dan pengendalinya tidak bertanggungjawab atas kerugian tidak langsung, sampingan, khas, berbangkit, atau perniagaan yang timbul daripada penggunaan perkhidmatan, termasuk kehilangan keuntungan, kehilangan hasil, kehilangan data, kehilangan peluang, atau keputusan yang dibuat berdasarkan output platform.\n\nPenggunaan perkhidmatan ini adalah atas risiko anda sendiri.',
  },
  {
    title: '22. Bahasa Pentadbiran',
    body: 'Jika Terma ini diterjemahkan ke dalam bahasa lain, versi Bahasa Inggeris mengawal sekiranya berlaku ketidakselarasan, melainkan undang-undang tempatan menghendaki sebaliknya.',
  },
  {
    title: '23. Hubungi Kami',
    body: 'Jika anda mempunyai soalan, memerlukan sokongan, ingin melaporkan pepijat, ingin meminta muat naik tambahan, atau ingin membangkitkan kebimbangan berkaitan data, anda boleh menghubungi CropDrive.ai melalui butiran hubungan yang disediakan di platform.',
  },
];

const TERMS_SECTIONS_ID = [
  {
    title: '1. Penerimaan Ketentuan Ini',
    body: 'Dengan mendaftar, mengakses, atau menggunakan CropDrive.ai, Anda menyetujui Syarat dan Ketentuan ini. Jika Anda tidak setuju, jangan gunakan layanan ini.',
  },
  {
    title: '2. Tentang Layanan',
    body: 'CropDrive.ai adalah layanan dukungan agronomi digital yang memungkinkan pengguna terdaftar mengunggah hasil uji tanah dan hasil uji daun untuk analisis. Layanan ini saat ini hanya tersedia untuk pengguna yang berlokasi di Malaysia dan Indonesia.',
  },
  {
    title: '3. Kelayakan',
    body: 'Anda dapat menggunakan CropDrive.ai hanya jika Anda secara hukum mampu menyetujui Ketentuan ini dan jika Anda berlokasi di Malaysia atau Indonesia. Dengan menggunakan layanan ini, Anda mengonfirmasi bahwa hasil uji yang diunggah berkaitan dengan perkebunan, lahan, atau operasi yang Anda berwenang untuk mengirimkan data.',
  },
  {
    title: '4. Layanan Gratis',
    body: 'CropDrive.ai saat ini ditawarkan secara gratis kepada petani. Kami berhak untuk mengubah, membatasi, menangguhkan, atau menghentikan layanan ini, secara keseluruhan atau sebagian, kapan saja.',
  },
  {
    title: '5. Informasi Pendaftaran Yang Diperlukan',
    body: 'Untuk menggunakan CropDrive.ai, Anda harus menyediakan nomor WhatsApp yang valid, alamat email yang valid, dan lokasi Anda. Anda setuju bahwa informasi ini akurat dan diperbarui secara wajar.\n\nInformasi kontak ini akan digunakan hanya untuk komunikasi terkait layanan yang penting, termasuk perubahan penting, pembaruan, perkembangan, pemberitahuan keamanan, masalah teknis, dan komunikasi dukungan. Ini juga akan digunakan jika kami perlu menghubungi Anda terkait masalah dengan akun atau file yang diunggah.\n\nKami tidak akan menggunakan detail kontak Anda untuk panggilan telepon yang tidak diinginkan. Kami tidak akan menjual detail kontak Anda kepada pihak ketiga. Kami tidak akan membagikan detail kontak Anda untuk pemasaran pihak ketiga.',
  },
  {
    title: '6. Batas Unggahan',
    body: 'Setiap anggota terdaftar dapat mengunggah hasil uji untuk analisis hanya dua kali per tahun kalender. Ini berarti maksimum dua acara unggahan per tahun per anggota, baik unggahan berisi hasil uji tanah, hasil uji daun, atau keduanya.\n\nJika Anda memerlukan unggahan tambahan, Anda dapat menghubungi kami dan meminta akses tambahan. Akses tambahan tersebut sesuai kebijaksanaan kami.',
  },
  {
    title: '7. Laporan Yang Diunggah dan Data Yang Anda Berikan',
    body: 'Dengan mengunggah laporan uji tanah, laporan uji daun, atau file terkait, Anda mengonfirmasi bahwa Anda memiliki hak untuk mengunggahnya dan mengizinkan CropDrive.ai memprosesnya untuk analisis.\n\nAnda juga memahami bahwa file yang diunggah mungkin berisi informasi perkebunan atau detail lainnya. CropDrive.ai akan menggunakan konten agronomi laporan ini untuk menyediakan analisis dan untuk meningkatkan layanan.',
  },
  {
    title: '8. Informasi Pribadi dalam Laporan Yang Diunggah',
    body: 'CropDrive.ai dirancang untuk menggunakan data agronomi seperti nilai uji tanah dan daun. CropDrive.ai tidak dimaksudkan untuk menggunakan nama pribadi, detail kontak, atau pengidentifikasi pribadi lain yang mungkin muncul dalam laporan yang diunggah untuk pemasaran, penjualan, atau profiling yang tidak terkait.\n\nJika detail pribadi muncul dalam laporan yang diunggah, detail tersebut tidak akan dimasukkan dalam kumpulan data agregat yang digunakan untuk peningkatan layanan, benchmarking, analitik, atau pengembangan produk.\n\nKami tidak dengan sengaja menggunakan nama pribadi, nomor telepon, alamat email, alamat, atau pengidentifikasi serupa yang muncul dalam laporan yang diunggah untuk tujuan apa pun selain yang diperlukan secara teknis untuk mengoperasikan, mengamankan, mendukung, atau memecahkan masalah layanan.',
  },
  {
    title: '9. Data Agregat dan Anonim',
    body: 'Dengan menggunakan CropDrive.ai, Anda setuju bahwa kami dapat mengakses, menggunakan, menyimpan, menganalisis, dan menggabungkan data agronomi dari hasil uji tanah dan daun yang diunggah dalam bentuk agregat dan anonim.\n\nIni termasuk, misalnya, nilai nutrisi, pH, karakteristik tanah, nilai nutrisi daun, tren regional, pola terkait tanaman, dan data analitis non-pribadi serupa.\n\nData agregat dan anonim ini dapat digunakan oleh CropDrive.ai untuk meningkatkan platform, meningkatkan rekomendasi, mengembangkan fitur baru, melakukan benchmarking, menghasilkan statistik, melatih dan meningkatkan model, dan lebih memahami pola agronomi.\n\nData agregat tidak akan mencakup detail kontak pribadi Anda.',
  },
  {
    title: '10. Detail Kontak dan Data Lokasi',
    body: 'Nomor WhatsApp, alamat email, dan lokasi Anda diperlukan untuk operasi akun dan komunikasi layanan. Lokasi Anda juga dapat digunakan untuk mendukung kelayakan negara, interpretasi agronomi regional, kontrol kualitas layanan, dan pengembangan platform.\n\nKami tidak akan menjual informasi ini. Kami tidak akan mengungkapkannya kepada pihak ketiga yang tidak terkait untuk tujuan pemasaran.\n\nJika benar-benar diperlukan untuk mengoperasikan, menghosting, memelihara, mengamankan, atau mendukung layanan, akses terbatas dapat diberikan kepada penyedia layanan teknis yang bertindak atas nama kami dan di bawah kewajiban kerahasiaan dan perlindungan data. Kami juga dapat mengungkapkan informasi bila diwajibkan oleh hukum.',
  },
  {
    title: '11. Tidak Ada Pemasaran Pihak Ketiga',
    body: 'CropDrive.ai tidak akan membagikan nomor WhatsApp, alamat email, atau informasi laporan yang diunggah yang dapat diidentifikasi kepada pihak ketiga untuk periklanan, permintaan, penjualan kembali, penjanaan prospek, atau penggunaan komersial yang tidak terkait.',
  },
  {
    title: '12. Dukungan dan Kontak Pengguna',
    body: 'Anda dapat menghubungi kami kapan saja untuk melaporkan bug, masalah teknis, kesalahan, dan masalah kegunaan, atau untuk meminta bantuan dengan layanan.\n\nKami dapat menghubungi Anda melalui WhatsApp atau email untuk dukungan, pembaruan penting, pemberitahuan keamanan, perubahan produk, masalah penggunaan, atau perkembangan layanan.',
  },
  {
    title: '13. Tidak Ada Jaminan Hasil',
    body: 'CropDrive.ai menyediakan output informasi dan dukungan keputusan saja. Hasil analisis, interpretasi, dan rekomendasi bergantung pada kualitas, kelengkapan, keterbacaan, dan keakuratan file dan data yang Anda unggah.\n\nKami tidak menjamin bahwa rekomendasi apa pun akan meningkatkan hasil panen, meningkatkan profitabilitas, mencegah penyakit, memperbaiki masalah nutrisi, atau menghasilkan hasil agronomi atau komersial tertentu.\n\nLayanan ini tidak menggantikan inspeksi lapangan, kontrol kualitas laboratorium, penilaian profesional lokal, atau tanggung jawab Anda sendiri atas keputusan perkebunan.',
  },
  {
    title: '14. Ketersediaan Layanan',
    body: 'Kami bertujuan untuk menjaga CropDrive.ai tersedia dan berfungsi dengan baik, tetapi kami tidak menjamin layanan tanpa gangguan, ketersediaan berkelanjutan, atau operasi bebas kesalahan.\n\nPlatform dapat diperbarui, diubah, diganggu, ditunda, atau tidak tersedia sementara kapan saja.',
  },
  {
    title: '15. Keakuratan Input Pengguna',
    body: 'Anda bertanggung jawab untuk memastikan bahwa file dan informasi yang Anda unggah akurat, sah, dan relevan. Anda tidak boleh mengunggah materi yang palsu, menyesatkan, dimanipulasi, berbahaya, ilegal, atau tidak sah.',
  },
  {
    title: '16. Penggunaan Yang Benar',
    body: 'Anda setuju untuk tidak menyalahgunakan layanan. Ini termasuk upaya untuk mengganggu platform, melewati batas, mengunggah file berbahaya, mengikis sistem, menggunakan akun orang lain tanpa izin, atau menggunakan layanan dengan cara yang melanggar hukum atau menyalahgunakan.',
  },
  {
    title: '17. Kekayaan Intelektual',
    body: 'CropDrive.ai, termasuk perangkat lunaknya, alur kerja, desain, metode analisis, output tertulis, struktur data, dan konten terkait, tetap menjadi milik CropDrive.ai atau pemberi lisensinya, kecuali materi yang Anda unggah secara sah.\n\nAnda mempertahankan hak Anda atas file yang Anda unggah. Anda memberikan CropDrive.ai hak untuk memproses, menyimpan, menganalisis, dan menggunakan file tersebut dan konten agronominya seperti yang dijelaskan dalam Ketentuan ini.',
  },
  {
    title: '18. Penangguhan atau Penghentian',
    body: 'Kami dapat menangguhkan, membatasi, atau menghentikan akses ke CropDrive.ai jika kami percaya Ketentuan ini telah dilanggar, jika layanan disalahgunakan, jika informasi akun palsu, jika unggahan tidak sah, atau jika penangguhan diperlukan karena alasan hukum, keamanan, operasional, atau teknis.',
  },
  {
    title: '19. Penyimpanan dan Penghapusan Data',
    body: 'Kami dapat menyimpan file yang diunggah, data agronomi, catatan akun, log, dan komunikasi layanan selama yang diperlukan secara wajar untuk mengoperasikan layanan, menjaga keamanan, menyelesaikan sengketa, meningkatkan platform, memenuhi kewajiban hukum, dan memelihara kumpulan data analitis agregat.\n\nAnda dapat meminta penutupan akun atau penghapusan data kontak pribadi Anda, tunduk pada batasan hukum, teknis, audit, cadangan, dan operasional.\n\nData agregat atau anonim yang tidak lagi mengidentifikasi Anda dapat terus disimpan dan digunakan.',
  },
  {
    title: '20. Perubahan Ketentuan Ini',
    body: 'Kami dapat memperbarui Ketentuan ini dari waktu ke waktu. Jika kami membuat perubahan material, kami dapat memberi tahu Anda melalui platform, WhatsApp, atau email. Penggunaan berkelanjutan CropDrive.ai setelah pembaruan berarti Anda menerima Ketentuan yang diperbarui.',
  },
  {
    title: '21. Batasan Tanggung Jawab',
    body: 'Sejauh diizinkan sepenuhnya oleh hukum, CropDrive.ai dan operatornya tidak bertanggung jawab atas kerugian tidak langsung, insidental, khusus, konsekuensial, atau bisnis yang timbul dari penggunaan layanan, termasuk kehilangan keuntungan, kehilangan hasil panen, kehilangan data, kehilangan peluang, atau keputusan yang dibuat berdasarkan output platform.\n\nPenggunaan layanan ini atas risiko Anda sendiri.',
  },
  {
    title: '22. Bahasa Yang Mengatur',
    body: 'Jika Ketentuan ini diterjemahkan ke dalam bahasa lain, versi Bahasa Inggris mengatur jika terjadi ketidaksesuaian, kecuali hukum lokal menghendaki sebaliknya.',
  },
  {
    title: '23. Hubungi Kami',
    body: 'Jika Anda memiliki pertanyaan, memerlukan dukungan, ingin melaporkan bug, ingin meminta unggahan tambahan, atau ingin mengajukan masalah terkait data, Anda dapat menghubungi CropDrive.ai melalui detail kontak yang disediakan di platform.',
  },
];

function getTermsSections(language: string) {
  if (language === 'id') return TERMS_SECTIONS_ID;
  if (language === 'ms') return TERMS_SECTIONS_MS;
  return TERMS_SECTIONS_EN;
}

export default function RegisterPage() {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const termsScrollRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    farmName: '',
    farmLocation: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const { signUp, user, loading: authLoading } = useAuth();
  const router = useRouter();

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

  const handleOpenTermsModal = () => {
    if (!agreeToTerms) setHasScrolledToBottom(false);
    setShowTermsModal(true);
  };

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 50;
    if (atBottom) setHasScrolledToBottom(true);
  };

  const handleAcceptTerms = () => {
    if (!hasScrolledToBottom) {
      toast.error(copy('Please scroll through and read the full Terms and Conditions before accepting.', 'Sila tatal dan baca keseluruhan Terma dan Syarat sebelum menerima.'));
      return;
    }
    setAgreeToTerms(true);
    setShowTermsModal(false);
  };

  const handleCloseTermsModal = () => {
    setShowTermsModal(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return copy('Full name is required', 'Nama penuh diperlukan');
    }
    if (!formData.email.trim()) {
      return copy('Email is required', 'Email diperlukan');
    }
    if (!formData.phone.trim()) {
      return copy('WhatsApp number is required', 'Nombor WhatsApp diperlukan');
    }
    if (!formData.farmLocation.trim()) {
      return copy('Country/Region is required', 'Negara/Wilayah diperlukan');
    }
    if (!formData.password) {
      return copy('Password is required', 'Kata laluan diperlukan');
    }
    if (formData.password.length < 6) {
      return copy('Password must be at least 6 characters', 'Kata laluan mestilah sekurang-kurangnya 6 aksara');
    }
    if (formData.password !== formData.confirmPassword) {
      return copy('Passwords do not match', 'Kata laluan tidak sepadan');
    }
    if (!agreeToTerms) {
      return copy('Please agree to the terms of service', 'Sila bersetuju dengan syarat perkhidmatan');
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setLoading(true);

      await signUp({
        email: formData.email,
        password: formData.password,
        displayName: formData.name,
        phoneNumber: formData.phone,
        farmName: formData.farmName,
        farmLocation: formData.farmLocation,
        countryRegion: formData.farmLocation,
        language: language as Language,
      }, language);

      // Show post-registration instructions instead of immediate redirect
      setRegisteredEmail(formData.email);
      setRegistrationComplete(true);
      toast.success(
        copy('Registration successful! Please check your email to verify your account.', 'Pendaftaran berjaya! Sila semak emel anda untuk pengesahan akaun.')
      );
    } catch (error) {
      console.error('Registration error:', error);
      // Error already handled by signUp function with toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        nav { display: none !important; }
        footer { display: none !important; }
      `}</style>
      
      <div className="min-h-screen flex items-center justify-center py-6 xs:py-8 sm:py-12 px-3 xs:px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-32 left-20 w-40 h-40 bg-green-400/20 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="max-w-2xl w-full space-y-4 xs:space-y-5 sm:space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          >
            <div className="text-center">
              <Link href="/" className="inline-flex items-center justify-center space-x-2 xs:space-x-3 mb-4 xs:mb-6 sm:mb-8 group">
                <motion.div 
                  className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all p-2 xs:p-2.5 sm:p-3"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src="/images/Cropdrive Logo.png"
                    alt="CropDrive Logo"
                    width={40}
                    height={40}
                    className="object-contain w-full h-full"
                    priority
                  />
                </motion.div>
                <span className="font-black text-2xl xs:text-3xl text-white font-heading">
                  CropDrive<span className="text-yellow-400">™</span>
                </span>
              </Link>

              <motion.h2 
                className="text-2xl xs:text-3xl sm:text-4xl font-black text-white mb-2 xs:mb-3 font-heading px-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {copy('Create New Account', 'Cipta Akaun Baru')}
              </motion.h2>
              <motion.p 
                className="text-green-100 text-sm xs:text-base sm:text-lg px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {copy('Join thousands of farmers using AI for better yields', 'Sertai ribuan petani yang menggunakan AI untuk hasil yang lebih baik')}
              </motion.p>
            </div>
          </motion.div>

          {/* Terms & Conditions Modal */}
          {showTermsModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="terms-modal-title"
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleCloseTermsModal}
              />
              {/* Modal card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
                style={{ maxHeight: '90vh' }}
              >
                {/* Modal Header */}
                <div className="px-5 xs:px-6 sm:px-8 pt-5 xs:pt-6 pb-4 border-b border-gray-200 flex items-start justify-between gap-4">
                  <div>
                    <h3 id="terms-modal-title" className="text-lg xs:text-xl font-black text-gray-900">
                      {copy('Terms and Conditions of Use', 'Terma dan Syarat Penggunaan')}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {copy('Scroll to the bottom, then click Accept.', 'Tatal ke bawah, kemudian klik Terima.')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseTermsModal}
                    className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-1"
                    aria-label="Close"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Scrollable Terms Body */}
                <div
                  ref={termsScrollRef}
                  onScroll={handleTermsScroll}
                  className="overflow-y-auto flex-1 px-5 xs:px-6 sm:px-8 py-4"
                >
                  {getTermsSections(language).map((section, idx) => (
                    <div key={idx} className="mb-5">
                      <h4 className="text-sm font-black text-gray-900 mb-1">{section.title}</h4>
                      {section.body.split('\n\n').map((para, pIdx) => (
                        <p key={pIdx} className="text-xs xs:text-sm text-gray-700 mb-2 leading-relaxed">{para}</p>
                      ))}
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 text-center italic py-2">
                    {copy('— End of Terms and Conditions —', '— Akhir Terma dan Syarat —')}
                  </p>
                </div>

                {/* Scroll status banner */}
                {!hasScrolledToBottom ? (
                  <div className="px-5 xs:px-6 sm:px-8 py-2 bg-yellow-50 border-t border-yellow-200 flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-600 shrink-0 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <p className="text-xs text-yellow-700 font-semibold">
                      {copy('Please scroll to the bottom to enable acceptance.', 'Sila tatal ke bawah untuk mengaktifkan penerimaan.')}
                    </p>
                  </div>
                ) : (
                  <div className="px-5 xs:px-6 sm:px-8 py-2 bg-green-50 border-t border-green-200 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-xs text-green-700 font-semibold">
                      {copy('You have read the full Terms and Conditions.', 'Anda telah membaca keseluruhan Terma dan Syarat.')}
                    </p>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="px-5 xs:px-6 sm:px-8 py-4 border-t border-gray-200 flex flex-col xs:flex-row gap-3">
                  <motion.button
                    type="button"
                    onClick={handleAcceptTerms}
                    disabled={!hasScrolledToBottom}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-black py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm flex items-center justify-center gap-2"
                    whileHover={hasScrolledToBottom ? { scale: 1.02 } : {}}
                    whileTap={hasScrolledToBottom ? { scale: 0.98 } : {}}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                    {copy('I Accept', 'Saya Terima')}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleCloseTermsModal}
                    className="flex-1 xs:flex-none bg-gray-100 text-gray-700 font-bold py-3 px-5 rounded-xl hover:bg-gray-200 transition-all text-sm flex items-center justify-center gap-2 border border-gray-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4" />
                    {copy('Close', 'Tutup')}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white/95 backdrop-blur-xl rounded-2xl xs:rounded-3xl shadow-2xl p-5 xs:p-6 sm:p-8 border border-white/20"
          >
            {registrationComplete ? (
              <div className="space-y-4 xs:space-y-5 sm:space-y-6 text-center">
                <h3 className="text-xl xs:text-2xl sm:text-3xl font-black text-gray-900">
                  {copy('Account Created Successfully!', 'Akaun Berjaya Dicipta!')}
                </h3>
                <p className="text-sm xs:text-base text-gray-700">
                  {copy('We have sent a verification email to', 'Kami telah menghantar emel pengesahan ke')}{' '}
                  <span className="font-bold text-green-700 break-all">
                    {registeredEmail}
                  </span>
                  .
                </p>
                <p className="text-sm xs:text-base text-gray-700">
                  {copy('Please check your inbox and spam folder, then click the verification button in the email to activate your account.', 'Sila semak peti masuk dan folder spam anda, kemudian klik butang pengesahan dalam emel untuk mengaktifkan akaun anda.')}
                </p>
                <p className="text-sm xs:text-base text-gray-700">
                  {copy('After clicking the button, you will be redirected to the login page and can then sign in to your account.', 'Selepas mengklik butang tersebut, anda akan diarahkan ke halaman log masuk dan boleh log masuk ke akaun anda.')}
                </p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-black text-sm xs:text-base shadow-lg hover:from-green-700 hover:to-green-800 transition-all"
                  >
                      {copy('Go to Login Page', 'Pergi ke Halaman Log Masuk')}
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4 xs:space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {copy('Full Name', 'Nama Penuh')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder={copy('Your full name', 'Nama penuh anda')}
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        disabled={loading}
                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-200 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm xs:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {copy('Email', 'Email')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder={copy('name@email.com', 'nama@email.com')}
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        disabled={loading}
                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-200 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm xs:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {copy('WhatsApp Number', 'Nombor WhatsApp')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder={language === 'ms' ? '+60123456789' : '+60123456789'}
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                        disabled={loading}
                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-200 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm xs:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {copy('Farm Name', 'Nama Ladang')}
                      </label>
                      <input
                        type="text"
                        placeholder={copy('Your farm name', 'Nama ladang anda')}
                        value={formData.farmName}
                        onChange={(e) => handleInputChange('farmName', e.target.value)}
                        disabled={loading}
                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-200 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm xs:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {copy('Country / Region', 'Negara / Wilayah')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder={copy('Malaysia, Indonesia, etc.', 'Malaysia, Indonesia, dll.')}
                        value={formData.farmLocation}
                        onChange={(e) => handleInputChange('farmLocation', e.target.value)}
                        required
                        disabled={loading}
                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-200 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm xs:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {copy('Password', 'Kata Laluan')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={copy('Your password', 'Kata laluan anda')}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          required
                          disabled={loading}
                          className="w-full px-3 xs:px-4 py-2.5 xs:py-3 pr-10 xs:pr-12 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-200 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm xs:text-base"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showPassword ? (
                            <FontAwesomeIcon icon={faEyeSlash} className="w-5 h-5" />
                          ) : (
                            <FontAwesomeIcon icon={faEye} className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {copy('Confirm Password', 'Sahkan Kata Laluan')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={copy('Confirm password', 'Sahkan kata laluan')}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          required
                          disabled={loading}
                          className="w-full px-3 xs:px-4 py-2.5 xs:py-3 pr-10 xs:pr-12 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-200 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm xs:text-base"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <FontAwesomeIcon icon={faEyeSlash} className="w-5 h-5" />
                          ) : (
                            <FontAwesomeIcon icon={faEye} className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (agreeToTerms) {
                          setAgreeToTerms(false);
                        } else {
                          handleOpenTermsModal();
                        }
                      }}
                      className="mt-0.5 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-green-400"
                      style={{
                        backgroundColor: agreeToTerms ? '#16a34a' : 'white',
                        borderColor: agreeToTerms ? '#16a34a' : '#d1d5db',
                      }}
                      aria-checked={agreeToTerms}
                      role="checkbox"
                      aria-label={copy('Agree to Terms and Conditions', 'Bersetuju dengan Terma dan Syarat')}
                    >
                      {agreeToTerms && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <p className="text-sm text-gray-700">
                      {copy('I have read and agree to the', 'Saya telah membaca dan bersetuju dengan')}{' '}
                      <button
                        type="button"
                        onClick={handleOpenTermsModal}
                        className="text-green-700 hover:text-green-800 font-bold underline transition-colors"
                      >
                        {copy('Terms and Conditions', 'Terma dan Syarat')}
                      </button>
                      {' '}{copy('and', 'dan')}{' '}
                      <Link href="/privacy" className="text-green-700 hover:text-green-800 font-bold underline">
                        {copy('Privacy Policy', 'Dasar Privasi')}
                      </Link>
                      {agreeToTerms && (
                        <span className="ml-2 inline-flex items-center gap-1 text-green-700 font-semibold text-xs">
                          <FontAwesomeIcon icon={faCheckCircle} className="w-3.5 h-3.5" />
                          {copy('Accepted', 'Diterima')}
                        </span>
                      )}
                    </p>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading || !agreeToTerms}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-black py-3 xs:py-3.5 sm:py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm xs:text-base"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a 8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        {copy('Creating Account...', 'Mencipta Akaun...')}
                      </span>
                    ) : (
                      copy('Create Account', 'Cipta Akaun')
                    )}
                  </motion.button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    {copy('Already have an account?', 'Sudah mempunyai akaun?')}{' '}
                    <Link
                      href="/login"
                      className="text-green-700 hover:text-green-800 font-bold transition-colors"
                    >
                      {copy('Sign in here', 'Log masuk di sini')}
                    </Link>
                  </p>
                </div>
              </>
            )}
          </motion.div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center"
          >
            <Link href="/" className="inline-flex items-center text-white/80 hover:text-white font-semibold transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {copy('Back to Home', 'Kembali ke Laman Utama')}
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}
