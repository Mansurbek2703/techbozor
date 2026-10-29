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
  Info
} from 'lucide-react';
import { SerpProductItem } from '@/lib/serpapi';
import { 
  UiFormData, 
  ComparisonItem, 
  DynamicFilterFacet 
} from '@/lib/ecommerce-agent';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  normalizedQuery?: string;
  category?: string;
  region?: string;
  products?: SerpProductItem[];
  comparisonTable?: ComparisonItem[];
  facets?: DynamicFilterFacet[];
  uiFormData?: UiFormData;
  timestamp: string;
}

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Assalomu alaykum! O‘zbekistonning barcha 12+ onlayn do‘konlari bo‘yicha **Smart AI Aggregator v5.0** ga xush kelibsiz. Istalgan texnikani yozing yoki pastdagi bir martalik forma orqali tanlang.',
      normalizedQuery: 'Texnika qidiruvi',
      uiFormData: {
        regions: ['Toshkent', 'Xorazm', 'Samarqand', 'Buxoro', 'Farg‘ona', 'Andijon'],
        budget_ranges: ['5 mln so‘mgacha', '5 - 10 mln so‘m', '10 mln so‘mdan yuqori'],
        features: ['Optimum narx', 'Rasmiy kafolat', 'Energiya tejamkor'],
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');

  // 1-Martalik Dinamik Forma tanlovlari (Form Overlay / Drawer)
  const [selectedRegion, setSelectedRegion] = useState<string>('Toshkent');
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [selectedFeature, setSelectedFeature] = useState<string>('');
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState<boolean>(true);

  // Dinamik Facets filtri (Qidiruv natijalari chiqqandan so'ng)
  const [activeFacetFilters, setActiveFacetFilters] = useState<Record<string, string>>({});

  // 🌟 Platforma Ichida Ko'rish Modali (In-App Product Details Modal / Sheet)
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

  // Asosiy qidiruv funksiyasi
  const handleSearch = async (overrideText?: string) => {
    const query = (overrideText || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: `${query}${selectedRegion ? ` (${selectedRegion})` : ''}${selectedFeature ? ` [${selectedFeature}]` : ''}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);
    setLoadingStage('🧠 12+ O‘zbekiston do‘konlari tahlil qilinmoqda...');

    try {
      const stageTimer1 = setTimeout(() => {
        setLoadingStage('🔍 Asaxiy, Mediapark, Texnomart, Idea, Olcha va Uzumdan narxlar olinmoqda...');
      }, 1200);

      const stageTimer2 = setTimeout(() => {
        setLoadingStage('🛡️ Mahsulotlar saralanmoqda va In-App kassetalar shakllantirilmoqda...');
      }, 2400);

      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          region: selectedRegion || undefined,
          budget: selectedBudget || undefined,
          feature: selectedFeature || undefined,
          history: updatedMessages.filter(m => m.id !== 'welcome').map(m => ({
            role: m.role,
            content: m.content
          })).slice(-4)
        }),
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      const data = await res.json();

      if (data.success && data.data) {
        const agentData = data.data;

        setMessages(prev => [
          ...prev,
          {
            id: 'msg-' + Date.now(),
            role: 'model',
            content: agentData.short_advice_uz || 'Siz uchun O‘zbekiston do‘konlaridan eng maqbul variantlar tayyorlandi.',
            normalizedQuery: agentData.normalized_query,
            category: agentData.category,
            region: selectedRegion || agentData.extracted_filters?.region,
            products: agentData.products || [],
            comparisonTable: agentData.comparison_table || [],
            facets: agentData.dynamic_facets || [],
            uiFormData: agentData.ui_form_data,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);

        if (agentData.ui_form_data?.features && agentData.ui_form_data.features.length > 0) {
          if (!selectedFeature) {
            setSelectedFeature(agentData.ui_form_data.features[0]);
          }
        }

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

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: 'Assalomu alaykum! O‘zbekistonning barcha 12+ onlayn do‘konlari bo‘yicha **Smart AI Aggregator v5.0** ga xush kelibsiz. Istalgan texnikani yozing yoki pastdagi bir martalik forma orqali tanlang.',
        normalizedQuery: 'Texnika qidiruvi',
        uiFormData: {
          regions: ['Toshkent', 'Xorazm', 'Samarqand', 'Buxoro', 'Farg‘ona', 'Andijon'],
          budget_ranges: ['5 mln so‘mgacha', '5 - 10 mln so‘m', '10 mln so‘mdan yuqori'],
          features: ['Optimum narx', 'Rasmiy kafolat', 'Energiya tejamkor'],
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
          description: `Smart Aggregator orqali buyurtma: ${selectedProduct.title} (${selectedProduct.source}) - ${selectedProduct.price}. Havola: ${selectedProduct.link}`,
          budget: 5000000,
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

  // Eng so'nggi xabardagi forma ma'lumotlari
  const latestUiForm = [...messages].reverse().find(m => m.uiFormData)?.uiFormData || {
    regions: ['Toshkent', 'Xorazm', 'Samarqand', 'Buxoro', 'Farg‘ona', 'Andijon'],
    budget_ranges: ['5 mln so‘mgacha', '5 - 10 mln so‘m', '10 mln so‘mdan yuqori'],
    features: ['Optimum narx', 'Rasmiy kafolat', 'Energiya tejamkor'],
  };

  return (
    <div className="max-w-[1240px] w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      
      {/* 🌟 Sarlavha & v5.0 Badge */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-stone-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                Universal AI E-Commerce Aggregator v5.0
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                12+ O‘zbekiston Do‘koni
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Asaxiy, Mediapark, Texnomart, Idea, Uzum, Olcha, Tezz, Glotr, IKarvon bir joyda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFormDrawerOpen(!isFormDrawerOpen)}
            className="px-3 py-1.5 rounded-xl border border-orange-200 bg-orange-50/80 hover:bg-orange-100 text-brand-900 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
            <span>Smart Forma {isFormDrawerOpen ? '▲' : '▼'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition"
            title="Suhbatni yangilash"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 💬 ASOSIY SUHBAT VA KASSETALAR MAYDONI */}
      <div className="glass-3d rounded-3xl border border-orange-200/80 shadow-xl overflow-hidden flex flex-col min-h-[560px] bg-white/75 backdrop-blur-md">
        
        {/* Xabarlar va Natijalar Ro'yxati */}
        <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 scrollbar-thin">
          {messages.map((msg) => {
            const displayedProducts = filterProducts(msg.products);

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[96%] sm:max-w-[88%] rounded-3xl p-3.5 sm:p-4 text-xs sm:text-sm shadow-sm transition-all ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-brand-600 to-orange-600 text-white rounded-tr-xs'
                      : 'bg-white border border-stone-200/90 text-stone-800 rounded-tl-xs space-y-3'
                  }`}
                >
                  {/* Imlo xatosi to'g'rilangan badge */}
                  {msg.normalizedQuery && msg.role === 'model' && msg.id !== 'welcome' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 border border-brand-200 rounded-xl text-[11px] font-bold text-brand-900 shadow-2xs">
                      <CheckCheck className="w-3.5 h-3.5 text-brand-600" />
                      <span>Aniqlangan so‘rov: <strong>{msg.normalizedQuery}</strong></span>
                      {msg.region && (
                        <span className="ml-1 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[10px]">
                          📍 {msg.region}
                        </span>
                      )}
                    </div>
                  )}

                  {/* ⚡ Qat'iy Cheklov: AI Matni max 60 so'z va 4 gap */}
                  <p className="leading-relaxed whitespace-pre-line font-medium text-xs sm:text-sm text-stone-800">
                    {msg.content}
                  </p>

                  {/* 🎯 DINAMIK FILTRLAR (ADAPTIVE FACETS) */}
                  {msg.facets && msg.facets.length > 0 && msg.products && msg.products.length > 0 && (
                    <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-2xl flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
                        <Filter className="w-3 h-3 text-brand-600" />
                        Filtr:
                      </span>
                      {msg.facets.map((facet) => (
                        <div key={facet.id} className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-stone-200 shadow-2xs">
                          <span className="text-[10px] text-stone-400 font-bold">{facet.label}:</span>
                          <select
                            value={activeFacetFilters[facet.id] || 'Hammasi'}
                            onChange={(e) => setActiveFacetFilters(prev => ({
                              ...prev,
                              [facet.id]: e.target.value === 'Hammasi' ? '' : e.target.value,
                            }))}
                            className="bg-transparent text-[11px] font-black text-brand-900 outline-none cursor-pointer"
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
                          className="text-[10px] text-brand-700 font-bold underline hover:text-brand-900 ml-auto"
                        >
                          Tozalash
                        </button>
                      )}
                    </div>
                  )}

                  {/* 📊 COMPARISON VIEW (Ixcham Taqqoslash Jadvali) */}
                  {msg.comparisonTable && msg.comparisonTable.length > 1 && (
                    <div className="p-2.5 sm:p-3 bg-stone-50/90 rounded-2xl border border-stone-200/80 space-y-2 overflow-x-auto">
                      <div className="flex items-center gap-1.5 text-xs font-black text-stone-800">
                        <Layers className="w-3.5 h-3.5 text-brand-600" />
                        <span>Narxlar va Modellarni Taqqoslash:</span>
                      </div>
                      <table className="w-full text-[11px] text-left border-collapse min-w-[340px]">
                        <thead>
                          <tr className="border-b border-stone-200 text-stone-500 font-bold">
                            <th className="py-1 px-2">Model</th>
                            <th className="py-1 px-2">Narxi</th>
                            <th className="py-1 px-2">Do‘kon</th>
                            <th className="py-1 px-2">Xususiyat</th>
                            <th className="py-1 px-2 text-right">Amal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {msg.comparisonTable.map((item, idx) => {
                            const matchedProd = msg.products?.find(p => p.id === item.id) || msg.products?.[idx];
                            return (
                              <tr key={item.id} className="hover:bg-white/80 transition">
                                <td className="py-1.5 px-2 font-bold text-stone-900">{item.model}</td>
                                <td className="py-1.5 px-2 font-black text-brand-700">{item.price}</td>
                                <td className="py-1.5 px-2 text-emerald-800 font-semibold">{item.store}</td>
                                <td className="py-1.5 px-2 text-stone-600">{item.keySpec}</td>
                                <td className="py-1.5 px-2 text-right">
                                  {matchedProd && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedProduct(matchedProd)}
                                      className="px-2 py-0.5 bg-orange-100 text-brand-800 hover:bg-brand-600 hover:text-white rounded text-[10px] font-bold transition"
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

                  {/* 🛍️ SMART PRODUCT CARDS (In-App Detail Sheet ochuvchi kassetalar) */}
                  {displayedProducts && displayedProducts.length > 0 && (
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-black text-stone-800">
                        <span className="flex items-center gap-1.5">
                          <ShoppingBag className="w-4 h-4 text-brand-600" />
                          Topilgan Mahsulotlar ({displayedProducts.length}):
                        </span>
                        <span className="text-[10px] text-stone-400 font-normal">
                          *Kartochkani bosib batafsil ko‘ring
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {displayedProducts.map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => setSelectedProduct(prod)}
                            className="bg-white hover:bg-orange-50/30 border border-stone-200/90 rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-md cursor-pointer group hover:border-brand-300"
                          >
                            <div>
                              {/* Rasm va Do'kon */}
                              <div className="w-full h-32 rounded-xl overflow-hidden bg-stone-50 mb-2 relative flex items-center justify-center border border-stone-100 p-2">
                                <img
                                  src={prod.thumbnail}
                                  alt={prod.title}
                                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-200"
                                />
                                <span className="absolute top-1.5 left-1.5 bg-emerald-700 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                                  <Store className="w-2.5 h-2.5" />
                                  {prod.source}
                                </span>
                              </div>

                              <h4 className="font-extrabold text-xs text-stone-900 line-clamp-2 mb-1 group-hover:text-brand-600 transition">
                                {prod.title}
                              </h4>

                              <div className="text-brand-700 font-black text-xs sm:text-sm mb-1.5">
                                💰 {prod.price}
                              </div>

                              {prod.keySpecs && prod.keySpecs.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {prod.keySpecs.slice(0, 2).map((sp, sIdx) => (
                                    <span key={sIdx} className="px-1.5 py-0.5 bg-stone-100 text-stone-700 rounded text-[9px] font-semibold">
                                      {sp}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* In-App Sheetni ochish tugmasi */}
                            <div className="pt-2 border-t border-stone-100">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(prod);
                                }}
                                className="w-full py-1.5 px-3 bg-stone-100 hover:bg-brand-600 hover:text-white text-stone-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                              >
                                <span>Platformada Ko‘rish</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className={`text-[9px] block text-right mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-stone-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-center bg-orange-50/90 border border-orange-200 text-brand-900 rounded-2xl p-3.5 text-xs font-bold shadow-xs">
              <div className="w-3 h-3 rounded-full bg-brand-600 animate-ping" />
              <span>{loadingStage || 'AI variantlarni tahlil qilmoqda...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 📋 BIR MARTALIK DINAMIK FORMA (SMART FILTER DRAWER / OVERLAY) */}
        {isFormDrawerOpen && (
          <div className="bg-stone-50 border-t border-stone-200/90 p-3 sm:px-6 transition-all duration-300">
            <div className="max-w-4xl mx-auto space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-stone-700 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
                  Bir martalik parametrlar (Ketma-ket savolsiz darhol qidirish):
                </span>
                <span className="text-[10px] text-stone-400">
                  Tanlang va darhol natija oling
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* 1. Hudud */}
                <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-2xs">
                  <label className="text-[10px] font-bold text-stone-500 block mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-brand-600" />
                    Hudud (Yetkazish):
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full bg-stone-50 text-xs font-bold text-stone-800 rounded-lg p-1.5 border border-stone-200 outline-none"
                  >
                    {latestUiForm.regions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Byudjet */}
                <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-2xs">
                  <label className="text-[10px] font-bold text-stone-500 block mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-600" />
                    Byudjet oralig‘i:
                  </label>
                  <select
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    className="w-full bg-stone-50 text-xs font-bold text-stone-800 rounded-lg p-1.5 border border-stone-200 outline-none"
                  >
                    <option value="">Ixtiyoriy narx</option>
                    {latestUiForm.budget_ranges.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Xususiyat */}
                <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-2xs">
                  <label className="text-[10px] font-bold text-stone-500 block mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Asosiy xususiyat / Foydalanish:
                  </label>
                  <select
                    value={selectedFeature}
                    onChange={(e) => setSelectedFeature(e.target.value)}
                    className="w-full bg-stone-50 text-xs font-bold text-stone-800 rounded-lg p-1.5 border border-stone-200 outline-none"
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

        {/* ⌨️ SO'ROV VA QIDIRUV KIRITISH MAYDONI */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200">
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
                placeholder="Oddiy tilda yozing: masalan 'gaming monoblok MSI', '12 lik konditsioner', 'mzlatkich'..."
                disabled={isLoading}
                className="w-full bg-stone-50 border border-stone-300 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 rounded-2xl pl-4 pr-10 py-3 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 outline-none transition"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-5 sm:px-6 py-3 bg-gradient-to-r from-brand-600 to-orange-600 hover:brightness-110 active:scale-95 disabled:opacity-40 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow-md transition shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Qidirish</span>
            </button>
          </form>
        </div>
      </div>

      {/* 🌟 PLATFORMA ICHIDA KO'RISH MODAL OYNASI (IN-APP PRODUCT DETAIL SHEET) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div 
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:px-6 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black flex items-center gap-1">
                  <Store className="w-3.5 h-3.5" />
                  {selectedProduct.source}
                </span>
                <span className="text-xs text-stone-500 font-semibold">
                  Platformada Ko‘rish
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(null);
                  setOrderModalOpen(false);
                  setOrderSuccess(false);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                {/* Mahsulot Rasmi */}
                <div className="w-48 h-48 bg-stone-50 rounded-2xl border border-stone-200 p-3 flex items-center justify-center shrink-0">
                  <img
                    src={selectedProduct.thumbnail}
                    alt={selectedProduct.title}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Sarlavha va Narx */}
                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <h3 className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                    {selectedProduct.title}
                  </h3>
                  
                  <div className="text-xl sm:text-2xl font-black text-brand-700">
                    💰 {selectedProduct.price}
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {selectedProduct.warranty || '12 oy rasmiy kafolat'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg text-xs font-bold">
                      <Truck className="w-3.5 h-3.5 text-brand-600" />
                      {selectedProduct.deliveryInfo || `${selectedProduct.region || 'O‘zbekiston'} bo‘ylab yetkazish`}
                    </span>
                  </div>
                </div>
              </div>

              {/* To'liq Xususiyatlar Ro'yxati */}
              {selectedProduct.keySpecs && selectedProduct.keySpecs.length > 0 && (
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-2">
                  <h4 className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-brand-600" />
                    Asosiy Texnik Ko‘rsatkichlar:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                    {selectedProduct.keySpecs.map((sp, idx) => (
                      <li key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-stone-100 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{sp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tavsif Snippet */}
              {selectedProduct.snippet && (
                <div className="text-xs text-stone-600 leading-relaxed bg-orange-50/50 p-3 rounded-2xl border border-orange-100">
                  <strong className="text-stone-900 block mb-0.5">Do‘kon ma’lumoti:</strong>
                  {selectedProduct.snippet}
                </div>
              )}

              {/* 🛒 Platformamiz orqali buyurtma berish formasi */}
              {orderModalOpen && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-1.5">
                      <PhoneCall className="w-4 h-4 text-emerald-600" />
                      Platformamiz orqali 1-bosqichli buyurtma
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
                      <p className="text-[11px] text-stone-500">
                        Tez orada operator yoki do‘kon vakili siz bilan bog‘lanadi.
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
                          className="bg-white border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 outline-none"
                        />
                        <input
                          type="tel"
                          required
                          value={orderPhone}
                          onChange={(e) => setOrderPhone(e.target.value)}
                          placeholder="+998 90 123 45 67"
                          className="bg-white border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 outline-none font-bold"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingOrder}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        {isSubmittingOrder ? 'Yuborilmoqda...' : 'Buyurtmani Tasdiqlash'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Modal Pastki Harakat Tugmalari */}
            <div className="p-4 sm:px-6 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              {/* 1. Do'kon manbasiga o'tish */}
              {selectedProduct.link && selectedProduct.link !== '#' ? (
                <a
                  href={selectedProduct.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition"
                >
                  <span>Sotib olish manbasiga o‘tish</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                </a>
              ) : (
                <div />
              )}

              {/* 2. Platformamiz orqali buyurtma berish */}
              <button
                type="button"
                onClick={() => setOrderModalOpen(!orderModalOpen)}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-brand-600 to-orange-600 hover:brightness-110 active:scale-95 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <span>Platformamiz orqali buyurtma berish</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
