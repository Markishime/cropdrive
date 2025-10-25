'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useTranslation, getCurrentLanguage, setLanguage } from '@/i18n';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Globe,
  Bell,
  HelpCircle,
  FileText
} from 'lucide-react';

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
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 shadow-lg font-bold'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
        title={isCollapsed ? (language === 'ms' ? labelMs : label) : undefined}
      >
              <div className={`${isActive ? 'text-green-900' : 'text-white/80 group-hover:text-white'}`}>
                {icon}
              </div>
              {!isCollapsed && (
                <>
                  <span className={`font-semibold text-sm ${isActive ? 'text-green-900' : 'text-white/90'}`}>
                    {language === 'ms' ? labelMs : label}
                  </span>
                  {isActive && (
                    <ChevronRight className="ml-auto w-4 h-4 text-green-900" />
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
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLang(lang);
    
    // Load collapsed state from localStorage
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    setIsCollapsed(savedCollapsed === 'true');
  }, []);

  const { language } = useTranslation(currentLang);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ms' : 'en';
    setLanguage(newLanguage);
  };

  const toggleCollapsed = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('sidebar-collapsed', String(newCollapsed));
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

  // Dynamic sidebar items based on user's plan
  const hasPlan = user && user.plan && user.plan !== 'none';
  
  const sidebarItems = [
    {
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Dashboard',
      labelMs: 'Papan Pemuka',
      showAlways: true
    },
    // AI Assistant - only for users with plans
    {
      href: '/assistant',
      icon: <MessageSquare className="w-5 h-5" />,
      label: 'AI Assistant',
      labelMs: 'Pembantu AI',
      showAlways: false,
      requiresPlan: true
    },
    // Reports - only for users with plans
    {
      href: '/reports',
      icon: <FileText className="w-5 h-5" />,
      label: 'Reports History',
      labelMs: 'Sejarah Laporan',
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
      icon: <BookOpen className="w-5 h-5" />,
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
    {
      href: '/contact',
      icon: <HelpCircle className="w-5 h-5" />,
      label: 'Support',
      labelMs: 'Sokongan',
      showAlways: true
    }
  ].filter(item => item.showAlways || (item.requiresPlan && hasPlan));

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
            {/* Logo & Collapse Button */}
            <div className="p-6 border-b border-green-700/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 flex items-center justify-center text-green-600">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 8 C15 10, 12 15, 10 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <path d="M20 8 C25 10, 28 15, 30 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <path d="M20 10 C16 12, 14 16, 13 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  <path d="M20 10 C24 12, 26 16, 27 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  <path d="M20 6 C18 9, 16 12, 15 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  <path d="M20 6 C22 9, 24 12, 25 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  <path d="M20 12 C17 14, 15 17, 14 22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                  <path d="M20 12 C23 14, 25 17, 26 22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                  <rect x="18" y="20" width="4" height="15" rx="1" fill="currentColor"/>
                  <circle cx="18" cy="22" r="1.5" fill="currentColor" opacity="0.8"/>
                  <circle cx="22" cy="22" r="1.5" fill="currentColor" opacity="0.8"/>
                  <circle cx="17" cy="24" r="1.2" fill="currentColor" opacity="0.7"/>
                  <circle cx="23" cy="24" r="1.2" fill="currentColor" opacity="0.7"/>
                </svg>
              </div>
                <div className="flex flex-col">
                  <div className="flex items-start leading-tight">
                    <span className="font-black text-lg text-white font-heading">
                      CropDrive
                    </span>
                    <sup className="text-xs font-black ml-0.5 text-yellow-400">™</sup>
                  </div>
                  <span className="text-xs text-white/70 font-medium">OP Advisor</span>
                </div>
            </Link>
          )}
          <button
            onClick={toggleCollapsed}
            className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
            title={isCollapsed ? (language === 'ms' ? 'Kembangkan' : 'Expand') : (language === 'ms' ? 'Runtuhkan' : 'Collapse')}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-white/80" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-white/80" />
            )}
          </button>
        </div>
      </div>

            {/* User Profile */}
            {user && !isCollapsed && (
              <div className="p-6 border-b border-green-700/50">
          <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-green-900 font-bold text-lg shadow-lg">
                  {user.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{user.displayName}</p>
                  <p className="text-xs text-white/70 truncate">{user.email}</p>
                </div>
          </div>
        </div>
      )}
      
            {/* User Avatar (Collapsed) */}
            {user && isCollapsed && (
              <div className="p-4 border-b border-green-700/50 flex justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-green-900 font-bold text-sm shadow-lg">
                  {user.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            )}

      {/* Navigation Items */}
      <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'} space-y-2 overflow-y-auto`}>
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.href}
            {...item}
            language={language}
            isActive={pathname === item.href}
            isCollapsed={isCollapsed}
            onClick={() => setIsOpen(false)}
          />
        ))}
      </nav>

            {/* Bottom Actions */}
            <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-green-700/50 space-y-2`}>
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 w-full`}
          title={isCollapsed ? (language === 'ms' ? 'English' : 'Bahasa Malaysia') : undefined}
        >
          <Globe className="w-5 h-5" />
          {!isCollapsed && (
            <span className="font-semibold text-sm">
              {language === 'ms' ? 'English' : 'Bahasa Malaysia'}
            </span>
          )}
        </button>

        {/* Profile */}
        <Link href="/profile">
          <button
            onClick={() => setIsOpen(false)}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 w-full`}
            title={isCollapsed ? (language === 'ms' ? 'Profil' : 'Profile') : undefined}
          >
            <User className="w-5 h-5" />
            {!isCollapsed && (
              <span className="font-semibold text-sm">
                {language === 'ms' ? 'Profil' : 'Profile'}
              </span>
            )}
          </button>
        </Link>

        {/* Settings */}
        <Link href="/settings">
          <button
            onClick={() => setIsOpen(false)}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 w-full`}
            title={isCollapsed ? (language === 'ms' ? 'Tetapan' : 'Settings') : undefined}
          >
            <Settings className="w-5 h-5" />
            {!isCollapsed && (
              <span className="font-semibold text-sm">
                {language === 'ms' ? 'Tetapan' : 'Settings'}
              </span>
            )}
          </button>
        </Link>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200 w-full`}
          title={isCollapsed ? (language === 'ms' ? 'Log Keluar' : 'Logout') : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && (
            <span className="font-semibold text-sm">
              {language === 'ms' ? 'Log Keluar' : 'Logout'}
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Desktop Sidebar - Solid Green Background */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <motion.div
          animate={{ width: isCollapsed ? 80 : 288 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 border-r border-green-700 shadow-2xl"
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
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-50 lg:hidden"
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

