'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faBookOpen,
  faBolt,
  faLeaf,
  faChartLine,
  faChartColumn,
  faEye,
  faHandshake,
  faRocket,
  faUsers,
  faCog,
  faGlobe,
  faSeedling,
  faMicroscope,
  faXmark,
  faExternalLink,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';

interface BlogPost {
  id: string;
  title: string;
  titleMs: string;
  excerpt: string;
  excerptMs: string;
  content: string;
  contentMs: string;
  author: string;
  authorMs: string;
  date: string;
  readTime: string;
  readTimeMs: string;
  category: string;
  categoryMs: string;
  tags: string[];
  tagsMs: string[];
  image: string;
  featured?: boolean;
  published?: boolean;
  sourceUrl?: string;
}

const BLOG_IMAGES_BASE = '/images/blog';
const DEFAULT_BLOG_IMAGE = `${BLOG_IMAGES_BASE}/cropdrive-intro.jpg`;

function getBlogImageSrc(path: string | undefined): string {
  if (!path || !path.trim()) return DEFAULT_BLOG_IMAGE;
  let p = path.trim();
  // Upgrade http to https so Next.js image domain config only needs https
  if (p.startsWith('http://')) p = 'https://' + p.slice(7);
  if (p.startsWith('https://')) return p;
  return p.startsWith('/') ? p : `${BLOG_IMAGES_BASE}/${p.replace(/^\//, '')}`;
}

