'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/ProtectedRoute';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, XCircle, Leaf, Sparkles, TrendingUp, Upload, Award, Activity, Camera, Shield, Key, AlertCircle, Bell, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { doc, updateDoc, deleteDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, auth, storage } from '@/lib/firebase';
import { updateProfile as firebaseUpdateProfile, updatePassword as firebaseUpdatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { getPlanById } from '@/lib/subscriptions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AnimatePresence } from 'framer-motion';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    farmName: '',
    farmLocation: '',
    farmSize: '',
  });
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  
  // Security states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [verifying2FA, setVerifying2FA] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);
  
  // Notification states
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [savingNotifications, setSavingNotifications] = useState(false);
  
  // Delete account states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  
  const { user, loading: authLoading, refreshUser, signOut: authSignOut } = useAuth();
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
        
        // Update form data with real-time data
        setFormData({
          displayName: data.displayName || user.displayName || '',
          phoneNumber: data.phoneNumber || '',
          farmName: data.farmName || '',
          farmLocation: data.farmLocation || '',
          farmSize: data.farmSize || '',
        });
        
        // Set profile picture if available
        if (data.profilePictureUrl) {
          setProfilePicture(data.profilePictureUrl);
        }
        
        // Set 2FA status
        setTwoFactorEnabled(data.twoFactorEnabled || false);
        
        // Set notification preferences
        if (data.preferences) {
          setNotifications(data.preferences.notifications ?? true);
          setEmailNotifications(data.preferences.emailNotifications ?? true);
        }
      }
    });

    return () => unsubscribe();
  }, [user?.uid, user?.displayName]);

  const { language } = useTranslation(mounted ? currentLang : 'en');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(language === 'ms' ? 'Sila pilih fail imej sahaja' : 'Please select an image file only');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'ms' ? 'Saiz fail terlalu besar. Maksimum 5MB' : 'File size too large. Maximum 5MB');
      return;
    }

    setProfilePictureFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPicture = async () => {
    if (!user?.uid || !profilePictureFile) return;

    setUploadingPicture(true);
    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `profile-pictures/${user.uid}/${Date.now()}_${profilePictureFile.name}`);
      await uploadBytes(storageRef, profilePictureFile);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        profilePictureUrl: downloadURL,
        updatedAt: serverTimestamp()
      });

      // Update Firebase Auth profile photo
      const currentUser = auth.currentUser;
      if (currentUser) {
        await firebaseUpdateProfile(currentUser, {
          photoURL: downloadURL
        });
      }

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }

      toast.success(language === 'ms' ? '✓ Gambar profil dikemas kini!' : '✓ Profile picture updated!');
      setProfilePictureFile(null);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error(language === 'ms' ? '✗ Ralat memuat naik gambar' : '✗ Error uploading picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    
    setSaving(true);
    try {
      // Upload profile picture if there's a new file
      if (profilePictureFile) {
        await handleUploadPicture();
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        phoneNumber: formData.phoneNumber,
        farmName: formData.farmName,
        farmLocation: formData.farmLocation,
        farmSize: formData.farmSize,
        updatedAt: serverTimestamp()
      });

      // Update display name in Firebase Auth if changed
      if (formData.displayName !== user.displayName) {
        const currentUser = auth.currentUser;
        if (currentUser) {
          await firebaseUpdateProfile(currentUser, {
            displayName: formData.displayName
          });
          
          await updateDoc(userRef, {
            displayName: formData.displayName
          });
        }
      }

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }

      toast.success(language === 'ms' ? '✓ Profil dikemas kini!' : '✓ Profile updated!');
      setIsEditing(false);
      setProfilePictureFile(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(language === 'ms' ? '✗ Ralat mengemas kini profil' : '✗ Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        displayName: userData.displayName || user?.displayName || '',
        phoneNumber: userData.phoneNumber || '',
        farmName: userData.farmName || '',
        farmLocation: userData.farmLocation || '',
        farmSize: userData.farmSize || '',
      });
      // Reset profile picture to original
      setProfilePicture(userData.profilePictureUrl || null);
      setProfilePictureFile(null);
    }
    setIsEditing(false);
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

      const credential = EmailAuthProvider.credential(currentUser.email, passwordForm.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await firebaseUpdatePassword(currentUser, passwordForm.newPassword);

      toast.success(language === 'ms' ? '✓ Kata laluan dikemas kini!' : '✓ Password updated!');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error(language === 'ms' ? '✗ Kata laluan semasa salah' : '✗ Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        toast.error(language === 'ms' ? '✗ Kata laluan terlalu lemah' : '✗ Password is too weak');
      } else {
        toast.error(language === 'ms' ? '✗ Ralat menukar kata laluan' : '✗ Error changing password');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSetup2FA = async () => {
    try {
      // Generate a secret for the user
      const secret = authenticator.generateSecret();
      setTwoFactorSecret(secret);
      
      // Create the OTP Auth URL
      const serviceName = 'CropDrive';
      const accountName = user?.email || 'user';
      const otpAuthUrl = authenticator.keyuri(accountName, serviceName, secret);
      
      // Generate QR code
      const qrCode = await QRCode.toDataURL(otpAuthUrl);
      setQrCodeUrl(qrCode);
      setShow2FASetup(true);
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast.error(language === 'ms' ? '✗ Ralat menyediakan 2FA' : '✗ Error setting up 2FA');
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFactorSecret || !twoFactorCode) {
      toast.error(language === 'ms' ? 'Sila masukkan kod' : 'Please enter code');
      return;
    }

    setVerifying2FA(true);
    try {
      // Verify the code
      const isValid = authenticator.check(twoFactorCode, twoFactorSecret);
      
      if (!isValid) {
        toast.error(language === 'ms' ? '✗ Kod tidak sah' : '✗ Invalid code');
        return;
      }

      // Save 2FA secret to Firestore
      if (!user?.uid) throw new Error('User not found');
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        twoFactorEnabled: true,
        twoFactorSecret: twoFactorSecret,
        updatedAt: serverTimestamp()
      });

      setTwoFactorEnabled(true);
      setShow2FASetup(false);
      setTwoFactorSecret(null);
      setQrCodeUrl(null);
      setTwoFactorCode('');
      
      toast.success(language === 'ms' ? '✓ 2FA didayakan!' : '✓ 2FA enabled!');
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast.error(language === 'ms' ? '✗ Ralat mengesahkan 2FA' : '✗ Error verifying 2FA');
    } finally {
      setVerifying2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    const confirmDisable = confirm(
      language === 'ms'
        ? 'Adakah anda pasti mahu mematikan 2FA? Akaun anda akan kurang selamat.'
        : 'Are you sure you want to disable 2FA? Your account will be less secure.'
    );

    if (!confirmDisable) return;

    setDisabling2FA(true);
    try {
      if (!user?.uid) throw new Error('User not found');
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        updatedAt: serverTimestamp()
      });

      setTwoFactorEnabled(false);
      toast.success(language === 'ms' ? '✓ 2FA dimatikan' : '✓ 2FA disabled');
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error(language === 'ms' ? '✗ Ralat mematikan 2FA' : '✗ Error disabling 2FA');
    } finally {
      setDisabling2FA(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!user?.uid) return;
    
    setSavingNotifications(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        preferences: {
          notifications,
          emailNotifications
        },
        updatedAt: serverTimestamp()
      });

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }

      toast.success(language === 'ms' ? '✓ Tetapan notifikasi disimpan!' : '✓ Notification settings saved!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error(language === 'ms' ? '✗ Ralat menyimpan tetapan' : '✗ Error saving settings');
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleDeleteAccount = async () => {
    const expectedText = language === 'ms' ? 'PADAM' : 'DELETE';
    if (deleteConfirmText !== expectedText) {
      toast.error(
        language === 'ms' 
          ? 'Sila taip "PADAM" untuk mengesahkan'
          : 'Please type "DELETE" to confirm'
      );
      return;
    }

    setDeletingAccount(true);
    try {
      if (!user?.uid) throw new Error('User not found');
      
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');

      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', user.uid));

      // Delete user from Firebase Auth
      await deleteUser(currentUser);

      toast.success(language === 'ms' ? 'Akaun dipadam' : 'Account deleted');
      
      // Sign out and redirect
      if (authSignOut) {
        await authSignOut();
      }
      router.push('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error(language === 'ms' ? 'Sila log masuk semula untuk memadam akaun' : 'Please log in again to delete account');
        if (authSignOut) {
          await authSignOut();
        }
        router.push('/login');
      } else {
        toast.error(language === 'ms' ? '✗ Ralat memadam akaun' : '✗ Error deleting account');
      }
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
      setDeleteConfirmText('');
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

  const userPlan = (user.plan && user.plan !== 'none') ? getPlanById(user.plan) : null;
  const daysActive = userData?.registrationDate 
    ? Math.floor((Date.now() - new Date(userData.registrationDate.toDate ? userData.registrationDate.toDate() : userData.registrationDate).getTime()) / (1000 * 60 * 60 * 24))
    : Math.floor((Date.now() - new Date(user.registrationDate).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        {/* Hero Header - Matching Dashboard Style */}
        <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-12 sm:py-16 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <motion.span
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-block text-yellow-400 text-sm font-bold tracking-widest uppercase bg-white/10 px-4 py-2 rounded-full border border-yellow-400/30"
                  >
                    {language === 'ms' ? 'Profil' : 'Profile'}
                  </motion.span>
                </div>
                <div className="flex items-center space-x-2">
                  {isEditing && (
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{language === 'ms' ? 'Batal' : 'Cancel'}</span>
                    </Button>
                  )}
                  <Button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{language === 'ms' ? 'Menyimpan...' : 'Saving...'}</span>
                      </>
                    ) : isEditing ? (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{language === 'ms' ? 'Simpan' : 'Save'}</span>
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4" />
                        <span>{language === 'ms' ? 'Edit' : 'Edit'}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight"
              >
                {language === 'ms' ? 'Profil Saya' : 'My Profile'}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg sm:text-xl text-white/90 max-w-2xl flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
                {language === 'ms' ? 'Urus maklumat peribadi anda' : 'Manage your personal information'}
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Profile Content */}
        <section className="py-8 -mt-12 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Picture & Basic Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all"
                >
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white font-bold text-4xl shadow-lg overflow-hidden">
                        {profilePicture || userData?.profilePictureUrl ? (
                          <img 
                            src={profilePicture || userData?.profilePictureUrl} 
                            alt={formData.displayName || user.displayName || 'User'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          formData.displayName?.charAt(0).toUpperCase() || user.displayName?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-green-700 transition-colors">
                          <Camera className="w-5 h-5 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePictureChange}
                            className="hidden"
                            disabled={uploadingPicture}
                            aria-label={language === 'ms' ? 'Muat naik gambar profil' : 'Upload profile picture'}
                            title={language === 'ms' ? 'Muat naik gambar profil' : 'Upload profile picture'}
                          />
                        </label>
                      )}
                      {uploadingPicture && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-3xl font-black text-gray-900 mb-2">
                        {formData.displayName || user.displayName || 'User'}
                      </h2>
                      <p className="text-gray-600 mb-2 flex items-center justify-center md:justify-start gap-2">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center justify-center md:justify-start gap-2">
                        <Calendar className="w-4 h-4" />
                        {language === 'ms' ? 'Ahli sejak' : 'Member since'}{' '}
                        {userData?.registrationDate 
                          ? new Date(userData.registrationDate.toDate ? userData.registrationDate.toDate() : userData.registrationDate).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', {
                              month: 'long',
                              year: 'numeric'
                            })
                          : new Date(user.registrationDate).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', {
                              month: 'long',
                              year: 'numeric'
                            })
                        }
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Personal Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">
                      {language === 'ms' ? 'Maklumat Peribadi' : 'Personal Information'}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{language === 'ms' ? 'Nama Penuh' : 'Full Name'}</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.displayName}
                          onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent"
                          placeholder={language === 'ms' ? 'Masukkan nama penuh' : 'Enter full name'}
                          aria-label={language === 'ms' ? 'Nama Penuh' : 'Full Name'}
                        />
                      ) : (
                        <p className="text-gray-900 py-3 font-medium">{formData.displayName || user.displayName || '-'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{language === 'ms' ? 'Emel' : 'Email'}</span>
                      </label>
                      <p className="text-gray-900 py-3 font-medium">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {language === 'ms' ? 'Emel tidak boleh ditukar' : 'Email cannot be changed'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{language === 'ms' ? 'No. Telefon' : 'Phone Number'}</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                          placeholder="+60 12-345 6789"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 py-3 font-medium">{formData.phoneNumber || '-'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{language === 'ms' ? 'Tarikh Mendaftar' : 'Registration Date'}</span>
                      </label>
                      <p className="text-gray-900 py-3 font-medium">
                        {userData?.registrationDate 
                          ? new Date(userData.registrationDate.toDate ? userData.registrationDate.toDate() : userData.registrationDate).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US')
                          : new Date(user.registrationDate).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US')
                        }
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Farm Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                      <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">
                      {language === 'ms' ? 'Maklumat Ladang' : 'Farm Information'}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {language === 'ms' ? 'Nama Ladang' : 'Farm Name'}
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.farmName}
                          onChange={(e) => setFormData({...formData, farmName: e.target.value})}
                          placeholder={language === 'ms' ? 'Ladang Saya' : 'My Farm'}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 py-3 font-medium">{formData.farmName || '-'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{language === 'ms' ? 'Lokasi Ladang' : 'Farm Location'}</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.farmLocation}
                          onChange={(e) => setFormData({...formData, farmLocation: e.target.value})}
                          placeholder={language === 'ms' ? 'Johor, Malaysia' : 'Johor, Malaysia'}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 py-3 font-medium">{formData.farmLocation || '-'}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Leaf className="w-4 h-4" />
                        <span>{language === 'ms' ? 'Saiz Ladang (Hektar)' : 'Farm Size (Hectares)'}</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.farmSize}
                          onChange={(e) => setFormData({...formData, farmSize: e.target.value})}
                          placeholder={language === 'ms' ? 'Contoh: 50 hektar' : 'Example: 50 hectares'}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 py-3 font-medium">{formData.farmSize || '-'}</p>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Security Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">
                      {language === 'ms' ? 'Keselamatan' : 'Security'}
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 mb-1">
                          {language === 'ms' ? 'Pengesahan Dua Faktor' : 'Two-Factor Authentication'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === 'ms' 
                            ? twoFactorEnabled 
                              ? '2FA didayakan untuk akaun anda'
                              : 'Tambah lapisan keselamatan tambahan ke akaun anda'
                            : twoFactorEnabled
                              ? '2FA is enabled for your account'
                              : 'Add an extra layer of security to your account'
                          }
                        </p>
                      </div>
                      {twoFactorEnabled ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleDisable2FA}
                          disabled={disabling2FA}
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          {disabling2FA 
                            ? (language === 'ms' ? 'Memproses...' : 'Processing...')
                            : (language === 'ms' ? 'Matikan' : 'Disable')
                          }
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={handleSetup2FA}>
                          {language === 'ms' ? 'Dayakan' : 'Enable'}
                        </Button>
                      )}
                    </div>

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

                {/* Notifications Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">
                      {language === 'ms' ? 'Notifikasi' : 'Notifications'}
                    </h2>
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
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications}
                          onChange={(e) => setNotifications(e.target.checked)}
                          className="sr-only peer"
                          aria-label={language === 'ms' ? 'Notifikasi Push' : 'Push Notifications'}
                        />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
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
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          className="sr-only peer"
                          aria-label={language === 'ms' ? 'Notifikasi Email' : 'Email Notifications'}
                        />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <Button 
                      onClick={handleSaveNotifications} 
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-lg" 
                      disabled={savingNotifications}
                    >
                      {savingNotifications ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          {language === 'ms' ? 'Menyimpan...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {language === 'ms' ? 'Simpan Tetapan' : 'Save Settings'}
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>

                {/* Delete Account Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-white rounded-2xl p-6 shadow-xl border-2 border-red-200 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-white" />
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
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {language === 'ms' ? 'Padamkan Akaun' : 'Delete Account'}
                    </Button>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Account Statistics */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all"
                >
                  <h2 className="text-2xl font-black text-gray-900 mb-6">
                    {language === 'ms' ? 'Statistik Akaun' : 'Account Statistics'}
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <Upload className="w-5 h-5 text-blue-600" />
                        <span className="text-3xl font-black text-blue-600">{user.uploadsUsed || 0}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-700">
                        {language === 'ms' ? 'Laporan Dimuat Naik' : 'Reports Uploaded'}
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="text-3xl font-black text-green-600">
                          {user.uploadsLimit === -1 ? '∞' : (user.uploadsLimit - user.uploadsUsed)}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-700">
                        {language === 'ms' ? 'Baki Muat Naik' : 'Uploads Remaining'}
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        <span className="text-2xl font-black text-yellow-600">
                          {userPlan ? (language === 'ms' ? userPlan.nameMs : userPlan.name) : (user.plan?.toUpperCase() || 'NONE')}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-700">
                        {language === 'ms' ? 'Pelan Semasa' : 'Current Plan'}
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <Activity className="w-5 h-5 text-purple-600" />
                        <span className="text-3xl font-black text-purple-600">{daysActive}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-700">
                        {language === 'ms' ? 'Hari Aktif' : 'Days Active'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
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
                    onClick={() => setShowPasswordModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition"
                    aria-label={language === 'ms' ? 'Tutup' : 'Close'}
                    title={language === 'ms' ? 'Tutup' : 'Close'}
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {language === 'ms' ? 'Kata Laluan Semasa' : 'Current Password'}
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {language === 'ms' ? 'Kata Laluan Baharu' : 'New Password'}
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {language === 'ms' ? 'Sahkan Kata Laluan' : 'Confirm Password'}
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="flex items-start space-x-2 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
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

        {/* 2FA Setup Modal */}
        <AnimatePresence>
          {show2FASetup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-gray-900">
                    {language === 'ms' ? 'Sediakan 2FA' : 'Setup 2FA'}
                  </h3>
                  <button
                    onClick={() => {
                      setShow2FASetup(false);
                      setTwoFactorSecret(null);
                      setQrCodeUrl(null);
                      setTwoFactorCode('');
                    }}
                    className="text-gray-400 hover:text-gray-600 transition"
                    aria-label={language === 'ms' ? 'Tutup' : 'Close'}
                    title={language === 'ms' ? 'Tutup' : 'Close'}
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      {language === 'ms'
                        ? 'Imbas kod QR ini dengan aplikasi autentikasi anda (Google Authenticator, Authy, dll.)'
                        : 'Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)'
                      }
                    </p>
                    {qrCodeUrl && (
                      <div className="flex justify-center mb-4">
                        <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 border-2 border-gray-200 rounded-xl" />
                      </div>
                    )}
                    {twoFactorSecret && (
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">
                          {language === 'ms' ? 'Kod rahsia (jika tidak dapat mengimbas):' : 'Secret code (if you cannot scan):'}
                        </p>
                        <p className="text-sm font-mono text-gray-900 break-all">{twoFactorSecret}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {language === 'ms' ? 'Masukkan kod 6 digit dari aplikasi' : 'Enter 6-digit code from app'}
                    </label>
                    <input
                      type="text"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex items-start space-x-2 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      {language === 'ms'
                        ? 'Selepas mengimbas kod QR, masukkan kod 6 digit dari aplikasi autentikasi anda untuk mengesahkan.'
                        : 'After scanning the QR code, enter the 6-digit code from your authenticator app to verify.'
                      }
                    </p>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <Button
                      onClick={() => {
                        setShow2FASetup(false);
                        setTwoFactorSecret(null);
                        setQrCodeUrl(null);
                        setTwoFactorCode('');
                      }}
                      variant="outline"
                      className="flex-1"
                      disabled={verifying2FA}
                    >
                      {language === 'ms' ? 'Batal' : 'Cancel'}
                    </Button>
                    <Button
                      onClick={handleVerify2FA}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 font-bold"
                      disabled={verifying2FA || twoFactorCode.length !== 6}
                    >
                      {verifying2FA ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          {language === 'ms' ? 'Mengesahkan...' : 'Verifying...'}
                        </>
                      ) : (
                        language === 'ms' ? 'Sahkan & Dayakan' : 'Verify & Enable'
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
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-red-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-black text-red-900">
                      {language === 'ms' ? 'Padamkan Akaun' : 'Delete Account'}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText('');
                    }}
                    className="text-gray-400 hover:text-gray-600 transition"
                    aria-label={language === 'ms' ? 'Tutup' : 'Close'}
                    title={language === 'ms' ? 'Tutup' : 'Close'}
                    disabled={deletingAccount}
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-sm font-bold text-red-900 mb-2">
                      {language === 'ms' ? '⚠️ AMARAN: Tindakan ini tidak boleh dibatalkan!' : '⚠️ WARNING: This action cannot be undone!'}
                    </p>
                    <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                      <li>{language === 'ms' ? 'Semua data anda akan dipadam secara kekal' : 'All your data will be permanently deleted'}</li>
                      <li>{language === 'ms' ? 'Semua laporan dan analisis akan hilang' : 'All reports and analyses will be lost'}</li>
                      <li>{language === 'ms' ? 'Langganan anda akan dibatalkan' : 'Your subscription will be cancelled'}</li>
                      <li>{language === 'ms' ? 'Anda tidak akan dapat memulihkan akaun ini' : 'You will not be able to recover this account'}</li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {language === 'ms' 
                        ? `Sila taip "PADAM" untuk mengesahkan:`
                        : `Please type "DELETE" to confirm:`
                      }
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder={language === 'ms' ? 'PADAM' : 'DELETE'}
                      disabled={deletingAccount}
                      aria-label={language === 'ms' ? 'Kesahan pemadaman' : 'Deletion confirmation'}
                    />
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <Button
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeleteConfirmText('');
                      }}
                      variant="outline"
                      className="flex-1"
                      disabled={deletingAccount}
                    >
                      {language === 'ms' ? 'Batal' : 'Cancel'}
                    </Button>
                    <Button
                      onClick={handleDeleteAccount}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 font-bold text-white"
                      disabled={deletingAccount || deleteConfirmText !== (language === 'ms' ? 'PADAM' : 'DELETE')}
                    >
                      {deletingAccount ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          {language === 'ms' ? 'Memadam...' : 'Deleting...'}
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          {language === 'ms' ? 'Padamkan Akaun' : 'Delete Account'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
