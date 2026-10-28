import { CategoryKey, AIRecommendation } from '@/types';
import { incrementAiCount } from './storage';

export interface ExtractedRequestData {
  category: CategoryKey;
  categoryName: string;
  budget: number;
  extractedSpecs: Record<string, string>;
  qualityWishes: string[];
  rawText: string;
  marketCheckNote?: string;
  recommendations: AIRecommendation[];
}

// O'zbekiston bozoridagi haqiqiy maishiy texnikalar va joriy o'rtacha narxlari bazasi
interface MarketProduct {
  category: CategoryKey;
  brand: string;
  model: string;
  price: number;
  specs: string[];
  features: string[];
  strengths: string;
  diagonal?: number;
  imageUrl: string;
}

const MARKET_KNOWLEDGE: MarketProduct[] = [
  // TELEVIZORLAR
  {
    category: 'tv',
    brand: 'Artel',
    model: '32AH90G HD Smart Android',
    price: 1850000,
    specs: ['32" (81 sm)', 'HD Ready', 'Android TV', 'Ovozli qidiruv'],
    features: ['smart', '32', 'kichik', 'arzon'],
    strengths: 'O‘zbekistonda 3 yil to‘liq servis kafolati, oshxona yoki yotoqxona uchun qulay va eng arzon Smart TV.',
    diagonal: 32,
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
  },
  {
    category: 'tv',
    brand: 'Shivaki',
    model: '43US900 4K UHD Smart',
    price: 2900000,
    specs: ['43" (109 sm)', '4K UHD HDR', 'Google TV', 'Wi-Fi 5GHz, Bluetooth'],
    features: ['smart', '43', '4k'],
    strengths: '43 dyuym segmentida hamyonbop 4K aniqlik, yorqin ranglar va litsenziyalangan Google TV tizimi.',
    diagonal: 43,
    imageUrl: 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=600&auto=format&fit=crop&q=80',
  },
  {
    category: 'tv',
    brand: 'Artel',
    model: '55AU90G 4K Google TV',
    price: 4200000,
    specs: ['55" (140 sm)', '4K UHD HDR10', 'Ramkasiz dizayn', '3 yil kafolat'],
    features: ['smart', '55', 'katta', '4k'],
    strengths: '55 dyuymli katta ekran va 4.5 mln so‘mgacha bo‘lgan budjet uchun O‘zbekiston bozoridagi eng xaridorgir model.',
    diagonal: 55,
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
  },
  {
    category: 'tv',
    brand: 'Samsung',
    model: 'Crystal UHD UE55CU7100UXUZ',
    price: 4950000,
    specs: ['55" (140 sm)', 'Crystal 4K protsessor', 'HDR10+', 'Tizen OS', 'AirPlay 2'],
    features: ['samsung', 'smart', '55', 'sifatli', 'ishonchli', '4k'],
    strengths: 'Koreys brendi sifati, yuqori tabiiy kontrast, uzoq yillik ishonchlilik va barcha oqimli video ilovalarini qotmasdan ochishi.',
    diagonal: 55,
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
  },
  {
    category: 'tv',
    brand: 'Xiaomi',
    model: 'TV A Pro 65 4K UHD QLED',
    price: 6400000,
    specs: ['65" (165 sm)', 'QLED ranglar', 'Dolby Audio', 'Google TV', 'Metall ramka'],
    features: ['xiaomi', 'smart', '65', 'qled', 'katta'],
    strengths: 'Katta zal uchun 65 dyuymli QLED displey, zamonaviy metall dizayn va Google ekotizimi bilan mukammal integratsiya.',
    diagonal: 65,
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
  },
  {
    category: 'tv',
    brand: 'LG',
    model: '75UR78006LK 4K Smart UHD',
    price: 11500000,
    specs: ['75" (190 sm)', 'a5 Gen6 AI Processor 4K', 'webOS 23', 'Magic Remote'],
    features: ['lg', 'smart', '75', '85', '90', 'katta', 'premium'],
    strengths: 'Haqiqiy kinoteatr effekti, LG Magic pulti bilan qulay ko‘rsatgich boshqaruvi va sun’iy intellektli ovoz sozlamalari.',
    diagonal: 75,
    imageUrl: 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=600&auto=format&fit=crop&q=80',
  },

  // SOVUTKICHLAR
  {
    category: 'fridge',
    brand: 'Artel',
    model: 'HD 341 FN De-Frost',
    price: 3300000,
    specs: ['260 litr', 'A+ energiya sinfi', 'Ikki kamerali', 'Shovqinsiz'],
    features: ['artel', 'arzon', 'kichik'],
    strengths: 'O‘zbekiston elektr tebranishlariga chidamli, 3 yil kafolat, tejamkor va ixcham.',
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
  },
  {
    category: 'fridge',
    brand: 'LG',
    model: 'DoorCooling+ GC-B459SQCL No Frost',
    price: 6800000,
    specs: ['360 litr', 'Total No Frost', 'Smart Inverter kompressor (10 yil)', 'DoorCooling+ tez sovutish'],
    features: ['lg', 'nofrost', 'inverter', 'sifatli', 'katta'],
    strengths: 'Eshikdan sovutish texnologiyasi mahsulotlarni 32% tezroq va bir maromda yangi saqlaydi, shovqini juda past.',
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
  },
  {
    category: 'fridge',
    brand: 'Samsung',
    model: 'Side-by-Side RS52B3000M9 (525L)',
    price: 10800000,
    specs: ['525 litr', 'All-Around Cooling', 'Digital Inverter', 'Metall kumush korpus'],
    features: ['samsung', 'side by side', 'katta', 'premium', 'nofrost'],
    strengths: 'Katta oilalar uchun ulkan sig‘im, ikkala eshik orqali alohida muzlatkich va sovutkich qulayligi.',
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
  },

  // KIR YUVISH MASHINASI
  {
    category: 'washing',
    brand: 'Artel',
    model: 'Grand Inverter 70C121 (7kg)',
    price: 3600000,
    specs: ['7 kg sig‘im', '1200 ayl/daq', 'Inverter motor', '16 xil dastur', 'Bug‘da yuvish'],
    features: ['artel', '7kg', 'inverter', 'arzon'],
    strengths: 'O‘zbekistonda tayyorlangan, ehtiyot qismlari arzon va mavjud, bug‘ yordamida kiyimlarni dezinfeksiya qiladi.',
    imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80',
  },
  {
    category: 'washing',
    brand: 'LG',
    model: 'AI DD F2V5HS0W (7kg Inverter)',
    price: 5200000,
    specs: ['7 kg', 'AI DD (Mato turini o‘zi aniqlaydi)', 'Steam bug‘ texnologiyasi', 'TurboWash 59 min'],
    features: ['lg', 'inverter', 'aqlli', 'sifatli'],
    strengths: 'Sun’iy intellektli baraban matoning qalinligini sezib, kiyimlarni 18% kamroq eskiradi. O‘z segmentida 1-o‘rin.',
    imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80',
  },
  {
    category: 'washing',
    brand: 'Bosch',
    model: 'Serie 4 WAN28200ME (8kg Inverter)',
    price: 6900000,
    specs: ['8 kg sig‘im', '1400 ayl/daq', 'EcoSilence Drive', 'AntiVibration yon devorlar'],
    features: ['bosch', '8kg', 'nemets', 'sifatli', 'ogir'],
    strengths: 'Nemis muhandisligi, o‘ta uzoq muddat xizmat qilish kafolati va siqish vaqtida mutlaqo tebranmasligi.',
    imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80',
  },

  // KONDITSIONERLAR
  {
    category: 'ac',
    brand: 'Shivaki',
    model: 'Emura Inverter 12 (35 m²)',
    price: 4300000,
    specs: ['12000 BTU (35 m²)', 'Inverter A++', 'R32 ekologik freon', '-15°C gacha isitish'],
    features: ['shivaki', '12', 'inverter', 'qish'],
    strengths: 'Elektr energiyasini 40% tejaydi, shovqini atigi 22 dB, qish mavsumida ham samarali isitadi.',
    imageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80',
  },
  {
    category: 'ac',
    brand: 'Gree',
    model: 'Fairy Inverter 18 (50-60 m²)',
    price: 6600000,
    specs: ['18000 BTU (55 m²)', 'G10 Inverter', 'I-Feel sensor', '-20°C gacha isitish'],
    features: ['gree', '18', 'katta', 'kuchli'],
    strengths: 'Dunyo bo‘yicha konditsionerlar yetakchisi Gree zavodi kafolati, kuchli havo oqimi va sovuqda barqaror ishlashi.',
    imageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80',
  },

  // CHANGYUTKICH
  {
    category: 'vacuum',
    brand: 'Samsung',
    model: 'VC18M3120VB Siklon Konteynerli',
    price: 1150000,
    specs: ['1800 Vt motor quvvati', '380 Vt so‘rish quvvati', 'Anti-Tangle turbina (sochlar o‘ralmaydi)'],
    features: ['samsung', 'konteyner', 'arzon', 'kuchli'],
    strengths: 'Qop talab qilmaydi, idishi oson yuviladi, gilamdagi barcha chang va sochlarni chuqur tozalaydi.',
    imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80',
  },
  {
    category: 'vacuum',
    brand: 'Xiaomi',
    model: 'Robot Vacuum S10+ (Namlab tozalash)',
    price: 3200000,
    specs: ['4000 Pa so‘rish', 'LDS lazerli xarita', 'Aylanuvchi ikkita namlatkich latta', 'Mi Home ilovasi'],
    features: ['xiaomi', 'robot', 'aqlli'],
    strengths: 'Uyda yo‘qligingizda polni o‘zi changdan tozalab, yuvib qo‘yadi. Xaritalash o‘ta aniq.',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80',
  },

  // GAZ PLITA
  {
    category: 'stove',
    brand: 'Artel',
    model: 'Apetito 02-E (Gaz + Elektr duxovka)',
    price: 2800000,
    specs: ['4 ta gaz konforka', 'Elektr duxovka konveksiya bilan', 'Elektr o‘t oldirgich', 'Gaz-kontrol'],
    features: ['artel', 'gaz', 'plita'],
    strengths: 'O‘zbek taomlari va pishiriqlari uchun eng maqbul kombinatsiya: usti kuchli gaz, pechi tekis pishiruvchi elektr.',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
  },

  // MIKROTO‘LQINLI PECH
  {
    category: 'microwave',
    brand: 'Samsung',
    model: 'ME88SUG/BW 23L Biokeramika',
    price: 1350000,
    specs: ['23 litr hajm', '800 Vt quvvat', 'Biokeramika qoplama (10 yil kafolat)', 'Tez eritish'],
    features: ['samsung', 'pech', 'arzon'],
    strengths: 'Biokeramika ichki qoplamasi tirnalmaydi, yog‘ yuqmaydi va tozalash juda oson.',
    imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&auto=format&fit=crop&q=80',
  },
];

