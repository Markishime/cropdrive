/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.coverr.co',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.squarespace-cdn.com',
        pathname: '**',
      },
    ],
  },
  // CRITICAL: Prevent trailing slash redirects that cause 307 errors for Stripe webhooks
  // This ensures /api/stripe/webhook and /api/stripe/webhook/ both work without redirects
  trailingSlash: false,
  // Ensure API routes don't get redirected
  async redirects() {
    return [];
  },
};

export default nextConfig;

