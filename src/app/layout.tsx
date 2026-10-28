import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Store
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
      <body className="min-h-screen flex flex-col bg-[#fbfaf8] text-stone-900 antialiased selection:bg-brand-500 selection:text-white">
        
        {/* Asosiy Navbar - Faqat Logo va Sotuvchilar kabineti */}
        <header className="sticky top-0 z-50 bg-white/75 backdrop-blur-xl border-b border-orange-200/40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl gradient-copper-header flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-950 flex items-center gap-1">
                  TECH<span className="text-brand-600">BOZOR</span>
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-600 -mt-1">
                  Savdo Platformasi
                </span>
              </div>
            </Link>

            {/* O'ng tomon: Faqat Sotuvchilar kabineti (Shisha effekti bilan) */}
            <Link
              href="/seller/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-stone-800 bg-white/70 hover:bg-white border border-orange-200/70 hover:border-brand-400 rounded-2xl shadow-sm hover:shadow backdrop-blur-md transition active:scale-95"
            >
              <Store className="w-4 h-4 text-brand-600" />
              <span>Sotuvchilar kabineti</span>
            </Link>
          </div>
        </header>

        {/* Asosiy kontent */}
        <main className="flex-1 flex flex-col justify-start">
          {children}
        </main>

        {/* Ixcham footer */}
        <footer className="bg-white/80 backdrop-blur-md border-t border-stone-200/60 py-3.5 text-xs text-stone-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-semibold text-stone-700">© TECHBOZOR — O‘zbekiston maishiy texnika platformasi</span>
            <Link href="/seller/login" className="text-stone-500 hover:text-brand-600 font-semibold transition">
              Sotuvchi sifatida kirish
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
