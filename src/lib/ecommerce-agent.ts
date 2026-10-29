import { 
  searchLocalProducts, 
  fetchAndEnrichStores,
  validateAndFilterProducts, 
  SerpProductItem 
} from './serpapi';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface UiFormData {
  regions: string[];
  budget_ranges: string[];
  features: string[];
}

export interface ComparisonItem {
  id: string;
  model: string;
  price: string;
  store: string;
  keySpec: string;
}

export interface ExtractedFilters {
  budget_max: number | null;
  region: string | null;
  specific_feature?: string | null;
  brand?: string | null;
}

export interface DynamicFilterFacet {
  id: string;
  label: string;
  options: string[];
}

export interface AgentV5Response {
  step: 'ready' | 'needs_params';
  is_ready_to_search: boolean;
  normalized_query: string;
  category: string | null;
  short_advice_uz: string;
  ui_form_data: UiFormData;
  extracted_filters: ExtractedFilters;
  expanded_serpapi_query: string | null;
  products: SerpProductItem[];
  comparison_table: ComparisonItem[];
  dynamic_facets: DynamicFilterFacet[];
}

/**
 * ✂️ Qat'iy Cheklov: AI matnini maximum 4 ta gap va 60 ta so'zga qisqartirish
 */
export function enforceMaxWordsAndSentences(text: string, maxWords: number = 60, maxSentences: number = 4): string {
  if (!text) return '';
  const trimmed = text.trim();

  // Gaplarni ajratish (. ! ?)
  const sentenceMatches = trimmed.match(/[^.!?]+(?:[.!?]+|$)/g);
  let result = trimmed;

  if (sentenceMatches && sentenceMatches.length > 0) {
    result = sentenceMatches.slice(0, maxSentences).join(' ').trim();
  }

  // So'zlar sonini cheklash (max 60 ta so'z)
  const words = result.split(/\s+/);
  if (words.length > maxWords) {
    result = words.slice(0, maxWords).join(' ') + '...';
  }

  return result;
}

function getGeminiApiKeys(): string[] {
  const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  return keysStr
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 5);
}

function getOpenAIApiKey(): string {
  return (process.env.OPENAI_API_KEY || '').trim();
}

/**
 * 🎭 1-ROL: "Form & Query Generator Agent" (v5.0 System Prompt)
 */
const SYSTEM_PROMPT_FORM_BUILDER_V5 = `You are the Core Search Form & Query Generator for Uzbekistan E-Commerce v5.0.

Rules:
1. Correct typos and dialect words (e.g., "monoblok", "svitkichi", "mzlatkich" -> "muzlatgich"; "12 lik" -> "12000 BTU inverter konditsioner"; "55 lik smart" -> "55 dyuym 4K Smart TV").
2. Maximize search coverage across all Uzbek stores using query expansion: (site:asaxiy.uz OR site:mediapark.uz OR site:texnomart.uz OR site:idea.uz OR site:tezz.uz OR site:olcha.uz OR site:uzum.uz OR site:glotr.uz OR site:zoodmall.com OR site:openshop.uz).
3. Generate relevant UI Form options:
   - regions: default to top Uzbek regions (Toshkent, Xorazm, Samarqand, Buxoro, Farg'ona, Andijon)
   - budget_ranges: relevant budget buckets in mln so'm
   - features: 3-4 specific features for this category (e.g. Gaming, Ofis, Inverter, No Frost, 4K)
4. STRICT LENGTH LIMIT: short_advice_uz MUST NOT exceed 60 words and MAXIMUM 4 sentences!

Return ONLY a valid JSON object matching this schema:
{
  "normalized_query": "gaming monoblok MSI",
  "category": "Monoblok | Konditsioner | Muzlatgich | Kir yuvish mashinasi | Televizor | Noutbuk | null",
  "is_ready_to_search": true,
  "short_advice_uz": "Xorazm uchun MSI gaming monobloklari: kam joy egallaydi, o'yin va grafik dizayn uchun yuqori unumdorlikka ega.",
  "ui_form_data": {
    "regions": ["Toshkent", "Xorazm", "Samarqand", "Buxoro", "Farg'ona", "Andijon"],
    "budget_ranges": ["5 mln so'mgacha", "5 - 10 mln so'm", "10 mln so'mdan yuqori"],
    "features": ["O'yin uchun (Gaming)", "Ofis uchun", "Grafika / Montaj uchun"]
  },
  "extracted_filters": {
    "budget_max": number | null,
    "region": "Xorazm | null",
    "specific_feature": "Gaming | null"
  },
  "expanded_serpapi_query": "gaming monoblok MSI (site:asaxiy.uz OR site:mediapark.uz OR site:texnomart.uz OR site:idea.uz OR site:tezz.uz OR site:olcha.uz OR site:uzum.uz OR site:glotr.uz OR site:zoodmall.com)"
}`;

