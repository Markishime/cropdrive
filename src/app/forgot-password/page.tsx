'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

// Hide navbar for this page
export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { language } = useTranslation();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(language === 'ms' ? 'Sila masukkan email anda' : 'Please enter your email');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      toast.success(
        language === 'ms' 
          ? 'Pautan set semula kata laluan telah dihantar ke email anda'
          : 'Password reset link sent to your email'
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error(language === 'ms' ? 'Email tidak dijumpai' : 'Email not found');
      } else if (error.code === 'auth/invalid-email') {
        toast.error(language === 'ms' ? 'Email tidak sah' : 'Invalid email');
      } else {
        toast.error(language === 'ms' ? 'Ralat berlaku. Sila cuba lagi.' : 'An error occurred. Please try again.');
      }
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
          className="absolute top-20 left-20 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-green-400/20 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="max-w-md w-full space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          >
            <div className="text-center">
              <Link href="/" className="inline-flex items-center justify-center space-x-3 mb-8 group">
                <motion.div 
                  className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-yellow-400/50 transition-all"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-8 h-8 text-green-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4 C9 6, 7 9, 6 12" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4 C15 6, 17 9, 18 12" />
                    <rect x="11" y="12" width="2" height="9" rx="0.5" fill="currentColor"/>
                  </svg>
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
                {language === 'ms' ? 'Set Semula Kata Laluan' : 'Reset Password'}
              </motion.h2>
              <motion.p 
                className="text-green-100 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {language === 'ms'
                  ? 'Masukkan email anda untuk menerima pautan set semula'
                  : 'Enter your email to receive a reset link'
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
            {emailSent ? (
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                >
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {language === 'ms' ? 'Email Dihantar!' : 'Email Sent!'}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'ms'
                      ? 'Kami telah menghantar pautan set semula kata laluan ke'
                      : 'We have sent a password reset link to'
                    }
                  </p>
                  <p className="text-green-700 font-bold mt-2">{email}</p>
                  <p className="text-gray-600 mt-4 text-sm">
                    {language === 'ms'
                      ? 'Sila semak peti masuk anda dan klik pada pautan untuk set semula kata laluan anda.'
                      : 'Please check your inbox and click on the link to reset your password.'
                    }
                  </p>
                </div>

                <div className="space-y-3">
                  <Link href="/login" className="block w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-black py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl uppercase tracking-wide text-center">
                    {language === 'ms' ? 'Kembali ke Log Masuk' : 'Back to Sign In'}
                  </Link>
                  
                  <button
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                    }}
                    className="block w-full text-gray-600 hover:text-gray-800 font-semibold transition-colors"
                  >
                    {language === 'ms' ? 'Cuba email lain' : 'Try another email'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {language === 'ms' ? 'Alamat Email' : 'Email Address'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder={language === 'ms' ? 'nama@email.com' : 'name@email.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-200 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-black py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      {language === 'ms' ? 'Menghantar...' : 'Sending...'}
                    </span>
                  ) : (
                    language === 'ms' ? 'Hantar Pautan Set Semula' : 'Send Reset Link'
                  )}
                </motion.button>
              </form>
            )}

            {!emailSent && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {language === 'ms' ? 'Ingat kata laluan anda?' : 'Remember your password?'}{' '}
                  <Link
                    href="/login"
                    className="text-green-700 hover:text-green-800 font-bold transition-colors"
                  >
                    {language === 'ms' ? 'Log masuk di sini' : 'Sign in here'}
                  </Link>
                </p>
              </div>
            )}
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

