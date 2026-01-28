'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGlobe,
  faUsers,
  faMessage,
  faShieldHalved,
  faCheck,
  faArrowRight,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import Button from './ui/Button';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface PalmiraOnboardingProps {
  onComplete: () => void;
  language: 'en' | 'ms';
}

const CUSTOMER_GROUPS = [
  { id: 'smallholder', label: 'Smallholder Farmer', labelMs: 'Petani Kecil' },
  { id: 'estate', label: 'Estate Staff', labelMs: 'Kakitangan Estet' },
  { id: 'dealer', label: 'Agricultural Input Dealer/Reseller', labelMs: 'Peniaga Input Pertanian/Penjual Semula' },
  { id: 'student', label: 'Student', labelMs: 'Pelajar' },
  { id: 'lab', label: 'Agricultural Lab Staff', labelMs: 'Kakitangan Makmal Pertanian' },
  { id: 'academic', label: 'Academic', labelMs: 'Ahli Akademik' },
];

const CONVERSATION_STYLES = [
  {
    id: 'diagnostic_interview',
    label: 'Diagnostic Interview',
    labelMs: 'Temu Bual Diagnostik',
    description: 'Bot asks all required questions first, then gives step-by-step checklists',
    descriptionMs: 'Bot bertanya semua soalan yang diperlukan terlebih dahulu, kemudian memberikan senarai semak langkah demi langkah',
  },
  {
    id: 'checklist_only',
    label: 'Checklist Only',
    labelMs: 'Senarai Semak Sahaja',
    description: 'Fewer questions, direct checklist output',
    descriptionMs: 'Kurang soalan, output senarai semak langsung',
  },
  {
    id: 'short_direct',
    label: 'Short Direct Answers',
    labelMs: 'Jawapan Ringkas dan Langsung',
    description: 'Brief answers in short steps',
    descriptionMs: 'Jawapan ringkas dalam langkah pendek',
  },
];

