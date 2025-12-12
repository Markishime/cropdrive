'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useTranslation, getCurrentLanguage, setLanguage } from '@/i18n';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import {
  User,
  Settings,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

export const AuthenticatedNavbar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLang(lang);
  }, []);

  useEffect(() => {
    if (isLandingPage) {
      const handleScroll = () => {
        setScrolled(window.scrollY > 20);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isLandingPage]);

  const { language } = useTranslation(mounted ? currentLang : 'en');

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ms' : 'en';
    setLanguage(newLanguage);
    setCurrentLang(newLanguage);
    toast.success(newLanguage === 'ms' ? 'Bahasa ditukar!' : 'Language changed!');
  };

  const handleSignOut = async () => {
    try {
      await signOut(language);
      toast.success(language === 'ms' ? 'Berjaya log keluar' : 'Successfully logged out');
      router.push('/');
    } catch (error) {
      toast.error(language === 'ms' ? 'Ralat log keluar' : 'Error logging out');
    }
  };

  // Landing page navbar style
  if (isLandingPage) {
    const navbarClasses = `
      fixed top-0 left-0 right-0 z-[100] transition-all duration-500
      ${scrolled
        ? 'bg-white/95 backdrop-blur-lg shadow-lg'
        : 'bg-transparent'
      }
    `;

    return (
      <nav className={navbarClasses}>
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group mr-4 sm:mr-8 lg:mr-12 flex-shrink-0">
              <div className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center p-1.5 sm:p-2 transition-all duration-500 flex-shrink-0 ${
                scrolled ? 'bg-white shadow-md' : 'bg-white/90 shadow-lg'
              }`}>
                <Image
                  src="/images/CropDrive.png"
                  alt="CropDrive Logo"
                  width={32}
                  height={32}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
              <div className="flex items-start leading-tight">
                <span className={`font-black text-sm xs:text-base sm:text-lg md:text-xl tracking-tight transition-all duration-500 ${
                  scrolled ? 'text-gray-900' : 'text-white'
                } font-heading hidden xs:block`}>
                  <span className="hidden sm:inline">CropDrive OP Advisor</span>
                  <span className="sm:hidden">CropDrive</span>
                </span>
                <sup className={`text-xs font-black ml-0.5 transition-all duration-500 hidden xs:block ${
                  scrolled ? 'text-yellow-500' : 'text-yellow-400'
                }`}>
                  ™
                </sup>
              </div>
            </Link>

            {/* Right Side - User Info and Dashboard Button */}
            <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="relative flex items-center rounded-full p-1 transition-all duration-300 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                title={language === 'ms' ? 'Switch to English' : 'Tukar ke Bahasa Malaysia'}
              >
                <div className="relative flex items-center">
                  <motion.div
                    className="absolute left-0 h-8 rounded-full bg-white shadow-xl"
                    initial={false}
                    animate={{
                      x: language === 'en' ? 0 : 44,
                      width: 44,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                    }}
                  />
                  <span className={`relative z-10 px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 w-11 text-center ${
                    language === 'en' ? (scrolled ? 'text-green-700' : 'text-green-700') : (scrolled ? 'text-gray-400' : 'text-white/60')
                  }`}>
                    EN
                  </span>
                  <span className={`relative z-10 px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 w-11 text-center ${
                    language === 'ms' ? (scrolled ? 'text-green-700' : 'text-green-700') : (scrolled ? 'text-gray-400' : 'text-white/60')
                  }`}>
                    MS
                  </span>
                </div>
              </button>

              {/* User Name */}
              <div className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
                scrolled ? 'bg-gray-100' : 'bg-white/20'
              }`}>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-green-900 font-bold text-xs flex-shrink-0">
                  {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className={`font-medium text-xs sm:text-sm ${
                  scrolled ? 'text-gray-900' : 'text-white'
                }`}>
                  {user?.displayName || 'User'}
                </span>
              </div>

              {/* Dashboard Button */}
              <Link href="/dashboard">
                <Button className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                  scrolled
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-yellow-400 text-green-900 hover:bg-yellow-300'
                }`}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  {language === 'ms' ? 'Papan Pemuka' : 'Dashboard'}
                </Button>
              </Link>

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center px-2 py-1.5 rounded-lg transition-colors ${
                    scrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-green-900 font-bold text-xs flex-shrink-0 ${
                    scrolled ? '' : 'sm:hidden'
                  }`}>
                    {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div
                        onClick={() => setShowUserMenu(false)}
                        className="fixed inset-0 z-40"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl z-50 border-2 border-gray-200 overflow-hidden"
                      >
                        <div className="p-2">
                          <Link
                            href="/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
                          >
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="font-medium">{language === 'ms' ? 'Papan Pemuka' : 'Dashboard'}</span>
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
                          >
                            <User className="w-5 h-5" />
                            <span className="font-medium">{language === 'ms' ? 'Profil' : 'Profile'}</span>
                          </Link>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              handleSignOut();
                            }}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all w-full"
                          >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">{language === 'ms' ? 'Log Keluar' : 'Logout'}</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Dashboard navbar style (existing)
  return (
    <nav className="sticky top-0 z-40 bg-gradient-to-br from-green-900 via-green-800 to-green-900 backdrop-blur-lg border-b border-green-700/50">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left Side - Mobile Menu Spacer */}
          <div className="w-12 sm:w-14 lg:w-0"></div>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 ml-auto">
            {/* Language Switcher - Toggle Switch */}
            <button
              onClick={toggleLanguage}
              className="relative flex items-center rounded-full p-1 transition-all duration-300 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              title={language === 'ms' ? 'Switch to English' : 'Tukar ke Bahasa Malaysia'}
            >
              <div className="relative flex items-center">
                {/* Background slider */}
                <motion.div
                  className="absolute left-0 h-8 rounded-full bg-white shadow-xl"
                  initial={false}
                  animate={{
                    x: language === 'en' ? 0 : 44,
                    width: 44,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                />
                {/* EN Option */}
                <span
                  className={`relative z-10 px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 w-11 text-center ${
                    language === 'en'
                      ? 'text-green-700'
                      : 'text-white/60'
                  }`}
                >
                  EN
                </span>
                {/* MS Option */}
                <span
                  className={`relative z-10 px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 w-11 text-center ${
                    language === 'ms'
                      ? 'text-green-700'
                      : 'text-white/60'
                  }`}
                >
                  MS
                </span>
              </div>
            </button>

            {/* User Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-green-900 font-bold text-xs sm:text-sm flex-shrink-0 overflow-hidden">
                  {user?.profilePictureUrl ? (
                    <img 
                      src={user.profilePictureUrl} 
                      alt={user.displayName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.displayName?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <span className="hidden sm:block font-medium text-white/90 text-xs sm:text-sm truncate max-w-[100px] md:max-w-none">
                  {user?.displayName || 'User'}
                </span>
              </motion.button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div
                      onClick={() => setShowUserMenu(false)}
                      className="fixed inset-0 z-40"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-52 sm:w-56 bg-white rounded-lg sm:rounded-xl shadow-2xl z-50 border-2 border-gray-200 overflow-hidden"
                    >
                      <div className="p-1.5 sm:p-2">
                        <Link
                          href="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all ${
                            pathname === '/profile'
                              ? 'bg-green-50 text-green-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <User className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="font-medium text-sm sm:text-base">
                            {language === 'ms' ? 'Profil' : 'Profile'}
                          </span>
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all ${
                            pathname === '/settings'
                              ? 'bg-green-50 text-green-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Settings className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="font-medium text-sm sm:text-base">
                            {language === 'ms' ? 'Tetapan' : 'Settings'}
                          </span>
                        </Link>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleSignOut();
                          }}
                          className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all w-full"
                        >
                          <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="font-medium text-sm sm:text-base">
                            {language === 'ms' ? 'Log Keluar' : 'Logout'}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuthenticatedNavbar;

