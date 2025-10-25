export interface User {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  farmName?: string;
  farmLocation?: string;
  farmSize?: string;
  language: 'en' | 'ms';
  registrationDate: Date;
  plan: string; // Plan ID: 'none' | 'start' | 'smart' | 'precision'
  status: 'active' | 'inactive' | 'suspended';
  stripeCustomerId?: string;
  uploadsUsed: number;
  uploadsLimit: number;
  lastLogin: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: boolean;
  language: 'en' | 'ms';
  theme: 'light' | 'dark' | 'auto';
  units: 'metric' | 'imperial';
}

export interface SubscriptionPlan {
  id: 'start' | 'smart' | 'precision';
  name: string;
  nameMs: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyPriceEur: number;
  yearlyPriceEur: number;
  features: PlanFeature[];
  uploadLimit: number;
  aiAccess: boolean;
  supportLevel: 'basic' | 'priority' | 'premium';
  renewalDiscount: number;
  referralBonus: number;
  comparativeAnalysis: boolean;
  partnerDiscounts: boolean;
  earlyAccess: boolean;
}

export interface PlanFeature {
  name: string;
  nameMs: string;
  included: boolean;
  limit?: number;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string;
  stripePriceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileUpload {
  id: string;
  userId: string;
  fileName: string;
  fileType: 'soil' | 'leaf' | 'other';
  fileSize: number;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'failed';
  analysisResult?: AnalysisResult;
  downloadUrl?: string;
}

export interface AnalysisResult {
  id: string;
  fileId: string;
  ph?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  recommendations: string[];
  recommendationsMs: string[];
  confidence: number;
  processedAt: Date;
  mpoStandards?: MPOBStandards;
}

export interface MPOBStandards {
  ph: { min: number; max: number; optimal: number };
  nitrogen: { min: number; max: number; optimal: number };
  phosphorus: { min: number; max: number; optimal: number };
  potassium: { min: number; max: number; optimal: number };
}

export interface PricingTier {
  id: 'start' | 'smart' | 'precision';
  name: string;
  nameMs: string;
  tagline: string;
  taglineMs: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyPriceEur: number;
  yearlyPriceEur: number;
  features: string[];
  featuresMs: string[];
  popular?: boolean;
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
  uploadLimit: number;
  supportLevel: string;
  supportLevelMs: string;
}

export interface LanguageStrings {
  [key: string]: any;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, language?: 'en' | 'ms') => Promise<void>;
  signUp: (userData: SignUpData, language?: 'en' | 'ms') => Promise<void>;
  signOut: (language?: 'en' | 'ms') => Promise<void>;
  updateProfile: (updates: Partial<User>, language?: 'en' | 'ms') => Promise<void>;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  phoneNumber?: string;
  farmName?: string;
  farmLocation?: string;
  language: 'en' | 'ms';
}

export interface DashboardStats {
  totalUploads: number;
  uploadsThisMonth: number;
  uploadsRemaining: number;
  subscriptionDaysLeft: number;
  recentAnalyses: AnalysisResult[];
  planName: string;
}

export interface NotificationData {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  titleMs: string;
  message: string;
  messageMs: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface TutorialStep {
  id: string;
  title: string;
  titleMs: string;
  description: string;
  descriptionMs: string;
  imageUrl?: string;
  videoUrl?: string;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  nameMs: string;
  location: string;
  locationMs: string;
  rating: number;
  message: string;
  messageMs: string;
  imageUrl?: string;
  featured: boolean;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}
