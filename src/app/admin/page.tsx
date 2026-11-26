'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Users, 
  ShoppingBag, 
  MessageSquare, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  Layers,
  X
} from 'lucide-react';
import { Seller, PurchaseRequest, SMSLog, CategoryInfo } from '@/types';

export default function AdminPage() {
  const [authState, setAuthState] = useState<'checking' | 'authorized' | 'denied'>('checking');
  const [authError, setAuthError] = useState('');
  const [adminUser, setAdminUser] = useState<{ id: string; firstName: string; username?: string } | null>(null);
  const [tgInitData, setTgInitData] = useState('');
  const [reqFilter, setReqFilter] = useState<'all' | 'active' | 'fulfilled'>('all');
  const [reqSearch, setReqSearch] = useState('');

  const [stats, setStats] = useState<any>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [smsData, setSmsData] = useState<{ logs: SMSLog[]; totalCount: number; totalSpentSoM: number; pricePerSms: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'categories' | 'stats' | 'sellers' | 'requests' | 'sms'>('requests');
  const [offerModalReq, setOfferModalReq] = useState<PurchaseRequest | null>(null);
  const [adminOfferPrice, setAdminOfferPrice] = useState('');
  const [adminOfferMsg, setAdminOfferMsg] = useState('');
  const [adminPhoneInput, setAdminPhoneInput] = useState('+998901234567');
  const [isSendingOffer, setIsSendingOffer] = useState(false);

  const handleSendAdminOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerModalReq || !adminOfferPrice.trim()) return;
    setIsSendingOffer(true);
    try {
      const res = await fetch('/api/admin/send-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': tgInitData,
        },
        body: JSON.stringify({
          requestId: offerModalReq.id,
          offerPrice: adminOfferPrice,
          message: adminOfferMsg,
          adminPhone: adminPhoneInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setOfferModalReq(null);
        setAdminOfferPrice('');
        setAdminOfferMsg('');
        fetchAllData(tgInitData);
      } else {
        alert(data.error || 'Xatolik');
      }
    } catch {
      alert('Server bilan bog‘lanishda xatolik');
    } finally {
      setIsSendingOffer(false);
    }
  };

  // New Category modal states
  const [isNewCatModal, setIsNewCatModal] = useState(false);
  const [newCatId, setNewCatId] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [filtersList, setFiltersList] = useState<{ id: string; label: string; optionsStr: string }[]>([
    { id: 'brand', label: 'Brend', optionsStr: 'Hammasi, Apple, Samsung, Asus, Lenovo, HP' },
    { id: 'spec1', label: 'Asosiy parametr', optionsStr: 'Hammasi, Standart, Pro, Ultra' },
  ]);

  const fetchAllData = async (initDataParam?: string) => {
    const authHeader = initDataParam ?? tgInitData;
    if (!authHeader) return;
    try {
      setLoading(true);
      const headers = { 'x-telegram-init-data': authHeader };
      const [statsRes, sellersRes, requestsRes, smsRes, catRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/sellers', { headers }),
        fetch('/api/requests'),
        fetch('/api/admin/sms', { headers }),
        fetch('/api/categories'),
      ]);

      const [statsJson, sellersJson, reqJson, smsJson, catJson] = await Promise.all([
        statsRes.json(),
        sellersRes.json(),
        requestsRes.json(),
        smsRes.json(),
        catRes.json(),
      ]);

      if (statsJson.success) setStats(statsJson.data);
      if (sellersJson.success) setSellers(sellersJson.data);
      if (reqJson.success) setRequests(reqJson.data);
      if (smsJson.success) setSmsData(smsJson.data);
      if (catJson.success) setCategories(catJson.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const tg = (window as any).Telegram?.WebApp;
        if (tg) {
          tg.ready?.();
          tg.expand?.();
        }
        const initData = tg?.initData || '';
        const res = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        });
        const data = await res.json();
        if (res.ok && data.authorized) {
          setTgInitData(initData);
          setAdminUser(data.admin);
          setAuthState('authorized');
          await fetchAllData(initData);
        } else {
          setAuthError(data.error || 'Kirish taqiqlangan! Faqat ruxsat etilgan Adminlar kira oladi.');
          setAuthState('denied');
          setLoading(false);
        }
      } catch {
        setAuthError('Admin autentifikatsiyasini tekshirishda xatolik.');
        setAuthState('denied');
        setLoading(false);
      }
    };
    checkAdminAuth();
  }, []);

  const handleToggleBlock = async (sellerId: string) => {
    try {
      const res = await fetch('/api/admin/sellers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': tgInitData,
        },
        body: JSON.stringify({ sellerId }),
      });
      const data = await res.json();
      if (data.success) fetchAllData();
    } catch (e) {
      alert('Xatolik');
    }
  };

  const handleAddFilterRow = () => {
    setFiltersList(prev => [...prev, { id: `param_${Date.now()}`, label: 'Yangi parametr', optionsStr: 'Hammasi, Variant 1, Variant 2' }]);
  };

  const handleRemoveFilterRow = (index: number) => {
    setFiltersList(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatId || !newCatName) {
      alert('Kategoriya ID va Nomi talab qilinadi');
      return;
    }

    const formattedFilters = filtersList.map(f => ({
      id: f.id.trim(),
      label: f.label.trim(),
      type: 'select' as const,
      options: f.optionsStr.split(',').map(o => o.trim()).filter(Boolean),
    }));

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newCatId.toLowerCase().trim(),
          name: newCatName.trim(),
          iconName: 'SlidersHorizontal',
          description: newCatDesc.trim(),
          filters: formattedFilters,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsNewCatModal(false);
        setNewCatId('');
        setNewCatName('');
        setNewCatDesc('');
        fetchAllData();
      } else {
        alert(data.error || 'Xatolik');
      }
    } catch (e) {
      alert('Server xatosi');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm(`Haqiqatan ham "${id}" kategoriyasini o‘chirmoqchimisiz?`)) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchAllData();
    } catch (e) {
      alert('Xatolik');
    }
  };

  if (authState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC] p-6">
        <div className="bg-white rounded-3xl p-8 border border-[#E7E9F2] shadow-xl text-center space-y-3 max-w-sm w-full">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-base font-extrabold text-[#0F172A]">Admin huquqi tekshirilmoqda...</h2>
          <p className="text-xs text-[#64748B]">Telegram ID autentifikatsiyasi</p>
        </div>
      </div>
    );
  }

  if (authState === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC] p-6">
        <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-2xl text-center space-y-4 max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-9 h-9" />
          </div>
          <h1 className="text-xl font-black text-[#0F172A]">⛔ Kirish taqiqlangan</h1>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            {authError || 'Admin panelga faqat oldindan belgilangan administrator Telegram ID lari (@arzonoling_bot orqali) kira oladi.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full py-3 rounded-2xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-extrabold text-sm transition"
          >
            Bozorga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const filteredRequests = requests.filter((r) => {
    if (reqFilter === 'active' && r.status === 'fulfilled') return false;
    if (reqFilter === 'fulfilled' && r.status !== 'fulfilled') return false;
    if (reqSearch.trim()) {
      const s = reqSearch.toLowerCase();
      const hay = `${r.productTitle || ''} ${r.description || ''} ${r.buyerName || ''} ${r.buyerPhone || ''} ${r.region || ''}`.toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 animate-fade-in">
      {/* Sarlavha paneli */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white rounded-3xl p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-black">Iqtisodchi Admin Markazi</h1>
              {adminUser && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold">
                  ✓ {adminUser.firstName} (ID: {adminUser.id})
                </span>
              )}
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Xaridor talablari, Telegram bot takliflari, sotuvchilar va platforma nazorati
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => fetchAllData()}
            className="flex-1 sm:flex-initial px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Yangilash</span>
          </button>
          <Link
            href="/"
            className="flex-1 sm:flex-initial px-4 py-2 bg-white text-[#0F172A] hover:bg-indigo-50 text-xs font-extrabold rounded-xl transition text-center"
          >
            Bozor ↗
          </Link>
        </div>
      </div>

      {/* KPI METRIKALAR */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-1">
            <span className="text-xs text-stone-400 font-semibold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-brand-600" /> Kategoriyalar
            </span>
            <span className="text-2xl font-black text-stone-900">{categories.length} ta toifa</span>
            <span className="text-[11px] text-brand-600 block font-semibold">Dinamik boshqaruv</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-1">
            <span className="text-xs text-stone-400 font-semibold flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-brand-600" /> Jami talablar
            </span>
            <span className="text-2xl font-black text-stone-900">{stats.totalRequests}</span>
            <span className="text-[11px] text-emeraldTech-600 block font-semibold">{stats.activeRequests} ta faol</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-1">
            <span className="text-xs text-stone-400 font-semibold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emeraldTech-600" /> Faol sotuvchilar
            </span>
            <span className="text-2xl font-black text-stone-900">{stats.activeSellers}</span>
            <span className="text-[11px] text-stone-400 block">Jami {stats.totalSellers} ta</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-1">
            <span className="text-xs text-stone-400 font-semibold flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" /> Yuborilgan SMSlar
            </span>
            <span className="text-2xl font-black text-amber-600">{stats.totalSmsCount}</span>
            <span className="text-[11px] text-stone-400 block">Sarfi: {stats.totalSmsSpentSoM.toLocaleString('uz-UZ')} so‘m</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-1">
            <span className="text-xs text-stone-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Gemini AI
            </span>
            <span className="text-2xl font-black text-brand-600">{stats.totalAiQueries}</span>
            <span className="text-[11px] text-emeraldTech-600 block font-semibold">Ulangan va faol</span>
          </div>
        </div>
      )}

      {/* TABLAR */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'requests'
              ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-500/20'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          🔥 Xaridor Talablari ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('sellers')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'sellers'
              ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-500/20'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Sotuvchilar ({sellers.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-500/20'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Toifalar ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'requests'
              ? 'gradient-copper-header text-white shadow-md shadow-brand-500/20'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Talablar ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('sms')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'sms'
              ? 'gradient-copper-header text-white shadow-md shadow-brand-500/20'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          SMS Tarixi ({smsData?.totalCount || 0})
        </button>
      </div>

      {/* 1. KATEGORIYALAR VA PARAMETRLAR BO'LIMI (FOYDALANUVCHI TALABI BO'YICHA) */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-brand-600" />
                <span>Qurilma toifalari va ularning maxsus parametrlari</span>
              </h2>
              <p className="text-xs text-stone-500">
                Faqat maishiy texnika emas, balki smartfon, noutbuk, avtotexnika va boshqa har qanday toifalarni parametrlari bilan qo‘shishingiz mumkin
              </p>
            </div>
            <button
              onClick={() => setIsNewCatModal(true)}
              className="px-4 py-2.5 gradient-copper-header text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi toifa qo‘shish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-brand-300 transition space-y-3 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-orange-100 text-brand-800 text-xs font-bold font-mono">
                      {cat.id}
                    </span>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="O‘chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-black text-base text-stone-900">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-xs text-stone-500">{cat.description}</p>
                  )}

                  {/* Parametrlar */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                      Maxsus parametrlar ({cat.filters?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cat.filters?.map((f, fIdx) => (
                        <span key={fIdx} className="bg-white border border-stone-200 text-stone-700 text-[11px] px-2 py-0.5 rounded-lg font-medium">
                          <strong>{f.label}:</strong> {f.options?.slice(0, 3).join(', ')}...
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SOTUVCHILAR */}
      {activeTab === 'sellers' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xl space-y-4">
          <h2 className="text-lg font-black text-stone-900">Ro‘yxatdan o‘tgan sotuvchilar</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 uppercase text-[10px] text-stone-400 font-bold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Do‘kon</th>
                  <th className="py-3 px-4">Telefon</th>
                  <th className="py-3 px-4">Hududlar</th>
                  <th className="py-3 px-4">Holati</th>
                  <th className="py-3 px-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sellers.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-50/80">
                    <td className="py-3 px-4 font-bold text-stone-900">{s.shopName}</td>
                    <td className="py-3 px-4 font-mono">{s.phone}</td>
                    <td className="py-3 px-4">{s.regions.join(', ')}</td>
                    <td className="py-3 px-4">
                      {s.isBlocked ? (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">Bloklangan</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emeraldTech-100 text-emeraldTech-800 font-bold text-[10px]">Faol</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleBlock(s.id)}
                        className={`px-3 py-1 rounded-lg font-bold text-xs ${
                          s.isBlocked ? 'bg-emeraldTech-600 text-white' : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {s.isBlocked ? 'Faollashtirish' : 'Bloklash'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TALABLAR (Mijozlarning arzon narx so'rovlari) */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900">Xaridor talablari (Arzon narx so‘rovlari)</h2>
              <p className="text-xs text-stone-500">Mijozlarga Telegram bot orqali maxsus arzon narx taklifi yuboring yoki to‘g‘ridan-to‘g‘ri qo‘ng‘iroq qiling.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'active', 'fulfilled'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setReqFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    reqFilter === f ? 'bg-[#6366F1] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {f === 'all' ? 'Barchasi' : f === 'active' ? 'Kutilmoqda' : 'Yuborilgan'}
                </button>
              ))}
              <input
                type="text"
                value={reqSearch}
                onChange={(e) => setReqSearch(e.target.value)}
                placeholder="Qidirish (tovar, tel)..."
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 uppercase text-[10px] text-stone-400 font-bold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">ID / Vaqt</th>
                  <th className="py-3 px-4">Tovar va Joriy narx</th>
                  <th className="py-3 px-4">Hudud</th>
                  <th className="py-3 px-4">Mijoz va Telefon</th>
                  <th className="py-3 px-4">Holat</th>
                  <th className="py-3 px-4 text-right">Taklif / Aloqa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/70">
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">{r.id}</div>
                      <div className="text-[10px] text-stone-400">{new Date(r.createdAt).toLocaleString('uz-UZ')}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-stone-900 truncate">{r.productTitle || r.description}</div>
                      {r.currentStore && (
                        <div className="text-[11px] text-stone-500">{r.currentStore}: {r.currentPrice || `${r.budget.toLocaleString('uz-UZ')} so‘m`}</div>
                      )}
                      {r.adminOfferNote && (
                        <div className="text-[11px] text-emerald-700 font-bold mt-0.5">Taklif: {r.adminOfferNote}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">{r.region}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold">{r.buyerName} {r.telegramUsername ? `(@${r.telegramUsername})` : ''}</div>
                      <a href={`tel:${r.buyerPhone}`} className="text-brand-600 font-mono font-bold hover:underline">
                        📞 {r.buyerPhone}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      {r.status === 'fulfilled' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Taklif yuborildi</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">Kutilmoqda</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setOfferModalReq(r);
                          setAdminOfferPrice('');
                          setAdminOfferMsg('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs"
                      >
                        📲 Botda taklif yuborish
                      </button>
                      <a
                        href={`tel:${r.buyerPhone}`}
                        className="inline-block px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]"
                      >
                        Qo‘ng‘iroq
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADMIN TAKLIF YUBORISH MODALI */}
      {offerModalReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-black text-stone-900">Mijozga arzonroq taklif yuborish</h3>
              <button onClick={() => setOfferModalReq(null)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 text-xs space-y-1">
              <div className="font-bold text-stone-900">{offerModalReq.productTitle || offerModalReq.description}</div>
              <div className="text-stone-500">Mijoz: {offerModalReq.buyerName} ({offerModalReq.buyerPhone})</div>
              {offerModalReq.currentPrice && <div className="text-stone-500">Joriy narx: {offerModalReq.currentPrice} ({offerModalReq.currentStore})</div>}
            </div>
            <form onSubmit={handleSendAdminOffer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Sizning arzon narxingiz (so‘m)</label>
                <input
                  type="text"
                  required
                  value={adminOfferPrice}
                  onChange={(e) => setAdminOfferPrice(e.target.value)}
                  placeholder="Masalan: 135 000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-bold outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Izoh / Yetkazib berish sharti</label>
                <textarea
                  rows={2}
                  value={adminOfferMsg}
                  onChange={(e) => setAdminOfferMsg(e.target.value)}
                  placeholder="Masalan: Toshkent bo‘ylab bugun bepul yetkazib beramiz, original."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Admin aloqa raqami</label>
                <input
                  type="text"
                  value={adminPhoneInput}
                  onChange={(e) => setAdminPhoneInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSendingOffer}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-lg"
              >
                {isSendingOffer ? 'Yuborilmoqda...' : '📲 Telegram bot orqali yuborish'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SMS TARIXI */}
      {activeTab === 'sms' && smsData && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xl space-y-4">
          <h2 className="text-lg font-black text-stone-900">SMS xabarnomalar jurnali</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 uppercase text-[10px] text-stone-400 font-bold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Qabul qiluvchi</th>
                  <th className="py-3 px-4">SMS Matni</th>
                  <th className="py-3 px-4">Vaqt</th>
                  <th className="py-3 px-4 text-right">Narx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {smsData.logs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 px-4 font-bold">{log.recipientName} ({log.recipientPhone})</td>
                    <td className="py-3 px-4 max-w-md font-mono text-[11px]">{log.message}</td>
                    <td className="py-3 px-4">{new Date(log.sentAt).toLocaleString('uz-UZ')}</td>
                    <td className="py-3 px-4 text-right font-bold">{log.costSoM} so‘m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* YANGI TOIFA QO'SHISH MODALI */}
      {isNewCatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">Yangi texnika toifasi va parametrlari</h3>
              <button onClick={() => setIsNewCatModal(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Kategoriya ID (lotincha)</label>
                  <input
                    type="text"
                    required
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    placeholder="masalan: laptop, phone, printer"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-stone-900 focus:bg-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Toifa nomi (O‘zbekcha)</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Masalan: Noutbuklar, Smartfonlar"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Qisqa tavsif</label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Gaming, ofis va o‘qish uchun noutbuklar"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:bg-white outline-none"
                />
              </div>

              {/* Maxsus parametrlar */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700">Maxsus parametrlar (Filtrlar):</label>
                  <button
                    type="button"
                    onClick={handleAddFilterRow}
                    className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Parametr qo‘shish
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {filtersList.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200">
                      <input
                        type="text"
                        value={f.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFiltersList(prev => prev.map((item, i) => i === idx ? { ...item, label: val } : item));
                        }}
                        placeholder="Nomi (RAM)"
                        className="w-1/3 bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs"
                      />
                      <input
                        type="text"
                        value={f.optionsStr}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFiltersList(prev => prev.map((item, i) => i === idx ? { ...item, optionsStr: val } : item));
                        }}
                        placeholder="Variantlar (vergul bilan)"
                        className="flex-1 bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFilterRow(idx)}
                        className="text-stone-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCatModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 gradient-copper-header text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
