'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useTranslation, getCurrentLanguage } from '@/i18n';
import { getPlanById } from '@/lib/subscriptions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGauge,
  faMessage,
  faBookOpen,
  faBars,
  faXmark,
  faChevronRight,
  faChevronLeft,
  faFileAlt,
  faHouse,
  faRobot,
  faPodcast,
} from '@fortawesome/free-solid-svg-icons';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  labelMs: string;
  language: 'en' | 'ms';
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  href,
  icon,
  label,
  labelMs,
  language,
  isActive,
  isCollapsed,
  onClick
}) => {
  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        whileHover={{ x: isCollapsed ? 0 : 4 }}
        whileTap={{ scale: 0.98 }}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2 sm:space-x-3'} px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 shadow-lg font-bold'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
        title={isCollapsed ? (language === 'ms' ? labelMs : label) : undefined}
      >
              <div className={`flex-shrink-0 ${isActive ? 'text-green-900' : 'text-white/80 group-hover:text-white'}`}>
                {icon}
              </div>
              {!isCollapsed && (
                <>
                  <span className={`font-semibold text-xs sm:text-sm flex-1 truncate ${isActive ? 'text-green-900' : 'text-white/90'}`}>
                    {language === 'ms' ? labelMs : label}
                  </span>
                  {isActive && (
                    <FontAwesomeIcon icon={faChevronRight} className="ml-auto w-3 h-3 sm:w-4 sm:h-4 text-green-900 flex-shrink-0" />
                  )}
          </>
        )}
      </motion.div>
    </Link>
  );
};

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLang(lang);
    
    // Load collapsed state from localStorage
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    setIsCollapsed(savedCollapsed === 'true');
    
    // Check admin status
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    const { auth } = await import('@/lib/firebase');
    if (!auth.currentUser) return;
    
    try {
      const token = await auth.currentUser.getIdToken();
      // Use dedicated admin check endpoint (avoid 403 spam on KB routes)
      const response = await fetch('/api/admin/check', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        setIsAdmin(false);
        return;
      }

      const result = await response.json();
      setIsAdmin(!!result?.isAdmin);
    } catch (err) {
      setIsAdmin(false);
    }
  };

  const { language } = useTranslation(currentLang);

  const toggleCollapsed = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('sidebar-collapsed', String(newCollapsed));
  };

  // Dynamic sidebar items based on user's plan
  const hasPlan = user && user.plan && user.plan !== 'none';
  
  // Helper function to check if pathname matches item href (handles locale-prefixed routes)
  const isPathActive = (itemHref: string, currentPathname: string): boolean => {
    // Match exact path (e.g., /dashboard)
    if (currentPathname === itemHref || currentPathname.startsWith(itemHref + '/')) {
      return true;
    }
    // Match locale-prefixed paths (e.g., /en/dashboard, /ms/dashboard)
    const localePattern = /^\/(en|ms)\//;
    if (localePattern.test(currentPathname)) {
      const pathWithoutLocale = currentPathname.replace(/^\/(en|ms)/, '');
      return pathWithoutLocale === itemHref || pathWithoutLocale.startsWith(itemHref + '/');
    }
    return false;
  };
  
  const sidebarItems = [
    {
      href: '/',
      icon: <FontAwesomeIcon icon={faHouse} className="w-5 h-5" />,
      label: 'Home',
      labelMs: 'Laman Utama',
      showAlways: true
    },
    {
      href: '/dashboard',
      icon: <FontAwesomeIcon icon={faGauge} className="w-5 h-5" />,
      label: 'Dashboard',
      labelMs: 'Papan Pemuka',
      showAlways: true
    },
    // AI Assistant - only for users with plans
    {
      href: '/assistant',
      icon: <FontAwesomeIcon icon={faMessage} className="w-5 h-5" />,
      label: 'AI Assistant',
      labelMs: 'Pembantu AI',
      showAlways: false,
      requiresPlan: true
    },
    // Palmira Chatbot - only for users with plans
    {
      href: '/palmira',
      icon: <FontAwesomeIcon icon={faRobot} className="w-5 h-5" />,
      label: 'Palmira',
      labelMs: 'Palmira',
      showAlways: false,
      requiresPlan: true
    },
    // Reports - only for users with plans
    {
      href: '/reports',
      icon: <FontAwesomeIcon icon={faFileAlt} className="w-5 h-5" />,
      label: 'Reports History',
      labelMs: 'Sejarah Laporan',
      showAlways: false,
      requiresPlan: true
    },
    // Podcasts - only for authenticated users with a plan
    {
      href: '/podcasts',
      icon: <FontAwesomeIcon icon={faPodcast} className="w-5 h-5" />,
      label: 'Podcasts',
      labelMs: 'Podcast',
      showAlways: false,
      requiresPlan: true
    },
    // Payment Method - only for users with plans
    {
      href: '/payment-method',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>,
      label: 'Payment Method',
      labelMs: 'Kaedah Bayaran',
      showAlways: false,
      requiresPlan: true
    },
    {
      href: '/tutorials',
      icon: <FontAwesomeIcon icon={faBookOpen} className="w-5 h-5" />,
      label: 'Tutorials',
      labelMs: 'Tutorial',
      showAlways: true
    },
    {
      href: '/pricing',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>,
      label: 'Plans & Pricing',
      labelMs: 'Pelan & Harga',
      showAlways: true
    },
    // Support - only for users with plans
    {
      href: '/support',
      icon: <FontAwesomeIcon icon={faMessage} className="w-5 h-5" />,
      label: 'Support',
      labelMs: 'Sokongan',
      showAlways: false,
      requiresPlan: true
    },
  ].filter(item => {
    if (item.showAlways) return true;
    if (item.requiresPlan && hasPlan) return true;
    // if (item.requiresAdmin && isAdmin) return true;
    return false;
  });

  const SidebarContent = () => (
    <div className="h-full flex flex-col min-h-screen lg:min-h-0">
            {/* Logo & Collapse Button */}
            <div className="p-4 sm:p-6 border-b border-green-700/50">
        <div className="flex items-center justify-between">
          {isCollapsed ? (
            <Link href="/dashboard" className="flex items-center justify-center mx-auto mb-2" onClick={() => setIsOpen(false)}>
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all">
                <Image
                  src="/images/Cropdrive Logo.png"
                  alt="CropDrive Logo"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3 group flex-1 min-w-0" onClick={() => setIsOpen(false)}>
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white overflow-hidden shadow-lg group-hover:shadow-xl transition-all flex-shrink-0">
                <Image
                  src="/images/Cropdrive Logo.png"
                  alt="CropDrive Logo"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-start leading-tight">
                    <span className="font-black text-base sm:text-lg text-white font-heading truncate">
                      CropDrive
                    </span>
                    <sup className="text-xs font-black ml-0.5 text-yellow-400 flex-shrink-0">™</sup>
                  </div>
                  <span className="text-xs text-white/70 font-medium truncate">OP Advisor</span>
                </div>
            </Link>
          )}
          {!isCollapsed && (
            <button
              onClick={toggleCollapsed}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 ml-2 hidden lg:block"
              title={language === 'ms' ? 'Runtuhkan' : 'Collapse'}
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
            </button>
          )}
        </div>
        {isCollapsed && (
          <button
            onClick={toggleCollapsed}
            className="w-full p-2 rounded-lg hover:bg-white/10 transition-colors mt-2 hidden lg:block"
            title={language === 'ms' ? 'Kembangkan' : 'Expand'}
          >
            <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5 text-white/80 mx-auto" />
          </button>
        )}
      </div>

            {/* User Profile */}
            {user && !isCollapsed && (
              <div className="p-4 sm:p-6 border-b border-green-700/50">
          <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-green-900 font-bold text-base sm:text-lg shadow-lg flex-shrink-0 overflow-hidden">
                  {user.profilePictureUrl ? (
                    <img 
                      src={user.profilePictureUrl} 
                      alt={user.displayName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.displayName?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate text-sm sm:text-base">{user.displayName || 'User'}</p>
                  <p className="text-xs text-white/70 truncate">{user.email}</p>
                  {hasPlan && user.plan && (
                    <div className="mt-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-yellow-400 text-green-900">
                        {(() => {
                          const plan = getPlanById(user.plan);
                          return plan ? (language === 'ms' ? plan.nameMs : plan.name) : user.plan.toUpperCase();
                        })()}
                      </span>
                    </div>
                  )}
                </div>
          </div>
        </div>
      )}
      
            {/* User Avatar (Collapsed) */}
            {user && isCollapsed && (
              <div className="p-4 border-b border-green-700/50 flex justify-center hidden lg:flex">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-green-900 font-bold text-sm shadow-lg overflow-hidden">
                  {user.profilePictureUrl ? (
                    <img 
                      src={user.profilePictureUrl} 
                      alt={user.displayName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.displayName?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
              </div>
            )}

      {/* Navigation Items */}
      <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-3 sm:p-4'} space-y-1 sm:space-y-2 overflow-y-auto`}>
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.href}
            {...item}
            language={language}
            isActive={isPathActive(item.href, pathname)}
            isCollapsed={isCollapsed}
            onClick={() => setIsOpen(false)}
          />
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50 lg:hidden p-2.5 sm:p-3 rounded-lg bg-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
        aria-label={isOpen ? (language === 'ms' ? 'Tutup menu' : 'Close menu') : (language === 'ms' ? 'Buka menu' : 'Open menu')}
      >
        {isOpen ? (
          <FontAwesomeIcon icon={faXmark} className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
        ) : (
          <FontAwesomeIcon icon={faBars} className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
        )}
      </button>

      {/* Desktop Sidebar - Solid Green Background */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <motion.div
          animate={{ width: isCollapsed ? 80 : 288 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 border-r border-green-700 shadow-2xl h-screen"
        >
          <SidebarContent />
        </motion.div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 sm:w-80 bg-gradient-to-br from-green-900 via-green-800 to-green-900 shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

