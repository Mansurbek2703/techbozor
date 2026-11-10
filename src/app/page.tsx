'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  Sparkles, 
  Send, 
  ExternalLink, 
  RotateCcw, 
  ShoppingBag, 
  Store, 
  Search, 
  MapPin,
  CheckCheck,
  Tag,
  SlidersHorizontal,
  ChevronRight,
  X,
  ShieldCheck,
  Truck,
  Check,
  Flame,
  Layers,
  ArrowRight,
  Filter,
  PhoneCall,
  Info,
  Zap,
  TrendingDown,
  Building2,
  Utensils
} from 'lucide-react';
import { 
  SerpProductItem, 
  getCategoryBadges, 
  isDishwareQuery,
  isStrictValidProduct,
  detectCategoryKey 
} from '@/lib/serpapi';
import { 
  UiFormData, 
  ComparisonItem, 
  DynamicFilterFacet,
  ClarificationData,
  ClarificationOption,
  EconomistInsight
} from '@/lib/ecommerce-agent';
import { 
  getStoreBrandConfig, 
  StoreLogoFallback, 
  CategoryVectorPlaceholder 
} from '@/lib/store-logos';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  ui_mode?: 'CONVERSATION_ONLY' | 'PRODUCT_RESULTS';
  ai_reply?: string;
  state?: 'CONVERSATION' | 'NEED_CLARIFICATION' | 'PRODUCT_SEARCH';
  normalizedQuery?: string;
  category?: string;
  categoryKey?: string;
  region?: string;
  products?: SerpProductItem[];
  comparisonTable?: ComparisonItem[];
  facets?: DynamicFilterFacet[];
  uiFormData?: UiFormData;
  clarificationData?: ClarificationData | null;
  economistInsight?: EconomistInsight | null;
  turnCount?: number;
  smartChips?: Array<{ label: string; payload: string }>;
  timestamp: string;
}

/**
 * 🎨 Kategoriya bo'yicha neytral rasm komponenti (Directive V7.0)
 * Quloqchin o'rniga faqat o'sha toifaga xos SVG vektor belgisi yoki haqiqiy rasm chiqadi
 */
