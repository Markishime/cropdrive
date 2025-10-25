'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';

export default function GetStartedOrganizationsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ms'>('en');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your interest! Our team will contact you shortly.');
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
            <div className="inline-block bg-yellow-400 text-green-900 px-6 py-2 rounded-full font-bold mb-8 uppercase tracking-wide text-sm">
              {language === 'ms' ? 'Untuk Organisasi' : 'For Organizations'}
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight font-heading">
              {language === 'ms' ? 'CropDrive™ Bekerja dengan' : 'CropDrive™ Working with'}<br />
              <span className="text-yellow-400">{language === 'ms' ? 'Organisasi' : 'Organizations'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
              {language === 'ms'
                ? 'CropDrive™ bekerjasama dengan organisasi komersial dan bukan komersial yang menyokong atau melayani petani. Penyelesaian agronomi digital kami menukar data makmal kepada pandangan yang jelas dan boleh diambil tindakan yang meningkatkan produktiviti, kecekapan, dan kemampanan jangka panjang.'
                : 'CropDrive™ works with commercial and non-commercial organizations that support or serve farmers. Our digital agronomy solutions turn laboratory data into clear, actionable insights that improve productivity, efficiency, and long-term sustainability.'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Working with Our Partners Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-heading">
              {language === 'ms' ? 'Bekerja dengan' : 'Working with'} <span className="text-green-700">{language === 'ms' ? 'Rakan Kongsi Kami' : 'Our Partners'}</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              {language === 'ms'
                ? 'Setiap organisasi mempunyai matlamat dan keadaan operasi sendiri. Kami bekerjasama dengan setiap rakan kongsi secara individu untuk membangunkan penyelesaian yang sesuai dengan keperluan dan aliran kerja mereka yang tepat.'
                : 'Every organization has its own goals and operating conditions. We work with each partner individually to develop solutions that fit their exact needs and workflow.'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Commercial Organizations Section */}
      <section className="py-24 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-heading">
              {language === 'ms' ? 'Untuk Organisasi' : 'For Commercial'} <span className="text-green-700">{language === 'ms' ? 'Komersial' : 'Organizations'}</span>
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              {language === 'ms'
                ? '(Ladang, perniagaan agri, pembekal baja, dan makmal)'
                : '(Plantations, agribusinesses, fertilizer suppliers, and laboratories)'
              }
            </p>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed max-w-4xl">
              {language === 'ms'
                ? 'Perkhidmatan kami secara langsung meningkatkan pendapatan dan daya saing pasaran. Dengan mengintegrasikan analisis CropDrive™ ke dalam operasi sedia ada anda, anda boleh:'
                : 'Our services directly increase revenue and market competitiveness. By integrating CropDrive™ analysis into your existing operations, you can:'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '💎',
                title: language === 'ms' ? 'Tambah Nilai yang Boleh Diukur' : 'Add measurable value',
                desc: language === 'ms' ? 'Tambahkan nilai yang boleh diukur kepada produk dan perkhidmatan anda sendiri' : 'Add measurable value to your own products and services'
              },
              {
                icon: '🤝',
                title: language === 'ms' ? 'Tingkatkan Kepercayaan Pelanggan' : 'Improve customer trust',
                desc: language === 'ms' ? 'Tingkatkan kepercayaan dan pengekalan pelanggan' : 'Improve customer trust and retention'
              },
              {
                icon: '🎯',
                title: language === 'ms' ? 'Beza dengan Sains' : 'Differentiate with science',
                desc: language === 'ms' ? 'Bezakan syarikat anda dengan cadangan berasaskan sains yang dikaitkan terus dengan penggunaan produk anda' : 'Differentiate your company with science-based recommendations that link directly to your product use'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 font-heading">
                  {item.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Non-Commercial Organizations Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-heading">
              {language === 'ms' ? 'Untuk Organisasi' : 'For Non-Commercial'} <span className="text-green-700">{language === 'ms' ? 'Bukan Komersial' : 'Organizations'}</span>
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              {language === 'ms'
                ? '(Agensi kerajaan, NGO, program pembangunan, dan organisasi antarabangsa)'
                : '(Government agencies, NGOs, development programs, and international organizations)'
              }
            </p>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed max-w-4xl">
              {language === 'ms'
                ? 'Kami mengukuhkan jangkauan anda kepada komuniti pertanian dengan menyampaikan perkhidmatan sambungan digital berdasarkan data yang berpatutan. CropDrive™ membantu program anda:'
                : 'We strengthen your outreach to farming communities by delivering affordable, data-based digital extension services. CropDrive™ helps your programs:'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🌍',
                title: language === 'ms' ? 'Jangkau Lebih Ramai Petani' : 'Reach more farmers',
                desc: language === 'ms' ? 'Jangkau lebih ramai petani dengan cekap' : 'Reach more farmers efficiently'
              },
              {
                icon: '✅',
                title: language === 'ms' ? 'Panduan Agronomi Tepat' : 'Accurate guidance',
                desc: language === 'ms' ? 'Berikan panduan agronomi yang tepat dan konsisten' : 'Provide accurate, consistent agronomic guidance'
              },
              {
                icon: '🎯',
                title: language === 'ms' ? 'Sokong Sasaran Nasional' : 'Support targets',
                desc: language === 'ms' ? 'Sokong sasaran nasional dan penderma untuk produktiviti dan kemampanan' : 'Support national and donor targets for productivity and sustainability'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 font-heading">
                  {item.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us Section with Form */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-heading">
              {language === 'ms' ? 'Hubungi' : 'Contact'} <span className="text-green-700">{language === 'ms' ? 'Kami' : 'Us'}</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-4">
              {language === 'ms'
                ? 'Setiap organisasi adalah berbeza. Beritahu kami tentang organisasi anda supaya kami boleh mereka bentuk penyelesaian yang sesuai dengan matlamat anda. Sama ada anda ingin mengukuhkan jangkauan petani, menambah nilai kepada produk anda, atau meningkatkan kecekapan lapangan, pasukan kami akan menyesuaikan perkhidmatan CropDrive™ kepada keperluan khusus anda.'
                : 'Every organization is different. Tell us about yours so we can design a solution that fits your goals. Whether you want to strengthen farmer outreach, add value to your products, or improve field efficiency, our team will tailor CropDrive™ services to your specific needs.'
              }
            </p>
            <p className="text-lg text-gray-700 mb-2">
              {language === 'ms'
                ? 'Hubungi kami dan kami akan bekerjasama dengan anda untuk mencipta hasil yang boleh diukur untuk organisasi anda.'
                : 'Get in touch with us and we will work with you to create measurable results for your organization.'
              }
            </p>
            <p className="text-lg text-gray-600">
              {language === 'ms' ? 'Isi borang atau hantar mesej kepada kami di:' : 'Fill out the form or send us a message at:'}{' '}
              <a href="mailto:contact@cropdrive.com" className="text-green-700 font-bold hover:text-green-800">
                contact@cropdrive.com
              </a>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
          >
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

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Organisasi' : 'Organization'}
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Lokasi atau Alamat' : 'Location or address'}
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Telefon' : 'Phone'}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="http://"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {language === 'ms' ? 'Mesej Anda' : 'Your message'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  rows={6}
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder={language === 'ms' ? 'Beritahu kami tentang organisasi anda dan bagaimana kami boleh membantu...' : 'Tell us about your organization and how we can help...'}
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

