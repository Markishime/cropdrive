'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { getIdToken } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle2,
  Crown,
  Loader2,
  User,
  Mail,
  FileText
} from 'lucide-react';
import Button from './ui/Button';
import toast from 'react-hot-toast';

interface SupportFormProps {
  locale?: string;
}

interface LimitStatus {
  canSend: boolean;
  monthlyCount: number;
  limit: number;
  plan: string;
}

export default function SupportForm({ locale = 'en' }: SupportFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingLimit, setIsCheckingLimit] = useState(true);
  const [limitStatus, setLimitStatus] = useState<LimitStatus | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Check user's message limit
  useEffect(() => {
    if (!user) return;

    const checkLimit = async () => {
      try {
        setIsCheckingLimit(true);

        // Get Firebase ID token
        const idToken = await getIdToken(auth.currentUser!, false);

        const response = await fetch('/api/check-support-limit', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLimitStatus(data);
        } else {
          // Default to allowing messages if API fails
          setLimitStatus({
            canSend: true,
            monthlyCount: 0,
            limit: 5,
            plan: 'smart'
          });
        }
      } catch (error) {
        console.error('Error checking limit:', error);
        // Default to allowing messages if API fails
        setLimitStatus({
          canSend: true,
          monthlyCount: 0,
          limit: 5,
          plan: 'smart'
        });
      } finally {
        setIsCheckingLimit(false);
      }
    };

    checkLimit();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !limitStatus?.canSend) return;

    if (!message.trim()) {
      toast.error(locale === 'ms' ? 'Mesej diperlukan' : 'Message is required');
      return;
    }

    if (message.length > 5000) {
      toast.error(locale === 'ms' ? 'Mesej terlalu panjang. Maksimum 5000 aksara.' : 'Message too long. Maximum 5000 characters.');
      return;
    }

    setIsLoading(true);

    try {
      // Get Firebase ID token
      const idToken = await getIdToken(auth.currentUser!, false);

      const response = await fetch('/api/submit-support-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          subject: subject.trim() || undefined,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setSubject('');
        setMessage('');
        // Update limit status
        setLimitStatus(prev => prev ? {
          ...prev,
          monthlyCount: data.monthlyCount,
          canSend: data.limit === -1 || data.monthlyCount < data.limit
        } : null);
        toast.success(locale === 'ms' ? 'Mesej sokongan berjaya dihantar!' : 'Support message sent successfully!');
      } else if (response.status === 429) {
        // Limit exceeded
        setLimitStatus(prev => prev ? {
          ...prev,
          canSend: false,
          monthlyCount: data.used
        } : null);
        toast.error(locale === 'ms' ? 'Had bulanan dicapai' : 'Monthly limit exceeded');
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Error submitting support message:', error);
      toast.error(locale === 'ms' ? 'Gagal menghantar mesej' : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!limitStatus || !user) return;

    setIsLoading(true);

    try {
      // Always upgrade to Precision for unlimited support messages
      const targetPlan = 'precision';

      // Get Firebase ID token
      const idToken = await getIdToken(auth.currentUser!, false);

      // Create checkout session via API
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          planId: targetPlan,
          isYearly: false, // Default to monthly
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        toast.loading(
          locale === 'ms'
            ? '🔄 Mengalihkan ke Stripe...'
            : '🔄 Redirecting to Stripe...',
          { duration: 2000 }
        );
        // Redirect to Stripe checkout
        setTimeout(() => {
          window.location.href = url;
        }, 500);
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast.error(
        locale === 'ms'
          ? `Ralat: ${error.message || 'Gagal membuat sesi pembayaran'}`
          : `Error: ${error.message || 'Failed to create checkout session'}`
      );
      setIsLoading(false);
    }
  };

  if (isCheckingLimit) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-palm-600" />
        <span className="ml-3 text-soil-600">
          {locale === 'ms' ? 'Memeriksa had mesej...' : 'Checking message limit...'}
        </span>
      </div>
    );
  }

  if (!limitStatus) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-soil-600">
          {locale === 'ms' ? 'Gagal memuatkan status had' : 'Failed to load limit status'}
        </p>
      </div>
    );
  }

  // Limit exceeded view
  if (!limitStatus.canSend && !submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gold-50 to-palm-50 backdrop-blur-xl border-l-4 border-gold-500 rounded-2xl p-8 shadow-lg"
      >
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gold-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-brown-900 mb-4">
            {locale === 'ms' ? 'Had Bulanan Dicapai' : 'Monthly Limit Reached'}
          </h3>
          <p className="text-soil-700 mb-6 max-w-md mx-auto">
            {locale === 'ms'
              ? `Anda telah mencapai had ${limitStatus.limit} mesej sokongan untuk bulan ini pada pelan ${limitStatus.plan.toUpperCase()}.`
              : `You've reached your ${limitStatus.limit} support message limit for this month on the ${limitStatus.plan.toUpperCase()} plan.`
            }
          </p>

          <div className="bg-white/80 rounded-xl p-4 mb-6 max-w-sm mx-auto">
            <div className="flex items-center justify-between text-sm">
              <span className="text-soil-600">
                {locale === 'ms' ? 'Digunakan:' : 'Used:'}
              </span>
              <span className="font-bold text-brown-900">
                {limitStatus.monthlyCount} / {limitStatus.limit === -1 ? '∞' : limitStatus.limit}
              </span>
            </div>
          </div>

          <p className="text-sm text-soil-600 mb-6">
            {locale === 'ms'
              ? 'Had akan ditetapkan semula pada hari pertama bulan berikutnya.'
              : 'The limit will reset on the first day of next month.'
            }
          </p>

          {limitStatus.plan !== 'precision' && (
            <div className="space-y-4">
              <p className="text-soil-700 font-medium">
                {locale === 'ms' ? 'Naik taraf sekarang untuk akses tanpa had!' : 'Upgrade now for unlimited access!'}
              </p>
              <Button
                onClick={handleUpgrade}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center"
              >
                <Crown className="w-5 h-5 mr-2 text-white" />
                <span className="text-white">
                  {locale === 'ms' ? 'Naik Taraf ke Precision' : 'Upgrade to Precision'}
                </span>
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Success view
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-brown-900 mb-4">
          {locale === 'ms' ? 'Mesej Dihantar!' : 'Message Sent!'}
        </h3>
        <p className="text-soil-600 mb-6">
          {locale === 'ms'
            ? 'Pasukan sokongan kami akan menghubungi anda secepat mungkin.'
            : 'Our support team will get back to you as soon as possible.'
          }
        </p>
        <Button
          onClick={() => setSubmitted(false)}
          variant="outline"
          className="border-palm-300 text-palm-700 hover:bg-palm-50"
        >
          {locale === 'ms' ? 'Hantar Mesej Lain' : 'Send Another Message'}
        </Button>
      </motion.div>
    );
  }

  // Main form view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-earth-200 shadow-lg"
    >
      {/* User Info Header */}
      <div className="bg-gradient-to-r from-palm-50 to-gold-50 rounded-xl p-4 mb-6 border border-palm-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-palm-gradient rounded-full flex items-center justify-center text-white font-bold">
            {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <p className="font-bold text-brown-900 text-sm">{user?.displayName || 'User'}</p>
            <p className="text-xs text-soil-600">{user?.email}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-soil-600">
              {locale === 'ms' ? 'Pelan:' : 'Plan:'}
            </div>
            <div className="font-bold text-palm-700 text-sm uppercase">
              {limitStatus.plan}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Info */}
      <div className="bg-earth-50 rounded-lg p-3 mb-6 border border-earth-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-soil-600 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            {locale === 'ms' ? 'Mesej bulan ini:' : 'Messages this month:'}
          </span>
          <span className="font-bold text-brown-900">
            {limitStatus.monthlyCount} / {limitStatus.limit === -1 ? '∞' : limitStatus.limit}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject Field (Optional) */}
        <div>
          <label className="block text-sm font-bold text-brown-900 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-palm-600" />
            {locale === 'ms' ? 'Subjek (Pilihan)' : 'Subject (Optional)'}
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={locale === 'ms' ? 'Ringkasan isu anda...' : 'Brief summary of your issue...'}
            className="w-full px-4 py-3 rounded-xl border border-earth-300 focus:border-palm-400 focus:ring-2 focus:ring-palm-200 transition-all bg-white/80"
            maxLength={200}
          />
        </div>

        {/* Message Field (Required) */}
        <div>
          <label className="block text-sm font-bold text-brown-900 mb-2 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-palm-600" />
            {locale === 'ms' ? 'Mesej *' : 'Message *'}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={locale === 'ms'
              ? 'Sila terangkan isu atau soalan anda dengan terperinci...'
              : 'Please describe your issue or question in detail...'
            }
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-earth-300 focus:border-palm-400 focus:ring-2 focus:ring-palm-200 transition-all bg-white/80 resize-vertical"
            maxLength={5000}
            required
          />
          <div className="text-xs text-soil-500 mt-1 text-right">
            {message.length}/5000
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || !message.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : (
            <Send className="w-5 h-5 text-white" />
          )}
          <span className="text-white">
            {isLoading
              ? (locale === 'ms' ? 'Menghantar...' : 'Sending...')
              : (locale === 'ms' ? 'Hantar Mesej Sokongan' : 'Send Support Message')
            }
          </span>
        </motion.button>
      </form>

      {/* Footer Note */}
      <div className="mt-6 text-center">
        <p className="text-xs text-soil-500">
          {locale === 'ms'
            ? 'Pasukan sokongan kami akan membalas dalam 12-16 jam.'
            : 'Our support team will respond within 12-16 hours.'
          }
        </p>
      </div>
    </motion.div>
  );
}
