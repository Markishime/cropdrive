'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useTranslation, type Language } from '@/i18n';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import { useLanguage } from './LanguageProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faGear,
  faRightFromBracket,
  faGauge,
  faScrewdriverWrench,
} from '@fortawesome/free-solid-svg-icons';

export const AuthenticatedNavbar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const { language: currentLang, setLanguage } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    const checkAdmin = async () => {
      try {
        const { auth } = await import('@/lib/firebase');
        if (!auth.currentUser) return;
        const token = await auth.currentUser.getIdToken();
        const res = await fetch('/api/admin/check', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setIsAdmin(!!data?.isAdmin);
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);

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
  const translateLabel = (english: string, malay: string, indonesian = malay) => (
    language === 'en' ? english : language === 'id' ? indonesian : malay
  );
  const languageOptions: Array<{ value: Language; code: string; label: string }> = [
    { value: 'en', code: 'EN', label: 'English' },
    { value: 'ms', code: 'MS', label: 'Bahasa Melayu' },
    { value: 'id', code: 'ID', label: 'Bahasa Indonesia' },
  ];

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const getLocalizedPath = (newLanguage: Language) => {
    if (!pathname) {
      return pathname;
    }

    if (/^\/(en|ms|id)(?=\/|$)/.test(pathname)) {
      return pathname.replace(/^\/(en|ms|id)(?=\/|$)/, `/${newLanguage}`);
    }

    return pathname;
  };

  const handleLanguageSelect = (newLanguage: Language) => {
    setShowLanguageMenu(false);

    if (newLanguage === currentLang) {
      return;
    }

    const nextPath = getLocalizedPath(newLanguage);

    setLanguage(newLanguage);

    if (nextPath && nextPath !== pathname) {
      router.push(nextPath);
    }

    toast.success(
      newLanguage === 'id'
        ? 'Bahasa diubah ke Bahasa Indonesia'
        : newLanguage === 'ms'
        ? 'Bahasa ditukar ke Bahasa Melayu'
        : 'Language changed to English'
    );
  };

  const renderLanguageDropdown = () => {
    const overlayTheme = isLandingPage && !scrolled;

    return (
      <div ref={languageMenuRef} className="relative">
        <button
          onClick={() => setShowLanguageMenu((current) => !current)}
          className={`relative flex cursor-pointer items-center gap-2 rounded-full p-1 transition-all duration-300 ${
            overlayTheme
              ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
              : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
          }`}
          aria-haspopup="menu"
          aria-expanded={showLanguageMenu}
          title={translateLabel('Choose language', 'Pilih bahasa', 'Pilih bahasa')}
        >
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black tracking-[0.24em] text-green-800 shadow-xl">
            {language.toUpperCase()}
          </span>
          <svg
            className={`mr-2 h-4 w-4 transition-transform duration-200 ${showLanguageMenu ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {showLanguageMenu && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className={`absolute right-0 top-full z-[120] mt-3 w-56 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${
                overlayTheme ? 'border-yellow-400/30 bg-gray-900/95' : 'border-green-200 bg-white/95'
              }`}
              role="menu"
            >
              <div className="p-2">
                {languageOptions.map((option) => {
                  const active = option.value === currentLang;

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleLanguageSelect(option.value)}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                        active
                          ? overlayTheme
                            ? 'bg-yellow-400/20 text-yellow-300'
                            : 'bg-green-50 text-green-700'
                          : overlayTheme
                          ? 'text-white hover:bg-white/10'
                          : 'text-gray-700 hover:bg-green-50/80'
                      }`}
                      role="menuitem"
                    >
                      <div>
                        <div className="text-sm font-bold">{option.label}</div>
                        <div className={`text-xs ${overlayTheme ? 'text-gray-400' : 'text-gray-500'}`}>{option.code}</div>
                      </div>
                      {active && (
                        <span className={`text-xs font-bold uppercase tracking-[0.2em] ${overlayTheme ? 'text-yellow-300' : 'text-green-600'}`}>
                          {translateLabel('Active', 'Aktif', 'Aktif')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const handleSignOut = async () => {
    try {
      await signOut(language);
      router.push('/');
    } catch (error) {
      toast.error(translateLabel('Error logging out', 'Ralat log keluar', 'Terjadi kesalahan saat keluar'));
    }
  };

  // Landing page navbar style
  if (isLandingPage) {
    const navbarClasses = `
      fixed top-0 left-0 right-0 z-[100] transition-all duration-500
      ${scrolled
        ? 'glass-nav-scrolled'
        : 'glass-nav'
      }
    `;

    return (
      <nav className={navbarClasses}>
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group mr-4 sm:mr-8 lg:mr-12 flex-shrink-0">
              <div className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden transition-all duration-500 flex-shrink-0 flex items-center justify-center ${
                scrolled ? 'bg-white shadow-md' : 'bg-white/90 shadow-lg'
              }`}>
                <Image
                  src="/images/Cropdrive Logo.png"
                  alt="CropDrive Logo"
                  width={40}
                  height={40}
                  className="object-contain"
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
              {renderLanguageDropdown()}

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
                  <FontAwesomeIcon icon={faGauge} className="w-4 h-4 mr-2" />
                  {translateLabel('Dashboard', 'Papan Pemuka', 'Dashboard')}
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
                            <FontAwesomeIcon icon={faGauge} className="w-5 h-5" />
                            <span className="font-medium">{translateLabel('Dashboard', 'Papan Pemuka', 'Dashboard')}</span>
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
                          >
                            <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
                            <span className="font-medium">{translateLabel('Profile', 'Profil', 'Profil')}</span>
                          </Link>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              handleSignOut();
                            }}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all w-full"
                          >
                            <FontAwesomeIcon icon={faRightFromBracket} className="w-5 h-5" />
                            <span className="font-medium">{translateLabel('Logout', 'Log Keluar', 'Keluar')}</span>
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
    <nav className="sticky top-0 z-40 glass-sidebar border-b border-white/10 shadow-lg backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left Side - Mobile Menu Spacer */}
          <div className="w-12 sm:w-14 lg:w-0"></div>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 ml-auto">
            {/* Manage pages - only for admin (dashboard navbar only, not landing) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-400/20 border border-yellow-400/40 text-yellow-200 hover:bg-yellow-400/30 hover:text-white transition-colors font-medium text-sm"
                title={translateLabel('Manage pages', 'Urus halaman', 'Kelola halaman')}
              >
                <FontAwesomeIcon icon={faScrewdriverWrench} className="w-4 h-4" />
                <span className="hidden sm:inline">{translateLabel('Manage', 'Urus', 'Kelola')}</span>
              </Link>
            )}
            {/* Language Switcher */}
            {renderLanguageDropdown()}

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
                          <FontAwesomeIcon icon={faUser} className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="font-medium text-sm sm:text-base">
                            {translateLabel('Profile', 'Profil', 'Profil')}
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
                          <FontAwesomeIcon icon={faGear} className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="font-medium text-sm sm:text-base">
                            {translateLabel('Settings', 'Tetapan', 'Pengaturan')}
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
                          <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="font-medium text-sm sm:text-base">
                            {translateLabel('Logout', 'Log Keluar', 'Keluar')}
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

