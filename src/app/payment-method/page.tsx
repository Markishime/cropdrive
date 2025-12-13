'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/i18n';
import { getPricingTierById, PRICING_TIERS } from '@/lib/subscriptions';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';
import { auth } from '@/lib/firebase';
import { 
  CreditCard, 
  Download, 
  X, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Bell,
  Shield,
  Zap,
  BarChart3,
  Eye,
  EyeOff,
  Settings,
  Lock,
  Mail,
  FileText,
  RefreshCw,
  Copy,
  ExternalLink,
  Loader2,
  Clock,
  TrendingUp,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface StripeInvoice {
  id: string;
  number: string | null;
  amount: number;
  currency: string;
  status: string | null;
  date: string;
  periodStart: string | null;
  periodEnd: string | null;
  pdfUrl: string | null;
  hostedUrl: string | null;
  description: string;
  planName: string;
}

interface SubscriptionData {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
  billingCycle: string;
  paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
  // Monthly contract year fields
  subscriptionStartDate?: string;
  contractYearEnd?: string;
  monthsUsed?: number;
  remainingMonths?: number;
  isBeyondContractYear?: boolean;
  priceId?: string;
  unitAmount?: number; // Monthly price in cents
  currency?: string;
  pendingContractCancellation?: boolean;
  contractCancellationDate?: string;
}

export default function PaymentMethodPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showMonthlyCancelModal, setShowMonthlyCancelModal] = useState(false);
  const [monthlyCancelLoading, setMonthlyCancelLoading] = useState(false);
  const [showAllInvoicesModal, setShowAllInvoicesModal] = useState(false);
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [invoices, setInvoices] = useState<StripeInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [updatingAutoRenewal, setUpdatingAutoRenewal] = useState(false);
  const [updatingEmailNotifications, setUpdatingEmailNotifications] = useState(false);
  const [creatingPortalSession, setCreatingPortalSession] = useState(false);
  
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const lang = (localStorage.getItem('cropdrive-language') || 'en') as 'en' | 'ms';
    setCurrentLang(lang);
  }, []);

  const { language } = useTranslation(mounted ? currentLang : 'en');

  // Fetch invoices from Stripe
  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoadingInvoices(true);
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/stripe/invoices', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoadingInvoices(false);
    }
  }, [user]);

  // Fetch subscription details from Stripe
  const fetchSubscription = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoadingSubscription(true);
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/stripe/subscription', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        if (data.subscription) {
          setAutoRenewal(!data.subscription.cancelAtPeriodEnd);
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  }, [user]);

  // Fetch billing settings
  const fetchBillingSettings = useCallback(async () => {
    if (!user) return;
    
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/stripe/billing-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmailNotifications(data.settings?.emailNotifications ?? true);
      }
    } catch (error) {
      console.error('Error fetching billing settings:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && (user.plan === 'none' || !user.plan)) {
      router.push('/pricing');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.plan && user.plan !== 'none') {
      fetchInvoices();
      fetchSubscription();
      fetchBillingSettings();
    }
  }, [user, fetchInvoices, fetchSubscription, fetchBillingSettings]);

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
  const billingCycle = user.billingCycle || 'monthly';
  const subscriptionInterval = subscription?.billingCycle || (billingCycle === 'yearly' ? 'year' : 'month');
  const isMonthlySubscription = subscriptionInterval === 'month';
  const isYearlySubscription = subscriptionInterval === 'year';
  const canSelfCancel = isYearlySubscription;

  const handleToggleAutoRenewal = async () => {
    if (!subscription) return;
    if (isMonthlySubscription) {
      toast.error(
        language === 'ms'
          ? 'Pelan bulanan memerlukan komitmen 12 bulan. Hubungi sokongan untuk pembatalan.'
          : 'Monthly plans have a 12-month minimum. Please contact support to cancel.'
      );
      return;
    }
    
    setUpdatingAutoRenewal(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      
      const token = await firebaseUser.getIdToken();
      const newCancelAtPeriodEnd = !subscription.cancelAtPeriodEnd;
      
      const response = await fetch('/api/stripe/subscription', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle_auto_renewal',
          cancelAtPeriodEnd: newCancelAtPeriodEnd,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAutoRenewal(!data.cancelAtPeriodEnd);
        setSubscription(prev => prev ? { ...prev, cancelAtPeriodEnd: data.cancelAtPeriodEnd } : null);
        
        toast.success(
          data.cancelAtPeriodEnd
            ? (language === 'ms' ? '🔄 Pembaharuan auto dimatikan' : '🔄 Auto-renewal turned off')
            : (language === 'ms' ? '🔄 Pembaharuan auto dihidupkan' : '🔄 Auto-renewal turned on'),
          {
            duration: 3000,
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
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Error toggling auto-renewal:', error);
      toast.error(language === 'ms' ? 'Ralat mengemas kini' : 'Error updating');
    } finally {
      setUpdatingAutoRenewal(false);
    }
  };

  const handleToggleEmailNotifications = async () => {
    setUpdatingEmailNotifications(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      
      const token = await firebaseUser.getIdToken();
      const newValue = !emailNotifications;
      
      const response = await fetch('/api/stripe/billing-settings', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailNotifications: newValue,
        }),
      });
      
      if (response.ok) {
        setEmailNotifications(newValue);
        toast.success(
          newValue
            ? (language === 'ms' ? '📧 Pemberitahuan email dihidupkan' : '📧 Email notifications turned on')
            : (language === 'ms' ? '📧 Pemberitahuan email dimatikan' : '📧 Email notifications turned off'),
          {
            duration: 3000,
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
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Error toggling email notifications:', error);
      toast.error(language === 'ms' ? 'Ralat mengemas kini' : 'Error updating');
    } finally {
      setUpdatingEmailNotifications(false);
    }
  };

  const handleOpenBillingPortal = async () => {
    if (!subscription) {
      toast.error(
        language === 'ms'
          ? 'Tiada langganan aktif untuk diurus'
          : 'No active subscription to manage'
      );
      return;
    }

    try {
      setCreatingPortalSession(true);
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('Not authenticated');
      }

      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      toast.loading(
        language === 'ms'
          ? '🔄 Membuka portal Stripe...'
          : '🔄 Opening Stripe portal...',
        { duration: 1200 }
      );

      window.location.href = data.url;
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error(
        language === 'ms'
          ? 'Tidak dapat membuka portal bil'
          : 'Unable to open billing portal'
      );
    } finally {
      setCreatingPortalSession(false);
    }
  };

  const handleCopyInvoiceId = (invoiceId: string) => {
    navigator.clipboard.writeText(invoiceId);
    toast.success(
      language === 'ms' ? '📋 ID invois disalin!' : '📋 Invoice ID copied!',
      {
        duration: 2000,
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '600',
        },
      }
    );
  };

  const handleDownloadInvoice = (invoice: StripeInvoice) => {
    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank');
      toast.success(
        language === 'ms' 
          ? `⬇️ Memuat turun invois...` 
          : `⬇️ Downloading invoice...`,
        {
          duration: 2000,
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
    } else if (invoice.hostedUrl) {
      window.open(invoice.hostedUrl, '_blank');
    } else {
      toast.error(language === 'ms' ? 'Invois tidak tersedia' : 'Invoice not available');
    }
  };

  const handleCancelSubscription = async () => {
    setShowCancelModal(false);
    setLoading(true);
    
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('Not authenticated');
      
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/stripe/subscription', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(
          language === 'ms' 
            ? '✅ Langganan akan dibatalkan pada akhir tempoh bil' 
            : '✅ Subscription will be cancelled at end of billing period',
          {
            duration: 4000,
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
        
        // Refresh data
        await fetchSubscription();
        if (refreshUser) await refreshUser();
      } else {
        throw new Error(data.error || 'Failed to cancel');
      }
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      toast.error(
        language === 'ms' 
          ? `❌ Ralat membatalkan langganan: ${error.message}` 
          : `❌ Error cancelling subscription: ${error.message}`,
        {
          duration: 5000,
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

  // Handle monthly cancellation with options A or B
  const handleMonthlyCancellation = async (option: 'A' | 'B') => {
    setMonthlyCancelLoading(true);
    
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('Not authenticated');
      
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/stripe/cancel-monthly', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ option }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setShowMonthlyCancelModal(false);
        
        if (option === 'A') {
          toast.success(
            language === 'ms' 
              ? `✅ Langganan akan diteruskan sehingga ${new Date(data.contractYearEnd).toLocaleDateString('ms-MY')} dan kemudian dibatalkan.`
              : `✅ Subscription will continue until ${new Date(data.contractYearEnd).toLocaleDateString()} and then be cancelled.`,
            {
              duration: 6000,
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
        } else {
          toast.success(
            language === 'ms' 
              ? `✅ Pembayaran berjaya. Langganan dibatalkan selepas membayar ${data.remainingMonthsPaid} bulan baki.`
              : `✅ Payment successful. Subscription cancelled after paying ${data.remainingMonthsPaid} remaining month(s).`,
            {
              duration: 6000,
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
        }
        
        // Refresh data
        await fetchSubscription();
        if (refreshUser) await refreshUser();
      } else if (data.invoiceUrl) {
        // Payment failed, show link to pay invoice
        setShowMonthlyCancelModal(false);
        toast.error(
          language === 'ms' 
            ? `Pembayaran gagal. Sila bayar invois untuk melengkapkan pembatalan.`
            : `Payment failed. Please pay the invoice to complete cancellation.`,
          {
            duration: 8000,
            style: {
              borderRadius: '12px',
              background: '#f59e0b',
              color: '#fff',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '600',
            },
          }
        );
        window.open(data.invoiceUrl, '_blank');
      } else {
        throw new Error(data.error || 'Failed to cancel');
      }
    } catch (error: any) {
      console.error('Monthly cancellation error:', error);
      toast.error(
        language === 'ms' 
          ? `❌ Ralat membatalkan langganan: ${error.message}` 
          : `❌ Error cancelling subscription: ${error.message}`,
        {
          duration: 5000,
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
      setMonthlyCancelLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setLoading(true);
    
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('Not authenticated');
      
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/stripe/subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(
          language === 'ms' 
            ? '🎉 Langganan telah diaktifkan semula!' 
            : '🎉 Subscription has been reactivated!',
          {
            duration: 4000,
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
        
        // Refresh data
        await fetchSubscription();
        if (refreshUser) await refreshUser();
      } else {
        if (data.expired) {
          toast.error(
            language === 'ms' 
              ? '⚠️ Tempoh langganan telah tamat. Sila langgan pelan baru.' 
              : '⚠️ Subscription period has ended. Please subscribe to a new plan.',
            {
              duration: 5000,
              style: {
                borderRadius: '12px',
                background: '#f59e0b',
                color: '#fff',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '600',
              },
            }
          );
          router.push('/pricing');
        } else {
          throw new Error(data.error || 'Failed to reactivate');
        }
      }
    } catch (error: any) {
      console.error('Reactivate subscription error:', error);
      toast.error(
        language === 'ms' 
          ? `❌ Ralat mengaktifkan semula langganan: ${error.message}` 
          : `❌ Error reactivating subscription: ${error.message}`,
        {
          duration: 5000,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilRenewal = () => {
    if (!subscription?.currentPeriodEnd) return null;
    const endDate = new Date(subscription.currentPeriodEnd);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilRenewal = getDaysUntilRenewal();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        {/* Enhanced Header */}
        <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-12 sm:py-16 lg:py-20 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400/10 rounded-full blur-3xl"></div>
            <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-dot-grid opacity-80"></div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                      <CreditCard className="w-6 h-6 text-green-900" />
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
                        {language === 'ms' ? 'Pengurusan' : 'Subscription'}
                      </h1>
                      <span className="text-amber-400 text-3xl sm:text-4xl md:text-5xl font-black">
                        {language === 'ms' ? 'Langganan' : 'Management'}
                      </span>
                    </div>
                  </div>
                  <p className="text-lg text-white/80 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-400" />
                    {language === 'ms' ? 'Urus langganan dan bil anda dengan selamat' : 'Manage your subscriptions and billing securely'}
                  </p>
                </div>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                    <p className="text-white/70 text-xs font-medium mb-1">
                      {language === 'ms' ? 'Pelan Semasa' : 'Current Plan'}
                    </p>
                    <p className="text-white font-black text-lg">{currentPlan?.name || 'N/A'}</p>
                  </div>
                  {daysUntilRenewal !== null && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                      <p className="text-white/70 text-xs font-medium mb-1">
                        {language === 'ms' ? 'Pembaharuan Dalam' : 'Renews In'}
                      </p>
                      <p className="text-amber-400 font-black text-lg">{daysUntilRenewal} {language === 'ms' ? 'hari' : 'days'}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Current Plan Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-100 to-transparent rounded-bl-full opacity-50"></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-amber-500" />
                        {language === 'ms' ? 'Pelan Semasa' : 'Current Plan'}
                      </h2>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        subscription?.cancelAtPeriodEnd 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {subscription?.cancelAtPeriodEnd 
                          ? (language === 'ms' ? 'Akan Dibatalkan' : 'Cancelling')
                          : (language === 'ms' ? 'Aktif' : 'Active')
                        }
                      </span>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-amber-50 p-6 rounded-2xl border-2 border-green-200 mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="text-3xl font-black text-gray-900 mb-1">
                            {language === 'ms' ? currentPlan?.nameMs : currentPlan?.name}
                          </h3>
                          <p className="text-gray-600">
                            {language === 'ms' ? currentPlan?.taglineMs : currentPlan?.tagline}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              billingCycle === 'yearly' 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {billingCycle === 'yearly' 
                                ? (language === 'ms' ? 'Tahunan' : 'Yearly')
                                : (language === 'ms' ? 'Bulanan' : 'Monthly')
                              }
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-green-700">
                              RM{billingCycle === 'yearly' ? currentPlan?.yearlyPrice : currentPlan?.monthlyPrice}
                            </span>
                          </div>
                          <span className="text-gray-500">
                            /{billingCycle === 'yearly' ? (language === 'ms' ? 'tahun' : 'year') : (language === 'ms' ? 'bulan' : 'month')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Upload Usage */}
                    <div className="mb-6">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-green-600" />
                          {language === 'ms' ? 'Penggunaan Muat Naik' : 'Upload Usage'}
                        </span>
                        <span className="text-sm font-black text-gray-900">
                          {user.uploadsUsed} / {user.uploadsLimit === -1 ? '∞' : user.uploadsLimit}
                        </span>
                      </div>
                      {user.uploadsLimit !== -1 && (
                        <div className="relative">
                          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(uploadPercentage, 100)}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${
                                uploadPercentage > 80 ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-green-500 to-green-700'
                              }`}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {uploadPercentage > 80 
                              ? (language === 'ms' ? '⚠️ Hampir mencapai had' : '⚠️ Approaching limit')
                              : (language === 'ms' ? 'Penggunaan normal' : 'Normal usage')
                            }
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Next Billing Info */}
                    {subscription && (
                      <div className={`rounded-xl p-4 mb-6 ${
                        subscription.cancelAtPeriodEnd 
                          ? 'bg-amber-50 border-2 border-amber-200' 
                          : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock className={`w-5 h-5 ${subscription.cancelAtPeriodEnd ? 'text-amber-600' : 'text-gray-500'}`} />
                            <div>
                              <p className={`text-sm font-bold ${subscription.cancelAtPeriodEnd ? 'text-amber-700' : 'text-gray-700'}`}>
                                {subscription.cancelAtPeriodEnd 
                                  ? (language === 'ms' ? 'Langganan Tamat' : 'Subscription Ends')
                                  : (language === 'ms' ? 'Bil Seterusnya' : 'Next Billing')
                                }
                              </p>
                              <p className={`text-xs ${subscription.cancelAtPeriodEnd ? 'text-amber-600' : 'text-gray-500'}`}>
                                {formatDate(subscription.currentPeriodEnd)}
                              </p>
                            </div>
                          </div>
                          {!subscription.cancelAtPeriodEnd && (
                            <p className="text-lg font-black text-green-600">
                              RM{billingCycle === 'yearly' ? currentPlan?.yearlyPrice : currentPlan?.monthlyPrice}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cancellation Warning Banner */}
                    {subscription?.cancelAtPeriodEnd && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 mb-6 text-white"
                      >
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-bold mb-1">
                              {language === 'ms' 
                                ? 'Langganan Anda Akan Dibatalkan' 
                                : 'Your Subscription Will Be Cancelled'}
                            </p>
                            <p className="text-sm text-white/90 mb-3">
                              {language === 'ms' 
                                ? `Anda masih boleh menggunakan semua ciri sehingga ${formatDate(subscription.currentPeriodEnd)}. Selepas itu, anda tidak akan dapat mengakses pembantu AI.`
                                : `You can still use all features until ${formatDate(subscription.currentPeriodEnd)}. After that, you won't be able to access the AI assistant.`}
                            </p>
                            <Button
                              onClick={handleReactivateSubscription}
                              disabled={loading}
                              className="bg-white text-amber-600 hover:bg-amber-50 py-2 px-4 font-bold rounded-lg shadow-md text-sm"
                            >
                              {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4 mr-2" />
                              )}
                              {language === 'ms' ? 'Aktifkan Semula Langganan' : 'Reactivate Subscription'}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Pending Contract Cancellation Banner (for monthly Option A) */}
                    {subscription?.pendingContractCancellation && subscription?.contractCancellationDate && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 mb-6 text-white"
                      >
                        <div className="flex items-start gap-3">
                          <Calendar className="w-6 h-6 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-bold mb-1">
                              {language === 'ms' 
                                ? 'Pembatalan Dijadualkan' 
                                : 'Cancellation Scheduled'}
                            </p>
                            <p className="text-sm text-white/90 mb-3">
                              {language === 'ms' 
                                ? `Langganan anda akan diteruskan dengan bayaran bulanan sehingga ${new Date(subscription.contractCancellationDate).toLocaleDateString('ms-MY')} (akhir tahun kontrak), kemudian dibatalkan secara automatik.`
                                : `Your subscription will continue with monthly payments until ${new Date(subscription.contractCancellationDate).toLocaleDateString()} (end of contract year), then be automatically cancelled.`}
                            </p>
                            <Button
                              onClick={handleReactivateSubscription}
                              disabled={loading}
                              className="bg-white text-blue-600 hover:bg-blue-50 py-2 px-4 font-bold rounded-lg shadow-md text-sm"
                            >
                              {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4 mr-2" />
                              )}
                              {language === 'ms' ? 'Batalkan Pembatalan' : 'Cancel Cancellation'}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Link href="/pricing">
                        <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 py-3 font-bold rounded-xl shadow-lg">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          {subscription?.cancelAtPeriodEnd || subscription?.pendingContractCancellation
                            ? (language === 'ms' ? 'Langgan Pelan Baru' : 'Subscribe New Plan')
                            : (language === 'ms' ? 'Naik Taraf' : 'Upgrade')
                          }
                        </Button>
                      </Link>
                      {subscription?.cancelAtPeriodEnd || subscription?.pendingContractCancellation ? (
                        <Button 
                          onClick={handleReactivateSubscription}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 py-3 font-bold rounded-xl shadow-lg"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                          )}
                          {language === 'ms' ? 'Aktifkan Semula' : 'Reactivate'}
                        </Button>
                      ) : isYearlySubscription ? (
                        <Button 
                          onClick={() => setShowCancelModal(true)}
                          disabled={loading}
                          className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 font-bold rounded-xl disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <X className="w-4 h-4 mr-2" />
                          )}
                          {language === 'ms' ? 'Batalkan' : 'Cancel'}
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => setShowMonthlyCancelModal(true)}
                          disabled={loading}
                          className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 font-bold rounded-xl disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <X className="w-4 h-4 mr-2" />
                          )}
                          {language === 'ms' ? 'Batalkan' : 'Cancel'}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Payment Method Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-violet-600" />
                      {language === 'ms' ? 'Kaedah Bayaran' : 'Payment Method'}
                    </h2>
                    <button
                      onClick={() => setShowCardDetails(!showCardDetails)}
                      aria-label={showCardDetails ? (language === 'ms' ? 'Sorok butiran kad' : 'Hide card details') : (language === 'ms' ? 'Tunjuk butiran kad' : 'Show card details')}
                      title={showCardDetails ? (language === 'ms' ? 'Sorok butiran kad' : 'Hide card details') : (language === 'ms' ? 'Tunjuk butiran kad' : 'Show card details')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      {showCardDetails ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>

                  {loadingSubscription ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                    </div>
                  ) : subscription?.paymentMethod ? (
                    <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
                      
                      <div className="relative">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 bg-amber-400 rounded flex items-center justify-center">
                              <div className="w-8 h-6 bg-amber-500 rounded-sm"></div>
                            </div>
                            <span className="text-sm font-semibold opacity-90 capitalize">
                              {subscription.paymentMethod.brand}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                            <CheckCircle className="w-3 h-3" />
                            {language === 'ms' ? 'Disahkan' : 'Verified'}
                          </div>
                        </div>
                        
                        <p className="text-xl font-mono mb-4 tracking-wider">
                          {showCardDetails 
                            ? `•••• •••• •••• ${subscription.paymentMethod.last4}`
                            : '•••• •••• •••• ••••'
                          }
                        </p>
                        
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs opacity-70 mb-1">
                              {language === 'ms' ? 'Pemegang Kad' : 'Card Holder'}
                            </p>
                            <p className="font-bold">{user.displayName || user.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs opacity-70 mb-1">
                              {language === 'ms' ? 'Tamat' : 'Expires'}
                            </p>
                            <p className="font-bold">
                              {showCardDetails 
                                ? `${String(subscription.paymentMethod.expMonth).padStart(2, '0')}/${subscription.paymentMethod.expYear}`
                                : '••/••'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {language === 'ms' ? 'Tiada kaedah bayaran' : 'No payment method on file'}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>{language === 'ms' ? 'Dilindungi dengan penyulitan SSL' : 'Protected with SSL encryption'}</span>
                  </div>
                </motion.div>

                {/* Billing Settings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
                >
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-6">
                    <Settings className="w-6 h-6 text-gray-700" />
                    {language === 'ms' ? 'Tetapan Bil' : 'Billing Settings'}
                  </h2>

                  <div className="space-y-4">
                    {/* Auto Renewal Toggle */}
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-50 to-white rounded-2xl border border-green-100 hover:border-green-200 transition">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${autoRenewal ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <RefreshCw className={`w-6 h-6 ${autoRenewal ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {language === 'ms' ? 'Pembaharuan Automatik' : 'Auto Renewal'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {isMonthlySubscription
                              ? (language === 'ms'
                                  ? 'Pelan bulanan mempunyai komitmen 12 bulan. Hubungi sokongan untuk pembatalan.'
                                  : 'Monthly plans carry a 12-month commitment. Contact support to cancel.')
                              : autoRenewal 
                                ? (language === 'ms' ? 'Langganan akan diperbaharui secara automatik' : 'Subscription will renew automatically')
                                : (language === 'ms' ? 'Langganan akan tamat pada akhir tempoh' : 'Subscription will end at period end')
                              }
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleToggleAutoRenewal}
                        disabled={updatingAutoRenewal || !subscription || isMonthlySubscription}
                        aria-label={language === 'ms' ? 'Togol pembaharuan automatik' : 'Toggle auto renewal'}
                        title={language === 'ms' ? 'Togol pembaharuan automatik' : 'Toggle auto renewal'}
                        className={`relative w-14 h-7 rounded-full transition-colors disabled:opacity-50 ${
                          autoRenewal ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        {updatingAutoRenewal ? (
                          <Loader2 className="w-4 h-4 animate-spin absolute top-1.5 left-1/2 -translate-x-1/2 text-white" />
                        ) : (
                          <motion.div
                            animate={{ x: autoRenewal ? 28 : 2 }}
                            className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                          />
                        )}
                      </button>
                    </div>

                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 hover:border-blue-200 transition">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${emailNotifications ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Mail className={`w-6 h-6 ${emailNotifications ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {language === 'ms' ? 'Pemberitahuan Email' : 'Email Notifications'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {language === 'ms' ? 'Terima invois & kemas kini bil melalui email' : 'Receive invoices & billing updates via email'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleToggleEmailNotifications}
                        disabled={updatingEmailNotifications}
                        aria-label={language === 'ms' ? 'Togol pemberitahuan email' : 'Toggle email notifications'}
                        title={language === 'ms' ? 'Togol pemberitahuan email' : 'Toggle email notifications'}
                        className={`relative w-14 h-7 rounded-full transition-colors disabled:opacity-50 ${
                          emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        {updatingEmailNotifications ? (
                          <Loader2 className="w-4 h-4 animate-spin absolute top-1.5 left-1/2 -translate-x-1/2 text-white" />
                        ) : (
                          <motion.div
                            animate={{ x: emailNotifications ? 28 : 2 }}
                            className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                          />
                        )}
                      </button>
                    </div>

                    {/* Cancel Subscription Button */}
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-red-50 to-white rounded-2xl border border-red-100 hover:border-red-200 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-100">
                          <X className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {language === 'ms' ? 'Batalkan Langganan' : 'Cancel Subscription'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {subscription?.pendingContractCancellation
                              ? (language === 'ms'
                                  ? `Pembatalan dijadualkan untuk ${subscription.contractCancellationDate ? new Date(subscription.contractCancellationDate).toLocaleDateString('ms-MY') : 'akhir kontrak'}.`
                                  : `Cancellation scheduled for ${subscription.contractCancellationDate ? new Date(subscription.contractCancellationDate).toLocaleDateString() : 'end of contract'}.`)
                              : isMonthlySubscription
                                ? (language === 'ms'
                                    ? 'Pelan bulanan mempunyai komitmen 12 bulan. Pilih cara pembatalan.'
                                    : 'Monthly plans have a 12-month commitment. Choose cancellation option.')
                                : (language === 'ms'
                                    ? 'Pembatalan akan berkuat kuasa serta-merta. Perkhidmatan akan berterusan sehingga akhir kitaran bil.'
                                    : 'Cancellation will take effect immediately. Services will continue until the end of billing cycle.')
                            }
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => isMonthlySubscription ? setShowMonthlyCancelModal(true) : setShowCancelModal(true)}
                        disabled={loading || !subscription || subscription.cancelAtPeriodEnd || subscription.pendingContractCancellation}
                        className="bg-red-600 text-white hover:bg-red-700 py-2 px-6 font-bold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : subscription?.pendingContractCancellation ? (
                          language === 'ms' ? 'Dijadualkan' : 'Scheduled'
                        ) : (
                          language === 'ms' ? 'Batal' : 'Cancel'
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Invoice History */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                      <FileText className="w-6 h-6 text-green-600" />
                      {language === 'ms' ? 'Sejarah Invois' : 'Invoice History'}
                    </h2>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                      {invoices.length} {language === 'ms' ? 'invois' : 'invoices'}
                    </span>
                  </div>
                  
                  {loadingInvoices ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {language === 'ms' ? 'Tiada invois lagi' : 'No invoices yet'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {invoices.slice(0, 3).map((invoice) => (
                          <motion.div 
                            key={invoice.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.01 }}
                            className="group"
                          >
                            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-green-200 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                  <FileText className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-gray-900">
                                      {invoice.number || invoice.id.slice(0, 14)}
                                    </p>
                                    <button
                                      onClick={() => handleCopyInvoiceId(invoice.number || invoice.id)}
                                      aria-label={language === 'ms' ? 'Salin ID invois' : 'Copy invoice ID'}
                                      title={language === 'ms' ? 'Salin ID invois' : 'Copy invoice ID'}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                                    >
                                      <Copy className="w-3 h-3 text-gray-500" />
                                    </button>
                                  </div>
                                  <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(invoice.date)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-xl font-black text-gray-900">
                                    {invoice.currency} {invoice.amount.toFixed(2)}
                                  </p>
                                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold ${
                                    invoice.status === 'paid' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    <CheckCircle className="w-3 h-3" />
                                    {invoice.status === 'paid' 
                                      ? (language === 'ms' ? 'Dibayar' : 'Paid')
                                      : invoice.status
                                    }
                                  </span>
                                </div>
                                
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDownloadInvoice(invoice)}
                                  aria-label={language === 'ms' ? 'Muat turun invois' : 'Download invoice'}
                                  title={language === 'ms' ? 'Muat turun invois' : 'Download invoice'}
                                  className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                                >
                                  <Download className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {invoices.length > 3 && (
                        <div className="mt-6 text-center">
                          <button 
                            onClick={() => setShowAllInvoicesModal(true)}
                            className="text-green-600 hover:text-green-700 font-bold flex items-center gap-2 mx-auto group"
                          >
                            {language === 'ms' ? 'Lihat semua invois' : 'View all invoices'}
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-8">
                {/* Plan Comparison */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-br from-green-50 to-white rounded-3xl p-6 shadow-xl border border-green-100"
                >
                  <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-500" />
                    {language === 'ms' ? 'Pelan Lain' : 'Other Plans'}
                  </h3>
                  <div className="space-y-3">
                    {PRICING_TIERS.filter(tier => tier.id !== user.plan).map((tier) => {
                      const tierOrder = ['none', 'start', 'smart', 'precision'];
                      const currentIndex = tierOrder.indexOf(user.plan || 'none');
                      const targetIndex = tierOrder.indexOf(tier.id);
                      const isUpgrade = targetIndex > currentIndex;
                      
                      return (
                        <Link key={tier.id} href="/pricing">
                          <div className="p-4 bg-white rounded-xl border border-gray-100 hover:border-green-300 hover:shadow-md transition-all cursor-pointer group">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-gray-900 group-hover:text-green-700 transition">
                                  {language === 'ms' ? tier.nameMs : tier.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  RM {tier.monthlyPrice}/{language === 'ms' ? 'bulan' : 'month'}
                                </p>
                              </div>
                              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                isUpgrade 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {isUpgrade 
                                  ? (language === 'ms' ? 'Naik Taraf' : 'Upgrade')
                                  : (language === 'ms' ? 'Turun Taraf' : 'Downgrade')
                                }
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Support Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-green-600 to-green-800 rounded-3xl p-6 shadow-xl text-white"
                >
                  <h3 className="text-xl font-black mb-3 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    {language === 'ms' ? 'Perlukan Bantuan?' : 'Need Help?'}
                  </h3>
                  <p className="text-white/80 text-sm mb-4">
                    {language === 'ms' 
                      ? 'Hubungi pasukan sokongan kami untuk sebarang pertanyaan mengenai pembayaran.'
                      : 'Contact our support team for any questions about payments.'
                    }
                  </p>
                  <Link href="/support">
                    <Button className="w-full bg-yellow-500 text-white hover:bg-green-500 py-3 font-bold rounded-xl shadow-lg">
                      {language === 'ms' ? '📞 Hubungi Sokongan' : '📞 Contact Support'}
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Cancel Subscription Modal */}
        <AnimatePresence>
          {showCancelModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowCancelModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    {language === 'ms' ? 'Batalkan Langganan?' : 'Cancel Subscription?'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isMonthlySubscription
                      ? (language === 'ms' 
                          ? 'Pembatalan akan berkuat kuasa serta-merta. Pembayaran akan berterusan sehingga akhir kitaran bil (minimum 1 tahun komitmen). Perkhidmatan akan berterusan sehingga akhir tempoh bil semasa.'
                          : 'Cancellation will take effect immediately. Payments will continue until the end of billing cycle (minimum 1 year commitment). Services will continue until the end of the current billing period.')
                      : (language === 'ms' 
                          ? 'Pembatalan akan berkuat kuasa serta-merta. Perkhidmatan akan berterusan sehingga akhir tempoh bil semasa.'
                          : 'Cancellation will take effect immediately. Services will continue until the end of the current billing period.')
                    }
                  </p>
                  {isMonthlySubscription && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-amber-800">
                        {language === 'ms' 
                          ? '⚠️ Pelan bulanan mempunyai komitmen minimum 1 tahun. Pembayaran akan berterusan sehingga akhir kitaran bil.'
                          : '⚠️ Monthly plans have a minimum 1-year commitment. Payments will continue until the end of billing cycle.'
                        }
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 font-bold rounded-xl"
                  >
                    {language === 'ms' ? 'Kembali' : 'Go Back'}
                  </Button>
                  <Button
                    onClick={handleCancelSubscription}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white hover:bg-red-700 py-3 font-bold rounded-xl"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      language === 'ms' ? 'Ya, Batalkan' : 'Yes, Cancel'
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Monthly Cancel Modal */}
        <AnimatePresence>
          {showMonthlyCancelModal && subscription && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => !monthlyCancelLoading && setShowMonthlyCancelModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    {language === 'ms' ? 'Batalkan Langganan Bulanan' : 'Cancel Monthly Subscription'}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {language === 'ms' 
                      ? 'Pelan bulanan anda mempunyai komitmen 12 bulan. Sila pilih cara pembatalan:'
                      : 'Your monthly plan has a 12-month commitment. Please choose how to cancel:'}
                  </p>
                  
                  {/* Contract Info */}
                  <div className="bg-gray-50 rounded-xl p-4 mt-4 text-left">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">{language === 'ms' ? 'Mula langganan' : 'Subscription started'}</p>
                        <p className="font-bold text-gray-900">
                          {subscription.subscriptionStartDate 
                            ? new Date(subscription.subscriptionStartDate).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US')
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">{language === 'ms' ? 'Akhir tahun kontrak' : 'Contract year ends'}</p>
                        <p className="font-bold text-gray-900">
                          {subscription.contractYearEnd 
                            ? new Date(subscription.contractYearEnd).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US')
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">{language === 'ms' ? 'Bulan digunakan' : 'Months used'}</p>
                        <p className="font-bold text-gray-900">{subscription.monthsUsed ?? 0} / 12</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{language === 'ms' ? 'Bulan baki' : 'Months remaining'}</p>
                        <p className="font-bold text-amber-600">{subscription.remainingMonths ?? 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* If beyond contract year, show simple cancel */}
                {subscription.isBeyondContractYear ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-sm text-green-800">
                        {language === 'ms'
                          ? '✅ Anda telah melepasi tahun kontrak 12 bulan. Anda boleh membatalkan pada bila-bila masa.'
                          : '✅ You have passed your 12-month contract year. You can cancel anytime.'}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setShowMonthlyCancelModal(false)}
                        disabled={monthlyCancelLoading}
                        className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 font-bold rounded-xl"
                      >
                        {language === 'ms' ? 'Kembali' : 'Go Back'}
                      </Button>
                      <Button
                        onClick={handleCancelSubscription}
                        disabled={monthlyCancelLoading || loading}
                        className="flex-1 bg-red-600 text-white hover:bg-red-700 py-3 font-bold rounded-xl"
                      >
                        {monthlyCancelLoading || loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          language === 'ms' ? 'Batalkan Sekarang' : 'Cancel Now'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Option A */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleMonthlyCancellation('A')}
                      disabled={monthlyCancelLoading}
                      className="w-full p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all text-left disabled:opacity-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 mb-1">
                            {language === 'ms' 
                              ? 'Pilihan A: Teruskan sehingga akhir kontrak'
                              : 'Option A: Continue until contract end'}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            {language === 'ms'
                              ? `Teruskan bayaran bulanan untuk ${subscription.remainingMonths ?? 0} bulan lagi sehingga ${subscription.contractYearEnd ? new Date(subscription.contractYearEnd).toLocaleDateString('ms-MY') : 'akhir kontrak'}, kemudian batal secara automatik.`
                              : `Continue monthly payments for ${subscription.remainingMonths ?? 0} more month(s) until ${subscription.contractYearEnd ? new Date(subscription.contractYearEnd).toLocaleDateString() : 'contract end'}, then cancel automatically.`}
                          </p>
                          <p className="text-xs text-blue-600 font-semibold">
                            {language === 'ms' ? 'Tiada bayaran tambahan sekarang' : 'No extra payment now'}
                          </p>
                        </div>
                      </div>
                    </motion.button>

                    {/* Option B */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleMonthlyCancellation('B')}
                      disabled={monthlyCancelLoading}
                      className="w-full p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 hover:border-amber-400 transition-all text-left disabled:opacity-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 mb-1">
                            {language === 'ms' 
                              ? 'Pilihan B: Bayar baki sekarang dan berhenti'
                              : 'Option B: Pay remaining now and stop'}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            {language === 'ms'
                              ? `Bayar ${subscription.remainingMonths ?? 0} bulan baki sekarang (RM${((subscription.unitAmount || 0) / 100 * (subscription.remainingMonths ?? 0)).toFixed(2)}) dan batalkan langganan serta-merta.`
                              : `Pay ${subscription.remainingMonths ?? 0} remaining month(s) now (RM${((subscription.unitAmount || 0) / 100 * (subscription.remainingMonths ?? 0)).toFixed(2)}) and cancel subscription immediately.`}
                          </p>
                          <p className="text-xs text-amber-600 font-semibold">
                            {language === 'ms' 
                              ? `Jumlah: RM${((subscription.unitAmount || 0) / 100 * (subscription.remainingMonths ?? 0)).toFixed(2)}`
                              : `Total: RM${((subscription.unitAmount || 0) / 100 * (subscription.remainingMonths ?? 0)).toFixed(2)}`}
                          </p>
                        </div>
                      </div>
                    </motion.button>

                    {/* Cancel button */}
                    <Button
                      onClick={() => setShowMonthlyCancelModal(false)}
                      disabled={monthlyCancelLoading}
                      className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 font-bold rounded-xl mt-2"
                    >
                      {language === 'ms' ? 'Kembali' : 'Go Back'}
                    </Button>
                  </div>
                )}

                {monthlyCancelLoading && (
                  <div className="absolute inset-0 bg-white/80 rounded-3xl flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium">
                        {language === 'ms' ? 'Memproses...' : 'Processing...'}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All Invoices Modal */}
        <AnimatePresence>
          {showAllInvoicesModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAllInvoicesModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-green-600" />
                    {language === 'ms' ? 'Semua Invois' : 'All Invoices'}
                  </h3>
                  <button
                    onClick={() => setShowAllInvoicesModal(false)}
                    aria-label={language === 'ms' ? 'Tutup modal' : 'Close modal'}
                    title={language === 'ms' ? 'Tutup modal' : 'Close modal'}
                    className="p-2 hover:bg-gray-100 rounded-xl transition"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-3">
                  {invoices.map((invoice) => (
                    <div 
                      key={invoice.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{invoice.number || invoice.id.slice(0, 14)}</p>
                          <p className="text-sm text-gray-500">{formatDate(invoice.date)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{invoice.currency} {invoice.amount.toFixed(2)}</p>
                          <span className={`text-xs ${invoice.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                            {invoice.status === 'paid' ? (language === 'ms' ? 'Dibayar' : 'Paid') : invoice.status}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          aria-label={language === 'ms' ? 'Muat turun invois' : 'Download invoice'}
                          title={language === 'ms' ? 'Muat turun invois' : 'Download invoice'}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
