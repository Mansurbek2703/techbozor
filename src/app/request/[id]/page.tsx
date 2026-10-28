'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PhoneCall, 
  Clock, 
  MapPin, 
  AlertCircle, 
  ArrowLeft, 
  Store, 
  Share2,
  XCircle,
  RefreshCw
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

  const handleCloseRequest = async () => {
    if (!confirm('Haqiqatan ham ushbu talabni muddatidan oldin yopmoqchimisiz? Yangi takliflar to‘xtatiladi.')) {
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
        <p className="text-stone-600 text-sm font-semibold">Yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !requestItem) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-stone-900">Talab topilmadi</h2>
        <p className="text-sm text-stone-600">{error || 'Ushbu havola eskirgan.'}</p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-5 py-2.5 gradient-copper-header text-white rounded-xl text-sm font-bold shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
        </Link>
      </div>
    );
  }

  const categoryData = getCategoryById(requestItem.category);
  const expiresDate = new Date(requestItem.expiresAt);
  const now = new Date();
  const diffDays = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Yuqori orqaga qaytish */}
      <div className="flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-600 hover:text-brand-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Bosh sahifa</span>
        </Link>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 bg-white border border-stone-200 px-3.5 py-1.5 rounded-xl shadow-sm hover:bg-stone-50"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? 'Nusxalandi!' : 'Ulashish'}</span>
        </button>
      </div>

      {/* TALAB KARTASI */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-orange-100 text-brand-800 text-xs font-black">
                {requestItem.id}
              </span>
              <span className="text-xs font-bold text-stone-400">
                {categoryData?.name || requestItem.category}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900">
              {requestItem.description}
            </h1>
          </div>

          <div>
            {requestItem.status === 'active' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-brand-700 text-xs font-bold border border-orange-200">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                Faol talab
              </span>
            ) : requestItem.status === 'closed' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold">
                <XCircle className="w-4 h-4 text-stone-500" />
                Yopilgan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                Muddati tugagan
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-stone-400 block text-xs font-semibold">Mijoz budjeti:</span>
            <span className="text-lg font-black text-brand-600">
              {requestItem.budget.toLocaleString('uz-UZ')} so‘m
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-stone-400 block text-xs font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-600" /> Hudud:
            </span>
            <span className="font-bold text-stone-900">
              {requestItem.region} {requestItem.district ? `(${requestItem.district})` : ''}
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-stone-400 block text-xs font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-500" /> Qolgan muddat:
            </span>
            <span className="font-bold text-stone-900">
              {requestItem.status === 'active' ? (diffDays > 0 ? `${diffDays} kun` : 'Bugun tugaydi') : 'Tugagan'}
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-stone-400 block text-xs font-semibold">Xaridor:</span>
            <span className="font-bold text-stone-900">{requestItem.buyerName}</span>
          </div>
        </div>

        {requestItem.status === 'active' && (
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              Xarid amalga oshdimi?
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

      {/* SOTUVCHILAR TAKLIFLARI */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-brand-600" />
            <span>Sotuvchilar takliflari ({offers.length})</span>
          </h2>
          <button 
            onClick={fetchData}
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Yangilash
          </button>
        </div>

        {offers.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-2 shadow-sm">
            <Store className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="font-bold text-sm text-stone-700">Hozircha sotuvchilar taklif kiritmoqda</p>
            <p className="text-xs text-stone-500">Taklif kiritilishi bilan telefoningizga SMS orqali xabarnoma boradi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map((offer) => {
              const priceDiff = requestItem.budget - offer.price;
              const isUnderBudget = priceDiff >= 0;

              return (
                <div 
                  key={offer.id}
                  className="bg-white rounded-3xl border-2 border-orange-100 overflow-hidden shadow-md hover:border-brand-400 transition flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl gradient-copper-header text-white flex items-center justify-center font-black text-sm shadow">
                          {offer.sellerShopName.slice(0, 1)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-stone-900 leading-tight">
                            {offer.sellerShopName}
                          </h4>
                          <span className="text-[11px] text-stone-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            {offer.sellerRegion}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 bg-orange-100 text-brand-800 text-[11px] font-bold rounded-full">
                        {offer.condition === 'new' ? 'Yangi' : 'Ideal'}
                      </span>
                    </div>

                    <div className="flex gap-4">
                      {offer.imageUrl && (
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                          <img 
                            src={offer.imageUrl} 
                            alt={offer.productName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="space-y-1 flex-1">
                        <span className="text-[10px] uppercase font-bold text-brand-700 bg-orange-50 px-2 py-0.5 rounded">
                          {offer.brand}
                        </span>
                        <h3 className="font-extrabold text-sm sm:text-base text-stone-900 line-clamp-2">
                          {offer.productName}
                        </h3>
                        {offer.model && (
                          <span className="text-xs text-stone-400 font-mono block">
                            Model: {offer.model}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-stone-400 block font-semibold">Taklif narxi:</span>
                        <span className="text-xl font-black text-brand-600">
                          {offer.price.toLocaleString('uz-UZ')} so‘m
                        </span>
                      </div>
                      <div>
                        {isUnderBudget ? (
                          <span className="text-xs font-bold text-emeraldTech-700 bg-emeraldTech-100 px-2.5 py-1 rounded-lg">
                            -{priceDiff.toLocaleString('uz-UZ')} so‘m arzonroq!
                          </span>
                        ) : (
                          <span className="text-xs text-stone-400">
                            +{Math.abs(priceDiff).toLocaleString('uz-UZ')} so‘m
                          </span>
                        )}
                      </div>
                    </div>

                    {offer.description && (
                      <div className="text-xs text-stone-700 bg-orange-50/50 border border-orange-100 p-3 rounded-2xl leading-relaxed">
                        <strong className="text-brand-900 block font-semibold mb-0.5">Sotuvchi izohi:</strong>
                        {offer.description}
                      </div>
                    )}
                  </div>

                  {/* QO'NG'IROQ QILISH */}
                  <div className="p-4 bg-stone-50 border-t border-stone-100">
                    <a
                      href={`tel:${offer.sellerPhone}`}
                      className="w-full py-3.5 gradient-copper-header hover:brightness-105 text-white font-black text-sm sm:text-base rounded-2xl shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
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
