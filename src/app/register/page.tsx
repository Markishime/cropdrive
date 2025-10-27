'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/i18n';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

// Hide navbar for this page
export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    farmName: '',
    farmLocation: '',
    password: '',
    confirmPassword: '',
    language: 'ms',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const { signUp, user, loading: authLoading } = useAuth();
  const { language, t } = useTranslation();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return language === 'ms' ? 'Nama penuh diperlukan' : 'Full name is required';
    }
    if (!formData.email.trim()) {
      return language === 'ms' ? 'Email diperlukan' : 'Email is required';
    }
    if (!formData.password) {
      return language === 'ms' ? 'Kata laluan diperlukan' : 'Password is required';
    }
    if (formData.password.length < 6) {
      return language === 'ms' ? 'Kata laluan mestilah sekurang-kurangnya 6 aksara' : 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      return language === 'ms' ? 'Kata laluan tidak sepadan' : 'Passwords do not match';
    }
    if (!agreeToTerms) {
      return language === 'ms' ? 'Sila bersetuju dengan syarat perkhidmatan' : 'Please agree to the terms of service';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setLoading(true);

      await signUp({
        email: formData.email,
        password: formData.password,
        displayName: formData.name,
        phoneNumber: formData.phone,
        farmName: formData.farmName,
        farmLocation: formData.farmLocation,
        language: formData.language as 'ms' | 'en',
      }, language);

      // Show success message
      toast.success(
        language === 'ms' 
          ? '🎉 Akaun berjaya dibuat! Mengalihkan ke halaman log masuk...' 
          : '🎉 Account created successfully! Redirecting to login...',
        {
          duration: 4000,
          style: {
            background: '#22c55e',
            color: '#fff',
            fontWeight: 'bold',
            padding: '16px 24px',
            borderRadius: '12px',
          },
        }
      );
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      // Error already handled by signUp function with toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        nav { display: none !important; }
        footer { display: none !important; }
      `}</style>
      
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-32 left-20 w-40 h-40 bg-green-400/20 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="max-w-2xl w-full space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          >
            <div className="text-center">
              <Link href="/" className="inline-flex items-center justify-center space-x-3 mb-8 group">
                <motion.div 
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all p-3"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src="/images/CropDrive.png"
                    alt="CropDrive Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                    priority
                  />
                </motion.div>
                <span className="font-black text-3xl text-white font-heading">
                  CropDrive<span className="text-yellow-400">™</span>
                </span>
              </Link>

              <motion.h2 
                className="text-4xl font-black text-white mb-3 font-heading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {language === 'ms' ? 'Cipta Akaun Baru' : 'Create New Account'}
              </motion.h2>
              <motion.p 
                className="text-green-100 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {language === 'ms'
                  ? 'Sertai ribuan petani yang menggunakan AI untuk hasil yang lebih baik'
                  : 'Join thousands of farmers using AI for better yields'
                }
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {language === 'ms' ? 'Nama Penuh' : 'Full Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'ms' ? 'Nama penuh anda' : 'Your full name'}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-200 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {language === 'ms' ? 'Email' : 'Email'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder={language === 'ms' ? 'nama@email.com' : 'name@email.com'}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-200 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {language === 'ms' ? 'Nombor Telefon' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    placeholder={language === 'ms' ? '+60123456789' : '+60123456789'}
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-200 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {language === 'ms' ? 'Nama Ladang' : 'Farm Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'ms' ? 'Nama ladang anda' : 'Your farm name'}
                    value={formData.farmName}
                    onChange={(e) => handleInputChange('farmName', e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-200 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {language === 'ms' ? 'Lokasi Ladang' : 'Farm Location'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'ms' ? 'Lokasi ladang anda' : 'Your farm location'}
                    value={formData.farmLocation}
                    onChange={(e) => handleInputChange('farmLocation', e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-200 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="language-select" className="block text-sm font-bold text-gray-700 mb-2">
                    {language === 'ms' ? 'Bahasa Pilihan' : 'Preferred Language'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="language-select"
                    name="language"
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-200 transition-all outline-none bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={language === 'ms' ? 'Bahasa Pilihan' : 'Preferred Language'}
                  >
                    <option value="ms">Bahasa Malaysia</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {language === 'ms' ? 'Kata Laluan' : 'Password'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={language === 'ms' ? 'Kata laluan anda' : 'Your password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-200 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {language === 'ms' ? 'Sahkan Kata Laluan' : 'Confirm Password'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={language === 'ms' ? 'Sahkan kata laluan' : 'Confirm password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-200 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 mt-1 cursor-pointer"
                />
                <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                  {language === 'ms' ? 'Saya bersetuju dengan' : 'I agree to the'}{' '}
                  <Link href="/terms" className="text-green-700 hover:text-green-800 font-bold">
                    {language === 'ms' ? 'Syarat Perkhidmatan' : 'Terms of Service'}
                  </Link>
                  {' '}{language === 'ms' ? 'dan' : 'and'}{' '}
                  <Link href="/privacy" className="text-green-700 hover:text-green-800 font-bold">
                    {language === 'ms' ? 'Dasar Privasi' : 'Privacy Policy'}
                  </Link>
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={loading || !agreeToTerms}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-black py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    {language === 'ms' ? 'Mencipta Akaun...' : 'Creating Account...'}
                  </span>
                ) : (
                  language === 'ms' ? 'Cipta Akaun' : 'Create Account'
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {language === 'ms' ? 'Sudah mempunyai akaun?' : 'Already have an account?'}{' '}
                <Link
                  href="/login"
                  className="text-green-700 hover:text-green-800 font-bold transition-colors"
                >
                  {language === 'ms' ? 'Log masuk di sini' : 'Sign in here'}
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center"
          >
            <Link href="/" className="inline-flex items-center text-white/80 hover:text-white font-semibold transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {language === 'ms' ? 'Kembali ke Laman Utama' : 'Back to Home'}
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}
