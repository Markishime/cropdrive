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
  canUndoCancellation?: boolean;
}

export default function PaymentMethodPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
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
    try {
      const lang = (localStorage.getItem('cropdrive-language') || 'en') as 'en' | 'ms';
      setCurrentLang(lang);
    } catch (e) {
      // localStorage might not be available
      setCurrentLang('en');
    }
  }, []);

  const { language } = useTranslation(mounted ? currentLang : 'en');

  // Fetch invoices from Stripe
  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoadingInvoices(true);
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        console.warn('No Firebase user found');
        return;
      }
      
      const token = await firebaseUser.getIdToken();
      console.log('📄 Fetching invoices...');
      
      const response = await fetch('/api/stripe/invoices', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Invoices fetched:', data.invoices?.length || 0, 'invoices');
        console.log('📊 Response status:', response.status, 'Success:', data.success);
        
        // Convert ISO date strings to Date objects for proper handling
        const processedInvoices = (data.invoices || []).map((invoice: any) => ({
          ...invoice,
          date: new Date(invoice.date),
          periodStart: invoice.periodStart ? new Date(invoice.periodStart) : null,
          periodEnd: invoice.periodEnd ? new Date(invoice.periodEnd) : null,
        }));
        
        setInvoices(processedInvoices);
      } else {
        const errorData = await response.json();
        console.error('❌ Error fetching invoices:', errorData);
        toast.error(
          language === 'ms' 
            ? 'Gagal memuatkan invois' 
            : 'Failed to load invoices'
        );
      }
    } catch (error) {
      console.error('❌ Error fetching invoices:', error);
      toast.error(
        language === 'ms' 
          ? 'Ralat memuatkan invois' 
          : 'Error loading invoices'
      );
    } finally {
      setLoadingInvoices(false);
    }
  }, [user, language]);

  // Sync subscription data from Stripe
  const syncSubscription = useCallback(async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;
      
      const token = await firebaseUser.getIdToken();
      console.log('🔄 Syncing subscription data from Stripe...');
      
      const response = await fetch('/api/stripe/sync-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Sync result:', data);
        return data.subscription;
      }
      return null;
    } catch (error) {
      console.error('❌ Error syncing subscription:', error);
      return null;
    }
  }, []);

  // Fetch subscription details from Stripe
  const fetchSubscription = useCallback(async (showErrorToast = true) => {
    if (!user) return;
    
    try {
      setLoadingSubscription(true);
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        console.warn('No Firebase user found');
        return;
      }
      
      const token = await firebaseUser.getIdToken();
      console.log('💳 Fetching subscription details...');
      
      const response = await fetch('/api/stripe/subscription', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Subscription fetched:', data.subscription);
        console.log('📊 Response status:', response.status, 'Success:', data.success);
        console.log('📊 User stripeSubscriptionId:', user?.stripeSubscriptionId);
        
        // If no subscription but user has an active plan, try to sync
        if (!data.subscription && user?.plan && user.plan !== 'none') {
          console.log('⚠️ User has plan but no subscription data, attempting sync...');
          const syncedSubscription = await syncSubscription();
          
          if (syncedSubscription) {
            console.log('✅ Synced subscription:', syncedSubscription);
            setSubscription(syncedSubscription);
            setAutoRenewal(!syncedSubscription.cancelAtPeriodEnd);
            
            // Refresh user data to get updated subscription info
            if (refreshUser) {
              await refreshUser();
            }
            return;
          }
        }
        
        // Set subscription even if null (to indicate we've checked)
        // This is NOT an error - user might not have a subscription
        setSubscription(data.subscription);
        
        if (data.subscription) {
          setAutoRenewal(!data.subscription.cancelAtPeriodEnd);
          console.log('✅ Auto-renewal state set to:', !data.subscription.cancelAtPeriodEnd);
          console.log('💳 Payment method:', data.subscription.paymentMethod);
        } else if (user?.stripeSubscriptionId) {
          // User has subscription ID but API returned null - might be a timing issue
          console.warn('⚠️ User has stripeSubscriptionId but API returned null subscription');
          // Don't set autoRenewal state if no subscription data
          // Don't show error - this is not necessarily an error state
        }
        // If subscription is null and no subscription ID, that's fine - user just doesn't have one
      } else {
        // Only show error if response is NOT ok (500, 404, etc.)
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Error fetching subscription:', errorData);
        console.error('📊 Response status:', response.status);
        
        // If no subscription ID and user has a plan, try to sync
        if (errorData.error === 'No active subscription' && user?.plan && user.plan !== 'none') {
          console.log('⚠️ No subscription ID but user has plan, attempting sync...');
          const syncedSubscription = await syncSubscription();
          
          if (syncedSubscription) {
            console.log('✅ Synced subscription:', syncedSubscription);
            setSubscription(syncedSubscription);
            setAutoRenewal(!syncedSubscription.cancelAtPeriodEnd);
            
            // Refresh user data to get updated subscription info
            if (refreshUser) {
              await refreshUser();
            }
            return;
          }
        }
        
        // Only show error toast for actual errors (500, network errors, etc.)
        // Don't show error for 404 or "No active subscription" - those are valid states
        if (showErrorToast && response.status >= 500) {
          toast.error(
            language === 'ms' 
              ? 'Gagal memuatkan butiran langganan' 
              : 'Failed to load subscription details'
          );
        }
        
        // If user has subscription ID but API failed, don't clear subscription state
        // This allows buttons to remain enabled if subscription was previously loaded
        if (!user?.stripeSubscriptionId && response.status >= 500) {
          setSubscription(null);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching subscription:', error);
      if (showErrorToast) {
      toast.error(
        language === 'ms' 
          ? 'Ralat memuatkan butiran langganan' 
          : 'Error loading subscription details'
      );
      }
    } finally {
      setLoadingSubscription(false);
    }
  }, [user, language, syncSubscription, refreshUser]);

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

  // Sync uploads based on actual analysis_results count
  const syncUploads = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/sync-uploads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.synced) {
          console.log('✅ Payment Method: Uploads synced:', data);
          // Refresh user data to get updated uploadsUsed
          if (refreshUser) {
            await refreshUser();
          }
        }
      }
    } catch (error) {
      console.error('❌ Payment Method: Error syncing uploads:', error);
    }
  }, [user?.uid, refreshUser]);

  // Listen for analysis report saved events to refresh user data and sync uploads
  useEffect(() => {
    if (!mounted || !refreshUser || !user?.uid) return;
    
    const handleReportSaved = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const eventUserId = customEvent.detail?.userId;
      const currentUserId = user.uid;
      
      console.log('📢 Payment Method: Received analysisReportSaved event', {
        eventUserId,
        currentUserId,
        reportId: customEvent.detail?.reportId
      });
      
      // Only refresh if the event is for the current user
      if (!eventUserId || eventUserId === currentUserId) {
        console.log('✅ Payment Method: Syncing uploads and refreshing user data...');
        await syncUploads();
        await refreshUser();
        console.log('✅ Payment Method: User data refreshed from Firestore');
      } else {
        console.log('⚠️ Payment Method: Ignoring event - user ID mismatch');
      }
    };
    
    window.addEventListener('analysisReportSaved', handleReportSaved);
    return () => {
      window.removeEventListener('analysisReportSaved', handleReportSaved);
    };
  }, [mounted, refreshUser, user?.uid, syncUploads]);

  // Sync uploads on page load
  useEffect(() => {
    if (mounted && user?.uid) {
      syncUploads();
    }
  }, [mounted, user?.uid, syncUploads]);

  // Auto-refresh subscription data periodically
  useEffect(() => {
    if (!user || !user.plan || user.plan === 'none') return;

    // Refresh every 30 seconds to keep data up to date
    const refreshInterval = setInterval(() => {
      fetchSubscription(false); // Silent refresh
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, [user, fetchSubscription]);

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

  // Check if user has a subscription
  const hasSubscription = !!subscription;

  const currentPlan = getPricingTierById(user.plan);
  // Ensure uploadsUsed and uploadsLimit are numbers (handle undefined/null)
  const uploadsUsed = user.uploadsUsed ?? 0;
  const uploadsLimit = user.uploadsLimit ?? 0;
  const uploadPercentage = uploadsLimit === -1 ? 100 : uploadsLimit > 0 ? (uploadsUsed / uploadsLimit) * 100 : 0;
  const isUploadLimitExceeded = uploadsLimit !== -1 && uploadsUsed >= uploadsLimit;
  const billingCycle = user.billingCycle || 'monthly';
  const subscriptionInterval = subscription?.billingCycle || (billingCycle === 'yearly' ? 'year' : 'month');
  const isMonthlySubscription = subscriptionInterval === 'month';
  const isYearlySubscription = subscriptionInterval === 'year';
  const canSelfCancel = isYearlySubscription;



  const handleToggleAutoRenewal = async () => {
    setUpdatingAutoRenewal(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        toast.error(language === 'ms' ? 'Sesi tamat. Sila log masuk semula.' : 'Session expired. Please login again.');
        setUpdatingAutoRenewal(false);
        return;
      }
      
      const token = await firebaseUser.getIdToken();
      
      // First, sync subscription if we don't have subscription data
      if (!subscription && user?.plan && user.plan !== 'none') {
        console.log('🔄 No subscription data for auto-renewal toggle, syncing first...');
        const syncedSubscription = await syncSubscription();
        
        if (syncedSubscription) {
          setSubscription(syncedSubscription);
          if (refreshUser) await refreshUser();
        } else {
          toast.error(
            language === 'ms' 
              ? 'Tiada langganan aktif ditemui. Sila hubungi sokongan.' 
              : 'No active subscription found. Please contact support.'
          );
          setUpdatingAutoRenewal(false);
          return;
        }
      }
      
      // First, try to get current subscription state from API
      let currentCancelAtPeriodEnd = false;
      try {
        const subscriptionResponse = await fetch('/api/stripe/subscription', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (subscriptionResponse.ok) {
          const subscriptionData = await subscriptionResponse.json();
          if (subscriptionData.subscription) {
            currentCancelAtPeriodEnd = subscriptionData.subscription.cancelAtPeriodEnd || false;
            // Update local state
            setSubscription(subscriptionData.subscription);
            setAutoRenewal(!currentCancelAtPeriodEnd);
          }
        }
      } catch (error) {
        console.warn('Could not fetch current subscription state, using local state:', error);
        // Use local subscription state if available, otherwise use autoRenewal state
        currentCancelAtPeriodEnd = subscription?.cancelAtPeriodEnd ?? !autoRenewal;
      }
      
      // Toggle the state
      const newCancelAtPeriodEnd = !currentCancelAtPeriodEnd;
      
      console.log('Sending PATCH request to toggle auto-renewal', { 
        newCancelAtPeriodEnd,
        currentState: currentCancelAtPeriodEnd
      });
      
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
      
      const data = await response.json();
      console.log('API response:', { ok: response.ok, status: response.status, success: data.success, data });
      
      if (response.ok && data.success !== false) {
        setAutoRenewal(!data.cancelAtPeriodEnd);
        setSubscription(prev => prev ? { ...prev, cancelAtPeriodEnd: data.cancelAtPeriodEnd } : subscription ? { ...subscription, cancelAtPeriodEnd: data.cancelAtPeriodEnd } : null);
        
        // Refresh subscription data to get updated payment method and status
        await fetchSubscription();
        
        // Refresh user data to get updated subscription status
        if (refreshUser) {
          await refreshUser();
        }
        
        // Use API message if available, otherwise use default
        const successMessage = data.message || (
          data.cancelAtPeriodEnd
            ? (language === 'ms' 
                ? '🔄 Pembaharuan auto dimatikan. Langganan anda akan kekal aktif sehingga akhir tempoh.' 
                : '🔄 Auto-renewal turned off. Your subscription will remain active until the end of the period.')
            : (language === 'ms' 
                ? '🔄 Pembaharuan auto dihidupkan. Langganan akan diperbaharui secara automatik.' 
                : '🔄 Auto-renewal turned on. Subscription will renew automatically.')
        );
        
        toast.success(successMessage, {
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#10b981',
            color: '#fff',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '600',
          },
        });
      } else {
        throw new Error(data.error || data.details || 'Failed to update');
      }
    } catch (error: any) {
      console.error('Error toggling auto-renewal:', error);
      toast.error(
        language === 'ms' 
          ? `Ralat mengemas kini: ${error.message}` 
          : `Error updating: ${error.message}`
      );
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
      
      const data = await response.json();
      console.log('📊 Billing settings response:', { ok: response.ok, status: response.status, success: data.success });
      
      if (response.ok && data.success !== false) {
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
      console.log('📊 Billing portal response:', { ok: response.ok, status: response.status, success: data.success, hasUrl: !!data.url });
      
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
      
      // First, try to sync subscription if we don't have subscription data
      if (!subscription) {
        console.log('🔄 No subscription data, syncing first...');
        const syncedSubscription = await syncSubscription();
        
        if (syncedSubscription) {
          setSubscription(syncedSubscription);
          if (refreshUser) await refreshUser();
        }
      }
      
      // Now proceed with the cancellation request
      const response = await fetch('/api/stripe/subscription', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      console.log('📊 Cancel subscription response:', { ok: response.ok, status: response.status, success: data.success, data });
      
      if (response.ok && data.success !== false) {
        // Use the message from API if available
        const successMessage = data.message || (
          data.pendingContractCancellation
            ? (language === 'ms' 
                ? `✅ Pembatalan dijadualkan untuk ${data.contractCancellationDate ? new Date(data.contractCancellationDate).toLocaleDateString('ms-MY') : 'akhir kontrak'}. Pembayaran bulanan akan diteruskan.` 
                : `✅ Cancellation scheduled for ${data.contractCancellationDate ? new Date(data.contractCancellationDate).toLocaleDateString() : 'contract end'}. Monthly payments will continue.`)
            : (language === 'ms' 
                ? '✅ Langganan akan dibatalkan pada akhir tempoh bil' 
                : '✅ Subscription will be cancelled at end of billing period')
        );
        
        toast.success(successMessage, {
          duration: 5000,
          style: {
            borderRadius: '12px',
            background: '#f59e0b',
            color: '#fff',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '600',
          },
        });
        
        // Refresh data
        await fetchSubscription();
        if (refreshUser) await refreshUser();
      } else {
        // If still no subscription after sync, show helpful message
        if (data.error === 'No active subscription') {
          toast.error(
            language === 'ms' 
              ? '❌ Tiada langganan aktif ditemui. Sila hubungi sokongan jika anda mempunyai langganan.' 
              : '❌ No active subscription found. Please contact support if you have a subscription.',
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
        } else {
          throw new Error(data.error || 'Failed to cancel');
        }
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
      console.log('📊 Reactivate subscription response:', { ok: response.ok, status: response.status, success: data.success, data });
      
      if (response.ok && data.success !== false) {
        const successMessage = data.message || (
          language === 'ms' 
            ? '🎉 Pembatalan telah dibatalkan! Langganan anda akan diteruskan seperti biasa.' 
            : '🎉 Cancellation undone! Your subscription will continue normally.'
        );
        
        toast.success(successMessage, {
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#10b981',
            color: '#fff',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '600',
          },
        });
        
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

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Invalid date';
    }
    return date.toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', {
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
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-green-900" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight break-words">
                        {language === 'ms' ? 'Pengurusan' : 'Subscription'}
                      </h1>
                      <span className="text-amber-400 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black break-words">
                        {language === 'ms' ? 'Langganan' : 'Management'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base lg:text-lg text-white/80 flex items-center gap-2">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0" />
                    <span className="break-words">{language === 'ms' ? 'Urus langganan dan bil anda dengan selamat' : 'Manage your subscriptions and billing securely'}</span>
                  </p>
                </div>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-3 sm:gap-4 w-full lg:w-auto">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 border border-white/20 flex-1 sm:flex-none min-w-[140px]">
                    <p className="text-white/70 text-xs font-medium mb-1">
                      {language === 'ms' ? 'Pelan Semasa' : 'Current Plan'}
                    </p>
                    <p className="text-white font-black text-base sm:text-lg truncate">{currentPlan?.name || 'N/A'}</p>
                  </div>
                  {daysUntilRenewal !== null && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 border border-white/20 flex-1 sm:flex-none min-w-[140px]">
                      <p className="text-white/70 text-xs font-medium mb-1">
                        {language === 'ms' ? 'Pembaharuan Dalam' : 'Renews In'}
                      </p>
                      <p className="text-amber-400 font-black text-base sm:text-lg">{daysUntilRenewal} {language === 'ms' ? 'hari' : 'days'}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-6 sm:py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
                {/* Current Plan Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border border-gray-100 overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-green-100 to-transparent rounded-bl-full opacity-50"></div>
                  
                  <div className="relative">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                        {language === 'ms' ? 'Pelan Semasa' : 'Current Plan'}
                      </h2>
                      <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold self-start sm:self-auto ${
                        subscription?.status === 'canceled' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {subscription?.status === 'canceled' 
                          ? (language === 'ms' ? 'Dibatalkan' : 'Cancelled')
                          : (language === 'ms' ? 'Aktif' : 'Active')
                        }
                      </span>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-amber-50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 border-green-200 mb-4 sm:mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1 break-words">
                            {language === 'ms' ? currentPlan?.nameMs : currentPlan?.name}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600 break-words">
                            {language === 'ms' ? currentPlan?.taglineMs : currentPlan?.tagline}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                              billingCycle === 'yearly' 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {billingCycle === 'yearly' 
                                ? (language === 'ms' ? 'Bayar Pendahuluan' : 'Pay Upfront')
                                : (language === 'ms' ? 'Bayar Mengikut Masa' : 'Pay Over Time')
                              }
                            </span>
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl sm:text-4xl font-black text-green-700">
                              RM{billingCycle === 'yearly' ? currentPlan?.yearlyPrice : currentPlan?.monthlyPrice}
                            </span>
                          </div>
                          <span className="text-sm sm:text-base text-gray-500">
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
                          {uploadsUsed} / {uploadsLimit === -1 ? '∞' : uploadsLimit}
                        </span>
                      </div>
                      {uploadsLimit !== -1 && (
                        <div className="relative">
                          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(uploadPercentage, 100)}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${
                                isUploadLimitExceeded 
                                  ? 'bg-gradient-to-r from-red-500 to-red-700' 
                                  : uploadPercentage > 80 
                                    ? 'bg-gradient-to-r from-amber-500 to-red-500' 
                                    : 'bg-gradient-to-r from-green-500 to-green-700'
                              }`}
                            />
                          </div>
                          <p className={`text-xs mt-2 font-semibold ${
                            isUploadLimitExceeded 
                              ? 'text-red-600' 
                              : uploadPercentage > 80 
                                ? 'text-amber-600' 
                                : 'text-gray-500'
                          }`}>
                            {isUploadLimitExceeded
                              ? (language === 'ms' ? '❌ Had tercapai - Naik taraf untuk terus menganalisis' : '❌ Limit reached - Upgrade to continue analyzing')
                              : uploadPercentage > 80 
                              ? (language === 'ms' ? '⚠️ Hampir mencapai had' : '⚠️ Approaching limit')
                              : (language === 'ms' ? 'Penggunaan normal' : 'Normal usage')
                            }
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Next Billing Info */}
                    {subscription && (
                      <div className={`rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 ${
                        subscription.status === 'canceled' 
                          ? 'bg-amber-50 border-2 border-amber-200' 
                          : 'bg-gray-50'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Clock className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${subscription.status === 'canceled' ? 'text-amber-600' : 'text-gray-500'}`} />
                            <div className="min-w-0">
                              <p className={`text-xs sm:text-sm font-bold ${subscription.status === 'canceled' ? 'text-amber-700' : 'text-gray-700'}`}>
                                {subscription.status === 'canceled' 
                                  ? (language === 'ms' ? 'Akses Tamat' : 'Access Ends')
                                  : (language === 'ms' ? 'Bil Seterusnya' : 'Next Billing')
                                }
                              </p>
                              <p className={`text-xs ${subscription.status === 'canceled' ? 'text-amber-600' : 'text-gray-500'} break-words`}>
                                {formatDate(subscription.currentPeriodEnd)}
                              </p>
                            </div>
                          </div>
                          {subscription.status !== 'canceled' && (
                            <p className="text-base sm:text-lg font-black text-green-600 sm:ml-4">
                              RM{billingCycle === 'yearly' ? currentPlan?.yearlyPrice : currentPlan?.monthlyPrice}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Subscription Cancelled - Service Continues Until Period End */}
                    {subscription?.status === 'canceled' && subscription?.currentPeriodEnd && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl p-4 sm:p-5 md:p-6 mb-6 text-white"
                      >
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                          <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold mb-2 text-base sm:text-lg">
                              {language === 'ms' 
                                ? 'Langganan Dibatalkan' 
                                : 'Subscription Cancelled'}
                            </p>
                            <p className="text-sm sm:text-base text-white/90 mb-3 sm:mb-4 leading-relaxed">
                              {language === 'ms' 
                                ? `Langganan anda telah dibatalkan. Walau bagaimanapun, anda masih boleh menggunakan semua ciri dan perkhidmatan sehingga ${formatDate(subscription.currentPeriodEnd)} (akhir tempoh pembayaran tahun semasa). Untuk meneruskan selepas tarikh ini, sila langgan pelan baharu.`
                                : `Your subscription has been cancelled. However, you can still use all features and services until ${formatDate(subscription.currentPeriodEnd)} (end of current payment year). To continue after this date, please subscribe to a new plan.`}
                            </p>
                            <Link href="/pricing" className="inline-block w-full sm:w-auto">
                              <Button className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 py-2.5 px-5 sm:px-6 font-bold rounded-lg shadow-md text-sm sm:text-base transition-colors">
                                {language === 'ms' ? 'Langgan Pelan Baru' : 'Subscribe to New Plan'}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Pending Contract Cancellation Banner (for installment Option A) */}
                    {subscription?.pendingContractCancellation && subscription?.contractCancellationDate && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 text-white"
                      >
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold mb-2 text-base sm:text-lg">
                              {language === 'ms' 
                                ? 'Pembatalan Dijadualkan' 
                                : 'Cancellation Scheduled'}
                            </p>
                            <p className="text-sm sm:text-base text-white/90 mb-3 sm:mb-4 leading-relaxed break-words">
                              {language === 'ms' 
                                ? `Langganan anda akan diteruskan dengan bayaran ansuran bulanan sehingga ${new Date(subscription.contractCancellationDate).toLocaleDateString('ms-MY')} (akhir tahun kontrak), kemudian dibatalkan secara automatik.`
                                : `Your subscription will continue with monthly installment payments until ${new Date(subscription.contractCancellationDate).toLocaleDateString()} (end of contract year), then be automatically cancelled.`}
                            </p>
                            <Button
                              onClick={handleReactivateSubscription}
                              disabled={loading}
                              className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 py-2.5 px-5 sm:px-6 font-bold rounded-lg shadow-md text-sm sm:text-base"
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
                    <div className="flex flex-col gap-4">
                      <Link href="/pricing">
                        <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 py-3 font-bold rounded-xl shadow-lg">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          {subscription?.status === 'canceled' || subscription?.pendingContractCancellation
                            ? (language === 'ms' ? 'Langgan Pelan Baru' : 'Subscribe New Plan')
                            : (language === 'ms' ? 'Naik Taraf' : 'Upgrade')
                          }
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>

                {/* Payment Method Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                      <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
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
                  ) : (() => {
                    const paymentMethod = subscription?.paymentMethod || user?.paymentMethod;
                    if (!paymentMethod) {
                      return (
                        <div className="bg-gray-50 rounded-xl p-6 text-center">
                          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">
                            {language === 'ms' ? 'Tiada kaedah bayaran' : 'No payment method on file'}
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                    <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/5 rounded-full -ml-8 -mb-8 sm:-ml-12 sm:-mb-12"></div>
                      
                      <div className="relative">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-10 h-6 sm:w-12 sm:h-8 bg-amber-400 rounded flex items-center justify-center flex-shrink-0">
                              <div className="w-6 h-4 sm:w-8 sm:h-6 bg-amber-500 rounded-sm"></div>
                            </div>
                            <span className="text-xs sm:text-sm font-semibold opacity-90 capitalize">
                                {paymentMethod.brand}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/20 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto">
                            <CheckCircle className="w-3 h-3" />
                            {language === 'ms' ? 'Disahkan' : 'Verified'}
                          </div>
                        </div>
                        
                        <p className="text-lg sm:text-xl font-mono mb-3 sm:mb-4 tracking-wider break-all sm:break-normal">
                          {showCardDetails 
                              ? `•••• •••• •••• ${paymentMethod.last4}`
                            : '•••• •••• •••• ••••'
                          }
                        </p>
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-0">
                          <div className="min-w-0">
                            <p className="text-xs opacity-70 mb-1">
                              {language === 'ms' ? 'Pemegang Kad' : 'Card Holder'}
                            </p>
                            <p className="font-bold text-sm sm:text-base truncate">{user.displayName || user.email}</p>
                          </div>
                          <div className="text-left sm:text-right flex-shrink-0">
                            <p className="text-xs opacity-70 mb-1">
                              {language === 'ms' ? 'Tamat' : 'Expires'}
                            </p>
                            <p className="font-bold text-sm sm:text-base">
                              {showCardDetails 
                                  ? `${String(paymentMethod.expMonth).padStart(2, '0')}/${paymentMethod.expYear}`
                                : '••/••'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })()}
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>{language === 'ms' ? 'Dilindungi dengan penyulitan SSL' : 'Protected with SSL encryption'}</span>
                  </div>
                  
                  {/* Manage Payment Method Button */}
                  {subscription && (
                    <div className="mt-6">
                      <Button
                        onClick={handleOpenBillingPortal}
                        disabled={creatingPortalSession}
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-700 text-white hover:from-violet-700 hover:to-purple-800 py-3 font-bold rounded-xl shadow-lg"
                      >
                        {creatingPortalSession ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Settings className="w-4 h-4 mr-2" />
                        )}
                        {language === 'ms' ? 'Urus Kaedah Pembayaran' : 'Manage Payment Method'}
                      </Button>
                    </div>
                  )}
                </motion.div>

                {/* Billing Settings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border border-gray-100"
                >
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                    {language === 'ms' ? 'Tetapan Bil' : 'Billing Settings'}
                  </h2>


                  <div className="space-y-3 sm:space-y-4">
                    {/* Auto Renewal Toggle */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-5 bg-gradient-to-r from-green-50 to-white rounded-xl sm:rounded-2xl border border-green-100 hover:border-green-200 transition">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${autoRenewal ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <RefreshCw className={`w-5 h-5 sm:w-6 sm:h-6 ${autoRenewal ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 text-sm sm:text-base">
                            {language === 'ms' ? 'Pembaharuan Automatik' : 'Auto Renewal'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 break-words">
                            {autoRenewal
                                ? (subscriptionInterval === 'year'
                                    ? (language === 'ms' ? 'Langganan akan diperbaharui secara automatik setiap tahun' : 'Subscription will renew automatically every year')
                                    : (language === 'ms' ? 'Langganan akan diperbaharui secara automatik setiap bulan' : 'Subscription will renew automatically every month'))
                                : (subscriptionInterval === 'year'
                                    ? (language === 'ms' ? 'Langganan akan kekal aktif sehingga akhir tahun, tetapi tidak akan diperbaharui secara automatik selepas itu' : 'Subscription will remain active until the end of the year, but will not renew automatically after that')
                                    : (language === 'ms' ? 'Langganan akan kekal aktif sehingga akhir bulan, tetapi tidak akan diperbaharui secara automatik selepas itu' : 'Subscription will remain active until the end of the month, but will not renew automatically after that'))
                              }
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleAutoRenewal}
                        aria-label={language === 'ms' ? 'Togol pembaharuan automatik' : 'Toggle auto renewal'}
                        title={language === 'ms' ? 'Togol pembaharuan automatik' : 'Toggle auto renewal'}
                        className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                          updatingAutoRenewal
                            ? 'opacity-70' 
                            : ''
                        } ${autoRenewal ? 'bg-green-600' : 'bg-gray-300'}`}
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-white rounded-xl sm:rounded-2xl border border-blue-100 hover:border-blue-200 transition">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${emailNotifications ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Mail className={`w-5 h-5 sm:w-6 sm:h-6 ${emailNotifications ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 text-sm sm:text-base">
                            {language === 'ms' ? 'Pemberitahuan Email' : 'Email Notifications'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 break-words">
                            {language === 'ms' ? 'Terima invois & kemas kini bil melalui email' : 'Receive invoices & billing updates via email'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleToggleEmailNotifications}
                        disabled={updatingEmailNotifications}
                        aria-label={language === 'ms' ? 'Togol pemberitahuan email' : 'Toggle email notifications'}
                        title={language === 'ms' ? 'Togol pemberitahuan email' : 'Toggle email notifications'}
                        className={`relative w-14 h-7 rounded-full transition-colors disabled:opacity-50 flex-shrink-0 ${
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
                    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl border transition ${
                      subscription?.pendingContractCancellation 
                        ? 'bg-gradient-to-r from-amber-50 to-white border-amber-200 hover:border-amber-300'
                        : 'bg-gradient-to-r from-red-50 to-white border-red-100 hover:border-red-200'
                    }`}>
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          subscription?.pendingContractCancellation ? 'bg-amber-100' : 'bg-red-100'
                        }`}>
                          {subscription?.pendingContractCancellation ? (
                            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                          ) : (
                            <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 text-sm sm:text-base">
                            {subscription?.pendingContractCancellation
                              ? (language === 'ms' ? 'Pembatalan Dijadualkan' : 'Cancellation Scheduled')
                              : (language === 'ms' ? 'Batalkan Langganan' : 'Cancel Subscription')
                            }
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 break-words">
                            {subscription?.pendingContractCancellation
                              ? (language === 'ms'
                                  ? `Langganan anda akan dibatalkan pada ${subscription.contractCancellationDate ? new Date(subscription.contractCancellationDate).toLocaleDateString('ms-MY') : 'akhir kontrak'}. Pembayaran bulanan akan diteruskan sehingga tarikh tersebut dan anda masih boleh menggunakan semua perkhidmatan.`
                                  : `Your subscription will be cancelled on ${subscription.contractCancellationDate ? new Date(subscription.contractCancellationDate).toLocaleDateString() : 'end of contract'}. Monthly payments will continue until then and you can still use all services.`)
                              : subscription?.cancelAtPeriodEnd
                                ? (language === 'ms'
                                    ? 'Langganan anda akan tamat pada akhir tempoh bil semasa.'
                                    : 'Your subscription will end at the end of the current billing period.')
                                : (language === 'ms'
                                    ? 'Pembatalan akan menjadualkan penamatan pada akhir tahun kontrak 12 bulan anda. Pembayaran bulanan akan diteruskan sehingga tarikh tersebut.'
                                    : 'Cancellation will schedule termination at the end of your 12-month contract year. Monthly payments will continue until then.')
                            }
                          </p>
                        </div>
                      </div>
                      {subscription?.pendingContractCancellation || subscription?.cancelAtPeriodEnd ? (
                        <button
                          type="button"
                          onClick={handleReactivateSubscription}
                          disabled={loading || loadingSubscription}
                          className="w-full sm:w-auto bg-green-600 text-white hover:bg-green-700 py-2.5 px-5 sm:px-6 font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              {language === 'ms' ? 'Batal Pembatalan' : 'Undo Cancellation'}
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowCancelModal(true)}
                          disabled={loading || loadingSubscription || subscription?.status === 'canceled'}
                          className={`w-full sm:w-auto py-2.5 px-5 sm:px-6 font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-70 ${
                            subscription?.status === 'canceled'
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {loading || loadingSubscription ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : subscription?.status === 'canceled' ? (
                            language === 'ms' ? 'Dibatalkan' : 'Cancelled'
                          ) : (
                            language === 'ms' ? 'Batal' : 'Cancel'
                          )}
                        </button>
                      )}
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
                                  RM {tier.monthlyPrice}/{language === 'ms' ? 'mo' : 'mo'} ({language === 'ms' ? 'Jumlah: ' : 'Total: '}{tier.monthlyPrice * 12} RM)
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
                className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    {language === 'ms' ? 'Jadualkan Pembatalan?' : 'Schedule Cancellation?'}
                  </h3>
                  
                  {isMonthlySubscription && subscription && !subscription.isBeyondContractYear ? (
                    <div className="text-left bg-amber-50 rounded-xl p-4 mb-4 border border-amber-200">
                      <p className="text-gray-700 font-semibold mb-2">
                        {language === 'ms' ? '📋 Butiran Kontrak 12 Bulan:' : '📋 12-Month Contract Details:'}
                      </p>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          {language === 'ms' 
                            ? `Pembayaran bulanan akan diteruskan sehingga ${subscription.contractYearEnd ? new Date(subscription.contractYearEnd).toLocaleDateString('ms-MY') : 'akhir kontrak'}`
                            : `Monthly payments will continue until ${subscription.contractYearEnd ? new Date(subscription.contractYearEnd).toLocaleDateString() : 'contract end'}`
                          }
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">•</span>
                          {language === 'ms' 
                            ? 'Anda masih boleh menggunakan semua perkhidmatan termasuk AI assistant'
                            : 'You can still use all services including AI assistant'
                          }
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          {language === 'ms' 
                            ? 'Anda boleh membatalkan pembatalan ini bila-bila masa sebelum akhir kontrak'
                            : 'You can undo this cancellation anytime before contract end'
                          }
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-500 mt-0.5">•</span>
                          {language === 'ms' 
                            ? `Baki bulan dalam kontrak: ${subscription.remainingMonths || 0} bulan`
                            : `Remaining months in contract: ${subscription.remainingMonths || 0} months`
                          }
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-600 mb-4">
                      {language === 'ms'
                        ? 'Pembatalan akan berkuat kuasa pada akhir tempoh bil semasa. Perkhidmatan akan berterusan sehingga tarikh tersebut.'
                        : 'Cancellation will take effect at the end of the current billing period. Services will continue until then.'
                      }
                    </p>
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
                    className="flex-1 bg-amber-600 text-white hover:bg-amber-700 py-3 font-bold rounded-xl"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      language === 'ms' ? 'Ya, Jadualkan' : 'Yes, Schedule'
                    )}
                  </Button>
                </div>
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
