import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo_key';

export const stripePromise = loadStripe(stripePublishableKey);

// Stripe price IDs (these should match your Stripe dashboard)
export const STRIPE_PRICE_IDS = {
  start: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_START_MONTHLY || 'price_start_monthly',
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_START_YEARLY || 'price_start_yearly',
  },
  smart: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SMART_MONTHLY || 'price_smart_monthly',
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SMART_YEARLY || 'price_smart_yearly',
  },
  precision: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRECISION_MONTHLY || 'price_precision_monthly',
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRECISION_YEARLY || 'price_precision_yearly',
  },
};

// Checkout URLs for different plans
export const getCheckoutUrl = (planId: string, isYearly: boolean = false): string => {
  const priceId = STRIPE_PRICE_IDS[planId as keyof typeof STRIPE_PRICE_IDS];
  if (!priceId) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }

  const priceKey = isYearly ? 'yearly' : 'monthly';
  const priceIdValue = priceId[priceKey as keyof typeof priceId];

  // In a real implementation, these would be your actual Stripe checkout URLs
  // For now, we'll construct them based on the price IDs
  const baseUrl = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_BASE_URL || 'https://buy.stripe.com';
  return `${baseUrl}/${priceIdValue}`;
};

// Format price for display
export const formatStripePrice = (amount: number, currency: string = 'myr'): string => {
  const currencySymbols: { [key: string]: string } = {
    myr: 'RM',
    eur: '€',
    usd: '$',
  };

  const symbol = currencySymbols[currency.toLowerCase()] || currency.toUpperCase();
  return `${symbol}${amount}`;
};

// Calculate prorated upgrade cost
export const calculateProratedAmount = (
  currentPlan: string,
  newPlan: string,
  daysRemaining: number,
  totalDaysInPeriod: number
): number => {
  // This is a simplified calculation - in reality, you'd use Stripe's proration
  const currentPlanPrices = {
    start: 24, // RM per month
    smart: 39,
    precision: 49,
  };

  const newPlanPrices = {
    start: 24,
    smart: 39,
    precision: 49,
  };

  const currentPrice = currentPlanPrices[currentPlan as keyof typeof currentPlanPrices] || 0;
  const newPrice = newPlanPrices[newPlan as keyof typeof newPlanPrices] || 0;

  if (currentPrice === 0 || newPrice === 0) return newPrice;

  const unusedCredit = (currentPrice * daysRemaining) / totalDaysInPeriod;
  const proratedAmount = newPrice - unusedCredit;

  return Math.max(proratedAmount, 0);
};

// Validate Stripe webhook signature (for security)
export const validateStripeWebhook = (body: string, signature: string, secret: string): boolean => {
  // This is a simplified validation - in production, use proper Stripe webhook validation
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // return stripe.webhooks.constructEvent(body, signature, secret);
  return true; // Placeholder for development
};

// Create checkout session (server-side function would be in API route)
export const createCheckoutSession = async (params: {
  priceId: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}) => {
  // This would typically be handled by a server-side API route
  // For now, we'll redirect to the pre-configured Stripe checkout URLs

  const checkoutUrl = getCheckoutUrl(params.priceId.split('_')[1], params.priceId.includes('yearly'));

  return {
    url: checkoutUrl,
  };
};
