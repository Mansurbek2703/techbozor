'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, User, Phone, Lock, MapPin, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { UZBEKISTAN_REGIONS, Region, CategoryKey } from '@/types';
import { CATEGORIES } from '@/lib/categories';

export default function SellerRegisterPage() {
  const router = useRouter();
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [sellerType, setSellerType] = useState<'business' | 'individual'>('business');
  const [selectedRegions, setSelectedRegions] = useState<Region[]>(['Toshkent shahri']);
  const [selectedCategories, setSelectedCategories] = useState<CategoryKey[]>([
    'tv', 'fridge', 'washing', 'ac', 'vacuum', 'stove', 'microwave'
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleRegion = (reg: Region) => {
    if (selectedRegions.includes(reg)) {
      if (selectedRegions.length === 1) {
        alert('Kamida bitta viloyatni tanlashingiz shart');
        return;
      }
      setSelectedRegions(selectedRegions.filter(r => r !== reg));
    } else {
      if (selectedRegions.length >= 3) {
        alert('Sotuvchi ko‘pi bilan 3 ta viloyatni tanlay oladi (Texnik topshiriq talabi)');
        return;
      }
      setSelectedRegions([...selectedRegions, reg]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!shopName || !phone || !login || !password) {
      setError('Iltimos, barcha maydonlarni to‘ldiring');
      return;
    }

    if (selectedRegions.length === 0 || selectedRegions.length > 3) {
      setError('Sotuvchi 1 tadan 3 tagacha viloyat tanlashi kerak');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/seller/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          shopName,
          ownerName: ownerName || shopName,
          phone,
          login,
          password,
          sellerType,
          regions: selectedRegions,
          categories: selectedCategories,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('techbozor_seller', JSON.stringify(data.data));
        }
        alert('Muvaffaqiyatli ro‘yxatdan o‘tdingiz!');
        router.push('/seller/dashboard');
      } else {
        setError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError('Server bilan ulanishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2 border-b border-slate-100 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emeraldTech-500 text-white flex items-center justify-center mx-auto shadow-lg">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Sotuvchi sifatida ro‘yxatdan o‘tish
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Xaridorlarning real talablarini SMS orqali qabul qiling va to‘g‘ridan-to‘g‘ri sotuvlarni amalga oshiring.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Sotuvchi turi */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Faoliyat turi</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSellerType('business')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition ${
                  sellerType === 'business'
                    ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🏢 Biznes / Do‘kon / MCHJ
              </button>
              <button
                type="button"
                onClick={() => setSellerType('individual')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition ${
                  sellerType === 'individual'
                    ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                👤 Jismoniy shaxs / Yakka tartibdagi
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Do‘kon yoki savdo markazi nomi *</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Masalan: Texnomart, MediaCenter..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mas’ul shaxs ismi (F.I.SH)</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Alisher Karimov"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Telefon raqam (SMS bildirishnoma uchun) *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tizim uchun Login *</label>
              <input
                type="text"
                required
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="smart_dokon"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Parol *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-brand-500 outline-none"
            />
          </div>

          {/* Faoliyat hududlari (1 dan 3 tagacha viloyat) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>Xizmat ko‘rsatadigan viloyatlaringiz (1 tadan 3 tagacha) *</span>
              </label>
              <span className="text-xs font-extrabold text-brand-600">
                Tanlandi: {selectedRegions.length}/3
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Siz faqat tanlagan viloyatlardan tushgan talablar bo‘yicha SMS xabarlar olasiz.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {UZBEKISTAN_REGIONS.map((region) => {
                const isSelected = selectedRegions.includes(region);
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => toggleRegion(region)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-left border flex items-center justify-between transition ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{region}</span>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emeraldTech-600 to-emeraldTech-500 hover:from-emeraldTech-500 hover:to-emeraldTech-600 text-white font-extrabold text-base shadow-lg shadow-emeraldTech-600/25 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Ro‘yxatdan o‘tish va Kabinetga kirish</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
          Hisobingiz bormi?{' '}
          <Link href="/seller/login" className="font-bold text-brand-600 hover:underline">
            Tizimga kirish
          </Link>
        </div>
      </div>
    </div>
  );
}
