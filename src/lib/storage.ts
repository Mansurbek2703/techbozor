import fs from 'fs';
import path from 'path';
import { 
  PurchaseRequest, 
  Offer, 
  Seller, 
  ProductItem, 
  SMSLog, 
  CategoryKey,
  Region,
  CategoryInfo
} from '@/types';
import { CATEGORIES as INITIAL_CATEGORIES } from './categories';

interface DatabaseSchema {
  categories: CategoryInfo[];
  requests: PurchaseRequest[];
  offers: Offer[];
  sellers: Seller[];
  products: ProductItem[];
  smsLogs: SMSLog[];
  adminStats: {
    totalAiQueries: number;
    totalSmsSpentSoM: number;
  };
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'techbozor_db.json');

const INITIAL_SELLERS: Seller[] = [
  {
    id: 'SEL-001',
    login: 'texnomart_toshkent',
    password: 'password123',
    shopName: 'Texnomart Toshkent',
    ownerName: 'Alisher Karimov',
    phone: '+998901234567',
    sellerType: 'business',
    regions: ['Toshkent shahri', 'Toshkent viloyati', 'Sirdaryo'],
    categories: ['tv', 'fridge', 'washing', 'ac', 'vacuum', 'stove', 'microwave'],
    isVerified: true,
    isBlocked: false,
    rating: 4.9,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'SEL-002',
    login: 'smart_samarqand',
    password: 'password123',
    shopName: 'SmartTex Samarqand',
    ownerName: 'Sherzod Boboyev',
    phone: '+998935552233',
    sellerType: 'business',
    regions: ['Samarqand', 'Buxoro', 'Jizzax'],
    categories: ['tv', 'fridge', 'washing', 'ac'],
    isVerified: true,
    isBlocked: false,
    rating: 4.8,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'PRD-101',
    sellerId: 'SEL-001',
    category: 'tv',
    name: 'Samsung 55 Crystal 4K UHD Smart TV (CU7100)',
    brand: 'Samsung',
    model: 'UE55CU7100UXUZ',
    price: 4950000,
    condition: 'new',
    specifications: {
      'Diagonali': '55"',
      'Smart TV': 'Tizen',
    },
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
    region: 'Toshkent shahri',
    inStock: true,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_REQUESTS: PurchaseRequest[] = [
  {
    id: 'REQ-78219',
    buyerName: 'Jamshid Oripov',
    buyerPhone: '+998909876543',
    category: 'tv',
    description: '5 million so‘mgacha 55 talik Smart televizor kerak. Tiniq tasvir bo‘lsin.',
    budget: 5000000,
    region: 'Toshkent shahri',
    district: 'Yunusobod',
    specifications: {
      diagonal: '55"',
      smartTv: 'Android / Google TV',
    },
    durationDays: 7,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 6 * 86400000).toISOString(),
    status: 'active',
    smsConsent: true,
  },
];

const INITIAL_OFFERS: Offer[] = [
  {
    id: 'OFF-1092',
    requestId: 'REQ-78219',
    sellerId: 'SEL-001',
    sellerName: 'Alisher Karimov',
    sellerShopName: 'Texnomart Toshkent',
    sellerPhone: '+998901234567',
    sellerRegion: 'Toshkent shahri',
    productName: 'Samsung 55 Crystal 4K UHD Smart TV (CU7100)',
    brand: 'Samsung',
    model: 'UE55CU7100UXUZ',
    price: 4850000,
    condition: 'new',
    description: '1 yil kafolat, Toshkent bo‘ylab bepul yetkazib beramiz.',
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
    status: 'sent',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
];

function getDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DatabaseSchema = {
        categories: INITIAL_CATEGORIES,
        requests: INITIAL_REQUESTS,
        offers: INITIAL_OFFERS,
        sellers: INITIAL_SELLERS,
        products: INITIAL_PRODUCTS,
        smsLogs: [],
        adminStats: { totalAiQueries: 48, totalSmsSpentSoM: 130 },
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    // Agar categories mavjud bo'lmasa, initsializatsiya qilamiz
    if (!parsed.categories || parsed.categories.length === 0) {
      parsed.categories = INITIAL_CATEGORIES;
      saveDatabase(parsed);
    }
    return parsed;
  } catch (err) {
    console.error('Database read error:', err);
    return {
      categories: INITIAL_CATEGORIES,
      requests: INITIAL_REQUESTS,
      offers: INITIAL_OFFERS,
      sellers: INITIAL_SELLERS,
      products: INITIAL_PRODUCTS,
      smsLogs: [],
      adminStats: { totalAiQueries: 48, totalSmsSpentSoM: 130 },
    };
  }
}

function saveDatabase(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Database save error:', err);
  }
}

// CATEGORIES (DINAMIK CRUD)
export function getStoredCategories(): CategoryInfo[] {
  const db = getDatabase();
  return db.categories || INITIAL_CATEGORIES;
}

export function addCategory(category: CategoryInfo): CategoryInfo {
  const db = getDatabase();
  if (!db.categories) db.categories = [...INITIAL_CATEGORIES];
  const exists = db.categories.find(c => c.id === category.id);
  if (exists) {
    Object.assign(exists, category);
  } else {
    db.categories.push(category);
  }
  saveDatabase(db);
  return category;
}

export function deleteCategory(categoryId: string): boolean {
  const db = getDatabase();
  if (!db.categories) return false;
  const initialLen = db.categories.length;
  db.categories = db.categories.filter(c => c.id !== categoryId);
  saveDatabase(db);
  return db.categories.length < initialLen;
}