async function callGemini(systemPrompt: string, userPrompt: string, jsonMode: boolean = false): Promise<string | null> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) return null;

  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-flash-latest',
  ];

  for (const key of keys) {
    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6500);

        const res = await fetch(url, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${systemPrompt}\n\nUSER PROMPT:\n${userPrompt}` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: jsonMode ? 'application/json' : 'text/plain',
              maxOutputTokens: 600,
            }
          })
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate) return candidate.trim();
        }
      } catch (err) {
        // Continue to fallback model
      }
    }
  }

  return null;
}

async function callOpenAI(systemPrompt: string, userPrompt: string, jsonMode: boolean = false): Promise<string | null> {
  const key = getOpenAIApiKey();
  if (!key) return null;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 500,
        response_format: jsonMode ? { type: 'json_object' } : undefined
      })
    });

    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    }
  } catch {}

  return null;
}

/**
 * 1-BOSQICH: Form & Query Generator Agentni chaqirish
 */
export async function executeFormAndQueryAgent(
  userMessage: string,
  history: ChatMessage[] = [],
  selectedRegion?: string,
  selectedBudget?: string,
  selectedFeature?: string
) {
  const contextHistory = history
    .slice(-4)
    .map(h => `${h.role === 'user' ? 'Xaridor' : 'AI'}: ${h.content}`)
    .join('\n');

  const userPrompt = `AVVALGI SUHBAT:
${contextHistory || 'Boshlang‘ich so‘rov'}

FOYDALANUVCHINING ANIQ SO‘ROVI:
"${userMessage}"
${selectedRegion ? `Tanlangan Hudud: ${selectedRegion}` : ''}
${selectedBudget ? `Tanlangan Byudjet: ${selectedBudget}` : ''}
${selectedFeature ? `Tanlangan Xususiyat: ${selectedFeature}` : ''}

Iltimos, JSON qaytaring. Qisqa maslahat 60 so'zdan va 4 ta gapdan oshmasin!`;

  let rawJson = await callGemini(SYSTEM_PROMPT_FORM_BUILDER_V5, userPrompt, true);
  if (!rawJson) {
    rawJson = await callOpenAI(SYSTEM_PROMPT_FORM_BUILDER_V5, userPrompt, true);
  }

  if (rawJson) {
    try {
      const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        normalized_query: parsed.normalized_query || userMessage,
        category: parsed.category || null,
        is_ready_to_search: true, // v5.0 da har doim qidiruvga yo'l ochiladi
        short_advice_uz: enforceMaxWordsAndSentences(parsed.short_advice_uz || 'Siz uchun eng yaxshi variantlarni saralab oldik.'),
        ui_form_data: {
          regions: parsed.ui_form_data?.regions || ["Toshkent", "Xorazm", "Samarqand", "Buxoro", "Farg'ona", "Andijon"],
          budget_ranges: parsed.ui_form_data?.budget_ranges || ["5 mln gacha", "5 - 10 mln so'm", "10 mln so'mdan yuqori"],
          features: parsed.ui_form_data?.features || ["O'yin uchun", "Ofis uchun", "Grafika / Montaj"],
        },
        extracted_filters: {
          budget_max: parsed.extracted_filters?.budget_max || null,
          region: selectedRegion || parsed.extracted_filters?.region || null,
          specific_feature: selectedFeature || parsed.extracted_filters?.specific_feature || null,
        },
        expanded_serpapi_query: parsed.expanded_serpapi_query || null,
      };
    } catch {}
  }

  // Lokal evristika (Fallback)
  const fullText = `${userMessage} ${selectedRegion || ''} ${selectedFeature || ''}`.toLowerCase();
  let normalized = userMessage.trim();
  let cat = 'Texnika';
  let defaultFeatures = ["Optimum variant", "Rasmiy kafolat", "Energiya tejamkor"];

  if (/monoblok|all-in-one|aio/i.test(fullText)) {
    cat = 'Monoblok';
    normalized = normalized.replace(/monoblok/gi, 'Monoblok PC');
    defaultFeatures = ["O‘yin uchun (Gaming)", "Ofis va o‘qish uchun", "Grafika va dizayn"];
  } else if (/kondits|kandits|12\s*lik|split/i.test(fullText)) {
    cat = 'Konditsioner';
    normalized = normalized.replace(/12\s*lik/gi, '12000 BTU Inverter Konditsioner');
    defaultFeatures = ["Inverter A+++", "Tez sovutish", "Wifi boshqaruv"];
  } else if (/muzlat|sovut|xolod/i.test(fullText)) {
    cat = 'Muzlatgich';
    normalized = normalized.replace(/svitkichi|xolodinnik|mzlatkich/gi, 'Muzlatgich No Frost');
    defaultFeatures = ["No Frost tizimi", "Katta sig‘im (300L+)", "Inverter motor"];
  } else if (/kir\s*mash|stiralk/i.test(fullText)) {
    cat = 'Kir yuvish mashinasi';
    normalized = normalized.replace(/stiralka|kir\s*mashin/gi, 'Kir yuvish mashinasi avtomat');
    defaultFeatures = ["Bug‘ funksiyasi", "6-7 kg sig‘im", "Inverter Direct Drive"];
  } else if (/tv|televiz/i.test(fullText)) {
    cat = 'Televizor';
    defaultFeatures = ["4K UltraHD", "Smart TV Android", "Katta diagonal (50\"+)"];
  }

  const regionName = selectedRegion || 'O‘zbekiston';
  const shortAdvice = enforceMaxWordsAndSentences(
    `${regionName} uchun ${normalized} bo‘yicha rasmiy O‘zbekiston do‘konlari variantlari tayyorlandi. Narxlar va kafolat shartlarini quyidagi kassetada taqqoslashingiz mumkin.`
  );

  return {
    normalized_query: normalized,
    category: cat,
    is_ready_to_search: true,
    short_advice_uz: shortAdvice,
    ui_form_data: {
      regions: ["Toshkent", "Xorazm", "Samarqand", "Buxoro", "Farg'ona", "Andijon"],
      budget_ranges: ["5 mln gacha", "5 - 10 mln so'm", "10 mln so'mdan yuqori"],
      features: defaultFeatures,
    },
    extracted_filters: {
      budget_max: null,
      region: selectedRegion || null,
      specific_feature: selectedFeature || null,
    },
    expanded_serpapi_query: `${normalized} (site:asaxiy.uz OR site:mediapark.uz OR site:texnomart.uz OR site:idea.uz OR site:tezz.uz OR site:olcha.uz OR site:uzum.uz OR site:glotr.uz OR site:zoodmall.com)`,
  };
}

