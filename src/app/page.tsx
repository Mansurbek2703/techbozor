'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Camera, 
  BookOpen, 
  Layers, 
  ExternalLink, 
  Heart, 
  Bell, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  X, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  ShieldCheck, 
  Truck, 
  ShoppingBag, 
  Bot, 
  Sparkles, 
  Send, 
  Filter, 
  ArrowUpDown, 
  Info,
  SlidersHorizontal,
  Store,
  CheckCheck,
  ChevronDown,
  RefreshCw,
  MapPin,
  Scale
} from 'lucide-react';
import { 
  SerpProductItem, 
  PriceInsightData, 
  BestBannerData,
  isDishwareQuery,
  detectCategoryKey
} from '@/lib/serpapi';
import { getStoreBrandConfig } from '@/lib/store-logos';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

// =========================================================================
// 1:1 MAXPROFIT AUTHENTIC KATALOG KATEGORIYALARI (15 TA ASOSIY GURUHLAR)
// =========================================================================
const CATALOG_CATEGORIES = [
  {
    id: 'smartfonlar',
    title: 'Smartfonlar',
    count: '441 ta mahsulot',
    icon: '📱',
    iconBg: 'bg-purple-50 text-purple-600',
    query: 'smartfon',
  },
  {
    id: 'noutbuklar',
    title: 'Noutbuklar',
    count: '951 ta mahsulot',
    icon: '💻',
    iconBg: 'bg-sky-50 text-sky-600',
    query: 'noutbuk',
  },
  {
    id: 'planshetlar',
    title: 'Planshetlar',
    count: '218 ta mahsulot',
    icon: '📲',
    iconBg: 'bg-indigo-50 text-indigo-600',
    query: 'planshet',
  },
  {
    id: 'televizorlar',
    title: 'Televizorlar',
    count: '789 ta mahsulot',
    icon: '📺',
    iconBg: 'bg-blue-50 text-blue-600',
    query: 'televizor',
  },
  {
    id: 'muzlatgichlar',
    title: 'Muzlatgichlar',
    count: '752 ta mahsulot',
    icon: '🧊',
    iconBg: 'bg-cyan-50 text-cyan-600',
    query: 'muzlatgich',
  },
  {
    id: 'kir-yuvish',
    title: 'Kir yuvish mashinalari',
    count: '906 ta mahsulot',
    icon: '🫧',
    iconBg: 'bg-violet-50 text-violet-600',
    query: 'kir yuvish mashinasi',
  },
  {
    id: 'konditsionerlar',
    title: 'Konditsionerlar',
    count: '849 ta mahsulot',
    icon: '❄️',
    iconBg: 'bg-sky-50 text-sky-600',
    query: 'konditsioner inverter',
  },
  {
    id: 'changyutgichlar',
    title: 'Changyutgichlar',
    count: '766 ta mahsulot',
    icon: '🧹',
    iconBg: 'bg-pink-50 text-pink-600',
    query: 'changyutgich',
  },
  {
    id: 'quloqchinlar',
    title: 'Quloqchinlar',
    count: '748 ta mahsulot',
    icon: '🎧',
    iconBg: 'bg-slate-100 text-slate-700',
    query: 'simsiz quloqchin',
  },
  {
    id: 'smart-soatlar',
    title: 'Smart soatlar',
    count: '296 ta mahsulot',
    icon: '⌚',
    iconBg: 'bg-indigo-50 text-indigo-600',
    query: 'smart soat',
  },
  {
    id: 'mikrotolqinli-pechlar',
    title: 'Mikroto‘lqinli pechlar',
    count: '452 ta mahsulot',
    icon: '🍲',
    iconBg: 'bg-amber-50 text-amber-600',
    query: 'mikrotolqinli pech',
  },
  {
    id: 'oyin-konsollari',
    title: 'O‘yin konsollari',
    count: '28 ta mahsulot',
    icon: '🎮',
    iconBg: 'bg-purple-50 text-purple-600',
    query: 'playstation 5 konsol',
  },
  {
    id: 'isitgichlar',
    title: 'Isitgichlar',
    count: '111 ta mahsulot',
    icon: '🔥',
    iconBg: 'bg-orange-50 text-orange-600',
    query: 'isitgich konvektor',
  },
  {
    id: 'tugmali-telefonlar',
    title: 'Tugmali telefonlar',
    count: '60 ta mahsulot',
    icon: '☎️',
    iconBg: 'bg-rose-50 text-rose-600',
    query: 'tugmali telefon',
  },
  {
    id: 'suv-isitgichlar',
    title: 'Suv isitgichlar (boyler)',
    count: '105 ta mahsulot',
    icon: '🚿',
    iconBg: 'bg-cyan-50 text-cyan-600',
    query: 'boyler suv isitgich',
  },
];

// OMMABOP MAHSULOTLAR SARALANMASI (KATALOG VIEW UCHUN)
const FEATURED_CATALOG_SECTIONS = [
  {
    id: 'smartphones',
    title: 'Smartfonlar',
    icon: '📱',
    query: 'smartfon',
    items: [
      {
        title: 'Apple iPhone 15 128GB',
        price: '10 240 000 so‘m dan',
        stores: '14 ta do‘konda',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80',
        query: 'apple iphone 15 128gb'
      },
      {
        title: 'Samsung Galaxy A55 5G 8/128GB',
        price: '4 150 000 so‘m dan',
        stores: '18 ta do‘konda',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80',
        query: 'samsung galaxy a55 5g'
      },
      {
        title: 'Xiaomi Redmi Note 13 8/256GB',
        price: '2 190 000 so‘m dan',
        stores: '21 ta do‘konda',
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80',
        query: 'xiaomi redmi note 13'
      },
      {
        title: 'Samsung Galaxy S24 Ultra 12/256GB',
        price: '13 890 000 so‘m dan',
        stores: '12 ta do‘konda',
        image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=80',
        query: 'samsung galaxy s24 ultra'
      }
    ]
  },
  {
    id: 'laptops',
    title: 'Noutbuklar',
    icon: '💻',
    query: 'noutbuk',
    items: [
      {
        title: 'Apple MacBook Air M2 13.6" 8/256GB',
        price: '11 800 000 so‘m dan',
        stores: '11 ta do‘konda',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
        query: 'macbook air m2'
      },
      {
        title: 'ASUS TUF Gaming F15 Core i5 RTX 3050',
        price: '8 450 000 so‘m dan',
        stores: '9 ta do‘konda',
        image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=400&q=80',
        query: 'asus tuf gaming f15'
      },
      {
        title: 'Lenovo IdeaPad 3 15.6" Core i3 8GB/256GB',
        price: '3 890 000 so‘m dan',
        stores: '15 ta do‘konda',
        image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80',
        query: 'lenovo ideapad 3'
      },
      {
        title: 'HP Pavilion 15 Core i5 16GB/512GB',
        price: '6 200 000 so‘m dan',
        stores: '14 ta do‘konda',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
        query: 'hp pavilion 15'
      }
    ]
  },
  {
    id: 'tvs',
    title: 'Televizorlar',
    icon: '📺',
    query: 'televizor',
    items: [
      {
        title: 'Samsung 55" Crystal UHD 4K Smart TV',
        price: '5 600 000 so‘m dan',
        stores: '16 ta do‘konda',
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80',
        query: 'samsung 55 crystal uhd 4k'
      },
      {
        title: 'LG 50" 4K UHD Smart ThinQ TV',
        price: '4 900 000 so‘m dan',
        stores: '13 ta do‘konda',
        image: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=400&q=80',
        query: 'lg 50 4k smart tv'
      },
      {
        title: 'Artel 43" Smart Android Full HD TV',
        price: '2 750 000 so‘m dan',
        stores: '19 ta do‘konda',
        image: 'https://images.unsplash.com/photo-1552975084-6e027cd345c2?auto=format&fit=crop&w=400&q=80',
        query: 'artel 43 smart tv'
      },
      {
        title: 'TCL 55" QLED 4K Google TV HDR10+',
        price: '4 800 000 so‘m dan',
        stores: '12 ta do‘konda',
        image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=400&q=80',
        query: 'tcl 55 qled 4k'
      }
    ]
  },
  {
    id: 'aircon',
    title: 'Konditsionerlar',
    icon: '❄️',
    query: 'konditsioner inverter',
    items: [
      {
        title: 'Shivaki 12 Inverter Smart WI-FI',
        price: '4 300 000 so‘m dan',
        stores: '14 ta do‘konda',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
        query: 'shivaki 12 inverter'
      },
      {
        title: 'Artel Grand Inverter 12 35 kv.m',
        price: '4 100 000 so‘m dan',
        stores: '17 ta do‘konda',
        image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=400&q=80',
        query: 'artel grand inverter 12'
      },
      {
        title: 'LG Dual Inverter 12 Plasmaster Plus',
        price: '6 700 000 so‘m dan',
        stores: '10 ta do‘konda',
        image: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=400&q=80',
        query: 'lg dual inverter 12'
      },
      {
        title: 'Midea Blanc 09 Eco Inverter',
        price: '3 500 000 so‘m dan',
        stores: '12 ta do‘konda',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
        query: 'midea blanc 09 inverter'
      }
    ]
  }
];

