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
import { useTranslation, getCurrentLanguage } from '@/i18n';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

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
}

const BLOG_IMAGES_BASE = '/images/blog';
const DEFAULT_BLOG_IMAGE = `${BLOG_IMAGES_BASE}/cropdrive-intro.jpg`;

function getBlogImageSrc(path: string | undefined): string {
  if (!path || !path.trim()) return DEFAULT_BLOG_IMAGE;
  const p = path.trim();
  return p.startsWith('/') ? p : `${BLOG_IMAGES_BASE}/${p.replace(/^\//, '')}`;
}

// Static blog posts (fallback if API fails)
const staticBlogPosts: BlogPost[] = [
  // Featured CropDrive Posts
  {
    id: 'cropdrive-introduction',
    title: 'Introducing CropDrive: Revolutionizing Palm Oil Farming with AI-Powered Intelligence',
    titleMs: 'Memperkenalkan CropDrive: Merevolusikan Pertanian Kelapa Sawit dengan Kecerdasan Berkuasa AI',
    excerpt: 'Discover CropDrive, the cutting-edge AI platform transforming palm oil operations through intelligent analysis, predictive insights, and actionable recommendations for sustainable farming.',
    excerptMs: 'Temui CropDrive, platform AI canggih yang mengubah operasi kelapa sawit melalui analisis pintar, pandangan ramalan, dan cadangan yang boleh dilaksanakan untuk pertanian lestari.',
    content: 'CropDrive represents a paradigm shift in agricultural technology, specifically designed for the palm oil industry. Our platform leverages advanced artificial intelligence and machine learning algorithms to analyze crop health, predict potential issues, and provide actionable insights that help farmers maximize yields while maintaining sustainability standards. With CropDrive, farmers can upload images of their crops, receive instant AI-powered analysis, and access comprehensive reports that guide decision-making processes. The platform integrates seamlessly with existing farm management systems, making it accessible to both small-scale farmers and large plantation operations.',
    contentMs: 'CropDrive mewakili perubahan paradigma dalam teknologi pertanian, direka khusus untuk industri kelapa sawit. Platform kami memanfaatkan kecerdasan buatan dan algoritma pembelajaran mesin untuk menganalisis kesihatan tanaman, meramalkan masalah berpotensi, dan memberikan pandangan yang boleh dilaksanakan untuk membantu petani memaksimumkan hasil sambil mengekalkan standard kelestarian. Dengan CropDrive, petani boleh memuat naik imej tanaman mereka, menerima analisis berkuasa AI segera, dan mengakses laporan komprehensif yang membimbing proses membuat keputusan. Platform ini bersepadu dengan sistem pengurusan ladang sedia ada, menjadikannya boleh diakses oleh petani berskala kecil dan operasi ladang besar.',
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
    featured: true
  },
  {
    id: 'cropdrive-features',
    title: 'CropDrive Features: Everything You Need to Know About Our AI Platform',
    titleMs: 'Ciri-Ciri CropDrive: Semua yang Perlu Anda Ketahui Tentang Platform AI Kami',
    excerpt: 'Explore the comprehensive features of CropDrive, from AI-powered crop analysis to detailed reporting, subscription plans, and expert support services.',
    excerptMs: 'Terokai ciri-ciri komprehensif CropDrive, dari analisis tanaman berkuasa AI hingga pelaporan terperinci, pelan langganan, dan perkhidmatan sokongan pakar.',
    content: 'CropDrive offers three distinct subscription tiers designed to meet the needs of different farming operations. The Start plan provides essential AI reports and standard support, perfect for small-scale farmers getting started with technology. The Smart plan includes enhanced features like 24-hour response times and referral bonuses, ideal for growing operations. The Precision plan offers unlimited support, comparative analysis, and partner discounts for large-scale plantations. All plans include our core AI analysis capabilities, which can detect diseases, assess crop health, predict yields, and provide recommendations for optimal farming practices. Our platform also features Palmira, an AI assistant that answers questions about palm oil farming, and comprehensive reporting tools that generate detailed insights from uploaded crop images.',
    contentMs: 'CropDrive menawarkan tiga peringkat langganan yang berbeza direka untuk memenuhi keperluan operasi pertanian yang berbeza. Pelan Start menyediakan laporan AI penting dan sokongan standard, sempurna untuk petani berskala kecil yang baru bermula dengan teknologi. Pelan Smart termasuk ciri-ciri tambahan seperti masa respons 24 jam dan bonus rujukan, sesuai untuk operasi yang berkembang. Pelan Precision menawarkan sokongan tanpa had, analisis perbandingan, dan diskaun rakan kongsi untuk ladang berskala besar. Semua pelan termasuk keupayaan analisis AI teras kami, yang dapat mengesan penyakit, menilai kesihatan tanaman, meramalkan hasil, dan memberikan cadangan untuk amalan pertanian yang optimum. Platform kami juga menampilkan Palmira, pembantu AI yang menjawab soalan tentang pertanian kelapa sawit, dan alat pelaporan komprehensif yang menghasilkan pandangan terperinci dari imej tanaman yang dimuat naik.',
    author: 'CropDrive Product Team',
    authorMs: 'Pasukan Produk CropDrive',
    date: '2025-01-28',
    readTime: '12 min read',
    readTimeMs: '12 minit bacaan',
    category: 'Technology',
    categoryMs: 'Teknologi',
    tags: ['CropDrive', 'Features', 'AI Platform', 'Subscription', 'Technology'],
    tagsMs: ['CropDrive', 'Ciri-Ciri', 'Platform AI', 'Langganan', 'Teknologi'],
    image: '/images/blog/cropdrive-features.jpg',
    featured: true
  },
  {
    id: 'ags-partnership',
    title: 'CropDrive Partners with Agriculture Global Solutions (AGS): A Strategic Alliance for Agricultural Excellence',
    titleMs: 'CropDrive Bekerjasama dengan Agriculture Global Solutions (AGS): Perikatan Strategik untuk Kecemerlangan Pertanian',
    excerpt: 'Learn about the strategic partnership between CropDrive and AGS, combining cutting-edge AI technology with expert agricultural consultancy to deliver comprehensive farming solutions.',
    excerptMs: 'Pelajari tentang perkongsian strategik antara CropDrive dan AGS, menggabungkan teknologi AI canggih dengan perundingan pertanian pakar untuk menyampaikan penyelesaian pertanian komprehensif.',
    content: 'The partnership between CropDrive and Agriculture Global Solutions (AGS) represents a powerful synergy between technology and expertise. While CropDrive provides the AI-powered platform for crop analysis and insights, AGS brings decades of agricultural consultancy experience, offering tailored strategies for farm optimization, sustainable farming practices, and technology integration. This collaboration enables farmers to not only receive AI-generated insights but also benefit from expert interpretation and actionable recommendations from AGS consultants. Together, CropDrive and AGS empower farmers with both the tools and knowledge needed to thrive in today\'s challenging agricultural landscape, ensuring that technological innovation is complemented by proven agricultural wisdom.',
    contentMs: 'Perkongsian antara CropDrive dan Agriculture Global Solutions (AGS) mewakili sinergi yang kuat antara teknologi dan kepakaran. Walaupun CropDrive menyediakan platform berkuasa AI untuk analisis dan pandangan tanaman, AGS membawa pengalaman perundingan pertanian selama beberapa dekad, menawarkan strategi yang disesuaikan untuk pengoptimuman ladang, amalan pertanian lestari, dan integrasi teknologi. Kerjasama ini membolehkan petani bukan sahaja menerima pandangan yang dihasilkan AI tetapi juga mendapat manfaat daripada tafsiran pakar dan cadangan yang boleh dilaksanakan daripada perunding AGS. Bersama-sama, CropDrive dan AGS memberdayakan petani dengan kedua-dua alat dan pengetahuan yang diperlukan untuk berkembang maju dalam landskap pertanian yang mencabar hari ini, memastikan inovasi teknologi dilengkapi dengan kebijaksanaan pertanian yang terbukti.',
    author: 'CropDrive & AGS Partnership Team',
    authorMs: 'Pasukan Perkongsian CropDrive & AGS',
    date: '2025-01-25',
    readTime: '9 min read',
    readTimeMs: '9 minit bacaan',
    category: 'Innovation',
    categoryMs: 'Inovasi',
    tags: ['CropDrive', 'AGS', 'Partnership', 'Agriculture', 'Consultancy'],
    tagsMs: ['CropDrive', 'AGS', 'Perkongsian', 'Pertanian', 'Perundingan'],
    image: '/images/blog/ags-partnership.jpg',
    featured: true
  },
  // AGS Posts
  {
    id: 'ags-introduction',
    title: 'Agriculture Global Solutions (AGS): Empowering Agriculture with Expert Consultancy',
    titleMs: 'Agriculture Global Solutions (AGS): Memberdayakan Pertanian dengan Perundingan Pakar',
    excerpt: 'Discover how AGS transforms the agricultural industry with innovative consultancy services, tailored strategies, and sustainable farming practices that boost productivity and sustainability.',
    excerptMs: 'Temui bagaimana AGS mengubah industri pertanian dengan perkhidmatan perundingan inovatif, strategi yang disesuaikan, dan amalan pertanian lestari yang meningkatkan produktiviti dan kelestarian.',
    content: 'Agriculture Global Solutions (AGS) stands at the forefront of agricultural consultancy, dedicated to transforming farming operations through expert insights and innovative strategies. With a focus on empowering farmers with the tools and knowledge needed to thrive in today\'s challenging agricultural landscape, AGS provides comprehensive consultancy services that address the specific needs of modern farming. Our services include tailored strategies to maximize farm efficiency and output, implementation of sustainable farming practices for long-term success, and seamless integration of the latest agricultural technologies to streamline operations and improve yields. At AGS, we believe in providing not just advice, but actionable solutions that lead to tangible results, whether you\'re looking to optimize crop production, reduce environmental impact, or adopt new technologies.',
    contentMs: 'Agriculture Global Solutions (AGS) berada di barisan hadapan perundingan pertanian, komited untuk mengubah operasi pertanian melalui pandangan pakar dan strategi inovatif. Dengan fokus pada memberdayakan petani dengan alat dan pengetahuan yang diperlukan untuk berkembang maju dalam landskap pertanian yang mencabar hari ini, AGS menyediakan perkhidmatan perundingan komprehensif yang menangani keperluan khusus pertanian moden. Perkhidmatan kami termasuk strategi yang disesuaikan untuk memaksimumkan kecekapan dan output ladang, pelaksanaan amalan pertanian lestari untuk kejayaan jangka panjang, dan integrasi tanpa masalah teknologi pertanian terkini untuk memudahkan operasi dan meningkatkan hasil. Di AGS, kami percaya dalam menyediakan bukan sahaja nasihat, tetapi penyelesaian yang boleh dilaksanakan yang membawa kepada hasil yang ketara, sama ada anda ingin mengoptimumkan pengeluaran tanaman, mengurangkan kesan alam sekitar, atau menggunakan teknologi baru.',
    author: 'AGS Consultancy Team',
    authorMs: 'Pasukan Perundingan AGS',
    date: '2025-01-20',
    readTime: '11 min read',
    readTimeMs: '11 minit bacaan',
    category: 'Agriculture',
    categoryMs: 'Pertanian',
    tags: ['AGS', 'Consultancy', 'Agriculture', 'Sustainability', 'Expertise'],
    tagsMs: ['AGS', 'Perundingan', 'Pertanian', 'Kelestarian', 'Kepakaran'],
    image: '/images/blog/ags-intro.jpg',
    featured: true
  },
  {
    id: 'ags-services',
    title: 'Comprehensive Agricultural Consultancy Services by AGS: Tailored Solutions for Modern Farming',
    titleMs: 'Perkhidmatan Perundingan Pertanian Komprehensif oleh AGS: Penyelesaian Disesuaikan untuk Pertanian Moden',
    excerpt: 'Explore AGS\'s comprehensive consultancy services including agricultural strategy development, sustainable farming implementation, and advanced technology integration.',
    excerptMs: 'Terokai perkhidmatan perundingan komprehensif AGS termasuk pembangunan strategi pertanian, pelaksanaan pertanian lestari, dan integrasi teknologi maju.',
    content: 'AGS offers three core consultancy services designed to address every aspect of modern agricultural operations. Our Agricultural Consultancy service provides tailored strategies to maximize your farm\'s efficiency and output, analyzing your specific conditions and developing customized solutions. Our Sustainable Farming Practices service focuses on implementing eco-friendly methods for long-term success, helping farmers balance productivity with environmental responsibility. Our Technology Integration service leverages the latest agricultural technologies to streamline operations and improve yields, ensuring that farmers can effectively adopt and utilize cutting-edge tools like CropDrive. Each service is delivered by experienced agricultural consultants who understand the unique challenges of modern farming and provide actionable, results-driven recommendations.',
    contentMs: 'AGS menawarkan tiga perkhidmatan perundingan teras yang direka untuk menangani setiap aspek operasi pertanian moden. Perkhidmatan Perundingan Pertanian kami menyediakan strategi yang disesuaikan untuk memaksimumkan kecekapan dan output ladang anda, menganalisis keadaan khusus anda dan membangunkan penyelesaian yang disesuaikan. Perkhidmatan Amalan Pertanian Lestari kami memberi tumpuan kepada pelaksanaan kaedah mesra alam untuk kejayaan jangka panjang, membantu petani menyeimbangkan produktiviti dengan tanggungjawab alam sekitar. Perkhidmatan Integrasi Teknologi kami memanfaatkan teknologi pertanian terkini untuk memudahkan operasi dan meningkatkan hasil, memastikan petani dapat mengguna pakai dan menggunakan alat canggih seperti CropDrive dengan berkesan. Setiap perkhidmatan disampaikan oleh perunding pertanian yang berpengalaman yang memahami cabaran unik pertanian moden dan memberikan cadangan yang boleh dilaksanakan dan berorientasikan hasil.',
    author: 'AGS Services Team',
    authorMs: 'Pasukan Perkhidmatan AGS',
    date: '2025-01-18',
    readTime: '10 min read',
    readTimeMs: '10 minit bacaan',
    category: 'Agriculture',
    categoryMs: 'Pertanian',
    tags: ['AGS', 'Services', 'Consultancy', 'Farming', 'Sustainability'],
    tagsMs: ['AGS', 'Perkhidmatan', 'Perundingan', 'Pertanian', 'Kelestarian'],
    image: '/images/blog/ags-services.jpg'
  },
  {
    id: 'ags-sustainable-farming',
    title: 'Sustainable Farming Practices: How AGS Helps Farmers Achieve Long-Term Success',
    titleMs: 'Amalan Pertanian Lestari: Bagaimana AGS Membantu Petani Mencapai Kejayaan Jangka Panjang',
    excerpt: 'Learn about AGS\'s approach to sustainable farming, implementing eco-friendly methods that ensure long-term productivity while protecting the environment.',
    excerptMs: 'Pelajari tentang pendekatan AGS terhadap pertanian lestari, melaksanakan kaedah mesra alam yang memastikan produktiviti jangka panjang sambil melindungi alam sekitar.',
    content: 'Sustainability is at the heart of AGS\'s consultancy approach. We help farmers implement eco-friendly methods that ensure long-term success while protecting the environment. Our sustainable farming practices include soil health management, water conservation strategies, integrated pest management, and biodiversity preservation. AGS consultants work closely with farmers to develop customized sustainability plans that align with certification standards while maintaining or improving productivity. We understand that sustainable farming is not just about environmental responsibility—it\'s about ensuring the long-term viability of farming operations. Through our consultancy services, farmers learn to balance productivity with environmental stewardship, creating farming systems that are both profitable and sustainable for generations to come.',
    contentMs: 'Kelestarian adalah teras pendekatan perundingan AGS. Kami membantu petani melaksanakan kaedah mesra alam yang memastikan kejayaan jangka panjang sambil melindungi alam sekitar. Amalan pertanian lestari kami termasuk pengurusan kesihatan tanah, strategi pemuliharaan air, pengurusan perosak bersepadu, dan pemeliharaan biodiversiti. Perunding AGS bekerjasama rapat dengan petani untuk membangunkan pelan kelestarian yang disesuaikan yang selaras dengan standard pensijilan sambil mengekalkan atau meningkatkan produktiviti. Kami memahami bahawa pertanian lestari bukan hanya tentang tanggungjawab alam sekitar—ia tentang memastikan daya maju jangka panjang operasi pertanian. Melalui perkhidmatan perundingan kami, petani belajar menyeimbangkan produktiviti dengan penjagaan alam sekitar, mencipta sistem pertanian yang menguntungkan dan lestari untuk generasi akan datang.',
    author: 'AGS Sustainability Team',
    authorMs: 'Pasukan Kelestarian AGS',
    date: '2025-01-15',
    readTime: '8 min read',
    readTimeMs: '8 minit bacaan',
    category: 'Sustainability',
    categoryMs: 'Kelestarian',
    tags: ['AGS', 'Sustainability', 'Farming', 'Environment', 'Best Practices'],
    tagsMs: ['AGS', 'Kelestarian', 'Pertanian', 'Alam Sekitar', 'Amalan Terbaik'],
    image: '/images/blog/ags-sustainable.jpg'
  },
  // More CropDrive Posts
  {
    id: 'cropdrive-ai-technology',
    title: 'The Science Behind CropDrive: How AI Transforms Crop Analysis',
    titleMs: 'Sains Di Sebalik CropDrive: Bagaimana AI Mengubah Analisis Tanaman',
    excerpt: 'Dive deep into the AI technology powering CropDrive, understanding how machine learning algorithms analyze crop images and provide actionable insights.',
    excerptMs: 'Menyelami teknologi AI yang menggerakkan CropDrive, memahami bagaimana algoritma pembelajaran mesin menganalisis imej tanaman dan memberikan pandangan yang boleh dilaksanakan.',
    content: 'CropDrive\'s AI technology represents the cutting edge of agricultural intelligence. Our platform utilizes advanced computer vision algorithms trained on millions of crop images to identify diseases, assess plant health, predict yields, and recommend optimal farming practices. The system employs deep learning neural networks that can detect subtle patterns invisible to the human eye, enabling early detection of issues before they become critical problems. Our AI models are continuously trained on new data, ensuring that recommendations become more accurate over time. The technology integrates multiple data sources including weather patterns, soil conditions, and historical yield data to provide comprehensive insights. This multi-layered approach ensures that farmers receive not just isolated observations, but holistic recommendations that consider the entire farming ecosystem.',
    contentMs: 'Teknologi AI CropDrive mewakili kelebihan kecerdasan pertanian. Platform kami menggunakan algoritma penglihatan komputer canggih yang dilatih pada berjuta-juta imej tanaman untuk mengenal pasti penyakit, menilai kesihatan tumbuhan, meramalkan hasil, dan mengesyorkan amalan pertanian yang optimum. Sistem ini menggunakan rangkaian neural pembelajaran mendalam yang dapat mengesan corak halus yang tidak kelihatan kepada mata manusia, membolehkan pengesanan awal masalah sebelum mereka menjadi masalah kritikal. Model AI kami sentiasa dilatih pada data baru, memastikan cadangan menjadi lebih tepat dari masa ke masa. Teknologi ini mengintegrasikan pelbagai sumber data termasuk corak cuaca, keadaan tanah, dan data hasil sejarah untuk memberikan pandangan komprehensif. Pendekatan berbilang lapisan ini memastikan petani menerima bukan sahaja pemerhatian terpencil, tetapi cadangan holistik yang mempertimbangkan keseluruhan ekosistem pertanian.',
    author: 'CropDrive AI Research Team',
    authorMs: 'Pasukan Penyelidikan AI CropDrive',
    date: '2025-01-12',
    readTime: '13 min read',
    readTimeMs: '13 minit bacaan',
    category: 'Technology',
    categoryMs: 'Teknologi',
    tags: ['CropDrive', 'AI', 'Machine Learning', 'Technology', 'Innovation'],
    tagsMs: ['CropDrive', 'AI', 'Pembelajaran Mesin', 'Teknologi', 'Inovasi'],
    image: '/images/blog/cropdrive-ai-tech.jpg'
  },
  {
    id: 'cropdrive-success-stories',
    title: 'Success Stories: How CropDrive is Transforming Palm Oil Farms Across Malaysia',
    titleMs: 'Kisah Kejayaan: Bagaimana CropDrive Mengubah Ladang Kelapa Sawit di Seluruh Malaysia',
    excerpt: 'Read inspiring stories from Malaysian palm oil farmers who have successfully implemented CropDrive to improve yields, reduce costs, and enhance sustainability.',
    excerptMs: 'Baca kisah inspirasi dari petani kelapa sawit Malaysia yang telah berjaya melaksanakan CropDrive untuk meningkatkan hasil, mengurangkan kos, dan meningkatkan kelestarian.',
    content: 'Across Malaysia, palm oil farmers are experiencing remarkable transformations with CropDrive. Small-scale farmers report 20-30% yield improvements after implementing AI-driven recommendations. Large plantations have reduced pesticide usage by up to 40% through early disease detection, while maintaining or improving crop health. One plantation in Sabah credits CropDrive with identifying a soil nutrient deficiency that was limiting yields, leading to a targeted fertilization program that increased production by 35%. Another farmer in Johor used CropDrive\'s predictive insights to optimize harvest timing, resulting in higher quality palm oil and better market prices. These success stories demonstrate how accessible AI technology can level the playing field, giving farmers of all sizes the tools they need to compete effectively in the global market while maintaining sustainable practices.',
    contentMs: 'Di seluruh Malaysia, petani kelapa sawit mengalami transformasi yang luar biasa dengan CropDrive. Petani berskala kecil melaporkan peningkatan hasil 20-30% selepas melaksanakan cadangan yang didorong AI. Ladang besar telah mengurangkan penggunaan racun perosak sehingga 40% melalui pengesanan penyakit awal, sambil mengekalkan atau meningkatkan kesihatan tanaman. Satu ladang di Sabah mengaitkan CropDrive dengan mengenal pasti kekurangan nutrien tanah yang menghadkan hasil, membawa kepada program persenyawaan yang disasarkan yang meningkatkan pengeluaran sebanyak 35%. Petani lain di Johor menggunakan pandangan ramalan CropDrive untuk mengoptimumkan masa penuaian, menghasilkan minyak sawit berkualiti lebih tinggi dan harga pasaran yang lebih baik. Kisah kejayaan ini menunjukkan bagaimana teknologi AI yang boleh diakses dapat meratakan padang permainan, memberikan petani semua saiz alat yang mereka perlukan untuk bersaing dengan berkesan dalam pasaran global sambil mengekalkan amalan lestari.',
    author: 'CropDrive Community Team',
    authorMs: 'Pasukan Komuniti CropDrive',
    date: '2025-01-10',
    readTime: '9 min read',
    readTimeMs: '9 minit bacaan',
    category: 'Farming',
    categoryMs: 'Pertanian',
    tags: ['CropDrive', 'Success Stories', 'Malaysia', 'Farming', 'Case Studies'],
    tagsMs: ['CropDrive', 'Kisah Kejayaan', 'Malaysia', 'Pertanian', 'Kajian Kes'],
    image: '/images/blog/cropdrive-success.jpg'
  },
  {
    id: 'cropdrive-palmira-assistant',
    title: 'Meet Palmira: Your AI Assistant for Palm Oil Farming Questions',
    titleMs: 'Temu Palmira: Pembantu AI Anda untuk Soalan Pertanian Kelapa Sawit',
    excerpt: 'Discover Palmira, CropDrive\'s intelligent AI assistant that answers your palm oil farming questions 24/7, providing expert knowledge at your fingertips.',
    excerptMs: 'Temui Palmira, pembantu AI pintar CropDrive yang menjawab soalan pertanian kelapa sawit anda 24/7, menyediakan pengetahuan pakar di hujung jari anda.',
    content: 'Palmira is CropDrive\'s revolutionary AI assistant designed specifically for palm oil farming. Available 24/7, Palmira can answer questions about crop management, disease identification, pest control, soil health, fertilization strategies, harvest timing, and sustainable farming practices. Powered by advanced natural language processing and trained on extensive agricultural knowledge, Palmira provides accurate, actionable answers that help farmers make informed decisions. Whether you\'re dealing with a specific problem or seeking general farming advice, Palmira is always ready to help. The assistant integrates seamlessly with CropDrive\'s analysis platform, allowing you to ask follow-up questions about your crop images and receive detailed explanations of AI-generated insights. Palmira represents the future of agricultural support—instant, accurate, and always available.',
    contentMs: 'Palmira adalah pembantu AI revolusioner CropDrive yang direka khusus untuk pertanian kelapa sawit. Tersedia 24/7, Palmira boleh menjawab soalan tentang pengurusan tanaman, pengenalan penyakit, kawalan perosak, kesihatan tanah, strategi persenyawaan, masa penuaian, dan amalan pertanian lestari. Dikuasakan oleh pemprosesan bahasa semula jadi canggih dan dilatih pada pengetahuan pertanian yang luas, Palmira menyediakan jawapan yang tepat dan boleh dilaksanakan yang membantu petani membuat keputusan yang termaklumat. Sama ada anda menghadapi masalah khusus atau mencari nasihat pertanian umum, Palmira sentiasa bersedia untuk membantu. Pembantu ini bersepadu dengan platform analisis CropDrive, membolehkan anda bertanya soalan susulan tentang imej tanaman anda dan menerima penjelasan terperinci tentang pandangan yang dihasilkan AI. Palmira mewakili masa depan sokongan pertanian—segera, tepat, dan sentiasa tersedia.',
    author: 'CropDrive Product Team',
    authorMs: 'Pasukan Produk CropDrive',
    date: '2025-01-08',
    readTime: '7 min read',
    readTimeMs: '7 minit bacaan',
    category: 'Technology',
    categoryMs: 'Teknologi',
    tags: ['CropDrive', 'Palmira', 'AI Assistant', 'Technology', 'Support'],
    tagsMs: ['CropDrive', 'Palmira', 'Pembantu AI', 'Teknologi', 'Sokongan'],
    image: '/images/blog/palmira-assistant.jpg'
  },
  // More AGS Posts
  {
    id: 'ags-technology-integration',
    title: 'Technology Integration in Agriculture: AGS\'s Approach to Modernizing Farms',
    titleMs: 'Integrasi Teknologi dalam Pertanian: Pendekatan AGS untuk Memodenkan Ladang',
    excerpt: 'Learn how AGS helps farmers integrate cutting-edge agricultural technologies, from AI platforms to IoT sensors, streamlining operations and improving yields.',
    excerptMs: 'Pelajari bagaimana AGS membantu petani mengintegrasikan teknologi pertanian canggih, dari platform AI hingga sensor IoT, memudahkan operasi dan meningkatkan hasil.',
    content: 'Technology integration is one of AGS\'s core consultancy services, helping farmers adopt and effectively utilize modern agricultural technologies. Our consultants work with farmers to assess their current operations, identify opportunities for technology adoption, and develop implementation strategies. We specialize in integrating AI platforms like CropDrive, IoT sensor networks for real-time monitoring, automated irrigation systems, and data analytics tools. AGS ensures that technology adoption is not just about buying new tools, but about creating integrated systems that work together seamlessly. We provide training, support, and ongoing consultation to ensure that farmers can maximize the value of their technology investments. Our approach focuses on practical, results-driven integration that improves efficiency, reduces costs, and enhances productivity.',
    contentMs: 'Integrasi teknologi adalah salah satu perkhidmatan perundingan teras AGS, membantu petani mengguna pakai dan menggunakan teknologi pertanian moden dengan berkesan. Perunding kami bekerjasama dengan petani untuk menilai operasi semasa mereka, mengenal pasti peluang untuk penggunaan teknologi, dan membangunkan strategi pelaksanaan. Kami pakar dalam mengintegrasikan platform AI seperti CropDrive, rangkaian sensor IoT untuk pemantauan masa nyata, sistem pengairan automatik, dan alat analitik data. AGS memastikan bahawa penggunaan teknologi bukan hanya tentang membeli alat baru, tetapi tentang mencipta sistem bersepadu yang bekerjasama dengan lancar. Kami menyediakan latihan, sokongan, dan perundingan berterusan untuk memastikan petani dapat memaksimumkan nilai pelaburan teknologi mereka. Pendekatan kami memberi tumpuan kepada integrasi praktikal dan berorientasikan hasil yang meningkatkan kecekapan, mengurangkan kos, dan meningkatkan produktiviti.',
    author: 'AGS Technology Team',
    authorMs: 'Pasukan Teknologi AGS',
    date: '2025-01-05',
    readTime: '10 min read',
    readTimeMs: '10 minit bacaan',
    category: 'Innovation',
    categoryMs: 'Inovasi',
    tags: ['AGS', 'Technology', 'Integration', 'Innovation', 'Farming'],
    tagsMs: ['AGS', 'Teknologi', 'Integrasi', 'Inovasi', 'Pertanian'],
    image: '/images/blog/ags-technology.jpg'
  },
  {
    id: 'ags-farm-optimization',
    title: 'Farm Optimization Strategies: How AGS Maximizes Efficiency and Output',
    titleMs: 'Strategi Pengoptimuman Ladang: Bagaimana AGS Memaksimumkan Kecekapan dan Output',
    excerpt: 'Discover AGS\'s tailored strategies for farm optimization, helping farmers maximize efficiency, increase output, and improve profitability through data-driven approaches.',
    excerptMs: 'Temui strategi yang disesuaikan AGS untuk pengoptimuman ladang, membantu petani memaksimumkan kecekapan, meningkatkan output, dan meningkatkan keuntungan melalui pendekatan berasaskan data.',
    content: 'Farm optimization is at the core of AGS\'s agricultural consultancy services. We develop tailored strategies that maximize your farm\'s efficiency and output by analyzing every aspect of your operation. Our consultants conduct comprehensive assessments of soil health, crop varieties, planting patterns, irrigation systems, pest management, and harvest processes. Using data-driven approaches, we identify bottlenecks, inefficiencies, and opportunities for improvement. AGS then develops customized optimization plans that address your specific challenges while respecting your budget and operational constraints. Our strategies often result in 20-40% improvements in efficiency and output, with many farmers reporting significant cost reductions and increased profitability. We work closely with farmers throughout the implementation process, providing ongoing support and adjusting strategies as needed.',
    contentMs: 'Pengoptimuman ladang adalah teras perkhidmatan perundingan pertanian AGS. Kami membangunkan strategi yang disesuaikan yang memaksimumkan kecekapan dan output ladang anda dengan menganalisis setiap aspek operasi anda. Perunding kami menjalankan penilaian komprehensif kesihatan tanah, varieti tanaman, corak penanaman, sistem pengairan, pengurusan perosak, dan proses penuaian. Menggunakan pendekatan berasaskan data, kami mengenal pasti kesesakan, ketidakcekapan, dan peluang untuk penambahbaikan. AGS kemudian membangunkan pelan pengoptimuman yang disesuaikan yang menangani cabaran khusus anda sambil menghormati belanjawan dan kekangan operasi anda. Strategi kami sering menghasilkan peningkatan 20-40% dalam kecekapan dan output, dengan ramai petani melaporkan pengurangan kos yang ketara dan peningkatan keuntungan. Kami bekerjasama rapat dengan petani sepanjang proses pelaksanaan, menyediakan sokongan berterusan dan melaraskan strategi mengikut keperluan.',
    author: 'AGS Optimization Team',
    authorMs: 'Pasukan Pengoptimuman AGS',
    date: '2025-01-03',
    readTime: '11 min read',
    readTimeMs: '11 minit bacaan',
    category: 'Agriculture',
    categoryMs: 'Pertanian',
    tags: ['AGS', 'Optimization', 'Efficiency', 'Farming', 'Productivity'],
    tagsMs: ['AGS', 'Pengoptimuman', 'Kecekapan', 'Pertanian', 'Produktiviti'],
    image: '/images/blog/ags-optimization.jpg'
  },
  // Combined CropDrive & AGS Posts
  {
    id: 'cropdrive-ags-integration',
    title: 'The Perfect Combination: Integrating CropDrive AI with AGS Consultancy Services',
    titleMs: 'Gabungan Sempurna: Mengintegrasikan AI CropDrive dengan Perkhidmatan Perundingan AGS',
    excerpt: 'Explore how combining CropDrive\'s AI technology with AGS\'s expert consultancy creates a powerful solution for modern palm oil farming.',
    excerptMs: 'Terokai bagaimana menggabungkan teknologi AI CropDrive dengan perundingan pakar AGS mencipta penyelesaian yang berkuasa untuk pertanian kelapa sawit moden.',
    content: 'The integration of CropDrive\'s AI platform with AGS\'s consultancy services creates a comprehensive solution that combines cutting-edge technology with expert agricultural knowledge. When farmers use CropDrive for AI-powered crop analysis, they can then consult with AGS experts who interpret the results, provide context, and develop actionable strategies. This combination ensures that farmers not only receive accurate AI insights but also benefit from human expertise that understands local conditions, market dynamics, and long-term sustainability goals. AGS consultants use CropDrive data to inform their recommendations, creating a data-driven consultancy approach that delivers measurable results. This integrated solution is particularly powerful for farmers seeking to optimize operations while maintaining sustainability standards, as it combines the speed and accuracy of AI with the wisdom and experience of agricultural experts.',
    contentMs: 'Integrasi platform AI CropDrive dengan perkhidmatan perundingan AGS mencipta penyelesaian komprehensif yang menggabungkan teknologi canggih dengan pengetahuan pertanian pakar. Apabila petani menggunakan CropDrive untuk analisis tanaman berkuasa AI, mereka kemudian boleh berunding dengan pakar AGS yang mentafsirkan hasil, menyediakan konteks, dan membangunkan strategi yang boleh dilaksanakan. Gabungan ini memastikan petani bukan sahaja menerima pandangan AI yang tepat tetapi juga mendapat manfaat daripada kepakaran manusia yang memahami keadaan tempatan, dinamik pasaran, dan matlamat kelestarian jangka panjang. Perunding AGS menggunakan data CropDrive untuk memaklumkan cadangan mereka, mencipta pendekatan perundingan berasaskan data yang memberikan hasil yang boleh diukur. Penyelesaian bersepadu ini amat berkuasa untuk petani yang ingin mengoptimumkan operasi sambil mengekalkan standard kelestarian, kerana ia menggabungkan kelajuan dan ketepatan AI dengan kebijaksanaan dan pengalaman pakar pertanian.',
    author: 'CropDrive & AGS Integration Team',
    authorMs: 'Pasukan Integrasi CropDrive & AGS',
    date: '2025-01-01',
    readTime: '10 min read',
    readTimeMs: '10 minit bacaan',
    category: 'Innovation',
    categoryMs: 'Inovasi',
    tags: ['CropDrive', 'AGS', 'Integration', 'AI', 'Consultancy'],
    tagsMs: ['CropDrive', 'AGS', 'Integrasi', 'AI', 'Perundingan'],
    image: '/images/blog/integration.jpg'
  },
  {
    id: 'future-agriculture',
    title: 'The Future of Agriculture: How CropDrive and AGS are Shaping Tomorrow\'s Farming',
    titleMs: 'Masa Depan Pertanian: Bagaimana CropDrive dan AGS Membentuk Pertanian Masa Depan',
    excerpt: 'Look ahead to the future of agriculture, exploring how CropDrive\'s AI technology and AGS\'s consultancy expertise are revolutionizing farming practices.',
    excerptMs: 'Melihat ke hadapan kepada masa depan pertanian, meneroka bagaimana teknologi AI CropDrive dan kepakaran perundingan AGS merevolusikan amalan pertanian.',
    content: 'The future of agriculture is being shaped by the convergence of advanced technology and expert knowledge, and CropDrive and AGS are at the forefront of this transformation. As AI technology becomes more sophisticated, CropDrive continues to evolve, offering increasingly accurate predictions and insights. AGS\'s consultancy services adapt to incorporate new technologies and best practices, ensuring that farmers always have access to the latest innovations. Together, we envision a future where every farmer has access to AI-powered tools and expert guidance, creating a more sustainable, productive, and profitable agricultural sector. This future includes predictive farming that prevents problems before they occur, precision agriculture that optimizes every aspect of farming, and sustainable practices that protect the environment while feeding the world. CropDrive and AGS are committed to making this vision a reality, empowering farmers with the tools and knowledge they need to succeed in an ever-changing agricultural landscape.',
    contentMs: 'Masa depan pertanian dibentuk oleh konvergensi teknologi canggih dan pengetahuan pakar, dan CropDrive dan AGS berada di barisan hadapan transformasi ini. Apabila teknologi AI menjadi lebih canggih, CropDrive terus berkembang, menawarkan ramalan dan pandangan yang semakin tepat. Perkhidmatan perundingan AGS menyesuaikan untuk menggabungkan teknologi dan amalan terbaik baru, memastikan petani sentiasa mempunyai akses kepada inovasi terkini. Bersama-sama, kami membayangkan masa depan di mana setiap petani mempunyai akses kepada alat berkuasa AI dan bimbingan pakar, mencipta sektor pertanian yang lebih lestari, produktif, dan menguntungkan. Masa depan ini termasuk pertanian ramalan yang mencegah masalah sebelum ia berlaku, pertanian tepat yang mengoptimumkan setiap aspek pertanian, dan amalan lestari yang melindungi alam sekitar sambil memberi makan kepada dunia. CropDrive dan AGS komited untuk menjadikan visi ini kenyataan, memberdayakan petani dengan alat dan pengetahuan yang mereka perlukan untuk berjaya dalam landskap pertanian yang sentiasa berubah.',
    author: 'CropDrive & AGS Leadership',
    authorMs: 'Kepimpinan CropDrive & AGS',
    date: '2024-12-28',
    readTime: '12 min read',
    readTimeMs: '12 minit bacaan',
    category: 'Innovation',
    categoryMs: 'Inovasi',
    tags: ['CropDrive', 'AGS', 'Future', 'Agriculture', 'Innovation'],
    tagsMs: ['CropDrive', 'AGS', 'Masa Depan', 'Pertanian', 'Inovasi'],
    image: '/images/blog/future-agriculture.jpg'
  }
];

