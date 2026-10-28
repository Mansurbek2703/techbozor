export type Region = 
  | 'Toshkent shahri'
  | 'Toshkent viloyati'
  | 'Samarqand'
  | 'Farg‘ona'
  | 'Andijon'
  | 'Namangan'
  | 'Buxoro'
  | 'Xorazm'
  | 'Qashqadaryo'
  | 'Surxondaryo'
  | 'Jizzax'
  | 'Sirdaryo'
  | 'Navoiy'
  | 'Qoraqalpog‘iston';

export const UZBEKISTAN_REGIONS: Region[] = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Samarqand',
  'Farg‘ona',
  'Andijon',
  'Namangan',
  'Buxoro',
  'Xorazm',
  'Qashqadaryo',
  'Surxondaryo',
  'Jizzax',
  'Sirdaryo',
  'Navoiy',
  'Qoraqalpog‘iston',
];

export type CategoryKey = 
  | 'tv'
  | 'fridge'
  | 'washing'
  | 'ac'
  | 'vacuum'
  | 'stove'
  | 'microwave';

export interface CategoryInfo {
  id: CategoryKey;
  name: string;
  iconName: string;
  description: string;
  filters: FilterDefinition[];
}

export interface FilterDefinition {
  id: string;
  label: string;
  type: 'select' | 'range' | 'radio';
  options?: string[];
}

export interface PurchaseRequest {
  id: string; // e.g. REQ-9281
  buyerName: string;
  buyerPhone: string;
  category: CategoryKey;
  description: string;
  budget: number; // so'm
  region: Region;
  district?: string;
  specifications: Record<string, any>;
  durationDays: number; // 1, 3, 7, 14, 30
  createdAt: string; // ISO
  expiresAt: string; // ISO
  status: 'active' | 'closed' | 'expired' | 'fulfilled';
  smsConsent: boolean;
  aiExtracted?: {
    category: string;
    budget: number;
    specs: Record<string, any>;
  };
}

export interface Offer {
  id: string; // e.g. OFF-3104
  requestId: string;
  sellerId: string;
  sellerName: string;
  sellerShopName: string;
  sellerPhone: string;
  sellerRegion: Region;
  productName: string;
  brand: string;
  model: string;
  price: number; // so'm
  condition: 'new' | 'ideal' | 'used';
  description: string;
  imageUrl?: string;
  status: 'sent' | 'viewed' | 'interested' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
}

export interface Seller {
  id: string;
  login: string;
  password?: string;
  shopName: string;
  ownerName: string;
  phone: string;
  sellerType: 'business' | 'individual';
  regions: Region[]; // 1 to 3 regions
  categories: CategoryKey[];
  isVerified: boolean;
  isBlocked: boolean;
  rating: number;
  createdAt: string;
}

export interface ProductItem {
  id: string;
  sellerId: string;
  category: CategoryKey;
  name: string;
  brand: string;
  model: string;
  price: number;
  condition: 'new' | 'ideal';
  specifications: Record<string, string>;
  imageUrl: string;
  region: Region;
  inStock: boolean;
  createdAt: string;
}

export interface SMSLog {
  id: string;
  recipientPhone: string;
  recipientType: 'buyer' | 'seller';
  recipientName: string;
  message: string;
  sentAt: string;
  status: 'delivered' | 'sent' | 'failed';
  costSoM: number;
  relatedRequestId?: string;
  relatedOfferId?: string;
}

export interface AIRecommendation {
  brand: string;
  model: string;
  category: string;
  categoryKey?: CategoryKey | string;
  estimatedPrice: number;
  specs: string[];
  reason: string;
  budgetMatchPercent: number;
  isEstimated: boolean;
  alternativeModels?: string[];
  imageUrl?: string;
  energyClass?: string;
  warrantyYears?: number;
  economicBenefit?: string;
  officialSource?: string;
  marketPriceRange?: string;
  detailedSpecs?: Record<string, string>;
}
