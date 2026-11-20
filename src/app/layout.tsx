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
  title: 'Iqtisodchi — O‘zbekiston onlayn do‘konlaridagi narxlar va xarid dasturi',
  description: 'Iqtisodchi intellektual dasturi — Uzum, Texnomart, Olcha, Idea, Alifshop, BeeMarket do‘konlaridagi real narxlar, sifat va kafolatlarni taqqoslash.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </head>
      <body className="min-h-screen flex flex-col bg-[#F7F8FC] text-[#0F172A] antialiased selection:bg-[#6366F1] selection:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
