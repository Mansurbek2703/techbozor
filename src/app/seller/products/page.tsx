'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  MapPin, 
  Tag, 
  CheckCircle2, 
  AlertCircle,
  X,
  Sparkles,
  Check
} from 'lucide-react';
import { Seller, ProductItem, Region, UZBEKISTAN_REGIONS } from '@/types';

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

export default function SellerProductsPage() {
  const router = useRouter();
  const [currentSeller, setCurrentSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('tv');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<'new' | 'ideal' | 'used'>('new');
  const [region, setRegion] = useState<Region>('Toshkent shahri');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [warranty, setWarranty] = useState('1 yil rasmiy kafolat');
  const [delivery, setDelivery] = useState('Shahar bo‘ylab yetkazib berish mavjud');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [customAttributes, setCustomAttributes] = useState<{ key: string; value: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
          setRegion(parsed.regions[0]);
        }
      } catch (e) {
        router.push('/seller/login');
      }
    }
  }, [router]);

  const fetchProducts = async (sellerId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/seller/products?sellerId=${sellerId}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentSeller) {
      fetchProducts(currentSeller.id);
    }
  }, [currentSeller]);

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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSeller) return;

    if (!name.trim() || !price) {
      alert('Iltimos, tovar nomi va narxini kiriting.');
      return;
    }

    setSubmitting(true);
    setSuccessMsg(null);

    const attrObj: Record<string, string> = {};
    customAttributes.forEach(attr => {
      if (attr.key.trim() && attr.value.trim()) {
        attrObj[attr.key.trim()] = attr.value.trim();
      }
    });

    const categoryDisplayName = category === 'other' && customCategory.trim() 
      ? customCategory.trim() 
      : (AVAILABLE_CATEGORIES.find(c => c.id === category)?.name || category);

    const defaultImg = 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80';

    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: currentSeller.id,
          name: name.trim(),
          category: category === 'other' && customCategory.trim() ? customCategory.trim() : category,
          categoryName: categoryDisplayName,
          brand: brand.trim() || 'Boshqa',
          model: model.trim() || '',
          price: Number(price.replace(/\D/g, '')),
          condition,
          region,
          warranty: warranty.trim(),
          delivery: delivery.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim() || defaultImg,
          customAttributes: attrObj,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Tovar katalogingizga qo‘shildi!');
        fetchProducts(currentSeller.id);
        setTimeout(() => {
          setIsAddModalOpen(false);
          setSuccessMsg(null);
          setName('');
          setPrice('');
          setBrand('');
          setModel('');
          setDescription('');
          setImageUrl('');
          setCustomAttributes([]);
        }, 1200);
      } else {
        alert(data.error || 'Xatolik yuz berdi');
      }
    } catch (e) {
      alert('Server xatosi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!currentSeller || !confirm('Mahsulotni o‘chirmoqchimisiz?')) return;
    try {
      const res = await fetch(`/api/seller/products?productId=${productId}&sellerId=${currentSeller.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts(currentSeller.id);
      }
    } catch (e) {
      alert('O‘chirishda xatolik');
    }
  };

  if (!currentSeller) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header navigatsiya */}
      <div className="flex items-center justify-between">
        <Link 
          href="/seller/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-600 hover:text-brand-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboardga qaytish</span>
        </Link>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 gradient-copper-header text-white text-xs sm:text-sm font-black rounded-xl shadow-md shadow-brand-500/25 flex items-center gap-1.5 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Yangi tovar kiritish</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-brand-600" />
              <span>Do‘kon tovarlari katalogi</span>
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Do‘koningizda mavjud tovarlar ro‘yxati (xaridorlar talablariga bir tugmada yuborish mumkin)
            </p>
          </div>
          <span className="text-xs font-bold text-brand-700 bg-orange-100 px-3 py-1 rounded-full">
            Jami: {products.length} ta tovar
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-stone-400">Yuklanmoqda...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Package className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-black text-stone-800 text-base">Katalogingiz bo‘sh</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Tovar qo‘shing — xaridorlar talab yuborganda o‘z katalogingizdagi tovarlarni bir marta bosish bilan tezkor narx sifatida taklif qila olasiz.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-2.5 gradient-copper-header text-white font-black text-xs sm:text-sm rounded-xl shadow-md inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi tovar qo‘shish</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div 
                key={prod.id}
                className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-brand-400 transition shadow-sm flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="w-full h-40 rounded-xl overflow-hidden bg-stone-100 relative">
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

                  <h3 className="font-extrabold text-sm text-stone-900 line-clamp-1">
                    {prod.name}
                  </h3>

                  {prod.description && (
                    <p className="text-xs text-stone-500 line-clamp-2">
                      {prod.description}
                    </p>
                  )}

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
                    onClick={() => handleDelete(prod.id)}
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

      {/* TOVAR QO'SHISH MODAL OYNASI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="glass-3d bg-white max-w-2xl w-full rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border-2 border-orange-300 relative my-auto max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-orange-200/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-copper-header text-white flex items-center justify-center shadow-md">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-stone-900">
                    Katalogga tovar qo‘shish
                  </h3>
                  <p className="text-xs text-stone-500">
                    Barcha toifadagi tovarlar uchun majburiy va qo‘shimcha parametrlar
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-orange-100/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-base font-black text-stone-900">{successMsg}</h4>
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
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masalan: Samsung 55 Smart TV / Cobalt akkumulyator 60Ah / Armatura 12mm / Divan Chester"
                      className="w-full glass-3d-input rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-stone-900 focus:outline-none"
                    />
                  </div>

                  {/* 2. Kategoriya va Narx */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-800">
                        Tovar sohasi / Kategoriyasi *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full glass-3d-input rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none cursor-pointer"
                      >
                        {AVAILABLE_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-800">
                        Sotuv narxi (so‘mda) *
                      </label>
                      <input
                        type="text"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Masalan: 4500000"
                        className="w-full glass-3d-input rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-black text-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {category === 'other' && (
                    <div className="space-y-1 animate-fade-in">
                      <label className="text-xs font-bold text-stone-800">
                        O‘zingizning tovar kategoriyangizni yozing:
                      </label>
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Masalan: Qishloq xo‘jaligi mollari, Kitoblar..."
                        className="w-full glass-3d-input rounded-xl px-3.5 py-2 text-xs font-semibold text-stone-900 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Holati va Hudud */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-800">Holati *</label>
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value as any)}
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
                        value={region}
                        onChange={(e) => setRegion(e.target.value as Region)}
                        className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none cursor-pointer"
                      >
                        {UZBEKISTAN_REGIONS.map((reg) => (
                          <option key={reg} value={reg}>{reg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 🟢 B. QO'SHIMCHA MAYDONLAR */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-stone-500" />
                    Qo‘shimcha maydonlar (Ixtiyoriy):
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-600">Brend / Ishlab chiqaruvchi</label>
                      <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="Samsung, Artel, Bosch, Nike..."
                        className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-600">Model yoki artikul</label>
                      <input
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="CU7100, M-42..."
                        className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-600">Kafolat muddati</label>
                      <input
                        type="text"
                        value={warranty}
                        onChange={(e) => setWarranty(e.target.value)}
                        placeholder="1 yil, 3 yil, Kafolatsiz"
                        className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-600">Yetkazib berish sharti</label>
                      <input
                        type="text"
                        value={delivery}
                        onChange={(e) => setDelivery(e.target.value)}
                        placeholder="Bepul yetkazish, Olib ketish"
                        className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-600">Tovar rasmi (URL)</label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-600">Tovar tavsifi va izoh</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tovar xususiyatlari, o‘lchami haqida batafsil..."
                      className="w-full glass-3d-input rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Dinamik parametrlar */}
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
                              placeholder="Nomi (masalan: Rangi)"
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

                <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition"
                  >
                    Bekor qilish
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-7 py-2.5 gradient-copper-header text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:brightness-105 active:scale-95 transition flex items-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Tovarni saqlash</span>
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
