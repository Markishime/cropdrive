'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/i18n';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { signIn, user, loading: authLoading } = useAuth();
  const { language, t } = useTranslation();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error(language === 'ms' ? 'Sila isi semua maklumat' : 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password, language);

      // Check if remember me is checked
      if (rememberMe) {
        localStorage.setItem('cropdrive-remember-email', email);
      } else {
        localStorage.removeItem('cropdrive-remember-email');
      }

      router.push('/dashboard');
    } catch (error) {
      // Error is handled in the auth context
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('cropdrive-remember-email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="font-bold text-2xl text-gray-900">
                CropDrive OP Advisor<sup className="text-sm">™</sup>
              </span>
            </Link>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'ms' ? 'Selamat Kembali' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600">
              {language === 'ms'
                ? 'Log masuk ke akaun CropDrive anda'
                : 'Sign in to your CropDrive account'
              }
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="email"
                  label={language === 'ms' ? 'Email' : 'Email'}
                  placeholder={language === 'ms' ? 'nama@email.com' : 'name@email.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Input
                  type="password"
                  label={language === 'ms' ? 'Kata Laluan' : 'Password'}
                  placeholder={language === 'ms' ? 'Kata laluan anda' : 'Your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {language === 'ms' ? 'Ingat saya' : 'Remember me'}
                  </span>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {language === 'ms' ? 'Lupa Kata Laluan?' : 'Forgot Password?'}
                </Link>
              </div>

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full"
              >
                {language === 'ms' ? 'Log Masuk' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {language === 'ms' ? 'Tiada akaun?' : "Don't have an account?"}{' '}
                <Link
                  href="/register"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {language === 'ms' ? 'Daftar di sini' : 'Sign up here'}
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Additional Options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                {language === 'ms' ? 'atau' : 'or'}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/">
              <Button variant="ghost" className="w-full">
                {language === 'ms' ? 'Kembali ke Laman Utama' : 'Back to Home'}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
