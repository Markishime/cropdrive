'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslation, getCurrentLanguage, setLanguage } from '@/i18n';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Settings, Globe, Bell, Shield, Key, Mail, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { updatePassword as firebaseUpdatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  
  const { user, loading: authLoading, signOut: authSignOut } = useAuth();
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

  const handleSaveNotifications = async () => {
    if (!user?.uid) return;
    
    setSaving(true);
    try {
      // Save notification preferences to Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        preferences: {
          notifications,
          emailNotifications
        },
        updatedAt: serverTimestamp()
      });

      toast.success(language === 'ms' ? '✓ Tetapan disimpan!' : '✓ Settings saved!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(language === 'ms' ? '✗ Ralat menyimpan tetapan' : '✗ Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(language === 'ms' ? 'Kata laluan tidak sepadan' : 'Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error(language === 'ms' ? 'Kata laluan mestilah sekurang-kurangnya 6 aksara' : 'Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error('User not authenticated');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, passwordForm.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await firebaseUpdatePassword(currentUser, passwordForm.newPassword);

      toast.success(language === 'ms' ? '✓ Kata laluan dikemas kini!' : '✓ Password updated!');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error(language === 'ms' ? '✗ Kata laluan semasa salah' : '✗ Current password is incorrect');
      } else {
        toast.error(language === 'ms' ? '✗ Ralat menukar kata laluan' : '✗ Error changing password');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = confirm(
      language === 'ms' 
        ? 'Adakah anda PASTI mahu memadam akaun anda? Tindakan ini tidak boleh dibatalkan dan semua data anda akan hilang.'
        : 'Are you SURE you want to delete your account? This action cannot be undone and all your data will be lost.'
    );

    if (!confirmDelete) return;

    const confirmAgain = confirm(
      language === 'ms'
        ? 'Klik OK untuk mengesahkan pemadaman akaun'
        : 'Click OK to confirm account deletion'
    );

    if (!confirmAgain) return;

    try {
      if (!user?.uid) throw new Error('User not found');
      
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');

      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', user.uid));

      // Delete user from Firebase Auth
      await deleteUser(currentUser);

      toast.success(language === 'ms' ? 'Akaun dipadam' : 'Account deleted');
      router.push('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error(language === 'ms' ? 'Sila log masuk semula untuk memadam akaun' : 'Please log in again to delete account');
        await authSignOut();
        router.push('/login');
      } else {
        toast.error(language === 'ms' ? '✗ Ralat memadam akaun' : '✗ Error deleting account');
      }
    }
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

                  <Button onClick={handleSaveNotifications} className="w-full" disabled={saving}>
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        {language === 'ms' ? 'Menyimpan...' : 'Saving...'}
                      </>
                    ) : (
                      language === 'ms' ? 'Simpan Tetapan' : 'Save Settings'
                    )}
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
                    <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
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
                    <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50" onClick={handleDeleteAccount}>
                      {language === 'ms' ? 'Padamkan Akaun' : 'Delete Account'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Password Change Modal */}
        <AnimatePresence>
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {language === 'ms' ? 'Tukar Kata Laluan' : 'Change Password'}
                  </h3>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ms' ? 'Kata Laluan Semasa' : 'Current Password'}
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ms' ? 'Kata Laluan Baharu' : 'New Password'}
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ms' ? 'Sahkan Kata Laluan' : 'Confirm Password'}
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="flex items-start space-x-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      {language === 'ms'
                        ? 'Kata laluan mestilah sekurang-kurangnya 6 aksara.'
                        : 'Password must be at least 6 characters long.'
                      }
                    </p>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <Button
                      onClick={() => setShowPasswordModal(false)}
                      variant="outline"
                      className="flex-1"
                      disabled={changingPassword}
                    >
                      {language === 'ms' ? 'Batal' : 'Cancel'}
                    </Button>
                    <Button
                      onClick={handleChangePassword}
                      className="flex-1"
                      disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    >
                      {changingPassword ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          {language === 'ms' ? 'Menukar...' : 'Changing...'}
                        </>
                      ) : (
                        language === 'ms' ? 'Tukar Kata Laluan' : 'Change Password'
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

