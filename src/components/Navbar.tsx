'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import Button from './ui/Button';
import toast from 'react-hot-toast';

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
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const lang = (localStorage.getItem('cropdrive-language') || 'en') as 'en' | 'ms';
    setCurrentLang(lang);
  }, []);

  const language = mounted ? currentLang : 'en';

  // State for dropdown menu
  const [showDropdown, setShowDropdown] = useState(false);

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

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ms' : 'en';
    localStorage.setItem('cropdrive-language', newLanguage);
    
    // Dispatch custom event before reload so components can react
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: newLanguage } 
    }));
    
    window.location.reload();
  };

  const navbarClasses = `
    fixed top-0 left-0 right-0 z-[100] transition-all duration-500
    ${scrolled
      ? 'bg-white/95 backdrop-blur-lg shadow-lg'
      : 'bg-transparent'
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
            <div className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden transition-all duration-500 flex-shrink-0 ${
              scrolled ? 'bg-white shadow-md' : 'bg-white/90 shadow-lg'
            }`}>
              <Image
                src="/images/Cropdrive Logo.png"
                alt="CropDrive Logo"
                width={40}
                height={40}
                className="object-cover w-full h-full"
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
                {language === 'ms' ? link.labelMs : link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}

            {/* Get Started Dropdown (Only Before Login) */}
            {!user && (
              <div 
                className="relative"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <button
                  className={`font-semibold text-xs lg:text-sm uppercase tracking-wide transition-all duration-300 hover:text-yellow-400 flex items-center space-x-1 relative group whitespace-nowrap ${
                    scrolled ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  <span>{language === 'ms' ? 'Mula' : 'Get Started'}</span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`}
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
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute top-full right-0 mt-3 w-72 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl border-2 ${
                        scrolled 
                          ? 'bg-white/95 border-green-200' 
                          : 'bg-gray-900/95 border-yellow-400/30'
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
                          <div className="font-bold text-base mb-1">{language === 'ms' ? item.labelMs : item.label}</div>
                          <div className={`text-xs ${scrolled ? 'text-gray-500' : 'text-gray-400'}`}>
                            {item.label === 'For Farmers' 
                              ? (language === 'ms' ? 'Untuk petani kelapa sawit individu' : 'Individual palm oil farmers & smallholders')
                              : (language === 'ms' ? 'Untuk ladang dan organisasi besar' : 'Large plantations & organizations')
                            }
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Language Switcher - Toggle Switch */}
            <button
              onClick={toggleLanguage}
              className={`relative flex items-center rounded-full p-1 transition-all duration-300 ${
                scrolled
                  ? 'bg-gray-200 hover:bg-gray-300'
                  : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
              }`}
              title={language === 'ms' ? 'Switch to English' : 'Tukar ke Bahasa Malaysia'}
            >
              <div className="relative flex items-center">
                {/* Background slider */}
                <motion.div
                  className={`absolute left-0 h-8 rounded-full ${
                    scrolled ? 'bg-white shadow-lg' : 'bg-white shadow-xl'
                  }`}
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
                      : scrolled
                        ? 'text-gray-500'
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
                      : scrolled
                        ? 'text-gray-500'
                        : 'text-white/60'
                  }`}
                >
                  MS
                </span>
              </div>
            </button>

            {/* Auth & Actions */}
            {user ? (
              <div className="flex items-center">
                {/* Dashboard Button */}
                <Link href="/dashboard">
                  <button className={`px-4 sm:px-6 py-2 sm:py-3 font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl uppercase tracking-wide text-xs sm:text-sm whitespace-nowrap ${
                    scrolled
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                      : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 hover:from-yellow-300 hover:to-yellow-400'
                  }`}>
                    {language === 'ms' ? 'Papan Pemuka' : 'Dashboard'}
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
                    {language === 'ms' ? 'Masuk' : 'Login'}
                  </button>
                </Link>
                <Link href="/register">
                  <button className={`px-4 sm:px-6 py-2 sm:py-3 font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl uppercase tracking-wide text-xs sm:text-sm whitespace-nowrap ${
                    scrolled
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                      : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 hover:from-yellow-300 hover:to-yellow-400'
                  }`}>
                    {language === 'ms' ? 'Daftar' : 'Register'}
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Language Switcher - Toggle Switch */}
            <button
              onClick={toggleLanguage}
              className={`relative flex items-center rounded-full p-1 transition-all duration-300 ${
                scrolled
                  ? 'bg-gray-200 hover:bg-gray-300'
                  : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
              }`}
              title={language === 'ms' ? 'Switch to English' : 'Tukar ke Bahasa Malaysia'}
            >
              <div className="relative flex items-center">
                {/* Background slider */}
                <motion.div
                  className={`absolute left-0 h-8 rounded-full ${
                    scrolled ? 'bg-white shadow-lg' : 'bg-white shadow-xl'
                  }`}
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
                      : scrolled
                        ? 'text-gray-500'
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
                      : scrolled
                        ? 'text-gray-500'
                        : 'text-white/60'
                  }`}
                >
                  MS
                </span>
              </div>
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-lg transition-colors duration-200 z-[110] relative ${
                scrolled
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              }`}
              aria-label={isOpen ? (language === 'ms' ? 'Tutup menu' : 'Close menu') : (language === 'ms' ? 'Buka menu' : 'Open menu')}
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
                    {language === 'ms' ? link.labelMs : link.label}
                  </Link>
                ))}

                {/* Get Started Links in Mobile (Only Before Login) */}
                {!user && (
                  <div className="pt-4 mt-4 border-t border-gray-700">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
                      {language === 'ms' ? 'Mula' : 'Get Started'}
                    </div>
                    {getStartedLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block text-white hover:text-yellow-400 font-medium text-sm transition-colors duration-200 py-2.5 px-3 rounded-lg hover:bg-white/10"
                        onClick={() => setIsOpen(false)}
                      >
                        {language === 'ms' ? link.labelMs : link.label}
                      </Link>
                    ))}
                  </div>
                )}

                <div className="flex flex-col space-y-3 pt-6 mt-6 border-t border-gray-700">
                  {user ? (
                    <Link href="/dashboard" onClick={() => setIsOpen(false)} className="w-full">
                      <Button size="md" className="w-full">
                        {language === 'ms' ? 'Papan Pemuka' : 'Dashboard'}
                      </Button>
                    </Link>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                        <Button size="md" variant="outline" className="w-full">
                          {language === 'ms' ? 'Log Masuk' : 'Login'}
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsOpen(false)} className="w-full">
                        <Button size="md" className="w-full">
                          {language === 'ms' ? 'Daftar' : 'Register'}
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