// Static blog posts â€” real AGS content with Squarespace CDN images (fallback if API fails)
const staticBlogPosts: BlogPost[] = [
  // â”€â”€ Featured Posts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'ags-fusarium-wilt',
    title: 'Is South Asia Prepared? The Rising Biosecurity Threat of Fusarium Wilt in Oil Palm',
    titleMs: 'Adakah Asia Selatan Bersedia? Ancaman Biosekuriti Fusarium Wilt yang Meningkat dalam Kelapa Sawit',
    excerpt: 'Fusarium wiltâ€”caused by Fusarium oxysporum f. sp. elaeidisâ€”is the most destructive disease of oil palm. Indonesia and Malaysia, accounting for over 85% of global palm oil production, face catastrophic risk as this silent soil-borne pathogen edges closer to South Asia.',
    excerptMs: 'Fusarium wiltâ€”disebabkan oleh Fusarium oxysporum f. sp. elaeidisâ€”adalah penyakit paling merosakkan kelapa sawit. Indonesia dan Malaysia, menyumbang lebih 85% pengeluaran minyak sawit global, menghadapi risiko besar apabila patogen terbawa tanah yang senyap ini menghampiri Asia Selatan.',
    content: `Oil palm is one of the world's most valuable crops, producing over 77 million tonnes of palm oil annually and supporting millions of livelihoods across Southeast Asia. But this global industry faces a serious and growing biosecurity threat from Fusarium wilt, caused by the soil-borne fungal pathogen Fusarium oxysporum f. sp. elaeidis (Foe). Though currently restricted to parts of Africa and South America, experts warn that its potential arrival in South Asia could devastate the heart of global palm oil production.

Fusarium wilt attacks the plant's vascular system, blocking water and nutrient transport. Fronds yellow and wilt, growth weakens, and infected trees often die prematurely. Critically, early symptoms can be absent for yearsâ€”allowing silent spread across entire plantations before an outbreak becomes visible. The pathogen survives in soil using thick-walled chlamydospores that remain dormant for decades, making elimination virtually impossible once established.

South Asia's vulnerability is compounded by several factors: most plantations use African-derived germplasm that is highly susceptible to Foe; biosecurity protocols for international seed and pollen exchange are weak; and contaminated soil, farm tools, water runoff, and even footwear can spread the pathogen across long distances. In Africa, yield losses from Foe range from 6â€“16%, with some localized outbreaks causing up to 50% loss. A 10% reduction in Indonesia's 45 million tonne output would represent billions in economic damage.

Key preventive actions include: investing in resistant variety breeding programs tailored to South Asian conditions, implementing rigorous nursery certification and pathogen testing, deploying rapid molecular diagnostics (PCR and LAMP) for early detection, harmonizing quarantine and disinfection protocols across Indonesia, Malaysia, and PNG, and training farmers in early symptom recognition. The time to act is nowâ€”before the pathogen reaches South Asian shores.`,
    contentMs: `Kelapa sawit adalah salah satu tanaman paling berharga di dunia, menghasilkan lebih 77 juta tan minyak sawit setiap tahun. Industri global ini menghadapi ancaman biosekuriti yang serius dari Fusarium wilt, disebabkan oleh patogen kulat terbawa tanah Fusarium oxysporum f. sp. elaeidis (Foe). Walaupun kini terhad kepada bahagian Afrika dan Amerika Selatan, pakar memberi amaran bahawa ketibaan potensialnya di Asia Selatan boleh memusnahkan pengeluaran minyak sawit global.

Fusarium wilt menyerang sistem vaskular tumbuhan, menyekat pengangkutan air dan nutrien. Pelepah menguning dan layu, pertumbuhan melemah, dan pokok yang dijangkiti sering mati awal. Secara kritikal, gejala awal boleh tiada selama bertahun-tahun, membenarkan penyebaran senyap merentasi ladang sebelum wabak menjadi kelihatan.

Kerentanan Asia Selatan diburukkan oleh beberapa faktor: kebanyakan ladang menggunakan plasma nutfah keturunan Afrika yang sangat terdedah kepada Foe; protokol biosekuriti untuk pertukaran benih dan debunga antarabangsa adalah lemah. Di Afrika, kehilangan hasil dari Foe berkisar antara 6â€“16%, dengan beberapa wabak menyebabkan kehilangan sehingga 50%.

Tindakan pencegahan utama yang disyorkan oleh pakar AGS termasuk: melabur dalam program pembiakan varieti tahan, melaksanakan pensijilan tapan semaian yang ketat, menggunakan diagnostik molekul yang pantas untuk pengesanan awal, menyelaraskan protokol kuarantin merentasi Indonesia, Malaysia dan PNG, dan melatih petani dalam pengecaman gejala awal.`,
    author: 'Alexander Loladze, AGS',
    authorMs: 'Alexander Loladze, AGS',
    date: '2025-04-15',
    readTime: '8 min read',
    readTimeMs: '8 minit bacaan',
    category: 'Palm Oil',
    categoryMs: 'Kelapa Sawit',
    tags: ['Palm Oil', 'Biosecurity', 'Fusarium Wilt', 'Disease Management', 'Malaysia'],
    tagsMs: ['Kelapa Sawit', 'Biosekuriti', 'Fusarium Wilt', 'Pengurusan Penyakit', 'Malaysia'],
    image: 'https://images.squarespace-cdn.com/content/v1/664f726caa96fb6042fac225/8b34f64f-dfe0-4f44-8be9-ebf08d9feb1d/Agriculture%2BConsultancy%2BPlant%2Bbreeding%2Bcrop%2Bscience%2Bgenetics%2Bplant%2Bpathology%2Bagronomy%2Bremote%2Bsensing%2Bprecision%2Bagriculture+%281%29.jpeg?format=1000w',
    featured: true,
    published: true,
    sourceUrl: 'https://www.agriglobalsolutions.com/updates-insights/is-south-asia-prepared-the-rising-biosecurity-threat-of-fusarium-wilt-in-oil-palm',
  },
  {
    id: 'ags-ai-yield-predictions',
    title: 'Enhancing Palm Oil Agronomy: AI-Driven Yield Predictions with Machine Learning',
    titleMs: 'Meningkatkan Agronomi Kelapa Sawit: Ramalan Hasil Dipacu AI dengan Pembelajaran Mesin',
    excerpt: 'A landmark 11-year study across 49 plots in Malaysia found the Extra Trees Regressor achieves an RÂ² of 0.65 in palm oil yield predictionâ€”a substantial leap over traditional methods. Machine learning and deep learning are now essential tools for sustainable plantation management.',
    excerptMs: 'Kajian perintis selama 11 tahun merentasi 49 plot di Malaysia mendapati Extra Trees Regressor mencapai RÂ² 0.65 dalam ramalan hasil kelapa sawitâ€”lonjakan ketara berbanding kaedah tradisional. Pembelajaran mesin dan pembelajaran mendalam kini merupakan alat penting untuk pengurusan ladang yang lestari.',
    content: `The palm oil industry stands at a critical juncture where advanced technologies can significantly impact its sustainability and productivity. Accurate yield prediction is essential not only for effective resource management but also for optimizing the entire palm oil supply chain. With growing demand and increasing pressure to adopt sustainable practices, machine learning and deep learning are offering promising solutions.

Machine learning in agriculture involves algorithms that analyze large datasets to identify patterns and make predictions. In the context of palm oil, these datasets include soil composition, climatic conditions, palm tree age, and farming techniques. By training models on this data, researchers develop predictive tools that estimate future yields based on current and historical informationâ€”allowing plantation managers to optimize fertilizer use, water application, and labor allocation.

Deep learning takes this further by utilizing neural networks that capture complex non-linear relationships between yield-influencing factors. For example, deep learning models can simultaneously consider the interplay between soil nutrients, weather patterns, and plant biology, providing nuanced predictions that single-variable models cannot achieve. This is particularly valuable in palm oil farming where multiple variables interact in unpredictable ways.

A landmark study conducted over 11 years across 49 plots in Malaysia applied 17 different models. The Extra Trees Regressor achieved the highest accuracy with an RÂ² of 0.65â€”explaining 65% of yield variation, a substantial improvement over traditional methods. These findings indicate that by leveraging AI, plantation managers can improve planning, optimize resource allocation, reduce waste, and support the shift toward sustainable palm oil production.`,
    contentMs: `Industri kelapa sawit berada di persimpangan kritikal di mana teknologi canggih boleh memberi kesan yang ketara kepada kemampanan dan produktivitinya. Ramalan hasil yang tepat adalah penting bukan sahaja untuk pengurusan sumber yang berkesan tetapi juga untuk mengoptimumkan seluruh rantai bekalan minyak sawit.

Pembelajaran mesin dalam pertanian melibatkan algoritma yang menganalisis set data besar untuk mengenal pasti corak dan membuat ramalan. Dalam konteks kelapa sawit, set data ini termasuk komposisi tanah, keadaan iklim, usia pokok kelapa sawit, dan teknik pertanian.

Pembelajaran mendalam mengambil langkah selanjutnya dengan menggunakan rangkaian neural yang menangkap hubungan tidak linear yang kompleks antara faktor-faktor yang mempengaruhi hasil kelapa sawit.

Kajian penting selama 11 tahun merentasi 49 plot di Malaysia menggunakan 17 model yang berbeza. Extra Trees Regressor muncul sebagai yang paling berkesan, mencapai RÂ² 0.65â€”peningkatan ketara berbanding kaedah tradisional dalam meramal hasil kelapa sawit.`,
    author: 'Alexander Loladze, AGS',
    authorMs: 'Alexander Loladze, AGS',
    date: '2025-03-20',
    readTime: '7 min read',
    readTimeMs: '7 minit bacaan',
    category: 'Palm Oil',
    categoryMs: 'Kelapa Sawit',
    tags: ['Palm Oil', 'AI', 'Machine Learning', 'Yield Prediction', 'Agronomy'],
    tagsMs: ['Kelapa Sawit', 'AI', 'Pembelajaran Mesin', 'Ramalan Hasil', 'Agronomi'],
    image: 'https://images.squarespace-cdn.com/content/v1/664f726caa96fb6042fac225/dfc39bc1-663c-4279-b80c-9189962f4abb/Oil+palm+plantation+aerial+photo+drone.png?format=1000w',
    featured: true,
    published: true,
    sourceUrl: 'https://www.agriglobalsolutions.com/updates-insights/enhancing-palm-oil-agronomy-ai-driven-yield-predictions-with-machine-learning',
  },
  {
    id: 'ags-precision-agriculture-ai',
    title: 'Precision Agriculture: The AI-Powered Path to Sustainable Farming',
    titleMs: 'Pertanian Presisi: Laluan Berkuasa AI menuju Pertanian Lestari',
    excerpt: 'AI is transforming how farms operateâ€”from precision crop monitoring via satellites, drones, and ground sensors, to smarter resource management and full automation of farm tasks. AGS experts show how these technologies integrate into sustainable, profitable operations.',
    excerptMs: 'AI sedang mengubah cara ladang beroperasiâ€”dari pemantauan tanaman presisi melalui satelit, dron, dan penderia tanah, kepada pengurusan sumber yang lebih bijak dan automasi penuh tugas ladang. Pakar AGS menunjukkan cara mengintegrasikan teknologi ini ke dalam operasi yang lestari dan menguntungkan.',
    content: `In today's agricultural landscape, the need to produce more food with fewer resources has never been greater. Integrating Artificial Intelligence into farming practices offers a clear path forward, making operations more efficient and sustainable. A recent study published in the World Journal of Advanced Research and Reviews sheds light on AI's crucial role in modern farming across crop monitoring, resource management, and automation.

AI has significantly improved crop monitoring. High-resolution satellite imagery gives farmers a broad view of their fields, identifying patterns invisible from the ground. Drones capture detailed aerial images that AI analyzes to detect subtle changes in plant healthâ€”enabling early intervention. Ground sensors monitor soil moisture, temperature, and nutrient levels, with AI predicting optimal times for watering, fertilizing, and harvesting. These tools reduce waste and minimize environmental impactâ€”key pillars of sustainable farming.

AI also transforms resource management. Smart irrigation systems use sensor data and weather forecasts to determine exactly how much water crops need, conserving water while ensuring proper hydration. AI-driven customized fertilization plans maximize nutrient efficiency and reduce runoff. Pest and disease prediction models analyze historical data and current conditions for early, targeted actionâ€”reducing reliance on broad-spectrum pesticides.

At AGS, our mission is to help farmers navigate AI integration complexity. We provide expert data management services that turn complex datasets into actionable insights, optimized resource-use solutions, and advanced automation support. By partnering with AGS, farmers turn AI's potential into real, measurable improvementsâ€”balancing productivity with environmental stewardship for long-term sustainability.`,
    contentMs: `Dalam landskap pertanian hari ini, keperluan untuk menghasilkan lebih banyak makanan dengan sumber yang lebih sedikit tidak pernah lebih besar. Mengintegrasikan Kecerdasan Buatan ke dalam amalan pertanian menawarkan laluan ke hadapan yang jelas, menjadikan operasi lebih cekap dan lestari.

AI telah meningkatkan pemantauan tanaman secara ketara melalui imej satelit, dron, dan penderia tanah yang menyediakan maklumat terperinci masa nyata. Sistem pengairan pintar menggunakan data penderia dan ramalan cuaca untuk menentukan tepat berapa banyak air yang diperlukan tanaman.

Automasi mewakili hadapan lain: traktor dan pemanen autonomi menanam dan menuai dengan ketepatan, mengurangkan kos buruh dan meningkatkan kecekapan. Robot berteknologi AI membezakan antara tanaman dan rumpai, membuang tumbuhan yang tidak diingini tanpa herbisid.

Di AGS, misi kami adalah membantu petani mengemudi kerumitan integrasi AI, menyediakan pengurusan data pakar dan sokongan automasi canggihâ€”mengubah potensi AI menjadi penambahbaikan nyata untuk pertanian lestari.`,
    author: 'Alexander Loladze, AGS',
    authorMs: 'Alexander Loladze, AGS',
    date: '2025-02-28',
    readTime: '6 min read',
    readTimeMs: '6 minit bacaan',
    category: 'Innovation',
    categoryMs: 'Inovasi',
    tags: ['Precision Agriculture', 'AI', 'Sustainability', 'Drones', 'Smart Farming'],
    tagsMs: ['Pertanian Presisi', 'AI', 'Kelestarian', 'Dron', 'Pertanian Pintar'],
    image: 'https://images.squarespace-cdn.com/content/v1/664f726caa96fb6042fac225/67d165dc-2949-4719-85d7-f0bfee8600e6/1%2BAGS%2BAI%2BField%2BPrecision%2BAgriculture+%281%29.jpg?format=1000w',
    featured: true,
    published: true,
    sourceUrl: 'https://www.agriglobalsolutions.com/updates-insights/precision-agriculture-the-ai-powered-path-to-sustainable-farming',
  },
  {
    id: 'cropdrive-introduction',
    title: 'Introducing CropDrive: Revolutionizing Palm Oil Farming with AI-Powered Intelligence',
    titleMs: 'Memperkenalkan CropDrive: Merevolusikan Pertanian Kelapa Sawit dengan Kecerdasan Berkuasa AI',
    excerpt: 'CropDrive is the cutting-edge AI platform transforming palm oil operations through intelligent crop analysis, predictive yield insights, and actionable recommendationsâ€”partnered with AGS to deliver both technological precision and expert consultancy.',
    excerptMs: 'CropDrive adalah platform AI canggih yang mengubah operasi kelapa sawit melalui analisis tanaman pintar, pandangan hasil ramalan, dan cadangan yang boleh dilaksanakanâ€”bermitra dengan AGS untuk memberikan ketepatan teknologi dan perundingan pakar.',
    content: `CropDrive represents a paradigm shift in agricultural technology, specifically designed for the palm oil industry. Our platform leverages advanced artificial intelligence and machine learning algorithms trained on thousands of palm oil crop images to analyze plant health, predict potential issues, and provide actionable insights that help farmers maximize yields while maintaining sustainability standards.

With CropDrive, farmers upload images of their crops and receive instant AI-powered analysis. Our deep learning neural networks detect subtle patterns invisible to the human eyeâ€”enabling early detection of diseases such as Ganoderma Basal Stem Rot, nutrient deficiencies, and environmental stress indicators before they become critical problems. AI models are continuously improved, ensuring recommendations become more accurate over time.

CropDrive offers three subscription tiers designed for every farm size. The Start plan provides essential AI reports and standard support. The Smart plan adds 24-hour priority response, referral bonuses, and enhanced analysis. The Precision plan delivers unlimited support, multi-plot comparative analysis, AGS partner consultancy discounts, and advanced reporting for large-scale operations. All plans include Palmiraâ€”our specialized AI assistant for palm oil farming questions available 24/7.

CropDrive works in strategic partnership with AGSâ€”Agriculture Global Solutionsâ€”combining AI precision with decades of agricultural consultancy expertise. When AI analysis identifies complex issues, AGS consultants provide deeper interpretation, local context, and customized action plans. Together, CropDrive and AGS empower Malaysian farmers to compete globally while building sustainable, profitable operations.`,
    contentMs: `CropDrive mewakili perubahan paradigma dalam teknologi pertanian, direka khusus untuk industri kelapa sawit. Platform kami memanfaatkan kecerdasan buatan dan algoritma pembelajaran mesin canggih yang dilatih pada ribuan imej tanaman kelapa sawit.

Dengan CropDrive, petani memuat naik imej tanaman mereka dan menerima analisis berkuasa AI segera. Rangkaian neural pembelajaran mendalam kami mengesan corak halus yang tidak kelihatan kepada mata manusiaâ€”membolehkan pengesanan awal penyakit sebelum ia menjadi masalah kritikal.

CropDrive menawarkan tiga peringkat langganan: pelan Start untuk asas, pelan Smart dengan masa respons 24 jam, dan pelan Precision untuk operasi berskala besar dengan sokongan tanpa had.

CropDrive bekerjasama secara strategik dengan AGSâ€”Agriculture Global Solutionsâ€”menggabungkan ketepatan AI dengan kepakaran perundingan pertanian selama beberapa dekad untuk memperkasakan petani Malaysia.`,
    author: 'CropDrive Team',
    authorMs: 'Pasukan CropDrive',
    date: '2025-02-01',
    readTime: '10 min read',
    readTimeMs: '10 minit bacaan',
    category: 'Technology',
    categoryMs: 'Teknologi',
    tags: ['CropDrive', 'AI', 'Palm Oil', 'Innovation', 'Technology'],
    tagsMs: ['CropDrive', 'AI', 'Kelapa Sawit', 'Inovasi', 'Teknologi'],
    image: '/images/blog/cropdrive-intro.jpg',
    featured: true,
    published: true,
  },
  // â”€â”€ Regular Posts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'ags-smallholder-precision-ag',
    title: 'Improving Smallholder Oil Palm Practices with Precision Agriculture',
    titleMs: 'Meningkatkan Amalan Kelapa Sawit Pekebun Kecil dengan Pertanian Presisi',
    excerpt: 'A study in Kampar, Malaysia demonstrated how UAV mapping combined with multi-criteria analysis helps smallholders address soil erosion, water quality, and biodiversity lossâ€”with 43% of plantations scoring high sustainability and clear, targeted improvement roadmaps.',
    excerptMs: 'Kajian di Kampar, Malaysia menunjukkan bagaimana pemetaan UAV digabungkan dengan analisis pelbagai kriteria membantu pekebun kecil mengatasi hakisan tanah, kualiti air, dan kehilangan biodiversitiâ€”dengan 43% ladang mendapat skor kelestarian tinggi.',
    content: `Sustainability challenges in smallholder oil palm plantations have become a focal point for environmental and agricultural experts. These farms, often constrained by limited resources, face soil erosion, poor water quality, and biodiversity loss. A study conducted in Kampar, Malaysia, explored how UAVs combined with multi-criteria analysis (MCA) could help smallholders address these problems through precision agriculture.

Using UAVs equipped with high-resolution RGB and near-infrared sensors, researchers mapped slopes and waterways across 25 hectares of plantations. Digital elevation models revealed steep slopes lacking protective vegetation, making them vulnerable to erosion. Many waterways lacked riparian buffersâ€”vegetated zones that stabilize soil and filter runoffâ€”resulting in degraded water quality and sedimentation.

Researchers applied MCA to evaluate six sustainability indicators: erosion risk, riparian buffers, water clarity, channel modification, vegetation connectivity, and land cover quality. Results showed approximately 43% of the plantation scored high sustainability, 46% medium, and 9% lowâ€”providing a clear, actionable map of where interventions were most urgently needed.

Practical recommendations included replanting riparian zones with native trees, enhancing ground cover on steep slopes using palm fronds as mulch, establishing vegetation corridors to promote biodiversity, and stabilizing unpaved farm roads with stones and vegetation. This UAV-and-data-driven approach supports RSPO certification by helping farmers meet required environmental standards through targeted, resource-efficient actionsâ€”proving that precision agriculture can make sustainable farming accessible even for smallholders.`,
    contentMs: `Cabaran kelestarian dalam ladang kelapa sawit pekebun kecil telah menjadi tumpuan utama bagi pakar alam sekitar dan pertanian. Ladang-ladang ini, sering terbatas oleh sumber terhad, menghadapi isu seperti hakisan tanah, kualiti air yang buruk, dan kehilangan biodiversiti.

Menggunakan UAV yang dilengkapi dengan penderia RGB resolusi tinggi, penyelidik memetakan cerun dan saluran air merentasi 25 hektar ladang di Kampar, Malaysia. Model ketinggian digital mendedahkan kawasan dengan cerun curam yang terdedah kepada hakisan.

Penyelidik menggunakan analisis pelbagai kriteria untuk menilai enam penunjuk kelestarian. Hasilnya menunjukkan kira-kira 43% ladang mendapat skor kelestarian tinggi, 46% sederhana, dan 9% rendah.

Cadangan praktikal termasuk menanam semula zon riparian dengan pokok-pokok asli, meningkatkan litup tanah di cerun curam menggunakan pelepah sawit sebagai mulsa, mewujudkan koridor tumbuh-tumbuhan, dan menstabilkan jalan ladang tidak berturap.`,
    author: 'Alexander Loladze, AGS',
    authorMs: 'Alexander Loladze, AGS',
    date: '2025-03-10',
    readTime: '7 min read',
    readTimeMs: '7 minit bacaan',
    category: 'Sustainability',
    categoryMs: 'Kelestarian',
    tags: ['Smallholder', 'Precision Agriculture', 'UAV', 'Sustainability', 'RSPO', 'Malaysia'],
    tagsMs: ['Pekebun Kecil', 'Pertanian Presisi', 'UAV', 'Kelestarian', 'RSPO', 'Malaysia'],
    image: 'https://images.squarespace-cdn.com/content/v1/664f726caa96fb6042fac225/18025865-4d41-446f-8fc9-ded8c9475d60/Indonesia+small+holder+oil+palm+farmers+2.jpg?format=1000w',
    published: true,
    sourceUrl: 'https://www.agriglobalsolutions.com/updates-insights/improving-smallholder-oil-palm-practices-with-precision-agriculture',
  },
  {
    id: 'ags-bsr-disease-management',
    title: 'Boost Your Oil Palm Plantation\'s Productivity with Advanced Disease Management',
    titleMs: 'Tingkatkan Produktiviti Ladang Kelapa Sawit Anda dengan Pengurusan Penyakit Lanjutan',
    excerpt: 'Ganoderma Basal Stem Rot (BSR) silently destroys oil palms before visible symptoms appear. UAV-based aerial monitoring enables early detection of this devastating diseaseâ€”identifying subtle leaf color shifts and canopy structure changes that save trees and yields before it is too late.',
    excerptMs: 'Busuk Pangkal Batang Ganoderma (BSR) merosakkan kelapa sawit secara senyap sebelum gejala kelihatan. Pemantauan udara berasaskan UAV membolehkan pengesanan awal penyakit merbahaya iniâ€”mengenal pasti perubahan warna daun dan struktur kanopi yang menyelamatkan pokok dan hasil.',
    content: `Ganoderma Basal Stem Rot (BSR) is one of the most severe challenges facing oil palm plantations today. This disease, caused by the fungal pathogen Ganoderma boninense, can lead to significant yield losses and the death of palm trees if not addressed early. As plantations continue to expand globally, effective disease management becomes increasingly critical.

Ganoderma boninense primarily attacks the base of oil palm trees. The disease starts subtly with yellowing leaves and wilting that can go unnoticed for months. As infection progresses, the fungus decays the trunk, eventually leading to structural collapse and death. Transmission occurs through soil and plant residues, with spores spreading from infected to healthy trees. By the time visible symptoms like canopy dieback appear, the tree is often beyond savingâ€”making early detection essential.

UAV technology transforms disease management. Drones equipped with advanced multispectral imaging capture detailed aerial images that AI analyzes to detect subtle changes in leaf color, canopy structure, and other early BSR indicators. This method dramatically increases detection accuracy while reducing the time and labor of traditional manual inspections.

AGS's UAV-based monitoring services focus on three pillars: early detection through aerial imaging, targeted intervention that applies treatments precisely where needed to minimize cost and waste, and sustainability practices that reduce reliance on chemical treatments while promoting healthy plantation growth. Protecting trees from BSR means more consistent yields, lower management costs, and long-term viability for your operations.`,
    contentMs: `Busuk Pangkal Batang Ganoderma (BSR) adalah salah satu cabaran paling teruk yang dihadapi oleh ladang kelapa sawit hari ini. Penyakit ini, yang disebabkan oleh patogen kulat Ganoderma boninense, boleh menyebabkan kehilangan hasil yang ketara dan kematian pokok kelapa sawit jika tidak ditangani awal.

Ganoderma boninense terutamanya menyerang pangkal pokok kelapa sawit. Penyakit bermula secara halus dengan daun-daun yang menguning dan layu yang mudah tidak disedari. Menjelang masa gejala kelihatan seperti kematian kanopi, pokok sering sudah tidak boleh diselamatkan.

Teknologi UAV mengubah pengurusan penyakit. Dron yang dilengkapi dengan pengimejan multispektral canggih menangkap imej udara terperinci yang AI analisis untuk mengesan perubahan halus dalam warna daun dan penunjuk awal BSR.

Perkhidmatan pemantauan berasaskan UAV AGS memberi tumpuan kepada tiga teras: pengesanan awal, campur tangan yang disasarkan, dan amalan kelestarian yang mengurangkan pergantungan pada rawatan kimia sambil menggalakkan pertumbuhan ladang yang sihat.`,
    author: 'Alexander Loladze, AGS',
    authorMs: 'Alexander Loladze, AGS',
    date: '2025-01-15',
    readTime: '6 min read',
    readTimeMs: '6 minit bacaan',
    category: 'Agriculture',
    categoryMs: 'Pertanian',
    tags: ['Ganoderma', 'BSR', 'Disease Management', 'UAV', 'Palm Oil', 'Drones'],
    tagsMs: ['Ganoderma', 'BSR', 'Pengurusan Penyakit', 'UAV', 'Kelapa Sawit', 'Dron'],
    image: 'https://images.squarespace-cdn.com/content/v1/664f726caa96fb6042fac225/899ac40c-52b4-4374-a9a3-dfda3990beec/drone%2Babove%2Boil%2Bpalm%2Bplantation%2B2+%281%29.png?format=1000w',
    published: true,
    sourceUrl: 'https://www.agriglobalsolutions.com/updates-insights/boost-your-oil-palm-plantations-productivity-with-advanced-disease-management',
  },
  {
    id: 'ags-ai-supply-chains',
    title: 'AI-Powered Supply Chains for Sustainable Agriculture',
    titleMs: 'Rantai Bekalan Berkuasa AI untuk Pertanian Lestari',
    excerpt: 'AI is revolutionizing agricultural supply chains through smarter demand forecasting using ARIMA and LSTM models, real-time resource monitoring, and waste reduction. Farms aligned with market demand conserve resources and measurably reduce their environmental footprint.',
    excerptMs: 'AI sedang merevolusikan rantai bekalan pertanian melalui ramalan permintaan yang lebih pintar menggunakan model ARIMA dan LSTM, pemantauan sumber masa nyata, dan pengurangan pembaziran. Ladang yang selaras dengan permintaan pasaran menjimatkan sumber dan mengurangkan jejak alam sekitar.',
    content: `Artificial Intelligence is making a significant impact on agricultural supply chains by optimizing everything from crop production to market delivery. Through improved demand forecasting and resource management, AI is helping farmers and agribusinesses tackle challenges like reducing waste and increasing efficiencyâ€”while building more sustainable food systems.

One of the most transformative applications is demand forecasting. AI uses complex models such as ARIMA (Auto-Regressive Integrated Moving Average) and LSTM (Long Short-Term Memory) that analyze past sales and transaction data to predict future market demand. By applying these models, farmers avoid overproduction that leads to wasted resources and unsold goods. AI also monitors variables like weather patterns, soil health, and consumer behavior, enabling informed decisions about planting, harvesting, and distribution timelines.

Sustainability gains from AI are equally notable. AI-driven tools enable more efficient use of water and fertilizersâ€”monitoring soil moisture and nutrient levels in real time and applying inputs only when and where necessary. This precision farming minimizes environmental impact by conserving resources and reducing soil degradation risk. It aligns production with demand, reducing food waste for perishable goods and ensuring that agricultural inputs create maximum value.

Despite clear benefits, challenges remain. Reliable, high-quality data is essential for AI to function effectively, and smaller farms may need support to build data collection infrastructure. Technical expertise requires training. However, as AI technology becomes more user-friendly and accessible, barriers are falling rapidly. For palm oil farmers, AI-powered supply chains represent a powerful path to aligning productivity with environmental responsibility.`,
    contentMs: `Kecerdasan Buatan memberi kesan yang ketara kepada rantai bekalan pertanian dengan mengoptimumkan segalanya dari pengeluaran tanaman hingga penghantaran pasaran. Melalui ramalan permintaan yang lebih baik dan pengurusan sumber, AI membantu petani mengatasi cabaran seperti mengurangkan pembaziran dan meningkatkan kecekapan.

Salah satu aplikasi yang paling transformatif adalah ramalan permintaan. AI menggunakan model kompleks seperti ARIMA dan LSTM yang menganalisis data jualan dan transaksi masa lalu untuk meramalkan permintaan masa hadapan, membantu petani mengelak pengeluaran berlebihan.

Perolehan kelestarian dari AI sama-sama ketara. Alat yang dipacu AI membolehkan penggunaan air dan baja yang lebih cekapâ€”memantau kelembapan tanah dan tahap nutrien dalam masa nyata dan menggunakan input hanya apabila perlu.

Walaupun terdapat manfaat yang jelas, cabaran kekal mengenai kualiti data dan kepakaran teknikal. Namun, apabila teknologi AI menjadi lebih mesra pengguna dan boleh diakses, halangan ini semakin berkurang.`,
    author: 'Alexander Loladze, AGS',
    authorMs: 'Alexander Loladze, AGS',
    date: '2025-01-05',
    readTime: '6 min read',
    readTimeMs: '6 minit bacaan',
    category: 'Sustainability',
    categoryMs: 'Kelestarian',
    tags: ['AI', 'Supply Chain', 'Sustainable Agriculture', 'Demand Forecasting', 'Food Production'],
    tagsMs: ['AI', 'Rantai Bekalan', 'Pertanian Lestari', 'Ramalan Permintaan', 'Pengeluaran Makanan'],
    image: 'https://images.squarespace-cdn.com/content/v1/664f726caa96fb6042fac225/4fb0db07-34b0-494c-b37c-9f6b1e35600a/Agricultural+supply+chains+use+AI+for+sustaibale+agriculture.jpg?format=1000w',
    published: true,
    sourceUrl: 'https://www.agriglobalsolutions.com/updates-insights/ai-powered-supply-chains-for-sustainable-agriculture',
  },
  {
    id: 'cropdrive-features',
    title: 'CropDrive Features: Everything You Need to Know About Our AI Platform',
    titleMs: 'Ciri-Ciri CropDrive: Semua yang Perlu Anda Ketahui Tentang Platform AI Kami',
    excerpt: 'Explore CropDrive\'s deep learning crop analysis, three-tier subscription plans, the Palmira AI assistant, and seamless AGS consultancy integrationâ€”all purpose-built to maximize palm oil yields while achieving sustainability certification standards.',
    excerptMs: 'Terokai analisis tanaman pembelajaran mendalam CropDrive, pelan langganan tiga peringkat, pembantu AI Palmira, dan integrasi perundingan AGS yang lancarâ€”semuanya dibina khas untuk memaksimumkan hasil kelapa sawit sambil mencapai standard pensijilan kelestarian.',
    content: `CropDrive offers a comprehensive suite of AI-powered tools specifically designed for the palm oil industry. Our core platform uses deep learning computer visionâ€”trained on thousands of annotated palm oil imagesâ€”to analyze uploaded crop photos, detecting diseases, assessing plant health, predicting yields, and recommending optimal farming practices within minutes.

The platform offers three distinct subscription tiers. The Start plan provides essential AI analysis reports and standard support, perfect for small-scale farmers entering precision agriculture. The Smart plan adds 24-hour priority response, enhanced analysis features, and referral bonuses for growing operations. The Precision plan delivers unlimited support, multi-plot comparative analysis, AGS partner consultancy discounts, and advanced reporting dashboards for large-scale plantations and agricultural organizations.

Palmira, CropDrive's integrated AI assistant, is available 24/7 to answer questions about crop management, disease identification, pest control, soil health, fertilization strategies, harvest timing, and sustainable practices. Trained on extensive palm oil agricultural knowledge, Palmira provides accurate, actionable guidanceâ€”and explains AI analysis results in plain language for farmers at any technical level.

All CropDrive plans integrate with AGS's expert consultancy network. When AI analysis identifies complex issues requiring human expertise, AGS consultants provide deeper interpretation, local context, and customized action plans. This combination of AI precision and human wisdom creates a complete support systemâ€”helping Malaysian palm oil farmers optimize operations, reduce costs, and achieve RSPO and other certification standards.`,
    contentMs: `CropDrive menawarkan suite alat berkuasa AI yang komprehensif yang direka khusus untuk industri kelapa sawit. Platform teras kami menggunakan penglihatan komputer pembelajaran mendalamâ€”dilatih pada ribuan imej kelapa sawit yang dianotasiâ€”untuk menganalisis imej tanaman yang dimuat naik dalam masa beberapa minit.

Platform ini menawarkan tiga peringkat langganan yang berbeza. Pelan Start untuk petani berskala kecil. Pelan Smart menambah respons keutamaan 24 jam untuk operasi yang berkembang. Pelan Precision memberikan sokongan tanpa had dan diskaun perundingan rakan kongsi AGS untuk ladang berskala besar.

Palmira, pembantu AI bersepadu CropDrive, tersedia 24/7 untuk menjawab soalan tentang pengurusan tanaman, pengenalan penyakit, kawalan perosak, kesihatan tanah, dan amalan lestari.

Semua pelan CropDrive bersepadu dengan rangkaian perundingan pakar AGS, menggabungkan ketepatan AI dengan kebijaksanaan manusia untuk mencipta sistem sokongan yang lengkap bagi petani kelapa sawit Malaysia.`,
    author: 'CropDrive Product Team',
    authorMs: 'Pasukan Produk CropDrive',
    date: '2025-01-28',
    readTime: '8 min read',
    readTimeMs: '8 minit bacaan',
    category: 'Technology',
    categoryMs: 'Teknologi',
    tags: ['CropDrive', 'Features', 'AI Platform', 'Subscription', 'Palmira'],
    tagsMs: ['CropDrive', 'Ciri-Ciri', 'Platform AI', 'Langganan', 'Palmira'],
    image: '/images/blog/cropdrive-features.jpg',
    published: true,
  },
  {
    id: 'cropdrive-palmira-assistant',
    title: 'Meet Palmira: Your AI Assistant for Palm Oil Farming Questions',
    titleMs: 'Temu Palmira: Pembantu AI Anda untuk Soalan Pertanian Kelapa Sawit',
    excerpt: 'Palmira is CropDrive\'s 24/7 AI assistant trained on comprehensive palm oil agricultural knowledge. From early Ganoderma detection to harvest optimization, Palmira answers farming questions instantlyâ€”and explains AI crop analysis results in clear, actionable language.',
    excerptMs: 'Palmira adalah pembantu AI 24/7 CropDrive yang dilatih pada pengetahuan pertanian kelapa sawit yang komprehensif. Dari pengesanan awal Ganoderma hingga pengoptimuman penuaian, Palmira menjawab soalan pertanian dengan segera.',
    content: `Palmira is CropDrive's revolutionary AI assistant, purpose-built for palm oil farming. Available 24 hours a day, 7 days a week, Palmira answers questions about crop management, disease identification, pest control, soil health, fertilization strategies, harvest timing, and sustainable farming practicesâ€”instantly and accurately, without waiting for office hours or expert availability.

Powered by advanced natural language processing and trained on extensive palm oil agricultural knowledge, Palmira provides responses that farmers can act on immediately. Whether dealing with a specific problem identified in a CropDrive analysisâ€”such as early-stage Ganoderma BSR symptoms or a suspected nutrient deficiencyâ€”or seeking general farming guidance, Palmira combines deep expert knowledge with the convenience of instant availability.

What makes Palmira unique is its deep integration with CropDrive's AI analysis platform. After uploading a crop image and receiving an analysis report, farmers can ask Palmira follow-up questions: "Why is my palm showing these frond symptoms?" "What treatment should I apply for early-stage Ganoderma?" "How can I optimize my fertilization schedule based on these soil readings?" Palmira explains the AI-generated insights in plain language and suggests specific, actionable next steps tailored to your farm conditions.

Palmira is available to all CropDrive subscribers and bridges the gap between AI technology and practical farming application. For complex situations requiring deeper analysis, Palmira can connect farmers directly with AGS consultants. Together, Palmira and AGS represent a complete knowledge ecosystemâ€”from instant AI guidance to expert human consultationâ€”ensuring Malaysian palm oil farmers always have the support they need, whenever they need it.`,
    contentMs: `Palmira adalah pembantu AI revolusioner CropDrive, dibina khas untuk pertanian kelapa sawit. Tersedia 24 jam sehari, 7 hari seminggu, Palmira menjawab soalan tentang pengurusan tanaman, pengenalan penyakit, kawalan perosak, kesihatan tanah, strategi persenyawaan, masa penuaian, dan amalan pertanian lestari.

Dikuasakan oleh pemprosesan bahasa semula jadi canggih dan dilatih pada pengetahuan pertanian kelapa sawit yang luas, Palmira memberikan respons yang boleh segera dilaksanakan oleh petani. Sama ada menghadapi masalah khusus yang dikenal pasti dalam analisis CropDrive atau mencari bimbingan pertanian umum, Palmira menggabungkan kedalaman pengetahuan pakar dengan kemudahan ketersediaan segera.

Apa yang menjadikan Palmira unik adalah integrasinya yang mendalam dengan platform analisis CropDrive. Selepas memuat naik imej tanaman dan menerima laporan analisis AI, petani boleh bertanya soalan susulan kepada Palmira tentang gejala, rawatan, dan langkah seterusnya.

Palmira tersedia kepada semua pelanggan CropDrive dan berfungsi sebagai jambatan antara teknologi AI dan aplikasi pertanian praktikal, dengan sokongan perunding AGS untuk situasi yang kompleks.`,
    author: 'CropDrive Product Team',
    authorMs: 'Pasukan Produk CropDrive',
    date: '2025-01-08',
    readTime: '7 min read',
    readTimeMs: '7 minit bacaan',
    category: 'Technology',
    categoryMs: 'Teknologi',
    tags: ['CropDrive', 'Palmira', 'AI Assistant', 'Palm Oil', 'Support'],
    tagsMs: ['CropDrive', 'Palmira', 'Pembantu AI', 'Kelapa Sawit', 'Sokongan'],
    image: '/images/blog/palmira-assistant.jpg',
    published: true,
  },
  {
    id: 'ags-partnership',
    title: 'CropDrive Ã— AGS: Expert AI Technology Meets Agricultural Consultancy',
    titleMs: 'CropDrive Ã— AGS: Teknologi AI Pakar Bertemu Perundingan Pertanian',
    excerpt: 'The strategic partnership between CropDrive and Agriculture Global Solutions combines cutting-edge AI crop analysis with decades of agricultural consultancy expertiseâ€”giving Malaysian farmers unparalleled access to both technological precision and human insight.',
    excerptMs: 'Perkongsian strategik antara CropDrive dan Agriculture Global Solutions menggabungkan analisis tanaman AI canggih dengan kepakaran perundingan pertanian selama beberapa dekadâ€”memberikan petani Malaysia akses yang tidak tertandingi kepada teknologi dan pandangan pakar.',
    content: `The partnership between CropDrive and Agriculture Global Solutions (AGS) represents one of the most powerful alliances in modern agricultural technology. CropDrive contributes AI-driven crop analysis, real-time health monitoring, yield prediction, and the Palmira AI assistant. AGS brings deep agricultural consultancy expertise, field-tested sustainable farming strategies, and specialized knowledge in palm oil agronomy, disease management, and precision agriculture accumulated over years of working with farmers across Southeast Asia.

This partnership means that when CropDrive's AI detects a potential issueâ€”whether early-stage Ganoderma BSR, a soil nutrient deficiency, or suboptimal harvest timingâ€”AGS consultants are available to validate the findings, provide local context specific to Malaysian conditions, and develop customized action plans. AI insight and human expertise work in tandem, creating recommendations that are both data-driven and practically actionable on the ground.

For farmers, this integrated model unlocks capabilities neither party could deliver alone. CropDrive provides speed, scale, and objectivityâ€”analyzing crop images and identifying patterns across large datasets with consistent, evidence-based recommendations. AGS provides judgment, relationship-building, and the contextual understanding that turns data into real farm improvements. Together they form a complete solution from diagnosis to implementation.

The AGS-CropDrive partnership is particularly valuable for RSPO certification support. As demand grows for certified sustainable palm oil, farmers need both the documentation that AI analysis provides and expert guidance to implement best practices. Together, CropDrive and AGS help farmers meet certification requirements while improving productivityâ€”demonstrating that sustainability and profitability are not mutually exclusive goals.`,
    contentMs: `Perkongsian antara CropDrive dan Agriculture Global Solutions (AGS) mewakili salah satu perikatan paling berkuasa dalam teknologi pertanian moden. CropDrive menyumbang analisis tanaman dipacu AI, pemantauan kesihatan masa nyata, ramalan hasil, dan pembantu AI Palmira. AGS membawa kepakaran perundingan pertanian yang mendalam dan pengetahuan khusus dalam agronomi kelapa sawit.

Perkongsian ini bermaksud apabila AI CropDrive mengesan masalah berpotensiâ€”sama ada peringkat awal Busuk Pangkal Batang Ganoderma, kekurangan nutrien tanah, atau masa penuaian yang kurang optimumâ€”perunding AGS tersedia untuk mengesahkan penemuan dan membangunkan pelan tindakan yang disesuaikan.

Bagi petani, model bersepadu ini membuka keupayaan yang tidak boleh disampaikan oleh mana-mana pihak secara bersendirian. CropDrive menyediakan kelajuan, skala, dan objektif AI manakala AGS menyediakan pertimbangan dan pemahaman konteks yang mengubah data menjadi penambahbaikan ladang yang nyata.

Perkongsian AGS-CropDrive amat berkuasa untuk sokongan pensijilan RSPO, membantu petani memenuhi keperluan pensijilan sambil meningkatkan produktivitiâ€”membuktikan bahawa kelestarian dan keuntungan boleh dicapai bersama.`,
    author: 'CropDrive & AGS Partnership Team',
    authorMs: 'Pasukan Perkongsian CropDrive & AGS',
    date: '2025-01-25',
    readTime: '9 min read',
    readTimeMs: '9 minit bacaan',
    category: 'Innovation',
    categoryMs: 'Inovasi',
    tags: ['CropDrive', 'AGS', 'Partnership', 'AI', 'Consultancy', 'RSPO'],
    tagsMs: ['CropDrive', 'AGS', 'Perkongsian', 'AI', 'Perundingan', 'RSPO'],
    image: '/images/blog/ags-partnership.jpg',
    published: true,
  },
];

