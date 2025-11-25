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

  useEffect(() => {
    if (!loading && user && pathname === '/') {
      router.replace('/dashboard');
    }
  }, [loading, user, pathname, router]);

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

  // If user is logged in - show AuthenticatedNavbar + Sidebar (except landing redirect case)
  if (user) {
    if (pathname === '/') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center space-y-4 text-center px-6">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-semibold">Redirecting to dashboard...</p>
          </div>
        </div>
      );
    }

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
