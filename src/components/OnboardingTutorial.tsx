'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faRobot, faChartLine, faComments, faCheckCircle, faTimes, faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

interface OnboardingTutorialProps {
  language: string;
  onComplete: () => void;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ language, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const copy = (en: string, ms: string, id: string) =>
    language === 'id' ? id : language === 'ms' ? ms : en;

  const steps = [
    {
      icon: faUpload,
      color: 'from-green-500 to-emerald-600',
      title: copy('Upload Your Lab Reports', 'Muat Naik Laporan Makmal Anda', 'Unggah Laporan Lab Anda'),
      description: copy(
        'Start by uploading your soil test or leaf analysis reports. We support PDF, Excel, and image formats from labs like SPLAB.',
        'Mulakan dengan memuat naik laporan ujian tanah atau analisis daun anda. Kami menyokong format PDF, Excel dan imej dari makmal seperti SPLAB.',
        'Mulai dengan mengunggah laporan uji tanah atau analisis daun Anda. Kami mendukung format PDF, Excel, dan gambar dari laboratorium seperti SPLAB.'
      ),
      tip: copy('You can upload up to 2 reports for free!', 'Anda boleh memuat naik sehingga 2 laporan secara percuma!', 'Anda dapat mengunggah hingga 2 laporan secara gratis!'),
    },
    {
      icon: faRobot,
      color: 'from-blue-500 to-indigo-600',
      title: copy('AI Analyzes Your Data', 'AI Menganalisis Data Anda', 'AI Menganalisis Data Anda'),
      description: copy(
        'Our AI processes your lab results in 5-8 minutes, identifying nutrient deficiencies, soil health issues, and optimization opportunities.',
        'AI kami memproses keputusan makmal anda dalam 5-8 minit, mengenal pasti kekurangan nutrien, isu kesihatan tanah dan peluang pengoptimuman.',
        'AI kami memproses hasil lab Anda dalam 5-8 menit, mengidentifikasi kekurangan nutrisi, masalah kesehatan tanah, dan peluang optimalisasi.'
      ),
      tip: copy('Analysis covers NPK, micronutrients, pH, and more', 'Analisis meliputi NPK, mikronutrien, pH, dan banyak lagi', 'Analisis mencakup NPK, mikronutrien, pH, dan lainnya'),
    },
    {
      icon: faChartLine,
      color: 'from-yellow-500 to-orange-500',
      title: copy('Get Actionable Recommendations', 'Dapatkan Cadangan Boleh Bertindak', 'Dapatkan Rekomendasi yang Dapat Ditindaklanjuti'),
      description: copy(
        'Receive detailed fertilizer recommendations, application schedules, and cost estimates tailored to your palm oil plantation.',
        'Terima cadangan baja terperinci, jadual penggunaan dan anggaran kos yang disesuaikan untuk ladang kelapa sawit anda.',
        'Terima rekomendasi pupuk terperinci, jadwal aplikasi, dan perkiraan biaya yang disesuaikan untuk perkebunan kelapa sawit Anda.'
      ),
      tip: copy('Reports include specific product suggestions', 'Laporan termasuk cadangan produk tertentu', 'Laporan termasuk saran produk tertentu'),
    },
    {
      icon: faComments,
      color: 'from-purple-500 to-pink-500',
      title: copy('Chat with Palmira AI', 'Bersembang dengan Palmira AI', 'Obrolan dengan Palmira AI'),
      description: copy(
        'Have questions about your results? Chat with Palmira, our AI agronomist, to discuss findings and get personalized advice.',
        'Ada soalan tentang keputusan anda? Bersembang dengan Palmira, ahli agronomi AI kami, untuk membincangkan penemuan dan mendapatkan nasihat peribadi.',
        'Punya pertanyaan tentang hasil Anda? Obrolan dengan Palmira, ahli agronomi AI kami, untuk membahas temuan dan mendapatkan saran yang dipersonalisasi.'
      ),
      tip: copy('Palmira can explain complex agronomic concepts simply', 'Palmira boleh menerangkan konsep agronomi kompleks dengan mudah', 'Palmira dapat menjelaskan konsep agronomi kompleks dengan sederhana'),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('cropdrive-onboarding-complete', 'true');
    onComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 px-8 pt-8 pb-6">
            <button
              onClick={handleComplete}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i <= currentStep ? 'bg-yellow-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            <p className="text-white/70 text-sm font-medium">
              {copy('Step', 'Langkah', 'Langkah')} {currentStep + 1} / {steps.length}
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${steps[currentStep].color} flex items-center justify-center mb-6 shadow-lg`}>
                  <FontAwesomeIcon icon={steps[currentStep].icon} className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  {steps[currentStep].title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {steps[currentStep].description}
                </p>
                <div className="flex items-start gap-2 bg-green-50 rounded-xl p-3 border border-green-200">
                  <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-800 font-medium">{steps[currentStep].tip}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
              {copy('Back', 'Kembali', 'Kembali')}
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl"
            >
              {currentStep < steps.length - 1
                ? copy('Next', 'Seterusnya', 'Selanjutnya')
                : copy('Get Started!', 'Mula Sekarang!', 'Mulai Sekarang!')}
              <FontAwesomeIcon icon={currentStep < steps.length - 1 ? faArrowRight : faCheckCircle} className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingTutorial;
