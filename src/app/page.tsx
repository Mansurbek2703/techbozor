'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ArrowRight,
  Laptop,
  Smartphone,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  Check
} from 'lucide-react';
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/lib/categories';
import { CategoryKey, Region, UZBEKISTAN_REGIONS, AIRecommendation, CategoryInfo } from '@/types';

export default function HomePage() {
  // Categories from dynamic API
  const [categories, setCategories] = useState<CategoryInfo[]>(DEFAULT_CATEGORIES);
  
  // Input states
  const [promptText, setPromptText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('tv');
  const [selectedRegion, setSelectedRegion] = useState<Region>('Toshkent shahri');
  const [district, setDistrict] = useState('');
  const [budgetInput, setBudgetInput] = useState<string>('5000000');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('+998 ');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [smsConsent, setSmsConsent] = useState(true);

  // Dynamic category filters
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // Category search state
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // AI loading and result states (Dastlab NULL)
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    category: string;
    categoryName: string;
    budget: number;
    extractedSpecs: Record<string, string>;
    qualityWishes: string[];
    marketCheckNote?: string;
    economistSummary?: string;
    recommendations: AIRecommendation[];
  } | null>(null);

  // Model preview modal va tanlangan model holati
  const [selectedModelPreview, setSelectedModelPreview] = useState<AIRecommendation | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIRecommendation | null>(null);

  // Request submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<any | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch dynamic categories
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

  // Category select scroll ref
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategoryList = (direction: 'up' | 'down') => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({
        top: direction === 'down' ? 100 : -100,
        behavior: 'smooth',
      });
    }
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategoryId(catId);
    setActiveFilters({});
  };

  // 🎯 TAVSIYAVIY QURILMANI TANLASH BOSILGANDA
  const handleSelectModel = (rec: AIRecommendation) => {
    setSelectedModel(rec);
    setSelectedModelPreview(rec);

    // 1. Kategoriyani aniqlash va o'rnatish
    let targetCatId = rec.categoryKey || selectedCategoryId;
    const directMatch = categories.find(c => c.id === targetCatId);
    if (!directMatch) {
      const nameMatch = categories.find(c => 
        c.name.toLowerCase() === rec.category.toLowerCase() ||
        c.id.toLowerCase() === rec.category.toLowerCase()
      );
      if (nameMatch) targetCatId = nameMatch.id;
    }
    setSelectedCategoryId(targetCatId);

    // 2. Kategoriya parametrlarini (Diagonali, Smart TV, Ekran, Brend...) avtomatik to'ldirish
    const newFilters: Record<string, string> = {};
    const catObj = categories.find(c => c.id === targetCatId);
    if (catObj && catObj.filters) {
      catObj.filters.forEach(filter => {
        // Brend bo'yicha moslash
        if (filter.id.toLowerCase().includes('brand') || filter.label.toLowerCase().includes('brend')) {
          const matchOpt = filter.options?.find(opt => opt.toLowerCase() === rec.brand.toLowerCase());
          if (matchOpt) newFilters[filter.id] = matchOpt;
        }

        // Boshqa parametrlarni specs va model matnidan topish
        const allText = `${rec.model} ${(rec.specs || []).join(' ')}`.toLowerCase();
        filter.options?.forEach(opt => {
          if (opt !== 'Hammasi') {
            const cleanOpt = opt.toLowerCase().replace(/["”]/g, '').trim();
            if (cleanOpt.length >= 2 && allText.includes(cleanOpt)) {
              newFilters[filter.id] = opt;
            }
          }
        });
      });
    }
    setActiveFilters(newFilters);

    // 3. Budjet va tavsif shaklga avtomatik kiritiladi
    setBudgetInput(rec.estimatedPrice.toString());
    setPromptText(`Menga ${rec.brand} ${rec.model} kerak. Bozor narxi: ${rec.estimatedPrice.toLocaleString('uz-UZ')} so‘m.`);
  };

  // AI tahlil chaqirish (FAQAT FOYDALANUVCHI SO'RAGANDA ISHLAYDI)
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
        if (data.data.category) {
          setSelectedCategoryId(data.data.category);
        }
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

    const currentCatObj = categories.find(c => c.id === selectedCategoryId);
    const finalDescription = promptText.trim() || `${selectedRegion} viloyatiga ${currentCatObj?.name || selectedCategoryId} kerak. Budjet: ${budgetNum.toLocaleString('uz-UZ')} so‘m.`;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName: buyerName.trim(),
          buyerPhone: buyerPhone.trim(),
          category: selectedCategoryId,
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

  const getCategoryIcon = (key: string) => {
    switch (key) {
      case 'tv': return <Tv className="w-5 h-5" />;
      case 'fridge': return <Refrigerator className="w-5 h-5" />;
      case 'washing': return <Shirt className="w-5 h-5" />;
      case 'ac': return <Wind className="w-5 h-5" />;
      case 'vacuum': return <Zap className="w-5 h-5" />;
      case 'stove': return <Flame className="w-5 h-5" />;
      case 'microwave': return <Utensils className="w-5 h-5" />;
      case 'laptop': return <Laptop className="w-5 h-5" />;
      case 'phone': return <Smartphone className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  const currentCategoryData = categories.find(c => c.id === selectedCategoryId) || categories[0];

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col justify-between space-y-4">

      {/* 🌟 1. AI DAN TAHLIL ENG YUQORIGA CHIQADI (FOYDALANUVCHI TALABI) */}
      {aiResult && (
        <div className="glass-3d rounded-3xl p-5 sm:p-6 space-y-3 animate-fade-in relative border border-orange-300/40">
          <div className="flex items-center justify-between border-b border-orange-200/50 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl gradient-copper-header text-white flex items-center justify-center font-black text-xs shadow-md shadow-brand-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-stone-900 leading-tight">
                  AI Iqtisodchi & Hisobchi Bozor Tahlili: {aiResult.categoryName} ({aiResult.budget.toLocaleString('uz-UZ')} so‘m)
                </h3>
                <span className="text-[11px] font-semibold text-brand-700">
                  Mediapark.uz, Glotr.uz va rasmiy do‘konlar narxlari asosida tasdiqlangan
                </span>
              </div>
            </div>
            <button 
              onClick={() => setAiResult(null)}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-orange-100/50 transition"
              title="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {aiResult.marketCheckNote && (
            <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-2xl text-amber-950 text-xs sm:text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{aiResult.marketCheckNote}</span>
            </div>
          )}

          {aiResult.economistSummary && (
            <div className="p-3 bg-orange-50/80 border border-orange-200/90 rounded-2xl text-stone-800 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
              <span><strong>Iqtisodiy xulosa:</strong> {aiResult.economistSummary}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {aiResult.recommendations.map((rec, rIdx) => (
              <div 
                key={rIdx}
                onClick={() => handleSelectModel(rec)}
                className="glass-3d-card rounded-2xl p-4 flex flex-col justify-between hover:scale-[1.01] transition-transform cursor-pointer group border border-orange-200/70"
              >
                <div className="space-y-2">
                  {/* Rasm va brend nishoni */}
                  <div className="w-full h-32 rounded-xl overflow-hidden bg-stone-100 relative mb-1">
                    <img 
                      src={rec.imageUrl} 
                      alt={rec.model} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                    />
                    <div className="absolute top-2 left-2 bg-brand-700 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                      {rec.brand}
                    </div>
                    {rec.energyClass && (
                      <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                        {rec.energyClass}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-500 truncate">
                      {rec.officialSource || 'Mediapark / Rasmiy'}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-brand-600">
                      ~{rec.estimatedPrice.toLocaleString('uz-UZ')} so‘m
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-stone-900 line-clamp-1 group-hover:text-brand-700 transition">
                    {rec.brand} {rec.model}
                  </h4>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {rec.economicBenefit || rec.reason}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectModel(rec);
                  }}
                  className="mt-3 w-full py-2 text-xs font-bold text-white gradient-copper-header rounded-xl shadow-sm hover:brightness-105 transition active:scale-95 flex items-center justify-center gap-1"
                >
                  <span>Ushbu modelni tanlash</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MUVAFFAQIYATLI TALAB JOYLASHTIRILGANDA */}
      {createdRequest && (
        <div className="glass-3d rounded-3xl p-5 sm:p-6 space-y-3 animate-fade-in border-2 border-brand-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl gradient-copper-header text-white flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900">
                  Talabingiz qabul qilindi va sotuvchilarga SMS yuborildi!
                </h3>
                <p className="text-xs text-stone-600">
                  Talab raqami: <strong className="text-brand-700 font-bold">{createdRequest.data.id}</strong>. Sotuvchilar narx berishi bilan SMS olasiz.
                </p>
              </div>
            </div>
            <button onClick={() => setCreatedRequest(null)} className="p-1 text-stone-400 hover:text-stone-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <input 
              readOnly 
              value={typeof window !== 'undefined' ? `${window.location.origin}/request/${createdRequest.data.id}` : `/request/${createdRequest.data.id}`}
              className="w-full sm:w-auto flex-1 bg-white/90 border border-stone-200 px-3 py-2 rounded-xl text-xs font-mono"
            />
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(`${window.location.origin}/request/${createdRequest.data.id}`);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }
              }}
              className="w-full sm:w-auto px-4 py-2 bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Nusxalandi' : 'Nusxalash'}</span>
            </button>
            <Link
              href={`/request/${createdRequest.data.id}`}
              className="w-full sm:w-auto px-5 py-2 gradient-copper-header text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5"
            >
              <span>Takliflarni ochish</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* 2. ASOSIY 2-USTUNLI 3D OYNA KO'RINISHI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* CHAP BO'LIM (7 USTUN): 
            1-O'RINDA: ODDIY TILDA TAVSIF YOZISH (AI TAHLIL) 
            2-O'RINDA: QURILMA TURINI TANLASH (SEARCH VA UP/DOWN SCROLL SELECT BILAN) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          
          {/* 🔼 A. BIRINCHI O'RINDA: ODDIY TILDA TAVSIF YOZISH MAYDONI */}
          <div className="glass-3d rounded-3xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider text-brand-600 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-500" />
                Oddiy tilda tavsif yozing (AI Iqtisodchi & Hisobchi tahlil qiladi):
              </span>
              <span className="text-[10px] text-stone-600 font-bold bg-orange-100/80 px-2.5 py-0.5 rounded-full border border-orange-200">
                Mediapark & Glotr ochiq bazasi
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
                rows={3}
                placeholder="Masalan: 5 million so‘mga 55 dyuymli Smart televizor kerak, ovozi va tasviri yaxshi bo‘lsin..."
                className="w-full rounded-2xl glass-3d-input p-3.5 pr-32 text-xs sm:text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none resize-none"
              />
              <button
                type="button"
                onClick={() => handleRunAiAnalysis()}
                disabled={isAiLoading || !promptText.trim()}
                className="absolute right-3 bottom-3 px-4 py-2.5 glass-3d-button disabled:opacity-40 text-white rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 transition"
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
          </div>

          {/* 🔽 B. IKKINCHI O'RINDA: QURILMA TURINI TANLASH (SEARCH + UP/DOWN SCROLL SELECT + MAXSUS PARAMETRLAR) */}
          <div className="glass-3d rounded-3xl p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Sarlovha va Tanlangan texnika indikatori */}
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold tracking-wider text-stone-600 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                  Qurilma yoki texnika turini tanlang:
                </span>
                <span className="text-xs font-black text-brand-700 bg-orange-100/90 border border-orange-200 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-xs">
                  {getCategoryIcon(currentCategoryData.id)}
                  <span>{currentCategoryData.name}</span>
                </span>
              </div>

              {/* SEARCH VA UP/DOWN SCROLL SELECT QURILMALAR ORASIDA */}
              <div className="glass-3d-card rounded-2xl p-3 border border-orange-200/80 space-y-2">
                {/* Search va Scroll navigatsiya boshqaruvi */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={categorySearchQuery}
                      onChange={(e) => setCategorySearchQuery(e.target.value)}
                      placeholder="Qurilma turini qidiring (Televizor, Sovutkich, Kir yuvish, Noutbuk...)"
                      className="w-full glass-3d-input rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    {categorySearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCategorySearchQuery('')}
                        className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
                        title="Tozalash"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Up va Down scroll tugmalari */}
                  <div className="flex items-center gap-1 bg-stone-100/90 p-1 rounded-xl border border-stone-200/70 shrink-0">
                    <button
                      type="button"
                      onClick={() => scrollCategoryList('up')}
                      title="Yuqoriga aylantirish (Scroll Up)"
                      className="p-1.5 rounded-lg bg-white hover:bg-orange-50 text-stone-700 hover:text-brand-600 shadow-xs active:scale-90 transition border border-stone-200/60"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollCategoryList('down')}
                      title="Pastga aylantirish (Scroll Down)"
                      className="p-1.5 rounded-lg bg-white hover:bg-orange-50 text-stone-700 hover:text-brand-600 shadow-xs active:scale-90 transition border border-stone-200/60"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Qurilmalar orasida Up / Down scroll bo'ladigan select option ro'yxati */}
                <div
                  ref={categoryScrollRef}
                  className="max-h-40 sm:max-h-44 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scroll-smooth"
                >
                  {filteredCategories.length === 0 ? (
                    <div className="py-6 text-center text-xs text-stone-500 font-medium">
                      "{categorySearchQuery}" bo‘yicha texnika topilmadi
                    </div>
                  ) : (
                    filteredCategories.map((cat) => {
                      const isSelected = selectedCategoryId === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat.id)}
                          className={`w-full p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition select-none ${
                            isSelected
                              ? 'gradient-copper-header text-white shadow-md shadow-brand-500/25 scale-[1.005]'
                              : 'bg-white/85 hover:bg-orange-50/80 text-stone-800 border border-stone-200/60 hover:border-orange-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-orange-100 text-brand-700'
                            }`}>
                              {getCategoryIcon(cat.id)}
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-extrabold flex items-center gap-2">
                                <span>{cat.name}</span>
                                {isSelected && (
                                  <span className="text-[10px] bg-white text-brand-700 font-black px-2 py-0.5 rounded-full shadow-xs">
                                    Tanlangan
                                  </span>
                                )}
                              </div>
                              <div className={`text-[11px] truncate max-w-[240px] sm:max-w-md ${isSelected ? 'text-white/85' : 'text-stone-500'}`}>
                                {cat.description || 'Barcha turlari va modellari'}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 pl-2">
                            {isSelected ? (
                              <div className="w-6 h-6 rounded-full bg-white text-brand-700 flex items-center justify-center shadow-xs">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-stone-300"></div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Tanlangan texnikaning maxsus parametrlari (Diagonali, Smart TV, Ekran, Brend...) */}
              {currentCategoryData && currentCategoryData.filters && currentCategoryData.filters.length > 0 && (
                <div className="pt-2.5 border-t border-stone-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {currentCategoryData.filters.map((filter) => (
                    <div key={filter.id} className="space-y-1">
                      <label className="text-[11px] font-bold text-stone-600 truncate block">
                        {filter.label}
                      </label>
                      <select
                        value={activeFilters[filter.id] || 'Hammasi'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setActiveFilters(prev => ({ ...prev, [filter.id]: val }));
                        }}
                        className="w-full glass-3d-input rounded-xl px-2.5 py-1.5 text-xs font-semibold text-stone-900 focus:outline-none cursor-pointer"
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
          </div>
        </div>

        {/* O'NG BO'LIM (5 USTUN): TALAB JOYLASHTIRISH FORMASI (3D OYNA KARTASI) */}
        <div className="lg:col-span-5 flex flex-col" id="request-form-section">
          <form 
            onSubmit={handleSubmitRequest}
            className="glass-3d rounded-3xl p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between"
          >
            <div className="border-b border-stone-200/60 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-black tracking-wider text-brand-600 flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-brand-600" />
                  Talab joylashtirish
                </span>
                <h2 className="text-lg sm:text-xl font-black text-stone-900 mt-0.5">
                  Sotuvchilardan narx olish
                </h2>
              </div>
              <span className="text-xs font-bold text-stone-600 bg-white/80 border border-stone-200/60 px-3 py-1 rounded-xl shadow-sm">
                SMS orqali
              </span>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50/90 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Tanlangan tavsiyaviy model indikatori */}
            {selectedModel && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-100/90 to-amber-100/90 border border-brand-300 flex items-center justify-between shadow-xs animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <img 
                    src={selectedModel.imageUrl} 
                    alt={selectedModel.model} 
                    className="w-11 h-11 object-cover rounded-xl shadow-xs border border-orange-200" 
                  />
                  <div>
                    <div className="text-xs font-black text-brand-900 flex items-center gap-1.5">
                      <span>{selectedModel.brand} {selectedModel.model}</span>
                      <span className="text-[9px] bg-brand-600 text-white font-extrabold px-1.5 py-0.5 rounded">Tanlangan</span>
                    </div>
                    <div className="text-[11px] font-bold text-brand-700">
                      ~{selectedModel.estimatedPrice.toLocaleString('uz-UZ')} so‘m ({selectedModel.category})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => setSelectedModelPreview(selectedModel)}
                    className="text-[11px] font-bold text-brand-700 hover:text-brand-900 bg-white/80 px-2.5 py-1 rounded-lg border border-brand-200 hover:bg-white transition flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Xususiyatlar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedModel(null)}
                    className="p-1 text-stone-400 hover:text-stone-700"
                    title="Modelni bekor qilish"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 flex-1 flex flex-col justify-around">
              {/* Budjet va Hudud */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Budjet (so‘mda) *</label>
                  <input
                    type="text"
                    required
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    placeholder="5000000"
                    className="w-full glass-3d-input rounded-xl px-3.5 py-2.5 text-sm sm:text-base font-black text-stone-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Hudud (Viloyat) *</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value as Region)}
                    className="w-full glass-3d-input rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-stone-900 focus:outline-none cursor-pointer"
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-600">Tuman / shahar</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Yunusobod / Samarqand"
                    className="w-full glass-3d-input rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-600">Talab muddati *</label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full glass-3d-input rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-stone-900 focus:outline-none cursor-pointer"
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Ismingiz *</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Ismingiz"
                    className="w-full glass-3d-input rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Telefon raqam (SMS) *</label>
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full glass-3d-input rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-black text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsConsent}
                    onChange={(e) => setSmsConsent(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 border-stone-300 focus:ring-brand-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-stone-600 font-medium">
                    Sotuvchilardan SMS orqali narx takliflarini qabul qilishga roziman
                  </span>
                </label>
              </div>
            </div>

            {/* Katta 3D oyna tugmasi */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 glass-3d-button text-white font-black text-base sm:text-lg rounded-2xl active:scale-[0.98] transition flex items-center justify-center gap-2 mt-2"
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

      {/* 🌟 3. TAVSIYAVIY QURILMA RASMLARI VA XUSUSIYATLARI OYNASI (MODAL) */}
      {selectedModelPreview && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto">
          <div className="glass-3d bg-white/95 max-w-3xl w-full rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xl border-2 border-orange-300 relative my-auto">
            {/* Oyna sarlovhasi va Yopish */}
            <div className="flex items-start justify-between border-b border-orange-200/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl gradient-copper-header text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
                  {getCategoryIcon(selectedModelPreview.categoryKey || selectedCategoryId)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white bg-brand-700 px-2.5 py-0.5 rounded-lg uppercase">
                      {selectedModelPreview.brand}
                    </span>
                    <span className="text-[11px] font-bold text-brand-700 bg-orange-100/90 px-2.5 py-0.5 rounded-lg border border-orange-200">
                      {selectedModelPreview.officialSource || 'Mediapark.uz / Rasmiy diler'}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-stone-900 mt-0.5">
                    {selectedModelPreview.brand} {selectedModelPreview.model}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedModelPreview(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-orange-100/60 transition"
                title="Yopish"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Asosiy ma'lumotlar: Rasm va Iqtisodiy Tahlil */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Mahsulotning fototasviri (5 ustun) */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="w-full aspect-square rounded-2xl overflow-hidden glass-3d-card p-2 border-2 border-orange-200/80 shadow-md relative group bg-stone-100">
                  <img
                    src={selectedModelPreview.imageUrl}
                    alt={`${selectedModelPreview.brand} ${selectedModelPreview.model}`}
                    className="w-full h-full object-cover rounded-xl transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                    Real foto
                  </div>
                  {selectedModelPreview.energyClass && (
                    <div className="absolute bottom-4 right-4 bg-emerald-600/95 backdrop-blur-sm text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm">
                      Sinf: {selectedModelPreview.energyClass}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-center text-[11px] text-stone-500 font-semibold">
                  {selectedModelPreview.warrantyYears ? `${selectedModelPreview.warrantyYears} yil rasmiy servis kafolati` : 'Rasmiy diler kafolati'}
                </div>
              </div>

              {/* Iqtisodiy va Texnik pasport (7 ustun) */}
              <div className="md:col-span-7 space-y-3.5">
                {/* Narx va Bozor oralig'i */}
                <div className="p-3.5 rounded-2xl bg-orange-50/90 border border-orange-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 block">Mediapark & Glotr narxi:</span>
                    <span className="text-xl sm:text-2xl font-black text-brand-700">
                      ~{selectedModelPreview.estimatedPrice.toLocaleString('uz-UZ')} so‘m
                    </span>
                  </div>
                  {selectedModelPreview.marketPriceRange && (
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-stone-500 block">Bozor oralig‘i:</span>
                      <span className="text-xs font-black text-stone-700">{selectedModelPreview.marketPriceRange}</span>
                    </div>
                  )}
                </div>

                {/* Hisobchi-iqtisodchi xulosasi */}
                <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-300 text-stone-800 space-y-1">
                  <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Iqtisodchi xulosasi va tejamkorlik:</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    {selectedModelPreview.economicBenefit || selectedModelPreview.reason}
                  </p>
                </div>

                {/* Texnik xususiyatlar ro'yxati */}
                <div className="space-y-1.5">
                  <span className="text-xs font-black uppercase text-stone-700 tracking-wider">
                    Asosiy texnik ko‘rsatkichlari:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {selectedModelPreview.specs?.map((spec, sIdx) => (
                      <span 
                        key={sIdx}
                        className="px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-stone-800 text-xs font-bold shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-brand-600 stroke-[3]" />
                        <span>{spec}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Oynadagi Harakatlar */}
            <div className="border-t border-orange-200/60 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedModelPreview(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 font-bold text-xs hover:bg-stone-50 transition"
              >
                Yopish
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedModelPreview(null);
                  const formEl = document.getElementById('request-form-section');
                  if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-7 py-3 glass-3d-button text-white font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Send className="w-4 h-4" />
                <span>Ushbu model bo‘yicha talab qoldirish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
