'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import toast from 'react-hot-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

export default function ContactUsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ms'>('en');
  const { language } = useTranslation(currentLanguage);
  const { user } = useAuth();
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

  useEffect(() => {
    // Pre-fill form with user data if logged in
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    try {
      // Save contact message to Firestore
      const contactRef = collection(db, 'contacts');
      await addDoc(contactRef, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        userId: user?.uid || null,
        status: 'pending',
        createdAt: serverTimestamp(),
        language: language
      });

      toast.success(language === 'ms' ? '✓ Mesej berjaya dihantar! Kami akan menghubungi anda tidak lama lagi.' : '✓ Message sent successfully! We will contact you soon.');
      setFormData({ 
        name: user?.displayName || '', 
        email: user?.email || '', 
        phone: '', 
        subject: '', 
        message: '' 
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(language === 'ms' ? '✗ Ralat menghantar mesej. Sila cuba lagi.' : '✗ Error sending message. Please try again.');
    } finally {
      setSending(false);
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
            <motion.span
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block text-yellow-400 text-sm font-bold tracking-widest uppercase mb-6"
            >
              {language === 'ms' ? '🏢 Untuk Organisasi & Penyelesaian Tersuai' : '🏢 For Organizations & Custom Solutions'}
            </motion.span>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight font-heading">
              {language === 'ms' ? 'Tempah' : 'Book'} <span className="text-yellow-400">{language === 'ms' ? 'Demo' : 'A Demo'}</span>
            </h1>

            <p className="text-lg text-white/80 mb-6 font-semibold">
              {language === 'ms' ? '> 100 Hektar • Harga Tersuai • Sokongan Dedikasi' : '> 100 Hectares • Custom Pricing • Dedicated Support'}
            </p>

            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
              {language === 'ms'
                ? 'Dapatkan penyelesaian tersuai untuk organisasi anda. Pasukan kami sedia membantu!'
                : 'Get custom solutions tailored for your organization. Our team is ready to help!'
              }
            </p>

            {/* Small Farmers Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="max-w-2xl mx-auto bg-gradient-to-r from-yellow-400/20 to-yellow-500/10 backdrop-blur-sm border-2 border-yellow-400/30 rounded-xl sm:rounded-2xl p-4 sm:p-6"
            >
              <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4">
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-white font-bold text-base sm:text-lg mb-1">
                    {language === 'ms' ? '🌾 Pekebun Kecil (< 100 Hektar)?' : '🌾 Small Farmers (< 100 Hectares)?'}
                  </h3>
                  <p className="text-white/70 text-xs sm:text-sm">
                    {language === 'ms' 
                      ? 'Beli terus dengan harga tetap'
                      : 'Buy directly with fixed prices'
                    }
                  </p>
                </div>
                <Link href="/pricing">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full md:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-yellow-400 text-green-900 rounded-full font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all duration-300 touch-manipulation whitespace-nowrap"
                  >
                    {language === 'ms' ? 'Lihat Harga' : 'View Pricing'}
                  </motion.button>
                </Link>
              </div>
            </motion.div>
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

