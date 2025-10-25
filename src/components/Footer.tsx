'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';

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
      { href: '/careers', label: 'Careers', labelMs: 'Kerjaya' },
      { href: '/press', label: 'Press', labelMs: 'Media' },
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
      { href: '/api', label: 'API', labelMs: 'API' },
    ],
  },
  {
    title: 'Support',
    titleMs: 'Sokongan',
    links: [
      { href: '/help', label: 'Help Center', labelMs: 'Pusat Bantuan' },
      { href: '/contact', label: 'Contact Us', labelMs: 'Hubungi Kami' },
      { href: '/whatsapp', label: 'WhatsApp Support', labelMs: 'Sokongan WhatsApp' },
      { href: '/status', label: 'System Status', labelMs: 'Status Sistem' },
    ],
  },
  {
    title: 'Legal',
    titleMs: 'Undang-undang',
    links: [
      { href: '/privacy', label: 'Privacy Policy', labelMs: 'Dasar Privasi' },
      { href: '/terms', label: 'Terms of Service', labelMs: 'Syarat Perkhidmatan' },
      { href: '/cookies', label: 'Cookie Policy', labelMs: 'Dasar Kuki' },
    ],
  },
];

export const Footer: React.FC = () => {
  const { language, t } = useTranslation();

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-green-600 to-yellow-500 rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Oil Palm Tree Icon */}
                  <path d="M12 4 C9 6, 7 9, 6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  <path d="M12 4 C15 6, 17 9, 18 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  <path d="M12 5 C10 7, 8 10, 7.5 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                  <path d="M12 5 C14 7, 16 10, 16.5 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                  <path d="M12 3 C10.5 5, 9 8, 8.5 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                  <path d="M12 3 C13.5 5, 15 8, 15.5 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                  <rect x="11" y="12" width="2" height="9" rx="0.5" fill="currentColor"/>
                  <circle cx="11" cy="13" r="0.8" fill="currentColor" opacity="0.8"/>
                  <circle cx="13" cy="13" r="0.8" fill="currentColor" opacity="0.8"/>
                </svg>
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
            <div className="flex space-x-4">
              {/* Social Media Links */}
              <motion.a
                href="https://wa.me/60123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-400 hover:text-primary-400 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </motion.a>
            </div>
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
              ? '© 2024 CropDrive OP Advisor™. Hak cipta terpelihara.'
              : '© 2024 CropDrive OP Advisor™. All rights reserved.'
            }
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-secondary-400 hover:text-primary-400 transition-colors duration-200 text-sm"
            >
              {language === 'ms' ? 'Dasar Privasi' : 'Privacy Policy'}
            </Link>
            <Link
              href="/terms"
              className="text-secondary-400 hover:text-primary-400 transition-colors duration-200 text-sm"
            >
              {language === 'ms' ? 'Syarat Perkhidmatan' : 'Terms of Service'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
