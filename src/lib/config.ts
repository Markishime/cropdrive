// Application configuration
export const config = {
  app: {
    name: 'CropDrive OP Advisor™',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://cropdrive.vercel.app',
    version: '1.0.0',
  },

  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },

  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    prices: {
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
    },
    checkoutBaseUrl: process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_BASE_URL || 'https://buy.stripe.com',
  },

  google: {
    documentAI: {
      projectId: process.env.GOOGLE_DOCUMENT_AI_PROJECT_ID,
      location: process.env.GOOGLE_DOCUMENT_AI_LOCATION || 'us-central1',
      processorId: process.env.GOOGLE_DOCUMENT_AI_PROCESSOR_ID,
    },
  },

  support: {
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT || '+60123456789',
  },

  features: {
    useEmulators: process.env.NEXT_PUBLIC_USE_EMULATORS === 'true',
    enableAnalytics: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ? true : false,
  },

  limits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxUploadsPerMonth: {
      start: 10,
      smart: 50,
      precision: -1, // unlimited
    },
  },

  plans: {
    start: {
      name: 'CropDrive Start',
      nameMs: 'CropDrive Start',
      monthlyPrice: 24,
      yearlyPrice: 192,
      monthlyPriceEur: 5,
      yearlyPriceEur: 40,
      uploadLimit: 10,
      features: ['AI Reports', '1 Support Session', 'Standard Response'],
    },
    smart: {
      name: 'CropDrive Smart',
      nameMs: 'CropDrive Smart',
      monthlyPrice: 39,
      yearlyPrice: 336,
      monthlyPriceEur: 8,
      yearlyPriceEur: 68,
      uploadLimit: 50,
      features: ['AI Reports', '3 Support Sessions', '24h Response', '5% Referral Bonus'],
    },
    precision: {
      name: 'CropDrive Precision',
      nameMs: 'CropDrive Precision',
      monthlyPrice: 49,
      yearlyPrice: 480,
      monthlyPriceEur: 10,
      yearlyPriceEur: 98,
      uploadLimit: -1, // unlimited
      features: ['AI Reports', 'Unlimited Support', '12h Response', '10% Referral Bonus', 'Comparative Analysis', 'Partner Discounts'],
    },
  },
};

// Validation function to check if all required environment variables are set
export const validateConfig = (): string[] => {
  const errors: string[] = [];

  // Required Firebase config
  const requiredFirebaseKeys = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  requiredFirebaseKeys.forEach(key => {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  // Required Stripe config
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    errors.push('Missing required environment variable: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  }

  return errors;
};

// Development vs Production settings
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
