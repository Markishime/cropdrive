'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import toast from 'react-hot-toast';

export default function ContactUsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ms'>('en');
  const { language } = useTranslation(currentLanguage);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate sending (replace with actual API call)
    setTimeout(() => {
      toast.success(language === 'ms' ? 'Mesej berjaya dihantar!' : 'Message sent successfully!');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setSending(false);
    }, 1500);
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
              {language === 'ms' ? 'Hubungi' : 'Contact'} <span className="text-yellow-400">{language === 'ms' ? 'Kami' : 'Us'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms'
                ? 'Kami sedia membantu anda dengan sebarang pertanyaan atau keperluan sokongan'
                : 'We\'re here to help you with any questions or support needs'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-black text-gray-900 mb-8 font-heading">
                {language === 'ms' ? 'Hantar Mesej' : 'Send a Message'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    {language === 'ms' ? 'Nama Penuh' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                    placeholder={language === 'ms' ? 'Masukkan nama anda' : 'Enter your name'}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                    placeholder={language === 'ms' ? 'Masukkan email anda' : 'Enter your email'}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    {language === 'ms' ? 'Nombor Telefon' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                    placeholder={language === 'ms' ? 'Masukkan nombor telefon' : 'Enter phone number'}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    {language === 'ms' ? 'Subjek' : 'Subject'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                    placeholder={language === 'ms' ? 'Masukkan subjek' : 'Enter subject'}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    {language === 'ms' ? 'Mesej' : 'Message'}
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                    placeholder={language === 'ms' ? 'Tulis mesej anda di sini...' : 'Write your message here...'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                >
                  {sending 
                    ? (language === 'ms' ? 'Menghantar...' : 'Sending...')
                    : (language === 'ms' ? 'Hantar Mesej' : 'Send Message')
                  }
                </button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-8 font-heading">
                  {language === 'ms' ? 'Maklumat Hubungan' : 'Contact Information'}
                </h2>
              </div>

              {/* Contact Cards */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Email</h3>
                      <p className="text-gray-600">support@cropdrive.com</p>
                      <p className="text-gray-600">info@cropdrive.com</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{language === 'ms' ? 'Telefon' : 'Phone'}</h3>
                      <p className="text-gray-600">+60 12-345 6789</p>
                      <p className="text-gray-600 text-sm mt-1">{language === 'ms' ? 'Isnin - Jumaat, 9am - 6pm' : 'Monday - Friday, 9am - 6pm'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{language === 'ms' ? 'Alamat Pejabat' : 'Office Address'}</h3>
                      <p className="text-gray-600">
                        Kuala Lumpur, Malaysia
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-xl shadow-lg text-white">
                  <h3 className="text-lg font-bold mb-3">{language === 'ms' ? 'Sokongan WhatsApp' : 'WhatsApp Support'}</h3>
                  <p className="mb-4">{language === 'ms' ? 'Dapatkan bantuan segera melalui WhatsApp' : 'Get instant help via WhatsApp'}</p>
                  <a 
                    href="https://wa.me/60123456789" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-white text-green-700 font-bold rounded-full hover:bg-gray-100 transition-all duration-300"
                  >
                    {language === 'ms' ? 'Buka WhatsApp' : 'Open WhatsApp'}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

