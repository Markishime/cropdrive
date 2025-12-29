'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import toast from 'react-hot-toast';

interface FormData {
  name: string;
  email: string;
  organization: string;
  role: string;
  message: string;
}

export default function ContactUsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ms'>('en');
  const { language } = useTranslation(currentLanguage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    organization: '',
    role: '',
    message: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(language === 'ms' 
        ? 'Sila isi semua medan yang diperlukan' 
        : 'Please fill in all required fields'
      );
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(language === 'ms' 
        ? 'Sila masukkan alamat e-mel yang sah' 
        : 'Please enter a valid email address'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('📧 Contact form response:', { ok: response.ok, status: response.status, success: data.success, error: data.error });

      if (response.ok && data.success !== false) {
        toast.success(language === 'ms' 
          ? 'Mesej anda telah dihantar! Kami akan menghubungi anda tidak lama lagi.' 
          : 'Your message has been sent! We\'ll get back to you soon.',
          { duration: 5000 }
        );
        // Reset form
        setFormData({
          name: '',
          email: '',
          organization: '',
          role: '',
          message: '',
        });
      } else {
        const errorMessage = data.error || data.message || 'Failed to send message';
        console.error('❌ Contact form error:', errorMessage, data);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(language === 'ms' 
        ? 'Gagal menghantar mesej. Sila cuba lagi atau e-mel kami terus.' 
        : 'Failed to send message. Please try again or email us directly.'
      );
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
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-16 xs:py-20 sm:py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 xs:mb-8 leading-tight font-heading px-2">
              {language === 'ms' ? 'Hubungi' : 'Contact'} <span className="text-yellow-400">{language === 'ms' ? 'Kami' : 'Us'}</span>
            </h1>
            <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-white/90 mb-8 xs:mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-3 xs:px-4">
              {language === 'ms'
                ? 'Isi borang di bawah atau hubungi kami terus melalui e-mel untuk respons yang cepat.'
                : 'Fill in the form below or reach us directly by email for a quick response.'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 font-heading">
              {language === 'ms' ? 'Borang Hubungi' : 'Contact Form'}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'ms'
                ? 'Isi butiran anda di bawah dan kami akan menghubungi anda secepat mungkin. Untuk respons lebih cepat, e-mel kami di'
                : 'Share your details below and we\'ll get back to you as soon as possible. For quicker reach, email us at'}
              {' '}
              <a href="mailto:contact@agriglobalsolutions.com" className="text-green-700 font-semibold underline hover:text-green-800 transition-colors">
                contact@agriglobalsolutions.com
              </a>
              .
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'ms' ? 'Nama Penuh' : 'Full Name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder={language === 'ms' ? 'Masukkan nama anda' : 'Enter your name'}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'ms' ? 'E-mel' : 'Email'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="you@example.com"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="organization" className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'ms' ? 'Organisasi (pilihan)' : 'Organization (optional)'}
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder={language === 'ms' ? 'Nama syarikat atau ladang' : 'Company or farm name'}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'ms' ? 'Peranan Anda' : 'Your Role'}
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder={language === 'ms' ? 'Contoh: Petani, NGO, Makmal' : 'e.g. Farmer, NGO, Lab'}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'ms' ? 'Mesej Anda' : 'Your Message'} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base min-h-[140px] resize-y focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder={language === 'ms' ? 'Bagaimana kami boleh membantu anda?' : 'How can we help you?'}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                {language === 'ms'
                  ? 'Dengan menghantar, anda bersetuju untuk dihubungi oleh pasukan CropDrive.'
                  : 'By submitting, you agree to be contacted by the CropDrive team.'}
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold text-base sm:text-lg shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[160px]"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {language === 'ms' ? 'Menghantar...' : 'Sending...'}
                  </>
                ) : (
                  language === 'ms' ? 'Hantar Mesej' : 'Send Message'
                )}
              </button>
            </div>
          </motion.form>

          {/* Additional Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 bg-green-50 rounded-2xl px-6 py-4 border border-green-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📧</span>
                <a href="mailto:contact@agriglobalsolutions.com" className="text-green-700 font-semibold hover:text-green-800 transition-colors">
                  contact@agriglobalsolutions.com
                </a>
              </div>
              <div className="hidden sm:block w-px h-6 bg-green-300"></div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌐</span>
                <span className="text-gray-700 font-medium">
                  {language === 'ms' ? 'Sokongan dalam BM & EN' : 'Support in BM & EN'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
