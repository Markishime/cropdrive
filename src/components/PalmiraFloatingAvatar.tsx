'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWandSparkles } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

interface PalmiraFloatingAvatarProps {
  language?: 'en' | 'ms';
}

export default function PalmiraFloatingAvatar({ language = 'en' }: PalmiraFloatingAvatarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Show avatar after a delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    if (user) {
      router.push('/palmira');
    } else {
      router.push('/login?redirect=/palmira');
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed bottom-6 right-6 z-50"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-full right-0 mb-4 bg-green-900 text-white px-4 py-2 rounded-xl shadow-lg whitespace-nowrap"
          >
            <div className="text-sm font-semibold">
              {language === 'ms' ? 'Bercakap dengan Palmira' : 'Chat with Palmira'}
            </div>
            <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-green-900"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center cursor-pointer group overflow-hidden"
      >
        {/* Pulsing ring effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-green-600"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Sparkle effect */}
        <motion.div
          className="absolute -top-1 -right-1 z-20"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <FontAwesomeIcon icon={faWandSparkles} className="w-4 h-4 text-yellow-400" />
        </motion.div>

        {/* Palmira Avatar */}
        <Image
          src="/images/Palmira.png"
          alt="Palmira"
          width={64}
          height={64}
          className="w-full h-full object-cover relative z-10"
        />
      </motion.button>
    </motion.div>
  );
}
