import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
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
  title: 'CropDrive Oil Palm Advisor™ - Oil Palm AI Agronomy Platform',
  description: 'Improve your oil palm yield and profitability with AI-integrated precision agriculture.',
  keywords: 'palm oil, AI analysis, farm management, soil analysis, leaf analysis, Malaysia, agriculture technology',
  authors: [{ name: 'CropDrive OP Advisor' }],
  creator: 'CropDrive OP Advisor',
  publisher: 'CropDrive OP Advisor',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cropdrive.ai'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      // Prioritize PNG favicons for better circular display
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
      // Fallback to ICO (for older browsers)
      { 
        url: '/favicon.ico', 
        sizes: '32x32',
        type: 'image/x-icon',
      },
      // Larger icon for Google search results and social sharing
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
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
        url: 'https://cropdrive.ai/images/Cropdrive Logo.png',
        width: 1200,
        height: 630,
        alt: 'CropDrive Oil Palm Advisor™ - AI-Powered Palm Oil Farm Analysis',
      },
      {
        url: 'https://cropdrive.ai/apple-touch-icon.png',
        width: 180,
        height: 180,
        alt: 'CropDrive Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CropDrive Oil Palm Advisor™ - Oil Palm AI Agronomy Platform',
    description: 'Improve your oil palm yield and profitability with AI-integrated precision agriculture. AI-powered analytics platform for Malaysian oil palm farmers.',
    images: ['https://cropdrive.ai/images/Cropdrive Logo.png'],
    creator: '@cropdrive',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
  },
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
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
