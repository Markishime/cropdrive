'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/i18n';
import { getPlanById } from '@/lib/subscriptions';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'history' | 'subscription'>('overview');
  const [loading, setLoading] = useState(true);

  const { user, loading: authLoading } = useAuth();
  const { language, t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      setLoading(false);
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userPlan = getPlanById(user.plan);
  const uploadsRemaining = Math.max(0, user.uploadsLimit - user.uploadsUsed);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Header Section */}
        <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="inline-block text-yellow-400 text-sm font-bold tracking-widest uppercase mb-4">
                    {language === 'ms' ? 'Papan Pemuka' : 'Dashboard'}
                  </span>
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    {language === 'ms' ? 'Selamat kembali' : 'Welcome back'},<br />
                    <span className="text-yellow-400">{user.displayName}!</span>
                  </h1>
                  <p className="text-xl text-white/90">
                    {language === 'ms' ? 'Papan pemuka analisis ladang AI anda' : 'Your AI farm analysis dashboard'}
                  </p>
                </div>

                <div className="mt-6 md:mt-0">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-white/20">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg
                          className="w-8 h-8 text-green-900"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-white/70 font-medium uppercase tracking-wider">
                          {language === 'ms' ? 'Pelan Semasa' : 'Current Plan'}
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {userPlan?.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {language === 'ms' ? 'Jumlah Muat Naik' : 'Total Uploads'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {user.uploadsUsed}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {language === 'ms' ? 'Baki Muat Naik' : 'Uploads Remaining'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {user.uploadsLimit === -1 ? '∞' : uploadsRemaining}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {language === 'ms' ? 'Status Langganan' : 'Subscription Status'}
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {language === 'ms' ? 'Aktif' : 'Active'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600"
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
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {language === 'ms' ? 'Sokongan' : 'Support'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userPlan?.supportLevel === 'premium' ? '12h' :
                       userPlan?.supportLevel === 'priority' ? '24h' : 'Standard'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.18l4.95 4.95M12 21.82l-4.95-4.95M2.18 12l4.95-4.95M21.82 12l-4.95 4.95"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
              {[
                { id: 'overview', label: language === 'ms' ? 'Gambaran Keseluruhan' : 'Overview', labelMs: 'Gambaran Keseluruhan' },
                { id: 'analysis', label: language === 'ms' ? 'Analisis' : 'Analysis', labelMs: 'Analisis' },
                { id: 'history', label: language === 'ms' ? 'Sejarah' : 'History', labelMs: 'Sejarah' },
                { id: 'subscription', label: language === 'ms' ? 'Langganan' : 'Subscription', labelMs: 'Langganan' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {language === 'ms' ? tab.labelMs : tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {language === 'ms' ? 'Gambaran Keseluruhan' : 'Overview'}
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* AI Assistant Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {language === 'ms' ? 'Pembantu AI' : 'AI Assistant'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">
                          {language === 'ms'
                            ? 'Muat naik laporan makmal anda dan dapatkan analisis AI segera dengan cadangan yang boleh dilaksana.'
                            : 'Upload your lab reports and get instant AI analysis with actionable recommendations.'
                          }
                        </p>

                        {user.uploadsLimit === -1 || uploadsRemaining > 0 ? (
                          <Button className="w-full">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            {language === 'ms' ? 'Muat Naik Laporan' : 'Upload Report'}
                          </Button>
                        ) : (
                          <div className="text-center">
                            <p className="text-red-600 mb-4">
                              {language === 'ms'
                                ? 'Had muat naik bulanan anda telah habis. Sila naik taraf pelan anda.'
                                : 'Your monthly upload limit has been reached. Please upgrade your plan.'
                              }
                            </p>
                            <Button variant="outline" className="w-full">
                              {language === 'ms' ? 'Naik Taraf Pelan' : 'Upgrade Plan'}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {language === 'ms' ? 'Statistik Pantas' : 'Quick Stats'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              {language === 'ms' ? 'Penggunaan Bulanan' : 'Monthly Usage'}
                            </span>
                            <span className="font-semibold">
                              {user.uploadsUsed} / {user.uploadsLimit === -1 ? '∞' : user.uploadsLimit}
                            </span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: user.uploadsLimit === -1
                                  ? '100%'
                                  : `${(user.uploadsUsed / user.uploadsLimit) * 100}%`
                              }}
                            ></div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              {language === 'ms' ? 'Taraf Sokongan' : 'Support Level'}
                            </span>
                            <span className="font-semibold text-primary-600">
                              {userPlan?.supportLevel === 'premium' ? 'Premium' :
                               userPlan?.supportLevel === 'priority' ? 'Priority' : 'Standard'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {activeTab === 'analysis' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {language === 'ms' ? 'Analisis AI' : 'AI Analysis'}
                  </h2>

                  {/* AI Assistant Iframe */}
                  <Card className="h-96">
                    <CardContent className="p-6 h-full">
                      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <svg
                            className="w-16 h-16 text-gray-400 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">
                            {language === 'ms' ? 'Pembantu AI AGS' : 'AGS AI Assistant'}
                          </h3>
                          <p className="text-gray-500 mb-4">
                            {language === 'ms'
                              ? 'Muat naik laporan PDF anda untuk analisis AI'
                              : 'Upload your PDF reports for AI analysis'
                            }
                          </p>
                          <Button>
                            {language === 'ms' ? 'Muat Naik Fail' : 'Upload File'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {language === 'ms' ? 'Sejarah Analisis' : 'Analysis History'}
                  </h2>

                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-12">
                        <svg
                          className="w-16 h-16 text-gray-400 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          {language === 'ms' ? 'Tiada Analisis Yet' : 'No Analysis Yet'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {language === 'ms'
                            ? 'Mulakan dengan memuat naik laporan makmal pertama anda'
                            : 'Start by uploading your first lab report'
                          }
                        </p>
                        <Button>
                          {language === 'ms' ? 'Muat Naik Laporan' : 'Upload Report'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'subscription' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {language === 'ms' ? 'Pengurusan Langganan' : 'Subscription Management'}
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {language === 'ms' ? 'Pelan Semasa' : 'Current Plan'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              {language === 'ms' ? 'Pelan' : 'Plan'}
                            </span>
                            <span className="font-semibold">
                              {userPlan?.name || 'N/A'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              {language === 'ms' ? 'Status' : 'Status'}
                            </span>
                            <span className="font-semibold text-green-600">
                              {language === 'ms' ? 'Aktif' : 'Active'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              {language === 'ms' ? 'Had Muat Naik' : 'Upload Limit'}
                            </span>
                            <span className="font-semibold">
                              {user.uploadsLimit === -1 ? 'Unlimited' : user.uploadsLimit}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {language === 'ms' ? 'Tindakan' : 'Actions'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Button className="w-full" variant="outline">
                            {language === 'ms' ? 'Naik Taraf Pelan' : 'Upgrade Plan'}
                          </Button>

                          <Button className="w-full" variant="outline">
                            {language === 'ms' ? 'Sejarah Bil' : 'Billing History'}
                          </Button>

                          <Button className="w-full" variant="outline">
                            {language === 'ms' ? 'Batal Langganan' : 'Cancel Subscription'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
