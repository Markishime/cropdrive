'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
    window.location.reload();
  };

  const navbarClasses = `
    fixed top-0 left-0 right-0 z-50 transition-all duration-500
    ${scrolled
      ? 'bg-white/95 backdrop-blur-lg shadow-lg'
      : 'bg-transparent'
    }
  `;

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - CropDrive OP Advisor™ */}
          <Link href="/" className="flex items-center space-x-3 group mr-8 lg:mr-12">
            {/* Oil Palm Tree Icon */}
            <div className={`w-10 h-10 flex items-center justify-center transition-all duration-500 ${
              scrolled ? 'text-green-600' : 'text-yellow-400'
            }`}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Palm Fronds */}
                <path d="M20 8 C15 10, 12 15, 10 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <path d="M20 8 C25 10, 28 15, 30 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <path d="M20 10 C16 12, 14 16, 13 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                <path d="M20 10 C24 12, 26 16, 27 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                <path d="M20 6 C18 9, 16 12, 15 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                <path d="M20 6 C22 9, 24 12, 25 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                <path d="M20 12 C17 14, 15 17, 14 22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                <path d="M20 12 C23 14, 25 17, 26 22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                {/* Trunk */}
                <rect x="18" y="20" width="4" height="15" rx="1" fill="currentColor"/>
                {/* Palm Fruits (clusters) */}
                <circle cx="18" cy="22" r="1.5" fill="currentColor" opacity="0.8"/>
                <circle cx="22" cy="22" r="1.5" fill="currentColor" opacity="0.8"/>
                <circle cx="17" cy="24" r="1.2" fill="currentColor" opacity="0.7"/>
                <circle cx="23" cy="24" r="1.2" fill="currentColor" opacity="0.7"/>
              </svg>
            </div>
            
            <div className="flex items-start leading-tight whitespace-nowrap">
              <span className={`font-black text-lg md:text-xl tracking-tight transition-all duration-500 ${
                scrolled ? 'text-gray-900' : 'text-white'
              } font-heading`}>
                CropDrive OP Advisor
              </span>
              <sup className={`text-xs font-black ml-0.5 transition-all duration-500 ${
                scrolled ? 'text-yellow-500' : 'text-yellow-400'
              }`}>
                ™
              </sup>
            </div>
          </Link>

          {/* Desktop Navigation - Modern & Transparent */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-semibold text-xs lg:text-sm uppercase tracking-wide transition-all duration-300 hover:text-yellow-400 relative group whitespace-nowrap ${
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

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                scrolled
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              }`}
              title={language === 'ms' ? 'Switch to English' : 'Tukar ke Bahasa Malaysia'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="font-bold">{language === 'ms' ? 'EN' : 'MS'}</span>
            </button>

            {/* Auth & Actions */}
            {user ? (
              <button
                onClick={async () => {
                  try {
                    await signOut();
                    toast.success(language === 'ms' ? 'Berjaya log keluar' : 'Successfully logged out');
                    router.push('/');
                  } catch (error) {
                    toast.error(language === 'ms' ? 'Ralat log keluar' : 'Error logging out');
                  }
                }}
                className={`px-5 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
                  scrolled
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {language === 'ms' ? 'Log Keluar' : 'Logout'}
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <button className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                    scrolled
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-white hover:bg-white/10'
                  }`}>
                    {language === 'ms' ? 'Log Masuk' : 'Login'}
                  </button>
                </Link>
                <Link href="/register">
                  <button className={`px-6 py-3 font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl uppercase tracking-wide text-sm whitespace-nowrap ${
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
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg transition-colors duration-200 text-white hover:bg-white/10"
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

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-white/95 backdrop-blur-md border-b border-gray-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {language === 'ms' ? link.labelMs : link.label}
                </Link>
              ))}

              {/* Get Started Links in Mobile (Only Before Login) */}
              {!user && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                    {language === 'ms' ? 'Mula' : 'Get Started'}
                  </div>
                  {getStartedLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-gray-600 hover:text-green-600 font-medium transition-colors duration-200 py-2 px-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {language === 'ms' ? link.labelMs : link.label}
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
                >
                  <span className="font-medium">
                    {language === 'ms' ? 'English' : 'Bahasa Malaysia'}
                  </span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                    />
                  </svg>
                </button>

                {user ? (
                  <button
                    onClick={async () => {
                      setIsOpen(false);
                      try {
                        await signOut();
                        toast.success(language === 'ms' ? 'Berjaya log keluar' : 'Successfully logged out');
                        router.push('/');
                      } catch (error) {
                        toast.error(language === 'ms' ? 'Ralat log keluar' : 'Error logging out');
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded font-medium text-sm hover:bg-red-700 transition-colors duration-200"
                  >
                    {language === 'ms' ? 'Log Keluar' : 'Logout'}
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button size="sm" variant="ghost">
                        {language === 'ms' ? 'Log Masuk' : 'Login'}
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      <Button size="sm">
                        {language === 'ms' ? 'Daftar' : 'Register'}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;