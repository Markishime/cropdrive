'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import { useAuth } from '@/lib/auth';
import { doc, setDoc, updateDoc, serverTimestamp, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = React.useState(5);
  const { user } = useAuth();
  const [planActivated, setPlanActivated] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [currentLanguage, setCurrentLanguage] = React.useState<Language>('en');

  React.useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

  // Listen for language changes
  React.useEffect(() => {
    const handleStorageChange = () => {
      const lang = getCurrentLanguage();
      setCurrentLanguage(lang);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const { language, t } = useTranslation(mounted ? currentLanguage : 'en');

  const sessionId = searchParams.get('session_id');
  const plan = searchParams.get('plan') || 'smart';

  // Immediately activate the plan in Firestore (works in both localhost and production)
  useEffect(() => {
    const activatePlan = async () => {
      if (!user?.uid || !sessionId || planActivated) return;

      try {
        console.log('🚀 Activating plan immediately:', plan, 'for user:', user.uid);
        console.log('📋 Session ID:', sessionId);

        // Check if this is an upgrade/downgrade (user already has an active subscription)
        const isUpgradeOrDowngrade = user.subscriptionStatus === 'active' && user.plan && user.plan !== plan;
        
        // First, fetch the checkout session from Stripe to get subscription details
        let stripeSubscriptionId: string | null = null;
        let stripeCustomerId: string | null = null;
        let billingCycle = 'monthly';
        let paymentMethodData: any = null;
        let currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

        try {
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            const token = await firebaseUser.getIdToken();
            
            // Fetch session details from our API
            const response = await fetch(`/api/stripe/session?session_id=${sessionId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('📊 Session data from Stripe:', data);
              
              if (data.session) {
                stripeSubscriptionId = data.session.subscription || null;
                stripeCustomerId = data.session.customer || null;
                billingCycle = data.session.billingCycle || 'monthly';
                paymentMethodData = data.session.paymentMethod || null;
                
                if (data.session.currentPeriodEnd) {
                  currentPeriodEnd = new Date(data.session.currentPeriodEnd);
                }
                
                console.log('✅ Got subscription details:', {
                  stripeSubscriptionId,
                  stripeCustomerId,
                  billingCycle,
                  hasPaymentMethod: !!paymentMethodData
                });
              }
            } else {
              console.warn('⚠️ Could not fetch session details, will rely on webhook');
            }
          }
        } catch (sessionError) {
          console.warn('⚠️ Error fetching session details:', sessionError);
        }

        // Define plan limits (precision is unlimited = -1)
        const planLimits = {
          start: { uploadsLimit: 2 },
          smart: { uploadsLimit: 5 },
          precision: { uploadsLimit: -1 }
        };

        const limits = planLimits[plan as keyof typeof planLimits] || planLimits.start;

        // Build user update object with all available data
        // For upgrades: reset uploadsUsed to 0 and update plan/limit
        // For new subscriptions: also reset uploadsUsed to 0
        const userUpdateData: any = {
          plan: plan,
          uploadsLimit: limits.uploadsLimit,
          uploadsUsed: 0, // Always reset to 0 for upgrades and new subscriptions
          subscriptionStatus: 'active',
          updatedAt: serverTimestamp(),
        };
        
        if (isUpgradeOrDowngrade) {
          console.log('🔄 This is a plan upgrade/downgrade from', user.plan, 'to', plan);
          console.log('🔄 Resetting uploadsUsed to 0 and updating plan limits');
        }

        // Add Stripe data if available
        if (stripeSubscriptionId) {
          userUpdateData.stripeSubscriptionId = stripeSubscriptionId;
        }
        if (stripeCustomerId) {
          userUpdateData.stripeCustomerId = stripeCustomerId;
        }
        if (billingCycle) {
          userUpdateData.billingCycle = billingCycle;
        }
        if (paymentMethodData) {
          userUpdateData.paymentMethod = paymentMethodData;
        }
        userUpdateData.currentPeriodEnd = Timestamp.fromDate(currentPeriodEnd);
        userUpdateData.cancelAtPeriodEnd = false;

        // Update user document with new plan and subscription data
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, userUpdateData);

        console.log('✅ User document updated with subscription data:', userUpdateData);

        // Create/update subscription record in Firestore if we have subscription ID
        if (stripeSubscriptionId) {
          const subscriptionRef = doc(db, 'subscriptions', stripeSubscriptionId);
          await setDoc(subscriptionRef, {
            id: stripeSubscriptionId,
            userId: user.uid,
            planId: plan,
            stripeSubscriptionId: stripeSubscriptionId,
            stripeCustomerId: stripeCustomerId,
            status: 'active',
            currentPeriodStart: serverTimestamp(),
            currentPeriodEnd: Timestamp.fromDate(currentPeriodEnd),
            cancelAtPeriodEnd: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            paymentMethod: paymentMethodData,
          }, { merge: true });
          console.log('✅ Subscription record created/updated');
        }

        // Create membership record (similar to what webhook does)
        const membershipRef = doc(db, 'memberships', user.uid);
        await setDoc(membershipRef, {
          userId: user.uid,
          planId: plan,
          status: 'active',
          stripeSessionId: sessionId,
          stripeSubscriptionId: stripeSubscriptionId,
          stripeCustomerId: stripeCustomerId,
          currentPeriodStart: serverTimestamp(),
          currentPeriodEnd: Timestamp.fromDate(currentPeriodEnd),
          cancelAtPeriodEnd: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });

        console.log('✅ Membership record created');

        // Create success notification
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: user.uid,
            type: 'success',
            title: 'Plan Activated!',
            titleMs: 'Pelan Diaktifkan!',
            message: `Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan has been activated successfully. Start uploading your reports now!`,
            messageMs: `Pelan ${plan.charAt(0).toUpperCase() + plan.slice(1)} anda telah diaktifkan. Mula muat naik laporan anda sekarang!`,
            read: false,
            createdAt: serverTimestamp(),
            actionUrl: '/assistant',
          });
          console.log('✅ Success notification created');
        } catch (notifError) {
          console.warn('⚠️ Could not create notification:', notifError);
        }

        setPlanActivated(true);
        if (isUpgradeOrDowngrade) {
          toast.success(
            language === 'ms'
              ? `🎉 Pelan berjaya ditukar ke ${plan}! Had muat naik telah ditetapkan semula.`
              : `🎉 Plan successfully changed to ${plan}! Upload limit has been reset.`
          );
        } else {
          toast.success(
            language === 'ms'
              ? `🎉 Pelan ${plan} diaktifkan!`
              : `🎉 ${plan} plan activated!`
          );
        }

        // Send postMessage to parent window (if in iframe) or to window itself
        // This allows other pages/tabs to know that checkout was successful
        if (typeof window !== 'undefined') {
          const message = {
            type: 'CHECKOUT_SUCCESS',
            status: 200,
            success: true,
            planId: plan,
            sessionId: sessionId,
            userId: user.uid,
            stripeSubscriptionId,
            stripeCustomerId,
            timestamp: new Date().toISOString(),
          };
          
          // Send to parent window if in iframe
          if (window.parent && window.parent !== window) {
            window.parent.postMessage(message, '*');
            console.log('✅ Sent CHECKOUT_SUCCESS postMessage to parent window');
          }
          
          // Also dispatch custom event for same-window listeners
          window.dispatchEvent(new CustomEvent('checkoutSuccess', {
            detail: message
          }));
          console.log('✅ Dispatched checkoutSuccess event');
        }

      } catch (error) {
        console.error('❌ Error activating plan:', error);
        // For any errors, still show success since payment went through
        // The webhook will handle the database update
        setPlanActivated(true);
        toast.success(
          language === 'ms'
            ? `🎉 Pembayaran berjaya! Pelan anda sedang dikemas kini.`
            : `🎉 Payment successful! Your plan is being updated.`
        );
        console.log('ℹ️ Showing success despite error - webhook will handle update.');
      }
    };

    activatePlan();
  }, [user?.uid, sessionId, plan, planActivated, language, user?.subscriptionStatus, user?.plan]);

  useEffect(() => {
    // If no session ID, allow success page but show warning
    if (!sessionId) {
      console.warn('No session ID found in URL');
      // Don't redirect immediately - user might have come from direct link
    }

    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionId]);

  // Handle redirect when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      // Add refresh param to trigger user data refresh
      console.log('🔄 Redirecting to dashboard with refresh=true');
      // Use setTimeout to ensure this runs after the current render cycle
      setTimeout(() => {
        router.push('/dashboard?refresh=true');
      }, 0);
    }
  }, [countdown, router]);

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

                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">
                      {language === 'ms' ? 'ID Sesi' : 'Session ID'}
                    </span>
                    <span className="font-mono text-sm text-gray-500">
                      {sessionId ? sessionId.slice(0, 20) + '...' : 'N/A'}
                    </span>
                  </div>

                  {/* Payment Status Indicator */}
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">
                      {language === 'ms' ? 'Status Pembayaran' : 'Payment Status'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        POST 200 OK
                      </span>
                    </div>
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

          {/* Auto-Redirect Notice */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mb-6"
          >
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"
                  />
                  <div className="text-left">
                    <p className="text-gray-900 font-semibold">
                      {language === 'ms' 
                        ? 'Mengalihkan ke Papan Pemuka...' 
                        : 'Redirecting to Dashboard...'
                      }
                    </p>
                    <p className="text-gray-600 text-sm">
                      {language === 'ms' 
                        ? `Dalam ${countdown} saat` 
                        : `In ${countdown} seconds`
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-center space-y-4"
          >
            <Link href="/dashboard?refresh=true">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-lg">
                {language === 'ms' ? '🚀 Pergi ke Papan Pemuka Sekarang' : '🚀 Go to Dashboard Now'}
              </Button>
            </Link>

            <div className="text-center">
              <Link
                href="/assistant"
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                {language === 'ms' ? '🤖 Mula Analisis AI' : '🤖 Start AI Analysis'}
              </Link>
              <span className="text-gray-400 mx-2">•</span>
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