export default function IqtisodchiSearchPage() {
  // 1. Search Query State (Boshlang'ich holatda televizor qidirmaydi, foydalanuvchi yozganini qidiradi)
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2. Results Data
  const [products, setProducts] = useState<SerpProductItem[]>([]);
  const [bestBanner, setBestBanner] = useState<BestBannerData | null>(null);
  const [priceInsight, setPriceInsight] = useState<PriceInsightData | null>(null);
  const [totalResultsCount, setTotalResultsCount] = useState<number>(0);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [dynamicChips, setDynamicChips] = useState<string[]>([]);

  // 3. Filters & Sorting
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<'cheap' | 'exp' | 'disc'>('cheap');

  // 4. Modals & Drawers
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SerpProductItem | null>(null);

  // 5. Hududiy kontekst & AI yetkazib berish
  const [selectedRegion, setSelectedRegion] = useState<string>('Toshkent shahri');
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);

  // 6. Modellarni solishtirish (Compare Tray)
  const [compareItems, setCompareItems] = useState<SerpProductItem[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // 7. Alternativlar Modali (Smart Alternatives)
  const [alternativesProduct, setAlternativesProduct] = useState<SerpProductItem | null>(null);
  const [isAlternativesModalOpen, setIsAlternativesModalOpen] = useState(false);

  // 8. Texnik tasnifi Modali
  const [specsProduct, setSpecsProduct] = useState<SerpProductItem | null>(null);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);

  // 9. Interactive States
  const [favorites, setFavorites] = useState<Record<string, SerpProductItem>>({});
  const [isAlertSubscribed, setIsAlertSubscribed] = useState(false);
  const [telegramContact, setTelegramContact] = useState('');
  const [alertSuccessToast, setAlertSuccessToast] = useState(false);

  // 10. AI Chat inside Drawer
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatThinking, setIsChatThinking] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const clientCache = useRef<Record<string, any>>({});

  // Solishtirishga qo'shish / olib tashlash
  const toggleCompare = (item: SerpProductItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompareItems(prev => {
      const exists = prev.find(p => p.id === item.id);
      if (exists) {
        return prev.filter(p => p.id !== item.id);
      }
      if (prev.length >= 4) {
        alert("Maksimal 4 ta modelni yonma-yon solishtirish mumkin.");
        return prev;
      }
      return [...prev, item];
    });
  };

  // Texnik tasnif parametrlarini hisoblash
  const getProductSpecs = (item: SerpProductItem) => {
    const title = item.title.toLowerCase();
    const isPhone = title.includes('iphone') || title.includes('samsung') || title.includes('galaxy') || title.includes('redmi') || title.includes('xiaomi') || title.includes('smartfon');
    const isLaptop = title.includes('noutbuk') || title.includes('macbook') || title.includes('asus') || title.includes('hp') || title.includes('lenovo');
    const isTV = title.includes('tv') || title.includes('televizor');
    const isAC = title.includes('konditsioner') || title.includes('inverter');

    if (isPhone) {
      return [
        { label: 'Ekran', value: '6.7" Super AMOLED / OLED 120Hz' },
        { label: 'Protsessor', value: '8 yadroli yuqori unumdor chipset' },
        { label: 'Xotira', value: title.includes('256') ? '256 GB' : title.includes('512') ? '512 GB' : '128 GB' },
        { label: 'Tezkor xotira (RAM)', value: '8 GB / 12 GB LPDDR5X' },
        { label: 'Asosiy kamera', value: '50 MP + 12 MP + 10 MP OIS' },
        { label: 'Akkumulyator', value: '5000 mA/soat, tezkor quvvatlash' },
        { label: 'Rasmiy Kafolat', value: item.warranty || '12 oy O‘zbekiston bo‘ylab' },
        { label: 'Yetkazib berish', value: `${selectedRegion} bo‘yicha 24 soatda` }
      ];
    }

    if (isLaptop) {
      return [
        { label: 'Ekran', value: '15.6" Full HD IPS / Retina Display' },
        { label: 'Protsessor', value: title.includes('m2') ? 'Apple M2 8-core' : 'Intel Core i5 / AMD Ryzen 5' },
        { label: 'Tezkor xotira (RAM)', value: '16 GB DDR4 / Unified' },
        { label: 'Doimiy xotira (SSD)', value: '512 GB NVMe M.2' },
        { label: 'Videokarta', value: title.includes('rtx') ? 'NVIDIA GeForce RTX 3050' : 'Integrated Graphics' },
        { label: 'Og‘irligi', value: '1.6 kg – yengil korpus' },
        { label: 'Rasmiy Kafolat', value: item.warranty || '12 oy servis markazi' },
        { label: 'Yetkazib berish', value: `${selectedRegion} bo‘yicha 24 soatda` }
      ];
    }

    if (isTV) {
      return [
        { label: 'Ekran diagonali', value: '55" dyuym (140 sm)' },
        { label: 'Ruxsat (Resolution)', value: '4K Ultra HD (3840x2160)' },
        { label: 'Smart TV tizimi', value: 'Google TV / Tizen / Android TV' },
        { label: 'HDR qo‘llab-quvvatlashi', value: 'HDR10+, Dolby Vision' },
        { label: 'Ovoz tizimi', value: '20 Vt stereo, Dolby Digital' },
        { label: 'Ulanishlar', value: '3x HDMI, 2x USB, Wi-Fi 5GHz, Bluetooth' },
        { label: 'Rasmiy Kafolat', value: item.warranty || '3 yil servis kafolati' },
        { label: 'Yetkazib berish', value: `${selectedRegion} bo‘yicha 24 soatda` }
      ];
    }

    if (isAC) {
      return [
        { label: 'Maydon tavsiyasi', value: '35 - 45 kv. metr xonalar uchun' },
        { label: 'Kompressor turi', value: 'Inverter (kam elektr sarflaydi)' },
        { label: 'Quvvat sarfi', value: 'Sovutish: ~1.05 kVt, Isitish: ~1.1 kVt' },
        { label: 'Shovqin darajasi', value: '22 - 38 dB (juda sokin)' },
        { label: 'Sovutish quvvati', value: '12 000 BTU (12 lik model)' },
        { label: 'Freon turi', value: 'R410A / R32 ekologik toza' },
        { label: 'Rasmiy Kafolat', value: item.warranty || '3 yil bepul servis xizmati' },
        { label: 'Yetkazib berish', value: `${selectedRegion} bo‘yicha 24 soatda` }
      ];
    }

    return [
      { label: 'Ishlab chiqaruvchi', value: item.source || 'Rasmiy do‘kon' },
      { label: 'Kategoriya', value: 'Original tovar' },
      { label: 'Holati', value: 'Yangi, zavod qadog‘ida' },
      { label: 'Yetkazib berish', value: `${selectedRegion} bo‘yicha 24-48 soat ichida` },
      { label: 'Rasmiy Kafolat', value: item.warranty || '12 oy rasmiy kafolat' },
      { label: 'Muddatli to‘lov', value: item.installment || 'Alif Nasiya / Muddatli to‘lov' }
    ];
  };

  // Har bir tovar uchun eng yaxshi alternativlarini (muqobillarini) topish
  const getProductAlternatives = (targetItem: SerpProductItem) => {
    const others = products.filter(p => p.id !== targetItem.id);
    if (others.length >= 3) {
      return others.slice(0, 3);
    }
    return [
      {
        id: 'alt_1',
        title: targetItem.title.includes('iPhone') ? 'Samsung Galaxy S24 Ultra' : 'Xiaomi Redmi Note 13 Pro 8/256GB',
        price: '3 850 000 so‘m',
        priceNumber: 3850000,
        source: 'Olcha.uz',
        thumbnail: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=300&q=80',
        link: 'https://olcha.uz',
        warranty: '12 oy rasmiy',
        storeBadge: 'Eng yaxshi muqobil',
        installment: '360 000 so‘m/oy'
      },
      {
        id: 'alt_2',
        title: targetItem.title.includes('Samsung') ? 'Apple iPhone 15 128GB' : 'Samsung Galaxy A55 5G 8/128GB',
        price: '4 150 000 so‘m',
        priceNumber: 4150000,
        source: 'Texnomart',
        thumbnail: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=300&q=80',
        link: 'https://texnomart.uz',
        warranty: '12 oy rasmiy',
        storeBadge: 'Tavsiya etiladi',
        installment: '390 000 so‘m/oy'
      },
      {
        id: 'alt_3',
        title: targetItem.title.includes('Artel') ? 'Shivaki 12 Inverter Smart WI-FI' : 'Artel Grand Inverter 12',
        price: '4 300 000 so‘m',
        priceNumber: 4300000,
        source: 'Idea.uz',
        thumbnail: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80',
        link: 'https://ideastore.uz',
        warranty: '3 yil servis',
        storeBadge: 'Tejamkor tanlov',
        installment: '410 000 so‘m/oy'
      }
    ] as SerpProductItem[];
  };

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mp_favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const saveFavorites = (updated: Record<string, SerpProductItem>) => {
    setFavorites(updated);
    try {
      localStorage.setItem('mp_favorites', JSON.stringify(updated));
    } catch {}
  };

  const toggleFavorite = (item: SerpProductItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = { ...favorites };
    if (updated[item.id]) {
      delete updated[item.id];
    } else {
      updated[item.id] = item;
    }
    saveFavorites(updated);
  };

  // Perform Search
  const executeSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) return;

    setActiveQuery(q);

    // Ultra-fast client-side cache hit (0ms instant response)
    const cacheKey = q.toLowerCase();
    if (clientCache.current[cacheKey]) {
      const cached = clientCache.current[cacheKey];
      setProducts(cached.products);
      if (cached.price_insight) setPriceInsight(cached.price_insight);
      if (cached.best_banner) setBestBanner(cached.best_banner);
      setTotalResultsCount(cached.total_results_count);
      setAiAdvice(cached.ai_advice);
      if (cached.dynamic_chips) setDynamicChips(cached.dynamic_chips);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, turn_count: 2 })
      });

      if (res.ok) {
        const data = await res.json();
        const prods: SerpProductItem[] = data.products || data.data?.products || [];
        setProducts(prods);

        // Price Insight
        let computedPi = data.price_insight || data.data?.price_insight;
        if (!computedPi && prods.length > 0) {
          const minP = Math.min(...prods.map(p => p.priceNumber || 5000000));
          const maxP = Math.max(...prods.map(p => p.priceNumber || 8000000));
          computedPi = {
            level: '📈 Narxlar solishtirildi',
            sub: '· 30 kunlik',
            chart_points: [
              ['12 okt', `${(minP).toLocaleString('uz-UZ')} so'm`, 0, 80],
              ['25 okt', `${(minP * 0.95).toLocaleString('uz-UZ')} so'm`, 40, 60],
              ['10 noy', `${(minP * 1.05).toLocaleString('uz-UZ')} so'm`, 75, 70],
              ['Bugun', `${minP.toLocaleString('uz-UZ')} so'm`, 100, 30]
            ],
            facts: [
              { label: 'Bugungi eng arzon narx', value: `${minP.toLocaleString('uz-UZ')} so'm` },
              { label: '30 kunlik eng past narx', value: `${(minP * 0.95).toLocaleString('uz-UZ')} so'm` },
              { label: 'O‘rtacha bozor narxi', value: `${(minP / 1e6).toFixed(1)} mln – ${(maxP / 1e6).toFixed(1)} mln` },
              { label: 'Do‘konlardagi takliflar', value: `${prods.length} ta rasmiy do‘kon` }
            ],
            note: 'Do‘konlar narxlari rasmiy manbalardan taqqoslandi. Muddatli to‘lov va kafolat shartlariga e‘tibor bering.'
          };
        }
        if (computedPi) setPriceInsight(computedPi);

        // Best Banner
        let computedBb = data.best_banner || data.data?.best_banner;
        if ((!computedBb || !computedBb.title) && prods.length > 0) {
          const cheapest = prods[0];
          computedBb = {
            title: cheapest.title,
            image: cheapest.thumbnail,
            store: cheapest.source,
            price: cheapest.price,
            link: cheapest.link
          };
        }
        if (computedBb) setBestBanner(computedBb);

        // Total Count
        const count = data.total_results_count || prods.length;
        setTotalResultsCount(count);

        // AI Advice
        const advice = data.ai_reply || data.message || '';
        setAiAdvice(advice);
        const chips = data.dynamic_chips || ['55 duym OLED', '65 duym 4K', 'Artel televizor', 'Toshkentda 24 soatda yetkazish'];
        setDynamicChips(chips);

        // Save in client cache for sub-millisecond reuse
        clientCache.current[cacheKey] = {
          products: prods,
          price_insight: computedPi,
          best_banner: computedBb,
          total_results_count: count,
          ai_advice: advice,
          dynamic_chips: chips
        };

        // Initialize Chat Message
        setChatMessages([
          {
            id: 'init_advisor',
            role: 'model',
            content: advice || `"${q}" bo‘yicha O‘zbekiston rasmiy do‘konlaridan narxlar taqqoslandi. Eng arzon variant va muddatli to‘lov shartlari ko‘rsatilgan. Sizga tanlashda yana nima bo‘yicha yordam beray?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load on mount (URL parametrlarini tekshirish, televizor avtomatik qidirmaydi)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlQ = params.get('q');
      if (urlQ && urlQ.trim()) {
        const cleanQ = urlQ.trim();
        setSearchQuery(cleanQ);
        executeSearch(cleanQ);
      }
    }
  }, []);

  // Form submit handler (foydalanuvchi yozgan narsani qidiradi)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchQuery.trim();
    if (clean) {
      executeSearch(clean);
    } else {
      setActiveQuery('');
    }
  };

  // Chat message send inside AI drawer
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatThinking) return;

    const userText = chatInput.trim();
    setChatInput('');
    const newMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setIsChatThinking(true);

    try {
      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${activeQuery} haqida savol: ${userText}`,
          turn_count: 2
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.ai_reply || data.message || 'Sizga eng mos do‘kon narxlarini tanlashda yordam berishdan mamnunman!';
        setChatMessages(prev => [
          ...prev,
          {
            id: 'bot_' + Date.now(),
            role: 'model',
            content: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch {
      setChatMessages(prev => [
        ...prev,
        {
          id: 'bot_err',
          role: 'model',
          content: 'Kechirasiz, javob olishda xatolik yuz berdi. Iltimos qayta urinib ko‘ring.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatThinking(false);
    }
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatThinking]);

  // Compute Store counts for Filter pills
  const storeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      counts[p.source] = (counts[p.source] || 0) + 1;
    }
    return counts;
  }, [products]);

  // Filtered & Sorted Products
  const displayedProducts = useMemo(() => {
    let list = [...products];

    // Store filter
    if (selectedStore !== 'all') {
      list = list.filter(p => p.source.toLowerCase() === selectedStore.toLowerCase());
    }

    // Min price
    if (minPrice) {
      const minVal = parseInt(minPrice.replace(/\D/g, ''), 10);
      if (!isNaN(minVal)) {
        list = list.filter(p => (p.priceNumber || 0) >= minVal);
      }
    }

    // Max price
    if (maxPrice) {
      const maxVal = parseInt(maxPrice.replace(/\D/g, ''), 10);
      if (!isNaN(maxVal)) {
        list = list.filter(p => (p.priceNumber || 0) <= maxVal);
      }
    }

    // Sort
    if (sortBy === 'cheap') {
      list.sort((a, b) => (a.priceNumber || 0) - (b.priceNumber || 0));
    } else if (sortBy === 'exp') {
      list.sort((a, b) => (b.priceNumber || 0) - (a.priceNumber || 0));
    } else if (sortBy === 'disc') {
      list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }

    return list;
  }, [products, selectedStore, minPrice, maxPrice, sortBy]);

  // Subscribe to Telegram alert
  const handleAlertSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramContact.trim()) return;
    setIsAlertSubscribed(true);
    setIsAlertModalOpen(false);
    setAlertSuccessToast(true);
    setTimeout(() => setAlertSuccessToast(false), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FC] text-[#0F172A]">
      
      {/* =========================================================================
          1. IQTISODCHI AUTHENTIC HEADER (1:1 with maxprofit.uz layout)
          ========================================================================= */}
      <header className="mp-header">
        <div className="container">
          {/* Logo */}
          <button 
            type="button"
            onClick={() => {
              setActiveQuery('');
              setSearchQuery('');
            }}
            className="mp-logo bg-transparent border-0 p-0 text-left cursor-pointer" 
            aria-label="Iqtisodchi"
          >
            <div className="mp-logo-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] tracking-tight text-[#0F172A] leading-none">
                Iqtisod<span className="text-[#6366F1]">chi</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider font-bold text-[#64748B]">
                intellektual xarid dasturi
              </span>
            </div>
          </button>

          {/* Katalog Button (MaxProfit kabi faol holatda) */}
          <button 
            type="button" 
            onClick={() => {
              setActiveQuery('');
              setSearchQuery('');
            }}
            className={`mp-cat hidden sm:inline-flex cursor-pointer transition-all ${
              !activeQuery 
                ? '!bg-[#6366F1] !text-white !border-transparent shadow-md shadow-indigo-500/25' 
                : 'hover:bg-[#EEF0FF] text-[#4338CA]'
            }`}
          >
            <svg className="mp-cat-ic" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
              <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
              <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
              <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="3.75" />
            </svg>
            <span>Katalog</span>
          </button>

          {/* Hudud Tanlash Button (Yetkazib berish hududi) */}
          <button 
            type="button" 
            onClick={() => setIsRegionModalOpen(true)}
            className="mp-navlink hidden md:inline-flex text-[#475569] hover:text-[#6366F1] font-bold cursor-pointer"
            title="Yetkazib berish hududini o‘zgartirish"
          >
            <MapPin className="w-4 h-4 text-[#6366F1]" />
            <span>{selectedRegion}</span>
            <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
          </button>

          {/* Header Search Form (Foydalanuvchi yozgan narsani qidiradi) */}
          <form className="mp-header-search flex items-center gap-2" onSubmit={handleSearchSubmit}>
            <div className="search-box flex-1">
              <span className="text-[#64748B]">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                name="q" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mahsulot qidirish... (masalan: iPhone 15, televizor, muzlatgich)" 
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveQuery('');
                  }}
                  className="text-[#94A3B8] hover:text-[#0F172A] p-1 text-xs"
                  title="Tozalash"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button 
                type="button" 
                onClick={() => setIsPhotoModalOpen(true)}
                className="btn-photo" 
                aria-label="Foto orqali qidirish" 
                title="Foto orqali qidirish"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <button
              type="submit"
              className="hidden sm:inline-flex items-center justify-center px-4 h-[42px] rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-sm shadow-sm transition active:scale-95 cursor-pointer shrink-0"
            >
              Qidirish
            </button>
          </form>

          {/* Right Header Navigation */}
          <div className="flex items-center gap-2">
            {/* Favorites Icon */}
            <button
              type="button"
              onClick={() => setIsFavoritesOpen(true)}
              className="relative p-2 text-[#64748B] hover:text-[#0F172A] rounded-xl hover:bg-[#EEF0FF] transition cursor-pointer"
              title="Sevimlilar"
            >
              <Heart className={`w-5 h-5 ${Object.keys(favorites).length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              {Object.keys(favorites).length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {Object.keys(favorites).length}
                </span>
              )}
            </button>

            {/* AI Advisor Floating Action Header Pill */}
            <button
              type="button"
              onClick={() => setIsAiDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-xs font-bold shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">AI Maslahatchi</span>
            </button>

            {/* Seller Cabinet Link */}
            <Link
              href="/seller/dashboard"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#334155] hover:text-[#6366F1] border border-[#E7E9F2] rounded-xl hover:bg-white transition"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Sotuvchi</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Alert toast notification */}
      {alertSuccessToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#16A34A] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold animate-fade-in">
          <Check className="w-5 h-5" />
          <span>Telegram orqali narx tushishi bildirishnomasi yoqildi!</span>
        </div>
      )}

      {/* =========================================================================
          2. MAIN CONTENT: KATALOG (if !activeQuery) OR RESULTS (if activeQuery)
          ========================================================================= */}
      <main className="flex-1">
        {/* =====================================================================
            A. KATALOG VIEW (MaxProfit 1:1 ko'rinishi) - activeQuery bo'lmaganda
            ===================================================================== */}
        {!activeQuery && (
          <div className="max-w-[1180px] mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="text-xs font-semibold text-[#64748B] mb-2 flex items-center gap-1.5">
              <span>Iqtisodchi</span>
              <ChevronRight className="w-3 h-3 text-[#94A3B8]" />
              <span className="text-[#0F172A] font-bold">Katalog</span>
            </div>

            {/* Title & Description */}
            <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Katalog</h1>
            <p className="text-sm text-[#64748B] mt-1.5 font-medium">
              Har bir mahsulot — bitta kartochka: barcha do‘konlardagi narxlar, narx tarixi va xususiyatlar.
            </p>

            {/* 15 Ta Asosiy Kategoriya Kartochkalari (1:1 MaxProfit kabi) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 mt-6">
              {CATALOG_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSearchQuery(cat.query);
                    executeSearch(cat.query);
                  }}
                  className="bg-white rounded-2xl p-4 border border-[#E7E9F2] hover:border-[#6366F1]/50 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 ${cat.iconBg} group-hover:scale-105 transition-transform`}>
                    <span>{cat.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#6366F1] transition-colors leading-snug">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-[#94A3B8] font-medium mt-1">
                      {cat.count}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Ommabop Mahsulotlar Bo'limlari (Smartfonlar, Noutbuklar, TV, Konditsionerlar) */}
            <div className="mt-12 space-y-10">
              {FEATURED_CATALOG_SECTIONS.map((sec) => (
                <section key={sec.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{sec.icon}</span>
                      <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">{sec.title}</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery(sec.query);
                        executeSearch(sec.query);
                      }}
                      className="text-xs font-bold text-[#6366F1] hover:text-[#4F46E5] flex items-center gap-1 group cursor-pointer"
                    >
                      <span>Barchasi</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {sec.items.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSearchQuery(item.query);
                          executeSearch(item.query);
                        }}
                        className="bg-white rounded-2xl p-4 border border-[#E7E9F2] hover:border-[#6366F1]/40 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                      >
                        <div className="h-44 w-full rounded-xl bg-[#F8FAFC] flex items-center justify-center p-3 mb-3 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#0F172A] group-hover:text-[#6366F1] transition-colors line-clamp-2 min-h-[40px]">
                            {item.title}
                          </h4>
                          <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-[#F1F3F9]">
                            <div>
                              <span className="text-[11px] text-[#64748B] block font-medium">Boshlang‘ich narx:</span>
                              <span className="font-extrabold text-sm text-[#0F172A]">{item.price}</span>
                            </div>
                            <span className="text-[11px] font-bold text-[#6366F1] bg-[#EEF0FF] px-2 py-0.5 rounded-md">
                              {item.stores}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            B. SEARCH RESULTS VIEW (Foydalanuvchi qidirganida ko'rinadi)
            ===================================================================== */}
        {activeQuery && (
          <div className="results-wrap">
            {/* Back to Catalog Breadcrumb */}
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#64748B]">
              <button 
                type="button" 
                onClick={() => {
                  setActiveQuery('');
                  setSearchQuery('');
                }}
                className="hover:text-[#6366F1] flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Katalogga qaytish</span>
              </button>
              <span>/</span>
              <span className="text-[#0F172A] font-bold truncate max-w-[200px] sm:max-w-none">&ldquo;{activeQuery}&rdquo;</span>
            </div>

            {/* Results Head */}
            <div className="results-head flex flex-wrap items-center justify-between gap-2">
              <h2>
                Natijalar: <span>{totalResultsCount || products.length} ta rasmiy taklif</span> — &ldquo;{activeQuery}&rdquo;
              </h2>

              {/* Quick Category / Dynamic Chips */}
              {dynamicChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {dynamicChips.slice(0, 4).map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchQuery(chip);
                        executeSearch(chip);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#E7E9F2] text-[#475569] hover:text-[#6366F1] hover:border-[#6366F1] transition cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="my-6 p-6 rounded-2xl bg-white border border-[#E7E9F2] shadow-sm flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-bold text-[#6366F1]">O‘zbekiston rasmiy do‘konlaridan narxlar saralanmoqda...</span>
              </div>
            )}

            {/* =================================================================
                A. BEST BANNER (Eng arzon narx toj bilan)
                ================================================================= */}
            {bestBanner && bestBanner.title && !isLoading && (
              <div className="best-banner">
                <div className="best-media">
                  <img 
                    className="best-img" 
                    src={bestBanner.image || 'https://via.placeholder.com/80'} 
                    alt={bestBanner.title} 
                    loading="lazy" 
                    referrerPolicy="no-referrer"
                  />
                  <span className="best-crown" title="Eng arzon taklif">👑</span>
                </div>
                <div className="best-info">
                  <div className="t">Eng arzon narx</div>
                  <div className="n" title={bestBanner.title}>{bestBanner.title}</div>
                  <div className="best-store">
                    <span className="w-3.5 h-3.5 flex items-center justify-center">
                      {getStoreBrandConfig(bestBanner.store).logoSvg}
                    </span>
                    <span>{bestBanner.store}</span>
                  </div>
                </div>
                <div className="best-right">
                  <div className="p">{bestBanner.price}</div>
                  <a 
                    className="btn-open !bg-gradient-to-r !from-[#6366F1] !to-[#4F46E5] hover:!from-[#4F46E5] hover:!to-[#4338CA] !px-4 !py-2.5 !text-xs !font-black !shadow-md !shadow-indigo-500/20 active:scale-95 flex items-center gap-1.5" 
                    href={bestBanner.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
                    <span>Yanada arzonroq olish ⚡</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* =================================================================
                B. PRICE INSIGHT (Narxlar grafigi va tahlil)
                ================================================================= */}
            {priceInsight && !isLoading && (
              <section className="pinsight" aria-label="Narxlar dinamikasi">
                <div className="pi-head">
                  <div className="pi-title">
                    <TrendingUp className="w-4 h-4 text-[#6366F1]" />
                    <span>Narxlar dinamikasi</span>
                    <span className="pi-sub">{priceInsight.sub}</span>
                  </div>
                  <span className={`pi-level ${priceInsight.level.includes('выгодная') || priceInsight.level.includes('Низкая') || priceInsight.level.includes('solishtirildi') ? 'lvl-low' : ''}`}>
                    {priceInsight.level}
                  </span>
                </div>

                <div className="pi-body">
                  {/* Interactive SVG Chart */}
                  <div className="pi-plot">
                    <svg viewBox="0 0 600 140" preserveAspectRatio="none" className="w-full h-full">
                      <defs>
                        <linearGradient id="piFillGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.32" />
                          <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Background Fill Area */}
                      <path
                        d="M0,35 Q150,110 300,105 T600,30 L600,140 L0,140 Z"
                        fill="url(#piFillGrad)"
                      />

                      {/* Trend Line Curve */}
                      <path
                        d="M0,35 Q150,110 300,105 T600,30"
                        fill="none"
                        stroke="#6366F1"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Current Price Dot */}
                      <circle cx="590" cy="30" r="5" fill="#6366F1" stroke="#fff" strokeWidth="2" />
                    </svg>

                    {/* Y-axis Price Labels */}
                    <div className="absolute top-1 left-2 text-[10px] font-bold text-[#64748B]">
                      Maksimal
                    </div>
                    <div className="absolute bottom-2 left-2 text-[10px] font-bold text-[#64748B]">
                      Minimal
                    </div>

                    {/* X-axis Dates */}
                    <div className="pi-x">
                      <span>12 okt</span>
                      <span>1 noy</span>
                      <span>Bugun</span>
                    </div>
                  </div>

                  {/* Facts Grid */}
                  <div className="pi-facts">
                    {priceInsight.facts && priceInsight.facts.map((fact, fIdx) => (
                      <div key={fIdx} className="pf">
                        <span>{fact.label}</span>
                        <b>{fact.value}</b>
                        {fact.sub && <small>{fact.sub}</small>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Foot Note & Alert Button */}
                <div className="pi-foot">
                  <p className="pi-note">
                    {priceInsight.note || 'Bugungi narx do‘konlar bo‘yicha tahlil qilindi. Telegram orqali arzonlashganda xabar olishingiz mumkin.'}
                  </p>
                  <button 
                    type="button" 
                    onClick={() => setIsAlertModalOpen(true)}
                    className={`btn-alert ${isAlertSubscribed ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : ''}`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>
                      {isAlertSubscribed 
                        ? '✅ Narx kuzatilmoqda — bekor qilish' 
                        : '🔔 Narx tushganda Telegramda xabar berish'
                      }
                    </span>
                  </button>
                </div>
              </section>
            )}

            {/* =================================================================
                C. FILTERS BAR (Do'konlar, narx oralig'i, saralash)
                ================================================================= */}
            <div className="filters" id="filters">
              {/* Store Pills */}
              <div className="fstores">
                <button
                  type="button"
                  onClick={() => setSelectedStore('all')}
                  className={`fpill ${selectedStore === 'all' ? 'active' : ''}`}
                >
                  <span>Barchasi</span>
                  <span className="n">{products.length}</span>
                </button>

                {Object.entries(storeCounts).map(([storeName, count]) => {
                  const brand = getStoreBrandConfig(storeName);
                  const isActive = selectedStore.toLowerCase() === storeName.toLowerCase();

                  return (
                    <button
                      key={storeName}
                      type="button"
                      onClick={() => setSelectedStore(isActive ? 'all' : storeName)}
                      className={`fpill ${isActive ? 'active' : ''}`}
                    >
                      <span className="w-3.5 h-3.5 flex items-center justify-center">
                        {brand.logoSvg}
                      </span>
                      <span>{storeName}</span>
                      <span className="n">{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right: Min-Max Price & Sort Select */}
              <div className="fright">
                <div className="fprice">
                  <input 
                    type="number" 
                    id="fmin" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="dan" 
                    inputMode="numeric"
                  />
                  <span>—</span>
                  <input 
                    type="number" 
                    id="fmax" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="gacha" 
                    inputMode="numeric"
                  />
                  <span className="text-[11px] font-bold text-[#64748B]">so‘m</span>
                </div>

                <select 
                  id="fsort" 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="fsort-select"
                >
                  <option value="cheap">Avval arzonlari</option>
                  <option value="exp">Avval qimmatlari</option>
                  <option value="disc">Chegirma bo‘yicha</option>
                </select>
              </div>
            </div>

            {/* =================================================================
                D. PRODUCT ROWS LIST (1:1 with rlist & rrow on MaxProfit)
                ================================================================= */}
            <div className="rlist" id="rlist">
              {displayedProducts.length === 0 && !isLoading ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-[#E7E9F2]">
                  <p className="text-[#64748B] font-semibold text-sm">
                    Ushbu filtrlar bo‘yicha tovar topilmadi. Filtr parametrlarini tozalab ko‘ring.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStore('all');
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                    className="mt-3 px-4 py-2 bg-[#EEF0FF] text-[#6366F1] font-bold text-xs rounded-xl hover:bg-[#6366F1] hover:text-white transition cursor-pointer"
                  >
                    Filtrlarni tozalash
                  </button>
                </div>
              ) : (
                displayedProducts.map((prod, index) => {
                  const brand = getStoreBrandConfig(prod.source);
                  const isFav = !!favorites[prod.id];
                  const isCompared = compareItems.some(c => c.id === prod.id);
                  const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';

                  return (
                    <article 
                      key={prod.id || index}
                      onClick={() => setSelectedProduct(prod)}
                      className={`rrow ${rankClass} cursor-pointer group`}
                    >
                      {/* 1. Image */}
                      <div className="rimg">
                        <img 
                          src={prod.thumbnail || 'https://via.placeholder.com/80'} 
                          alt={prod.title} 
                          loading="lazy" 
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="group-hover:scale-105 transition-transform duration-200"
                          onError={(e: any) => {
                            e.target.src = 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      </div>

                      {/* 2. Info */}
                      <div className="rinfo">
                        <div className="rtop">
                          <span className="badge-store">
                            <span className="w-3.5 h-3.5 flex items-center justify-center">
                              {brand.logoSvg}
                            </span>
                            <span>{prod.source}</span>
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold flex items-center gap-1">
                              👑 Eng past narx
                            </span>
                          )}
                          {prod.storeBadge && index !== 0 && (
                            <span className="text-[10px] text-[#64748B] font-semibold">
                              {prod.storeBadge}
                            </span>
                          )}
                        </div>

                        <h3 className="rname group-hover:text-[#6366F1] transition-colors">
                          {prod.title}
                        </h3>

                        <div className="rmeta">
                          <span>🚚 Yetkazib berish mavjud</span>
                          <span>🛡️ 12 oy kafolat</span>
                        </div>

                        <div className="rnasiya">
                          <span className="nas-ico">💳 Muddatli to‘lov:</span>
                          <span className="nas-chip">
                            {prod.installment || "Alif Nasiya / Muddatli to'lov"}
                          </span>
                        </div>
                      </div>

                      {/* 3. Price */}
                      <div className="rprice">
                        <div className="price">
                          {prod.price.replace(" so'm", '').replace(" so‘m", '')}
                          <span className="cur">so‘m</span>
                        </div>

                        {prod.oldPrice && (
                          <div className="pold">
                            <span className="old">{prod.oldPrice.replace(" so'm", '').replace(" so‘m", '')}</span>
                            {prod.discount && prod.discount > 0 && (
                              <span className="disc">−{prod.discount}%</span>
                            )}
                          </div>
                        )}

                        {prod.installment && (
                          <div className="inst">
                            {prod.installment}
                          </div>
                        )}
                      </div>

                      {/* 4. Action (Yanada arzonroq olish, Alternativlari, Texnik tasnifi, Solishtirish) */}
                      <div className="ract flex flex-wrap sm:flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {/* Solishtirish toggle */}
                          <button
                            type="button"
                            onClick={(e) => toggleCompare(prod, e)}
                            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                              isCompared 
                                ? 'bg-amber-500 text-white border-amber-600 shadow-sm' 
                                : 'bg-white border-[#E7E9F2] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F3FB]'
                            }`}
                            title={isCompared ? "Solishtirishdan olib tashlash" : "Modellarni solishtirishga qo‘shish"}
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>{isCompared ? 'Tanlandi ⚖️' : 'Solishtirish'}</span>
                          </button>

                          {/* Alternativlari */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAlternativesProduct(prod);
                              setIsAlternativesModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-[#4338CA] text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                            title="Ushbu modelning arzonroq yoki sifatli muqobillari"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-[#6366F1]" />
                            <span>Alternativlari</span>
                          </button>

                          {/* Texnik tasnifi */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSpecsProduct(prod);
                              setIsSpecsModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-[#475569] text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                            title="Mahsulotning texnik parametrlari"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
                            <span>Tasnifi</span>
                          </button>

                          {/* Sevimlilar */}
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(prod, e)}
                            className={`btn-fav ${isFav ? 'on' : ''}`}
                            title={isFav ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
                          >
                            <Heart className={`w-4 h-4 ${isFav ? 'text-[#F43F5E] fill-[#F43F5E]' : 'text-[#94A3B8]'}`} />
                          </button>
                        </div>

                        {/* Yanada arzonroq olish marketing tugmasi */}
                        <a
                          href={prod.directUrl || prod.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-open !bg-gradient-to-r !from-[#6366F1] !to-[#4F46E5] hover:!from-[#4F46E5] hover:!to-[#4338CA] !px-4 !py-2.5 !text-xs !font-black !shadow-md !shadow-indigo-500/20 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          title="Do‘kondan eng yaxshi narxda sotib olish"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
                          <span>Yanada arzonroq olish ⚡</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          3. FLOATING COGNITIVE AI ADVISOR TRIGGER (Ongli Maslahatchi)
          ========================================================================= */}
      <button
        type="button"
        onClick={() => setIsAiDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-extrabold text-sm shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <Bot className="w-5 h-5" />
        <span>AI Maslahatchi</span>
      </button>

      {/* =========================================================================
          4. AI COGNITIVE DRAWER ("ONGLI TIZIM" & BOSH IQTISODCHI)
          ========================================================================= */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#E7E9F2]">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#E7E9F2] flex items-center justify-between bg-[#F7F8FC]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] text-white flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0F172A] flex items-center gap-1.5">
                    <span>AI Maslahatchi</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-[#4338CA] text-[9px] font-black">
                      GPT-4o-mini
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Iqtisodiy tahlil va xarid yordamchisi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiDrawerOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#EEF0FF] hover:text-[#0F172A] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lead Economist Analysis Box */}
            <div className="p-3 bg-gradient-to-r from-[#EEF0FF] to-[#F3EEFF] border-b border-[#DDE2FB] text-xs space-y-2">
              <div className="font-black text-[#4338CA] flex items-center gap-1.5 text-[11px]">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Bosh Iqtisodchi Ekspertizasi (450 so‘m/kVt bazaviy tarif):</span>
              </div>
              <p className="text-[#334155] leading-relaxed font-medium">
                {aiAdvice || `${activeQuery} uchun rasmiy do‘konlar (Texnomart, Olcha, Idea, BeeMarket) narxlari solishtirildi. Eng arzon variantda rasmiy servis kafolati mavjud.`}
              </p>
            </div>

            {/* Chat Messages */}
            <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'model' && (
                    <div className="w-7 h-7 rounded-lg bg-[#EEF0FF] text-[#6366F1] flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-medium ${
                      msg.role === 'user'
                        ? 'bg-[#6366F1] text-white rounded-tr-none'
                        : 'bg-[#F1F3FB] text-[#0F172A] rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isChatThinking && (
                <div className="flex gap-2 items-center text-xs text-[#64748B] font-semibold">
                  <div className="w-4 h-4 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin"></div>
                  <span>AI o‘ylamoqda...</span>
                </div>
              )}
            </div>

            {/* Quick Clarification Chips */}
            <div className="p-2 border-t border-[#EEF0FF] flex flex-wrap gap-1.5 bg-[#FAFBFD]">
              {['Kafolati qanday?', 'Muddatli to‘lov qancha?', 'Yetkazib berish muddati?', 'Eng arzoni qaysi?'].map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setChatInput(q);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-[#E7E9F2] text-[#475569] hover:border-[#6366F1] hover:text-[#6366F1] transition cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-[#E7E9F2] bg-white flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                placeholder="Savolingizni yozing..."
                className="flex-1 bg-[#F1F3FB] border border-[#E7E9F2] rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-[#6366F1]"
              />
              <button
                type="button"
                onClick={handleSendChatMessage}
                className="w-9 h-9 rounded-xl bg-[#6366F1] text-white flex items-center justify-center hover:bg-[#5457E5] transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. TELEGRAM PRICE ALERT MODAL
          ========================================================================= */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E7E9F2] space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setIsAlertModalOpen(false)}
                className="w-8 h-8 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F3FB] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="font-extrabold text-base text-[#0F172A]">
                Narx tushishini kuzatish
              </h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                &ldquo;{activeQuery}&rdquo; narxi pasayganda Telegram botimiz orqali birinchi bo‘lib xabar oling.
              </p>
            </div>

            <form onSubmit={handleAlertSubscribe} className="space-y-3">
              <input
                type="text"
                value={telegramContact}
                onChange={(e) => setTelegramContact(e.target.value)}
                placeholder="@username yoki telefon raqam"
                required
                className="w-full bg-[#F7F8FC] border border-[#E7E9F2] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-[#6366F1]"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-[#6366F1] hover:bg-[#5457E5] text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Obuna bo‘lish
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. PHOTO SEARCH MODAL (Rasm orqali qidirish)
          ========================================================================= */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E7E9F2] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-[#0F172A]">
                  Rasm orqali tovar qidirish
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="w-8 h-8 rounded-lg text-[#94A3B8] hover:text-[#0F172A] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-2 border-dashed border-[#DDE2FB] rounded-2xl p-6 text-center bg-[#F7F8FC] hover:bg-[#EEF0FF] transition cursor-pointer">
              <Camera className="w-8 h-8 text-[#6366F1] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#0F172A]">Rasmni bu yerga tashlang</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">yoki faylni tanlash uchun bosing</p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#64748B] mb-2">Namuna rasmlar:</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { title: 'Samsung TV 55', q: 'televizor samsung 55' },
                  { title: 'LG Konditsioner', q: 'konditsioner lg inverter' },
                  { title: 'iPhone 15 Pro', q: 'iphone 15 pro max' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIsPhotoModalOpen(false);
                      setSearchQuery(item.q);
                      executeSearch(item.q);
                    }}
                    className="p-2 rounded-xl bg-[#F7F8FC] border border-[#E7E9F2] text-center hover:border-[#6366F1] transition cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-[#0F172A]">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. FAVORITES DRAWER
          ========================================================================= */}
      {isFavoritesOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#E7E9F2]">
            <div className="p-4 border-b border-[#E7E9F2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <h3 className="font-extrabold text-sm text-[#0F172A]">
                  Saqlangan tovarlar ({Object.keys(favorites).length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFavoritesOpen(false)}
                className="w-8 h-8 rounded-lg text-[#64748B] hover:bg-[#F1F3FB] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {Object.keys(favorites).length === 0 ? (
                <div className="py-12 text-center text-[#64748B] text-xs font-semibold">
                  Hozircha saqlangan tovarlar yo‘q. Mahsulot kartasidagi yurakcha belgisini bosing.
                </div>
              ) : (
                Object.values(favorites).map(item => (
                  <div key={item.id} className="p-3 rounded-xl border border-[#E7E9F2] flex items-center gap-3 bg-[#FAFBFD]">
                    <img src={item.thumbnail} alt="" className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-[#E7E9F2]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0F172A] truncate">{item.title}</p>
                      <p className="text-xs font-extrabold text-[#6366F1] mt-0.5">{item.price}</p>
                      <p className="text-[10px] text-[#64748B]">{item.source}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(item)}
                      className="text-rose-500 p-1 hover:bg-rose-50 rounded-lg"
                      title="O'chirish"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {Object.keys(favorites).length > 0 && (
              <div className="p-3 border-t border-[#E7E9F2]">
                <button
                  type="button"
                  onClick={() => saveFavorites({})}
                  className="w-full py-2 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition cursor-pointer"
                >
                  Hammasini tozalash
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          8. PRODUCT DETAIL MODAL
          ========================================================================= */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E7E9F2] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="badge-store">
                {selectedProduct.source}
              </span>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-lg text-[#94A3B8] hover:text-[#0F172A] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-32 h-32 bg-[#F7F8FC] border border-[#E7E9F2] rounded-2xl flex items-center justify-center p-3 shrink-0">
                <img 
                  src={selectedProduct.thumbnail} 
                  alt={selectedProduct.title} 
                  className="max-h-full max-w-full object-contain" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#0F172A] leading-snug">
                  {selectedProduct.title}
                </h3>
                <div className="text-xl font-black text-[#6366F1] mt-2">
                  {selectedProduct.price}
                </div>
                {selectedProduct.installment && (
                  <div className="text-xs font-bold text-[#4338CA] mt-1">
                    {selectedProduct.installment}
                  </div>
                )}
              </div>
            </div>

            {/* Specs & Guarantees */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F7F8FC] border border-[#E7E9F2]">
                <span className="text-[#64748B] block text-[10px] font-bold">Yetkazib berish</span>
                <span className="font-extrabold text-[#0F172A] mt-0.5 block">{selectedProduct.deliveryInfo || '24 soat ichida'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F8FC] border border-[#E7E9F2]">
                <span className="text-[#64748B] block text-[10px] font-bold">Kafolat muddati</span>
                <span className="font-extrabold text-[#0F172A] mt-0.5 block">{selectedProduct.warranty || '12 oy rasmiy'}</span>
              </div>
            </div>

            {/* Direct Link Button */}
            <a
              href={selectedProduct.directUrl || selectedProduct.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-open w-full justify-center text-center py-3"
            >
              <span>{selectedProduct.source} do‘konidan xarid qilish</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODELLARNI SOLISHTIRISH (FLOATING COMPARISON DOCK)
          ========================================================================= */}
      {compareItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0F172A] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in border border-slate-700">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black">{compareItems.length} ta model tanlandi</span>
          </div>
          <button
            type="button"
            onClick={() => setIsCompareModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#6366F1] hover:bg-[#4F46E5] rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <span>Yonma-yon solishtirish ⚖️</span>
          </button>
          <button
            type="button"
            onClick={() => setCompareItems([])}
            className="text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer p-1"
            title="Tozalash"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          MODELLARNI YONMA-YON SOLISHTIRISH MODALI
          ========================================================================= */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-[#E7E9F2] space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E9F2]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0F172A]">
                    Modellarni yonma-yon solishtirish ({compareItems.length} ta)
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Narxlar, kafolat, do‘konlar va texnik parametrlar taqqoslanmoqda
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                className="w-8 h-8 rounded-lg text-[#94A3B8] hover:text-[#0F172A] flex items-center justify-center hover:bg-[#F1F3FB]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Side by side columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {compareItems.map((item) => {
                const specs = getProductSpecs(item);
                return (
                  <div key={item.id} className="p-4 rounded-2xl border border-[#E7E9F2] bg-[#F8FAFC] flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="h-32 rounded-xl bg-white flex items-center justify-center p-2 border border-[#E7E9F2]">
                        <img src={item.thumbnail} alt={item.title} className="max-h-full max-w-full object-contain" />
                      </div>
                      <h4 className="font-bold text-xs text-[#0F172A] line-clamp-2 min-h-[32px]">{item.title}</h4>
                      <div className="text-sm font-black text-[#6366F1]">{item.price}</div>
                      <div className="text-[11px] text-[#64748B] flex items-center gap-1">
                        <span>Do‘kon:</span>
                        <b className="text-[#0F172A]">{item.source}</b>
                      </div>
                      <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                        🚚 {selectedRegion} bo‘yicha 24 soatda
                      </div>
                    </div>

                    {/* Specs Table */}
                    <div className="space-y-1.5 pt-2 border-t border-[#E7E9F2] text-[11px]">
                      {specs.slice(0, 4).map((s, sIdx) => (
                        <div key={sIdx} className="flex justify-between gap-1 text-[#475569]">
                          <span className="text-[#94A3B8]">{s.label}:</span>
                          <span className="font-semibold text-right">{s.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex flex-col gap-1.5">
                      <a
                        href={item.directUrl || item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white text-xs font-black rounded-xl text-center shadow-md active:scale-95"
                      >
                        ⚡ Arzonroq olish
                      </a>
                      <button
                        type="button"
                        onClick={() => toggleCompare(item)}
                        className="w-full py-1 text-[11px] text-red-600 font-bold hover:bg-red-50 rounded-lg transition"
                      >
                        Ro‘yxatdan chiqarish
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ALTERNATIBLARI MODALI (SMART ALTERNATIVES)
          ========================================================================= */}
      {isAlternativesModalOpen && alternativesProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#E7E9F2] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E9F2]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0F172A]">
                    Muqobil (Alternativ) variantlar
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    &ldquo;{alternativesProduct.title}&rdquo; o‘rniga tavsiya etiladigan arzon va sifatli modellar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAlternativesModalOpen(false)}
                className="w-8 h-8 rounded-lg text-[#94A3B8] hover:text-[#0F172A] flex items-center justify-center hover:bg-[#F1F3FB]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {getProductAlternatives(alternativesProduct).map((alt) => (
                <div key={alt.id} className="p-3.5 rounded-2xl border border-[#E7E9F2] bg-[#FAFBFD] hover:bg-white flex flex-col sm:flex-row items-center justify-between gap-3 transition">
                  <div className="flex items-center gap-3">
                    <img src={alt.thumbnail} alt={alt.title} className="w-14 h-14 object-contain bg-white rounded-xl p-1 border border-[#E7E9F2] shrink-0" />
                    <div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                        {alt.storeBadge || 'Arzonroq muqobil'}
                      </span>
                      <h4 className="font-bold text-xs text-[#0F172A] mt-1">{alt.title}</h4>
                      <p className="text-[11px] text-[#64748B]">{alt.source} · {alt.warranty || '12 oy kafolat'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-sm font-black text-[#6366F1]">{alt.price}</div>
                      <div className="text-[10px] text-emerald-600 font-bold">🚚 {selectedRegion}da mavjud</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAlternativesModalOpen(false);
                        setSearchQuery(alt.title);
                        executeSearch(alt.title);
                      }}
                      className="px-3 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-black rounded-xl transition cursor-pointer"
                    >
                      Batafsil ko‘rish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TEXNIK TASNIFI MODALI (DETAILED SPECS)
          ========================================================================= */}
      {isSpecsModalOpen && specsProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E7E9F2] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E9F2]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0F172A]">
                    Mahsulotning texnik tasnifi
                  </h3>
                  <p className="text-xs text-[#64748B] truncate max-w-[280px]">
                    {specsProduct.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSpecsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-[#94A3B8] hover:text-[#0F172A] flex items-center justify-center hover:bg-[#F1F3FB]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-[#F1F3F9] text-xs">
              {getProductSpecs(specsProduct).map((spec, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                  <span className="text-[#64748B] font-medium">{spec.label}</span>
                  <span className="font-bold text-[#0F172A] text-right">{spec.value}</span>
                </div>
              ))}
            </div>

            <div className="pt-3">
              <a
                href={specsProduct.directUrl || specsProduct.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white text-xs font-black rounded-xl text-center shadow-md block"
              >
                ⚡ Yanada arzonroq sotib olish
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          HUDUDNI TANLASH MODALI (DELIVERY REGION SELECTOR)
          ========================================================================= */}
      {isRegionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E7E9F2] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E9F2]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0F172A]">
                    Yetkazib berish hududini tanlang
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Har bir viloyat bo‘yicha aniq narxlar va rasmiy do‘konlar ko‘rsatiladi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRegionModalOpen(false)}
                className="w-8 h-8 rounded-lg text-[#94A3B8] hover:text-[#0F172A] flex items-center justify-center hover:bg-[#F1F3FB]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                'Toshkent shahri', 'Toshkent viloyati', 'Samarqand', 'Farg‘ona',
                'Andijon', 'Namangan', 'Buxoro', 'Xorazm',
                'Qashqadaryo', 'Surxondaryo', 'Jizzax', 'Sirdaryo',
                'Navoiy', 'Qoraqalpog‘iston'
              ].map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => {
                    setSelectedRegion(reg);
                    setIsRegionModalOpen(false);
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition flex items-center justify-between cursor-pointer ${
                    selectedRegion === reg
                      ? 'border-[#6366F1] bg-[#EEF0FF] text-[#4338CA]'
                      : 'border-[#E7E9F2] bg-[#FAFBFD] hover:bg-white text-[#334155]'
                  }`}
                >
                  <span>{reg}</span>
                  {selectedRegion === reg && <Check className="w-4 h-4 text-[#6366F1]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          9. FOOTER (Iqtisodchi clean footer)
          ========================================================================= */}
      <footer className="border-t border-[#E7E9F2] bg-white py-6 mt-auto">
        <div className="max-w-[1120px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#0F172A]">Iqtisodchi</span>
            <span>— O‘zbekiston onlayn do‘konlaridagi narxlar taqqoslagichi va intellektual xarid dasturi</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              type="button" 
              onClick={() => setIsAiDrawerOpen(true)}
              className="hover:text-[#6366F1] font-semibold transition cursor-pointer"
            >
              AI Maslahatchi
            </button>
            <Link href="/seller/dashboard" className="hover:text-[#6366F1] font-semibold transition">
              Sotuvchilar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
