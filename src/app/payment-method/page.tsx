'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/i18n';
import { getPricingTierById, PRICING_TIERS } from '@/lib/subscriptions';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  CreditCard, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  X, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  DollarSign,
  Bell,
  Shield,
  Zap,
  Users,
  BarChart3
} from 'lucide-react';

export default function PaymentMethodPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const lang = (localStorage.getItem('cropdrive-language') || 'en') as 'en' | 'ms';
    setCurrentLang(lang);
  }, []);

  const { language } = useTranslation(mounted ? currentLang : 'en');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && (user.plan === 'none' || !user.plan)) {
      router.push('/pricing');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || user.plan === 'none' || !user.plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">
            {language === 'ms' ? 'Memuatkan...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  const currentPlan = getPricingTierById(user.plan);
  const uploadPercentage = user.uploadsLimit === -1 ? 100 : user.uploadsLimit > 0 ? (user.uploadsUsed / user.uploadsLimit) * 100 : 0;

  // Mock invoices data (replace with real data from your backend)
  const invoices = [
    {
      id: 'INV-2024-001',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      amount: currentPlan?.monthlyPrice || 0,
      status: 'paid',
      plan: currentPlan?.name || 'Basic'
    },
    {
      id: 'INV-2024-002',
      date: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000),
      amount: currentPlan?.monthlyPrice || 0,
      status: 'paid',
      plan: currentPlan?.name || 'Basic'
    }
  ];

  const handleCancelSubscription = async () => {
    setShowCancelModal(false);
    
    const loadingToast = toast.loading(
      language === 'ms' ? '⏳ Membatalkan langganan...' : '⏳ Cancelling subscription...',
      {
        icon: '⏳',
        style: {
          borderRadius: '12px',
          background: '#333',
          color: '#fff',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '600',
        },
      }
    );
    
    setLoading(true);
    try {
      if (!user?.uid) {
        throw new Error('User not found');
      }

      // Update user's plan in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        plan: 'none',
        uploadsLimit: 0,
        uploadsUsed: 0,
        stripeSubscriptionId: null,
        stripeCustomerId: null,
        subscriptionStatus: 'cancelled',
        updatedAt: serverTimestamp()
      });

      toast.success(
        language === 'ms' 
          ? '✅ Langganan berjaya dibatalkan!' 
          : '✅ Subscription cancelled successfully!',
        {
          id: loadingToast,
          duration: 4000,
          icon: '✅',
          style: {
            borderRadius: '12px',
            background: '#10b981',
            color: '#fff',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '600',
          },
        }
      );
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast.error(
        language === 'ms' 
          ? '❌ Ralat membatalkan langganan. Sila cuba lagi.' 
          : '❌ Error cancelling subscription. Please try again.',
        {
          id: loadingToast,
          duration: 5000,
          icon: '❌',
          style: {
            borderRadius: '12px',
            background: '#ef4444',
            color: '#fff',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '600',
          },
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePlan = async (newPlanId: string) => {
    const loadingToast = toast.loading(
      language === 'ms' ? '⏳ Menaik taraf pelan...' : '⏳ Upgrading plan...',
      {
        icon: '⬆️',
        style: {
          borderRadius: '12px',
          background: '#333',
          color: '#fff',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '600',
        },
      }
    );

    setLoading(true);
    try {
      if (!user?.uid) {
        throw new Error('User not found');
      }

      const newPlan = getPricingTierById(newPlanId);
      if (!newPlan) {
        throw new Error('Plan not found');
      }

      // Update user's plan in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        plan: newPlanId,
        uploadsLimit: newPlan.uploadLimit || 0,
        updatedAt: serverTimestamp()
      });

      toast.success(
        language === 'ms' 
          ? `🎉 Pelan berjaya dinaik taraf ke ${newPlan.nameMs}!` 
          : `🎉 Plan upgraded to ${newPlan.name} successfully!`,
        {
          id: loadingToast,
          duration: 4000,
          icon: '🚀',
          style: {
            borderRadius: '12px',
            background: '#10b981',
            color: '#fff',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '600',
          },
        }
      );
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Upgrade plan error:', error);
      toast.error(
        language === 'ms' 
          ? '❌ Ralat menaik taraf pelan. Sila cuba lagi.' 
          : '❌ Error upgrading plan. Please try again.',
        {
          id: loadingToast,
          duration: 5000,
          icon: '❌',
          style: {
            borderRadius: '12px',
            background: '#ef4444',
            color: '#fff',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '600',
          },
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDowngradePlan = async (newPlanId: string) => {
    const loadingToast = toast.loading(
      language === 'ms' ? '⏳ Menurun taraf pelan...' : '⏳ Downgrading plan...',
      {
        icon: '⬇️',
        style: {
          borderRadius: '12px',
          background: '#333',
          color: '#fff',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '600',
        },
      }
    );

    setLoading(true);
    try {
      if (!user?.uid) {
        throw new Error('User not found');
      }

      const newPlan = getPricingTierById(newPlanId);
      if (!newPlan) {
        throw new Error('Plan not found');
      }

      // Update user's plan in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        plan: newPlanId,
        uploadsLimit: newPlan.uploadLimit || 0,
        updatedAt: serverTimestamp()
      });

      toast.success(
        language === 'ms' 
          ? `✅ Pelan berjaya diturun taraf ke ${newPlan.nameMs}` 
          : `✅ Plan downgraded to ${newPlan.name} successfully`,
        {
          id: loadingToast,
          duration: 4000,
          icon: '✅',
          style: {
            borderRadius: '12px',
            background: '#10b981',
            color: '#fff',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '600',
          },
        }
      );
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Downgrade plan error:', error);
      toast.error(
        language === 'ms' 
          ? '❌ Ralat menurun taraf pelan. Sila cuba lagi.' 
          : '❌ Error downgrading plan. Please try again.',
        {
          id: loadingToast,
          duration: 5000,
          icon: '❌',
          style: {
            borderRadius: '12px',
            background: '#ef4444',
            color: '#fff',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '600',
          },
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoRenewal = () => {
    setAutoRenewal(!autoRenewal);
    toast.success(
      autoRenewal
        ? (language === 'ms' ? '🔄 Pembaharuan auto dimatikan' : '🔄 Auto-renewal turned off')
        : (language === 'ms' ? '🔄 Pembaharuan auto dihidupkan' : '🔄 Auto-renewal turned on'),
      {
        duration: 3000,
        icon: '⚙️',
        style: {
          borderRadius: '12px',
          background: '#3b82f6',
          color: '#fff',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '600',
        },
      }
    );
  };

  const handleToggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications);
    toast.success(
      emailNotifications
        ? (language === 'ms' ? '📧 Pemberitahuan email dimatikan' : '📧 Email notifications turned off')
        : (language === 'ms' ? '📧 Pemberitahuan email dihidupkan' : '📧 Email notifications turned on'),
      {
        duration: 3000,
        icon: '📧',
        style: {
          borderRadius: '12px',
          background: '#3b82f6',
          color: '#fff',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '600',
        },
      }
    );
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success(
      language === 'ms' 
        ? `⬇️ Memuat turun invois ${invoiceId}...` 
        : `⬇️ Downloading invoice ${invoiceId}...`,
      {
        duration: 2000,
        icon: '📄',
        style: {
          borderRadius: '12px',
          background: '#8b5cf6',
          color: '#fff',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '600',
        },
      }
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        {/* Header */}
        <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
                {language === 'ms' ? 'Kaedah' : 'Payment'} <span className="text-yellow-400">{language === 'ms' ? 'Bayaran' : 'Method'}</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/90">
                {language === 'ms' ? 'Urus langganan dan bayaran anda' : 'Manage your subscription and payments'}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Current Plan */}
              <div className="lg:col-span-2 space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-gray-900">
                      {language === 'ms' ? 'Pelan Semasa' : 'Current Plan'}
                    </h2>
                    <span className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                      {language === 'ms' ? 'Aktif' : 'Active'}
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border-2 border-green-200 mb-6">
                    <h3 className="text-3xl font-black text-gray-900 mb-2">
                      {language === 'ms' ? currentPlan?.nameMs : currentPlan?.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {language === 'ms' ? currentPlan?.taglineMs : currentPlan?.tagline}
                    </p>
                    <div className="flex items-baseline">
                      <span className="text-5xl font-black text-green-700">
                        {currentPlan?.monthlyPrice}
                      </span>
                      <span className="text-xl text-gray-600 ml-2">
                        RM/{language === 'ms' ? 'bulan' : 'month'}
                      </span>
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          {language === 'ms' ? 'Penggunaan Muat Naik' : 'Upload Usage'}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {user.uploadsUsed} / {user.uploadsLimit === -1 ? '∞' : user.uploadsLimit}
                        </span>
                      </div>
                      {user.uploadsLimit !== -1 && (
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-green-600 to-green-700 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(uploadPercentage, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    <Link href="/pricing">
                      <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 py-3 font-bold">
                        {language === 'ms' ? '⬆️ Naik Taraf' : '⬆️ Upgrade'}
                      </Button>
                    </Link>
                    <Button 
                      onClick={handleCancelSubscription}
                      disabled={loading}
                      className="w-full bg-red-600 text-white hover:bg-red-700 py-3 font-bold"
                    >
                      {loading 
                        ? (language === 'ms' ? 'Memproses...' : 'Processing...') 
                        : (language === 'ms' ? '✗ Batalkan' : '✗ Cancel')
                      }
                    </Button>
                  </div>
                </motion.div>

                {/* Invoices */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
                >
                  <h2 className="text-2xl font-black text-gray-900 mb-6">
                    {language === 'ms' ? 'Invois Terkini' : 'Recent Invoices'}
                  </h2>
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{invoice.id}</p>
                          <p className="text-sm text-gray-600">
                            {invoice.date.toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">RM {invoice.amount}</p>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                            {language === 'ms' ? 'Dibayar' : 'Paid'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Plan Comparison */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 shadow-xl border-2 border-blue-200"
                >
                  <h3 className="text-xl font-black text-gray-900 mb-4">
                    {language === 'ms' ? 'Pelan Lain' : 'Other Plans'}
                  </h3>
                  <div className="space-y-3">
                    {PRICING_TIERS.filter(tier => tier.id !== user.plan).map((tier) => {
                      const tierOrder = ['none', 'start', 'smart', 'precision'];
                      const currentIndex = tierOrder.indexOf(user.plan || 'none');
                      const targetIndex = tierOrder.indexOf(tier.id);
                      const isUpgrade = targetIndex > currentIndex;
                      
                      return (
                        <div key={tier.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-400 transition">
                          <p className="font-bold text-gray-900 mb-1">
                            {language === 'ms' ? tier.nameMs : tier.name}
                          </p>
                          <p className="text-sm text-gray-600 mb-3">
                            RM {tier.monthlyPrice}/{language === 'ms' ? 'bulan' : 'month'}
                          </p>
                          <button
                            onClick={() => isUpgrade ? handleUpgradePlan(tier.id) : handleDowngradePlan(tier.id)}
                            disabled={loading}
                            className={`w-full text-sm font-bold py-2 px-4 rounded-lg transition ${
                              isUpgrade 
                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800' 
                                : 'bg-gray-600 text-white hover:bg-gray-700'
                            } disabled:opacity-50`}
                          >
                            {loading ? (language === 'ms' ? 'Memproses...' : 'Processing...') : (
                              isUpgrade 
                                ? (language === 'ms' ? '⬆️ Naik Taraf' : '⬆️ Upgrade')
                                : (language === 'ms' ? '⬇️ Turun Taraf' : '⬇️ Downgrade')
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Support */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl p-6 shadow-xl border-2 border-yellow-200"
                >
                  <h3 className="text-xl font-black text-gray-900 mb-4">
                    {language === 'ms' ? 'Perlukan Bantuan?' : 'Need Help?'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {language === 'ms' 
                      ? 'Hubungi pasukan sokongan kami untuk sebarang pertanyaan mengenai pembayaran.'
                      : 'Contact our support team for any questions about payments.'
                    }
                  </p>
                  <Link href="/contact">
                    <Button className="w-full bg-yellow-400 text-green-900 hover:bg-yellow-500 py-2 font-bold">
                      {language === 'ms' ? '📞 Hubungi Sokongan' : '📞 Contact Support'}
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}

