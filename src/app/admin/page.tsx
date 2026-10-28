'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Users, 
  ShoppingBag, 
  MessageSquare, 
  Sparkles, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Lock, 
  Unlock, 
  RefreshCw,
  Search,
  MapPin,
  ExternalLink,
  PhoneCall
} from 'lucide-react';
import { Seller, PurchaseRequest, SMSLog } from '@/types';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [smsData, setSmsData] = useState<{ logs: SMSLog[]; totalCount: number; totalSpentSoM: number; pricePerSms: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'sellers' | 'requests' | 'sms'>('stats');

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, sellersRes, requestsRes, smsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/sellers'),
        fetch('/api/requests'),
        fetch('/api/admin/sms'),
      ]);

      const [statsJson, sellersJson, reqJson, smsJson] = await Promise.all([
        statsRes.json(),
        sellersRes.json(),
        requestsRes.json(),
        smsRes.json(),
      ]);

      if (statsJson.success) setStats(statsJson.data);
      if (sellersJson.success) setSellers(sellersJson.data);
      if (reqJson.success) setRequests(reqJson.data);
      if (smsJson.success) setSmsData(smsJson.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleToggleBlock = async (sellerId: string) => {
    try {
      const res = await fetch('/api/admin/sellers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      }
    } catch (e) {
      alert('Xatolik');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Sarlavha paneli */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-400/30 flex items-center justify-center text-brand-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">Platforma Boshqaruv Markazi (Admin)</h1>
            <p className="text-xs text-slate-400">
              Sotuvchilar, talablar, AI monitoringi va SMS xarajatlari nazorati
            </p>
          </div>
        </div>

        <button
          onClick={fetchAllData}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Yangilash</span>
        </button>
      </div>

      {/* 1. ASOSIY METRIKALAR (KPI) */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-brand-600" /> Jami talablar
            </span>
            <span className="text-2xl font-black text-slate-900">{stats.totalRequests}</span>
            <span className="text-[11px] text-emeraldTech-600 block font-semibold">{stats.activeRequests} ta faol</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emeraldTech-600" /> Faol sotuvchilar
            </span>
            <span className="text-2xl font-black text-slate-900">{stats.activeSellers}</span>
            <span className="text-[11px] text-slate-500 block">Jami {stats.totalSellers} ta ro‘yxatda</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Jami takliflar
            </span>
            <span className="text-2xl font-black text-indigo-600">{stats.totalOffers}</span>
            <span className="text-[11px] text-slate-500 block">Sotuvchilar tomonidan</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" /> Yuborilgan SMSlar
            </span>
            <span className="text-2xl font-black text-amber-600">{stats.totalSmsCount}</span>
            <span className="text-[11px] text-slate-500 block">Sarfi: {stats.totalSmsSpentSoM.toLocaleString('uz-UZ')} so‘m</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> AI so‘rovlari
            </span>
            <span className="text-2xl font-black text-purple-600">{stats.totalAiQueries}</span>
            <span className="text-[11px] text-emeraldTech-600 block font-semibold">100% muvaffaqiyatli</span>
          </div>
        </div>
      )}

      {/* TABLAR */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'stats'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Umumiy ko‘rinish
        </button>
        <button
          onClick={() => setActiveTab('sellers')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'sellers'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Sotuvchilar ({sellers.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'requests'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Xaridor talablari ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('sms')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'sms'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          SMS xarajatlari va Tarixi ({smsData?.totalCount || 0})
        </button>
      </div>

      {/* 2. SOTUVCHILAR BO'LIMI */}
      {activeTab === 'sellers' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4">
          <h2 className="text-lg font-black text-slate-900">Ro‘yxatdan o‘tgan sotuvchilar</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Do‘kon / Sotuvchi</th>
                  <th className="py-3 px-4">Telefon</th>
                  <th className="py-3 px-4">Hududlar (max 3)</th>
                  <th className="py-3 px-4">Holati</th>
                  <th className="py-3 px-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{s.shopName}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{s.ownerName} ({s.login})</span>
                    </td>
                    <td className="py-3 px-4 font-mono">{s.phone}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {s.regions.map(r => (
                          <span key={r} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {s.isBlocked ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                          Bloklangan
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emeraldTech-100 text-emeraldTech-800 font-bold text-[10px]">
                          Faol
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleBlock(s.id)}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                          s.isBlocked 
                            ? 'bg-emeraldTech-600 hover:bg-emeraldTech-700 text-white' 
                            : 'bg-red-50 hover:bg-red-100 text-red-600'
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

      {/* 3. XARIDOR TALABLARI BO'LIMI */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4">
          <h2 className="text-lg font-black text-slate-900">Platformadagi barcha talablar</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">ID / Kategoriya</th>
                  <th className="py-3 px-4">Tavsif</th>
                  <th className="py-3 px-4">Budjet</th>
                  <th className="py-3 px-4">Viloyat</th>
                  <th className="py-3 px-4">Xaridor</th>
                  <th className="py-3 px-4">Holati</th>
                  <th className="py-3 px-4 text-right">Havola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{r.id}</div>
                      <span className="text-[10px] uppercase text-brand-600 font-bold">{r.category}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">{r.description}</td>
                    <td className="py-3 px-4 font-bold text-emeraldTech-600">
                      {r.budget.toLocaleString('uz-UZ')} so‘m
                    </td>
                    <td className="py-3 px-4">{r.region}</td>
                    <td className="py-3 px-4">
                      <div>{r.buyerName}</div>
                      <span className="text-[10px] text-slate-400">{r.buyerPhone}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        r.status === 'active' ? 'bg-emeraldTech-100 text-emeraldTech-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link 
                        href={`/request/${r.id}`}
                        target="_blank"
                        className="text-brand-600 hover:text-brand-800 font-bold flex items-center justify-end gap-1"
                      >
                        <span>Ochish</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SMS XARAJATLARI VA TARIXI BO'LIMI */}
      {activeTab === 'sms' && smsData && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">SMS xabarnomalar monitoringi va Xarajatlar</h2>
              <p className="text-xs text-slate-500">
                O‘zbekiston SMS provayderi (Eskiz / PlayMobile) API integratsiyasi
              </p>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-500 block">Jami xarajat:</span>
                <span className="text-base font-black text-amber-600">
                  {smsData.totalSpentSoM.toLocaleString('uz-UZ')} so‘m
                </span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-[11px] text-slate-500 block">1 ta SMS narxi:</span>
                <span className="text-sm font-bold text-slate-800">65 so‘m</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Qabul qiluvchi</th>
                  <th className="py-3 px-4">Turi</th>
                  <th className="py-3 px-4">SMS Matni</th>
                  <th className="py-3 px-4">Vaqti</th>
                  <th className="py-3 px-4">Holati</th>
                  <th className="py-3 px-4 text-right">Narxi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {smsData.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{log.recipientName}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{log.recipientPhone}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.recipientType === 'buyer' ? 'bg-indigo-100 text-indigo-800' : 'bg-emeraldTech-100 text-emeraldTech-800'
                      }`}>
                        {log.recipientType === 'buyer' ? 'Xaridor' : 'Sotuvchi'}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-md font-mono text-[11px] text-slate-800 bg-slate-50/50 p-2 rounded">
                      {log.message}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.sentAt).toLocaleString('uz-UZ')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emeraldTech-100 text-emeraldTech-800 text-[10px] font-bold">
                        Yetkazildi
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {log.costSoM} so‘m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. STATS OVERVIEW TAB */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              AI Maishiy Texnika Tahlil Tizimi
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Foydalanuvchi qidiruv maydoniga oddiy tilda yozgan so‘rovlarni sun’iy intellekt tahlil qiladi. O‘zbekiston bozoridagi o‘rtacha real narxlar va haqiqiy modellarga solishtirib, foydalanuvchiga adolatli tavsiyalar taqdim etadi.
            </p>
            <div className="p-3 bg-brand-50 rounded-2xl border border-brand-100 text-xs text-brand-900 space-y-1">
              <span className="font-bold block">Integratsiya qilingan toifalar:</span>
              <p>Televizorlar, Sovutkichlar, Kir yuvish mashinalari, Konditsionerlar, Changyutkichlar, Gaz va elektr plitalar, Mikroto‘lqinli pechlar.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emeraldTech-600" />
              Hududiy Qamrov (14 ta viloyat)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Xaridor o‘z viloyatini tanlaganda, tizim faqat o‘sha viloyatda xizmat ko‘rsatuvchi faol va tasdiqlangan sotuvchilarga SMS xabarnoma yuboradi. Natijada xaridor faqat o‘ziga yetkazib bera oladigan sotuvchilardan taklif oladi.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Toshkent', 'Samarqand', 'Farg‘ona', 'Andijon', 'Namangan', 'Buxoro', 'Xorazm', 'Qashqadaryo', 'Surxondaryo', 'Jizzax', 'Sirdaryo', 'Navoiy', 'Qoraqalpog‘iston'].map(r => (
                <span key={r} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
