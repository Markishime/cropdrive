'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';
import { useLanguage } from './LanguageProvider';

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
      { href: '/reviews', label: 'Reviews', labelMs: 'Ulasan' },
      { href: '/blog', label: 'Blog', labelMs: 'Blog' },
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
  const { language: currentLanguage } = useLanguage();
  const { language } = useTranslation(currentLanguage);
  const translateLabel = (english: string, malay: string) => (
    language === 'id' ? toIndonesianText(malay) : language === 'ms' ? malay : english
  );

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <motion.div
                className="w-12 h-12 bg-white rounded-full overflow-hidden shadow-lg flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Image
                  src="/images/Cropdrive Logo.png"
                  alt="CropDrive Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </motion.div>
              <span className="font-bold text-xl">
                CropDrive OP Advisor<sup className="text-xs">™</sup>
              </span>
            </Link>
            <p className="text-secondary-300 mb-4">
              {translateLabel(
                'Smart AI Platform for Oil Palm Industry in Malaysia.',
                'Platform AI Pintar untuk Industri Kelapa Sawit di Malaysia.'
              )}
            </p>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4">
                {translateLabel(section.title, section.titleMs)}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-secondary-300 hover:text-primary-400 transition-colors duration-200 text-sm"
                    >
                      {translateLabel(link.label, link.labelMs)}
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
            {translateLabel(
              '© 2025 CropDrive OP Advisor™. All rights reserved.',
              '© 2025 CropDrive OP Advisor™. Hak cipta terpelihara.'
            )}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
