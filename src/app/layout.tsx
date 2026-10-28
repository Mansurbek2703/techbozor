import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Store, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Send
} from 'lucide-react';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'TechBozor — Maishiy texnikalar savdo platformasi',
  description: 'Kerakli maishiy texnikani yozing va sotuvchilardan to‘g‘ridan-to‘g‘ri eng arzon narxlarni oling.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className="min-h-screen flex flex-col bg-[#fafaf9] text-stone-900 antialiased selection:bg-brand-500 selection:text-white">
        
        {/* Asosiy Navbar */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-orange-100/80 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl gradient-copper-header flex items-center justify-center shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-stone-950 flex items-center gap-1">
                  TECH<span className="text-brand-600">BOZOR</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"></span>
                </span>
                <span className="text-[11px] uppercase tracking-wider font-bold text-stone-400 -mt-1">
                  Savdo Platformasi
                </span>
              </div>
            </Link>

            {/* Desktop Navigatsiya */}
            <nav className="hidden md:flex items-center gap-3">
              <Link
                href="/seller/dashboard"
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-stone-700 hover:text-brand-600 hover:bg-orange-50 rounded-xl transition"
              >
                <Store className="w-4 h-4 text-brand-600" />
                <span>Sotuvchilar kabineti</span>
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-semibold text-stone-500 hover:text-stone-900 rounded-xl transition"
              >
                <ShieldCheck className="w-4 h-4 text-stone-400" />
                <span>Admin</span>
              </Link>
              <Link
                href="/#request-form"
                className="ml-2 flex items-center gap-2 px-5 py-2.5 text-sm font-extrabold text-white gradient-copper-header hover:brightness-105 rounded-xl shadow-md shadow-brand-500/25 active:scale-95 transition"
              >
                <Send className="w-4 h-4" />
                <span>Talab qoldirish</span>
              </Link>
            </nav>

            {/* Smartfon uchun yuqori tezkor tugmalar */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                href="/seller/login"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-brand-700 bg-orange-50 border border-orange-200 rounded-xl active:scale-95"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Sotuvchi</span>
              </Link>
              <Link
                href="/#request-form"
                className="px-3.5 py-1.5 text-xs font-black text-white gradient-copper-header rounded-xl active:scale-95 shadow-sm"
              >
                Talab qo‘yish
              </Link>
            </div>
          </div>
        </header>

        {/* Asosiy kontent */}
        <main className="flex-1 pb-16 md:pb-8">
          {children}
        </main>

        {/* Mobil Bottom Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-orange-100 px-4 py-2 flex items-center justify-around shadow-lg">
          <Link href="/" className="flex flex-col items-center gap-0.5 text-brand-600">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[11px] font-bold">Asosiy</span>
          </Link>
          <Link href="/seller/dashboard" className="flex flex-col items-center gap-0.5 text-stone-500 hover:text-brand-600">
            <Store className="w-5 h-5" />
            <span className="text-[11px] font-medium">Sotuvchi</span>
          </Link>
          <Link href="/admin" className="flex flex-col items-center gap-0.5 text-stone-500 hover:text-brand-600">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[11px] font-medium">Admin</span>
          </Link>
        </div>

        {/* Oddiy toza footer */}
        <footer className="bg-stone-900 text-stone-400 py-6 border-t border-stone-800 text-xs">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">TECHBOZOR</span>
              <span>— O‘zbekistonda maishiy texnikalar savdo platformasi</span>
            </div>
            <div className="flex items-center gap-4 text-stone-400">
              <Link href="/seller/login" className="hover:text-white transition">Sotuvchi kabineti</Link>
              <Link href="/admin" className="hover:text-white transition">Administrator</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
