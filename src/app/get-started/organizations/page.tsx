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
              {language === 'ms' ? 'Kami Membantu Organisasi Anda' : 'We help your organization'}<br />
              <span className="text-yellow-400">{language === 'ms' ? 'Berjaya dalam Industri Kelapa Sawit' : 'succeed in the palm oil industry'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms'
                ? 'Gunakan teknologi AI untuk mengoptimumkan pengurusan ladang kelapa sawit anda, meningkatkan produktiviti, dan mengurangkan kos operasi'
                : 'Use AI technology to optimize your oil palm plantation management, increase productivity, and reduce operational costs'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Working with our partners Section */}
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
              {language === 'ms' ? 'Bekerja dengan' : 'Working with'} <span className="text-green-700">{language === 'ms' ? 'Rakan Kongsi Kami' : 'our partners'}</span>
            </h2>
            <p className="text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
              {language === 'ms'
                ? 'Kami menyesuaikan persediaan untuk rakan kongsi komersial dan bukan komersial untuk memenuhi matlamat operasi dan keperluan pelaporan'
                : 'We tailor setups for commercial and non-commercial partners to meet operational goals and reporting needs'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <div className="mb-6">
                <Image 
                  src="/images/Organizations/org-commercial_optimized.jpg" 
                  alt={language === 'ms' ? 'Organisasi komersial' : 'Commercial organizations'} 
                  width={600} 
                  height={400} 
                  className="rounded-lg object-cover w-full h-64"
                />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 font-heading">
                {language === 'ms' ? 'Untuk Organisasi Komersial' : 'For Commercial Organizations'}
              </h3>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                {language === 'ms'
                  ? 'Ladang, perniagaan pertanian, pembekal baja, dan makmal. Kami membantu anda:'
                  : 'Plantations, agribusinesses, fertilizer suppliers, and laboratories. We help you:'
                }
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 text-lg">
                <li>{language === 'ms' ? 'Menambah nilai kepada produk dan perkhidmatan sedia ada anda' : 'Add value to your existing products and services'}</li>
                <li>{language === 'ms' ? 'Memperkukuhkan sokongan teknikal anda kepada petani' : 'Strengthen your technical support to farmers'}</li>
                <li>{language === 'ms' ? 'Menghubungkan cadangan berasaskan sains kepada penggunaan produk anda' : 'Link science based recommendations to your product use'}</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <div className="mb-6">
                <Image 
                  src="/images/Organizations/org-noncommercial_optimized.jpg" 
                  alt={language === 'ms' ? 'Organisasi bukan komersial' : 'Non-commercial organizations'} 
                  width={600} 
                  height={400} 
                  className="rounded-lg object-cover w-full h-64"
                />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 font-heading">
                {language === 'ms' ? 'Untuk Organisasi Bukan Komersial' : 'For Non-Commercial Organizations'}
              </h3>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                {language === 'ms'
                  ? 'Agensi kerajaan, NGO, program pembangunan, dan organisasi antarabangsa. Kami membantu anda:'
                  : 'Government agencies, NGOs, development programs, and international organizations. We help you:'
                }
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 text-lg">
                <li>{language === 'ms' ? 'Mencapai lebih ramai petani dengan nasihat agronomi yang konsisten' : 'Reach more farmers with consistent agronomy advice'}</li>
                <li>{language === 'ms' ? 'Menggunakan data makmal untuk menyokong kerja sambungan anda' : 'Use lab data to support your extension work'}</li>
                <li>{language === 'ms' ? 'Melaporkan hasil kepada penderma dan program kebangsaan' : 'Report results to donors and national programs'}</li>
              </ul>
            </motion.div>
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
                {language === 'ms' ? 'Hubungi Kami untuk Kerjasama' : 'Contact Us for Partnership'}
              </h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {language === 'ms'
                    ? 'Isi borang di bawah untuk memulakan perbincangan tentang bagaimana CropDrive™ boleh membantu organisasi anda mencapai matlamat pengurusan ladang kelapa sawit yang lebih baik.'
                    : 'Fill out the form below to start a discussion about how CropDrive™ can help your organization achieve better oil palm plantation management goals.'
                  }
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

