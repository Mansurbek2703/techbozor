'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  MapPin, 
  Clock, 
  PhoneCall, 
  Tv, 
  Refrigerator, 
  Shirt, 
  Wind, 
  Flame, 
  Utensils, 
  Zap,
  SlidersHorizontal,
  User,
  X,
  ArrowRight
} from 'lucide-react';
import { CATEGORIES, getCategoryById } from '@/lib/categories';
import { CategoryKey, Region, UZBEKISTAN_REGIONS, AIRecommendation } from '@/types';

export default function HomePage() {
  // Input states
  const [promptText, setPromptText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('tv');
  const [selectedRegion, setSelectedRegion] = useState<Region>('Toshkent shahri');
  const [district, setDistrict] = useState('');
  const [budgetInput, setBudgetInput] = useState<string>('5000000');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('+998 ');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [smsConsent, setSmsConsent] = useState(true);

  // Dynamic category filters
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // AI loading and result states (Dastlab NULL - hech qanday tavsiya oldindan chiqmaydi!)
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    category: CategoryKey;
    categoryName: string;
    budget: number;
    extractedSpecs: Record<string, string>;
    qualityWishes: string[];
    marketCheckNote?: string;
    recommendations: AIRecommendation[];
  } | null>(null);

  // Request submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<any | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Quick samples
  const samplePrompts = [
    '5 mln so‘mga 55 talik Smart TV',
    '7 mln gacha NoFrost katta sovutkich',
    'Inverter avtomat kir yuvish 7-8 kg',
    '18 lik inverter konditsioner 50 m²',
  ];

  const handleCategoryChange = (catId: CategoryKey) => {
    setSelectedCategory(catId);
    setActiveFilters({});
  };

  // Faqat foydalanuvchi so'rov yozganda AI tahlil chaqiriladi
  const handleRunAiAnalysis = async (customPrompt?: string) => {
    const textToAnalyze = customPrompt || promptText;
    if (!textToAnalyze || textToAnalyze.trim().length < 3) {
      alert('Iltimos, qidirayotgan texnikangiz haqida yozing.');
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToAnalyze }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiResult(data.data);
        setSelectedCategory(data.data.category);
        if (data.data.budget > 0) {
          setBudgetInput(data.data.budget.toString());
        }
        if (data.data.extractedSpecs) {
          setActiveFilters(data.data.extractedSpecs);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!buyerName.trim()) {
      setSubmitError('Iltimos, ismingizni kiriting');
      return;
    }

    const cleanPhone = buyerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      setSubmitError('Iltimos, telefon raqamingizni to‘g‘ri kiriting');
      return;
    }

    const budgetNum = parseInt(budgetInput.replace(/\D/g, ''), 10);
    if (!budgetNum || budgetNum <= 0) {
      setSubmitError('Iltimos, budjetingizni kiriting');
      return;
    }

    const finalDescription = promptText.trim() || `${selectedRegion} viloyatiga ${getCategoryById(selectedCategory)?.name} kerak. Budjet: ${budgetNum.toLocaleString('uz-UZ')} so‘m.`;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName: buyerName.trim(),
          buyerPhone: buyerPhone.trim(),
          category: selectedCategory,
          description: finalDescription,
          budget: budgetNum,
          region: selectedRegion,
          district: district.trim(),
          specifications: activeFilters,
          durationDays: durationDays,
          smsConsent: smsConsent,
          aiExtracted: aiResult ? {
            category: aiResult.category,
            budget: aiResult.budget,
            specs: aiResult.extractedSpecs,
          } : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setCreatedRequest(data);
      } else {
        setSubmitError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setSubmitError('Server bilan ulanishda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (key: CategoryKey) => {
    switch (key) {
      case 'tv': return <Tv className="w-4 h-4" />;
      case 'fridge': return <Refrigerator className="w-4 h-4" />;
      case 'washing': return <Shirt className="w-4 h-4" />;
      case 'ac': return <Wind className="w-4 h-4" />;
      case 'vacuum': return <Zap className="w-4 h-4" />;
      case 'stove': return <Flame className="w-4 h-4" />;
      case 'microwave': return <Utensils className="w-4 h-4" />;
      default: return <Tv className="w-4 h-4" />;
    }
  };

  const currentCategoryData = getCategoryById(selectedCategory);

  return (
    <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 space-y-4">

      {/* MUVAFFAQIYATLI JOYLASHTIRILGAN TALAB MODALI */}
      {createdRequest && (
        <div className="bg-white/90 backdrop-blur-2xl border-2 border-brand-500 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl gradient-copper-header text-white flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/25">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-stone-900">
                  Talabingiz qabul qilindi va sotuvchilarga SMS yuborildi!
                </h2>
                <p className="text-xs text-stone-600">
                  Talab ID: <strong className="font-bold text-brand-700">{createdRequest.data.id}</strong>. 
                  Sotuvchilar taklif yuborganda telefoningizga SMS orqali narxlar keladi.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setCreatedRequest(null)}
              className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto font-mono text-xs text-stone-800 bg-white/80 px-3 py-2 rounded-xl border border-stone-200 truncate">
              {typeof window !== 'undefined' ? `${window.location.origin}/request/${createdRequest.data.id}` : `/request/${createdRequest.data.id}`}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    navigator.clipboard.writeText(`${window.location.origin}/request/${createdRequest.data.id}`);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }
                }}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Nusxalandi' : 'Nusxalash'}</span>
              </button>
              <Link
                href={`/request/${createdRequest.data.id}`}
                className="flex-1 sm:flex-none px-4 py-2 gradient-copper-header text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Takliflarni ochish</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ASOSIY 2-USTUNLI IXCHAM GRID (DESKTOPDA SCROLLSIZ SIG'ADI) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* CHAP BO'LIM (7 USTUN): KATEGORIYALAR, PARAMETRLAR VA MATNLI QIDIRUV */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* 1. Kategoriyalarni tanlash (Boyitilgan, ixcham shisha tugmalar) */}
          <div className="bg-white/75 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-white/80 shadow-md shadow-orange-950/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider text-stone-600 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-500" />
                Qurilma turini tanlang:
              </span>
              <span className="text-[11px] font-bold text-brand-700 bg-orange-100/70 px-2.5 py-0.5 rounded-full">
                {currentCategoryData?.name}
              </span>
            </div>

            {/* Kategoriya shisha tugmalari (Gorizontal ixcham skroll) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition shrink-0 active:scale-95 ${
                      isSelected
                        ? 'gradient-copper-header text-white shadow-md shadow-brand-500/25'
                        : 'bg-white/80 hover:bg-white text-stone-700 border border-orange-100/80 shadow-sm'
                    }`}
                  >
                    {getCategoryIcon(cat.id)}
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Smart parametrlar (Ixcham 4 ta select, sahifani cho'zmaydi) */}
            {currentCategoryData && (
              <div className="pt-2 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {currentCategoryData.filters.map((filter) => (
                  <div key={filter.id} className="space-y-0.5">
                    <label className="text-[11px] font-semibold text-stone-600 truncate block">
                      {filter.label}
                    </label>
                    <select
                      value={activeFilters[filter.id] || 'Hammasi'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setActiveFilters(prev => ({ ...prev, [filter.id]: val }));
                      }}
                      className="w-full bg-white/90 border border-stone-200/90 rounded-xl px-2.5 py-1.5 text-xs text-stone-900 focus:border-brand-500 outline-none shadow-sm cursor-pointer"
                    >
                      {filter.options?.map((opt, oIdx) => (
                        <option key={oIdx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Oddiy tilda tasvirlash (AI faqat xabar yozilganda ishlaydi!) */}
          <div className="bg-white/75 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-white/80 shadow-md shadow-orange-950/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider text-brand-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                Oddiy tilda yozing:
              </span>
              <span className="text-[10px] text-stone-500 font-medium">
                AI faqat siz so‘raganda tahlil qiladi
              </span>
            </div>

            <div className="relative">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleRunAiAnalysis();
                  }
                }}
                rows={2}
                placeholder="Masalan: 5 million so‘mga 55 dyuymli Smart televizor kerak, ovozi va tasviri yaxshi bo‘lsin..."
                className="w-full rounded-2xl bg-white/90 border border-stone-200 p-3 pr-28 text-xs sm:text-sm text-stone-900 placeholder:text-stone-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition resize-none outline-none shadow-inner"
              />
              <button
                type="button"
                onClick={() => handleRunAiAnalysis()}
                disabled={isAiLoading || !promptText.trim()}
                className="absolute right-2.5 bottom-2.5 px-3 py-1.5 gradient-copper-header hover:brightness-105 disabled:opacity-40 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20 active:scale-95 transition"
              >
                {isAiLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Tavsiya</span>
                  </>
                )}
              </button>
            </div>

            {/* Qulay namunalar chipslari */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-stone-600 uppercase">Namunalar:</span>
              {samplePrompts.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPromptText(s);
                    handleRunAiAnalysis(s);
                  }}
                  className="text-left text-[11px] bg-white/80 hover:bg-orange-50 hover:text-brand-700 border border-stone-200/70 rounded-lg px-2 py-0.5 text-stone-600 transition"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* AI Tahlil natijasi (FAQAT VA FAQAT FOYDALANUVCHI SO'ROV YUBORGANDAGINA CHIQADI!) */}
            {aiResult && (
              <div className="mt-3 p-3.5 sm:p-4 bg-orange-50/90 rounded-2xl border border-brand-200/80 space-y-3 animate-fade-in relative">
                <div className="flex items-center justify-between border-b border-brand-200/60 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg gradient-copper-header text-white flex items-center justify-center font-bold text-[10px]">
                      AI
                    </span>
                    <span className="font-extrabold text-xs sm:text-sm text-stone-900">
                      Bozor tahlili: {aiResult.categoryName} ({aiResult.budget.toLocaleString('uz-UZ')} so‘m)
                    </span>
                  </div>
                  <button 
                    onClick={() => setAiResult(null)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-orange-100/60"
                    title="Yopish"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {aiResult.marketCheckNote && (
                  <div className="p-2.5 bg-amber-100/70 border border-amber-300 rounded-xl text-amber-950 text-xs flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{aiResult.marketCheckNote}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {aiResult.recommendations.map((rec, rIdx) => (
                    <div 
                      key={rIdx}
                      className="bg-white/95 rounded-xl border border-stone-200 p-2.5 flex flex-col justify-between shadow-sm hover:border-brand-400 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-brand-700 bg-orange-100 px-1.5 py-0.5 rounded">
                            {rec.brand}
                          </span>
                          <span className="text-[10px] font-black text-brand-600">
                            ~{rec.estimatedPrice.toLocaleString('uz-UZ')} so‘m
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-stone-900 line-clamp-1">
                          {rec.brand} {rec.model}
                        </h4>
                        <p className="text-[10px] text-stone-500 line-clamp-2">
                          {rec.reason}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPromptText(`Menga ${rec.brand} ${rec.model} kerak. Budjet: ${rec.estimatedPrice.toLocaleString('uz-UZ')} so‘m.`);
                          setBudgetInput(rec.estimatedPrice.toString());
                        }}
                        className="mt-2 w-full py-1 text-[11px] font-bold text-brand-700 hover:bg-orange-50 border border-orange-200 rounded-lg transition"
                      >
                        Talabga olish
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* O'NG BO'LIM (5 USTUN): TALABNI JOYLASHTIRISH FORMASI (IXCHAM, SHISHA EFFEKTLI) */}
        <div className="lg:col-span-5">
          <form 
            onSubmit={handleSubmitRequest}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/90 shadow-xl shadow-orange-950/5 space-y-3.5"
          >
            <div className="border-b border-stone-100 pb-2.5 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-black tracking-wider text-brand-600 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-brand-600" />
                  Talab joylashtirish
                </span>
                <h2 className="text-base sm:text-lg font-black text-stone-900">
                  Sotuvchilardan narx olish
                </h2>
              </div>
              <span className="text-[11px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full font-semibold">
                SMS orqali
              </span>
            </div>

            {submitError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="space-y-2.5">
              {/* Budjet va Viloyat (bitta qatorda 2 ta maydon) */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[11px] font-bold text-stone-700">Budjet (so‘mda) *</label>
                  <input
                    type="text"
                    required
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    placeholder="5000000"
                    className="w-full bg-white/90 border border-stone-200/90 rounded-xl px-3 py-2 text-xs sm:text-sm font-black text-stone-900 focus:border-brand-500 outline-none shadow-sm"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[11px] font-bold text-stone-700">Hudud (Viloyat) *</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value as Region)}
                    className="w-full bg-white/90 border border-stone-200/90 rounded-xl px-2.5 py-2 text-xs font-bold text-stone-900 focus:border-brand-500 outline-none shadow-sm cursor-pointer"
                  >
                    {UZBEKISTAN_REGIONS.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tuman va Muddat */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[11px] font-semibold text-stone-600">Tuman / shahar</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Yunusobod / Samarqand"
                    className="w-full bg-white/90 border border-stone-200/90 rounded-xl px-3 py-2 text-xs text-stone-900 focus:border-brand-500 outline-none shadow-sm"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[11px] font-semibold text-stone-600">Talab muddati *</label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full bg-white/90 border border-stone-200/90 rounded-xl px-2.5 py-2 text-xs font-bold text-stone-900 focus:border-brand-500 outline-none shadow-sm cursor-pointer"
                  >
                    <option value={1}>1 kun</option>
                    <option value={3}>3 kun</option>
                    <option value={7}>7 kun</option>
                    <option value={14}>14 kun</option>
                    <option value={30}>30 kun</option>
                  </select>
                </div>
              </div>

              {/* Ism va Telefon */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[11px] font-bold text-stone-700">Ismingiz *</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Ismingiz"
                    className="w-full bg-white/90 border border-stone-200/90 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-stone-900 focus:border-brand-500 outline-none shadow-sm"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[11px] font-bold text-stone-700">Telefon (SMS uchun) *</label>
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full bg-white/90 border border-stone-200/90 rounded-xl px-3 py-2 text-xs sm:text-sm font-black text-stone-900 focus:border-brand-500 outline-none shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Rozilik */}
            <div className="pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsConsent}
                  onChange={(e) => setSmsConsent(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-brand-600 border-stone-300 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-[10px] text-stone-600">
                  Sotuvchilardan SMS orqali taklif olishga roziman
                </span>
              </label>
            </div>

            {/* Tugma (Shisha effekti va premium gradient) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl gradient-copper-header hover:brightness-105 text-white font-black text-sm sm:text-base shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Talabni joylashtirish</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
