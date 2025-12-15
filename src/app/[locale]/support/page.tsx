import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SupportPageClient from './SupportPageClient';

interface SupportPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: SupportPageProps): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Support - CropDrive',
    ms: 'Sokongan - CropDrive'
  };

  const descriptions = {
    en: 'Get help from our support team. Contact us with any questions about your oil palm farm management.',
    ms: 'Dapatkan bantuan daripada pasukan sokongan kami. Hubungi kami dengan sebarang soalan tentang pengurusan ladang kelapa sawit anda.'
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
  };
}

export default async function SupportPage({ params }: SupportPageProps) {
  const { locale } = await params;

  // Validate locale
  if (!['en', 'ms'].includes(locale)) {
    notFound();
  }

  return <SupportPageClient locale={locale} />;
}
