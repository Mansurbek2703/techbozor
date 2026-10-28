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
  ChevronRight,
  User,
  DollarSign
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

  // AI loading and result states
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
    '5 million so‘m budjetga 55 talik Smart televizor kerak, tasviri tiniq bo‘lsin',
    'Samarqandga 7 mln so‘mgacha NoFrost katta sovutkich kerak, LG yoki Samsung',
    '4 mln so‘m atrofida inverterli avtomat kir yuvish mashinasi, 7-8 kg',
    '18 lik inverter konditsioner, 50 kv metrga, qishda ham isitadigan',
  ];

  const handleCategoryChange = (catId: CategoryKey) => {
    setSelectedCategory(catId);
    setActiveFilters({});
  };

  const handleRunAiAnalysis = async (customPrompt?: string) => {
    const textToAnalyze = customPrompt || promptText;
    if (!textToAnalyze || textToAnalyze.trim().length < 3) {
      alert('Iltimos, kerakli texnika haqida qisqacha yozing.');
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
      setSubmitError('Iltimos, to‘g‘ri telefon raqamingizni kiriting');
      return;
    }

    const budgetNum = parseInt(budgetInput.replace(/\D/g, ''), 10);
    if (!budgetNum || budgetNum <= 0) {
      setSubmitError('Iltimos, budjetingizni to‘g‘ri kiriting');
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
      case 'tv': return <Tv className="w-5 h-5" />;
      case 'fridge': return <Refrigerator className="w-5 h-5" />;
      case 'washing': return <Shirt className="w-5 h-5" />;
      case 'ac': return <Wind className="w-5 h-5" />;
      case 'vacuum': return <Zap className="w-5 h-5" />;
      case 'stove': return <Flame className="w-5 h-5" />;
      case 'microwave': return <Utensils className="w-5 h-5" />;
      default: return <Tv className="w-5 h-5" />;
    }
  };

  const currentCategoryData = getCategoryById(selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* MUVAFFAQIYATLI YUBORILGAN TALAB BANNERI */}
      {createdRequest && (
        <div className="bg-orange-50 border-2 border-brand-500 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-copper-header text-white flex items-center justify-center shrink-0 shadow-lg">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                Talabingiz qabul qilindi va sotuvchilarga SMS yuborildi!
              </h2>
              <p className="text-sm text-stone-700">
                Talab ID: <strong className="font-bold text-brand-700">{createdRequest.data.id}</strong>. 
                Sizning hududingizdagi sotuvchilar taklif kiritganda telefoningizga SMS orqali narxlar keladi.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto font-mono text-xs sm:text-sm text-stone-800 bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 truncate">
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
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Nusxalandi' : 'Nusxalash'}</span>
              </button>
              <Link
                href={`/request/${createdRequest.data.id}`}
                className="flex-1 sm:flex-none px-5 py-2.5 gradient-copper-header text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Takliflarni ko‘rish</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ASOSIY ISHCHI BO'LIM (DESKTOPDA 2 TA KENG USTUN, MOBILDA TARTIBLI KETMA-KETLIK) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CHAP BO'LIM (7 USTUN): AI QIDIRUV, KATEGORIYALAR VA SMART FILTRLAR */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Oddiy tilda tavsiflash & AI tahlil */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-orange-100 shadow-md shadow-orange-950/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-black tracking-wider text-brand-600 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-500" />
                Oddiy tilda qidirish
              </span>
              <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
                Ro‘yxatdan o‘tish shart emas
              </span>
            </div>

            <div className="relative">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={3}
                placeholder="Qanday maishiy texnika kerak? Masalan: 5 million so‘mga 55 dyuymli Smart televizor kerak..."
                className="w-full rounded-2xl border-2 border-stone-200 p-4 text-sm sm:text-base text-stone-900 placeholder:text-stone-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition resize-none outline-none"
              />
              <button
                type="button"
                onClick={() => handleRunAiAnalysis()}
                disabled={isAiLoading || !promptText.trim()}
                className="absolute right-3 bottom-3 px-4 py-2 gradient-copper-header hover:brightness-105 disabled:opacity-50 text-white rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-brand-500/20 active:scale-95 transition"
              >
                {isAiLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>AI Tavsiya</span>
                  </>
                )}
              </button>
            </div>

            {/* Qisqa namunalar */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {samplePrompts.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPromptText(s);
                    handleRunAiAnalysis(s);
                  }}
                  className="text-left text-xs bg-stone-50 hover:bg-orange-50 hover:text-brand-700 border border-stone-200 rounded-lg px-2.5 py-1 text-stone-600 transition"
                >
                  💡 {s}
                </button>
              ))}
            </div>

            {/* AI Tahlil natijalari kartalari */}
            {aiResult && (
              <div className="mt-4 p-4 sm:p-5 bg-gradient-to-br from-orange-50/80 via-amber-50/50 to-white rounded-2xl border border-brand-200 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-brand-200/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg gradient-copper-header text-white flex items-center justify-center font-bold text-xs">
                      AI
                    </span>
                    <span className="font-extrabold text-sm text-stone-900">
                      Bozor tahlili: {aiResult.categoryName} ({aiResult.budget.toLocaleString('uz-UZ')} so‘m)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-brand-700 bg-brand-100 px-2.5 py-0.5 rounded-full">
                    Tavsiya etilgan modellar
                  </span>
                </div>

                {aiResult.marketCheckNote && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{aiResult.marketCheckNote}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {aiResult.recommendations.map((rec, rIdx) => (
                    <div 
                      key={rIdx}
                      className="bg-white rounded-xl border border-stone-200 p-3 flex flex-col justify-between shadow-sm hover:border-brand-400 transition"
                    >
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-brand-700 bg-orange-100 px-1.5 py-0.5 rounded">
                          {rec.brand}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-2">
                          {rec.brand} {rec.model}
                        </h4>
                        <div className="text-sm font-black text-brand-600">
                          ~{rec.estimatedPrice.toLocaleString('uz-UZ')} so‘m
                        </div>
                        <p className="text-[11px] text-stone-500 line-clamp-2">
                          {rec.reason}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPromptText(`Menga ${rec.brand} ${rec.model} kerak. Budjet: ${rec.estimatedPrice.toLocaleString('uz-UZ')} so‘m.`);
                          setBudgetInput(rec.estimatedPrice.toString());
                        }}
                        className="mt-2 w-full py-1.5 text-xs font-bold text-brand-600 hover:bg-orange-50 border border-orange-200 rounded-lg transition"
                      >
                        Talabga olish
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Kategoriyalar va Smart filtrlar */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-orange-100 shadow-md shadow-orange-950/5 space-y-4">
            <span className="text-xs uppercase font-black tracking-wider text-stone-500 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-brand-500" />
              Kategoriyalar va Parametrlar
            </span>

            {/* Kategoriya tugmalari */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition shrink-0 active:scale-95 ${
                      isSelected
                        ? 'gradient-copper-header text-white shadow-md shadow-brand-500/25'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {getCategoryIcon(cat.id)}
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Smart filtrlar */}
            {currentCategoryData && (
              <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3">
                <span className="text-xs font-bold text-stone-600 block">
                  {currentCategoryData.name} parametrlari (Ixtiyoriy):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {currentCategoryData.filters.map((filter) => (
                    <div key={filter.id} className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700">
                        {filter.label}
                      </label>
                      <select
                        value={activeFilters[filter.id] || 'Hammasi'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setActiveFilters(prev => ({ ...prev, [filter.id]: val }));
                        }}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-900 focus:border-brand-500 outline-none"
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
              </div>
            )}
          </div>
        </div>

        {/* O'NG BO'LIM (5 USTUN): TALABNI JOYLASHTIRISH SHAKLI (DESKTOPDA KATTA VA QULAY) */}
        <div id="request-form" className="lg:col-span-5 space-y-4">
          <form 
            onSubmit={handleSubmitRequest}
            className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-200 shadow-xl shadow-orange-950/5 space-y-5"
          >
            <div className="border-b border-stone-100 pb-3">
              <span className="text-xs uppercase font-black tracking-wider text-brand-600 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-brand-600" />
                Talab joylashtirish
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                Sotuvchilardan narx olish
              </h2>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="space-y-3.5">
              {/* Budjet */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                  <span>Ajratilgan budjet (so‘mda) *</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    placeholder="5000000"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-base font-black text-stone-900 focus:bg-white focus:border-brand-500 outline-none"
                  />
                  <span className="absolute right-4 top-3 text-xs font-black text-brand-600">so‘m</span>
                </div>
              </div>

              {/* Viloyat */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  <span>Hududingiz (Viloyat) *</span>
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value as Region)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm font-bold text-stone-900 focus:bg-white focus:border-brand-500 outline-none"
                >
                  {UZBEKISTAN_REGIONS.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tuman / Shahar */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  Tuman yoki shahar (ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Masalan: Yunusobod yoki Samarqand sh."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>

              {/* Amal qilish muddati */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-600" />
                  <span>Talab muddati *</span>
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm font-bold text-stone-900 focus:bg-white focus:border-brand-500 outline-none"
                >
                  <option value={1}>1 kun (Shoshilinch)</option>
                  <option value={3}>3 kun</option>
                  <option value={7}>7 kun (Tavsiya etiladi)</option>
                  <option value={14}>14 kun (2 hafta)</option>
                  <option value={30}>30 kun</option>
                </select>
              </div>

              {/* Ism */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span>Ismingiz *</span>
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Ismingizni kiriting"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>

              {/* Telefon */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5 text-brand-600" />
                  <span>Telefon raqamingiz (SMS olish uchun) *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm font-black text-stone-900 focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            {/* Rozilik */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsConsent}
                  onChange={(e) => setSmsConsent(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-brand-600 border-stone-300 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-[11px] text-stone-600 leading-tight">
                  Sotuvchilardan SMS orqali narx takliflarini qabul qilishga roziman
                </span>
              </label>
            </div>

            {/* Yuborish tugmasi */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl gradient-copper-header hover:brightness-105 text-white font-black text-base shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" />
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
