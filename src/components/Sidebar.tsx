'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useTranslation, getCurrentLanguage, type Language } from '@/i18n';
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
  language: Language;
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
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 shadow-[0_4px_16px_rgba(250,204,21,0.45)] font-bold'
                  : 'text-white/75 hover:bg-white/12 hover:text-white hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]'
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
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

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
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const { language } = useTranslation(currentLang);

  const toggleCollapsed = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('sidebar-collapsed', String(newCollapsed));
  };

  // Free transition: all logged-in users can access all features
  // Removed plan-based filtering - hasPlan always true for authenticated users
  
  // Helper function to check if pathname matches item href (handles locale-prefixed routes)
  const isPathActive = (itemHref: string, currentPathname: string): boolean => {
    // Match exact path (e.g., /dashboard)
    if (currentPathname === itemHref || currentPathname.startsWith(itemHref + '/')) {
      return true;
    }
    // Match locale-prefixed paths (e.g., /en/dashboard, /ms/dashboard)
    const localePattern = /^\/(en|ms|id)\//;
    if (localePattern.test(currentPathname)) {
      const pathWithoutLocale = currentPathname.replace(/^\/(en|ms|id)/, '');
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
    // AI Assistant - now available to all authenticated users
    {
      href: '/assistant',
      icon: <FontAwesomeIcon icon={faMessage} className="w-5 h-5" />,
      label: 'AI Assistant',
      labelMs: 'Pembantu AI',
      showAlways: true
    },
    // Palmira Chatbot - now available to all authenticated users
    {
      href: '/palmira',
      icon: <FontAwesomeIcon icon={faRobot} className="w-5 h-5" />,
      label: 'Palmira',
      labelMs: 'Palmira',
      showAlways: true
    },
    // Reports - now available to all authenticated users
    {
      href: '/reports',
      icon: <FontAwesomeIcon icon={faFileAlt} className="w-5 h-5" />,
      label: 'Reports History',
      labelMs: 'Sejarah Laporan',
      showAlways: true
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
      labelMs: 'Akses Percuma',
      showAlways: true
    },
    // Support - now available to all authenticated users
    {
      href: '/support',
      icon: <FontAwesomeIcon icon={faMessage} className="w-5 h-5" />,
      label: 'Support',
      labelMs: 'Sokongan',
      showAlways: true
    },
  ].filter(item => {
    // All items showAlways=true now that plan gating is removed
    return item.showAlways;
  });

  const renderSidebarContent = () => (
    <div className="h-full flex flex-col min-h-screen lg:min-h-0">
            {/* Logo & Collapse Button */}
            <div className="p-4 sm:p-6 border-b border-green-700/50">
        <div className="flex items-center justify-between">
          {isCollapsed ? (
            <Link href="/dashboard" className="flex items-center justify-center mx-auto mb-2" onClick={() => setIsOpen(false)}>
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all flex items-center justify-center">
                <Image
                  src="/images/Cropdrive Logo.png"
                  alt="CropDrive Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3 group flex-1 min-w-0" onClick={() => setIsOpen(false)}>
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white overflow-hidden shadow-lg group-hover:shadow-xl transition-all flex-shrink-0 flex items-center justify-center">
                <Image
                  src="/images/Cropdrive Logo.png"
                  alt="CropDrive Logo"
                  width={40}
                  height={40}
                  className="object-contain"
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

      {/* Desktop Sidebar - Glassmorphic V2 */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <motion.div
          animate={{ width: isCollapsed ? 80 : 288 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="glass-sidebar h-screen overflow-hidden"
        >
          {renderSidebarContent()}
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
              className="fixed top-0 left-0 bottom-0 w-72 sm:w-80 glass-sidebar shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              {renderSidebarContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

