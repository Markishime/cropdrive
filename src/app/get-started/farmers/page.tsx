'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import toast from 'react-hot-toast';

export default function GetStartedFarmersPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create FormData object for file upload
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('newsletter', formData.newsletter.toString());
      submitData.append('whatsapp', formData.whatsapp);
      submitData.append('plantationSize', formData.plantationSize);
      submitData.append('palmAge', formData.palmAge);
      submitData.append('currentYield', formData.currentYield);
      submitData.append('message', formData.message);
      
      if (formData.soilTestFile) {
        submitData.append('soilTestFile', formData.soilTestFile);
      }
      if (formData.leafTestFile) {
        submitData.append('leafTestFile', formData.leafTestFile);
      }

      const response = await fetch('/api/submit-farmer-form', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          language === 'ms' 
            ? '✅ Terima kasih! Penyerahan anda telah diterima. Pasukan kami akan memproses data anda dan menghubungi anda tidak lama lagi.' 
            : '✅ Thank you! Your submission has been received. Our team will process your data and contact you soon.',
          {
            duration: 6000,
            position: 'top-center',
            style: {
              background: '#16a34a',
              color: '#fff',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(22, 163, 74, 0.3)',
            },
            icon: '🎉',
          }
        );
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          newsletter: false,
          whatsapp: '',
          plantationSize: '',
          palmAge: '',
          currentYield: '',
          soilTestFile: null,
          leafTestFile: null,
          message: ''
        });
        
        // Reset file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
        fileInputs.forEach(input => input.value = '');
      } else {
        throw new Error(result.error || 'Failed to submit form');
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      const errorMessage = error.message || 'Unknown error';
      let displayMessage = language === 'ms'
        ? '❌ Maaf, terdapat ralat menghantar borang anda.'
        : '❌ Sorry, there was an error submitting your form.';
      
      // Check for specific error messages
      if (errorMessage.includes('Email service not configured')) {
        displayMessage = language === 'ms'
          ? '⚠️ Perkhidmatan emel sedang disediakan. Sila hubungi kami terus di contact@agriglobalsolutions.com'
          : '⚠️ Email service is being set up. Please contact us directly at contact@agriglobalsolutions.com';
      }
      
      toast.error(displayMessage, {
        duration: 6000,
        position: 'top-center',
        style: {
          background: '#dc2626',
          color: '#fff',
          padding: '16px 24px',
          fontSize: '16px',
          fontWeight: '600',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(220, 38, 38, 0.3)',
        },
        icon: '❌',
      });
    } finally {
      setIsSubmitting(false);
    }
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
        ? 'Klik Analisis untuk memulakan pemprosesan. Sistem akan menghasilkan laporan anda dalam kira-kira 5-8 minit. Anda boleh membacanya dalam talian atau memuat turun versi PDF untuk rekod anda.'
        : 'Click Analyze to start processing. The system will generate your report in about 5-8 minutes. You can read it online or download the PDF version for your records.'
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
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-28 sm:py-32 overflow-hidden pt-28 sm:pt-32">
        {/* Ambient glow and pattern */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-green-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <span className="inline-block text-yellow-400 text-xs sm:text-sm font-bold tracking-widest uppercase px-4 sm:px-6 py-2 border-2 border-yellow-400/50 rounded-full backdrop-blur-md bg-white/10 shadow-lg mb-4 sm:mb-6">
              {language === 'ms' ? 'Untuk Petani Individu' : 'For Individual Farmers'}
            </span>
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-black text-white mb-4 sm:mb-6 leading-[1.1] font-heading">
              {language === 'ms' ? 'Kami Membantu Anda\nMemutuskan' : 'We help you\ndecide'}<br />
              <span className="text-yellow-400">{language === 'ms' ? 'Apa yang Tanaman\nAnda Perlukan' : 'what your crops\nreally need'}</span>
            </h1>
            <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2 xs:px-4">
              {language === 'ms'
                ? 'Muat naik keputusan makmal tanah dan daun anda dan terima cadangan yang direka untuk anda bagi mengurangkan perbelanjaan dan meningkatkan produktiviti'
                : 'Upload your soil and leaf lab results and receive recommendations designed for you to reduce your expenses and boost your productivity'
              }
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-block"
            >
              <Link href="/pricing">
                <button className="px-6 xs:px-8 sm:px-12 py-2.5 xs:py-3 sm:py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 font-black rounded-full hover:shadow-2xl hover:shadow-yellow-400/40 transition-all duration-300 shadow-xl transform hover:scale-105 uppercase tracking-wide text-xs xs:text-sm sm:text-base">
                  {language === 'ms' ? 'Lihat Pelan Harga' : 'View Pricing Plans'}
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-24 bg-gradient-to-b from-white via-green-50/30 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-8 premium-mesh" />
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-2 sm:mb-4 font-heading">
              {language === 'ms' ? 'Cara Ia' : 'How it'} <span className="text-green-700">{language === 'ms' ? 'Berfungsi' : 'works'}</span>
            </h2>
            <p className="text-base xs:text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2 xs:px-4">
              {language === 'ms' ? '7 langkah mudah untuk mencapai hasil yang lebih baik' : '7 simple steps to better results'}
            </p>
          </motion.div>

          <div className="space-y-4 sm:space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="premium-card p-6 sm:p-8 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <motion.div 
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-600 to-green-700 text-yellow-400 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-black shadow-lg"
                    >
                      {step.number}
                    </motion.div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg xs:text-xl sm:text-2xl font-black text-gray-900 mb-2 font-heading">
                      {step.title}
                    </h3>
                    <p className="text-sm xs:text-base sm:text-lg text-gray-700 leading-relaxed">
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
      <section className="py-20 sm:py-24 bg-gradient-to-b from-green-50/50 via-white to-white relative overflow-hidden">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-green-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black text-gray-900 mb-2 sm:mb-4 font-heading">
              {language === 'ms' ? 'Pelan Keahlian dan Harga' : 'Membership Plans and Pricing'}
            </h2>
            <p className="text-base xs:text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2 xs:px-4">
              {language === 'ms' 
                ? 'Pilih pelan yang sesuai dengan saiz ladang anda'
                : 'Choose the plan that fits your farm size'
              }
            </p>
          </motion.div>
          
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link href="/pricing">
                <button className="px-6 xs:px-8 sm:px-12 py-3 sm:py-4 btn-v2-primary text-white rounded-full hover:shadow-2xl hover:shadow-green-500/40 transition-all duration-300 shadow-lg transform hover:scale-105 uppercase tracking-wide text-xs xs:text-sm sm:text-base font-black">
                  {language === 'ms' ? 'Lihat Pelan Harga' : 'View Pricing Plans'}
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 sm:py-24 bg-gradient-to-b from-white via-green-50/20 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-8 premium-mesh" />
        <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="premium-panel-strong rounded-3xl p-6 sm:p-8 md:p-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black text-gray-900 mb-4 font-heading">
                {language === 'ms' ? 'Pembantu AI CropDrive™' : 'CropDrive™ AI Assistant'}
              </h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
                <p className="text-gray-700 text-sm xs:text-base sm:text-lg leading-relaxed">
                  {language === 'ms'
                    ? 'Ahli agronomi AI kami sedang diintegrasikan ke dalam sistem dan akan segera menjana cadangan segera untuk anda. Buat masa ini, anda boleh memuat naik butiran ladang anda dan fail analisis makmal tanah dan daun anda di sini. Pasukan kami akan memproses data anda secara manual dan menyediakan laporan terperinci untuk anda sehingga Pembantu CropDrive™ dilancarkan.'
                    : 'Our AI agronomist is being integrated into the system and will soon generate instant recommendations for you. In the meantime, you can upload your farm details and your soil and leaf laboratory analysis files here. Our team will process your data manually and prepare a detailed report for you until the CropDrive™ Assistant goes live.'
                  }
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="farmer-firstName" className="block text-sm font-bold text-gray-700 mb-2">
                    {language === 'ms' ? 'Nama Pertama' : 'First Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="farmer-firstName"
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="farmer-lastName" className="block text-sm font-bold text-gray-700 mb-2">
                    {language === 'ms' ? 'Nama Akhir' : 'Last Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="farmer-lastName"
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="farmer-email" className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'E-mel' : 'Email'} <span className="text-red-500">*</span>
                </label>
                <input
                  id="farmer-email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
                <input
                  type="checkbox"
                  name="newsletter"
                  id="newsletter"
                  checked={formData.newsletter}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="newsletter" className="ml-3 text-sm text-gray-700 font-medium">
                  {language === 'ms' ? 'Daftar untuk berita dan kemas kini' : 'Sign up for news and updates'}
                </label>
              </div>

              <div>
                <label htmlFor="farmer-whatsapp" className="block text-sm font-bold text-gray-700 mb-2">
                  WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  id="farmer-whatsapp"
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
                <label htmlFor="farmer-plantationSize" className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Apakah saiz ladang kelapa sawit anda? (dalam hektar)' : 'What is the size of your oil palm plantation? (in hectares)'} <span className="text-red-500">*</span>
                </label>
                <input
                  id="farmer-plantationSize"
                  type="number"
                  name="plantationSize"
                  required
                  value={formData.plantationSize}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div>
                <label htmlFor="farmer-palmAge" className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Berapa umur pokok kelapa sawit anda? (dalam tahun)' : 'How old are your palm trees? (in years)'} <span className="text-red-500">*</span>
                </label>
                <input
                  id="farmer-palmAge"
                  type="number"
                  name="palmAge"
                  required
                  value={formData.palmAge}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div>
                <label htmlFor="farmer-currentYield" className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Apakah hasil semasa Tandan Buah Segar (FFB) anda dalam Tan setiap Hektar?' : 'What is your current yield of Fresh Fruit Bunches (FFB) in Tons per Ha?'} <span className="text-red-500">*</span>
                </label>
                <input
                  id="farmer-currentYield"
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
                <label htmlFor="farmer-soilTestFile" className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Muat naik keputusan ujian Tanah makmal anda' : 'Upload your laboratory Soil test results'} <span className="text-red-500">*</span>
                </label>
                <input
                  id="farmer-soilTestFile"
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
                <label htmlFor="farmer-leafTestFile" className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Muat naik keputusan ujian Tisu Daun (pelepah) makmal anda' : 'Upload your laboratory Leaf Tissue (frond) test results'} <span className="text-red-500">*</span>
                </label>
                <input
                  id="farmer-leafTestFile"
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
                <label htmlFor="farmer-message" className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Mesej' : 'Message'}
                </label>
                <textarea
                  id="farmer-message"
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
                  disabled={isSubmitting}
                  className="px-12 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-black rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-xl transform hover:scale-105 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {language === 'ms' ? 'Menghantar...' : 'Sending...'}
                    </>
                  ) : (
                    language === 'ms' ? 'Hantar' : 'Send'
                  )}
              </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

