'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  PhoneCall, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Tag, 
  Store, 
  Sparkles, 
  Calendar, 
  Share2,
  XCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { PurchaseRequest, Offer } from '@/types';
import { getCategoryById } from '@/lib/categories';

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const requestId = params.id;
  const [loading, setLoading] = useState(true);
  const [requestItem, setRequestItem] = useState<PurchaseRequest | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch request and offers
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/requests/${requestId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setRequestItem(data.data.request);
        setOffers(data.data.offers);
      } else {
        setError(data.error || 'Talab topilmadi');
      }
    } catch (err) {
      setError('Ma’lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [requestId]);

  // Talabni xaridor tomonidan yopish
  const handleCloseRequest = async () => {
    if (!confirm('Haqiqatan ham ushbu talabni muddatidan oldin yopmoqchimisiz? Yangi takliflar kelishi to‘xtatiladi.')) {
      return;
    }
    try {
      setIsClosing(true);
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });
      const data = await res.json();
      if (data.success) {
        setRequestItem(prev => prev ? { ...prev, status: 'closed' } : null);
      }
    } catch (err) {
      alert('Xatolik yuz berdi');
    } finally {
      setIsClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-600 text-sm font-semibold">Talab va kelgan takliflar yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !requestItem) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Talab topilmadi</h2>
        <p className="text-sm text-slate-600">{error || 'Ushbu havola eskirgan yoki mavjud emas.'}</p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
        </Link>
      </div>
    );
  }

  const categoryData = getCategoryById(requestItem.category);
  const isExpiredOrClosed = requestItem.status !== 'active';
  const expiresDate = new Date(requestItem.expiresAt);
  const now = new Date();
  const diffDays = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      {/* Yuqori orqaga qaytish paneli */}
      <div className="flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-brand-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Bosh sahifaga</span>
        </Link>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? 'Havola nusxalandi!' : 'Havolani ulashish'}</span>
        </button>
      </div>

      {/* 1. TALABNING UMUMIY MA’LUMOTLARI KARTASI */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-brand-100 text-brand-700 text-xs font-black uppercase tracking-wider">
                {requestItem.id}
              </span>
              <span className="text-xs font-bold text-slate-500">
                {categoryData?.name || requestItem.category}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {requestItem.description}
            </h1>
          </div>

          {/* Status nishoni */}
          <div>
            {requestItem.status === 'active' ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emeraldTech-100 text-emeraldTech-800 text-xs font-bold border border-emeraldTech-300">
                <span className="w-2 h-2 rounded-full bg-emeraldTech-500 animate-pulse"></span>
                Faol talab (Takliflar qabul qilinmoqda)
              </span>
            ) : requestItem.status === 'closed' ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                <XCircle className="w-4 h-4 text-slate-500" />
                Muvaffaqiyatli yopilgan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                <Clock className="w-4 h-4 text-red-500" />
                Muddati tugagan
              </span>
            )}
          </div>
        </div>

        {/* Asosiy ko'rsatkichlar: Budjet, Hudud, Qolgan vaqt */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-600 block text-xs font-medium">Ajratilgan budjet:</span>
            <span className="text-base sm:text-lg font-black text-emeraldTech-600">
              {requestItem.budget.toLocaleString('uz-UZ')} so‘m
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-600 block text-xs font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-600" /> Hudud:
            </span>
            <span className="font-bold text-slate-900">
              {requestItem.region} {requestItem.district ? `(${requestItem.district})` : ''}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-600 block text-xs font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Qolgan muddat:
            </span>
            <span className="font-bold text-slate-900">
              {requestItem.status === 'active' ? (
                diffDays > 0 ? `${diffDays} kun qoldi` : 'Bugun tugaydi'
              ) : 'Yopilgan'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-600 block text-xs font-medium">Xaridor:</span>
            <span className="font-bold text-slate-900">{requestItem.buyerName}</span>
          </div>
        </div>

        {/* Belgilangan texnik filtrlar */}
        {Object.keys(requestItem.specifications || {}).length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-slate-600 block">Talab qilingan parametrlar:</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(requestItem.specifications).map(([key, val]) => (
                <span key={key} className="text-xs bg-brand-50 border border-brand-200 text-brand-800 px-2.5 py-1 rounded-lg font-medium">
                  <strong>{key}:</strong> {val}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Xaridor harakatlari (Talabni yopish) */}
        {requestItem.status === 'active' && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Kerakli mahsulotni tanladingizmi yoki ehtiyojingiz qondirildimi?
            </span>
            <button
              onClick={handleCloseRequest}
              disabled={isClosing}
              className="px-3.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition"
            >
              {isClosing ? 'Yopilmoqda...' : 'Talabni yopish'}
            </button>
          </div>
        )}
      </div>

      {/* 2. SOTUVCHILARDAN KELGAN TAKLIFLAR RO'YXATI */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Sotuvchilardan kelgan takliflar ({offers.length})
            </h2>
          </div>
          <button 
            onClick={fetchData}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Yangilash
          </button>
        </div>

        {offers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Hozircha sotuvchilar taklif tayyorlamoqda
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Sizning viloyatingizdagi faol sotuvchilarga SMS yuborilgan. Ular yangi taklif kiritishi bilan telefoningizga SMS orqali xabar boradi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map((offer) => {
              const priceDiff = requestItem.budget - offer.price;
              const isUnderBudget = priceDiff >= 0;

              return (
                <div 
                  key={offer.id}
                  className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-md hover:border-emeraldTech-400 transition flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    {/* Sotuvchi do'koni va hududi */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow">
                          {offer.sellerShopName.slice(0, 1)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 leading-tight">
                            {offer.sellerShopName}
                          </h4>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {offer.sellerRegion}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 bg-emeraldTech-100 text-emeraldTech-800 text-[11px] font-bold rounded-full">
                        {offer.condition === 'new' ? 'Yangi (Qutida)' : 'Ideal holatda'}
                      </span>
                    </div>

                    {/* Mahsulot nomi va rasmi */}
                    <div className="flex gap-4">
                      {offer.imageUrl && (
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <img 
                            src={offer.imageUrl} 
                            alt={offer.productName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="space-y-1.5 flex-1">
                        <span className="text-[10px] uppercase font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                          {offer.brand}
                        </span>
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-2">
                          {offer.productName}
                        </h3>
                        {offer.model && (
                          <span className="text-xs text-slate-500 font-mono block">
                            Model: {offer.model}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Taklif qilingan narx */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-500 block font-medium">Sotuvchi taklif qilgan narx:</span>
                        <span className="text-xl font-black text-emeraldTech-600">
                          {offer.price.toLocaleString('uz-UZ')} so‘m
                        </span>
                      </div>
                      <div className="text-right">
                        {isUnderBudget ? (
                          <span className="text-xs font-bold text-emeraldTech-700 bg-emeraldTech-100 px-2 py-1 rounded-md">
                            -{priceDiff.toLocaleString('uz-UZ')} so‘m arzonroq!
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">
                            Budjetdan +{Math.abs(priceDiff).toLocaleString('uz-UZ')} so‘m
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sotuvchining qo'shimcha izohi */}
                    {offer.description && (
                      <div className="text-xs text-slate-700 bg-emeraldTech-50/60 border border-emeraldTech-200/60 p-2.5 rounded-xl leading-relaxed">
                        <strong className="text-emeraldTech-900 block font-semibold mb-0.5">Sotuvchi izohi:</strong>
                        {offer.description}
                      </div>
                    )}
                  </div>

                  {/* QO'NG'IROQ QILISH TUGMASI (Texnik topshiriq 11-band talabi) */}
                  <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <a
                      href={`tel:${offer.sellerPhone}`}
                      className="w-full py-3.5 bg-gradient-to-r from-emeraldTech-600 to-emeraldTech-500 hover:from-emeraldTech-500 hover:to-emeraldTech-600 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-md shadow-emeraldTech-600/20 flex items-center justify-center gap-2 active:scale-95 transition"
                    >
                      <PhoneCall className="w-5 h-5 animate-bounce" />
                      <span>Sotuvchiga qo‘ng‘iroq qilish ({offer.sellerPhone})</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
