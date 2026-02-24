'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslation, getCurrentLanguage, setLanguage } from '@/i18n';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGear,
  faBell,
  faShieldHalved,
  faKey,
  faEnvelope,
  faCircleXmark,
  faCircleExclamation,
  faWandSparkles,
  faCircleCheck,
  faFloppyDisk,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { doc, updateDoc, deleteDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { updatePassword as firebaseUpdatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  const { user, loading: authLoading, signOut: authSignOut, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLang(lang);
  }, []);

  // Real-time data fetching from Firestore
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setUserData(data);
        
        // Update local state with real-time data
        if (data.preferences) {
          setNotifications(data.preferences.notifications ?? true);
          setEmailNotifications(data.preferences.emailNotifications ?? true);
        }
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const { language } = useTranslation(mounted ? currentLang : 'en');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);


  const handleSaveNotifications = async () => {
    if (!user?.uid) {
      toast.error(language === 'ms' ? 'Sesi tamat. Sila log masuk semula.' : 'Session expired. Please log in again.');
      return;
    }

    const toastId = toast.loading(language === 'ms' ? 'Menyimpan tetapan...' : 'Saving settings...');
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const existingPrefs = userData?.preferences || {};
      await updateDoc(userRef, {
        preferences: {
          ...existingPrefs,
          notifications,
          emailNotifications,
        },
        updatedAt: serverTimestamp(),
      });

      if (refreshUser) {
        await refreshUser();
      }

      toast.success(language === 'ms' ? 'Tetapan berjaya disimpan!' : 'Settings saved successfully!', { id: toastId });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(language === 'ms' ? 'Ralat menyimpan tetapan. Sila cuba lagi.' : 'Error saving settings. Please try again.', { id: toastId });
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

    if (!passwordForm.currentPassword.trim()) {
      toast.error(language === 'ms' ? 'Sila masukkan kata laluan semasa' : 'Please enter your current password');
      return;
    }

    const toastId = toast.loading(language === 'ms' ? 'Menukar kata laluan...' : 'Changing password...');
    setChangingPassword(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        toast.error(language === 'ms' ? 'Sesi tamat. Sila log masuk semula.' : 'Session expired. Please log in again.', { id: toastId });
        return;
      }

      const credential = EmailAuthProvider.credential(currentUser.email, passwordForm.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await firebaseUpdatePassword(currentUser, passwordForm.newPassword);

      toast.success(language === 'ms' ? 'Kata laluan berjaya dikemas kini!' : 'Password updated successfully!', { id: toastId });
      setShowPasswordModal(false);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error(language === 'ms' ? 'Kata laluan semasa salah' : 'Current password is incorrect', { id: toastId });
      } else if (error.code === 'auth/too-many-requests') {
        toast.error(language === 'ms' ? 'Terlalu banyak percubaan. Sila cuba lagi nanti.' : 'Too many attempts. Please try again later.', { id: toastId });
      } else {
        toast.error(language === 'ms' ? 'Ralat menukar kata laluan' : 'Error changing password', { id: toastId });
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccountClick = () => {
    setDeletePassword('');
    setShowDeleteModal(true);
  };

  const handleDeleteAccountConfirm = async () => {
    const currentUser = auth.currentUser;
    if (!user?.uid || !currentUser?.email) {
      toast.error(language === 'ms' ? 'Akaun tidak dijumpai' : 'User not found');
      return;
    }
    if (!deletePassword.trim()) {
      toast.error(language === 'ms' ? 'Sila masukkan kata laluan anda untuk mengesahkan' : 'Please enter your password to confirm');
      return;
    }

    const toastId = toast.loading(language === 'ms' ? 'Memadam akaun...' : 'Deleting account...');
    setDeletingAccount(true);

    try {
      // Re-authenticate first so Firebase allows delete (avoids auth/requires-recent-login)
      const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Delete Firestore user document first, then Firebase Auth user
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(currentUser);

      setDeletePassword('');
      setShowDeleteModal(false);
      toast.success(language === 'ms' ? 'Akaun berjaya dipadam' : 'Account deleted successfully', { id: toastId });
      router.push('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error(language === 'ms' ? 'Sila log masuk semula untuk memadam akaun' : 'Please log in again to delete account', { id: toastId });
        await authSignOut();
        setShowDeleteModal(false);
        router.push('/login');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        toast.error(language === 'ms' ? 'Kata laluan tidak betul' : 'Incorrect password', { id: toastId });
      } else {
        toast.error(language === 'ms' ? 'Ralat memadam akaun. Sila cuba lagi.' : 'Error deleting account. Please try again.', { id: toastId });
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  if (authLoading || !user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">
              {language === 'ms' ? 'Memuatkan...' : 'Loading...'}
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        {/* Hero Header - Matching Dashboard Style */}
        <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-12 sm:py-16 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-dot-grid" aria-hidden />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <motion.span
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-block text-yellow-400 text-sm font-bold tracking-widest uppercase bg-white/10 px-4 py-2 rounded-full border border-yellow-400/30"
                >
                  {language === 'ms' ? 'Tetapan' : 'Settings'}
                </motion.span>
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight"
              >
                {language === 'ms' ? 'Urus Akaun Anda' : 'Manage Your Account'}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg sm:text-xl text-white/90 max-w-2xl flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faWandSparkles} className="w-5 h-5 text-yellow-400" />
                {language === 'ms' ? 'Tetapan dan keutamaan akaun anda' : 'Your account settings and preferences'}
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Settings Content */}
        <section className="py-8 -mt-12 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {/* Notification Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faBell} className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      {language === 'ms' ? 'Notifikasi' : 'Notifications'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {language === 'ms' ? 'Kawal pemberitahuan anda' : 'Control your notifications'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">
                        {language === 'ms' ? 'Notifikasi Push' : 'Push Notifications'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {language === 'ms' 
                          ? 'Terima notifikasi untuk analisis selesai dan kemas kini'
                          : 'Receive notifications for completed analysis and updates'
                        }
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer" htmlFor="push-notifications">
                      <span className="sr-only">{language === 'ms' ? 'Notifikasi Push' : 'Push Notifications'}</span>
                      <input
                        id="push-notifications"
                        type="checkbox"
                        checked={notifications}
                        onChange={(e) => setNotifications(e.target.checked)}
                        className="sr-only peer"
                        aria-label={language === 'ms' ? 'Notifikasi Push' : 'Push Notifications'}
                      />
                      <span className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600 block" aria-hidden />
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">
                        {language === 'ms' ? 'Notifikasi Email' : 'Email Notifications'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {language === 'ms' 
                          ? 'Terima email untuk laporan bulanan dan petua'
                          : 'Receive emails for monthly reports and tips'
                        }
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer" htmlFor="email-notifications">
                      <span className="sr-only">{language === 'ms' ? 'Notifikasi Email' : 'Email Notifications'}</span>
                      <input
                        id="email-notifications"
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="sr-only peer"
                        aria-label={language === 'ms' ? 'Notifikasi Email' : 'Email Notifications'}
                      />
                      <span className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600 block" aria-hidden />
                    </label>
                  </div>

                  <Button 
                    onClick={handleSaveNotifications} 
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-lg" 
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        {language === 'ms' ? 'Menyimpan...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faFloppyDisk} className="w-4 h-4 mr-2" />
                        {language === 'ms' ? 'Simpan Tetapan' : 'Save Settings'}
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>

              {/* Security Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faShieldHalved} className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      {language === 'ms' ? 'Keselamatan' : 'Security'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {language === 'ms' ? 'Lindungi akaun anda' : 'Protect your account'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">
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
              </motion.div>

              {/* Account Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-xl border-2 border-red-200 hover:shadow-2xl transition-all"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faCircleExclamation} className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-red-900">
                      {language === 'ms' ? 'Zon Bahaya' : 'Danger Zone'}
                    </h2>
                    <p className="text-sm text-red-700">
                      {language === 'ms' 
                        ? 'Tindakan tidak boleh dibatalkan'
                        : 'Irreversible actions'
                      }
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="font-bold text-red-900 mb-2">
                    {language === 'ms' ? 'Padamkan Akaun' : 'Delete Account'}
                  </p>
                  <p className="text-sm text-red-700 mb-4">
                    {language === 'ms' 
                      ? 'Tindakan ini tidak boleh dibatalkan. Sila pastikan anda pasti sebelum meneruskan.'
                      : 'This action cannot be undone. Please be certain before proceeding.'
                    }
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-red-600 text-red-600 hover:bg-red-50 font-bold" 
                    onClick={handleDeleteAccountClick}
                    disabled={deletingAccount}
                  >
                    {deletingAccount
                      ? (language === 'ms' ? 'Memadam...' : 'Deleting...')
                      : (language === 'ms' ? 'Padamkan Akaun' : 'Delete Account')}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Password Change Modal */}
        <AnimatePresence>
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-gray-900">
                    {language === 'ms' ? 'Tukar Kata Laluan' : 'Change Password'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setShowCurrentPassword(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                      if (passwordForm.currentPassword || passwordForm.newPassword || passwordForm.confirmPassword) {
                        toast(language === 'ms' ? 'Perubahan dibatalkan' : 'Changes discarded');
                      }
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600 transition"
                    aria-label={language === 'ms' ? 'Tutup' : 'Close'}
                    title={language === 'ms' ? 'Tutup' : 'Close'}
                  >
                    <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" aria-hidden />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {language === 'ms' ? 'Kata Laluan Semasa' : 'Current Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label={showCurrentPassword ? (language === 'ms' ? 'Sembunyikan' : 'Hide') : (language === 'ms' ? 'Tunjuk' : 'Show')}
                      >
                        {showCurrentPassword ? (
                          <FontAwesomeIcon icon={faEyeSlash} className="w-5 h-5" />
                        ) : (
                          <FontAwesomeIcon icon={faEye} className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {language === 'ms' ? 'Kata Laluan Baharu' : 'New Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label={showNewPassword ? (language === 'ms' ? 'Sembunyikan' : 'Hide') : (language === 'ms' ? 'Tunjuk' : 'Show')}
                      >
                        {showNewPassword ? (
                          <FontAwesomeIcon icon={faEyeSlash} className="w-5 h-5" />
                        ) : (
                          <FontAwesomeIcon icon={faEye} className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {language === 'ms' ? 'Sahkan Kata Laluan' : 'Confirm Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label={showConfirmPassword ? (language === 'ms' ? 'Sembunyikan' : 'Hide') : (language === 'ms' ? 'Tunjuk' : 'Show')}
                      >
                        {showConfirmPassword ? (
                          <FontAwesomeIcon icon={faEyeSlash} className="w-5 h-5" />
                        ) : (
                          <FontAwesomeIcon icon={faEye} className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                    <FontAwesomeIcon icon={faCircleExclamation} className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      {language === 'ms'
                        ? 'Kata laluan mestilah sekurang-kurangnya 6 aksara.'
                        : 'Password must be at least 6 characters long.'
                      }
                    </p>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <Button
                      onClick={() => {
                        setShowPasswordModal(false);
                        setShowCurrentPassword(false);
                        setShowNewPassword(false);
                        setShowConfirmPassword(false);
                        if (passwordForm.currentPassword || passwordForm.newPassword || passwordForm.confirmPassword) {
                          toast(language === 'ms' ? 'Perubahan dibatalkan' : 'Changes discarded');
                        }
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      variant="outline"
                      className="flex-1"
                      disabled={changingPassword}
                    >
                      {language === 'ms' ? 'Batal' : 'Cancel'}
                    </Button>
                    <Button
                      onClick={handleChangePassword}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 font-bold"
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

        {/* Delete Account Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  if (!deletingAccount) {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                  }
                }}
                aria-hidden="true"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-red-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faCircleExclamation} className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-black text-red-900">
                      {language === 'ms' ? 'Padamkan Akaun?' : 'Delete Account?'}
                    </h3>
                  </div>
                  <button
                    onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }}
                    className="text-gray-400 hover:text-gray-600 transition"
                    aria-label={language === 'ms' ? 'Tutup' : 'Close'}
                    title={language === 'ms' ? 'Tutup' : 'Close'}
                    disabled={deletingAccount}
                  >
                    <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-sm font-bold text-red-900 mb-2">
                      {language === 'ms'
                        ? '⚠️ Tindakan ini tidak boleh dibatalkan dan semua data anda akan hilang.'
                        : '⚠️ This action cannot be undone and all your data will be lost.'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {language === 'ms' ? 'Kata laluan anda (untuk mengesahkan)' : 'Your password (to confirm)'}
                    </label>
                    <div className="relative">
                      <input
                        type={showDeletePassword ? 'text' : 'password'}
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder={language === 'ms' ? 'Kata laluan' : 'Password'}
                        disabled={deletingAccount}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none disabled:opacity-50 pr-10"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        tabIndex={-1}
                        title={showDeletePassword ? (language === 'ms' ? 'Sembunyikan kata laluan' : 'Hide password') : (language === 'ms' ? 'Tunjuk kata laluan' : 'Show password')}
                        aria-label={showDeletePassword ? (language === 'ms' ? 'Sembunyikan kata laluan' : 'Hide password') : (language === 'ms' ? 'Tunjuk kata laluan' : 'Show password')}
                      >
                        <FontAwesomeIcon icon={showDeletePassword ? faEyeSlash : faEye} className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <Button
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeletePassword('');
                        toast(language === 'ms' ? 'Pemadaman dibatalkan' : 'Deletion cancelled');
                      }}
                      variant="outline"
                      className="flex-1"
                      disabled={deletingAccount}
                    >
                      {language === 'ms' ? 'Batal' : 'Cancel'}
                    </Button>
                    <Button
                      onClick={handleDeleteAccountConfirm}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 font-bold text-white"
                      disabled={deletingAccount}
                    >
                      {deletingAccount ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          {language === 'ms' ? 'Memadam...' : 'Deleting...'}
                        </>
                      ) : (
                        language === 'ms' ? 'Ya, Padamkan' : 'Yes, Delete'
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
