'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import Button from './ui/Button';
import toast from 'react-hot-toast';

export default function ForgotPasswordClient() {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ms'>('en');
  const { language } = useTranslation(currentLanguage);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      toast.success(
        language === 'ms'
          ? 'E-mel set semula kata laluan telah dihantar!'
          : 'Password reset email sent!'
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      let errorMessage = language === 'ms'
        ? 'Gagal menghantar e-mel. Sila cuba lagi.'
        : 'Failed to send email. Please try again.';

      if (error.code === 'auth/user-not-found') {
        errorMessage = language === 'ms'
          ? 'Tiada akaun dengan e-mel ini.'
          : 'No account found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = language === 'ms'
          ? 'E-mel tidak sah.'
          : 'Invalid email address.';
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
              {language === 'ms' ? 'LUPA' : 'FORGOT'} <span className="text-yellow-400">{language === 'ms' ? 'KATA LALUAN' : 'PASSWORD'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              {language === 'ms'
                ? 'Masukkan e-mel anda dan kami akan menghantar pautan untuk set semula kata laluan anda.'
                : 'Enter your email and we\'ll send you a link to reset your password.'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl shadow-2xl p-8 border-4 border-yellow-400"
          >
            {!emailSent ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-700 to-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                    {language === 'ms' ? 'Set Semula Kata Laluan' : 'Reset Password'}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                      {language === 'ms' ? 'Alamat E-mel' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
                      placeholder={language === 'ms' ? 'anda@contoh.com' : 'you@example.com'}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-yellow-400 text-green-900 rounded-lg font-bold uppercase text-sm tracking-wider hover:bg-yellow-300 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? (language === 'ms' ? 'Menghantar...' : 'Sending...')
                      : (language === 'ms' ? 'Hantar Pautan Set Semula' : 'Send Reset Link')
                    }
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="text-green-700 hover:text-green-900 font-medium transition-colors duration-200"
                  >
                    ← {language === 'ms' ? 'Kembali ke Log Masuk' : 'Back to Login'}
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === 'ms' ? 'E-mel Dihantar!' : 'Email Sent!'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {language === 'ms'
                    ? 'Sila semak peti mel anda untuk pautan set semula kata laluan.'
                    : 'Please check your inbox for a password reset link.'
                  }
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  {language === 'ms'
                    ? 'Tidak terima e-mel? Semak folder spam anda.'
                    : 'Didn\'t receive an email? Check your spam folder.'
                  }
                </p>
                <Link
                  href="/login"
                  className="inline-block px-6 py-3 bg-green-700 text-white rounded-lg font-bold uppercase text-sm tracking-wider hover:bg-green-800 transition-all duration-200"
                >
                  {language === 'ms' ? 'Kembali ke Log Masuk' : 'Back to Login'}
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

