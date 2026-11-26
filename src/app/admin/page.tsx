'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  ShoppingBag,
  MessageSquare,
  Plus,
  Trash2,
  AlertCircle,
  RefreshCw,
  Layers,
  X,
  Phone,
  Send,
  Search,
  Check,
  Clock,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { Seller, PurchaseRequest, SMSLog, CategoryInfo } from '@/types';

export default function AdminPage() {
  const [authState, setAuthState] = useState<'checking' | 'authorized' | 'denied'>('checking');
  const [authError, setAuthError] = useState('');
  const [adminUser, setAdminUser] = useState<{ id: string; firstName: string; username?: string } | null>(null);
  const [tgInitData, setTgInitData] = useState('');

  const [stats, setStats] = useState<any>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [smsData, setSmsData] = useState<{ logs: SMSLog[]; totalCount: number; totalSpentSoM: number; pricePerSms: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'sellers' | 'categories' | 'sms'>('requests');
  const [toastMsg, setToastMsg] = useState('');

  const [reqFilter, setReqFilter] = useState<'all' | 'active' | 'fulfilled'>('all');
  const [reqSearch, setReqSearch] = useState('');

  // Offer modal
  const [offerModalReq, setOfferModalReq] = useState<PurchaseRequest | null>(null);
  const [adminOfferPrice, setAdminOfferPrice] = useState('');
  const [adminOfferMsg, setAdminOfferMsg] = useState('');
  const [adminPhoneInput, setAdminPhoneInput] = useState('+998901234567');
  const [isSendingOffer, setIsSendingOffer] = useState(false);

  // Assign Seller modal
  const [assignModalReq, setAssignModalReq] = useState<PurchaseRequest | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // New Category modal
  const [isNewCatModal, setIsNewCatModal] = useState(false);
  const [newCatId, setNewCatId] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [filtersList, setFiltersList] = useState<{ id: string; label: string; optionsStr: string }[]>([
    { id: 'brand', label: 'Brend', optionsStr: 'Hammasi, Apple, Samsung, Asus, Lenovo, HP' },
    { id: 'spec1', label: 'Asosiy parametr', optionsStr: 'Hammasi, Standart, Pro, Ultra' },
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const fetchAllData = async (initDataParam?: string) => {
    const authHeader = initDataParam ?? tgInitData;
    if (!authHeader) return;
    try {
      setLoading(true);
      const headers = { 'x-telegram-init-data': authHeader };
      const [statsRes, sellersRes, requestsRes, smsRes, catRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/sellers', { headers }),
        fetch('/api/requests', { headers }),
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
        showToast(data.message);
        setOfferModalReq(null);
        setAdminOfferPrice('');
        setAdminOfferMsg('');
        fetchAllData();
      } else {
        showToast(data.error || 'Xatolik yuz berdi');
      }
    } catch {
      showToast('Server bilan bog‘lanishda xatolik');
    } finally {
      setIsSendingOffer(false);
    }
  };

  const handleAssignSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalReq || !selectedSellerId) return;
    setIsAssigning(true);
    try {
      const res = await fetch('/api/admin/assign-seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': tgInitData,
        },
        body: JSON.stringify({
          requestId: assignModalReq.id,
          sellerId: selectedSellerId,
          note: assignNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setAssignModalReq(null);
        setSelectedSellerId('');
        setAssignNote('');
        fetchAllData();
      } else {
        showToast(data.error || 'Biriktirishda xatolik');
      }
    } catch {
      showToast('Server bilan bog‘lanishda xatolik');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Ushbu talabni o‘chirmoqchimisiz?')) return;
    try {
      const res = await fetch(`/api/requests?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-telegram-init-data': tgInitData },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Talab o‘chirildi');
        fetchAllData();
      } else {
        showToast(data.error || 'O‘chirib bo‘lmadi');
      }
    } catch {
      showToast('Server xatoligi');
    }
  };

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
      if (data.success) {
        showToast('Sotuvchi holati yangilandi');
        fetchAllData();
      }
    } catch {
      showToast('Xatolik');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatId || !newCatName) return;
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
          description: newCatDesc.trim() || `${newCatName} toifasi`,
          filters: formattedFilters,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsNewCatModal(false);
        setNewCatId('');
        setNewCatName('');
        setNewCatDesc('');
        showToast('Yangi toifa qo‘shildi');
        fetchAllData();
      }
    } catch {
      showToast('Xatolik');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Ushbu toifani o‘chirmoqchimisiz?')) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Toifa o‘chirildi');
        fetchAllData();
      }
    } catch {
      showToast('Xatolik');
    }
  };

  if (authState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC] p-6">
        <div className="bg-white rounded-3xl p-8 border border-[#E7E9F2] shadow-xl text-center space-y-3 max-w-sm w-full">
          <div className="w-10 h-10 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-base font-extrabold text-[#0F172A]">Admin huquqi tekshirilmoqda...</h2>
          <p className="text-xs text-[#64748B]">Telegram ID autentifikatsiyasi</p>
        </div>
      </div>
    );
  }

  if (authState === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC] p-6">
        <div className="bg-white rounded-3xl p-7 border border-rose-200 shadow-2xl text-center space-y-4 max-w-md w-full">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-lg font-black text-[#0F172A]">⛔ Kirish taqiqlangan</h1>
          <p className="text-xs text-[#475569] leading-relaxed">
            {authError || 'Admin panelga faqat oldindan belgilangan administrator Telegram ID lari kira oladi.'}
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

  const pendingCount = requests.filter(r => r.status !== 'fulfilled').length;
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
    <div className="min-h-screen bg-[#F7F8FC] pb-12">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-sm z-50 bg-[#0F172A] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-4">
        {/* Compact Mini-App Friendly Header */}
        <header className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-black truncate">Admin Markazi</h1>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-indigo-200">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="truncate">{adminUser?.firstName} · ID: {adminUser?.id}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => fetchAllData()}
                className="p-2 sm:px-3 sm:py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                title="Yangilash"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Yangilash</span>
              </button>
              <Link
                href="/"
                className="px-3 py-2 bg-white text-[#0F172A] hover:bg-indigo-50 text-xs font-extrabold rounded-xl transition"
              >
                Bozor ↗
              </Link>
            </div>
          </div>
        </header>

        {/* 4 Balanced KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-[#E7E9F2] shadow-xs">
            <div className="flex items-center justify-between text-[11px] text-[#64748B] font-bold">
              <span>Jami talablar</span>
              <ShoppingBag className="w-3.5 h-3.5 text-[#6366F1]" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#0F172A] mt-1">{requests.length}</div>
            <div className="text-[10px] text-amber-600 font-bold mt-0.5">{pendingCount} ta javob kutmoqda</div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E7E9F2] shadow-xs">
            <div className="flex items-center justify-between text-[11px] text-[#64748B] font-bold">
              <span>Sotuvchilar</span>
              <Users className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#0F172A] mt-1">{sellers.length}</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">{stats?.activeSellers || 0} ta faol</div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E7E9F2] shadow-xs">
            <div className="flex items-center justify-between text-[11px] text-[#64748B] font-bold">
              <span>Toifalar</span>
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#0F172A] mt-1">{categories.length}</div>
            <div className="text-[10px] text-[#64748B] font-semibold mt-0.5">Katalog guruhlari</div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E7E9F2] shadow-xs">
            <div className="flex items-center justify-between text-[11px] text-[#64748B] font-bold">
              <span>SMS / Xabarlar</span>
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#0F172A] mt-1">{smsData?.totalCount || 0}</div>
            <div className="text-[10px] text-[#64748B] font-semibold mt-0.5">{(smsData?.totalSpentSoM || 0).toLocaleString('uz-UZ')} so‘m</div>
          </div>
        </div>

        {/* Clean Scrollable Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'requests', label: `Talablar (${requests.length})` },
            { id: 'sellers', label: `Sotuvchilar (${sellers.length})` },
            { id: 'categories', label: `Toifalar (${categories.length})` },
            { id: 'sms', label: `SMS (${smsData?.totalCount || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#6366F1] text-white shadow-sm'
                  : 'bg-white text-[#475569] border border-[#E7E9F2] hover:bg-[#EEF0FF]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ============================================================
            TAB 1: XARIDOR TALABLARI (Mobile Cards + Desktop Table)
            ============================================================ */}
        {activeTab === 'requests' && (
          <div className="space-y-3">
            {/* Search & Filter Bar */}
            <div className="bg-white rounded-2xl p-3 border border-[#E7E9F2] shadow-xs space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
              <div className="flex items-center gap-1.5">
                {(['all', 'active', 'fulfilled'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setReqFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                      reqFilter === f ? 'bg-[#6366F1] text-white' : 'bg-[#F1F3FB] text-[#475569]'
                    }`}
                  >
                    {f === 'all' ? 'Barchasi' : f === 'active' ? 'Kutilmoqda' : 'Yuborilgan'}
                  </button>
                ))}
              </div>
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reqSearch}
                  onChange={(e) => setReqSearch(e.target.value)}
                  placeholder="Tovar, mijoz yoki telefon..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F7F8FC] border border-[#E7E9F2] text-xs outline-none focus:border-[#6366F1]"
                />
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-[#E7E9F2] text-center space-y-2">
                <ShoppingBag className="w-8 h-8 text-[#94A3B8] mx-auto" />
                <div className="text-sm font-extrabold text-[#0F172A]">Hozircha xaridor talablari yo‘q</div>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  Mijozlar bozorda istalgan tovar yonidagi «Yanada arzonroq olish ⚡» tugmasini bosib talab yuborganda shu yerda ko‘rinadi.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Mini App Card List */}
                <div className="md:hidden space-y-2.5">
                  {filteredRequests.map((r) => (
                    <div key={r.id} className="bg-white rounded-2xl p-3.5 border border-[#E7E9F2] shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-extrabold text-[#64748B]">{r.id}</span>
                        {r.status === 'fulfilled' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
                            <CheckCircle2 className="w-3 h-3" /> Taklif yuborildi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-extrabold">
                            <Clock className="w-3 h-3" /> Kutilmoqda
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="text-sm font-extrabold text-[#0F172A] leading-snug">
                          {r.productTitle || r.description}
                        </div>
                        {r.currentStore && (
                          <div className="text-xs text-[#475569] mt-0.5">
                            {r.currentStore}: <span className="font-bold text-[#4338CA]">{r.currentPrice || `${r.budget.toLocaleString('uz-UZ')} so‘m`}</span>
                          </div>
                        )}
                        {r.adminOfferNote && (
                          <div className="mt-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800">
                            ✓ Yuborilgan taklif: {r.adminOfferNote}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F1F3FB] text-xs">
                        <div>
                          <div className="font-bold text-[#0F172A]">
                            {r.buyerName} {r.telegramUsername ? <span className="text-[#6366F1]">(@{r.telegramUsername})</span> : ''}
                          </div>
                          <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#6366F1]" /> {r.region}
                          </div>
                        </div>
                        <a
                          href={`tel:${r.buyerPhone}`}
                          className="px-2.5 py-1 rounded-lg bg-[#EEF0FF] text-[#4338CA] font-mono text-[11px] font-extrabold"
                        >
                          {r.buyerPhone}
                        </a>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setOfferModalReq(r);
                            setAdminOfferPrice('');
                            setAdminOfferMsg('');
                          }}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Taklif</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAssignModalReq(r);
                            setSelectedSellerId(sellers[0]?.id || '');
                            setAssignNote('');
                          }}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-extrabold text-xs flex items-center justify-center gap-1"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Sotuvchiga</span>
                        </button>
                        <a
                          href={`tel:${r.buyerPhone}`}
                          className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200"
                          title="Qo‘ng‘iroq qilish"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(r.id)}
                          className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200"
                          title="O‘chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-3xl border border-[#E7E9F2] shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#334155]">
                    <thead className="bg-[#F7F8FC] uppercase text-[10px] text-[#64748B] font-bold border-b border-[#E7E9F2]">
                      <tr>
                        <th className="py-3 px-4">ID / Vaqt</th>
                        <th className="py-3 px-4">Tovar va Joriy narx</th>
                        <th className="py-3 px-4">Hudud</th>
                        <th className="py-3 px-4">Mijoz va Telefon</th>
                        <th className="py-3 px-4">Holat</th>
                        <th className="py-3 px-4 text-right">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F3FB]">
                      {filteredRequests.map((r) => (
                        <tr key={r.id} className="hover:bg-[#FAFBFD]">
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#0F172A]">{r.id}</div>
                            <div className="text-[10px] text-[#94A3B8]">{new Date(r.createdAt).toLocaleString('uz-UZ')}</div>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-bold text-[#0F172A] truncate">{r.productTitle || r.description}</div>
                            {r.currentStore && (
                              <div className="text-[11px] text-[#64748B]">{r.currentStore}: {r.currentPrice || `${r.budget.toLocaleString('uz-UZ')} so‘m`}</div>
                            )}
                            {r.adminOfferNote && (
                              <div className="text-[11px] text-emerald-700 font-bold mt-0.5">Taklif: {r.adminOfferNote}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">{r.region}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold">{r.buyerName} {r.telegramUsername ? `(@${r.telegramUsername})` : ''}</div>
                            <a href={`tel:${r.buyerPhone}`} className="text-[#4F46E5] font-mono font-bold hover:underline">
                              {r.buyerPhone}
                            </a>
                          </td>
                          <td className="py-3 px-4">
                            {r.status === 'fulfilled' ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Taklif yuborildi</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">Kutilmoqda</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setOfferModalReq(r);
                                setAdminOfferPrice('');
                                setAdminOfferMsg('');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-[11px]"
                            >
                              📲 Taklif yuborish
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAssignModalReq(r);
                                setSelectedSellerId(sellers[0]?.id || '');
                                setAssignNote('');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px]"
                            >
                              🤝 Sotuvchiga
                            </button>
                            <a
                              href={`tel:${r.buyerPhone}`}
                              className="inline-block px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]"
                            >
                              Qo‘ng‘iroq
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(r.id)}
                              className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 align-middle"
                              title="O‘chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 2: SOTUVCHILAR
            ============================================================ */}
        {activeTab === 'sellers' && (
          <div className="space-y-2.5">
            {sellers.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-[#E7E9F2] text-center space-y-2">
                <Users className="w-8 h-8 text-[#94A3B8] mx-auto" />
                <div className="text-sm font-extrabold text-[#0F172A]">Hozircha sotuvchilar yo‘q</div>
                <p className="text-xs text-[#64748B]">Telegram bot orqali ro‘yxatdan o‘tgan sotuvchilar shu yerda ko‘rinadi.</p>
              </div>
            ) : (
              sellers.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl p-4 border border-[#E7E9F2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#0F172A]">{s.shopName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.isBlocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'}`}>
                        {s.isBlocked ? 'Bloklangan' : 'Faol'}
                      </span>
                    </div>
                    <div className="text-xs text-[#475569]">{s.ownerName} · <a href={`tel:${s.phone}`} className="font-mono font-bold text-[#4F46E5]">{s.phone}</a></div>
                    <div className="text-[11px] text-[#64748B]">Hududlar: {s.regions.join(', ')}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleBlock(s.id)}
                    className={`px-3.5 py-2 rounded-xl font-bold text-xs shrink-0 ${
                      s.isBlocked ? 'bg-emerald-600 text-white' : 'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}
                  >
                    {s.isBlocked ? 'Faollashtirish' : 'Bloklash'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ============================================================
            TAB 3: TOIFALAR
            ============================================================ */}
        {activeTab === 'categories' && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsNewCatModal(true)}
                className="px-4 py-2 rounded-xl bg-[#6366F1] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi toifa qo‘shish</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white rounded-2xl p-4 border border-[#E7E9F2] shadow-xs flex items-start justify-between gap-2">
                  <div>
                    <div className="font-extrabold text-sm text-[#0F172A]">{cat.name}</div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">{cat.description}</div>
                    <div className="text-[10px] text-[#94A3B8] mt-1 font-mono">ID: {cat.id}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50"
                    title="O‘chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 4: SMS JURNALI
            ============================================================ */}
        {activeTab === 'sms' && (
          <div className="space-y-2.5">
            {(!smsData || smsData.logs.length === 0) ? (
              <div className="bg-white rounded-2xl p-8 border border-[#E7E9F2] text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-[#94A3B8] mx-auto" />
                <div className="text-sm font-extrabold text-[#0F172A]">SMS xabarnomalar jurnali bo‘sh</div>
              </div>
            ) : (
              smsData.logs.map((log) => (
                <div key={log.id} className="bg-white rounded-2xl p-3.5 border border-[#E7E9F2] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0F172A]">{log.recipientName} ({log.recipientPhone})</span>
                    <span className="font-bold text-amber-600">{log.costSoM} so‘m</span>
                  </div>
                  <p className="text-[11px] text-[#475569] font-mono">{log.message}</p>
                  <div className="text-[10px] text-[#94A3B8]">{new Date(log.sentAt).toLocaleString('uz-UZ')}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ADMIN TAKLIF YUBORISH MODALI */}
      {offerModalReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 border border-[#E7E9F2] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EEF0FF] pb-3">
              <h3 className="text-base font-black text-[#0F172A]">Mijozga taklif yuborish</h3>
              <button onClick={() => setOfferModalReq(null)} className="p-1.5 rounded-xl text-[#64748B] hover:bg-[#EEF0FF]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F2] text-xs space-y-1">
              <div className="font-extrabold text-[#0F172A]">{offerModalReq.productTitle || offerModalReq.description}</div>
              <div className="text-[#475569]">Mijoz: {offerModalReq.buyerName} · {offerModalReq.buyerPhone}</div>
              {offerModalReq.currentPrice && (
                <div className="text-[#64748B]">Joriy narx: {offerModalReq.currentPrice} ({offerModalReq.currentStore})</div>
              )}
            </div>
            <form onSubmit={handleSendAdminOffer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Sizning arzon narxingiz (so‘m)</label>
                <input
                  type="text"
                  required
                  value={adminOfferPrice}
                  onChange={(e) => setAdminOfferPrice(e.target.value)}
                  placeholder="Masalan: 135 000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE2FB] text-sm font-bold outline-none focus:border-[#6366F1]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Izoh / Yetkazib berish sharti</label>
                <textarea
                  rows={2}
                  value={adminOfferMsg}
                  onChange={(e) => setAdminOfferMsg(e.target.value)}
                  placeholder="Masalan: Toshkent bo‘ylab bugun yetkazib beramiz."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DDE2FB] text-xs outline-none focus:border-[#6366F1]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Aloqa raqamingiz</label>
                <input
                  type="text"
                  value={adminPhoneInput}
                  onChange={(e) => setAdminPhoneInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DDE2FB] text-xs font-mono outline-none focus:border-[#6366F1]"
                />
              </div>
              <button
                type="submit"
                disabled={isSendingOffer}
                className="w-full py-3 rounded-2xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-extrabold text-sm shadow-lg"
              >
                {isSendingOffer ? 'Yuborilmoqda...' : '📲 Telegram bot orqali yuborish'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SOTUVCHIGA BIRIKTIRISH MODALI */}
      {assignModalReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 border border-[#E7E9F2] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EEF0FF] pb-3">
              <h3 className="text-base font-black text-[#0F172A]">Talabni sotuvchiga biriktirish</h3>
              <button onClick={() => setAssignModalReq(null)} className="p-1.5 rounded-xl text-[#64748B] hover:bg-[#EEF0FF]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F2] text-xs space-y-1">
              <div className="font-extrabold text-[#0F172A]">{assignModalReq.productTitle || assignModalReq.description}</div>
              <div className="text-[#475569]">Hudud: {assignModalReq.region} · Mijoz: {assignModalReq.buyerPhone}</div>
            </div>
            {sellers.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-bold text-center">
                Hozircha ro‘yxatdan o‘tgan sotuvchilar yo‘q. Sotuvchilar avval @arzonoling_bot orqali ro‘yxatdan o‘tishi kerak.
              </div>
            ) : (
              <form onSubmit={handleAssignSeller} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">Sotuvchini tanlang</label>
                  <select
                    required
                    value={selectedSellerId}
                    onChange={(e) => setSelectedSellerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE2FB] text-xs font-bold outline-none focus:border-[#6366F1] bg-white"
                  >
                    {sellers.filter(s => !s.isBlocked).map(s => (
                      <option key={s.id} value={s.id}>
                        {s.shopName} ({s.ownerName} · {s.regions.join(', ')})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">Sotuvchiga izoh (ixtiyoriy)</label>
                  <input
                    type="text"
                    value={assignNote}
                    onChange={(e) => setAssignNote(e.target.value)}
                    placeholder="Masalan: Mijozga bugun uygacha yetkazib bering"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DDE2FB] text-xs outline-none focus:border-[#6366F1]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="w-full py-3 rounded-2xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-extrabold text-sm shadow-lg"
                >
                  {isAssigning ? 'Biriktirilmoqda...' : '🤝 Sotuvchiga yuborish'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* YANGI TOIFA QO'SHISH MODALI */}
      {isNewCatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 border border-[#E7E9F2] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EEF0FF] pb-3">
              <h3 className="text-base font-black text-[#0F172A]">Yangi toifa qo‘shish</h3>
              <button onClick={() => setIsNewCatModal(false)} className="p-1.5 rounded-xl text-[#64748B]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <input
                type="text"
                required
                value={newCatId}
                onChange={(e) => setNewCatId(e.target.value)}
                placeholder="Toifa ID (masalan: printer)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE2FB] text-xs font-mono outline-none focus:border-[#6366F1]"
              />
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Toifa nomi (masalan: Printerlar)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE2FB] text-sm font-bold outline-none focus:border-[#6366F1]"
              />
              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Qisqa tavsif"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE2FB] text-xs outline-none focus:border-[#6366F1]"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#6366F1] text-white font-extrabold text-sm"
              >
                Saqlash
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
