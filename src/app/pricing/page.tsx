'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { auth } from '@/lib/firebase';
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
  const { user, refreshUser } = useAuth();
  
  // Get user's current plan (none means no plan purchased yet)
  const currentUserPlan = user?.plan || 'none';
  // Get user's billing cycle to show current plan indicator correctly
  const userBillingCycle = user?.billingCycle || 'monthly';
  
  // Check if current plan should be shown based on billing cycle toggle
  const isCurrentPlanVisible = (tierId: string) => {
    if (!user || currentUserPlan === 'none') return false;
    if (tierId !== currentUserPlan) return false;
    // Only show "current plan" when the toggle matches the user's actual billing cycle
    return (isYearly && userBillingCycle === 'yearly') || (!isYearly && userBillingCycle === 'monthly');
  };

  // Refresh user data when component mounts (in case returning from purchase)
  useEffect(() => {
    if (mounted && refreshUser && user) {
      console.log('🔄 Checking for plan updates on pricing page...');
      refreshUser();
    }
  }, [mounted, user?.uid]); // Only refresh when mounted or user changes

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleStorageChange = () => {
      const lang = getCurrentLanguage();
      setCurrentLanguage(lang);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


  if (!mounted) {
    return null;
  }
  
  // Helper function to determine button text and styling
  const getPlanButtonInfo = (tierId: string) => {
    if (!user) {
      return {
        text: language === 'ms' ? 'Log Masuk' : 'Login to Start',
        className: 'bg-green-700 text-white hover:bg-green-800',
        disabled: false,
      };
    }
    
    // Only show "Current Plan" when plan matches AND billing cycle matches
    if (isCurrentPlanVisible(tierId)) {
      return {
        text: language === 'ms' ? '✓ Pelan Semasa' : '✓ Current Plan',
        className: 'bg-gray-300 text-gray-600 cursor-not-allowed',
        disabled: true,
      };
    }
    
    // If user has no plan, show "Get Started" or "Choose Plan"
    if (currentUserPlan === 'none') {
      return {
        text: language === 'ms' ? '🛒 Beli Pelan' : '🛒 Buy Plan',
        className: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 font-bold shadow-lg',
        disabled: false,
      };
    }
    
    // If same plan but different billing cycle, show switch option
    if (currentUserPlan === tierId) {
      const switchText = isYearly 
        ? (language === 'ms' ? '🔄 Tukar ke Tahunan' : '🔄 Switch to Yearly')
        : (language === 'ms' ? '🔄 Tukar ke Bulanan' : '🔄 Switch to Monthly');
      return {
        text: switchText,
        className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 font-bold shadow-lg',
        disabled: false,
      };
    }
    
    // Tier comparison - using actual plan IDs
    const tierOrder = ['none', 'start', 'smart', 'precision'];
    const currentIndex = tierOrder.indexOf(currentUserPlan);
    const targetIndex = tierOrder.indexOf(tierId);
    
    if (targetIndex > currentIndex) {
      return {
        text: language === 'ms' ? '⬆️ Naik Taraf' : '⬆️ Upgrade',
        className: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 hover:from-yellow-500 hover:to-yellow-600 font-bold shadow-lg',
        disabled: false,
      };
    } else {
      return {
        text: language === 'ms' ? '⬇️ Turun Taraf' : '⬇️ Downgrade',
        className: 'bg-gray-600 text-white hover:bg-gray-700',
        disabled: false,
      };
    }
  };

  const handlePlanSelect = async (planId: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    try {
      setLoading(planId);

      // Get Firebase ID token from the current Firebase Auth user
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        toast.error(language === 'ms' ? 'Sesi tamat. Sila log masuk semula.' : 'Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }

      const token = await firebaseUser.getIdToken();
      console.log('Got Firebase ID token');

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
        const errorData = await response.json();
        console.error('Checkout error response:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        console.log('Redirecting to Stripe checkout:', url);
        // Show loading toast
        toast.loading(
          language === 'ms'
            ? '🔄 Mengalihkan ke Stripe...'
            : '🔄 Redirecting to Stripe...',
          { duration: 2000 }
        );
        // Redirect to Stripe checkout in the same window
        setTimeout(() => {
          window.location.href = url;
        }, 500);
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error.message || 'Unknown error';
      toast.error(
        language === 'ms' 
          ? `Ralat: ${errorMessage}` 
          : `Error: ${errorMessage}`
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-dot-grid"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Different header for logged-in vs non-logged-in users */}
            {user && currentUserPlan !== 'none' ? (
              <>
                <motion.span
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-block text-yellow-400 text-sm font-bold tracking-widest uppercase mb-6"
                >
                  {language === 'ms' ? '✓ Anda Pengguna Aktif' : '✓ Active Subscriber'}
                </motion.span>

                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
                  {language === 'ms' ? 'URUS' : 'MANAGE'} <span className="text-yellow-400">{language === 'ms' ? 'PELAN' : 'PLAN'}</span>
                </h1>

                <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                  {language === 'ms'
                    ? 'Lihat pelan anda atau naik taraf untuk lebih banyak ciri.'
                    : 'Review your plan or upgrade for more features.'
                  }
                </p>
              </>
            ) : (
              <>
                <motion.span
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-block text-yellow-400 text-sm font-bold tracking-widest uppercase mb-6"
                >
                  {language === 'ms' ? '🌾 Untuk Pekebun Kecil' : '🌾 For Farmers'}
                </motion.span>

                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
                  {language === 'ms' ? 'PILIH' : 'CHOOSE'} <span className="text-yellow-400">{language === 'ms' ? 'PELAN' : 'PLAN'}</span>
                </h1>

                <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                  {language === 'ms'
                    ? 'Harga telus tanpa yuran tersembunyi. Sertai sekarang dan dapatkan akses segera!'
                    : 'Transparent pricing with no hidden fees. Join us now and get instant access!'
                  }
                </p>
              </>
            )}

            {/* Organizations Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="max-w-2xl mx-auto bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border-2 border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8"
            >
              <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4">
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-white font-bold text-base sm:text-lg mb-1">
                    {language === 'ms' ? '🏢 Organisasi?' : '🏢 Organizations?'}
                  </h3>
                  <p className="text-white/70 text-xs sm:text-sm">
                    {language === 'ms' 
                      ? 'Dapatkan harga tersuai dan sokongan dedikasi'
                      : 'Get custom pricing and dedicated support'
                    }
                  </p>
                </div>
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full md:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-green-900 rounded-full font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all duration-300 touch-manipulation whitespace-nowrap"
                  >
                    {language === 'ms' ? 'Hubungi Kami' : 'Contact Us'}
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Billing Toggle */}
            <div className="inline-flex items-center justify-center space-x-6 bg-white/10 backdrop-blur-sm rounded-full px-8 py-4">
              <span className={`text-lg font-bold ${!isYearly ? 'text-yellow-400' : 'text-white/70'}`}>
                {language === 'ms' ? 'BULANAN' : 'MONTHLY'}
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                aria-label={isYearly ? (language === 'ms' ? 'Tukar ke bil bulanan' : 'Switch to monthly billing') : (language === 'ms' ? 'Tukar ke bil tahunan' : 'Switch to yearly billing')}
                title={isYearly ? (language === 'ms' ? 'Tukar ke bil bulanan' : 'Switch to monthly billing') : (language === 'ms' ? 'Tukar ke bil tahunan' : 'Switch to yearly billing')}
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
      <section id="pricing-plans" className="py-24 bg-gray-50">
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
              
              {isCurrentPlanVisible(tier.id) && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide shadow-xl whitespace-nowrap">
                    {language === 'ms' ? '✓ PELAN ANDA' : '✓ YOUR CURRENT PLAN'}
                  </span>
                </div>
              )}

              <div className={`h-full bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 border-4 ${
                isCurrentPlanVisible(tier.id) ? 'border-green-600 transform scale-105 pt-4' : tier.popular ? 'border-yellow-400 transform scale-105 pt-4' : 'border-gray-200'
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
                      {/* MYR Price */}
                      <div className="flex items-baseline justify-center mb-4">
                        <span className="text-6xl font-black text-yellow-400">
                          {isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                        </span>
                        <span className="text-2xl text-white/90 ml-2 font-bold">
                          RM
                        </span>
                      </div>

                      <p className="text-lg text-white/80 mt-3 font-medium">
                        {isYearly ? (language === 'ms' ? '/tahun' : '/year') : (language === 'ms' ? '/bulan' : '/month')}
                      </p>
                      {isYearly && (
                        <p className="text-sm text-yellow-300 mt-2 font-semibold">
                          (~RM{Math.round(tier.yearlyPrice / 12)}/{language === 'ms' ? 'bulan' : 'month'})
                        </p>
                      )}
                    </div>
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

                  {(() => {
                    const buttonInfo = getPlanButtonInfo(tier.id);
                    return (
                      <button
                        onClick={() => handlePlanSelect(tier.id)}
                        disabled={loading === tier.id || buttonInfo.disabled}
                        className={`w-full py-4 rounded-lg font-bold uppercase text-sm tracking-wider transition-all duration-200 ${
                          buttonInfo.className
                        } ${loading === tier.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loading === tier.id
                          ? (language === 'ms' ? 'Memproses...' : 'Processing...')
                          : buttonInfo.text
                        }
                      </button>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>


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
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {language === 'ms' ? 'Keputusan Ladang Kelapa Sawit dengan' : 'Oil Palm Plantation Results with'} <span className="text-green-700">CropDrive™</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-6xl mx-auto">
            {/* Before CropDrive */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-red-50 p-8 rounded-xl border-4 border-red-200 shadow-xl overflow-hidden"
            >
              <div className="mb-6">
                <img 
                  src="/images/Before-Cropdrive.jpg" 
                  alt={language === 'ms' ? 'Sebelum CropDrive' : 'Before CropDrive'}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="text-center">
                  <span className="text-5xl mb-4 block">😟</span>
                  <h3 className="text-2xl font-bold text-red-700 uppercase mb-2">
                    {language === 'ms' ? 'Sebelum CropDrive™' : 'Before CropDrive™'}
                  </h3>
                </div>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li>
                  <span>{language === 'ms' ? 'Hasil: 20 tan FFB/ha/tahun' : 'Yield: 20 tonnes FFB/ha/year'}</span>
                </li>
                <li>
                  <span>{language === 'ms' ? 'Yuran perunding: RM 4,000 setahun' : 'Consultant fees: RM 4,000 per year'}</span>
                </li>
                <li>
                  <span>{language === 'ms' ? 'Masa analisis: 2 hari setiap laporan' : 'Analysis time: 2 days per report'}</span>
                </li>
                <li>
                  <span>{language === 'ms' ? 'Baja: pembaziran tinggi' : 'Fertilizer: high wastage'}</span>
                </li>
                <li>
                  <span>{language === 'ms' ? 'Perancangan nutrien: tidak jelas dan manual' : 'Nutrient planning: unclear and manual'}</span>
                </li>
              </ul>
            </motion.div>

            {/* After CropDrive */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-green-50 p-8 rounded-xl border-4 border-green-400 shadow-xl overflow-hidden"
            >
              <div className="mb-6">
                <img 
                  src="/images/After-Cropdrive.jpg" 
                  alt={language === 'ms' ? 'Selepas CropDrive' : 'After CropDrive'}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="text-center">
                  <span className="text-5xl mb-4 block">😊</span>
                  <h3 className="text-2xl font-bold text-green-700 uppercase mb-2">
                    {language === 'ms' ? 'Selepas CropDrive™' : 'After CropDrive™'}
                  </h3>
                </div>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'ms' ? 'Hasil: 28 tan FFB/ha/tahun (+40% berbanding asas)' : 'Yield: 28 tonnes FFB/ha/year (+40% vs baseline)'}</span>
                </li>
                <li>
                  <span className="font-semibold">{language === 'ms' ? 'Yuran perunding: tiada yuran agronomi rutin' : 'Consultant fees: no routine agronomy fees'}</span>
                </li>
                <li>
                  <span>{language === 'ms' ? 'Masa analisis: 10–15 minit setiap laporan' : 'Analysis time: 10–15 minutes per report'}</span>
                </li>
                <li>
                  <span>{language === 'ms' ? 'Pembaziran baja: pengurangan 20%' : 'Fertilizer wastage: 20% reduction'}</span>
                </li>
                <li>
                  <span>{language === 'ms' ? 'Perancangan nutrien: tepat, konsisten dan tepat' : 'Nutrient planning: precise, consistent and accurate'}</span>
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
                  question: language === 'ms' ? 'Bolehkah saya batalkan langganan bulanan?' : 'Can I cancel my monthly subscription?',
                  answer: language === 'ms'
                    ? 'Ya. Anda boleh batalkan pada bila-bila masa. Walau bagaimanapun, tempoh langganan minimum ialah satu tahun, jadi anda masih perlu membayar sehingga akhir tahun semasa anda.'
                    : 'Yes. You can cancel any time. However, the minimum subscription period is one year, so you will still pay until the end of your current year.',
                },
                {
                  question: language === 'ms' ? 'Bolehkah saya batalkan langganan tahunan?' : 'Can I cancel my yearly subscription?',
                  answer: language === 'ms'
                    ? 'Ya. Anda boleh batalkan pada bila-bila masa. Anda akan terus mempunyai akses ke akaun anda sehingga akhir tahun bil semasa.'
                    : 'Yes. You can cancel any time. You will keep access to your account until the end of your current billing year.',
                },
                {
                  question: language === 'ms' ? 'Bagaimana dengan sokongan?' : 'What about support?',
                  answer: language === 'ms'
                    ? 'Hantar mesej atau emel kepada kami. Kami akan membalas secepat mungkin.'
                    : 'Send us a message or an email. We respond as soon as possible.',
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

      {/* CTA Section - Only show for non-logged-in users or users without a plan */}
      {(!user || currentUserPlan === 'none') && (
        <section className="relative py-24 bg-gradient-to-br from-green-900 via-green-800 to-green-900 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-dot-grid"></div>
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
              {!user ? (
                <Link href="/register">
                  <button className="px-10 py-5 bg-yellow-400 text-green-900 rounded-lg font-bold uppercase text-base tracking-wider hover:bg-yellow-300 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105">
                    {language === 'ms' ? 'Daftar Sekarang' : 'Get Started Now'}
                  </button>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    const pricingSection = document.getElementById('pricing-plans');
                    if (pricingSection) {
                      pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="px-10 py-5 bg-yellow-400 text-green-900 rounded-lg font-bold uppercase text-base tracking-wider hover:bg-yellow-300 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  {language === 'ms' ? 'Pilih Pelan Di Atas' : 'Choose Plan Above'}
                </button>
              )}
            </motion.div>
          </div>
        </section>
      )}
      
      {/* For logged-in users with a plan, show different CTA */}
      {user && currentUserPlan !== 'none' && (
        <section className="relative py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-dot-grid"></div>
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
                {language === 'ms' ? 'Sedia' : 'Ready'} <span className="text-yellow-400">{language === 'ms' ? 'Menganalisis?' : 'to Analyze?'}</span>
              </h2>
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
                {language === 'ms'
                  ? 'Anda sudah mempunyai pelan aktif. Mula muat naik laporan makmal anda sekarang!'
                  : 'You already have an active plan. Start uploading your lab reports now!'
                }
              </p>
              <Link href="/assistant">
                <button className="px-10 py-5 bg-yellow-400 text-blue-900 rounded-lg font-bold uppercase text-base tracking-wider hover:bg-yellow-300 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105">
                  {language === 'ms' ? '🤖 Mulakan Analisis' : '🤖 Start Analysis'}
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
