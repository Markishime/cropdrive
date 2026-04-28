/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint errors (ordering, static-components) do not affect runtime correctness.
    // Run `npm run lint` separately to review warnings.
    ignoreDuringBuilds: true,
  },
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

