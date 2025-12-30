import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import { Analytics } from '@vercel/analytics/next';
import LayoutWrapper from '@/components/LayoutWrapper';
import CookieConsent from '@/components/CookieConsent';
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

// Mobile-friendly viewport settings (exported separately as per Next.js 14+ requirement)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#166534' },
    { media: '(prefers-color-scheme: dark)', color: '#14532d' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'CropDrive Oil Palm Advisor™ - Oil Palm AI Agronomy Platform',
    template: '%s | CropDrive Oil Palm Advisor™',
  },
  description: 'Improve your oil palm yield and profitability with AI-integrated precision agriculture. AI-powered analytics platform for Malaysian oil palm farmers.',
  keywords: ['palm oil', 'AI analysis', 'farm management', 'soil analysis', 'leaf analysis', 'Malaysia', 'agriculture technology', 'oil palm', 'precision agriculture', 'agronomy', 'crop advisor'],
  authors: [{ name: 'CropDrive Oil Palm Advisor' }],
  creator: 'CropDrive Oil Palm Advisor',
  publisher: 'CropDrive Oil Palm Advisor',
  applicationName: 'CropDrive Oil Palm Advisor™',
  // Mobile app-like experience
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CropDrive',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Additional mobile-friendly settings
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'format-detection': 'telephone=no',
    'msapplication-TileColor': '#166534',
    'msapplication-tap-highlight': 'no',
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
    title: 'CropDrive Oil Palm Advisor™ - Oil Palm AI Agronomy Platform',
    description: 'Improve your oil palm yield and profitability with AI-integrated precision agriculture. AI-powered analytics platform for Malaysian oil palm farmers.',
    siteName: 'CropDrive Oil Palm Advisor™',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CropDrive Oil Palm Advisor™ - Oil Palm AI Agronomy Platform',
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
    title: 'CropDrive Oil Palm Advisor™ - Oil Palm AI Agronomy Platform',
    description: 'Improve your oil palm yield and profitability with AI-integrated precision agriculture. AI-powered analytics platform for Malaysian oil palm farmers.',
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
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className={`${inter.className} antialiased`}>
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
          <CookieConsent />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
