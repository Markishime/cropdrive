'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from './LanguageProvider';
import Navbar from './Navbar';
import AuthenticatedNavbar from './AuthenticatedNavbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import PalmiraFloatingAvatar from './PalmiraFloatingAvatar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();

  // Removed automatic redirect to dashboard - logged in users can access landing page

  // Pages that should never show any layout (login/register/forgot-password)
  const noLayoutPages = ['/login', '/register', '/forgot-password'];
  const shouldHideLayout = noLayoutPages.includes(pathname);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // For login/register/forgot-password pages - no layout
  if (shouldHideLayout) {
    return <React.Fragment key={language}>{children}</React.Fragment>;
  }

  // If user is logged in - show AuthenticatedNavbar + Sidebar for dashboard pages, Navbar for landing page
  if (user) {
    // Dashboard pages (protected routes) - show sidebar and authenticated navbar
    // When logged in, these pages show sidebar + authenticated navbar (like tutorials)
    const dashboardPages = ['/dashboard', '/assistant', '/palmira', '/reports', '/tutorials', '/support', '/profile', '/settings', '/pricing', '/admin'];

    // Check if pathname matches dashboard pages (handles both regular and locale-prefixed routes)
    const isDashboardPage = dashboardPages.some(page => {
      // Match exact path (e.g., /dashboard)
      if (pathname === page || pathname.startsWith(page + '/')) {
        return true;
      }
      // Match locale-prefixed paths (e.g., /en/dashboard, /ms/dashboard)
      const localePattern = /^\/(en|ms|id)\//;
      if (localePattern.test(pathname)) {
        const pathWithoutLocale = pathname.replace(/^\/(en|ms|id)/, '');
        return pathWithoutLocale === page || pathWithoutLocale.startsWith(page + '/');
      }
      return false;
    });
    
    if (isDashboardPage) {
      return (
        <div key={language} className="flex h-screen overflow-hidden bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden w-0 min-w-0">
            <AuthenticatedNavbar />
            <main className="flex-1 overflow-y-auto pt-0" style={{ marginTop: 0 }}>
              {children}
            </main>
          </div>
        </div>
      );
    }
    
    // Landing page and other public pages - show regular navbar (Navbar component handles user display)
    return (
      <div key={language} className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // If user is NOT logged in - show Navbar + Footer
  // Don't show floating avatar on palmira page itself
  const showFloatingAvatar = pathname !== '/palmira' && !pathname.startsWith('/palmira/');
  
  return (
    <div key={language} className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      {showFloatingAvatar && <PalmiraFloatingAvatar />}
    </div>
  );
}