'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from './Navbar';
import AuthenticatedNavbar from './AuthenticatedNavbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

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
    return <>{children}</>;
  }

  // If user is logged in - show AuthenticatedNavbar + Sidebar for dashboard pages, Navbar for landing page
  if (user) {
    // Dashboard pages (protected routes) - show sidebar and authenticated navbar
    const dashboardPages = ['/dashboard', '/assistant', '/reports', '/payment-method', '/tutorials', '/support', '/pricing'];
    const isDashboardPage = dashboardPages.some(page => pathname.startsWith(page));
    
    if (isDashboardPage) {
      return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // If user is NOT logged in - show Navbar + Footer
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