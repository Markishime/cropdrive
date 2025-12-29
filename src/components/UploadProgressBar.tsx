'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

interface UploadProgressBarProps {
  uploadsUsed: number;
  uploadsLimit: number;
  language?: 'en' | 'ms';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Reusable Upload Progress Bar Component
 * 
 * Displays upload usage with a visual progress bar that updates automatically
 * when upload counts change. Used across dashboard, assistant, and payment pages.
 */
export default function UploadProgressBar({
  uploadsUsed = 0,
  uploadsLimit = 0,
  language = 'en',
  showLabel = true,
  size = 'md',
  className = '',
}: UploadProgressBarProps) {
  const uploadsRemaining = uploadsLimit === -1 ? Infinity : Math.max(0, uploadsLimit - uploadsUsed);
  const uploadPercentage = uploadsLimit === -1 ? 100 : uploadsLimit > 0 ? (uploadsUsed / uploadsLimit) * 100 : 0;
  const isUploadLimitExceeded = uploadsLimit !== -1 && uploadsUsed >= uploadsLimit;
  const isNearLimit = uploadPercentage > 80 && !isUploadLimitExceeded;

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className={`w-4 h-4 ${isUploadLimitExceeded ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-gray-600'}`} />
            <span className={`font-semibold ${textSizeClasses[size]} ${isUploadLimitExceeded ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-gray-700'}`}>
              {language === 'ms' ? 'Penggunaan Muat Naik' : 'Upload Usage'}
            </span>
          </div>
          <span className={`font-bold ${textSizeClasses[size]} ${isUploadLimitExceeded ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-gray-700'}`}>
            {uploadsUsed} / {uploadsLimit === -1 ? '∞' : uploadsLimit}
          </span>
        </div>
      )}

      {uploadsLimit !== -1 && (
        <div className="relative">
          <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${sizeClasses[size]}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(uploadPercentage, 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full rounded-full ${
                isUploadLimitExceeded
                  ? 'bg-gradient-to-r from-red-500 to-red-700'
                  : isNearLimit
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-gradient-to-r from-green-500 to-green-700'
              }`}
            />
          </div>
          
          {showLabel && (
            <p className={`${textSizeClasses[size]} mt-2 font-semibold ${
              isUploadLimitExceeded
                ? 'text-red-600'
                : isNearLimit
                  ? 'text-amber-600'
                  : 'text-gray-500'
            }`}>
              {isUploadLimitExceeded
                ? (language === 'ms' ? '❌ Had tercapai - Naik taraf untuk terus menganalisis' : '❌ Limit reached - Upgrade to continue analyzing')
                : isNearLimit
                  ? (language === 'ms' ? '⚠️ Hampir mencapai had' : '⚠️ Approaching limit')
                  : uploadsRemaining > 0
                    ? (language === 'ms' ? `✅ ${uploadsRemaining} baki analisis` : `✅ ${uploadsRemaining} analyses remaining`)
                    : (language === 'ms' ? 'Penggunaan normal' : 'Normal usage')
              }
            </p>
          )}
        </div>
      )}

      {uploadsLimit === -1 && showLabel && (
        <p className={`${textSizeClasses[size]} mt-2 text-green-600 font-semibold`}>
          {language === 'ms' ? '✅ Analisis tanpa had' : '✅ Unlimited analyses'}
        </p>
      )}
    </div>
  );
}

