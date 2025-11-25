'use client';

import React, { useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from './Navbar';
import AuthenticatedNavbar from './AuthenticatedNavbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const AUTH_ROUTE_PREFIXES = [
  '/dashboard',
  '/assistant',
  '/reports',
  '/profile',
  '/settings',
  '/support',
  '/payment-method',
  '/consumer-info',
];

const normalizePath = (pathname: string | null) => {
  if (!pathname) return '/';
  const localeMatch = pathname.match(/^\/[a-zA-Z-]{2,5}(\/.*)/);
  if (localeMatch && localeMatch[1]) {
    return localeMatch[1];
  }
  return pathname;
};

const getDashboardRedirect = (pathname: string | null) => {
  if (!pathname) return '/dashboard';
  const localeMatch = pathname.match(/^\/([a-zA-Z-]{2,5})\//);
  if (localeMatch && localeMatch[1]) {
    return `/${localeMatch[1]}/dashboard`;
  }
  return '/dashboard';
};

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const normalizedPath = useMemo(() => normalizePath(pathname), [pathname]);

  const isAuthRoute = useMemo(() => {
    return AUTH_ROUTE_PREFIXES.some((prefix) => 
      normalizedPath === prefix || normalizedPath?.startsWith(`${prefix}/`)
    );
  }, [normalizedPath]);

  // Pages that should never show any layout (login/register/forgot-password)
  const noLayoutPages = ['/login', '/register', '/forgot-password'];
  const shouldHideLayout = noLayoutPages.includes(normalizedPath);

  useEffect(() => {
    if (!loading && user && pathname && !isAuthRoute && !shouldHideLayout) {
      const target = getDashboardRedirect(pathname);
      if (pathname !== target) {
        router.replace(target);
      }
    }
  }, [user, loading, pathname, isAuthRoute, shouldHideLayout, router]);

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

  // If user is logged in - show dashboard layout for app routes
  if (user) {
    if (!isAuthRoute) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center space-y-3 text-gray-600">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            <p className="font-medium">Redirecting to dashboard...</p>
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
      <main className="flex-1 pt-16 sm:pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
