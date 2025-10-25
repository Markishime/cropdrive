'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface LoginPageClientProps {
  locale: string;
}

export default function LoginPageClient({ locale }: LoginPageClientProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-palm-500 via-palm-600 to-gold-600 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 -right-20 w-96 h-96 bg-gold-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-2xl"
        />
      </div>

      {/* Login Container with Glassmorphism */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href={`/${locale}`} className="inline-flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl border border-white/30"
            >
              <Leaf className="w-8 h-8 text-white drop-shadow-lg" />
            </motion.div>
            <div className="text-left">
              <h1 className="text-3xl font-black text-white drop-shadow-lg">CropDrive</h1>
              <p className="text-sm font-semibold text-gold-200">OP Advisor™</p>
            </div>
          </Link>
        </motion.div>

        {/* Glassmorphism Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
        >
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
              Welcome Back
            </h2>
            <p className="text-sm text-white/80">
              Sign in to access your farm dashboard
            </p>
          </div>

          {/* Error Message with Glassmorphism */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-xl flex items-start space-x-3"
              >
                <AlertCircle className="w-5 h-5 text-red-200 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-100">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field with Glassmorphism */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white mb-3">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-xl"></div>
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 z-10" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="relative z-10 w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all backdrop-blur-sm"
                  placeholder="farmer@example.com"
                />
              </div>
            </div>

            {/* Password Field with Glassmorphism */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-xl"></div>
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 z-10" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="relative z-10 w-full pl-12 pr-14 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all backdrop-blur-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <Link
                href={`/${locale}/forgot-password`}
                className="text-sm font-semibold text-white/90 hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button with Glassmorphism */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-base font-bold text-palm-900 bg-white/90 backdrop-blur-sm shadow-2xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 border border-white/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider with Glassmorphism */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/80 font-medium">Don't have an account?</span>
            </div>
          </div>

          {/* Register Link with Glassmorphism */}
          <Link href={`/${locale}/register`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl text-base font-bold text-white bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 transition-all duration-300"
            >
              Create Free Account
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust Indicators with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-col items-center space-y-3"
        >
          <div className="flex items-center space-x-2 text-sm text-white/90 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <CheckCircle2 className="w-4 h-4" />
            <span>Secure login with encryption</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-white/90 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <CheckCircle2 className="w-4 h-4" />
            <span>Trusted by 500+ farmers</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
