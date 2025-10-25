'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/i18n';
import Button from './ui/Button';
import Card from './ui/Card';

interface OnboardingStep {
  id: string;
  title: string;
  titleMs: string;
  description: string;
  descriptionMs: string;
  imageUrl?: string;
  videoUrl?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Cultivate Knowledge, Harvest Success',
    titleMs: 'Usahakan Ilmu, Tuai Kejayaan',
    description: 'Welcome to CropDrive OP Advisor™ - your AI-powered assistant for smarter palm oil farming. Let\'s embark on a journey to transform your agricultural practices.',
    descriptionMs: 'Selamat datang ke CropDrive OP Advisor™ - pembantu AI anda untuk pertanian kelapa sawit yang lebih bijak. Mari kita mulakan perjalanan untuk mengubah amalan pertanian anda.',
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070',
  },
  {
    id: 'upload',
    title: 'Upload Lab Reports with Ease',
    titleMs: 'Muat Naik Laporan Makmal dengan Mudah',
    description: 'Simply drag and drop your soil and leaf analysis PDFs. Our intelligent AI automatically extracts and processes the data, saving you valuable time.',
    descriptionMs: 'Cuma seret dan lepas PDF analisis tanah dan daun anda. AI pintar kami mengekstrak dan memproses data secara automatik, menjimatkan masa anda yang berharga.',
    imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2070',
  },
  {
    id: 'ai-analysis',
    title: 'AI-Powered Insights & Recommendations',
    titleMs: 'Pandangan & Cadangan Berkuasa AI',
    description: 'Our advanced AI engine compares your results against MPOB standards, identifying deficiencies and providing precise fertilizer recommendations tailored to your soil conditions.',
    descriptionMs: 'Enjin AI canggih kami membandingkan keputusan anda dengan standard MPOB, mengenal pasti kekurangan dan memberikan cadangan baja yang tepat sesuai dengan keadaan tanah anda.',
    imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=2074',
  },
  {
    id: 'reports',
    title: 'Smart Reports & Trend Analysis',
    titleMs: 'Laporan Pintar & Analisis Trend',
    description: 'Access comprehensive reports with visual graphs, historical trends, and actionable insights. Track your farm\'s progress over time and make data-driven decisions.',
    descriptionMs: 'Akses laporan komprehensif dengan graf visual, trend sejarah, dan pandangan boleh dilaksana. Jejaki kemajuan ladang anda dari masa ke masa dan buat keputusan berasaskan data.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070',
  },
  {
    id: 'support',
    title: 'Expert Agronomy Support 24/7',
    titleMs: 'Sokongan Agronomi Pakar 24/7',
    description: 'Connect with certified agronomy experts via WhatsApp or email anytime. Get clarifications, personalized advice, and guidance whenever you need it.',
    descriptionMs: 'Hubungi pakar agronomi bertauliah melalui WhatsApp atau emel pada bila-bila masa. Dapatkan penjelasan, nasihat peribadi, dan bimbingan bila anda memerlukannya.',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2074',
  },
];

interface OnboardingModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onComplete?: () => void;
  currentUser?: any;
  language?: 'en' | 'ms';
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  currentUser,
  language: propLanguage,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { language: contextLanguage } = useTranslation();
  const language = propLanguage || contextLanguage;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setCompleted(false);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompleted(true);
    // Mark onboarding as completed in localStorage
    localStorage.setItem('cropdrive-onboarding-completed', 'true');

    // Close modal after a delay and trigger completion callback
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else if (onClose) {
        onClose();
      }
    }, 2000);
  };

  const handleSkip = () => {
    localStorage.setItem('cropdrive-onboarding-completed', 'true');
    if (onComplete) {
      onComplete();
    } else if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentStepData = onboardingSteps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 rounded-none shadow-2xl max-w-4xl w-full h-screen md:h-[90vh] md:rounded-lg overflow-hidden relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          {/* Side Progress Bar */}
          <div className="absolute left-0 top-0 h-full w-1 bg-white/20">
            <motion.div
              className="w-full bg-yellow-400"
              initial={{ height: 0 }}
              animate={{ height: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Header */}
          <div className="relative flex items-center justify-between p-6 md:p-8 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 border-2 border-yellow-400 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                  {language === 'ms' ? 'SELAMAT DATANG' : 'WELCOME'}
                </h2>
                <p className="text-yellow-400 text-sm uppercase tracking-widest">
                  {language === 'ms' ? 'Lawatan Platform' : 'Platform Tour'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSkip}
              className="text-white/60 hover:text-white transition-colors duration-200 border border-white/30 rounded p-2 hover:border-yellow-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="relative p-6 md:p-8 h-[calc(100%-120px)] flex flex-col">
            {!completed ? (
              <>
                {/* Step Indicator */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-yellow-400 uppercase tracking-widest font-medium">
                      {language === 'ms' ? 'Langkah' : 'Step'} {currentStep + 1}/{onboardingSteps.length}
                    </span>
                    <span className="text-sm text-white/80">
                      {Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Image Background */}
                {currentStepData.imageUrl && (
                  <div className="relative w-full h-48 md:h-64 mb-8 rounded-lg overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${currentStepData.imageUrl})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 to-transparent"></div>
                    </div>
                  </div>
                )}

                {/* Step Content */}
                <div className="flex-1 flex flex-col justify-center text-center mb-8">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                      {language === 'ms' ? currentStepData.titleMs : currentStepData.title}
                    </h3>

                    <p className="text-lg text-white/90 leading-relaxed max-w-2xl mx-auto">
                      {language === 'ms' ? currentStepData.descriptionMs : currentStepData.description}
                    </p>
                  </motion.div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between border-t border-white/10 pt-6">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className={`text-white uppercase tracking-wider text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      currentStep === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-yellow-400'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>{language === 'ms' ? 'Sebelumnya' : 'Previous'}</span>
                  </button>

                  <div className="flex space-x-2">
                    {onboardingSteps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStep(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentStep ? 'bg-yellow-400 w-8' : 'bg-white/30 hover:bg-white/50'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    className="bg-yellow-400 text-green-900 px-6 py-3 uppercase tracking-wider text-sm font-bold hover:bg-yellow-300 transition-all duration-200 flex items-center space-x-2"
                  >
                    <span>
                      {currentStep === onboardingSteps.length - 1
                        ? (language === 'ms' ? 'Selesai' : 'Finish')
                        : (language === 'ms' ? 'Seterusnya' : 'Next')
                      }
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              /* Completion Screen */
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-32 h-32 border-4 border-yellow-400 rounded-full flex items-center justify-center mx-auto mb-8">
                    <svg className="w-16 h-16 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </motion.div>

                <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  {language === 'ms' ? 'SELESAI!' : 'ALL DONE!'}
                </h3>

                <p className="text-xl text-white/90 mb-12 max-w-lg">
                  {language === 'ms'
                    ? 'Anda sudah bersedia untuk mengusahakan ilmu dan menuai kejayaan dengan CropDrive OP Advisor™'
                    : 'You\'re ready to cultivate knowledge and harvest success with CropDrive OP Advisor™'
                  }
                </p>

                <button
                  onClick={onClose}
                  className="bg-yellow-400 text-green-900 px-8 py-4 uppercase tracking-wider text-lg font-bold hover:bg-yellow-300 transition-all duration-200"
                >
                  {language === 'ms' ? 'Pergi ke Dashboard' : 'Go to Dashboard'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingModal;