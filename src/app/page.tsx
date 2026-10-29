'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  MapPin, 
  Tv, 
  Refrigerator, 
  Shirt, 
  Wind, 
  Flame, 
  Utensils, 
  Zap,
  SlidersHorizontal,
  X,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Package,
  Wrench,
  Bot,
  RotateCcw,
  ShoppingBag,
  Store,
  Tag,
  CheckCheck
} from 'lucide-react';
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/lib/categories';
import { CategoryKey, Region, UZBEKISTAN_REGIONS, CategoryInfo } from '@/types';
import { SerpProductItem } from '@/lib/serpapi';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  step?: 'clarification' | 'recommendation';
  products?: SerpProductItem[];
  searchQuery?: string;
  normalizedQuery?: string;
  category?: string;
  region?: string;
  quickChips?: string[];
  timestamp: string;
}

export default function HomePage() {
  // Kategoriyalar
  const [categories, setCategories] = useState<CategoryInfo[]>(DEFAULT_CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('tv');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // Input va qidiruv holati
  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');

  // Natijalar holati (Ekranning o'ng yarmida chiqadi)
  const [activeProducts, setActiveProducts] = useState<SerpProductItem[]>([]);
  const [activeAdviceMarkdown, setActiveAdviceMarkdown] = useState<string | null>(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState<SerpProductItem | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>('');

  // AI Chat xabarlari
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Assalomu alaykum! Men sizning **AI Sotuvchi-Konsultantingizman** 🤖.\n\nQanday texnika qidiryapsiz? Masalan, *"12 lik konditsioner"*, *"sovutkich"* yoki *"50 duymli Smart TV"*. Hududingizga mos eng yaxshi narxlarni topib beraman.',
      quickChips: ['12 lik konditsioner', 'Muzlatgich No Frost', 'Smart TV 50 duym', 'Kir yuvish mashinasi'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Kategoriyalarni yuklash
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data && d.data.length > 0) {
          setCategories(d.data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategoryId(catId);
    setActiveFilters({});
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      setPromptText(cat.name);
    }
  };

  const handleFilterChange = (filterId: string, val: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: val,
    }));
  };

  // ASOSIY QIDIRUV VA AI AGENT CHAQIRUVI
  const handleRunSearch = async (overrideText?: string) => {
    const textToSend = overrideText || promptText;
    if (!textToSend.trim() || isLoading) return;

    // Tanlangan filtrlarni matnga qo'shish
    const filterTokens = Object.entries(activeFilters)
      .filter(([_, v]) => v && v !== 'Hammasi')
      .map(([k, v]) => `${v}`)
      .join(' ');

    const fullMessage = filterTokens ? `${textToSend.trim()} (${filterTokens})` : textToSend.trim();

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: fullMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setPromptText('');
    setIsLoading(true);
    setLoadingStage('🧠 So‘rov tahlil qilinmoqda va hudud tekshirilmoqda...');

    const historyPayload = newMessages
      .filter(m => m.id !== 'welcome')
      .map(m => ({
        role: m.role,
        content: m.content,
      }));

    try {
      const timer = setTimeout(() => {
        setLoadingStage('🔍 O‘zbekiston onlayn do‘konlaridan qidirilmoqda...');
      }, 1500);

      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          history: historyPayload.slice(0, -1),
        }),
      });

      clearTimeout(timer);
      const data = await res.json();

      if (data.success && data.data) {
        const agentData = data.data;

        if (agentData.region) {
          setActiveRegion(agentData.region);
        }

        if (agentData.step === 'clarification') {
          // Hudud yoki qo'shimcha parametrlar so'ralganda
          setMessages(prev => [
            ...prev,
            {
              id: 'msg-' + Date.now(),
              role: 'model',
              content: agentData.clarifying_question || 'Yetkazib berish qaysi viloyat yoki shaharga kerak?',
              step: 'clarification',
              normalizedQuery: agentData.normalized_query,
              category: agentData.category,
              quickChips: agentData.quick_chips || ['Toshkent shahri', 'Xorazm', 'Samarqand', 'Farg‘ona', 'Buxoro'],
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ]);
        } else {
          // Qidiruv muvaffaqiyatli: Ekranning o'ng yarmida mahsulotlar paydo bo'ladi!
          const prods: SerpProductItem[] = agentData.products || [];
          setActiveProducts(prods);
          setActiveAdviceMarkdown(agentData.advice_markdown || null);
          if (prods.length > 0) {
            setSelectedProductDetail(prods[0]);
          }

          setMessages(prev => [
            ...prev,
            {
              id: 'msg-' + Date.now(),
              role: 'model',
              content: agentData.advice_markdown || 'Siz uchun saralangan mahsulotlar tayyorlandi:',
              step: 'recommendation',
              products: prods,
              searchQuery: agentData.search_query,
              normalizedQuery: agentData.normalized_query,
              category: agentData.category,
              region: agentData.region,
              quickChips: agentData.quick_chips || ['Arzonroq variantlar', 'Faqat Inverter', 'Nasiya narxi'],
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: 'Assalomu alaykum! Men sizning **AI Sotuvchi-Konsultantingizman** 🤖.\n\nQanday texnika qidiryapsiz? Masalan, *"12 lik konditsioner"*, *"sovutkich"* yoki *"50 duymli Smart TV"*. Hududingizga mos eng yaxshi narxlarni topib beraman.',
        quickChips: ['12 lik konditsioner', 'Muzlatgich No Frost', 'Smart TV 50 duym', 'Kir yuvish mashinasi'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    setActiveProducts([]);
    setActiveAdviceMarkdown(null);
    setSelectedProductDetail(null);
  };

  const currentCategoryData = categories.find(c => c.id === selectedCategoryId) || categories[0];

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'tv': return <Tv className="w-4 h-4" />;
      case 'fridge': return <Refrigerator className="w-4 h-4" />;
      case 'washing': return <Shirt className="w-4 h-4" />;
      case 'ac': return <Wind className="w-4 h-4" />;
      case 'stove': return <Flame className="w-4 h-4" />;
      case 'microwave': return <Utensils className="w-4 h-4" />;
      case 'vacuum': return <Zap className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  // Markdown Jadval renderer
  const renderMarkdownTable = (text: string) => {
    const lines = text.split('\n');
    const tableLines = lines.filter(l => l.trim().startsWith('|') && l.trim().endsWith('|'));
    if (tableLines.length < 2) return null;

    const header = tableLines[0].slice(1, -1).split('|').map(s => s.trim());
    const body = tableLines.slice(1)
      .filter(l => !l.split('|').every(c => /^[-:\s]+$/.test(c)))
      .map(l => l.slice(1, -1).split('|').map(s => s.trim()));

    return (
      <div className="overflow-x-auto my-3 rounded-2xl border border-orange-200/90 shadow-xs bg-white/90">
        <table className="min-w-full text-xs text-left border-collapse">
          <thead className="bg-orange-50 border-b border-orange-200 text-stone-900 font-extrabold">
            <tr>
              {header.map((col, idx) => (
                <th key={idx} className="py-2.5 px-3 border-r border-orange-200/60 last:border-r-0">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {body.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-orange-50/50 transition">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="py-2 px-3 text-stone-700 font-medium border-r border-stone-100 last:border-r-0">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">

      {/* YAGONA 2 USTUNLI SPLIT LAYOUT (EKRAN YARMI QIDIRUV VA AI CHAT, IKKINCHI YARMI DETALNIY NATIJALAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ========================================================= */}
        {/* CHAP BO'LIM (6 USTUN): QIDIRUV + FILTRLAR + AI AGENT CHAT  */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* A. INTELEKTUAL QIDIRUV VA TAVSIF MAYDONI */}
          <div className="glass-3d rounded-3xl p-5 space-y-3 shadow-lg border border-orange-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider text-brand-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-600" />
                AI E-Commerce Qidiruv & Maslahatchi
              </span>
              {activeRegion && (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  {activeRegion}
                </span>
              )}
            </div>

            <div className="relative">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleRunSearch();
                  }
                }}
                rows={3}
                placeholder="Oddiy tilda yozing: masalan '12 lik konditsioner Xorazmga', '50 duymli Smart TV' yoki 'sovutkich No Frost'..."
                className="w-full rounded-2xl glass-3d-input p-3.5 pr-28 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none resize-none"
              />
              <button
                type="button"
                onClick={() => handleRunSearch()}
                disabled={isLoading || !promptText.trim()}
                className="absolute right-3 bottom-3 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-orange-600 hover:brightness-110 active:scale-95 disabled:opacity-40 text-white rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Qidirish</span>
                  </>
                )}
              </button>
            </div>

            {/* B. TEZKOR KATEGORIYALAR VA FILTRLAR */}
            <div className="pt-2 border-t border-stone-200/70 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-700 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
                  Kategoriya & Maxsus parametrlar:
                </span>
                <span className="text-[11px] font-extrabold text-brand-700 bg-orange-100 px-2 py-0.5 rounded-lg">
                  {currentCategoryData.name}
                </span>
              </div>

              {/* Kategoriyalar ro'yxati (Tugmalar ko'rinishida) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
                      selectedCategoryId === cat.id
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-white/80 hover:bg-orange-50 text-stone-700 border border-stone-200'
                    }`}
                  >
                    {getCategoryIcon(cat.id)}
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* Kategoriya dinamik filtrlari (Diagonali, Smart TV, Brend...) */}
              {currentCategoryData.filters && currentCategoryData.filters.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {currentCategoryData.filters.map((flt) => (
                    <div key={flt.id} className="space-y-1">
                      <label className="text-[10px] font-extrabold text-stone-600 truncate block">
                        {flt.label}
                      </label>
                      <select
                        value={activeFilters[flt.id] || 'Hammasi'}
                        onChange={(e) => handleFilterChange(flt.id, e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1 text-[11px] font-bold text-stone-800 outline-none cursor-pointer focus:border-brand-500"
                      >
                        {flt.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* C. INTERAKTIV AI SOTUVCHI-KONSULTANT CHATI */}
          <div className="glass-3d rounded-3xl p-4 sm:p-5 shadow-lg border border-orange-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-orange-500 text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-stone-900">
                    AI Muloqot & Maslahatchi
                  </h4>
                  <span className="text-[10px] text-stone-500">
                    Hudud bo‘yicha moslashuvchan savol-javob
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition"
                title="Suhbatni tozalash"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Muloqot xabarlari ro'yxati */}
            <div className="max-h-[380px] overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'model' && (
                    <div className="w-6 h-6 rounded-lg bg-orange-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div 
                    className={`max-w-[88%] rounded-2xl p-3 text-xs shadow-xs ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-brand-600 to-orange-600 text-white rounded-tr-xs' 
                        : 'bg-white border border-stone-200 text-stone-800 rounded-tl-xs'
                    }`}
                  >
                    {msg.normalizedQuery && msg.normalizedQuery !== msg.content && (
                      <div className="mb-1.5 p-1 bg-brand-50 border border-brand-200 rounded text-[10px] text-brand-900 flex items-center gap-1">
                        <CheckCheck className="w-3 h-3 text-brand-600" />
                        <span><strong>Tuzatildi:</strong> {msg.normalizedQuery}</span>
                      </div>
                    )}

                    <p className="leading-relaxed whitespace-pre-line font-medium">
                      {msg.content.replace(/!\[.*?\]\(.*?\)/g, '').replace(/\|.*?\|/g, '').trim()}
                    </p>

                    {/* D. DINAMIK QUICK CHIPS (HUDUDLAR VA VARIANTLAR) */}
                    {msg.quickChips && msg.quickChips.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-stone-100 flex flex-wrap gap-1.5">
                        {msg.quickChips.map((chip, cIdx) => (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => handleRunSearch(chip)}
                            className="px-2.5 py-1 bg-orange-50 hover:bg-brand-100 text-brand-900 border border-brand-200 rounded-lg text-[10px] font-bold transition active:scale-95 flex items-center gap-1 shadow-2xs"
                          >
                            <Tag className="w-2.5 h-2.5 text-brand-600" />
                            <span>{chip}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <span className={`text-[9px] block text-right mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-stone-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 items-center text-xs text-brand-800 bg-orange-50 border border-orange-200 rounded-2xl p-3 shadow-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-ping" />
                  <span className="font-bold">{loadingStage || 'AI javob tayyorlamoqda...'}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* O'NG BO'LIM (6 USTUN): EKRAN YARMIDA VARIANTLAR VA DETALNIY MA'LUMOTLAR   */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* A. AGAR MAHSULOTLAR TOPILGAN BO'LSA: DETALNIY SHOWCASE */}
          {activeProducts.length > 0 ? (
            <div className="glass-3d rounded-3xl p-5 space-y-4 shadow-xl border-2 border-brand-500/30 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-stone-900">
                      Topilgan Variantlar ({activeProducts.length} ta)
                    </h3>
                    <span className="text-[11px] text-stone-500">
                      O‘zbekiston onlayn do‘konlaridan eng mos narxlar
                    </span>
                  </div>
                </div>

                {activeRegion && (
                  <span className="text-xs font-black text-brand-700 bg-orange-100 px-3 py-1 rounded-xl border border-orange-200">
                    📍 {activeRegion}
                  </span>
                )}
              </div>

              {/* SOLISHTIRISH JADVALI (COMPARISON TABLE) */}
              {activeAdviceMarkdown && renderMarkdownTable(activeAdviceMarkdown)}

              {/* DETALNIY MAHSULOT KARTALARI (RASMLAR, NARX, DO'KON VA LINKLAR) */}
              <div className="space-y-3">
                {activeProducts.map((prod, pIdx) => (
                  <div
                    key={pIdx}
                    onClick={() => setSelectedProductDetail(prod)}
                    className={`rounded-2xl p-3.5 border transition cursor-pointer flex flex-col sm:flex-row gap-3.5 items-center justify-between ${
                      selectedProductDetail?.title === prod.title
                        ? 'bg-white border-brand-500 shadow-md ring-2 ring-brand-500/20'
                        : 'bg-white/80 hover:bg-white border-stone-200 hover:shadow-xs'
                    }`}
                  >
                    {/* Mahsulot rasmi */}
                    <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-white shrink-0 relative flex items-center justify-center border border-stone-100 p-1">
                      <img
                        src={prod.thumbnail}
                        alt={prod.title}
                        className="max-h-full max-w-full object-contain hover:scale-105 transition"
                      />
                      <span className="absolute top-1 left-1 bg-emerald-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                        {prod.source}
                      </span>
                    </div>

                    {/* Mahsulot matni va xususiyatlari */}
                    <div className="flex-1 space-y-1.5">
                      <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 line-clamp-2">
                        {prod.title}
                      </h4>

                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-brand-700 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200">
                          💰 {prod.price}
                        </span>
                        <span className="text-[10px] text-stone-500 font-bold">
                          🏪 {prod.source}
                        </span>
                      </div>

                      {prod.snippet && (
                        <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                          {prod.snippet}
                        </p>
                      )}
                    </div>

                    {/* Do'konga o'tish tugmasi */}
                    <div className="w-full sm:w-auto shrink-0 flex sm:flex-col gap-2">
                      {prod.link && prod.link !== '#' && (
                        <a
                          href={prod.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 sm:flex-initial py-2 px-3.5 bg-gradient-to-r from-brand-600 to-orange-600 hover:brightness-110 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition"
                        >
                          <span>Do‘konga o‘tish</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // B. AGAR HALI QIDIRILMAGAN BO'LSA: JOZIBALI BOSH STANDART BLOK
            <div className="glass-3d rounded-3xl p-8 sm:p-12 text-center space-y-4 border border-orange-200/70 shadow-lg flex flex-col items-center justify-center min-h-[460px]">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 via-orange-500 to-amber-400 text-white flex items-center justify-center shadow-lg animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-base sm:text-lg font-black text-stone-900">
                  Variantlar ekranning shu qismida paydo bo‘ladi
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                  Chap tomondagi maydonga qidirayotgan texnikangizni yozing yoki namunaviy tugmalardan birini bosing. AI O‘zbekiston onlayn platformalaridan rasmlar, narxlar va do‘kon linklarini taqdim etadi.
                </p>
              </div>

              {/* Namunaviy tezkor tanlovlar */}
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleRunSearch("12 lik konditsioner Xorazmga")}
                  className="px-3 py-1.5 bg-white/90 hover:bg-orange-100 text-stone-800 text-xs font-bold rounded-xl border border-stone-200 transition shadow-2xs"
                >
                  ❄️ 12 lik konditsioner Xorazm
                </button>
                <button
                  type="button"
                  onClick={() => handleRunSearch("Smart TV 50 duym Toshkent")}
                  className="px-3 py-1.5 bg-white/90 hover:bg-orange-100 text-stone-800 text-xs font-bold rounded-xl border border-stone-200 transition shadow-2xs"
                >
                  📺 Smart TV 50 Toshkent
                </button>
                <button
                  type="button"
                  onClick={() => handleRunSearch("Muzlatgich No Frost Samarqand")}
                  className="px-3 py-1.5 bg-white/90 hover:bg-orange-100 text-stone-800 text-xs font-bold rounded-xl border border-stone-200 transition shadow-2xs"
                >
                  ❄️ Muzlatgich Samarqand
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