const categories = [
  { id: 'all', label: 'All Posts', labelMs: 'Semua Pos', icon: faBookOpen },
  { id: 'technology', label: 'Technology', labelMs: 'Teknologi', icon: faBolt },
  { id: 'agriculture', label: 'Agriculture', labelMs: 'Pertanian', icon: faLeaf },
  { id: 'sustainability', label: 'Sustainability', labelMs: 'Kelestarian', icon: faChartLine },
  { id: 'farming', label: 'Farming', labelMs: 'Pertanian', icon: faChartColumn },
  { id: 'innovation', label: 'Innovation', labelMs: 'Inovasi', icon: faEye },
  { id: 'cropdrive', label: 'CropDrive', labelMs: 'CropDrive', icon: faRocket },
  { id: 'ags', label: 'AGS', labelMs: 'AGS', icon: faHandshake }
];

export default function BlogPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ms'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handlePostClick = (post: BlogPost) => {
    const isAGS = post.id.includes('ags');
    if (isAGS) {
      window.open('https://agriglobalsolutions.com', '_blank');
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
      setNewsletterMessage(language === 'ms' ? 'Sila masukkan alamat emel yang sah' : 'Please enter a valid email address');
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
            ? (language === 'ms' ? 'Anda sudah melanggan!' : 'You are already subscribed!')
            : (language === 'ms' ? 'Berjaya melanggan! Semak peti masuk anda.' : 'Successfully subscribed! Check your inbox.')
        );
        setNewsletterEmail('');
        
        // Reset status after 5 seconds
        setTimeout(() => {
          setNewsletterStatus('idle');
          setNewsletterMessage('');
        }, 5000);
      } else {
        setNewsletterStatus('error');
        setNewsletterMessage(data.error || (language === 'ms' ? 'Gagal melanggan. Sila cuba lagi.' : 'Failed to subscribe. Please try again.'));
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setNewsletterStatus('error');
      setNewsletterMessage(language === 'ms' ? 'Ralat berlaku. Sila cuba lagi.' : 'An error occurred. Please try again.');
    }
  };

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

  // Real-time blog posts listener using Firestore
  useEffect(() => {
    if (!mounted) return;

    setLoading(true);

    // Set up Firestore real-time listener
    const q = query(
      collection(db, 'blog_posts'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        try {
          const posts = snapshot.docs
            .map((doc) => {
              const data = doc.data();
              const post: BlogPost = {
                id: doc.id,
                title: data.title || '',
                titleMs: data.titleMs || '',
                excerpt: data.excerpt || '',
                excerptMs: data.excerptMs || '',
                content: data.content || '',
                contentMs: data.contentMs || '',
                author: data.author || '',
                authorMs: data.authorMs || '',
                date: data.date?.toDate?.()?.toISOString() || data.date || '',
                readTime: data.readTime || '',
                readTimeMs: data.readTimeMs || '',
                category: data.category || '',
                categoryMs: data.categoryMs || '',
                tags: data.tags || [],
                tagsMs: data.tagsMs || [],
                image: getBlogImageSrc(data.image),
                featured: data.featured || false,
                published: data.published !== false,
              };
              return post;
            })
            .filter((post) => post.published !== false); // Only show published posts
          
          if (posts.length > 0) {
            setBlogPosts(posts);
          } else {
            // Fallback to static posts if Firestore is empty
            setBlogPosts(staticBlogPosts);
          }
        } catch (error) {
          console.error('Error processing blog posts:', error);
          setBlogPosts(staticBlogPosts);
        } finally {
          setLoading(false);
        }
      },
      (error: Error) => {
        console.error('Error listening to blog posts:', error);
        // Fallback to static posts on error
        setBlogPosts(staticBlogPosts);
        setLoading(false);
        
        // Also try fetching via API as backup
        fetch('/api/blog/posts')
          .then(res => res.json())
          .then(data => {
            if (data.posts && data.posts.length > 0) {
              setBlogPosts(data.posts);
            }
          })
          .catch(err => console.error('API fallback also failed:', err));
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
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
    new Set(displayPosts.flatMap(post => language === 'ms' ? post.tagsMs : post.tags))
  );

  const filteredPosts = displayPosts.filter(post => {
    const matchesSearch = searchQuery === '' ||
      (language === 'ms' ? post.titleMs : post.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (language === 'ms' ? post.excerptMs : post.excerpt).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (language === 'ms' ? post.tagsMs : post.tags).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

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
        (language === 'ms' ? post.tagsMs : post.tags).includes(tag)
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
    return date.toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 relative">
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
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight font-heading">
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent animate-gradient">
                {language === 'ms' ? 'Blog' : 'Blog'}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms'
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
                <div className="text-sm text-white/80">{language === 'ms' ? 'Artikel' : 'Articles'}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black text-yellow-400 mb-1">AI</div>
                <div className="text-sm text-white/80">{language === 'ms' ? 'Teknologi' : 'Technology'}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black text-yellow-400 mb-1">24/7</div>
                <div className="text-sm text-white/80">{language === 'ms' ? 'Sokongan' : 'Support'}</div>
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
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        )}
        
        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-24"
        >
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 lg:p-8 border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-end">
              {/* Search */}
              <div className="flex-1 w-full">
                <label htmlFor="blog-search" className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ms' ? 'Cari Artikel' : 'Search Articles'}
                </label>
                <div className="relative">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    id="blog-search"
                    type="text"
                    placeholder={language === 'ms' ? 'Cari artikel...' : 'Search articles...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="lg:w-64 w-full">
                <label htmlFor="blog-category-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ms' ? 'Kategori' : 'Category'}
                </label>
                <select
                  id="blog-category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all bg-white"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {language === 'ms' ? category.labelMs : category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div className="mt-5 sm:mt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {language === 'ms' ? 'Tag:' : 'Tags:'}
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                        selectedTags.includes(tag)
                          ? 'bg-green-600 text-white shadow-md hover:bg-green-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
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

        {/* Newsletter Signup - Visible after filters */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-24"
        >
          <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-blue-700 rounded-3xl p-8 lg:p-12 text-center text-white shadow-2xl overflow-hidden border-4 border-green-500/30">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }} aria-hidden="true" />
            <div className="absolute top-4 left-4 text-4xl opacity-20" aria-hidden="true">🌱</div>
            <div className="absolute top-4 right-4 text-4xl opacity-20" aria-hidden="true">🌾</div>
            <div className="max-w-2xl mx-auto relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent">
                {language === 'ms' ? 'Jangan Ketinggalan!' : 'Stay Updated!'}
              </h2>
              <p className="text-lg md:text-xl text-green-50 mb-8 leading-relaxed">
                {language === 'ms'
                  ? 'Dapatkan kemas kini terkini tentang CropDrive AI, perkhidmatan AGS, teknologi pertanian, dan berita industri kelapa sawit terus ke peti masuk anda.'
                  : 'Get the latest updates on CropDrive AI, AGS services, agricultural technology, and palm oil industry news delivered straight to your inbox.'}
              </p>
              <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
                <label htmlFor="newsletter-email" className="sr-only">
                  {language === 'ms' ? 'Alamat emel' : 'Email address'}
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={language === 'ms' ? 'Alamat emel anda' : 'Your email address'}
                  className="flex-1 px-5 py-3.5 rounded-xl text-gray-900 focus:ring-4 focus:ring-yellow-300 focus:outline-none shadow-xl font-medium"
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
                    ? (language === 'ms' ? 'Memproses...' : 'Processing...')
                    : newsletterStatus === 'success'
                    ? '✓'
                    : language === 'ms' ? 'Langgan' : 'Subscribe'}
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
                <p className="text-sm text-green-100 mt-4 opacity-80">
                  {language === 'ms' ? 'Tiada spam. Hanya kandungan berkualiti tinggi tentang CropDrive dan AGS.' : 'No spam. Just high-quality content about CropDrive and AGS.'}
                </p>
              )}
            </div>
          </div>
        </motion.section>

        {/* Featured Posts - Magazine Style Layout */}
        {featuredPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-24"
          >
            <div className="flex items-center gap-4 mb-12">
              <div className="h-1 w-16 bg-gradient-to-r from-green-600 to-green-400 rounded-full"></div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900">
              {language === 'ms' ? 'Artikel Pilihan' : 'Featured Articles'}
            </h2>
              <div className="flex-1 h-1 bg-gradient-to-r from-green-400 to-transparent rounded-full"></div>
            </div>
            
            {/* Magazine Style Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {featuredPosts.map((post, index) => {
                const title = language === 'ms' ? post.titleMs : post.title;
                const excerpt = language === 'ms' ? post.excerptMs : post.excerpt;
                const category = language === 'ms' ? post.categoryMs : post.category;
                const author = language === 'ms' ? post.authorMs : post.author;
                const readTime = language === 'ms' ? post.readTimeMs : post.readTime;
                const tags = language === 'ms' ? post.tagsMs : post.tags;
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
                    <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 h-full transform hover:scale-[1.02]">
                      {/* Image */}
                      <div className={`relative ${imageHeight} overflow-hidden`}>
                        <Image
                          src={getBlogImageSrc(post.image)}
                          alt={title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        
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
                            {language === 'ms' ? 'Pilihan' : 'Featured'}
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
                      
                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white">
                        <h3 className="text-2xl lg:text-3xl font-black mb-3 line-clamp-2 group-hover:text-yellow-300 transition-colors">
                          {title}
              </h3>
                        <p className="text-white/90 text-sm lg:text-base mb-4 line-clamp-2">
                          {excerpt}
                        </p>
                        
                        {/* Meta */}
                        <div className="flex items-center justify-between text-xs text-white/80 pt-4 border-t border-white/20">
                          <span className="font-medium">{author}</span>
                          <div className="flex items-center gap-3">
                            <span>{formatDate(post.date)}</span>
                            <span>•</span>
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
            <div className="flex items-center gap-4">
              <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">
              {language === 'ms' ? 'Semua Artikel' : 'All Articles'}
            </h2>
              <div className="flex-1 h-1 bg-gradient-to-r from-blue-400 to-transparent rounded-full"></div>
            </div>
            <div className="text-sm sm:text-base text-gray-600 bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 rounded-full font-bold border border-green-200">
              {filteredPosts.length} {language === 'ms' ? 'artikel' : 'articles'}
            </div>
          </div>

          {regularPosts.length > 0 ? (
            <div className="space-y-8">
              {regularPosts.map((post, index) => {
                const title = language === 'ms' ? post.titleMs : post.title;
                const excerpt = language === 'ms' ? post.excerptMs : post.excerpt;
                const category = language === 'ms' ? post.categoryMs : post.category;
                const author = language === 'ms' ? post.authorMs : post.author;
                const readTime = language === 'ms' ? post.readTimeMs : post.readTime;
                const tags = language === 'ms' ? post.tagsMs : post.tags;
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
                    <div className={`relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 ${
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
                            isEven ? 'from-black/60 via-black/30 to-transparent' : 
                            'from-transparent via-black/30 to-black/60'
                          } lg:hidden`}></div>
                          
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
                            <h3 className={`text-2xl lg:text-3xl font-black mb-3 group-hover:underline transition-all ${
                              isCropDrive ? 'text-gray-900 group-hover:text-green-600' :
                              isAGS ? 'text-gray-900 group-hover:text-blue-600' :
                              'text-gray-900 group-hover:text-purple-600'
                            }`}>
                              {title}
                            </h3>
                            <p className="text-gray-600 text-base mb-4 line-clamp-2">
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
                          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                            <span className="font-semibold">{author}</span>
                            <div className="flex items-center gap-3">
                              <span>{formatDate(post.date)}</span>
                              <span>•</span>
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
          <div className="bg-white rounded-xl shadow-lg p-16 sm:p-20 text-center border border-gray-100">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                {language === 'ms' ? 'Tiada Artikel Dijumpai' : 'No Articles Found'}
            </h3>
              <p className="text-lg text-gray-600">
              {language === 'ms'
                  ? 'Cuba menyesuaikan penapis carian anda untuk mencari lebih banyak artikel.'
                  : 'Try adjusting your search filters to find more articles.'
              }
            </p>
          </div>
          )}
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
              aria-label={language === 'ms' ? 'Tutup' : 'Close'}
              title={language === 'ms' ? 'Tutup' : 'Close'}
            >
              <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-gray-700" />
            </button>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1">
              {/* Hero Image */}
              <div className="relative h-64 md:h-80 overflow-hidden">
                <Image
                  src={getBlogImageSrc(selectedPost.image)}
                  alt={language === 'ms' ? selectedPost.titleMs : selectedPost.title}
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
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
                  {language === 'ms' ? selectedPost.titleMs : selectedPost.title}
                </h1>
                
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">
                      {language === 'ms' ? selectedPost.authorMs : selectedPost.author}
                    </span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{formatDate(selectedPost.date)}</span>
                  <span className="text-gray-400">•</span>
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
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    {language === 'ms' ? selectedPost.excerptMs : selectedPost.excerpt}
                  </p>
                  <div className="text-gray-700 leading-relaxed space-y-4">
                    {(language === 'ms' ? selectedPost.contentMs : selectedPost.content).split('\n').map((paragraph, idx) => (
                      paragraph.trim() && (
                        <p key={idx} className="text-base md:text-lg leading-relaxed">
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