// Matndan kategoriya, budjet va talablarni aniqlash
export function parseUserPrompt(text: string): ExtractedRequestData {
  incrementAiCount();
  const lower = text.toLowerCase();

  // 1. Kategoriya aniqlash
  let detectedCategory: CategoryKey = 'tv';
  let categoryName = 'Televizor';

  if (lower.includes('sovutkich') || lower.includes('xolodilnik') || lower.includes('muzlatkich') || lower.includes('fridge')) {
    detectedCategory = 'fridge';
    categoryName = 'Sovutkich';
  } else if (lower.includes('kir yuvish') || lower.includes('kir mashina') || lower.includes('stiralka') || lower.includes('washing')) {
    detectedCategory = 'washing';
    categoryName = 'Kir yuvish mashinasi';
  } else if (lower.includes('konditsioner') || lower.includes('konditsaner') || lower.includes('konditsaner') || lower.includes('kondisaner') || lower.includes('split') || lower.includes('ac')) {
    detectedCategory = 'ac';
    categoryName = 'Konditsioner';
  } else if (lower.includes('changyutkich') || lower.includes('pilesos') || lower.includes('changyutgich') || lower.includes('vacuum') || lower.includes('robot')) {
    detectedCategory = 'vacuum';
    categoryName = 'Changyutkich';
  } else if (lower.includes('gaz plita') || lower.includes('gazplita') || lower.includes('plita') || lower.includes('duxovka') || lower.includes('pechka')) {
    detectedCategory = 'stove';
    categoryName = 'Gaz va elektr plita';
  } else if (lower.includes('mikroto‘lqinli') || lower.includes('mikrovolnovka') || lower.includes('mikrotolqinli')) {
    detectedCategory = 'microwave';
    categoryName = 'Mikroto‘lqinli pech';
  } else if (lower.includes('televizor') || lower.includes('tv') || lower.includes('ekran') || lower.includes('dyuym') || lower.includes('smart')) {
    detectedCategory = 'tv';
    categoryName = 'Televizor';
  }

  // 2. Budjet aniqlash (raqam + mln / million / ming / so'm)
  let budget = 0;
  const millionMatch = lower.match(/(\d+[\.,]?\d*)\s*(mln|million|milyon)/i);
  if (millionMatch) {
    const num = parseFloat(millionMatch[1].replace(',', '.'));
    budget = Math.round(num * 1000000);
  } else {
    const rawNumberMatch = lower.match(/(\d{1,3}(?:[ \.,]\d{3})+|\d{5,8})\s*(so['‘`]?m|som)?/i);
    if (rawNumberMatch) {
      const cleanNum = rawNumberMatch[1].replace(/[\s\.,]/g, '');
      budget = parseInt(cleanNum, 10);
    }
  }

  // Default fallback budget if not specified
  if (!budget || isNaN(budget) || budget <= 0) {
    if (detectedCategory === 'tv') budget = 4500000;
    else if (detectedCategory === 'fridge') budget = 6000000;
    else if (detectedCategory === 'washing') budget = 4500000;
    else if (detectedCategory === 'ac') budget = 5000000;
    else if (detectedCategory === 'vacuum') budget = 1800000;
    else if (detectedCategory === 'stove') budget = 3000000;
    else if (detectedCategory === 'microwave') budget = 1400000;
  }

  // 3. Spetsifikatsiyalarni aniqlash
  const extractedSpecs: Record<string, string> = {};
  const qualityWishes: string[] = [];

  // Diagonal tekshirish
  const diagonalMatch = lower.match(/(\d{2,3})\s*(dyuym|duym|inch|talik|lik)/);
  if (diagonalMatch) {
    extractedSpecs['diagonal'] = `${diagonalMatch[1]}"`;
  }

  // Smart TV
  if (lower.includes('smart') || lower.includes('android') || lower.includes('google tv') || lower.includes('tizen')) {
    extractedSpecs['smartTv'] = 'Mavjud (Android/Google TV/Tizen)';
  }

  // Sifat talablari
  if (lower.includes('sifat') || lower.includes('tasvir')) {
    qualityWishes.push('Yuqori tasvir sifati va tiniq ranglar');
  }
  if (lower.includes('uzoq') || lower.includes('ishonch') || lower.includes('mustahkam')) {
    qualityWishes.push('Uzoq muddat xizmat qiladigan ishonchli mexanizm');
  }
  if (lower.includes('tejamkor') || lower.includes('inverter') || lower.includes('kam tok')) {
    qualityWishes.push('Elektr energiyasini tejovchi Inverter tizimi');
  }
  if (lower.includes('ovoz') || lower.includes('kuchli ovoz')) {
    qualityWishes.push('Kuchli va tiniq akustik ovoz');
  }

  // 4. Bozor tahlili va real narxlar mosligi (Misol: 5 mln so'mga 90 dyuym)
  let marketCheckNote: string | undefined = undefined;
  const requestedDiagonal = diagonalMatch ? parseInt(diagonalMatch[1], 10) : undefined;

  if (detectedCategory === 'tv' && requestedDiagonal && requestedDiagonal >= 75) {
    if (budget < 8000000) {
      marketCheckNote = `Diqqat: O‘zbekiston bozorida ${requestedDiagonal} dyuymli televizorlar narxi 8 000 000 so‘mdan boshlanadi. Ajratilgan ${(budget / 1000000).toLocaleString('uz-UZ')} mln so‘m budjet uchun 50-55 dyuymli sifatli 4K Smart TV eng maqbul muqobildir.`;
    }
  }

  // 5. Tavsiyalar generatsiyasi (real mahsulotlar asosida)
  const categoryProducts = MARKET_KNOWLEDGE.filter(p => p.category === detectedCategory);
  
  // Sort by closest to budget or best fit
  const sorted = [...categoryProducts].sort((a, b) => {
    const diffA = Math.abs(a.price - budget);
    const diffB = Math.abs(b.price - budget);
    return diffA - diffB;
  });

  const recommendations: AIRecommendation[] = sorted.slice(0, 3).map(prod => {
    const budgetRatio = Math.round((1 - Math.abs(prod.price - budget) / Math.max(prod.price, budget)) * 100);
    const matchPercent = Math.max(65, Math.min(99, budgetRatio));

    return {
      brand: prod.brand,
      model: prod.model,
      category: categoryName,
      estimatedPrice: prod.price,
      specs: prod.specs,
      reason: prod.strengths,
      budgetMatchPercent: matchPercent,
      isEstimated: false, // tasdiqlangan o'rtacha bozor narxi
      alternativeModels: categoryProducts.filter(p => p.model !== prod.model).map(p => p.model).slice(0, 2),
      imageUrl: prod.imageUrl,
    };
  });

  return {
    category: detectedCategory,
    categoryName,
    budget,
    extractedSpecs,
    qualityWishes,
    rawText: text,
    marketCheckNote,
    recommendations,
  };
}
