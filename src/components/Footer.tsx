'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslation, getCurrentLanguage } from '@/i18n';

interface FooterLink {
  href: string;
  label: string;
  labelMs: string;
}

interface FooterSection {
  title: string;
  titleMs: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: 'Company',
    titleMs: 'Syarikat',
    links: [
      { href: '/about', label: 'About Us', labelMs: 'Tentang Kami' },
    ],
  },
  {
    title: 'Product',
    titleMs: 'Produk',
    links: [
      { href: '/features', label: 'Features', labelMs: 'Ciri-ciri' },
      { href: '/pricing', label: 'Pricing', labelMs: 'Harga' },
      { href: '/tutorials', label: 'Tutorials', labelMs: 'Tutorial' },
    ],
  },
  {
    title: 'Support',
    titleMs: 'Sokongan',
    links: [
      { href: '/help', label: 'Help Center', labelMs: 'Pusat Bantuan' },
      { href: '/contact', label: 'Contact Us', labelMs: 'Hubungi Kami' },
    ],
  },
  {
    title: 'Legal',
    titleMs: 'Undang-undang',
    links: [
      { href: '/privacy', label: 'Privacy Policy', labelMs: 'Dasar Privasi' },
      { href: '/terms', label: 'Terms of Service', labelMs: 'Syarat Perkhidmatan' },
      { href: '/terms-and-conditions', label: 'Terms and Conditions', labelMs: 'Terma dan Syarat' },
      { href: '/cookies', label: 'Cookie Policy', labelMs: 'Dasar Kuki' },
      { href: '/consumer-info', label: 'Consumer Information', labelMs: 'Maklumat Pengguna' },
      { href: '/accessibility', label: 'Accessibility Notice', labelMs: 'Notis Kebolehcapaian' },
      { href: '/right-of-withdrawal', label: 'Right of Withdrawal', labelMs: 'Hak Penarikan Balik' },
      { href: '/impressum', label: 'Impressum', labelMs: 'Impressum' },
    ],
  },
];

export const Footer: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ms'>('en');
  
  useEffect(() => {
    setMounted(true);
    const lang = getCurrentLanguage();
    setCurrentLanguage(lang);
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleStorageChange = () => {
      const lang = getCurrentLanguage();
      setCurrentLanguage(lang);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const { language } = useTranslation(mounted ? currentLanguage : 'en');

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <motion.div
                className="w-12 h-12 bg-white rounded-full overflow-hidden shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Image
                  src="/images/Cropdrive Logo.png"
                  alt="CropDrive Logo"
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              </motion.div>
              <span className="font-bold text-xl">
                CropDrive OP Advisor<sup className="text-xs">™</sup>
              </span>
            </Link>
            <p className="text-secondary-300 mb-4">
              {language === 'ms'
                ? 'Platform AI pintar untuk analisis ladang kelapa sawit di Malaysia.'
                : 'Smart AI platform for palm oil farm analysis in Malaysia.'
              }
            </p>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4">
                {language === 'ms' ? section.titleMs : section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 text-sm"
                    >
                      {language === 'ms' ? link.labelMs : link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-secondary-400 text-sm">
            {language === 'ms'
              ? '© 2025 CropDrive OP Advisor™. Hak cipta terpelihara.'
              : '© 2025 CropDrive OP Advisor™. All rights reserved.'
            }
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
