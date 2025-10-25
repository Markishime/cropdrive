'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslation, getCurrentLanguage, setLanguage } from '@/i18n';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Settings, Globe, Bell, Shield, Key, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLang(lang);
    
    // Load user preferences
    if (user?.preferences) {
      setNotifications(user.preferences.notifications ?? true);
    }
  }, [user]);

  const { language } = useTranslation(currentLang);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleLanguageChange = (newLang: 'en' | 'ms') => {
    setLanguage(newLang);
    toast.success(language === 'ms' ? 'Bahasa ditukar!' : 'Language changed!');
  };

  const handleSaveNotifications = () => {
    // Save notification preferences
    toast.success(language === 'ms' ? 'Tetapan disimpan!' : 'Settings saved!');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">
            {language === 'ms' ? 'Memuatkan...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {language === 'ms' ? 'Tetapan' : 'Settings'}
              </h1>
              <p className="text-gray-600">
                {language === 'ms' ? 'Urus akaun dan keutamaan anda' : 'Manage your account and preferences'}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Language Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  <span>{language === 'ms' ? 'Bahasa' : 'Language'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {language === 'ms' 
                      ? 'Pilih bahasa pilihan anda untuk paparan aplikasi' 
                      : 'Choose your preferred language for the application'
                    }
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`flex-1 px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
                        language === 'en'
                          ? 'border-green-600 bg-green-50 text-green-700 font-semibold'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => handleLanguageChange('ms')}
                      className={`flex-1 px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
                        language === 'ms'
                          ? 'border-green-600 bg-green-50 text-green-700 font-semibold'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      Bahasa Malaysia
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-green-600" />
                  <span>{language === 'ms' ? 'Notifikasi' : 'Notifications'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {language === 'ms' ? 'Notifikasi Push' : 'Push Notifications'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {language === 'ms' 
                          ? 'Terima notifikasi untuk analisis selesai dan kemas kini'
                          : 'Receive notifications for completed analysis and updates'
                        }
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications}
                        onChange={(e) => setNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {language === 'ms' ? 'Notifikasi Email' : 'Email Notifications'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {language === 'ms' 
                          ? 'Terima email untuk laporan bulanan dan petua'
                          : 'Receive emails for monthly reports and tips'
                        }
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <Button onClick={handleSaveNotifications} className="w-full">
                    {language === 'ms' ? 'Simpan Tetapan' : 'Save Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>{language === 'ms' ? 'Keselamatan' : 'Security'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {language === 'ms' ? 'Pengesahan Dua Faktor' : 'Two-Factor Authentication'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {language === 'ms' 
                          ? 'Tambah lapisan keselamatan tambahan ke akaun anda'
                          : 'Add an extra layer of security to your account'
                        }
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      {language === 'ms' ? 'Dayakan' : 'Enable'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {language === 'ms' ? 'Tukar Kata Laluan' : 'Change Password'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {language === 'ms' 
                          ? 'Kemas kini kata laluan anda secara berkala'
                          : 'Update your password regularly'
                        }
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      {language === 'ms' ? 'Tukar' : 'Change'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="w-5 h-5 text-green-600" />
                  <span>{language === 'ms' ? 'Akaun' : 'Account'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-medium text-red-900 mb-2">
                      {language === 'ms' ? 'Zon Bahaya' : 'Danger Zone'}
                    </p>
                    <p className="text-sm text-red-700 mb-4">
                      {language === 'ms' 
                        ? 'Tindakan ini tidak boleh dibatalkan. Sila pastikan anda pasti sebelum meneruskan.'
                        : 'These actions cannot be undone. Please be certain before proceeding.'
                      }
                    </p>
                    <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                      {language === 'ms' ? 'Padamkan Akaun' : 'Delete Account'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

