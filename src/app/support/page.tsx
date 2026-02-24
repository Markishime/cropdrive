'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getCurrentLanguage } from '@/i18n';

export default function SupportRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const locale = getCurrentLanguage();
    router.replace(`/${locale}/support`);
  }, [router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-palm-50 via-white to-gold-50"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center space-y-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-palm-600 border-t-transparent rounded-full"
        />
        <p className="text-soil-600 font-medium">Loading Support...</p>
      </motion.div>
    </motion.div>
  );
}

