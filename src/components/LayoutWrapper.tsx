'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Pages that should never show sidebar (even when logged in) - only show page content
  const noLayoutPages = ['/login', '/register', '/forgot-password'];
  const shouldHideLayout = noLayoutPages.includes(pathname);

  // Public pages that should always show Navbar/Footer (never sidebar)
  const publicPages = [
    '/',
    '/about',
    '/features',
    '/how-it-works',
    '/pricing',
    '/contact',
    '/reviews',
    '/tutorials',
    '/accessibility',
    '/privacy',
    '/terms',
    '/consumer-info',
    '/get-started/farmers',
    '/get-started/organizations'
  ];
  const isPublicPage = publicPages.includes(pathname);

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
    return <>{children}</>;
  }

  // For public pages - always show Navbar/Footer, never sidebar
  if (isPublicPage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // Show Sidebar for logged-in users on authenticated pages (dashboard, assistant, reports, etc.)
  if (user) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Fallback: Show Navbar for any other logged-out user scenario
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
