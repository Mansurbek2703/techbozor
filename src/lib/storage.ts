import fs from 'fs';
import path from 'path';
import { 
  PurchaseRequest, 
  Offer, 
  Seller, 
  ProductItem, 
  SMSLog, 
  CategoryKey,
  Region 
} from '@/types';

interface DatabaseSchema {
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
  {
    id: 'SEL-003',
    login: 'fergana_texnika',
    password: 'password123',
    shopName: 'Farg‘ona Texnika Markazi',
    ownerName: 'Oybek Mirzayev',
    phone: '+998977112244',
    sellerType: 'business',
    regions: ['Farg‘ona', 'Andijon', 'Namangan'],
    categories: ['tv', 'fridge', 'washing', 'ac', 'vacuum', 'stove', 'microwave'],
    isVerified: true,
    isBlocked: false,
    rating: 4.7,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'SEL-004',
    login: 'xorazm_electron',
    password: 'password123',
    shopName: 'Xorazm Elektronika',
    ownerName: 'Mansur Razzoqov',
    phone: '+998993456789',
    sellerType: 'individual',
    regions: ['Xorazm', 'Qoraqalpog‘iston'],
    categories: ['tv', 'fridge', 'ac', 'washing'],
    isVerified: true,
    isBlocked: false,
    rating: 4.9,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
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
      'Diagonal': '55"',
      'Aniqlik': '4K UHD (3840x2160)',
      'Smart TV': 'Tizen OS',
      'Kafolat': '1 yil rasmiy',
    },
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
    region: 'Toshkent shahri',
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'PRD-102',
    sellerId: 'SEL-001',
    category: 'tv',
    name: 'Artel 55 Smart Android TV (55AU90G)',
    brand: 'Artel',
    model: '55AU90G',
    price: 4200000,
    condition: 'new',
    specifications: {
      'Diagonal': '55"',
      'Smart TV': 'Android 11 Google TV',
      'Aniqlik': '4K UHD HDR10',
      'Kafolat': '3 yil to‘liq kafolat',
    },
    imageUrl: 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=600&auto=format&fit=crop&q=80',
    region: 'Toshkent shahri',
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'PRD-103',
    sellerId: 'SEL-002',
    category: 'fridge',
    name: 'LG Smart Inverter NoFrost Sovutkich 360L',
    brand: 'LG',
    model: 'GC-B459SQCL',
    price: 6800000,
    condition: 'new',
    specifications: {
      'Hajmi': '360 litr',
      'Turi': 'Total No Frost',
      'Kompressor': 'Smart Inverter (10 yil kafolat)',
      'Energiya sinfi': 'A++',
    },
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
    region: 'Samarqand',
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'PRD-104',
    sellerId: 'SEL-003',
    category: 'washing',
    name: 'Artel Avtomat Kir Yuvish Mashinasi 7kg',
    brand: 'Artel',
    model: 'Grand Inverter 70C121',
    price: 3600000,
    condition: 'new',
    specifications: {
      'Sig‘im': '7 kg',
      'Siqish tezligi': '1200 ayl/daq',
      'Dvigatel': 'Inverter Direct Drive',
      'Kafolat': '3 yil',
    },
    imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80',
    region: 'Farg‘ona',
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
    description: '5 million so‘mgacha 50 yoki 55 dyuymli Smart televizor kerak. Tasvir sifati va ovozi yaxshi bo‘lsin.',
    budget: 5000000,
    region: 'Toshkent shahri',
    district: 'Yunusobod',
    specifications: {
      diagonal: '55"',
      smartTv: 'Mavjud (Android/Google TV/Tizen)',
      screenType: 'LED / LCD',
    },
    durationDays: 7,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 6 * 86400000).toISOString(),
    status: 'active',
    smsConsent: true,
    aiExtracted: {
      category: 'tv',
      budget: 5000000,
      specs: { diagonal: '55"', smart: true },
    },
  },
  {
    id: 'REQ-45192',
    buyerName: 'Farhod Nazarov',
    buyerPhone: '+998931112233',
    category: 'fridge',
    description: 'Samarqand shahriga 6-7 mln so‘m atrofida katta NoFrost sovutkich kerak. LG yoki Samsung ma’qul.',
    budget: 7000000,
    region: 'Samarqand',
    district: 'Samarqand sh.',
    specifications: {
      type: 'No Frost (Muzlamas)',
      volume: '360-500 litr',
    },
    durationDays: 3,
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 2 * 86400000).toISOString(),
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
    description: 'Yangi qutida, 1 yil rasmiy Samsung O‘zbekiston kafolati bor. Toshkent bo‘ylab bepul yetkazib beramiz!',
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
    status: 'sent',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'OFF-1093',
    requestId: 'REQ-78219',
    sellerId: 'SEL-001',
    sellerName: 'Alisher Karimov',
    sellerShopName: 'Texnomart Toshkent',
    sellerPhone: '+998901234567',
    sellerRegion: 'Toshkent shahri',
    productName: 'Artel 55 Smart Android TV (55AU90G)',
    brand: 'Artel',
    model: '55AU90G',
    price: 4150000,
    condition: 'new',
    description: '3 yil kafolat, o‘zbek tilidagi ovozli boshqaruv pulti, Google Play dasturlari to‘liq o‘rnatilgan.',
    imageUrl: 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=600&auto=format&fit=crop&q=80',
    status: 'viewed',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'OFF-1094',
    requestId: 'REQ-45192',
    sellerId: 'SEL-002',
    sellerName: 'Sherzod Boboyev',
    sellerShopName: 'SmartTex Samarqand',
    sellerPhone: '+998935552233',
    sellerRegion: 'Samarqand',
    productName: 'LG Smart Inverter NoFrost Sovutkich 360L',
    brand: 'LG',
    model: 'GC-B459SQCL',
    price: 6750000,
    condition: 'new',
    description: 'Samarqand do‘konimizda mavjud. 10 yil kompressor kafolati. Yetkazib berish va o‘rnatish tekin.',
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
    status: 'sent',
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
];

