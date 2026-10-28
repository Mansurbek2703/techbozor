'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  Smartphone, 
  MessageSquare, 
  PhoneCall, 
  Tag, 
  Clock, 
  MapPin, 
  Zap, 
  Tv, 
  Refrigerator, 
  Shirt, 
  Wind, 
  Flame, 
  Utensils, 
  ChevronRight,
  ExternalLink,
  Copy,
  ThumbsUp
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

  // Quick prompt examples
  const samplePrompts = [
    '5 million so‘m budjetim bor. 55 dyuymli Smart televizor sotib olmoqchiman. Tasvir sifati yaxshi va uzoq muddat xizmat qiladigan model kerak.',
    'Samarqandga 7 mln so‘mgacha NoFrost katta sovutkich kerak. LG yoki Samsung bo‘lsa yaxshi.',
    'Yangi xonadonga 4 mln so‘m atrofida inverterli avtomat kir yuvish mashinasi izlayapman, 7-8 kg sig‘imli.',
    'Zal uchun 18 lik inverter konditsioner kerak, 50 kv metrga yetadigan, qishda ham isitadigan.',
  ];

  // Set category when selected
  const handleCategoryChange = (catId: CategoryKey) => {
    setSelectedCategory(catId);
    setActiveFilters({});
  };

  // AI Tahlil va Tavsiya chaqirish
  const handleRunAiAnalysis = async (customPrompt?: string) => {
    const textToAnalyze = customPrompt || promptText;
    if (!textToAnalyze || textToAnalyze.trim().length < 5) {
      alert('Iltimos, o‘zingizga kerakli texnika haqida bir-ikki jumla yozing.');
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
        // Extract specs into active filters
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

  // Talabni serverga joylashtirish
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!buyerName.trim()) {
      setSubmitError('Iltimos, ismingizni kiriting');
      return;
    }

    const cleanPhone = buyerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      setSubmitError('Iltimos, to‘g‘ri telefon raqamingizni kiriting (masalan: +998 90 123 45 67)');
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
        // Scroll to modal/success
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setSubmitError('Server bilan bog‘lanishda xatolik yuz berdi');
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
    <div className="space-y-12">
      {/* 1. HERO SECTION - Zamonaviy marketing shiorlari, gradient va jozibador ko'rinish */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-brand-800 to-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emeraldTech-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emeraldTech-300">
            <Sparkles className="w-4 h-4 text-emeraldTech-400" />
            <span>O‘zbekistonda ilk bor: AI asosidagi maishiy texnika birjasi</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Kerakli texnikani ayting — <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emeraldTech-300 via-emeraldTech-400 to-teal-200">
              Sotuvchilar o‘zlari arzon taklif yuboradi
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Do‘konma-do‘kon sarson bo‘lmang. O‘z budjetingizni va talabingizni oddiy tilda yozing — sun’iy intellekt eng maqbul modellarni saralab beradi, do‘konlar esa telefoningizga SMS orqali o‘z takliflarini yuboradi.
          </p>

          {/* Afzalliklar mini-paneli */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto pt-2">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center">
              <span className="block text-emeraldTech-400 font-black text-lg sm:text-xl">0 so‘m</span>
              <span className="text-[11px] sm:text-xs text-slate-300 font-medium">Xaridor uchun bepul</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center">
              <span className="block text-emeraldTech-400 font-black text-lg sm:text-xl">SMS</span>
              <span className="text-[11px] sm:text-xs text-slate-300 font-medium">To‘g‘ridan-to‘g‘ri narxlar</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center">
              <span className="block text-emeraldTech-400 font-black text-lg sm:text-xl">AI Maslahat</span>
              <span className="text-[11px] sm:text-xs text-slate-300 font-medium">Xolis tavsiya</span>
            </div>
          </div>
        </div>
      </section>

      {/* SUCCESS MODAL / YARATILGAN TALAB BANNERI */}
      {createdRequest && (
        <section className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
          <div className="bg-emeraldTech-50 border-2 border-emeraldTech-500 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emeraldTech-500 text-white flex items-center justify-center shrink-0 shadow-lg">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Talabingiz qabul qilindi va sotuvchilarga SMS yuborildi!
                </h3>
                <p className="text-sm text-slate-700">
                  Talab raqami: <strong className="font-bold text-slate-900">{createdRequest.data.id}</strong>. 
                  Sizning hududingizdagi <strong className="text-emeraldTech-700 font-bold">{createdRequest.notifiedCount || 'barcha faol'} ta</strong> sotuvchiga darhol SMS orqali bildirishnoma yuborildi.
                </p>
              </div>
            </div>

            {/* Havola va SMS simulyatsiyasi */}
            <div className="bg-white rounded-xl p-4 border border-emeraldTech-200 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span>Sizning talabingiz sahifasi (Ro‘yxatdan o‘tmasdan ko‘rish):</span>
                <span className="text-emeraldTech-600 flex items-center gap-1 font-semibold">
                  <Smartphone className="w-3.5 h-3.5" /> SMS orqali ham yuboriladi
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={typeof window !== 'undefined' ? `${window.location.origin}/request/${createdRequest.data.id}` : `/request/${createdRequest.data.id}`}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono text-slate-800 select-all"
                />
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(`${window.location.origin}/request/${createdRequest.data.id}`);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Nusxa olindi!' : 'Nusxalash'}</span>
                </button>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href={`/request/${createdRequest.data.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emeraldTech-600 hover:bg-emeraldTech-700 text-white font-bold text-sm rounded-xl shadow-md transition"
                >
                  <span>Kelgan takliflarni ko‘rish sahifasiga o‘tish</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setCreatedRequest(null)}
                  className="w-full sm:w-auto text-xs font-semibold text-slate-500 hover:text-slate-800 py-2"
                >
                  Yangi talab yaratish
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. ODDIY TILDA TAVSIFLASH VA AI TAHLIL BLOKI */}
      <section id="ai-search" className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 p-5 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-brand-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Aqlli qidiruv
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                1. Kerakli texnikani oddiy tilda tasvirlang
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
              Ro‘yxatdan o‘tish talab qilinmaydi
            </span>
          </div>

          {/* Erkin matn kiritish maydoni */}
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={3}
                placeholder="Masalan: 5 million so‘m budjetim bor. 55 dyuymli Smart televizor sotib olmoqchiman. Tasvir sifati yaxshi va uzoq muddat xizmat qiladigan model kerak..."
                className="w-full rounded-2xl border-2 border-slate-200 p-4 text-sm sm:text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition resize-none outline-none"
              />
              <button
                type="button"
                onClick={() => handleRunAiAnalysis()}
                disabled={isAiLoading || !promptText.trim()}
                className="absolute right-3 bottom-3 px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-brand-500/20 transition active:scale-95"
              >
                {isAiLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>AI tahlil qilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emeraldTech-300" />
                    <span>AI tavsiyasini olish</span>
                  </>
                )}
              </button>
            </div>

            {/* Namunalar (Foydalanuvchi bir marta bosishi bilan to'ldiriladi) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Namunalar (bosing va sinab ko‘ring):
              </span>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPromptText(sample);
                      handleRunAiAnalysis(sample);
                    }}
                    className="text-left text-xs bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 transition truncate max-w-full"
                  >
                    💡 {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI TAHLIL NATIJALARI (Agar tahlil qilingan bo'lsa) */}
          {aiResult && (
            <div className="mt-6 p-5 sm:p-6 bg-gradient-to-br from-brand-50/70 via-indigo-50/40 to-emeraldTech-50/50 rounded-2xl border-2 border-brand-200 space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                      AI tahlil natijasi va Bozor tavsiyalari
                    </h3>
                    <p className="text-xs text-slate-500">
                      Matningizdan aniqlangan parametrlar va O‘zbekiston bozoridagi eng maqbul modellar
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emeraldTech-700 bg-emeraldTech-100 px-3 py-1 rounded-full self-start sm:self-auto">
                  ✓ Xolis ekspert xulosasi
                </span>
              </div>

              {/* Aniqlangan parametrlar teglari */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-brand-100 shadow-sm">
                  <span className="block text-slate-600 font-medium">Kategoriya:</span>
                  <span className="font-bold text-slate-900 text-sm">{aiResult.categoryName}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-brand-100 shadow-sm">
                  <span className="block text-slate-600 font-medium">Aniqlangan budjet:</span>
                  <span className="font-bold text-emeraldTech-600 text-sm">
                    {aiResult.budget.toLocaleString('uz-UZ')} so‘m
                  </span>
                </div>
                {aiResult.extractedSpecs.diagonal && (
                  <div className="bg-white p-2.5 rounded-xl border border-brand-100 shadow-sm">
                    <span className="block text-slate-600 font-medium">Ekran o‘lchami:</span>
                    <span className="font-bold text-slate-900 text-sm">{aiResult.extractedSpecs.diagonal}</span>
                  </div>
                )}
                <div className="bg-white p-2.5 rounded-xl border border-brand-100 shadow-sm">
                  <span className="block text-slate-600 font-medium">Smart TV / OS:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {aiResult.extractedSpecs.smartTv ? 'Smart TV' : 'Standart'}
                  </span>
                </div>
              </div>

              {/* Bozor nomutanosibligi haqida AI ogohlantirishi (Texnik topshiriq 4.1 talabi) */}
              {aiResult.marketCheckNote && (
                <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs sm:text-sm">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block">Bozor tahlili:</strong>
                    <span>{aiResult.marketCheckNote}</span>
                  </div>
                </div>
              )}

              {/* AI TAVSIYA ETGAN MODELLAR KARTALARI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Sizning budjetingizga eng mos modellar (Bozor narxi):
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Sotuvchilar bundan ham arzonroq taklif berishi mumkin
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiResult.recommendations.map((rec, idx) => (
                    <div 
                      key={idx}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-brand-100 text-brand-700 text-[11px] font-bold">
                            {rec.brand}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emeraldTech-100 text-emeraldTech-700 text-[11px] font-bold">
                            {rec.budgetMatchPercent}% moslik
                          </span>
                        </div>

                        <h5 className="font-bold text-sm text-slate-900 line-clamp-2">
                          {rec.brand} {rec.model}
                        </h5>

                        <div className="text-base font-black text-emeraldTech-600">
                          ~{rec.estimatedPrice.toLocaleString('uz-UZ')} so‘m
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg">
                          💡 {rec.reason}
                        </p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {rec.specs.map((s, sIdx) => (
                            <span key={sIdx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-600 font-medium">Tekshirilgan bozor narxi</span>
                        <a 
                          href="#create-request"
                          onClick={() => {
                            setPromptText(`Menga ${rec.brand} ${rec.model} yoki shunga o‘xshash model kerak. Budjet: ${rec.estimatedPrice.toLocaleString('uz-UZ')} so‘m.`);
                            setBudgetInput(rec.estimatedPrice.toString());
                          }}
                          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                        >
                          <span>Talabga qo‘shish</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. KATEGORIYALAR VA SMART FILTRLAR BO'LIMI */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 p-5 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs uppercase font-extrabold tracking-wider text-brand-600 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" /> Kategoriya va parametrlar
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              2. Kategoriyani tanlang va filtrlarni aniqlashtiring
            </h2>
          </div>

          {/* Kategoriya tugmalari (Gorizontal scroll mobil uchun juda qulay) */}
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
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {getCategoryIcon(cat.id)}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tanlangan kategoriya smart filtrlari */}
          {currentCategoryData && (
            <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  {currentCategoryData.name} uchun smart parametrlar (Ixtiyoriy):
                </span>
                <span className="text-[11px] text-slate-600">
                  Faqat o‘zingizga muhimlarini belgilang
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {currentCategoryData.filters.map((filter) => (
                  <div key={filter.id} className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      {filter.label}
                    </label>
                    <select
                      value={activeFilters[filter.id] || 'Hammasi'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setActiveFilters(prev => ({ ...prev, [filter.id]: val }));
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-brand-500 outline-none"
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
      </section>

      {/* 4. TALABNI JOYLASHTIRISH FORMASI */}
      <section id="create-request" className="max-w-4xl mx-auto px-4 sm:px-6">
        <form onSubmit={handleSubmitRequest} className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 p-5 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emeraldTech-600 flex items-center gap-1">
              <Send className="w-3.5 h-3.5 text-emeraldTech-600" /> Yakuniy bosqich
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              3. Talabni joylashtirish va SMS orqali narx olish
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Talabingiz tegishli viloyatdagi sotuvchilarga yuboriladi. Ular narx taklif qilganda telefoningizga SMS keladi.
            </p>
          </div>

          {submitError && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-xl text-red-700 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Budjet */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Ajratilgan budjet (so‘mda)</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder="5000000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-500 outline-none"
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-slate-600">so‘m</span>
              </div>
            </div>

            {/* Viloyat */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>Hududingiz (Viloyat)</span>
                <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as Region)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-brand-500 outline-none"
              >
                {UZBEKISTAN_REGIONS.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            {/* Tuman / Shahar (ixtiyoriy) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Tuman yoki shahar (ixtiyoriy)
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Masalan: Yunusobod, Chilonzor yoki Samarqand sh."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>

            {/* Talab muddati */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-600" />
                <span>Talabning amal qilish muddati</span>
                <span className="text-red-500">*</span>
              </label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-brand-500 outline-none"
              >
                <option value={1}>1 kun (Shoshilinch xarid)</option>
                <option value={3}>3 kun</option>
                <option value={7}>7 kun (Tavsiya etiladi)</option>
                <option value={14}>14 kun (2 hafta)</option>
                <option value={30}>30 kun (1 oy)</option>
              </select>
            </div>

            {/* Xaridor ismi */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Ismingiz</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Ismingizni kiriting"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>

            {/* Telefon raqami */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-emeraldTech-600" />
                <span>Telefon raqamingiz (SMS olish uchun)</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-500 outline-none"
              />
              <span className="text-[11px] text-slate-600 block">
                🔒 Telefon raqamingiz sotuvchilarga ko‘rinmaydi, siz o‘zingiz yoqqan taklif egasiga qo‘ng‘iroq qilasiz.
              </span>
            </div>
          </div>

          {/* SMS roziligi */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={smsConsent}
                onChange={(e) => setSmsConsent(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                Ushbu talabim bo‘yicha mos keluvchi sotuvchilardan SMS orqali narx takliflari va havola olishga roziman.
              </span>
            </label>
          </div>

          {/* Tugma */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emeraldTech-600 via-emeraldTech-500 to-teal-600 hover:from-emeraldTech-500 hover:to-emeraldTech-600 text-white font-black text-base sm:text-lg shadow-xl shadow-emeraldTech-500/25 flex items-center justify-center gap-2 transition active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sotuvchilarga SMS yuborilmoqda...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Talabni joylashtirish (Bepul)</span>
              </>
            )}
          </button>
        </form>
      </section>

      {/* 5. TIZIM QANDAY ISHLAYDI? (QADAM-BAQADAM KO'RSATMA) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-slate-900 to-brand-950 text-white rounded-3xl p-6 sm:p-10 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black">
              TechBozor qanday ishlaydi?
            </h3>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Oddiy, tezkor va hech qanday ortiqcha to‘lovlarsiz xarid jarayoni
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2 relative">
              <span className="w-8 h-8 rounded-full bg-brand-500 text-white font-black text-sm flex items-center justify-center">1</span>
              <h4 className="font-bold text-base">Talab yozasiz</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Qidirayotgan texnikangiz va budjetingizni kiritasiz, AI sizga modellarni maslahat beradi.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2 relative">
              <span className="w-8 h-8 rounded-full bg-brand-500 text-white font-black text-sm flex items-center justify-center">2</span>
              <h4 className="font-bold text-base">Sotuvchilar ko‘radi</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Viloyatingizdagi rasmiy do‘kon va sotuvchilarga SMS boradi va ular takliflarini tayyorlaydi.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2 relative">
              <span className="w-8 h-8 rounded-full bg-emeraldTech-500 text-white font-black text-sm flex items-center justify-center">3</span>
              <h4 className="font-bold text-base">SMS olasiz</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sotuvchilar taklif kiritganda telefoningizga eng yaxshi narxlar SMS orqali keladi.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2 relative">
              <span className="w-8 h-8 rounded-full bg-emeraldTech-500 text-white font-black text-sm flex items-center justify-center">4</span>
              <h4 className="font-bold text-base">Qo‘ng‘iroq qilasiz</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                O‘zingizga yoqqan do‘konga bir tugma orqali qo‘ng‘iroq qilib, tovarni qabul qilib olasiz.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
