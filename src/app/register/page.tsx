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
        phoneNumber: formData.phone || undefined,
        farmName: formData.farmName || undefined,
        farmLocation: formData.farmLocation || undefined,
        language: formData.language as 'en' | 'ms',
      }, formData.language as 'en' | 'ms');

      // Success message is handled in the auth context
      router.push('/dashboard');
    } catch (error) {
      // Error is handled in the auth context
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

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
              {language === 'ms' ? 'Cipta Akaun' : 'Create Account'}
            </h2>
            <p className="text-gray-600">
              {language === 'ms'
                ? 'Sertai ribuan petani yang menggunakan AI untuk hasil yang lebih baik'
                : 'Join thousands of farmers using AI for better yields'
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
              <div className="grid grid-cols-1 gap-6">
                <Input
                  label={language === 'ms' ? 'Nama Penuh' : 'Full Name'}
                  placeholder={language === 'ms' ? 'Nama penuh anda' : 'Your full name'}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  disabled={loading}
                />

                <Input
                  type="email"
                  label={language === 'ms' ? 'Email' : 'Email'}
                  placeholder={language === 'ms' ? 'nama@email.com' : 'name@email.com'}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={loading}
                />

                <Input
                  type="tel"
                  label={language === 'ms' ? 'Nombor Telefon' : 'Phone Number'}
                  placeholder={language === 'ms' ? '+60123456789' : '+60123456789'}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={loading}
                />

                <Input
                  label={language === 'ms' ? 'Nama Ladang' : 'Farm Name'}
                  placeholder={language === 'ms' ? 'Nama ladang anda' : 'Your farm name'}
                  value={formData.farmName}
                  onChange={(e) => handleInputChange('farmName', e.target.value)}
                  disabled={loading}
                />

                <Input
                  label={language === 'ms' ? 'Lokasi Ladang' : 'Farm Location'}
                  placeholder={language === 'ms' ? 'Lokasi ladang anda' : 'Your farm location'}
                  value={formData.farmLocation}
                  onChange={(e) => handleInputChange('farmLocation', e.target.value)}
                  disabled={loading}
                />

                <Input
                  type="password"
                  label={language === 'ms' ? 'Kata Laluan' : 'Password'}
                  placeholder={language === 'ms' ? 'Kata laluan anda' : 'Your password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  disabled={loading}
                />

                <Input
                  type="password"
                  label={language === 'ms' ? 'Sahkan Kata Laluan' : 'Confirm Password'}
                  placeholder={language === 'ms' ? 'Sahkan kata laluan anda' : 'Confirm your password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  disabled={loading}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ms' ? 'Bahasa Pilihan' : 'Preferred Language'}
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                    disabled={loading}
                  >
                    <option value="ms">Bahasa Malaysia</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 mt-1"
                />
                <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                  {language === 'ms' ? 'Saya bersetuju dengan' : 'I agree to the'}{' '}
                  <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                    {language === 'ms' ? 'Syarat Perkhidmatan' : 'Terms of Service'}
                  </Link>{' '}
                  {language === 'ms' ? 'dan' : 'and'}{' '}
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                    {language === 'ms' ? 'Dasar Privasi' : 'Privacy Policy'}
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full"
              >
                {language === 'ms' ? 'Daftar' : 'Sign Up'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {language === 'ms' ? 'Sudah ada akaun?' : 'Already have an account?'}{' '}
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {language === 'ms' ? 'Log masuk di sini' : 'Sign in here'}
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
