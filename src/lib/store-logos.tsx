import React from 'react';

export interface StoreBrandConfig {
  name: string;
  shortName: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  accentColor: string;
  tagline: string;
  logoSvg: React.ReactNode;
}

/**
 * 🇺🇿 O'zbekistonning rasmiy do'konlari brend identifikatori va SVG logolari (v6.0)
 */
export const STORE_BRANDS: Record<string, StoreBrandConfig> = {
  'uzum': {
    name: 'Uzum Market',
    shortName: 'Uzum',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-200',
    accentColor: '#7000FF',
    tagline: '1 kunda bepul yetkazish',
    logoSvg: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
      </svg>
    ),
  },
  'asaxiy': {
    name: 'Asaxiy',
    shortName: 'Asaxiy',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    accentColor: '#0066FF',
    tagline: 'Internet-do‘kon va yetkazib berish',
    logoSvg: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
      </svg>
    ),
  },
  'olcha': {
    name: 'Olcha.uz',
    shortName: 'Olcha',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
    accentColor: '#DA002B',
    tagline: 'Muddatli to‘lov va rasmiy kafolat',
    logoSvg: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="15" r="4" />
        <circle cx="16" cy="14" r="3.5" />
        <path d="M11 11c1-4 4-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  'texnomart': {
    name: 'Texnomart',
    shortName: 'Texnomart',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    accentColor: '#FF6700',
    tagline: 'Maishiy texnika va smartfonlar',
    logoSvg: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  'mediapark': {
    name: 'Mediapark',
    shortName: 'Mediapark',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-200',
    accentColor: '#E30613',
    tagline: 'Elektronika va maishiy texnika',
    logoSvg: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
      </svg>
    ),
  },
  'idea': {
    name: 'Idea.uz',
    shortName: 'Idea',
    bgClass: 'bg-cyan-50',
    textClass: 'text-cyan-700',
    borderClass: 'border-cyan-200',
    accentColor: '#00A0E3',
    tagline: 'Qulay muddatli to‘lov',
    logoSvg: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
      </svg>
    ),
  },
  'zoodmall': {
    name: 'ZoodMall',
    shortName: 'ZoodMall',
    bgClass: 'bg-fuchsia-50',
    textClass: 'text-fuchsia-700',
    borderClass: 'border-fuchsia-200',
    accentColor: '#9C27B0',
    tagline: 'Bo‘lib to‘lash marketpleysi',
    logoSvg: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-5 14H9v-2h6v2zm3-4H6v-2h12v2zm0-4H6V8h12v2z" />
      </svg>
    ),
  },
  'elmakon': {
    name: 'Elmakon',
    shortName: 'Elmakon',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-200',
    accentColor: '#FF7A00',
    tagline: 'Elektronika tarmog‘i',
    logoSvg: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
};

/**
 * Do'kon nomidan brend ma'lumotini topish
 */
export function getStoreBrandConfig(storeName?: string): StoreBrandConfig {
  if (!storeName) {
    return {
      name: 'Uzum Market',
      shortName: 'Uzum',
      bgClass: 'bg-purple-50',
      textClass: 'text-purple-700',
      borderClass: 'border-purple-200',
      accentColor: '#7000FF',
      tagline: 'O‘zbekiston marketpleysi',
      logoSvg: STORE_BRANDS['uzum'].logoSvg,
    };
  }

  const lower = storeName.toLowerCase();
  for (const [key, cfg] of Object.entries(STORE_BRANDS)) {
    if (lower.includes(key)) {
      return cfg;
    }
  }

  // Fallback rasmiy do'kon
  return {
    name: storeName.replace(/^www\./, '').replace(/\.uz|\.com/, ''),
    shortName: storeName.split(/[\s./]/)[0] || 'Do‘kon',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-800',
    borderClass: 'border-slate-200',
    accentColor: '#FF6B00',
    tagline: 'O‘zbekiston rasmiy do‘koni',
    logoSvg: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
      </svg>
    ),
  };
}

/**
 * Agar rasm topilmasa yoki xatolik bersa chiqadigan do'kon logo fallback kartasi (Directive v6.0 / v7.0)
 */
export function StoreLogoFallback({ storeName, category }: { storeName?: string; category?: string }) {
  const brand = getStoreBrandConfig(storeName);
  const isDish = category && /chashka|idish|serviz|choy|keramik|chinni|likopcha|tovoq|lagan/i.test(category);

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center p-3 text-center rounded-xl ${brand.bgClass} border ${brand.borderClass} select-none`}>
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm mb-1.5 transition-transform group-hover:scale-110"
        style={{ backgroundColor: brand.accentColor }}
      >
        {isDish ? (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="14" rx="8" ry="4" />
            <ellipse cx="12" cy="12" rx="10" ry="5" />
            <path d="M7 12c0 2 2.2 4 5 4s5-2 5-4" />
          </svg>
        ) : (
          brand.logoSvg
        )}
      </div>
      <span className={`text-[11px] font-black tracking-tight ${brand.textClass}`}>
        {brand.name}
      </span>
      <span className="text-[9px] text-slate-500 font-medium line-clamp-1 mt-0.5">
        {brand.tagline}
      </span>
    </div>
  );
}

/**
 * 🎨 Kategoriya bo'yicha neytral vektor SVG belgisi (Likopcha yoki Choynak ikonasi - V7.0)
 */
export function CategoryVectorPlaceholder({ 
  category, 
  title, 
  storeName 
}: { 
  category?: string; 
  title?: string; 
  storeName?: string;
}) {
  const brand = getStoreBrandConfig(storeName);
  const text = `${category || ''} ${title || ''}`.toLowerCase();
  const isDish = /chinni|likopcha|tovoq|tarelka|chashka|idish|serviz|farfor|keramik/i.test(text);
  const isKettle = /choynak|kettle|термопот/i.test(text) && !isDish;

  if (isDish) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-amber-50/70 rounded-xl border border-amber-200 select-none">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-amber-500 flex items-center justify-center text-white shadow-sm mb-1.5">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="14" rx="8" ry="4" />
            <ellipse cx="12" cy="12" rx="10" ry="5" />
            <path d="M7 12c0 2 2.2 4 5 4s5-2 5-4" />
          </svg>
        </div>
        <span className="text-[11px] font-black tracking-tight text-[#0F172A]">
          {brand.name}
        </span>
        <span className="text-[10px] text-[#FF6B00] font-bold line-clamp-1 mt-0.5">
          Sifatli Chinni Likopcha
        </span>
      </div>
    );
  }

  if (isKettle) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-orange-50/70 rounded-xl border border-orange-200 select-none">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-orange-600 flex items-center justify-center text-white shadow-sm mb-1.5">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            <line x1="6" y1="2" x2="6" y2="4" />
            <line x1="10" y1="2" x2="10" y2="4" />
            <line x1="14" y1="2" x2="14" y2="4" />
          </svg>
        </div>
        <span className="text-[11px] font-black tracking-tight text-[#0F172A]">
          {brand.name}
        </span>
        <span className="text-[10px] text-[#FF6B00] font-bold line-clamp-1 mt-0.5">
          Elektr Choynak
        </span>
      </div>
    );
  }

  return <StoreLogoFallback storeName={storeName} category={category} />;
}
