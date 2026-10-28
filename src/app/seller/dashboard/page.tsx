'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Store, 
  ShoppingBag, 
  Send, 
  MapPin, 
  CheckCircle2, 
  LogOut, 
  RefreshCw, 
  Package, 
  X
} from 'lucide-react';
import { Seller, PurchaseRequest, Offer, ProductItem } from '@/types';
import { getCategoryById } from '@/lib/categories';

export default function SellerDashboardPage() {
  const router = useRouter();
  const [currentSeller, setCurrentSeller] = useState<Seller | null>(null);
  const [matchingRequests, setMatchingRequests] = useState<PurchaseRequest[]>([]);
  const [sellerProducts, setSellerProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
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

  const loadData = async (seller: Seller) => {
    try {
      setLoading(true);
      const reqRes = await fetch('/api/requests');
      const reqData = await reqRes.json();

      if (reqData.success && reqData.data) {
        const matched = (reqData.data as PurchaseRequest[]).filter(r => {
          const regionMatch = seller.regions.includes(r.region);
          const categoryMatch = seller.categories.length === 0 || seller.categories.includes(r.category);
          return regionMatch && categoryMatch;
        });
        setMatchingRequests(matched);
      }

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

  const selectCatalogProduct = (prod: ProductItem) => {
    setOfferProductName(prod.name);
    setOfferBrand(prod.brand);
    setOfferModel(prod.model);
    setOfferPrice(prod.price.toString());
    setOfferImageUrl(prod.imageUrl);
  };

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
        setOfferSuccessMsg(`Taklifingiz muvaffaqiyatli yuborildi! Xaridorga SMS xabar jo‘natildi.`);
        loadData(currentSeller);
        setTimeout(() => {
          setSelectedRequest(null);
          setOfferSuccessMsg(null);
        }, 2200);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Profil paneli */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-copper-header flex items-center justify-center font-black text-2xl text-white shadow-lg">
            {currentSeller.shopName.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">{currentSeller.shopName}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30 text-[11px] font-bold">
                Tasdiqlangan do‘kon
              </span>
            </div>
            <p className="text-xs text-stone-300 flex items-center gap-2">
              <span>{currentSeller.ownerName}</span> • <span>{currentSeller.phone}</span>
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-stone-400">Hududlar:</span>
              {currentSeller.regions.map(r => (
                <span key={r} className="text-[10px] bg-white/15 px-2 py-0.5 rounded-md font-bold">
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
            <span>Katalog ({sellerProducts.length})</span>
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

      {/* Statistika */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs text-stone-400 font-semibold block">Sizga mos talablar:</span>
          <span className="text-2xl font-black text-brand-600">{matchingRequests.length} ta</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs text-stone-400 font-semibold block">Do‘kon mahsulotlari:</span>
          <span className="text-2xl font-black text-stone-900">{sellerProducts.length} ta</span>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-semibold block">Reyting:</span>
            <span className="text-2xl font-black text-amber-500">★ 4.9</span>
          </div>
          <button 
            onClick={() => loadData(currentSeller)}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* TALABLAR RO'YXATI */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <h2 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            <span>Sizning hududingizdagi talablar</span>
          </h2>
          <span className="text-xs font-bold text-brand-700 bg-orange-100 px-3 py-1 rounded-full">
            {matchingRequests.filter(r => r.status === 'active').length} ta faol
          </span>
        </div>

        {matchingRequests.length === 0 ? (
          <div className="text-center py-10 text-stone-500 space-y-1">
            <p className="font-bold text-sm">Hozircha yangi talablar yo‘q</p>
            <p className="text-xs">Yangi xaridor so‘rov qoldirganda SMS keladi.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {matchingRequests.map((reqItem) => {
              const catData = getCategoryById(reqItem.category);
              const isClosed = reqItem.status !== 'active';

              return (
                <div 
                  key={reqItem.id}
                  className={`p-5 rounded-2xl border-2 transition space-y-3 ${
                    isClosed 
                      ? 'border-stone-200 bg-stone-50 opacity-60' 
                      : 'border-stone-200 hover:border-brand-500 bg-white shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-orange-100 text-brand-800 text-xs font-bold">
                        {reqItem.id}
                      </span>
                      <span className="text-xs font-bold text-stone-600">
                        {catData?.name}
                      </span>
                      <span className="text-xs text-stone-300">•</span>
                      <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-600" />
                        {reqItem.region} {reqItem.district ? `(${reqItem.district})` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-400">Budjet:</span>
                      <span className="text-base font-black text-brand-600">
                        {reqItem.budget.toLocaleString('uz-UZ')} so‘m
                      </span>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-stone-900">
                    {reqItem.description}
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-stone-400">
                      Xaridor: <strong className="text-stone-700">{reqItem.buyerName}</strong>
                    </div>

                    {!isClosed ? (
                      <button
                        onClick={() => openOfferModal(reqItem)}
                        className="px-5 py-2.5 gradient-copper-header hover:brightness-105 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                        <span>Taklif yuborish</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-stone-400">
                        Yopilgan
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">
                {selectedRequest.buyerName} uchun narx taklifi
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {offerSuccessMsg ? (
              <div className="p-4 bg-orange-50 border border-brand-300 rounded-xl text-brand-900 text-sm font-bold text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-brand-600 mx-auto" />
                <p>{offerSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSendOffer} className="space-y-4">
                {sellerProducts.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">
                      Katalogdan tanlash (ixtiyoriy):
                    </label>
                    <select
                      onChange={(e) => {
                        const prod = sellerProducts.find(p => p.id === e.target.value);
                        if (prod) selectCatalogProduct(prod);
                      }}
                      defaultValue=""
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-900"
                    >
                      <option value="">-- Katalogdan tanlash --</option>
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
                    <label className="text-xs font-bold text-stone-700">Mahsulot nomi *</label>
                    <input
                      type="text"
                      required
                      value={offerProductName}
                      onChange={(e) => setOfferProductName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-900 focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Brend / Model</label>
                    <input
                      type="text"
                      value={offerModel}
                      onChange={(e) => setOfferModel(e.target.value)}
                      placeholder="Masalan: Samsung Crystal 4K"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-900 focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Taklif narxi (so‘m) *</label>
                    <input
                      type="number"
                      required
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-brand-600 focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Holati</label>
                    <select
                      value={offerCondition}
                      onChange={(e) => setOfferCondition(e.target.value as any)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-900"
                    >
                      <option value="new">Yangi (Qutida)</option>
                      <option value="ideal">Ideal</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Izoh va kafolat shartlari</label>
                  <textarea
                    rows={2}
                    value={offerDescription}
                    onChange={(e) => setOfferDescription(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs sm:text-sm text-stone-900 focus:bg-white outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={submittingOffer}
                    className="px-6 py-2.5 gradient-copper-header text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2"
                  >
                    {submittingOffer ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Taklif yuborish</span>
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