const categories = [
  { id: 'all', label: 'All Posts', labelMs: 'Semua Pos', icon: faBookOpen },
  { id: 'palm-oil', label: 'Palm Oil', labelMs: 'Kelapa Sawit', icon: faSeedling },
  { id: 'technology', label: 'Technology', labelMs: 'Teknologi', icon: faBolt },
  { id: 'agriculture', label: 'Agriculture', labelMs: 'Pertanian', icon: faLeaf },
  { id: 'sustainability', label: 'Sustainability', labelMs: 'Kelestarian', icon: faChartLine },
  { id: 'innovation', label: 'Innovation', labelMs: 'Inovasi', icon: faEye },
  { id: 'cropdrive', label: 'CropDrive', labelMs: 'CropDrive', icon: faRocket },
  { id: 'ags', label: 'AGS', labelMs: 'AGS', icon: faHandshake }
];

export default function BlogPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const getLocalizedText = (english: string, malay: string) => {
    if (currentLanguage === 'id') {
      return toIndonesianText(malay || english);
    }

    return currentLanguage === 'ms' ? malay : english;
  };

  const getLocalizedTags = (english: string[], malay: string[]) => {
    if (currentLanguage === 'id') {
      return (malay.length > 0 ? malay : english).map((tag) => toIndonesianText(tag));
    }

    return currentLanguage === 'ms' ? malay : english;
  };

  const handlePostClick = (post: BlogPost) => {
    if (post.sourceUrl) {
      window.open(post.sourceUrl, '_blank', 'noopener,noreferrer');
    } else {
      setSelectedPost(post);
    }
  };

  const closeModal = () => {
    setSelectedPost(null);
  };

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterStatus('error');
      setNewsletterMessage(currentLanguage === 'id' ? 'Silakan masukkan alamat email yang valid' : language === 'ms' ? 'Sila masukkan alamat emel yang sah' : 'Please enter a valid email address');
      return;
    }

    try {
      setNewsletterStatus('loading');
      setNewsletterMessage('');

      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewsletterStatus('success');
        setNewsletterMessage(
          data.alreadySubscribed
            ? (currentLanguage === 'id' ? 'Anda sudah berlangganan!' : language === 'ms' ? 'Anda sudah melanggan!' : 'You are already subscribed!')
            : (currentLanguage === 'id' ? 'Berhasil berlangganan! Periksa kotak masuk Anda.' : language === 'ms' ? 'Berjaya melanggan! Semak peti masuk anda.' : 'Successfully subscribed! Check your inbox.')
        );
        setNewsletterEmail('');
        
        // Reset status after 5 seconds
        setTimeout(() => {
          setNewsletterStatus('idle');
          setNewsletterMessage('');
        }, 5000);
      } else {
        setNewsletterStatus('error');
        setNewsletterMessage(data.error || (currentLanguage === 'id' ? 'Gagal berlangganan. Silakan coba lagi.' : language === 'ms' ? 'Gagal melanggan. Sila cuba lagi.' : 'Failed to subscribe. Please try again.'));
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setNewsletterStatus('error');
      setNewsletterMessage(currentLanguage === 'id' ? 'Terjadi kesalahan. Silakan coba lagi.' : language === 'ms' ? 'Ralat berlaku. Sila cuba lagi.' : 'An error occurred. Please try again.');
    }
  };

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    setLoading(true);

    fetch('/api/blog/posts?source=ags')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.posts) && data.posts.length > 0) {
          setBlogPosts(data.posts);
          return;
        }

        setBlogPosts(staticBlogPosts);
      })
      .catch((error) => {
        console.error('Error fetching AGS blog posts:', error);
        setBlogPosts(staticBlogPosts);
      })
      .finally(() => setLoading(false));
  }, [mounted]);

  // Listen for language changes
  useEffect(() => {
    const handleStorageChange = () => {
      const lang = getCurrentLanguage();
      setCurrentLanguage(lang);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedPost) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedPost]);

  const { language } = useTranslation(mounted ? currentLanguage : 'en');

  // Use blogPosts state, fallback to staticBlogPosts if empty
  const displayPosts = blogPosts.length > 0 ? blogPosts : staticBlogPosts;

  // Get all unique tags
  const allTags = Array.from(
    new Set(displayPosts.flatMap(post => getLocalizedTags(post.tags, post.tagsMs)))
  );

  const filteredPosts = displayPosts.filter(post => {
    const matchesSearch = searchQuery === '' ||
      getLocalizedText(post.title, post.titleMs).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getLocalizedText(post.excerpt, post.excerptMs).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getLocalizedTags(post.tags, post.tagsMs).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'cropdrive') {
        matchesCategory = post.id.includes('cropdrive');
      } else if (selectedCategory === 'ags') {
        matchesCategory = post.id.includes('ags');
      } else {
        matchesCategory = post.category.toLowerCase() === selectedCategory.toLowerCase();
      }
    }

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag =>
        getLocalizedTags(post.tags, post.tagsMs).includes(tag)
      );

    return matchesSearch && matchesCategory && matchesTags;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage === 'id' ? 'id-ID' : language === 'ms' ? 'ms-MY' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen premium-page-shell premium-mesh relative">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 via-blue-900 to-green-900 py-32 overflow-hidden">
        {/* Animated Background Pattern */}
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
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <span className="bg-yellow-400/20 backdrop-blur-sm border-2 border-yellow-400/30 text-yellow-300 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                {language === 'ms' ? 'CropDrive & AGS' : 'CropDrive & AGS'}
              </span>
            </motion.div>
            
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 xs:mb-8 leading-tight font-heading px-2">
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent animate-gradient">
                {currentLanguage === 'id' ? 'Blog' : language === 'ms' ? 'Blog' : 'Blog'}
              </span>
            </h1>
            
            <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed font-body px-3 xs:px-4">
              {currentLanguage === 'id'
                ? 'Wawasan terbaru tentang CropDrive AI, layanan konsultasi AGS, teknologi pertanian, dan inovasi dalam industri kelapa sawit Malaysia.'
                : language === 'ms'
                ? 'Pandangan terkini tentang CropDrive AI, perkhidmatan perundingan AGS, teknologi pertanian, dan inovasi dalam industri kelapa sawit Malaysia.'
                : 'Latest insights on CropDrive AI, AGS consultancy services, agricultural technology, and innovations in Malaysia\'s palm oil industry.'
              }
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black text-yellow-400 mb-1">{blogPosts.length}+</div>
                <div className="text-sm text-white/80">{currentLanguage === 'id' ? 'Artikel' : language === 'ms' ? 'Artikel' : 'Articles'}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black text-yellow-400 mb-1">AI</div>
                <div className="text-sm text-white/80">{currentLanguage === 'id' ? 'Teknologi' : language === 'ms' ? 'Teknologi' : 'Technology'}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black text-yellow-400 mb-1">24/7</div>
                <div className="text-sm text-white/80">{currentLanguage === 'id' ? 'Dukungan' : language === 'ms' ? 'Sokongan' : 'Support'}</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 text-white" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden">
                <div className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 h-48" style={{ animation: 'skeleton-shimmer 1.5s ease-in-out infinite', backgroundSize: '200% 100%' }} />
                <div className="p-6 space-y-3">
                  <div className="animate-pulse bg-gray-200 h-5 w-3/4 rounded-lg" />
                  <div className="animate-pulse bg-gray-200 h-4 w-full rounded-lg" />
                  <div className="animate-pulse bg-gray-200 h-4 w-2/3 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-24"
        >
          <div className="premium-panel-strong rounded-[28px] p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-end">
              {/* Search */}
              <div className="flex-1 w-full">
                <label htmlFor="blog-search" className="block text-sm font-medium text-gray-700 mb-2 font-body">
                  {currentLanguage === 'id' ? 'Cari Artikel' : language === 'ms' ? 'Cari Artikel' : 'Search Articles'}
                </label>
                <div className="relative">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    id="blog-search"
                    type="text"
                    placeholder={currentLanguage === 'id' ? 'Cari artikel...' : language === 'ms' ? 'Cari artikel...' : 'Search articles...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="lg:w-64 w-full">
                <label htmlFor="blog-category-filter" className="block text-sm font-medium text-gray-700 mb-2 font-body">
                  {currentLanguage === 'id' ? 'Kategori' : language === 'ms' ? 'Kategori' : 'Category'}
                </label>
                <select
                  id="blog-category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all bg-white"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {currentLanguage === 'id' ? toIndonesianText(category.labelMs || category.label) : language === 'ms' ? category.labelMs : category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div className="mt-5 sm:mt-6">
                <p className="text-sm font-medium text-gray-700 mb-3 font-body">
                  {currentLanguage === 'id' ? 'Tag:' : language === 'ms' ? 'Tag:' : 'Tags:'}
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                        selectedTags.includes(tag)
                          ? 'bg-green-600 text-white shadow-md hover:bg-green-700'
                                : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Featured Posts - Magazine Style Layout */}
        {featuredPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-24"
          >
            <div className="flex items-center gap-4 mb-12">
              <div className="h-1 w-16 bg-gradient-to-r from-green-600 to-green-400 rounded-full flex-shrink-0" aria-hidden="true" />
              <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black text-gray-900 font-heading tracking-tight">
              {currentLanguage === 'id' ? 'Artikel Pilihan' : language === 'ms' ? 'Artikel Pilihan' : 'Featured Articles'}
            </h2>
              <div className="flex-1 h-1 bg-gradient-to-r from-green-400 to-transparent rounded-full min-w-0" aria-hidden="true" />
            </div>
            
            {/* Magazine Style Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {featuredPosts.map((post, index) => {
                const title = getLocalizedText(post.title, post.titleMs);
                const excerpt = getLocalizedText(post.excerpt, post.excerptMs);
                const category = getLocalizedText(post.category, post.categoryMs);
                const author = getLocalizedText(post.author, post.authorMs);
                const readTime = getLocalizedText(post.readTime, post.readTimeMs);
                const tags = getLocalizedTags(post.tags, post.tagsMs);
                const isAGS = post.id.includes('ags');
                const isCropDrive = post.id.includes('cropdrive');
                
                // Varying column spans for magazine layout
                const colSpan = index === 0 ? 'lg:col-span-8' : index === 1 ? 'lg:col-span-4' : 'lg:col-span-6';
                const imageHeight = index === 0 ? 'h-96' : index === 1 ? 'h-full min-h-[400px]' : 'h-64';
                
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                    className={`${colSpan} group cursor-pointer`}
                    onClick={() => handlePostClick(post)}
                  >
                    <div className="relative overflow-hidden rounded-3xl bg-white/75 backdrop-blur-sm border border-green-100 shadow-xl hover:shadow-2xl hover:border-green-300 transition-all duration-500 h-full transform hover:scale-[1.02]">
                      {/* Image - visible with lighter overlay so AI/post image shows */}
                      <div className={`relative ${imageHeight} overflow-hidden`}>
                        <Image
                          src={getBlogImageSrc(post.image)}
                          alt={title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={index < 3}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" aria-hidden="true" role="presentation"></div>
                        
                        {/* Category Badge */}
                        <div className="absolute top-6 left-6">
                          <span className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md ${
                            isCropDrive ? 'bg-green-500/90 text-white' : 
                            isAGS ? 'bg-blue-500/90 text-white' : 
                            'bg-white/90 text-gray-700'
                          }`}>
                            {category}
                          </span>
                        </div>
                        
                        {/* Featured Badge */}
                        <div className="absolute top-6 right-6">
                          <span className="bg-yellow-400 text-gray-900 px-3 py-1.5 rounded-full text-xs font-black">
                            {currentLanguage === 'id' ? 'Pilihan' : language === 'ms' ? 'Pilihan' : 'Featured'}
                          </span>
                        </div>
                        
                        {/* External Link Icon for AGS */}
                        {isAGS && (
                          <div className="absolute bottom-6 right-6">
                            <div className="bg-white/90 backdrop-blur-md p-2 rounded-full">
                              <FontAwesomeIcon icon={faExternalLink} className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Content Overlay - dark bar for readable text on any image */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-2xl lg:text-3xl font-black font-heading mb-3 line-clamp-2 group-hover:text-yellow-300 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                          {title}
              </h3>
                        <p className="text-white text-sm sm:text-base font-body leading-relaxed mb-4 line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                          {excerpt}
                        </p>
                        {/* Meta */}
                        <div className="flex items-center justify-between text-xs sm:text-sm text-white/95 pt-4 border-t border-white/30 font-body drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                          <span className="font-medium">{author}</span>
                          <div className="flex items-center gap-3">
                            <span>{formatDate(post.date)}</span>
                            <span>â€¢</span>
                            <span>{readTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* All Posts - Unique Layout */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-24"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-3">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex-shrink-0" aria-hidden="true" />
              <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black text-gray-900 font-heading tracking-tight">
              {currentLanguage === 'id' ? 'Semua Artikel' : language === 'ms' ? 'Semua Artikel' : 'All Articles'}
            </h2>
              <div className="flex-1 h-1 bg-gradient-to-r from-blue-400 to-transparent rounded-full min-w-0" aria-hidden="true" />
            </div>
            <div className="text-sm sm:text-base text-gray-600 font-body bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 rounded-full font-bold border border-green-200 flex-shrink-0">
              {filteredPosts.length} {currentLanguage === 'id' ? 'artikel' : language === 'ms' ? 'artikel' : 'articles'}
            </div>
          </div>

          {regularPosts.length > 0 ? (
            <div className="space-y-8">
              {regularPosts.map((post, index) => {
                const title = getLocalizedText(post.title, post.titleMs);
                const excerpt = getLocalizedText(post.excerpt, post.excerptMs);
                const category = getLocalizedText(post.category, post.categoryMs);
                const author = getLocalizedText(post.author, post.authorMs);
                const readTime = getLocalizedText(post.readTime, post.readTimeMs);
                const tags = getLocalizedTags(post.tags, post.tagsMs);
                const isCropDrive = post.id.includes('cropdrive');
                const isAGS = post.id.includes('ags');
                const isEven = index % 2 === 0;
                
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 + index * 0.05 }}
                    className="group cursor-pointer"
                    onClick={() => handlePostClick(post)}
                  >
                    <div className={`relative overflow-hidden rounded-2xl bg-white/75 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 border border-green-100 hover:border-green-300 ${
                      isCropDrive ? 'border-l-4 border-l-green-500' : 
                      isAGS ? 'border-l-4 border-l-blue-500' : 
                      'border-l-4 border-l-purple-500'
                    }`}>
                      <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-0`}>
                        {/* Image Section */}
                        <div className="relative lg:w-1/3 h-64 lg:h-auto overflow-hidden">
                          <Image
                            src={getBlogImageSrc(post.image)}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            sizes="(max-width: 1024px) 100vw, 33vw"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-r ${
                            isEven ? 'from-black/50 via-black/15 to-transparent' : 
                            'from-transparent via-black/15 to-black/50'
                          } lg:hidden`} aria-hidden="true"></div>
                          
                          {/* Category Badge */}
                          <div className={`absolute top-4 ${isEven ? 'left-4' : 'right-4'} lg:${isEven ? 'left-4' : 'right-4'}`}>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md ${
                              isCropDrive ? 'bg-green-500/90 text-white' : 
                              isAGS ? 'bg-blue-500/90 text-white' : 
                              'bg-purple-500/90 text-white'
                            }`}>
                              {category}
                            </span>
                          </div>
                          
                          {/* External Link Icon for AGS */}
                          {isAGS && (
                            <div className={`absolute bottom-4 ${isEven ? 'right-4' : 'left-4'}`}>
                              <div className="bg-white/90 backdrop-blur-md p-2 rounded-full">
                                <FontAwesomeIcon icon={faExternalLink} className="w-4 h-4 text-blue-600" />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Content Section */}
                        <div className="lg:w-2/3 p-6 lg:p-8 flex flex-col justify-between">
                          <div>
                            <h3 className={`text-2xl lg:text-3xl font-black font-heading mb-3 group-hover:underline transition-all ${
                              isCropDrive ? 'text-gray-900 group-hover:text-green-600' :
                              isAGS ? 'text-gray-900 group-hover:text-blue-600' :
                              'text-gray-900 group-hover:text-purple-600'
                            }`}>
                              {title}
                            </h3>
                            <p className="text-gray-600 text-base sm:text-lg font-body leading-relaxed mb-4 line-clamp-2">
                              {excerpt}
                            </p>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {tags.slice(0, 4).map(tag => (
                                <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                                  {tag}
                                </span>
                              ))}
                              {tags.length > 4 && (
                                <span className="text-xs text-gray-400 px-2 py-1">
                                  +{tags.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Meta */}
                          <div className="flex items-center justify-between text-sm text-gray-500 font-body pt-4 border-t border-gray-100">
                            <span className="font-semibold">{author}</span>
                            <div className="flex items-center gap-3">
                              <span>{formatDate(post.date)}</span>
                              <span>â€¢</span>
                              <span>{readTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
          <div className="premium-panel-strong rounded-[28px] p-16 sm:p-20 text-center">
              <div className="text-6xl mb-4" aria-hidden="true">ðŸ”</div>
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 font-heading mb-4">
                {currentLanguage === 'id' ? 'Tidak Ada Artikel yang Ditemukan' : language === 'ms' ? 'Tiada Artikel Dijumpai' : 'No Articles Found'}
            </h3>
              <p className="text-base sm:text-lg text-gray-600 font-body leading-relaxed">
                {currentLanguage === 'id'
                  ? 'Coba sesuaikan filter pencarian Anda untuk menemukan lebih banyak artikel.'
                  : language === 'ms'
                  ? 'Cuba menyesuaikan penapis carian anda untuk mencari lebih banyak artikel.'
                  : 'Try adjusting your search filters to find more articles.'}
            </p>
          </div>
          )}
        </motion.section>

        {/* Newsletter Signup - Bottom of page */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-24"
        >
          <div className="premium-cta-band relative rounded-[32px] p-8 lg:p-12 text-center text-white overflow-hidden border border-white/10">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }} aria-hidden="true" />
            <div className="absolute top-4 left-4 text-4xl opacity-20" aria-hidden="true">ðŸŒ±</div>
            <div className="absolute top-4 right-4 text-4xl opacity-20" aria-hidden="true">ðŸŒ¾</div>
            <div className="max-w-2xl mx-auto relative z-10">
              <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black font-heading tracking-tight mb-4 bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent">
                {currentLanguage === 'id' ? 'Jangan Sampai Ketinggalan!' : language === 'ms' ? 'Jangan Ketinggalan!' : 'Stay Updated!'}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-green-50 mb-8 leading-relaxed font-body">
                {currentLanguage === 'id'
                  ? 'Dapatkan pembaruan terbaru tentang CropDrive AI, layanan AGS, teknologi pertanian, dan berita industri kelapa sawit langsung ke kotak masuk Anda.'
                  : language === 'ms'
                  ? 'Dapatkan kemas kini terkini tentang CropDrive AI, perkhidmatan AGS, teknologi pertanian, dan berita industri kelapa sawit terus ke peti masuk anda.'
                  : 'Get the latest updates on CropDrive AI, AGS services, agricultural technology, and palm oil industry news delivered straight to your inbox.'}
              </p>
              <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
                <label htmlFor="newsletter-email" className="sr-only">
                  {currentLanguage === 'id' ? 'Alamat email' : language === 'ms' ? 'Alamat emel' : 'Email address'}
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={currentLanguage === 'id' ? 'Alamat email Anda' : language === 'ms' ? 'Alamat emel anda' : 'Your email address'}
                  className="flex-1 px-5 py-3.5 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-yellow-300 focus:outline-none shadow-xl font-medium"
                  disabled={newsletterStatus === 'loading'}
                  required
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className={`px-8 py-3.5 rounded-xl font-black transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 whitespace-nowrap transform ${
                    newsletterStatus === 'loading'
                      ? 'bg-yellow-300 text-gray-600 cursor-not-allowed'
                      : newsletterStatus === 'success'
                      ? 'bg-green-500 text-white'
                      : newsletterStatus === 'error'
                      ? 'bg-red-500 text-white'
                      : 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
                  }`}
                >
                  {newsletterStatus === 'loading'
                    ? (currentLanguage === 'id' ? 'Memproses...' : language === 'ms' ? 'Memproses...' : 'Processing...')
                    : newsletterStatus === 'success'
                    ? 'âœ“'
                    : currentLanguage === 'id' ? 'Berlangganan' : language === 'ms' ? 'Langgan' : 'Subscribe'}
                </button>
              </form>
              {newsletterMessage && (
                <p className={`text-sm mt-4 font-medium ${
                  newsletterStatus === 'success' ? 'text-yellow-200' : newsletterStatus === 'error' ? 'text-red-200' : 'text-green-100 opacity-80'
                }`}>
                  {newsletterMessage}
                </p>
              )}
              {!newsletterMessage && (
                <p className="text-sm text-green-100 mt-4 opacity-80 font-body">
                  {currentLanguage === 'id' ? 'Tanpa spam. Hanya konten berkualitas tinggi tentang CropDrive dan AGS.' : language === 'ms' ? 'Tiada spam. Hanya kandungan berkualiti tinggi tentang CropDrive dan AGS.' : 'No spam. Just high-quality content about CropDrive and AGS.'}
                </p>
              )}
            </div>
          </div>
        </motion.section>
      </div>

      {/* Article Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur-md p-3 rounded-full hover:bg-white transition-all shadow-lg hover:scale-110"
              aria-label={currentLanguage === 'id' ? 'Tutup' : language === 'ms' ? 'Tutup' : 'Close'}
              title={currentLanguage === 'id' ? 'Tutup' : language === 'ms' ? 'Tutup' : 'Close'}
            >
              <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-gray-700" />
            </button>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1">
              {/* Hero Image */}
              <div className="relative h-64 md:h-80 overflow-hidden">
                <Image
                  src={getBlogImageSrc(selectedPost.image)}
                  alt={getLocalizedText(selectedPost.title, selectedPost.titleMs)}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Category Badge */}
                <div className="absolute top-6 left-6">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md ${
                    selectedPost.id.includes('cropdrive') ? 'bg-green-500/90 text-white' : 
                    selectedPost.id.includes('ags') ? 'bg-blue-500/90 text-white' : 
                    'bg-purple-500/90 text-white'
                  }`}>
                    {language === 'ms' ? selectedPost.categoryMs : selectedPost.category}
                  </span>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-8 md:p-12">
                <h1 className="text-3xl xs:text-4xl sm:text-5xl font-black text-gray-900 font-heading tracking-tight mb-4 leading-tight">
                  {language === 'ms' ? selectedPost.titleMs : selectedPost.title}
                </h1>
                
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-200 font-body">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">
                      {language === 'ms' ? selectedPost.authorMs : selectedPost.author}
                    </span>
                  </div>
                  <span className="text-gray-400">â€¢</span>
                  <span className="text-gray-600">{formatDate(selectedPost.date)}</span>
                  <span className="text-gray-400">â€¢</span>
                  <span className="text-gray-600">{language === 'ms' ? selectedPost.readTimeMs : selectedPost.readTime}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {(language === 'ms' ? selectedPost.tagsMs : selectedPost.tags).map(tag => (
                    <span key={tag} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Article Body */}
                <div className="prose prose-lg max-w-none font-body">
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                    {language === 'ms' ? selectedPost.excerptMs : selectedPost.excerpt}
                  </p>
                  <div className="text-gray-700 leading-relaxed space-y-4">
                    {(language === 'ms' ? selectedPost.contentMs : selectedPost.content).split('\n').map((paragraph, idx) => (
                      paragraph.trim() && (
                        <p key={idx} className="text-base sm:text-lg leading-relaxed">
                          {paragraph}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {language === 'ms' 
                    ? 'Dikongsi dari CropDrive Blog' 
                    : 'Shared from CropDrive Blog'}
                </div>
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  {language === 'ms' ? 'Tutup' : 'Close'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