/**
 * 2-BOSQICH: Comparison Table yaratish
 */
export function buildComparisonTable(products: SerpProductItem[]): ComparisonItem[] {
  return products.slice(0, 5).map(p => ({
    id: p.id,
    model: p.title.length > 36 ? p.title.substring(0, 36) + '...' : p.title,
    price: p.price,
    store: p.source,
    keySpec: p.keySpecs?.[0] || 'Rasmiy kafolat',
  }));
}

/**
 * Dinamik Facets
 */
export function generateAdaptiveFacets(products: SerpProductItem[], category?: string | null): DynamicFilterFacet[] {
  if (!products || products.length === 0) return [];

  const facets: DynamicFilterFacet[] = [];

  // 1. Do'konlar
  const stores = Array.from(new Set(products.map(p => p.source))).filter(Boolean);
  if (stores.length > 1) {
    facets.push({
      id: 'store',
      label: 'Do‘kon',
      options: ['Hammasi', ...stores],
    });
  }

  // 2. Brendlar
  const knownBrands = ['Samsung', 'LG', 'Artel', 'MSI', 'HP', 'Lenovo', 'Midea', 'Gree', 'Bosch', 'Xiaomi', 'TCL', 'Sony', 'Asus', 'Apple'];
  const matchedBrands = new Set<string>();
  products.forEach(p => {
    const text = p.title.toLowerCase();
    knownBrands.forEach(b => {
      if (text.includes(b.toLowerCase())) matchedBrands.add(b);
    });
  });
  if (matchedBrands.size > 0) {
    facets.push({
      id: 'brand',
      label: 'Brend',
      options: ['Hammasi', ...Array.from(matchedBrands)],
    });
  }

  return facets;
}

/**
 * 🚀 SMART UNIVERSAL AI AGGREGATOR v5.0 ASOSIY WORKFLOW
 */
export async function runEcommerceAgentV5(
  userMessage: string,
  history: ChatMessage[] = [],
  params?: {
    region?: string;
    budget?: string;
    feature?: string;
  }
): Promise<AgentV5Response> {
  // 1-Qadam: Form & Query Generator Agent
  const formQueryResult = await executeFormAndQueryAgent(
    userMessage, 
    history, 
    params?.region, 
    params?.budget, 
    params?.feature
  );

  // 2-Qadam: 12+ do'konlar bo'ylab keng qidiruv
  const queryToSearch = formQueryResult.expanded_serpapi_query || formQueryResult.normalized_query;
  const targetRegion = params?.region || formQueryResult.extracted_filters.region || 'O‘zbekiston';

  const products = await searchLocalProducts(
    queryToSearch,
    formQueryResult.category || undefined,
    targetRegion
  );

  // 3-Qadam: Comparison View jadvali va dinamik filtrlar
  const comparisonTable = buildComparisonTable(products);
  const facets = generateAdaptiveFacets(products, formQueryResult.category);

  return {
    step: 'ready',
    is_ready_to_search: true,
    normalized_query: formQueryResult.normalized_query,
    category: formQueryResult.category,
    short_advice_uz: formQueryResult.short_advice_uz,
    ui_form_data: formQueryResult.ui_form_data,
    extracted_filters: formQueryResult.extracted_filters,
    expanded_serpapi_query: queryToSearch,
    products,
    comparison_table: comparisonTable,
    dynamic_facets: facets,
  };
}

// Barcha orqaga mos chaqiruvlar
export async function runEcommerceAgent(
  userMessage: string, 
  history: ChatMessage[] = [],
  params?: { region?: string; budget?: string; feature?: string }
) {
  return runEcommerceAgentV5(userMessage, history, params);
}
