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
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  href,
  icon,
  label,
  labelMs,
  language,
  isActive,
  onClick
}) => {
  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        whileHover={{ x: 4 }}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer ${
          isActive
            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <div className={`${isActive ? 'text-white' : 'text-gray-600 group-hover:text-green-600'}`}>
          {icon}
        </div>
        <span className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-700'}`}>
          {language === 'ms' ? labelMs : label}
        </span>
        {isActive && (
          <ChevronRight className="ml-auto w-4 h-4 text-white" />
        )}
      </motion.div>
    </Link>
  );
};

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLang(lang);
  }, []);

  const { language } = useTranslation(currentLang);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ms' : 'en';
    setLanguage(newLanguage);
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

  const sidebarItems = [
    {
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Dashboard',
      labelMs: 'Papan Pemuka'
    },
    {
      href: '/assistant',
      icon: <MessageSquare className="w-5 h-5" />,
      label: 'AI Assistant',
      labelMs: 'Pembantu AI'
    },
    {
      href: '/tutorials',
      icon: <BookOpen className="w-5 h-5" />,
      label: 'Tutorials',
      labelMs: 'Tutorial'
    },
    {
      href: '/pricing',
      icon: <FileText className="w-5 h-5" />,
      label: 'Plans & Pricing',
      labelMs: 'Pelan & Harga'
    },
    {
      href: '/contact',
      icon: <HelpCircle className="w-5 h-5" />,
      label: 'Support',
      labelMs: 'Sokongan'
    }
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
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
              <span className="font-black text-lg text-gray-900 font-heading">
                CropDrive
              </span>
              <sup className="text-xs font-black ml-0.5 text-yellow-500">™</sup>
            </div>
            <span className="text-xs text-gray-500 font-medium">OP Advisor</span>
          </div>
        </Link>
      </div>

      {/* User Profile */}
      {user && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white font-bold text-lg">
              {user.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user.displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.href}
            {...item}
            language={language}
            isActive={pathname === item.href}
            onClick={() => setIsOpen(false)}
          />
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 w-full"
        >
          <Globe className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-sm">
            {language === 'ms' ? 'English' : 'Bahasa Malaysia'}
          </span>
        </button>

        {/* Settings */}
        <Link href="/settings">
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 w-full"
          >
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-sm">
              {language === 'ms' ? 'Tetapan' : 'Settings'}
            </span>
          </button>
        </Link>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold text-sm">
            {language === 'ms' ? 'Log Keluar' : 'Logout'}
          </span>
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

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-72 bg-white border-r border-gray-200 shadow-sm">
          <SidebarContent />
        </div>
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

