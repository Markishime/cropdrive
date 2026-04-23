'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faLocationDot,
  faCalendar,
  faPen,
  faFloppyDisk,
  faCircleXmark,
  faLeaf,
  faWandSparkles,
  faChartLine,
  faUpload,
  faAward,
  faPersonRunning,
  faCamera,
  faMessage,
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { doc, updateDoc, deleteDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, auth, storage } from '@/lib/firebase';
import { updateProfile as firebaseUpdateProfile, updatePassword as firebaseUpdatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { getPlanById } from '@/lib/subscriptions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('en');
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

    if (!user.email?.trim()) {
      toast.error(language === 'ms' ? 'Emel diperlukan.' : 'Email is required.');
      return;
    }

    if (!formData.phoneNumber.trim()) {
      toast.error(language === 'ms' ? 'Nombor WhatsApp diperlukan.' : 'WhatsApp number is required.');
      return;
    }

    if (!formData.farmLocation.trim()) {
      toast.error(language === 'ms' ? 'Negara/Wilayah diperlukan.' : 'Country/Region is required.');
      return;
    }
    
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
        countryRegion: formData.farmLocation,
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

  // All security, notifications, and account deletion actions are now handled in the Settings page.

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
                      <FontAwesomeIcon icon={faCircleXmark} className="w-4 h-4" />
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
                        <FontAwesomeIcon icon={faFloppyDisk} className="w-4 h-4" />
                        <span>{language === 'ms' ? 'Simpan' : 'Save'}</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
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
                <FontAwesomeIcon icon={faWandSparkles} className="w-5 h-5 text-yellow-400" />
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
                          <FontAwesomeIcon icon={faCamera} className="w-5 h-5 text-white" />
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
                        <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
                        {user.email}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center justify-center md:justify-start gap-2">
                        <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
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
                      <p className="text-xs text-green-600 mt-2 flex items-center justify-center md:justify-start gap-1.5">
                        <FontAwesomeIcon icon={faMessage} className="w-3.5 h-3.5" />
                        {language === 'ms'
                          ? 'Gambar ini dipaparkan di sebelah mesej anda dalam Palmira'
                          : 'This photo will also be shown next to your messages in Palmira chat'}
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
                      <FontAwesomeIcon icon={faUser} className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">
                      {language === 'ms' ? 'Maklumat Peribadi' : 'Personal Information'}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
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
                        <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
                        <span>{language === 'ms' ? 'Emel' : 'Email'}</span>
                      </label>
                      <p className="text-gray-900 py-3 font-medium">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {language === 'ms' ? 'Emel tidak boleh ditukar' : 'Email cannot be changed'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faPhone} className="w-4 h-4" />
                        <span>{language === 'ms' ? 'Nombor WhatsApp' : 'WhatsApp Number'}</span>
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
                        <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
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
                      <FontAwesomeIcon icon={faLeaf} className="w-6 h-6 text-white" />
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
                        <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4" />
                        <span>{language === 'ms' ? 'Negara / Wilayah' : 'Country / Region'}</span>
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
                        <FontAwesomeIcon icon={faLeaf} className="w-4 h-4" />
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

                {/* All security, notifications, and account deletion settings have been moved to the Settings page. */}
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
                        <FontAwesomeIcon icon={faUpload} className="w-5 h-5 text-blue-600" />
                        <span className="text-3xl font-black text-blue-600">{user.uploadsUsed || 0}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-700">
                        {language === 'ms' ? 'Laporan Dimuat Naik' : 'Reports Uploaded'}
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <FontAwesomeIcon icon={faChartLine} className="w-5 h-5 text-green-600" />
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
                        <FontAwesomeIcon icon={faAward} className="w-5 h-5 text-yellow-600" />
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
                        <FontAwesomeIcon icon={faPersonRunning} className="w-5 h-5 text-purple-600" />
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

        {/* Security, notifications, and account deletion modals are handled on the Settings page. */}
      </div>
    </ProtectedRoute>
  );
}
