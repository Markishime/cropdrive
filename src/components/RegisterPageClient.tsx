'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile } from '@/lib/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Tractor,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface RegisterPageClientProps {
  locale: string;
}

export default function RegisterPageClient({ locale }: RegisterPageClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    farmName: '',
    farmLocation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await sendEmailVerification(userCredential.user);
      await createUserProfile(userCredential.user.uid, {
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        farmName: formData.farmName,
        farmLocation: formData.farmLocation,
      } as any);

      setSuccess(true);
      await auth.signOut();

      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 3000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-palm-500 via-palm-600 to-gold-600 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-20 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute bottom-20 right-10 w-80 h-80 bg-gold-300/20 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-md w-full"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/30"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>

            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Welcome to CropDrive! 🎉
            </h2>
            
            <p className="text-lg text-white/90 mb-6">
              Check your email to verify your account and start analyzing your farm!
            </p>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-white/90">
                📧 Verification email sent to:<br />
                <span className="font-semibold break-all">{formData.email}</span>
              </p>
            </div>

            <p className="text-sm text-white/80">Redirecting to login...</p>
            <Loader2 className="w-6 h-6 text-white animate-spin mx-auto mt-4" />
          </div>
        </motion.div>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-palm-500 via-palm-600 to-gold-600 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 -right-20 w-96 h-96 bg-gold-300/20 rounded-full blur-3xl"
        />
      </div>

      {/* Register Container */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href={`/${locale}`} className="inline-flex items-center space-x-3">
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

        {/* Glassmorphism Register Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 max-h-[80vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
              Start Your Free Trial
            </h2>
            <p className="text-sm text-white/80">
              Join 500+ farmers boosting yields with AI
            </p>
          </div>

          {/* Error Message */}
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

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 z-10" />
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="relative z-10 w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all backdrop-blur-sm"
                    placeholder="Ahmad bin Ali"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 z-10" />
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="relative z-10 w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all backdrop-blur-sm"
                    placeholder="+60 12-345 6789"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 z-10" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="relative z-10 w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all backdrop-blur-sm"
                  placeholder="farmer@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Password *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 z-10" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="relative z-10 w-full pl-12 pr-14 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all backdrop-blur-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-white/70">Minimum 6 characters</p>
            </div>

            {/* Farm Info */}
            <div className="pt-5 border-t border-white/20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <Tractor className="w-5 h-5" />
                <span>Farm Details</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Farm Name *</label>
                  <div className="relative">
                    <Leaf className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 z-10" />
                    <input
                      name="farmName"
                      type="text"
                      value={formData.farmName}
                      onChange={handleChange}
                      required
                      className="relative z-10 w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all backdrop-blur-sm"
                      placeholder="Ladang Kelapa Sawit"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 z-10" />
                    <input
                      name="farmLocation"
                      type="text"
                      value={formData.farmLocation}
                      onChange={handleChange}
                      required
                      className="relative z-10 w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all backdrop-blur-sm"
                      placeholder="Johor, Malaysia"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <p className="text-xs text-white/80">
                By creating an account, you agree to our{' '}
                <Link href={`/${locale}/terms`} className="text-gold-200 hover:text-gold-100 font-semibold underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href={`/${locale}/privacy`} className="text-gold-200 hover:text-gold-100 font-semibold underline">
                  Privacy Policy
                </Link>
              </p>
            </div>

            {/* Submit */}
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/80">Already have an account?</span>
            </div>
          </div>

          <Link href={`/${locale}/login`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl text-base font-bold text-white bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 transition-all duration-300"
            >
              Sign In
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-col items-center space-y-3"
        >
          <div className="flex items-center space-x-2 text-sm text-white/90 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <CheckCircle2 className="w-4 h-4" />
            <span>Free trial - No credit card required</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-white/90 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <CheckCircle2 className="w-4 h-4" />
            <span>Trusted by 500+ Malaysian farmers</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
