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
  X,
  Plus,
  Trash2,
  Tag,
  ShieldCheck,
  Truck,
  Sparkles,
  Layers,
  ArrowRight,
  Check
} from 'lucide-react';
import { Seller, PurchaseRequest, Offer, ProductItem, Region, UZBEKISTAN_REGIONS } from '@/types';
import { getCategoryById } from '@/lib/categories';

const AVAILABLE_CATEGORIES = [
  { id: 'tv', name: 'Televizor va audio texnika' },
  { id: 'fridge', name: 'Sovutkich va muzlatkich' },
  { id: 'washing', name: 'Kir yuvish va tozalash' },
  { id: 'ac', name: 'Konditsioner va iqlim texnikasi' },
  { id: 'phone', name: 'Smartfon, planshet va gadjetlar' },
  { id: 'laptop', name: 'Noutbuk va kompyuter texnikasi' },
  { id: 'vacuum', name: 'Changyutkich va mayda texnika' },
  { id: 'stove', name: 'Plita va duxovka pechlar' },
  { id: 'microwave', name: 'Mikroto‘lqinli va mini-pech' },
  { id: 'auto', name: 'Avto ehtiyot qismlar va moylar' },
  { id: 'build', name: 'Qurilish va ta’mirlash mollari' },
  { id: 'furniture', name: 'Mebel va uy jihozlari' },
  { id: 'clothes', name: 'Kiyim-kechak va poyabzallar' },
  { id: 'tools', name: 'Asbob-uskunalar va stanoklar' },
  { id: 'other', name: 'Boshqa barcha turdagi tovarlar (erkin)' },
];

