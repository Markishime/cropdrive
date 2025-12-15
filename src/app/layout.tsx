import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import Script from 'next/script';
import { AuthProvider } from '@/lib/auth';
import { Analytics } from '@vercel/analytics/next';
import LayoutWrapper from '@/components/LayoutWrapper';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CropDrive OP Advisor™ – AI-Powered Palm Oil Farm Analysis',
    template: '%s | CropDrive OP Advisor™',
  },
  description: 'AI-powered agronomy assistant for palm oil farms. Interprets soil and leaf test results into clear fertilizer and soil-health recommendations in minutes.',
  keywords: ['palm oil', 'AI analysis', 'farm management', 'soil analysis', 'leaf analysis', 'Malaysia', 'agriculture technology', 'oil palm', 'precision agriculture', 'agronomy', 'crop advisor'],
  authors: [{ name: 'CropDrive OP Advisor' }],
  creator: 'CropDrive OP Advisor',
  publisher: 'CropDrive OP Advisor',
  applicationName: 'CropDrive OP Advisor™',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cropdrive.ai'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'ms': '/',
    },
  },
  icons: {
    icon: [
      { 
        url: '/favicon-32x32.png', 
        sizes: '32x32', 
        type: 'image/png',
      },
      { 
        url: '/favicon-16x16.png', 
        sizes: '16x16', 
        type: 'image/png',
      },
      { 
        url: '/favicon.ico', 
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      { 
        url: '/apple-touch-icon.png', 
        sizes: '180x180', 
        type: 'image/png',
      },
    ],
    shortcut: [
      { 
        url: '/favicon.ico', 
        type: 'image/x-icon' 
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cropdrive.ai',
    title: 'CropDrive OP Advisor™ – AI-Powered Palm Oil Farm Analysis',
    description: 'AI-powered agronomy assistant for palm oil farms. Interprets soil and leaf test results into clear fertilizer and soil-health recommendations in minutes.',
    siteName: 'CropDrive OP Advisor™',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CropDrive OP Advisor™ – AI-Powered Palm Oil Farm Analysis',
        type: 'image/png',
      },
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'CropDrive Logo',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CropDrive OP Advisor™ – AI-Powered Palm Oil Farm Analysis',
    description: 'AI-powered agronomy assistant for palm oil farms. Interprets soil and leaf test results into clear fertilizer and soil-health recommendations in minutes.',
    images: ['/images/og-image.png'],
    creator: '@cropdrive',
    site: '@cropdrive',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'agriculture',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CropDrive OP Advisor',
    url: 'https://cropdrive.ai',
    logo: 'https://cropdrive.ai/android-chrome-512x512.png',
    sameAs: [
      'https://www.facebook.com/CropDrive',
      'https://www.linkedin.com/company/cropdrive',
    ],
  };

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <Script
          id="org-json-ld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <AuthProvider>
          <Toaster 
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
                padding: '16px',
                borderRadius: '12px',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
