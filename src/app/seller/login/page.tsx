'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Lock, User, ArrowRight, AlertCircle, ShoppingBag } from 'lucide-react';

export default function SellerLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/seller/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          login,
          password,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        // Save current seller to localStorage for session
        if (typeof window !== 'undefined') {
          localStorage.setItem('techbozor_seller', JSON.stringify(data.data));
        }
        router.push('/seller/dashboard');
      } else {
        setError(data.error || 'Login yoki parol noto‘g‘ri');
      }
    } catch (err) {
      setError('Server bilan bog‘lanishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoLogin: string) => {
    setLogin(demoLogin);
    setPassword('password123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-header text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Sotuvchilar kabineti</h1>
          <p className="text-xs text-slate-500">
            Mijozlar talablarini ko‘rish va o‘z narx taklifingizni yuborish uchun tizimga kiring
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Login</label>
            <div className="relative">
              <input
                type="text"
                required
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="texnomart_toshkent"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-brand-500 outline-none"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Parol</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-brand-500 outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition active:scale-95"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Kirish</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo hisoblar tezkor kirish */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            Test hisoblar (bosing va kiring):
          </span>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <button
              type="button"
              onClick={() => fillDemoAccount('texnomart_toshkent')}
              className="text-xs bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 px-2.5 py-1 rounded-lg font-medium transition"
            >
              Texnomart Toshkent
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('smart_samarqand')}
              className="text-xs bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 px-2.5 py-1 rounded-lg font-medium transition"
            >
              Smart Samarqand
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('xorazm_electron')}
              className="text-xs bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 px-2.5 py-1 rounded-lg font-medium transition"
            >
              Xorazm Elektronika
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-600 pt-2">
          Hali hisobingiz yo‘qmi?{' '}
          <Link href="/seller/register" className="font-bold text-brand-600 hover:underline">
            Sotuvchi sifatida ro‘yxatdan o‘tish
          </Link>
        </div>
      </div>
    </div>
  );
}