export default function SellerDashboardPage() {
  const router = useRouter();
  const [currentSeller, setCurrentSeller] = useState<Seller | null>(null);
  const [matchingRequests, setMatchingRequests] = useState<PurchaseRequest[]>([]);
  const [sellerProducts, setSellerProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'products'>('requests');

  // Offer Modal states
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerProductName, setOfferProductName] = useState('');
  const [offerBrand, setOfferBrand] = useState('');
  const [offerModel, setOfferModel] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [offerImageUrl, setOfferImageUrl] = useState('');
  const [offerCondition, setOfferCondition] = useState<'new' | 'ideal' | 'used'>('new');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerSuccessMsg, setOfferSuccessMsg] = useState<string | null>(null);

  // New Product Modal states (Majburiy va Qo'shimcha maydonlar)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('tv');
  const [newProdCustomCategory, setNewProdCustomCategory] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCondition, setNewProdCondition] = useState<'new' | 'ideal' | 'used'>('new');
  const [newProdRegion, setNewProdRegion] = useState<Region>('Toshkent shahri');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdModel, setNewProdModel] = useState('');
  const [newProdWarranty, setNewProdWarranty] = useState('1 yil rasmiy kafolat');
  const [newProdDelivery, setNewProdDelivery] = useState('Shahar bo‘ylab yetkazib berish mavjud');
  const [newProdImageUrl, setNewProdImageUrl] = useState('');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [customAttributes, setCustomAttributes] = useState<{ key: string; value: string }[]>([]);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [productSuccessMsg, setProductSuccessMsg] = useState<string | null>(null);

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
        if (parsed.regions && parsed.regions[0]) {
          setNewProdRegion(parsed.regions[0]);
        }
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

  // Yangi tovar kiritish (Majburiy va Qo'shimcha maydonlar bilan)
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSeller) return;

    if (!newProdName.trim() || !newProdPrice) {
      alert('Iltimos, tovar nomi va narxini kiriting.');
      return;
    }

    setIsSubmittingProduct(true);
    setProductSuccessMsg(null);

    // Dinamik parametrlarni obyektga aylantirish
    const attrObj: Record<string, string> = {};
    customAttributes.forEach(attr => {
      if (attr.key.trim() && attr.value.trim()) {
        attrObj[attr.key.trim()] = attr.value.trim();
      }
    });

    const categoryDisplayName = newProdCategory === 'other' && newProdCustomCategory.trim() 
      ? newProdCustomCategory.trim() 
      : (AVAILABLE_CATEGORIES.find(c => c.id === newProdCategory)?.name || newProdCategory);

    const defaultImg = 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80';

    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: currentSeller.id,
          name: newProdName.trim(),
          category: newProdCategory === 'other' && newProdCustomCategory.trim() ? newProdCustomCategory.trim() : newProdCategory,
          categoryName: categoryDisplayName,
          brand: newProdBrand.trim() || 'Boshqa',
          model: newProdModel.trim() || '',
          price: Number(newProdPrice.replace(/\D/g, '')),
          condition: newProdCondition,
          region: newProdRegion,
          warranty: newProdWarranty.trim(),
          delivery: newProdDelivery.trim(),
          description: newProdDescription.trim(),
          imageUrl: newProdImageUrl.trim() || defaultImg,
          customAttributes: attrObj,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProductSuccessMsg('Tovar muvaffaqiyatli katalogingizga qo‘shildi!');
        loadData(currentSeller);
        setTimeout(() => {
          setIsAddProductModalOpen(false);
          setProductSuccessMsg(null);
          // Formani tozalash
          setNewProdName('');
          setNewProdPrice('');
          setNewProdBrand('');
          setNewProdModel('');
          setNewProdDescription('');
          setNewProdImageUrl('');
          setCustomAttributes([]);
          setActiveTab('products');
        }, 1200);
      } else {
        alert(data.error || 'Tovarni qo‘shishda xatolik yuz berdi');
      }
    } catch (err) {
      alert('Server bilan bog‘lanishda xatolik');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!currentSeller || !confirm('Ushbu tovarni katalogdan o‘chirmoqchimisiz?')) return;

    try {
      const res = await fetch(`/api/seller/products?productId=${productId}&sellerId=${currentSeller.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        loadData(currentSeller);
      } else {
        alert(data.error || 'O‘chirishda xatolik');
      }
    } catch (e) {
      alert('Server xatosi');
    }
  };

  // Dinamik parametr qatori qo'shish/o'chirish
  const addAttributeRow = () => {
    setCustomAttributes(prev => [...prev, { key: '', value: '' }]);
  };

  const removeAttributeRow = (index: number) => {
    setCustomAttributes(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateAttributeRow = (index: number, field: 'key' | 'value', val: string) => {
    setCustomAttributes(prev => {
      const copy = [...prev];
      copy[index][field] = val;
      return copy;
    });
  };

  // Taklif yuborish modali
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
          price: Number(offerPrice.replace(/\D/g, '')),
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
        }, 2000);
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
      
      {/* 1. SOTUVCHI PROFILI PANELI */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-orange-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-copper-header flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-brand-500/30">
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

        {/* Tugmalar guruhi: Yangi tovar qo'shish, Katalog va Chiqish */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-white/10">
          <button
            type="button"
            onClick={() => setIsAddProductModalOpen(true)}
            className="px-5 py-2.5 gradient-copper-header text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-brand-500/25 flex items-center gap-2 active:scale-95 transition hover:brightness-105"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yangi tovar qo‘shish</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'products' ? 'requests' : 'products')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'products' 
                ? 'bg-white text-stone-900 shadow-md' 
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Katalog ({sellerProducts.length})</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Chiqish</span>
          </button>
        </div>
      </div>

      {/* 2. STATISTIKA KARTALARI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div 
          onClick={() => setActiveTab('requests')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            activeTab === 'requests' 
              ? 'bg-orange-50 border-brand-400 shadow-sm' 
              : 'bg-white border-stone-200 hover:border-brand-300'
          }`}
        >
          <span className="text-xs text-stone-500 font-bold block">Sizga mos talablar:</span>
          <span className="text-2xl font-black text-brand-600">{matchingRequests.length} ta</span>
        </div>

        <div 
          onClick={() => setActiveTab('products')}
          className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
            activeTab === 'products' 
              ? 'bg-orange-50 border-brand-400 shadow-sm' 
              : 'bg-white border-stone-200 hover:border-brand-300'
          }`}
        >
          <div>
            <span className="text-xs text-stone-500 font-bold block">Do‘kon mahsulotlari:</span>
            <span className="text-2xl font-black text-stone-900">{sellerProducts.length} ta</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsAddProductModalOpen(true);
            }}
            className="p-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-brand-700 font-bold text-xs flex items-center gap-1 transition"
            title="Yangi tovar qo‘shish"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Qo‘shish</span>
          </button>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-semibold block">Reyting:</span>
            <span className="text-2xl font-black text-amber-500">★ 4.9</span>
          </div>
          <button 
            onClick={() => loadData(currentSeller)}
            title="Yangilash"
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. ASOSIY BO'LIM: TURLI TABLAR (TALABLAR VA MAHSULOTLAR KATALOGI) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl space-y-6">
        
        {/* Tab sarlavhalari */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('requests')}
              className={`text-sm sm:text-base font-black flex items-center gap-2 pb-1 border-b-2 transition ${
                activeTab === 'requests' 
                  ? 'border-brand-600 text-brand-700' 
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Sizning hududingizdagi talablar ({matchingRequests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`text-sm sm:text-base font-black flex items-center gap-2 pb-1 border-b-2 transition ${
                activeTab === 'products' 
                  ? 'border-brand-600 text-brand-700' 
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Do‘koningizdagi tovarlar ({sellerProducts.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAddProductModalOpen(true)}
            className="px-4 py-1.5 gradient-copper-header text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1 active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tovar qo‘shish</span>
          </button>
        </div>

        {/* TAB 1: TALABLAR RO'YXATI */}
        {activeTab === 'requests' && (
          matchingRequests.length === 0 ? (
            <div className="text-center py-12 text-stone-500 space-y-2">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="font-bold text-sm text-stone-700">Hozircha yangi talablar yo‘q</p>
              <p className="text-xs text-stone-400">Yangi xaridor so‘rov qoldirganda sizga SMS keladi.</p>
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
                          {catData?.name || reqItem.category}
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
          )
        )}

        {/* TAB 2: DO'KON MAHSULOTLARI KATALOGI */}
        {activeTab === 'products' && (
          <div>
            {sellerProducts.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Package className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="font-black text-stone-800 text-base">Katalogingizda hali tovarlar yo‘q</h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Do‘koningizda bor tovarlarni (maishiy texnika, elektronika, ehtiyot qismlar, kiyim, qurilish mollari va h.k.) kiriting.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(true)}
                  className="px-6 py-2.5 gradient-copper-header text-white font-bold text-xs sm:text-sm rounded-xl shadow-md inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Birinchi tovarni kiritish</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sellerProducts.map((prod) => (
                  <div 
                    key={prod.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-brand-400 transition shadow-sm flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2">
                      <div className="w-full h-36 rounded-xl overflow-hidden bg-stone-100 relative">
                        <img 
                          src={prod.imageUrl} 
                          alt={prod.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                        />
                        <div className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {prod.categoryName || prod.category}
                        </div>
                        <div className="absolute top-2 right-2 bg-brand-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                          {prod.condition === 'new' ? 'Yangi' : prod.condition === 'ideal' ? 'Ideal' : 'Ishlatilgan'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-brand-700 bg-orange-100/80 px-2 py-0.5 rounded-md">
                          {prod.brand}
                        </span>
                        <span className="text-sm font-black text-stone-900">
                          {prod.price.toLocaleString('uz-UZ')} so‘m
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-stone-900 line-clamp-1">
                        {prod.name}
                      </h4>

                      {prod.description && (
                        <p className="text-xs text-stone-500 line-clamp-2">
                          {prod.description}
                        </p>
                      )}

                      {/* Qo'shimcha parametrlar preview */}
                      {prod.customAttributes && Object.keys(prod.customAttributes).length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {Object.entries(prod.customAttributes).slice(0, 3).map(([k, v], idx) => (
                            <span key={idx} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-semibold">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[11px] text-stone-400">
                        {prod.region}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                        title="Tovarni o‘chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🌟 4. YANGI TOVAR QO'SHISH MODAL OYNASI (MAJBURITY VA QO'SHIMCHA MAYDONLAR BILAN) */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="glass-3d bg-white max-w-2xl w-full rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border-2 border-orange-300 relative my-auto max-h-[90vh] overflow-y-auto">
            
            {/* Modal sarlavhasi */}
            <div className="flex items-center justify-between border-b border-orange-200/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-copper-header text-white flex items-center justify-center shadow-md">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-stone-900">
                    Yangi tovar kiritish
                  </h3>
                  <p className="text-xs text-stone-500">
                    Do‘koningizdagi tovar ma’lumotlarini kiriting (barcha tovar turlari uchun)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddProductModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-orange-100/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {productSuccessMsg ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-base font-black text-stone-900">{productSuccessMsg}</h4>
              </div>
            ) : (
              <form onSubmit={handleAddProduct} className="space-y-4">
                
                {/* 🔴 A. MAJBURIY MAYDONLAR BLOKI */}
                <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-brand-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
                    Majburiy maydonlar:
                  </span>

                  {/* 1. Tovar nomi */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800">
                      Tovar yoki mahsulot nomi *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      placeholder="Masalan: Samsung 55 Smart TV / Cobalt akkumulyator 60Ah / Armatura 12mm / Divan Chester"
                      className="w-full glass-3d-input rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-stone-900 focus:outline-none"
                    />
                  </div>

                  {/* 2. Kategoriya / Soha tanlash */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-800">
                        Tovar sohasi / Kategoriyasi *
                      </label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="w-full glass-3d-input rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none cursor-pointer"
                      >
                        {AVAILABLE_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Narxi */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-800">
                        Sotuv narxi (so‘mda) *
                      </label>
                      <input
                        type="text"
                        required
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        placeholder="Masalan: 4500000"
                        className="w-full glass-3d-input rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-black text-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Agar "boshqa" toifa tanlansa, erkin yozish */}
                  {newProdCategory === 'other' && (
                    <div className="space-y-1 animate-fade-in">
                      <label className="text-xs font-bold text-stone-800">
                        O‘zingizning tovar kategoriyangizni yozing:
                      </label>
                      <input
                        type="text"
                        value={newProdCustomCategory}
                        onChange={(e) => setNewProdCustomCategory(e.target.value)}
                        placeholder="Masalan: Qishloq xo‘jaligi texnikasi, Sport jihozlari, Kitoblar..."
                        className="w-full glass-3d-input rounded-xl px-3.5 py-2 text-xs font-semibold text-stone-900 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Holati va Hudud */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-800">Holati *</label>
                      <select
                        value={newProdCondition}
                        onChange={(e) => setNewProdCondition(e.target.value as any)}
                        className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none cursor-pointer"
                      >
                        <option value="new">Yangi (Qadoqda)</option>
                        <option value="ideal">Ideal holatda</option>
                        <option value="used">Ishlatilgan (b/u)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-800">Sotuv hududi *</label>
                      <select
                        value={newProdRegion}
                        onChange={(e) => setNewProdRegion(e.target.value as Region)}
                        className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none cursor-pointer"
                      >
                        {UZBEKISTAN_REGIONS.map((reg) => (
                          <option key={reg} value={reg}>{reg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 🟢 B. QO'SHIMCHA MAYDONLAR BLOKI (IXTIYORIY) */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-stone-500" />
                    Qo‘shimcha maydonlar (Ixtiyoriy):
                  </span>

                  {/* Brend va Model */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-600">Brend / Ishlab chiqaruvchi</label>
                      <input
                        type="text"
                        value={newProdBrand}
                        onChange={(e) => setNewProdBrand(e.target.value)}
                        placeholder="Masalan: Samsung, Artel, Bosch, DeWalt..."
                        className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-600">Model yoki artikul</label>
                      <input
                        type="text"
                        value={newProdModel}
                        onChange={(e) => setNewProdModel(e.target.value)}
                        placeholder="Masalan: CU7100, M-42, Art-80"
                        className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Kafolat va Yetkazib berish */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-600">Kafolat muddati</label>
                      <input
                        type="text"
                        value={newProdWarranty}
                        onChange={(e) => setNewProdWarranty(e.target.value)}
                        placeholder="Masalan: 1 yil kafolat, 3 yil, Kafolatsiz"
                        className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-600">Yetkazib berish sharti</label>
                      <input
                        type="text"
                        value={newProdDelivery}
                        onChange={(e) => setNewProdDelivery(e.target.value)}
                        placeholder="Masalan: Bepul yetkazish, Olib ketish"
                        className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Rasm URL */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-600">Tovar rasmi (URL)</label>
                    <input
                      type="url"
                      value={newProdImageUrl}
                      onChange={(e) => setNewProdImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                    />
                  </div>

                  {/* Izoh va Tavsif */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-600">Tovar tavsifi va xususiyatlari</label>
                    <textarea
                      rows={2}
                      value={newProdDescription}
                      onChange={(e) => setNewProdDescription(e.target.value)}
                      placeholder="Tovar holati, afzalliklari, o‘lchamlari haqida batafsil..."
                      className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none resize-none"
                    />
                  </div>

                  {/* ⚡ C. DINAMIK QO'SHIMCHA PARAMETRLAR (RANGI, O'LCHAMI, VAZNI...) */}
                  <div className="pt-2 border-t border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-700">
                        Maxsus parametrlar (Rangi, O‘lchami, Hajmi...):
                      </span>
                      <button
                        type="button"
                        onClick={addAttributeRow}
                        className="px-2.5 py-1 rounded-lg bg-orange-100 hover:bg-orange-200 text-brand-700 text-[11px] font-bold flex items-center gap-1 transition"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Parametr qo‘shish</span>
                      </button>
                    </div>

                    {customAttributes.length > 0 && (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {customAttributes.map((attr, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={attr.key}
                              onChange={(e) => updateAttributeRow(idx, 'key', e.target.value)}
                              placeholder="Parametr nomi (masalan: Rangi)"
                              className="flex-1 glass-3d-input rounded-xl px-2.5 py-1.5 text-xs text-stone-900 focus:outline-none"
                            />
                            <input
                              type="text"
                              value={attr.value}
                              onChange={(e) => updateAttributeRow(idx, 'value', e.target.value)}
                              placeholder="Qiymati (masalan: Qora)"
                              className="flex-1 glass-3d-input rounded-xl px-2.5 py-1.5 text-xs text-stone-900 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeAttributeRow(idx)}
                              className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-stone-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tugmalar */}
                <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddProductModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition"
                  >
                    Bekor qilish
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingProduct}
                    className="px-7 py-2.5 gradient-copper-header text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:brightness-105 active:scale-95 transition flex items-center gap-2"
                  >
                    {isSubmittingProduct ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Tovarni katalogga qo‘shish</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 5. TAKLIF YUBORISH MODAL OYNASI */}
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
                      Katalogingizdan tanlash (ixtiyoriy):
                    </label>
                    <select
                      onChange={(e) => {
                        const prod = sellerProducts.find(p => p.id === e.target.value);
                        if (prod) selectCatalogProduct(prod);
                      }}
                      defaultValue=""
                      className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                    >
                      <option value="">Do‘kon tovarlaridan tanlang...</option>
                      {sellerProducts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} - {p.price.toLocaleString('uz-UZ')} so‘m
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Taklif etilayotgan tovar nomi *</label>
                  <input
                    type="text"
                    required
                    value={offerProductName}
                    onChange={(e) => setOfferProductName(e.target.value)}
                    className="w-full glass-3d-input rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Brend</label>
                    <input
                      type="text"
                      value={offerBrand}
                      onChange={(e) => setOfferBrand(e.target.value)}
                      placeholder="Artel, Samsung..."
                      className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Model</label>
                    <input
                      type="text"
                      value={offerModel}
                      onChange={(e) => setOfferModel(e.target.value)}
                      placeholder="55AU90G / HD 341..."
                      className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Sizning narxingiz (so‘m) *</label>
                    <input
                      type="text"
                      required
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      className="w-full glass-3d-input rounded-xl px-3.5 py-2 text-sm font-black text-brand-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Holati *</label>
                    <select
                      value={offerCondition}
                      onChange={(e) => setOfferCondition(e.target.value as any)}
                      className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none"
                    >
                      <option value="new">Yangi (Kafolatli)</option>
                      <option value="ideal">Ideal holatda</option>
                      <option value="used">Ishlatilgan</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Xaridor uchun izoh va yetkazib berish</label>
                  <textarea
                    rows={2}
                    value={offerDescription}
                    onChange={(e) => setOfferDescription(e.target.value)}
                    className="w-full glass-3d-input rounded-xl p-3 text-xs text-stone-900 focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-50"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={submittingOffer}
                    className="px-6 py-2.5 gradient-copper-header text-white text-xs sm:text-sm font-black rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    {submittingOffer ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>SMS orqali yuborish</span>
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
