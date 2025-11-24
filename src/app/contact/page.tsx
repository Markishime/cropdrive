'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import { Mail, Phone, MapPin, Clock, Globe, MessageSquare } from 'lucide-react';

export default function ContactUsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ms'>('en');
  const { language } = useTranslation(currentLanguage);

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

  if (!mounted) {
    return null;
  }

  const contactInfo = [
    {
      icon: Mail,
      title: language === 'ms' ? 'E-mel' : 'Email',
      content: 'contact@agriglobalsolutions.com',
      link: 'mailto:contact@agriglobalsolutions.com',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Phone,
      title: language === 'ms' ? 'Telefon' : 'Phone',
      content: '+60 12-345 6789',
      link: 'tel:+60123456789',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: MapPin,
      title: language === 'ms' ? 'Lokasi' : 'Location',
      content: 'Kuala Lumpur, Malaysia',
      link: null,
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Clock,
      title: language === 'ms' ? 'Waktu Perniagaan' : 'Business Hours',
      content: language === 'ms' ? 'Isnin - Jumaat, 9:00 - 18:00' : 'Monday - Friday, 9:00 AM - 6:00 PM',
      link: null,
      color: 'from-purple-500 to-purple-600'
    }
  ];

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-block text-yellow-400 text-5xl xs:text-6xl sm:text-7xl mb-4 xs:mb-6"
              >
                ✉️
              </motion.span>
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 xs:mb-6 sm:mb-8 leading-tight">
                {language === 'ms' ? 'Hubungi' : 'Contact'} <span className="text-yellow-400">{language === 'ms' ? 'Kami' : 'Us'}</span>
              </h1>
              <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                {language === 'ms'
                  ? 'Kami di sini untuk membantu anda. Hubungi kami melalui mana-mana saluran di bawah.'
                  : 'We\'re here to help you. Reach out to us through any of the channels below.'
                }
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-md h-80 xs:h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-yellow-400">
                <Image
                  src="/images/our_team_optimized.jpg"
                  alt={language === 'ms' ? 'Pasukan CropDrive' : 'CropDrive Team'}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
              {language === 'ms' ? 'Maklumat' : 'Contact'} <span className="text-green-700">{language === 'ms' ? 'Hubungan' : 'Information'}</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'ms'
                ? 'Pilih kaedah komunikasi yang paling sesuai untuk anda'
                : 'Choose the communication method that works best for you'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-green-200"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                  <info.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {info.title}
                </h3>
                {info.link ? (
                  <a
                    href={info.link}
                    className="text-green-700 hover:text-green-800 font-medium break-words transition-colors"
                  >
                    {info.content}
                  </a>
                ) : (
                  <p className="text-gray-700 font-medium">
                    {info.content}
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Member Support Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 sm:p-12 border-2 border-green-200 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-xl">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
                  {language === 'ms' ? '👤 Ahli CropDrive?' : '👤 CropDrive Member?'}
                </h3>
                <p className="text-lg text-gray-700 mb-4">
                  {language === 'ms'
                    ? 'Jika anda seorang ahli dengan pelan aktif, sila gunakan borang Sokongan dalam papan pemuka anda untuk mendapatkan bantuan keutamaan dengan had mesej bulanan anda.'
                    : 'If you\'re a member with an active plan, please use the Support form in your dashboard for priority assistance with your monthly message allowance.'
                  }
                </p>
                <a
                  href="/support"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <MessageSquare className="w-5 h-5" />
                  {language === 'ms' ? 'Pergi ke Sokongan Ahli' : 'Go to Member Support'}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-md border border-gray-200">
              <Globe className="w-5 h-5 text-green-600" />
              <span className="text-gray-700 font-medium">
                {language === 'ms' ? 'Sokongan dalam Bahasa Malaysia & English' : 'Support in Bahasa Malaysia & English'}
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