const INITIAL_SMS_LOGS: SMSLog[] = [
  {
    id: 'SMS-1',
    recipientPhone: '+998901234567',
    recipientType: 'seller',
    recipientName: 'Texnomart Toshkent',
    message: 'Yangi talab: 5 mln so‘mgacha Smart TV kerak. Hudud: Toshkent shahri. Ko‘rish: https://savdo.mcode.uz/seller/dashboard',
    sentAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    status: 'delivered',
    costSoM: 65,
    relatedRequestId: 'REQ-78219',
  },
  {
    id: 'SMS-2',
    recipientPhone: '+998909876543',
    recipientType: 'buyer',
    recipientName: 'Jamshid Oripov',
    message: 'Sizning talabingizga yangi taklif: Samsung 55 Crystal 4K — 4 850 000 so‘m. Batafsil: https://savdo.mcode.uz/request/REQ-78219',
    sentAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    status: 'delivered',
    costSoM: 65,
    relatedRequestId: 'REQ-78219',
    relatedOfferId: 'OFF-1092',
  },
];

function getDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DatabaseSchema = {
        requests: INITIAL_REQUESTS,
        offers: INITIAL_OFFERS,
        sellers: INITIAL_SELLERS,
        products: INITIAL_PRODUCTS,
        smsLogs: INITIAL_SMS_LOGS,
        adminStats: {
          totalAiQueries: 142,
          totalSmsSpentSoM: INITIAL_SMS_LOGS.reduce((sum, s) => sum + s.costSoM, 0),
        },
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Database read error:', err);
    return {
      requests: INITIAL_REQUESTS,
      offers: INITIAL_OFFERS,
      sellers: INITIAL_SELLERS,
      products: INITIAL_PRODUCTS,
      smsLogs: INITIAL_SMS_LOGS,
      adminStats: { totalAiQueries: 142, totalSmsSpentSoM: 130 },
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

// REQUESTS
export function getRequests(): PurchaseRequest[] {
  const db = getDatabase();
  const now = new Date().toISOString();
  // Auto-expire requests
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

export function getOffersBySellerId(sellerId: string): Offer[] {
  const db = getDatabase();
  return db.offers
    .filter(o => o.sellerId === sellerId)
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
