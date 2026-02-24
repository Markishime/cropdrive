'use client';

import dynamic from 'next/dynamic';

const Analytics = dynamic(
  () => import('@vercel/analytics/next').then((mod) => ({ default: mod.Analytics })),
  { ssr: false }
);

/**
 * Only loads and renders Vercel Web Analytics when enabled.
 * Set NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED=true in Vercel after enabling Web Analytics.
 * This avoids the "Failed to load script" error when the feature is not enabled.
 */
export function VercelAnalytics() {
  if (process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED !== 'true') {
    return null;
  }
  return <Analytics />;
}
