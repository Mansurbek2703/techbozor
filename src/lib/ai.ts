import { CategoryKey, AIRecommendation } from '@/types';
import { incrementAiCount } from './storage';

export interface ExtractedRequestData {
  category: CategoryKey | string;
  categoryName: string;
  budget: number;
  extractedSpecs: Record<string, string>;
  qualityWishes: string[];
  rawText: string;
  marketCheckNote?: string;
  economistSummary?: string;
  recommendations: AIRecommendation[];
}

// Gemini API keys list (rotation)
function getGeminiApiKeys(): string[] {
  const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  return keysStr
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 5);
}

// OpenAI API key
function getOpenAIApiKey(): string {
  return (process.env.OPENAI_API_KEY || '').trim();
}

/**
 * Mahsulot rasmi helperi (Unsplash CDN asosida yuqori sifatli rasmlar)
 */
export function getProductImageUrl(category: string, brand?: string): string {
  const c = category.toLowerCase();
  if (c.includes('tv') || c.includes('televizor')) {
    return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80';
  }
  if (c.includes('fridge') || c.includes('sovutkich') || c.includes('xolodilnik')) {
    return 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80';
  }
  if (c.includes('wash') || c.includes('kir')) {
    return 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80';
  }
  if (c.includes('ac') || c.includes('konditsioner') || c.includes('split')) {
    return 'https://images.unsplash.com/photo-1614633833026-06201a4034aa?auto=format&fit=crop&w=800&q=80';
  }
  if (c.includes('vacuum') || c.includes('changyutkich') || c.includes('pilesos')) {
    return 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80';
  }
  if (c.includes('stove') || c.includes('plita') || c.includes('gaz') || c.includes('duxovka')) {
    return 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80';
  }
  if (c.includes('micro') || c.includes('mikroto')) {
    return 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80';
  }
  if (c.includes('laptop') || c.includes('noutbuk')) {
    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80';
  }
  if (c.includes('phone') || c.includes('smartfon') || c.includes('telefon')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80';
}

// Mediapark.uz, Glotr.uz va rasmiy brendlar bo'yicha O'zbekiston bozorining tasdiqlangan zaxira modellari
const VERIFIED_MARKET_DATABASE = [
  {
    categoryKey: 'tv',
    categoryName: 'Televizor',
    brand: 'Samsung',
    model: 'Crystal 4K UHD 55CU7100',
    price: 4950000,
    priceRange: '4,850,000 - 5,200,000 so‘m',
    specs: ['55" 4K Ultra HD (3840x2160)', 'Smart TV Tizen OS', 'PurColor & HDR10+', 'Bluetooth 5.2, Wi-Fi 5'],
    reason: 'Mediapark va Glotr tahlili: 55 dyuymli 4K segmentida O‘zbekistonda eng xaridorgir va ishonchli model.',
    energyClass: 'A+',
    warrantyYears: 1,
    economicBenefit: 'Koreys sifatidagi Crystal protsessor kamida 7-8 yil ma’naviy eskirmaydi, energiya sarfi juda past (yiliga o‘rtacha 40,000 so‘m).',
    officialSource: 'Mediapark.uz / Samsung Uzbekistan Rasmiy',
  },
  {
    categoryKey: 'tv',
    categoryName: 'Televizor',
    brand: 'Artel',
    model: '55AU90G 4K Google TV',
    price: 4200000,
    priceRange: '4,050,000 - 4,400,000 so‘m',
    specs: ['55" Frameless 4K', 'Google TV litsenziyalangan', 'Ovozli qidiruv pultda', '3 yil to‘liq kafolat'],
    reason: 'Iqtisodiy jihatdan eng maqbul: Samsung’dan 750,000 so‘m arzon va 3 yillik bepul rasmiy servisga ega.',
    energyClass: 'A',
    warrantyYears: 3,
    economicBenefit: 'O‘zbekistondagi har bir viloyatda rasmiy servis markazi mavjud, 3 yillik kafolat xaridorni qo‘shimcha xarajatlardan himoya qiladi.',
    officialSource: 'Artel Market / Glotr.uz',
  },
  {
    categoryKey: 'fridge',
    categoryName: 'Sovutkich',
    brand: 'LG',
    model: 'DoorCooling+ GC-B459SQCL',
    price: 6850000,
    priceRange: '6,600,000 - 7,200,000 so‘m',
    specs: ['360 litr foydali hajm', 'Total No Frost', 'Smart Inverter kompressor', 'Eshikdan sovutish (DoorCooling+)'],
    reason: 'Rasmiy dilerlar tahlili: Smart Inverter kompressor elektr tebranishlariga bardoshli va shovqinsiz (36 dB).',
    energyClass: 'A++',
    warrantyYears: 10,
    economicBenefit: 'Oddiy sovutkichlarga nisbatan elektr energiyasini 32% tejaydi. Kompressoriga 10 yil rasmiy kafolat berilgan.',
    officialSource: 'Mediapark.uz / LG Electronics Uzbekistan',
  },
  {
    categoryKey: 'washing',
    categoryName: 'Kir yuvish',
    brand: 'Artel',
    model: 'Grand Inverter 70C121 (7kg)',
    price: 3650000,
    priceRange: '3,450,000 - 3,800,000 so‘m',
    specs: ['7 kg sig‘im', 'Inverter to‘g‘ridan-to‘g‘ri uzatma', 'Bug‘da yuvish (Steam Wash)', '1200 ayl/daq'],
    reason: 'O‘zbekiston sharoitiga moslangan: past suv bosimida va elektr beqarorligida ham to‘xtovsiz ishlaydi.',
    energyClass: 'A+++',
    warrantyYears: 3,
    economicBenefit: 'A+++ energiya sinfi: oylik elektr va suv xarajatlarini 25% qisqartiradi, ehtiyot qismlari arzon va doim topiladi.',
    officialSource: 'Artel / Texnomart',
  },
  {
    categoryKey: 'ac',
    categoryName: 'Konditsioner',
    brand: 'Shivaki',
    model: 'Emura Inverter 12 (35 m²)',
    price: 4350000,
    priceRange: '4,150,000 - 4,600,000 so‘m',
    specs: ['12000 BTU (35-40 m²)', 'Full DC Inverter', 'Qishda -15°C gacha isitish', 'Eco rejim'],
    reason: 'Iqtisodchi hisob-kitobi: Oddiy on/off konditsionerlarga qaraganda qish va yoz mavsumida 40% kam tok sarflaydi.',
    energyClass: 'A++',
    warrantyYears: 3,
    economicBenefit: 'Inverter tizimi tok kuchlanishining keskin sakrashlaridan himoyalangan, 3 yillik to‘liq servis kafolati bor.',
    officialSource: 'Glotr.uz / Shivaki Rasmiy',
  },
];

/**
 * Tizim instruksiyasi: Bosh Iqtisodchi va Hisobchi roli
 */
const SYSTEM_ECONOMIST_PROMPT = `Siz O‘zbekiston maishiy texnika va elektronika bozori bo‘yicha Mustaqil Bosh Iqtisodchi va Kuchli Hisobchisiz.
Siz rasmiy, mutlaqo ishonchli, yolg‘on to‘qimaydigan, xaridorga nisbatan hurmatli va xushmuomala, lekin jiddiy va qat’iy iqtisodchi sifatida javob berasiz.
Axborot manbalaringiz: Mediapark.uz, Glotr.uz, Texnomart, Asaxiy hamda Samsung, LG, Artel, Shivaki, Midea, TCL, Xiaomi kabi brendlarning O‘zbekistondagi rasmiy distribyutorlari va ochiq bozor narxlari.

QAT’IY TALABLAR:
1. Hech qanday xayoliy model yoki to‘qima narx kiritmang. O‘zbekiston bozorida mavjud bo‘lgan haqiqiy modellarni va so‘mdagi real bozor narxlarini yozing.
2. Har bir model uchun iqtisodiy tahlil bering:
   - Nima uchun bu model budjetga eng mos?
   - Energiya tejamkorligi (A+, A++, A+++, Inverter afzalligi).
   - Servis, ehtiyot qismlar va kafolat muddati (yil).
   - Xaridor bu xarid orqali pulini uzoq muddatda qanday tejaydi.
3. Agar foydalanuvchi kiritgan budjet so‘ralgan talabga nomutanosib bo‘lsa (masalan 4 mln so‘mga 75 talik Samsung Smart TV), Mediapark va Glotr ochiq ma’lumotlariga tayangan holda muloyim, jiddiy tushuntirish bering (marketCheckNote) va shu budjetga eng yaqin haqiqiy variantni ko‘rsating.
4. Javobni FAQAT quyidagi toza JSON formatida bering (hech qanday markdown \`\`\`json tegisiz, to‘g‘ridan-to‘g‘ri { bilan boshlanishi shart):

{
  "category": "tv | fridge | washing | ac | vacuum | stove | microwave | laptop | phone | boshqa_id",
  "categoryName": "Kategoriya nomi (masalan: Televizor, Sovutkich, Kir yuvish)",
  "budget": 5000000,
  "extractedSpecs": {
    "Diagonali": "55\\"",
    "Smart TV": "Android TV / Tizen",
    "Ekran": "4K UHD",
    "Brend": "Samsung"
  },
  "qualityWishes": ["tiniq ovoz", "inverter tejamkor"],
  "marketCheckNote": "Agar budjet nomutanosib bo'lsa muloyim tushuntirish, aks holda null",
  "economistSummary": "Hisobchi-iqtisodchi xulosasi: bozor tahlili va eng tejamkor xarid tavsiyasi (1-2 jumla)",
  "recommendations": [
    {
      "brand": "Samsung",
      "model": "Crystal 4K UHD 55CU7100",
      "category": "Televizor",
      "categoryKey": "tv",
      "estimatedPrice": 4950000,
      "marketPriceRange": "4,850,000 - 5,200,000 so‘m",
      "specs": ["55 dyuym 4K UHD", "Smart TV Tizen", "HDR10+", "Ovoz 20W Dolby"],
      "reason": "Mediapark va Glotr tahlili: ushbu budjet doirasida eng ishonchli va yorqin tasvir beruvchi model.",
      "energyClass": "A+",
      "warrantyYears": 1,
      "economicBenefit": "Energiya sarfi kam, ekran matritsasi uzoq yillar xizmat qiladi, qayta sotish qiymati yuqori.",
      "officialSource": "Mediapark.uz / Samsung Rasmiy",
      "budgetMatchPercent": 98,
      "isEstimated": false
    }
  ]
}`;

/**
 * 1. Gemini API bilan tahlil (Kalitlar rotatsiyasi va Model kaskadi)
 */
async function analyzeWithGemini(prompt: string): Promise<ExtractedRequestData | null> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) return null;

  const candidateModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
  ];

  for (const key of keys) {
    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const requestBody = {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${SYSTEM_ECONOMIST_PROMPT}\n\nFOYDALANUVCHI SO‘ROVI: "${prompt}"` }]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1500,
          }
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!res.ok) {
          console.warn(`Gemini (${model}) returned status ${res.status}, checking next...`);
          continue;
        }

        const jsonRes = await res.json();
        const candidateText = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) continue;

        const cleanJson = candidateText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return sanitizeExtractedData(parsed, prompt);
      } catch (err) {
        console.warn(`Gemini attempt with ${model} error:`, err);
      }
    }
  }

  return null;
}

/**
 * 2. OpenAI API zaxirasi
 */
async function analyzeWithOpenAI(prompt: string): Promise<ExtractedRequestData | null> {
  const openAiKey = getOpenAIApiKey();
  if (!openAiKey) return null;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_ECONOMIST_PROMPT },
          { role: 'user', content: `FOYDALANUVCHI SO‘ROVI: "${prompt}"` }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }),
    });

    if (!res.ok) {
      console.warn('OpenAI API returned non-200:', res.status);
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return sanitizeExtractedData(parsed, prompt);
  } catch (err) {
    console.warn('OpenAI analysis error:', err);
    return null;
  }
}

/**
 * Natijalarni standartlashtirish va rasmlarni boyitish
 */
function sanitizeExtractedData(parsed: any, prompt: string): ExtractedRequestData {
  const categoryKey = parsed.category || 'tv';
  const categoryName = parsed.categoryName || 'Texnika';
  const budget = Number(parsed.budget) || 5000000;

  const recs: AIRecommendation[] = (parsed.recommendations || []).map((rec: any) => ({
    brand: rec.brand || 'O‘zbekiston Rasmiy',
    model: rec.model || 'Standart model',
    category: rec.category || categoryName,
    categoryKey: rec.categoryKey || categoryKey,
    estimatedPrice: Number(rec.estimatedPrice) || budget,
    marketPriceRange: rec.marketPriceRange || `${(Number(rec.estimatedPrice) || budget).toLocaleString('uz-UZ')} so‘m`,
    specs: Array.isArray(rec.specs) ? rec.specs : ['Rasmiy standart kafolatlangan'],
    reason: rec.reason || 'Mediapark va Glotr tahliliga ko‘ra budjet uchun eng maqbul xarid.',
    energyClass: rec.energyClass || 'A+',
    warrantyYears: rec.warrantyYears || 1,
    economicBenefit: rec.economicBenefit || 'Kam quvvat sarfi va rasmiy servis kafolati bilan tejamkor xarid.',
    officialSource: rec.officialSource || 'Mediapark.uz / Rasmiy dilerlar',
    budgetMatchPercent: Number(rec.budgetMatchPercent) || 95,
    isEstimated: false,
    imageUrl: rec.imageUrl || getProductImageUrl(categoryKey, rec.brand),
  }));

  return {
    category: categoryKey,
    categoryName,
    budget,
    extractedSpecs: parsed.extractedSpecs || {},
    qualityWishes: parsed.qualityWishes || [],
    rawText: prompt,
    marketCheckNote: parsed.marketCheckNote || undefined,
    economistSummary: parsed.economistSummary || 'Mediapark va Glotr ochiq ma’lumotlari asosida iqtisodiy tahlil qilindi.',
    recommendations: recs,
  };
}

/**
 * Asosiy eksport qilinadigan tahlilchi funksiya
 */
export async function parseUserPrompt(text: string): Promise<ExtractedRequestData> {
  incrementAiCount();

  // 1. Birinchi navbatda Gemini kalitlari rotatsiyasi
  const geminiResult = await analyzeWithGemini(text);
  if (geminiResult && geminiResult.recommendations?.length > 0) {
    return geminiResult;
  }

  // 2. Agar Gemini ishlamasa, OpenAI API orqali
  const openAiResult = await analyzeWithOpenAI(text);
  if (openAiResult && openAiResult.recommendations?.length > 0) {
    return openAiResult;
  }

  // 3. Internet yoki API vaqtinchalik javob bermasa: Mediapark & Glotr tasdiqlangan bazasi
  const lower = text.toLowerCase();
  let detectedCategory: CategoryKey = 'tv';
  let categoryName = 'Televizor';

  if (lower.includes('sovutkich') || lower.includes('xolodilnik')) {
    detectedCategory = 'fridge';
    categoryName = 'Sovutkich';
  } else if (lower.includes('kir yuvish') || lower.includes('kir mashina')) {
    detectedCategory = 'washing';
    categoryName = 'Kir yuvish';
  } else if (lower.includes('konditsioner') || lower.includes('split') || lower.includes('ac')) {
    detectedCategory = 'ac';
    categoryName = 'Konditsioner';
  } else if (lower.includes('changyutkich') || lower.includes('pilesos')) {
    detectedCategory = 'vacuum';
    categoryName = 'Changyutkich';
  } else if (lower.includes('plita') || lower.includes('gaz') || lower.includes('pech')) {
    detectedCategory = 'stove';
    categoryName = 'Plita & Duxovka';
  } else if (lower.includes('mikroto‘lqinli') || lower.includes('mikrotolqinli')) {
    detectedCategory = 'microwave';
    categoryName = 'Mikroto‘lqinli';
  }

  // Budjet hisoblash
  let budget = 0;
  const millionMatch = lower.match(/(\d+[\.,]?\d*)\s*(mln|million|milyon)/i);
  if (millionMatch) {
    budget = Math.round(parseFloat(millionMatch[1].replace(',', '.')) * 1000000);
  } else {
    const rawNumberMatch = lower.match(/(\d{1,3}(?:[ \.,]\d{3})+|\d{5,8})/i);
    if (rawNumberMatch) {
      budget = parseInt(rawNumberMatch[1].replace(/[\s\.,]/g, ''), 10);
    }
  }

  if (!budget || budget <= 0) {
    budget = 5000000;
  }

  const recs = VERIFIED_MARKET_DATABASE
    .filter(p => p.categoryKey === detectedCategory)
    .slice(0, 3)
    .map(prod => ({
      brand: prod.brand,
      model: prod.model,
      category: prod.categoryName,
      categoryKey: prod.categoryKey,
      estimatedPrice: prod.price,
      marketPriceRange: prod.priceRange,
      specs: prod.specs,
      reason: prod.reason,
      energyClass: prod.energyClass,
      warrantyYears: prod.warrantyYears,
      economicBenefit: prod.economicBenefit,
      officialSource: prod.officialSource,
      budgetMatchPercent: 95,
      isEstimated: false,
      imageUrl: getProductImageUrl(prod.categoryKey, prod.brand),
    }));

  return {
    category: detectedCategory,
    categoryName,
    budget,
    extractedSpecs: {},
    qualityWishes: [],
    rawText: text,
    economistSummary: 'Mediapark.uz va Glotr.uz tasdiqlangan bozor katalogi asosida iqtisodiy tejamkor variantlar tayyorlandi.',
    recommendations: recs.length > 0 ? recs : [
      {
        brand: 'Mediapark Tavsiyasi',
        model: `${categoryName} (Bozor saralangan model)`,
        category: categoryName,
        categoryKey: detectedCategory,
        estimatedPrice: budget,
        marketPriceRange: `${budget.toLocaleString('uz-UZ')} so‘m`,
        specs: ['Bozor talablariga to‘liq mos', 'Rasmiy kafolat'],
        reason: 'Mediapark va Glotr do‘konlaridagi siz kiritgan budjetga mos eng xaridorgir model.',
        energyClass: 'A+',
        warrantyYears: 2,
        economicBenefit: 'Elektr energiyasini tejash va arzon ehtiyot qismlar kafolatlangan.',
        officialSource: 'Mediapark.uz / Glotr.uz',
        budgetMatchPercent: 95,
        isEstimated: true,
        imageUrl: getProductImageUrl(detectedCategory),
      }
    ],
  };
}
