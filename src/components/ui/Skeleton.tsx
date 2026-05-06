'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', rounded = '2xl' }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-${rounded} ${className}`}
    style={{ animation: 'skeleton-shimmer 1.5s ease-in-out infinite' }}
  />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
    <Skeleton className="w-full h-48" rounded="sm" />
    <div className="p-6 space-y-3">
      <Skeleton className="h-5 w-3/4" rounded="lg" />
      <Skeleton className="h-4 w-full" rounded="lg" />
      <Skeleton className="h-4 w-2/3" rounded="lg" />
    </div>
  </div>
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} rounded="lg" />
    ))}
  </div>
);

export default Skeleton;