function ProductCardImage({
  thumbnail,
  title,
  storeName,
  category,
}: {
  thumbnail?: string;
  title: string;
  storeName?: string;
  category?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const isDish = isDishwareQuery(title, category);

  // Rasm URL'ida elektronika bo'lsa yoki rasm topilmasa, SVG vektor chiqaramiz
  const imgLower = (thumbnail || '').toLowerCase();
  const hasForbiddenPattern = isDish && ['headphone', 'naushnik', 'earphone', 'mouse', 'keyboard', 'cable'].some(p => imgLower.includes(p));

  if (!thumbnail || hasError || thumbnail.length < 8 || hasForbiddenPattern) {
    return <CategoryVectorPlaceholder category={category} title={title} storeName={storeName} />;
  }

  return (
    <img
      src={thumbnail}
      alt={title}
      onError={() => setHasError(true)}
      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
      loading="lazy"
    />
  );
}

/**
 * 🚀 "1 Soniyali Aqlli Yo'naltiruvchi" uchun dinamik tavsiyalar (V7.0)
 */
function getLiveGuidedChips(query: string) {
  const q = (query || '').toLowerCase();

  if (/noutbuk|laptop|macbook|kompyuter|notbuk/i.test(q)) {
    return [
      { label: "🎮 O‘yinlar uchun (RTX 4060)", queryAppend: "noutbuk gaming rtx", icon: "🎮" },
      { label: "💻 Dasturlash & IT (16GB RAM)", queryAppend: "noutbuk dasturlash 16gb", icon: "💻" },
      { label: "💼 Ofis & O‘qish (Ultrabook)", queryAppend: "noutbuk ultrabook ofis", icon: "💼" },
    ];
  }
  if (/telefon|smartfon|iphone|samsung|redmi|xiaomi|honor|ayfon/i.test(q)) {
    return [
      { label: "📱 Kamera flagman (iPhone / S24)", queryAppend: "kamera flagman smartfon", icon: "📱" },
      { label: "🔋 Uzoq zaryad (5000mAh+)", queryAppend: "katta batareyali smartfon", icon: "🔋" },
      { label: "⚡ Hamyonbop (A-seriya / Redmi)", queryAppend: "hamyonbop smartfon", icon: "⚡" },
    ];
  }
  if (/chinni|likop|tarelka|tovoq|idish|serviz|chashka|farfor/i.test(q)) {
    return [
      { label: "6 kishilik to'plam", queryAppend: "6 kishilik to'plam serviz", icon: "🍽" },
      { label: "Donalab (Kundalik)", queryAppend: "donalab kundalik", icon: "🥣" },
      { label: "Bayramona servirovka", queryAppend: "bayramona servirovka likopcha", icon: "✨" },
    ];
  }
  if (/kondits|split|inverter|12|kandits/i.test(q)) {
    return [
      { label: "30 kv.m gacha (Uy)", queryAppend: "30 kv.m gacha inverter", icon: "🏠" },
      { label: "40 kv.m+ (Ofis)", queryAppend: "40 kv.m+ kuchaytirilgan", icon: "🏢" },
      { label: "Faqat Inverter (Tejamkor)", queryAppend: "inverter A+++ tejamkor", icon: "⚡" },
    ];
  }
  if (/choynak|kettle|термопот/i.test(q)) {
    return [
      { label: "1.7L Zanglamas po'lat", queryAppend: "1.7L zanglamas po'lat", icon: "🫖" },
      { label: "Shisha LED korpus", queryAppend: "shisha LED korpus", icon: "💡" },
      { label: "Smart harorat saqlovchi", queryAppend: "smart harorat saqlovchi", icon: "🌡" },
    ];
  }
  if (/tv|televiz|smart/i.test(q)) {
    return [
      { label: "43 dyuym Smart TV", queryAppend: "43 dyuym Smart TV", icon: "📺" },
      { label: "55 dyuym 4K HDR", queryAppend: "55 dyuym 4K HDR", icon: "🎬" },
      { label: "65+ Cinema QLED", queryAppend: "65 dyuym Cinema QLED", icon: "✨" },
    ];
  }

  // Standart tavsiyalar
  return [
    { label: "💻 Kuchli noutbuklar", queryAppend: "noutbuk", icon: "💻" },
    { label: "📱 Zamonaviy smartfonlar", queryAppend: "smartfon", icon: "📱" },
    { label: "🍽 Chinni likopchalar", queryAppend: "chinni likopcha 6 kishilik to'plam", icon: "🍽" },
    { label: "❄️ 12 lik Inverter konditsioner", queryAppend: "12 lik inverter konditsioner", icon: "❄️" },
  ];
}

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Assalomu alaykum! "Aqlli Bozor" O‘zbekiston elektron tijorat ekotizimida xaridlar bo‘yicha iqtisodiy tahlilchi va agregatoringizman. Istalgan tovar so‘rovingizni yozing (masalan, "chinni likopcha Xorazm", "12 lik konditsioner", "elektr choynak"), rasmiy do‘konlar narxlari va toza xulosani taqdim etaman.',
      normalizedQuery: 'Aqlli Bozor',
      turnCount: 0,
      uiFormData: {
        regions: ['Toshkent', 'Xorazm', 'Samarqand', 'Buxoro', 'Farg‘ona', 'Andijon'],
        budget_ranges: ['Byudjet variant', 'O‘rtacha narx', 'Premium toifadagi'],
        features: ['Optimum narx', 'Rasmiy kafolat', 'Tez yetkazish'],
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [currentTurn, setCurrentTurn] = useState<number>(1);

  // Taqqoslash jadvalini ko'rsatish/yashirish state'i (V7.0: Foydalanuvchini charchatmaslik uchun sukut bo'yicha yopiq)
  const [expandedCompare, setExpandedCompare] = useState<Record<string, boolean>>({});

  // 1-Martalik Dinamik Forma tanlovlari
  const [selectedRegion, setSelectedRegion] = useState<string>('Toshkent');
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [selectedFeature, setSelectedFeature] = useState<string>('');
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState<boolean>(false);

  // Dinamik Facets filtri
  const [activeFacetFilters, setActiveFacetFilters] = useState<Record<string, string>>({});

  // 🌟 Platforma Ichida Ko'rish Modali (In-App Product Details Modal)
  const [selectedProduct, setSelectedProduct] = useState<SerpProductItem | null>(null);

  // 🛒 Platformamiz orqali buyurtma berish kichik formasi
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('+998 ');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Asosiy qidiruv funksiyasi (The Absolute Gatekeeper orqali tozalangan)
  const handleSearch = async (
    overrideText?: string, 
    turnToUse?: number,
    clarificationPayload?: Record<string, any>
  ) => {
    const query = (overrideText || inputText).trim();
    if (!query || isLoading) return;

    // Sessiya Tozaligi: yangi so'rovda eski filtrlarni noldan tozalash (Directive V11.0)
    setSelectedFeature('');
    setActiveFacetFilters({});

    const turn = turnToUse !== undefined ? turnToUse : currentTurn;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);
    setLoadingStage('🧠 1. Niyat tahlili va kategoriyaga sezgir yo‘naltiruvchi ishga tushmoqda...');

    try {
      const stageTimer1 = setTimeout(() => {
        setLoadingStage('🔍 2. SerpAPI Scraper: Uzum, Texnomart, Mediapark, Olcha va Asaxiy tekshirilmoqda...');
      }, 800);

      const stageTimer2 = setTimeout(() => {
        setLoadingStage('🛡️ 3. The Absolute Gatekeeper: Google.com va Bozor narxida natijalari elanmoqda...');
      }, 1800);

      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          region: selectedRegion || undefined,
          budget: selectedBudget || undefined,
          feature: selectedFeature || undefined,
          turn_count: turn,
          clarification_payload: clarificationPayload,
          history: updatedMessages.filter(m => m.id !== 'welcome').map(m => ({
            role: m.role,
            content: m.content
          })).slice(-4)
        }),
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      const data = await res.json();

      if (data.success && (data.data || data.ui_mode)) {
        const agentData = data.data || data;
        const uiMode: 'CONVERSATION_ONLY' | 'PRODUCT_RESULTS' = 
          data.ui_mode || agentData.ui_mode || (agentData.state === 'PRODUCT_SEARCH' && (agentData.products || []).length > 0 ? 'PRODUCT_RESULTS' : 'CONVERSATION_ONLY');
        const aiReply = data.ai_reply || agentData.ai_reply || agentData.replyMessage || agentData.short_advice_uz || 'Siz uchun O‘zbekiston do‘konlaridan eng maqbul variantlar tayyorlandi.';

        const nextTurn = (agentData.turn_count || turn) + 1;
        setCurrentTurn(nextTurn);

        // 🛡️ FRONTEND GATEKEEPER (2-BOSQICH): 
        // Agar ui_mode === "CONVERSATION_ONLY" bo'lsa: Mahsulotlar massivi QAT'IY BO'SH (0 ta)!
        const validProducts = uiMode === 'PRODUCT_RESULTS'
          ? (agentData.products || []).filter((p: any) => 
              isStrictValidProduct(p, agentData.category_key || agentData.category || '')
            )
          : [];

        setMessages(prev => [
          ...prev,
          {
            id: 'msg-' + Date.now(),
            role: 'model',
            ui_mode: uiMode,
            state: agentData.state,
            content: aiReply,
            ai_reply: aiReply,
            normalizedQuery: agentData.normalized_query,
            category: agentData.category,
            categoryKey: agentData.category_key,
            region: selectedRegion || agentData.extracted_filters?.region,
            products: validProducts,
            comparisonTable: uiMode === 'PRODUCT_RESULTS' ? (agentData.comparison_table || []) : [],
            facets: uiMode === 'PRODUCT_RESULTS' ? (agentData.dynamic_facets || []) : [],
            uiFormData: agentData.ui_form_data,
            clarificationData: agentData.clarification_data,
            economistInsight: uiMode === 'PRODUCT_RESULTS' ? agentData.economist_insight : null,
            turnCount: agentData.turn_count,
            smartChips: agentData.smartChips,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);

        setActiveFacetFilters({});
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: 'msg-' + Date.now(),
          role: 'model',
          content: 'Tarmoqda vaqtinchalik xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  // Foydalanuvchi Dinamik Clarification chipini bosganda
  const handleClarificationOptionClick = (opt: ClarificationOption, previousTurn?: number) => {
    const nextTurn = (previousTurn || currentTurn || 1) + 1;
    handleSearch(opt.label, nextTurn, opt.payload);
  };

  // 🚀 "1 Soniyali Aqlli Yo'naltiruvchi" chipi bosilganda
  const handleGuidedChipClick = (chip: { label: string; queryAppend: string }) => {
    const current = inputText.trim();
    let nextQuery = chip.queryAppend;
    if (current) {
      if (!current.toLowerCase().includes(chip.queryAppend.toLowerCase())) {
        nextQuery = `${current} ${chip.queryAppend}`;
      } else {
        nextQuery = current;
      }
    }
    setInputText(nextQuery);
    handleSearch(nextQuery);
  };

  const handleResetChat = () => {
    setCurrentTurn(1);
    setExpandedCompare({});
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: 'Assalomu alaykum! "Aqlli Bozor" O‘zbekiston elektron tijorat ekotizimida xaridlar bo‘yicha iqtisodiy tahlilchi va agregatoringizman. Istalgan tovar so‘rovingizni yozing (masalan, "chinni likopcha Xorazm", "12 lik konditsioner", "elektr choynak"), rasmiy do‘konlar narxlari va toza xulosani taqdim etaman.',
        normalizedQuery: 'Aqlli Bozor',
        turnCount: 0,
        uiFormData: {
          regions: ['Toshkent', 'Xorazm', 'Samarqand', 'Buxoro', 'Farg‘ona', 'Andijon'],
          budget_ranges: ['Byudjet variant', 'O‘rtacha narx', 'Premium toifadagi'],
          features: ['Optimum narx', 'Rasmiy kafolat', 'Tez yetkazish'],
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    setActiveFacetFilters({});
  };

  // Dinamik Facet filtrlash
  const filterProducts = (products: SerpProductItem[] = []) => {
    if (Object.keys(activeFacetFilters).length === 0) return products;

    return products.filter(p => {
      const text = `${p.title} ${p.price} ${p.source} ${p.snippet || ''}`.toLowerCase();
      for (const [key, val] of Object.entries(activeFacetFilters)) {
        if (!val || val === 'Hammasi') continue;
        const cleanVal = val.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanText = text.replace(/[^a-z0-9]/g, '');
        if (!cleanText.includes(cleanVal)) {
          return false;
        }
      }
      return true;
    });
  };

  // Platformamiz orqali 1-click buyurtma berish
  const handlePlatformOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderName.trim() || orderPhone.length < 9 || !selectedProduct) return;

    setIsSubmittingOrder(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName: orderName,
          buyerPhone: orderPhone,
          category: selectedProduct.title,
          description: `Aqlli Bozor orqali buyurtma: ${selectedProduct.title} (${selectedProduct.source}) - ${selectedProduct.price}. Manzil: ${selectedProduct.link}`,
          budget: selectedProduct.priceNumber || 5000000,
          region: selectedRegion || 'Toshkent',
          district: '',
          durationDays: 7,
          smsConsent: true,
          aiExtracted: {
            itemTitle: selectedProduct.title,
            store: selectedProduct.source,
            price: selectedProduct.price,
          }
        }),
      });

      if (res.ok) {
        setOrderSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const latestUiForm = [...messages].reverse().find(m => m.uiFormData)?.uiFormData || {
    regions: ['Toshkent', 'Xorazm', 'Samarqand', 'Buxoro', 'Farg‘ona', 'Andijon'],
    budget_ranges: ['5 mln so‘mgacha', '5 - 10 mln so‘m', '10 mln so‘mdan yuqori'],
    features: ['Optimum narx', 'Rasmiy kafolat', 'Tez yetkazish'],
  };

  return (
    <div className="max-w-[1240px] w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 font-sans bg-[#F8FAFC] min-h-screen text-[#0F172A]">
      
      {/* 🌟 Sarlavha & v7.0 Badge (#FF6B00 / #0F172A / #F8FAFC) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF6B00] via-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-[#0F172A] tracking-tight">
                "Aqlli Bozor" E-Commerce Agregator & Iqtisodiy Maslahatchi
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-orange-100 text-[#FF6B00] text-[10px] font-black border border-orange-200">
                Gatekeeper V7.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Mutlaq Darvoza: 100% toza do‘konlar, noaniq narxlarsiz va toifaga mos dinamik xususiyatlar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFormDrawerOpen(!isFormDrawerOpen)}
            className="px-3.5 py-1.5 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-[#0F172A] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Parametrlar {isFormDrawerOpen ? '▲' : '▼'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            className="p-2 text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Suhbatni yangilash"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 💬 ASOSIY SUHBAT VA KASSETALAR MAYDONI */}
      <div className="rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[560px] bg-white">
        
        {/* Xabarlar va Natijalar Ro'yxati */}
        <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 scrollbar-thin">
          {messages.map((msg) => {
            const displayedProducts = filterProducts(msg.products);
            const isDish = isDishwareQuery(msg.normalizedQuery || msg.content || '', msg.category);

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6B00] border border-orange-200 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[96%] sm:max-w-[88%] rounded-3xl p-4 text-xs sm:text-sm shadow-sm transition-all ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#FF6B00] to-orange-600 text-white rounded-tr-xs shadow-md shadow-orange-500/20'
                      : 'bg-white border border-slate-200 text-[#0F172A] rounded-tl-xs space-y-3.5'
                  }`}
                >
                  {/* Holat badge (CONVERSATION / NEED_CLARIFICATION / PRODUCT_SEARCH) */}
                  {msg.role === 'model' && msg.id !== 'welcome' && (
                    <div className="inline-flex flex-wrap items-center gap-1.5 px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-xl text-[11px] font-bold text-orange-950 shadow-2xs">
                      {msg.state === 'CONVERSATION' ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span>AI Maslahatchi & Muloqot</span>
                        </>
                      ) : msg.state === 'NEED_CLARIFICATION' ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Aniqlashtirish va Yo‘naltirish</span>
                        </>
                      ) : (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span>Aniqlangan so‘rov: <strong>{msg.normalizedQuery || msg.category}</strong></span>
                        </>
                      )}
                      {msg.region && (
                        <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px]">
                          📍 {msg.region}
                        </span>
                      )}
                      {msg.turnCount !== undefined && msg.turnCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                          Bosqich: {msg.turnCount}/3
                        </span>
                      )}
                    </div>
                  )}

                  {/* ⚡ Qat'iy Cheklov: AI Matni maksimum 2 ta gap! */}
                  <p className="leading-relaxed whitespace-pre-line font-medium text-xs sm:text-sm text-slate-800">
                    {msg.content}
                  </p>

                  {/* 🔘 DINAMIK CLARIFICATION VARIANTLARI (FSM Turn Chips) */}
                  {msg.clarificationData && msg.clarificationData.options && msg.clarificationData.options.length > 0 && (
                    <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-2">
                      <div className="text-[11px] font-extrabold text-[#0F172A] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>Iltimos, aniqroq natija uchun bittasini tanlang:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.clarificationData.options.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleClarificationOptionClick(opt, msg.turnCount)}
                            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FF6B00] text-[#0F172A] hover:text-white border border-orange-200 hover:border-[#FF6B00] text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1.5 group cursor-pointer"
                          >
                            <span>{opt.label}</span>
                            <ArrowRight className="w-3 h-3 text-[#FF6B00] group-hover:text-white transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 💡 SMART CHIPS (V12.0 Controller Maslahatlari) */}
                  {!msg.clarificationData && msg.smartChips && msg.smartChips.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {msg.smartChips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => {
                            const val = chip.payload || chip.label;
                            setInputText(val);
                            handleSearch(val);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-[#FF6B00] text-[#0F172A] hover:text-white border border-orange-200 hover:border-[#FF6B00] text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 group"
                        >
                          <span>{chip.label}</span>
                          <ArrowRight className="w-3 h-3 text-[#FF6B00] group-hover:text-white transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 🎩 BOSH IQTISODCHI EKSPERTIZASI (Faqat PRODUCT_RESULTS bo'lganda!) */}
                  {msg.ui_mode === 'PRODUCT_RESULTS' && msg.economistInsight && (
                    <div>
                      {isDish ? (
                        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/50 border border-amber-200/90 space-y-2.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-[#0F172A] flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center text-[10px] font-black">
                                ✓
                              </span>
                              Bosh Iqtisodchi Tahlili: Chinni va Oshxona Idishlari Sifat Kafolati
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              Oziq-ovqat xavfsizligi
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                            <div className="bg-white/90 p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                              <div className="text-[10px] text-slate-500 font-semibold">Zarbalarga Chidamlilik</div>
                              <div className="text-xs sm:text-sm font-black text-[#0F172A] mt-0.5">Sirlangan Farfor</div>
                            </div>

                            <div className="bg-white/90 p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                              <div className="text-[10px] text-slate-500 font-semibold">Mikroto‘lqinli Pech</div>
                              <div className="text-xs sm:text-sm font-black text-emerald-700 mt-0.5">100% Yaroqli</div>
                            </div>

                            <div className="col-span-2 sm:col-span-1 bg-white/90 p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                              <div className="text-[10px] text-slate-500 font-semibold">Xizmat Muddati</div>
                              <div className="text-xs font-black text-[#FF6B00] mt-0.5">10+ Yil Kafolat</div>
                            </div>
                          </div>

                          {msg.economistInsight.regional_compatibility && (
                            <div className="text-[11px] text-slate-700 bg-white/80 p-2 rounded-xl border border-amber-100 font-medium">
                              <strong className="text-[#0F172A]">Chidamlilik kafolati:</strong> {msg.economistInsight.regional_compatibility}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/50 border border-orange-200/90 space-y-2.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-[#0F172A] flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center text-[10px] font-black">
                                ROI
                              </span>
                              Bosh Iqtisodchi Tahliliy Ekspertizasi (O‘zbekiston Tarifi: 450 so‘m/kVt)
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Energiya Hisobi
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                            <div className="bg-white/90 p-2.5 rounded-xl border border-orange-100 shadow-2xs">
                              <div className="text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1">
                                <Zap className="w-3 h-3 text-amber-500" />
                                Oylik Elektr Sarfi
                              </div>
                              <div className="text-xs sm:text-sm font-black text-[#0F172A] mt-0.5">
                                {msg.economistInsight.monthly_kwh} kVt/soat
                              </div>
                            </div>

                            <div className="bg-white/90 p-2.5 rounded-xl border border-orange-100 shadow-2xs">
                              <div className="text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1">
                                <TrendingDown className="w-3 h-3 text-[#FF6B00]" />
                                Oylik Elektr Xarajati
                              </div>
                              <div className="text-xs sm:text-sm font-black text-[#FF6B00] mt-0.5">
                                {msg.economistInsight.monthly_cost_uzs.toLocaleString('uz-UZ').replace(/,/g, ' ')} so‘m
                              </div>
                            </div>

                            <div className="col-span-2 sm:col-span-1 bg-white/90 p-2.5 rounded-xl border border-orange-100 shadow-2xs">
                              <div className="text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1">
                                <Building2 className="w-3 h-3 text-emerald-600" />
                                O‘zini Oqlash (ROI)
                              </div>
                              <div className="text-xs font-black text-emerald-700 mt-0.5">
                                1.5 yillik muddatda
                              </div>
                            </div>
                          </div>

                          {msg.economistInsight.regional_compatibility && (
                            <div className="text-[11px] text-slate-700 bg-white/80 p-2 rounded-xl border border-orange-100 font-medium">
                              <strong className="text-[#0F172A]">Mahalliy sharoitga mosligi:</strong> {msg.economistInsight.regional_compatibility}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 🎯 DINAMIK FILTRLAR (ADAPTIVE FACETS - Faqat PRODUCT_RESULTS bo'lganda) */}
                  {msg.ui_mode === 'PRODUCT_RESULTS' && msg.facets && msg.facets.length > 0 && msg.products && msg.products.length > 0 && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <Filter className="w-3 h-3 text-[#FF6B00]" />
                        Filtr:
                      </span>
                      {msg.facets.map((facet) => (
                        <div key={facet.id} className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                          <span className="text-[10px] text-slate-400 font-bold">{facet.label}:</span>
                          <select
                            value={activeFacetFilters[facet.id] || 'Hammasi'}
                            onChange={(e) => setActiveFacetFilters(prev => ({
                              ...prev,
                              [facet.id]: e.target.value === 'Hammasi' ? '' : e.target.value,
                            }))}
                            className="bg-transparent text-[11px] font-black text-[#0F172A] outline-none cursor-pointer"
                          >
                            {facet.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                      {Object.keys(activeFacetFilters).length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveFacetFilters({})}
                          className="text-[10px] text-[#FF6B00] font-bold underline hover:text-orange-700 ml-auto"
                        >
                          Tozalash
                        </button>
                      )}
                    </div>
                  )}

                  {/* 📊 COMPARE MATRIX (Faqat PRODUCT_RESULTS bo'lganda) */}
                  {msg.ui_mode === 'PRODUCT_RESULTS' && msg.comparisonTable && msg.comparisonTable.length > 1 && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setExpandedCompare(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>
                          {expandedCompare[msg.id] 
                            ? "Batafsil solishtirish jadvalini yopish ▲" 
                            : "Batafsil solishtirish jadvali (ochish) ▼"}
                        </span>
                      </button>

                      {expandedCompare[msg.id] && (
                        <div className="mt-2.5 p-3 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2 overflow-x-auto shadow-xs animate-fade-in">
                          <div className="flex items-center justify-between text-xs font-black text-[#0F172A]">
                            <span className="flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-[#FF6B00]" />
                              Taqqoslash Jadvali:
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Sanitizatsiyadan o‘tgan do‘konlar
                            </span>
                          </div>
                          <table className="w-full text-[11px] text-left border-collapse min-w-[420px]">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-white/70">
                                <th className="py-2 px-2.5 rounded-l-lg">Model</th>
                                <th className="py-2 px-2">Narxi</th>
                                <th className="py-2 px-2">Do‘kon</th>
                                <th className="py-2 px-2">{isDish ? 'Xususiyat / Sifat' : 'Oylik Elektr'}</th>
                                <th className="py-2 px-2">Kafolat</th>
                                <th className="py-2 px-2 text-right rounded-r-lg">Amal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {msg.comparisonTable.map((item, idx) => {
                                const matchedProd = msg.products?.find(p => p.id === item.id) || msg.products?.[idx];
                                const brand = getStoreBrandConfig(item.store);
                                return (
                                  <tr key={item.id} className="hover:bg-white transition">
                                    <td className="py-2 px-2.5 font-bold text-[#0F172A]">{item.model}</td>
                                    <td className="py-2 px-2 font-black text-[#FF6B00] text-xs sm:text-sm whitespace-nowrap">{item.price}</td>
                                    <td className="py-2 px-2">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black border ${brand.bgClass} ${brand.textClass} ${brand.borderClass}`}>
                                        {brand.name}
                                      </span>
                                    </td>
                                    <td className="py-2 px-2 text-slate-700 font-semibold whitespace-nowrap">
                                      {isDish 
                                        ? 'Oziq-ovqat xavfsizligi' 
                                        : (item.monthlyCostUzs ? `${item.monthlyCostUzs.toLocaleString('uz-UZ').replace(/,/g, ' ')} so‘m` : '—')}
                                    </td>
                                    <td className="py-2 px-2 text-slate-600 font-medium">{item.keySpec}</td>
                                    <td className="py-2 px-2 text-right">
                                      {matchedProd && (
                                        <button
                                          type="button"
                                          onClick={() => setSelectedProduct(matchedProd)}
                                          className="px-2.5 py-1 bg-[#0F172A] hover:bg-[#FF6B00] text-white rounded-lg text-[10px] font-bold transition shadow-xs cursor-pointer"
                                        >
                                          Ko‘rish
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 🛍️ PRODUCT CARDS: Faqat ui_mode === "PRODUCT_RESULTS" bo'lganda chiziladi */}
                  {msg.ui_mode === 'PRODUCT_RESULTS' && displayedProducts && displayedProducts.length > 0 ? (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between text-xs font-black text-[#0F172A]">
                        <span className="flex items-center gap-1.5">
                          <ShoppingBag className="w-4 h-4 text-[#FF6B00]" />
                          Sanitizatsiyadan o‘tgan tovarlar ({displayedProducts.length}):
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          *Barcha narxlar O'zbekiston rasmiy do'konlaridan
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        {displayedProducts.map((prod) => {
                          const brand = getStoreBrandConfig(prod.source);
                          const dynamicBadges = getCategoryBadges(msg.categoryKey || msg.category || '', prod.title);
                          const rawBadges = (prod.badges && prod.badges.length > 0) ? prod.badges : dynamicBadges;
                          const cleanBadges = isDish ? rawBadges.filter(b => !/a\+\+\+|energiya|inverter|kompressor|freon/i.test(b)) : rawBadges;

                          return (
                            <div
                              key={prod.id}
                              onClick={() => setSelectedProduct(prod)}
                              className="bg-white rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl hover:border-orange-300 transition-all duration-300 p-3.5 flex flex-col justify-between group cursor-pointer"
                            >
                              <div>
                                {/* 1. [Aniq Rasm] (SVG Vektor Placeholder fallback bilan) */}
                                <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-50 mb-2.5 relative flex items-center justify-center border border-slate-100 p-2">
                                  <ProductCardImage
                                    thumbnail={prod.thumbnail}
                                    title={prod.title}
                                    storeName={prod.source}
                                    category={msg.categoryKey || msg.category}
                                  />
                                </div>

                                {/* 2. [Mahsulot Nomi] */}
                                <h4 className="font-extrabold text-xs text-[#0F172A] line-clamp-2 mb-1.5 group-hover:text-[#FF6B00] transition-colors leading-tight">
                                  {prod.title}
                                </h4>

                                {/* 3. [Aniq Narx (so'm)] (Bozor narxida emas!) */}
                                <div className="mb-2">
                                  <div className="text-[#FF6B00] font-black text-sm tracking-tight">
                                    {prod.price}
                                  </div>
                                </div>

                                {/* 4. [Do'kon Logotipi] (Faqat Uzum, Asaxiy, Olcha, Texnomart - Google.com taqiqlangan) */}
                                <div className="flex items-center gap-1.5 mb-2.5">
                                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border ${brand.bgClass} ${brand.textClass} ${brand.borderClass}`}>
                                    <span className="w-3 h-3 flex items-center justify-center shrink-0">
                                      {brand.logoSvg}
                                    </span>
                                    <span>{brand.name}</span>
                                  </div>
                                  {prod.storeBadge && (
                                    <span className="text-[9px] text-slate-500 font-medium px-1.5 py-0.5 bg-slate-100 rounded">
                                      {prod.storeBadge}
                                    </span>
                                  )}
                                </div>

                                {/* 🏷️ 5. DINAMIK TOIFAGA MOS BADGELAR (V12.0: Hech qanday statik A+++ yo'q, faqat dinamik) */}
                                <div className="flex flex-wrap gap-1 mb-2.5">
                                  {cleanBadges.slice(0, 3).map((badge, bIdx) => (
                                    <span 
                                      key={bIdx} 
                                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                                        isDish 
                                          ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                          : 'bg-orange-50 text-orange-800 border border-orange-200'
                                      }`}
                                    >
                                      {badge}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* 6. [Platformada Ko'rish Tugmasi] */}
                              <div className="pt-2 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProduct(prod);
                                  }}
                                  className="w-full py-2 px-3 bg-[#0F172A] hover:bg-[#FF6B00] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
                                >
                                  <span>Platformada Ko‘rish</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : msg.role === 'model' && msg.id !== 'welcome' && !msg.clarificationData && msg.ui_mode === 'PRODUCT_RESULTS' ? (
                    <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl text-center text-xs text-orange-950 font-bold">
                      Kategoriya bo‘yicha toza natija topilmadi, qidiruv filtrini kengaytiring.
                    </div>
                  ) : null}

                  <span className={`text-[9px] block text-right mt-1 ${msg.role === 'user' ? 'text-white/80' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-center bg-orange-50 border border-orange-200 text-orange-950 rounded-2xl p-3.5 text-xs font-bold shadow-xs animate-pulse">
              <div className="w-3 h-3 rounded-full bg-[#FF6B00] animate-ping" />
              <span>{loadingStage || 'AI variantlarni tahlil qilmoqda...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 📋 DINAMIK FORMA (SMART FILTER DRAWER) */}
        {isFormDrawerOpen && (
          <div className="bg-slate-50 border-t border-slate-200 p-3 sm:px-6 transition-all duration-300">
            <div className="max-w-4xl mx-auto space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF6B00]" />
                  Qo‘shimcha parametrlar:
                </span>
                <span className="text-[10px] text-slate-400">
                  Hudud va byudjet bo‘yicha filtr
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* 1. Hudud */}
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#FF6B00]" />
                    Hudud (Yetkazish):
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full bg-slate-50 text-xs font-bold text-slate-800 rounded-lg p-1.5 border border-slate-200 outline-none"
                  >
                    {latestUiForm.regions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Byudjet */}
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-600" />
                    Byudjet oralig‘i:
                  </label>
                  <select
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    className="w-full bg-slate-50 text-xs font-bold text-slate-800 rounded-lg p-1.5 border border-slate-200 outline-none"
                  >
                    <option value="">Ixtiyoriy narx</option>
                    {latestUiForm.budget_ranges.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Xususiyat */}
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Asosiy xususiyat:
                  </label>
                  <select
                    value={selectedFeature}
                    onChange={(e) => setSelectedFeature(e.target.value)}
                    className="w-full bg-slate-50 text-xs font-bold text-slate-800 rounded-lg p-1.5 border border-slate-200 outline-none"
                  >
                    <option value="">Standart</option>
                    {latestUiForm.features.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🚀 "1 SONIYALI AQLLI YO'NALTIRUVCHI" (SMART CHIP GUIDED INTERFACE - V7.0) */}
        <div className="px-3 sm:px-4 pt-3 pb-1.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-black text-[#0F172A] flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
            Aqlli Yo‘naltiruvchi (GPT):
          </span>
          {(() => {
            const lastMsg = [...messages].reverse().find(m => m.smartChips && m.smartChips.length > 0);
            if (lastMsg && lastMsg.smartChips && lastMsg.smartChips.length > 0) {
              return lastMsg.smartChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleGuidedChipClick({ label: chip.label, queryAppend: chip.payload })}
                  className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-[#FF6B00] text-[#0F172A] hover:text-white border border-orange-200 hover:border-[#FF6B00] text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span className="text-sm">✨</span>
                  <span>{chip.label}</span>
                </button>
              ));
            }
            return getLiveGuidedChips(inputText || messages[messages.length - 1]?.normalizedQuery || '').map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleGuidedChipClick(chip)}
                className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-[#FF6B00] text-[#0F172A] hover:text-white border border-orange-200 hover:border-[#FF6B00] text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ));
          })()}
        </div>

        {/* ⌨️ SO'ROV VA QIDIRUV KIRITISH MAYDONI */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Masalan: 'chinni likopcha Xorazm', '12 lik konditsioner', 'elektr choynak'..."
                disabled={isLoading}
                className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/20 rounded-2xl pl-4 pr-10 py-3 text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 outline-none transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-5 sm:px-6 py-3 bg-[#FF6B00] hover:bg-orange-600 active:scale-95 disabled:opacity-40 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Yuborish</span>
            </button>
          </form>
        </div>
      </div>

      {/* 🌟 IN-APP PRODUCT MODAL (Saytdan chiqmasdan ko'rish) */}
      {selectedProduct && (() => {
        const modalBrand = getStoreBrandConfig(selectedProduct.source);
        const prodCategoryKey = (selectedProduct as any).categoryKey || selectedProduct.category || detectCategoryKey(selectedProduct.title);
        const isDish = isDishwareQuery(selectedProduct.title, prodCategoryKey);
        const dynamicBadges = getCategoryBadges(prodCategoryKey, selectedProduct.title);

        return (
          <div 
            className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in"
            onClick={() => {
              setSelectedProduct(null);
              setOrderModalOpen(false);
              setOrderSuccess(false);
            }}
          >
            <div 
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black border ${modalBrand.bgClass} ${modalBrand.textClass} ${modalBrand.borderClass}`}>
                    <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {modalBrand.logoSvg}
                    </span>
                    <span>{modalBrand.name}</span>
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    • In-App Mahsulot Kartasi
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    setOrderModalOpen(false);
                    setOrderSuccess(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                  {/* Mahsulot Rasmi */}
                  <div className="w-48 h-48 bg-slate-50 rounded-2xl border border-slate-200 p-3 flex items-center justify-center shrink-0">
                    <ProductCardImage
                      thumbnail={selectedProduct.thumbnail}
                      title={selectedProduct.title}
                      storeName={selectedProduct.source}
                      category={prodCategoryKey}
                    />
                  </div>

                  {/* Sarlavha va Narx */}
                  <div className="space-y-2 flex-1 text-center sm:text-left">
                    <h3 className="text-base sm:text-lg font-black text-[#0F172A] leading-snug">
                      {selectedProduct.title}
                    </h3>
                    
                    <div className="text-xl sm:text-2xl font-black text-[#FF6B00]">
                      {selectedProduct.price}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {selectedProduct.warranty || (isDish ? 'Oziq-ovqat xavfsizligi' : '12 oy rasmiy kafolat')}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                        <Truck className="w-3.5 h-3.5 text-[#FF6B00]" />
                        {selectedProduct.deliveryInfo || `${selectedProduct.region || 'Toshkent'} bo‘ylab yetkazish`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Toifaga mos Iqtisodiy/Chidamlilik Ko'rsatkichlari */}
                {isDish ? (
                  <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0F172A]">
                      <span className="flex items-center gap-1">
                        <Utensils className="w-3.5 h-3.5 text-[#FF6B00]" />
                        Chinni Idish Standartlari:
                      </span>
                      <span className="text-amber-800 font-black">
                        Oziq-ovqat xavfsizligi sertifikati
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Mikroto‘lqinli pech va idish yuvish mashinasiga to‘liq mos, zarbalarga chidamli sirlangan chinni.
                    </p>
                  </div>
                ) : (prodCategoryKey === 'telefon' || prodCategoryKey === 'noutbuk') ? (
                  <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0F172A]">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        {prodCategoryKey === 'telefon' ? 'Smartfon Standartlari:' : 'Noutbuk Parametrlari:'}
                      </span>
                      <span className="text-blue-800 font-black">
                        {prodCategoryKey === 'telefon' ? 'IMEI & Rasmiy Kafolat' : 'Original litsenziya'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {prodCategoryKey === 'telefon' 
                        ? '100% rasmiy bojxona ro‘yxatidan o‘tgan IMEI va ishlab chiqaruvchi kafolati.'
                        : 'Samarali sovutish tizimi va uzoq batareya quvvati bilan barqaror ish faoliyati.'}
                    </p>
                  </div>
                ) : (selectedProduct.monthlyCostUzs && selectedProduct.monthlyCostUzs > 0) ? (
                  <div className="p-3 bg-orange-50/80 rounded-2xl border border-orange-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0F172A]">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-[#FF6B00]" />
                        Oylik Elektr Sarfi va Xarajat:
                      </span>
                      <span className="text-[#FF6B00] font-black">
                        {selectedProduct.monthlyKwh} kVt/soat (~{selectedProduct.monthlyCostUzs.toLocaleString('uz-UZ').replace(/,/g, ' ')} so‘m)
                      </span>
                    </div>
                    {selectedProduct.roiVerdict && (
                      <p className="text-[11px] text-slate-600 font-medium">
                        {selectedProduct.roiVerdict}
                      </p>
                    )}
                  </div>
                ) : null}

                {/* To'liq Xususiyatlar Ro'yxati */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-extrabold text-[#0F172A] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#FF6B00]" />
                    Asosiy Xususiyatlar:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    {dynamicBadges.map((sp, idx) => (
                      <li key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200/80 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{sp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Do'kon tavsifi */}
                {selectedProduct.snippet && (
                  <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <strong className="text-[#0F172A] block mb-0.5">Do‘kon tavsifi:</strong>
                    {selectedProduct.snippet}
                  </div>
                )}

                {/* 🛒 Platformamiz orqali buyurtma berish formasi */}
                {orderModalOpen && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-1.5">
                        <PhoneCall className="w-4 h-4 text-emerald-600" />
                        Platforma orqali 1-bosqichli buyurtma
                      </h4>
                      <span className="text-[10px] text-emerald-700 font-bold">Operator bog‘lanadi</span>
                    </div>

                    {orderSuccess ? (
                      <div className="p-3 bg-white rounded-xl text-center space-y-1">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                          <Check className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-black text-emerald-900">
                          Buyurtmangiz qabul qilindi!
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Tez orada do‘kon yoki operator siz bilan bog‘lanadi.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handlePlatformOrderSubmit} className="space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            value={orderName}
                            onChange={(e) => setOrderName(e.target.value)}
                            placeholder="Ismingiz..."
                            className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none"
                          />
                          <input
                            type="tel"
                            required
                            value={orderPhone}
                            onChange={(e) => setOrderPhone(e.target.value)}
                            placeholder="+998 90 123 45 67"
                            className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none font-bold"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmittingOrder}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {isSubmittingOrder ? 'Yuborilmoqda...' : 'Buyurtmani Tasdiqlash'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Pastki Harakat Tugmalari */}
              <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                {/* 1. Do'kon manbasiga o'tish */}
                {selectedProduct.link && selectedProduct.link !== '#' ? (
                  <a
                    href={selectedProduct.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Do‘kon sahifasida ochish</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                ) : (
                  <div />
                )}

                {/* 2. Platformamiz orqali buyurtma berish */}
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(!orderModalOpen)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#FF6B00] hover:bg-orange-600 active:scale-95 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition cursor-pointer"
                >
                  <span>Platforma orqali buyurtma berish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
