'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';

function SuccessPageContent() {
  const { language, t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionId = searchParams.get('session_id');
  const plan = searchParams.get('plan') || 'smart';

  useEffect(() => {
    // If no session ID, redirect to home
    if (!sessionId) {
      router.push('/');
    }
  }, [sessionId, router]);

  const planNames = {
    start: { en: 'CropDrive Start', ms: 'CropDrive Start' },
    smart: { en: 'CropDrive Smart', ms: 'CropDrive Smart' },
    precision: { en: 'CropDrive Precision', ms: 'CropDrive Precision' },
  };

  const planName = planNames[plan as keyof typeof planNames] || planNames.smart;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Success Icon */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {language === 'ms' ? 'Tahniah!' : 'Congratulations!'}
            </h1>

            <p className="text-xl text-gray-600 mb-2">
              {language === 'ms'
                ? 'Langganan anda berjaya diaktifkan'
                : 'Your subscription has been activated successfully'
              }
            </p>

            <p className="text-lg text-gray-500">
              {language === 'ms' ? 'Selamat datang ke' : 'Welcome to'}{' '}
              <span className="font-semibold text-primary-600">
                {language === 'ms' ? planName.ms : planName.en}
              </span>
            </p>
          </div>

          {/* Subscription Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  {language === 'ms' ? 'Butiran Langganan' : 'Subscription Details'}
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">
                      {language === 'ms' ? 'Pelan' : 'Plan'}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {language === 'ms' ? planName.ms : planName.en}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">
                      {language === 'ms' ? 'Status' : 'Status'}
                    </span>
                    <span className="font-semibold text-green-600">
                      {language === 'ms' ? 'Aktif' : 'Active'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">
                      {language === 'ms' ? 'Tarikh Aktivasi' : 'Activation Date'}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {new Date().toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">
                      {language === 'ms' ? 'ID Sesi' : 'Session ID'}
                    </span>
                    <span className="font-mono text-sm text-gray-500">
                      {sessionId}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  {language === 'ms' ? 'Apa Seterusnya?' : 'What\'s Next?'}
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {language === 'ms' ? 'Sediakan Papan Pemuka' : 'Set Up Your Dashboard'}
                      </h3>
                      <p className="text-gray-600">
                        {language === 'ms'
                          ? 'Lengkapkan profil ladang anda dan tetapkan pilihan'
                          : 'Complete your farm profile and set your preferences'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {language === 'ms' ? 'Muat Naik Laporan Pertama' : 'Upload Your First Report'}
                      </h3>
                      <p className="text-gray-600">
                        {language === 'ms'
                          ? 'Muat naik laporan tanah atau daun untuk analisis AI'
                          : 'Upload your soil or leaf report for AI analysis'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {language === 'ms' ? 'Dapatkan Cadangan AI' : 'Get AI Recommendations'}
                      </h3>
                      <p className="text-gray-600">
                        {language === 'ms'
                          ? 'Terima analisis dan cadangan untuk meningkatkan hasil'
                          : 'Receive analysis and recommendations to improve your yield'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center space-y-4"
          >
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                {language === 'ms' ? 'Pergi ke Papan Pemuka' : 'Go to Dashboard'}
              </Button>
            </Link>

            <div className="text-center">
              <Link
                href="/tutorials"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {language === 'ms' ? 'Lihat tutorial' : 'View tutorials'}
              </Link>
              <span className="text-gray-400 mx-2">•</span>
              <Link
                href="/pricing"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {language === 'ms' ? 'Urus langganan' : 'Manage subscription'}
              </Link>
            </div>
          </motion.div>

          {/* Support Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-center mt-8"
          >
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  {language === 'ms' ? 'Perlu Bantuan?' : 'Need Help?'}
                </h3>
                <p className="text-blue-800 mb-4">
                  {language === 'ms'
                    ? 'Hubungi pasukan sokongan kami jika anda mempunyai sebarang pertanyaan'
                    : 'Contact our support team if you have any questions'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    {language === 'ms' ? 'WhatsApp Sokongan' : 'WhatsApp Support'}
                  </Button>
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    {language === 'ms' ? 'Pusat Bantuan' : 'Help Center'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
