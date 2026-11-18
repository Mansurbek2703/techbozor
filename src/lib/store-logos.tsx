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
  'alif': {
    name: 'Alif Shop',
    shortName: 'Alif',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    accentColor: '#00C292',
    tagline: 'Halol muddatli to‘lov (Alif Nasiya)',
    logoSvg: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 4.5l-7-3.5V17l7 3.5 7-3.5v-5l-7 3.5z" />
      </svg>
    ),
  },
  'artel': {
    name: 'Artel Electronics',
    shortName: 'Artel',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-200',
    accentColor: '#E31E24',
    tagline: 'O‘zbekiston milliy ishlab chiqaruvchisi',
    logoSvg: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  'ishonch': {
    name: 'Ishonch',
    shortName: 'Ishonch',
    bgClass: 'bg-sky-50',
    textClass: 'text-sky-700',
    borderClass: 'border-sky-200',
    accentColor: '#0072CE',
    tagline: 'Barcha viloyatlarda filiallar mavjud',
    logoSvg: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
  'creditasia': {
    name: 'Credit Asia',
    shortName: 'CreditAsia',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
    accentColor: '#E4002B',
    tagline: 'Rasmiy kafolat va tezkor yetkazish',
    logoSvg: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" stroke="#fff" strokeWidth="1.5" />
      </svg>
    ),
  },
  'macbro': {
    name: 'MacBro',
    shortName: 'MacBro',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-800',
    borderClass: 'border-slate-300',
    accentColor: '#1D1D1F',
    tagline: 'Original Apple mahsulotlari',
    logoSvg: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.62 1.34-.56.64-1.05 1.7-0.92 2.73 1 .08 2-.47 2.62-1.22z" />
      </svg>
    ),
  },
  'radius': {
    name: 'Radius Mobile',
    shortName: 'Radius',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-300',
    accentColor: '#FF9900',
    tagline: 'Gadjetlar va aksessuarlar',
    logoSvg: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" fill="#fff" />
      </svg>
    ),
  },
  'beemarket': {
    name: 'BeeMarket',
    shortName: 'BeeMarket',
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-800',
    borderClass: 'border-yellow-300',
    accentColor: '#FFCC00',
    tagline: 'Beeline rasmiy marketi',
    logoSvg: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <path d="M6 12h12M12 6v12" stroke="#000" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  'openshop': {
    name: 'OpenShop',
    shortName: 'OpenShop',
    bgClass: 'bg-indigo-50',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-200',
    accentColor: '#3F51B5',
    tagline: 'Onlayn do‘kon',
    logoSvg: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-6h2v6zm0-8h-2V7h2v2z" />
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
