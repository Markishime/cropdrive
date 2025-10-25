'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, XCircle, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { updateProfile as firebaseUpdateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    farmName: '',
    farmLocation: '',
    farmSize: '',
  });
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLang(lang);
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        farmName: user.farmName || '',
        farmLocation: user.farmLocation || '',
        farmSize: user.farmSize || '',
      });
    }
  }, [user]);

  const { language } = useTranslation(currentLang);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSave = async () => {
    if (!user?.uid) return;
    
    setSaving(true);
    try {
      // Update user profile in Firestore
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
          
          // Also update in Firestore
          await updateDoc(userRef, {
            displayName: formData.displayName
          });
        }
      }

      toast.success(language === 'ms' ? '✓ Profil dikemas kini! Sila muat semula halaman.' : '✓ Profile updated! Please reload the page.');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(language === 'ms' ? '✗ Ralat mengemas kini profil' : '✗ Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        farmName: user.farmName || '',
        farmLocation: user.farmLocation || '',
        farmSize: user.farmSize || '',
      });
    }
    setIsEditing(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {language === 'ms' ? 'Profil Saya' : 'My Profile'}
                </h1>
                <p className="text-gray-600">
                  {language === 'ms' ? 'Urus maklumat peribadi anda' : 'Manage your personal information'}
                </p>
              </div>
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
                className="flex items-center space-x-2"
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
        </motion.div>

        <div className="space-y-6">
          {/* Profile Picture */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white font-bold text-3xl">
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-gray-900">{user.displayName}</h2>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {language === 'ms' ? 'Ahli sejak' : 'Member since'}{' '}
                      {new Date(user.registrationDate).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      {language === 'ms' ? 'Tukar Gambar' : 'Change Photo'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ms' ? 'Maklumat Peribadi' : 'Personal Information'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{language === 'ms' ? 'Nama Penuh' : 'Full Name'}</span>
                      </div>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{user.displayName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{language === 'ms' ? 'Emel' : 'Email'}</span>
                      </div>
                    </label>
                    <p className="text-gray-900 py-2">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'ms' ? 'Emel tidak boleh ditukar' : 'Email cannot be changed'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{language === 'ms' ? 'No. Telefon' : 'Phone Number'}</span>
                      </div>
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        placeholder="+60 12-345 6789"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{user.phoneNumber || '-'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{language === 'ms' ? 'Tarikh Mendaftar' : 'Registration Date'}</span>
                      </div>
                    </label>
                    <p className="text-gray-900 py-2">
                      {new Date(user.registrationDate).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Farm Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ms' ? 'Maklumat Ladang' : 'Farm Information'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ms' ? 'Nama Ladang' : 'Farm Name'}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.farmName}
                        onChange={(e) => setFormData({...formData, farmName: e.target.value})}
                        placeholder={language === 'ms' ? 'Ladang Saya' : 'My Farm'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{user.farmName || '-'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{language === 'ms' ? 'Lokasi Ladang' : 'Farm Location'}</span>
                      </div>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.farmLocation}
                        onChange={(e) => setFormData({...formData, farmLocation: e.target.value})}
                        placeholder={language === 'ms' ? 'Johor, Malaysia' : 'Johor, Malaysia'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{user.farmLocation || '-'}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Leaf className="w-4 h-4" />
                        <span>{language === 'ms' ? 'Saiz Ladang (Hektar)' : 'Farm Size (Hectares)'}</span>
                      </div>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.farmSize}
                        onChange={(e) => setFormData({...formData, farmSize: e.target.value})}
                        placeholder={language === 'ms' ? 'Contoh: 50 hektar' : 'Example: 50 hectares'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{user.farmSize || '-'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ms' ? 'Statistik Akaun' : 'Account Statistics'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{user.uploadsUsed || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'ms' ? 'Laporan Dimuat Naik' : 'Reports Uploaded'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">
                      {user.uploadsLimit === -1 ? '∞' : user.uploadsLimit - user.uploadsUsed}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'ms' ? 'Baki Muat Naik' : 'Uploads Remaining'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-3xl font-bold text-yellow-600">{user.plan.toUpperCase()}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'ms' ? 'Pelan Semasa' : 'Current Plan'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600">
                      {Math.floor((Date.now() - new Date(user.registrationDate).getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'ms' ? 'Hari Aktif' : 'Days Active'}
                    </p>
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