export default function PalmiraOnboarding({ onComplete, language }: PalmiraOnboardingProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ms'>(language);
  const [customerGroup, setCustomerGroup] = useState<string>('');
  const [conversationStyle, setConversationStyle] = useState<string>('');
  const [consentTranscripts, setConsentTranscripts] = useState(false);
  const [consentFarmProfile, setConsentFarmProfile] = useState(false);
  const [consentAnonymized, setConsentAnonymized] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!customerGroup || !conversationStyle) {
      toast.error(
        selectedLanguage === 'ms'
          ? 'Sila lengkapkan semua maklumat yang diperlukan'
          : 'Please complete all required information'
      );
      return;
    }

    if (!consentTranscripts || !consentFarmProfile) {
      toast.error(
        selectedLanguage === 'ms'
          ? 'Sila berikan persetujuan untuk semua pilihan yang diperlukan'
          : 'Please provide consent for all required options'
      );
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }
      const token = await currentUser.getIdToken();

      const response = await fetch('/api/palmira/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userType: customerGroup,
          language: selectedLanguage,
          conversationStyle,
          consentTranscripts,
          consentFarmProfile,
          consentAnonymized,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save onboarding');
      }

      toast.success(
        selectedLanguage === 'ms'
          ? 'Pendaftaran berjaya! Selamat datang ke Palmira.'
          : 'Registration successful! Welcome to Palmira.'
      );

      onComplete();
    } catch (error: any) {
      console.error('Error saving onboarding:', error);
      toast.error(
        selectedLanguage === 'ms'
          ? 'Ralat menyimpan maklumat. Sila cuba lagi.'
          : 'Error saving information. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, icon: faGlobe, label: 'Language' },
    { id: 2, icon: faUsers, label: 'Customer Group' },
    { id: 3, icon: faMessage, label: 'Conversation Style' },
    { id: 4, icon: faShieldHalved, label: 'Privacy & Consent' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 shadow-lg"
          >
            <Image
              src="/images/Palmira.png"
              alt="Palmira"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <h1 className="text-3xl font-black text-green-900 mb-2">
            {selectedLanguage === 'ms' ? 'Mula' : 'Getting Started'}
          </h1>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-3 mb-8">
          {steps.map((stepItem) => {
            const isCompleted = step > stepItem.id;
            const isActive = step === stepItem.id;
            
            return (
              <div key={stepItem.id} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : isActive
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isCompleted ? (
                    <FontAwesomeIcon icon={faCheck} className="w-6 h-6" />
                  ) : (
                    <FontAwesomeIcon icon={stepItem.icon} className="w-6 h-6" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <AnimatePresence mode="wait">
            {/* Step 1: Language Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-green-900 mb-2">
                    {selectedLanguage === 'ms' ? 'Pilih Bahasa Anda' : 'Select Your Language'}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {selectedLanguage === 'ms'
                      ? 'Pilih bahasa pilihan anda untuk Palmira.'
                      : 'Choose your preferred language for Palmira.'}
                  </p>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-green-400">
                      <input
                        type="radio"
                        name="language"
                        value="en"
                        checked={selectedLanguage === 'en'}
                        onChange={() => setSelectedLanguage('en')}
                        className="w-5 h-5 text-green-600 mr-4"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">English</div>
                        <div className="text-sm text-gray-600">Use English for all interactions.</div>
                      </div>
                      {selectedLanguage === 'en' && (
                        <div className="w-5 h-5 rounded-full bg-green-600 border-4 border-green-200"></div>
                      )}
                    </label>
                    <label className="flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-green-400">
                      <input
                        type="radio"
                        name="language"
                        value="ms"
                        checked={selectedLanguage === 'ms'}
                        onChange={() => setSelectedLanguage('ms')}
                        className="w-5 h-5 text-green-600 mr-4"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">Bahasa Malaysia</div>
                        <div className="text-sm text-gray-600">Gunakan Bahasa Malaysia untuk semua interaksi.</div>
                      </div>
                      {selectedLanguage === 'ms' && (
                        <div className="w-5 h-5 rounded-full bg-green-600 border-4 border-green-200"></div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    className="bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                    title={selectedLanguage === 'ms' ? 'Seterusnya' : 'Next'}
                    aria-label={selectedLanguage === 'ms' ? 'Seterusnya ke langkah seterusnya' : 'Next step'}
                  >
                    <span>{selectedLanguage === 'ms' ? 'Seterusnya' : 'Next'}</span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Customer Group */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-green-900 mb-2">
                    {selectedLanguage === 'ms' ? 'Pilih Kumpulan Pelanggan Anda' : 'Select Your Customer Group'}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {selectedLanguage === 'ms'
                      ? 'Bantu kami menyesuaikan pengalaman anda'
                      : 'Help us personalize your experience'}
                  </p>
                  <div className="space-y-2">
                    {CUSTOMER_GROUPS.map(group => (
                      <label
                        key={group.id}
                        className="flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-green-400"
                      >
                        <input
                          type="radio"
                          name="customerGroup"
                          value={group.id}
                          checked={customerGroup === group.id}
                          onChange={() => setCustomerGroup(group.id)}
                          className="w-5 h-5 text-green-600 mr-4"
                        />
                        <div className="flex-1 font-medium text-gray-900">
                          {selectedLanguage === 'ms' ? group.labelMs : group.label}
                        </div>
                        {customerGroup === group.id && (
                          <div className="w-5 h-5 rounded-full bg-green-600 border-4 border-green-200"></div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                    title={selectedLanguage === 'ms' ? 'Kembali' : 'Back'}
                    aria-label={selectedLanguage === 'ms' ? 'Kembali ke langkah sebelumnya' : 'Back to previous step'}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                    <span>{selectedLanguage === 'ms' ? 'Kembali' : 'Back'}</span>
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!customerGroup}
                    className="bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
                    title={selectedLanguage === 'ms' ? 'Seterusnya' : 'Next'}
                    aria-label={selectedLanguage === 'ms' ? 'Seterusnya ke langkah seterusnya' : 'Next step'}
                  >
                    <span>{selectedLanguage === 'ms' ? 'Seterusnya' : 'Next'}</span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Conversation Style */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-green-900 mb-2">
                    {selectedLanguage === 'ms' ? 'Pilih Gaya Perbualan' : 'Select Conversation Style'}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {selectedLanguage === 'ms'
                      ? 'Bagaimanakah anda ingin berinteraksi dengan Palmira?'
                      : 'How would you like to interact with Palmira?'}
                  </p>
                  <div className="space-y-3">
                    {CONVERSATION_STYLES.map(style => (
                      <label
                        key={style.id}
                        className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          conversationStyle === style.id
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="conversationStyle"
                          value={style.id}
                          checked={conversationStyle === style.id}
                          onChange={() => setConversationStyle(style.id)}
                          className="w-5 h-5 text-green-600 mt-1 mr-4"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">
                            {selectedLanguage === 'ms' ? style.labelMs : style.label}
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedLanguage === 'ms' ? style.descriptionMs : style.description}
                          </div>
                        </div>
                        {conversationStyle === style.id && (
                          <div className="w-5 h-5 rounded-full bg-green-600 border-4 border-green-200 mt-1"></div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                    title={selectedLanguage === 'ms' ? 'Kembali' : 'Back'}
                    aria-label={selectedLanguage === 'ms' ? 'Kembali ke langkah sebelumnya' : 'Back to previous step'}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                    <span>{selectedLanguage === 'ms' ? 'Kembali' : 'Back'}</span>
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    disabled={!conversationStyle}
                    className="bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
                    title={selectedLanguage === 'ms' ? 'Seterusnya' : 'Next'}
                    aria-label={selectedLanguage === 'ms' ? 'Seterusnya ke langkah seterusnya' : 'Next step'}
                  >
                    <span>{selectedLanguage === 'ms' ? 'Seterusnya' : 'Next'}</span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Privacy & Consent */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-green-900 mb-2">
                    {selectedLanguage === 'ms' ? 'Privasi & Persetujuan Data' : 'Privacy & Data Consent'}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {selectedLanguage === 'ms'
                      ? 'Privasi anda penting bagi kami'
                      : 'Your privacy matters to us'}
                  </p>
                  <div className="space-y-4">
                    <label className="flex items-start justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">
                          {selectedLanguage === 'ms'
                            ? 'Simpan transkrip sembang untuk rujukan masa hadapan'
                            : 'Save chat transcripts for future reference'}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={consentTranscripts}
                        onChange={e => setConsentTranscripts(e.target.checked)}
                        className="toggle-switch"
                        aria-label={selectedLanguage === 'ms' ? 'Simpan transkrip sembang' : 'Save chat transcripts'}
                      />
                    </label>

                    <label className="flex items-start justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">
                          {selectedLanguage === 'ms'
                            ? 'Simpan data profil ladang'
                            : 'Save farm profile data'}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={consentFarmProfile}
                        onChange={e => setConsentFarmProfile(e.target.checked)}
                        className="toggle-switch"
                        aria-label={selectedLanguage === 'ms' ? 'Simpan data profil ladang' : 'Save farm profile data'}
                      />
                    </label>

                    <label className="flex items-start justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">
                          {selectedLanguage === 'ms'
                            ? 'Benarkan penggunaan transkrip tanpa nama untuk penambahbaikan dalaman'
                            : 'Allow use of anonymized transcripts for internal improvement'}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={consentAnonymized}
                        onChange={e => setConsentAnonymized(e.target.checked)}
                        className="toggle-switch"
                        aria-label={selectedLanguage === 'ms' ? 'Benarkan penggunaan transkrip tanpa nama' : 'Allow anonymized transcripts'}
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    {selectedLanguage === 'ms'
                      ? 'Anda boleh menukar tetapan ini pada bila-bila masa dalam profil anda.'
                      : 'You can change these settings anytime in your profile.'}
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button
                    onClick={() => setStep(3)}
                    variant="outline"
                    className="border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                    title={selectedLanguage === 'ms' ? 'Kembali' : 'Back'}
                    aria-label={selectedLanguage === 'ms' ? 'Kembali ke langkah sebelumnya' : 'Back to previous step'}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                    <span>{selectedLanguage === 'ms' ? 'Kembali' : 'Back'}</span>
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !consentTranscripts || !consentFarmProfile}
                    className="bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
                    title={loading ? (selectedLanguage === 'ms' ? 'Menyimpan...' : 'Saving...') : (selectedLanguage === 'ms' ? 'Teruskan' : 'Continue')}
                    aria-label={loading ? (selectedLanguage === 'ms' ? 'Menyimpan...' : 'Saving...') : (selectedLanguage === 'ms' ? 'Teruskan dan selesaikan' : 'Continue and complete')}
                  >
                    <span>
                      {loading
                        ? selectedLanguage === 'ms'
                          ? 'Menyimpan...'
                          : 'Saving...'
                        : selectedLanguage === 'ms'
                        ? 'Teruskan'
                        : 'Continue'}
                    </span>
                    {!loading && <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
