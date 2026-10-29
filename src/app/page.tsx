'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  Sparkles, 
  Send, 
  ExternalLink, 
  Check, 
  RotateCcw, 
  ShoppingBag, 
  Store, 
  Search, 
  MapPin,
  CheckCheck,
  Tag,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  ArrowRight
} from 'lucide-react';
import { SerpProductItem } from '@/lib/serpapi';
import { DynamicFilterFacet } from '@/lib/ecommerce-agent';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  step?: 'clarification' | 'recommendation';
  userIntent?: string;
  category?: string;
  region?: string;
  quickChips?: string[];
  products?: SerpProductItem[];
  facets?: DynamicFilterFacet[];
  timestamp: string;
}

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Assalomu alaykum! Men sizning **AI E-Commerce Yordamchingizman** 🤖.\n\nShevada yoki qisqartirib yozsangiz ham tushunaman (masalan: *"mzlatkich Xorazmga"*, *"12 lik konditsioner"* yoki *"50 duym Smart TV"*). Qanday texnika qidiryapsiz?',
      quickChips: ['12 lik konditsioner Xorazmga', 'Muzlatgich No Frost', '50 duym Smart TV Toshkent', 'Kir yuvish 7kg'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  
  // Faqat qidiruv natijalaridan so'ng hosil bo'ladigan Dinamik Filtrlar (Adaptive Facets)
  const [activeFacetFilters, setActiveFacetFilters] = useState<Record<string, string>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ASOSIY QIDIRUV VA AI AGENT CHAQIRUVI
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);
    setLoadingStage('🧠 So‘rov tahlil qilinmoqda va niyat aniqlanmoqda...');

    const historyPayload = updatedMessages
      .filter(m => m.id !== 'welcome')
      .map(m => ({
        role: m.role,
        content: m.content,
      }));

    try {
      const stageTimer1 = setTimeout(() => {
        setLoadingStage('🔍 O‘zbekiston onlayn do‘konlaridan qidirilmoqda...');
      }, 1200);

      const stageTimer2 = setTimeout(() => {
        setLoadingStage('🛡️ Mahsulotlar saralanmoqda va mos filtrlar tayyorlanmoqda...');
      }, 2500);

      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          history: historyPayload.slice(0, -1),
        }),
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      const data = await res.json();

      if (data.success && data.data) {
        const agentData = data.data;

        setMessages(prev => [
          ...prev,
          {
            id: 'msg-' + Date.now(),
            role: 'model',
            content: agentData.ai_response_text || 'Siz uchun saralangan mahsulotlar:',
            step: agentData.step,
            userIntent: agentData.user_intent,
            category: agentData.category,
            region: agentData.extracted_filters?.region,
            quickChips: agentData.dynamic_chips || [],
            products: agentData.products || [],
            facets: agentData.dynamic_facets || [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);

        // Yangi natija kelsa aktiv filtrlarni tozalash
        if (agentData.products && agentData.products.length > 0) {
          setActiveFacetFilters({});
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: 'msg-' + Date.now(),
          role: 'model',
          content: 'Tarmoqda vaqtinchalik xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: 'Assalomu alaykum! Men sizning **AI E-Commerce Yordamchingizman** 🤖.\n\nShevada yoki qisqartirib yozsangiz ham tushunaman (masalan: *"mzlatkich Xorazmga"*, *"12 lik konditsioner"* yoki *"50 duym Smart TV"*). Qanday texnika qidiryapsiz?',
        quickChips: ['12 lik konditsioner Xorazmga', 'Muzlatgich No Frost', '50 duym Smart TV Toshkent', 'Kir yuvish 7kg'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    setActiveFacetFilters({});
  };

  // Dinamik filtr tanlanganda mahsulotlarni filtrlash
  const filterProductsByFacets = (products: SerpProductItem[] = []) => {
    if (Object.keys(activeFacetFilters).length === 0) return products;

    return products.filter(p => {
      const text = `${p.title} ${p.price} ${p.snippet || ''}`.toLowerCase();
      
      for (const [key, val] of Object.entries(activeFacetFilters)) {
        if (!val || val === 'Hammasi') continue;
        const valLower = val.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanText = text.replace(/[^a-z0-9]/g, '');
        if (!cleanText.includes(valLower)) {
          return false;
        }
      }
      return true;
    });
  };

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

      {/* 🌟 YAGONA CONVERSATIONAL UI HEADER */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-brand-800 text-xs font-black shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Unified Conversational AI E-Commerce v4.0</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Aqlli Qidiruv va Shaxsiy Sotuvchi-Konsultant
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-xl mx-auto">
          Istalgan tilda yoki shevada yozing — AI imloni tuzatadi, hududingizga mos narx va rasmiy O‘zbekiston do‘konlari variantlarini taqdim etadi.
        </p>
      </div>

      {/* 💬 YAGONA CHAT-FIRST MULOQOT KONTEYNERI (STATIK FILTRLARSIZ) */}
      <div className="glass-3d rounded-3xl border border-orange-200/90 shadow-xl overflow-hidden flex flex-col min-h-[580px] bg-white/70 backdrop-blur-md">
        
        {/* Chat Header Panel */}
        <div className="p-4 sm:px-6 border-b border-stone-200/80 bg-white/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-orange-500 to-amber-400 text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-stone-900">
                  AI E-Commerce Assistant
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-[11px] text-stone-500">
                O‘zbekiston onlayn platformalari bo‘yicha to‘liq moslashuvchan qidiruv
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetChat}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
            title="Yangi suhbat boshlash"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Tozalash</span>
          </button>
        </div>

        {/* Xabarlar va Dinamik Kartochkalar Oqimi */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 scrollbar-thin">
          {messages.map((msg) => {
            const displayedProducts = filterProductsByFacets(msg.products);

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[94%] sm:max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm shadow-sm transition-all ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-brand-600 to-orange-600 text-white rounded-tr-xs'
                      : 'bg-white border border-stone-200/90 text-stone-800 rounded-tl-xs space-y-3.5'
                  }`}
                >
                  {/* Agar imlo xatosi tuzatilgan bo'lsa (Typo tolerance) */}
                  {msg.userIntent && msg.role === 'model' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 border border-brand-200 rounded-xl text-[11px] font-bold text-brand-900 shadow-2xs">
                      <CheckCheck className="w-3.5 h-3.5 text-brand-600" />
                      <span>Tuzatilgan so‘rov: <strong>{msg.userIntent}</strong></span>
                      {msg.region && (
                        <span className="ml-1 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[10px]">
                          📍 {msg.region}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Asosiy xabar matni */}
                  <p className="leading-relaxed whitespace-pre-line font-medium text-xs sm:text-sm">
                    {msg.content}
                  </p>

                  {/* 🎯 QIDIRUVDAN SO'NGGINA PAYDO BO'LUVCHI DINAMIK FILTRLAR (ADAPTIVE FACETS) */}
                  {msg.facets && msg.facets.length > 0 && msg.products && msg.products.length > 0 && (
                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-stone-700 flex items-center gap-1">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
                          Topilgan mahsulotlar bo‘yicha dinamik filtrlar:
                        </span>
                        {Object.keys(activeFacetFilters).length > 0 && (
                          <button
                            type="button"
                            onClick={() => setActiveFacetFilters({})}
                            className="text-[10px] text-brand-700 font-bold hover:underline"
                          >
                            Filtrlarni tozalash
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {msg.facets.map((facet) => (
                          <div key={facet.id} className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-stone-200 shadow-2xs">
                            <span className="text-[10px] font-bold text-stone-500">{facet.label}:</span>
                            <select
                              value={activeFacetFilters[facet.id] || 'Hammasi'}
                              onChange={(e) => setActiveFacetFilters(prev => ({
                                ...prev,
                                [facet.id]: e.target.value === 'Hammasi' ? '' : e.target.value,
                              }))}
                              className="bg-transparent text-[11px] font-black text-brand-900 outline-none cursor-pointer"
                            >
                              {facet.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 🛍️ SMART PRODUCT CARDS (KASSETALI KO'RINISHDAGI MAHSULOTLAR) */}
                  {displayedProducts && displayedProducts.length > 0 && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between text-xs font-extrabold text-stone-800">
                        <span className="flex items-center gap-1.5">
                          <ShoppingBag className="w-4 h-4 text-brand-600" />
                          O‘zbekiston onlayn do‘konlaridan topilgan variantlar ({displayedProducts.length}):
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {displayedProducts.map((prod, pIdx) => (
                          <div
                            key={pIdx}
                            className="bg-stone-50/90 hover:bg-white border border-stone-200/90 rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-md group"
                          >
                            <div>
                              {/* Rasm va do'kon */}
                              <div className="w-full h-32 rounded-xl overflow-hidden bg-white mb-2.5 relative flex items-center justify-center border border-stone-100 p-1">
                                <img
                                  src={prod.thumbnail}
                                  alt={prod.title}
                                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-200"
                                />
                                <span className="absolute top-1.5 left-1.5 bg-emerald-700 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                                  <Store className="w-2.5 h-2.5" />
                                  {prod.source}
                                </span>
                              </div>

                              <h4 className="font-extrabold text-xs text-stone-900 line-clamp-2 mb-1 group-hover:text-brand-600 transition">
                                {prod.title}
                              </h4>

                              <div className="text-brand-700 font-black text-xs sm:text-sm mb-1.5">
                                💰 {prod.price}
                              </div>

                              {prod.snippet && (
                                <p className="text-[10px] text-stone-500 line-clamp-2 leading-tight">
                                  {prod.snippet}
                                </p>
                              )}
                            </div>

                            {/* Do'konga o'tish tugmasi */}
                            <div className="mt-3 pt-2 border-t border-stone-200/70">
                              {prod.link && prod.link !== '#' && (
                                <a
                                  href={prod.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full py-2 px-3 bg-gradient-to-r from-brand-600 to-orange-600 hover:brightness-110 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition"
                                >
                                  <span>Do‘konga o‘tish</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 🏷️ DINAMIK TEZKOR TUGMALAR (QUICK CHIPS) */}
                  {msg.quickChips && msg.quickChips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-stone-100">
                      {msg.quickChips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => handleSendMessage(chip)}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-brand-100 text-brand-900 border border-brand-200 rounded-xl text-xs font-bold transition active:scale-95 flex items-center gap-1 shadow-2xs"
                        >
                          <Tag className="w-3 h-3 text-brand-600" />
                          <span>{chip}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <span className={`text-[9px] block text-right mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-stone-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Yuklanish holati */}
          {isLoading && (
            <div className="flex gap-2.5 items-center bg-orange-50/90 border border-orange-200 text-brand-900 rounded-2xl p-3.5 text-xs font-bold shadow-xs">
              <div className="w-3 h-3 rounded-full bg-brand-600 animate-ping" />
              <span>{loadingStage || 'AI variantlarni tahlil qilmoqda...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ⌨️ YAGONA SO'ROV VA QIDIRUV KIRITISH MAYDONI */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Oddiy tilda yozing: masalan 'mzlatkich Xorazmga', '12 lik konditsioner' yoki '50 duym Smart TV'..."
                disabled={isLoading}
                className="w-full bg-stone-50 border border-stone-300 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 rounded-2xl pl-4 pr-10 py-3 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 outline-none transition"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-5 sm:px-6 py-3 bg-gradient-to-r from-brand-600 to-orange-600 hover:brightness-110 active:scale-95 disabled:opacity-40 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow-md transition shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Yuborish</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
