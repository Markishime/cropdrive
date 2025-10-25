import { SubscriptionPlan, PricingTier } from '@/types';

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  start: {
    id: 'start',
    name: 'CropDrive Start',
    nameMs: 'CropDrive Start',
    monthlyPrice: 24,
    yearlyPrice: 192,
    monthlyPriceEur: 5,
    yearlyPriceEur: 40,
    features: [
      { name: 'AI Agronomic Report', nameMs: 'Laporan Agronomi AI', included: true },
      { name: 'Clarification Support (WhatsApp/Email)', nameMs: 'Sokongan Penjelasan (WhatsApp/Email)', included: true, limit: 1 },
      { name: 'Response Time (hours)', nameMs: 'Masa Respons (jam)', included: true },
      { name: 'Renewal Discount', nameMs: 'Diskaun Pembaharuan', included: true },
      { name: 'Referral Bonus (next annual plan)', nameMs: 'Bonus Rujukan (pelan tahunan seterusnya)', included: false },
      { name: 'Comparative Analysis (year-to-year progress)', nameMs: 'Analisis Perbandingan (kemajuan tahun ke tahun)', included: false },
      { name: 'Partner Discounts (test kits, fertilizers, etc.)', nameMs: 'Diskaun Rakan Kongsi (kit ujian, baja, dll)', included: false },
      { name: 'Early Access to New Features', nameMs: 'Akses Awal kepada Ciri Baharu', included: false },
    ],
    uploadLimit: 10,
    aiAccess: true,
    supportLevel: 'basic',
    renewalDiscount: 5,
    referralBonus: 0,
    comparativeAnalysis: false,
    partnerDiscounts: false,
    earlyAccess: false,
  },
  smart: {
    id: 'smart',
    name: 'CropDrive Smart',
    nameMs: 'CropDrive Smart',
    monthlyPrice: 39,
    yearlyPrice: 336,
    monthlyPriceEur: 8,
    yearlyPriceEur: 68,
    features: [
      { name: 'AI Agronomic Report', nameMs: 'Laporan Agronomi AI', included: true },
      { name: 'Clarification Support (WhatsApp/Email)', nameMs: 'Sokongan Penjelasan (WhatsApp/Email)', included: true, limit: 3 },
      { name: 'Response Time (hours)', nameMs: 'Masa Respons (jam)', included: true },
      { name: 'Renewal Discount', nameMs: 'Diskaun Pembaharuan', included: true },
      { name: 'Referral Bonus (next annual plan)', nameMs: 'Bonus Rujukan (pelan tahunan seterusnya)', included: true },
      { name: 'Comparative Analysis (year-to-year progress)', nameMs: 'Analisis Perbandingan (kemajuan tahun ke tahun)', included: false },
      { name: 'Partner Discounts (test kits, fertilizers, etc.)', nameMs: 'Diskaun Rakan Kongsi (kit ujian, baja, dll)', included: false },
      { name: 'Early Access to New Features', nameMs: 'Akses Awal kepada Ciri Baharu', included: false },
    ],
    uploadLimit: 50,
    aiAccess: true,
    supportLevel: 'priority',
    renewalDiscount: 10,
    referralBonus: 5,
    comparativeAnalysis: false,
    partnerDiscounts: false,
    earlyAccess: false,
  },
  precision: {
    id: 'precision',
    name: 'CropDrive Precision',
    nameMs: 'CropDrive Precision',
    monthlyPrice: 49,
    yearlyPrice: 480,
    monthlyPriceEur: 10,
    yearlyPriceEur: 98,
    features: [
      { name: 'AI Agronomic Report', nameMs: 'Laporan Agronomi AI', included: true },
      { name: 'Clarification Support (WhatsApp/Email)', nameMs: 'Sokongan Penjelasan (WhatsApp/Email)', included: true },
      { name: 'Response Time (hours)', nameMs: 'Masa Respons (jam)', included: true },
      { name: 'Renewal Discount', nameMs: 'Diskaun Pembaharuan', included: true },
      { name: 'Referral Bonus (next annual plan)', nameMs: 'Bonus Rujukan (pelan tahunan seterusnya)', included: true },
      { name: 'Comparative Analysis (year-to-year progress)', nameMs: 'Analisis Perbandingan (kemajuan tahun ke tahun)', included: true },
      { name: 'Partner Discounts (test kits, fertilizers, etc.)', nameMs: 'Diskaun Rakan Kongsi (kit ujian, baja, dll)', included: true },
      { name: 'Early Access to New Features', nameMs: 'Akses Awal kepada Ciri Baharu', included: true },
    ],
    uploadLimit: -1, // unlimited
    aiAccess: true,
    supportLevel: 'premium',
    renewalDiscount: 15,
    referralBonus: 10,
    comparativeAnalysis: true,
    partnerDiscounts: true,
    earlyAccess: true,
  },
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'start',
    name: 'CropDrive Start',
    nameMs: 'CropDrive Start',
    tagline: 'Perfect for getting started with AI analysis',
    taglineMs: 'Sempurna untuk memulakan dengan analisis AI',
    monthlyPrice: 24,
    yearlyPrice: 192,
    monthlyPriceEur: 5,
    yearlyPriceEur: 40,
    features: [
      'AI Agronomic Report',
      '1 Clarification Support (WhatsApp/Email)',
      'Standard Response Time',
      '5% Renewal Discount',
    ],
    featuresMs: [
      'Laporan Agronomi AI',
      '1 Sokongan Penjelasan (WhatsApp/Email)',
      'Masa Respons Standard',
      '5% Diskaun Pembaharuan',
    ],
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_START_MONTHLY || '',
    stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_START_YEARLY || '',
    uploadLimit: 10,
    supportLevel: 'Standard',
    supportLevelMs: 'Standard',
  },
  {
    id: 'smart',
    name: 'CropDrive Smart',
    nameMs: 'CropDrive Smart',
    tagline: 'Most popular for active farmers',
    taglineMs: 'Paling popular untuk petani aktif',
    monthlyPrice: 39,
    yearlyPrice: 336,
    monthlyPriceEur: 8,
    yearlyPriceEur: 68,
    features: [
      'AI Agronomic Report',
      '3 Clarification Support (WhatsApp/Email)',
      '24-hour Response Time',
      '10% Renewal Discount',
      '5% Referral Bonus',
    ],
    featuresMs: [
      'Laporan Agronomi AI',
      '3 Sokongan Penjelasan (WhatsApp/Email)',
      'Masa Respons 24 jam',
      '10% Diskaun Pembaharuan',
      '5% Bonus Rujukan',
    ],
    popular: true,
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SMART_MONTHLY || '',
    stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SMART_YEARLY || '',
    uploadLimit: 50,
    supportLevel: 'Priority (24h)',
    supportLevelMs: 'Keutamaan (24j)',
  },
  {
    id: 'precision',
    name: 'CropDrive Precision',
    nameMs: 'CropDrive Precision',
    tagline: 'Complete solution for serious farmers',
    taglineMs: 'Penyelesaian lengkap untuk petani serius',
    monthlyPrice: 49,
    yearlyPrice: 480,
    monthlyPriceEur: 10,
    yearlyPriceEur: 98,
    features: [
      'AI Agronomic Report',
      'Unlimited Clarification Support',
      '12-hour Response Time',
      '15% Renewal Discount',
      '10% Referral Bonus',
      'Comparative Analysis',
      'Partner Discounts',
      'Early Access',
    ],
    featuresMs: [
      'Laporan Agronomi AI',
      'Sokongan Penjelasan Tanpa Had',
      'Masa Respons 12 jam',
      '15% Diskaun Pembaharuan',
      '10% Bonus Rujukan',
      'Analisis Perbandingan',
      'Diskaun Rakan Kongsi',
      'Akses Awal',
    ],
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRECISION_MONTHLY || '',
    stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRECISION_YEARLY || '',
    uploadLimit: -1,
    supportLevel: 'Premium (12h)',
    supportLevelMs: 'Premium (12j)',
  },
];

