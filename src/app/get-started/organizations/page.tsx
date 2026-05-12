'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import toast from 'react-hot-toast';

export default function GetStartedOrganizationsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const { language } = useTranslation(currentLanguage);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    location: '',
    phone: '',
    website: '',
    message: ''
  });

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit-organization-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          language === 'ms'
            ? '✅ Terima kasih! Penyerahan anda telah diterima. Pasukan kami akan menghubungi anda tidak lama lagi.'
            : '✅ Thank you! Your submission has been received. Our team will contact you soon.',
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
          organization: '',
          location: '',
          phone: '',
          website: '',
          message: ''
        });
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-green-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <span className="inline-block text-yellow-400 text-xs sm:text-sm font-bold tracking-widest uppercase px-4 sm:px-6 py-2 border-2 border-yellow-400/50 rounded-full backdrop-blur-md bg-white/10 shadow-lg mb-4 sm:mb-6">
              {language === 'ms' ? 'Untuk Organisasi' : 'For Organizations'}
            </span>
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-black text-white mb-4 sm:mb-6 leading-[1.1] font-heading">
              {language === 'ms' ? 'Kami Membantu Organisasi\nAnda Berjaya' : 'We help your\norganization succeed'}<br />
              <span className="text-yellow-400">{language === 'ms' ? 'dalam Industri Kelapa Sawit' : 'in the palm oil industry'}</span>
            </h1>
            <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2 xs:px-4">
              {language === 'ms'
                ? 'Gunakan teknologi AI untuk mengoptimumkan pengurusan ladang kelapa sawit anda, meningkatkan produktiviti, dan mengurangkan kos operasi'
                : 'Use AI technology to optimize your oil palm plantation management, increase productivity, and reduce operational costs'
              }
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-block"
            >
              <button className="px-6 xs:px-8 sm:px-12 py-2.5 xs:py-3 sm:py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 font-black rounded-full hover:shadow-2xl hover:shadow-yellow-400/40 transition-all duration-300 shadow-xl transform hover:scale-105 uppercase tracking-wide text-xs xs:text-sm sm:text-base">
                {language === 'ms' ? '📅 Hantarkan Borang' : '📅 Submit Form'}
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Working with our partners Section */}
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
            <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4 sm:mb-6 font-heading">
              {language === 'ms' ? 'Bekerja dengan' : 'Working with'} <span className="text-green-700">{language === 'ms' ? 'Rakan Kongsi Kami' : 'our partners'}</span>
            </h2>
            <p className="text-base xs:text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2 xs:px-4">
              {language === 'ms'
                ? 'Kami menyesuaikan persediaan untuk rakan kongsi komersial dan bukan komersial untuk memenuhi matlamat operasi dan keperluan pelaporan'
                : 'We tailor setups for commercial and non-commercial partners to meet operational goals and reporting needs'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="premium-card p-6 sm:p-8 hover:shadow-lg transition-all"
            >
              <div className="mb-6">
                <Image 
                  src="/images/Organizations/org-commercial_optimized.jpg" 
                  alt={language === 'ms' ? 'Organisasi komersial' : 'Commercial organizations'} 
                  width={600} 
                  height={400} 
                  className="rounded-xl object-cover w-full h-56 sm:h-64"
                />
              </div>
              <h3 className="text-xl xs:text-2xl sm:text-3xl font-black text-gray-900 mb-4 font-heading">
                {language === 'ms' ? 'Untuk Organisasi Komersial' : 'For Commercial Organizations'}
              </h3>
              <p className="text-sm xs:text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
                {language === 'ms'
                  ? 'Ladang, perniagaan pertanian, pembekal baja, dan makmal. Kami membantu anda:'
                  : 'Plantations, agribusinesses, fertilizer suppliers, and laboratories. We help you:'
                }
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-sm xs:text-base sm:text-lg">{language === 'ms' ? 'Menambah nilai kepada produk dan perkhidmatan sedia ada anda' : 'Add value to your existing products and services'}</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-sm xs:text-base sm:text-lg">{language === 'ms' ? 'Memperkukuhkan sokongan teknikal anda kepada petani' : 'Strengthen your technical support to farmers'}</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-sm xs:text-base sm:text-lg">{language === 'ms' ? 'Menghubungkan cadangan berasaskan sains kepada penggunaan produk anda' : 'Link science based recommendations to your product use'}</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="premium-card p-6 sm:p-8 hover:shadow-lg transition-all"
            >
              <div className="mb-6">
                <Image 
                  src="/images/Organizations/org-noncommercial_optimized.jpg" 
                  alt={language === 'ms' ? 'Organisasi bukan komersial' : 'Non-commercial organizations'} 
                  width={600} 
                  height={400} 
                  className="rounded-xl object-cover w-full h-56 sm:h-64"
                />
              </div>
              <h3 className="text-xl xs:text-2xl sm:text-3xl font-black text-gray-900 mb-4 font-heading">
                {language === 'ms' ? 'Untuk Organisasi Bukan Komersial' : 'For Non-Commercial Organizations'}
              </h3>
              <p className="text-sm xs:text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
                {language === 'ms'
                  ? 'Agensi kerajaan, NGO, program pembangunan, dan organisasi antarabangsa. Kami membantu anda:'
                  : 'Government agencies, NGOs, development programs, and international organizations. We help you:'
                }
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-sm xs:text-base sm:text-lg">{language === 'ms' ? 'Mencapai lebih ramai petani dengan nasihat agronomi yang konsisten' : 'Reach more farmers with consistent agronomy advice'}</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-sm xs:text-base sm:text-lg">{language === 'ms' ? 'Menggunakan data makmal untuk menyokong kerja sambungan anda' : 'Use lab data to support your extension work'}</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 text-sm xs:text-base sm:text-lg">{language === 'ms' ? 'Melaporkan hasil kepada penderma dan program kebangsaan' : 'Report results to donors and national programs'}</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 sm:py-24 bg-gradient-to-b from-white via-blue-50/20 to-white relative overflow-hidden">
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
                {language === 'ms' ? 'Hubungi Kami untuk Kerjasama' : 'Contact Us for Partnership'}
              </h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-lg">
                <p className="text-gray-700 text-sm xs:text-base sm:text-lg leading-relaxed">
                  {language === 'ms'
                    ? 'Isi borang di bawah untuk memulakan perbincangan tentang bagaimana CropDrive™ boleh membantu organisasi anda mencapai matlamat pengurusan ladang kelapa sawit yang lebih baik.'
                    : 'Fill out the form below to start a discussion about how CropDrive™ can help your organization achieve better oil palm plantation management goals.'
                  }
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="org-firstName" className="block text-sm font-bold text-gray-700 mb-2">
                    {language === 'ms' ? 'Nama Pertama' : 'First Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="org-firstName"
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="org-lastName" className="block text-sm font-bold text-gray-700 mb-2">
                    {language === 'ms' ? 'Nama Akhir' : 'Last Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="org-lastName"
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
                <label htmlFor="org-email" className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'E-mel' : 'Email'} <span className="text-red-500">*</span>
                </label>
                <input
                  id="org-email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div>
                <label htmlFor="org-organization" className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Nama Organisasi' : 'Organization Name'} <span className="text-red-500">*</span>
                </label>
                <input
                  id="org-organization"
                  type="text"
                  name="organization"
                  required
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder={language === 'ms' ? 'Masukkan nama organisasi anda' : 'Enter your organization name'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="org-location" className="block text-sm font-bold text-gray-700 mb-2">
                    {language === 'ms' ? 'Lokasi' : 'Location'}
                  </label>
                  <input
                    id="org-location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                    placeholder={language === 'ms' ? 'Bandar, Negeri, Negara' : 'City, State, Country'}
                  />
                </div>
                <div>
                  <label htmlFor="org-phone" className="block text-sm font-bold text-gray-700 mb-2">
                    {language === 'ms' ? 'Nombor Telefon' : 'Phone Number'}
                  </label>
                  <input
                    id="org-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                    placeholder="+60123456789"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="org-website" className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Laman Web' : 'Website'}
                </label>
                <input
                  id="org-website"
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="https://www.yourorganization.com"
                />
              </div>

              <div>
                <label htmlFor="org-message" className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Mesej' : 'Message'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="org-message"
                  name="message"
                  rows={6}
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder={language === 'ms'
                    ? 'Sila berikan butiran tentang organisasi anda, cabaran yang anda hadapi, dan bagaimana anda fikir CropDrive™ boleh membantu...'
                    : 'Please provide details about your organization, the challenges you face, and how you think CropDrive™ can help...'
                  }
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

          <div className="text-center mt-6">
            <p className="text-sm text-gray-700">
              {language === 'ms'
                ? 'Anda juga boleh menulis kepada kami terus di contact@agriglobalsolutions.com'
                : 'You can also write to us directly at contact@agriglobalsolutions.com'
              }
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

