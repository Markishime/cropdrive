'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { getPricingTierById, PRICING_TIERS, formatPrice } from '@/lib/subscriptions';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ms'>('en');
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const { language, t } = useTranslation(currentLanguage);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

  if (!mounted) {
    return null;
  }

  const handlePlanSelect = async (planId: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    try {
      setLoading(planId);

      // Get Firebase ID token
      const token = await (user as any).getIdToken();

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId,
          isYearly,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error(language === 'ms' ? 'Ralat membuat sesi pembayaran' : 'Error creating checkout session');
    } finally {
      setLoading(null);
    }
  };

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
              {language === 'ms' ? 'Harga Telus' : 'Transparent Pricing'}
            </motion.span>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              {language === 'ms' ? 'PILIH' : 'CHOOSE'} <span className="text-yellow-400">{language === 'ms' ? 'PELAN' : 'PLAN'}</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms'
                ? 'Harga telus tanpa yuran tersembunyi. Pilih pelan yang sesuai dengan keperluan ladang anda.'
                : 'Transparent pricing with no hidden fees. Choose the plan that fits your farm needs.'
              }
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-6 bg-white/10 backdrop-blur-sm rounded-full px-8 py-4 inline-flex">
              <span className={`text-lg font-bold ${!isYearly ? 'text-yellow-400' : 'text-white/70'}`}>
                {language === 'ms' ? 'BULANAN' : 'MONTHLY'}
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                  isYearly ? 'bg-yellow-400' : 'bg-white/30'
                }`}
              >
                <span
                  className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                    isYearly ? 'translate-x-11' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-lg font-bold ${isYearly ? 'text-yellow-400' : 'text-white/70'}`}>
                {language === 'ms' ? 'TAHUNAN' : 'YEARLY'}
              </span>
              {isYearly && (
                <span className="bg-yellow-400 text-green-900 text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider ml-4">
                  {language === 'ms' ? 'Jimat 20%' : 'Save 20%'}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PRICING_TIERS.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`relative ${tier.popular ? 'scale-105' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-yellow-400 text-green-900 px-6 py-3 rounded-full text-sm font-black uppercase tracking-wider shadow-xl">
                    {language === 'ms' ? 'Paling Popular' : 'Most Popular'}
                  </span>
                </div>
              )}

              <div className={`h-full bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 border-4 ${
                tier.popular ? 'border-yellow-400 transform scale-105' : 'border-gray-200'
              }`}>
                <div className={`p-8 ${tier.popular ? 'bg-gradient-to-br from-green-50 to-white' : ''}`}>
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-black text-gray-900 mb-3 uppercase tracking-wide">
                      {language === 'ms' ? tier.nameMs : tier.name}
                    </h3>
                    <p className="text-gray-600 mb-6 text-base font-medium">
                      {language === 'ms' ? tier.taglineMs : tier.tagline}
                    </p>

                    <div className="mb-6 bg-gradient-to-br from-green-700 to-green-900 rounded-lg p-6 text-white">
                      <div className="flex items-baseline justify-center">
                        <span className="text-6xl font-black text-yellow-400">
                          {isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                        </span>
                        <span className="text-2xl text-white/90 ml-2 font-bold">
                          RM
                        </span>
                      </div>
                      <p className="text-lg text-white/80 mt-2 font-medium">
                        {isYearly ? (language === 'ms' ? '/tahun' : '/year') : (language === 'ms' ? '/bulan' : '/month')}
                      </p>
                      {isYearly && (
                        <p className="text-sm text-yellow-300 mt-2 font-semibold">
                          (~RM{Math.round(tier.yearlyPrice / 12)}/{language === 'ms' ? 'bulan' : 'month'})
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      {language === 'ms'
                        ? 'Pembayaran diproses dalam euro (€). Harga RM untuk rujukan.'
                        : 'Payments processed in euros (€). RM prices for reference.'
                      }
                    </p>
                  </div>

                  <div className="space-y-4 mb-8 border-t border-gray-200 pt-6">
                    {(language === 'ms' ? tier.featuresMs : tier.features).map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <svg
                          className="w-6 h-6 text-yellow-500 mt-0.5 mr-3 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-800 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePlanSelect(tier.id)}
                    disabled={loading === tier.id}
                    className={`w-full py-4 rounded-lg font-bold uppercase text-sm tracking-wider transition-all duration-200 ${
                      tier.popular
                        ? 'bg-yellow-400 text-green-900 hover:bg-yellow-300 shadow-lg hover:shadow-xl'
                        : 'bg-green-700 text-white hover:bg-green-800'
                    } ${loading === tier.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading === tier.id
                      ? (language === 'ms' ? 'Memproses...' : 'Processing...')
                      : user
                        ? (language === 'ms' ? 'Mulakan Sekarang' : 'Get Started')
                        : (language === 'ms' ? 'Log Masuk' : 'Login to Start')
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Currency Note */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mb-16"
        >
          <div className="bg-gradient-to-br from-yellow-50 to-white border-4 border-yellow-200 rounded-xl p-8 max-w-4xl mx-auto shadow-lg">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <svg
                  className="w-6 h-6 text-green-900"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-wide">
                  {language === 'ms' ? 'Nota Pembayaran' : 'Payment Note'}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {language === 'ms'
                    ? 'Semua pembayaran diproses dengan selamat dalam euro (€) melalui Stripe. Harga dalam Ringgit Malaysia (RM) ditunjukkan untuk rujukan sahaja berdasarkan kadar pertukaran semasa. Anda akan dibilkan dalam euro.'
                    : 'All payments are processed securely in euros (€) through Stripe. Malaysian Ringgit (RM) prices are shown for reference only based on current exchange rates. You will be charged in euros.'
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        </div>
      </section>

      {/* ROI Example Section */}
      <section className="py-24 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-yellow-500 text-sm font-bold tracking-widest uppercase mb-4">
              {language === 'ms' ? 'Kajian Kes Sebenar' : 'Real-World Case Study'}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 uppercase">
              {language === 'ms' ? 'Ladang 100 Hektar' : '100-Hectare'} <span className="text-green-700">{language === 'ms' ? 'Kajian Kes' : 'Plantation Case Study'}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-6xl mx-auto">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-red-50 p-8 rounded-xl border-4 border-red-200 shadow-xl"
            >
              <div className="text-center mb-6">
                <span className="text-5xl mb-4 block">😟</span>
                <h3 className="text-2xl font-bold text-red-700 uppercase mb-2">
                  {language === 'ms' ? 'Sebelum AGS AI' : 'Before AGS AI'}
                </h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>{language === 'ms' ? 'Hasil semasa: 20 tan FFB/ha/tahun' : 'Current yield: 20 tonnes FFB/ha/year'}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>{language === 'ms' ? 'Hasil tahunan: RM 1.3 juta' : 'Annual revenue: RM 1.3 million'}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>{language === 'ms' ? 'Upah perunding: RM 8,000/tahun' : 'Hiring consultants: RM 8,000/year'}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>{language === 'ms' ? 'Analisis manual: 5 jam per laporan' : 'Manual analysis: 5 hours per report'}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>{language === 'ms' ? 'Pembaziran baja: ~25% lebihan aplikasi' : 'Fertilizer waste: ~25% overapplication'}</span>
                </li>
              </ul>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-green-50 p-8 rounded-xl border-4 border-green-400 shadow-xl"
            >
              <div className="text-center mb-6">
                <span className="text-5xl mb-4 block">😊</span>
                <h3 className="text-2xl font-bold text-green-700 uppercase mb-2">
                  {language === 'ms' ? 'Selepas AGS AI' : 'After AGS AI'}
                </h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="font-semibold">{language === 'ms' ? 'Hasil bertambah baik: 23 tan FFB/ha/tahun (+15%)' : 'Improved yield: 23 tonnes FFB/ha/year (+15%)'}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="font-semibold">{language === 'ms' ? 'Hasil tambahan: RM 195,000/tahun' : 'Additional revenue: RM 195,000/year'}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>{language === 'ms' ? 'Jimat perunding: RM 8,000/tahun' : 'Consultant savings: RM 8,000/year'}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>{language === 'ms' ? 'Masa analisis: 30 saat' : 'Analysis time: 30 seconds'}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>{language === 'ms' ? 'Baja optimum: 20% pengurangan kos' : 'Optimized fertilizer: 20% cost reduction'}</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* ROI Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-yellow-50 to-white p-10 rounded-2xl shadow-2xl border-4 border-yellow-400 max-w-4xl mx-auto"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center uppercase">
              {language === 'ms' ? 'Pelaburan & Pulangan' : 'Investment & Returns'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-sm text-gray-600 mb-2">{language === 'ms' ? 'Tempoh Pulang Modal' : 'Payback Period'}</p>
                <p className="text-4xl font-black text-green-700">18-24</p>
                <p className="text-gray-600">{language === 'ms' ? 'bulan' : 'months'}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-sm text-gray-600 mb-2">{language === 'ms' ? 'Keuntungan 5 Tahun' : '5-Year Total Profit'}</p>
                <p className="text-4xl font-black text-green-700">RM 800K+</p>
                <p className="text-gray-600">{language === 'ms' ? 'tambahan' : 'additional'}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <p className="text-sm text-gray-600 mb-2">{language === 'ms' ? 'Pulangan Pelaburan' : 'Return on Investment'}</p>
              <p className="text-5xl font-black text-green-700 mb-2">267%</p>
              <p className="text-gray-600">{language === 'ms' ? 'dalam 5 tahun' : 'over 5 years'}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Success Metrics Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 uppercase">
              {language === 'ms' ? 'Metrik' : 'Success'} <span className="text-green-700">{language === 'ms' ? 'Kejayaan' : 'Metrics'}</span>
            </h2>
            <p className="text-xl text-gray-600">
              {language === 'ms' ? 'Keputusan biasa selepas 18-24 bulan:' : 'Typical results after 18-24 months:'}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { value: '10-30%', label: language === 'ms' ? 'Peningkatan Hasil' : 'Yield Improvement' },
              { value: '20-30%', label: language === 'ms' ? 'Kurang Pembaziran Baja' : 'Reduced Fertilizer Waste' },
              { value: '80%', label: language === 'ms' ? 'Penjimatan Masa' : 'Time Savings' },
              { value: '100%', label: language === 'ms' ? 'Ketepatan Bertambah' : 'Accuracy Improvement' },
              { value: 'RM 5-10K', label: language === 'ms' ? 'Jimat Perunding/Tahun' : 'Consultant Savings/Year' },
              { value: '150-300%', label: language === 'ms' ? 'ROI 3-5 Tahun' : 'ROI in 3-5 Years' },
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl shadow-lg text-center border-2 border-green-200 hover:border-yellow-400 transition-all duration-300"
              >
                <p className="text-3xl font-black text-green-700 mb-2">{metric.value}</p>
                <p className="text-sm text-gray-700 font-medium">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-16">
              <span className="inline-block text-yellow-500 text-sm font-bold tracking-widest uppercase mb-4">
                {language === 'ms' ? 'Ada Soalan?' : 'Questions?'}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 uppercase">
                {language === 'ms' ? 'Soalan' : 'Frequently'} <span className="text-green-700">{language === 'ms' ? 'Lazim' : 'Asked'}</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {[
                {
                  question: language === 'ms' ? 'Bolehkah saya tukar pelan?' : 'Can I change plans?',
                  answer: language === 'ms'
                    ? 'Ya, anda boleh naik taraf atau turun taraf pelan anda pada bila-bila masa. Perubahan akan dipratakan secara automatik.'
                    : 'Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated automatically.',
                },
                {
                  question: language === 'ms' ? 'Adakah terdapat yuran tersembunyi?' : 'Are there any hidden fees?',
                  answer: language === 'ms'
                    ? 'Tidak, harga yang ditunjukkan adalah harga akhir. Tiada yuran persediaan, yuran transaksi, atau yuran tersembunyi.'
                    : 'No, the prices shown are final. There are no setup fees, transaction fees, or hidden charges.',
                },
                {
                  question: language === 'ms' ? 'Bolehkah saya batalkan langganan?' : 'Can I cancel my subscription?',
                  answer: language === 'ms'
                    ? 'Ya, anda boleh batalkan langganan anda pada bila-bila masa. Akses anda akan kekal sehingga akhir tempoh bil semasa.'
                    : 'Yes, you can cancel your subscription at any time. Your access will remain until the end of your current billing period.',
                },
                {
                  question: language === 'ms' ? 'Bagaimana dengan sokongan?' : 'What about support?',
                  answer: language === 'ms'
                    ? 'Kami menyediakan sokongan melalui WhatsApp dan email. Masa respons bergantung kepada pelan anda.'
                    : 'We provide support through WhatsApp and email. Response times depend on your plan.',
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border-2 border-green-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-green-900 via-green-800 to-green-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase">
              {language === 'ms' ? 'Sedia' : 'Ready'} <span className="text-yellow-400">{language === 'ms' ? 'Memulakan?' : 'to Start?'}</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {language === 'ms'
                ? 'Sertai ribuan petani Malaysia yang sudah menggunakan AI untuk hasil yang lebih baik.'
                : 'Join thousands of Malaysian farmers already using AI for better yields.'
              }
            </p>
            <Link href="/register">
              <button className="px-10 py-5 bg-yellow-400 text-green-900 rounded-lg font-bold uppercase text-base tracking-wider hover:bg-yellow-300 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105">
                {language === 'ms' ? 'Daftar Sekarang' : 'Get Started Now'}
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