// REQUESTS
export function getRequests(): PurchaseRequest[] {
  const db = getDatabase();
  const now = new Date().toISOString();
  let changed = false;
  db.requests.forEach(r => {
    if (r.status === 'active' && r.expiresAt < now) {
      r.status = 'expired';
      changed = true;
    }
  });
  if (changed) saveDatabase(db);
  return db.requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getRequestById(id: string): PurchaseRequest | null {
  const requests = getRequests();
  return requests.find(r => r.id === id) || null;
}

export function createRequest(reqData: Omit<PurchaseRequest, 'id' | 'createdAt' | 'expiresAt' | 'status'> & { durationDays: number }): PurchaseRequest {
  const db = getDatabase();
  const idNum = Math.floor(10000 + Math.random() * 90000);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (reqData.durationDays || 7) * 86400000);

  const newReq: PurchaseRequest = {
    ...reqData,
    id: `REQ-${idNum}`,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'active',
  };

  db.requests.unshift(newReq);
  saveDatabase(db);
  return newReq;
}

export function updateRequestStatus(id: string, status: PurchaseRequest['status']): boolean {
  const db = getDatabase();
  const req = db.requests.find(r => r.id === id);
  if (!req) return false;
  req.status = status;
  saveDatabase(db);
  return true;
}

// OFFERS
export function getOffersByRequestId(requestId: string): Offer[] {
  const db = getDatabase();
  return db.offers
    .filter(o => o.requestId === requestId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createOffer(data: Omit<Offer, 'id' | 'createdAt' | 'status'>): Offer {
  const db = getDatabase();
  const idNum = Math.floor(1000 + Math.random() * 9000);
  const newOffer: Offer = {
    ...data,
    id: `OFF-${idNum}`,
    status: 'sent',
    createdAt: new Date().toISOString(),
  };
  db.offers.unshift(newOffer);
  saveDatabase(db);
  return newOffer;
}

export function updateOfferStatus(id: string, status: Offer['status']): boolean {
  const db = getDatabase();
  const offer = db.offers.find(o => o.id === id);
  if (!offer) return false;
  offer.status = status;
  saveDatabase(db);
  return true;
}

// SELLERS
export function getSellers(): Seller[] {
  const db = getDatabase();
  return db.sellers;
}

export function getSellerById(id: string): Seller | null {
  const sellers = getSellers();
  return sellers.find(s => s.id === id) || null;
}

export function getSellerByLogin(login: string): Seller | null {
  const sellers = getSellers();
  return sellers.find(s => s.login.toLowerCase() === login.toLowerCase()) || null;
}

export function createSeller(data: Omit<Seller, 'id' | 'createdAt' | 'isVerified' | 'isBlocked' | 'rating'>): Seller {
  const db = getDatabase();
  const idNum = Math.floor(100 + Math.random() * 900);
  const newSeller: Seller = {
    ...data,
    id: `SEL-${idNum}`,
    isVerified: true,
    isBlocked: false,
    rating: 5.0,
    createdAt: new Date().toISOString(),
  };
  db.sellers.unshift(newSeller);
  saveDatabase(db);
  return newSeller;
}

export function toggleSellerBlock(sellerId: string): boolean {
  const db = getDatabase();
  const seller = db.sellers.find(s => s.id === sellerId);
  if (!seller) return false;
  seller.isBlocked = !seller.isBlocked;
  saveDatabase(db);
  return true;
}

// PRODUCTS
export function getProductsBySellerId(sellerId: string): ProductItem[] {
  const db = getDatabase();
  return db.products.filter(p => p.sellerId === sellerId);
}

export function addProduct(product: Omit<ProductItem, 'id' | 'createdAt'>): ProductItem {
  const db = getDatabase();
  const idNum = Math.floor(100 + Math.random() * 900);
  const newProduct: ProductItem = {
    ...product,
    id: `PRD-${idNum}`,
    createdAt: new Date().toISOString(),
  };
  db.products.unshift(newProduct);
  saveDatabase(db);
  return newProduct;
}

export function deleteProduct(productId: string, sellerId: string): boolean {
  const db = getDatabase();
  const idx = db.products.findIndex(p => p.id === productId && p.sellerId === sellerId);
  if (idx === -1) return false;
  db.products.splice(idx, 1);
  saveDatabase(db);
  return true;
}

// SMS LOGS
export function getSMSLogs(): SMSLog[] {
  const db = getDatabase();
  return db.smsLogs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}

export function addSMSLog(log: Omit<SMSLog, 'id' | 'sentAt' | 'costSoM'> & { costSoM?: number }): SMSLog {
  const db = getDatabase();
  const id = `SMS-${Date.now().toString().slice(-6)}`;
  const fullLog: SMSLog = {
    ...log,
    id,
    sentAt: new Date().toISOString(),
    costSoM: log.costSoM ?? 65,
  };
  db.smsLogs.unshift(fullLog);
  db.adminStats.totalSmsSpentSoM += fullLog.costSoM;
  saveDatabase(db);
  return fullLog;
}

// STATS
export function incrementAiCount() {
  const db = getDatabase();
  db.adminStats.totalAiQueries += 1;
  saveDatabase(db);
}

export function getAdminStats() {
  const db = getDatabase();
  return {
    totalCategories: (db.categories || []).length,
    totalRequests: db.requests.length,
    activeRequests: db.requests.filter(r => r.status === 'active').length,
    totalOffers: db.offers.length,
    totalSellers: db.sellers.length,
    activeSellers: db.sellers.filter(s => !s.isBlocked).length,
    totalProducts: db.products.length,
    totalSmsCount: db.smsLogs.length,
    totalSmsSpentSoM: db.adminStats.totalSmsSpentSoM,
    totalAiQueries: db.adminStats.totalAiQueries,
  };
}
