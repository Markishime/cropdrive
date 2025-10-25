'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, UserProfile } from '@/lib/firestore';
import { getMembership } from '@/lib/membership';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import {
  Leaf,
  Upload,
  BarChart3,
  FileText,
  LogOut,
  Loader2,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Target,
  Zap,
  Shield,
  Menu,
  X,
  Home,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface DashboardClientProps {
  locale: string;
}

export default function DashboardClient({ locale }: DashboardClientProps) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [membership, setMembership] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!loading && !user) {
        router.push(`/${locale}/login`);
        return;
      }

      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);

          const memberData = await getMembership(user.uid);
          setMembership(memberData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoadingProfile(false);
          // Hide welcome screen after 3 seconds
          setTimeout(() => setShowWelcome(false), 3000);
        }
      }
    };

    fetchData();
  }, [user, loading, router, locale]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push(`/${locale}/login`);
  };

  // Fullscreen Welcome with Typewriter
  if (loading || loadingProfile || showWelcome) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-palm-500 via-palm-600 to-gold-600 flex items-center justify-center z-50">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.3, 1, 1.3], rotate: [360, 180, 0] }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute bottom-10 right-10 w-96 h-96 bg-gold-300/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/30"
          >
            <Leaf className="w-12 h-12 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white"
          >
            <h1 className="text-5xl font-black mb-6 drop-shadow-2xl">
              {loadingProfile ? (
                <Loader2 className="w-16 h-16 animate-spin mx-auto" />
              ) : (
                <TypeAnimation
                  sequence={[
                    `Welcome back, ${userProfile?.name?.split(' ')[0] || 'Farmer'}!`,
                    1000,
                    'Analyzing your farm data...',
                    1000,
                    'Loading your dashboard...',
                    1000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={1}
                />
              )}
            </h1>
            <p className="text-xl text-white/90">Your AI-powered farm advisor is ready</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const hasActivePlan = membership?.status === 'active';

  const sidebarLinks = [
    { icon: Home, label: 'Overview', href: `/${locale}/dashboard`, active: true },
    { icon: Upload, label: 'Upload Reports', href: `/${locale}/assistant` },
    { icon: BarChart3, label: 'Analysis History', href: '#' },
    { icon: FileText, label: 'My Reports', href: '#' },
    { icon: CreditCard, label: 'Subscription', href: `/${locale}/pricing` },
    { icon: Settings, label: 'Settings', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-palm-50 via-white to-gold-50 flex">
      {/* Collapsible Sidebar with Glassmorphism */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? '80px' : '280px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-screen bg-white/70 backdrop-blur-xl border-r border-earth-200 shadow-xl z-40"
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="p-4 border-b border-earth-200">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-10 h-10 bg-palm-gradient rounded-xl flex items-center justify-center shadow-md">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-brown-900">CropDrive</h1>
                    <p className="text-xs text-gold-600">OP Advisor™</p>
                  </div>
                </motion.div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`p-2 rounded-lg hover:bg-earth-100 transition-colors ${sidebarCollapsed ? 'mx-auto' : ''}`}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-brown-900" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-brown-900" />
                )}
              </button>
            </div>
          </div>

          {/* User Profile */}
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 border-b border-earth-200"
            >
              <div className="bg-gradient-to-br from-palm-50 to-gold-50 rounded-xl p-3 border border-palm-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-palm-gradient rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {userProfile.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brown-900 text-sm truncate">{userProfile.name}</p>
                    <p className="text-xs text-soil-600 truncate">{userProfile.email}</p>
                  </div>
                </div>
                {hasActivePlan && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-2">
                    <CheckCircle2 className="w-3 h-3 text-palm-600 flex-shrink-0" />
                    <span className="text-xs font-bold text-palm-900 truncate">
                      {membership.planId?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {sidebarLinks.map((link, index) => (
              <Link key={index} href={link.href}>
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                    link.active
                      ? 'bg-palm-gradient text-white shadow-md'
                      : 'text-soil-700 hover:bg-earth-100 hover:text-brown-900'
                  }`}
                >
                  <link.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="font-medium text-sm">{link.label}</span>
                  )}
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-earth-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-medium text-sm">Logout</span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        animate={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-1 p-8"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header with Typewriter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-earth-200 shadow-lg">
              <h1 className="text-4xl font-black text-brown-900 mb-2">
                <TypeAnimation
                  sequence={[
                    'Welcome back! 👋',
                    2000,
                    `Hello, ${userProfile.name?.split(' ')[0]}!`,
                    2000,
                    'Ready to optimize your farm?',
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </h1>
              <p className="text-base text-soil-600">
                {userProfile.farmName ? `${userProfile.farmName} • ` : ''}
                {new Date().toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </motion.div>

          {/* Subscription Alert */}
          {!hasActivePlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-gradient-to-r from-gold-50 to-palm-50 backdrop-blur-xl border-l-4 border-gold-500 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-start space-x-4">
                <AlertCircle className="w-6 h-6 text-gold-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-brown-900 mb-2 text-lg">
                    🚀 Upgrade Your Plan
                  </h3>
                  <p className="text-soil-700 mb-4">
                    Get instant access to AI-powered soil analysis, MPOB standards comparison, and ROI forecasting.
                  </p>
                  <Link href={`/${locale}/pricing`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-palm-gradient shadow-md hover:shadow-lg transition-all duration-300 inline-flex items-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Choose a Plan</span>
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Link href={hasActivePlan ? `/${locale}/assistant` : `/${locale}/pricing`}>
                <div className="group h-full bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-earth-200 hover:border-palm-400 hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="w-14 h-14 bg-palm-gradient rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-brown-900 mb-2">
                    Upload Soil Report
                  </h3>
                  <p className="text-sm text-soil-600 mb-3">
                    Upload SP LAB reports or Farm Test Data for instant AI analysis
                  </p>
                  <div className="flex items-center space-x-2 text-palm-600 font-bold text-sm">
                    <span>{hasActivePlan ? 'Start Upload' : 'Subscribe to Upload'}</span>
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4 }}
            >
              <Link href={hasActivePlan ? `/${locale}/assistant` : `/${locale}/pricing`}>
                <div className="group h-full bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-earth-200 hover:border-aiBlue-400 hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-aiBlue-500 to-aiBlue-600 rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-brown-900 mb-2">
                    Upload Leaf Report
                  </h3>
                  <p className="text-sm text-soil-600 mb-3">
                    Get MPOB-standard leaf tissue analysis with recommendations
                  </p>
                  <div className="flex items-center space-x-2 text-aiBlue-600 font-bold text-sm">
                    <span>{hasActivePlan ? 'Start Upload' : 'Subscribe to Upload'}</span>
                    <Target className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {[
              { icon: FileText, label: 'Total Reports', value: '0', color: 'palm' },
              { icon: TrendingUp, label: 'Avg. Health Score', value: '--', color: 'gold' },
              { icon: Clock, label: 'Last Analysis', value: '--', color: 'aiBlue' },
              { icon: Shield, label: 'Active Plan', value: hasActivePlan ? '✓' : '✗', color: 'palm' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="bg-white/70 backdrop-blur-xl rounded-xl p-6 border border-earth-200 hover:border-palm-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-7 h-7 text-${stat.color}-600`} />
                  <span className="text-3xl font-black text-brown-900">{stat.value}</span>
                </div>
                <p className="text-sm text-soil-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-earth-200 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-brown-900 mb-6 flex items-center space-x-2">
              <Clock className="w-6 h-6 text-palm-600" />
              <span>Recent Activity</span>
            </h2>
            <div className="text-center py-12">
              <Leaf className="w-16 h-16 text-soil-300 mx-auto mb-4" />
              <p className="text-base text-soil-500 mb-6">
                No analysis reports yet. Upload your first soil or leaf test!
              </p>
              <Link href={hasActivePlan ? `/${locale}/assistant` : `/${locale}/pricing`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-xl text-base font-bold text-white bg-palm-gradient shadow-md hover:shadow-lg transition-all duration-300 inline-flex items-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>{hasActivePlan ? 'Upload Report' : 'Get Started'}</span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
