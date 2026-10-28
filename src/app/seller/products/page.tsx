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
  X
} from 'lucide-react';
import { Seller, ProductItem, CategoryKey } from '@/types';
import { CATEGORIES, getCategoryById } from '@/lib/categories';

export default function SellerProductsPage() {
  const router = useRouter();
  const [currentSeller, setCurrentSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New product form states
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Samsung');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState<CategoryKey>('tv');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<'new' | 'ideal'>('new');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80');
  const [submitting, setSubmitting] = useState(false);

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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSeller) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: currentSeller.id,
          category,
          name,
          brand,
          model,
          price: Number(price),
          condition,
          imageUrl,
          region: currentSeller.regions[0] || 'Toshkent shahri',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setName('');
        setModel('');
        setPrice('');
        fetchProducts(currentSeller.id);
      } else {
        alert(data.error || 'Xatolik');
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link 
          href="/seller/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-brand-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboardga qaytish</span>
        </Link>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-emeraldTech-600 hover:bg-emeraldTech-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi mahsulot qo‘shish</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Do‘koningiz mahsulotlar katalogi ({products.length})
          </h1>
          <p className="text-xs text-slate-500">
            Katalogingizdagi mahsulotlarni xaridor talabiga bir marta bosish orqali taklif qilib yuborishingiz mumkin
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">Yuklanmoqda...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-2">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-semibold text-sm">Do‘koningizda hali mahsulotlar yo‘q</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              Birinchi mahsulotingizni qo‘shing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div 
                key={prod.id}
                className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 bg-slate-100 overflow-hidden relative">
                    <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-brand-600/90 text-white text-[10px] font-bold">
                      {prod.brand}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2">
                      {prod.name}
                    </h3>
                    <div className="text-base font-black text-emeraldTech-600">
                      {prod.price.toLocaleString('uz-UZ')} so‘m
                    </div>
                    {prod.model && (
                      <span className="text-[11px] text-slate-500 font-mono block">
                        Model: {prod.model}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{prod.condition === 'new' ? 'Yangi' : 'Ideal'}</span>
                  <button
                    onClick={() => handleDelete(prod.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="O‘chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* YANGI MAHSULOT QO'SHISH MODALI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Yangi mahsulot qo‘shish</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Kategoriya</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryKey)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mahsulot to‘liq nomi *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Samsung 55 Crystal 4K Smart TV"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Brend</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Samsung"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Model</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="CU7100"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Narxi (so‘mda) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="4950000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-emeraldTech-700 focus:bg-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Holati</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900"
                  >
                    <option value="new">Yangi (Qutida)</option>
                    <option value="ideal">Ideal holatda</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Rasm havolasi (URL)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emeraldTech-600 hover:bg-emeraldTech-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md"
                >
                  {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
