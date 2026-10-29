'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ArrowRight, 
  MessageSquare, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SerpProductItem } from '@/lib/serpapi';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  step?: 'clarification' | 'recommendation';
  products?: SerpProductItem[];
  searchQuery?: string;
  timestamp: string;
}

interface EcommerceAgentChatProps {
  onSelectProduct?: (product: SerpProductItem) => void;
}

export default function EcommerceAgentChat({ onSelectProduct }: EcommerceAgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Assalomu alaykum! Men sizning shaxsiy **AI Sotuvchi-Konsultantingizman** 🤖.\n\nQanday maishiy texnika yoki elektronika qidiryapsiz? Masalan, "50 duymli Smart TV", "Inverter sovutkich" yoki "Kir yuvish mashinasi".',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [isOpen, setIsOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);
    setLoadingStage('🧠 Gemini AI so‘rovingizni tahlil qilmoqda...');

    // Suhbat tarixini backendga yuborish uchun tayyorlash
    const historyPayload = newMessages
      .filter(m => m.id !== 'welcome')
      .map(m => ({
        role: m.role,
        content: m.content,
      }));

    try {
      // 2 soniyadan so'ng stage o'zgaradi
      const stageTimer = setTimeout(() => {
        setLoadingStage('🔍 SerpAPI orqali internetdan eng yaxshi narx va variantlar qidirilmoqda...');
      }, 1500);

      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          history: historyPayload.slice(0, -1), // so'nggi xabardan oldingi tarix
        }),
      });

      clearTimeout(stageTimer);
      const data = await res.json();

      if (data.success && data.data) {
        const agentData = data.data;

        if (agentData.step === 'clarification') {
          // Ssenariy A: Aniqlashtirish
          setMessages(prev => [
            ...prev,
            {
              id: 'msg-' + Date.now(),
              role: 'model',
              content: agentData.clarifying_question || 'So‘rovingizga aniqlik kirita olasizmi?',
              step: 'clarification',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ]);
        } else {
          // Ssenariy B: Qidiruv va Tahlil
          setMessages(prev => [
            ...prev,
            {
              id: 'msg-' + Date.now(),
              role: 'model',
              content: agentData.advice_markdown || 'Siz uchun saralangan mahsulotlar:',
              step: 'recommendation',
              products: agentData.products || [],
              searchQuery: agentData.search_query,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ]);
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: 'msg-' + Date.now(),
            role: 'model',
            content: 'Uzr, so‘rovingizni qayta ishlashda vaqtinchalik xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: 'msg-' + Date.now(),
          role: 'model',
          content: 'Tarmoqda xatolik yuz berdi. Iltimos, internet ulanishini tekshiring.',
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
        content: 'Assalomu alaykum! Men sizning shaxsiy **AI Sotuvchi-Konsultantingizman** 🤖.\n\nQanday maishiy texnika yoki elektronika qidiryapsiz? Masalan, "50 duymli Smart TV", "Inverter sovutkich" yoki "Kir yuvish mashinasi".',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  // Oddiy Markdown matnini chiroyli render qiluvchi funksiya
  const renderFormattedText = (text: string) => {
    // Rasm teglarini markdown dan tozalash (chunki rasmlar pastda chiroyli Card larda ko'rinadi)
    const cleanedText = text.replace(/!\[.*?\]\(.*?\)/g, '').trim();

    return cleanedText.split('\n').map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      // Sarlavhalar
      if (trimmed.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-black text-stone-900 mt-2 mb-1">{trimmed.replace('### ', '')}</h4>;
      }
      if (trimmed.startsWith('#### ')) {
        return <h5 key={idx} className="text-xs font-extrabold text-stone-800 mt-2 mb-1">{trimmed.replace('#### ', '')}</h5>;
      }
      if (trimmed.startsWith('---')) {
        return <hr key={idx} className="my-2 border-stone-200" />;
      }

      // Bold matnlarni ajratish
      const parts = trimmed.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="text-xs leading-relaxed text-stone-700 my-0.5">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-bold text-stone-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="glass-3d rounded-3xl p-4 sm:p-5 border-2 border-brand-500/30 shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Yuqori Panel (Header) */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-orange-500 to-amber-400 text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-stone-900">
                AI Sotuvchi-Konsultant
              </h3>
              <span className="bg-brand-100 text-brand-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-600" />
                Gemini + SerpAPI
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Talabingizni aniqlab, Google & internetdan real narx va variantlarni topadi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleResetChat}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition"
            title="Suhbatni yangilash"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition"
            title={isOpen ? 'Kichraytirish' : 'Ochish'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-3 space-y-3">
          {/* Xabarlar ro'yxati konteyneri */}
          <div className="max-h-[460px] overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-7 h-7 rounded-xl bg-orange-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div 
                  className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-brand-600 to-orange-600 text-white rounded-tr-xs' 
                      : 'bg-white/95 border border-stone-200 text-stone-800 rounded-tl-xs'
                  }`}
                >
                  {/* Matn mazmuni */}
                  {msg.role === 'user' ? (
                    <p className="leading-relaxed font-medium">{msg.content}</p>
                  ) : (
                    <div className="space-y-2">
                      {renderFormattedText(msg.content)}

                      {/* Mahsulotlar kartalari (SerpAPI natijalari) */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-stone-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
                              <ShoppingBag className="w-3.5 h-3.5 text-brand-600" />
                              Internetdan topilgan real variantlar ({msg.products.length}):
                            </span>
                            {msg.searchQuery && (
                              <span className="text-[10px] text-stone-400 font-mono truncate max-w-[150px]">
                                🔍 {msg.searchQuery}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {msg.products.map((prod, pIdx) => (
                              <div 
                                key={pIdx} 
                                className="bg-stone-50/90 hover:bg-white border border-stone-200/80 rounded-xl p-2.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md group"
                              >
                                <div>
                                  {/* Mahsulot rasmi */}
                                  {prod.thumbnail ? (
                                    <div className="w-full h-28 rounded-lg overflow-hidden bg-white mb-2 relative flex items-center justify-center">
                                      <img 
                                        src={prod.thumbnail} 
                                        alt={prod.title} 
                                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-200"
                                      />
                                      <span className="absolute top-1 left-1 bg-stone-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                        <Store className="w-2.5 h-2.5" />
                                        {prod.source}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="w-full h-20 rounded-lg bg-stone-200/50 mb-2 flex items-center justify-center text-stone-400 text-[10px]">
                                      Rasm mavjud emas
                                    </div>
                                  )}

                                  {/* Sarlavha va narx */}
                                  <h6 className="font-bold text-stone-900 line-clamp-2 text-[11px] mb-1 group-hover:text-brand-600 transition">
                                    {prod.title}
                                  </h6>

                                  <div className="text-brand-700 font-black text-xs mb-1">
                                    💰 {prod.price}
                                  </div>

                                  {prod.snippet && (
                                    <p className="text-[10px] text-stone-500 line-clamp-2 leading-tight">
                                      {prod.snippet}
                                    </p>
                                  )}
                                </div>

                                {/* Tugmalar: Do'konga o'tish va Tanlash */}
                                <div className="mt-2.5 pt-2 border-t border-stone-200/60 flex items-center gap-1.5">
                                  {prod.link && prod.link !== '#' && (
                                    <a
                                      href={prod.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-1 py-1.5 px-2 bg-stone-200/80 hover:bg-stone-300 text-stone-800 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition"
                                    >
                                      <span>Do‘konga o‘tish</span>
                                      <ExternalLink className="w-3 h-3 text-stone-500" />
                                    </a>
                                  )}

                                  {onSelectProduct && (
                                    <button
                                      type="button"
                                      onClick={() => onSelectProduct(prod)}
                                      className="flex-1 py-1.5 px-2 bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition shadow-xs"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Tanlash</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <span className={`text-[9px] block text-right mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-stone-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Yuklanish holati */}
            {isLoading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-xl bg-orange-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white/90 border border-brand-200 rounded-2xl p-3 text-xs text-stone-700 shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-600 animate-ping" />
                  <span className="font-semibold text-brand-900">{loadingStage || 'AI javob tayyorlamoqda...'}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Tezkor takliflar (Quick suggestions) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-[11px]">
            <span className="text-stone-400 font-medium shrink-0 flex items-center gap-1">
              <Search className="w-3 h-3" /> Namunalar:
            </span>
            <button
              type="button"
              onClick={() => handleSend("50 duymli Smart TV 400$ gacha")}
              className="px-2.5 py-1 bg-stone-100 hover:bg-orange-100 text-stone-700 hover:text-brand-800 rounded-lg whitespace-nowrap transition border border-stone-200"
            >
              📺 50 duym Smart TV 400$
            </button>
            <button
              type="button"
              onClick={() => handleSend("Muzlatkich No Frost 5 mln so'm")}
              className="px-2.5 py-1 bg-stone-100 hover:bg-orange-100 text-stone-700 hover:text-brand-800 rounded-lg whitespace-nowrap transition border border-stone-200"
            >
              ❄️ Sovutkich No Frost
            </button>
            <button
              type="button"
              onClick={() => handleSend("Artel 7kg kir yuvish mashinasi")}
              className="px-2.5 py-1 bg-stone-100 hover:bg-orange-100 text-stone-700 hover:text-brand-800 rounded-lg whitespace-nowrap transition border border-stone-200"
            >
              🧺 Artel 7kg kir yuvish
            </button>
            <button
              type="button"
              onClick={() => handleSend("Inverter konditsioner 35 m2")}
              className="px-2.5 py-1 bg-stone-100 hover:bg-orange-100 text-stone-700 hover:text-brand-800 rounded-lg whitespace-nowrap transition border border-stone-200"
            >
              ❄️ Inverter konditsioner
            </button>
          </div>

          {/* Xabar yozish maydoni (Input) */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Masalan: menga televizor kerak yoki 50 duymli Smart TV..."
              disabled={isLoading}
              className="flex-1 bg-white border border-stone-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 outline-none transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-orange-600 hover:brightness-110 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Yuborish</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
