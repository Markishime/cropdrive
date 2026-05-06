'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { type Language } from '@/i18n';
import Button from './ui/Button';
import toast from 'react-hot-toast';
import { useLanguage } from './LanguageProvider';

interface NavLink {
  href: string;
  label: string;
  labelMs: string;
  authRequired?: boolean;
}

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showGetStartedDropdown, setShowGetStartedDropdown] = useState(false);
  const { user } = useAuth();
  const { language: currentLang, setLanguage } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const desktopLanguageMenuRef = useRef<HTMLDivElement>(null);
  const mobileLanguageMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const language = mounted ? currentLang : 'en';
  const translateLabel = (english: string, malay: string, indonesian = malay) => (
    language === 'en' ? english : language === 'id' ? indonesian : malay
  );

  const languageOptions: Array<{ value: Language; code: string; label: string }> = [
    { value: 'en', code: 'EN', label: 'English' },
    { value: 'ms', code: 'MS', label: 'Bahasa Melayu' },
    { value: 'id', code: 'ID', label: 'Bahasa Indonesia' },
  ];

  // Nav links - Marketing-focused navigation (sidebar handles authenticated pages)
  const getNavLinks = (): NavLink[] => {
    return [
      { href: '/', label: 'Home', labelMs: 'Laman Utama' },
      { href: '/how-it-works', label: 'How It Works', labelMs: 'Cara Ia Berfungsi' },
      { href: '/podcasts', label: 'Podcasts', labelMs: 'Podcast' },
      { href: '/blog', label: 'Blog', labelMs: 'Blog' },
      { href: '/about', label: 'About Us', labelMs: 'Tentang Kami' },
      { href: '/contact', label: 'Contact Us', labelMs: 'Hubungi Kami' },
    ];
  };

  const navLinks = getNavLinks();
  
  // Get Started dropdown items (only visible before login)
  const getStartedLinks = [
    { href: '/get-started/farmers', label: 'For Farmers', labelMs: 'Untuk Petani' },
    { href: '/get-started/organizations', label: 'For Organizations', labelMs: 'Untuk Organisasi' },
    { href: '/features', label: 'Features', labelMs: 'Ciri-ciri' },
    { href: '/pricing', label: 'Pricing', labelMs: 'Harga' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideDesktop = desktopLanguageMenuRef.current?.contains(target);
      const insideMobile = mobileLanguageMenuRef.current?.contains(target);

      if (!insideDesktop && !insideMobile) {
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

  const renderLanguageDropdown = (mobile = false) => (
    <div ref={mobile ? mobileLanguageMenuRef : desktopLanguageMenuRef} className="relative">
      <button
        onClick={() => setShowLanguageMenu((current) => !current)}
        className={`relative flex items-center gap-2 rounded-full p-1 transition-all duration-300 ${
          scrolled
            ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
        } cursor-pointer`}
        aria-haspopup="menu"
        aria-expanded={showLanguageMenu}
        title={translateLabel('Choose language', 'Pilih bahasa', 'Pilih bahasa')}
      >
        <span className={`rounded-full px-3 py-1.5 text-xs font-black tracking-[0.24em] ${scrolled ? 'bg-white text-green-700' : 'bg-white text-green-800'}`}>
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
            className={`absolute right-0 top-full z-[120] mt-3 w-56 overflow-hidden rounded-2xl shadow-2xl bg-white border border-gray-200 ${mobile ? 'md:hidden' : ''}`}
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
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700 hover:bg-green-50/80'
                    }`}
                    role="menuitem"
                  >
                    <div>
                      <div className="text-sm font-bold">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.code}</div>
                    </div>
                    {active && (
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">
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

  const navbarClasses = `
    fixed top-0 left-0 right-0 z-[100] transition-all duration-500
    ${scrolled
      ? 'glass-nav-scrolled'
      : 'glass-nav'
    }
  `;

  return (
    <>
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo - CropDrive OP Advisor™ */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group mr-4 sm:mr-8 lg:mr-12 flex-shrink-0">
            {/* CropDrive Logo */}
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

          {/* Desktop Navigation - Modern & Transparent */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4 xl:space-x-6 flex-1 justify-center max-w-2xl">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-semibold text-xs lg:text-sm uppercase tracking-wide transition-all duration-300 hover:text-yellow-400 relative group whitespace-nowrap px-1 ${
                  scrolled 
                    ? 'text-gray-700' 
                    : 'text-white'
                }`}
              >
                {language === 'en' ? link.label : link.labelMs}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}

            {/* Get Started Dropdown (Only Before Login) */}
            {!user && (
              <div 
                className="relative"
                onMouseEnter={() => setShowGetStartedDropdown(true)}
                onMouseLeave={() => setShowGetStartedDropdown(false)}
              >
                <button
                  className={`font-semibold text-xs lg:text-sm uppercase tracking-wide transition-all duration-300 hover:text-yellow-400 flex items-center space-x-1 relative group whitespace-nowrap ${
                    scrolled ? 'text-gray-700' : 'text-white'
                  } cursor-pointer`}
                >
                  <span>{translateLabel('Get Started', 'Mula', 'Mulai')}</span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${showGetStartedDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                </button>

                {/* Dropdown Menu - Modern Glass Effect */}
                <AnimatePresence>
                  {showGetStartedDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute top-full right-0 mt-3 w-72 rounded-2xl shadow-2xl overflow-hidden ${
                        scrolled 
                          ? 'glass-light border border-white/60' 
                          : 'glass border border-white/12'
                      }`}
                    >
                      {getStartedLinks.map((item, index) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block px-6 py-4 text-sm transition-all duration-300 hover:pl-8 ${
                            scrolled 
                              ? 'text-gray-700 hover:bg-green-50/80 hover:text-green-700' 
                              : 'text-white hover:bg-yellow-400/20 hover:text-yellow-300'
                          } ${index > 0 ? 'border-t' : ''} ${scrolled ? 'border-gray-200' : 'border-gray-700'}`}
                        >
                          <div className="font-bold text-base mb-1">{language === 'en' ? item.label : item.labelMs}</div>
                          <div className={`text-xs ${scrolled ? 'text-gray-500' : 'text-gray-400'}`}>
                            {item.label === 'For Farmers' 
                              ? translateLabel('Individual palm oil farmers & smallholders', 'Untuk petani kelapa sawit individu', 'Untuk petani kelapa sawit individu')
                              : translateLabel('Large plantations & organizations', 'Untuk ladang dan organisasi besar', 'Untuk perkebunan dan organisasi besar')
                            }
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Language Switcher */}
            {renderLanguageDropdown()}

            {/* Auth & Actions */}
            {user ? (
              <div className="flex items-center">
                {/* Dashboard Button */}
                <Link href="/dashboard">
                  <button className={`px-5 py-2.5 font-bold rounded-xl uppercase tracking-wide text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                    scrolled
                      ? 'btn-v2-primary'
                      : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 shadow-lg hover:shadow-xl hover:from-yellow-300 hover:to-yellow-400 border border-yellow-300/40'
                  }`}>
                    {translateLabel('Dashboard', 'Papan Pemuka', 'Dashboard')}
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link href="/login">
                  <button className={`px-3 sm:px-5 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
                    scrolled
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-white hover:bg-white/10'
                  }`}>
                    {translateLabel('Login', 'Masuk', 'Masuk')}
                  </button>
                </Link>
                <Link href="/register">
                  <button className={`px-5 py-2.5 font-bold rounded-xl uppercase tracking-wide text-xs sm:text-sm whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                    scrolled
                      ? 'btn-v2-primary'
                      : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 shadow-lg hover:shadow-xl hover:from-yellow-300 hover:to-yellow-400 border border-yellow-300/40'
                  }`}>
                    {translateLabel('Register', 'Daftar', 'Daftar')}
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Language Switcher */}
            {renderLanguageDropdown(true)}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-lg transition-colors duration-200 z-[110] relative ${
                scrolled
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              } cursor-pointer`}
              aria-label={isOpen ? translateLabel('Close menu', 'Tutup menu', 'Tutup menu') : translateLabel('Open menu', 'Buka menu', 'Buka menu')}
              style={{ position: 'relative', zIndex: 110 }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

    </nav>

      {/* Mobile Navigation - Outside nav to avoid stacking context issues */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] md:hidden"
              style={{ 
                top: 0, 
                left: 0,
                right: 0,
                bottom: 0,
                position: 'fixed'
              }}
            />
            {/* Mobile Menu */}
            <motion.div
              className="fixed left-0 right-0 bottom-0 md:hidden bg-gray-900/98 backdrop-blur-lg border-b border-gray-700 z-[9999] overflow-y-auto shadow-2xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              style={{ 
                top: '3.5rem',
                maxHeight: 'calc(100vh - 3.5rem)',
                position: 'fixed',
                zIndex: 9999
              }}
            >
              <div className="px-4 sm:px-6 py-6 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-white hover:text-yellow-400 font-semibold text-base py-3 px-3 rounded-lg hover:bg-white/10 transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    {language === 'en' ? link.label : link.labelMs}
                  </Link>
                ))}

                {/* Get Started Links in Mobile (Only Before Login) */}
                {!user && (
                  <div className="pt-4 mt-4 border-t border-gray-700">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
                      {translateLabel('Get Started', 'Mula', 'Mulai')}
                    </div>
                    {getStartedLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block text-white hover:text-yellow-400 font-medium text-sm transition-colors duration-200 py-2.5 px-3 rounded-lg hover:bg-white/10"
                        onClick={() => setIsOpen(false)}
                      >
                        {language === 'en' ? link.label : link.labelMs}
                      </Link>
                    ))}
                  </div>
                )}

                <div className="flex flex-col space-y-3 pt-6 mt-6 border-t border-gray-700">
                  {user ? (
                    <Link href="/dashboard" onClick={() => setIsOpen(false)} className="w-full">
                      <Button size="md" className="w-full">
                        {translateLabel('Dashboard', 'Papan Pemuka', 'Dashboard')}
                      </Button>
                    </Link>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                        <Button size="md" variant="outline" className="w-full">
                          {translateLabel('Login', 'Log Masuk', 'Masuk')}
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsOpen(false)} className="w-full">
                        <Button size="md" className="w-full">
                          {translateLabel('Register', 'Daftar', 'Daftar')}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;