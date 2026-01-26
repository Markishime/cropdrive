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
  billingCycle?: 'monthly' | 'yearly'; // User's current billing cycle
  status: 'active' | 'inactive' | 'suspended';
  subscriptionStatus?: 'active' | 'canceling' | 'canceled' | 'past_due'; // Stripe subscription status
  cancelAtPeriodEnd?: boolean; // Whether subscription will cancel at period end
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  paymentMethod?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  uploadsUsed: number;
  uploadsLimit: number;
  lastLogin: Date;
  preferences: UserPreferences;
  profilePictureUrl?: string;
  currentPeriodEnd?: Date; // When the current billing period ends
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
  refreshUser?: () => Promise<void>;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  phoneNumber?: string;
  farmName?: string;
  farmLocation?: string;
  language?: 'en' | 'ms'; // Optional, defaults to current UI language
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

export interface SupportMessage {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPlan: string;
  subject?: string;
  message: string;
  status: 'sent' | 'read' | 'responded';
  createdAt: Date;
  respondedAt?: Date;
}

// Palmira Chatbot Types
export interface PalmiraUserType {
  id: 'farmer' | 'organization' | 'researcher' | 'other';
  label: string;
  labelMs: string;
}

export interface PalmiraConversationStyle {
  id: 'diagnostic_interview' | 'checklist_only' | 'short_direct';
  label: string;
  labelMs: string;
  description: string;
  descriptionMs: string;
}

export interface PalmiraOnboardingData {
  userId: string;
  userType: PalmiraUserType['id'];
  language: 'en' | 'ms';
  conversationStyle: PalmiraConversationStyle['id'];
  consentTranscripts: boolean;
  consentFarmProfile: boolean;
  completedAt: Date;
  completed: boolean;
}

export interface PalmiraPreferences {
  userId: string;
  language: 'en' | 'ms';
  conversationStyle: PalmiraConversationStyle['id'];
  updatedAt: Date;
}

export interface PalmiraFarmProfile {
  userId: string;
  farmName?: string;
  farmLocation?: string;
  farmSize?: string;
  cropType?: string;
  soilType?: string;
  irrigationSystem?: string;
  managementPractices?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PalmiraChatMessage {
  id: string;
  chatId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    reportId?: string;
    sectionId?: string;
    knowledgeBaseRefs?: string[];
    escalated?: boolean;
    escalationReason?: string;
  };
  createdAt: Date;
}

export interface PalmiraChat {
  id: string;
  userId: string;
  title: string;
  activeReportId?: string;
  activeReportData?: any;
  messages: PalmiraChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  escalated?: boolean;
  escalationReason?: string;
}

export interface PalmiraReport {
  id: string;
  userId: string;
  reportId: string; // Reference to analysis_results document
  title: string;
  type: 'soil' | 'leaf' | 'other';
  uploadedAt: Date;
  extractedData?: {
    sections: Array<{
      id: string;
      title: string;
      content: string;
      keyValues: Record<string, any>;
    }>;
    summary?: string;
  };
}

export interface PalmiraKnowledgeBaseDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  language: 'en' | 'ms' | 'both';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface PalmiraChatRequest {
  message: string;
  chatId?: string;
  reportId?: string;
  context?: {
    sectionId?: string;
    previousMessages?: number;
  };
}

export interface PalmiraChatResponse {
  message: string;
  chatId: string;
  messageId: string;
  metadata?: {
    knowledgeBaseRefs?: Array<{
      documentId: string;
      title: string;
      relevance: number;
    }>;
    reportSectionRefs?: Array<{
      sectionId: string;
      title: string;
    }>;
    escalated?: boolean;
    escalationReason?: string;
  };
}