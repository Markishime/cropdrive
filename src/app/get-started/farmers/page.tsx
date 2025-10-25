'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';

export default function GetStartedFarmersPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ms'>('en');
  const { language } = useTranslation(currentLanguage);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    newsletter: false,
    whatsapp: '',
    plantationSize: '',
    palmAge: '',
    currentYield: '',
    soilTestFile: null as File | null,
    leafTestFile: null as File | null,
    message: ''
  });

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [fieldName]: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
    alert('Thank you! Your submission has been received. Our team will process your data and contact you soon.');
  };

  if (!mounted) {
    return null;
  }

  const steps = [
    {
      number: '1',
      title: language === 'ms' ? 'Lakukan Ujian Makmal Anda' : 'Do your lab tests',
      desc: language === 'ms' 
        ? 'Hantar sampel tanah dan daun ke makmal pilihan anda. Analisis tanah perlu termasuk pH, peratus Nitrogen, peratus Karbon Organik, Jumlah P, P Tersedia, K, Ca, Mg yang Boleh Ditukar, dan CEC. Analisis daun perlu termasuk N, P, K, Mg, Ca sebagai peratus bahan kering, dan B, Cu, Zn dalam mg/kg. Pastikan anda terima keputusan dalam format PDF, imej, atau Excel.'
        : 'Send soil and leaf samples to your preferred laboratory. Soil analysis should include pH, Nitrogen percent, Organic Carbon percent, Total P, Available P, Exchangeable K, Ca, Mg, and CEC. Leaf analysis should include N, P, K, Mg, Ca as percent dry matter, and B, Cu, Zn in mg/kg. Make sure you receive your results in PDF, image, or Excel format.'
    },
    {
      number: '2',
      title: language === 'ms' ? 'Daftar di CropDrive' : 'Register on CropDrive',
      desc: language === 'ms'
        ? 'Buat akaun anda dan sahkan e-mel anda. Log masuk dan pilih bahasa dan unit pilihan anda.'
        : 'Create your account and verify your email. Log in and select your preferred language and units.'
    },
    {
      number: '3',
      title: language === 'ms' ? 'Tambah Butiran Ladang Anda' : 'Add your farm details',
      desc: language === 'ms'
        ? 'Masukkan nama ladang, lokasi, saiz (ha atau ekar), umur kelapa sawit (tahun), dan hasil FFB semasa (t/ha atau t/ekar). Jika ladang anda mempunyai beberapa blok, masukkan setiap satu secara berasingan.'
        : 'Enter your plantation name, location, size (ha or acres), palm age (years), and current FFB yield (t/ha or t/acre). If your plantation has several blocks, enter each separately.'
    },
    {
      number: '4',
      title: language === 'ms' ? 'Muat Naik Fail Anda' : 'Upload your files',
      desc: language === 'ms'
        ? 'Muat naik keputusan ujian tanah dan daun dalam format PDF, imej, atau Excel. Tetapkan setiap fail dengan betul, keputusan tanah di bawah Tanah dan keputusan daun di bawah Daun. Semak bahawa fail yang dimuat naik boleh dibaca dan dipadankan dengan betul.'
        : 'Upload your soil and leaf test results in PDF, image, or Excel format. Assign each file correctly, soil results under Soil and leaf results under Leaf. Check that the uploaded files are readable and correctly matched.'
    },
    {
      number: '5',
      title: language === 'ms' ? 'Dapatkan Laporan Anda' : 'Get your report',
      desc: language === 'ms'
        ? 'Klik Analisis untuk memulakan pemprosesan. Sistem akan menghasilkan laporan anda dalam kira-kira 10–15 minit. Anda boleh membacanya dalam talian atau memuat turun versi PDF untuk rekod anda.'
        : 'Click Analyze to start processing. The system will generate your report in about 10–15 minutes. You can read it online or download the PDF version for your records.'
    },
    {
      number: '6',
      title: language === 'ms' ? 'Laksanakan Strategi' : 'Apply the strategy',
      desc: language === 'ms'
        ? 'Ikuti cadangan dalam laporan untuk persenyawaan, pengurusan tanah, dan penjagaan tanaman. Ulang ujian tisu tanah dan daun satu tahun kemudian dan muat naik keputusan baru untuk menerima cadangan yang dikemas kini.'
        : 'Follow the recommendations in the report for fertilization, soil management, and crop care. Repeat soil and leaf tissue testing one year later and upload the new results to receive updated recommendations.'
    },
    {
      number: '7',
      title: language === 'ms' ? 'Perlukan Bantuan?' : 'Need help?',
      desc: language === 'ms'
        ? 'Jika anda mempunyai sebarang soalan atau menemui percanggahan, hubungi kami melalui bahagian Bantuan atau Hubungi. Sertakan ID laporan anda dan kami akan membalas dalam masa 24 jam.'
        : 'If you have any questions or find discrepancies, contact us through the Help or Contact section. Include your report ID and we will reply within 24 hours.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-32 overflow-hidden">
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
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight font-heading">
              {language === 'ms' ? 'Kami Membantu Anda Memutuskan' : 'We help you decide'}<br />
              <span className="text-yellow-400">{language === 'ms' ? 'Apa yang Tanaman Anda Perlukan' : 'what your crops really need'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms'
                ? 'Muat naik keputusan makmal tanah dan daun anda dan terima cadangan yang direka untuk anda bagi mengurangkan perbelanjaan dan meningkatkan produktiviti'
                : 'Upload your soil and leaf lab results and receive recommendations designed for you to reduce your expenses and boost your productivity'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 font-heading">
              {language === 'ms' ? 'Cara Ia' : 'How it'} <span className="text-green-700">{language === 'ms' ? 'Berfungsi' : 'works'}</span>
            </h2>
          </motion.div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 text-yellow-400 rounded-full flex items-center justify-center text-3xl font-black shadow-xl">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 font-heading">
                      {step.title}
                </h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {step.desc}
                </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Plans Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 font-heading">
              {language === 'ms' ? 'Pelan Keahlian dan' : 'Membership Plans and'} <span className="text-green-700">{language === 'ms' ? 'Harga' : 'Pricing'}</span>
            </h2>
            <p className="text-xl text-gray-600 mt-4">
              {language === 'ms' 
                ? 'Pilih pelan yang sesuai dengan saiz ladang anda'
                : 'Choose the plan that fits your farm size'
              }
                </p>
              </motion.div>
          
          <div className="text-center">
            <Link href="/pricing">
              <button className="px-10 py-5 bg-gradient-to-r from-green-600 to-green-700 text-white font-black rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-xl transform hover:scale-105 uppercase tracking-wide">
                {language === 'ms' ? 'Lihat Pelan Harga' : 'View Pricing Plans'}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-24 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 font-heading">
                {language === 'ms' ? 'Pembantu AI CropDrive™' : 'CropDrive™ AI Assistant'}
            </h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-gray-700 leading-relaxed">
              {language === 'ms'
                    ? 'Ahli agronomi AI kami sedang diintegrasikan ke dalam sistem dan akan segera menjana cadangan segera untuk anda. Buat masa ini, anda boleh memuat naik butiran ladang anda dan fail analisis makmal tanah dan daun anda di sini. Pasukan kami akan memproses data anda secara manual dan menyediakan laporan terperinci untuk anda sehingga Pembantu CropDrive™ dilancarkan.'
                    : 'Our AI agronomist is being integrated into the system and will soon generate instant recommendations for you. In the meantime, you can upload your farm details and your soil and leaf laboratory analysis files here. Our team will process your data manually and prepare a detailed report for you until the CropDrive™ Assistant goes live.'
              }
            </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {language === 'ms' ? 'Nama Pertama' : 'First Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {language === 'ms' ? 'Nama Akhir' : 'Last Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'E-mel' : 'Email'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="newsletter"
                  id="newsletter"
                  checked={formData.newsletter}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="newsletter" className="ml-2 text-sm text-gray-700">
                  {language === 'ms' ? 'Daftar untuk berita dan kemas kini' : 'Sign up for news and updates'}
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  required
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="+60123456789"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Apakah saiz ladang kelapa sawit anda? (dalam hektar)' : 'What is the size of your oil palm plantation? (in hectares)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="plantationSize"
                  required
                  value={formData.plantationSize}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Berapa umur pokok kelapa sawit anda? (dalam tahun)' : 'How old are your palm trees? (in years)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="palmAge"
                  required
                  value={formData.palmAge}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Apakah hasil semasa Tandan Buah Segar (FFB) anda dalam Tan setiap Hektar?' : 'What is your current yield of Fresh Fruit Bunches (FFB) in Tons per Ha?'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="currentYield"
                  required
                  value={formData.currentYield}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Muat naik keputusan ujian Tanah makmal anda' : 'Upload your laboratory Soil test results'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx"
                  onChange={(e) => handleFileChange(e, 'soilTestFile')}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.soilTestFile ? formData.soilTestFile.name : (language === 'ms' ? 'Tiada fail dipilih' : 'No file chosen')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Muat naik keputusan ujian Tisu Daun (pelepah) makmal anda' : 'Upload your laboratory Leaf Tissue (frond) test results'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx"
                  onChange={(e) => handleFileChange(e, 'leafTestFile')}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.leafTestFile ? formData.leafTestFile.name : (language === 'ms' ? 'Tiada fail dipilih' : 'No file chosen')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Mesej' : 'Message'}
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder={language === 'ms' ? 'Mesej tambahan (pilihan)' : 'Additional message (optional)'}
                />
              </div>

              <div className="text-center pt-4">
                <button
                  type="submit"
                  className="px-12 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-black rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-xl transform hover:scale-105 uppercase tracking-wide"
                >
                  {language === 'ms' ? 'Hantar' : 'Send'}
              </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

