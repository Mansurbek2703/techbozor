'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Store, 
  ShoppingBag, 
  Send, 
  MapPin, 
  Clock, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  LogOut, 
  RefreshCw, 
  Package, 
  SlidersHorizontal,
  ChevronRight,
  Eye,
  PhoneCall,
  X
} from 'lucide-react';
import { Seller, PurchaseRequest, Offer, ProductItem } from '@/types';
import { getCategoryById } from '@/lib/categories';

export default function SellerDashboardPage() {
  const router = useRouter();
  const [currentSeller, setCurrentSeller] = useState<Seller | null>(null);
  const [matchingRequests, setMatchingRequests] = useState<PurchaseRequest[]>([]);
  const [myOffers, setMyOffers] = useState<Offer[]>([]);
  const [sellerProducts, setSellerProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'offers'>('requests');

  // Modal for sending offer
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerProductName, setOfferProductName] = useState('');
  const [offerBrand, setOfferBrand] = useState('');
  const [offerModel, setOfferModel] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [offerImageUrl, setOfferImageUrl] = useState('');
  const [offerCondition, setOfferCondition] = useState<'new' | 'ideal'>('new');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerSuccessMsg, setOfferSuccessMsg] = useState<string | null>(null);

  // Check login session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('techbozor_seller');
      if (!stored) {
        router.push('/seller/login');
        return;
      }
      try {
        const parsed = JSON.parse(stored);
        setCurrentSeller(parsed);
      } catch (e) {
        router.push('/seller/login');
      }
    }
  }, [router]);

  // Load requests and seller data
  const loadData = async (seller: Seller) => {
    try {
      setLoading(true);
      // Fetch all requests
      const reqRes = await fetch('/api/requests');
      const reqData = await reqRes.json();

      if (reqData.success && reqData.data) {
        // Filter requests matching seller regions
        const matched = (reqData.data as PurchaseRequest[]).filter(r => {
          const regionMatch = seller.regions.includes(r.region);
          const categoryMatch = seller.categories.length === 0 || seller.categories.includes(r.category);
          return regionMatch && categoryMatch;
        });
        setMatchingRequests(matched);
      }

      // Fetch seller's own products
      const prodRes = await fetch(`/api/seller/products?sellerId=${seller.id}`);
      const prodData = await prodRes.json();
      if (prodData.success) {
        setSellerProducts(prodData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentSeller) {
      loadData(currentSeller);
    }
  }, [currentSeller]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('techbozor_seller');
    }
    router.push('/seller/login');
  };

  // Open offer modal
  const openOfferModal = (reqItem: PurchaseRequest) => {
    setSelectedRequest(reqItem);
    setOfferPrice(reqItem.budget.toString());
    setOfferProductName(`${getCategoryById(reqItem.category)?.name || 'Mahsulot'}`);
    setOfferBrand('');
    setOfferModel('');
    setOfferDescription('Do‘konimizda yangi kafolatlangan holatda mavjud. Tezkor yetkazib beramiz.');
    setOfferImageUrl('https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80');
    setOfferCondition('new');
    setOfferSuccessMsg(null);
  };

  // Select existing product to populate offer
  const selectCatalogProduct = (prod: ProductItem) => {
    setOfferProductName(prod.name);
    setOfferBrand(prod.brand);
    setOfferModel(prod.model);
    setOfferPrice(prod.price.toString());
    setOfferImageUrl(prod.imageUrl);
  };

  // Submit offer
  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !currentSeller) return;

    setSubmittingOffer(true);
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          sellerId: currentSeller.id,
          sellerName: currentSeller.ownerName,
          sellerShopName: currentSeller.shopName,
          sellerPhone: currentSeller.phone,
          sellerRegion: currentSeller.regions[0] || selectedRequest.region,
          productName: offerProductName,
          brand: offerBrand || 'Boshqa',
          model: offerModel,
          price: Number(offerPrice),
          condition: offerCondition,
          description: offerDescription,
          imageUrl: offerImageUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOfferSuccessMsg(`Taklifingiz muvaffaqiyatli yuborildi! Xaridor ${selectedRequest.buyerName} ga SMS xabar jo‘natildi.`);
        // Reload data
        loadData(currentSeller);
        setTimeout(() => {
          setSelectedRequest(null);
          setOfferSuccessMsg(null);
        }, 2500);
      } else {
        alert(data.error || 'Taklif yuborishda xatolik');
      }
    } catch (err) {
      alert('Server bilan bog‘lanishda xatolik');
    } finally {
      setSubmittingOffer(false);
    }
  };

  if (!currentSeller) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* 1. SOTUVCHI PROFIL BANNERI */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-2xl text-emeraldTech-400 shadow-inner">
            {currentSeller.shopName.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">{currentSeller.shopName}</h1>
              <span className="px-2 py-0.5 rounded-full bg-emeraldTech-500/20 text-emeraldTech-300 border border-emeraldTech-400/30 text-[11px] font-bold">
                Tasdiqlangan do‘kon
              </span>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <span>{currentSeller.ownerName}</span> • <span>{currentSeller.phone}</span>
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400">Xizmat hududlari:</span>
              {currentSeller.regions.map(r => (
                <span key={r} className="text-[10px] bg-white/15 px-2 py-0.5 rounded-md font-medium">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-white/10">
          <Link
            href="/seller/products"
            className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" />
            <span>Mahsulotlarim ({sellerProducts.length})</span>
          </Link>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Chiqish</span>
          </button>
        </div>
      </div>

      {/* 2. STATISTIKA TEZLIGI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Sizning hududingizdagi talablar:</span>
          <span className="text-2xl font-black text-brand-600">{matchingRequests.length} ta</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Faol mahsulotlaringiz:</span>
          <span className="text-2xl font-black text-emeraldTech-600">{sellerProducts.length} ta</span>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Do‘kon reytingi:</span>
            <span className="text-2xl font-black text-amber-500">★ 4.9</span>
          </div>
          <button 
            onClick={() => loadData(currentSeller)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
            title="Yangilash"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. YANGI TALABLAR RO'YXATI */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-brand-600" />
              Sizga mos xaridor talablari
            </h2>
            <p className="text-xs text-slate-500">
              Ushbu xaridorlar siz tanlagan viloyatda yashaydi va sizning toifangizdagi mahsulot izlamoqda
            </p>
          </div>
          <span className="text-xs font-bold text-emeraldTech-700 bg-emeraldTech-100 px-3 py-1 rounded-full self-start sm:self-auto">
            {matchingRequests.filter(r => r.status === 'active').length} ta faol talab
          </span>
        </div>

        {matchingRequests.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-2">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-sm">Hozircha sizning viloyatlaringizda yangi talablar yo‘q</p>
            <p className="text-xs">Yangi xaridor so‘rov qoldirishi bilan sizga SMS boradi.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matchingRequests.map((reqItem) => {
              const catData = getCategoryById(reqItem.category);
              const isClosed = reqItem.status !== 'active';

              return (
                <div 
                  key={reqItem.id}
                  className={`p-5 rounded-2xl border-2 transition space-y-4 ${
                    isClosed 
                      ? 'border-slate-200 bg-slate-50 opacity-60' 
                      : 'border-slate-200 hover:border-brand-500 bg-white shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-brand-100 text-brand-800 text-xs font-bold">
                        {reqItem.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {catData?.name}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-600" />
                        {reqItem.region} {reqItem.district ? `(${reqItem.district})` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Mijoz budjeti:</span>
                      <span className="text-base font-black text-emeraldTech-600">
                        {reqItem.budget.toLocaleString('uz-UZ')} so‘m
                      </span>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-slate-900 leading-relaxed">
                    {reqItem.description}
                  </p>

                  {/* Parametrlar */}
                  {Object.keys(reqItem.specifications || {}).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {Object.entries(reqItem.specifications).map(([k, v]) => (
                        <span key={k} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {k}: <strong>{v}</strong>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      Xaridor: <strong className="text-slate-700">{reqItem.buyerName}</strong>
                    </div>

                    {!isClosed ? (
                      <button
                        onClick={() => openOfferModal(reqItem)}
                        className="px-5 py-2.5 bg-emeraldTech-600 hover:bg-emeraldTech-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emeraldTech-600/20 flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                        <span>Ushbu talabga taklif yuborish</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">
                        Talab muddati tugagan yoki yopilgan
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TAKLIF YUBORISH MODALI */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                  Taklif yuborish • {selectedRequest.id}
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedRequest.buyerName} talabi uchun narx taklifi
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {offerSuccessMsg ? (
              <div className="p-4 bg-emeraldTech-50 border border-emeraldTech-300 rounded-xl text-emeraldTech-800 text-sm font-bold text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emeraldTech-600 mx-auto" />
                <p>{offerSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSendOffer} className="space-y-4">
                {/* Agar do'konda tayyor mahsulotlar bo'lsa, tezkor tanlash */}
                {sellerProducts.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Katalogingizdan tayyor mahsulotni tanlang (Ixtiyoriy):
                    </label>
                    <select
                      onChange={(e) => {
                        const prod = sellerProducts.find(p => p.id === e.target.value);
                        if (prod) selectCatalogProduct(prod);
                      }}
                      defaultValue=""
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900"
                    >
                      <option value="">-- O‘z mahsulotingizdan tanlash --</option>
                      {sellerProducts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.brand} {p.name} - {p.price.toLocaleString('uz-UZ')} so‘m
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Mahsulot nomi *</label>
                    <input
                      type="text"
                      required
                      value={offerProductName}
                      onChange={(e) => setOfferProductName(e.target.value)}
                      placeholder="Samsung 55 Crystal 4K"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Brend va Model</label>
                    <input
                      type="text"
                      value={offerModel}
                      onChange={(e) => setOfferModel(e.target.value)}
                      placeholder="Masalan: CU7100"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Taklif narxi (so‘mda) *</label>
                    <input
                      type="number"
                      required
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      placeholder="4800000"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-emeraldTech-700 focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Holati</label>
                    <select
                      value={offerCondition}
                      onChange={(e) => setOfferCondition(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900"
                    >
                      <option value="new">Yangi (Qutida, ochilmagan)</option>
                      <option value="ideal">Ideal (Vitrina / Yangidek)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mahsulot rasmi havolasi (URL)</label>
                  <input
                    type="url"
                    value={offerImageUrl}
                    onChange={(e) => setOfferImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Xaridor uchun izoh / Kafolat / Yetkazish</label>
                  <textarea
                    rows={2}
                    value={offerDescription}
                    onChange={(e) => setOfferDescription(e.target.value)}
                    placeholder="1 yil rasmiy kafolat, bepul yetkazib berish xizmati mavjud..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:bg-white outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={submittingOffer}
                    className="px-6 py-2.5 bg-gradient-to-r from-emeraldTech-600 to-emeraldTech-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emeraldTech-600/25 flex items-center gap-2"
                  >
                    {submittingOffer ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Xaridorga taklif va SMS yuborish</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
