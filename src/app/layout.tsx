import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Store, 
  ShieldCheck, 
  Sparkles, 
  PhoneCall, 
  Layers,
  ArrowRight
} from 'lucide-react';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'TechBozor — Maishiy texnikalar savdosi uchun AI platformasi',
  description: 'O‘zbekistonda maishiy texnikalarga bo‘lgan talabingizni qoldiring, AI tavsiyasini oling va eng arzon narxlarni to‘g‘ridan-to‘g‘ri sotuvchilardan SMS orqali qabul qiling.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-brand-500 selection:text-white">
        {/* Yuqori bildirishnoma paneli */}
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-950 text-white text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 border-b border-white/10">
          <span className="flex items-center gap-1 font-medium bg-emeraldTech-500/20 text-emeraldTech-300 px-2 py-0.5 rounded-full border border-emeraldTech-400/30">
            <Sparkles className="w-3 h-3 text-emeraldTech-400" /> AI v1.0
          </span>
          <span className="truncate">O‘zbekiston bo‘ylab eng yaxshi narxlar va tezkor SMS takliflar</span>
        </div>

        {/* Asosiy Navbar */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl gradient-header flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                  TECH<span className="text-brand-600">BOZOR</span>
                  <span className="w-2 h-2 rounded-full bg-emeraldTech-500 animate-pulse"></span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-600 -mt-1">
                  AI Maishiy Texnika
                </span>
              </div>
            </Link>

            {/* O'ng menyu (Desktop) */}
            <nav className="hidden md:flex items-center gap-3">
              <Link
                href="/"
                className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
              >
                Talab qoldirish
              </Link>
              <Link
                href="/seller/dashboard"
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
              >
                <Store className="w-4 h-4 text-brand-600" />
                Sotuvchilar kabineti
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 rounded-lg transition"
              >
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                Admin
              </Link>
              <Link
                href="/#create-request"
                className="ml-2 flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-emeraldTech-600 to-emeraldTech-500 hover:from-emeraldTech-500 hover:to-emeraldTech-600 rounded-xl shadow-md shadow-emeraldTech-600/20 transition hover:shadow-lg active:scale-95"
              >
                <span>Talab joylashtirish</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </nav>

            {/* Smartfon uchun yuqori tezkor tugmalar */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                href="/seller/login"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-lg active:scale-95"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Sotuvchi</span>
              </Link>
              <Link
                href="/#create-request"
                className="px-3 py-1.5 text-xs font-bold text-white bg-emeraldTech-600 rounded-lg active:scale-95 shadow-sm"
              >
                Talab qo‘yish
              </Link>
            </div>
          </div>
        </header>

        {/* Asosiy sahifa kontenti */}
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>

        {/* Mobil uchun pastki navigatsiya paneli (Bottom Navigation for Smartphones) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-lg">
          <Link href="/" className="flex flex-col items-center gap-0.5 text-brand-600">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[11px] font-bold">Bosh sahifa</span>
          </Link>
          <Link href="/#ai-search" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-brand-600">
            <Sparkles className="w-5 h-5 text-emeraldTech-600" />
            <span className="text-[11px] font-medium">AI Tavsiya</span>
          </Link>
          <Link href="/seller/dashboard" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-brand-600">
            <Store className="w-5 h-5" />
            <span className="text-[11px] font-medium">Sotuvchi</span>
          </Link>
          <Link href="/admin" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-brand-600">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[11px] font-medium">Admin</span>
          </Link>
        </div>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-header flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-white tracking-tight">
                    TECH<span className="text-brand-400">BOZOR</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Maishiy texnikalar savdosi uchun AI asosidagi talab va taklif platformasi. Xaridor va sotuvchilarni SMS orqali to‘g‘ridan-to‘g‘ri bog‘laymiz.
                </p>
                <div className="flex items-center gap-2 text-xs text-emeraldTech-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emeraldTech-400"></span>
                  O‘zbekiston bo‘ylab 14 ta hududda faol
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-3">Xaridorlar uchun</h4>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li><Link href="/" className="hover:text-white transition">Oddiy tilda qidirish</Link></li>
                  <li><Link href="/#ai-search" className="hover:text-white transition">AI bepul maslahatchi</Link></li>
                  <li><Link href="/#create-request" className="hover:text-white transition">Talab joylashtirish</Link></li>
                  <li><span className="text-slate-500">Ro‘yxatdan o‘tish shart emas</span></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-3">Sotuvchilar uchun</h4>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li><Link href="/seller/register" className="hover:text-white transition">Sotuvchi bo‘lib ro‘yxatdan o‘tish</Link></li>
                  <li><Link href="/seller/login" className="hover:text-white transition">Sotuvchi kabinetiga kirish</Link></li>
                  <li><Link href="/seller/dashboard" className="hover:text-white transition">Yangi xaridor talablari</Link></li>
                  <li><Link href="/seller/products" className="hover:text-white transition">Mahsulotlarni boshqarish</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-3">Qo‘llab-quvvatlash</h4>
                <p className="text-xs text-slate-400 mb-2">
                  Savollar yoki takliflar bormi? Biz bilan bog‘laning:
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-emeraldTech-400">
                  <PhoneCall className="w-4 h-4" />
                  +998 (71) 200-00-00
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  savdo.mcode.uz • Toshkent, O‘zbekiston
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <p>© {new Date().getFullYear()} TECHBOZOR. Barcha huquqlar himoyalangan.</p>
              <p className="flex items-center gap-1 text-slate-400">
                O‘zbekiston maishiy texnika bozori uchun maxsus ishlab chiqilgan
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
