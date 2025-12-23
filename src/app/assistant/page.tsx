'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import { auth } from '@/lib/firebase';
import { 
  MessageSquare, 
  RefreshCw,
  Maximize2,
  Info,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CreditCard,
  TrendingUp,
  FileText,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function AssistantPage() {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { language } = useTranslation(mounted ? currentLang : 'en');

  // Check if user has exceeded their upload limit
  const isUploadLimitExceeded = (): boolean => {
    if (!user) return false;
    // If no plan, they need to subscribe first
    if (!user.plan || user.plan === 'none') return false;
    
    // Ensure uploadsUsed and uploadsLimit are numbers (handle undefined/null)
    const uploadsUsed = user.uploadsUsed ?? 0;
    const uploadsLimit = user.uploadsLimit ?? 0;
    
    // If unlimited (-1), never exceeded
    if (uploadsLimit === -1) return false;
    // Check if used >= limit
    return uploadsUsed >= uploadsLimit;
  };

  const uploadLimitExceeded = user ? isUploadLimitExceeded() : false;
  const uploadsUsed = user?.uploadsUsed ?? 0;
  const uploadsLimit = user?.uploadsLimit ?? 0;
  const uploadsRemaining = uploadsLimit === -1 ? Infinity : Math.max(0, uploadsLimit - uploadsUsed);

  // Get iframe origin from the iframe src if available, otherwise from env/default
  const getIframeOrigin = () => {
    const envUrl = process.env.NEXT_PUBLIC_AI_ASSISTANT_URL;
    const defaultUrl = 'https://markishime-ags.hf.space/';
    const baseUrl = envUrl && envUrl.trim() !== '' ? envUrl : defaultUrl;

    // Prefer the actual iframe src to avoid origin mismatches
    const currentSrc =
      (typeof window !== 'undefined'
        ? document.getElementById('ags-iframe')?.getAttribute('src')
        : null) || iframeRef.current?.src;

    const originFromSrc = (() => {
      if (!currentSrc) return null;
      try {
        return new URL(currentSrc).origin;
      } catch {
        return null;
      }
    })();

    if (originFromSrc) return originFromSrc;

    // Fallback to configured base URL
    try {
      return new URL(baseUrl).origin;
    } catch {
      return new URL(defaultUrl).origin;
    }
  };

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLang(lang);
  }, []);

  // Listen for language changes - multiple methods to catch changes
  useEffect(() => {
    if (!mounted) return;
    
    const handleLanguageChange = (newLang?: 'en' | 'ms') => {
      const lang = newLang || getCurrentLanguage();
      if (lang !== currentLang) {
        setCurrentLang(lang);
        // Reload iframe with new language (updates URL)
        setIframeKey(prev => prev + 1);
        
        // Send message to iframe after a short delay to ensure it's loaded
        // This allows Streamlit to update without reading URL params
        setTimeout(() => {
          if (iframeRef.current?.contentWindow) {
            // Use '*' as target origin to avoid origin mismatch errors
            iframeRef.current.contentWindow.postMessage({
              type: 'LANGUAGE_CHANGE',
              language: lang,
            }, '*');
          }
        }, 500); // Wait 500ms for iframe to reload
      }
    };
    
    // Method 1: Listen for storage events (works across tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cropdrive-language' && e.newValue) {
        handleLanguageChange(e.newValue as 'en' | 'ms');
      }
    };
    
    // Method 2: Listen for custom language change events (from Navbar before reload)
    const handleCustomLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.language) {
        handleLanguageChange(customEvent.detail.language);
      } else {
        handleLanguageChange();
      }
    };
    
    // Method 3: Poll localStorage periodically to catch changes in same window
    // (since storage events don't fire in same window before reload)
    const pollInterval = setInterval(() => {
      const lang = getCurrentLanguage();
      if (lang !== currentLang) {
        handleLanguageChange(lang);
      }
    }, 1000); // Check every 1 second (less aggressive)
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('languageChanged', handleCustomLanguageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('languageChanged', handleCustomLanguageChange);
      clearInterval(pollInterval);
    };
  }, [currentLang, mounted]);

  // Check if subscription has expired or is cancelled (block access immediately upon cancellation)
  const isSubscriptionExpired = (): boolean => {
    if (!user) return false;
    
    // If user has no plan or plan is 'none', they need to subscribe
    if (!user.plan || user.plan === 'none') return true;
    
    // If subscription is set to cancel at period end, block access immediately (even if still paying)
    if (user.cancelAtPeriodEnd) return true;
    
    // Note: pendingContractCancellation is checked in subscription data, not user data
    // This check has been removed as it's not available on the User type
    
    // If subscription status is canceled
    if (user.subscriptionStatus === 'canceled') return true;
    
    // Check if current period has ended
    if (user.currentPeriodEnd) {
      const periodEnd = new Date(user.currentPeriodEnd);
      const now = new Date();
      if (now >= periodEnd) return true;
    }
    
    return false;
  };

  const subscriptionExpired = user ? isSubscriptionExpired() : false;
  const subscriptionCancelling = user?.cancelAtPeriodEnd;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    // Redirect users without plans to pricing
    if (user && (!user.plan || user.plan === 'none')) {
      router.push('/pricing');
    }
  }, [user, authLoading, router]);

  // Build iframe URL with parameters
  const buildIframeUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_AI_ASSISTANT_URL;
    const defaultUrl = 'https://markishime-ags.hf.space/';
    const baseUrl = envUrl && envUrl.trim() !== '' ? envUrl : defaultUrl;
    const params = new URLSearchParams();
    
    // Add language parameter
    params.append('lang', currentLang);
    
    // Add user details (as per HuggingFace Space requirements)
    if (user?.uid) {
      params.append('userId', user.uid);
    }
    
    if (user?.email) {
      params.append('userEmail', user.email);
    }
    
    if (user?.displayName) {
      params.append('userName', user.displayName);
    }
    
    // Add plan information
    const userPlan = user?.plan || 'none';
    params.append('plan', userPlan);
    
    // Add actual upload usage from user data
    if (user) {
      params.append('uploadsUsed', uploadsUsed.toString());
      params.append('uploadsLimit', uploadsLimit.toString());
    }
    
    // Add plan-based features
    const planFeatures = {
      start: ['basic'],
      smart: ['basic', 'priority'],
      precision: ['basic', 'priority', 'premium', 'comparative', 'early_access'],
    };
    
    const features = planFeatures[userPlan as keyof typeof planFeatures] || planFeatures.start;
    params.append('features', features.join(','));
    
    return `${baseUrl}?${params.toString()}`;
  };

  const AGS_AI_URL = buildIframeUrl();

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Log all messages for debugging - VERY DETAILED
      console.log('📨 Message received from iframe:', {
        origin: event.origin,
        type: event.data?.type,
        hasType: !!event.data?.type,
        typeValue: event.data?.type,
        dataKeys: event.data ? Object.keys(event.data) : [],
        fullData: event.data,
        stringified: JSON.stringify(event.data)
      });
      
      // CRITICAL: Check for ANALYSIS_COMPLETE FIRST before any origin checks
      // The message might come from a different origin but we need to process it
      // Check multiple possible formats and locations
      const rawData = event.data;
      const isAnalysisComplete = 
        rawData?.type === 'ANALYSIS_COMPLETE' || 
        rawData?.message?.type === 'ANALYSIS_COMPLETE' ||
        (typeof rawData === 'object' && rawData !== null && 'type' in rawData && rawData.type === 'ANALYSIS_COMPLETE') ||
        (rawData && typeof rawData === 'string' && rawData.includes('ANALYSIS_COMPLETE')) ||
        (rawData?.data?.type === 'ANALYSIS_COMPLETE');
      
      if (isAnalysisComplete) {
        console.log('🎯🎯🎯 ANALYSIS_COMPLETE DETECTED! Processing immediately...', {
          rawData,
          type: rawData?.type,
          origin: event.origin
        });
        // Process immediately - don't let origin checks block this critical message
      } else if (rawData?.scriptRunState === 'notRunning' && rawData?.type === 'SCRIPT_RUN_STATE_CHANGED') {
        // Log when script stops running - this might indicate analysis completion
        console.log('⚠️ Script stopped running - checking if ANALYSIS_COMPLETE was missed...', {
          receivedType: rawData?.type,
          scriptState: rawData?.scriptRunState,
          allKeys: rawData ? Object.keys(rawData) : []
        });
        
        // Check if ANALYSIS_COMPLETE data might be nested or in a different format
        if (rawData && typeof rawData === 'object') {
          const allValues = JSON.stringify(rawData);
          if (allValues.includes('ANALYSIS_COMPLETE') || allValues.includes('analysisType')) {
            console.log('🔍 Found ANALYSIS_COMPLETE indicators in message, attempting to extract...', rawData);
          }
        }
        
        // FALLBACK: Request analysis results from iframe when script stops
        // This handles cases where ANALYSIS_COMPLETE message was sent but not received
        console.log('📤 Requesting analysis results from iframe as fallback...');
        setTimeout(() => {
          if (iframeRef.current?.contentWindow) {
            try {
              iframeRef.current.contentWindow.postMessage({
                type: 'REQUEST_ANALYSIS_RESULTS'
              }, '*');
              console.log('✅ Sent REQUEST_ANALYSIS_RESULTS message to iframe');
            } catch (error) {
              console.error('❌ Error sending REQUEST_ANALYSIS_RESULTS:', error);
            }
          }
        }, 1000); // Wait 1 second for any pending ANALYSIS_COMPLETE messages
      }
      
      // Check for any error messages from AI assistant
      if (event.data?.error || event.data?.message?.includes('error') || event.data?.message?.includes('Error')) {
        console.error('❌ Error message from AI assistant:', event.data);
      }

      // Verify origin for security (allow both configured origin and current iframe src origin)
      const expectedOrigin = getIframeOrigin();
      const currentWindowOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      
      // Accept messages from iframe origin OR if the message is coming from the iframe itself
      // (The AI assistant might send messages with target origin '*', which is fine)
      // BUT: Always accept ANALYSIS_COMPLETE messages regardless of origin
      if (event.origin !== expectedOrigin && event.origin !== currentWindowOrigin && !isAnalysisComplete) {
        // Log for debugging but don't block - the AI assistant might be using '*'
        console.log('⚠️ Message from unexpected origin:', event.origin, 'Expected:', expectedOrigin);
        // Still process the message if it's from a known iframe origin pattern
        if (!event.origin.includes('hf.space') && !event.origin.includes('cropdrive')) {
          console.log('❌ Blocking message from unknown origin:', event.origin);
          return;
        }
        console.log('✅ Accepting message from known iframe origin:', event.origin);
      } else if (isAnalysisComplete) {
        console.log('✅ Accepting ANALYSIS_COMPLETE message from origin:', event.origin);
      }

      try {
        const data = event.data;
        
        // Handle analysis completion - check multiple possible formats
        if (data?.type === 'ANALYSIS_COMPLETE' || data?.message?.type === 'ANALYSIS_COMPLETE') {
          console.log('📊 ANALYSIS_COMPLETE message received:', data);
          
          // Normalize the data - handle nested message format
          const analysisData = (data?.type === 'ANALYSIS_COMPLETE' ? data : data?.message) || data;
          console.log('📊 Normalized analysis data:', analysisData);
          
          // Always get the current authenticated user from Firebase Auth (most reliable)
          const firebaseUser = auth.currentUser;
          if (!firebaseUser || !firebaseUser.uid) {
            console.error('❌ No authenticated user found:', { firebaseUser });
            toast.error(language === 'ms' ? 'Sesi tamat. Sila log masuk semula.' : 'Session expired. Please login again.');
            return;
          }

          // Use the authenticated user's ID (always current and reliable)
          const currentUserId = firebaseUser.uid;
          console.log('✅ Using authenticated user ID:', currentUserId);
          
          // Verify user context matches authenticated user
          if (user?.uid && user.uid !== currentUserId) {
            console.warn('⚠️ User context mismatch, using authenticated user ID:', {
              contextUserId: user.uid,
              authenticatedUserId: currentUserId
            });
          }

          const token = await firebaseUser.getIdToken();

          // Try API first, fallback to direct Firestore save
          try {
            const response = await fetch('/api/save-analysis-report', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                userId: currentUserId, // Always use authenticated user's ID
                title: analysisData?.title || data?.title || `Analysis Report - ${new Date().toLocaleDateString()}`,
                type: analysisData?.analysisType || data?.analysisType || 'soil', // 'soil', 'leaf', or 'both'
                summary: analysisData?.summary || data?.summary || '',
                recommendations: analysisData?.recommendationsCount || data?.recommendationsCount || 0,
                fileUrl: analysisData?.fileUrl || data?.fileUrl || null,
                analysisData: analysisData?.analysisData || data?.analysisData || null,
              }),
            });

            const result = await response.json();
            console.log('📡 API response:', { 
              status: response.status, 
              ok: response.ok, 
              result,
              hasReportId: !!result.reportId,
              uploadsUsed: result.uploadsUsed,
              uploadsLimit: result.uploadsLimit
            });
            
            if (response.ok && result.success) {
              console.log('✅ Report saved successfully:', result.reportId);
              
              // Verify we got the expected data
              if (!result.reportId) {
                console.error('❌ API returned success but no reportId:', result);
                toast.error(language === 'ms' ? 'Ralat: ID laporan tidak ditemui.' : 'Error: Report ID not found.');
              }
              
              toast.success(
                language === 'ms' 
                  ? '✅ Laporan analisis telah disimpan!' 
                  : '✅ Analysis report saved!',
                {
                  duration: 4000,
                  icon: '📊',
                }
              );
              
              // Refresh user data to update upload usage display - CRITICAL
              console.log('🔄 Refreshing user data from Firestore...');
              if (refreshUser) {
                try {
                  await refreshUser();
                  console.log('✅ User data refreshed from Firestore');
                  
                  // Double-check by fetching user data directly
                  const { doc: docFn, getDoc } = await import('firebase/firestore');
                  const { db: firestoreDb } = await import('@/lib/firebase');
                  const userDocRef = docFn(firestoreDb, 'users', currentUserId);
                  const userDocSnap = await getDoc(userDocRef);
                  if (userDocSnap.exists()) {
                    const latestUserData = userDocSnap.data();
                    console.log('✅ Verified user data from Firestore:', {
                      uploadsUsed: latestUserData?.uploadsUsed,
                      uploadsLimit: latestUserData?.uploadsLimit,
                      reportId: result.reportId
                    });
                  }
                } catch (refreshError: any) {
                  console.error('❌ Error refreshing user data:', refreshError);
                  toast.error(language === 'ms' ? 'Ralat menyegar data pengguna' : 'Error refreshing user data');
                }
              } else {
                console.warn('⚠️ refreshUser function not available');
              }
              
              // Dispatch custom event to notify other pages (dashboard, reports, etc.)
              if (typeof window !== 'undefined') {
                const eventDetail = {
                  userId: currentUserId,
                  reportId: result.reportId,
                  uploadsUsed: result.uploadsUsed ?? 0,
                  uploadsLimit: result.uploadsLimit ?? 10,
                };
                console.log('📢 Dispatching analysisReportSaved event:', eventDetail);
                window.dispatchEvent(new CustomEvent('analysisReportSaved', {
                  detail: eventDetail
                }));
                console.log('✅ analysisReportSaved event dispatched');
              }
              
              // Update iframe config with new upload counts
              setTimeout(() => {
                console.log('📤 Sending updated config to iframe...');
                sendConfigToIframe();
              }, 1000); // Increased delay to ensure user data is refreshed first
              
              // Show remaining uploads
              if (result.uploadsUsed !== undefined && result.uploadsLimit !== undefined) {
                const remaining = result.uploadsLimit === -1 ? 'unlimited' : result.uploadsLimit - result.uploadsUsed;
                console.log(`📊 Upload status: ${result.uploadsUsed}/${result.uploadsLimit}, Remaining: ${remaining}`);
                toast(
                  language === 'ms' 
                    ? `📊 Baki analisis: ${remaining === 'unlimited' ? '∞' : remaining}`
                    : `📊 Remaining analyses: ${remaining === 'unlimited' ? '∞' : remaining}`,
                  { duration: 3000 }
                );
              } else {
                console.warn('⚠️ API response missing uploadsUsed/uploadsLimit:', result);
              }
            } else if (response.status === 403 && result.error === 'Upload limit exceeded') {
              console.log('❌ Upload limit exceeded:', result);
              // Upload limit exceeded
              toast.error(
                language === 'ms' 
                  ? `❌ Had muat naik tercapai (${result.uploadsUsed}/${result.uploadsLimit}). Sila naik taraf pelan anda.`
                  : `❌ Upload limit reached (${result.uploadsUsed}/${result.uploadsLimit}). Please upgrade your plan.`,
                { duration: 6000 }
              );
              
              // Refresh user data
              await refreshUser?.();
              
              // Show upgrade prompt
              setTimeout(() => {
                toast(
                  (t) => (
                    <div className="flex items-center gap-3">
                      <span>{language === 'ms' ? 'Naik taraf untuk terus menganalisis' : 'Upgrade to continue analyzing'}</span>
                      <button
                        onClick={() => {
                          toast.dismiss(t.id);
                          router.push('/pricing');
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                      >
                        {language === 'ms' ? 'Naik Taraf' : 'Upgrade'}
                      </button>
                    </div>
                  ),
                  { duration: 8000, icon: '⬆️' }
                );
              }, 500);
              return;
            } else {
              // API returned non-200 or success=false
              console.error('❌ API save failed:', { 
                status: response.status, 
                ok: response.ok,
                result,
                hasSuccess: result?.success,
                hasReportId: !!result?.reportId,
                error: result?.error,
                details: result?.details
              });
              
              // If response is ok but success is false, or if we got an error message
              if (response.ok && !result.success) {
                console.error('❌ API returned ok but success=false:', result);
                toast.error(
                  language === 'ms' 
                    ? `❌ Ralat menyimpan laporan: ${result.error || result.details || 'Unknown error'}`
                    : `❌ Error saving report: ${result.error || result.details || 'Unknown error'}`,
                  { duration: 5000 }
                );
              } else {
                throw new Error(result?.error || result?.details || `API save failed (status: ${response.status})`);
              }
            }
          } catch (apiError: any) {
            // Fallback: Save directly to Firestore (security rules will validate)
            console.error('❌ API save failed, trying direct Firestore save...', apiError);
            try {
              const { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } = await import('firebase/firestore');
              const { db: firestoreDb } = await import('@/lib/firebase');
              
              // Fetch current user data from Firestore to check limits
              const docFn = doc;
              const userDocRef = docFn(firestoreDb, 'users', currentUserId);
              const userDocSnap = await getDoc(userDocRef);
              
              if (!userDocSnap.exists()) {
                console.error('❌ User document not found in Firestore:', currentUserId);
                toast.error(language === 'ms' ? 'Profil pengguna tidak ditemui.' : 'User profile not found.');
                return;
              }
              
              const currentUserData = userDocSnap.data();
              const uploadsUsed = currentUserData?.uploadsUsed || 0;
              const uploadsLimit = currentUserData?.uploadsLimit || 0;
              
              // Check upload limit first
              if (uploadsLimit !== -1 && uploadsUsed >= uploadsLimit) {
                toast.error(
                  language === 'ms' 
                    ? `❌ Had muat naik tercapai (${uploadsUsed}/${uploadsLimit}). Sila naik taraf pelan anda.`
                    : `❌ Upload limit reached (${uploadsUsed}/${uploadsLimit}). Please upgrade your plan.`,
                  { duration: 6000 }
                );
                return;
              }
              
              const reportData = {
                userId: currentUserId, // Always use authenticated user's ID
                title: analysisData?.title || data?.title || `Analysis Report - ${new Date().toLocaleDateString()}`,
                type: analysisData?.analysisType || data?.analysisType || 'soil',
                summary: analysisData?.summary || data?.summary || '',
                recommendations: analysisData?.recommendationsCount || data?.recommendationsCount || 0,
                status: 'completed' as const,
                date: new Date().toISOString().split('T')[0],
                fileUrl: analysisData?.fileUrl || data?.fileUrl || null,
                analysisData: analysisData?.analysisData || data?.analysisData || null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              };

              console.log('💾 Saving report directly to Firestore...');
              const docRef = await addDoc(collection(firestoreDb, 'analysis_results'), reportData);
              console.log('✅ Report saved to Firestore:', docRef.id);
              
              // Increment uploads used for the authenticated user
              console.log('📈 Incrementing uploadsUsed for user:', currentUserId);
              await updateDoc(docFn(firestoreDb, 'users', currentUserId), {
                uploadsUsed: increment(1),
                updatedAt: serverTimestamp(),
              });
              console.log('✅ uploadsUsed incremented');
              
              // Fetch updated user data from Firestore to ensure sync
              const updatedUserDocSnap = await getDoc(userDocRef);
              if (updatedUserDocSnap.exists()) {
                const updatedUserData = updatedUserDocSnap.data();
                console.log('✅ Updated user data from Firestore:', {
                  uploadsUsed: updatedUserData?.uploadsUsed,
                  uploadsLimit: updatedUserData?.uploadsLimit
                });
              }
              
              toast.success(
                language === 'ms' 
                  ? '✅ Laporan analisis telah disimpan!' 
                  : '✅ Analysis report saved!',
                {
                  duration: 4000,
                  icon: '📊',
                }
              );
              
              // Refresh user data to update upload usage display
              console.log('🔄 Refreshing user data from Firestore after direct save...');
              if (refreshUser) {
                await refreshUser();
                console.log('✅ User data refreshed from Firestore after direct save');
              } else {
                console.warn('⚠️ refreshUser function not available');
              }
              
              // Fetch updated user data from Firestore to get accurate counts
              let finalUploadsUsed = uploadsUsed + 1;
              let finalUploadsLimit = uploadsLimit;
              try {
                const updatedUserDocSnap = await getDoc(userDocRef);
                if (updatedUserDocSnap.exists()) {
                  const finalUserData = updatedUserDocSnap.data();
                  finalUploadsUsed = finalUserData?.uploadsUsed || finalUploadsUsed;
                  finalUploadsLimit = finalUserData?.uploadsLimit || finalUploadsLimit;
                  console.log('✅ Final user data from Firestore:', {
                    userId: currentUserId,
                    uploadsUsed: finalUploadsUsed,
                    uploadsLimit: finalUploadsLimit
                  });
                }
              } catch (fetchError) {
                console.error('❌ Error fetching final user data:', fetchError);
              }
              
              // Dispatch custom event to notify other pages (dashboard, reports, etc.)
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('analysisReportSaved', {
                  detail: {
                    userId: currentUserId, // Include userId in event
                    reportId: docRef.id,
                    uploadsUsed: finalUploadsUsed,
                    uploadsLimit: finalUploadsLimit,
                  }
                }));
                console.log('📢 Dispatched analysisReportSaved event with userId:', currentUserId);
              }
              
              // Update iframe config with new upload counts
              setTimeout(() => {
                console.log('📤 Sending updated config to iframe after direct save...');
                sendConfigToIframe();
              }, 500);
            } catch (firestoreError: any) {
              console.error('❌ Error saving report directly to Firestore:', firestoreError);
              toast.error(
                language === 'ms' 
                  ? `Ralat menyimpan laporan: ${firestoreError.message || 'Unknown error'}` 
                  : `Error saving report: ${firestoreError.message || 'Unknown error'}`
              );
            }
          }
        } else {
          console.log('📨 Received message type:', data.type, 'but not ANALYSIS_COMPLETE');
        }

        // Handle language change request from iframe
        if (data.type === 'LANGUAGE_CHANGE_REQUEST') {
          const newLang = data.language;
          if (newLang === 'en' || newLang === 'ms') {
            localStorage.setItem('cropdrive-language', newLang);
            setCurrentLang(newLang);
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('languageChanged'));
            // Reload iframe
            setIframeKey(prev => prev + 1);
          }
        }

        // Handle feature restriction notifications
        if (data.type === 'FEATURE_RESTRICTED') {
          const message = language === 'ms'
            ? `Ciri ini hanya tersedia untuk pelan ${data.requiredPlan || 'lebih tinggi'}. Sila naik taraf pelan anda.`
            : `This feature is only available for ${data.requiredPlan || 'higher'} plan. Please upgrade your plan.`;
          
          toast.error(message, {
            duration: 5000,
            icon: '🔒',
          });
          
          // Show a follow-up toast with action after a short delay
          setTimeout(() => {
            toast(
              (t) => (
                <div className="flex items-center gap-3">
                  <span>{language === 'ms' ? 'Lihat pelan tersedia' : 'View available plans'}</span>
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      router.push('/pricing');
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    {language === 'ms' ? 'Lihat Pelan' : 'View Plans'}
                  </button>
                </div>
              ),
              {
                duration: 6000,
                icon: '💡',
              }
            );
          }, 500);
        }
      } catch (error) {
        console.error('Error handling iframe message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [user, language, router]);

  // Send initial configuration to iframe when it loads
  const handleIframeLoad = () => {
    setIsLoading(false);
    sendConfigToIframe();
  };

  // Send CONFIG message to iframe (reusable function)
  const sendConfigToIframe = () => {
    if (iframeRef.current?.contentWindow && user) {
      const uploadLimitExceeded = isUploadLimitExceeded();
      const config = {
        type: 'CONFIG',
        language: currentLang,
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || '',
        plan: user.plan || 'none',
        uploadsUsed: user.uploadsUsed || 0,
        uploadsLimit: user.uploadsLimit || 10,
        uploadLimitExceeded: uploadLimitExceeded,
        uploadsRemaining: uploadLimitExceeded ? 0 : (user.uploadsLimit === -1 ? Infinity : Math.max(0, user.uploadsLimit - (user.uploadsUsed || 0))),
      };
      
      // Use '*' as target origin to avoid origin mismatch errors
      // The iframe will validate messages on its side if needed
      iframeRef.current.contentWindow.postMessage(config, '*');
      console.log('✅ Sent user config to AI Assistant:', {
        userId: user.uid,
        uploadsUsed: uploadsUsed,
        uploadsLimit: uploadsLimit,
        uploadLimitExceeded,
        uploadsRemaining,
      });
    }
  };

  // Send CONFIG when user logs in (if iframe is already loaded)
  // Also send when uploadsUsed changes to keep AI assistant updated
  useEffect(() => {
    if (mounted && user && !isLoading && iframeRef.current?.contentWindow) {
      // Small delay to ensure iframe is ready
      const timer = setTimeout(() => {
        sendConfigToIframe();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, mounted, isLoading, currentLang, user?.uploadsUsed, user?.uploadsLimit]);

  // Update iframe language when currentLang changes (send postMessage)
  useEffect(() => {
    if (mounted && iframeRef.current?.contentWindow && user) {
      // Use '*' as target origin to avoid origin mismatch errors
      iframeRef.current.contentWindow.postMessage({
        type: 'LANGUAGE_CHANGE',
        language: currentLang,
      }, '*');
    }
  }, [currentLang, mounted, user]);

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const handleFullscreen = () => {
    const iframe = document.getElementById('ags-iframe');
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      }
    }
  };

  // Check authentication
  if (authLoading || !user) {
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

  // Show loading/redirect screen for users without plans (redirect handled in useEffect above)
  if (!user.plan || user.plan === 'none') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">
            {language === 'ms' ? 'Mengalihkan ke halaman pelan...' : 'Redirecting to plans...'}
          </p>
        </div>
      </div>
    );
  }

  // Show subscription expired screen
  if (subscriptionExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-black text-gray-900 mb-3">
            {language === 'ms' ? 'Langganan Tamat' : 'Subscription Expired'}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {subscriptionCancelling
              ? (language === 'ms' 
                  ? 'Langganan anda telah dibatalkan. Anda masih perlu membayar sehingga akhir tempoh tetapi tidak boleh menggunakan Pembantu AI. Anda boleh memilih untuk membuka semula pelan yang dibatalkan.' 
                  : 'Your subscription has been cancelled. You will still pay until end of period but cannot use AI Assistant. You can choose to re-open the cancelled plan.')
              : (language === 'ms' 
                  ? 'Langganan anda telah tamat. Sila langgan pelan baru untuk terus menggunakan Pembantu AI CropDrive.' 
                  : 'Your subscription has expired. Please subscribe to a new plan to continue using CropDrive AI Assistant.')
            }
          </p>
          
          <div className="space-y-3">
            {subscriptionCancelling ? (
              <>
                <Link href="/payment-method" className="block">
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 py-4 font-bold rounded-xl shadow-lg text-lg">
                    <RefreshCw className="w-5 h-5 mr-2" />
                    {language === 'ms' ? 'Buka Semula Langganan' : 'Re-open Subscription'}
                  </Button>
                </Link>
                <Link href="/pricing" className="block">
                  <Button className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 font-bold rounded-xl">
                    {language === 'ms' ? 'Lihat Pelan Lain' : 'View Other Plans'}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/pricing" className="block">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 py-4 font-bold rounded-xl shadow-lg text-lg">
                    <CreditCard className="w-5 h-5 mr-2" />
                    {language === 'ms' ? 'Lihat Pelan' : 'View Plans'}
                  </Button>
                </Link>
                <Link href="/payment-method" className="block">
                  <Button className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 font-bold rounded-xl">
                    {language === 'ms' ? 'Urus Langganan' : 'Manage Subscription'}
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <p className="text-xs text-gray-400 mt-6">
            {language === 'ms' 
              ? 'Perlukan bantuan? Hubungi sokongan kami.' 
              : 'Need help? Contact our support team.'}
          </p>
        </motion.div>
      </div>
    );
  }

  // Show upload limit exceeded screen
  if (uploadLimitExceeded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-900 via-orange-800 to-amber-900 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-orange-600" />
          </div>
          
          <h1 className="text-2xl font-black text-gray-900 mb-3">
            {language === 'ms' ? 'Had Muat Naik Tercapai' : 'Upload Limit Reached'}
          </h1>
          
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-black text-orange-600">{uploadsUsed}</p>
                <p className="text-xs text-gray-500">{language === 'ms' ? 'Digunakan' : 'Used'}</p>
              </div>
              <div className="text-2xl text-gray-400">/</div>
              <div className="text-center">
                <p className="text-3xl font-black text-orange-600">{uploadsLimit === -1 ? '∞' : uploadsLimit}</p>
                <p className="text-xs text-gray-500">{language === 'ms' ? 'Had' : 'Limit'}</p>
              </div>
            </div>
            <div className="w-full bg-orange-200 rounded-full h-3 mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">
            {language === 'ms' 
              ? `Anda telah mencapai had ${uploadsLimit === -1 ? '∞' : uploadsLimit} analisis untuk pelan ${user.plan?.toUpperCase()} anda. Naik taraf pelan anda untuk terus menganalisis laporan makmal.` 
              : `You've reached your ${uploadsLimit === -1 ? 'unlimited' : uploadsLimit} analysis limit for your ${user.plan?.toUpperCase()} plan. Upgrade your plan to continue analyzing lab reports.`}
          </p>
          
          <div className="space-y-3">
            <Link href="/pricing" className="block">
              <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 py-4 font-bold rounded-xl shadow-lg text-lg">
                <TrendingUp className="w-5 h-5 mr-2" />
                {language === 'ms' ? 'Naik Taraf Pelan' : 'Upgrade Plan'}
              </Button>
            </Link>
            
            <Link href="/reports" className="block">
              <Button className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 font-bold rounded-xl">
                <FileText className="w-4 h-4 mr-2" />
                {language === 'ms' ? 'Lihat Laporan Lepas' : 'View Past Reports'}
              </Button>
            </Link>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-800 font-medium">
              {language === 'ms' 
                ? '💡 Petua: Pelan Smart menawarkan 50 analisis, dan pelan Precision menawarkan analisis tanpa had!' 
                : '💡 Tip: Smart plan offers 50 analyses, and Precision plan offers unlimited analyses!'}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 shadow-lg border-b-4 border-yellow-400"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <MessageSquare className="w-7 h-7 text-green-900" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                  {language === 'ms' ? 'CropDrive™ Oil Palm AI Advisor' : 'CropDrive™ Oil Palm AI Advisor'}
                  <Zap className="w-5 h-5 text-yellow-400" />
                </h1>
                <p className="text-sm text-white/80 font-medium">
                  {language === 'ms' 
                    ? 'Analisis Laporan Makmal dengan AI' 
                    : 'Lab Report Analysis with AI'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl transition-all duration-200 border border-white/20 font-semibold"
                title={language === 'ms' ? 'Muat Semula' : 'Refresh'}
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">
                  {language === 'ms' ? 'Muat Semula' : 'Refresh'}
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFullscreen}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl transition-all duration-200 border border-white/20 font-semibold"
                title={language === 'ms' ? 'Skrin Penuh' : 'Fullscreen'}
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">
                  {language === 'ms' ? 'Penuh' : 'Full'}
                </span>
              </motion.button>

            </div>
          </div>
        </div>
      </motion.div>

      {/* Subscription Cancelling Warning Banner */}
      {subscriptionCancelling && user?.currentPeriodEnd && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4 sm:px-6 lg:px-8 shadow-md"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-white flex-shrink-0" />
                <p className="text-sm font-semibold">
                  {language === 'ms' 
                    ? `⚠️ Langganan anda akan tamat pada ${new Date(user.currentPeriodEnd).toLocaleDateString('ms-MY', { dateStyle: 'long' })}. Selepas itu, anda tidak akan dapat mengakses pembantu AI.`
                    : `⚠️ Your subscription will end on ${new Date(user.currentPeriodEnd).toLocaleDateString('en-US', { dateStyle: 'long' })}. After that, you won't be able to access the AI assistant.`
                  }
                </p>
              </div>
              <Link href="/payment-method">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-amber-600 rounded-xl font-bold text-sm shadow-md hover:bg-amber-50 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  {language === 'ms' ? 'Aktifkan Semula' : 'Reactivate'}
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Guide Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: subscriptionCancelling ? 0.3 : 0.2 }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 sm:px-6 lg:px-8 shadow-md"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-200 flex-shrink-0" />
              <p className="text-sm font-semibold">
                {language === 'ms' 
                  ? '💡 Panduan Pantas: Muat naik laporan makmal (Gambar/PDF/Excel - SPLAB, farm_test_data) → Tunggu 5-8 minit → Dapatkan analisis terperinci!'
                  : '💡 Quick Guide: Upload lab report (Image/PDF/Excel - SPLAB, farm_test_data) → Wait 5-8 minutes → Get detailed analysis!'
                }
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium bg-white/10 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {language === 'ms'
                  ? 'Cadangan berpandukan garis panduan MPOB & Amalan Pertanian Baik (GAP) global'
                  : 'Recommendations based on MPOB guidelines and best global Good Agricultural Practices (GAP)'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Assistant Embedded */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 z-10"
          >
            <div className="text-center space-y-4">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-20 h-20 border-4 border-green-600 border-t-transparent rounded-full mx-auto"
              />
              <div>
                <p className="text-xl font-bold text-gray-800 mb-2">
                  {language === 'ms' ? 'Memuatkan Pembantu AI...' : 'Loading AI Assistant...'}
                </p>
                <p className="text-sm text-gray-600">
                  {language === 'ms' ? 'Sila tunggu sebentar' : 'Please wait a moment'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span>{language === 'ms' ? 'Menyambung ke pelayan AI' : 'Connecting to AI server'}</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <iframe
          ref={iframeRef}
          key={iframeKey}
          id="ags-iframe"
          src={AGS_AI_URL}
          className="w-full h-full border-0"
          title="CropDrive™ Oil Palm AI Advisor"
          onLoad={handleIframeLoad}
          allow="camera; microphone; clipboard-read; clipboard-write; accelerometer; gyroscope"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ 
            width: '100%', 
            height: '100%',
            border: 'none',
            overflow: 'hidden'
          }}
        />
      </div>

    </div>
  );
}