export const getPlanById = (id: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS[id];
};

export const getPricingTierById = (id: string): PricingTier | undefined => {
  return PRICING_TIERS.find(tier => tier.id === id);
};

export const getPlanLimits = (plan: SubscriptionPlan) => {
  return {
    uploadLimit: plan.uploadLimit,
    aiAccess: plan.aiAccess,
    supportLevel: plan.supportLevel,
    renewalDiscount: plan.renewalDiscount,
    referralBonus: plan.referralBonus,
    comparativeAnalysis: plan.comparativeAnalysis,
    partnerDiscounts: plan.partnerDiscounts,
    earlyAccess: plan.earlyAccess,
  };
};

export const calculateYearlySavings = (plan: SubscriptionPlan): number => {
  const monthlyYearly = plan.monthlyPrice * 12;
  return monthlyYearly - plan.yearlyPrice;
};

export const formatPrice = (price: number, currency: 'MYR' | 'EUR' = 'MYR'): string => {
  if (currency === 'EUR') {
    return `€${price}`;
  }
  return `RM${price}`;
};

export const getSupportResponseTime = (plan: SubscriptionPlan): string => {
  switch (plan.supportLevel) {
    case 'basic':
      return 'Standard';
    case 'priority':
      return '24 hours';
    case 'premium':
      return '12 hours';
    default:
      return 'Standard';
  }
};
