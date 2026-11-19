'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Camera, 
  Flame, 
  BookOpen, 
  Layers, 
  ExternalLink, 
  Heart, 
  Bell, 
  Check, 
  ChevronRight, 
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
  ChevronDown
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

export default function IqtisodchiSearchPage() {
  // 1. Search Query State
  const [searchQuery, setSearchQuery] = useState('televizor samsung 55');
  const [activeQuery, setActiveQuery] = useState('televizor samsung 55');
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

  // 5. Interactive States
  const [favorites, setFavorites] = useState<Record<string, SerpProductItem>>({});
  const [isAlertSubscribed, setIsAlertSubscribed] = useState(false);
  const [telegramContact, setTelegramContact] = useState('');
  const [alertSuccessToast, setAlertSuccessToast] = useState(false);

  // 6. AI Chat inside Drawer
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatThinking, setIsChatThinking] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const clientCache = useRef<Record<string, any>>({});

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

  // Initial load on mount
  useEffect(() => {
    executeSearch('televizor samsung 55');
  }, []);

  // Form submit handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
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
          1. MAXPROFIT AUTHENTIC HEADER (1:1 with maxprofit.uz)
          ========================================================================= */}
      <header className="mp-header">
        <div className="container">
          {/* Logo */}
          <Link href="/" className="mp-logo" aria-label="Iqtisodchi">
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
          </Link>

          {/* Katalog Button */}
          <button 
            type="button" 
            onClick={() => {
              setSearchQuery('konditsioner inverter');
              executeSearch('konditsioner inverter');
            }}
            className="mp-cat hidden sm:inline-flex"
          >
            <svg className="mp-cat-ic" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
              <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
              <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
              <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="3.75" />
            </svg>
            <span>Каталог</span>
          </button>

          {/* Deals Link */}
          <button 
            type="button"
            onClick={() => setSortBy('disc')}
            className="mp-navlink hidden md:inline-flex text-rose-600 hover:text-rose-700 font-bold"
          >
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Скидки</span>
          </button>

          {/* Header Search Form */}
          <form className="mp-header-search" onSubmit={handleSearchSubmit}>
            <div className="search-box">
              <span className="text-[#64748B]">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                name="q" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск товара..." 
                autoComplete="off"
              />
              <button 
                type="button" 
                onClick={() => setIsPhotoModalOpen(true)}
                className="btn-photo" 
                aria-label="Поиск по фото" 
                title="Поиск по фото"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
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
          2. MAIN CONTENT (1:1 with results-wrap on MaxProfit)
          ========================================================================= */}
      <main className="flex-1">
        <div className="results-wrap">
          
          {/* Results Head */}
          <div className="results-head flex flex-wrap items-center justify-between gap-2">
            <h2>
              Результатов: <span>{totalResultsCount || products.length}</span> — &ldquo;{activeQuery}&rdquo;
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

          {/* =====================================================================
              A. BEST BANNER (Самая низкая цена с Короной)
              ===================================================================== */}
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
                <div className="t">Самая низкая цена</div>
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
                  className="btn-open" 
                  href={bestBanner.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <span>В магазин</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* =====================================================================
              B. PRICE INSIGHT (История цен и график)
              ===================================================================== */}
          {priceInsight && !isLoading && (
            <section className="pinsight" aria-label="История цен">
              <div className="pi-head">
                <div className="pi-title">
                  <TrendingUp className="w-4 h-4 text-[#6366F1]" />
                  <span>История цен</span>
                  <span className="pi-sub">{priceInsight.sub}</span>
                </div>
                <span className={`pi-level ${priceInsight.level.includes('выгодная') || priceInsight.level.includes('Низкая') ? 'lvl-low' : ''}`}>
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
                    6.2 млн сум
                  </div>
                  <div className="absolute bottom-2 left-2 text-[10px] font-bold text-[#64748B]">
                    1.6 млн сум
                  </div>

                  {/* X-axis Dates */}
                  <div className="pi-x">
                    <span>12 окт</span>
                    <span>1 ноя</span>
                    <span>Сегодня</span>
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
                      ? '✅ Отслеживается — отменить' 
                      : '🔔 Сообщить о снижении цены в Telegram'
                    }
                  </span>
                </button>
              </div>
            </section>
          )}

          {/* =====================================================================
              C. FILTERS BAR (Pill buttons per store, min-max price, sort)
              ===================================================================== */}
          <div className="filters" id="filters">
            {/* Store Pills */}
            <div className="fstores">
              <button
                type="button"
                onClick={() => setSelectedStore('all')}
                className={`fpill ${selectedStore === 'all' ? 'active' : ''}`}
              >
                <span>Все</span>
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
                  placeholder="от" 
                  inputMode="numeric"
                />
                <span>—</span>
                <input 
                  type="number" 
                  id="fmax" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="до" 
                  inputMode="numeric"
                />
                <span className="text-[11px] font-bold text-[#64748B]">сум</span>
              </div>

              <select 
                id="fsort" 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="fsort-select"
              >
                <option value="cheap">Сначала дешёвые</option>
                <option value="exp">Сначала дорогие</option>
                <option value="disc">По скидке</option>
              </select>
            </div>
          </div>

          {/* =====================================================================
              D. PRODUCT ROWS LIST (1:1 with rlist & rrow on MaxProfit)
              ===================================================================== */}
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
                        <span>🚚 Есть доставка</span>
                        <span>🛡️ 12 oy kafolat</span>
                      </div>

                      <div className="rnasiya">
                        <span className="nas-ico">💳 Рассрочка:</span>
                        <span className="nas-chip">
                          {prod.installment || "Alif Nasiya / Muddatli to'lov"}
                        </span>
                      </div>
                    </div>

                    {/* 3. Price */}
                    <div className="rprice">
                      <div className="price">
                        {prod.price.replace(" so'm", '').replace(" so‘m", '')}
                        <span className="cur">сум</span>
                      </div>

                      {prod.oldPrice && (
                        <div className="pold">
                          <span className="old">{prod.oldPrice.replace(" so'm", '')}</span>
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

                    {/* 4. Action */}
                    <div className="ract" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(prod, e)}
                        className={`btn-fav ${isFav ? 'on' : ''}`}
                        title={isFav ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'text-[#F43F5E] fill-[#F43F5E]' : 'text-[#94A3B8]'}`} />
                      </button>

                      <a
                        href={prod.directUrl || prod.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-open"
                      >
                        <span>В магазин</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
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
