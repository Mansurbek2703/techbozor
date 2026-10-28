import { CategoryKey, AIRecommendation } from '@/types';
import { incrementAiCount, getStoredCategories } from './storage';

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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Bozor ma'lumotlari zaxirasi
const FALLBACK_KNOWLEDGE = [
  {
    category: 'tv',
    brand: 'Samsung',
    model: 'Crystal UHD 55 (CU7100)',
    price: 4950000,
    specs: ['55" 4K UHD', 'Smart Tizen', 'HDR10+'],
    strengths: 'Koreys brendi sifati, yuqori kontrast va barcha dasturlarni bemalol ochadi.',
  },
  {
    category: 'tv',
    brand: 'Artel',
    model: '55AU90G 4K Google TV',
    price: 4200000,
    specs: ['55" 4K HDR', 'Google TV', '3 yil kafolat'],
    strengths: '55 dyuymli katta ekran va 4.5 mln so‘mgacha bo‘lgan budjet uchun eng ommabop model.',
  },
  {
    category: 'fridge',
    brand: 'LG',
    model: 'DoorCooling+ GC-B459SQCL',
    price: 6800000,
    specs: ['360 litr', 'Total No Frost', 'Inverter kompressor'],
    strengths: 'Eshikdan sovutish texnologiyasi mahsulotlarni tez va uzoq saqlaydi, juda shovqinsiz.',
  },
  {
    category: 'washing',
    brand: 'Artel',
    model: 'Grand Inverter 70C121 (7kg)',
    price: 3600000,
    specs: ['7 kg', 'Inverter motor', 'Bug‘da yuvish'],
    strengths: 'O‘zbekistonda tayyorlangan, ehtiyot qismlari arzon va mavjud, 3 yil to‘liq kafolat.',
  },
  {
    category: 'ac',
    brand: 'Shivaki',
    model: 'Emura Inverter 12 (35 m²)',
    price: 4300000,
    specs: ['12000 BTU', 'Inverter A++', '-15°C gacha isitish'],
    strengths: 'Elektr energiyasini tejaydi, shovqini juda past, qishda ham samarali isitadi.',
  },
];

/**
 * Gemini API orqali tabiiy tildagi matnni chuqur tahlil qilish
 */
async function analyzeWithGemini(prompt: string): Promise<ExtractedRequestData | null> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const systemInstruction = `Siz O'zbekiston maishiy va elektronika texnikalari bozori bo'yicha eng kuchli AI maslahatchisiz.
Foydalanuvchi qidirayotgan texnikasi haqida erkin matn kiritadi.
Siz matndan quyidagilarni aniqlab, FAQAT toza JSON formatda javob berishingiz shart (hech qanday markdown \`\`\`json belgisiz, faqat json):
{
  "category": "tv | fridge | washing | ac | vacuum | stove | microwave | boshqa_kategoriya_id",
  "categoryName": "Kategoriya nomi (masalan: Televizor, Smartfon, Noutbuk, Sovutkich)",
  "budget": 5000000,
  "extractedSpecs": { "diagonal": "55\\"", "smartTv": "Ha" },
  "qualityWishes": ["tiniq tasvir", "ishonchli"],
  "marketCheckNote": "Agar budjet so'ralgan texnikaga yetarli bo'lmasa yoki nomutanosib bo'lsa (masalan 5 mln so'mga 90 dyuym), bozor narxini tushuntiruvchi 1 jumla, aks holda null",
  "recommendations": [
    {
      "brand": "Samsung",
      "model": "Crystal 4K 55CU7100",
      "category": "Televizor",
      "estimatedPrice": 4900000,
      "specs": ["55 dyuym", "4K UHD", "Smart TV"],
      "reason": "Ushbu budjet uchun eng sifatli va tiniq tasvir beruvchi model.",
      "budgetMatchPercent": 95,
      "isEstimated": false
    }
  ]
}
recommendations massivida O'zbekiston bozorida mavjud 2-3 ta haqiqiy model va narxini keltiring (narx so'mda).`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nFoydalanuvchi so'rovi: "${prompt}"` }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1000,
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      console.warn('Gemini API call returned non-200:', res.status);
      return null;
    }

    const jsonRes = await res.json();
    const candidateText = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    // Clean JSON markdown wrapper if any
    const cleanJson = candidateText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      category: parsed.category || 'tv',
      categoryName: parsed.categoryName || 'Texnika',
      budget: Number(parsed.budget) || 5000000,
      extractedSpecs: parsed.extractedSpecs || {},
      qualityWishes: parsed.qualityWishes || [],
      rawText: prompt,
      marketCheckNote: parsed.marketCheckNote || undefined,
      recommendations: parsed.recommendations || [],
    };
  } catch (err) {
    console.warn('Gemini direct analysis fallback triggered:', err);
    return null;
  }
}

/**
 * Gibrid tahlilchi: Gemini API + Tezkor zaxira
 */
export async function parseUserPrompt(text: string): Promise<ExtractedRequestData> {
  incrementAiCount();

  // 1. Birinchi navbatda Gemini AI ga so'rov yuboramiz
  if (GEMINI_API_KEY) {
    const geminiResult = await analyzeWithGemini(text);
    if (geminiResult && geminiResult.recommendations?.length > 0) {
      return geminiResult;
    }
  }

  // 2. Agar API mavjud bo'lmasa yoki tarmoqda muammo bo'lsa, tezkor zaxira modeli
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

  // Budjet
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

  const recs = FALLBACK_KNOWLEDGE.filter(p => p.category === detectedCategory).slice(0, 3).map(prod => ({
    brand: prod.brand,
    model: prod.model,
    category: categoryName,
    estimatedPrice: prod.price,
    specs: prod.specs,
    reason: prod.strengths,
    budgetMatchPercent: 92,
    isEstimated: false,
  }));

  return {
    category: detectedCategory,
    categoryName,
    budget,
    extractedSpecs: {},
    qualityWishes: [],
    rawText: text,
    recommendations: recs.length > 0 ? recs : [
      {
        brand: 'Bozor tavsiyasi',
        model: `${categoryName} (Bozor saralangan model)`,
        category: categoryName,
        estimatedPrice: budget,
        specs: ['Bozor talablariga to‘liq mos'],
        reason: 'Siz kiritgan budjet doirasidagi eng yaxshi texnik tavsiya.',
        budgetMatchPercent: 95,
        isEstimated: true,
      }
    ],
  };
}
